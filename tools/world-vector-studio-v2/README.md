# World Vector Studio V2

World Vector Studio V2 is a First-Class Tool V2 surface for terrain, tile/world geometry, layered scenes, level/environment layout, and parallax/background structures.

The tool folder was copied from `tools/templates-v2/` for `PR_26132_001-add-world-object-vector-studios`. It keeps the copied template CSS and modular control structure intact while giving the new studio its own first-class tool id: `world-vector-studio-v2`.

## Scope

- Terrain and world-scale vector geometry.
- Tile/world scene layout.
- Layered scene composition.
- Level and environment layout.
- Parallax and background structures.

## Runtime Notes

- The current implementation is the copied Tool Template V2 shell with World Vector Studio V2 naming and documentation.
- JavaScript and CSS remain external.
- The copied `docs/CONTROL_SERVICE_CONTRACTS.md` and `docs/BATCH_GUARDRAIL_CONTRACT.md` remain the local implementation contracts.
- Primitive Skin Editor and Vector Map Editor remain available, but their active tool tiles are marked deprecated in favor of the new studio split.

## Validation

Targeted validation for this PR is:

`npm run test:workspace-v2`
