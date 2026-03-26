Toolbox Aid
David Quesenberry
03/25/2026
README.md

# Vector Map Editor

## Purpose
Vector Map Editor is a new tools/ utility for authoring 2D and 3D vector geometry that can later support gameplay assets, editing workflows, and collision-ready content.

This CORE build includes:
- 2D edit mode
- 3D wireframe mode
- point / line / polyline / polygon creation
- select / move / delete
- automatic and manual center point control
- X / Y / Z rotation
- save / load JSON
- manual JSON editing in the tool
- fullscreen editing

## Controls

### Mouse
- Select tool: click object or point
- Move tool: drag selected object or point
- Rotate tool: drag left/right to rotate around Z
- Set Center tool: click to place center
- Point / Line / Polyline / Polygon: click to place points
- Double-click while drawing polyline/polygon to finish

### Keyboard
- Space + drag: pan viewport
- Delete: delete selected point/object
- Escape: cancel active line/polyline/polygon

## Center Point
Automatic center options:
- Bounds
- Centroid
- Origin
- Selection

Manual center options:
- Apply typed X/Y/Z
- Click in viewport with Set Center tool
- Use Selected Point

## JSON
The docked JSON editor supports:
- Validate
- Apply
- Pretty Print
- Revert

## Current limits
This CORE build does not yet include:
- collision flags
- collision test vectors
- runtime export split
- point-to-point color gradients
- Space Duel runtime integration

## Next planned PR
PLAN_PR_VECTOR_MAP_EDITOR_COLLISION_COLOR
