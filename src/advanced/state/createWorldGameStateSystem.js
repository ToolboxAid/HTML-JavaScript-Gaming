/*
Toolbox Aid
David Quesenberry
04/07/2026
createWorldGameStateSystem.js
*/

import {
  WORLD_GAME_STATE_EVENT_TYPES,
  WORLD_GAME_STATE_FEATURE_GATES,
  WORLD_GAME_STATE_SYSTEM_ID,
  WORLD_GAME_STATE_TRANSITION_NAMES
} from './constants.js';
import { createPromotionGate } from '../promotion/createPromotionGate.js';
import { createInitialWorldGameState } from './initialState.js';
import { createSelectorRegistry } from './selectors.js';
import { createTransitionRegistry } from './transitions.js';
import {
  createTransitionAppliedEvent,
  createTransitionRejectedEvent
} from './events.js';
import {
  cloneDeep,
  createReadonlyClone,
  isPlainObject,
  mergeDeep
} from './utils.js';

function patchTouchesObjectiveSlice(patch) {
  if (!isPlainObject(patch)) return false;
  const worldStatePatch = patch.worldState;
  if (!isPlainObject(worldStatePatch)) return false;
  return worldStatePatch.objectives !== undefined;
}

function patchTouchesScoreSlice(patch) {
  if (!isPlainObject(patch)) return false;
  const worldStatePatch = patch.worldState;
  if (!isPlainObject(worldStatePatch)) return false;
  return worldStatePatch.scores !== undefined;
}

function resolvePromotionCriteriaFromMeta(meta, payload) {
  if (isPlainObject(meta) && isPlainObject(meta.promotionCriteria)) {
    return meta.promotionCriteria;
  }
  if (isPlainObject(meta) && isPlainObject(meta.promotionGate) && isPlainObject(meta.promotionGate.criteria)) {
    return meta.promotionGate.criteria;
  }
  if (isPlainObject(payload) && isPlainObject(payload.promotionCriteria)) {
    return payload.promotionCriteria;
  }
  return null;
}

function resolveRollbackTriggerFromMeta(meta) {
  if (!isPlainObject(meta)) return false;
  if (meta.rollbackTriggered !== undefined) {
    return Boolean(meta.rollbackTriggered);
  }
  if (isPlainObject(meta.promotionGate) && meta.promotionGate.rollbackTriggered !== undefined) {
    return Boolean(meta.promotionGate.rollbackTriggered);
  }
  return false;
}

function resolveFrameFromMeta(meta, payload) {
  if (isPlainObject(meta) && Number.isFinite(Number(meta.frameId))) {
    return Number(meta.frameId);
  }
  if (isPlainObject(meta) && isPlainObject(meta.promotionGate) && Number.isFinite(Number(meta.promotionGate.frameId))) {
    return Number(meta.promotionGate.frameId);
  }
  if (isPlainObject(payload) && Number.isFinite(Number(payload.frameId))) {
    return Number(payload.frameId);
  }
  return null;
}

function createWorldGameStateSystem(options = {}) {
  const now = typeof options.now === 'function' ? options.now : () => Date.now();
  const initialPassiveMode = options.passiveMode !== undefined ? Boolean(options.passiveMode) : true;
  const strictTransitions = options.strictTransitions !== undefined ? Boolean(options.strictTransitions) : true;
  const publishEvent = typeof options.publishEvent === 'function' ? options.publishEvent : null;
  const featureGates = Object.freeze({
    [WORLD_GAME_STATE_FEATURE_GATES.AUTHORITATIVE_OBJECTIVE_PROGRESS]: Boolean(
      options &&
      options.featureGates &&
      options.featureGates[WORLD_GAME_STATE_FEATURE_GATES.AUTHORITATIVE_OBJECTIVE_PROGRESS]
    ),
    [WORLD_GAME_STATE_FEATURE_GATES.AUTHORITATIVE_SCORE]: Boolean(
      options &&
      options.featureGates &&
      options.featureGates[WORLD_GAME_STATE_FEATURE_GATES.AUTHORITATIVE_SCORE]
    )
  });
  const correlationIdFactory = typeof options.correlationIdFactory === 'function'
    ? options.correlationIdFactory
    : (transitionName) => `${WORLD_GAME_STATE_SYSTEM_ID}:${String(transitionName || 'unknown')}:${Number(now())}`;

  const selectorRegistry = createSelectorRegistry();
  const transitionRegistry = createTransitionRegistry();
  const promotionGateConfig = isPlainObject(options.promotionGate) ? options.promotionGate : null;
  const resolvePromotionCriteria = promotionGateConfig && typeof promotionGateConfig.resolveCriteria === 'function'
    ? promotionGateConfig.resolveCriteria
    : null;
  const resolveRollbackTrigger = promotionGateConfig && typeof promotionGateConfig.resolveRollbackTrigger === 'function'
    ? promotionGateConfig.resolveRollbackTrigger
    : null;
  const promotionGateLogger = promotionGateConfig && typeof promotionGateConfig.logger === 'function'
    ? promotionGateConfig.logger
    : null;
  const promotionGate = promotionGateConfig
    ? createPromotionGate({
        now,
        requiredCriteria: promotionGateConfig.requiredCriteria,
        stabilityWindowFrames: promotionGateConfig.stabilityWindowFrames,
        initiallyPromoted: !initialPassiveMode,
        logger: promotionGateLogger
      })
    : null;
  let activeMode = initialPassiveMode ? 'passive' : 'authoritative';
  let snapshot = createInitialWorldGameState(options.initialStatePatch);

  function isPassiveModeActive() {
    return activeMode !== 'authoritative';
  }

  function evaluatePromotionGate({
    transitionName,
    payload,
    meta,
    comparison,
    canUseAuthoritativeTransition
  }) {
    if (!promotionGate || !isPassiveModeActive()) return null;

    let criteria = resolvePromotionCriteriaFromMeta(meta, payload);
    if (!criteria && resolvePromotionCriteria) {
      const resolved = resolvePromotionCriteria({
        transitionName,
        payload,
        meta,
        comparison,
        snapshot: createReadonlyClone(snapshot),
        canUseAuthoritativeTransition
      });
      if (isPlainObject(resolved)) criteria = resolved;
    }

    let rollbackTriggered = resolveRollbackTriggerFromMeta(meta);
    if (!rollbackTriggered && resolveRollbackTrigger) {
      rollbackTriggered = Boolean(resolveRollbackTrigger({
        transitionName,
        payload,
        meta,
        comparison,
        snapshot: createReadonlyClone(snapshot),
        canUseAuthoritativeTransition
      }));
    }

    const evaluation = promotionGate.evaluate({
      criteria: isPlainObject(criteria) ? criteria : {},
      rollbackTriggered,
      transitionName,
      frame: resolveFrameFromMeta(meta, payload)
    });

    if (evaluation.promotedNow) {
      activeMode = 'authoritative';
    }

    return evaluation;
  }

  function publishEnvelope(eventType, envelope) {
    if (!publishEvent) return false;
    try {
      return publishEvent(eventType, envelope) !== false;
    } catch (_error) {
      return false;
    }
  }

  function buildRejectedResult(transitionName, payload, meta, code, reason) {
    const correlationId = String((meta && meta.correlationId) || correlationIdFactory(transitionName, payload, meta));
    const eventEnvelope = createTransitionRejectedEvent({
      transitionName,
      correlationId,
      reason,
      code,
      payload,
      meta,
      now
    });
    const eventPublished = publishEnvelope(eventEnvelope.eventType, eventEnvelope);
    return {
      ok: false,
      applied: false,
      passiveMode: isPassiveModeActive(),
      mode: activeMode,
      transitionName: String(transitionName || ''),
      reason: String(reason),
      code: String(code),
      correlationId,
      changes: [],
      eventType: eventEnvelope.eventType,
      eventPublished
    };
  }

  function getSnapshot() {
    return cloneDeep(snapshot);
  }

  function getReadonlyView() {
    return createReadonlyClone(snapshot);
  }

  function select(selectorName, ...args) {
    const selector = selectorRegistry[String(selectorName || '')];
    if (typeof selector !== 'function') return undefined;
    const selected = selector(snapshot, ...args);
    if (!selected || typeof selected !== 'object') return selected;
    return createReadonlyClone(selected);
  }

  function requestTransition(transitionName, payload = {}, meta = {}) {
    const normalizedTransitionName = String(transitionName || '').trim();
    const transition = transitionRegistry[normalizedTransitionName];

    if (!transition) {
      return buildRejectedResult(
        normalizedTransitionName,
        payload,
        meta,
        'UNKNOWN_TRANSITION',
        `Unknown transition: ${normalizedTransitionName || '(empty)'}`
      );
    }

    const validation = transition.validate(payload, { strictTransitions });
    if (!validation.ok) {
      return buildRejectedResult(
        normalizedTransitionName,
        payload,
        meta,
        'INVALID_PAYLOAD',
        validation.reason
      );
    }

    const correlationId = String((meta && meta.correlationId) || correlationIdFactory(normalizedTransitionName, payload, meta));
    let changes = [];
    let comparison = null;
    let promotion = null;
    let applied = false;
    let authoritativePreviewSnapshot = null;
    let authoritativePreviewChanges = [];
    const result = {
      ok: true,
      applied: false,
      passiveMode: isPassiveModeActive(),
      mode: activeMode,
      transitionName: normalizedTransitionName,
      reason: 'STUB_NOOP',
      code: 'STUB_NOOP',
      correlationId,
      changes: [],
      featureGates
    };

    const authoritativeGateByTransition = {
      updateObjectiveProgress: WORLD_GAME_STATE_FEATURE_GATES.AUTHORITATIVE_OBJECTIVE_PROGRESS,
      applyScoreDelta: WORLD_GAME_STATE_FEATURE_GATES.AUTHORITATIVE_SCORE
    };
    const authoritativeGateKey = authoritativeGateByTransition[normalizedTransitionName];
    const canUseAuthoritativeTransition = Boolean(
      authoritativeGateKey &&
      typeof transition.authoritativeApply === 'function'
    );

    if (canUseAuthoritativeTransition) {
      const previewSnapshot = cloneDeep(snapshot);
      const previewResult = transition.authoritativeApply(previewSnapshot, payload, { now });
      authoritativePreviewSnapshot = previewSnapshot;
      authoritativePreviewChanges = Array.isArray(previewResult && previewResult.changes) ? previewResult.changes.slice() : [];
      const beforeSlice = normalizedTransitionName === 'updateObjectiveProgress'
        ? snapshot.worldState.objectives
        : snapshot.worldState.scores;
      const candidateSlice = normalizedTransitionName === 'updateObjectiveProgress'
        ? previewSnapshot.worldState.objectives
        : previewSnapshot.worldState.scores;
      comparison = {
        mode: isPassiveModeActive() ? 'passive-comparison' : 'gated-comparison',
        before: createReadonlyClone(beforeSlice),
        candidate: createReadonlyClone(candidateSlice),
        changes: authoritativePreviewChanges.slice()
      };
    }

    promotion = evaluatePromotionGate({
      transitionName: normalizedTransitionName,
      payload,
      meta,
      comparison,
      canUseAuthoritativeTransition
    });

    if (canUseAuthoritativeTransition) {
      const authoritativeEnabled = featureGates[authoritativeGateKey];
      if (!isPassiveModeActive() && authoritativeEnabled) {
        snapshot = authoritativePreviewSnapshot || snapshot;
        changes = authoritativePreviewChanges.slice();
        applied = true;
        if (normalizedTransitionName === 'applyScoreDelta') {
          result.reason = 'APPLIED_AUTHORITATIVE_SCORE';
          result.code = 'APPLIED_AUTHORITATIVE_SCORE';
        } else {
          result.reason = 'APPLIED_AUTHORITATIVE_OBJECTIVE_PROGRESS';
          result.code = 'APPLIED_AUTHORITATIVE_OBJECTIVE_PROGRESS';
        }
      } else {
        result.reason = 'PASSIVE_COMPARISON_ONLY';
        result.code = 'PASSIVE_COMPARISON_ONLY';
      }
    }

    if (!canUseAuthoritativeTransition) {
      result.reason = 'STUB_NOOP';
      result.code = 'STUB_NOOP';
    }

    result.applied = applied;
    result.passiveMode = isPassiveModeActive();
    result.mode = activeMode;
    result.changes = changes;
    if (comparison) {
      result.comparison = comparison;
    }
    if (promotion) {
      result.promotion = createReadonlyClone(promotion);
    } else if (promotionGate) {
      result.promotion = createReadonlyClone({
        readiness: isPassiveModeActive() ? 'passive' : 'authoritative',
        promoted: !isPassiveModeActive(),
        promotedNow: false,
        rollbackTriggered: false,
        criteria: {
          values: {},
          unmet: [],
          allMet: false
        },
        stability: {
          currentFrames: promotionGate.getState().stableFrames,
          requiredFrames: promotionGate.getState().stabilityWindowFrames
        },
        reason: promotionGate.getState().lastReason,
        metrics: promotionGate.getMetrics()
      });
    }

    const eventEnvelope = createTransitionAppliedEvent({
      eventType: transition.eventType || WORLD_GAME_STATE_EVENT_TYPES.TRANSITION_APPLIED,
      transitionName: normalizedTransitionName,
      correlationId,
      changes,
      payload: {
        passiveMode: isPassiveModeActive(),
        mode: activeMode,
        applied,
        stub: !applied,
        featureGates,
        comparisonMode: Boolean(comparison && !applied),
        promotion: result.promotion ? cloneDeep(result.promotion) : null,
        requestedPayload: isPlainObject(payload) ? payload : {}
      },
      meta,
      now
    });
    result.eventType = eventEnvelope.eventType;
    result.eventPublished = publishEnvelope(eventEnvelope.eventType, eventEnvelope);
    return result;
  }

  function applyExternalSnapshotPatch(patch = {}) {
    if (!isPlainObject(patch)) {
      return {
        ok: false,
        reason: 'External snapshot patch must be an object.',
        changes: []
      };
    }

    const objectiveAuthoritativeActive = Boolean(
      !isPassiveModeActive() &&
      featureGates[WORLD_GAME_STATE_FEATURE_GATES.AUTHORITATIVE_OBJECTIVE_PROGRESS]
    );
    if (objectiveAuthoritativeActive && patchTouchesObjectiveSlice(patch)) {
      const correlationId = `externalPatchRejected:${Number(now())}`;
      const rejectionEvent = createTransitionRejectedEvent({
        transitionName: 'applyExternalSnapshotPatch',
        correlationId,
        code: 'OBJECTIVE_AUTHORITATIVE_SLICE_REQUIRES_TRANSITION',
        reason: 'Objective progress authoritative slice must be written through updateObjectiveProgress transition.',
        payload: {
          rejectedRoots: Object.keys(patch)
        },
        now
      });
      return {
        ok: false,
        reason: 'OBJECTIVE_AUTHORITATIVE_SLICE_REQUIRES_TRANSITION',
        changes: [],
        correlationId,
        eventPublished: publishEnvelope(rejectionEvent.eventType, rejectionEvent)
      };
    }

    const scoreAuthoritativeActive = Boolean(
      !isPassiveModeActive() &&
      featureGates[WORLD_GAME_STATE_FEATURE_GATES.AUTHORITATIVE_SCORE]
    );
    if (scoreAuthoritativeActive && patchTouchesScoreSlice(patch)) {
      const correlationId = `externalPatchRejected:${Number(now())}`;
      const rejectionEvent = createTransitionRejectedEvent({
        transitionName: 'applyExternalSnapshotPatch',
        correlationId,
        code: 'SCORE_AUTHORITATIVE_SLICE_REQUIRES_TRANSITION',
        reason: 'Score authoritative slice must be written through applyScoreDelta transition.',
        payload: {
          rejectedRoots: Object.keys(patch)
        },
        now
      });
      return {
        ok: false,
        reason: 'SCORE_AUTHORITATIVE_SLICE_REQUIRES_TRANSITION',
        changes: [],
        correlationId,
        eventPublished: publishEnvelope(rejectionEvent.eventType, rejectionEvent)
      };
    }

    snapshot = mergeDeep(snapshot, patch);
    const changedRoots = Object.keys(patch);
    const correlationId = `externalPatch:${Number(now())}`;
    const eventEnvelope = createTransitionAppliedEvent({
      transitionName: 'applyExternalSnapshotPatch',
      correlationId,
      payload: {
        changedRoots
      },
      changes: changedRoots.map((root) => `snapshot.${root}`),
      now
    });

    return {
      ok: true,
      reason: 'PATCH_APPLIED',
      changes: changedRoots,
      correlationId,
      eventPublished: publishEnvelope(eventEnvelope.eventType, eventEnvelope)
    };
  }

  function getTransitionNames() {
    return WORLD_GAME_STATE_TRANSITION_NAMES.slice();
  }

  function getSelectorNames() {
    return Object.keys(selectorRegistry).sort();
  }

  function getFeatureGates() {
    return featureGates;
  }

  function getMode() {
    return activeMode;
  }

  function getPromotionReadiness() {
    if (!promotionGate) return null;
    const state = promotionGate.getState();
    return {
      mode: activeMode,
      promoted: !isPassiveModeActive(),
      stableFrames: state.stableFrames,
      requiredStableFrames: state.stabilityWindowFrames,
      reason: state.lastReason
    };
  }

  function getPromotionMetrics() {
    return promotionGate ? promotionGate.getMetrics() : null;
  }

  const publicApi = {
    getSnapshot,
    getReadonlyView,
    select,
    requestTransition,
    applyExternalSnapshotPatch,
    getTransitionNames,
    getSelectorNames,
    getFeatureGates,
    getMode,
    getPromotionReadiness,
    getPromotionMetrics
  };

  function getPublicApi() {
    return publicApi;
  }

  return {
    ...publicApi,
    getPublicApi
  };
}

export { createWorldGameStateSystem };
