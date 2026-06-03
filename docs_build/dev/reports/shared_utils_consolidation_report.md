# PR_26140_062 Shared Utils Consolidation

## Summary
- Consolidated reusable shared helpers out of `src/shared/utils/` into canonical `src/shared/` locations.
- Removed redundant `Utils` naming for active shared modules where the surrounding path already communicates shared ownership.
- Deleted compatibility/pass-through shared utility files instead of leaving shims.
- Updated active imports across games, tools, engine, samples, and tests to the new canonical paths.
- Refreshed the shared extraction guard baseline and removed legacy compatibility alias ledger entries tied to deleted utility shims.

## Canonical Module Moves
- `src/shared/utils/arrayUtils.js` -> `src/shared/arrays.js`
- `src/shared/utils/jsonUtils.js` -> `src/shared/json.js`
- `src/shared/utils/objectUtils.js` -> `src/shared/objects.js`
- `src/shared/utils/geometryUtils.js` -> `src/shared/geometry.js`
- `src/shared/utils/mathUtils.js` -> `src/shared/math/scalars.js`
- `src/shared/string/stringHelpers.js` -> `src/shared/strings.js`
- `src/shared/id/idUtils.js` -> `src/shared/id/ids.js`
- `src/shared/number/numberUtils.js` -> `src/shared/number/numbers.js`
- `src/shared/math/vectorNormalizeUtils.js` -> `src/shared/math/vectorNormalize.js`
- One-concept helpers such as `debugConfig`, `directions`, `highScores`, `initialsEntry`, `runtimeRegistry`, `snapshotClone`, `stringifyValue`, and `textWrap` now live directly under `src/shared/`.

## Deleted Compatibility Shims
- `src/shared/utils/index.js`
- `src/shared/utils/stringUtils.js`
- `src/shared/utils/idUtils.js`
- `src/shared/utils/numberUtils.js`
- `src/shared/string/stringUtil.js`

## Import Cleanup
- Active imports now point to canonical shared paths such as `/src/shared/math/scalars.js`, `/src/shared/objects.js`, `/src/shared/json.js`, and `/src/shared/strings.js`.
- Confirmed no active import/export statements reference `src/shared/utils/`.
- Sample JSON files were not modified.

## Validation
- PASS: changed-file syntax validation for 198 changed JavaScript files.
- PASS: changed-file import target validation for 197 changed JavaScript files, excluding the guard selftest fixture that intentionally contains fake import text.
- PASS: no active import/export statements reference `shared/utils/`.
- PASS: `node tools/dev/checkSharedExtractionGuard.mjs --update-baseline` and follow-up guard run.
- PASS: `node tools/dev/checkSharedExtractionGuard.selftest.mjs`.
- PASS: `node tests/shared/SharedFoundationCombinedPass.test.mjs`.
- PASS: `node tests/shared/SharedNumberStringIdCloseout.test.mjs`.
- PASS: `npm run test:workspace-v2` (59 passed).
- PASS: `git diff --check`.

## Coverage Guardrail
- `npm run test:workspace-v2` regenerated the advisory Playwright V8 coverage reports.
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt` lists changed runtime JavaScript files with covered entries where Workspace V2 exercised them and WARN details for changed runtime files not collected by that Playwright run.
- Missing coverage is advisory only per project instructions and did not fail validation.

## Non-Blocking Notes
- A direct `node tests/games/AsteroidsHardening.test.mjs` attempt failed because Node cannot resolve browser-root imports like `/src/engine/...` without the repo test import hook.
- A broader custom Asteroids node validation with the import hook passed `AsteroidsHardening` but stopped in `AsteroidsValidation` on an existing manifest bullet geometry expectation mismatch unrelated to this import-path consolidation. Required Workspace V2 validation, including Asteroids runtime asset coverage slices, passed.
