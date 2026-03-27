MODEL: GPT-5.4
REASONING: medium

COMMAND:
Apply TOOLS_SPRITE_EDITOR_V6_9_1_PALETTE_FORCE_SHOW_ALL in tools/SpriteEditor/main.js

VALIDATIONS:
- A 150-color palette shows all 150 colors through the sidebar viewport and scrolling
- No hidden tail of colors remains
- Last palette entries are visible and selectable
- Scroll reaches the true end of the palette
- Current color/readout updates correctly for end-of-list colors
- No console errors
