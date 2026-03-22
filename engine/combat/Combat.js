/*
Toolbox Aid
David Quesenberry
03/22/2026
Combat.js
*/
import { isColliding } from '../collision/aabb.js';
import { clamp } from '../utils/math.js';

function sanitizeDuration(value) {
  return Math.max(0, Number(value) || 0);
}

function getOpeningPhase(profile) {
  if (profile.startupSeconds > 0) {
    return 'startup';
  }

  if (profile.activeSeconds > 0) {
    return 'active';
  }

  if (profile.recoverySeconds > 0) {
    return 'recovery';
  }

  return 'complete';
}

function getPhaseDuration(profile, phase) {
  if (phase === 'startup') {
    return profile.startupSeconds;
  }

  if (phase === 'active') {
    return profile.activeSeconds;
  }

  if (phase === 'recovery') {
    return profile.recoverySeconds;
  }

  return 0;
}

function advancePhase(state) {
  if (!state || state.phase === 'complete') {
    return;
  }

  if (state.phase === 'startup') {
    state.phase = state.profile.activeSeconds > 0
      ? 'active'
      : (state.profile.recoverySeconds > 0 ? 'recovery' : 'complete');
  } else if (state.phase === 'active') {
    state.phase = state.profile.recoverySeconds > 0 ? 'recovery' : 'complete';
  } else {
    state.phase = 'complete';
  }

  state.phaseTime = 0;
  state.phaseRemaining = getPhaseDuration(state.profile, state.phase);
}

function applyAxisDrag(value, drag, dt) {
  if (!drag) {
    return value;
  }

  if (value > 0) {
    return Math.max(0, value - drag * dt);
  }

  if (value < 0) {
    return Math.min(0, value + drag * dt);
  }

  return 0;
}

export function createCombatant({
  x = 0,
  y = 0,
  width = 32,
  height = 32,
  facing = 1,
  hurtboxes = null,
  maxHealth = 1,
  health = null,
  invulnerabilityDuration = 0.45,
  hitFlashDuration = 0.12,
  knockbackDrag = 900,
  velocityX = 0,
  velocityY = 0,
  disabled = false,
} = {}) {
  const resolvedHealth = health ?? maxHealth;

  return {
    x,
    y,
    width,
    height,
    facing: facing >= 0 ? 1 : -1,
    hurtboxes: Array.isArray(hurtboxes) && hurtboxes.length > 0
      ? hurtboxes.map((box) => ({
        offsetX: box.offsetX ?? 0,
        offsetY: box.offsetY ?? 0,
        width: box.width ?? width,
        height: box.height ?? height,
        enabled: box.enabled !== false,
      }))
      : [{ offsetX: 0, offsetY: 0, width, height, enabled: true }],
    maxHealth: Math.max(0, maxHealth),
    health: clamp(resolvedHealth, 0, Math.max(0, maxHealth)),
    invulnerabilityDuration: sanitizeDuration(invulnerabilityDuration),
    invulnerabilityTime: 0,
    hitFlashDuration: sanitizeDuration(hitFlashDuration),
    hitFlashTime: 0,
    knockbackDrag: Math.max(0, Number(knockbackDrag) || 0),
    velocityX,
    velocityY,
    disabled,
    dead: disabled || resolvedHealth <= 0,
  };
}

export function createAttackProfile({
  name = 'attack',
  startupSeconds = 0,
  activeSeconds = 0.12,
  recoverySeconds = 0,
  damage = 1,
  invulnerabilitySeconds = null,
  knockbackX = 0,
  knockbackY = 0,
  hitboxes = [],
} = {}) {
  return {
    name,
    startupSeconds: sanitizeDuration(startupSeconds),
    activeSeconds: sanitizeDuration(activeSeconds),
    recoverySeconds: sanitizeDuration(recoverySeconds),
    damage: Math.max(0, Number(damage) || 0),
    invulnerabilitySeconds,
    knockbackX: Number(knockbackX) || 0,
    knockbackY: Number(knockbackY) || 0,
    hitboxes: hitboxes.map((box) => ({
      offsetX: box.offsetX ?? 0,
      offsetY: box.offsetY ?? 0,
      width: box.width ?? 0,
      height: box.height ?? 0,
      enabled: box.enabled !== false,
    })),
  };
}

export function startAttack(profile) {
  const phase = getOpeningPhase(profile);

  return {
    profile,
    phase,
    phaseTime: 0,
    phaseRemaining: getPhaseDuration(profile, phase),
    elapsed: 0,
    hitTargets: new Set(),
  };
}

export function isAttackComplete(state) {
  return !state || state.phase === 'complete';
}

export function isAttackActive(state) {
  return Boolean(state) && state.phase === 'active';
}

export function updateAttackState(state, dt) {
  if (!state || state.phase === 'complete' || dt <= 0) {
    return state;
  }

  let remaining = dt;

  while (remaining > 0 && state.phase !== 'complete') {
    if (state.phaseRemaining <= 0) {
      advancePhase(state);
      continue;
    }

    const step = Math.min(remaining, state.phaseRemaining);
    state.phaseTime += step;
    state.phaseRemaining -= step;
    state.elapsed += step;
    remaining -= step;

    if (state.phaseRemaining <= 0) {
      advancePhase(state);
    }
  }

  return state;
}

export function getAttackPhaseProgress(state) {
  if (!state || state.phase === 'complete') {
    return 1;
  }

  const duration = getPhaseDuration(state.profile, state.phase);
  if (duration <= 0) {
    return 1;
  }

  return clamp(state.phaseTime / duration, 0, 1);
}

export function getWorldBoxes(actor, boxes = [], { mirror = false } = {}) {
  if (!actor) {
    return [];
  }

  return boxes
    .filter((box) => box && box.enabled !== false)
    .map((box) => {
      const width = box.width ?? 0;
      const height = box.height ?? 0;
      const facingLeft = mirror && actor.facing < 0;
      const x = facingLeft
        ? actor.x + actor.width - (box.offsetX ?? 0) - width
        : actor.x + (box.offsetX ?? 0);

      return {
        x,
        y: actor.y + (box.offsetY ?? 0),
        width,
        height,
      };
    });
}

export function getCombatantHurtboxes(actor) {
  return getWorldBoxes(actor, actor?.hurtboxes ?? []);
}

export function getAttackHitboxes(actor, state, { includeInactive = false } = {}) {
  if (!state || !state.profile) {
    return [];
  }

  if (!includeInactive && !isAttackActive(state)) {
    return [];
  }

  return getWorldBoxes(actor, state.profile.hitboxes, { mirror: true });
}

export function findAttackOverlaps(attacker, state, targets = []) {
  const hitboxes = getAttackHitboxes(attacker, state);
  const overlaps = [];

  hitboxes.forEach((hitbox) => {
    targets.forEach((target) => {
      getCombatantHurtboxes(target).forEach((hurtbox) => {
        if (isColliding(hitbox, hurtbox)) {
          overlaps.push({ attacker, target, hitbox, hurtbox });
        }
      });
    });
  });

  return overlaps;
}

export function applyAttackToTarget(target, attackProfile, attacker = null) {
  if (!target || !attackProfile) {
    return { applied: false, reason: 'invalid' };
  }

  if (target.dead || target.disabled) {
    return { applied: false, reason: 'disabled' };
  }

  if (target.invulnerabilityTime > 0) {
    return { applied: false, reason: 'invulnerable' };
  }

  const damage = Math.max(0, attackProfile.damage ?? 0);
  target.health = clamp(target.health - damage, 0, target.maxHealth);
  target.dead = target.health <= 0;
  target.disabled = target.disabled || target.dead;

  const invulnerabilitySeconds = attackProfile.invulnerabilitySeconds ?? target.invulnerabilityDuration;
  target.invulnerabilityTime = sanitizeDuration(invulnerabilitySeconds);
  target.hitFlashTime = target.hitFlashDuration;

  const facing = attacker?.facing ?? (target.facing >= 0 ? 1 : -1);
  target.velocityX = (attackProfile.knockbackX ?? 0) * facing;
  target.velocityY = attackProfile.knockbackY ?? 0;

  return {
    applied: true,
    damage,
    dead: target.dead,
    health: target.health,
  };
}

export function applyAttackOverlaps(attacker, state, targets = []) {
  if (!attacker || !state || !isAttackActive(state)) {
    return [];
  }

  const results = [];
  const overlaps = findAttackOverlaps(attacker, state, targets);

  overlaps.forEach(({ target, hitbox, hurtbox }) => {
    if (state.hitTargets.has(target)) {
      return;
    }

    const result = applyAttackToTarget(target, state.profile, attacker);
    if (result.applied) {
      state.hitTargets.add(target);
    }

    results.push({
      ...result,
      target,
      hitbox,
      hurtbox,
    });
  });

  return results;
}

export function updateCombatant(actor, dt, bounds = null) {
  if (!actor || dt <= 0) {
    return actor;
  }

  actor.invulnerabilityTime = Math.max(0, actor.invulnerabilityTime - dt);
  actor.hitFlashTime = Math.max(0, actor.hitFlashTime - dt);

  actor.x += actor.velocityX * dt;
  actor.y += actor.velocityY * dt;

  actor.velocityX = applyAxisDrag(actor.velocityX, actor.knockbackDrag, dt);
  actor.velocityY = applyAxisDrag(actor.velocityY, actor.knockbackDrag, dt);

  if (bounds) {
    actor.x = clamp(actor.x, bounds.x, bounds.x + bounds.width - actor.width);
    actor.y = clamp(actor.y, bounds.y, bounds.y + bounds.height - actor.height);
  }

  return actor;
}
