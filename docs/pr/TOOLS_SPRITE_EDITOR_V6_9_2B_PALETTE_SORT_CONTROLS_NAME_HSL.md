# TOOLS_SPRITE_EDITOR_V6_9_2B_PALETTE_SORT_CONTROLS_NAME_HSL

## Purpose
Add palette sort controls at the bottom of the palette sidebar so visible colors can be organized by Name, Hue, Saturation, or Lightness.

## Requested Behavior
At the bottom of the palette sidebar, add sorting controls for:
- Name
- Hue
- Saturation
- Lightness

## Scope
Surgical sidebar enhancement only.
Do not cap palette size.
Do not remove full-palette scrolling.
Do not change palette data ownership.
Do not remove the top-level Palette menu or Palettes submenu.

## Required Changes

### 1. Add bottom-of-sidebar sort controls
- Place the sort UI at the bottom of the palette sidebar
- Keep it visible and readable within the palette section
- It should not overlap swatches or overflow off-screen

### 2. Supported sort options
Provide these sort modes:
- Name
- Hue
- Saturation
- Lightness

User-facing labels should match exactly:
- Name
- Hue
- Saturation
- Lightness

### 3. Sorting behavior
- Sorting affects the visible/selectable palette order in the sidebar
- It must not destroy or mutate the underlying palette definition permanently
- Switching palettes should still work correctly
- Selecting a color after sorting must still set the current color correctly

### 4. Expected sort semantics
- Name: sort by color name where available; if a palette entry has no friendly name, use a stable fallback
- Hue: sort by hue value
- Saturation: sort by saturation value
- Lightness: sort by lightness value using one consistent HSL rule

### 5. Preserve palette usability
- Full palette remains visible through scrolling
- End-of-list colors remain reachable
- Current color/readout still updates correctly
- Sorting should be fast enough for large palettes

### 6. Optional current sort indicator
- It should be clear which sort is active
- Acceptable approaches:
  - segmented control
  - dropdown
  - radio-style row
  - highlighted buttons

## Acceptance
- Palette sidebar includes sort controls at the bottom
- Sort options Name, Hue, Saturation, and Lightness are present
- Sorting changes the visible palette order correctly
- Full palette remains scrollable and selectable
- Current color selection still works after sorting
- No console errors

## Notes
This is a sidebar usability enhancement.
Keep the implementation compact and compatible with the existing full-palette display.
