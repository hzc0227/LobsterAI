# Skill Request Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dual-entry "publish request" flow to the skills page, with login gating for marketplace access and a minimal modal that submits the user's request text together with ERP identity.

**Architecture:** Keep the new behavior inside the existing skills module. Add a small service-layer login gate and request-submission API wrapper in `skillService`, then wire two UI entry points in `SkillsManager` to a single modal. Reuse the current ERP login flow by redirecting back to the skills page after login.

**Tech Stack:** React 18, TypeScript, Redux Toolkit, Electron IPC fetch proxy, Vitest.

---

### Task 1: Define the network surface

**Files:**
- Modify: `src/renderer/services/endpoints.ts`
- Modify: `src/renderer/types/skill.ts`

- [ ] Add endpoint helpers for skills marketplace auth check and request submission.
- [ ] Add request/result types used by the new service methods.
- [ ] Keep comments explicit so future backend alignment is easy.

### Task 2: Add service-layer login gate and submission flow

**Files:**
- Modify: `src/renderer/services/skill.ts`
- Test: `src/renderer/services/skill.test.ts`

- [ ] Write failing tests for login gating and request submission.
- [ ] Implement `ensureMarketplaceLogin()` with ERP reuse and login redirect to `skills`.
- [ ] Implement `submitSkillRequest()` with trim, 500-char guard, and ERP payload.

### Task 3: Add the dual-entry modal UI

**Files:**
- Modify: `src/renderer/components/skills/SkillsManager.tsx`
- Modify: `src/renderer/services/i18n.ts`

- [ ] Add one shared modal for skill request submission.
- [ ] Add the secondary entry in the `添加` dropdown.
- [ ] Add the primary CTA in the search-empty state for both tabs.
- [ ] Re-fetch marketplace after login succeeds or auth state changes.

### Task 4: Verify the feature

**Files:**
- Test: `src/renderer/services/skill.test.ts`

- [ ] Run targeted Vitest coverage for the new service behavior.
- [ ] Run lint for touched renderer files if time allows.
- [ ] Manually review copy, loading state, and empty-state layout.
