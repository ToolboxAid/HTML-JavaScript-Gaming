# PLAN_PR_LEVEL_8_28_MANIFEST_SSOT_IMPLEMENTATION_ASTEROIDS_FIRST

## Purpose
Implement the first concrete game manifest SSoT example using Asteroids before applying the pattern to all games.

## Scope
- Create or normalize `games/Asteroids/game.manifest.json` as the single game SSoT.
- Wire currently unreferenced Asteroids JSON assets into the manifest if valid.
- Convert HUD color data into palette/skin-compatible JSON if needed.
- Treat old `workspace.asset-catalog.json` and `tools.manifest.json` as legacy/derived inputs during this PR.
- Advance roadmap status only.

## Non-Goals
- No broad all-games migration yet.
- No runtime rewrite beyond safe manifest/input references.
- No validators.
- No `start_of_day` changes.
- No deletion of old catalogs until parity is verified.
