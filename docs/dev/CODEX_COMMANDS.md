MODEL: GPT-5.4
REASONING: medium

COMMAND:
Apply TOOLS_SPRITE_EDITOR_V6_5_MENU_ORDER_AND_ABOUT_POPUP in tools/SpriteEditor/main.js

VALIDATIONS:
- Top menu order is Files, Tools, Edit, ..., About
- About is the last top-level item
- About opens a popup surface, not a dropdown list
- About popup includes a visible close button
- Clicking the close button closes the About popup
- Ctrl+W closes the About popup
- ESC is not consumed by editor UI
- Other menus still open/close normally
- No console errors
