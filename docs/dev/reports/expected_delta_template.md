# Expected Codex Return / Delta Template

## Expected Changed Files
- Workspace Manager loader/binding file(s)
- `tests/runtime/GamesIndexWorkspaceManagerOpen.test.mjs` only if needed
- `docs/dev/reports/level_10_2b_workspace_manager_palette_binding_report.md`
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` if status update needed

## Expected Validation Summary
- `workspace_manager_reads_palette_browser_palette=true`
- `bouncing_ball_shared_palette_present=true`
- `games_with_manifest_palette_bound=<count>`
- `games_still_missing_palette=<count>`
- `direct_launch_regression=false`
- `validators_added=0`
- `start_of_day_changes=0`

## Expected Delta ZIP
Codex must create:

`tmp/BUILD_PR_LEVEL_10_2B_WORKSPACE_MANAGER_PALETTE_BINDING_FIX_delta.zip`
