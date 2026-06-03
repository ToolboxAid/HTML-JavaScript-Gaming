# PR_26140_033 Shared Utils Phase 2 Report

## Summary
- Added shared string helpers for `normalizeText`, `normalizeToken`, and case-preserving `normalizeGameId`.
- Added shared `toObject` in `src/shared/utils/objectUtils.js` for callers that intentionally allow arrays, while preserving existing `asObject` array-rejecting semantics.
- Replaced exact-match local helpers across active game, engine, and tool code for `sanitizeText`, `normalizeToken`, `normalizeGameId`, `toObject`, and `positiveInteger`.
- Left lowercasing/slug `normalizeGameId` variants and other differing semantics in place.

## Duplicate Scan
- Re-ran `toolbox/shared/powerShell/find_dupes_called.ps1` into `tmp/dupes_called.txt`.
- Verified `node_modules` paths are not present in the regenerated duplicate report.
- Selected duplicate block counts from `tmp/dupes_called.txt`:
  - `function sanitizeText(value)`: 41 -> 38
  - `export function sanitizeText(value)`: 3 -> 0
  - `function toObject(value)`: 12 -> 2
  - `function normalizeToken(value)`: 5 -> 2
  - `function normalizeGameId(value)`: 5 -> 2
  - `function positiveInteger(value)`: 3 -> 0

## Scope Notes
- No vendor, generated bundle, `node_modules`, `tests/results`, or archived tool files were modified.
- `normalizeGameId` variants that lowercase or slugify game IDs remain local because their behavior differs from case-preserving game ID trimming.
- `normalizeString` helpers that coerce non-strings through `String(value || "")` remain local because they differ from the shared string-only trim semantics.
- `distance`/`near` helpers were not migrated in this pass because the remaining candidates either use different distance metrics or are outside the requested validation surface.

## Validation
- PASS: `npm run build:manifest`
- PASS: `node tests\games\AsteroidsValidation.test.mjs`
- PASS: `node tests\games\AsteroidsManifestScreenDimensions.test.mjs`
- PASS: `node tests\games\AsteroidsPresentation.test.mjs`
- PASS: `node tests\tools\ObjectVectorFinalRuntimeCleanup.test.mjs`
- PASS: `node tests\tools\ObjectVectorStudioV2DeleteCleanup.test.mjs`
- PASS: `npm run test:workspace-v2` (58 passed)
- PASS: `npx playwright test tests/playwright/tools/ObjectVectorStudioV2FirstClassToolStarter.spec.mjs --project=playwright --workers=1 --reporter=list` (4 passed)
- PASS: `npx playwright test tests/playwright/tools/AsteroidsGameSceneCleanup.spec.mjs --project=playwright --workers=1 --reporter=list` (1 passed)
- PASS: `git diff --check` (no whitespace errors; Git reported existing CRLF/LF normalization warnings for two modified files)

## Corrected During Validation
- The first Asteroids Node validation exposed a new browser-absolute import in `games/shared/workspaceGameAssetCatalog.js`; switched new `games/shared` and `games/index.render.js` imports to relative paths and reran validation successfully.
- A first Playwright invocation used Windows backslashes and matched no tests; reran with forward slashes successfully.
