# Starter Game Manifest Template

This template is a minimal reusable game manifest for Workspace Manager V2 and First-Class Tool V2 launch validation.

## Purpose
- provide the current `html-js-gaming.game-manifest` structure
- keep tool payloads under root `tools`
- avoid gameplay-specific runtime or sample dependencies

## Open flow
1. Open Workspace Manager V2.
2. Import or load `tools/_templates-v2/starter-project-template/config/starter.game.manifest.json`.
3. Use the generated toolState context to validate starter tool wiring.

## Shared references used
- manifest: `tools/_templates-v2/starter-project-template/config/starter.game.manifest.json`
- palette source: `tools/_templates-v2`

## Notes
- The template manifest intentionally has an empty Asset Manager V2 registry.
- The template manifest contains no game-specific runtime references.
- Sample launch validation remains out of scope until sample JSON alignment is complete.
