import { beforeEach, describe, expect, test, vi } from 'vitest';

const authGetState = vi.fn();
const apiFetch = vi.fn();

vi.mock('./endpoints', () => ({
  getSkillStoreUrl: () => 'http://11.103.146.140:9111/skill-store',
}));

vi.stubGlobal('window', {
  electron: {
    auth: {
      getState: authGetState,
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
});
