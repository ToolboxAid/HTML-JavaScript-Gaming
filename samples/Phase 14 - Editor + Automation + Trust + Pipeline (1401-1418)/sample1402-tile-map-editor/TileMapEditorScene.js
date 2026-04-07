/*
Toolbox Aid
David Quesenberry
03/22/2026
TileMapEditorScene.js
*/
import { Scene } from '../../../src/engine/scenes/index.js'; import { drawFrame, drawPanel } from '../../../src/engine/debug/index.js'; import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js'; import { TileMapEditor } from '../../../src/engine/editor/index.js';
const theme = new Theme(ThemeTokens);
export default class TileMapEditorScene extends Scene {
  constructor() { super(); this.editor = new TileMapEditor({ width: 8, height: 4 }); this.status = 'Pick a tile type, then paint a row.'; }
  setTile(tile) { this.editor.setActiveTile(tile); this.status = `Active tile changed to ${tile}.`; }
  paint() { for (let x = 0; x < this.editor.width; x += 1) { this.editor.paint(x, 1); } this.status = 'Painted the selected tile across one row.'; }
  render(renderer) {
    drawFrame(renderer, theme, ['Engine Sample 1402', 'Tile editing stays data-driven and compatible with grid map content.', this.status]);
    const colors = { 0: '#1e293b', 1: '#22c55e', 2: '#3b82f6' };
    this.editor.cells.forEach((row, y) => row.forEach((cell, x) => renderer.drawRect(120 + x * 42, 220 + y * 42, 36, 36, colors[cell] || '#64748b')));
    drawPanel(renderer, 620, 40, 240, 150, 'Tile Editor', [`Active Tile: ${this.editor.activeTile}`, `Painted Cell: ${this.editor.getCell(0, 1)}`]);
  }
}
