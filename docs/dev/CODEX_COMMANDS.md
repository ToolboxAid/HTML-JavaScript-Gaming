MODEL: GPT-5.4
REASONING: medium

COMMAND:
Apply TOOLS_SPRITE_EDITOR_V6_4_MOVE_ALL_TOOLS_TO_TOP_MENU in tools/SpriteEditor/main.js

VALIDATIONS:
- A top-level Tools menu exists
- All tool entries are available from the Tools menu
- Any old duplicated tool-selection surface is removed
- Active tool is visibly indicated
- Selecting each tool from the Tools menu activates it correctly
- Existing non-conflicting tool shortcuts still work
- Tools menu closes on click-outside
- Tools menu closes with Ctrl+W
- Only one top menu is open at a time
- No console errors
