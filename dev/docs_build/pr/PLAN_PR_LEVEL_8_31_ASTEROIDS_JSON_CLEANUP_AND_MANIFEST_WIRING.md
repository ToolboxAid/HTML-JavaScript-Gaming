# PLAN_PR_LEVEL_8_31_ASTEROIDS_JSON_CLEANUP_AND_MANIFEST_WIRING

## Purpose
Clean up Asteroids JSON layout after the game manifest SSoT rollout.

## Scope
- Use `games/Asteroids/game.manifest.json` as SSoT.
- Audit all Asteroids JSON files.
- Remove or deprecate duplicate/legacy files only when safe.
- Convert or delete loose HUD JSON now that `asteroids-hud.palette.json` exists.
- Flatten or document `assets/<tool>/data/*` cleanup path.
- Ensure every remaining Asteroids JSON file is wired by the manifest or explicitly marked legacy/derived.

## Non-Goals
- No all-games rollout in this PR.
- No broad runtime rewrite.
- No validators.
- No `start_of_day` changes.
