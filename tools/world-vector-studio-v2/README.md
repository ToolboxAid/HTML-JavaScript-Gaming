# World Vector Studio V2

World Vector Studio V2 is the vector authoring surface for terrain, maps, tile/world geometry, layered scenes, parallax, environment composition, collision/world regions, level layout, spawn placement, and camera zones.

Tagline: "Build the place."

The tool folder was copied from `tools/templates-v2/` for `PR_26132_001-add-world-object-vector-studios`. It keeps the copied template CSS and modular control structure intact while giving the new studio its own first-class tool id: `world-vector-studio-v2`.

## Architectural Split

World Vector Studio V2 owns the place: the terrain, map structure, camera regions, spawn regions, collision regions, and layered world composition. Object Vector Studio V2 owns the reusable things that live in that place.

Use World Vector Studio V2 for:

- Terrain.
- Maps.
- Tile/world geometry.
- Layered scenes.
- Parallax.
- Environment composition.
- Collision/world regions.
- Level layout.
- Spawn placement.
- Camera zones.

Use Object Vector Studio V2 instead for reusable gameplay entities, ships, enemies, pickups, actors, weapons, UI vector assets, SVG/vector authoring, primitives/shapes/path editing, and animation-ready structures.

Object Vector Studio V2 asset references are read-only inside World Vector Studio V2. World Vector Studio V2 must not mutate Object Vector Studio V2 source assets; Duplicate As Local in Object Vector Studio V2 is the only allowed detachment path before editing object source data.

## Migration Direction

- Vector Map Editor remains deprecated compatibility during the transition.
- SVG Asset Studio functionality moves toward Object Vector Studio V2, not World Vector Studio V2.

## Examples

- Platformer level/parallax scene -> World Vector Studio V2.
- Asteroids arena background, spawn/camera/collision zones, or layered starfield scene: World Vector Studio V2.
- Asteroids ship/UFO -> Object Vector Studio V2.

## Runtime Notes

- The current implementation is the copied Tool Template V2 shell with World Vector Studio V2 naming and documentation.
- JavaScript and CSS remain external.
- The copied `docs/CONTROL_SERVICE_CONTRACTS.md` and `docs/BATCH_GUARDRAIL_CONTRACT.md` remain the local implementation contracts.

## Validation

This documentation PR has no Playwright impact. Runtime implementation remains future work.
