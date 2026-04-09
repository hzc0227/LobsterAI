# JdiClaw AI 任务执行模板

本模板用于给 AI 派发单次具体任务。建议一条线程一次只执行一个任务文件，不要在同一条任务里混合多个目标。

---

# Task

- ID:
- Phase:
- Goal:
- Complexity: `1|2|3|4|5`
- Risk: `low|medium|high`

## Background

- 当前任务属于哪一阶段：
- 本任务为什么现在做：
- 与前后任务的关系：

## Allowed Files

- 允许修改的文件必须逐条列出
- 如果确实需要新增文件，也要明确写出允许新增的目录

## Do Not Touch

- 明确禁止修改的文件和模块
- 尤其要列出不允许顺手重构的高风险区域

## Preconditions

- 执行前必须满足的前置条件
- 如果前置条件不满足，应停止并汇报

## Required Changes

- 用简短、具体、可验收的语言描述这次必须完成什么
- 不要写“顺手优化”“必要时重构”这类模糊表述

## Non-Goals

- 明确这次不要做什么
- 尤其是跨阶段内容必须写清楚

## Done When

- 用 3 到 6 条标准描述“什么叫做完成”
- 必须都是可以验证的结果

## Validation

- Command:
- Manual Check:

说明：
- `Command` 写可执行命令，如 `npm run build`
- `Manual Check` 写人工验收路径，如“启动应用后检查窗口标题是否变为 JdiClaw”

## Stop If

- 哪些情况一出现就必须停止，不得猜实现
- 例如接口字段不明确、外部依赖缺失、影响到禁止修改的文件

## Output Format

执行完成后，AI 必须输出以下内容：

- Changed files
- What changed
- Validation commands
- Validation results
- Risks / blockers

## Git Rules

- 不要改动无关文件
- 不要顺手修 unrelated lint
- 不要做跨阶段功能
- 如果发现阻塞，优先汇报，不要扩大实现范围

---

## 推荐使用方式

把本模板复制成一个具体任务文件后，再补全内容。例如：

- `JdiClaw-tasks/BRAND-01-docs-branding.md`
- `JdiClaw-tasks/BRAND-04-main-shell-branding.md`
- `JdiClaw-tasks/AUTH-01-jd-login-entry.md`
