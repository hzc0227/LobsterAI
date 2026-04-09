import path from 'path';
import { expect, test } from 'vitest';

import { resolvePreferredUserDataPath } from './userDataPaths';

test('resolvePreferredUserDataPath returns the JdiClawApp app-data directory', () => {
  expect(resolvePreferredUserDataPath('/tmp/appdata')).toBe(path.join('/tmp/appdata', 'JdiClawApp'));
});
