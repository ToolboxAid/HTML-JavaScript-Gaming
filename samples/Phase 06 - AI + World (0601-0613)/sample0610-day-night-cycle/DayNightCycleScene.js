/*
Toolbox Aid
David Quesenberry
03/22/2026
DayNightCycleScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { DayNightCycle } from '../../../engine/world/index.js';

const theme = new Theme(ThemeTokens);

export default class DayNightCycleScene extends Scene {
  constructor() {
    super();
    this.cycle = new DayNightCycle({ durationSeconds: 8 });
  }

  update(dt) {
    this.cycle.update(dt);
  }

  render(renderer) {
    const lightness = this.cycle.getLightness();
    const skyAlpha = 0.15 + ((1 - lightness) * 0.6);

    drawFrame(renderer, theme, [
      'Engine sample 0610',
      'Time-of-day is tracked by an engine-owned cycle and can drive presentation.',
      'The sky darkens and brightens as the cycle advances.',
    ]);

    renderer.drawRect(100, 180, 760, 220, `rgba(15, 23, 42, ${skyAlpha.toFixed(2)})`);
    renderer.drawCircle(180 + lightness * 580, 220, 28, lightness > 0.5 ? '#fbbf24' : '#e2e8f0');

    drawPanel(renderer, 620, 34, 300, 126, 'Day / Night', [
      `Phase ratio: ${this.cycle.getPhaseRatio().toFixed(2)}`,
      `Lightness: ${lightness.toFixed(2)}`,
      'Sun and moon share the same cycle.',
      'Presentation reads engine time-of-day.',
    ]);
  }
}
