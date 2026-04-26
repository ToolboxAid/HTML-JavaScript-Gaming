MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply BUILD_PR_LEVEL_8_31_ASTEROIDS_JSON_CLEANUP_AND_MANIFEST_WIRING.

STEPS:
1. Read docs/pr/PLAN_PR_LEVEL_8_31_ASTEROIDS_JSON_CLEANUP_AND_MANIFEST_WIRING.md.
2. Read docs/pr/BUILD_PR_LEVEL_8_31_ASTEROIDS_JSON_CLEANUP_AND_MANIFEST_WIRING.md.
3. Inventory all `games/Asteroids/**/*.json`.
4. Treat `games/Asteroids/game.manifest.json` as SSoT.
5. Ensure game.manifest.json references every Asteroids JSON asset that is still intended for game/workspace use.
6. Audit duplicate HUD data:
   - compare `assets/palettes/hud.json`
   - compare `assets/palettes/asteroids-hud.palette.json`
   - delete hud.json only if converted and unreferenced
7. Audit legacy catalogs:
   - assets/tools.manifest.json
   - assets/workspace.asset-catalog.json
   Delete only if no runtime/scripts/docs reference them and manifest parity is proven.
8. Audit generic data folders:
   - assets/parallax/data/*
   - assets/sprites/data/*
   - assets/tilemaps/data/*
   - assets/vectors/data/*
   Move only if safe and manifest updates are clear; otherwise report deferred.
9. Ensure `assets/tilesets/ui.json` is wired or documented/deleted if safe.
10. Update docs/dev/reports/level_8_31_asteroids_json_cleanup_report.md.
11. Update docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md status only:
    - [ ] -> [.]
    - [.] -> [x]
    - no prose rewrite/delete
12. Do not add validators.
13. Do not modify start_of_day.
14. Avoid runtime code changes.
15. Create Codex delta ZIP:
    tmp/BUILD_PR_LEVEL_8_31_ASTEROIDS_JSON_CLEANUP_AND_MANIFEST_WIRING_delta.zip

ACCEPTANCE:
- Every remaining Asteroids JSON file is manifest-wired, runtime-required legacy, or documented deferred cleanup.
- Duplicate HUD JSON is removed if safe.
- Delta ZIP exists.
