# PLAN_PR_LEVEL_8_30_MANIFEST_SSOT_ROLLOUT_ALL_GAMES

## Purpose
Roll the validated Asteroids game-manifest SSoT pattern across the remaining games.

## Scope
- Create or normalize `games/<game>/game.manifest.json` for every game folder.
- Preserve existing runtime catalogs and tool manifests as legacy/derived files.
- Wire all known JSON assets into each game manifest.
- Keep direct game launch behavior separate from Workspace Manager.
- Advance roadmap status only.

## Non-Goals
- No deleting old catalogs yet.
- No broad runtime rewrite.
- No validators.
- No `start_of_day` changes.
