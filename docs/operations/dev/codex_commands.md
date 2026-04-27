MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply BUILD_PR_LEVEL_10_1_GAME_PALETTE_COMPLETENESS_AND_TOOL_INPUT_ALIGNMENT.

STEPS:
1. Read docs/pr/PLAN_PR_LEVEL_10_1_GAME_PALETTE_COMPLETENESS_AND_TOOL_INPUT_ALIGNMENT.md.
2. Read docs/pr/BUILD_PR_LEVEL_10_1_GAME_PALETTE_COMPLETENESS_AND_TOOL_INPUT_ALIGNMENT.md.
3. Scan all `games/*/game.manifest.json`.
4. For each game:
   - determine whether manifest-owned palette data exists
   - normalize existing palettes
   - create missing palette data inside game.manifest.json when needed
5. Extract palette colors from source when possible:
   - code constants
   - canvas styles
   - CSS
   - existing manifest colors
   - HUD/skin sections
6. Do not create separate palette JSON files.
7. Place palette data under the owning tool section, preferably `primitive-skin-editor.palettes`.
8. Normalize swatches:
   - single-character `symbol`
   - uppercase `#RRGGBB`
   - remove opaque `FF` suffix
9. Document tool input alignment:
   - tools consume `gameManifest.tools[toolId]`
   - no file-path JSON input for game-owned data
10. Write docs/dev/reports/level_10_1_game_palette_completeness_report.md.
11. Update docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md status only if needed:
    - [ ] -> [.]
    - [.] -> [x]
    - no prose rewrite/delete
12. Do not add validators.
13. Do not modify start_of_day.
14. Create Codex delta ZIP:
    tmp/BUILD_PR_LEVEL_10_1_GAME_PALETTE_COMPLETENESS_AND_TOOL_INPUT_ALIGNMENT_delta.zip

ACCEPTANCE:
- all games with colors have manifest-owned palette data
- no new palette JSON files
- delta ZIP exists
