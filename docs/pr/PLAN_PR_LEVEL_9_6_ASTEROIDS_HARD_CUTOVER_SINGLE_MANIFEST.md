# PLAN_PR_LEVEL_9_6_ASTEROIDS_HARD_CUTOVER_SINGLE_MANIFEST

## Purpose
Finish Asteroids single-manifest consolidation with a hard cutover.

## Target Final State
Asteroids should have exactly one JSON file:

```text
games/Asteroids/game.manifest.json
```

All other Asteroids JSON files must be:
- copied into the manifest as actual JSON data
- loader references updated
- deleted after verification

## Scope
- Asteroids only.
- Inline all Asteroids JSON data into `game.manifest.json`.
- Update Asteroids loaders/runtime references to use manifest-owned data.
- Delete all other `games/Asteroids/**/*.json`.
- Verify direct launch.

## Non-Goals
- No all-games rollout.
- No tool schema redesign.
- No validators.
- No `start_of_day` changes.
