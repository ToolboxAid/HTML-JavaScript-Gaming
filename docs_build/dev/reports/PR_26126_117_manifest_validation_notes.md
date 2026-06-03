# PR_26126_117 Manifest Validation Notes

- Workspace Manager V2 now loads `games/Asteroids/game.manifest.json` as the source-of-truth manifest for Asteroids.
- Workspace Manager V2 validates the loaded manifest before display, launch, and save/export.
- Save/export revalidates the active manifest and blocks on exact schema failures.
- Asset Manager V2 launch uses the loaded manifest from sessionStorage instead of a recreated context.
- `tools/schemas/tools/asset-manager-v2.schema.json` now defines required payload metadata for workspace manifest payloads:
  - `schema`
  - `version`
  - `name`
  - `source`
  - `assets`
- The Workspace Manager V2 Playwright coverage verifies the saved manifest equals the loaded Asteroids manifest.
