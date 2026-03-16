# Game Controllers Sample

This sample demonstrates gamepad/controller input visualization using:
- `engine/input/controller/gameControllers.js`
- direct canvas rendering in `game.js`

Design choice: this sample is intentionally DOM/canvas-driven and focused on showing real-time controller state.

## Preview

![Game Controllers Sample Preview](./assets/template-preview.svg)

## Files

- `index.html`: sample page shell
- `styles.css`: centered template-style page shell and canvas styling
- `game.js`: controller lifecycle, per-frame updates, and rendering through the public `GameControllers` API

## Controls

- Connect one or more controllers/gamepads.
- Press controller buttons to highlight button indicators.
- Use d-pad to move each player marker.
- Move analog sticks or mapped d-pad axes to observe live named axis values.
- Click the canvas to toggle fullscreen.

## Behavior Notes

- The sample updates controller state each animation frame and renders compact per-controller panels.
- It now reads connection and button state through `GameControllers` helper methods instead of reaching into controller internals directly.
- It renders labeled per-controller panels with mapper-based button labels, named axis values, and device identity text.
- Cleanup is handled on `pagehide`/`beforeunload` and calls `gameControllers.destroy()` plus `Fullscreen.destroy()`.
- Device mapping support and deadzone filtering come from engine controller modules.
