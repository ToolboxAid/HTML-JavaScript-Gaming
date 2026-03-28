MODEL: GPT-5.4
REASONING: medium

COMMAND:
Use docs/pr/TOOLS_SPRITE_EDITOR_V7_4_PALETTE_LOCK_REFERENCE_IMAGE_AND_FPT_PLAN_ONLY.md as the sole implementation plan for the next Sprite Editor-only pass. Do not modify engine code. Preserve load/open behavior.

VALIDATIONS:
- No files under /engine/ changed
- Palette starts unset and blocks first edit until selected
- Once palette is selected, normal palette switching is blocked
- Blocked palette change attempt shows popup and red message
- Reference image can be loaded behind grid
- Reference image fit/alignment works
- Auto-align attempt runs after image load
- Zoom keeps grid and reference image aligned after lock
- GIF export uses FPS timing
- FPS appears under Frame X/Y in Animation Preview
- No load/open regression
- No console errors
