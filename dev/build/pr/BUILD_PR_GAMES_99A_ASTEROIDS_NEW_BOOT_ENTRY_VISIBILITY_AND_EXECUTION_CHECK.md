# BUILD PR — Asteroids New Boot Entry Visibility And Execution Check

## Purpose
The current problem is not gameplay yet — the parallel lane appears not to execute at all, and there are no console messages.
This PR is strictly for boot-entry visibility and execution proof so the game can be confirmed as actually starting.

## Exact Target Files
- `games/asteroids_new/index.js`
- `games/asteroids_new/game/AsteroidsGameScene.js`
- `games/asteroids_new/game/AsteroidsSession.js`
- `games/asteroids_new/game/AsteroidsWorld.js`

## Required Code Changes
1. Add explicit, minimal boot visibility so execution can be confirmed immediately.
2. Ensure `games/asteroids_new/index.js`:
   - visibly proves it is being executed
   - reports the first boot stage reached
3. Ensure the listed downstream files report the first successful construction/entry stage reached.
4. If boot currently exits silently, expose the failure point clearly.
5. Keep all visibility additions minimal and temporary-style in spirit, but committed in code for this PR so the result is testable.

## Hard Constraints
- exact files only
- do not modify any original `games/Asteroids/*` files
- do not widen into assets, debug panels, config, or unrelated systems
- do not redesign runtime flow
- do not fix unrelated gameplay behavior in this PR
- focus only on proving execution path and exposing silent failure points

## Validation Steps
- syntax-check all touched files
- run from `games/asteroids_new/index.js`
- confirm there is now visible proof of execution or a visible failure point
- confirm no original `games/Asteroids/*` files changed

## Acceptance Criteria
- launching `games/asteroids_new/index.js` produces visible execution proof
- if boot fails, the failure point is exposed instead of silent
- original Asteroids files remain untouched
