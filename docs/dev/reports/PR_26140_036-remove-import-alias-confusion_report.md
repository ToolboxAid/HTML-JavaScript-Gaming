# PR_26140_036 Remove Import Alias Confusion Report

## Scope
- Removed unnecessary cosmetic `as` aliases from active repo-owned import statements.
- Kept behavior unchanged by switching call sites to the canonical exported names.
- Left export aliases alone where they are public compatibility bridges.
- Did not touch vendor, generated, archive, `tests/results`, or report snapshot files.

## Implementation Summary
- Replaced `deepClone as clone` imports with canonical `deepClone` in Object Vector runtime/collision code, network/session/transport helpers, Asset Manager V2, Text to Speech V2, Workspace Manager V2, and Object Vector Studio V2 schema service code.
- Replaced numeric/text/object helper aliases with canonical imports, including `asFinite`, `asNumber`, `asArray`, `asObject`, `normalizeText`, `isPlainObject`, and `getPromotionState`.
- Removed wrapper-only import aliasing in `src/shared/utils/objectUtils.js` and `src/engine/debug/inspectors/shared/inspectorUtils.js` while preserving their existing exports.
- Replaced Pacman AI's local `reverseDirection` import alias with direct `oppositeCardinalDirection` usage.

## Remaining Import Alias
Search command:

`rg -n "^\\s*import\\b.*\\bas\\b" games tools src -g "*.js" -g "*.mjs" -g "!**/node_modules/**" -g "!**/tests/results/**" -g "!docs/dev/reports/**" -g "!docs/archive/**"`

Remaining intentional import alias:

- `games/Asteroids/utils/math.js:7` keeps `import { wrap as sharedWrap } ...` because this file exports the public Asteroids helper `wrap(value, max)` as a compatibility adapter over shared `wrap(value, min, max)`. Removing this import alias would require renaming the local public export or introducing another indirection, which is outside the PR's behavior-preserving scope.

Intentional export aliases left in place:

- `games/Pacman/game/PacmanFullAINavigator.js` keeps `export { oppositeCardinalDirection as opposite }` as a public compatibility bridge; the PR scope allows export aliases where intentional.

## Validation
- INFO: `npm run build` is not defined in this repo (`Missing script: "build"`).
- PASS: `npm run build:manifest`.
- PASS: `node tests/games/AsteroidsValidation.test.mjs`.
- PASS: `node tests/games/AsteroidsManifestScreenDimensions.test.mjs`.
- PASS: `node tests/games/AsteroidsPresentation.test.mjs`.
- PASS: `node tests/games/AsteroidsVectorTransforms.test.mjs`.
- PASS: `node tests/tools/ObjectVectorFinalRuntimeCleanup.test.mjs`.
- PASS: `node tests/tools/ObjectVectorStudioV2DeleteCleanup.test.mjs`.
- PASS: `npm run test:workspace-v2` (58 passed).
- PASS: `npx playwright test tests/playwright/tools/ObjectVectorStudioV2FirstClassToolStarter.spec.mjs --project=playwright --workers=1 --reporter=list` (4 passed).
- PASS: `npx playwright test tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list` (4 passed).
- PASS: `npx playwright test tests/playwright/tools/AsteroidsGameSceneCleanup.spec.mjs --project=playwright --workers=1 --reporter=list` (1 passed).
- PASS: `npx playwright test tests/playwright/games/GameIndexPreviewManifestResolution.spec.mjs --project=playwright --workers=1 --reporter=list` (4 passed, added because `games/index.render.js` import naming changed).
- PASS: changed-file syntax sanity via `node --check` for every changed `.js`/`.mjs` file.
- PASS: remaining import alias search, with only the documented Asteroids `wrap` bridge left.
- PASS: vendor/generated/archive/report snapshot modification check found no matching changed paths.
- PASS: `git diff --check` (CRLF normalization warnings only; no whitespace errors).

## Playwright Impact
Playwright impacted: Yes. Active runtime/tool JavaScript import names changed across Workspace Manager V2, Object Vector Studio V2, Collision Inspector V2, Asteroids runtime paths, and games index rendering. Expected pass behavior is unchanged launch/load/render/collision/navigation behavior. Expected fail behavior would be module import errors, page errors, failed tool launch, or broken manifest-driven render/collision paths; none appeared in validation.

## Coverage
- Advisory Playwright V8 coverage artifacts were refreshed at `docs/dev/reports/playwright_v8_coverage_report.txt` and `docs/dev/reports/coverage_changed_js_guardrail.txt`.
- Missing changed runtime JS coverage is reported as WARN per project rules, not FAIL.

## Full Samples Smoke
Skipped. This PR is a scoped import-name cleanup with targeted Workspace Manager, Asteroids, Object Vector Studio V2, Collision Inspector V2, and games-index validation; it does not broadly change the sample loader/framework.

## Manual Validation Notes
1. Open Workspace Manager V2, select the repo, and confirm games and tools populate.
2. Launch Object Vector Studio V2 and Collision Inspector V2 from Workspace Manager V2.
3. Launch Asteroids and confirm normal gameplay smoke behavior.
4. Open `games/index.html` and confirm game cards/previews still render.
