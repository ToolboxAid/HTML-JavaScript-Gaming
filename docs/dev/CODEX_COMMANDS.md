MODEL: GPT-5.4
REASONING: medium

COMMAND:
Use docs/pr/TOOLS_SPRITE_EDITOR_V7_3_PALETTE_LOCK_ANIMATION_ORDER_AND_EXPORTS_PLAN_ONLY.md as the sole implementation plan for the next Sprite Editor-only pass. Do not modify engine code. Preserve load/open behavior.

VALIDATIONS:
- No files under /engine/ changed
- Palette starts as NONE and blocks first edit until selected
- Palette is stored in project JSON and restored on load
- Custom palette clones can be created/named and persist in project JSON
- Selected palette swatch shows an animated marquee/highlight
- Palette menu no longer duplicates sidebar sort items
- Files menu labels clearly indicate local/project behavior
- GIF export exists
- Playback order override exists and is optional
- Help explains Set Src, Set Dst, and Scope actions
- No load/open regression
- No console errors
