import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, expect, test } from 'vitest';

// 使用 CommonJS require，确保测试直接覆盖构建脚本会调用的那份实现，而不是测一份“相似但不同”的副本。
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { computePatchHash } = require('../../../scripts/hash-openclaw-patches.cjs');

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('computePatchHash: hashes patch file contents in sorted filename order', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openclaw-patches-'));
  tempDirs.push(tempDir);

  fs.writeFileSync(path.join(tempDir, 'b.patch'), 'second patch\n');
  fs.writeFileSync(path.join(tempDir, 'a.patch'), 'first patch\n');

  const expectedHash = crypto
    .createHash('sha256')
    .update('first patch\nsecond patch\n')
    .digest('hex');

  expect(computePatchHash(tempDir)).toBe(expectedHash);
});
