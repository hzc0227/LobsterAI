import { describe, expect, test } from 'vitest';

import * as platform from './index';

describe('shared platform endpoint exports', () => {
  test('resolves placeholder service endpoints from a single shared module', () => {
    const exports = platform as unknown as Record<string, unknown>;

    expect(exports.PlatformEnvironment).toBeDefined();
    expect(exports.getServerApiBaseUrlForEnvironment).toBeTypeOf('function');
    expect(exports.getUpdateCheckUrlForEnvironment).toBeTypeOf('function');
    expect(exports.getManualUpdateCheckUrlForEnvironment).toBeTypeOf('function');
    expect(exports.getFallbackDownloadUrlForEnvironment).toBeTypeOf('function');
    expect(exports.getSkillStoreUrlForEnvironment).toBeTypeOf('function');
    expect(exports.getSkillRequestSubmitUrlForEnvironment).toBeTypeOf('function');
    expect(exports.getLoginOvermindUrlForEnvironment).toBeTypeOf('function');
    expect(exports.getMcpMarketplaceUrlForEnvironment).toBeTypeOf('function');
    expect(exports.getPortalPricingUrlForEnvironment).toBeTypeOf('function');
    expect(exports.getPortalProfileUrlForEnvironment).toBeTypeOf('function');

    const environment = exports.PlatformEnvironment as Record<string, string>;
    const getServerApiBaseUrlForEnvironment = exports.getServerApiBaseUrlForEnvironment as (value: string) => string;
    const getUpdateCheckUrlForEnvironment = exports.getUpdateCheckUrlForEnvironment as (value: string) => string;
    const getManualUpdateCheckUrlForEnvironment = exports.getManualUpdateCheckUrlForEnvironment as (value: string) => string;
    const getFallbackDownloadUrlForEnvironment = exports.getFallbackDownloadUrlForEnvironment as (value: string) => string;
    const getSkillStoreUrlForEnvironment = exports.getSkillStoreUrlForEnvironment as (value: string) => string;
    const getSkillRequestSubmitUrlForEnvironment = exports.getSkillRequestSubmitUrlForEnvironment as (value: string) => string;
    const getLoginOvermindUrlForEnvironment = exports.getLoginOvermindUrlForEnvironment as (value: string) => string;
    const getMcpMarketplaceUrlForEnvironment = exports.getMcpMarketplaceUrlForEnvironment as (value: string) => string;
    const getPortalPricingUrlForEnvironment = exports.getPortalPricingUrlForEnvironment as (value: string) => string;
    const getPortalProfileUrlForEnvironment = exports.getPortalProfileUrlForEnvironment as (value: string) => string;

    expect(getServerApiBaseUrlForEnvironment(environment.Test)).toBe('https://lobsterai-server.inner.youdao.com');
    expect(getServerApiBaseUrlForEnvironment(environment.Production)).toBe('https://lobsterai-server.youdao.com');

    expect(getUpdateCheckUrlForEnvironment(environment.Test)).toBe('https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/test/update');
    expect(getUpdateCheckUrlForEnvironment(environment.Production)).toBe('https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/prod/update');

    expect(getManualUpdateCheckUrlForEnvironment(environment.Test)).toBe('https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/test/update-manual');
    expect(getManualUpdateCheckUrlForEnvironment(environment.Production)).toBe('https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/prod/update-manual');

    expect(getFallbackDownloadUrlForEnvironment(environment.Test)).toBe('https://lobsterai.inner.youdao.com/#/download-list');
    expect(getFallbackDownloadUrlForEnvironment(environment.Production)).toBe('https://lobsterai.youdao.com/#/download-list');

    expect(getSkillStoreUrlForEnvironment(environment.Test)).toBe('http://localhost:9111/skill-store');
    expect(getSkillStoreUrlForEnvironment(environment.Production)).toBe('http://jdi-skills-api.jd.com/skill-store');
    expect(getSkillRequestSubmitUrlForEnvironment(environment.Production)).toBe('http://jdi-skills-api.jd.com/skill-store/requests');

    expect(getLoginOvermindUrlForEnvironment(environment.Test)).toBe('https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/test/login-url');
    expect(getLoginOvermindUrlForEnvironment(environment.Production)).toBe('https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/prod/login-url');

    expect(getMcpMarketplaceUrlForEnvironment(environment.Test)).toBe('https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/test/mcp-marketplace');
    expect(getMcpMarketplaceUrlForEnvironment(environment.Production)).toBe('https://api-overmind.youdao.com/openapi/get/luna/hardware/lobsterai/prod/mcp-marketplace');

    expect(getPortalPricingUrlForEnvironment(environment.Test)).toBe('https://c.youdao.com/dict/hardware/cowork/lobsterai-portal.html#/pricing');
    expect(getPortalPricingUrlForEnvironment(environment.Production)).toBe('https://c.youdao.com/dict/hardware/octopus/lobsterai-portal.html#/pricing');
    expect(getPortalProfileUrlForEnvironment(environment.Test)).toBe('https://c.youdao.com/dict/hardware/cowork/lobsterai-portal.html#/profile');
    expect(getPortalProfileUrlForEnvironment(environment.Production)).toBe('https://c.youdao.com/dict/hardware/octopus/lobsterai-portal.html#/profile');
  });
});
