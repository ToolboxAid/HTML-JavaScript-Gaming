# BUILD PR — Asteroids New Gameplay Slice Completion

## Purpose
Move `games/asteroids_new` beyond runtime smoke stabilization into a genuinely testable gameplay slice.
This PR should complete the minimum gameplay loop needed to observe real in-game behavior, not just boot success.

## Exact Target Files
- `games/asteroids_new/index.js`
- `games/asteroids_new/game/AsteroidsGameScene.js`
- `games/asteroids_new/game/AsteroidsSession.js`
- `games/asteroids_new/game/AsteroidsWorld.js`
- `games/asteroids_new/entities/Asteroid.js`
- `games/asteroids_new/entities/Bullet.js`
- `games/asteroids_new/entities/Ship.js`
- `games/asteroids_new/entities/Ufo.js`
- `games/asteroids_new/systems/ShipDebrisSystem.js`
- `games/asteroids_new/debug/asteroidsShowcaseDebug.js`

## Required Code Changes
1. Make only the minimum gameplay/runtime fixes required so the current `asteroids_new` lane supports a meaningful playable/smoke-testable slice.
2. Focus specifically on:
   - entity update loop alignment
   - bullet/asteroid interaction continuity
   - asteroid lifecycle continuity
   - ship/world/session wiring continuity
3. Remove any now-unused imports created by earlier copy/stabilization work.
4. Use the existing debug shell only as needed to expose current gameplay behavior clearly during smoke testing.

## Hard Constraints
- exact files only
- do not modify any original `games/Asteroids/*` files
- do not add new files
- do not widen into assets, platform data, config, levels, or unrelated systems
- do not redesign gameplay
- do not perform repo-wide cleanup
- minimum-fix gameplay slice completion only

## Validation Steps
- syntax-check all touched `games/asteroids_new` JS files
- perform runtime/import smoke checks from `games/asteroids_new/index.js`
- confirm the current gameplay slice can be exercised meaningfully
- confirm no original `games/Asteroids/*` files changed

## Acceptance Criteria
- `games/asteroids_new` remains runnable from its own index entry
- the touched gameplay files parse and resolve together
- the current vertical slice is meaningfully testable as gameplay, not just boot
- original Asteroids files remain untouched
