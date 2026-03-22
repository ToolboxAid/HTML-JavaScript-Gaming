/*
Toolbox Aid
David Quesenberry
03/22/2026
ActionCooldownsScene.js
*/
import Scene from '../../engine/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';

const theme = new Theme(ThemeTokens);

export default class ActionCooldownsScene extends Scene {
  constructor() {
    super();
    this.cooldownSeconds = 1.1;
    this.reset();
  }

  reset() {
    this.shots = 0;
    this.message = 'Press Space to fire. Cooldown blocks retrigger.';
  }

  update(_dt, engine) {
    if (engine.input.isActionPressed('reset')) {
      this.reset();
      return;
    }

    if (engine.input.isActionPressed('cast')) {
      if (!engine.input.isActionOnCooldown('cast')) {
        this.shots += 1;
        this.message = 'Cast executed. Cooldown started.';
        engine.input.triggerActionCooldown('cast');
      } else {
        this.message = 'Cast blocked by cooldown.';
      }
    }
  }

  render(renderer, engine) {
    const cooldownTime = engine.input.getActionCooldownTime('cast');
    const ratio = 1 - (cooldownTime / this.cooldownSeconds);

    drawFrame(renderer, theme, [
      'Engine Sample82',
      'Cooldown timers prevent immediate retrigger after activation.',
      this.message,
    ]);

    renderer.drawRect(100, 220, 760, 180, 'rgba(20, 24, 38, 0.92)');
    renderer.strokeRect(100, 220, 760, 180, '#d8d5ff', 2);
    renderer.drawRect(170, 278, 620, 28, 'rgba(148, 163, 184, 0.22)');
    renderer.drawRect(170, 278, 620 * ratio, 28, '#22c55e');
    renderer.drawRect(170 + 620 * ratio - 8, 268, 16, 48, '#f97316');

    drawPanel(renderer, 620, 34, 300, 126, 'Action Cooldowns', [
      `Cooldown: ${cooldownTime.toFixed(2)}s`,
      `Ready: ${!engine.input.isActionOnCooldown('cast')}`,
      `Shots fired: ${this.shots}`,
      `Configured: ${this.cooldownSeconds.toFixed(2)}s`,
    ]);
  }
}
