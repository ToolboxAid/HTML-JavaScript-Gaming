# BUILD PR — Asteroids New Runtime Smoke Stabilization

## Purpose
Now that `games/asteroids_new` has the intended folder structure and import smoke checks are passing, make the parallel lane actually runnable as a smoke-testable game entry with the minimum runtime fixes required.

## Exact Target Files
- `games/asteroids_new/index.js`
- `games/asteroids_new/flow/attract.js`
- `games/asteroids_new/flow/intro.js`
- `games/asteroids_new/game/AsteroidsAttractAdapter.js`
- `games/asteroids_new/game/AsteroidsGameScene.js`
- `games/asteroids_new/game/AsteroidsSession.js`
- `games/asteroids_new/game/AsteroidsWorld.js`
- `games/asteroids_new/debug/asteroidsShowcaseDebug.js`
- `games/asteroids_new/entities/Asteroid.js`
- `games/asteroids_new/entities/Bullet.js`
- `games/asteroids_new/entities/Ship.js`
- `games/asteroids_new/entities/Ufo.js`
- `games/asteroids_new/systems/AsteroidsAudio.js`
- `games/asteroids_new/systems/AsteroidsHighScoreService.js`
- `games/asteroids_new/systems/AsteroidsInitialsEntry.js`
- `games/asteroids_new/systems/HighScoreStore.js`
- `games/asteroids_new/systems/ShipDebrisSystem.js`
- `games/asteroids_new/utils/math.js`

## Required Code Changes
1. Use `games/asteroids_new/index.js` as the smoke-test entry point.
2. Make only the minimum runtime/import/path fixes required so the listed `games/asteroids_new` files can boot together as a parallel Asteroids lane.
3. Remove any now-unused imports created by the earlier copy/flatten work.
4. Keep behavior as close as possible to the copied original Asteroids implementation.

## Hard Constraints
- exact files only
- do not modify any original `games/Asteroids/*` files
- do not widen into assets, platform data, config, levels, or ui in this PR
- do not add new gameplay systems
- do not refactor for style
- do not broaden into repo-wide cleanup
- minimum-fix stabilization only

## Validation Steps
- syntax-check all touched `games/asteroids_new` JS files
- perform import/runtime smoke checks using `games/asteroids_new/index.js`
- confirm no original `games/Asteroids/*` files changed

## Acceptance Criteria
- `games/asteroids_new/index.js` is a real smoke-test entry point
- the listed `games/asteroids_new` runtime files parse and resolve together
- the parallel Asteroids lane is runnable enough for a meaningful smoke test
- original Asteroids files remain untouched
