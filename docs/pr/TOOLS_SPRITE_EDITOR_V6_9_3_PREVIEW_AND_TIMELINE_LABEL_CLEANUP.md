# TOOLS_SPRITE_EDITOR_V6_9_3_PREVIEW_AND_TIMELINE_LABEL_CLEANUP

## Purpose
Clean up palette labeling, animation preview text, and timeline control ordering.

## Requested Changes
1. Where it says `Palette <name>`, change it to `Palette: <name>`
2. In Animation Preview:
   - remove state text like `Play`, `Paused`, etc.
   - remove the bottom line like `P play/pause [] frame`
3. In Timeline:
   - stack controls in this order:
     - Play
     - Stop
     - Loop
     - Range

## Scope
Surgical UI text/control cleanup only.
Do not change animation logic.
Do not remove animation preview itself.
Do not change palette sorting behavior.
Do not change timeline/frame behavior beyond control presentation/order.

## Required Changes

### 1. Palette label punctuation
- Update palette label rendering from:
  - `Palette <name>`
- To:
  - `Palette: <name>`

### 2. Simplify Animation Preview chrome
- Remove the animation state text label from the animation preview area
  - examples: `Play`, `Paused`, `Stopped`
- Remove the bottom helper/control line from animation preview
  - examples like `P play/pause` and frame hint text
- Keep the preview visual itself intact

### 3. Reorder Timeline controls
- Timeline controls should appear in this order:
  1. Play
  2. Stop
  3. Loop
  4. Range
- Keep their existing behaviors
- This is a presentation/order fix, not a logic change

## Acceptance
- Palette label displays as `Palette: <name>`
- Animation preview no longer shows state text
- Animation preview no longer shows the bottom helper/control line
- Timeline controls appear in order: Play, Stop, Loop, Range
- Existing timeline/preview controls still work
- No console errors

## Notes
This is a UI cleanup pass only.
Keep it small and presentation-focused.
