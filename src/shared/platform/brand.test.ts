import { describe, expect, test } from 'vitest';

import * as platform from './index';

describe('shared platform brand exports', () => {
  test('exposes centralized brand constants and external links', () => {
    const exports = platform as unknown as Record<string, unknown>;

    expect(exports.APP_NAME).toBe('JdiClaw');
    expect(exports.APP_BUNDLE_ID).toBe('com.jdiclaw.app');
    expect(exports.APP_ID).toBe('jdiclaw');
    expect(exports.APP_PROTOCOL_SCHEME).toBe('jdiclaw');
    expect(exports.APP_PROTOCOL_PREFIX).toBe('jdiclaw://');
    expect(exports.BRAND_AUTHOR_NAME).toBe('JdiClaw');
    expect(exports.EXPORT_FORMAT_TYPE).toBe('jdiclaw.providers');
    expect(exports.EXPORT_PASSWORD).toBe('jdiclaw-APP');
    expect(exports.BRAND_CONTACT_EMAIL).toBe('jdiclaw.project@rd.netease.com');
    expect(exports.BRAND_USER_COMMUNITY).toBe('10227855752');
    expect(exports.BRAND_LOGO_ASSET_PATH).toBe('/jdiclaw-logo.svg');
    expect(exports.BRAND_LOGO_RASTER_ASSET_PATH).toBe('/jdiclaw-logo.png');

    expect(exports.BrandLink).toBeDefined();
    expect(exports.getBrandLinkUrl).toBeTypeOf('function');

    const brandLink = exports.BrandLink as Record<string, string>;
    const getBrandLinkUrl = exports.getBrandLinkUrl as (link: string) => string;

    expect(getBrandLinkUrl(brandLink.UserManual)).toBe('https://joyspace.jd.com/h/personal/pages/tUGZC42TEC79IIcvqkSA');
    expect(Object.prototype.hasOwnProperty.call(brandLink, 'ServiceTerms')).toBe(false);
  });
});
