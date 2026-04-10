# 技能市场表结构说明

本文档对应 [skill-market-schema.sql](/Users/hanzhichao7/Documents/code/JoyClaw/LobsterAI/docs/skill-market/skill-market-schema.sql)，用于支撑“一期兼容现有客户端”的技能市场建设。

## 设计目标

- 兼容当前客户端的 `/skill-store` 拉取逻辑。
- 保持本地安装、升级、启停、安全扫描逻辑不变。
- 不使用外键，统一采用逻辑关联。
- 支持后续按 ERP 组织过滤技能可见范围。
- 预留后续审核、发布、后台管理能力。

## 关键兼容约束

- `skill_code` 必须与客户端本地技能目录名一致。
- `version_no` 必须与压缩包内 `SKILL.md` 的 `version` 一致。
- `package_url` 必须是客户端可直接下载的 zip 地址。
- `source_vendor` 默认值统一为 `JdiClaw`。

当前客户端依赖点可参考：

- [skill.ts](/Users/hanzhichao7/Documents/code/JoyClaw/LobsterAI/src/renderer/services/skill.ts#L227)
- [skill.ts](/Users/hanzhichao7/Documents/code/JoyClaw/LobsterAI/src/renderer/types/skill.ts#L30)
- [skillManager.ts](/Users/hanzhichao7/Documents/code/JoyClaw/LobsterAI/src/main/skillManager.ts#L1080)

## 表职责

### `skill_market_skill`

技能主表，存储技能主档、来源、类型、发布状态、排序信息。

### `skill_market_skill_i18n`

技能多语言表，存储中英文技能名称和描述，用于组装 `/skill-store` 中的 `name` 和 `description`。

### `skill_market_tag`

标签主表，存储标签编码和状态信息。

### `skill_market_tag_i18n`

标签多语言表，存储中英文标签名称，用于 `/skill-store` 中的 `marketTags`。

### `skill_market_skill_tag_rel`

技能和标签的关系表，用于输出技能的 `tags` 数组。

### `skill_market_skill_release`

技能版本发布表，存储每个技能版本的 zip 下载地址、校验值、发布时间和发布状态。

### `skill_market_skill_scope_rule`

技能可见范围规则表，用于控制哪些 ERP 或哪些范围可以看到某个技能。

## `/skill-store` 字段映射

### `marketplace`

- `id` <- `skill_market_skill.skill_code`
- `name` <- `skill_market_skill_i18n.skill_name_i18n`
- `description` <- `skill_market_skill_i18n.description_text`
- `tags` <- `skill_market_skill_tag_rel.tag_code`
- `url` <- `skill_market_skill_release.package_url`
- `version` <- `skill_market_skill_release.version_no`
- `source.from` <- `skill_market_skill.source_vendor`
- `source.url` <- `skill_market_skill.source_url`
- `source.author` <- `skill_market_skill.source_author`

### `marketTags`

- `id` <- `skill_market_tag.tag_code`
- `zh` <- `skill_market_tag_i18n.tag_name_i18n` where `language_code = 'zh'`
- `en` <- `skill_market_tag_i18n.tag_name_i18n` where `language_code = 'en'`

### `localSkill`

一期可以复用已发布技能的简化信息，只输出：

- `id`
- `name`
- `description`
- `version`

## ERP 过滤建议

如果后续 `/skill-store` 新增入参，例如：

```http
GET /skill-store?erpOrgCode=ERP001
```

建议服务端按以下规则过滤：

- 如果技能没有任何范围规则，则默认全员可见。
- 如果命中 `scope_type = 'all'` 的启用规则，则可见。
- 如果命中 `scope_type = 'erp_org'` 且 `scope_code = erpOrgCode` 的启用规则，则可见。
- 如果同时命中 `allow` 和 `deny`，建议 `deny` 优先。

一期建议只启用两类范围：

- `all`
- `erp_org`

其余范围类型先保留，不急着在接口层启用。

## 索引设计原则

- 主表按 `publish_status + sort_no` 建索引，支持市场列表查询。
- 版本表按 `skill_code + is_current + release_status` 建索引，支持快速查询当前生效版本。
- 关系表按 `skill_code` 和 `tag_code` 建索引，支持标签聚合和反查。
- 范围规则表按 `scope_type + scope_code + rule_status` 建索引，支持 ERP 过滤。

## 不建表的内容

当前不建议新增以下表：

- 用户安装记录表
- 用户启停状态表

原因是当前客户端的安装态、启用态都由本地文件系统和本地 SQLite 决定，服务端不是权威来源。
