/*
Toolbox Aid
David Quesenberry
03/21/2026
Tilemap.js
*/
export default class Tilemap {
  constructor({ tileSize = 32, tiles = [[]], palette = {} } = {}) {
    this.tileSize = tileSize;
    this.tiles = tiles;
    this.palette = palette;
  }

  get width() {
    return this.tiles[0]?.length || 0;
  }

  get height() {
    return this.tiles.length;
  }

  getTile(col, row) {
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
      return null;
    }
    return this.tiles[row][col];
  }

  isSolid(col, row) {
    const tile = this.getTile(col, row);
    return tile === 1;
  }
}
