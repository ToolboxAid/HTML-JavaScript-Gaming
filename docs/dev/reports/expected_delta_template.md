# Expected Codex Return / Delta Template

## Expected Changed Files
- `games/*/game.manifest.json`
- `tests/runtime/GameManifestPayloadExpectations.test.mjs` or equivalent
- `tests/runtime/GamesIndexWorkspaceManagerOpen.test.mjs` if asset expectation checks are extended
- `docs/dev/reports/level_10_2c_manifest_payload_expectation_report.md`
- `docs/dev/reports/level_10_2c_manifest_cleanup_report.md`
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` if status update needed

## Expected Validation Summary
- `games_scanned=<count>`
- `root_lineage_remaining=0`
- `root_sources_remaining=0`
- `root_assets_remaining=0`
- `sourcePath_remaining=0`
- `legacy_json_path_refs_remaining=0`
- `tool_sections_missing_metadata=0`
- `asteroids_vector_count_gt_zero=true`
- `asteroids_invalid_sprite_editor_present=false`
- `asteroids_invalid_tile_map_editor_present=false`
- `asteroids_invalid_parallax_editor_present=false`
- `workspace_manager_vector_asset_none_when_vectors_exist=false`
- `start_of_day_changes=0`

## Expected Delta ZIP
Codex must create:

`tmp/BUILD_PR_LEVEL_10_2C_MANIFEST_PAYLOAD_EXPECTATION_TESTS_AND_CLEANUP_delta.zip`
