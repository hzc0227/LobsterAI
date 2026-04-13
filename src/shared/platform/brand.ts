/**
 * Shared brand configuration for both Electron processes.
 *
 * The hard-cut rollout splits brand data into two groups:
 * 1. Shell identity values that must switch immediately, such as the visible
 *    product name, bundle identifier, custom protocol scheme, and author info.
 * 2. Business-facing placeholders that still wait for the final service-side
 *    values, such as manual/terms links and legacy export markers.
 *
 * By keeping both groups in one module, main/renderer code can already depend
 * on a single source of truth. Later rollout tasks only need to update this
 * module instead of touching scattered UI components and services again.
 */

export const APP_NAME = 'JdiClaw';
export const APP_BUNDLE_ID = 'com.jdiclaw.app';
export const APP_PROTOCOL_SCHEME = 'jdiclaw';
export const APP_PROTOCOL_PREFIX = `${APP_PROTOCOL_SCHEME}://`;
export const APP_ID = 'lobsterai';
export const USER_DATA_DIR_NAME = 'JdiClawApp';
export const DB_FILENAME = 'jdiclaw.sqlite';
export const EXPORT_FORMAT_TYPE = 'lobsterai.providers';
export const EXPORT_PASSWORD = 'lobsterai-APP';
export const BRAND_AUTHOR_NAME = 'JdiClaw';
export const BRAND_CONTACT_EMAIL = 'jdiclaw.project@rd.netease.com';
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
