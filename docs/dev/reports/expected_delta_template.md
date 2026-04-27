# Expected Codex Return / Delta Template

## Expected Changed Files
- tool files only where hidden fallback/hardcoded paths are removed
- tests for no hidden coupling
- `docs/dev/reports/level_10_5_no_hidden_tool_coupling_report.md`
- `docs/dev/reports/level_10_5_hardcoded_asset_path_audit.md`
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` if status update needed

## Expected Validation Summary
- `tools_scanned=<count>`
- `silent_fallbacks_removed=<count>`
- `hardcoded_asset_paths_removed=<count>`
- `remaining_silent_fallbacks=0`
- `remaining_hardcoded_json_asset_paths=0`
- `tools_empty_state_without_input=true`
- `tools_render_manifest_input=true`
- `start_of_day_changes=0`

## Expected Delta ZIP
Codex must create:

`tmp/BUILD_PR_LEVEL_10_5_NO_HIDDEN_TOOL_COUPLING_VALIDATION_delta.zip`
