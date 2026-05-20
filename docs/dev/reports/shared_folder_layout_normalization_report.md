# PR_26140_063 Shared Folder Layout Normalization

## Summary
- Moved the remaining root-level shared helper modules into explicit domain folders under `src/shared/`.
- Kept imports pointing directly at the canonical domain files instead of creating root-level compatibility shims.
- Removed the object helper's cross-domain `asArray` re-export and split affected imports so array helpers come from `src/shared/array/arrays.js`.
- Refreshed the shared extraction guard baseline after the canonical path moves.
- Preserved behavior; this PR is layout/import normalization only.

## Layout Decisions
- Array helpers: `src/shared/array/arrays.js`.
- Object helpers: `src/shared/object/objects.js`.
- JSON clone helpers: `src/shared/json/clone.js`.
- String helpers: `src/shared/string/strings.js`, `textWrap.js`, `commandText.js`, `fuzzyMatchScore.js`, and `stringifyValue.js`.
- Math/spatial helpers: `src/shared/math/scalars.js`, `geometry.js`, `directions.js`, `vectorMath.js`, `vectorNormalize.js`, and `numberNormalization.js`.
- Debug helpers: `src/shared/debug/config.js`, `network.js`, and `noopDevConsoleIntegration.js`.
- Runtime helpers: `src/shared/runtime/registry.js` and `snapshotClone.js`.
- Game-generic helpers: `src/shared/game/highScores.js` and `initialsEntry.js`.
- Validation helper: `src/shared/validation/invariant.js`.

## Guardrail Checks
- Confirmed `src/shared/` root contains only the existing `index.js` namespace barrel.
- Confirmed no active import/export statements reference `shared/utils/`.
- Confirmed no active import/export statements reference the relocated dangling root shared files such as `shared/arrays.js`, `shared/objects.js`, `shared/json.js`, or `shared/strings.js`.
- Confirmed no `../` export-from chains exist inside `src/shared/**/*.js`.
- Confirmed no `Utils`/`utils` naming remains in `src/shared/**/*.js`.
- No root shared compatibility re-export shims were created.
- No sample JSON files were modified.

## Validation
- PASS: `node tools/dev/checkSharedExtractionGuard.mjs --update-baseline`.
- PASS: `node tools/dev/checkSharedExtractionGuard.mjs`.
- PASS: root shared file check confirmed only `src/shared/index.js` remains at root.
- PASS: no active imports from `shared/utils` or relocated root shared files.
- PASS: no `../` export-from chains in `src/shared`.
- PASS: no `Utils`/`utils` naming in `src/shared/**/*.js`.
- PASS: changed-file syntax validation for 135 JavaScript files.
- PASS: changed-file import target validation for 135 JavaScript files.
- PASS: `node tools/dev/checkSharedExtractionGuard.selftest.mjs`.
- PASS: `node tests/shared/SharedFoundationCombinedPass.test.mjs`.
- PASS: `node tests/shared/SharedNumberStringIdCloseout.test.mjs`.
- PASS: `npm run test:workspace-v2` (59 passed).
- PASS: `git diff --check`.

## Coverage Guardrail
- `npm run test:workspace-v2` regenerated advisory Playwright V8 coverage reports.
- `docs/dev/reports/coverage_changed_js_guardrail.txt` lists changed runtime JavaScript files with covered entries where Workspace V2 exercised them and WARN details for files not collected by that Playwright run.
- Coverage is advisory and missing changed runtime files are WARN, not FAIL, per project instructions.

## Full Samples Smoke Test
- Skipped as requested. This PR changes shared module layout/imports and is covered by targeted syntax/import checks plus Workspace V2; sample JSON remains out of scope.

## Manual Validation
- Open Workspace Manager V2 and select the repo.
- Launch Object Vector Studio V2, Palette Manager V2, Asset Manager V2, and Asteroids from Workspace Manager V2.
- Expected: tools and Asteroids launch without module resolution errors, and behavior matches the pre-layout-change state.
