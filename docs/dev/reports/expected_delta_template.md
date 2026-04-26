# Expected Codex Return / Delta Template

## Expected Changed Files
- `games/Asteroids/game.manifest.json`
- Asteroids loader/runtime files only if required to remove internal pointer resolution
- `docs/dev/reports/level_9_7_remove_internal_references_report.md`
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` if status update needed

## Expected Validation Summary
- `asteroids_json_count=1`
- `runtimeSource_remaining=0`
- `internal_fragment_refs_remaining=0`
- `root_assetCatalog_json_refs_remaining=0`
- `inlinedSourceFiles_remaining=0`
- `toolDomains_remaining=0`
- `old_deleted_json_filename_refs_remaining=0`
- `external_media_paths_allowed=true`
- `asteroids_direct_launch=true`
- `validators_added=0`
- `start_of_day_changes=0`

## Expected Delta ZIP
Codex must create:

`tmp/BUILD_PR_LEVEL_9_7_REMOVE_INTERNAL_REFERENCES_AND_INLINE_DATA_delta.zip`
