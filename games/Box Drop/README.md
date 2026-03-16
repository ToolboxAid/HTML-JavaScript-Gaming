# Box Drop

Box Drop is a compact engine game that demonstrates a simple dodge/catch loop with shared player-select, pause, and player-swap flow.

## What It Shows
- `GameBase` lifecycle with attract, player select, play, pause, and game-over states.
- Shared `engine/game/gameUtils.js` helpers for player select and multi-player swap flow.
- Keyboard/controller menu flow with a small gameplay loop kept directly in `game.js`.
- A minimal example of score growth increasing gameplay pressure over time.

## Controls
- `Enter`, `NumpadEnter`, or controller `Start`: begin from attract or restart from game over.
- Player select: keyboard `1`/`2` or controller `Left Bumper`/`Right Bumper`.
- Move: arrow keys or controller D-pad.
- `P` or controller `Select`: pause/unpause.

## Notes
- `game.js` owns the full runtime shell and gameplay loop.
- `global.js` holds canvas, fullscreen, performance, and player-select config.
- This project stays intentionally small and flat so it remains a readable early engine example.
