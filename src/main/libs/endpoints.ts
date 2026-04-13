import { app } from 'electron';

import {
  getServerApiBaseUrlForEnvironment,
  resolvePlatformEnvironment,
} from '../../shared/platform/endpoints';
import type { SqliteStore } from '../sqliteStore';

let cachedTestMode: boolean | null = null;

/**
 * Read testMode from store and cache it.
 * Call once at startup and again whenever app_config changes.
 */
export function refreshEndpointsTestMode(store: SqliteStore): void {
  const appConfig = store.get<any>('app_config');
  cachedTestMode = appConfig?.app?.testMode === true;
}

/**
 * Whether the app is in test mode.
 * Uses cached value after init; falls back to !app.isPackaged before init.
 */
const isTestMode = (): boolean => {
  return cachedTestMode ?? !app.isPackaged;
};

/**
 * Resolve the shared environment selector for main-process endpoint lookups.
 *
 * The main process owns its own packaged-vs-test bootstrap logic, but URL
 * ownership now lives in `src/shared/platform/endpoints.ts`. This helper keeps
 * the local test-mode policy explicit while delegating the actual URL table to
 * the shared configuration layer introduced in task one.
 *
 * @returns The shared environment enum corresponding to the current main-process mode.
 */
const resolveCurrentEnvironment = () => {
  return resolvePlatformEnvironment(isTestMode());
};

/**
 * Resolve the server API base URL from the shared endpoint module.
 *
 * Task one only abstracts configuration ownership and deliberately does not
 * replace the placeholder backend values yet. This wrapper therefore must stay
 * thin: it translates the main-process test-mode signal into the shared
 * environment enum and reads the URL from the centralized table.
 *
 * @returns The configured server API base URL for the current environment.
 */
export const getServerApiBaseUrl = (): string => {
  return getServerApiBaseUrlForEnvironment(resolveCurrentEnvironment());
};
