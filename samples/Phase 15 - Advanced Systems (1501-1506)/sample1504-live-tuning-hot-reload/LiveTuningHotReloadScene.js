/*
Toolbox Aid
David Quesenberry
03/22/2026
LiveTuningHotReloadScene.js
*/
import { Scene } from '/src/engine/scenes/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { LiveTuningService } from '/src/engine/tooling/index.js';

const theme = new Theme(ThemeTokens);

export default class LiveTuningHotReloadScene extends Scene {
  constructor() {
    super();
    this.tuning = new LiveTuningService({ speed: 4 });
    this.actor = { x: 120, y: 290 };
    this.status = 'Hot-tune the speed value while the scene keeps running.';
    this.tuning.onChange('speed', (value) => {
      this.status = `Speed hot-reloaded to ${value}.`;
    });
  }

  tune(value) {
    this.tuning.set('speed', value);
  }

  update(dtSeconds) {
    this.actor.x += this.tuning.get('speed', 4) * 20 * dtSeconds;
    if (this.actor.x > 760) {
      this.actor.x = 120;
    }
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample 1504',
      'Live tuning updates runtime values immediately without a restart or scene rebuild.',
      this.status,
    ]);
    renderer.drawRect(this.actor.x, this.actor.y, 40, 40, '#fbbf24');
    drawPanel(renderer, 560, 40, 320, 180, 'Live Tuning', [
      `Speed: ${this.tuning.get('speed')}`,
      `Actor X: ${Math.round(this.actor.x)}`,
    ]);
  }
}
