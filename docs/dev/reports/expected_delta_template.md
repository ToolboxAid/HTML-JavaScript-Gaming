# Expected Codex Return / Delta Template

## Expected Changed Files
- `games/*/game.manifest.json`
- `docs/dev/reports/level_10_1a_palette_singleton_correction_report.md`
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` if status update needed

## Expected Validation Summary
- `games_scanned=<count>`
- `games_with_root_palette=<count>`
- `tool_owned_palettes_remaining=0`
- `root_palettes_collections_remaining=0`
- `palette_json_files_created=0`
- `duplicate_palette_swatches_removed=<count>`
- `symbol_conflicts_fixed=<count>`
- `opaque_alpha_ff_remaining=0`
- `validators_added=0`
- `start_of_day_changes=0`

## Expected Delta ZIP
Codex must create:

`tmp/BUILD_PR_LEVEL_10_1A_PALETTE_STANDALONE_SINGLETON_CORRECTION_delta.zip`
