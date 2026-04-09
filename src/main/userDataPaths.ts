import path from 'path';

import { USER_DATA_DIR_NAME } from './appConstants';

/**
 * Resolve the userData directory for the current JdiClaw build.
 *
 * In the current development phase we intentionally do not include any
 * compatibility or migration behavior here. The app should point directly to
 * the new JdiClawApp directory, while any legacy LobsterAI data migration is
 * handled later by an explicit standalone script.
 */
export function resolvePreferredUserDataPath(appDataPath: string): string {
  return path.join(appDataPath, USER_DATA_DIR_NAME);
}
