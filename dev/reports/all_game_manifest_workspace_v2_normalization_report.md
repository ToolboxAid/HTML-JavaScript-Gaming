# PR_26140_120 - Normalize All Game Manifests For Workspace V2

## Summary

Normalized every `games/**/game.manifest.json` so Workspace Manager V2 can synthesize a valid manifest/toolState context without missing required tool payloads. No schemas or sample JSON files were changed.

## Manifest Changes

- Added `tools.palette-manager-v2` where it was missing, using manifest-local editable Palette Manager V2 payloads.
- Added `tools.input-mapping-v2` where it was missing, using the existing Input Mapping V2 tool-local contract:
  - `toolId: input-mapping-v2`
  - `version: 1`
  - `engineInputModel: src/engine/input/InputMap`
  - the shared 18 action entries with empty `inputs` arrays.
- Left Asteroids unchanged because it already had valid `palette-manager-v2` and `input-mapping-v2` payloads.
- Updated the Workspace Manager V2 Playwright manifest test so Gravity Well and Pong now assert the expected `input-mapping-v2` payload in their generated workspace contexts.

## Palette Sources

- Copied existing game palette assets into manifest payloads for Bouncing-ball, Breakout, SolarSystem, SpaceDuel, SpaceInvaders, and vector-arcade-sample.
- Preserved existing manifest palettes for GravityWell, Pong, Asteroids, and _template.
- Derived AI Target Dummy palette colors only from canvas/render source in `games/AITargetDummy/game/*.js`.
- Derived Pacman palette colors only from canvas/render source in `games/Pacman/game/*.js`.
- No DOM/CSS scraping, silent fallback palette, or hidden default palette was introduced.

## Validation

- Targeted JSON/schema + Workspace Manager V2 manifest/toolState contract validation: PASS for 12 manifests.
- Bouncing-ball validation confirmed no `root.tools.palette-manager-v2 is required` failure.
- Confirmed every game manifest has valid `palette-manager-v2`, `asset-manager-v2`, and `input-mapping-v2` tool payloads.
- Confirmed Workspace Manager V2 can produce an Input Mapping V2 launch URL for each manifest context.
- Focused reruns for the two transient Input Mapping V2 failures from the first long suite run passed individually.
- `npm run test:workspace-v2`: PASS, 71 passed.

## Notes

- A first short `npm run test:workspace-v2` attempt hit the command timeout before completion.
- The first full suite run exposed a stale Gravity/Pong test expectation and two transient Input Mapping V2 failures. The stale expectation was updated, the focused transient reruns passed, and the final full suite passed.
- Full samples smoke test was not run, per request.
