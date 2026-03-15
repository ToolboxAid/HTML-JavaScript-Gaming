# Solar System Sample

This sample is an engine-driven orbit simulation that now lives under `samples/visual/` as a reference for `GameBase` state flow, `GameObjectSystem` ownership, and camera-style focus behavior.

## What It Shows
- `GameBase` lifecycle setup for a compact engine sample.
- Engine-owned keyboard input through `KeyboardInput`.
- `GameObjectSystem` ownership for active celestial bodies.
- Simple state flow: `attract` -> `simulation` -> `paused`.
- Camera-style focus and zoom behavior without adding a separate camera abstraction.
- A cleaner visual sample shell around an engine-driven simulation.

## Controls
- `Enter` or `Space`: start the simulation from attract mode.
- `P`: pause or resume.
- `R`: reset the simulation bodies.
- `+` or `=`: increase simulation speed.
- `-`: decrease simulation speed.
- `O`: toggle orbit rings.
- `L`: toggle body labels.
- `[` and `]`: zoom out or in.
- `,` and `.`: cycle focus backward or forward.

## Files
- `game.js`: sample shell, state flow, input handling, and update loop orchestration.
- `global.js`: canvas, fullscreen, performance, control, and display config.
- `celestialBody.js`: simulation object model and draw/update behavior.
- `celestialBodyState.js`: sample-local orbit, moon, and body state helpers used by `CelestialBody`.
- `celestialBodyRender.js`: sample-local body rendering helpers used by `CelestialBody`.
- `solarSystemData.js`: body definitions for the sample system.
- `solarSystemRuntime.js`: sample-local simulation helpers for world setup/teardown, system reset, body creation, focus, body rendering, and render math.
- `solarSystemHud.js`: sample-local HUD drawing and full screen-render composition helpers.
- `solarSystemControls.js`: sample-local control and state transition logic.
- `solarSystemStateHandlers.js`: sample-local state handler wiring between controls and screen rendering.

## Run It
- Open `samples/visual/Solar System/index.html` from the repo launcher, or
- Start a local web server from the repo root and browse to `/samples/visual/Solar System/`.

## Notes
- This sample is intended to stay small and readable so it can serve as an engine example rather than a full game.
- `GameObjectSystem` owns the active bodies, while the sample shell stays focused on input, state, update, and render flow.
- Orbit math and body rendering remain sample-local for now; nothing here is shared widely enough to justify moving it into `engine/` yet.
- The moon layout is intentionally simplified, but it now follows the broad real-world pattern more closely: Mercury and Venus have no moons, Earth has one, Mars has two, and the outer planets show a few representative major moons.
