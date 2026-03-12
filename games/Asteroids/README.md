# Asteroids

This folder contains a browser-based Asteroids implementation built on the shared engine in this repository. The game has been refactored so gameplay systems, runtime state, UI, and world ownership are separated into focused folders instead of one flat directory.

Repository: [ToolboxAid/HTML-JavaScript-Gaming](https://github.com/ToolboxAid/HTML-JavaScript-Gaming/)

## Game Summary

The current game supports:

- 1-player and 2-player start flow
- vector-style ship, asteroid, and UFO rendering
- ship thrust, rotation, wrap, and inertia
- asteroid wave progression with large/medium/small splits
- UFO spawning, firing, scoring, and audio
- persistent high score storage via cookies
- attract mode, flash-score transition, pause, game over, and restart flow

## Controls

- `Up`: thrust
- `Left`: rotate counter-clockwise
- `Right`: rotate clockwise
- `Space`: fire
- `P`: pause / unpause during gameplay
- `Enter`: start from attract mode, confirm restart from game over

## Folder Structure

Top-level gameplay surface:

- [`game.js`](https://github.com/ToolboxAid/HTML-JavaScript-Gaming/blob/main/games/Asteroids/game.js): top-level game entry point and state handlers
- [`global.js`](https://github.com/ToolboxAid/HTML-JavaScript-Gaming/blob/main/games/Asteroids/global.js): Asteroids-specific configuration
- [`ship.js`](https://github.com/ToolboxAid/HTML-JavaScript-Gaming/blob/main/games/Asteroids/ship.js): player ship actor
- [`ufo.js`](https://github.com/ToolboxAid/HTML-JavaScript-Gaming/blob/main/games/Asteroids/ufo.js): UFO actor
- [`asteroid.js`](https://github.com/ToolboxAid/HTML-JavaScript-Gaming/blob/main/games/Asteroids/asteroid.js): asteroid actor

Grouped internals:

- [`ui/`](https://github.com/ToolboxAid/HTML-JavaScript-Gaming/tree/main/games/Asteroids/ui): attract scene, attract screen, HUD, pause/game-over screens
- [`runtime/`](https://github.com/ToolboxAid/HTML-JavaScript-Gaming/tree/main/games/Asteroids/runtime): app context, active runtime flow, player session, session controller
- [`state/`](https://github.com/ToolboxAid/HTML-JavaScript-Gaming/tree/main/games/Asteroids/state): state machine and high-score persistence
- [`systems/`](https://github.com/ToolboxAid/HTML-JavaScript-Gaming/tree/main/games/Asteroids/systems): collision, hit resolution, score, and weapon systems
- [`combat/`](https://github.com/ToolboxAid/HTML-JavaScript-Gaming/tree/main/games/Asteroids/combat): bullet, bullet manager, bullet factory
- [`world/`](https://github.com/ToolboxAid/HTML-JavaScript-Gaming/tree/main/games/Asteroids/world): world coordinator plus asteroid/UFO managers

## Main Runtime Flow

The top-level loop lives in [`game.js`](https://github.com/ToolboxAid/HTML-JavaScript-Gaming/blob/main/games/Asteroids/game.js).

High-level responsibilities:

- `game.js` handles frame loop and delegates by game state
- `state/stateMachine.js` owns update/draw dispatch and legal transitions
- `runtime/appContext.js` owns shared Asteroids services and current run state
- `runtime/runtime.js` owns active gameplay update/draw flow
- `runtime/session.js` owns per-player ships, worlds, scores, and lives
- `world/world.js` owns asteroid, UFO, bullet, weapon, collision, and score systems for the current player world

Typical play-state sequence:

1. `attract`
2. `playerSelect`
3. `flashScore`
4. `safeSpawn`
5. `playGame`
6. `pauseGame` or `gameOver` when applicable

## Architectural Notes

The current structure intentionally separates concerns:

- actors do not own world managers
- collision detection is separate from hit resolution
- bullet spawn policy is separate from bullet storage
- score accumulation is separate from world coordination
- HUD and screen presentation are separate from gameplay runtime
- player session state is separate from top-level game orchestration

This makes Asteroids a good reference implementation for how to structure a larger game inside this repository.

## Current Gaps

A few areas are still intentionally marked as incomplete or approximate:

- difficulty scaling does not yet fully match the arcade original
- asteroid-to-asteroid collision is intentionally omitted
- screen shake / hit flash effects are not implemented
- browser-level automated smoke coverage is not in place

See:

- [`requirements.txt`](https://github.com/ToolboxAid/HTML-JavaScript-Gaming/blob/main/games/Asteroids/requirements.txt)
- [`regression-checklist.txt`](https://github.com/ToolboxAid/HTML-JavaScript-Gaming/blob/main/games/Asteroids/regression-checklist.txt)

## Testing

For manual verification after changes, use [`regression-checklist.txt`](https://github.com/ToolboxAid/HTML-JavaScript-Gaming/blob/main/games/Asteroids/regression-checklist.txt).

High-value passes:

- startup and attract mode
- player-select and flash-score flow
- safe spawn and live play
- bullet, asteroid, and UFO interactions
- death, player swap, game over, and restart
- high-score persistence
