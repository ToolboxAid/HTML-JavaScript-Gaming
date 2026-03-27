# TOOLS_SPRITE_EDITOR_V6_8_8_REMOVE_REPLACE_COLOR_FROM_PALETTE_MENU

## Purpose
Remove `Replace Color` from the top-level Palette workflow/menu because it belongs in the palette editor, not the normal Palette menu.

## Requested Behavior
- Do NOT offer `Replace Color` from the top-level `Palette` menu or its submenu paths
- Keep the Palette menu focused on palette selection and palette-scoped workflow actions only
- `Replace Color` should live in the palette editor instead

## Scope
Surgical menu cleanup only.
Do not redesign palette behavior.
Do not remove the Palette menu.
Do not remove palette preset selection.
Do not remove valid palette workflow items that still belong in the normal Palette menu.

## Required Changes

### 1. Remove Replace Color from Palette menu surfaces
- Remove `Replace Color` from:
  - top-level `Palette` menu
  - any Palette submenu where it currently appears
  - any palette popup/list that is intended for normal palette workflow

### 2. Do not offer a duplicate entry point
- After this change, `Replace Color` should no longer be visible from the normal Palette menu workflow.
- Do not leave behind a dead row, placeholder, or disabled entry unless that is already the shared style for unavailable menu items.

### 3. Keep other palette actions intact
Keep valid non-editor palette actions working, such as:
- Set Src From Current
- Set Dst From Current
- Scope Active Layer
- Scope Current Frame
- Scope Selected Range
- palette preset selection under `Palette -> Palettes`

### 4. Preserve future/editor ownership
- Treat `Replace Color` as palette-editor-owned functionality.
- This patch does not need to add it anywhere else right now unless it already exists in the palette editor path.

## Acceptance
- `Replace Color` is no longer offered from the normal Palette menu workflow
- Other Palette actions still work
- `Palette -> Palettes` still works
- No dead/blank row remains where `Replace Color` used to be
- No console errors

## Notes
This is a menu ownership cleanup.
The goal is to keep normal palette workflow separate from palette-editor-specific operations.
