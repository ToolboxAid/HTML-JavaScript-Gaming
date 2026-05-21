# PR_26140_074 Engine Systems Index Barrel Removal Phase 1

## Scope
- Removed only the targeted `src/engine/systems/index.js` barrel.
- Replaced active imports from the systems barrel with direct canonical imports.
- Import-only edits were made where required.
- Did not change schemas.
- Did not touch sample JSON.
- Did not remove sample/game entry `index.js` files.
- Did not remove `src/engine/core/index.js`.
- Stopped before core cleanup.

## Target Barrel
- Deleted: `src/engine/systems/index.js`

## Direct Import Updates
- `samples/phase-01/0116/ECSMovementSystemScene.js`
- `samples/phase-01/0117/ECSInputSystemScene.js`
- `samples/phase-01/0118/ECSCollisionSystemScene.js`
- `samples/phase-01/0119/ECSRenderSystemScene.js`
- `samples/phase-01/0120/ECSSceneWorldScene.js`
- `samples/phase-01/0121/UIOverlayScene.js`
- `samples/phase-01/0122/EntityLifecycleScene.js`
- `samples/phase-01/0123/DebugStatsScene.js`
- `samples/phase-01/0124/DataDrivenWorldScene.js`
- `samples/phase-02/0210/ProjectileSystemScene.js`
- `samples/phase-02/0212/PlayableMicroLevelScene.js`
- `samples/phase-02/0218/PolishedPlayableSliceScene.js`
- `samples/phase-02/0225/game/ProjectileLabModel.js`
- `samples/phase-03/0301/RealSpriteRenderingScene.js`
- `samples/phase-03/0302/AnimationSystemScene.js`
- `samples/phase-03/0303/PhysicsSystemScene.js`
- `samples/phase-03/0304/CollisionResolutionScene.js`
- `samples/phase-03/0305/TileMetadataScene.js`
- `samples/phase-03/0306/NESStyleZonesParallaxScene.js`
- `samples/phase-16/1601/CubeExplorer3DScene.js`
- `samples/phase-16/1602/MazeRunner3DScene.js`
- `samples/phase-16/1603/FirstPersonWalkthroughScene.js`
- `samples/phase-16/1604/Platformer3DBasicsScene.js`
- `samples/phase-16/1605/DrivingSandbox3DScene.js`
- `samples/phase-16/1608/DungeonCrawler3DScene.js`
- `tests/core/Engine2DCapabilityCombinedFoundation.test.mjs`
- `tests/core/EngineCoreBoundaryBaseline.test.mjs`

## Validation
- PASS: `node --check` for the 27 PR74 changed JS/MJS files.
- PASS: direct import target validation for the 27 PR74 changed JS/MJS files.
- PASS: no active references to `engine/systems/index.js` remain in repo-owned JS/MJS outside reports/results.
- PASS: `src/engine/systems/index.js` no longer exists.
- PASS: `npm run test:workspace-v2`
  - 59 passed.

## Not Run
- Full samples smoke test was not run.

## Delta ZIP
- `tmp/PR_26140_074-remove-engine-systems-index-barrels-phase1_delta.zip`
