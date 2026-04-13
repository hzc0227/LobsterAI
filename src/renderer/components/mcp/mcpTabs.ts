export const McpTab = {
  Installed: 'installed',
  Custom: 'custom',
} as const;

export type McpTab = typeof McpTab[keyof typeof McpTab];

/**
 * Resolve the MCP tabs that should currently be visible in the renderer.
 *
 * The marketplace tab is intentionally disabled for the current JdiClaw
 * rollout stage. We keep the decision in one pure helper so the UI does not
 * scatter `'marketplace'` checks across rendering logic, and so tests can lock
 * down that the marketplace entry stays hidden until the product explicitly
 * re-enables it.
 *
 * @returns The ordered list of MCP tabs that are allowed to render right now.
 */
export const getVisibleMcpTabs = (): readonly McpTab[] => {
  return [
    McpTab.Installed,
    McpTab.Custom,
  ];
};
