import type { AuthRedirectTarget } from './constants';

/**
 * 本地持久化的最小 ERP 登录态。
 *
 * 当前登录链路只需要记住 ERP 本身，以及首次确认登录成功的时间，
 * 不再存储旧 Portal 流程中的 token、套餐或积分信息。
 */
export interface JdAuthState {
  erp: string;
  loggedInAt: number;
}

/**
 * 提供给渲染进程消费的当前登录快照。
 *
 * `snapshot` 是界面真正关心的结构，只表达“是否已登录”和“当前 ERP 是谁”，
 * 不暴露 Cookie、窗口 session 等主进程实现细节。
 */
export interface JdAuthSnapshot {
  isLoggedIn: boolean;
  erp: string | null;
}

/**
 * 登录成功事件负载。
 *
 * `redirectTo` 允许调用方在登录成功后把界面切到指定视图；
 * 没有跳转诉求时传 `null` 即可。
 */
export interface JdAuthStateChangedPayload extends JdAuthSnapshot {
  redirectTo: AuthRedirectTarget | null;
}

/**
 * ERP 登录态归一化后的结果。
 *
 * `persistedState` 表示 reconciled 之后应该写回 SQLite 的内容，
 * 主进程用它来处理“Cookie 还在 / Cookie 已失效 / ERP 发生变化”这三类情况。
 */
export interface ResolvedJdAuthState {
  snapshot: JdAuthSnapshot;
  persistedState: JdAuthState | null;
}

/**
 * 归一化 ERP 字符串。
 *
 * Cookie 读出来的值有可能带空格、为空串，或者根本不存在。
 * 这个方法把这些噪音统一清洗成稳定的“有效 ERP 或 null”，
 * 让后续主进程状态判定只处理一种输入格式。
 */
export function normalizeErp(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue ? normalizedValue : null;
}

/**
 * 构造最小持久化登录态。
 *
 * 登录窗确认拿到 `_erp` Cookie 后，主进程只需要调用这个方法，
 * 就能得到可以直接落库的结构。
 */
export function buildJdAuthState(erp: string, loggedInAt = Date.now()): JdAuthState {
  return {
    erp,
    loggedInAt,
  };
}

/**
 * 用“当前 Cookie”与“本地已存状态”做一次对账。
 *
 * 规则很简单：
 * 1. 只要 Cookie 里有 ERP，就以 Cookie 为准；
 * 2. Cookie 丢失时，无论本地是否还残留旧 ERP，都视为已退出；
 * 3. ERP 发生变化时，更新时间戳并覆盖本地持久化状态。
 *
 * 这样可以避免出现“本地还记得 ERP，但真实浏览器会话已经失效”的假登录状态。
 */
export function resolveJdAuthState(
  storedState: JdAuthState | null | undefined,
  cookieErp: string | null | undefined,
  now = Date.now(),
): ResolvedJdAuthState {
  const normalizedCookieErp = normalizeErp(cookieErp);

  if (!normalizedCookieErp) {
    return {
      snapshot: {
        isLoggedIn: false,
        erp: null,
      },
      persistedState: null,
    };
  }

  const shouldReuseLoggedInAt = storedState?.erp === normalizedCookieErp && typeof storedState.loggedInAt === 'number';

  return {
    snapshot: {
      isLoggedIn: true,
      erp: normalizedCookieErp,
    },
    persistedState: buildJdAuthState(
      normalizedCookieErp,
      shouldReuseLoggedInAt ? storedState.loggedInAt : now,
    ),
  };
}
