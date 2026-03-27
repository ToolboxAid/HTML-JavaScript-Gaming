# TOOLS_SPRITE_EDITOR_V6_8_1_LAYER_ROW_USABILITY_FIX

## Purpose
Make the layer rows clearly viewable and reliably usable.

## Problem
The layer row has improved from the old compressed bracket form, but it still needs a usability pass so the controls are obvious, readable, and easy to click.

## Scope
Surgical layer-panel usability fix only.
Do not redesign the editor.
Do not change layer data behavior.
Do not reintroduce duplicate layer entry points.
Do not move previews out of the bottom preview region.

## Required Changes

### 1. Make each layer row visually structured
Each row should read in a clear left-to-right order:
- visibility control
- layer name
- opacity
- active/current indicator

Do not show anonymous bracket-style controls.
Use explicit labels, icons, or readable badges.

### 2. Make controls readable
- Increase spacing/padding so items are not crowded together
- Ensure text is readable at normal editor scale
- Ensure visibility/current-state controls have clear visual states

### 3. Make controls clickable with stable hit areas
- Visibility toggle must have a reliable click target
- Active layer selection must have a reliable click target
- If row click selects the layer, keep that behavior consistent
- Avoid tiny hit boxes that only work in a narrow area

### 4. Clarify opacity display
- Show opacity in a stable readable form like `100%`
- Keep it aligned so multiple rows scan cleanly

### 5. Clarify active state
- Make the active layer visibly distinct
- Use a readable label/badge/highlight rather than cryptic symbols alone

### 6. Keep Add Layer only in Layer menu
- Do not reintroduce Add Layer in the sidebar
- Keep sidebar focused on viewing/selecting/managing existing layers only

### 7. Keep layout stable
- Layer rows should fit their section cleanly
- No overlap with adjacent sections
- No clipping of labels or badges

## Acceptance
- Layer rows are easy to read at a glance
- Visibility control is obvious and clickable
- Layer selection works reliably
- Active layer is clearly indicated
- Opacity is clearly displayed
- No anonymous bracket-style controls remain
- Sidebar layout remains clean
- Layer menu still owns Add Layer
- No console errors

## Notes
This is a usability/view fix, not a feature pass.
Optimize for clarity first, compactness second.
