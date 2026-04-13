# JdiClaw 任务目录

本目录用于存放可以直接派发给 AI 的具体任务文件。

注意：
- 根目录的 `JdiClaw-execution-plan.md` 是当前唯一生效的主计划。
- 如果某个任务文件中的边界与主计划冲突，以主计划为准。
- `LobsterAI` -> `JdiClaw` 当前采用硬切策略，不兼容旧协议、旧导出文件、旧 session key。
- 文档、测试和代码示例都应直接使用 JdiClaw 口径，不再保留“旧品牌兼容写法”的示例。

## 使用方式

1. 先阅读根目录的 `JdiClaw-execution-plan.md`
2. 从本目录选择一个任务文件
3. 新开线程时，只派发这一个任务文件
4. 要求 AI 严格遵守该任务文件里的允许范围、停止条件、完成标准和验证方式

## 当前推荐执行顺序

根据 `2026-04-13` 已确认策略，推荐按以下顺序执行：

1. `P0-1` 身份常量与壳层硬切
2. `P0-2` 服务端与外链配置抽象
3. `P0-3` 数据契约硬切
4. `P1-1` 运行时品牌清理
5. `P1-2` Logo 与图标资源统一
6. `P2-1` 文档与测试收尾
7. `P2-2` 真实服务地址填值切换

其中：
- `P0-1`、`P0-2`、`P0-3` 建议连续完成，不要被中断到登录/API 接入任务
- `P2-2` 只能在真实地址准备好后执行

## 现有任务文件与当前主线的关系

当前目录下的现有任务文件，主要覆盖：
- 品牌表层替换
- 品牌壳层替换
- 技术接缝收口

这些文件仍可作为拆单参考，但执行前需要先确认它们没有隐含“兼容旧 LobsterAI 数据/协议”的前提。

## 当前任务清单

### Phase 1：品牌表层替换

- `BRAND-01-docs-branding.md`
- `BRAND-02-logo-assets.md`
- `BRAND-03-visible-copy.md`

### Phase 2：品牌壳层替换

- `BRAND-04-main-shell-branding.md`
- `BRAND-05-settings-help-branding.md`

### Phase 3：技术接缝收口

- `SAFE-01-brand-constants-consolidation.md`
- `SAFE-02-endpoints-display-name-consolidation.md`
- `SAFE-03-future-jd-config-hooks.md`

## 建议尽快补齐的任务文件

这些任务已经进入当前主线，建议优先补齐：

- `EXEC-00-hard-cut-rollout.md`
- `RELEASE-01-app-shell-identity-hard-cut.md`
- `CONTRACT-01-data-contract-hard-cut.md`
- `RUNTIME-01-runtime-branding-cleanup.md`
- `DOC-01-docs-tests-alignment.md`

## 等外部条件就绪后再补的任务

- `ENDPOINT-01-fill-final-service-values.md`
- `AUTH-01-jd-login-entry.md`
- `AUTH-02-token-refresh.md`
- `MODEL-01-server-models.md`
- `MODEL-02-cowork-gateway.md`
- `SKILL-01-jd-skills.md`
