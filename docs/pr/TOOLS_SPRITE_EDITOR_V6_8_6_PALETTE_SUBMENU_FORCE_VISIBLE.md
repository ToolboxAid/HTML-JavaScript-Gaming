# TOOLS_SPRITE_EDITOR_V6_8_6_PALETTE_SUBMENU_FORCE_VISIBLE

## Purpose
Fix Palette -> Palettes so the submenu is unmistakably visible and usable in the actual editor UI.

## Problem Confirmed
The previous pass validated in automation, but in real use the user still does not see the palette preset rows to select from.

This means the submenu likely has one of these issues:
- opening off-screen
- rendering with insufficient width/height
- rendering behind another surface
- low-contrast text/background
- hit area exists but visible rows do not
- submenu anchor is too subtle or collapsed

## Scope
Surgical visibility/usability correction only.
Do not redesign palette behavior.
Do not move presets out of Palette -> Palettes.
Do not restore the sidebar Palette button.

## Required Changes

### 1. Force Palette -> Palettes to render as a clearly visible submenu panel
- Render the submenu as a distinct panel with:
  - visible background fill
  - visible border
  - stable minimum width
  - stable minimum row height
  - padding around rows
- Do not rely on subtle hover-only or near-zero-size rendering.

### 2. Clamp submenu on-screen
- Ensure the submenu is always positioned within visible editor bounds.
- If the normal right-side flyout would go off-screen, flip or shift it inward.

### 3. Make palette rows visually obvious
- Every palettes.js preset must render as a readable row.
- Each row should have:
  - readable preset name
  - stable clickable area
  - hover/active highlight
- The currently selected preset should be visibly marked.

### 4. Add a temporary-safe fallback if needed
If flyout submenu rendering is unreliable, acceptable fallback:
- clicking `Palettes` opens a dedicated popup/list panel instead of a tiny flyout,
- but it must still be reachable from the top-level `Palette` menu item path.

### 5. Keep sidebar palette area display-only
- Do not re-add the sidebar Palette button.
- Keep the compact palette display in the sidebar.

## Acceptance
- Clicking Palette -> Palettes shows a clearly visible list of presets
- palettes.js preset names are readable in the UI
- preset rows are easy to click
- selecting a preset applies it correctly
- current preset is visibly indicated
- submenu/popup stays on-screen
- sidebar Palette button remains removed
- no console errors

## Notes
Prior automation may have passed the interaction path without proving real visibility.
This pass prioritizes obvious on-screen rendering over subtle flyout behavior.
