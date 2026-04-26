# Level 8.30 All Games Manifest SSoT Rollout Report

## Scope
- Read `docs/pr/PLAN_PR_LEVEL_8_30_MANIFEST_SSOT_ROLLOUT_ALL_GAMES.md`.
- Read `docs/pr/BUILD_PR_LEVEL_8_30_MANIFEST_SSOT_ROLLOUT_ALL_GAMES.md`.
- Inspected all game folders with `games/<game>/index.html` (12 total).
- Preserved legacy catalogs (`workspace.asset-catalog.json` and `tools.manifest.json`) in place.
- No runtime routing/preview logic changed in this PR.

## Per-Game Rollout
| Game Folder | Manifest Path | Created/Updated | Palettes Wired | Skins Wired | JSON Wired | Legacy Catalogs Retained | Direct Launch Path Present | Workspace Manager Action | Unreferenced JSON Remaining |
|---|---|---:|---:|---:|---:|---|---|---|---:|
| `_template` | `games/_template/game.manifest.json` | `created` | 0 | 0 | 1 | yes | yes | present | 0 |
| `AITargetDummy` | `games/AITargetDummy/game.manifest.json` | `created` | 0 | 0 | 1 | yes | yes | present | 0 |
| `Asteroids` | `games/Asteroids/game.manifest.json` | `updated` | 0 | 0 | 21 | yes | yes | present | 0 |
| `Bouncing-ball` | `games/Bouncing-ball/game.manifest.json` | `created` | 1 | 1 | 3 | yes | yes | present | 0 |
| `Breakout` | `games/Breakout/game.manifest.json` | `created` | 1 | 1 | 3 | yes | yes | present | 0 |
| `GravityWell` | `games/GravityWell/game.manifest.json` | `created` | 0 | 0 | 1 | yes | yes | present | 0 |
| `Pacman` | `games/Pacman/game.manifest.json` | `created` | 0 | 0 | 1 | yes | yes | present | 0 |
| `Pong` | `games/Pong/game.manifest.json` | `created` | 1 | 1 | 3 | yes | yes | present | 0 |
| `SolarSystem` | `games/SolarSystem/game.manifest.json` | `created` | 1 | 1 | 3 | yes | yes | present | 0 |
| `SpaceDuel` | `games/SpaceDuel/game.manifest.json` | `created` | 1 | 0 | 2 | yes | yes | present | 0 |
| `SpaceInvaders` | `games/SpaceInvaders/game.manifest.json` | `created` | 1 | 0 | 2 | yes | yes | present | 0 |
| `vector-arcade-sample` | `games/vector-arcade-sample/game.manifest.json` | `created` | 1 | 0 | 13 | yes | yes | present | 0 |

## Summary
- `games_total=12`
- `manifests_present=12`
- `created_manifests=11`
- `updated_manifests=1`
- `legacy_catalogs_retained_games=12`
- `direct_launch_path_present_games=12`
- `workspace_manager_action_present_games=12`
- `unreferenced_json_remaining_total=0`

## Palette Alpha Normalization
- No `#RRGGBBFF` palette values were found in game-local JSON during this rollout (no changes required).

## Direct Launch + Workspace Manager Separation
- Preview/direct launch paths are game URLs (`/games/<game>/index.html`) in game manifests.
- Workspace Manager remains explicit and optional via `workspaceManagerPath` in each manifest.
- No runtime launch guard logic was modified in this PR.

## Constraint Check
- `validators_added=0`
- `runtime_code_changes=0`
- `start_of_day_changes=0`
