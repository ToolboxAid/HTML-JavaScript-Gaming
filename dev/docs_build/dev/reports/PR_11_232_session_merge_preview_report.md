# PR_11_232 — Session Merge Apply Preview / Dry Run

## Scope
Workspace V2 session/runtime merge area only.

## Files Changed
- `toolbox/workspace-v2/index.html`
- `toolbox/workspace-v2/index.js`
- `tests/runtime/V2SessionMergePreview.test.mjs`

## Implementation Summary
- Added a dry-run merge preview button:
  - `Preview Merge (Dry Run)` (`workspaceV2ComputeMergeButton`)
- Added an explicit apply button:
  - `Apply Merge` (`workspaceV2ApplyMergeButton`)
- Preview output now includes:
  - source session/context
  - target session/context
  - `changes.added`
  - `changes.updated`
  - `changes.unchanged`
  - `conflicts`
  - `canApply` flag
- Preview path is non-mutating for session data.
- Apply path is blocked when conflicts exist.
- No auto-merge/fallback behavior added.

## Validation Commands
- `node --check toolbox/workspace-v2/index.js`
- `node --check tests/runtime/V2SessionMergePreview.test.mjs`
- `node tests/runtime/V2SessionMergePreview.test.mjs`

## Validation Results
- `node --check toolbox/workspace-v2/index.js` → PASS
- `node --check tests/runtime/V2SessionMergePreview.test.mjs` → PASS
- `node tests/runtime/V2SessionMergePreview.test.mjs` → PASS

Runtime output artifact:
- `tmp/v2-session-merge-preview-results.json`

Validated behaviors:
- preview does not mutate source/target session payloads
- conflict preview blocks apply
- clean preview can proceed to apply
- reported preview diff matches applied result

## Full Samples Smoke Decision
- Full samples smoke was **skipped**.
- Reason: this PR is narrowly scoped to Workspace V2 merge preview/apply behavior and targeted runtime validation already covers the changed path without touching samples infrastructure.

## Scope Guard Confirmation
- No schema changes
- No sample changes
- No game changes
- No Workspace Manager v1 changes
- No legacy tool fixes
- No `platformShell` or `toolbox/shared/*` coupling
