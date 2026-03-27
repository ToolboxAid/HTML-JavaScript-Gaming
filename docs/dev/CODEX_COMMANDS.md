MODEL: GPT-5.4
REASONING: medium

COMMAND:
Apply TOOLS_SPRITE_EDITOR_V6_5_1_ABOUT_POPUP_AND_MENU_BEHAVIOR_FIX in tools/SpriteEditor/main.js

VALIDATIONS:
- About opens as a centered popup surface, not a dropdown
- About popup content is visibly detectable
- About popup includes a visible Close button
- Clicking the Close button closes the About popup
- Ctrl+W closes the About popup
- ESC is not consumed by editor UI
- Files menu opens with visible items and closes normally
- Tools menu opens with visible items and closes normally
- Other menus still open and close normally
- Only one transient surface is open at a time
- No console errors
