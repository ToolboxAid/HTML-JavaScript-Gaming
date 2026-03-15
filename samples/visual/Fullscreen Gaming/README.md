# Fullscreen Gaming Sample

This sample demonstrates engine-managed fullscreen behavior with a visual diagnostics overlay.

It uses:
- `engine/core/gameBase.js`
- `engine/fullscreen.js`
- sample draw/update logic in `game.js`

## Files

- `index.html`: module boot and diagnostics panel markup
- `global.js`: canvas/fullscreen/performance configs
- `game.js`: `GameBase` lifecycle + drawing + diagnostics updates
- `styles.css`: centered sample layout

## Controls

- Click the canvas to toggle fullscreen.
- Press `Esc` to exit fullscreen.

## Behavior Notes

- Fullscreen lifecycle and listeners are owned by engine fullscreen utilities.
- The sample keeps redraw and diagnostics text updates local in `gameLoop()`.
