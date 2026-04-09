import os from 'os';
import path from 'path';
import { expect, test } from 'vitest';

import { getDefaultWorkingDirectory } from './defaultPaths';

test('getDefaultWorkingDirectory returns the JdiClaw project directory in the user home', () => {
  expect(getDefaultWorkingDirectory()).toBe(path.join(os.homedir(), 'jdiclaw', 'project'));
});
