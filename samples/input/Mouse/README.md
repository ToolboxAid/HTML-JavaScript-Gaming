# Mouse Sample

This sample demonstrates live mouse input tracking using:
- `engine/input/mouse.js`
- direct canvas drawing in `game.js`

Design choice: this sample is intentionally DOM-driven with rendering and mouse orchestration kept in one focused module.

## Files

- `index.html`: sample page shell
- `styles.css`: page and canvas styling
- `game.js`: mouse lifecycle, update loop, and drawing behavior

## Controls

- Move the mouse across the canvas to draw a trail.
- Hold mouse buttons to change draw color:
  - Left: orange
  - Middle: yellow
  - Right: green

## Behavior Notes

- Canvas resolution is synced to display size for accurate mouse scaling.
- Cleanup runs on `pagehide`/`beforeunload` and calls `mouse.destroy()` to remove listeners safely.
