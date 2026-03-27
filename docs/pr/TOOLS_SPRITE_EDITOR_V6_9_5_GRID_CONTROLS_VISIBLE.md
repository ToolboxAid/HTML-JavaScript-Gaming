# TOOLS_SPRITE_EDITOR_V6_9_5_GRID_CONTROLS_VISIBLE

## Purpose
Apply a targeted fix so grid size controls are guaranteed visible and usable.

## Problem
The add/remove grid row/column controls are not reliably visible in the current layout.

## Scope
Targeted visibility fix only.
Do not redesign the editor.
Do not change grid behavior beyond where the controls are placed/presented.
Do not bundle unrelated layout polish into this patch.

## Required Changes

### 1. Create a dedicated visible Grid section
- Put grid controls in a clearly labeled `Grid` section
- Place the section in a stable always-visible area of the editor chrome
- Do not rely on cramped inline placement or overflow-prone positioning

### 2. Ensure all four actions are visible
The following controls must be visible at all times:
- Add Row
- Remove Row
- Add Column
- Remove Column

### 3. Use explicit labels
- Use readable button text or short labeled controls
- Do not hide meaning behind icons alone

### 4. Guarantee clickability
- Controls must have stable hit areas
- Controls must not overlap adjacent UI
- Controls must not be clipped by zoom/canvas/preview regions

### 5. Keep behavior intact
- Existing row/column add/remove behavior should still work
- No change to grid data model required unless needed for visibility wiring

## Acceptance
- Grid section is visibly present
- Add Row is visible and clickable
- Remove Row is visible and clickable
- Add Column is visible and clickable
- Remove Column is visible and clickable
- Controls do not overlap adjacent UI
- No console errors

## Notes
This is a guaranteed-visible placement fix.
Optimize for obvious visibility first, compactness second.
