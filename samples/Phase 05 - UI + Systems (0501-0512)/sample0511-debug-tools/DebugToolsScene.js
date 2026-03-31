/*
Toolbox Aid
David Quesenberry
03/22/2026
DebugToolsScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawDebugBounds, drawDebugOverlay, drawFrame } from '../../../engine/debug/index.js';

const theme = new Theme(ThemeTokens);

export default class DebugToolsScene extends Scene {
  constructor() {
    super();
    this.player = { x: 180, y: 280, width: 34, height: 34 };
    this.showDebug = true;
    this.message = 'Press Tab to toggle the overlay and bounds visualization.';
  }

  update(dt, engine) {
    const move = 220 * dt;
    if (engine.input.isActionDown('move_left')) this.player.x -= move;
    if (engine.input.isActionDown('move_right')) this.player.x += move;
    if (engine.input.isActionPressed('debug')) this.showDebug = !this.showDebug;
    this.player.x = Math.max(40, Math.min(880, this.player.x));
  }

  render(renderer) {
    const sensor = { x: this.player.x + 34, y: this.player.y + 6, width: 40, height: 22, label: 'sensor' };
    const body = { ...this.player, label: 'body' };

    drawFrame(renderer, theme, [
      'Engine Sample95',
      'Reusable debug tools draw overlays and hitbox-style bounds only through engine debug paths.',
      this.message,
    ]);

    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, '#34d399');

    if (this.showDebug) {
      drawDebugBounds(renderer, [body], {
        fill: 'rgba(96, 165, 250, 0.14)',
        stroke: '#60a5fa',
        labels: true,
      });
      drawDebugBounds(renderer, [sensor], {
        fill: 'rgba(251, 191, 36, 0.14)',
        stroke: '#fbbf24',
        labels: true,
      });
      drawDebugOverlay(renderer, {
        title: 'Debug Tools',
        lines: [
          `Overlay visible: ${this.showDebug}`,
          `Body x: ${this.player.x.toFixed(0)}`,
          `Sensor width: ${sensor.width}`,
          'Bounds are renderer/debug owned.',
        ],
      }, {
        x: 620,
        y: 34,
        width: 300,
        height: 126,
      });
    }
  }
}
