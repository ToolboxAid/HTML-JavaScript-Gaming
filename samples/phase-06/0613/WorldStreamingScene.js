/*
Toolbox Aid
David Quesenberry
03/22/2026
WorldStreamingScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { WorldStreamingSystem } from '/src/engine/world/index.js';

const theme = new Theme(ThemeTokens);

export default class WorldStreamingScene extends Scene {
  constructor() {
    super();
    this.player = { x: 140, y: 300, width: 34, height: 34 };
    this.streaming = new WorldStreamingSystem({ chunkWidth: 180, radius: 1 });
    this.loaded = this.streaming.update(this.player.x);
  }

  update(dt, engine) {
    const move = 220 * dt;
    if (engine.input.isActionDown('move_left')) this.player.x -= move;
    if (engine.input.isActionDown('move_right')) this.player.x += move;
    this.player.x = Math.max(0, Math.min(1260, this.player.x));
    this.loaded = this.streaming.update(this.player.x);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine sample 0613',
      'Chunk streaming keeps a reusable loaded-window around the player for scalable worlds.',
      'Move with Arrow keys to shift the loaded chunk set.',
    ]);

    this.loaded.forEach((chunkId) => {
      const x = 80 + chunkId * 180;
      renderer.drawRect(x, 220, 170, 120, '#1e293b');
      renderer.strokeRect(x, 220, 170, 120, '#60a5fa', 2);
      renderer.drawText(`chunk ${chunkId}`, x + 40, 286, { color: '#d0d5ff', font: '16px monospace' });
    });
    renderer.drawRect(80 + this.player.x, 300, this.player.width, this.player.height, '#34d399');

    drawPanel(renderer, 620, 34, 300, 126, 'World Streaming', [
      `Loaded chunks: ${this.loaded.join(', ')}`,
      `Chunk width: ${this.streaming.chunkWidth}`,
      `Radius: ${this.streaming.radius}`,
      'Only nearby chunks stay loaded.',
    ]);
  }
}
