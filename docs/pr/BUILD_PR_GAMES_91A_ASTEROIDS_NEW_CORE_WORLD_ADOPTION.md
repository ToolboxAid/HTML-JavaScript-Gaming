# BUILD PR — Asteroids New Core World Adoption

## Purpose
Be materially more aggressive by bringing the core Asteroids world into the parallel `asteroids_new` lane while staying non-destructive and exact-file only.

## Exact Target Files
Source:
- `games/Asteroids/game/AsteroidsWorld.js`

Destination / touched:
- `games/asteroids_new/game/AsteroidsWorld.js`
- `games/asteroids_new/index.js`

## Required Code Changes
1. Copy the existing core world file:
   - `games/Asteroids/game/AsteroidsWorld.js`
   - to `games/asteroids_new/game/AsteroidsWorld.js`

2. Update only `games/asteroids_new/index.js` as needed so the parallel lane points at the copied world file.

## Hard Constraints
- exact files only
- copy only; do not move or delete the source file
- do not touch the original Asteroids game wiring
- do not refactor gameplay logic
- preserve behavior exactly inside the copied file
- do not widen into debug, assets, levels, or systems in this PR

## Validation Steps
- confirm only the exact target files changed
- confirm the copied world file is syntax-valid
- confirm `games/asteroids_new/index.js` resolves imports to the copied world file
- confirm original Asteroids files were not modified

## Acceptance Criteria
- `games/asteroids_new/game/AsteroidsWorld.js` exists
- `games/asteroids_new/index.js` points at the copied world file
- original `games/Asteroids/game/AsteroidsWorld.js` remains untouched
