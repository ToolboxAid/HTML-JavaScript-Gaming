# Expected Codex Return / Delta Template

## Expected Changed/Added Files
- `tests/runtime/GamesIndexWorkspaceManagerOpen.test.mjs` or equivalent
- `tests/run-tests.mjs` only if needed to include the new test in the correct suite
- `package.json` only if a focused npm script is needed
- `docs/dev/reports/level_10_2_workspace_manager_open_test_report.md`
- `docs/dev/reports/level_10_2_asteroids_platform_demo_boundary_audit.md`
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` if status update needed

## Expected Validation Summary
- `games_index_test_added=true`
- `games_discovered=<count>`
- `workspace_manager_actions_checked=<count>`
- `actions_with_gameId=<count>`
- `actions_with_mount_game=<count>`
- `actions_using_legacy_game_query=0`
- `workspace_manager_diagnostic_failures=0`
- `asteroids_platform_demo_boundary_audited=true`
- `start_of_day_changes=0`

## Expected Delta ZIP
Codex must create:

`tmp/BUILD_PR_LEVEL_10_2_WORKSPACE_MANAGER_OPEN_TEST_AND_SHARED_BOUNDARY_AUDIT_delta.zip`
