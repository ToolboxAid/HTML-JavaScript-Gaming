# PR_11_237 — Bind Diff And Merge Selectors To Visible Recent Session Inventory

## Files Changed
- `tools/workspace-v2/index.js`
- `tests/runtime/V2RecentSessionSelectorBinding.test.mjs`

## Implementation Summary
- Bound Diff and Merge selector inventories to the same recent-session inventory used by Workspace V2 Recent Sessions rendering.
- Added recent inventory cache:
  - `this.recentSessionInventory`
- Added recent-session payload resolver:
  - `resolveSessionPayloadFromContextId(contextId, fallbackPayload)`
  - resolves payload from `sessionStorage[hostContextId]` first
  - falls back to recent-session payload snapshot only if needed
- Added recent inventory builder:
  - `buildRecentSessionInventory(history)`
  - includes id, label, context id, tool id, payload, version, source metadata
- Shared inventory resolver now uses this visible recent-session inventory first and includes library entries when available.
- No fallback/default sessions were created.
- No silent auto-selection was added.

## Behavior Confirmed
- Two recent sessions with missing `v2-session-library` still populate Diff and Merge selectors.
- Distinct recent selections allow Diff and Merge preview flows.
- Same-session A/B selection blocks clearly.
- Missing selections block with one clear message.
- Merge confirm/apply guard chain remains:
  - preview required
  - confirmed preview required
  - stale/conflict blocking retained
  - audit trail retained on successful apply

## Validation Commands
- `node --check tools/workspace-v2/index.js`
- `node --check tests/runtime/V2RecentSessionSelectorBinding.test.mjs`
- `node tests/runtime/V2RecentSessionSelectorBinding.test.mjs`

## Validation Results
- `node --check tools/workspace-v2/index.js` → PASS
- `node --check tests/runtime/V2RecentSessionSelectorBinding.test.mjs` → PASS
- `node tests/runtime/V2RecentSessionSelectorBinding.test.mjs` → PASS

Runtime artifact:
- `tmp/v2-recent-session-selector-binding-results.json`

## Required Scenario Coverage
- two recent sessions and no saved library populate Diff A/B dropdowns: PASS
- two recent sessions and no saved library populate Merge A/B dropdowns: PASS
- selecting two distinct recent sessions allows Compute Diff: PASS
- selecting two distinct recent sessions allows Preview Merge: PASS
- same recent session selected for A/B blocks clearly: PASS
- missing selections block with one clear message: PASS
- confirmed merge preview enables Apply Merge: PASS
- successful apply writes audit record: PASS
- missing localStorage `v2-session-library` does not block recent-session dropdown population: PASS

## Full Smoke Decision
- Full samples smoke was **not run**.
- Reason: this PR is strictly scoped to Workspace V2 selector binding and covered by targeted executable runtime validation.

## Scope Guard Confirmation
- No schema changes
- No sample changes
- No game changes
- No Workspace Manager v1 work
- No legacy tool fixes
- No `platformShell` / `tools/shared/*` work
