# Expected Codex Return / Delta Template

## Expected Changed Files
- `games/Asteroids/game.manifest.json`
- Asteroids loader/runtime files only where needed to read manifest-owned data
- `docs/dev/reports/level_9_6_asteroids_hard_cutover_report.md`
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` if status update needed

## Expected Deleted Files
All Asteroids JSON except `game.manifest.json`.

## Expected Validation Summary
- `asteroids_json_before=22`
- `asteroids_json_after=1`
- `only_remaining_json=games/Asteroids/game.manifest.json`
- `deleted_json_files=21`
- `old_json_references_remaining=0`
- `json_404s=0`
- `asteroids_direct_launch=true`
- `validators_added=0`
- `start_of_day_changes=0`

## Expected Delta ZIP
Codex must create:

`tmp/BUILD_PR_LEVEL_9_6_ASTEROIDS_HARD_CUTOVER_SINGLE_MANIFEST_delta.zip`
