MODEL: GPT-5.4
REASONING: medium

COMMAND:
Implement docs/pr/TOOLS_SPRITE_EDITOR_V7_5_INTERACTION_PALETTE_REFERENCE_STABILIZATION_BUILD_PR.md

CONSTRAINTS:
- Modify ONLY Sprite Editor files
- Do NOT touch /engine
- Preserve load/open behavior
- Keep fixes surgical and local

VALIDATIONS:
- No files under /engine changed
- Menu item clicks close menus correctly
- Selection move is non-destructive until commit/unselect
- Backspace cancel works
- Files menu is flattened/cleaned up as planned
- Add Frame inserts after current frame
- Playback range works or is removed
- Timeline click always syncs preview
- Layer rename/edit works with Backspace
- Opacity control exists and is usable
- No layer bleed into preview
- Palette lock popup + red status both appear
- Clone workflow is visible/selectable/editable/persistent
- Default palette appears in preset list
- Swatch highlight animates continuously
- Help explains Set Src / Set Dst / Scope actions
- Command palette visuals are clean
- About/Help are current
- Reference image feature works end-to-end or degrades safely and visibly
- GIF timing remains aligned
- No load/open regression
- No console errors
