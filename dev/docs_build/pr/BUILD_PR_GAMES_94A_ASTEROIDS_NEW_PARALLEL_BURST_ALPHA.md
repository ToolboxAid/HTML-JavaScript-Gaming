# BUILD PR — Asteroids New Parallel Burst Alpha

## Purpose
Accelerate completion of `games/asteroids_new` with one larger exact-file, non-destructive burst.
This PR intentionally combines multiple compatible slices into one Codex run so progress is materially faster.

## Exact Target Files

### Source files (copy from original Asteroids only)
- `games/Asteroids/game/AsteroidsWorld.js`
- `games/Asteroids/debug/asteroidsShowcaseDebug.js`
- `games/Asteroids/entities/Bullet.js`
- `games/Asteroids/entities/Ship.js`

### Destination / touched files
- `games/asteroids_new/index.js`
- `games/asteroids_new/flow/attract.js`
- `games/asteroids_new/flow/intro.js`
- `games/asteroids_new/game/AsteroidsWorld.js`
- `games/asteroids_new/debug/asteroidsShowcaseDebug.js`
- `games/asteroids_new/entities/Bullet.js`
- `games/asteroids_new/entities/Ship.js`

## Required Code Changes
1. Copy these exact source files into the parallel lane:
   - `games/Asteroids/game/AsteroidsWorld.js` -> `games/asteroids_new/game/AsteroidsWorld.js`
   - `games/Asteroids/debug/asteroidsShowcaseDebug.js` -> `games/asteroids_new/debug/asteroidsShowcaseDebug.js`
   - `games/Asteroids/entities/Bullet.js` -> `games/asteroids_new/entities/Bullet.js`
   - `games/Asteroids/entities/Ship.js` -> `games/asteroids_new/entities/Ship.js`

2. Update only these existing parallel-lane files as needed:
   - `games/asteroids_new/index.js`
   - `games/asteroids_new/flow/attract.js`
   - `games/asteroids_new/flow/intro.js`

3. In the destination parallel files listed above, make only the minimum import/path fixes required so the copied files parse and resolve together inside `games/asteroids_new`.

## Hard Constraints
- exact files only
- copy only from original Asteroids files; do not move or delete source files
- do not modify any original `games/Asteroids/*` files
- do not widen into systems, levels, assets, or unrelated entities
- do not refactor gameplay behavior
- preserve copied file behavior exactly except for minimum path/import fixes required in the parallel lane
- no repo-wide cleanup
- no unrelated formatting churn

## Validation Steps
- confirm only the exact target files above changed
- syntax-check:
  - `games/asteroids_new/index.js`
  - `games/asteroids_new/flow/attract.js`
  - `games/asteroids_new/flow/intro.js`
  - `games/asteroids_new/game/AsteroidsWorld.js`
  - `games/asteroids_new/debug/asteroidsShowcaseDebug.js`
  - `games/asteroids_new/entities/Bullet.js`
  - `games/asteroids_new/entities/Ship.js`
- confirm imports across the listed `games/asteroids_new` files resolve cleanly
- confirm no original `games/Asteroids/*` files changed

## Acceptance Criteria
- the copied world, debug, and two-entity slice exist in `games/asteroids_new`
- `games/asteroids_new/index.js` and the two flow files resolve against the parallel lane files
- the listed parallel-lane files parse cleanly together
- original Asteroids files remain untouched
