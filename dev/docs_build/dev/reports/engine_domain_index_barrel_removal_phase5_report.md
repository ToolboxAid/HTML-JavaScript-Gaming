# PR_26140_071 Engine Domain Index Barrel Removal Phase 5

## Summary
- Removed the targeted phase 5 engine domain barrel files:
  - `src/engine/physics/index.js`
  - `src/engine/rendering/index.js`
  - `src/engine/runtime/index.js`
  - `src/engine/scene/index.js`
  - `src/engine/tilemap/index.js`
  - `src/engine/world/index.js`
- Replaced active static and dynamic imports from those barrels with direct canonical file imports.
- Kept edits import-only for consumers. No runtime logic, sample JSON, game/sample entry removal, replacement barrels, or pass-through shims were added.
- No edits were made under `src/engine/debug/**` or `src/engine/network/**`.
- The only `src/engine/systems/**` edit is the clarified import-only update to `src/engine/systems/PhysicsSystem.js`.
- `src/engine/core/index.js` remains untouched in this PR.

## Direct Import Mapping
- Physics:
  - `stepArcadeBody` -> `src/engine/physics/arcadeBody.js`
  - `applyDrag` -> `src/engine/physics/drag.js`
  - `integrateVelocity2D` -> `src/engine/physics/integration.js`
  - `integrateVelocity3D` -> `src/engine/physics/integration3d.js`
  - 3D collision helpers -> `src/engine/physics/collision3d.js`
  - `stepSceneBodies3D` -> `src/engine/physics/scene3d.js`
- Rendering:
  - rendering service/classes -> their one-class files under `src/engine/rendering/`
  - sprite/layer/vector helpers -> their owning rendering system files
  - object-vector transform helpers -> `src/engine/rendering/OrientationTransform.js`
  - world-screen helpers -> `src/engine/rendering/WorldScreenTransform.js`
- Runtime:
  - runtime service/classes -> their one-class files under `src/engine/runtime/`
  - `resolvePreferredFullscreenTarget` -> `src/engine/runtime/fullscreenBezel.js`
  - `resolveGameImageConventionPaths` -> `src/engine/runtime/gameImageConvention.js`
  - `createRuntimeMonitoringHooks` -> `src/engine/runtime/RuntimeMonitoringHooks.js`
- Scene:
  - scene classes -> their one-class files under `src/engine/scene/`
  - `DEFAULT_ATTRACT_CONFIG` -> `src/engine/scene/AttractModeController.js`
- Tilemap:
  - `Tilemap` -> `src/engine/tilemap/Tilemap.js`
  - tile render/collision/metadata helpers -> their owning tilemap files
- World:
  - world service/classes -> their one-class files under `src/engine/world/`

## Additional Import Validation Repair
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs` had a dynamic import from `/src/engine/rendering/index.js`; it was updated to direct-import `ObjectVectorRuntimeAssetService.js`.
- `tests/playwright/tools/CollisionInspectorV2.spec.mjs` had dynamic imports from `/src/engine/rendering/index.js`; they were updated to direct rendering files.
- Because `CollisionInspectorV2.spec.mjs` was changed, local import-target validation also surfaced an older dynamic import from the removed collision barrel. It was updated to direct-import `src/engine/collision/objectVector.js` so changed-file import validation stays clean.

## Validation
- PASS: target barrel scan reports `NO_TARGET_BARREL_IMPORTS`.
- PASS: target deletion scan confirms all six targeted `index.js` files no longer exist.
- PASS: no JSON files changed.
- PASS: no `src/engine/debug/**` or `src/engine/network/**` files changed.
- PASS: only `src/engine/systems/PhysicsSystem.js` changed under `src/engine/systems/**`, matching the scope clarification.
- PASS: `node --check` passed for 277 changed existing JS/MJS files.
- PASS: local import target validation passed for 277 changed existing JS/MJS files.
- PASS: `npm run test:workspace-v2` passed 59/59 tests after dynamic rendering imports in the Workspace Manager spec were normalized.
- PASS: targeted affected domain tests passed:
  - `tests/core/Engine2DCapabilityCombinedFoundation.test.mjs`
  - `tests/core/Engine3DPhysicsHookIsolation.test.mjs`
  - `tests/core/EngineCoreBoundaryBaseline.test.mjs`
  - `tests/core/EngineFullscreen.test.mjs`
  - `tests/core/Section1FinalResidueStructure.test.mjs`
  - `tests/final/FinalSystems.test.mjs`
  - `tests/final/FullscreenService.test.mjs`
  - `tests/final/PlatformUxSystems.test.mjs`
  - `tests/render/Renderer.test.mjs`
  - `tests/runtime/RuntimeMonitoringHooks.test.mjs`
  - `tests/scenes/AttractModeController.test.mjs`
  - `tests/world/WorldSystems.test.mjs`
- PASS: `npx playwright test tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list` passed 4/4 tests.
- PASS: `git diff --check` exited 0.
- SKIPPED: full samples smoke test, per PR instruction.
- NOTE: an extra diagnostic run of `tests/games/AsteroidsPlatformDemo.test.mjs` surfaced an out-of-scope existing Node-only failure from browser-root `/src` imports inside `games/Asteroids/game/asteroidsObjectGeometryManifest.js`. That diagnostic is not part of the requested phase 5 validation and no Asteroids runtime imports were changed for it.
