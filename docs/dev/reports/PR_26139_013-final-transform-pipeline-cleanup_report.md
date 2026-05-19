# PR_26139_013-final-transform-pipeline-cleanup

## Scope
- Consolidated object-vector final transform behavior into shared rendering helpers.
- Added a shared transform pipeline that resolves local shape points through object origin, shape transform, runtime instance rotation/position/scale, world-to-screen scale, and optional user zoom.
- Routed runtime object rendering through the shared world/screen object render helper.
- Routed Collision Inspector V2 viewport rendering through the shared viewport transform helper.
- Routed shared collision geometry through the shared object-vector transform pipeline.
- Routed Object Vector Studio V2 transformed bounds through the shared transformed-bounds helper while keeping editor zoom editor-only.
- Preserved manifest geometry as the SSoT, intentional ship flame flicker, and intentional asteroid scale tuning.

## Runtime Lookup/Transform Path
- Asteroids runtime still supplies explicit manifest object IDs and runtime radians.
- `ObjectVectorRuntimeAssetService` now applies final object placement through `createWorldScreenTransform().applyObjectRenderTransform(...)`.
- Shape-local transform still uses manifest shape transforms and object origin through `applyObjectVectorCanvasTransform(...)`.
- Collision geometry now uses `createObjectVectorTransformPipeline(...).localPointsToWorld(...)` for final transformed points.
- Collision Inspector V2 uses `applyViewportTransform(...)`; user zoom remains additional viewport zoom.
- Object Vector Studio V2 uses shared point and transformed-bounds helpers for preview geometry while preserving editor viewport zoom semantics.

## Shared Helpers Added/Used
- `createObjectVectorTransformPipeline`
- `transformObjectVectorShapePoints`
- `transformObjectVectorInstancePoints`
- `boundsFromObjectVectorPoints`
- `transformedObjectVectorShapeBounds`
- `combineObjectVectorBounds`
- `objectVectorBoundsCornerPoints`
- `applyViewportTransform`
- `applyObjectRenderTransform`
- `worldPointToScreenPoint`
- `worldPointToViewportPoint`

## Precision Note
- The shared bounds helper intentionally does not round final bounds values early. A full Workspace V2 pass caught a 0.004px selection-bound drift when bounds were rounded to 3 decimals inside the helper; rounding now remains a display/reporting concern.

## Validation
- PASS: `node --check src/engine/rendering/OrientationTransform.js`
- PASS: `node --check src/engine/rendering/WorldScreenTransform.js`
- PASS: `node --check src/engine/rendering/ObjectVectorRuntimeAssetService.js`
- PASS: `node --check src/engine/collision/objectVector.js`
- PASS: `node --check tools/collision-inspector-v2/js/CollisionInspectorV2Renderer.js`
- PASS: `node --check tools/object-vector-studio-v2/js/ToolStarterApp.js`
- PASS: `node --check tests/playwright/tools/CollisionInspectorV2.spec.mjs`
- PASS: `npm run build:manifest`
  - Wrote `docs/build/sample-manifest.json`; generated output was removed after validation.
- PASS: `node --input-type=module -e "import('./tests/games/AsteroidsPresentation.test.mjs').then((module) => module.run())"`
- PASS: `node --input-type=module -e "import('./tests/final/PrecisionCollisionSystems.test.mjs').then((module) => module.run())"`
- PASS: `npx playwright test tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list`
  - `4 passed`
  - Validates Collision Inspector V2 transform rendering, shared collision path, Asteroids manifest object loading, runtime/collision placement alignment, bullet heading/orientation, and Object Vector Studio V2 editor-only zoom against shared transform helpers.
- PASS: `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "aligns Object Vector Studio V2 selection bounds to transformed preview geometry"`
  - `1 passed`
  - Validates Object Vector Studio V2 preview selection bounds align to transformed geometry after shared bounds consolidation.
- PASS: `git diff --check HEAD~2`
- PASS: Playwright V8 coverage report generated at `docs/dev/reports/playwright_v8_coverage_report.txt`.

## Workspace V2 Gate
- WARN/FAIL: `npm run test:workspace-v2`
  - Final rerun result: `54 passed`, `2 failed`.
  - Failing tests:
    - `validates optional Text to Speech V2 schema contract through Workspace Manager V2 schema`
    - `tracks Object Vector Studio V2 dirty state through persisted edits and save outcomes`
  - The transform-related Workspace Manager V2 selection-bounds failure from the first run was fixed and rerun successfully.
  - Remaining failures are outside this PR's transform pipeline scope: one expects `text2speech-V2` to remain in Asteroids active context tools, and one expects a generated manifest schema-validation failure that now saves successfully through existing Workspace Manager V2 behavior.

## Full Samples Smoke Test
- Skipped. This PR is limited to shared transform/runtime/tool alignment and does not broadly change the sample loader/framework.

## Manual Test Notes
- Open `games/Asteroids/index.html`, rotate the ship, fire bullets, and verify ship, bullet, asteroid, and UFO placement/orientation remain visually aligned.
- Open `tools/collision-inspector-v2/index.html?manifestPath=/games/Asteroids/game.manifest.json`, choose ship/bullet/asteroid/UFO pairs, change A/B rotation and zoom, and verify origins, heading guides, transformed points, and collision results update consistently.
- Open Object Vector Studio V2, select/rotate transformed shapes, and verify selection bounds track preview geometry while editor zoom remains viewport-only.
