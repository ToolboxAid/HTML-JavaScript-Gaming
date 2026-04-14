/*
Toolbox Aid
David Quesenberry
03/22/2026
InputTimingWindowsScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';

const theme = new Theme(ThemeTokens);

export default class InputTimingWindowsScene extends Scene {
  constructor() {
    super();
    this.cycleSeconds = 1.8;
    this.windowSeconds = 0.22;
    this.reset();
  }

  reset() {
    this.time = 0;
    this.windowOpen = false;
    this.hits = 0;
    this.misses = 0;
    this.message = 'Press Space while the pulse is inside the gold zone.';
  }

  update(dt, engine) {
    if (engine.input.isActionPressed('reset')) {
      this.reset();
      return;
    }

    this.time += dt;
    const phase = (this.time % this.cycleSeconds) / this.cycleSeconds;
    const inWindow = phase >= 0.44 && phase <= 0.56;

    if (inWindow && !this.windowOpen) {
      engine.input.openActionWindow('parry', this.windowSeconds);
      this.windowOpen = true;
    }

    if (!inWindow && this.windowOpen) {
      if (!engine.input.consumeActionWindowHit('parry')) {
        this.misses += 1;
        this.message = 'Window closed with no hit.';
      } else {
        this.hits += 1;
        this.message = 'Perfect timing window hit.';
      }
      this.windowOpen = false;
    }
  }

  render(renderer, engine) {
    const phase = (this.time % this.cycleSeconds) / this.cycleSeconds;
    const pulseX = 140 + phase * 660;
    const windowX = 140 + 0.44 * 660;
    const windowWidth = (0.56 - 0.44) * 660;

    drawFrame(renderer, theme, [
      'Engine Sample81',
      'A valid action window opens only during the gold band.',
      this.message,
    ]);

    renderer.drawRect(100, 220, 760, 180, 'rgba(20, 24, 38, 0.92)');
    renderer.strokeRect(100, 220, 760, 180, '#d8d5ff', 2);
    renderer.drawRect(windowX, 286, windowWidth, 48, 'rgba(251, 191, 36, 0.18)');
    renderer.strokeRect(windowX, 286, windowWidth, 48, '#fbbf24', 3);
    renderer.drawRect(140, 306, 660, 8, '#60a5fa');
    renderer.drawRect(pulseX, 274, 18, 72, '#ef4444');

    drawPanel(renderer, 620, 34, 300, 126, 'Timing Windows', [
      `Window open: ${engine.input.isActionWindowOpen('parry')}`,
      `Window time: ${(engine.input.getActionWindowTime('parry') * 1000).toFixed(0)}ms`,
      `Hits: ${this.hits}`,
      `Misses: ${this.misses}`,
    ]);
  }
}
