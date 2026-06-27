# PLAN_PR_LEVEL_10_1_GAME_PALETTE_COMPLETENESS_AND_TOOL_INPUT_ALIGNMENT

## Purpose
Start Phase 10 tool alignment by ensuring every game has manifest-owned palette data where needed, and tools receive consistent manifest slices instead of file/sample dropdown inputs.

## Scope
- Audit all game manifests for palette completeness.
- Create manifest-owned palettes for games missing palette data.
- Extract missing palette colors from code, existing assets, CSS/canvas constants, or tool/game defaults where present.
- Place actual palette JSON data inside `game.manifest.json` under the owning tool section.
- Do not create separate palette JSON files.
- Begin enforcing tool input alignment around manifest slices.

## Non-Goals
- No broad UI removal yet.
- No sample dropdown removal in this PR.
- No validators.
- No `start_of_day` changes.
