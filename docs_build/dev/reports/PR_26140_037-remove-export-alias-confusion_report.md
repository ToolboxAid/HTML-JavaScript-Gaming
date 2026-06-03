# PR_26140_037 Remove Export Alias Confusion Report

## Scope
- Continued PR_26140_036 alias cleanup with a focus on export aliases.
- Removed active non-default export aliases where compatibility was not required.
- Kept behavior unchanged; changes are name-surface cleanup only.
- Did not touch vendor, generated, archive, report snapshot, or `tests/results` files.

## Implementation Summary
- Removed `deepClone as clone` from Collision Inspector V2 constants and imported `deepClone` directly where used.
- Removed `asArray as asObjectArray` from the shared utils barrel; the canonical `asArray` export remains from `arrayUtils`.
- Renamed the promotion helper export source from `getState` to canonical `getPromotionState`, removing `getState as getPromotionState` from the shared state barrel.
- Removed unused compatibility exports `LegacyAttractModeController` and `legacySummary3d`.
- Renamed the Asteroids boot export to canonical `bootAsteroids` and updated active tests/imports away from `bootAsteroidsNew as bootAsteroids`.
- Removed the Pacman `opposite` compatibility export and updated the active ghost controller to use `oppositeCardinalDirection` directly.

## Alias Search Results
Non-default export alias search:

`rg --pcre2 -n "^\\s*export\\s+\\{(?!\\s*default\\b).*\\bas\\b" games tools src -g "*.js" -g "*.mjs" -g "!**/node_modules/**" -g "!**/tests/results/**" -g "!docs_build/dev/reports/**" -g "!docs_build/archive/**"`

Result: no matches.

Broader active import/export `as` search still reports intentional leftovers:

- `games/Asteroids/utils/math.js` keeps `import { wrap as sharedWrap } ...` because this file exposes the Asteroids-specific `wrap(value, max)` adapter over shared `wrap(value, min, max)`. Renaming that public helper or rewriting all consumers is outside this export-alias PR and would change a game utility surface.
- `src/shared/index.js` keeps `export * as sharedMath/sharedUtils/...` namespace exports as the deliberate top-level shared namespace barrel.
- `export { default as ... }` entries in engine/tool barrels remain because default-export modules need named public barrel exports; changing those would require a broad public API migration.

Removed compatibility bridges not actively required:

- `toolbox/collision-inspector-v2/js/constants.js`: `deepClone as clone`.
- `src/shared/utils/index.js`: `asArray as asObjectArray`.
- `src/shared/state/index.js`: `getState as getPromotionState`.
- `src/engine/scene/AttractModeController.js`: `AttractModeController as LegacyAttractModeController`.
- `src/engine/debug/standard/threeD/index.js`: `export * as legacySummary3d`.
- `games/Asteroids/main.js`: `bootAsteroidsNew as bootAsteroids`.
- `games/Pacman/game/PacmanFullAINavigator.js`: `oppositeCardinalDirection as opposite`.

## Validation
- INFO: `npm run build` is not defined in this repo (`Missing script: "build"`).
- PASS: `npm run build:manifest`.
- PASS: changed-file syntax sanity via `node --check` for every changed `.js`/`.mjs` file after fixing the duplicate `asArray` barrel export.
- PASS: `node tests/games/AsteroidsValidation.test.mjs`.
- PASS: `node tests/games/AsteroidsManifestScreenDimensions.test.mjs`.
- PASS: `node tests/games/AsteroidsPresentation.test.mjs`.
- PASS: `node tests/tools/ObjectVectorFinalRuntimeCleanup.test.mjs`.
- PASS: `node tests/tools/ObjectVectorStudioV2DeleteCleanup.test.mjs`.
- INFO: extra `node tests/games/PacmanFullAIValidation.test.mjs` was attempted because Pacman naming changed, but the test cannot resolve existing browser-absolute `/src/...` imports under plain Node (`C:\\src\\engine\\scene\\index.js`).
- INFO: first `npm run test:workspace-v2` run had one transient checkbox interaction miss in the Object Vector Studio V2 shape drawing test; the isolated failing case passed immediately on rerun.
- PASS: final `npm run test:workspace-v2` (58 passed).
- PASS: `npx playwright test tests/playwright/tools/ObjectVectorStudioV2FirstClassToolStarter.spec.mjs --project=playwright --workers=1 --reporter=list` (4 passed).
- PASS: `npx playwright test tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list` (4 passed).
- PASS: `npx playwright test tests/playwright/tools/AsteroidsGameSceneCleanup.spec.mjs --project=playwright --workers=1 --reporter=list` (1 passed).
- PASS: non-default export alias search found no matches.
- PASS: vendor/generated/archive/report snapshot modification check found no matching changed paths.
- PASS: `git diff --check` (CRLF normalization warnings only; no whitespace errors).

## Playwright Impact
Playwright impacted: Yes. Active runtime/tool module surfaces changed for Workspace Manager V2 launch paths, Object Vector Studio V2 validation paths, Collision Inspector V2 manifest cloning, and Asteroids boot naming. Expected pass behavior is unchanged launch/load/render/collision behavior. Expected fail behavior would be module import errors, failed boot, failed tool launch, or broken manifest load; none appeared in final passing runs.

## Coverage
- Advisory Playwright V8 coverage artifacts were refreshed at `docs_build/dev/reports/playwright_v8_coverage_report.txt` and `docs_build/dev/reports/coverage_changed_js_guardrail.txt`.
- Missing changed runtime JS coverage is reported as WARN per project rules, not FAIL.

## Full Samples Smoke
Skipped. This PR is a scoped alias/name-surface cleanup covered by targeted Workspace Manager, Asteroids, Object Vector Studio V2, and Collision Inspector V2 validation; it does not broadly change the sample loader/framework.

## Manual Validation Notes
1. Open Workspace Manager V2, select the repo, and confirm games/tools populate.
2. Launch Object Vector Studio V2 from Workspace Manager V2 and confirm schema-valid load still renders.
3. Launch Collision Inspector V2 and confirm manifest objects load.
4. Launch Asteroids and confirm normal gameplay smoke behavior.
