MODEL: GPT-5.4
REASONING: medium

COMMAND:
Apply TOOLS_SPRITE_EDITOR_V6_8_5_PALETTE_SUBMENU_VISIBILITY_AND_SIDEBAR_BUTTON_REMOVAL in tools/SpriteEditor/main.js

VALIDATIONS:
- Palette top menu still exists
- Palette -> Palettes opens visibly
- palettes.js presets are visible inside the submenu
- palette preset rows are selectable
- selecting a preset applies it correctly
- sidebar Palette button is removed
- no duplicate palette entry point remains outside the top menu
- no console errors
