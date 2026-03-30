/*
Toolbox Aid
David Quesenberry
03/30/2026
transitions.js
*/

import { WORLD_GAME_STATE_EVENT_TYPES } from './constants.js';
import { isPlainObject } from './utils.js';

function validateTransitionGameMode(payload) {
  const nextMode = payload && payload.nextMode;
  if (typeof nextMode !== 'string' || !nextMode.trim()) {
    return { ok: false, reason: 'transitionGameMode requires payload.nextMode.' };
  }
  return { ok: true };
}

function validateTransitionPhase(payload) {
  const nextPhase = payload && payload.nextPhase;
  if (typeof nextPhase !== 'string' || !nextPhase.trim()) {
    return { ok: false, reason: 'transitionPhase requires payload.nextPhase.' };
  }
  return { ok: true };
}

function validateAdvanceWave(payload) {
  if (payload !== undefined && payload !== null && !isPlainObject(payload)) {
    return { ok: false, reason: 'advanceWave payload must be an object when provided.' };
  }
  const amount = payload && payload.amount !== undefined ? Number(payload.amount) : 1;
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, reason: 'advanceWave requires amount > 0.' };
  }
  return { ok: true };
}

function validateApplyScoreDelta(payload) {
  if (!isPlainObject(payload)) {
    return { ok: false, reason: 'applyScoreDelta requires an object payload.' };
  }
  if (!Number.isFinite(Number(payload.delta))) {
    return { ok: false, reason: 'applyScoreDelta requires numeric payload.delta.' };
  }
  return { ok: true };
}

function validateUpdateObjectiveProgress(payload) {
  if (!isPlainObject(payload)) {
    return { ok: false, reason: 'updateObjectiveProgress requires an object payload.' };
  }
  const objectiveId = String(payload.objectiveId || '').trim();
  if (!objectiveId) {
    return { ok: false, reason: 'updateObjectiveProgress requires payload.objectiveId.' };
  }
  return { ok: true };
}

function validateSetWorldFlag(payload) {
  if (!isPlainObject(payload)) {
    return { ok: false, reason: 'setWorldFlag requires an object payload.' };
  }
  const flagName = String(payload.flagName || '').trim();
  if (!flagName) {
    return { ok: false, reason: 'setWorldFlag requires payload.flagName.' };
  }
  if (typeof payload.value !== 'boolean') {
    return { ok: false, reason: 'setWorldFlag requires boolean payload.value.' };
  }
  return { ok: true };
}

function validateResolveRunOutcome(payload) {
  if (!isPlainObject(payload)) {
    return { ok: false, reason: 'resolveRunOutcome requires an object payload.' };
  }
  const status = String(payload.status || '').trim();
  if (!status) {
    return { ok: false, reason: 'resolveRunOutcome requires payload.status.' };
  }
  return { ok: true };
}

function createTransitionRegistry() {
  return {
    transitionGameMode: {
      validate: validateTransitionGameMode,
      eventType: WORLD_GAME_STATE_EVENT_TYPES.GAME_MODE_CHANGED
    },
    transitionPhase: {
      validate: validateTransitionPhase,
      eventType: WORLD_GAME_STATE_EVENT_TYPES.GAME_PHASE_CHANGED
    },
    advanceWave: {
      validate: validateAdvanceWave,
      eventType: WORLD_GAME_STATE_EVENT_TYPES.TRANSITION_APPLIED
    },
    applyScoreDelta: {
      validate: validateApplyScoreDelta,
      eventType: WORLD_GAME_STATE_EVENT_TYPES.TRANSITION_APPLIED
    },
    updateObjectiveProgress: {
      validate: validateUpdateObjectiveProgress,
      eventType: WORLD_GAME_STATE_EVENT_TYPES.OBJECTIVE_SNAPSHOT_UPDATED
    },
    setWorldFlag: {
      validate: validateSetWorldFlag,
      eventType: WORLD_GAME_STATE_EVENT_TYPES.TRANSITION_APPLIED
    },
    resolveRunOutcome: {
      validate: validateResolveRunOutcome,
      eventType: WORLD_GAME_STATE_EVENT_TYPES.TRANSITION_APPLIED
    }
  };
}

export { createTransitionRegistry };
