# JdiClaw 项目速查说明

本文件用于记录当前项目里容易忘、但经常需要快速确认的零散说明。

适用场景：
- 下次继续改造品牌或壳层时，先快速确认数据和目录到底放在哪儿
- 遇到“为什么这个页面已经变了，但历史记录还在”这类问题时，快速定位原因
- 作为 JdiClaw 改造阶段的项目知识速查页

## 1. 当前默认工作区目录

当前代码里，**默认工作区目录**已经改成：

```text
~/jdiclaw/project
```

说明：
- 这里的“工作区目录”主要用于放 Agent 工作区相关文件
- 例如：
  - `IDENTITY.md`
  - `SOUL.md`
  - `USER.md`
  - `MEMORY.md`

相关代码：
- `src/main/defaultPaths.ts`
- `src/main/coworkStore.ts`
- `src/main/main.ts`

## 2. 聊天记录、历史任务、配置存在哪里

聊天记录、历史任务、Cowork 配置等**不是**存放在工作区目录里的。

它们当前存放在本地 SQLite 数据库中。

当前数据库路径由两部分组成：

1. 应用数据目录：`app.getPath('userData')`
2. 数据库文件名：`lobsterai.sqlite`

当前主进程运行时身份已经切到 `JdiClaw`，但为了避免与历史小写开发目录冲突，当前应用数据目录目标位置使用：

```text
~/Library/Application Support/JdiClawApp
```

SQLite 文件完整路径当前是：

```text
~/Library/Application Support/JdiClawApp/jdiclaw.sqlite
```

当前开发机上的实际示例路径：

```text
/Users/hanzhichao7/Library/Application Support/JdiClawApp/jdiclaw.sqlite
```

相关代码：
- `src/main/appConstants.ts`
- `src/main/main.ts`
- `src/main/sqliteStore.ts`

## 3. 哪些数据在 SQLite 里

目前至少可以明确这些数据在 SQLite 中维护：

- 聊天记录 / 会话记录
- Cowork 配置
- 通用配置键值

核心表：

- `kv`
  - 通用配置键值
- `cowork_sessions`
  - 会话元数据
- `cowork_messages`
  - 会话消息内容
- `cowork_config`
  - Cowork 配置，例如 `workingDirectory`

相关代码：
- `src/main/sqliteStore.ts`

## 4. 为什么没做迁移，但聊天记录还在

当前开发阶段，**应用内不做自动迁移**。

所以：

- `IDENTITY.md` / `SOUL.md` / `USER.md` 这类工作区文件已经开始落到 `~/jdiclaw/project`
- 聊天记录、历史任务、配置会从新的 JdiClawApp 数据目录读取
- 如果没有手工迁移旧数据，那么新目录会表现得像一份全新的本地环境
- 新的数据库位置是：

```text
~/Library/Application Support/JdiClawApp/jdiclaw.sqlite
```

补充说明：

- 旧目录默认不会被应用自动读取或复制
- 如果后续需要迁移旧 `LobsterAI` 本地数据，应通过**独立脚本**并在你明确许可下执行
- 迁移范围通常不只 SQLite，还包括 `logs/`、`SKILLs/`、`openclaw/`、`runtimes/` 等 `userData` 子目录

## 5. 为什么历史任务里还会看到旧路径

这是因为历史会话会保存**当时执行任务时的 cwd**。

也就是说：
- 新默认工作区已经是 `~/jdiclaw/project`
- 但旧会话如果当时是在 `~/lobsterai/project` 下跑的
- 那么历史记录里仍然会显示旧路径

这不表示默认目录没改，而是表示**历史会话保留了当时的执行上下文**。

相关代码：
- `src/renderer/types/cowork.ts`
- `src/main/libs/coworkRunner.ts`

## 6. 当前已经改了什么、还没改什么

### 已改

- 渲染层展示品牌名已逐步切换到 `JdiClaw`
- 默认工作区目录已切换到 `~/jdiclaw/project`
- 设置页 Agent 相关存储路径展示会指向新工作区
- 主进程运行时名称已切换到 `JdiClaw`
- 应用数据目录已切换到 `~/Library/Application Support/JdiClawApp`
- SQLite 文件名已切换到 `jdiclaw.sqlite`

### 未改

- 旧 `LobsterAI` 本地数据尚未迁移到 `JdiClaw`
- 独立迁移脚本尚未编写
- deep link、登录链路、服务端接口、更新链路暂未迁移
- 安装包身份、协议唤起、appId 等外部壳层身份暂未迁移

## 7. 相关文档

- 品牌改造主计划：`JdiClaw-execution-plan.md`
- 品牌改造统一待办：`JdiClaw-backlog.md`

## 8. 后续常见动作建议

如果后面要继续改造，通常按这个顺序判断：

1. 这是“展示层问题”还是“运行时身份问题”
2. 这是“工作区目录问题”还是“应用数据目录问题”
3. 这是“默认值问题”还是“历史数据迁移问题”

简单判断方法：

- 看到 `~/jdiclaw/project/...`
  - 多半是工作区文件
- 看到 `~/Library/Application Support/JdiClawApp/...`
  - 多半是应用数据目录
- 看到 `jdiclaw.sqlite`
  - 多半是 SQLite 本地数据
- 看到历史任务里是旧路径
  - 多半是旧会话保存的 `cwd`

## 9. Skills 市场当前接入逻辑

当前 JdiClaw / LobsterAI 的 skills 市场已经不再直接使用有道线上 `skill-store` 接口，而是切到自维护的 `/skill-store` 服务。

### 9.1 环境切换来源

skills 市场地址仍然遵循应用内统一的 `testMode` 开关，但只影响这一个模块自己的市场索引地址。

当前开关来源：

- `app_config.app.testMode`

相关代码：

- `src/renderer/services/config.ts`
- `src/renderer/config.ts`
- `src/renderer/services/endpoints.ts`

当前 skills 市场环境切换规则：

- `testMode = true`
  - `http://localhost:9111/skill-store`
- `testMode = false`
  - `http://jdi-skills-api.jd.com/skill-store`

说明：

- 这里只是 skills 市场索引地址按 test / prod 切换
- 其他业务接口是否走 test / prod，仍由各自 `endpoints.ts` 中的逻辑决定
- 原有有道 `skill-store` 地址已保留在代码注释中，便于后续回滚或对比排查

相关代码：

- `src/renderer/services/endpoints.ts`

### 9.2 为什么不再直接在渲染进程 fetch

最初 skills 市场请求是渲染进程直接：

```ts
fetch(getSkillStoreUrl())
```

当开发态页面来源是：

```text
http://localhost:5175
```

而 skills 市场接口来源是：

```text
http://localhost:9111
```

就会产生浏览器跨域限制。

为了绕开 CORS，当前 skills 市场请求已经改成通过 Electron 主进程代理：

- 渲染进程调用 `window.electron.api.fetch`
- 主进程使用 `session.defaultSession.fetch` 发起真实请求

这样请求不再受浏览器渲染进程的跨域限制。

相关代码：

- `src/renderer/services/skill.ts`
- `src/main/preload.ts`
- `src/main/main.ts`

### 9.3 ERP 请求头怎么带

skills 市场请求现在会主动携带：

```text
zerocode_erp
```

ERP 值读取优先级：

1. 先读渲染进程 Redux 中已经同步好的登录态 `auth.erp`
2. 如果当前界面还没同步到 ERP，则回退调用 `window.electron.auth.getState()`
3. 若仍无 ERP，则不带该请求头

这样做的原因：

- 正常登录后可以直接复用当前真实 ERP
- 应用刚启动、状态尚未同步时，市场请求仍能从主进程拿到真实 ERP
- 不需要用户手工传 `erp` query 参数

相关代码：

- `src/renderer/store/slices/authSlice.ts`
- `src/renderer/services/auth.ts`
- `src/renderer/services/skill.ts`

### 9.4 搜索技能到底怎么工作

当前技能管理页里的“搜索技能”不是实时向服务端搜索，而是“先加载，再本地过滤”。

具体分两类：

- 已安装页签：
  - 先从本地 IPC `window.electron.skills.list()` 读完整列表
  - 再在前端按名称和描述做本地过滤

- 技能市场页签：
  - 页面初始化时先请求一次 `/skill-store`
  - 将 `marketplace` 全量加载到前端内存
  - 后续搜索框只在 `marketplaceSkills` 上做本地过滤

所以当前行为不是“边输入边远程检索”，而是“本地筛选当前已经加载到页面的数据”。

相关代码：

- `src/renderer/components/skills/SkillsManager.tsx`

## 10. 当前待办

- [ ] 上线前重新梳理 skills 市场的测试开关逻辑，确认 `testMode=true` 时是否仍应固定指向 `localhost:9111/skill-store`，避免生产包或灰度环境残留本地测试地址。
