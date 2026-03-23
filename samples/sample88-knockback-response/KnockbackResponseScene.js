/*
Toolbox Aid
David Quesenberry
03/22/2026
KnockbackResponseScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import {
  applyAttackOverlaps,
  createAttackProfile,
  createCombatant,
  startAttack,
  updateAttackState,
  updateCombatant,
} from '../../engine/combat/index.js';

const theme = new Theme(ThemeTokens);

export default class KnockbackResponseScene extends Scene {
  constructor() {
    super();
    this.bounds = { x: 40, y: 120, width: 840, height: 360 };
    this.enemyBounds = { x: 420, y: 250, width: 430, height: 80 };
    this.player = createCombatant({ x: 220, y: 270, width: 34, height: 34 });
    this.enemy = createCombatant({ x: 620, y: 250, width: 44, height: 44, maxHealth: 99 });
    this.attackProfile = createAttackProfile({
      name: 'knockback_strike',
      activeSeconds: 0.12,
      recoverySeconds: 0.16,
      damage: 1,
      knockbackX: 320,
      hitboxes: [{ offsetX: 34, offsetY: 6, width: 28, height: 22 }],
    });
    this.attackState = null;
    this.message = 'Press Space near the dummy. The dummy should slide away and stay inside bounds.';
  }

  update(dt, engine) {
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

    if (engine.input.isActionPressed('attack') && !this.attackState) {
      this.attackState = startAttack(this.attackProfile);
    }

    if (this.attackState) {
      updateAttackState(this.attackState, dt);
      const hits = applyAttackOverlaps(this.player, this.attackState, [this.enemy]);
      if (hits.some((hit) => hit.applied)) {
        this.message = 'Hit applied. Knockback response came from the engine combat profile.';
      }

      if (this.attackState.phase === 'complete') {
        this.attackState = null;
      }
    }

    updateCombatant(this.enemy, dt, this.enemyBounds);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample88',
      'Knockback response is reusable and stays inside the lane bounds without scene hacks.',
      this.message,
    ]);

    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#d8d5ff', 2);
    renderer.strokeRect(this.enemyBounds.x, this.enemyBounds.y, this.enemyBounds.width, this.enemyBounds.height, '#64748b', 2);
    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, '#34d399');
    renderer.drawRect(this.enemy.x, this.enemy.y, this.enemy.width, this.enemy.height, this.enemy.hitFlashTime > 0 ? '#fbbf24' : '#ef4444');

    drawPanel(renderer, 620, 34, 300, 126, 'Knockback Debug', [
      `Enemy velocityX: ${this.enemy.velocityX.toFixed(1)}`,
      `Enemy x: ${this.enemy.x.toFixed(1)}`,
      `Facing: ${this.player.facing > 0 ? 'right' : 'left'}`,
      'The dummy should decelerate smoothly inside the lane.',
    ]);
  }
}
