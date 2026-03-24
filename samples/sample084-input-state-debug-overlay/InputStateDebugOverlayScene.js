/*
Toolbox Aid
David Quesenberry
03/22/2026
InputStateDebugOverlayScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame } from '../../engine/debug/index.js';
import { drawActionInputDebugOverlay } from '../../engine/input/index.js';

const theme = new Theme(ThemeTokens);

export default class InputStateDebugOverlayScene extends Scene {
  constructor() {
    super();
    this.time = 0;
    this.windowCycle = 1.8;
  }

  update(dt, engine) {
    this.time += dt;

    const phase = (this.time % this.windowCycle) / this.windowCycle;
    if (phase >= 0.4 && phase <= 0.5) {
      engine.input.openActionWindow('special', 0.14);
    }

    if (engine.input.isActionPressed('fire') && !engine.input.isActionOnCooldown('fire')) {
      engine.input.triggerActionCooldown('fire');
    }
  }

  render(renderer, engine) {
    drawFrame(renderer, theme, [
      'Engine Sample84',
      'Overlay shows down, pressed, buffered, queued, windows, cooldowns, and chains.',
      'Press J, K, L, Space, or R to watch the input state update live.',
    ]);

    renderer.drawRect(80, 220, 500, 180, 'rgba(20, 24, 38, 0.92)');
    renderer.strokeRect(80, 220, 500, 180, '#d8d5ff', 2);
    renderer.drawRect(110, 310, 440, 20, '#60a5fa');
    renderer.drawRect(110 + ((this.time * 160) % 420), 278, 24, 84, '#f97316');

    drawActionInputDebugOverlay(renderer, engine.input, {
      x: 590,
      y: 34,
      width: 340,
      height: 214,
      title: 'Input State Overlay',
      actions: ['light', 'guard', 'special', 'fire', 'reset'],
      chains: ['light_guard_special'],
    });
  }
}
