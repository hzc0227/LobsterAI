# Task

- ID: `SAFE-02`
- Phase: `Phase 3`
- Goal: 收口 endpoint 外显名称和品牌展示相关字符串，为后续切 JD 地址做准备，但这次不切换上游
- Complexity: `3`
- Risk: `medium`

## Background

- 当前项目里有些服务端地址、品牌名、入口名是耦合在一起的
- 本任务只做收口与命名整理，不改真实请求目标

## Allowed Files

- `src/renderer/services/endpoints.ts`
- `src/main/libs/endpoints.ts`
- 与 endpoint 外显名称相关的展示层文件

## Do Not Touch

- 登录逻辑实现
- token 逻辑
- 模型网关实现
- 自动更新真实地址切换

## Preconditions

- 已明确本任务只做命名收口，不做能力切换

## Required Changes

- 梳理与品牌外显相关的 endpoint 名称和帮助文案
- 如果当前文件中同时承载“真实地址”和“展示语义”，尽量做低风险分离
- 为未来接 JD 服务保留清晰的替换入口

## Non-Goals

- 不改 URL 目标
- 不改请求头
- 不改登录或模型行为

## Done When

- 后续要切换登录/更新/帮助入口时，有明确单点入口可改
- 当前行为保持不变
- 构建通过

## Validation

- Command: `npm run build`
- Manual Check: 检查 endpoint 管理文件，确认品牌外显与真实地址更清晰分离

## Stop If

- 一旦需要修改真实上游地址才能完成，就停止
- 一旦牵涉登录或模型调用行为变化，就停止

## Output Format

- Changed files
- What changed
- Validation commands
- Validation results
- Risks / blockers
