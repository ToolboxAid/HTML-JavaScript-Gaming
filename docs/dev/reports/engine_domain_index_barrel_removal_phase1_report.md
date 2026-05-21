# PR_26140_067 Engine Domain Index Barrel Removal Phase 1

## Summary
- Removed the targeted engine domain barrel files:
  - `src/engine/camera/index.js`
  - `src/engine/collision/index.js`
  - `src/engine/input/index.js`
  - `src/engine/theme/index.js`
- Replaced active imports and re-exports from those barrels with direct canonical file imports.
- Kept scope to import/export wiring only; no runtime logic, sample JSON, or entry file removal was changed.
- Applied the user's scope clarification for import-only edits in `games/Asteroids/index.js`, `samples/**/index.js`, `src/engine/core/Engine.js`, and `src/engine/core/index.js`.

## Direct Import Mapping
- Camera:
  - `Camera2D` -> `src/engine/camera/Camera2D.js`
  - `Camera3D` -> `src/engine/camera/Camera3D.js`
  - `followCameraTarget`, `worldRectToScreen` -> `src/engine/camera/CameraSystem.js`
  - `updateZoneCamera` -> `src/engine/camera/ZoneCameraSystem.js`
- Collision:
  - AABB helpers -> `src/engine/collision/aabb.js`
  - polygon helpers -> `src/engine/collision/polygon.js`
  - raster helpers -> `src/engine/collision/raster.js`
  - hybrid helpers -> `src/engine/collision/hybrid.js`
  - Object Vector collision helpers -> `src/engine/collision/objectVector.js`
- Input:
  - input services/maps/adapters -> their one-class files under `src/engine/input/`
  - `drawActionInputDebugOverlay` -> `src/engine/input/ActionInputDebugOverlay.js`
- Theme:
  - header helpers -> `src/engine/theme/toolboxaid-header.js`
  - `Theme` -> `src/engine/theme/Theme.js`
  - `ThemeTokens` -> `src/engine/theme/ThemeTokens.js`

## Validation
- PASS: target barrel scan reports `remaining targeted barrel imports/exports: 0`.
- PASS: target deletion scan reports `deleted targeted index files: 4/4`.
- PASS: no JSON files changed.
- PASS: `node --check` passed for 567 changed existing JS/MJS files.
- PASS: local import target validation passed for 567 changed existing JS/MJS files.
- PASS: `npm run test:workspace-v2` passed 59/59 tests.
- PASS: targeted affected engine/final tests passed:
  - `tests/core/Engine2DCapabilityCombinedFoundation.test.mjs`
  - `tests/core/Engine3DPhysicsHookIsolation.test.mjs`
  - `tests/core/EngineCoreBoundaryBaseline.test.mjs`
  - `tests/core/EngineSceneLifecycle.test.mjs`
  - `tests/core/Section1FinalResidueStructure.test.mjs`
  - `tests/final/PlatformUxSystems.test.mjs`
  - `tests/final/PrecisionCollisionSystems.test.mjs`
- PASS: `npm run test:launch-smoke:games` passed 12/12 game entries.
- PASS: `git diff --check` exited 0. Git emitted advisory line-ending warnings for touched test `.mjs` files only.
- INFO: extra `npm test` was attempted as a broader engine check; it stopped on an existing unrelated missing import, `games/Asteroids/game/FullscreenBezelOverlay.js`, from `tests/games/FullscreenBezelOverlay.test.mjs`.
- SKIPPED: full samples smoke test, per PR instruction.

## Side Effects Cleaned
- `npm run test:launch-smoke:games` created `tmp/node_modules`; it was removed after validation so `tmp/` is reserved for the final delta ZIP.
- `docs/dev/reports/launch_smoke_report.md` was restored to its pre-validation content and is not part of this PR.
