# BUILD PR — Asteroids New Game Over Screen Timer

## Purpose
Implement the requested behavior exactly on the page being run:

`http://127.0.0.1:5500/games/asteroids_new/index.html`

When the visible **"Game Over" screen** is present, a 30-second timer must begin and then behave exactly as if Enter was pressed.

## Exact Target Files
- `games/asteroids_new/game/AsteroidsGameScene.js`
- `games/asteroids_new/game/AsteroidsSession.js`

## Required Code Changes
1. Find the exact state/condition currently used to show the visible **"Game Over"** screen.
2. Treat that visible screen as the timer trigger:
   - when the Game Over screen becomes visible, start a 30-second timer
   - when it is no longer visible, clear/reset the timer
3. When the timer expires, execute the exact same return path used by pressing Enter on the Game Over screen.
   - do not create a parallel return path
   - reuse the same logic/path as the Enter handler
4. Preserve current manual behavior:
   - pressing Enter on the Game Over screen must still work immediately
5. If the Enter handler is not currently wired to the visible Game Over screen, repair that same wiring in these exact files only.

## Hard Constraints
- exact files only
- do not modify original `games/Asteroids/*`
- do not widen into flow, debug, assets, or unrelated systems
- do not add new files
- do not redesign gameplay
- minimum-fix only: visible Game Over screen -> 30 second timer -> same path as Enter

## Validation Steps
- syntax-check all touched files
- run from:
  `http://127.0.0.1:5500/games/asteroids_new/index.html`
- verify pressing Enter on the visible Game Over screen returns immediately
- verify waiting ~30 seconds on the visible Game Over screen triggers the exact same return behavior
- verify timer does not run during active play
- verify no original `games/Asteroids/*` files changed

## Acceptance Criteria
- the visible Game Over screen is the trigger
- 30 seconds on that screen behaves exactly like Enter was pressed
- Enter still works immediately
- both manual and timed return use the same underlying path
- original Asteroids files remain untouched
