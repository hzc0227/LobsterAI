import { beforeEach, expect, test, vi } from 'vitest';

const {
  FakeBrowserWindow,
  browserWindows,
  cookieChangedHandlers,
  currentCookies,
  fromPartitionSpy,
} = vi.hoisted(() => {
  const cookieChangedHandlers = new Set<(...args: any[]) => void>();
  const currentCookies: Array<{ name: string; value: string; domain: string; path: string; secure?: boolean }> = [];
  const browserWindows: Array<any> = [];

  const fakeSession = {
    cookies: {
      on: vi.fn((event: string, handler: (...args: any[]) => void) => {
        if (event === 'changed') {
          cookieChangedHandlers.add(handler);
        }
      }),
      off: vi.fn((event: string, handler: (...args: any[]) => void) => {
        if (event === 'changed') {
          cookieChangedHandlers.delete(handler);
        }
      }),
      get: vi.fn(async (filter?: { name?: string }) => {
        if (filter?.name) {
          return currentCookies.filter((cookie) => cookie.name === filter.name);
        }
        return currentCookies;
      }),
      remove: vi.fn(async () => undefined),
    },
    clearStorageData: vi.fn(async () => undefined),
  };

  class FakeBrowserWindow {
    static getAllWindows() {
      return browserWindows;
    }

    public readonly close = vi.fn(() => {
      this.destroyed = true;
      this.closedHandler?.();
    });
    public readonly focus = vi.fn();
    public readonly isDestroyed = vi.fn(() => this.destroyed);
    public readonly isMinimized = vi.fn(() => false);
    public readonly restore = vi.fn();
    public readonly show = vi.fn();
    public readonly isVisible = vi.fn(() => true);
    public readonly once = vi.fn((event: string, handler: () => void) => {
      if (event === 'ready-to-show') {
        this.readyHandler = handler;
      }
    });
    public readonly on = vi.fn((event: string, handler: () => void) => {
      if (event === 'closed') {
        this.closedHandler = handler;
      }
    });
    public readonly loadURL = vi.fn(async () => undefined);
    public readonly webContents = {
      session: fakeSession,
      on: vi.fn(),
      setWindowOpenHandler: vi.fn(),
      getURL: vi.fn(() => 'https://erp.jd.com/home'),
    };

    private destroyed = false;
    private readyHandler?: () => void;
    private closedHandler?: () => void;

    constructor() {
      browserWindows.push(this);
    }

    emitReadyToShow() {
      this.readyHandler?.();
    }
  }

  const fromPartitionSpy = vi.fn(() => fakeSession);

  return {
    browserWindows,
    cookieChangedHandlers,
    currentCookies,
    fromPartitionSpy,
    FakeBrowserWindow,
  };
});

vi.mock('electron', () => ({
  BrowserWindow: FakeBrowserWindow,
  session: {
    fromPartition: fromPartitionSpy,
  },
}));

import { JdAuthManager } from './jdAuthManager';

beforeEach(() => {
  browserWindows.length = 0;
  currentCookies.length = 0;
  cookieChangedHandlers.clear();
  fromPartitionSpy.mockClear();
  vi.useFakeTimers();
});

test('constructor: does not touch Electron session before app is ready', () => {
  new JdAuthManager({
    getStore: () => ({
      get: () => null,
      set: () => undefined,
      delete: () => undefined,
    }) as never,
    getMainWindow: () => null,
    notifyStateChanged: () => undefined,
    getWindowTitle: () => 'JD Login',
  });

  expect(fromPartitionSpy).not.toHaveBeenCalled();
});

test('polling: closes login window and focuses main window after ERP cookie appears', async () => {
  const notifyStateChanged = vi.fn();
  const mainWindow = {
    isDestroyed: vi.fn(() => false),
    isMinimized: vi.fn(() => false),
    restore: vi.fn(),
    isVisible: vi.fn(() => true),
    show: vi.fn(),
    focus: vi.fn(),
  } as never;
  const manager = new JdAuthManager({
    getStore: () => ({
      get: () => null,
      set: () => undefined,
      delete: () => undefined,
    }) as never,
    getMainWindow: () => mainWindow,
    notifyStateChanged,
    getWindowTitle: () => 'JD Login',
  });

  await manager.openLoginWindow();

  currentCookies.push({
    name: '_erp',
    value: 'joy-user',
    domain: '.jd.com',
    path: '/',
  });

  await vi.advanceTimersByTimeAsync(1000);

  expect(notifyStateChanged).toHaveBeenCalledWith({
    isLoggedIn: true,
    erp: 'joy-user',
    redirectTo: null,
  });
  expect(browserWindows[0].close).toHaveBeenCalled();
  expect(mainWindow.focus).toHaveBeenCalled();
});

test('polling: supports the observed JD ERP cookie name erp_erp', async () => {
  const notifyStateChanged = vi.fn();
  const manager = new JdAuthManager({
    getStore: () => ({
      get: () => null,
      set: () => undefined,
      delete: () => undefined,
    }) as never,
    getMainWindow: () => null,
    notifyStateChanged,
    getWindowTitle: () => 'JD Login',
  });

  await manager.openLoginWindow();

  currentCookies.push({
    name: 'erp_erp',
    value: 'joy-user',
    domain: '.jd.com',
    path: '/',
  });

  await vi.advanceTimersByTimeAsync(1000);

  expect(notifyStateChanged).toHaveBeenCalledWith({
    isLoggedIn: true,
    erp: 'joy-user',
    redirectTo: null,
  });
});
