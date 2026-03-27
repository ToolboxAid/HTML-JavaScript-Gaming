# TOOLS_SPRITE_EDITOR_V6_8_4_PALETTE_SPLIT_TRUE_PALETTES

## Purpose
Split true palette presets from non-palette utility actions, and add a `Palettes` submenu that contains the palettes coming from palettes.js.

## Requested Result
Inside the top-level `Palette` menu:
- true palette presets from palettes.js belong under a submenu named `Palettes`
- non-palette utility/workflow actions stay in the main `Palette` menu
- the visible palette panel stays compact and palette-focused

## Scope
Surgical palette menu cleanup only.
Do not redesign palette behavior.
Do not remove palette utilities.
Do not change preview/timeline layout.
Do not reintroduce panel overflow.

## Required Changes

### 1. Split true palettes from utility actions
Treat entries from palettes.js as true palette presets.
Examples include:
- crayola008
- crayola016
- crayola024
- crayola032
- crayola048
- crayola064
- crayola096
- w3c
...and any other palettes.js-defined presets

These should no longer be mixed inline with utility actions in the main Palette menu.

### 2. Add `Palettes` submenu
Inside the top-level `Palette` menu, add a submenu item:
- `Palettes`

That submenu should contain the true preset entries sourced from palettes.js.

### 3. Keep utility/workflow items in the main Palette menu
Keep non-palette actions in the main `Palette` menu, such as:
- Set Src From Current
- Set Dst From Current
- Scope Active Layer
- Scope Current Frame
- Scope Selected Range
- Replace Color

If `custom` and `default` are not true palettes from palettes.js, keep them in the main Palette menu rather than the `Palettes` submenu.

### 4. Keep behavior intact
- Selecting a palette from `Palettes` must still apply that preset correctly
- Palette utility actions must still work
- Current palette display/panel must still reflect the chosen preset

### 5. Keep visible palette panel compact
The visible palette area should stay compact and palette-focused.
Do not expand it with the long preset/utility stack again.

## Acceptance
- Top-level `Palette` menu still exists
- `Palette` menu now contains a `Palettes` submenu
- True palettes from palettes.js are inside `Palettes`
- Utility/workflow actions remain in the main `Palette` menu
- Palette preset selection still works
- Utility actions still work
- Visible palette panel remains compact
- No console errors

## Notes
This is a menu-content separation pass only.
The goal is to separate actual palette presets from workflow actions so the menu reads clearly.
