# TOOLS_SPRITE_EDITOR_V6_8_3_TOP_PALETTE_MENU_FIX

## Purpose
Correct the palette cleanup so Palette becomes a real top-level menu between Layer and Help, and the sidebar Palette button no longer opens the old full utility stack.

## Required Result
Top menu order:
Files, Edit, Tools, Frame, Layer, Palette, Help, About

## Changes
- Add top-level Palette menu (between Layer and Help)
- Move all palette utility actions into this menu
- Remove or neutralize sidebar "Palette Menu" button
- Keep palette panel compact (preview + swatches only)
- Ensure no duplicate palette surfaces exist

## Acceptance
- Palette menu exists in top bar
- Sidebar palette button does NOT open legacy UI
- Palette panel stays compact
- All palette actions still function
- No console errors
