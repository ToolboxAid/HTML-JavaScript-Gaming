MODEL: GPT-5.4
REASONING: medium

COMMAND:
Use docs/pr/TOOLS_SPRITE_EDITOR_V7_6_LEFT_RIGHT_PANEL_REFACTOR_PLAN_ONLY.md as the sole implementation plan for the next Sprite Editor-only pass. Do not modify engine code. Preserve load/open behavior.

VALIDATIONS:
- No files under /engine/ changed
- Left panel is accordion-based
- Only one accordion section is open at a time
- Brush section owns brush size/options
- Select section owns clear/copy/paste/move actions
- Grid section owns add/remove row/column
- Layer section owns opacity/rename/visibility quick actions
- Right panel owns palette label
- Right panel owns clone/palette dropdown
- Right panel owns current color readout
- Right panel owns swatches
- Right panel owns sort controls
- No overlapping panel concerns remain
- No panel content bleeds into previews or adjacent regions
- No load/open regression
- No console errors
