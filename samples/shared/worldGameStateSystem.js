/*
Toolbox Aid
David Quesenberry
03/30/2026
worldGameStateSystem.js
*/

const WORLD_GAME_STATE_SYSTEM_ID = 'worldGameStateSystem';

const WORLD_GAME_STATE_EVENT_TYPES = Object.freeze({
  TRANSITION_APPLIED: 'worldState.transition.applied',
  TRANSITION_REJECTED: 'worldState.transition.rejected',
  GAME_PHASE_CHANGED: 'gameState.phase.changed',
  GAME_MODE_CHANGED: 'gameState.mode.changed',
  OBJECTIVE_SNAPSHOT_UPDATED: 'objective.snapshot.updated'
});

const DEFAULT_SELECTORS = Object.freeze({
  selectWorldState: (snapshot) => snapshot.worldState,
  selectGameState: (snapshot) => snapshot.gameState,
  selectCurrentMode: (snapshot) => snapshot.gameState.mode,
  selectCurrentPhase: (snapshot) => snapshot.gameState.phase,
  selectWaveProgress: (snapshot) => ({
    wave: snapshot.worldState.progression.wave,
    round: snapshot.worldState.progression.round,
    level: snapshot.worldState.progression.level
  }),
  selectIsRunComplete: (snapshot) => Boolean(
    snapshot.worldState.outcomes.complete || snapshot.worldState.outcomes.status === 'complete'
  ),
  selectScoreTotals: (snapshot) => snapshot.worldState.scores,
  selectObjectiveSnapshot: (snapshot) => snapshot.worldState.objectives,
  selectWorldFlag: (snapshot, flagName) => Boolean(
    snapshot.worldState.flags[String(flagName || '')]
  )
});

const TRANSITION_NAMES = Object.freeze([
  'transitionGameMode',
  'transitionPhase',
  'advanceWave',
  'applyScoreDelta',
  'updateObjectiveProgress',
  'setWorldFlag',
  'resolveRunOutcome'
]);

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function cloneDeep(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneDeep(entry));
  }
  if (isPlainObject(value)) {
    const out = {};
    const keys = Object.keys(value);
    for (let i = 0; i < keys.length; i += 1) {
      out[keys[i]] = cloneDeep(value[keys[i]]);
    }
    return out;
  }
  return value;
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  const keys = Object.keys(value);
  for (let i = 0; i < keys.length; i += 1) {
    deepFreeze(value[keys[i]]);
  }
  return value;
}

function createReadonlyClone(value) {
  return deepFreeze(cloneDeep(value));
}

function mergeDeep(baseValue, patchValue) {
  if (Array.isArray(patchValue)) {
    return patchValue.map((entry) => cloneDeep(entry));
  }
  if (isPlainObject(patchValue)) {
    const baseObject = isPlainObject(baseValue) ? baseValue : {};
    const out = {};
    const baseKeys = Object.keys(baseObject);
    for (let i = 0; i < baseKeys.length; i += 1) {
      out[baseKeys[i]] = cloneDeep(baseObject[baseKeys[i]]);
    }
    const patchKeys = Object.keys(patchValue);
    for (let i = 0; i < patchKeys.length; i += 1) {
      const key = patchKeys[i];
      out[key] = mergeDeep(baseObject[key], patchValue[key]);
    }
    return out;
  }
  return patchValue === undefined ? cloneDeep(baseValue) : patchValue;
}

function toFiniteNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function createInitialWorldGameState(initialPatch = {}) {
  const baseline = {
    contractVersion: 1,
    worldState: {
      session: {
        runId: null,
        status: 'idle',
        startedAtMs: null,
        lastUpdatedMs: null
      },
      progression: {
        wave: 0,
        round: 0,
        level: 1
      },
      outcomes: {
        status: 'in_progress',
        win: false,
        loss: false,
        pause: false,
        complete: false
      },
      scores: {
        total: 0,
        rewardPoints: 0,
        rank: null
      },
      objectives: {
        summary: {
          total: 0,
          completed: 0,
          active: 0
        },
        byId: {}
      },
      flags: {}
    },
    gameState: {
      mode: 'boot',
      phase: 'intro',
      subsystems: {},
      timers: {},
      meta: {}
    }
  };

  if (!isPlainObject(initialPatch)) return baseline;
  return mergeDeep(baseline, initialPatch);
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
  if (!isPlainObject(payload) && payload !== undefined && payload !== null) {
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
  if (payload.rewardDelta !== undefined && !Number.isFinite(Number(payload.rewardDelta))) {
    return { ok: false, reason: 'applyScoreDelta payload.rewardDelta must be numeric when provided.' };
  }
  return { ok: true };
}

function validateObjectiveProgress(payload) {
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

function createAllowedEventTypeSet() {
  return new Set(Object.values(WORLD_GAME_STATE_EVENT_TYPES));
}

function createStateContractEventEnvelope({
  eventType,
  eventVersion = 1,
  producer = WORLD_GAME_STATE_SYSTEM_ID,
  timestampMs,
  correlationId,
  payload = {},
  targetSystem,
  tags,
  meta,
  now = Date.now
} = {}) {
  const normalizedEventType = String(eventType || '').trim();
  if (!normalizedEventType) {
    throw new Error('Event envelope requires eventType.');
  }

  const normalizedProducer = String(producer || '').trim() || WORLD_GAME_STATE_SYSTEM_ID;
  const normalizedCorrelationId = String(correlationId || '').trim();
  if (!normalizedCorrelationId) {
    throw new Error('Event envelope requires correlationId.');
  }

  const resolvedTimestamp = Number.isFinite(Number(timestampMs)) ? Number(timestampMs) : Number(now());
  const envelope = {
    eventType: normalizedEventType,
    eventVersion: Math.max(1, Math.floor(Number(eventVersion) || 1)),
    producer: normalizedProducer,
    timestampMs: resolvedTimestamp,
    correlationId: normalizedCorrelationId,
    payload: isPlainObject(payload) ? cloneDeep(payload) : {}
  };

  if (targetSystem !== undefined) envelope.targetSystem = String(targetSystem);
  if (Array.isArray(tags)) envelope.tags = tags.map((tag) => String(tag));
  if (isPlainObject(meta)) envelope.meta = cloneDeep(meta);
  return envelope;
}

function createTransitionAppliedEvent({
  transitionName,
  correlationId,
  producer = WORLD_GAME_STATE_SYSTEM_ID,
  payload = {},
  changes = [],
  now = Date.now,
  eventType = WORLD_GAME_STATE_EVENT_TYPES.TRANSITION_APPLIED,
  meta
} = {}) {
  return createStateContractEventEnvelope({
    eventType,
    correlationId,
    producer,
    now,
    payload: {
      transitionName: String(transitionName || ''),
      changes: Array.isArray(changes) ? changes.slice() : [],
      summary: isPlainObject(payload) ? cloneDeep(payload) : {}
    },
    meta
  });
}

function createTransitionRejectedEvent({
  transitionName,
  correlationId,
  producer = WORLD_GAME_STATE_SYSTEM_ID,
  reason,
  code = 'TRANSITION_REJECTED',
  payload = {},
  now = Date.now,
  meta
} = {}) {
  return createStateContractEventEnvelope({
    eventType: WORLD_GAME_STATE_EVENT_TYPES.TRANSITION_REJECTED,
    correlationId,
    producer,
    now,
    payload: {
      transitionName: String(transitionName || ''),
      reason: String(reason || 'Transition rejected.'),
      code: String(code),
      summary: isPlainObject(payload) ? cloneDeep(payload) : {}
    },
    meta
  });
}

function createTransitionRegistry() {
  return {
    transitionGameMode: {
      validate: validateTransitionGameMode,
      apply(snapshot, payload) {
        const prev = snapshot.gameState.mode;
        snapshot.gameState.mode = String(payload.nextMode).trim();
        return { changes: prev === snapshot.gameState.mode ? [] : ['gameState.mode'] };
      },
      appliedEventType: WORLD_GAME_STATE_EVENT_TYPES.GAME_MODE_CHANGED
    },
    transitionPhase: {
      validate: validateTransitionPhase,
      apply(snapshot, payload) {
        const prev = snapshot.gameState.phase;
        snapshot.gameState.phase = String(payload.nextPhase).trim();
        return { changes: prev === snapshot.gameState.phase ? [] : ['gameState.phase'] };
      },
      appliedEventType: WORLD_GAME_STATE_EVENT_TYPES.GAME_PHASE_CHANGED
    },
    advanceWave: {
      validate: validateAdvanceWave,
      apply(snapshot, payload) {
        const amount = Math.max(1, Math.floor(toFiniteNumber(payload && payload.amount, 1)));
        snapshot.worldState.progression.wave += amount;
        if (payload && payload.round !== undefined) snapshot.worldState.progression.round = Math.max(0, Math.floor(toFiniteNumber(payload.round, 0)));
        if (payload && payload.level !== undefined) snapshot.worldState.progression.level = Math.max(1, Math.floor(toFiniteNumber(payload.level, 1)));
        return { changes: ['worldState.progression.wave'] };
      }
    },
    applyScoreDelta: {
      validate: validateApplyScoreDelta,
      apply(snapshot, payload) {
        snapshot.worldState.scores.total += toFiniteNumber(payload.delta, 0);
        if (payload.rewardDelta !== undefined) {
          snapshot.worldState.scores.rewardPoints += toFiniteNumber(payload.rewardDelta, 0);
        }
        return { changes: ['worldState.scores.total'] };
      }
    },
    updateObjectiveProgress: {
      validate: validateObjectiveProgress,
      apply(snapshot, payload, context) {
        const objectiveId = String(payload.objectiveId || '').trim();
        const byId = snapshot.worldState.objectives.byId;
        const existing = isPlainObject(byId[objectiveId]) ? byId[objectiveId] : {};
        byId[objectiveId] = {
          ...existing,
          objectiveId,
          currentValue: payload.currentValue !== undefined ? toFiniteNumber(payload.currentValue, 0) : toFiniteNumber(existing.currentValue, 0),
          targetValue: payload.targetValue !== undefined ? toFiniteNumber(payload.targetValue, 0) : toFiniteNumber(existing.targetValue, 0),
          isComplete: payload.isComplete !== undefined ? Boolean(payload.isComplete) : Boolean(existing.isComplete),
          updatedAtMs: Number(context.now())
        };
        snapshot.worldState.objectives.summary = recalcObjectiveSummary(byId);
        return {
          changes: [
            `worldState.objectives.byId.${objectiveId}`,
            'worldState.objectives.summary'
          ]
        };
      },
      appliedEventType: WORLD_GAME_STATE_EVENT_TYPES.OBJECTIVE_SNAPSHOT_UPDATED
    },
    setWorldFlag: {
      validate: validateSetWorldFlag,
      apply(snapshot, payload) {
        snapshot.worldState.flags[String(payload.flagName)] = Boolean(payload.value);
        return { changes: [`worldState.flags.${String(payload.flagName)}`] };
      }
    },
    resolveRunOutcome: {
      validate: validateResolveRunOutcome,
      apply(snapshot, payload) {
        const status = String(payload.status);
        snapshot.worldState.outcomes = {
          status,
          win: payload.win !== undefined ? Boolean(payload.win) : status === 'win',
          loss: payload.loss !== undefined ? Boolean(payload.loss) : status === 'loss',
          pause: payload.pause !== undefined ? Boolean(payload.pause) : status === 'pause',
          complete: payload.complete !== undefined ? Boolean(payload.complete) : status === 'complete' || status === 'win' || status === 'loss'
        };
        return { changes: ['worldState.outcomes'] };
      }
    }
  };
}

function createWorldGameStateSystem(options = {}) {
  const transitionRegistry = createTransitionRegistry();
  const selectorRegistry = { ...DEFAULT_SELECTORS };
  const allowedEventTypes = createAllowedEventTypeSet();

  const now = typeof options.now === 'function' ? options.now : () => Date.now();
  const passiveMode = options.passiveMode !== undefined ? Boolean(options.passiveMode) : true;
  const strictTransitions = options.strictTransitions !== undefined ? Boolean(options.strictTransitions) : true;
  const correlationIdFactory = typeof options.correlationIdFactory === 'function'
    ? options.correlationIdFactory
    : (transitionName) => `${WORLD_GAME_STATE_SYSTEM_ID}:${String(transitionName || 'unknown')}:${Number(now())}`;
  const publishEvent = typeof options.publishEvent === 'function' ? options.publishEvent : null;

  let snapshot = createInitialWorldGameState(options.initialStatePatch);

  function publishEnvelope(envelope) {
    if (!publishEvent || !envelope) return false;
    if (!allowedEventTypes.has(envelope.eventType) && strictTransitions) return false;
    try {
      return publishEvent(envelope.eventType, envelope) !== false;
    } catch (_error) {
      return false;
    }
  }

  function buildRejectedResult(transitionName, payload, meta, code, reason) {
    const correlationId = String((meta && meta.correlationId) || correlationIdFactory(transitionName, payload, meta));
    const event = createTransitionRejectedEvent({
      transitionName,
      correlationId,
      code,
      reason,
      payload,
      now,
      meta
    });
    const published = publishEnvelope(event);
    return {
      ok: false,
      applied: false,
      passiveMode,
      transitionName: String(transitionName || ''),
      reason: String(reason),
      code: String(code),
      correlationId,
      changes: [],
      eventType: event.eventType,
      eventPublished: published
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
    const selectedValue = selector(snapshot, ...args);
    if (!selectedValue || typeof selectedValue !== 'object') return selectedValue;
    return createReadonlyClone(selectedValue);
  }

  function requestTransition(transitionName, payload = {}, meta = {}) {
    const normalizedTransitionName = String(transitionName || '').trim();
    const handler = transitionRegistry[normalizedTransitionName];
    if (!handler) {
      return buildRejectedResult(normalizedTransitionName, payload, meta, 'UNKNOWN_TRANSITION', `Unknown transition: ${normalizedTransitionName || '(empty)'}`);
    }

    const validation = handler.validate(payload, { strictTransitions });
    if (!validation.ok) {
      return buildRejectedResult(normalizedTransitionName, payload, meta, 'INVALID_PAYLOAD', validation.reason);
    }

    const correlationId = String((meta && meta.correlationId) || correlationIdFactory(normalizedTransitionName, payload, meta));
    let changes = [];
    let applied = false;
    let reason = 'PASSIVE_MODE_NOOP';

    if (!passiveMode) {
      const nextSnapshot = cloneDeep(snapshot);
      const applyResult = handler.apply(nextSnapshot, payload, { now });
      snapshot = nextSnapshot;
      changes = Array.isArray(applyResult && applyResult.changes) ? applyResult.changes.slice() : [];
      applied = true;
      reason = 'APPLIED';
    }

    const appliedEventType = handler.appliedEventType || WORLD_GAME_STATE_EVENT_TYPES.TRANSITION_APPLIED;
    const event = createTransitionAppliedEvent({
      transitionName: normalizedTransitionName,
      correlationId,
      payload: {
        ...payload,
        passiveMode,
        applied
      },
      changes,
      now,
      eventType: appliedEventType,
      meta
    });
    const eventPublished = publishEnvelope(event);
    return {
      ok: true,
      applied,
      passiveMode,
      transitionName: normalizedTransitionName,
      reason,
      code: reason,
      correlationId,
      changes,
      eventType: event.eventType,
      eventPublished
    };
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
    const event = createTransitionAppliedEvent({
      transitionName: 'applyExternalSnapshotPatch',
      correlationId,
      payload: { changedRoots },
      changes: changedRoots.map((root) => `snapshot.${root}`),
      now,
      eventType: WORLD_GAME_STATE_EVENT_TYPES.TRANSITION_APPLIED
    });
    const eventPublished = publishEnvelope(event);
    return {
      ok: true,
      reason: 'PATCH_APPLIED',
      changes: changedRoots,
      correlationId,
      eventPublished
    };
  }

  function getTransitionNames() {
    return TRANSITION_NAMES.slice();
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
    getSnapshot,
    getReadonlyView,
    select,
    requestTransition,
    applyExternalSnapshotPatch,
    getTransitionNames,
    getSelectorNames,
    getPublicApi
  };
}

function createObjectiveProgressMirrorConsumer(options = {}) {
  const consumerId = String(options.id || 'objectiveProgressMirrorConsumer');
  const allowedInputs = Array.isArray(options.approvedEventTypes)
    ? options.approvedEventTypes.slice()
    : [
        WORLD_GAME_STATE_EVENT_TYPES.TRANSITION_APPLIED,
        WORLD_GAME_STATE_EVENT_TYPES.OBJECTIVE_SNAPSHOT_UPDATED
      ];

  let detachHandlers = [];
  let lastMirror = null;
  let getStateApiRef = null;

  function updateMirror() {
    if (typeof getStateApiRef !== 'function') return;
    const stateApi = getStateApiRef();
    if (!stateApi || typeof stateApi.select !== 'function') return;
    const objectiveSnapshot = stateApi.select('selectObjectiveSnapshot');
    lastMirror = cloneDeep(objectiveSnapshot || null);
  }

  function detach() {
    for (let i = 0; i < detachHandlers.length; i += 1) {
      detachHandlers[i]();
    }
    detachHandlers = [];
  }

  function attach({ subscribe, getStateApi } = {}) {
    detach();
    getStateApiRef = typeof getStateApi === 'function' ? getStateApi : null;
    if (typeof subscribe !== 'function') return false;

    for (let i = 0; i < allowedInputs.length; i += 1) {
      const unsubscribe = subscribe(allowedInputs[i], () => {
        updateMirror();
      });
      if (typeof unsubscribe === 'function') detachHandlers.push(unsubscribe);
    }

    updateMirror();
    return true;
  }

  function getLastMirror() {
    if (lastMirror === null) return null;
    return createReadonlyClone(lastMirror);
  }

  function getId() {
    return consumerId;
  }

  return {
    getId,
    attach,
    detach,
    getLastMirror
  };
}

function resolvePublishFromHooks({ integrationApi, eventPipeline }) {
  if (eventPipeline && typeof eventPipeline.publish === 'function') {
    return (eventType, envelope) => eventPipeline.publish(eventType, envelope);
  }
  if (eventPipeline && typeof eventPipeline.publishEvent === 'function') {
    return (eventType, envelope) => eventPipeline.publishEvent(eventType, envelope);
  }
  if (eventPipeline && typeof eventPipeline.emit === 'function') {
    return (eventType, envelope) => eventPipeline.emit(eventType, envelope);
  }
  if (integrationApi && typeof integrationApi.publish === 'function') {
    return (eventType, envelope) => integrationApi.publish(eventType, envelope);
  }
  return null;
}

function registerWorldGameStateSystem({
  integrationApi = null,
  eventPipeline = null,
  stateSystem = null,
  consumerFactory = null
} = {}) {
  const publishEvent = resolvePublishFromHooks({ integrationApi, eventPipeline });
  const resolvedStateSystem = stateSystem || createWorldGameStateSystem({ publishEvent });
  const statePublicApi = typeof resolvedStateSystem.getPublicApi === 'function'
    ? resolvedStateSystem.getPublicApi()
    : resolvedStateSystem;

  const registerSystem = integrationApi && typeof integrationApi.registerSystem === 'function'
    ? integrationApi.registerSystem.bind(integrationApi)
    : null;
  const unregisterSystem = integrationApi && typeof integrationApi.unregisterSystem === 'function'
    ? integrationApi.unregisterSystem.bind(integrationApi)
    : null;
  const getPublicApi = integrationApi && typeof integrationApi.getPublicApi === 'function'
    ? integrationApi.getPublicApi.bind(integrationApi)
    : null;
  const runComposition = integrationApi && typeof integrationApi.runComposition === 'function'
    ? integrationApi.runComposition.bind(integrationApi)
    : null;
  const disposeOwner = integrationApi && typeof integrationApi.disposeOwner === 'function'
    ? integrationApi.disposeOwner.bind(integrationApi)
    : null;

  const systemRegistered = registerSystem
    ? registerSystem({
        systemId: WORLD_GAME_STATE_SYSTEM_ID,
        publicApi: statePublicApi
      }) === true
    : false;

  const consumer = typeof consumerFactory === 'function'
    ? consumerFactory({
        stateSystem: resolvedStateSystem,
        systemId: WORLD_GAME_STATE_SYSTEM_ID
      })
    : createObjectiveProgressMirrorConsumer();
  const consumerId = consumer && typeof consumer.getId === 'function'
    ? consumer.getId()
    : 'objectiveProgressMirrorConsumer';

  let consumerAttached = false;
  if (consumer && typeof consumer.attach === 'function') {
    if (runComposition) {
      let attachedViaComposition = false;
      runComposition(consumerId, ({ subscribe, getPublicApi: compositionGetPublicApi }) => {
        attachedViaComposition = consumer.attach({
          subscribe,
          getStateApi: () => {
            const apiFromComposition = typeof compositionGetPublicApi === 'function'
              ? compositionGetPublicApi(WORLD_GAME_STATE_SYSTEM_ID)
              : null;
            return apiFromComposition || statePublicApi;
          }
        });
      });
      consumerAttached = attachedViaComposition;
    }

    if (!consumerAttached) {
      const subscribeDirect = eventPipeline && typeof eventPipeline.subscribe === 'function'
        ? eventPipeline.subscribe.bind(eventPipeline)
        : (eventPipeline && typeof eventPipeline.on === 'function'
            ? eventPipeline.on.bind(eventPipeline)
            : null);
      if (subscribeDirect) {
        consumerAttached = consumer.attach({
          subscribe: subscribeDirect,
          getStateApi: () => {
            const externalApi = getPublicApi ? getPublicApi(WORLD_GAME_STATE_SYSTEM_ID) : null;
            return externalApi || statePublicApi;
          }
        });
      }
    }
  }

  function dispose() {
    if (consumer && typeof consumer.detach === 'function') {
      consumer.detach();
    }
    if (disposeOwner) {
      disposeOwner(consumerId);
    }
    if (systemRegistered && unregisterSystem) {
      unregisterSystem(WORLD_GAME_STATE_SYSTEM_ID);
    }
  }

  return {
    ok: true,
    systemId: WORLD_GAME_STATE_SYSTEM_ID,
    systemRegistered,
    consumerId,
    consumerAttached,
    stateSystem: resolvedStateSystem,
    getStateApi: () => statePublicApi,
    getConsumerApi: () => consumer || null,
    dispose
  };
}

export {
  WORLD_GAME_STATE_SYSTEM_ID,
  WORLD_GAME_STATE_EVENT_TYPES,
  createInitialWorldGameState,
  createStateContractEventEnvelope,
  createTransitionAppliedEvent,
  createTransitionRejectedEvent,
  createWorldGameStateSystem,
  createObjectiveProgressMirrorConsumer,
  registerWorldGameStateSystem
};
