# Fullscreen Gaming Sample

This sample demonstrates engine-managed fullscreen behavior with a template-style sample shell and a DOM-based diagnostics panel.

It uses:
- `engine/core/gameBase.js`
- `engine/fullscreen.js`
- sample state routing in `game.js`
- DOM diagnostics ownership in `gameDom.js`

## Files

- `index.html`: module boot, canvas container, and diagnostics panel markup
- `global.js`: canvas, fullscreen, performance, and sample UI configs
- `game.js`: `GameBase` lifecycle shell, state routing, canvas rendering, input, and cleanup
- `gameDom.js`: DOM metrics lookup and text updates
- `styles.css`: page layout and diagnostics presentation

## Controls

- `Enter` or `Space`: toggle between attract mode and live diagnostics.
- Click the canvas to toggle fullscreen.
- Press `Esc` to exit fullscreen.

## Behavior Notes

- Fullscreen lifecycle and listeners are owned by engine fullscreen utilities.
- The sample now mirrors the `Game Engine` template structure without adding gameplay-only concepts.
- Diagnostics intentionally stay in the DOM so window, document, and layout changes are easy to inspect while fullscreen changes occur.
