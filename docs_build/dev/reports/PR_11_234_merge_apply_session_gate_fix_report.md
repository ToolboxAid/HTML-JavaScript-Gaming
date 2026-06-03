# PR_11_234 — Fix Merge Apply Session Gate After Preview

## Files Changed
- `tools/workspace-v2/index.js`
- `tests/runtime/V2MergeApplySessionGateFix.test.mjs`

## Fix Summary
- Preserved confirmed preview context across merge input refresh:
  - `renderSessionMergeInputs()` now attempts to keep `pendingMergePreview` when source/target ids and payload hashes still match.
  - Preview is only cleared when source/target changed or disappeared.
- Apply now uses confirmed preview context directly and does not depend on re-selected UI context.
- Removed apply-time dependency that could incorrectly lose preview context.
- Kept PR_11_233 protections:
  - conflict blocking
  - stale preview blocking
  - post-apply verification against preview diff
  - audit trail recording

## Required Behavior Coverage
- Preview with two valid sessions enables confirm: PASS
- Confirmed preview enables apply: PASS
- Apply does not emit two-session gate error after valid confirmed preview: PASS
- Missing/invalid session count still blocks preview: PASS
- Stale preview still blocks apply: PASS
- Conflicted preview still blocks apply: PASS
- Audit record still written after successful apply: PASS

## Validation Commands
- `node --check tools/workspace-v2/index.js`
- `node --check tests/runtime/V2MergeApplySessionGateFix.test.mjs`
- `node tests/runtime/V2MergeApplySessionGateFix.test.mjs`

## Validation Results
- `node --check tools/workspace-v2/index.js` → PASS
- `node --check tests/runtime/V2MergeApplySessionGateFix.test.mjs` → PASS
- `node tests/runtime/V2MergeApplySessionGateFix.test.mjs` → PASS

Runtime artifact:
- `tmp/v2-merge-apply-session-gate-fix-results.json`

## Full Samples Smoke Decision
- Full samples smoke was **not run**.
- Reason: this PR is scoped only to Workspace V2 merge flow logic and includes targeted executable merge-flow coverage for all required guard and success paths.

## Scope Guard Confirmation
- No schema changes
- No sample changes
- No game changes
- No Workspace Manager v1 changes
- No legacy tool fixes
- No `platformShell` / `tools/shared/*` coupling
