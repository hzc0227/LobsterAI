-- 技能市场表结构（一期兼容现有客户端）
-- 设计约束：
-- 1. 不使用外键，统一采用逻辑关联。
-- 2. skill_code 必须与客户端本地技能目录名一致。
-- 3. version_no 必须与压缩包内 SKILL.md 的 version 一致。
-- 4. package_url 必须为客户端可直接下载的 zip 地址，建议路径名以 .zip 结尾。
-- 5. source_vendor 默认值统一为 JdiClaw。

SET @sharding = 'skill_market_skill singleShard';
CREATE TABLE `skill_market_skill` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `skill_code` VARCHAR(64) NOT NULL COMMENT '技能唯一编码，必须与客户端本地技能目录名一致，例如 docx、web-search',
  `skill_name` VARCHAR(128) NOT NULL COMMENT '技能默认名称，作为无多语言数据时的兜底展示名称',
  `skill_type` TINYINT NOT NULL DEFAULT 1 COMMENT '技能类型：1-通用技能，2-业务技能，3-系统内置技能元数据',
  `source_vendor` VARCHAR(64) NOT NULL DEFAULT 'JdiClaw' COMMENT '来源展示名称，例如 JdiClaw、GitHub、业务平台',
  `source_url` VARCHAR(512) NOT NULL DEFAULT '' COMMENT '源码仓库地址或技能介绍页地址，仅用于前端展示',
  `source_author` VARCHAR(128) NOT NULL DEFAULT '' COMMENT '作者、维护团队或发布方名称',
  `publish_status` TINYINT NOT NULL DEFAULT 1 COMMENT '发布状态：0-草稿，1-已发布，2-已下线，9-已删除',
  `is_builtin_meta` TINYINT NOT NULL DEFAULT 0 COMMENT '是否系统内置技能元数据：0-否，1-是；仅用于市场展示，不影响客户端本地 built-in 判定',
  `sort_no` INT NOT NULL DEFAULT 999 COMMENT '排序号，越小越靠前',
  `remark` VARCHAR(500) NOT NULL DEFAULT '' COMMENT '备注说明',
  `ext_json` JSON DEFAULT NULL COMMENT '扩展配置JSON，预留后台化能力',
  `created_by` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '创建人',
  `updated_by` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '更新人',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_skill_code` (`skill_code`),
  KEY `idx_publish_status_sort` (`publish_status`, `sort_no`, `id`),
  KEY `idx_skill_type_publish` (`skill_type`, `publish_status`, `id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能市场-技能主表';

SET @sharding = 'skill_market_skill_i18n singleShard';
CREATE TABLE `skill_market_skill_i18n` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `skill_code` VARCHAR(64) NOT NULL COMMENT '技能编码，逻辑关联 skill_market_skill.skill_code',
  `language_code` VARCHAR(16) NOT NULL COMMENT '语言编码，例如 zh、en',
  `skill_name_i18n` VARCHAR(128) NOT NULL COMMENT '本地化技能名称',
  `description_text` TEXT NOT NULL COMMENT '本地化技能描述',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_skill_code_language_code` (`skill_code`, `language_code`),
  KEY `idx_skill_code` (`skill_code`),
  KEY `idx_language_code` (`language_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能市场-技能多语言表';

SET @sharding = 'skill_market_tag singleShard';
CREATE TABLE `skill_market_tag` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `tag_code` VARCHAR(64) NOT NULL COMMENT '标签唯一编码，例如 office、builtin、business',
  `publish_status` TINYINT NOT NULL DEFAULT 1 COMMENT '发布状态：0-草稿，1-已发布，2-已下线，9-已删除',
  `sort_no` INT NOT NULL DEFAULT 999 COMMENT '排序号，越小越靠前',
  `created_by` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '创建人',
  `updated_by` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '更新人',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_tag_code` (`tag_code`),
  KEY `idx_tag_publish_sort` (`publish_status`, `sort_no`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能市场-标签主表';

SET @sharding = 'skill_market_tag_i18n singleShard';
CREATE TABLE `skill_market_tag_i18n` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `tag_code` VARCHAR(64) NOT NULL COMMENT '标签编码，逻辑关联 skill_market_tag.tag_code',
  `language_code` VARCHAR(16) NOT NULL COMMENT '语言编码，例如 zh、en',
  `tag_name_i18n` VARCHAR(64) NOT NULL COMMENT '本地化标签名称',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_tag_code_language_code` (`tag_code`, `language_code`),
  KEY `idx_tag_code` (`tag_code`),
  KEY `idx_language_code` (`language_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能市场-标签多语言表';

SET @sharding = 'skill_market_skill_tag_rel singleShard';
CREATE TABLE `skill_market_skill_tag_rel` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `skill_code` VARCHAR(64) NOT NULL COMMENT '技能编码',
  `tag_code` VARCHAR(64) NOT NULL COMMENT '标签编码',
  `sort_no` INT NOT NULL DEFAULT 999 COMMENT '技能在当前标签下的排序号',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_skill_code_tag_code` (`skill_code`, `tag_code`),
  KEY `idx_skill_code` (`skill_code`),
  KEY `idx_tag_code_skill_code` (`tag_code`, `skill_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能市场-技能标签关系表';

SET @sharding = 'skill_market_skill_release singleShard';
CREATE TABLE `skill_market_skill_release` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `skill_code` VARCHAR(64) NOT NULL COMMENT '技能编码，逻辑关联 skill_market_skill.skill_code',
  `version_no` VARCHAR(64) NOT NULL COMMENT '版本号，必须与压缩包内 SKILL.md 的 version 一致',
  `package_url` VARCHAR(1024) NOT NULL COMMENT '技能安装包下载地址，必须为客户端可直接下载的 zip 地址',
  `package_file_name` VARCHAR(256) NOT NULL DEFAULT '' COMMENT '安装包文件名，例如 docx-1.2.0.zip',
  `package_sha256` CHAR(64) NOT NULL DEFAULT '' COMMENT '安装包 SHA256 校验值',
  `package_size` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '安装包大小，单位字节',
  `storage_path` VARCHAR(512) NOT NULL DEFAULT '' COMMENT '对象存储内部路径或制品路径，便于后台运维排查',
  `source_commit` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '源码提交版本、构建流水号或构建来源标识',
  `changelog_text` TEXT COMMENT '版本变更说明',
  `audit_status` TINYINT NOT NULL DEFAULT 1 COMMENT '审核状态：0-待审核，1-审核通过，2-审核驳回',
  `release_status` TINYINT NOT NULL DEFAULT 1 COMMENT '版本状态：0-草稿，1-已发布，2-已下线，3-已废弃',
  `is_current` TINYINT NOT NULL DEFAULT 0 COMMENT '是否当前生效版本：0-否，1-是；同一技能同一时刻仅允许一个当前版本',
  `reviewed_by` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '审核人',
  `reviewed_at` DATETIME(3) DEFAULT NULL COMMENT '审核时间',
  `published_by` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '发布人',
  `published_at` DATETIME(3) DEFAULT NULL COMMENT '发布时间',
  `created_by` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '创建人',
  `updated_by` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '更新人',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_skill_code_version_no` (`skill_code`, `version_no`),
  KEY `idx_skill_code_current_release` (`skill_code`, `is_current`, `release_status`),
  KEY `idx_release_status_published_at` (`release_status`, `published_at`, `id`),
  KEY `idx_audit_status` (`audit_status`, `id`),
  KEY `idx_skill_code_release_status` (`skill_code`, `release_status`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能市场-技能版本发布表';

SET @sharding = 'skill_market_skill_scope_rule singleShard';
CREATE TABLE `skill_market_skill_scope_rule` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `skill_code` VARCHAR(64) NOT NULL COMMENT '技能编码，逻辑关联 skill_market_skill.skill_code',
  `scope_type` VARCHAR(32) NOT NULL COMMENT '范围类型：all-全员，erp_org-ERP组织，erp_dept-ERP部门，erp_user-ERP用户，tenant-租户',
  `scope_code` VARCHAR(128) NOT NULL DEFAULT '' COMMENT '范围编码，例如 ERP组织编码、ERP部门编码、ERP用户编码；当 scope_type=all 时可为空字符串',
  `effect_type` VARCHAR(16) NOT NULL DEFAULT 'allow' COMMENT '规则效果：allow-允许，deny-拒绝',
  `priority_no` INT NOT NULL DEFAULT 100 COMMENT '优先级，数值越小优先级越高',
  `rule_status` TINYINT NOT NULL DEFAULT 1 COMMENT '规则状态：0-禁用，1-启用',
  `start_at` DATETIME(3) DEFAULT NULL COMMENT '规则生效开始时间，为空表示立即生效',
  `end_at` DATETIME(3) DEFAULT NULL COMMENT '规则生效结束时间，为空表示长期有效',
  `remark` VARCHAR(500) NOT NULL DEFAULT '' COMMENT '备注说明',
  `created_by` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '创建人',
  `updated_by` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '更新人',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_skill_code_rule_status` (`skill_code`, `rule_status`, `id`),
  KEY `idx_scope_query` (`scope_type`, `scope_code`, `rule_status`, `id`),
  KEY `idx_scope_effect_priority` (`scope_type`, `scope_code`, `effect_type`, `priority_no`, `id`),
  KEY `idx_time_window` (`start_at`, `end_at`),
  KEY `idx_skill_code_scope_type` (`skill_code`, `scope_type`, `rule_status`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能市场-技能可见范围规则表';
