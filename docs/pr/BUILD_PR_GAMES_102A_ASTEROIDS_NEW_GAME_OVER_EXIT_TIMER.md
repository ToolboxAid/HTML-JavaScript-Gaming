# BUILD PR — Asteroids New Game Over Exit Timer

## Purpose
Add a 30-second automatic exit timer on the `asteroids_new` game-over path, while preserving the existing Enter-to-return behavior.

## Exact Target Files
- `games/asteroids_new/game/AsteroidsGameScene.js`
- `games/asteroids_new/game/AsteroidsSession.js`
- `games/asteroids_new/flow/attract.js`
- `games/asteroids_new/flow/intro.js`

## Required Code Changes
1. Keep the current manual return behavior:
   - pressing Enter still returns to the intro/attract path exactly as it does now

2. Add automatic timeout behavior:
   - when the game reaches game-over state, start a 30-second timer
   - when the timer expires, return to the same intro/attract destination used by the existing Enter path
   - timer should not run during normal gameplay
   - timer should reset/clear cleanly if the player exits earlier with Enter

3. Use the existing `asteroids_new` game/flow wiring only:
   - do not invent a new flow model
   - reuse the current return path and state transitions

## Hard Constraints
- exact files only
- do not modify original `games/Asteroids/*`
- do not change gameplay balance
- do not redesign the game-over flow
- do not add new files
- do not widen into debug, assets, or unrelated systems
- minimum change required: timer + cleanup only

## Validation Steps
- syntax-check all touched files
- verify Enter still returns immediately
- verify game-over auto-returns after ~30 seconds
- verify timer does not trigger during active play
- verify no original `games/Asteroids/*` files changed

## Acceptance Criteria
- `asteroids_new` still returns on Enter from game-over
- `asteroids_new` also returns automatically after 30 seconds on game-over
- no duplicate or conflicting return behavior occurs
- original Asteroids files remain untouched
