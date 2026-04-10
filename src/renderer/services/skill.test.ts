import { AuthRedirectTarget } from '@shared/auth/constants';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const authGetState = vi.fn();
const authLogin = vi.fn();
const apiFetch = vi.fn();

vi.mock('./endpoints', () => ({
  getSkillStoreUrl: () => 'http://11.103.146.140:9111/skill-store',
  getSkillRequestSubmitUrl: () => 'http://11.103.146.140:9111/skill-store/requests',
}));

vi.stubGlobal('window', {
  electron: {
    auth: {
      getState: authGetState,
      login: authLogin,
    },
    api: {
      fetch: apiFetch,
    },
  },
});

import { store } from '../store';
import { setLoggedIn, setLoggedOut } from '../store/slices/authSlice';
import { skillService } from './skill';

describe('skillService.fetchMarketplaceSkills', () => {
  beforeEach(() => {
    authGetState.mockReset();
    authLogin.mockReset();
    apiFetch.mockReset();
    store.dispatch(setLoggedOut());
  });

  test('uses ERP from current auth state as zerocode_erp header', async () => {
    store.dispatch(setLoggedIn({ erp: 'joy-user' }));
    apiFetch.mockResolvedValue({
      ok: true,
      data: {
        data: {
          value: {
            localSkill: [],
            marketTags: [],
            marketplace: [],
          },
        },
      },
    });

    await skillService.fetchMarketplaceSkills();

    expect(apiFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://11.103.146.140:9111/skill-store',
        method: 'GET',
        headers: expect.objectContaining({
          zerocode_erp: 'joy-user',
        }),
      }),
    );
    expect(authGetState).not.toHaveBeenCalled();
  });

  test('falls back to main-process auth state when redux auth ERP is empty', async () => {
    authGetState.mockResolvedValue({
      success: true,
      isLoggedIn: true,
      erp: 'fallback-user',
    });
    apiFetch.mockResolvedValue({
      ok: true,
      data: {
        data: {
          value: {
            localSkill: [],
            marketTags: [],
            marketplace: [],
          },
        },
      },
    });

    await skillService.fetchMarketplaceSkills();

    expect(authGetState).toHaveBeenCalledTimes(1);
    expect(apiFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://11.103.146.140:9111/skill-store',
        method: 'GET',
        headers: expect.objectContaining({
          zerocode_erp: 'fallback-user',
        }),
      }),
    );
  });

  test('ensureMarketplaceLogin triggers JD login with skills redirect when ERP is unavailable', async () => {
    authGetState.mockResolvedValue({
      success: true,
      isLoggedIn: false,
      erp: null,
    });
    authLogin.mockResolvedValue({ success: true });

    const result = await skillService.ensureMarketplaceLogin();

    expect(authLogin).toHaveBeenCalledWith({
      redirectTo: AuthRedirectTarget.Skills,
    });
    expect(result).toEqual({
      isLoggedIn: false,
      erp: null,
      loginTriggered: true,
    });
    expect(apiFetch).not.toHaveBeenCalled();
  });

  test('submitSkillRequest posts trimmed content together with ERP identity', async () => {
    store.dispatch(setLoggedIn({ erp: 'joy-user' }));
    apiFetch.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        code: 0,
        data: {
          id: 'request-1',
        },
      },
    });

    const result = await skillService.submitSkillRequest({
      content: '  想要一个自动生成周报的技能  ',
    });

    expect(apiFetch).toHaveBeenCalledWith({
      url: 'http://11.103.146.140:9111/skill-store/requests',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        zerocode_erp: 'joy-user',
      },
      body: JSON.stringify({
        content: '想要一个自动生成周报的技能',
        erp: 'joy-user',
      }),
    });
    expect(result).toEqual({ success: true });
    expect(authLogin).not.toHaveBeenCalled();
  });

  test('submitSkillRequest asks user to login before sending when ERP is unavailable', async () => {
    authGetState.mockResolvedValue({
      success: true,
      isLoggedIn: false,
      erp: null,
    });
    authLogin.mockResolvedValue({ success: true });

    const result = await skillService.submitSkillRequest({
      content: '需要一个批量汇总表格的技能',
    });

    expect(authLogin).toHaveBeenCalledWith({
      redirectTo: AuthRedirectTarget.Skills,
    });
    expect(apiFetch).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      requiresLogin: true,
    });
  });
});
