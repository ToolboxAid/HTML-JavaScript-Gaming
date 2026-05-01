# PR_11_236 — Centralize Workspace V2 Session Inventory For Diff And Merge

## Files Changed
- `tools/workspace-v2/index.js`
- `tests/runtime/V2SessionInventoryDiffMerge.test.mjs`

## Implementation Summary
- Added centralized Workspace V2 inventory resolver:
  - `resolveWorkspaceSessionInventory()`
- Resolver combines valid session entries from existing Workspace V2 sources:
  - session library (`v2-session-library`)
  - recent/session history (`v2-session-history`)
- Each inventory entry includes:
  - stable id (`library:<name>` or `history:<hostContextId>`)
  - display label
  - payload snapshot
  - context id metadata
  - version metadata (when available)
- Session Diff Viewer now consumes this shared inventory for both Session A/B selectors.
- Session Merge now consumes this same shared inventory for both Session A/B selectors.
- No fallback/default sessions were introduced.
- No silent auto-selection was introduced; persisted selection is retained only when still valid.

## Required Message Behavior
- Diff under-two-inventory message:
  - `Create or reopen at least two Workspace V2 sessions before comparing.`
- Merge under-two-inventory message:
  - `Create or reopen at least two Workspace V2 sessions before previewing a merge.`

## Guard Behavior Kept
- Merge dry-run preview flow retained.
- Confirmed preview remains required before apply.
- Stale preview still blocks apply.
- Conflicts still block apply.
- Post-apply verification retained.
- Audit trail retained.

## Validation Commands
- `node --check tools/workspace-v2/index.js`
- `node --check tests/runtime/V2SessionInventoryDiffMerge.test.mjs`
- `node tests/runtime/V2SessionInventoryDiffMerge.test.mjs`

## Validation Results
- `node --check tools/workspace-v2/index.js` → PASS
- `node --check tests/runtime/V2SessionInventoryDiffMerge.test.mjs` → PASS
- `node tests/runtime/V2SessionInventoryDiffMerge.test.mjs` → PASS

Runtime artifact:
- `tmp/v2-session-inventory-diff-merge-results.json`

## Scenario Coverage
- zero valid inventory entries shows correct single Diff message: PASS
- zero valid inventory entries shows correct single Merge message: PASS
- one valid inventory entry shows correct single Diff message: PASS
- one valid inventory entry shows correct single Merge message: PASS
- two valid inventory entries populate Diff Session A/B dropdowns: PASS
- two valid inventory entries populate Merge Session A/B dropdowns: PASS
- same-session selection blocks Diff: PASS
- same-session selection blocks Merge: PASS
- distinct selections allow Compute Diff: PASS
- distinct selections allow Preview Merge: PASS
- valid merge preview enables Confirm Preview: PASS
- confirmed preview enables Apply Merge: PASS
- successful apply writes audit record: PASS

## Full Smoke Decision
- Full samples smoke was **not run**.
- Reason: changes are strictly scoped to Workspace V2 inventory resolution and are covered by targeted executable runtime validation.

## Scope Guard Confirmation
- No schema changes
- No sample changes
- No game changes
- No Workspace Manager v1 work
- No legacy tool fixes
- No `platformShell` / `tools/shared/*` work
