# BUILD_PR_SVG_PAN_BUTTON_REMOVAL_AND_TILESET_PNG_ASSIGNMENT

## Goal
Apply one small SVG editor UX correction and document the intended Tile Map Editor PNG tileset assignment flow.

## Scope
- remove the explicit Pan button from the SVG Background Editor UI
- standardize panning to middle mouse behavior
- define the Tile Map Editor tile PNG assignment workflow
- no engine core API changes

## Decisions
- SVG editor panning uses middle mouse only
- the Pan button should be removed to reduce redundant controls
- Tile Map Editor should support assigning a tile PNG through a tileset load/select flow

## Output
- one SVG editor UX correction
- one clear tile PNG assignment workflow for Tile Map Editor
