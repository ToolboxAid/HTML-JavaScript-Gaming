# Draw Shapes Sample

This sample demonstrates engine-driven canvas shape rendering primitives.

It uses:
- `engine/core/gameBase.js`
- `engine/core/canvas.js`
- sample rendering logic in `game.js`

## Files

- `index.html`: module boot shell
- `global.js`: canvas/fullscreen/performance config
- `game.js`: shape drawing methods and frame loop
- `styles.css`: centered sample layout

## Behavior

- Draws circles, squares, triangle, oval, grid lines, and layered rectangles each frame.
- Uses engine fullscreen and performance overlays via `GameBase` runtime integration.

## Notes

- Shape methods are intentionally sample-local for readability.
- Consider engine extraction only if these helpers are reused by other samples/games.
