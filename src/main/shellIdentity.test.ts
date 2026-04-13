import fs from 'fs';
import path from 'path';

import { afterEach, describe, expect, test } from 'vitest';

import { getLanguage, setLanguage, t } from './i18n';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const PACKAGE_JSON_PATH = path.join(REPO_ROOT, 'package.json');
const ELECTRON_BUILDER_CONFIG_PATH = path.join(REPO_ROOT, 'electron-builder.json');
const MAIN_SOURCE_PATH = path.join(REPO_ROOT, 'src', 'main', 'main.ts');
const LOGGER_SOURCE_PATH = path.join(REPO_ROOT, 'src', 'main', 'logger.ts');
const LEGACY_SCHEME_PREFIX = `lobsterai${'://'}`;
const LEGACY_STARTUP_BANNER = `LobsterAI${' started'}`;

type PackageJson = {
  author?: {
    name?: string;
    email?: string;
  };
};

type ElectronBuilderConfig = {
  appId?: string;
  productName?: string;
  executableName?: string;
  protocols?: Array<{
    name?: string;
    schemes?: string[];
  }>;
  mac?: {
    extendInfo?: Record<string, string>;
  };
  linux?: {
    desktop?: Record<string, string>;
  };
};

/**
 * 直接从仓库根目录读取 JSON 配置，确保任务二要求的壳层身份不会只改运行时代码，
 * 却遗漏打包元数据。这里不通过 import JSON，而是显式解析文件内容，避免测试运行器
 * 配置差异影响断言结果。
 */
function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

/**
 * 读取主进程源码文本，专门用于校验 deep link 方案已经硬切到 `jdiclaw://`，
 * 同时确认不再残留旧品牌 scheme fallback。任务二要求的是壳层协议身份，
 * 因此这里直接对源码做守门，比只测某个局部 helper 更能覆盖遗漏改动。
 */
function readSourceFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

afterEach(() => {
  setLanguage('zh');
});

describe('JdiClaw shell identity', () => {
  test('package metadata uses JdiClaw author identity', () => {
    const packageJson = readJsonFile<PackageJson>(PACKAGE_JSON_PATH);

    expect(packageJson.author?.name).toBe('JdiClaw');
    expect(packageJson.author?.email).toBe('jdiclaw.project@rd.netease.com');
  });

  test('electron builder registers the JdiClaw application shell identity', () => {
    const config = readJsonFile<ElectronBuilderConfig>(ELECTRON_BUILDER_CONFIG_PATH);

    expect(config.appId).toBe('com.jdiclaw.app');
    expect(config.productName).toBe('JdiClaw');
    expect(config.executableName).toBe('JdiClaw');
    expect(config.protocols?.[0]).toEqual({
      name: 'JdiClaw',
      schemes: ['jdiclaw'],
    });
    expect(config.mac?.extendInfo?.NSCalendarsUsageDescription).toContain('JdiClaw');
    expect(config.mac?.extendInfo?.NSRemindersUsageDescription).toContain('JdiClaw');
    expect(config.mac?.extendInfo?.NSAppleEventsUsageDescription).toContain('JdiClaw');
    expect(config.linux?.desktop?.Name).toBe('JdiClaw');
  });

  test('tray translations expose JdiClaw instead of LobsterAI', () => {
    expect(getLanguage()).toBe('zh');

    expect(t('trayShowWindow')).toBe('打开 JdiClaw');

    setLanguage('en');
    expect(t('trayShowWindow')).toBe('Open JdiClaw');
  });

  test('main process deep link handling keeps only the jdiclaw scheme', () => {
    const mainSource = readSourceFile(MAIN_SOURCE_PATH);

    expect(mainSource).not.toContain(LEGACY_SCHEME_PREFIX);
    expect(mainSource).not.toContain("setAsDefaultProtocolClient('lobsterai')");
    expect(mainSource.includes('jdiclaw://') || mainSource.includes('APP_PROTOCOL_SCHEME')).toBe(true);
  });

  test('logger startup title uses JdiClaw branding', () => {
    const loggerSource = readSourceFile(LOGGER_SOURCE_PATH);

    expect(
      loggerSource.includes('JdiClaw started')
      || loggerSource.includes('${APP_NAME} started'),
    ).toBe(true);
    expect(loggerSource).not.toContain(LEGACY_STARTUP_BANNER);
  });
});
