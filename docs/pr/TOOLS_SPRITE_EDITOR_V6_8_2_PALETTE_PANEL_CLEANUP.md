# TOOLS_SPRITE_EDITOR_V6_8_2_PALETTE_PANEL_CLEANUP

## Purpose
Clean up the Palette area so the visible palette panel only shows palette-related content from palette/preset data, while non-palette utility actions move into a Palette menu.

## Problem Observed
The current Palette area mixes:
- actual palette/preset content
- non-palette utility actions
- scope/replace/source-destination actions

That stack stretches off the bottom and makes the panel hard to scan.

Items like these appear to be utility/actions rather than palette-set content:
- Set Src From Current
- Set Dst From Current
- Scope Active Layer
- Scope Current Frame
- Scope Selected Range
- Replace Color
- Preset: custom
- Preset: default
- Preset: crayola008+
- Preset: w3c

The likely split should be:
- palette/preset browsing stays in the visible Palette panel
- palette actions/utilities move to a Palette menu/dropdown

## Scope
Surgical UI cleanup only.
Do not change color replacement behavior.
Do not remove palette preset support.
Do not change timeline/preview layout.
Do not reintroduce duplicate side surfaces.

## Required Changes

### 1. Keep the visible Palette panel focused
The visible Palette panel should show only:
- current palette preview
- currently selected preset name
- palette navigation if needed (Prev/Next or equivalent)
- compact preset browsing/listing that fits the panel cleanly

Do not keep the long utility/action stack in the panel.

### 2. Move non-palette utility actions into a Palette menu
Create a `Palette` menu entry or submenu under the most appropriate existing top-level menu structure.

Move these kinds of actions there:
- Set Src From Current
- Set Dst From Current
- Scope Active Layer
- Scope Current Frame
- Scope Selected Range
- Replace Color

If preset switching is too long for the panel, preset selection may also move into the Palette menu, or split into:
- visible compact preset selector in panel
- full preset list in menu

### 3. Keep palette.js-driven content visually distinct
Palette content that comes from palette/preset definitions should remain in the visible palette area.
Non-palette actions should not visually blend with preset browsing.

### 4. Prevent vertical overflow
- Palette area should no longer stretch off the bottom
- No important controls should require off-screen access
- Layout should fit cleanly in the assigned panel area

### 5. Keep behavior intact
- All moved actions must still work
- Preset changes must still work
- Replace/scoping/source-destination actions must still work
- Menu actions should use existing centralized action paths where possible

## Acceptance
- Palette panel no longer stretches off the bottom
- Palette panel shows palette-focused content only
- Non-palette utility actions move to a Palette menu/submenu
- Palette presets remain accessible
- Palette-related actions still work correctly
- Layout is cleaner and easier to scan
- No console errors

## Notes
This is a palette-panel cleanup pass.
Optimize for readability and fit, not feature expansion.
