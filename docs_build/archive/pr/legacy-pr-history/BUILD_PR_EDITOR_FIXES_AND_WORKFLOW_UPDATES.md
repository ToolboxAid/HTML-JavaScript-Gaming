# BUILD_PR_EDITOR_FIXES_AND_WORKFLOW_UPDATES

## Goal
Update the prior editor workflow bundle with four concrete fixes:
- SVG editor bounded-box placement must align correctly to the line/object being drawn
- SVG editor needs a palette dropdown
- Sprite Editor used-color swatches must represent all frame colors
- Tile Map Editor must support multiple PNG imports and tile assignment workflow

## Scope
- SVG Background Editor placement and palette UX
- Sprite Editor swatch behavior
- Tile Map Editor multi-PNG tile assignment
- no engine core API changes

## Observed SVG Issue
When a bounded selection box appears around a drawn line/object, the placed geometry does not align correctly with the visible line. The box appears offset from the drawn content.

## Output
One implementation-focused correction bundle covering all four issues.
