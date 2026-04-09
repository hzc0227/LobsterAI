# JD ERP 登录实现说明

## 背景

当前应用的登录能力已经从旧的 Portal `authCode -> accessToken/refreshToken` 流程，切换为 JD 内部门户 ERP 登录。

这次改造的目标非常明确：

- 登录入口改为应用内独立 `BrowserWindow`
- 登录态判断改为读取 JD 登录页 Cookie
- 应用本地只记录 ERP，不再维护积分、套餐、增值服务等 Portal 概念
- 登录成功后自动关闭登录窗并回到主界面
- 左下角区域直接回显 ERP，并支持退出登录

## 当前实现方式

### 1. 登录入口

渲染层点击左下角登录按钮后，会调用 `authService.login()`，最终触发主进程 `auth:login` IPC。

相关文件：

- `src/renderer/components/LoginButton.tsx`
- `src/renderer/services/auth.ts`
- `src/main/preload.ts`
- `src/shared/auth/constants.ts`

主进程收到请求后，不再打开系统默认浏览器，而是由 `JdAuthManager` 创建一个独立的 ERP 登录窗口。

登录窗口特征：

- 使用 Electron 原生 `BrowserWindow`
- 登录地址为 `http://erp.jd.com/`
- 使用独立 session 分区 `persist:jd-auth`
- 与主窗口 session 隔离，便于单独清理 Cookie 和本地存储

相关文件：

- `src/main/libs/jdAuthManager.ts`

### 2. 登录成功判定

`JdAuthManager` 会在登录窗存活期间同时使用三种方式判断是否已登录成功：

- 监听页面导航事件
- 监听 Cookie 变化事件
- 每秒轮询一次当前登录窗口 session 的 Cookie

当前实现会同时识别两个 ERP Cookie 名：

- `_erp`
- `erp_erp`

之所以同时支持这两个名称，是因为最初需求假设 ERP 位于 `_erp`，但实际联调时在 Electron 登录窗口内观测到的 Cookie 名是 `erp_erp`。如果只识别 `_erp`，就会出现：

- 登录窗不会自动关闭
- 主界面不会回显 ERP
- 本地不会写入 `jd_auth_state`

所以当前逻辑采用“双保险”识别方式，优先保证运行时兼容性。

相关文件：

- `src/shared/auth/constants.ts`
- `src/main/libs/jdAuthManager.ts`

### 3. 本地状态落点

当前本地只存最小登录态，不再保存旧 Portal token 或用户资料。

SQLite 相关信息：

- 用户数据目录：`~/Library/Application Support/JdiClawApp/`
- 数据库文件名：`jdiclaw.sqlite`
- KV key：`jd_auth_state`

持久化结构：

```json
{
  "erp": "your-erp",
  "loggedInAt": 1775725693125
}
```

相关文件：

- `src/main/appConstants.ts`
- `src/main/sqliteStore.ts`
- `src/shared/auth/constants.ts`
- `src/shared/auth/jdAuth.ts`

### 4. 登录成功后的 UI 行为

当主进程识别到 ERP Cookie 后，会：

1. 对账并写入 `jd_auth_state`
2. 向所有渲染窗口广播 `auth:stateChanged`
3. 关闭登录窗口
4. 聚焦主窗口

渲染层收到 `auth:stateChanged` 后，会：

1. 把 Redux 登录态更新为 `isLoggedIn=true`
2. 写入当前 `erp`
3. 如果登录请求带了 `redirectTo`，切换到对应主视图

此外，渲染层还保留了一个兜底逻辑：

- 当用户重新聚焦主窗口时，会主动调用 `auth:getState`
- 重新向主进程对账当前 ERP 状态

这个兜底用于处理“登录页 Cookie 已经写入，但实时事件没有命中”的场景。

相关文件：

- `src/main/main.ts`
- `src/renderer/services/auth.ts`
- `src/renderer/App.tsx`
- `src/renderer/store/slices/authSlice.ts`

### 5. 左下角展示

当前左下角区域只承担两件事：

- 未登录时显示“登录”
- 已登录时直接显示 ERP

点击已登录状态后会弹出一个极简菜单，只包含：

- 当前 ERP
- 退出登录

已移除或停用的旧 UI 能力包括：

- 用户昵称/头像展示
- 积分明细
- 套餐/增值服务入口
- Portal 资料页/购买页跳转

相关文件：

- `src/renderer/components/LoginButton.tsx`

## 退出登录实现

当前退出登录由主进程统一处理。

执行内容：

1. 关闭仍然存在的 ERP 登录窗
2. 清除本地 `jd_auth_state`
3. 清理 `persist:jd-auth` 分区下的全部 Cookie
4. 清理该分区的本地存储
5. 广播 `auth:stateChanged`，把渲染层恢复到未登录状态

注意：

- 旧的远端 `/api/auth/logout` 调用已经不再作为当前主链路使用
- 旧 Portal token 清理逻辑仍保留兼容清理，但不是新登录方案的依赖

## 运行日志抓手

为了便于排查登录问题，`JdAuthManager` 当前会输出以下关键日志：

- 打开登录窗：`[JdAuth] opening JD login window`
- Cookie 变化：`[JdAuth] cookie changed`
- Cookie 快照：`[JdAuth] observed cookies after ...`
- 登录成功：`[JdAuth] login completed after ...`

在 macOS 上，当前主日志默认位于：

- `~/Library/Logs/LobsterAI/main-YYYY-MM-DD.log`

排查登录问题时，优先关注这几项：

1. 当前 URL 是否已经回到 `http://erp.jd.com/`
2. 登录窗口 session 中到底有哪些 Cookie
3. `hasErp` 是否为 `true`
4. 是否出现了 `login completed`

## 扩展点

### 1. 支持更多 ERP Cookie 规则

当前实现同时支持 `_erp` 和 `erp_erp`。如果后续不同环境、不同门户网关、不同 SSO 中间层引入了新的 ERP Cookie 名，可继续在以下位置扩展：

- `src/shared/auth/constants.ts`
- `src/main/libs/jdAuthManager.ts`

建议做法：

- 维护一个可枚举的 Cookie 名集合，而不是在多个判断里继续散写字符串

### 2. 支持显示更多用户信息

当前只显示 ERP。如果后续需要显示：

- 中文名
- 组织
- 头像

建议不要重新引入旧 Portal 资料接口，而是新增一个“JD 用户信息解析层”，来源可以是：

- 登录成功后的页面 DOM
- 另一个内网接口
- 额外的 Cookie / Header / 页面脚本对象

建议扩展位置：

- `src/main/libs/jdAuthManager.ts`
- `src/shared/auth/jdAuth.ts`
- `src/renderer/store/slices/authSlice.ts`
- `src/renderer/components/LoginButton.tsx`

### 3. 支持更丰富的登录后跳转

当前 `redirectTo` 只支持应用内主视图：

- `cowork`
- `skills`
- `scheduledTasks`
- `mcp`
- `agents`

如果后续需要跳到：

- 指定会话
- 指定设置页 tab
- 指定内部 URL

建议不要直接把“复杂跳转逻辑”塞进主进程，而是继续保持：

- 主进程只广播轻量跳转意图
- 渲染层负责解释跳转语义

### 4. 支持更强的登录成功检测

当前已具备三层检测：

- 导航事件
- Cookie changed
- 定时轮询

如果未来某个 JD 页面再改版，导致 Cookie 写入更晚或隐藏得更深，还可以补：

- 读取页面 DOM 中的 ERP 信息
- 执行只读脚本抓 `document.cookie`
- 监听页面网络请求返回头

但这些都应作为补充策略，而不是替代当前的 Cookie-first 方案。

## 当前已知注意事项

### 1. 旧 Portal 登录代码仍在主进程中保留

当前渲染层已经不再走旧 Portal 登录链路，但主进程里仍保留了一部分历史 handler，主要是为了降低这次改造风险。

后续如果要继续收口认证实现，可以清理：

- `auth:exchange`
- `auth:getUser`
- `auth:getQuota`
- `auth:getProfileSummary`
- `auth:refreshToken`
- `auth:getModels`

### 2. `auth_tokens` 可能仍会残留旧历史数据

当前新链路不依赖旧 token，但为了兼容升级路径，主进程在 ERP 登录成功后仍会尝试清掉历史 token 和模型缓存。

如果后续彻底不需要旧 Portal 体系，可以考虑：

- 移除 `auth_tokens` 相关 helper
- 移除与 `lobsterai-server` 登录态耦合的旧认证逻辑

## 推荐维护原则

后续继续改 JD 登录时，建议遵守三条原则：

1. 主进程负责 session、Cookie、窗口生命周期
2. 渲染层只关心最小登录态和页面跳转
3. 所有登录判定都优先基于可观测证据，不要只靠单点假设

这次 `erp_erp` 的联调问题已经证明：

- 真实运行时证据比文档假设更可靠
- 登录方案必须保留兜底机制和日志抓手
- 登录实现必须可观测，否则排查成本会快速失控
