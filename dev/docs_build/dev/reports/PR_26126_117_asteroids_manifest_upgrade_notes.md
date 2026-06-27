# PR_26126_117 Asteroids Manifest Upgrade Notes

- Upgraded `games/Asteroids/game.manifest.json` from the older game-manifest wrapper into the current V2 `workspace-manifest` shape.
- The Asteroids manifest now validates against `toolbox/schemas/workspace.manifest.schema.json`.
- Replaced old `tools.asset-browser` with `tools.asset-manager-v2`.
- Replaced old `tools.palette-browser` with `tools.palette-manager-v2`.
- Preserved the Asteroids palette as a direct Palette Manager V2 payload.
- Migrated the existing Asteroids audio, font, background, and bezel assets into schema-valid Asset Manager V2 records.
- Kept paths relative to `games/Asteroids/assets` via `assets/...` paths for preview resolution.
- Deprecated `toolbox/workspace-v2` and sample JSON were not modified.
