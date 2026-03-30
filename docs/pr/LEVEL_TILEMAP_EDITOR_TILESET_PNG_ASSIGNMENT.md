# LEVEL_TILEMAP_EDITOR_TILESET_PNG_ASSIGNMENT

## Intended User Flow

1. Open Tile Map Editor
2. Create New Project or Load Project
3. Choose `Load Tileset PNG`
4. Select a PNG tileset image
5. Enter or confirm:
   - tile width
   - tile height
   - spacing/margin if applicable
6. Generate the selectable tile palette/grid
7. Click a tile from the generated tileset panel
8. Paint onto the active tilemap layer

## Required Behavior
- tileset PNG is stored in project/editor state
- selected tile remains active until user chooses another tile
- collision/data layers do not paint image tiles
- image-tile painting only applies to tile layers
- the active tileset should remain available after save/load where possible

## Minimum UI Labels
- Load Tileset PNG
- Tile Width
- Tile Height
- Spacing
- Margin
- Active Tile
- Active Layer

## Expected Result
A user can assign a tile PNG, slice it into tiles, pick a tile, and paint immediately.
