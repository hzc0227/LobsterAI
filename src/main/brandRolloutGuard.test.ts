import fs from 'fs';
import path from 'path';
import { describe, expect, test } from 'vitest';

const REPO_ROOT = path.resolve(__dirname, '..', '..');

/**
 * 直接读取源码文本做 rollout 守门，而不是仅依赖运行时断言。
 *
 * 任务 4 的目标是消除运行时品牌注入与隐性身份泄漏，这类问题往往表现为
 * system prompt 前缀、插件描述、User-Agent、临时目录名等“文本常量”。
 * 这些常量如果残留旧品牌，编译仍然会通过，因此这里用源码级守门避免回归。
 */
function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(REPO_ROOT, relativePath), 'utf8');
}

describe('hard-cut rollout task 4 brand guards', () => {
  test('openclaw memory bootstrap identity no longer injects LobsterAI', () => {
    const source = readRepoFile('src/main/libs/openclawMemoryFile.ts');

    expect(source.includes('APP_NAME') || source.includes('JdiClaw')).toBe(true);
    expect(source).not.toContain('你的名字是 LobsterAI');
    expect(source).not.toContain('Your name is LobsterAI');
  });

  test('openclaw runtime adapter uses JdiClaw prompt markers and gateway client name', () => {
    const source = readRepoFile('src/main/libs/agentEngine/openclawRuntimeAdapter.ts');

    expect(source).toContain('JdiClaw');
    expect(source).not.toContain('[LobsterAI system instructions]');
    expect(source).not.toContain('If earlier LobsterAI system instructions exist');
    expect(source).not.toContain('[Context bridge from previous LobsterAI conversation]');
    expect(source).not.toContain("clientDisplayName: 'LobsterAI'");
  });

  test('skill downloader and updater temp artifacts use jdiclaw prefixes', () => {
    const skillManagerSource = readRepoFile('src/main/skillManager.ts');
    const updaterSource = readRepoFile('src/main/libs/appUpdateInstaller.ts');

    expect(skillManagerSource).not.toContain('LobsterAI Skill Downloader');
    expect(skillManagerSource).not.toContain('lobsterai-skill-');
    expect(updaterSource).not.toContain('lobsterai-update-');
  });

  test('desktop-facing extension descriptions no longer expose LobsterAI branding', () => {
    const askUserSource = readRepoFile('openclaw-extensions/ask-user-question/index.ts');
    const askUserManifest = readRepoFile('openclaw-extensions/ask-user-question/openclaw.plugin.json');
    const mcpBridgeSource = readRepoFile('openclaw-extensions/mcp-bridge/index.ts');
    const mcpBridgeManifest = readRepoFile('openclaw-extensions/mcp-bridge/openclaw.plugin.json');

    expect(askUserSource).not.toContain('LobsterAI desktop');
    expect(askUserSource).not.toContain('agent:main:lobsterai:');
    expect(askUserManifest).not.toContain('LobsterAI');
    expect(mcpBridgeSource).not.toContain('LobsterAI-managed');
    expect(mcpBridgeManifest).not.toContain('LobsterAI-managed');
  });

  test('github copilot auth no longer sends LobsterAI as user agent', () => {
    const source = readRepoFile('src/main/libs/githubCopilotAuth.ts');

    expect(source).not.toContain("'User-Agent': 'LobsterAI'");
  });
});
