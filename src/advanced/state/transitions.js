/*
Toolbox Aid
David Quesenberry
03/30/2026
transitions.js
*/

import { WORLD_GAME_STATE_EVENT_TYPES } from './constants.js';
import { isPlainObject } from '../../shared/utils/objectUtils.js';
import { toFiniteNumber } from '../../shared/math/numberNormalization.js';

function isPassiveModeContext(context) {
  if (!isPlainObject(context)) return false;
  if (context.passiveMode === true) return true;
  if (typeof context.mode === 'string' && context.mode.trim().toLowerCase() === 'passive') return true;
  return false;
}

function recalcObjectiveSummary(objectivesById) {
  const objectiveIds = Object.keys(objectivesById);
  let completed = 0;
  for (let i = 0; i < objectiveIds.length; i += 1) {
    if (objectivesById[objectiveIds[i]].isComplete) completed += 1;
  }
  return {
    total: objectiveIds.length,
    completed,
    active: Math.max(0, objectiveIds.length - completed)
  };
}

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
    return { ok: false, reason: 'advanceWave requires finite amount > 0.' };
  }
  return { ok: true };
}

function validateApplyScoreDelta(payload) {
  if (!isPlainObject(payload)) {
    return { ok: false, reason: 'applyScoreDelta requires an object payload.' };
  }
  const normalizedDelta = Number(payload.delta);
  if (!Number.isFinite(normalizedDelta)) {
    return { ok: false, reason: 'applyScoreDelta requires finite numeric payload.delta.' };
  }
  return { ok: true };
}

function applyAuthoritativeScoreDelta(snapshot, payload, context = {}) {
  if (isPassiveModeContext(context)) {
    return { changes: [] };
  }
  if (!snapshot.worldState || !isPlainObject(snapshot.worldState)) {
    snapshot.worldState = {};
  }
  if (!isPlainObject(snapshot.worldState.scores)) {
    snapshot.worldState.scores = {
      total: 0,
      rewardPoints: 0,
      rank: null
    };
  }

  const scores = snapshot.worldState.scores;
  const currentTotal = toFiniteNumber(scores.total, 0);
  const currentRewardPoints = toFiniteNumber(scores.rewardPoints, 0);
  const delta = toFiniteNumber(payload.delta, 0);
  const rewardDelta = payload.rewardDelta !== undefined ? toFiniteNumber(payload.rewardDelta, 0) : 0;

  scores.total = currentTotal + delta;
  scores.rewardPoints = currentRewardPoints + rewardDelta;
  if (payload.rank !== undefined) {
    scores.rank = payload.rank;
  }

  const changes = ['worldState.scores.total', 'worldState.scores.rewardPoints'];
  if (payload.rank !== undefined) changes.push('worldState.scores.rank');
  return { changes };
}

function validateUpdateObjectiveProgress(payload) {
  if (!isPlainObject(payload)) {
    return { ok: false, reason: 'updateObjectiveProgress requires an object payload.' };
  }
  const objectiveId = String(payload.objectiveId || '').trim();
  if (!objectiveId) {
    return { ok: false, reason: 'updateObjectiveProgress requires payload.objectiveId.' };
  }
  const normalizedCurrent = payload.currentValue !== undefined ? Number(payload.currentValue) : null;
  if (payload.currentValue !== undefined && !Number.isFinite(normalizedCurrent)) {
    return { ok: false, reason: 'updateObjectiveProgress payload.currentValue must be finite numeric when provided.' };
  }
  const normalizedTarget = payload.targetValue !== undefined ? Number(payload.targetValue) : null;
  if (payload.targetValue !== undefined && !Number.isFinite(normalizedTarget)) {
    return { ok: false, reason: 'updateObjectiveProgress payload.targetValue must be finite numeric when provided.' };
  }
  if (payload.isComplete !== undefined && typeof payload.isComplete !== 'boolean') {
    return { ok: false, reason: 'updateObjectiveProgress payload.isComplete must be boolean when provided.' };
  }
  return { ok: true };
}

function applyAuthoritativeObjectiveProgress(snapshot, payload, context = {}) {
  if (isPassiveModeContext(context)) {
    return { changes: [] };
  }
  const now = typeof context.now === 'function' ? context.now : () => Date.now();
  const objectiveId = String(payload.objectiveId || '').trim();
  const objectives = snapshot.worldState && snapshot.worldState.objectives
    ? snapshot.worldState.objectives
    : { summary: { total: 0, completed: 0, active: 0 }, byId: {} };
  if (!snapshot.worldState.objectives) {
    snapshot.worldState.objectives = objectives;
  }

  if (!isPlainObject(objectives.byId)) objectives.byId = {};
  if (!isPlainObject(objectives.summary)) {
    objectives.summary = { total: 0, completed: 0, active: 0 };
  }

  const existing = isPlainObject(objectives.byId[objectiveId]) ? objectives.byId[objectiveId] : {};
  objectives.byId[objectiveId] = {
    ...existing,
    objectiveId,
    currentValue: payload.currentValue !== undefined
      ? toFiniteNumber(payload.currentValue, 0)
      : toFiniteNumber(existing.currentValue, 0),
    targetValue: payload.targetValue !== undefined
      ? toFiniteNumber(payload.targetValue, 0)
      : toFiniteNumber(existing.targetValue, 0),
    isComplete: payload.isComplete !== undefined
      ? Boolean(payload.isComplete)
      : Boolean(existing.isComplete),
    updatedAtMs: Number(now())
  };
  objectives.summary = recalcObjectiveSummary(objectives.byId);

  return {
    changes: [
      `worldState.objectives.byId.${objectiveId}`,
      'worldState.objectives.summary'
    ]
  };
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
      eventType: WORLD_GAME_STATE_EVENT_TYPES.TRANSITION_APPLIED,
      authoritativeApply: applyAuthoritativeScoreDelta
    },
    updateObjectiveProgress: {
      validate: validateUpdateObjectiveProgress,
      eventType: WORLD_GAME_STATE_EVENT_TYPES.OBJECTIVE_SNAPSHOT_UPDATED,
      authoritativeApply: applyAuthoritativeObjectiveProgress
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
