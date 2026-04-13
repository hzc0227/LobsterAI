import fs from 'fs';
import path from 'path';
import { describe, expect, test } from 'vitest';

const REPO_ROOT = path.resolve(__dirname, '..', '..');

/**
 * 任务 5 要求页面、分享图、托盘和安装包图标统一走同一套品牌资源入口。
 * 这里直接守住源码引用，避免界面层继续回退到历史 `logo.png` 兼容路径。
 */
function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(REPO_ROOT, relativePath), 'utf8');
}

describe('hard-cut rollout task 5 asset guards', () => {
  test('renderer brand surfaces stop referencing legacy logo.png directly', () => {
    const settingsSource = readRepoFile('src/renderer/components/Settings.tsx');
    const coworkViewSource = readRepoFile('src/renderer/components/cowork/CoworkView.tsx');
    const sessionDetailSource = readRepoFile('src/renderer/components/cowork/CoworkSessionDetail.tsx');

    expect(settingsSource).not.toContain('logo.png');
    expect(coworkViewSource).not.toContain('logo.png');
    expect(sessionDetailSource).not.toContain('logo.png');
  });

  test('icon generation scripts use the dedicated JdiClaw brand asset path', () => {
    const trayScript = readRepoFile('scripts/generate-tray-icons.js');
    const appIconScript = readRepoFile('scripts/generate-app-icon.js');

    expect(trayScript).toContain('jdiclaw-logo');
    expect(trayScript).not.toContain("public/logo.png");
    expect(appIconScript).toContain('jdiclaw-logo');
    expect(appIconScript).not.toContain("public', 'logo.png");
  });
});
