Toolbox Aid
David Quesenberry
04/04/2026
README.md

# Tilemap Studio

This tool provides the Tilemap Studio foundation for map authoring in the repo.

## Included
- Tile painting, erase, and value picker
- Tile, collision, and data layers
- Layer add/remove/visibility controls
- Tileset palette selection
- Object and spawn marker placement
- JSON map load/save
- Top-level project actions for new/load/sample/save/simulate/export/package
- Simulation mode for tile/data/object preview

## Parallax boundary
- Parallax editing remains out of scope for this tool.
- Saved documents include a reserved `parallax` block for a later companion Parallax Scene Studio flow.

## Project asset registry
- Supports loading and saving `project.assets.json`.
- Tile map saves additively register shared `tilemaps` and relevant `tilesets`.
- Tile map JSON includes optional `assetRefs` for `tilemapId` and `tilesetId`.
- Legacy tile map files without `assetRefs` continue to load and save.

## Entry point
- `tools/Tilemap Studio/index.html`

## Samples
- Manifest: `tools/Tilemap Studio/samples/sample-manifest.json`
- Sample files are local to the Tilemap Studio tool.
