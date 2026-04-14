/*
Toolbox Aid
David Quesenberry
03/22/2026
LevelEditorScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { LevelEditor } from '/src/engine/editor/index.js';

const theme = new Theme(ThemeTokens);

export default class LevelEditorScene extends Scene {
  constructor() {
    super();
    this.editor = new LevelEditor({ width: 8, height: 5 });
    this.status = 'Paint a simple reusable level pattern.';
  }
  paint() {
    for (let y = 0; y < this.editor.height; y += 1) {
      for (let x = 0; x < this.editor.width; x += 1) {
        this.editor.setCell(x, y, (x + y) % 2);
      }
    }
    this.status = 'Pattern written into editor-owned level data.';
  }
  render(renderer) {
    drawFrame(renderer, theme, ['Engine Sample 1401', 'Level editing state is separate from gameplay runtime.', this.status]);
    const level = this.editor.exportLevel();
    level.cells.forEach((row, y) => row.forEach((cell, x) => renderer.drawRect(120 + x * 42, 220 + y * 42, 36, 36, cell ? '#38bdf8' : '#1e293b')));
    drawPanel(renderer, 620, 40, 250, 150, 'Level Data', [`Width: ${level.width}`, `Height: ${level.height}`, `Cell 0,0: ${level.cells[0][0]}`]);
  }
}
