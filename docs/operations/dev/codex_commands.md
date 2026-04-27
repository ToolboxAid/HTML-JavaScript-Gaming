MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply BUILD_PR_LEVEL_10_1A_PALETTE_STANDALONE_SINGLETON_CORRECTION.

STEPS:
1. Read docs/pr/PLAN_PR_LEVEL_10_1A_PALETTE_STANDALONE_SINGLETON_CORRECTION.md.
2. Read docs/pr/BUILD_PR_LEVEL_10_1A_PALETTE_STANDALONE_SINGLETON_CORRECTION.md.
3. Scan all `games/*/game.manifest.json`.
4. For each manifest:
   - find any `tools.*.palettes`
   - move/merge palette data into root `palette`
   - remove tool-owned `palettes`
   - ensure only one root `palette` exists
5. Normalize swatches:
   - uppercase hex
   - remove opaque `FF`
   - single-character symbols
   - dedupe by hex where safe
6. Ensure Primitive Skin Editor owns skins only, not palette.
7. Ensure Palette Browser does not own a duplicate palette object.
8. Update any game/tool manifest readers only if required to read root `palette`.
9. Do not create palette JSON files.
10. Write docs/dev/reports/level_10_1a_palette_singleton_correction_report.md.
11. Update docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md status only if needed:
    - [ ] -> [.]
    - [.] -> [x]
    - no prose rewrite/delete
12. Do not add validators.
13. Do not modify start_of_day.
14. Create Codex delta ZIP:
    tmp/BUILD_PR_LEVEL_10_1A_PALETTE_STANDALONE_SINGLETON_CORRECTION_delta.zip

ACCEPTANCE:
- exactly one root `palette` per game manifest
- no tool-owned palettes remain
- delta ZIP exists
