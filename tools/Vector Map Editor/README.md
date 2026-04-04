Toolbox Aid
David Quesenberry
03/25/2026
README.md

# Vector Map Editor

Vector Map Editor is a repo-local tool for authoring 2D and 3D vector geometry.

## Current Core + Collision/Color Features
- 2D edit mode
- 3D wireframe mode
- point / line / polyline / polygon creation
- object selection and movement
- automatic and manual center point controls
- X / Y / Z rotation with spin buttons
- fullscreen workspace editing with full canvas priority
- manual JSON editing dock
- save/load editor JSON documents
- runtime JSON export
- per-object collision flags
- point-to-point colors
- mouse collision vector testing with first-hit reporting

## Save Outputs
- **Editor JSON**: full restore format for continued editing
- **Runtime JSON**: stripped geometry/flags export for downstream game use

## Fullscreen Behavior
Fullscreen targets the entire editor workspace so the active canvas gets the full viewport. Left and right panels are hidden by default in fullscreen and can be reopened as overlays.

## Collision Testing
Use the **Collision Vector** tool, click-drag on the canvas, and inspect the collision summary for the closest hit against flagged geometry.

## Notes
- Runtime export is intentionally game-agnostic.
- Space Duel-specific consumption should remain in a later game-facing PR.
