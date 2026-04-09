/*
Toolbox Aid
David Quesenberry
03/22/2026
Combat.test.mjs
*/
import assert from 'node:assert/strict';
import {
  applyAttackOverlaps,
  createAttackProfile,
  createCombatant,
  getAttackHitboxes,
  isAttackActive,
  startAttack,
  updateAttackState,
  updateCombatant,
} from '/src/engine/combat/index.js';

export function run() {
  const attacker = createCombatant({ x: 100, y: 100, width: 30, height: 30, facing: 1 });
  const target = createCombatant({ x: 132, y: 100, width: 30, height: 30, maxHealth: 3, invulnerabilityDuration: 0.5 });
  const attack = createAttackProfile({
    startupSeconds: 0.1,
    activeSeconds: 0.2,
    recoverySeconds: 0.1,
    damage: 1,
    knockbackX: 180,
    hitboxes: [{ offsetX: 30, offsetY: 4, width: 24, height: 22 }],
  });

  const state = startAttack(attack);
  assert.equal(isAttackActive(state), false);
  assert.equal(getAttackHitboxes(attacker, state).length, 0);

  updateAttackState(state, 0.1);
  assert.equal(isAttackActive(state), true);
  assert.equal(getAttackHitboxes(attacker, state).length, 1);

  const firstHit = applyAttackOverlaps(attacker, state, [target]);
  assert.equal(firstHit.length, 1);
  assert.equal(firstHit[0].applied, true);
  assert.equal(target.health, 2);
  assert.equal(target.invulnerabilityTime > 0, true);
  assert.equal(target.velocityX > 0, true);

  const secondHit = applyAttackOverlaps(attacker, state, [target]);
  assert.equal(secondHit.length, 0);

  updateCombatant(target, 0.25);
  assert.equal(target.x > 132, true);
  assert.equal(target.invulnerabilityTime < 0.5, true);

  updateAttackState(state, 0.25);
  assert.equal(isAttackActive(state), false);

  const leftAttacker = createCombatant({ x: 200, y: 100, width: 30, height: 30, facing: -1 });
  const leftTarget = createCombatant({ x: 168, y: 100, width: 30, height: 30, maxHealth: 1, invulnerabilityDuration: 0 });
  const leftState = startAttack(createAttackProfile({
    activeSeconds: 0.1,
    damage: 1,
    knockbackX: 150,
    hitboxes: [{ offsetX: 30, offsetY: 0, width: 24, height: 24 }],
  }));

  const leftHit = applyAttackOverlaps(leftAttacker, leftState, [leftTarget]);
  assert.equal(leftHit.length, 1);
  assert.equal(leftTarget.dead, true);
  assert.equal(leftTarget.velocityX < 0, true);
}
