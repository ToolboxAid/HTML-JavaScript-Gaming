# Asteroids Ship State Visual Trace

PR: PR_26140_051-validate-asteroids-ship-state-visuals

## Summary
- Asteroids ship geometry is manifest-owned by `object.asteroids.ship` in `games/Asteroids/game.manifest.json`.
- The manifest ship object defines `idle`, `move`, and `destroyed` states.
- Normal gameplay uses `idle` when the ship is not thrusting and `move` while thrusting.
- The `destroyed` visual state exists in manifest data but is not used by normal gameplay destruction; ship destruction currently uses `ShipDebrisSystem` fragments generated from manifest collision geometry.
- This PR adds a debug-only preview path, `AsteroidsGameScene.debugPreviewShipVisualState(renderer, stateId, options)`, so existing ship states such as `destroyed` can be validated without changing gameplay behavior.

## Manifest Ownership
- `games/Asteroids/game.manifest.json:301`: active ship object id is `object.asteroids.ship`.
- `games/Asteroids/game.manifest.json:486`: ship state `idle`.
- `games/Asteroids/game.manifest.json:554`: ship state `move`.
- `games/Asteroids/game.manifest.json:810`: ship state `destroyed`.
- Manifest state shape counts observed from current data:
  - `idle`: 1 frame, 1 visible shape.
  - `move`: 3 frames, visible shape counts 3, 3, and 5 for flame flicker.
  - `destroyed`: 1 frame, 5 visible shapes.

## Runtime Usage Trace
- `games/Asteroids/game/asteroidsObjectGeometryManifest.js:13`: `ASTEROIDS_OBJECT_GEOMETRY_IDS.ship` resolves to `object.asteroids.ship`.
- `games/Asteroids/game/AsteroidsGameScene.js:720`: live ship render selects `move` when `world.ship.thrusting` and session mode is `playing`; otherwise it selects `idle`.
- `games/Asteroids/game/AsteroidsGameScene.js:793`: HUD lives render with the ship object and `idle` state.
- `games/Asteroids/game/AsteroidsAttractAdapter.js:142` and `236`: attract/demo ship renders use `object.asteroids.ship` with `idle` state.
- `games/Asteroids/game/AsteroidsGameScene.js:148`: normal destruction owns `ShipDebrisSystem`.
- `games/Asteroids/systems/ShipDebrisSystem.js`: destruction fragments are runtime line effects based on manifest ship geometry points, not the manifest `destroyed` state.

## Term Trace
- `idle`: active in gameplay ship, life icons, attract/demo rendering, and manifest state data.
- `move`: active in gameplay ship rendering while thrusting, preserving flicker shape/frame behavior from manifest state data.
- `destroyed`: present in manifest and now previewable by debug validation; not used by normal gameplay destruction.
- `object.asteroids.ship`: active Object Vector Studio V2 manifest object id used by runtime.
- `vector.asteroids.ship`: no active Asteroids runtime usage found; remaining references are non-runtime asset manifest discovery tests.
- `player-ship`: no active Asteroids runtime usage found; remaining reference is a V2 asset-manager test fixture path.

## Validation Result
- Added Playwright validation in `tests/playwright/tools/AsteroidsShipStateVisuals.spec.mjs`.
- Validation confirms live runtime ship render calls use `idle` and `move` for `object.asteroids.ship`.
- Validation confirms normal ship render calls do not use `destroyed`.
- Validation confirms `debugPreviewShipVisualState(renderer, "destroyed")` renders the manifest `destroyed` state successfully through the existing Object Vector runtime.
