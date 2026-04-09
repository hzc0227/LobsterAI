# Task

- ID: `SAFE-03`
- Phase: `Phase 3`
- Goal: 为未来 JD 登录、模型、技能接入预留清晰的配置入口，但这次不接入任何真实 JD 能力
- Complexity: `3`
- Risk: `medium`

## Background

- 本任务的目标是“为未来改造留接口”，不是“现在就完成接入”
- 如果前面没有做好这一步，后续切 JD 时容易出现大面积散点改动

## Allowed Files

- `src/renderer/config.ts`
- `src/renderer/services/config.ts`
- `src/main/libs/endpoints.ts`
- 如有必要，可新增一个低风险配置常量文件

## Do Not Touch

- `src/main/main.ts` 中真实登录逻辑
- `src/renderer/services/auth.ts`
- 模型网关和代理实现
- 技能执行逻辑

## Preconditions

- Phase 1 和 Phase 2 已基本完成
- 已确认这次只做配置位和命名收口，不接入真实 JD 服务

## Required Changes

- 识别当前代码中未来必然会切换的配置类入口
- 以低风险方式预留品牌、服务端、环境或 provider 相关配置位
- 保证这些预留位不会改变当前行为
- 命名要服务于未来 JD 接入，但不能伪装成已经接入

## Non-Goals

- 不改任何真实请求地址
- 不改任何登录流程
- 不改任何模型调用逻辑

## Done When

- 后续接入 JD 时已有清晰的配置入口可用
- 当前构建和行为保持不变
- 不增加误导性的“伪配置”

## Validation

- Command: `npm run build`
- Manual Check: 检查新增或收口后的配置入口，确认其存在但未改变当前行为

## Stop If

- 需要修改真实登录、模型或技能逻辑才能继续
- 预留入口会改变当前配置读取与运行行为

## Output Format

- Changed files
- What changed
- Validation commands
- Validation results
- Risks / blockers
