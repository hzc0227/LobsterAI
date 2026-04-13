import { describe, expect, test } from 'vitest';

import { getVisibleMcpTabs,McpTab } from './mcpTabs';

describe('getVisibleMcpTabs', () => {
  test('removes marketplace tab from the MCP module during the current rollout', () => {
    expect(getVisibleMcpTabs()).toEqual([
      McpTab.Installed,
      McpTab.Custom,
    ]);
  });
});
