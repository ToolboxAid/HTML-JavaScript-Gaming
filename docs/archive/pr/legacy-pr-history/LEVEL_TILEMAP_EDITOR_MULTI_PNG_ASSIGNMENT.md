# LEVEL_TILEMAP_EDITOR_MULTI_PNG_ASSIGNMENT

## Goal
Support loading multiple PNG files and assigning them as tiles in Tile Map Editor.

## Intended Flow
1. New Project or Load Project
2. Choose `Load Tile PNGs`
3. Select one or more PNG files
4. Imported PNGs appear in the tile selection panel/grid
5. Click a tile entry to make it active
6. Paint onto tile layers

## Also Supported
- `Load Tileset PNG`
- slice by tile width/height and optional spacing/margin
- generated entries appear in the same tile selection area

## Rules
- active tile remains selected until intentionally changed
- only tile layers accept image-tile painting
- collision/data layers remain non-image layers
- imported tile references are preserved where possible on save/load
