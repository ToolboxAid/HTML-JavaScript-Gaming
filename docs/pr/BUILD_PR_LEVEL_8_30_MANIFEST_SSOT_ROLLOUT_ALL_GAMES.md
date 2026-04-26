# BUILD_PR_LEVEL_8_30_MANIFEST_SSOT_ROLLOUT_ALL_GAMES

## Objective
Apply the Asteroids SSoT manifest pattern to all game folders.

## Source Pattern
Use the validated Asteroids direction:
- game preview launches game directly
- Workspace Manager is optional
- game manifest is SSoT
- legacy catalogs remain until parity is proven

## Required Game Manifest
For each game folder under `games/<game>/`, create or normalize:

```text
games/<game>/game.manifest.json
```

## Manifest Should Own
- game id
- display name
- version
- direct launch path
- optional Workspace Manager path/action
- palettes
- skins
- sprites
- vectors
- tilemaps
- parallax data
- overlays/bezel/layout overrides
- tool payload/data refs
- legacy catalog references as deprecated/derived only if still present

## Inputs To Read Per Game
- `games/<game>/assets/workspace.asset-catalog.json`
- `games/<game>/assets/tools.manifest.json`
- all `games/<game>/**/*.json`
- existing runtime/bootstrap/config JSON

## Rules
- Do not delete old `workspace.asset-catalog.json`.
- Do not delete old `tools.manifest.json`.
- Mark old catalogs as legacy/derived in report.
- Do not embed palette data in tool payloads.
- Normalize opaque alpha colors:
  - `#RRGGBBFF` -> `#RRGGBB`
- Direct launch remains the preview behavior.
- Workspace Manager remains an explicit separate action.

## Report
Create:

```text
docs/dev/reports/level_8_30_all_games_manifest_ssot_rollout_report.md
```

Report per game:
- manifest created/updated
- assets wired
- unreferenced JSON remaining
- legacy catalog files retained
- direct launch path present
- Workspace Manager action present or deferred

## Roadmap Movement
Update `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` status only:
- advance all-games SSoT rollout item `[ ] -> [.]` or `[.] -> [x]`
- advance direct launch separation item `[.] -> [x]` if 8.29B remains valid
- no prose rewrite/delete

## Acceptance
- Every game folder has `game.manifest.json`.
- Each manifest references known JSON assets or reports why deferred.
- Legacy catalogs are retained.
- No runtime rewrite.
- No validators.
- No `start_of_day` changes.
