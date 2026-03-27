# TOOLS_SPRITE_EDITOR_V6_9_4_GRID_CONTROLS_AND_SHEET_PREVIEW_LAYOUT

## Purpose
Make grid size controls visible, enlarge the Sheet Preview image to use the available vertical space, and move the `Frames: <count> Order: <x>` text to the right of Sheet Preview.

## Problems
1. Grid size controls for add/remove rows/columns are not visible enough or not visible at all.
2. Sheet Preview image is too small.
3. `Frames: 3  Order: x` style text needs to sit to the right of Sheet Preview instead of competing with the image area.

## Scope
Surgical layout/visibility cleanup only.
Do not change sprite sheet generation logic.
Do not change frame order behavior.
Do not redesign the preview system.

## Required Changes

### 1. Make grid size controls visible
- Ensure add/remove rows controls are visible
- Ensure add/remove columns controls are visible
- Grid controls should be clearly labeled and easy to click
- If current placement hides them, move them into a stable visible section
- Keep behavior intact

### 2. Enlarge Sheet Preview image
- Increase the Sheet Preview image size so it uses the available height from top to bottom within its preview region
- Prioritize preview visibility over surrounding text chrome
- Keep aspect ratio correct
- Do not let the image overflow outside its boundary

### 3. Move Frames/Order text to the right of Sheet Preview
- Move `Frames: <count>` and `Order: <value>` to the right of the Sheet Preview image
- Keep the text readable and aligned
- Do not let it overlap the preview image

### 4. Preserve preview usability
- Sheet Preview still updates correctly
- Timeline and animation preview continue to work
- No overlap with the reordered transport controls

## Acceptance
- Add/remove rows controls are visible
- Add/remove columns controls are visible
- Sheet Preview image is larger and fills the preview height better
- `Frames: <count>` and `Order: <value>` appear to the right of Sheet Preview
- No overlap with timeline controls
- No console errors

## Notes
This is a view/layout pass only.
Optimize for visibility and clean placement.
