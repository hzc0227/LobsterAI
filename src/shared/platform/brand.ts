/**
 * Shared brand configuration for both Electron processes.
 *
 * Current rollout stage only centralizes the configuration surface.
 * Real JdiClaw production links are not ready yet, so some outward-facing
 * URLs and export markers intentionally continue to use the legacy placeholder
 * values. Later rollout tasks will update these values in this single module
 * without touching UI components or service call sites again.
 */

export const APP_NAME = 'JdiClaw';
export const APP_ID = 'lobsterai';
export const USER_DATA_DIR_NAME = 'JdiClawApp';
export const DB_FILENAME = 'jdiclaw.sqlite';
export const EXPORT_FORMAT_TYPE = 'lobsterai.providers';
export const EXPORT_PASSWORD = 'lobsterai-APP';
export const BRAND_CONTACT_EMAIL = 'lobsterai.project@rd.netease.com';
export const BRAND_USER_COMMUNITY = '10227855752';

export const BrandLink = {
  UserManual: 'userManual',
  ServiceTerms: 'serviceTerms',
} as const;

export type BrandLink = typeof BrandLink[keyof typeof BrandLink];

const BRAND_LINK_URLS: Record<BrandLink, string> = {
  [BrandLink.UserManual]: 'https://joyspace.jd.com/h/personal/pages/tUGZC42TEC79IIcvqkSA',
  [BrandLink.ServiceTerms]: 'https://c.youdao.com/dict/hardware/lobsterai/lobsterai_service.html',
};

/**
 * Resolve a user-visible brand resource URL from the shared configuration.
 *
 * The renderer should always call this helper instead of hardcoding manual,
 * community, or terms links inside components. During the hard-cut rollout we
 * keep the current placeholder URLs here so the rest of the codebase can
 * already converge on a single source of truth before the final service
 * addresses are provided.
 *
 * @param link Which brand resource the caller wants to open.
 * @returns The configured URL for that resource in the current rollout stage.
 */
export const getBrandLinkUrl = (link: BrandLink): string => {
  return BRAND_LINK_URLS[link];
};
