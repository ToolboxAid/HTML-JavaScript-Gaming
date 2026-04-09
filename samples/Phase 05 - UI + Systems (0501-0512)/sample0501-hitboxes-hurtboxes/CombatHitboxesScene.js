/*
Toolbox Aid
David Quesenberry
03/22/2026
CombatHitboxesScene.js
*/
import { Scene } from '/src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import {
  createAttackProfile,
  createCombatant,
  findAttackOverlaps,
  getAttackHitboxes,
  getCombatantHurtboxes,
  isAttackActive,
  startAttack,
  updateAttackState,
} from '/src/engine/combat/index.js';

const theme = new Theme(ThemeTokens);

export default class CombatHitboxesScene extends Scene {
  constructor() {
    super();
    this.bounds = { x: 40, y: 120, width: 840, height: 360 };
    this.player = createCombatant({ x: 170, y: 270, width: 34, height: 34 });
    this.target = createCombatant({
      x: 620,
      y: 248,
      width: 48,
      height: 56,
      hurtboxes: [{ offsetX: 9, offsetY: 8, width: 30, height: 40 }],
    });
    this.attackProfile = createAttackProfile({
      name: 'proof_hitbox',
      activeSeconds: 0.18,
      damage: 0,
      hitboxes: [{ offsetX: 34, offsetY: 6, width: 28, height: 22 }],
    });
    this.attackState = null;
    this.message = 'Press Space near the dummy to project the attack region.';
    this.overlapCount = 0;
    this.overlapDetected = false;
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

    if (engine.input.isActionDown('move_up')) {
      this.player.y -= move;
    }

    if (engine.input.isActionDown('move_down')) {
      this.player.y += move;
    }

    this.player.x = Math.max(this.bounds.x, Math.min(this.bounds.x + this.bounds.width - this.player.width, this.player.x));
    this.player.y = Math.max(this.bounds.y, Math.min(this.bounds.y + this.bounds.height - this.player.height, this.player.y));

    if (engine.input.isActionPressed('attack') && !this.attackState) {
      this.attackState = startAttack(this.attackProfile);
      this.overlapDetected = false;
    }

    this.overlapCount = 0;

    if (this.attackState) {
      updateAttackState(this.attackState, dt);
      const overlaps = findAttackOverlaps(this.player, this.attackState, [this.target]);
      this.overlapCount = overlaps.length;
      this.overlapDetected = this.overlapDetected || overlaps.length > 0;

      if (isAttackActive(this.attackState)) {
        this.message = overlaps.length > 0
          ? 'Active hitbox is overlapping the dummy hurtbox.'
          : 'Attack is active, but the hurtbox is not inside range.';
      }

      if (this.attackState.phase === 'complete') {
        this.attackState = null;
        this.message = this.overlapDetected
          ? 'Last attack overlapped the dummy hurtbox.'
          : 'Last attack missed the dummy hurtbox.';
      }
    }
  }

  render(renderer) {
    const attackBoxes = getAttackHitboxes(this.player, this.attackState, { includeInactive: true });
    const hurtboxes = getCombatantHurtboxes(this.target);
    const attackActive = isAttackActive(this.attackState);

    drawFrame(renderer, theme, [
      'Engine sample 0501',
      'Reusable combat data defines hitboxes and hurtboxes without scene-owned overlap rules.',
      this.message,
    ]);

    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#d8d5ff', 2);
    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, '#34d399');
    renderer.drawRect(this.target.x, this.target.y, this.target.width, this.target.height, '#94a3b8');

    hurtboxes.forEach((box) => {
      renderer.strokeRect(box.x, box.y, box.width, box.height, '#ef4444', 2);
    });

    attackBoxes.forEach((box) => {
      if (attackActive) {
        renderer.drawRect(box.x, box.y, box.width, box.height, 'rgba(251, 191, 36, 0.28)');
      }
      renderer.strokeRect(box.x, box.y, box.width, box.height, attackActive ? '#fbbf24' : '#94a3b8', 2);
    });

    drawPanel(renderer, 620, 34, 300, 146, 'Hitbox Debug', [
      `Attack phase: ${this.attackState?.phase ?? 'idle'}`,
      `Hitbox active: ${attackActive}`,
      `Overlap: ${this.overlapDetected}`,
      `Overlap count: ${this.overlapCount}`,
      `Hurtboxes: ${hurtboxes.length}`,
    ]);
  }
}
