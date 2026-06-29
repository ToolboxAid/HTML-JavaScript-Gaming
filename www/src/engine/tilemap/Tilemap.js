/*
Toolbox Aid
David Quesenberry
03/21/2026
Tilemap.js
*/
export default class Tilemap {
  constructor({ tileSize = 32, tiles = [[]], palette = {}, definitions = {} } = {}) {
    this.tileSize = tileSize;
    this.tiles = tiles;
    this.palette = palette;
    this.definitions = definitions;
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

  getDefinition(col, row) {
    const tile = this.getTile(col, row);
    if (tile === null) {
      return null;
    }

    return this.definitions[tile] || null;
  }

  getTileColor(col, row) {
    const definition = this.getDefinition(col, row);
    return definition?.color || this.palette[this.getTile(col, row)] || '#111827';
  }

  isSolid(col, row) {
    const definition = this.getDefinition(col, row);
    if (definition && typeof definition.solid === 'boolean') {
      return definition.solid;
    }

    const tile = this.getTile(col, row);
    return tile === 1;
  }
}
