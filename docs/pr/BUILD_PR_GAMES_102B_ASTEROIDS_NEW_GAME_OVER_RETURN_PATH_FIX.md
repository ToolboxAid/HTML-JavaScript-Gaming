# BUILD PR — Asteroids New Game Over Return Path Fix

## Purpose
The prior game-over timer PR did not work, and Enter-to-return also did not work.
This PR must repair the actual game-over return path first, then attach the 30-second timeout to that same confirmed path.

## Exact Target Files
- `games/asteroids_new/game/AsteroidsGameScene.js`
- `games/asteroids_new/game/AsteroidsSession.js`
- `games/asteroids_new/flow/attract.js`
- `games/asteroids_new/flow/intro.js`

## Required Code Changes
1. Identify the real current game-over state and the real current return-to-intro/attract path inside the exact files above.
2. Repair Enter-to-return so it actually works from game-over.
3. After Enter-to-return is confirmed in code, add a 30-second automatic timeout that calls the exact same repaired return path.
4. The timer must:
   - start only when game-over is reached
   - reset/clear if the player exits earlier
   - not run during normal play
5. If the existing game-over path never reaches the expected state, fix the minimum state/wiring needed so the return path can execute.

## Hard Constraints
- exact files only
- do not modify original `games/Asteroids/*`
- do not widen into debug, assets, or unrelated systems
- do not add new files
- do not redesign gameplay
- minimum-fix only: repair return path, then attach timeout

## Validation Steps
- syntax-check all touched files
- verify Enter now returns from game-over
- verify idle auto-return happens after ~30 seconds from game-over
- verify timer does not trigger during active play
- verify no original `games/Asteroids/*` files changed

## Acceptance Criteria
- Enter-to-return actually works from game-over
- automatic 30-second return also works from game-over
- both manual and timed return use the same underlying return path
- original Asteroids files remain untouched
