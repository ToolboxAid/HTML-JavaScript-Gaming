# PR_26172_CHARLIE_040-controls-game-journey-api-client-resolution

## Summary

Status: PASS.

Resolved two retained API-client exceptions by moving them to canonical shared JavaScript:

- `toolbox/controls/controls-api-client.js` -> `assets/js/shared/controls-api-client.js`
- `toolbox/game-journey/game-journey-api-client.js` -> `assets/js/shared/game-journey-api-client.js`

No feature behavior was changed.

## Files Changed

- `assets/js/shared/controls-api-client.js`
- `assets/js/shared/game-journey-api-client.js`
- `assets/toolbox/controls/js/index.js`
- `assets/toolbox/game-journey/js/index.js`
- `account/user-controls-page.js`
- `scripts/validate-canonical-repository-structure.mjs`
- `scripts/validate-browser-env-agnostic.mjs`
- `tests/dev-runtime/ProductDataProviderContractHardening.test.mjs`
- `tests/regression/CanonicalRepositoryStructureGuardrail.test.mjs`
- `docs_build/dev/reports/PR_26172_CHARLIE_040-controls-game-journey-api-client-resolution.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Controls API Client Resolution

Decision: migrated to shared.

Reason:

- The client is used by the Controls tool and the account User Controls page.
- `assets/js/shared/` is canonical for reusable browser helpers.
- Consumers validated through direct browser page-load probe.

Updated consumers:

- `assets/toolbox/controls/js/index.js`
- `account/user-controls-page.js`

## Game Journey API Client Resolution

Decision: migrated to shared.

Reason:

- The canonical structure allows shared JS under `assets/js/shared/`.
- Moving to shared avoids creating an unapproved secondary tool-local JS file beside `index.js`.
- Targeted Game Journey browser probe validated the moved client and completion-metrics rendering with the existing Postgres stub.

Updated consumer:

- `assets/toolbox/game-journey/js/index.js`

## Validation Lane Report

- `node --check assets/js/shared/controls-api-client.js`
  - Result: PASS
- `node --check assets/js/shared/game-journey-api-client.js`
  - Result: PASS
- `node --check assets/toolbox/controls/js/index.js`
  - Result: PASS
- `node --check assets/toolbox/game-journey/js/index.js`
  - Result: PASS
- `node --check account/user-controls-page.js`
  - Result: PASS
- Active stale reference check for old Controls/Game Journey client paths
  - Result: PASS
  - No active non-report references remain.
- `git diff --check`
  - Result: PASS
- `npm run validate:canonical-structure`
  - Result: PASS
  - Blocking violations: 0
  - Approved legacy exceptions: 478
- `node --test tests/regression/CanonicalRepositoryStructureGuardrail.test.mjs`
  - Result: PASS
- Direct browser page-load probe:
  - Controls: PASS, heading rendered and `assets/js/shared/controls-api-client.js` returned HTTP 200.
  - Game Journey: PASS, heading rendered, shared client returned HTTP 200, completion metrics rendered.
  - Account User Controls: PASS, heading rendered and shared Controls client returned HTTP 200.
- `node --test tests/dev-runtime/ProductDataProviderContractHardening.test.mjs`
  - Result: FAIL
  - Existing unrelated failures:
    - Public config request order expectation.
    - Admin/tool votes import expectation.
  - The moved Controls and Game Journey client path list was updated in this test; the remaining failures are outside this PR scope.

## Branch Validation

- Current branch: `PR_26172_CHARLIE_repository-compliance-stack`
- Expected branch: `PR_26172_CHARLIE_repository-compliance-stack`
- Local/origin sync before PR: `0 0`
- Branch validation: PASS

## Requirement Checklist

- Resolve `controls-api-client.js`: PASS
- Resolve `game-journey-api-client.js`: PASS
- Migrate if safe: PASS
- Otherwise document exceptions: PASS, no exception retained for these two files.
- Preserve behavior: PASS
- No feature changes: PASS
- Produce ZIP artifact: PASS after artifact creation.

## Manual Validation Notes

Controls and Game Journey API-client exceptions are resolved. The only remaining target-area exception after this PR is the Assets upload worker.
