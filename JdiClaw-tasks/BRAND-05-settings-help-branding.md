# Task

- ID: `BRAND-05`
- Phase: `Phase 2`
- Goal: 替换设置页、帮助页、关于页等壳层展示文案中的旧品牌痕迹
- Complexity: `2`
- Risk: `low`

## Background

- 这是 Phase 2 的补充任务
- 目的是把表层品牌和壳层帮助入口统一

## Allowed Files

- `src/renderer/components/`
- `src/renderer/services/i18n.ts`
- `src/main/i18n.ts`

## Do Not Touch

- 登录与鉴权逻辑
- 模型配置逻辑
- 技能执行逻辑
- 打包配置

## Preconditions

- Phase 1 已完成
- 已确认帮助与设置页只做品牌文案更新

## Required Changes

- 替换设置页、帮助页、关于页的品牌描述
- 替换仍然出现的 `LobsterAI` 或有道品牌表述
- 统一用词，不要在不同页面混用旧品牌和新品牌

## Non-Goals

- 不改功能入口逻辑
- 不改设置项行为
- 不改任何服务端地址

## Done When

- 设置、帮助、关于等页面主要品牌文案统一为 JdiClaw
- 中英文文案保持一致
- 构建通过

## Validation

- Command: `npm run build`
- Manual Check: 启动应用并进入设置、帮助、关于相关页面检查文案

## Stop If

- 需要改动功能逻辑或 IPC 才能完成
- 页面本身缺失，无法安全修改

## Output Format

- Changed files
- What changed
- Validation commands
- Validation results
- Risks / blockers
