/*
Toolbox Aid
David Quesenberry
03/22/2026
CombatDebugOverlay.js
*/
import { drawPanel } from './DebugPanel.js';
import {
  getAttackHitboxes,
  getAttackPhaseProgress,
  getCombatantHurtboxes,
  isAttackActive,
} from '../combat/index.js';

function drawBoxSet(renderer, boxes, fillColor, strokeColor) {
  boxes.forEach((box) => {
    renderer.drawRect(box.x, box.y, box.width, box.height, fillColor);
    renderer.strokeRect(box.x, box.y, box.width, box.height, strokeColor, 2);
  });
}

export function drawCombatDebugOverlay(
  renderer,
  {
    attacker = null,
    attackState = null,
    targets = [],
  } = {},
  {
    x = 590,
    y = 28,
    width = 340,
    height = 214,
    title = 'Combat Overlay',
    drawWorldBoxes = true,
  } = {},
) {
  const phase = attackState?.phase ?? 'idle';
  const phaseProgress = getAttackPhaseProgress(attackState);
  const hitboxes = getAttackHitboxes(attacker, attackState, { includeInactive: true });
  const activeHitboxes = getAttackHitboxes(attacker, attackState);
  const hurtboxCount = targets.reduce((count, target) => count + getCombatantHurtboxes(target).length, 0);

  if (drawWorldBoxes) {
    targets.forEach((target) => {
      drawBoxSet(renderer, getCombatantHurtboxes(target), 'rgba(239, 68, 68, 0.16)', '#ef4444');
    });

    if (hitboxes.length > 0) {
      drawBoxSet(
        renderer,
        hitboxes,
        isAttackActive(attackState) ? 'rgba(251, 191, 36, 0.22)' : 'rgba(148, 163, 184, 0.12)',
        isAttackActive(attackState) ? '#fbbf24' : '#94a3b8',
      );
    }
  }

  const lines = [
    `Phase: ${phase}`,
    `Phase progress: ${(phaseProgress * 100).toFixed(0)}%`,
    `Active: ${isAttackActive(attackState)}`,
    `Hitboxes: ${activeHitboxes.length}/${hitboxes.length}`,
    `Hurtboxes: ${hurtboxCount}`,
  ];

  targets.forEach((target, index) => {
    lines.push(
      `T${index + 1} HP ${target.health}/${target.maxHealth} invuln ${target.invulnerabilityTime.toFixed(2)}s dead ${target.dead}`,
    );
  });

  drawPanel(renderer, x, y, width, height, title, lines.slice(0, 8));
}
