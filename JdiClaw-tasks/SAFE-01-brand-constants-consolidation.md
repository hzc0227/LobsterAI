# Task

- ID: `SAFE-01`
- Phase: `Phase 3`
- Goal: 收口散落的品牌字符串，建立统一品牌常量入口，为后续 JD 接入减少全文替换
- Complexity: `3`
- Risk: `medium`

## Background

- 这不是功能改造任务，而是技术接缝收口任务
- 目的不是切换 JD 服务，而是降低后续改造面的复杂度

## Allowed Files

- `src/main/`
- `src/renderer/`
- 可新增一个品牌常量文件

## Do Not Touch

- 登录协议
- 模型请求目标
- 服务端地址
- 数据库与 deep link 身份

## Preconditions

- Phase 1 和 Phase 2 基本完成
- 已确认品牌名为 `JdiClaw`

## Required Changes

- 找出仍然散落在代码中的品牌字符串
- 尽量收口到统一常量或统一文案入口
- 优先处理显示层与帮助层，不要牵连运行身份

## Non-Goals

- 不切换任何真实接口
- 不改应用身份常量
- 不做大规模重构

## Done When

- 品牌字符串不再大面积散落
- 新增的统一入口清晰可复用
- 没有引入行为变化

## Validation

- Command: `npm run build`
- Manual Check: 搜索关键品牌字符串，确认散点数量明显减少

## Stop If

- 收口过程要求改动高风险运行身份常量
- 需要跨阶段引入登录/API 改造

## Output Format

- Changed files
- What changed
- Validation commands
- Validation results
- Risks / blockers
