/*
Toolbox Aid
David Quesenberry
03/22/2026
AttackTimingWindowsScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import {
  createAttackProfile,
  createCombatant,
  findAttackOverlaps,
  getAttackPhaseProgress,
  isAttackActive,
  startAttack,
  updateAttackState,
} from '../../../engine/combat/index.js';

const theme = new Theme(ThemeTokens);

export default class AttackTimingWindowsScene extends Scene {
  constructor() {
    super();
    this.bounds = { x: 40, y: 120, width: 840, height: 360 };
    this.player = createCombatant({ x: 210, y: 270, width: 34, height: 34 });
    this.target = createCombatant({ x: 450, y: 258, width: 46, height: 46 });
    this.attackProfile = createAttackProfile({
      name: 'timed_slash',
      startupSeconds: 0.24,
      activeSeconds: 0.14,
      recoverySeconds: 0.32,
      damage: 0,
      hitboxes: [{ offsetX: 34, offsetY: 4, width: 34, height: 24 }],
    });
    this.attackState = null;
    this.message = 'Press Space to watch startup, active, and recovery windows.';
    this.registeredOverlap = false;
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
      this.registeredOverlap = false;
    }

    if (this.attackState) {
      updateAttackState(this.attackState, dt);
      const overlaps = findAttackOverlaps(this.player, this.attackState, [this.target]);

      if (overlaps.length > 0) {
        this.registeredOverlap = true;
        this.message = 'The overlap is only being reported during the active phase.';
      } else {
        this.message = `Current phase: ${this.attackState.phase}.`;
      }

      if (this.attackState.phase === 'complete') {
        this.message = this.registeredOverlap
          ? 'Attack finished. Startup and recovery never registered a hit.'
          : 'Attack finished with no overlap. Move closer and try again.';
        this.attackState = null;
      }
    }
  }

  render(renderer) {
    const phase = this.attackState?.phase ?? 'idle';
    const progress = getAttackPhaseProgress(this.attackState);

    drawFrame(renderer, theme, [
      'Engine Sample86',
      'Attack timing is data-driven: startup, active, and recovery windows are reusable engine state.',
      this.message,
    ]);

    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#d8d5ff', 2);
    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, '#34d399');
    renderer.drawRect(this.target.x, this.target.y, this.target.width, this.target.height, '#94a3b8');

    renderer.drawRect(120, 320, 180, 28, phase === 'startup' ? '#60a5fa' : 'rgba(96, 165, 250, 0.18)');
    renderer.drawRect(320, 320, 140, 28, phase === 'active' ? '#fbbf24' : 'rgba(251, 191, 36, 0.18)');
    renderer.drawRect(480, 320, 220, 28, phase === 'recovery' ? '#f97316' : 'rgba(249, 115, 22, 0.18)');
    renderer.strokeRect(120, 320, 180, 28, '#60a5fa', 2);
    renderer.strokeRect(320, 320, 140, 28, '#fbbf24', 2);
    renderer.strokeRect(480, 320, 220, 28, '#f97316', 2);
    renderer.drawRect(120, 368, 580 * progress, 10, '#ffffff');

    drawPanel(renderer, 620, 34, 300, 126, 'Attack Phase Debug', [
      `Phase: ${phase}`,
      `Active: ${isAttackActive(this.attackState)}`,
      `Phase progress: ${(progress * 100).toFixed(0)}%`,
      `Overlap registered: ${this.registeredOverlap}`,
    ]);
  }
}
