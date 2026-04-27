# Expected Codex Return / Delta Template

## Expected Changed Files
- `tests/runtime/GamesIndexWorkspaceManagerOpen.test.mjs` or equivalent
- `docs/dev/reports/level_10_2a_workspace_manager_asset_presence_validation_report.md`
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` if status update needed

## Expected Validation Summary
- `games_checked=<count>`
- `workspace_manager_open_actions_valid=<count>`
- `diagnostic_failures=0`
- `games_with_shared_palette=<count>`
- `games_missing_shared_palette=<count>`
- `bouncing_ball_shared_palette_present=true`
- `games_with_expected_assets=<count>`
- `asset_presence_test_added=true`
- `start_of_day_changes=0`

## Expected Delta ZIP
Codex must create:

`tmp/BUILD_PR_LEVEL_10_2A_WORKSPACE_MANAGER_ASSET_PRESENCE_VALIDATION_delta.zip`
