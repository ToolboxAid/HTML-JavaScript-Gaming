/*
Toolbox Aid
David Quesenberry
03/21/2026
TileMetadata.js
*/
export function getTileMetadataAtWorldPoint(tilemap, worldX, worldY, worldOffset = { x: 0, y: 0 }) {
  const col = Math.floor((worldX - worldOffset.x) / tilemap.tileSize);
  const row = Math.floor((worldY - worldOffset.y) / tilemap.tileSize);
  const tile = tilemap.getTile(col, row);

  if (tile === null) {
    return null;
  }

  return {
    tile,
    col,
    row,
    ...tilemap.getDefinition(col, row),
  };
}
