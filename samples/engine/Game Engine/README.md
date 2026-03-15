# Game Engine Sample

This sample is the engine template reference for lifecycle flow and state transitions.

## What It Shows
- `GameBase` initialization and frame-loop lifecycle.
- Basic game-state flow: `attract` -> `playerSelect` -> `initGame` -> `playGame` -> `gameOver`.
- Keyboard-driven pause, score, and player-life flow.
- Fullscreen and performance overlays via engine runtime context.

## Controls
- `Enter`: start from attract or restart from game over.
- `P`: pause/unpause during gameplay.
- `S`: add score to the current player.
- `D`: trigger player death/swap flow.

## Optional Query Flags
- `?game` enables sample debug logging.
- `?runTests` runs the engine browser test manifest.

## Notes
- Sample orchestration remains in `game.js`; reusable flow helpers stay in `engine/game/gameUtils.js`.
- Lifecycle cleanup is owned by `GameBase.destroy()` plus the sample `onDestroy()` reset.
