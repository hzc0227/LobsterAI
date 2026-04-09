# Task

- ID: `BRAND-04`
- Phase: `Phase 2`
- Goal: 替换主进程壳层中的窗口、菜单、托盘等品牌显示，但不改应用运行身份
- Complexity: `2`
- Risk: `medium`

## Background

- 本任务进入主进程壳层
- 目标是用户运行时看到的是 `JdiClaw`
- 但这次仍然不改 `APP_ID`、数据库文件名、deep link 协议

## Allowed Files

- `src/main/main.ts`
- `src/main/i18n.ts`
- `src/main/trayManager.ts`
- 其他仅影响壳层显示的主进程文件

## Do Not Touch

- `src/main/appConstants.ts`
- 登录 IPC
- 模型代理
- 数据库存储逻辑
- 自动更新逻辑

## Preconditions

- Phase 1 已完成
- 已确认当前只做显示层壳层改动，不做真实身份迁移

## Required Changes

- 替换窗口标题、菜单文案、托盘可见品牌文案
- 替换 About 或帮助相关壳层文案
- 所有改动必须限定在“显示名称”，不要影响真实协议与持久化身份

## Non-Goals

- 不改 `APP_NAME`
- 不改 `APP_ID`
- 不改数据库名
- 不改 deep link 协议

## Done When

- 启动应用后，窗口标题与壳层菜单主要显示为 JdiClaw
- 不影响现有应用运行
- 不引入登录、模型、存储回归

## Validation

- Command: `npm run build`
- Manual Check: 启动应用后检查窗口标题、托盘菜单、主菜单显示

## Stop If

- 发现必须修改 `appConstants.ts` 中的真实身份常量才能继续
- 壳层显示改动会影响协议、数据库或更新链路

## Output Format

- Changed files
- What changed
- Validation commands
- Validation results
- Risks / blockers
