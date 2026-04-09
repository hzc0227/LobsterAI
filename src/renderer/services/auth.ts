import type { AuthRedirectTarget } from '@shared/auth/constants';
import type { JdAuthStateChangedPayload } from '@shared/auth/jdAuth';

import { store } from '../store';
import { setAuthLoading, setLoggedIn, setLoggedOut } from '../store/slices/authSlice';
import { clearServerModels } from '../store/slices/modelSlice';

type LoginSuccessListener = (payload: Pick<JdAuthStateChangedPayload, 'redirectTo' | 'erp'>) => void;

class AuthService {
  private unsubStateChanged: (() => void) | null = null;
  private unsubWindowState: (() => void) | null = null;
  private readonly loginSuccessListeners = new Set<LoginSuccessListener>();

  /**
   * 初始化 ERP 登录态。
   *
   * 启动时不再向旧 Portal 服务端查询用户资料，而是直接向主进程读取
   * “当前 Cookie + 本地最小状态”对账后的结果，保证界面展示与真实浏览器会话一致。
   */
  async init() {
    this.destroy();

    store.dispatch(setAuthLoading(true));

    try {
      const result = await window.electron.auth.getState();
      if (result.success && result.isLoggedIn && result.erp) {
        store.dispatch(setLoggedIn({ erp: result.erp }));
      } else {
        store.dispatch(setLoggedOut());
        store.dispatch(clearServerModels());
      }
    } catch {
      store.dispatch(setLoggedOut());
      store.dispatch(clearServerModels());
    }

    this.unsubStateChanged = window.electron.auth.onStateChanged((payload) => {
      this.applyAuthState(payload);
    });

    this.unsubWindowState = window.electron.window.onStateChanged((state) => {
      if (state.isFocused) {
        void this.refreshStateFromMain();
      }
    });
  }

  /**
   * 打开 ERP 登录窗口。
   *
   * `redirectTo` 是可选的登录后跳转目标，主进程会在检测到 `_erp` Cookie 后
   * 连同登录成功事件一起回传给渲染进程。
   */
  async login(redirectTo?: AuthRedirectTarget | null) {
    await window.electron.auth.login(redirectTo ? { redirectTo } : undefined);
  }

  /**
   * 执行退出登录，并同步清空界面上的 ERP 状态。
   *
   * 主进程已经负责清理独立登录分区下的 Cookie 与本地存储，
   * 渲染进程这里只需要把 Redux 状态还原成未登录即可。
   */
  async logout() {
    await window.electron.auth.logout();
    store.dispatch(setLoggedOut());
    store.dispatch(clearServerModels());
  }

  /**
   * 订阅“登录成功后跳转”事件。
   *
   * App 层可以通过这个订阅，把登录成功后带回来的 `redirectTo`
   * 转换成具体视图切换，而不需要直接感知底层 IPC。
   */
  onLoginSuccess(listener: LoginSuccessListener): () => void {
    this.loginSuccessListeners.add(listener);
    return () => {
      this.loginSuccessListeners.delete(listener);
    };
  }

  /**
   * 释放当前认证服务注册的监听器。
   *
   * `init()` 可能因为热更新或重复初始化被再次调用，所以这里先主动清理旧监听器，
   * 避免同一个登录成功事件被重复消费多次。
   */
  destroy() {
    this.unsubStateChanged?.();
    this.unsubStateChanged = null;
    this.unsubWindowState?.();
    this.unsubWindowState = null;
  }

  /**
   * 把主进程广播的 ERP 登录状态应用到渲染进程。
   *
   * 登录成功时写入 ERP 并通知订阅者处理跳转；
   * 退出登录或 Cookie 失效时则统一回到未登录状态。
   */
  private applyAuthState(payload: JdAuthStateChangedPayload) {
    if (payload.isLoggedIn && payload.erp) {
      store.dispatch(setLoggedIn({ erp: payload.erp }));
      this.loginSuccessListeners.forEach((listener) => {
        listener({
          erp: payload.erp,
          redirectTo: payload.redirectTo,
        });
      });
      return;
    }

    store.dispatch(setLoggedOut());
    store.dispatch(clearServerModels());
  }

  /**
   * 主动向主进程重新对账一次 ERP 登录态。
   *
   * 如果登录窗里的实时事件因为跨站跳转或 Cookie 时序原因漏掉了，
   * 用户重新切回主窗口时仍然应该能看到最新 ERP。这里保留一个轻量的“聚焦即刷新”兜底。
   */
  private async refreshStateFromMain() {
    try {
      const result = await window.electron.auth.getState();
      if (result.success && result.isLoggedIn && result.erp) {
        store.dispatch(setLoggedIn({ erp: result.erp }));
      } else {
        store.dispatch(setLoggedOut());
        store.dispatch(clearServerModels());
      }
    } catch {
      // Ignore focus refresh failures and keep the current UI state.
    }
  }
}

export const authService = new AuthService();
