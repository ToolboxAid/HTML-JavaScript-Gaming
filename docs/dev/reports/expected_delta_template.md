# Expected Codex Return / Delta Template

## Expected Changed Files
- affected `samples/phase-*/####/**`
- affected standalone tool data-loading/binding files
- `tests/runtime/SampleStandaloneToolDataFlow.test.mjs` or equivalent
- `docs/dev/reports/level_10_6_sample_schema_validation_report.md`
- `docs/dev/reports/level_10_6_standalone_tool_data_flow_report.md`
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` if status update needed

## Required Targeted Regression Results
- `sample_0204_asset_browser_pipeline_input_loaded=true`
- `sample_1413_asset_browser_or_pipeline_input_loaded=true`
- `sample_1505_asset_browser_pipeline_input_loaded=true`
- `sample_0510_asset_pipeline_input_loaded=true`
- `sample_1417_asset_pipeline_input_loaded=true`
- `sample_0213_palette_displayed=true`
- `sample_0308_palette_displayed=true`
- `sample_0313_palette_displayed=true`

## Expected Validation Summary
- `sample_payload_files_scanned=<count>`
- `schema_resolution_failures=0`
- `tool_payload_contract_failures=0`
- `standalone_data_flow_failures=0`
- `palette_display_failures=0`
- `pipeline_input_failures=0`
- `silent_fallbacks_used=0`
- `hardcoded_asset_paths_added=0`
- `start_of_day_changes=0`

## Expected Delta ZIP
Codex must create:

`tmp/BUILD_PR_LEVEL_10_6_SAMPLE_SCHEMA_AND_STANDALONE_TOOL_DATA_FLOW_VALIDATION_delta.zip`
