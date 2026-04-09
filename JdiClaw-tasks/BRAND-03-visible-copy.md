# Task

- ID: `BRAND-03`
- Phase: `Phase 1`
- Goal: 替换渲染层中直接面向用户的品牌文案，让应用界面先“看起来像 JdiClaw”
- Complexity: `2`
- Risk: `low`

## Background

- 这是第一批真正进入代码的品牌替换任务
- 仅处理渲染层可见文案，不处理主进程身份与协议

## Allowed Files

- `src/renderer/`
- 与 i18n 直接相关的文案文件

## Do Not Touch

- `src/main/`
- `package.json`
- `electron-builder.json`
- 登录、模型、技能、Cowork 执行逻辑

## Preconditions

- 已完成文档层品牌口径统一
- 已确认当前只替换“可见文案”，不改行为

## Required Changes

- 查找渲染层用户可见的 `LobsterAI`、`有道` 等品牌文案
- 替换为 `JdiClaw` 或中性品牌表达
- 优先改 i18n 文案入口，避免散点硬编码
- 保证语义不夸大当前未完成的 JD 能力

## Non-Goals

- 不改登录流程
- 不改服务端地址
- 不改 provider、模型、权限逻辑

## Done When

- 渲染层主要用户可见品牌文案已替换
- 中英文文案保持同步
- 不引入新的硬编码品牌名散点

## Validation

- Command: `npm run build`
- Manual Check: 启动应用后检查设置页、首页、帮助文案等主要可见区域

## Stop If

- 需要改动主进程或协议层身份才能继续
- 文案存在产品定位冲突，无法直接替换

## Output Format

- Changed files
- What changed
- Validation commands
- Validation results
- Risks / blockers
