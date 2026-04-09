# BUILD PR — Asteroids New Testable Vertical Slice (Existing Sources Only)

## Purpose
Recover from the blocked 95A BUILD by producing a smoke-testable `games/asteroids_new` slice using only source files that actually exist in the repo.

## Exact Source Files (copy from original Asteroids only)
- `games/Asteroids/game/AsteroidsWorld.js`
- `games/Asteroids/debug/asteroidsShowcaseDebug.js`
- `games/Asteroids/entities/Bullet.js`
- `games/Asteroids/entities/Ship.js`
- `games/Asteroids/entities/Asteroid.js`
- `games/Asteroids/entities/Ufo.js`

## Exact Destination / Touched Files
- `games/asteroids_new/index.js`
- `games/asteroids_new/flow/attract.js`
- `games/asteroids_new/flow/intro.js`
- `games/asteroids_new/game/AsteroidsWorld.js`
- `games/asteroids_new/debug/asteroidsShowcaseDebug.js`
- `games/asteroids_new/entities/Bullet.js`
- `games/asteroids_new/entities/Ship.js`
- `games/asteroids_new/entities/Asteroid.js`
- `games/asteroids_new/entities/Ufo.js`

## Required Code Changes
1. Copy the listed existing source files into the matching `games/asteroids_new` locations.
2. Use the already-existing `games/asteroids_new/index.js`, `games/asteroids_new/flow/attract.js`, and `games/asteroids_new/flow/intro.js` as the parallel lane boot shell.
3. Make only the minimum import/path adjustments required so this parallel lane can boot as a coherent, smoke-testable vertical slice using the files listed above.
4. Remove any now-unused imports created by the parallel copy process.
5. Do not invent or require missing source files.

## Hard Constraints
- exact files only
- copy only from original Asteroids files; do not move or delete source files
- do not modify any original `games/Asteroids/*` files
- do not require or reference these missing source files:
  - `games/Asteroids/index.js`
  - `games/Asteroids/flow/attract.js`
  - `games/Asteroids/flow/intro.js`
  - `games/Asteroids/entities/Explosion.js`
- do not create new gameplay files beyond the listed destination files
- do not widen into levels, assets, or unrelated systems outside the exact file list
- preserve gameplay behavior as closely as possible
- no repo-wide cleanup
- no unrelated formatting churn

## Validation Steps
- confirm only the exact target files above changed
- syntax-check all touched `games/asteroids_new` files
- confirm imports across the listed `games/asteroids_new` files resolve cleanly
- confirm `games/asteroids_new/index.js` can still be used as a smoke-test entry point
- confirm no original `games/Asteroids/*` files changed

## Acceptance Criteria
- `games/asteroids_new` contains a coherent parallel boot lane with:
  - world
  - flow shell
  - debug shell
  - core entity set based only on existing source files
- the listed `games/asteroids_new` files parse and import cleanly together
- the result is substantial enough for a real smoke test
- original Asteroids files remain untouched
