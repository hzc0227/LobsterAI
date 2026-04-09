# Task

- ID: `BRAND-01`
- Phase: `Phase 1`
- Goal: 替换仓库文档中的核心品牌文案，让项目对外描述先从 `LobsterAI` 收敛到 `JdiClaw`
- Complexity: `1`
- Risk: `low`

## Background

- 这是最小改造的第一步
- 本任务只处理文档层品牌，不涉及代码逻辑
- 完成后，后续品牌替换会有统一口径

## Allowed Files

- `README.md`
- `README_zh.md`
- 如确有必要，可新增一个根目录说明文档用于记录品牌说明

## Do Not Touch

- `src/` 下任何业务代码
- `package.json`
- `electron-builder.json`
- 图标、logo 资源文件

## Preconditions

- 已确认当前目标品牌名为 `JdiClaw`
- 已确认这次只改文档，不改安装包身份和运行身份

## Required Changes

- 将 README 中面向用户的主要品牌名替换为 `JdiClaw`
- 将中英文项目简介替换为面向 JD 场景的中性表述
- 保留当前架构说明，不要伪造 JD 已经接入的能力
- 对尚未改造完成的登录/API/技能能力，文案应保持谨慎，不得写成已完成

## Non-Goals

- 不改代码中的字符串常量
- 不改 logo 文件
- 不改应用名常量
- 不改任何接口地址

## Done When

- `README.md` 的标题、简介、核心定位已替换为 JdiClaw 口径
- `README_zh.md` 的标题、简介、核心定位已替换为 JdiClaw 口径
- 文档中不再把项目描述为“网易有道的龙虾产品”
- 文档内容没有伪造尚未完成的 JD 接入状态

## Validation

- Command: 无
- Manual Check: 打开 `README.md` 与 `README_zh.md`，确认标题、简介、品牌名已切换且语义一致

## Stop If

- 需要同步修改代码逻辑才能完成任务
- 品牌定位本身不明确，需要重新定义产品定位

## Output Format

- Changed files
- What changed
- Validation results
- Risks / blockers
