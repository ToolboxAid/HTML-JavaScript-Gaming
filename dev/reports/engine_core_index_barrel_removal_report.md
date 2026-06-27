# PR_26140_076 Engine Core Index Barrel Removal

## Scope
- Removed `src/engine/core/index.js` barrel usage.
- Replaced active imports from `src/engine/core/index.js` with direct canonical imports.
- Deleted `src/engine/core/index.js` after no active imports remained.
- Import-only/direct-reference edits were limited to affected core tests.
- Did not change schemas.
- Did not touch sample JSON.
- Did not remove sample/game entry `index.js` files.
- Did not create replacement pass-through files.
- Did not move runtime logic or circular dependency logic.

## Target Barrel
- Deleted: `src/engine/core/index.js`

## Direct Import Updates
- `tests/core/Engine2DCapabilityCombinedFoundation.test.mjs`
  - `Engine` now imports directly from `src/engine/core/Engine.js`.
- `tests/core/EngineCoreBoundaryBaseline.test.mjs`
  - Core namespace import was replaced with direct canonical imports:
    - `Engine`
    - `FrameClock`
    - `FixedTicker`
    - `RuntimeMetrics`
    - `EventBus`
    - `Camera2D`
    - `Camera3D`
    - `followCameraTarget`
    - `worldRectToScreen`
  - Existing direct imports in the same test are referenced directly so the test remains executable without the removed namespace barrel.

## Validation
- PASS: `node --check` for the 2 PR76 changed JS/MJS files.
- PASS: direct import target validation for the 2 PR76 changed JS/MJS files.
- PASS: no active references to `engine/core/index.js` remain in repo-owned JS/MJS outside reports/results.
- PASS: `src/engine/core/index.js` no longer exists.
- PASS: `node --input-type=module -e "const m = await import('./tests/core/EngineCoreBoundaryBaseline.test.mjs'); await m.run(); console.log('PASS EngineCoreBoundaryBaseline');"`
- PASS: `node --input-type=module -e "const m = await import('./tests/core/Engine2DCapabilityCombinedFoundation.test.mjs'); await m.run(); console.log('PASS Engine2DCapabilityCombinedFoundation');"`
- PASS: `npm run test:workspace-v2`
  - 59 passed.

## Not Run
- Full samples smoke test was not run.

## Delta ZIP
- `tmp/PR_26140_076-remove-engine-core-index-barrel_delta.zip`
