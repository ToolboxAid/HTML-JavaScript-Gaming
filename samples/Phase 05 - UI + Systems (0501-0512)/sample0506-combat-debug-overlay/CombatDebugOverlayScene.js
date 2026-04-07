/*
Toolbox Aid
David Quesenberry
03/22/2026
CombatDebugOverlayScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawCombatDebugOverlay, drawFrame, drawPanel } from '../../../engine/debug/index.js';
import {
  applyAttackOverlaps,
  createAttackProfile,
  createCombatant,
  startAttack,
  updateAttackState,
  updateCombatant,
} from '../../../engine/combat/index.js';

const theme = new Theme(ThemeTokens);

export default class CombatDebugOverlayScene extends Scene {
  constructor() {
    super();
    this.bounds = { x: 40, y: 120, width: 840, height: 360 };
    this.enemyBounds = { x: 460, y: 230, width: 350, height: 120 };
    this.reset();
  }

  reset() {
    this.player = createCombatant({ x: 180, y: 270, width: 34, height: 34 });
    this.enemy = createCombatant({
      x: 620,
      y: 248,
      width: 48,
      height: 56,
      maxHealth: 5,
      invulnerabilityDuration: 0.45,
      hurtboxes: [{ offsetX: 9, offsetY: 8, width: 30, height: 40 }],
    });
    this.attackProfile = createAttackProfile({
      name: 'debug_slash',
      startupSeconds: 0.18,
      activeSeconds: 0.12,
      recoverySeconds: 0.28,
      damage: 1,
      invulnerabilitySeconds: 0.45,
      knockbackX: 220,
      hitboxes: [{ offsetX: 34, offsetY: 6, width: 30, height: 22 }],
    });
    this.attackState = null;
    this.overlayVisible = true;
    this.message = 'Press Space to attack. Press Tab to toggle the engine combat debug overlay.';
  }

  update(dt, engine) {
    if (engine.input.isActionPressed('reset')) {
      this.reset();
      return;
    }

    if (engine.input.isActionPressed('debug')) {
      this.overlayVisible = !this.overlayVisible;
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

    if (engine.input.isActionDown('move_up')) {
      this.player.y -= move;
    }

    if (engine.input.isActionDown('move_down')) {
      this.player.y += move;
    }

    this.player.x = Math.max(this.bounds.x, Math.min(this.bounds.x + this.bounds.width - this.player.width, this.player.x));
    this.player.y = Math.max(this.bounds.y, Math.min(this.bounds.y + this.bounds.height - this.player.height, this.player.y));

    if (engine.input.isActionPressed('attack') && !this.attackState && !this.enemy.dead) {
      this.attackState = startAttack(this.attackProfile);
    }

    if (this.attackState) {
      updateAttackState(this.attackState, dt);
      const hits = applyAttackOverlaps(this.player, this.attackState, [this.enemy]);
      const applied = hits.find((hit) => hit.applied);

      if (applied) {
        this.message = applied.dead
          ? 'Overlay confirms HP hit zero and the target entered its dead state.'
          : 'Overlay shows hitboxes, hurtboxes, timing state, HP, and invulnerability in one view.';
      }

      if (this.attackState.phase === 'complete') {
        this.attackState = null;
      }
    }

    updateCombatant(this.enemy, dt, this.enemyBounds);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine sample 0506',
      'Combat debug rendering is engine-owned and can be toggled on without changing combat rules.',
      this.message,
    ]);

    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#d8d5ff', 2);
    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, '#34d399');

    if (!this.enemy.dead) {
      renderer.drawRect(this.enemy.x, this.enemy.y, this.enemy.width, this.enemy.height, this.enemy.hitFlashTime > 0 ? '#fbbf24' : '#ef4444');
    } else {
      renderer.drawRect(this.enemy.x, this.enemy.y + 26, this.enemy.width, 20, '#6b7280');
    }

    drawPanel(renderer, 60, 360, 420, 90, 'Overlay Toggle', [
      `Visible: ${this.overlayVisible}`,
      `Enemy HP: ${this.enemy.health}/${this.enemy.maxHealth}`,
    ]);

    if (this.overlayVisible) {
      drawCombatDebugOverlay(renderer, {
        attacker: this.player,
        attackState: this.attackState,
        targets: [this.enemy],
      }, {
        x: 570,
        y: 28,
        width: 360,
        height: 164,
        title: 'Combat State Overlay',
      });
    }
  }
}
