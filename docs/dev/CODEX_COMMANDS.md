MODEL: GPT-5.4
REASONING: medium

COMMAND:
Use docs/pr/TOOLS_SPRITE_EDITOR_V7_1_PRE_REGRESSION_CONSOLIDATION_REDO_PLAN_ONLY.md as the sole implementation plan for a Sprite Editor-only pass. Do not modify engine code. Preserve load/open behavior.

VALIDATIONS:
- No files under /engine/ changed
- Open still works
- Save still works
- New works
- Selection move is safe
- Brush cap reaches 9
- Layer ordering is correct
- Palette help exists
- Current color line is one-line and readable
- Command palette has no ESC close and no overlap artifacts
- About cleanup is visible
- Sheet Preview is larger/aligned better
- No console errors
