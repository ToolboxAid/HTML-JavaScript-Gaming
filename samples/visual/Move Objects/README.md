# Move Objects Sample

This sample demonstrates engine-driven object movement with simple boundary response inside a cleaner sample shell similar to the updated visual samples.

It uses:
- `engine/core/gameBase.js`
- `engine/core/canvasText.js`
- `engine/objects/objectDynamic.js`
- `engine/physics/collisionUtils.js`

## Files

- `index.html`: module boot shell and sample header
- `global.js`: canvas, fullscreen, performance, and sample UI config
- `game.js`: `GameBase` lifecycle shell, state routing, and stage rendering
- `circle.js`: moving circle object and boundary response
- `styles.css`: centered sample layout and stage presentation

## Behavior

- Starts on an attract screen, then toggles into the movement demo with `Enter` or `Space`.
- Keeps the sample shell in `game.js` while the moving object owns its own motion and bounce behavior in `circle.js`.
- A circle moves with randomized initial velocity.
- On boundary hit, velocity reflects and position clamps to remain in-bounds.
- Fullscreen and performance overlays are provided by engine runtime integration.

## Notes

- Movement/bounce demo logic remains sample-local by design.
- Promote helpers to engine only if reused by additional samples/games.
