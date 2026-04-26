MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply BUILD_PR_LEVEL_8_28_MANIFEST_SSOT_IMPLEMENTATION_ASTEROIDS_FIRST.

STEPS:
1. Read docs/pr/PLAN_PR_LEVEL_8_28_MANIFEST_SSOT_IMPLEMENTATION_ASTEROIDS_FIRST.md.
2. Read docs/pr/BUILD_PR_LEVEL_8_28_MANIFEST_SSOT_IMPLEMENTATION_ASTEROIDS_FIRST.md.
3. Inspect:
   - games/Asteroids/assets/workspace.asset-catalog.json
   - games/Asteroids/assets/tools.manifest.json
   - games/Asteroids/assets/palettes/asteroids-classic.palette.json
   - games/Asteroids/assets/palettes/hud.json
   - games/Asteroids/assets/images/bezel.stretch.override.json
4. Create or normalize:
   - games/Asteroids/game.manifest.json
5. Preserve existing asset data. Do not delete old catalogs.
6. Ensure game.manifest.json references:
   - asteroids-classic.palette.json
   - bezel.stretch.override.json
   - HUD palette/skin data after conversion
   - existing referenced vector/sprite/tilemap/parallax JSON assets
7. If hud.json is color data:
   - convert to palette schema as games/Asteroids/assets/palettes/asteroids-hud.palette.json
   - do not leave hud.json as loose untyped color data
   - if retaining hud.json for compatibility, mark legacy in report
8. Normalize palette colors:
   - #RRGGBBFF -> #RRGGBB
   - preserve non-FF alpha
9. Write docs/dev/reports/level_8_28_asteroids_manifest_ssot_report.md.
10. Update docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md status only:
    - [ ] -> [.] or [.] -> [x]
    - no prose rewrite/delete
11. Do not add validators.
12. Do not modify start_of_day.
13. Avoid runtime code changes unless only a safe manifest input reference is required.
14. Create Codex delta ZIP:
    tmp/BUILD_PR_LEVEL_8_28_MANIFEST_SSOT_IMPLEMENTATION_ASTEROIDS_FIRST_delta.zip

ACCEPTANCE:
- asteroids_game_manifest_exists=true
- asteroids_bezel_override_wired=true
- asteroids_hud_data_typed=true
- old catalogs intact
- no validators/start_of_day changes
