# Expected Codex Return / Delta Template

## Expected Changed Files
- affected `samples/phase-*/####/sample.*.json`
- affected tool standalone binding files
- `tests/runtime/SampleStandaloneToolDataFlow.test.mjs`
- optional test helper updates
- `docs/dev/reports/level_10_6b_standalone_generic_failure_closeout_report.md`
- `docs/dev/reports/level_10_6b_tool_contract_matrix.md`
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` if status update needed

## Expected Validation Summary
- `generic_failure_signals_before=25`
- `generic_failure_signals_after=0`
- `three_d_camera_path_editor_failures=0`
- `three_d_asset_viewer_failures=0`
- `physics_sandbox_failures=0`
- `tile_model_converter_failures=0`
- `json_payload_normalizer_failures=0`
- `parallax_editor_failures=0`
- `performance_profiler_failures=0`
- `replay_visualizer_failures=0`
- `silent_fallbacks_used=0`
- `hardcoded_asset_paths_added=0`
- `start_of_day_changes=0`

## Expected Delta ZIP
Codex must create:

`tmp/BUILD_PR_LEVEL_10_6B_STANDALONE_SAMPLE_GENERIC_FAILURE_CLOSEOUT_delta.zip`
