# Expected Codex Return / Delta Template

## Expected Changed/Added Files
- `samples/phase-*/####/**`
- `samples/index.html`
- tool UI files for removing local sample dropdown/select entries
- tests for sample index/launch behavior
- `docs/dev/reports/level_10_3_tool_local_sample_migration_report.md`
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` if status update needed

## Expected Validation Summary
- `tools_scanned=4`
- `tool_local_samples_found=<count>`
- `samples_migrated=<count>`
- `duplicate_sample_ids=0`
- `samples_index_updated=true`
- `migrated_samples_launch=true`
- `tool_local_sample_dropdowns_removed=true`
- `start_of_day_changes=0`

## Expected Delta ZIP
Codex must create:

`tmp/BUILD_PR_LEVEL_10_3_MIGRATE_TOOL_LOCAL_SAMPLES_TO_SAMPLES_delta.zip`
