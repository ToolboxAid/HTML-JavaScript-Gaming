# Asteroids Shared Tool Fallback Removal Report

Task: PR_26133_029-remove-asteroids-shared-tool-fallbacks
Date: 2026-05-14

## Removed Fallbacks

- Removed `toolbox/shared/asteroidsPlatformDemo.js`.
- Removed shared-tool usage of the hardcoded Asteroids SVG constants:
  - `ASTEROIDS_SHIP_SVG`
  - `ASTEROIDS_LARGE_SVG`
  - `ASTEROIDS_MEDIUM_SVG`
  - `ASTEROIDS_SMALL_SVG`
- Removed the Asteroids `BASE_VECTOR_MAP` runtime collision fallback from `games/Asteroids/entities/Asteroid.js`.
- Removed Asteroids-specific object IDs and geometry fixtures from `toolbox/shared/vectorAssetSystem.js`.

## Remaining Manifest Load Path

- Canonical Asteroids geometry remains in `games/Asteroids/game.manifest.json`.
- Runtime/editor geometry source:
  - `game.workspace.tools["object-vector-studio-v2"].objects`
  - object IDs such as `object.asteroids.ship` and `object.asteroids.asteroid.small`
- Asteroid collision profiles are now derived from the validated Object Vector payload passed into `AsteroidsGameScene`.
- Preview SVG generation is covered by `ObjectVectorRuntimeAssetService.createSvgString(...)`, which generates SVG from manifest object geometry at runtime.

## Object ID vs Shape ID

- `object.*` IDs remain the runtime/gameplay identity SSoT.
- Shape IDs such as `ship-hull` and `small-asteroid-ridge` remain local editable IDs inside their owning object.
- Shape IDs are used only for local editing and frame override references; they are not promoted to runtime object identity.

## Validation

- PASS - `npm run test:workspace-v2` completed with 49 passing tests.
- PASS - Manifest Object Vector payload validated through `ObjectVectorRuntimeAssetService`.
- PASS - Focused Asteroids transform and collision probes use geometry derived from `game.manifest.json`.
- PASS - Targeted scans found no hardcoded Asteroids SVG constants in `toolbox/shared`.
- PASS - Targeted scans found no `BASE_VECTOR_MAP` fallback in active Asteroids runtime code.
