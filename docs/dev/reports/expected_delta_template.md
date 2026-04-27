# Expected Codex Return / Delta Template

## Expected Changed Files
- `games/*/game.manifest.json`
- `docs/dev/reports/level_10_1_game_palette_completeness_report.md`
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` if status update needed

## Expected Validation Summary
- `games_scanned=<count>`
- `games_with_palette_before=<count>`
- `games_with_palette_after=<count>`
- `palettes_created=<count>`
- `palettes_normalized=<count>`
- `new_palette_json_files=0`
- `swatch_symbol_issues=0`
- `opaque_alpha_ff_remaining=0`
- `start_of_day_changes=0`

## Expected Delta ZIP
Codex must create:

`tmp/BUILD_PR_LEVEL_10_1_GAME_PALETTE_COMPLETENESS_AND_TOOL_INPUT_ALIGNMENT_delta.zip`
