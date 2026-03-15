# Move Objects Sample

This sample demonstrates engine-driven object movement with simple boundary response.

It uses:
- `engine/core/gameBase.js`
- `engine/objects/objectDynamic.js`
- `engine/physics/collisionUtils.js`

## Files

- `index.html`: module boot shell
- `global.js`: canvas/fullscreen/performance configs
- `game.js`: sample lifecycle and per-frame update/draw flow
- `circle.js`: moving circle object and boundary response
- `styles.css`: centered sample layout

## Behavior

- A circle moves with randomized initial velocity.
- On boundary hit, velocity reflects and position clamps to remain in-bounds.
- Fullscreen and performance overlays are provided by engine runtime integration.

## Notes

- Movement/bounce demo logic remains sample-local by design.
- Promote helpers to engine only if reused by additional samples/games.
