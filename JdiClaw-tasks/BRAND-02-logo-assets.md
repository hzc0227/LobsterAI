# Task

- ID: `BRAND-02`
- Phase: `Phase 1`
- Goal: 替换或收口项目中的 logo 与品牌资源引用，让视觉入口先切换为 `JdiClaw`
- Complexity: `1`
- Risk: `low`

## Background

- 本任务聚焦视觉资源入口
- 如果还没有最终版 JdiClaw logo，可以先把引用路径和命名收口，为后续资源替换预留位置

## Allowed Files

- `public/` 下与 logo / icon 展示直接相关的资源文件
- `README.md`
- `README_zh.md`
- `index.html`
- 其他仅用于展示 logo 的静态引用文件

## Do Not Touch

- `src/main/appConstants.ts`
- `src/main/main.ts`
- `electron-builder.json`
- 任何登录、接口、模型相关逻辑

## Preconditions

- 已确认是否有可用的 JdiClaw logo
- 如果没有最终 logo，允许先做资源占位与引用收口

## Required Changes

- 找出当前项目所有直接引用 `LobsterAI` logo 的入口
- 替换为 JdiClaw logo 或预留统一引用路径
- 确保 README、首页或窗口加载入口显示的品牌图形与新品牌一致
- 如需新增说明，注明当前资源是否为临时占位

## Non-Goals

- 不改安装包图标
- 不改系统托盘图标逻辑
- 不改窗口标题

## Done When

- 文档和主要静态入口不再直接显示旧 logo
- logo 引用路径清晰，不再散落
- 若使用临时资源，文档中已明确说明

## Validation

- Command: 无
- Manual Check: 打开 README 与页面入口，确认显示资源已替换或统一占位

## Stop If

- 缺少最小可用的品牌资源且无法安全占位
- 需要同时改打包配置或系统图标才能继续

## Output Format

- Changed files
- What changed
- Validation results
- Risks / blockers
