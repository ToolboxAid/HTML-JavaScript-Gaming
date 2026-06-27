# PR_26140_038 Canonical Shared Utility Naming Final Pass

## Scope
- Used PR_26140_037 as the prior delta.
- Removed remaining cosmetic aliases from repo-owned touched code.
- Kept behavior unchanged; no gameplay, runtime, schema, manifest, vendor, generated, archive, report snapshot, or tests/results artifact changes were made.

## Changes
- Replaced Playwright `workspaceV2CoverageReporter as coverageReporter` imports with direct `workspaceV2CoverageReporter` imports/usages in affected browser specs.
- Replaced the `import * as fs from "node:fs/promises"` namespace import in `tests/core/BackgroundImageAndFullscreenBezel.test.mjs` with canonical named fs/promises imports.
- Verified the prior cosmetic coverage reporter alias no longer appears in repo-owned Playwright specs.

## Remaining Intentional Aliases
- `tests/run-tests.mjs`: `run as run...` aliases remain because every test module exports the same `run` function name and the aggregate runner needs distinct callable names.
- `src/engine/**/index.js` and `toolbox/shared/**/index.js`: `export { default as ... }` remains for public barrel APIs that expose default class/module exports under stable named exports.
- `src/shared/index.js`: `export * as shared...` namespace exports remain as intentional top-level shared-family barrels.
- `tests/core/EngineCoreBoundaryBaseline.test.mjs` and `tests/runtime/Phase19OverlayExpansionFramework.test.mjs`: namespace imports remain because these tests validate module/barrel surfaces as namespaces.
- `tests/shared/SharedNumberStringIdCloseout.test.mjs` and `tests/shared/SharedFoundationCombinedPass.test.mjs`: `legacy...` aliases remain to compare legacy compatibility modules against canonical utilities.
- `games/Asteroids/utils/math.js`: `wrap as sharedWrap` remains because the Asteroids local `wrap(value, max)` adapter preserves an existing two-argument gameplay API over the shared three-argument helper.

## Validation
- PASS: changed JavaScript/MJS files passed `node --check`.
- INFO: `npm run build` is not defined in `package.json`.
- PASS: `npm run build:manifest` completed; generated `docs/build/sample-manifest.json` was removed after validation.
- PASS: `node tests\core\BackgroundImageAndFullscreenBezel.test.mjs`.
- PASS: `node tests\games\AsteroidsValidation.test.mjs`.
- PASS: `node tests\games\AsteroidsManifestScreenDimensions.test.mjs`.
- PASS: `node tests\games\AsteroidsPresentation.test.mjs`.
- PASS: `node tests\tools\ObjectVectorFinalRuntimeCleanup.test.mjs`.
- PASS: `node tests\tools\ObjectVectorStudioV2DeleteCleanup.test.mjs`.
- PASS: `npx playwright test tests/playwright/tools/AsteroidsGameSceneCleanup.spec.mjs --project=playwright --workers=1 --reporter=list`.
- PASS: `npx playwright test tests/playwright/tools/ObjectVectorStudioV2FirstClassToolStarter.spec.mjs --project=playwright --workers=1 --reporter=list`.
- PASS: `npx playwright test tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list`.
- PASS: `npx playwright test tests/playwright/games/GameIndexPreviewManifestResolution.spec.mjs --project=playwright --workers=1 --reporter=list`.
- PASS: `npm run test:workspace-v2` (58 passed).
- PASS: `git diff --check` returned no whitespace errors; Git reported line-ending normalization warnings only.
- PASS: `rg -n "workspaceV2CoverageReporter\s+as\s+coverageReporter|\bcoverageReporter\b" tests/playwright -g "*.mjs"` returned no matches.
- PASS: repo-owned alias scan found only the intentional categories documented above:
  - `rg -n "^\s*import\b.*\bas\b|^\s*export\b.*\bas\b" games tools src tests -g "*.js" -g "*.mjs" -g "!**/node_modules/**" -g "!**/tests/results/**" -g "!docs_build/dev/reports/**" -g "!archive/v1-v2/docs_build/archive/**" -g "!tools/Vector Map Editor/**" -g "!**/generated/**" -g "!**/vendor/**" -g "!**/*.min.js"`
- PASS: changed-file guard found no modified node_modules, tests/results, docs_build/dev/reports snapshots, archived tools, generated bundles, vendor files, bundled files, or minified JS files.

## Notes
- Full samples smoke test was not run; this PR is limited to canonical naming cleanup and the requested targeted validations passed.
