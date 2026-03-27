MODEL: GPT-5.4
REASONING: medium

COMMAND:
Apply TOOLS_SPRITE_EDITOR_V6_8_7_MENU_LAYERING_ZOOM_CLIPPING_AND_PALETTE_SIDEBAR in tools/SpriteEditor/main.js

VALIDATIONS:
- All menus/submenus/popups render above normal editor content
- Top-layer transient surfaces receive input before underlying UI
- Zoomed grid does not render outside its viewport boundary
- Zoomed sprite/data does not render outside its viewport boundary
- Palette swatches are smaller and extend farther down the sidebar
- "more colors in top Palette menu" hint is removed
- Top-level Palette menu still works
- Palette preset popup still works
- No console errors
