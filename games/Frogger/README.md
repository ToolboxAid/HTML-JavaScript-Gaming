# Frogger

Frogger is a larger engine-driven game example that combines shared runtime flow with project-specific world, object, and UI systems.

## What It Shows
- `GameBase` lifecycle with attract, player select, play, pause, and game-over states.
- Shared `engine/game/gameUtils.js` helpers for player select and player-swap flow.
- Dedicated game content through `gameObjects/`, `levelData.js`, `levelManager.js`, and `gameUI.js`.
- Keyboard/controller menu flow with controller D-pad movement support in gameplay.

## Controls
- `Enter`, `NumpadEnter`, or controller `Start`: begin from attract or restart from game over.
- Player select: keyboard `1`/`2` or controller `Left Bumper`/`Right Bumper`.
- Move frog: arrow keys or controller D-pad.
- `P` or controller `Select`: pause/unpause.
- `D` or controller `B`: trigger the current temporary player-death test flow.

## Notes
- `game.js` owns the top-level runtime shell.
- `attractMode.js`, `levelManager.js`, and `gameUI.js` hold larger game-specific behavior outside the main loop.
- This project is a stronger example of when a game benefits from dedicated content/object modules instead of a flat single-file structure.
