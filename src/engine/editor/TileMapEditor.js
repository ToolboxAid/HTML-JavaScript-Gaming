/*
Toolbox Aid
David Quesenberry
03/22/2026
TileMapEditor.js
*/
import LevelEditor from './LevelEditor.js';

export default class TileMapEditor extends LevelEditor {
  constructor(options = {}) {
    super(options);
    this.activeTile = options.activeTile || 1;
  }

  setActiveTile(tileId) {
    this.activeTile = tileId;
  }

  paint(x, y) {
    this.setCell(x, y, this.activeTile);
  }
}
