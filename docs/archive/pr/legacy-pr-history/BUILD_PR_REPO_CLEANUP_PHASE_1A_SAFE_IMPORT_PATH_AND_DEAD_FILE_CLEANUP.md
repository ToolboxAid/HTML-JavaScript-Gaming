# BUILD_PR: REPO_CLEANUP_PHASE_1A_SAFE_IMPORT_PATH_AND_DEAD_FILE_CLEANUP

## Summary
This PR applies a narrow cleanup slice:
- fixes case-sensitive test imports for `bouncing-ball`, `breakout`, and `pong`
- removes one dead local re-export file duplicated by the engine

## Files changed
- `tests/games/BouncingBallValidation.test.mjs`
- `tests/games/BouncingBallWorld.test.mjs`
- `tests/games/BreakoutValidation.test.mjs`
- `tests/games/BreakoutWorld.test.mjs`
- `tests/games/PongAudio.test.mjs`
- `tests/games/PongValidation.test.mjs`
- `tests/games/PongWorld.test.mjs`

## Files removed
- `samples/sample028-asset-registry/assetRegistry.js`

## Validation
- `npm run build:manifest`
- `npm test`
