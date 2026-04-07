/*
Toolbox Aid
David Quesenberry
03/22/2026
SaveCompressionScene.js
*/
import { Scene } from '../../../src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../src/engine/debug/index.js';
import { compressJson, decompressJson } from '../../../src/engine/persistence/index.js';

const theme = new Theme(ThemeTokens);

export default class SaveCompressionScene extends Scene {
  constructor() {
    super();
    this.state = { hp: 5, coins: 12, room: 'A1' };
    this.saved = '';
    this.restored = null;
  }

  update(_dt, engine) {
    if (engine.input.isActionPressed('save')) {
      this.saved = compressJson(this.state);
    }

    if (engine.input.isActionPressed('load') && this.saved) {
      this.restored = decompressJson(this.saved);
    }
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine sample 0707',
      'Compressed save support stays inside engine persistence paths while preserving round-trip behavior.',
      'Press S to compress and L to restore.',
    ]);
    drawPanel(renderer, 60, 180, 840, 180, 'Save Compression', [
      `Original: ${JSON.stringify(this.state)}`,
      `Compressed length: ${this.saved.length}`,
      `Restored: ${this.restored ? JSON.stringify(this.restored) : 'not loaded yet'}`,
      'Compression is reusable and engine-owned.',
    ]);
  }
}
