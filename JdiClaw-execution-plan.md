# JdiClaw 改造主计划

## 目标

本计划用于把当前 `LobsterAI` 代码库按“硬切换、少分支、少兼容”的方式改造成 `JdiClaw`。

当前执行策略不再是“最小改造优先”，而是改为：
- 先统一常量、协议、壳层身份与配置入口
- 再清理数据契约、运行时品牌和资源链路
- 最后在外部条件就绪后，只通过配置切换真实服务地址

## 当前已确认决策

以下决策已确认，后续任务默认以此为准：

1. 最终系统身份固定为 `com.jdiclaw.app` 与 `jdiclaw://`
2. 不兼容旧 `LobsterAI` 本地数据、旧导出文件、旧 session key
3. 新的服务端真实地址暂未准备好，当前阶段先做配置抽象，不直接填生产实值

## 当前执行入口

当前阶段的逐条执行明细已独立沉淀为任务单：

- [JdiClaw-tasks/EXEC-00-hard-cut-rollout.md](/Users/hanzhichao7/Documents/code/JoyClaw/LobsterAI/JdiClaw-tasks/EXEC-00-hard-cut-rollout.md)

后续派发执行时，优先以该任务单为准；本文件只保留阶段、优先级和总体边界。

## 核心原则

### 原则一：硬切，不做历史兼容

- 不保留 `lobsterai://` 兼容监听
- 不保留旧导出格式兼容读取
- 不保留旧 session key 兼容解析
- 不编写旧数据迁移脚本

这样做的目的，是让代码尽快从“双品牌、双协议、双契约”的过渡态收敛为单一实现。

### 原则二：先抽象配置，再切真实地址

- 先把更新、下载、Portal、协议页、登录入口等硬编码抽到统一配置模块
- 当前阶段允许使用占位值、测试值或空值
- 后续真实地址准备好后，只改配置，不改页面逻辑和业务逻辑

### 原则三：产品身份和外部依赖严格区分

需要替换的，是产品身份相关内容：
- `LobsterAI`
- `lobsterai`
- `com.lobsterai.app`
- `lobsterai://`

不要误替换的，是上游依赖或真实外部名词：
- `OpenClaw`
- `openclaw`
- npm 包名、插件 ID、第三方 SDK 协议名

### 原则四：单任务可独立验收

后续派发给 AI 的任务必须满足：
- 一次只做一个明确目标
- 优先控制在 `1-8` 个文件内
- 明确允许修改范围
- 明确禁止触碰范围
- 明确停止条件
- 明确验证命令与人工验收点

## 非目标

当前阶段以下内容不作为默认任务：

- 提前接入新的 JD 登录、鉴权、模型、技能服务
- 保留旧数据兼容分支
- 提前做历史数据迁移
- 为兼容旧安装包身份增加双协议或双目录逻辑

## 优先级总览

| 优先级 | 编号 | 名称 | 复杂度 | 影响 | 外部依赖 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| P0 | P0-1 | 身份常量与壳层硬切 | 2/5 | 高 | 无 | 先把系统身份、协议、壳层名称切到 JdiClaw |
| P0 | P0-2 | 服务端与外链配置抽象 | 2/5 | 高 | 低 | 把所有旧地址收口到统一配置，不直接填最终值 |
| P0 | P0-3 | 数据契约硬切 | 2-3/5 | 高 | 无 | 导出格式、口令、session key、marker 直接切新值 |
| P1 | P1-1 | 运行时品牌清理 | 2/5 | 中高 | 无 | 清理默认 identity、prompt 前缀、User-Agent 等隐性泄漏 |
| P1 | P1-2 | Logo 与图标资源统一 | 2/5 | 中 | 低 | 页面、托盘、安装包统一为一套 JdiClaw 品牌资源 |
| P2 | P2-1 | 文档与测试收尾 | 1-2/5 | 中 | 无 | 收口 README、任务文档和测试断言 |
| P2 | P2-2 | 真实服务地址填值切换 | 1/5 | 高 | 高 | 仅在地址准备好后执行，只改配置模块 |

## 执行说明

详细任务清单只保留在独立执行文件中：

- [JdiClaw-tasks/EXEC-00-hard-cut-rollout.md](/Users/hanzhichao7/Documents/code/JoyClaw/LobsterAI/JdiClaw-tasks/EXEC-00-hard-cut-rollout.md)

本文件不再重复维护逐条任务、文件范围和验收命令，避免与执行文件发生漂移。

## 当前推荐执行顺序

1. 连续完成 `P0-1`
2. 紧接着完成 `P0-2`
3. 继续完成 `P0-3`
4. 再做 `P1-1`
5. 再做 `P1-2`
6. 统一做 `P2-1`
7. 等真实地址准备好后执行 `P2-2`

## 任务文件建议

### 现有任务文件可继续复用的方向

- `BRAND-01-docs-branding.md`
- `BRAND-02-logo-assets.md`
- `BRAND-03-visible-copy.md`
- `BRAND-04-main-shell-branding.md`
- `BRAND-05-settings-help-branding.md`
- `SAFE-01-brand-constants-consolidation.md`
- `SAFE-02-endpoints-display-name-consolidation.md`
- `SAFE-03-future-jd-config-hooks.md`

### 建议新增的任务文件

- `RELEASE-01-app-shell-identity-hard-cut.md`
- `CONTRACT-01-data-contract-hard-cut.md`
- `RUNTIME-01-runtime-branding-cleanup.md`
- `DOC-01-docs-tests-alignment.md`
- `ENDPOINT-01-fill-final-service-values.md`

## 验证要求

每个任务完成后至少执行以下检查中的相关项：

- `npm run lint`
- `npm test`
- `npm run compile:electron`
- `npm run build`
- `npm run electron:dev`
- `rg -n "LobsterAI|lobsterai" src/main src/renderer README.md README_zh.md electron-builder.json package.json`

人工验收至少覆盖：
- 窗口标题
- tray 文案
- deep link scheme
- 首页 logo
- 设置页 About
- 服务协议弹窗
- 导入导出
- 分享图

## 完成定义

满足以下条件即可认为这一轮改造主线完成：

- 系统身份已固定为 `JdiClaw`
- 所有产品内部契约已切到 `jdiclaw`
- 品牌相关服务入口已完成统一配置抽象
- 页面、tray、安装包资源已统一
- 文档与测试已经对齐当前硬切策略
- 真实服务地址只剩待填值，不再需要额外重构
