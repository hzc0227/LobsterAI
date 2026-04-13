/**
 * Shared service endpoint configuration for both Electron processes.
 *
 * This stage only abstracts configuration ownership. The final JdiClaw service
 * domains are not ready yet, so the endpoint values below intentionally remain
 * as transitional placeholders. Once the real addresses are available, only
 * this file should change; main/renderer business logic must stay untouched.
 */

export const PlatformEnvironment = {
  Test: 'test',
  Production: 'production',
} as const;

export type PlatformEnvironment = typeof PlatformEnvironment[keyof typeof PlatformEnvironment];

const SERVER_API_BASE_URLS: Record<PlatformEnvironment, string> = {
  [PlatformEnvironment.Test]: 'https://lobsterai-server.inner.youdao.com',
  [PlatformEnvironment.Production]: 'https://lobsterai-server.youdao.com',
};

const UPDATE_CHECK_URLS: Record<PlatformEnvironment, string> = {
  [PlatformEnvironment.Test]: 'https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/test/update',
  [PlatformEnvironment.Production]: 'https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/prod/update',
};

const MANUAL_UPDATE_CHECK_URLS: Record<PlatformEnvironment, string> = {
  [PlatformEnvironment.Test]: 'https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/test/update-manual',
  [PlatformEnvironment.Production]: 'https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/prod/update-manual',
};

const FALLBACK_DOWNLOAD_URLS: Record<PlatformEnvironment, string> = {
  [PlatformEnvironment.Test]: 'https://lobsterai.inner.youdao.com/#/download-list',
  [PlatformEnvironment.Production]: 'https://lobsterai.youdao.com/#/download-list',
};

const SKILL_STORE_URLS: Record<PlatformEnvironment, string> = {
  [PlatformEnvironment.Test]: 'http://localhost:9111/skill-store',
  [PlatformEnvironment.Production]: 'http://jdi-skills-api.jd.com/skill-store',
};

const LOGIN_OVERMIND_URLS: Record<PlatformEnvironment, string> = {
  [PlatformEnvironment.Test]: 'https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/test/login-url',
  [PlatformEnvironment.Production]: 'https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/prod/login-url',
};

const MCP_MARKETPLACE_URLS: Record<PlatformEnvironment, string> = {
  [PlatformEnvironment.Test]: 'https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/test/mcp-marketplace',
  [PlatformEnvironment.Production]: 'https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/prod/mcp-marketplace',
};

const PORTAL_BASE_URLS: Record<PlatformEnvironment, string> = {
  [PlatformEnvironment.Test]: 'https://c.youdao.com/dict/hardware/cowork/lobsterai-portal.html#',
  [PlatformEnvironment.Production]: 'https://c.youdao.com/dict/hardware/octopus/lobsterai-portal.html#',
};

/**
 * Convert a local boolean "test mode" flag into the shared endpoint
 * environment enum.
 *
 * Main and renderer each decide test mode differently, but once that decision
 * is made they should both map into the same shared enum. This keeps all URL
 * selection logic centralized in one module instead of duplicating `if
 * (testMode)` branches throughout the app.
 *
 * @param isTestMode Whether the caller is currently running in test mode.
 * @returns The shared environment selector used by all endpoint helpers below.
 */
export const resolvePlatformEnvironment = (isTestMode: boolean): PlatformEnvironment => {
  return isTestMode ? PlatformEnvironment.Test : PlatformEnvironment.Production;
};

/**
 * Resolve a URL from the shared placeholder endpoint table.
 *
 * This helper exists so every exported endpoint method below stays as a thin,
 * well-documented mapping instead of manually indexing raw records in multiple
 * places. It also makes the "centralize first, fill real values later"
 * rollout intent explicit in one place.
 *
 * @param urls Environment-specific placeholder URLs.
 * @param environment Which shared environment should be used.
 * @returns The configured URL for that environment.
 */
const resolveEnvironmentUrl = (
  urls: Record<PlatformEnvironment, string>,
  environment: PlatformEnvironment,
): string => {
  return urls[environment];
};

/**
 * Resolve the server API base URL used by auth and proxy-related main-process
 * requests.
 *
 * The current values are transitional placeholders kept here intentionally.
 * Consumers must call this helper instead of embedding product URLs so that a
 * later domain swap only requires a single-file change.
 *
 * @param environment Shared environment selector.
 * @returns The configured server API base URL for that environment.
 */
export const getServerApiBaseUrlForEnvironment = (environment: PlatformEnvironment): string => {
  return resolveEnvironmentUrl(SERVER_API_BASE_URLS, environment);
};

/**
 * Resolve the automatic update metadata endpoint.
 *
 * Even though the rollout has not yet switched to final JdiClaw service
 * domains, update checks should already read from a single configuration
 * source. This prevents renderer services from carrying duplicated hardcoded
 * paths while the backend team prepares the final addresses.
 *
 * @param environment Shared environment selector.
 * @returns The automatic update endpoint URL.
 */
export const getUpdateCheckUrlForEnvironment = (environment: PlatformEnvironment): string => {
  return resolveEnvironmentUrl(UPDATE_CHECK_URLS, environment);
};

/**
 * Resolve the manual update check endpoint used by the Settings page.
 *
 * Manual and automatic update checks intentionally remain separate because the
 * backend may return different policies or logging paths. Centralizing both in
 * this module keeps that contract visible while still allowing the real values
 * to be replaced later in one edit.
 *
 * @param environment Shared environment selector.
 * @returns The manual update endpoint URL.
 */
export const getManualUpdateCheckUrlForEnvironment = (
  environment: PlatformEnvironment,
): string => {
  return resolveEnvironmentUrl(MANUAL_UPDATE_CHECK_URLS, environment);
};

/**
 * Resolve the fallback download page URL shown when no platform-specific
 * binary URL is returned by the update API.
 *
 * This remains a plain page-level fallback and therefore belongs in shared
 * configuration, not inside the update service implementation.
 *
 * @param environment Shared environment selector.
 * @returns The fallback download page URL.
 */
export const getFallbackDownloadUrlForEnvironment = (
  environment: PlatformEnvironment,
): string => {
  return resolveEnvironmentUrl(FALLBACK_DOWNLOAD_URLS, environment);
};

/**
 * Resolve the skills marketplace base URL.
 *
 * The production value currently points at the existing placeholder service,
 * because task one only establishes the abstraction boundary. Skill-related UI
 * and API calls must depend on this helper so the future domain cutover stays
 * localized to this file.
 *
 * @param environment Shared environment selector.
 * @returns The base URL for the skills marketplace service.
 */
export const getSkillStoreUrlForEnvironment = (environment: PlatformEnvironment): string => {
  return resolveEnvironmentUrl(SKILL_STORE_URLS, environment);
};

/**
 * Resolve the skills marketplace request-submission endpoint.
 *
 * The request API currently shares the same service root as the marketplace.
 * By deriving the path here, callers do not need to know whether the backend
 * remains co-located or gets split into a separate service in a later rollout
 * step.
 *
 * @param environment Shared environment selector.
 * @returns The full request submission endpoint URL.
 */
export const getSkillRequestSubmitUrlForEnvironment = (
  environment: PlatformEnvironment,
): string => {
  return `${getSkillStoreUrlForEnvironment(environment).replace(/\/+$/, '')}/requests`;
};

/**
 * Resolve the login bootstrap endpoint used to obtain the browser redirect URL.
 *
 * The application still uses the placeholder backend route at this stage, but
 * the lookup must already be centralized so the eventual JdiClaw auth service
 * cutover does not require touching login UI or IPC code.
 *
 * @param environment Shared environment selector.
 * @returns The login bootstrap endpoint URL.
 */
export const getLoginOvermindUrlForEnvironment = (
  environment: PlatformEnvironment,
): string => {
  return resolveEnvironmentUrl(LOGIN_OVERMIND_URLS, environment);
};

/**
 * Resolve the MCP marketplace endpoint consumed by the main process.
 *
 * This endpoint is not user-visible, but it still belongs in the shared table
 * because task one requires old service addresses to stop leaking across
 * `src/main` and `src/renderer`. Centralizing it here ensures the later
 * JdiClaw service swap can be completed without reopening `main.ts`.
 *
 * @param environment Shared environment selector.
 * @returns The MCP marketplace endpoint URL.
 */
export const getMcpMarketplaceUrlForEnvironment = (
  environment: PlatformEnvironment,
): string => {
  return resolveEnvironmentUrl(MCP_MARKETPLACE_URLS, environment);
};

/**
 * Resolve the current portal base URL.
 *
 * Pricing/profile links are built from the same portal root. Keeping that root
 * in shared configuration prevents renderer components from drifting onto
 * different domains or route conventions during the staged rollout.
 *
 * @param environment Shared environment selector.
 * @returns The base portal hash URL for the selected environment.
 */
export const getPortalBaseUrlForEnvironment = (
  environment: PlatformEnvironment,
): string => {
  return resolveEnvironmentUrl(PORTAL_BASE_URLS, environment);
};

/**
 * Resolve the portal pricing page URL from the shared portal base.
 *
 * @param environment Shared environment selector.
 * @returns The full pricing page URL.
 */
export const getPortalPricingUrlForEnvironment = (
  environment: PlatformEnvironment,
): string => {
  return `${getPortalBaseUrlForEnvironment(environment)}/pricing`;
};

/**
 * Resolve the portal profile page URL from the shared portal base.
 *
 * @param environment Shared environment selector.
 * @returns The full profile page URL.
 */
export const getPortalProfileUrlForEnvironment = (
  environment: PlatformEnvironment,
): string => {
  return `${getPortalBaseUrlForEnvironment(environment)}/profile`;
};
