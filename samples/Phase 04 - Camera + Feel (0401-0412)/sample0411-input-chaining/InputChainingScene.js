/*
Toolbox Aid
David Quesenberry
03/22/2026
InputChainingScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';

const theme = new Theme(ThemeTokens);

export default class InputChainingScene extends Scene {
  constructor() {
    super();
    this.reset();
  }

  reset() {
    this.combos = 0;
    this.flashTimer = 0;
    this.message = 'Press J, J, then K to complete the chain.';
  }

  update(dt, engine) {
    if (engine.input.isActionPressed('reset')) {
      this.reset();
      return;
    }

    this.flashTimer = Math.max(0, this.flashTimer - dt);

    if (engine.input.consumeActionChain('double_jab_launch')) {
      this.combos += 1;
      this.flashTimer = 0.35;
      this.message = 'Chain completed.';
    }
  }

  render(renderer, engine) {
    const progress = engine.input.getActionChainProgress('double_jab_launch');
    const chainReady = this.flashTimer > 0;

    drawFrame(renderer, theme, [
      'Engine Sample83',
      'Action sequences can complete named chains inside a timing window.',
      this.message,
    ]);

    renderer.drawRect(100, 220, 760, 180, 'rgba(20, 24, 38, 0.92)');
    renderer.strokeRect(100, 220, 760, 180, '#d8d5ff', 2);

    const colors = ['#22c55e', '#22c55e', '#f97316'];
    const labels = ['J', 'J', 'K'];
    for (let index = 0; index < 3; index += 1) {
      const active = progress > index || (chainReady && index === 2);
      renderer.drawRect(180 + index * 170, 282, 120, 56, active ? colors[index] : 'rgba(148, 163, 184, 0.28)');
      renderer.strokeRect(180 + index * 170, 282, 120, 56, colors[index], 2);
      renderer.drawText(labels[index], 232 + index * 170, 317, {
        color: '#081018',
        font: 'bold 26px monospace',
      });
    }

    drawPanel(renderer, 620, 34, 300, 126, 'Input Chaining', [
      'Sequence: J, J, K',
      `Progress: ${progress}/3`,
      `Combos: ${this.combos}`,
      `Chain live: ${chainReady}`,
    ]);
  }
}
