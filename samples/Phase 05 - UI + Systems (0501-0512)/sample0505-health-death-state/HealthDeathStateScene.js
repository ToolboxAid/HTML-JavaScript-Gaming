/*
Toolbox Aid
David Quesenberry
03/22/2026
HealthDeathStateScene.js
*/
import { Scene } from '../../../src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../src/engine/debug/index.js';
import {
  applyAttackOverlaps,
  createAttackProfile,
  createCombatant,
  startAttack,
  updateAttackState,
  updateCombatant,
} from '../../../src/engine/combat/index.js';

const theme = new Theme(ThemeTokens);

export default class HealthDeathStateScene extends Scene {
  constructor() {
    super();
    this.bounds = { x: 40, y: 120, width: 840, height: 360 };
    this.reset();
  }

  reset() {
    this.player = createCombatant({ x: 220, y: 270, width: 34, height: 34 });
    this.enemy = createCombatant({ x: 560, y: 252, width: 48, height: 48, maxHealth: 4 });
    this.attackProfile = createAttackProfile({
      name: 'health_check',
      startupSeconds: 0.08,
      activeSeconds: 0.1,
      recoverySeconds: 0.14,
      damage: 1,
      invulnerabilitySeconds: 0.12,
      knockbackX: 160,
      hitboxes: [{ offsetX: 34, offsetY: 6, width: 30, height: 22 }],
    });
    this.attackState = null;
    this.message = 'Press Space repeatedly until the dummy reaches zero HP.';
  }

  update(dt, engine) {
    if (engine.input.isActionPressed('reset')) {
      this.reset();
      return;
    }

    const move = 220 * dt;

    if (engine.input.isActionDown('move_left')) {
      this.player.x -= move;
      this.player.facing = -1;
    }

    if (engine.input.isActionDown('move_right')) {
      this.player.x += move;
      this.player.facing = 1;
    }

    this.player.x = Math.max(this.bounds.x, Math.min(this.bounds.x + this.bounds.width - this.player.width, this.player.x));

    if (engine.input.isActionPressed('attack') && !this.attackState && !this.enemy.dead) {
      this.attackState = startAttack(this.attackProfile);
    }

    if (this.attackState) {
      updateAttackState(this.attackState, dt);
      const hits = applyAttackOverlaps(this.player, this.attackState, [this.enemy]);
      const latestApplied = hits.find((hit) => hit.applied);

      if (latestApplied) {
        this.message = latestApplied.dead
          ? 'Dummy HP reached zero. Dead/disabled state is now active.'
          : `Dummy took 1 damage. ${latestApplied.health} HP remains.`;
      }

      if (this.attackState.phase === 'complete') {
        this.attackState = null;
      }
    }

    updateCombatant(this.enemy, dt, this.bounds);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine sample 0505',
      'Health and death state live in reusable combat data; the sample only proves the transition.',
      this.message,
    ]);

    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#d8d5ff', 2);
    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, '#34d399');

    if (!this.enemy.dead) {
      renderer.drawRect(this.enemy.x, this.enemy.y, this.enemy.width, this.enemy.height, this.enemy.hitFlashTime > 0 ? '#fbbf24' : '#ef4444');
    } else {
      renderer.drawRect(this.enemy.x, this.enemy.y + 26, this.enemy.width, 20, '#6b7280');
      renderer.drawText('DEAD', this.enemy.x + 4, this.enemy.y + 18, {
        color: '#ffffff',
        font: 'bold 14px monospace',
      });
    }

    drawPanel(renderer, 620, 34, 300, 126, 'Health Debug', [
      `Enemy HP: ${this.enemy.health}/${this.enemy.maxHealth}`,
      `Enemy dead: ${this.enemy.dead}`,
      `Enemy disabled: ${this.enemy.disabled}`,
      'Press R to restore the target after death.',
    ]);
  }
}
