/*
Toolbox Aid
David Quesenberry
03/22/2026
RemoteEntityInterpolationScene.js
*/
import { Scene } from '/src/engine/scenes/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { RemoteInterpolationBuffer } from '/src/engine/network/index.js';

const theme = new Theme(ThemeTokens);

export default class RemoteEntityInterpolationScene extends Scene {
  constructor() {
    super();
    this.buffer = new RemoteInterpolationBuffer();
    this.tick = 0;
    this.raw = { x: 120, y: 280 };
    this.smoothed = { x: 120, y: 280 };
  }

  update() {
    this.tick += 1;
    if (this.tick % 18 === 0) {
      this.raw = {
        x: 120 + Math.sin(this.tick * 0.12) * 180,
        y: 280,
      };
      this.buffer.push({ tick: this.tick, state: this.raw });
    }

    this.smoothed = this.buffer.sample(this.tick - 6) || this.raw;
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample 1307',
      'Remote interpolation smooths between discrete network snapshots instead of snapping every update.',
      'Blue is raw snapshot position, green is interpolated remote view.',
    ]);
    renderer.drawRect(100, 220, 760, 170, '#0f172a');
    renderer.drawRect(this.raw.x, this.raw.y, 28, 28, '#38bdf8');
    renderer.drawRect(this.smoothed.x, this.smoothed.y + 48, 28, 28, '#34d399');
    drawPanel(renderer, 620, 40, 250, 160, 'Interpolation', [
      `Tick: ${this.tick}`,
      `Raw X: ${Math.round(this.raw.x)}`,
      `Smooth X: ${Math.round(this.smoothed?.x || 0)}`,
      `Buffered: ${this.buffer.snapshots.length}`,
    ]);
  }
}
