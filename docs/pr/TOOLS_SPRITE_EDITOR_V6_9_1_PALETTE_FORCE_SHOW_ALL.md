# TOOLS_SPRITE_EDITOR_V6_9_1_PALETTE_FORCE_SHOW_ALL

## Purpose
Force the sidebar palette to show every color in the selected palette with no display limit of any kind.

## Problem Confirmed
The old 32-color truncation was removed, but the UI still does not show all colors for larger palettes.
That means there is still an effective display limit somewhere in layout, row calculation, visible-window math, scroll bounds, or swatch rendering.

## Required Result
Regardless of palette size:
- show all colors
- allow scrolling through all colors if needed
- no silent clipping
- no hidden tail of the palette
- colors at the end of the palette must be reachable and selectable

## Scope
Surgical palette rendering/scroll fix only.
Do not redesign palette behavior.
Do not remove the compact sidebar approach.
Do not reintroduce the old truncated panel.

## Required Changes

### 1. Remove any effective visible-row/render-window cap
Audit and fix:
- palette row count calculation
- swatch grid column/row math
- visible item count math
- scroll max / scroll range math
- draw loop limits
- hit-test limits

There must be no hard or soft limit based on:
- 32 colors
- fixed row count
- fixed visible-window size beyond the actual scrollable viewport

### 2. Make the sidebar palette truly scroll through the full palette
- The sidebar palette region must support the full palette length
- Mouse wheel/scroll logic must allow reaching the final color in the palette
- Scroll bounds must be based on total palette content height, not a capped value

### 3. Render all reachable swatches
- Swatches should be rendered for the full palette content based on current scroll offset
- Last palette entries must become visible when scrolling to the end
- Selection/hit testing must work for all rows, including the final rows

### 4. Keep it obvious when more colors exist below
If the palette exceeds the visible viewport:
- show a scrollbar, thumb, or clear scroll affordance
- do not rely on hidden behavior only

### 5. Keep current color/readout correct
- Selecting any palette color, including the last entries, must update current color/readout correctly

## Acceptance
- A 150-color palette shows all 150 colors through the sidebar viewport + scrolling
- No hidden tail of colors remains
- Last palette entries are visible and selectable
- Scroll reaches the true end of the palette
- Current color/readout updates correctly for end-of-list colors
- No console errors

## Notes
This is a render-window/scroll-bound correction.
The issue is now likely in viewport math, not palette data.
