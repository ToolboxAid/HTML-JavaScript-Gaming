MODEL: GPT-5.4
REASONING: medium

COMMAND:
Apply TOOLS_SPRITE_EDITOR_V6_6_HELP_MENU_AND_MENU_ORDER in tools/SpriteEditor/main.js

VALIDATIONS:
- Top menu order is Files, Edit, Tools, Frame, Layer, Help, About
- Help exists between Layer and About
- Help menu contains entries for Files, Edit, Tools, Frame, Layer, Help, and About
- Clicking each Help entry opens a readable detail surface
- Each Help detail surface includes title, short description, how to use, option descriptions, and a Close button
- Ctrl+W closes Help detail surfaces
- About popup still opens and closes correctly
- ESC is not consumed by editor UI
- Only one transient surface is open at a time
- No console errors
