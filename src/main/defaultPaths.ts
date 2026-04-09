import os from 'os';
import path from 'path';

/**
 * Return the default workspace directory for local development and new profiles.
 *
 * We intentionally keep this path construction in one shared helper so the
 * Cowork default configuration and the main-process bootstrap logic always use
 * the exact same directory.  That prevents one side from creating
 * `~/lobsterai/project` while the other side reads `~/jdiclaw/project`.
 */
export function getDefaultWorkingDirectory(): string {
  return path.join(os.homedir(), 'jdiclaw', 'project');
}
