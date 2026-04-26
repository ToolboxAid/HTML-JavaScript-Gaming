MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply BUILD_PR_LEVEL_9_6_ASTEROIDS_HARD_CUTOVER_SINGLE_MANIFEST.

THIS IS A HARD CUTOVER.
Final Asteroids state must have only:
- games/Asteroids/game.manifest.json

STEPS:
1. Read docs/pr/PLAN_PR_LEVEL_9_6_ASTEROIDS_HARD_CUTOVER_SINGLE_MANIFEST.md.
2. Read docs/pr/BUILD_PR_LEVEL_9_6_ASTEROIDS_HARD_CUTOVER_SINGLE_MANIFEST.md.
3. Inventory all `games/Asteroids/**/*.json`.
4. For each JSON except `game.manifest.json`:
   - load contents
   - inline actual JSON data into `game.manifest.json`
   - map data to the owning tool section
5. Search Asteroids code/config for deleted JSON references.
6. Update Asteroids-scoped loaders/references to read from `game.manifest.json`.
7. Delete all old Asteroids JSON files except `game.manifest.json`.
8. Verify:
   - JSON count under games/Asteroids is 1
   - no old JSON path references remain
   - Asteroids launches directly
   - no 404s for deleted JSON
9. Update docs/dev/reports/level_9_6_asteroids_hard_cutover_report.md.
10. Update docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md status only if needed:
    - [ ] -> [.]
    - [.] -> [x]
    - no prose rewrite/delete
11. Do not add validators.
12. Do not modify start_of_day.
13. Create Codex delta ZIP:
    tmp/BUILD_PR_LEVEL_9_6_ASTEROIDS_HARD_CUTOVER_SINGLE_MANIFEST_delta.zip

ACCEPTANCE:
- asteroids_json_after=1
- only remaining JSON is games/Asteroids/game.manifest.json
- Asteroids launches directly
- delta ZIP exists
