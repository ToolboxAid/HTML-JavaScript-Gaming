# BUILD_PR_ASTEROIDS_VECTOR_MIGRATION

## Purpose
Migrate the flagship Asteroids platform demo to use first-class vector assets as the preferred visual path while preserving all accepted platform boundaries and avoiding engine core API changes.

## Build Scope
- move Asteroids ship rendering preference to first-class vector assets
- migrate asteroid large, medium, and small variants to vector assets
- migrate title/UI framing to vector assets where appropriate
- preserve validation, packaging, runtime, debug, profiler, export, and publishing flows
- keep the gameplay loop and runtime handoff intact
- document temporary fallback behavior clearly

## Implemented Files
- `tools/shared/asteroidsPlatformDemo.js`
- `tools/shared/projectAssetValidation.js`
- `tools/shared/projectPackaging.js`
- `tests/games/AsteroidsPlatformDemo.test.mjs`
- `games/Asteroids/platform/assets/vectors/asteroids-ship.vector.json`
- `games/Asteroids/platform/assets/vectors/asteroids-asteroid-large.vector.json`
- `games/Asteroids/platform/assets/vectors/asteroids-asteroid-medium.vector.json`
- `games/Asteroids/platform/assets/vectors/asteroids-asteroid-small.vector.json`
- `games/Asteroids/platform/assets/vectors/asteroids-title.vector.json`

## Migration Notes
- The demo registry now includes first-class vector assets for the player ship, all asteroid size variants, and the title treatment.
- The demo uses the accepted normalized tool naming baseline:
  - `pixel-asset-studio`
  - `tilemap-studio`
  - `parallax-scene-studio`
  - `vector-asset-studio`
- The packaged demo now treats vector assets as the preferred visual path while preserving the existing sprite atlas as a temporary migration fallback.
- Runtime handoff remains unchanged at `games/Asteroids/main.js#bootAsteroids`, so gameplay behavior and platform entry flow stay intact.

## Temporary Migration Fallback
- `sprite.asteroids-demo` remains packaged and documented as a temporary migration safety path.
- The fallback exists only to preserve rollback safety while vector-led visuals are verified through the accepted validation, packaging, runtime, export, and publishing flows.
- Vector assets are the preferred path and should be treated as the target baseline for future demo/template work.

## Verification
- `node --check tools/shared/asteroidsPlatformDemo.js`
- `node --check tools/shared/projectAssetValidation.js`
- `node --check tools/shared/projectPackaging.js`
- `node --check tests/games/AsteroidsPlatformDemo.test.mjs`
- `node ./scripts/run-node-tests.mjs`
- Result: `107/107` explicit `run()` tests passed.

## Validation Summary
- Demo status: ready
- Validation: valid with `0` blocking findings
- Packaging: ready with `13` assets and `10` dependencies
- Runtime: ready with `13` loaded assets
- Debug: `13` nodes and `10` edges
- Publishing: ready with `5` release targets

## Manual Validation Checklist
1. Ship uses the vector asset path as the preferred visual contract.
2. Asteroid large, medium, and small variants use vector assets as the preferred visual contract.
3. Validation passes with no blocking findings.
4. Packaging includes the migrated vector assets deterministically.
5. Runtime loader reaches ready state with vector assets present.
6. Debug and profiler surfaces reflect vector participation.
7. Gameplay loop remains intact: title, start, play, score, lives, waves, game-over, restart.
8. Temporary sprite fallback is documented clearly.
9. No engine core APIs are changed.
