# Expected Codex Return / Delta Template

## Expected Changed/Added Files
- `games/Asteroids/game.manifest.json`
- `docs/dev/reports/level_8_31_asteroids_json_cleanup_report.md`
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` if status update needed

## Possible Deleted Files
Only if proven safe:
- `games/Asteroids/assets/palettes/hud.json`
- `games/Asteroids/assets/tools.manifest.json`
- `games/Asteroids/assets/workspace.asset-catalog.json`

## Expected Validation Summary
- `asteroids_json_files_before=21`
- `asteroids_json_files_after=<count>`
- `game_manifest_referenced_json=<count>`
- `deleted_files=<count>`
- `legacy_files_retained=<count>`
- `deferred_cleanup_items=<count>`
- `unreferenced_json_final=<count>`
- `runtime_changes=0`
- `validators_added=0`
- `start_of_day_changes=0`

## Expected Delta ZIP
Codex must create:

`tmp/BUILD_PR_LEVEL_8_31_ASTEROIDS_JSON_CLEANUP_AND_MANIFEST_WIRING_delta.zip`
