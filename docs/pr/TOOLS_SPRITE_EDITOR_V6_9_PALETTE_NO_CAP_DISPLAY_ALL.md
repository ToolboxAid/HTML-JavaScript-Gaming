# TOOLS_SPRITE_EDITOR_V6_9_PALETTE_NO_CAP_DISPLAY_ALL

## Purpose
Remove the palette display cap so all colors in the selected palette are available and visible.

## Problem
A palette with about 150 colors was selected, but only 32 colors were shown.
The editor must not cap visible/usable palette colors to 32.

## Required Changes
- Remove any hard cap that limits displayed palette colors to 32
- Display all colors from the selected palette
- Keep the sidebar palette area compact, but allow full palette access:
  - continue down the sidebar
  - scroll if needed
  - do not silently truncate
- Ensure selecting colors beyond the old 32-color limit works
- Ensure current color/readout updates correctly for any selected palette color

## Scope
Surgical palette display fix only.
Do not redesign palette behavior.
Do not remove the top-level Palette menu.
Do not reintroduce bottom overflow or hidden truncation.

## Acceptance
- A 150-color palette displays all colors
- No 32-color cap remains
- Colors beyond index 31 are visible and selectable
- Current color/readout updates correctly
- Sidebar palette presentation remains usable
- No console errors
