# JdiClaw 统一待办清单

本文件用于统一记录 JdiClaw 改造过程中的遗留项、补充项和后续待办。

使用规则：
- 新待办统一追加到本文件，不再分散记录到临时消息中。
- 每条待办尽量写清楚页面位置、现状、目标、边界和相关文件。
- 已完成的待办不要删除，改为标记完成，便于回溯。

## 当前已确认前提（2026-04-13）

- 最终系统身份固定为 `com.jdiclaw.app` 与 `jdiclaw://`
- 不兼容旧 `LobsterAI` 本地数据、旧导出文件、旧 session key
- 新的服务端真实地址暂未准备好，当前阶段先做配置抽象，不直接填最终实值
- 品牌替换时不要误改 `OpenClaw/openclaw` 等上游依赖名

## 待处理

### TODO-001 设置页关于信息替换

- 状态：`done`
- 优先级：`中`
- 页面位置：设置 -> 关于
- 现象：
  - 当前页面需要完成 About 信息的最终收口，只保留当前阶段允许对外展示的手册与社群口径。
- 目标：
  - 设置页“关于”只保留用户手册和用户社群。
  - 用户手册统一走共享配置模块，用户社群固定展示 `10227855752`。
- 暂不包含：
  - 服务端登录链路改造
  - Portal 鉴权地址改造
  - 更新接口与下载接口改造
- 相关文件：
  - `src/renderer/components/Settings.tsx`
  - `src/renderer/components/PrivacyDialog.tsx`
  - `src/shared/platform/constants.ts`
- 备注：
  - 2026-04-13 已完成：联系邮箱入口、服务条款入口和首次隐私确认依赖已移除。

### TODO-002 安装包身份与协议唤起迁移

- 状态：`todo`
- 优先级：`高`
- 范围：
  - 安装包身份
  - `electron-builder.json`
  - deep link scheme
  - `appId`
  - `productName`
  - `executableName`
- 目标：
  - 将安装包与协议唤起相关的壳层身份从 `LobsterAI` 切换到 `JdiClaw`
  - 直接把 deep link scheme 固定切换到 `jdiclaw://`
- 风险：
  - 会影响系统安装身份、协议注册和升级行为
- 已确认策略：
  - 不兼容旧 `lobsterai://`

### TODO-003 数据契约与外部接口契约收口

- 状态：`todo`
- 优先级：`高`
- 范围：
  - 导出文件格式标识
  - 本地加密默认口令
  - provider 内部 key
  - 定时任务 session key
  - 其他带有 `lobsterai` 的内部协议字符串
- 目标：
  - 将产品内部契约统一迁移为 `jdiclaw`
  - 删除旧契约兼容分支与兼容注释
- 风险：
  - 会直接中断旧导出文件、旧任务记录和旧 session key 的可读性
- 已确认策略：
  - 不兼容旧导出文件、旧 session key、旧本地数据

### TODO-004 服务端链路迁移

- 状态：`todo`
- 优先级：`高`
- 范围：
  - 登录链路
  - Portal 链路
  - 更新接口
  - 下载地址
  - 技能商店与服务端网关
- 目标：
  - 先把仍然绑定 `lobsterai` / 有道系地址的服务端入口统一抽象到配置模块
  - 等真实地址准备好后，再只通过配置模块填入最终值
- 风险：
  - 与外部服务、鉴权、更新、兼容性强相关，不适合在信息不全时直接替换
- 已确认策略：
  - 当前阶段只做配置抽象，不直接填生产实值

### TODO-005 开发期独立迁移脚本

- 状态：`cancelled`
- 优先级：`中`
- 范围：
  - 本地 `userData` 目录
  - SQLite 文件
  - `logs/`
  - `SKILLs/`
  - `openclaw/`
  - `runtimes/`
- 目标：
  - 原计划为旧 `LobsterAI` 本地数据提供单独迁移脚本
- 原则：
  - 当前策略已调整为不兼容旧本地数据，因此不再执行该项
  - 应用启动时只检查并使用新目录，不自动读取或复制旧目录

### TODO-006 运行时品牌清理

- 状态：`done`
- 优先级：`中高`
- 范围：
  - 默认 identity 文案
  - system prompt 前缀
  - context bridge 前缀
  - `clientDisplayName`
  - `User-Agent`
  - 插件描述
- 目标：
  - 清理运行时与外部请求中仍然会泄漏旧品牌的隐性标识
- 相关文件：
  - `src/main/libs/openclawMemoryFile.ts`
  - `src/main/libs/agentEngine/openclawRuntimeAdapter.ts`
  - `src/main/skillManager.ts`
  - `src/main/libs/githubCopilotAuth.ts`
  - `openclaw-extensions/mcp-bridge/index.ts`

### TODO-007 品牌资源链路统一

- 状态：`done`
- 优先级：`中`
- 范围：
  - 首页 Logo
  - About Logo
  - 分享卡片 Logo
  - tray 图标
  - 安装包图标
- 目标：
  - 统一页面、tray 与安装包资源链路，去掉旧 `logo.png` 的兼容语义
- 相关文件：
  - `src/renderer/components/cowork/CoworkView.tsx`
  - `src/renderer/components/Settings.tsx`
  - `src/renderer/components/cowork/CoworkSessionDetail.tsx`
  - `index.html`
  - `public/`
  - `build/icons/`
  - `resources/tray/`
- 备注：
  - 2026-04-13 已完成：渲染层与图标生成脚本统一切换到 `jdiclaw-logo` 资源入口。
