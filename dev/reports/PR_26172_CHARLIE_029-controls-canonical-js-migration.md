# PR_26172_CHARLIE_029-controls-canonical-js-migration

Status: PASS.

Branch: `PR_26172_CHARLIE_repository-compliance-stack`

## Purpose

Migrate Controls active tool JavaScript into canonical structure.

## Files Changed

- `assets/toolbox/controls/js/index.js`
- `toolbox/controls/index.html`
- `scripts/validate-canonical-repository-structure.mjs`
- `tests/regression/CanonicalRepositoryStructureGuardrail.test.mjs`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `docs_build/dev/reports/PR_26172_CHARLIE_029-controls-canonical-js-migration.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Migration Notes

- Moved `toolbox/controls/controls.js` to `assets/toolbox/controls/js/index.js`.
- Updated `toolbox/controls/index.html` to load the canonical module path.
- Updated Controls Playwright source-path checks to fetch `/assets/toolbox/controls/js/index.js`.
- Removed `toolbox/controls/controls.js` from canonical guardrail legacy exceptions.
- Kept `toolbox/controls/controls-api-client.js` in place.

## Retained Exception

Retained path:
- `toolbox/controls/controls-api-client.js`

Reason:
- It is shared by `account/user-controls-page.js` and the Controls tool page.
- Moving it as part of the entrypoint migration would cross from a single tool entrypoint change into shared account-surface API routing.

Removal plan:
- Create a later scoped PR to decide whether the shared Controls API client belongs under `assets/js/shared/` or another approved canonical shared API location.

## Validation Lane Report

PASS:
- `node --check assets/toolbox/controls/js/index.js`
- `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `git diff --check`
- `node --test tests/regression/CanonicalRepositoryStructureGuardrail.test.mjs`
- `npm run validate:canonical-structure`
  - Canonical repository structure guardrail: PASS.
  - Blocking violations: 0.
  - Approved legacy exceptions: 483.
- Active stale-reference check for `toolbox/controls/controls.js`
  - Result: no active matches outside reports/tmp/node_modules.
- `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --grep "Toolbox Controls shows game controls" --workers=1 --reporter=line --timeout=60000`
  - Result: PASS.

Skipped:
- Full Playwright was not run per scope.
- Samples were not run per scope.

## Requirement Checklist

- [x] Moved `toolbox/controls/controls.js` into `assets/toolbox/controls/js/index.js`.
- [x] Left shared `controls-api-client.js` in place and documented why.
- [x] Updated `toolbox/controls/index.html`.
- [x] Updated tests and validators referencing old Controls path.
- [x] Preserved behavior.
- [x] No feature changes.
- [x] Did not modify unrelated tools.
- [x] Confirmed ZIP artifact under `tmp/`.

## Manual Validation Notes

The targeted Playwright harness needed the same dynamic `GameFoundryPublicConfig` pattern used by other tool specs so browser API calls resolve to the active test server instead of the repository `.env` fallback. This is test-only and directly supports validating the migrated Controls module.
