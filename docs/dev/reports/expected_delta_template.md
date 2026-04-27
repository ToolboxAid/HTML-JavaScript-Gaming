# Expected Codex Return / Delta Template

## Expected Changed Files
- `package.json` if npm script is added/updated
- `tests/runtime/LaunchSmokeAllEntries.test.mjs` only if needed for clearer mode naming/reporting
- `docs/dev/reports/level_9_9_launch_smoke_games_only_fast_path_report.md`
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` if status update needed

## Expected Validation Summary
- `games_only_script_exists=true`
- `games_only_passes_games_flag=true`
- `samples_in_games_only_run=false`
- `tools_in_games_only_run=false`
- `duplicate_game_execution=false`
- `full_launch_smoke_preserved=true`
- `start_of_day_changes=0`

## Expected Delta ZIP
Codex must create:

`tmp/BUILD_PR_LEVEL_9_9_LAUNCH_SMOKE_GAMES_ONLY_FAST_PATH_delta.zip`
