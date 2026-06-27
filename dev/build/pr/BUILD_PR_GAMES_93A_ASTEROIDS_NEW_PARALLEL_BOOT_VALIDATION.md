# BUILD PR — Asteroids New Parallel Boot Validation

## Purpose
Close the aggressive parallel adoption burst with a focused validation/fix PR for `asteroids_new`.

## Exact Target Files
- `games/asteroids_new/index.js`
- `games/asteroids_new/flow/attract.js`
- `games/asteroids_new/flow/intro.js`
- `games/asteroids_new/game/AsteroidsWorld.js`
- `games/asteroids_new/entities/Bullet.js`
- `games/asteroids_new/entities/Ship.js`
- `games/asteroids_new/debug/asteroidsShowcaseDebug.js`

## Required Code Changes
- make only the minimum fixes required so the current parallel lane files import/parse cleanly together
- remove any now-unused imports created by earlier parallel-copy PRs

## Hard Constraints
- exact files only
- no new files
- no widening to original Asteroids files
- no behavior refactor
- no gameplay redesign
- this is validation/minimum-fix work only

## Validation Steps
- syntax-check each touched parallel lane file
- confirm imports across the listed parallel files resolve
- confirm no original Asteroids files changed

## Acceptance Criteria
- the listed `asteroids_new` files parse cleanly
- imports across the listed `asteroids_new` files resolve cleanly
- no original Asteroids files were changed
