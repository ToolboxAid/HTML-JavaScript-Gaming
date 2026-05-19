# PR_26139_014-shared-transform-service-extraction

## Scope
- Extracted the finalized object-vector transform pipeline into `ObjectVectorTransformService`.
- Extracted world/screen scale, runtime object render transform, and inspector user zoom handling into `WorldScreenTransformService`.
- Kept existing public helper functions as thin compatibility wrappers so Asteroids runtime, Collision Inspector V2, Object Vector Studio V2, and shared collision code continue using shared engine APIs.
- Preserved Asteroids runtime as the placement/orientation source of truth: runtime object calls still provide world position, radians rotation, and manifest object IDs.
- Preserved Object Vector Studio V2 editor semantics: editor zoom remains viewport/editor-only, while shared runtime/world scale remains independent.
- Preserved manifest geometry as the SSoT, intentional ship flame flicker, and intentional asteroid scale tuning.

## Service Ownership
- `src/engine/rendering/ObjectVectorTransformService.js`
  - Owns local shape point transforms.
  - Owns object origin/pivot handling.
  - Owns manifest shape rotation/scale/translation.
  - Owns runtime instance rotation, scale, and world position transforms.
  - Owns object-vector point/bounds helpers and pipeline creation.
- `src/engine/rendering/WorldScreenTransformService.js`
  - Owns canonical world-to-screen scale.
  - Owns runtime object render transform application.
  - Owns inspector/user viewport zoom.
  - Owns screen/world/viewport point conversion.
- `src/engine/rendering/OrientationTransform.js` and `WorldScreenTransform.js`
  - Now act as compatibility wrappers over the service classes.

## Runtime/Tool Alignment
- Asteroids runtime render path still resolves through `ObjectVectorRuntimeAssetService`, which calls `createWorldScreenTransform(...).applyObjectRenderTransform(...)`.
- Collision Inspector V2 still renders through the shared engine collision path and uses `applyViewportTransform(...)`; at zoom `1.0`, it matches runtime placement/orientation.
- Object Vector Studio V2 preview still uses editor viewport zoom only; its transformed point and bounds checks now validate against the service-backed pipeline.

## Validation
- PASS: `node --check src/engine/rendering/ObjectVectorTransformService.js`
- PASS: `node --check src/engine/rendering/OrientationTransform.js`
- PASS: `node --check src/engine/rendering/WorldScreenTransformService.js`
- PASS: `node --check src/engine/rendering/WorldScreenTransform.js`
- PASS: `node --check src/engine/rendering/index.js`
- PASS: `node --check src/engine/rendering/ObjectVectorRuntimeAssetService.js`
- PASS: `node --check src/engine/collision/objectVector.js`
- PASS: `node --check tools/collision-inspector-v2/js/CollisionInspectorV2Renderer.js`
- PASS: `node --check tools/object-vector-studio-v2/js/ToolStarterApp.js`
- PASS: `node --check tests/playwright/tools/CollisionInspectorV2.spec.mjs`
- PASS: direct module import/service sanity check for `ObjectVectorTransformService` and `WorldScreenTransformService`.
- PASS: `npm run build:manifest`
  - Wrote `docs/build/sample-manifest.json`; generated output was removed after validation.
- PASS: `node --input-type=module -e "import('./tests/games/AsteroidsPresentation.test.mjs').then((module) => module.run())"`
- PASS: `node --input-type=module -e "import('./tests/final/PrecisionCollisionSystems.test.mjs').then((module) => module.run())"`
- PASS: `npx playwright test tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list`
  - `4 passed`
  - Validates manifest object loading, runtime/collision placement alignment, bullet/object orientation, Collision Inspector viewport transforms, and Object Vector Studio V2 editor-only zoom against the extracted services.
- PASS: `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "aligns Object Vector Studio V2 selection bounds to transformed preview geometry"`
  - `1 passed`
  - Validates OVS preview selection bounds still match transformed geometry after service extraction.
- PASS: `git diff --check`
  - Only line-ending conversion warnings were reported.
- PASS: Playwright V8 coverage report generated at `docs/dev/reports/playwright_v8_coverage_report.txt`.

## Workspace V2 Gate
- WARN/FAIL: `npm run test:workspace-v2`
  - Result: `54 passed`, `2 failed`.
  - Failing tests:
    - `validates optional Text to Speech V2 schema contract through Workspace Manager V2 schema`
    - `tracks Object Vector Studio V2 dirty state through persisted edits and save outcomes`
  - These are the same non-transform failures documented in PR_26139_013. The transform-sensitive Workspace Manager V2 / Object Vector Studio V2 selection-bounds test passes.

## Full Samples Smoke Test
- Skipped. This PR extracts shared transform services and validates the impacted runtime/tool paths directly; it does not broadly change sample loading/framework behavior.

## Manual Test Notes
- Open `games/Asteroids/index.html`, rotate the ship, fire bullets, and verify ship, bullet, asteroid, and UFO placement/orientation remain visually aligned.
- Open `tools/collision-inspector-v2/index.html?manifestPath=/games/Asteroids/game.manifest.json`, choose ship/bullet/asteroid/UFO pairs, change rotation and zoom, and verify zoom `1.0` matches runtime placement/orientation.
- Open Object Vector Studio V2, select/rotate transformed shapes, and verify selection bounds track preview geometry while editor zoom remains viewport-only.
