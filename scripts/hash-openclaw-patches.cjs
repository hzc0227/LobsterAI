#!/usr/bin/env node

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

/**
 * 读取补丁目录内所有 .patch 文件，按文件名排序后拼接内容并计算 SHA-256。
 * 这里直接使用 Node 内置 crypto，避免构建脚本依赖 GNU coreutils，保证 macOS/Linux 行为一致。
 */
function computePatchHash(patchesDir) {
  if (!patchesDir || !fs.existsSync(patchesDir) || !fs.statSync(patchesDir).isDirectory()) {
    return '';
  }

  const patchFiles = fs
    .readdirSync(patchesDir)
    .filter((fileName) => fileName.endsWith('.patch'))
    .sort((left, right) => left.localeCompare(right));

  if (patchFiles.length === 0) {
    return '';
  }

  const hash = crypto.createHash('sha256');

  for (const patchFile of patchFiles) {
    hash.update(fs.readFileSync(path.join(patchesDir, patchFile)));
  }

  return hash.digest('hex');
}

if (require.main === module) {
  const patchesDir = process.argv[2];
  process.stdout.write(computePatchHash(patchesDir));
}

module.exports = {
  computePatchHash,
};
