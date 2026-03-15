# Game Engine Sample

This sample is the engine template reference for lifecycle flow and state transitions.

## What It Shows
- `GameBase` initialization and frame-loop lifecycle.
- Basic game-state flow: `attract` -> `playerSelect` -> `initGame` -> `playGame` -> `gameOver`.
- Keyboard-driven pause, score, and player-life flow.
- Fullscreen and performance overlays via engine runtime context.
- Debug state-transition logging (`?game`) for onboarding and troubleshooting.

## Controls
- `Enter`: start from attract or restart from game over.
- `P`: pause/unpause during gameplay.
- `S`: add score to the current player.
- `D`: trigger player death/swap flow.

## Optional Query Flags
- `?game` enables sample debug logging.

## Test Runner
- Open `tests/testRunner.html` to run the engine browser test manifest in isolation from game runtime.
- Keep `index.html` focused on gameplay/lifecycle behavior without test-side singleton mutations.

## Notes
- Sample orchestration remains in `game.js`; reusable flow helpers stay in `engine/game/gameUtils.js`.
- Lifecycle cleanup is owned by `GameBase.destroy()` plus the sample `onDestroy()` reset.

## Start A New Game From This Template
1. Copy this folder and rename it to your new game name.
2. Update `index.html` title/header and `global.js` config values.
3. Replace state handlers in `game.js` (`displayAttractMode`, `playGame`, etc.) with game-specific logic.
4. Keep `onInitialize()` and `onDestroy()` ownership clear for listeners/resources.
5. Keep runtime debug behind `?yourGameFlag` and avoid unconditional `console.*` calls.
6. Run smoke pass on load, input flow, pause/resume, restart, and cleanup.

Use [`STARTER_CHECKLIST.md`](./STARTER_CHECKLIST.md) as the final handoff checklist for each new game.
