/*
Toolbox Aid
David Quesenberry
03/30/2026
createWorldGameStateSystem.js
*/

import {
  WORLD_GAME_STATE_EVENT_TYPES,
  WORLD_GAME_STATE_SYSTEM_ID,
  WORLD_GAME_STATE_TRANSITION_NAMES
} from './constants.js';
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

function createWorldGameStateSystem(options = {}) {
  const now = typeof options.now === 'function' ? options.now : () => Date.now();
  const passiveMode = options.passiveMode !== undefined ? Boolean(options.passiveMode) : true;
  const strictTransitions = options.strictTransitions !== undefined ? Boolean(options.strictTransitions) : true;
  const publishEvent = typeof options.publishEvent === 'function' ? options.publishEvent : null;
  const correlationIdFactory = typeof options.correlationIdFactory === 'function'
    ? options.correlationIdFactory
    : (transitionName) => `${WORLD_GAME_STATE_SYSTEM_ID}:${String(transitionName || 'unknown')}:${Number(now())}`;

  const selectorRegistry = createSelectorRegistry();
  const transitionRegistry = createTransitionRegistry();
  let snapshot = createInitialWorldGameState(options.initialStatePatch);

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
      passiveMode,
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
    const changes = [];
    const result = {
      ok: true,
      applied: false,
      passiveMode,
      transitionName: normalizedTransitionName,
      reason: 'STUB_NOOP',
      code: 'STUB_NOOP',
      correlationId,
      changes
    };

    const eventEnvelope = createTransitionAppliedEvent({
      eventType: transition.eventType || WORLD_GAME_STATE_EVENT_TYPES.TRANSITION_APPLIED,
      transitionName: normalizedTransitionName,
      correlationId,
      changes,
      payload: {
        passiveMode,
        stub: true,
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

  const publicApi = {
    getSnapshot,
    getReadonlyView,
    select,
    requestTransition,
    applyExternalSnapshotPatch,
    getTransitionNames,
    getSelectorNames
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
