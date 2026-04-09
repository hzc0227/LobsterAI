import { describe, expect, test } from 'vitest';

import { buildJdAuthState, normalizeErp, resolveJdAuthState } from './jdAuth';

describe('jdAuth', () => {
  test('normalizeErp trims valid values and rejects empty content', () => {
    expect(normalizeErp('  jd_user  ')).toBe('jd_user');
    expect(normalizeErp('   ')).toBeNull();
    expect(normalizeErp(undefined)).toBeNull();
  });

  test('resolveJdAuthState prefers the ERP value from the current cookie', () => {
    const storedState = buildJdAuthState('old-user', 100);

    const resolved = resolveJdAuthState(storedState, 'new-user', 200);

    expect(resolved.snapshot).toEqual({
      isLoggedIn: true,
      erp: 'new-user',
    });
    expect(resolved.persistedState).toEqual({
      erp: 'new-user',
      loggedInAt: 200,
    });
  });

  test('resolveJdAuthState clears stale local state when the ERP cookie is missing', () => {
    const storedState = buildJdAuthState('jd_user', 100);

    const resolved = resolveJdAuthState(storedState, null, 200);

    expect(resolved.snapshot).toEqual({
      isLoggedIn: false,
      erp: null,
    });
    expect(resolved.persistedState).toBeNull();
  });
});
