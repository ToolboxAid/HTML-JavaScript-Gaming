# Expected Codex Return / Delta Template

## Expected Changed Files
- Source file(s) owning game preview/direct launch routing
- `docs/dev/reports/level_8_32_direct_launch_hook_and_asteroids_parity_report.md`
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` if status update needed

## Expected Validation Summary
- `redirect_hook_found=true`
- `preview_routes_to_workspace_manager=false`
- `bouncing_ball_direct_launch=true`
- `asteroids_direct_launch=true`
- `space_invaders_direct_launch=true`
- `workspace_manager_explicit_action_preserved=true`
- `uses_game_query_for_workspace_manager=false`
- `uses_gameId_query_for_workspace_manager=true`
- `validators_added=0`
- `start_of_day_changes=0`

## Expected Delta ZIP
Codex must create:

`tmp/BUILD_PR_LEVEL_8_32_DIRECT_GAME_LAUNCH_HOOK_REMOVAL_AND_ASTEROIDS_PARITY_delta.zip`
