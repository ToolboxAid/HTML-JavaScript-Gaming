# Object Vector Studio

Object Vector Studio is a First-Class Tool V2 surface for ships, enemies, pickups, actors, and reusable gameplay entities.

The tool folder was copied from `tools/templates-v2/` for `PR_26132_001-add-world-object-vector-studios`. It keeps the copied template CSS and modular control structure intact while giving the new studio its own first-class tool id: `object-vector-studio-v2`.

## Scope

- Ships and player/enemy actor vectors.
- Pickups, hazards, projectiles, and reusable gameplay entities.
- Entity-oriented vector object previews.
- Reusable actor/object art structures for game manifests and future tool payloads.

## Runtime Notes

- The current implementation is the copied Tool Template V2 shell with Object Vector Studio naming and documentation.
- JavaScript and CSS remain external.
- The copied `docs/CONTROL_SERVICE_CONTRACTS.md` and `docs/BATCH_GUARDRAIL_CONTRACT.md` remain the local implementation contracts.
- Primitive Skin Editor and Vector Map Editor remain available, but their active tool tiles are marked deprecated in favor of the new studio split.

## Validation

Targeted validation for this PR is:

`npm run test:workspace-v2`
