# PR_26139_011-shared-world-scale-normalization

## Scope
- Added a shared canonical world/screen transform helper in `src/engine/rendering/WorldScreenTransform.js`.
- Kept Asteroids runtime as the source of truth: object world coordinates map 1:1 to canvas pixels at `CANONICAL_WORLD_TO_SCREEN_SCALE = 1`.
- Moved runtime object render translate/rotate/scale composition in `ObjectVectorRuntimeAssetService` through the shared helper while preserving prior instance scale semantics.
- Updated Collision Inspector V2 to use the shared helper for viewport sizing, canvas CSS sizing, pointer-to-world conversion, and zoom transform composition.
- Kept Collision Inspector zoom as additional user zoom only.
- Kept Object Vector Studio V2 as an editor surface with editor viewport zoom only; added status text that explicitly separates editor zoom from runtime/world scale.
- Preserved intentional asteroid instance scale tuning, ship flame flicker behavior, manifest geometry SSoT, and manifest-only object rendering.

## Prior Reference
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Used current PR_26139_010 implementation and `docs_build/dev/reports/PR_26139_010-collision-inspector-usability-polish_report.md` as the available prior reference.
- Requested `docs_build/dev/reports/PR_26139_010-size-scale-differences_report.md` was not present in this workspace.

## Scale Normalization Rule
- Asteroids runtime: canonical world scale is `1 world unit = 1 canvas pixel`; per-object gameplay/art tuning remains `options.scale`.
- Collision Inspector V2: uses the same canonical world-to-screen transform and manifest screen dimensions; `collisionZoomInput` applies user zoom after canonical world scaling.
- Object Vector Studio V2: uses editor-only viewport/grid zoom for authoring; it does not apply runtime/world scale to the editor work surface.

## Validation
- PASS: `node --check src/engine/rendering/WorldScreenTransform.js`
- PASS: `node --check src/engine/rendering/ObjectVectorRuntimeAssetService.js`
- PASS: `node --check tools/collision-inspector-v2/js/CollisionInspectorV2App.js`
- PASS: `node --check tools/collision-inspector-v2/js/CollisionInspectorV2Controls.js`
- PASS: `node --check tools/collision-inspector-v2/js/CollisionInspectorV2Renderer.js`
- PASS: `node --check tools/object-vector-studio-v2/js/ToolStarterApp.js`
- PASS: `node --check tests/playwright/tools/CollisionInspectorV2.spec.mjs`
- PASS: `npx playwright test tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list`
  - `4 passed`
  - Validates Asteroids runtime canvas scale and Collision Inspector canvas scale.
  - Validates same manifest ship physical size between Asteroids runtime object rendering and Collision Inspector at zoom `1.0`, allowing stroke/antialias bounds tolerance.
  - Validates Collision Inspector zoom remains additional user zoom up to `5x`.
  - Validates Object Vector Studio V2 editor zoom changes without changing shared runtime scale.
  - Validates Workspace Manager V2 launch path still loads Asteroids objects.
- PASS: `npm run build:manifest`
  - This repo does not define a plain `npm run build`; `build:manifest` is the available build script.
  - Removed generated `docs/build` output after validation.
- PASS: `git diff --check`
  - Only existing line-ending conversion warnings were reported.
- PASS: Playwright V8 coverage report generated at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

## Full Samples Smoke Test
- Skipped. This PR is limited to shared scale transform wiring plus targeted Collision Inspector/Object Vector Studio validation.

## Manual Test Notes
- Open `tools/collision-inspector-v2/index.html?manifestPath=/games/Asteroids/game.manifest.json`.
- Verify the ship appears the same physical size as Asteroids runtime at Collision Inspector zoom `1.0`.
- Increase Collision Inspector zoom to `5x`; expected result is zoomed inspection only, with unchanged collision/world coordinates.
- Open Object Vector Studio V2 and use its zoom controls; expected result is editor viewport zoom only, not runtime/world scale changes.
