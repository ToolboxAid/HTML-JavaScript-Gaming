# Expected Codex Return / Delta Template

## Expected Changed/Added Files
- `games/Asteroids/game.manifest.json`
- `games/Asteroids/assets/palettes/asteroids-hud.palette.json` if HUD is converted to separate palette
- `docs/dev/reports/level_8_28_asteroids_manifest_ssot_report.md`
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` if status update needed

## Expected Validation Summary
- `asteroids_game_manifest_exists=true`
- `asteroids_bezel_override_wired=true`
- `asteroids_main_palette_wired=true`
- `asteroids_hud_data_typed=true`
- `asteroids_unreferenced_json_after=<count>`
- `legacy_catalogs_deleted=0`
- `runtime_changes=0`
- `validators_added=0`
- `start_of_day_changes=0`

## Expected Delta ZIP
Codex must create:

`tmp/BUILD_PR_LEVEL_8_28_MANIFEST_SSOT_IMPLEMENTATION_ASTEROIDS_FIRST_delta.zip`
