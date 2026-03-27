# TOOLS_SPRITE_EDITOR_V6_2_INPUT_REMAP_NO_ESC_CONSUME

## Purpose
Remove ESC from editor surface handling.
ESC should ONLY be used by browser for fullscreen exit.

## Changes

### 1. Remove ESC consumption
- Do NOT intercept ESC in editor

### 2. New key mappings
- Overlays / menus / command palette:
  - Ctrl+W to close
- Cancel active interaction:
  - Right-click
  - Backspace (when not typing)
  - Delete clears selection

### 3. Menu behavior
- Clicking outside closes menus
- Opening another menu closes current

### 4. Command palette
- Toggle via Ctrl+P
- Close via Ctrl+W

## Acceptance
- ESC always exits fullscreen
- ESC does NOT affect editor UI
- All overlays/menus can be closed without ESC
- Active interactions can be canceled without ESC
