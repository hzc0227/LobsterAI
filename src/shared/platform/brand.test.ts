import { describe, expect, test } from 'vitest';

import * as platform from './index';

describe('shared platform brand exports', () => {
  test('exposes centralized brand constants and external links', () => {
    const exports = platform as unknown as Record<string, unknown>;

    expect(exports.APP_NAME).toBe('JdiClaw');
    expect(exports.APP_ID).toBe('lobsterai');
    expect(exports.EXPORT_FORMAT_TYPE).toBe('lobsterai.providers');
    expect(exports.EXPORT_PASSWORD).toBe('lobsterai-APP');
    expect(exports.BRAND_CONTACT_EMAIL).toBe('lobsterai.project@rd.netease.com');
    expect(exports.BRAND_USER_COMMUNITY).toBe('10227855752');

    expect(exports.BrandLink).toBeDefined();
    expect(exports.getBrandLinkUrl).toBeTypeOf('function');

    const brandLink = exports.BrandLink as Record<string, string>;
    const getBrandLinkUrl = exports.getBrandLinkUrl as (link: string) => string;

    expect(getBrandLinkUrl(brandLink.UserManual)).toBe('https://joyspace.jd.com/h/personal/pages/tUGZC42TEC79IIcvqkSA');
    expect(getBrandLinkUrl(brandLink.ServiceTerms)).toBe('https://c.youdao.com/dict/hardware/lobsterai/lobsterai_service.html');
  });
});
