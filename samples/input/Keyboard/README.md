# Keyboard Sample

This sample demonstrates live keyboard input state tracking using:
- `engine/input/keyboard.js`
- render/update loop via `engine/core/gameBase.js`
- canvas drawing via `engine/core/canvas.js`

## Files

- `index.html`: sample page shell
- `styles.css`: page and canvas styling
- `global.js`: sample configuration
- `game.js`: keyboard input orchestration and rendering

## Controls

- Press and hold keys to see:
  - `Keys Just Pressed`
  - `Keys Currently Pressed`
  - `Keys Just Released`
- Press `R` to fill the left rectangle red.
- Press `G` to fill the right rectangle green.

## Behavior Notes

- Keyboard rollover differs by hardware; some key combinations may not register together.
- This sample uses browser keyboard events and is intended for desktop keyboard testing.
