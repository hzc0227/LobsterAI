import { beforeEach, describe, expect, test, vi } from 'vitest';

const authGetState = vi.fn();
const authOnStateChanged = vi.fn();
const windowOnStateChanged = vi.fn();

vi.stubGlobal('window', {
  electron: {
    auth: {
      getState: authGetState,
      onStateChanged: authOnStateChanged,
      login: vi.fn(),
      logout: vi.fn(),
    },
    window: {
      onStateChanged: windowOnStateChanged,
    },
  },
});

import { store } from '../store';
import { setLoggedOut } from '../store/slices/authSlice';
import { authService } from './auth';

describe('authService', () => {
  beforeEach(() => {
    authService.destroy();
    authGetState.mockReset();
    authOnStateChanged.mockReset();
    windowOnStateChanged.mockReset();
    store.dispatch(setLoggedOut());
  });

  test('focus: re-syncs ERP state from main process when user returns to the app window', async () => {
    let focusCallback: ((state: { isFocused: boolean; isFullscreen: boolean; isMaximized: boolean }) => void) | null = null;

    authGetState
      .mockResolvedValueOnce({ success: true, isLoggedIn: false, erp: null })
      .mockResolvedValueOnce({ success: true, isLoggedIn: true, erp: 'joy-user' });
    authOnStateChanged.mockReturnValue(() => undefined);
    windowOnStateChanged.mockImplementation((callback) => {
      focusCallback = callback;
      return () => undefined;
    });

    await authService.init();
    expect(focusCallback).not.toBeNull();
    const onFocus = focusCallback as
      | ((state: { isFocused: boolean; isFullscreen: boolean; isMaximized: boolean }) => void)
      | null;
    if (!onFocus) {
      throw new Error('focus callback was not registered');
    }

    onFocus({
      isFocused: true,
      isFullscreen: false,
      isMaximized: false,
    });

    await Promise.resolve();
    await Promise.resolve();

    expect(store.getState().auth.erp).toBe('joy-user');
    expect(store.getState().auth.isLoggedIn).toBe(true);
  });
});
