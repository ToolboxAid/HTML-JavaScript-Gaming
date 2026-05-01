# PR_11_234 — Merge Preview Session Selection Validation Fix

## Files Changed
- `tools/workspace-v2/index.js`
- `tests/runtime/V2MergePreviewSelectionFix.test.mjs`

## Fix Summary
- Fixed merge preview selection resolution to read explicit Session A / Session B values from the UI.
- Added explicit placeholder options:
  - `Select Session A`
  - `Select Session B`
- Removed silent auto-selection of merge sessions.
- Enforced valid preview prerequisites:
  - Session A selected
  - Session B selected
  - Session A and Session B are different
  - both selected sessions still exist
- Added specific actionable messages for:
  - missing Session A
  - missing Session B
  - both missing
  - same session selected
  - missing/stale selected entry
- Kept PR_11_233/PR_11_234 guard behavior:
  - conflict blocking
  - stale preview blocking
  - post-apply verification
  - audit trail writing

## Validation Commands
- `node --check tools/workspace-v2/index.js`
- `node --check tests/runtime/V2MergePreviewSelectionFix.test.mjs`
- `node tests/runtime/V2MergePreviewSelectionFix.test.mjs`

## Validation Results
- `node --check tools/workspace-v2/index.js` → PASS
- `node --check tests/runtime/V2MergePreviewSelectionFix.test.mjs` → PASS
- `node tests/runtime/V2MergePreviewSelectionFix.test.mjs` → PASS

Runtime artifact:
- `tmp/v2-merge-preview-selection-fix-results.json`

## Required Scenario Coverage
- no selections blocks preview with specific message: PASS
- only Session A selected blocks preview with missing Session B message: PASS
- only Session B selected blocks preview with missing Session A message: PASS
- same session selected for A and B blocks preview: PASS
- two distinct selected sessions create dry-run preview: PASS
- valid preview enables Confirm Preview: PASS
- confirmed preview enables Apply Merge: PASS
- Apply Merge no longer repeats two-session gate error after valid preview: PASS
- successful apply writes audit record: PASS

## Full Samples Smoke Decision
- Full samples smoke was **skipped**.
- Reason: this PR is narrowly scoped to Workspace V2 merge selection/preview flow and is fully covered by targeted executable runtime validation.

## Scope Guard Confirmation
- No schema changes
- No sample changes
- No game changes
- No Workspace Manager v1 work
- No legacy tool fixes
- No `platformShell` / `tools/shared/*` work
