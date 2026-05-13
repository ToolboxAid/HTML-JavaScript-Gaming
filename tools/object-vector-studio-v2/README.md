# Object Vector Studio V2

Object Vector Studio V2 is the vector authoring surface for reusable gameplay entities: ships, enemies, pickups, actors, weapons, UI vector assets, and other object-level game pieces.

Tagline: "Build the thing."

The tool folder was copied from `tools/templates-v2/` for `PR_26132_001-add-world-object-vector-studios`. It keeps the copied template CSS and modular control structure intact while giving the new studio its own first-class tool id: `object-vector-studio-v2`.

## Architectural Split

Object Vector Studio V2 owns the thing being placed, animated, reused, equipped, collected, or rendered as an object. World Vector Studio V2 owns the place where those things live.

Use Object Vector Studio V2 for:

- Reusable gameplay entities.
- Ships.
- Enemies.
- Pickups.
- Actors.
- Weapons.
- UI vector assets.
- SVG/vector authoring.
- Primitives, shapes, and path editing.
- Animation-ready structures.

Use World Vector Studio V2 instead for terrain, maps, tile/world geometry, layered scenes, parallax, environment composition, collision/world regions, level layout, spawn placement, and camera zones.

## Migration Direction

- SVG Asset Studio functionality moves toward Object Vector Studio V2.
- Primitive Skin Editor remains deprecated compatibility during the transition.
- Vector Map Editor remains deprecated compatibility during the transition.
- Old tools remain available until replacement workflows are implemented and validated.

## Examples

- Asteroids ship/UFO -> Object Vector Studio V2.
- Weapon icons, pickups, HUD markers, and actor silhouettes: Object Vector Studio V2.
- Platformer level/parallax scene -> World Vector Studio V2.

## Runtime Notes

- The current implementation is the copied Tool Template V2 shell with Object Vector Studio V2 naming and documentation.
- JavaScript and CSS remain external.
- Paint and Stroke modes use selectable palette swatches, click/drag application, Alt-click sampling, and fill/stroke swap/default shortcuts. This model is intended to scale into shaders, gradients, patterns, neon effects, SVG export, and runtime rendering without storing palette data inside object JSON.
- The copied `docs/CONTROL_SERVICE_CONTRACTS.md` and `docs/BATCH_GUARDRAIL_CONTRACT.md` remain the local implementation contracts.
- `docs/OBJECT_VECTOR_STUDIO_V2_REQUIREMENTS.md` captures the future Object Vector Studio V2 requirements and design constraints.

## Validation

This documentation PR has no Playwright impact. Runtime implementation remains future work.
