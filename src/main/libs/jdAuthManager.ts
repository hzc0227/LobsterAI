import { BrowserWindow, session } from 'electron';

import {
  AuthCookieName,
  AuthRedirectTarget,
  AuthSessionPartition,
  AuthStoreKey,
  AuthUrl,
} from '../../shared/auth/constants';
import {
  JdAuthSnapshot,
  JdAuthState,
  JdAuthStateChangedPayload,
  resolveJdAuthState,
} from '../../shared/auth/jdAuth';
import type { SqliteStore } from '../sqliteStore';

type JdAuthManagerDeps = {
  getStore: () => SqliteStore;
  getMainWindow: () => BrowserWindow | null;
  notifyStateChanged: (payload: JdAuthStateChangedPayload) => void;
  getWindowTitle: () => string;
};

/**
 * JD ERP 登录窗口管理器。
 *
 * 这个类把 ERP 登录流程里与 Electron 强绑定的部分集中起来：
 * 1. 创建和复用独立登录窗口；
 * 2. 监听专用 session 里的 `_erp` Cookie；
 * 3. 把当前 Cookie 与本地 SQLite 状态做对账；
 * 4. 对渲染进程广播登录成功、退出登录和可选跳转目标。
 *
 * 这样主进程主文件只保留 IPC 装配，不需要再直接处理窗口、Cookie 和落库细节。
 */
export class JdAuthManager {
  private static readonly LOGIN_STATE_POLL_INTERVAL_MS = 1000;

  private loginWindow: BrowserWindow | null = null;
  private pendingRedirectTo: AuthRedirectTarget | null = null;
  private isCompletingLogin = false;
  private loginSession: Electron.Session | null = null;
  private loginStatePollTimer: ReturnType<typeof setInterval> | null = null;
  private lastObservedCookieSignature: string | null = null;
  private cookieChangedHandler:
    | ((event: Electron.Event, cookie: Electron.Cookie, cause: string, removed: boolean) => void)
    | null = null;

  constructor(private readonly deps: JdAuthManagerDeps) {}

  /**
   * 打开 ERP 登录窗口，并记录登录成功后需要跳转到的目标视图。
   *
   * 如果窗口已经存在，则只更新待跳转目标并把现有窗口聚焦，避免重复创建多个登录窗。
   * 这样既能满足“再次点击登录”时的幂等行为，也能保留最新一次调用方的跳转意图。
   */
  async openLoginWindow(options: { redirectTo?: AuthRedirectTarget | null } = {}): Promise<void> {
    if (options.redirectTo) {
      this.pendingRedirectTo = options.redirectTo;
    }

    if (this.loginWindow && !this.loginWindow.isDestroyed()) {
      if (this.loginWindow.isMinimized()) {
        this.loginWindow.restore();
      }
      this.loginWindow.focus();
      return;
    }

    this.loginWindow = this.createLoginWindow();
    console.log(`[JdAuth] opening JD login window (redirectTo=${options.redirectTo ?? 'none'})`);
    this.bindLoginWindow(this.loginWindow);

    await this.loginWindow.loadURL(AuthUrl.JdLogin);
  }

  /**
   * 返回当前 ERP 登录状态，并在返回前完成一次 Cookie/本地状态对账。
   *
   * 启动恢复时需要以当前 session Cookie 为准，因为它代表真实浏览器会话；
   * SQLite 只是为了让渲染进程快速恢复 ERP 展示和登录历史信息。
   */
  async getState(): Promise<JdAuthSnapshot> {
    return (await this.reconcileState()).snapshot;
  }

  /**
   * 执行退出登录。
   *
   * 退出的语义不仅是删除本地 ERP，还要把独立登录分区下的 Cookie 和本地存储清掉，
   * 这样下次点击登录时不会被 JD 站点自动带回旧会话。
   */
  async logout(): Promise<void> {
    this.pendingRedirectTo = null;

    if (this.loginWindow && !this.loginWindow.isDestroyed()) {
      this.loginWindow.close();
    }

    this.clearPersistedState();
    try {
      await this.clearLoginSession();
    } catch (error) {
      console.warn('[JdAuth] failed to fully clear login session during logout:', error);
    }

    this.deps.notifyStateChanged({
      isLoggedIn: false,
      erp: null,
      redirectTo: null,
    });
  }

  /**
   * 创建 ERP 专用登录窗口。
   *
   * 窗口使用独立 `persist:jd-auth` 分区，让 ERP 登录态与主界面 session 隔离，
   * 便于后续按分区清理 Cookie，并避免影响应用里其他页面的网络会话。
   */
  private createLoginWindow(): BrowserWindow {
    return new BrowserWindow({
      width: 1100,
      height: 760,
      minWidth: 960,
      minHeight: 640,
      title: this.deps.getWindowTitle(),
      parent: this.deps.getMainWindow() ?? undefined,
      modal: false,
      autoHideMenuBar: true,
      show: false,
      webPreferences: {
        partition: AuthSessionPartition.JdLogin,
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
      },
    });
  }

  /**
   * 绑定登录窗口和登录分区的所有监听器。
   *
   * ERP Cookie 可能在页面加载完成前、重定向过程中或前端脚本执行后才写入，
   * 所以这里同时监听导航事件和 Cookie 变化事件，确保尽快捕获 `_erp`。
   */
  private bindLoginWindow(targetWindow: BrowserWindow): void {
    const loginSession = targetWindow.webContents.session;
    this.loginSession = loginSession;
    const evaluateLoginState = () => {
      void this.completeLoginIfReady('navigation');
    };

    const cookieChangedHandler = (_event: Electron.Event, changedCookie: Electron.Cookie, cause: string, removed: boolean) => {
      console.debug(
        `[JdAuth] cookie changed (name=${changedCookie.name}, cause=${cause}, removed=${removed})`,
      );
      void this.completeLoginIfReady('cookie-change');
    };

    this.cookieChangedHandler = cookieChangedHandler;
    loginSession.cookies.on('changed', cookieChangedHandler);

    targetWindow.once('ready-to-show', () => {
      targetWindow.show();
    });

    targetWindow.webContents.on('did-finish-load', evaluateLoginState);
    targetWindow.webContents.on('did-navigate', evaluateLoginState);
    targetWindow.webContents.on('did-navigate-in-page', evaluateLoginState);
    targetWindow.webContents.on('did-redirect-navigation', evaluateLoginState);
    targetWindow.webContents.on('did-stop-loading', evaluateLoginState);
    targetWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedUrl) => {
      console.warn(
        `[JdAuth] login window failed to load url=${validatedUrl} code=${errorCode} message=${errorDescription}`,
      );
    });

    targetWindow.webContents.setWindowOpenHandler(({ url }) => {
      console.log(`[JdAuth] intercepted window.open to ${url}, loading in the same auth window`);
      void targetWindow.loadURL(url);
      return { action: 'deny' };
    });

    targetWindow.on('closed', () => {
      this.cleanupLoginWindow();
    });

    this.startLoginStatePolling();
  }

  /**
   * 尝试完成登录。
   *
   * 只要 `_erp` Cookie 已经出现，就立即把 ERP 写入本地、通知渲染进程并关闭登录窗。
   * 这里不依赖特定跳转 URL，因此能兼容 JD 登录页内部的多次重定向。
   */
  private async completeLoginIfReady(reason: 'navigation' | 'cookie-change' | 'polling'): Promise<boolean> {
    if (this.isCompletingLogin) {
      return false;
    }

    this.isCompletingLogin = true;
    try {
      await this.logCookieSnapshot(reason);
      const reconciled = await this.reconcileState();
      if (!reconciled.snapshot.isLoggedIn || !reconciled.snapshot.erp) {
        return false;
      }

      console.log(`[JdAuth] login completed after ${reason}`);

      this.deps.notifyStateChanged({
        ...reconciled.snapshot,
        redirectTo: this.consumePendingRedirectTo(),
      });

      if (this.loginWindow && !this.loginWindow.isDestroyed()) {
        this.loginWindow.close();
      }

      this.focusMainWindow();

      return true;
    } finally {
      this.isCompletingLogin = false;
    }
  }

  /**
   * 读取当前 `_erp` Cookie，并与 SQLite 中的最小登录态做一次对账。
   *
   * 这是整个 ERP 登录链路的状态真相来源：
   * - Cookie 有值：视为已登录，并把 ERP 写回本地；
   * - Cookie 无值：清除本地 ERP，避免出现“假登录”。
   */
  private async reconcileState(): Promise<{
    snapshot: JdAuthSnapshot;
    persistedState: JdAuthState | null;
  }> {
    const storedState = this.deps.getStore().get<JdAuthState>(AuthStoreKey.JdAuthState) ?? null;
    const cookieErp = await this.readErpFromCookie();
    const reconciled = resolveJdAuthState(storedState, cookieErp);

    if (reconciled.persistedState) {
      this.persistState(reconciled.persistedState);
    } else {
      this.clearPersistedState();
    }

    return reconciled;
  }

  /**
   * 从登录分区里读取 ERP Cookie。
   *
   * 当前需求已经确认 ERP 来自 `_erp` Cookie，因此这里按 Cookie 名直接检索，
   * 并只返回第一个有效值，避免把主进程逻辑耦合到具体页面 DOM。
   */
  private async readErpFromCookie(): Promise<string | null> {
    const cookies = await this.getActiveSession().cookies.get({});
    const matchedCookie = cookies.find((cookie) => {
      if (cookie.name !== AuthCookieName.Erp && cookie.name !== AuthCookieName.ErpObserved) {
        return false;
      }
      return typeof cookie.value === 'string' && cookie.value.trim();
    });
    return matchedCookie?.value?.trim() || null;
  }

  /**
   * 持久化当前 ERP 登录态。
   *
   * 本地只保存最小结构，不复制整份 Cookie，也不保存任何旧 Portal token，
   * 从而把登录数据收缩到“这个用户是谁”这一件事上。
   */
  private persistState(state: JdAuthState): void {
    this.deps.getStore().set(AuthStoreKey.JdAuthState, state);
  }

  /**
   * 清除 SQLite 中的最小 ERP 登录态。
   *
   * 这个方法只负责本地 kv；真正清 Cookie 的动作在 `clearLoginSession()` 里单独处理，
   * 这样职责边界更清晰。
   */
  private clearPersistedState(): void {
    this.deps.getStore().delete(AuthStoreKey.JdAuthState);
  }

  /**
   * 清理 ERP 登录分区里的 Cookie 与本地存储。
   *
   * Electron 没有“一键清空该分区所有 Cookie”的简化接口，所以这里逐个 remove。
   * 删除 URL 由 Cookie 的 `secure/domain/path` 动态拼装，保证与 Electron API 的要求一致。
   */
  private async clearLoginSession(): Promise<void> {
    const loginSession = this.getLoginSession();
    const cookies = await loginSession.cookies.get({});

    await Promise.all(
      cookies.map(async (cookie) => {
        try {
          await loginSession.cookies.remove(this.buildCookieRemovalUrl(cookie), cookie.name);
        } catch (error) {
          console.warn('[JdAuth] failed to remove cookie during logout:', error);
        }
      }),
    );

    await loginSession.clearStorageData();
  }

  /**
   * 构造 Electron `cookies.remove()` 需要的 URL。
   *
   * Cookie 删除接口要求传入完整 URL，因此这里根据 Cookie 的安全属性、域名和路径
   * 还原一个最小可用 URL。域名前导点会被去掉，以满足 URL 语法要求。
   */
  private buildCookieRemovalUrl(cookie: Electron.Cookie): string {
    const protocol = cookie.secure ? 'https://' : 'http://';
    const normalizedDomain = cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain;
    const normalizedPath = cookie.path || '/';
    return `${protocol}${normalizedDomain}${normalizedPath}`;
  }

  /**
   * 取出本次登录成功后要跳转的目标视图。
   *
   * 跳转目标只应该消费一次，因此这里采用“读后即清”的方式，
   * 避免应用重启或窗口重复聚焦时重复触发跳转。
   */
  private consumePendingRedirectTo(): AuthRedirectTarget | null {
    const redirectTo = this.pendingRedirectTo;
    this.pendingRedirectTo = null;
    return redirectTo;
  }

  /**
   * 清理登录窗口相关监听器和实例引用。
   *
   * Cookie 事件是绑定在 partition session 上的，如果不显式解绑，
   * 下次再次创建登录窗时会重复触发登录完成逻辑。
   */
  private cleanupLoginWindow(): void {
    if (this.cookieChangedHandler && this.loginSession) {
      this.loginSession.cookies.off('changed', this.cookieChangedHandler);
      this.cookieChangedHandler = null;
    }
    if (this.loginStatePollTimer) {
      clearInterval(this.loginStatePollTimer);
      this.loginStatePollTimer = null;
    }
    this.isCompletingLogin = false;
    this.lastObservedCookieSignature = null;
    this.loginWindow = null;
  }

  /**
   * 在登录窗口存活期间定时检查 ERP Cookie。
   *
   * 某些登录链路不会稳定触发 Electron 的 `cookies.changed` 事件，
   * 或者 Cookie 会在最后一次跳转结束后才真正落到分区里。这里加一个轻量轮询，
   * 用来兜底“实时事件没命中，但登录其实已经完成”的情况。
   */
  private startLoginStatePolling(): void {
    if (this.loginStatePollTimer) {
      clearInterval(this.loginStatePollTimer);
    }

    this.loginStatePollTimer = setInterval(() => {
      void this.completeLoginIfReady('polling');
    }, JdAuthManager.LOGIN_STATE_POLL_INTERVAL_MS);
  }

  /**
   * 登录成功后把主窗口重新拉回前台。
   *
   * 关闭登录窗本身并不保证主窗口一定回到前景，所以这里显式 restore/show/focus，
   * 保证用户完成 ERP 登录后能够立即看到主界面。
   */
  private focusMainWindow(): void {
    const mainWindow = this.deps.getMainWindow();
    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }
    mainWindow.focus();
  }

  /**
   * 记录当前登录分区的 Cookie 快照。
   *
   * 这一步不是为了“多打日志”，而是为了把真正的证据拿出来：
   * 如果 `_erp` 没进 Electron 登录窗的 session，我们会在日志里直接看到当前有哪些 Cookie，
   * 从而判断是站点没有写入、写到了别的窗口，还是我们监听错了 session。
   *
   * 为了避免每秒刷屏，这里只在 Cookie 名称集合或 `_erp` 命中状态发生变化时记录一次。
   */
  private async logCookieSnapshot(reason: 'navigation' | 'cookie-change' | 'polling'): Promise<void> {
    const activeSession = this.getActiveSession();
    const cookies = await activeSession.cookies.get({});
    const cookieNames = cookies
      .map((cookie) => cookie.name)
      .sort()
      .slice(0, 20);
    const erpCookie = cookies.find((cookie) => {
      return cookie.name === AuthCookieName.Erp || cookie.name === AuthCookieName.ErpObserved;
    });
    const currentUrl = this.loginWindow && !this.loginWindow.isDestroyed()
      ? this.loginWindow.webContents.getURL()
      : 'n/a';
    const signature = JSON.stringify({
      reason,
      currentUrl,
      cookieNames,
      hasErp: Boolean(erpCookie?.value?.trim()),
    });

    if (signature === this.lastObservedCookieSignature) {
      return;
    }

    this.lastObservedCookieSignature = signature;
    console.log(
      `[JdAuth] observed cookies after ${reason}: url=${currentUrl || 'n/a'} names=${cookieNames.join(',') || 'none'} hasErp=${Boolean(erpCookie?.value?.trim())}`,
    );
  }

  /**
   * 懒加载 ERP 登录分区对应的 Electron session。
   *
   * `session.fromPartition()` 只能在 Electron 应用进入 ready 阶段后调用，
   * 否则主进程会直接抛出 “Session can only be received when app is ready”。
   * 登录管理器本身会在主进程模块初始化阶段就被创建，所以这里不能再使用类字段直接初始化。
   *
   * 通过“首次真正需要时再取 session”的方式，可以同时满足两点：
   * 1. 构造 `JdAuthManager` 时不触碰 Electron ready 之前不可用的 API；
   * 2. 后续窗口创建、Cookie 监听、状态对账仍然复用同一个分区 session 实例。
   */
  private getLoginSession(): Electron.Session {
    if (!this.loginSession) {
      this.loginSession = session.fromPartition(AuthSessionPartition.JdLogin);
    }
    return this.loginSession;
  }

  /**
   * 读取当前最可信的登录 session。
   *
   * 当登录窗还开着时，以窗口真实绑定的 `webContents.session` 为准；
   * 这样可以排除“我们拿到了同名 partition，但实际登录页用了别的 session 实例”的歧义。
   * 登录窗关闭后，再回退到持久化 partition session，用于启动恢复和退出清理。
   */
  private getActiveSession(): Electron.Session {
    if (this.loginWindow && !this.loginWindow.isDestroyed()) {
      return this.loginWindow.webContents.session;
    }
    return this.getLoginSession();
  }
}
