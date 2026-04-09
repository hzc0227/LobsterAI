/**
 * 认证模块的统一常量定义。
 *
 * 这里集中维护 ERP 登录流程里跨主进程、预加载层、渲染层共享的魔法字符串，
 * 避免 IPC 通道名、SQLite key、Cookie 名、登录分区等值在多个文件里散落。
 */
export const AuthIpcChannel = {
  Login: 'auth:login',
  GetState: 'auth:getState',
  Logout: 'auth:logout',
  StateChanged: 'auth:stateChanged',
} as const;

export const AuthStoreKey = {
  JdAuthState: 'jd_auth_state',
} as const;

export const AuthSessionPartition = {
  JdLogin: 'persist:jd-auth',
} as const;

export const AuthCookieName = {
  Erp: '_erp',
  ErpObserved: 'erp_erp',
} as const;

export const AuthUrl = {
  JdLogin: 'http://erp.jd.com/',
} as const;

export const AuthRedirectTarget = {
  Cowork: 'cowork',
  Skills: 'skills',
  ScheduledTasks: 'scheduledTasks',
  Mcp: 'mcp',
  Agents: 'agents',
} as const;
export type AuthRedirectTarget = typeof AuthRedirectTarget[keyof typeof AuthRedirectTarget];
