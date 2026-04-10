// Skill type definition
export interface Skill {
  id: string;
  name: string;
  description: string;
  enabled: boolean;       // Whether visible in popover
  isOfficial: boolean;    // "官方" badge
  isBuiltIn: boolean;     // Bundled with app, cannot be deleted
  updatedAt: number;      // Timestamp
  prompt: string;         // System prompt content
  skillPath: string;      // Absolute path to SKILL.md
  version?: string;       // Skill version from SKILL.md frontmatter
}

export type LocalizedText = { en: string; zh: string };

export interface MarketTag {
  id: string;
  en: string;
  zh: string;
}

export interface LocalSkillInfo {
  id: string;
  name: string;
  description: string | LocalizedText;
  version: string;
}

export interface MarketplaceSkill {
  id: string;
  name: string;
  description: string | LocalizedText;
  tags?: string[];
  url: string;              // Download URL (.zip)
  version: string;
  source: {
    from: string;           // e.g. "Github"
    url: string;            // Source repo URL
    author?: string;        // Author name
  };
}

/**
 * 技能安全扫描中的单条命中结果。
 *
 * 该结构来自主进程扫描结果，会同时被服务层返回值、技能页状态和安全报告弹窗复用。
 */
export interface SkillSecurityFinding {
  dimension: string;
  severity: string;
  ruleId: string;
  file: string;
  line?: number;
  matchedPattern: string;
  description: string;
}

/**
 * 技能安全扫描报告。
 *
 * 这里保持为“展示层真正会用到的最小字段集”，
 * 既够页面展示，也避免在多个组件里重复手写同一份接口。
 */
export interface SkillSecurityReport {
  skillName: string;
  riskLevel: string;
  riskScore: number;
  findings: SkillSecurityFinding[];
  dimensionSummary: Record<string, { count: number; maxSeverity: string }>;
  scanDurationMs: number;
}

/**
 * 技能诉求输入的最大字符数。
 *
 * 这个限制会同时被 service 校验和界面计数器复用，避免“前端允许输入但提交被拒绝”的不一致。
 */
export const SkillRequestMaxLength = 500;

/**
 * 提交技能诉求时渲染层需要提供的最小输入。
 *
 * 当前产品只要求上送用户原始描述文本，ERP 在 service 层根据登录态自动补齐，
 * 这样调用方不需要自己关心身份字段。
 */
export interface SubmitSkillRequestInput {
  content: string;
}

/**
 * 技能市场登录检查结果。
 *
 * `loginTriggered=true` 表示当前已经拉起现有 ERP 登录流程，
 * 页面此时不应继续发市场或诉求请求，而是等待登录完成后重试。
 */
export interface SkillMarketplaceLoginResult {
  isLoggedIn: boolean;
  erp: string | null;
  loginTriggered: boolean;
}

/**
 * 技能诉求提交结果。
 *
 * `requiresLogin=true` 用来告诉调用方：本次没有真正发请求，而是已经转去登录链路。
 */
export interface SubmitSkillRequestResult {
  success: boolean;
  requiresLogin?: boolean;
  error?: string;
}
