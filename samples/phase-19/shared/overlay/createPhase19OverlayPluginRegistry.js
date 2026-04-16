/*
Toolbox Aid
David Quesenberry
04/16/2026
createPhase19OverlayPluginRegistry.js
*/
import createPhase19OverlayExpansionFramework from '/samples/phase-19/shared/overlay/createPhase19OverlayExpansionFramework.js';

const PLUGIN_STATES = Object.freeze({
  REGISTERED: 'registered',
  INITIALIZED: 'initialized',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  FAILED: 'failed',
});

const DEFAULT_RESOURCE_LIMITS = Object.freeze({
  maxHookDurationMs: 24,
  maxHeapUsedBytes: 512 * 1024 * 1024,
  maxHeapDeltaBytes: 8 * 1024 * 1024,
});

function normalizePluginId(pluginId) {
  return String(pluginId || '').trim();
}

function normalizeLimit(value, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return fallback;
  }
  return numeric;
}

function normalizeResourceLimits(resourceLimits = {}) {
  return Object.freeze({
    maxHookDurationMs: normalizeLimit(resourceLimits?.maxHookDurationMs, DEFAULT_RESOURCE_LIMITS.maxHookDurationMs),
    maxHeapUsedBytes: normalizeLimit(resourceLimits?.maxHeapUsedBytes, DEFAULT_RESOURCE_LIMITS.maxHeapUsedBytes),
    maxHeapDeltaBytes: normalizeLimit(resourceLimits?.maxHeapDeltaBytes, DEFAULT_RESOURCE_LIMITS.maxHeapDeltaBytes),
  });
}

function toErrorDetails(error) {
  if (error && typeof error === 'object' && typeof error.message === 'string') {
    return {
      name: String(error.name || 'Error'),
      message: String(error.message || 'Unknown plugin error'),
    };
  }
  if (error instanceof Error) {
    return {
      name: String(error.name || 'Error'),
      message: String(error.message || 'Unknown plugin error'),
    };
  }
  return {
    name: 'Error',
    message: String(error || 'Unknown plugin error'),
  };
}

function deepFreezeValue(value, seen = new Set()) {
  if (!value || typeof value !== 'object') {
    return value;
  }
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);
  const keys = Object.keys(value);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    deepFreezeValue(value[key], seen);
  }
  return Object.freeze(value);
}

function createReadonlyFacade(target, allowedMethods = []) {
  const facade = {};
  for (let i = 0; i < allowedMethods.length; i += 1) {
    const methodName = allowedMethods[i];
    const method = target?.[methodName];
    if (typeof method !== 'function') {
      continue;
    }
    facade[methodName] = (...args) => method(...args);
  }
  return Object.freeze(facade);
}

function getNowMs() {
  if (typeof globalThis?.performance?.now === 'function') {
    return Number(globalThis.performance.now());
  }
  return Date.now();
}

function readHeapUsageBytes() {
  try {
    if (typeof globalThis?.process?.memoryUsage === 'function') {
      const usage = globalThis.process.memoryUsage();
      const heapUsed = Number(usage?.heapUsed);
      if (Number.isFinite(heapUsed) && heapUsed >= 0) {
        return heapUsed;
      }
    }
  } catch {
    // Heap metrics are best-effort for diagnostics.
  }

  try {
    const browserHeap = Number(globalThis?.performance?.memory?.usedJSHeapSize);
    if (Number.isFinite(browserHeap) && browserHeap >= 0) {
      return browserHeap;
    }
  } catch {
    // Ignore unavailable browser heap APIs.
  }

  return 0;
}

function createHookMetrics() {
  return {
    calls: 0,
    successes: 0,
    failures: 0,
    totalDurationMs: 0,
    lastDurationMs: 0,
    lastStartedAtIso: '',
    lastFinishedAtIso: '',
    lastErrorMessage: '',
  };
}

function createPluginMetrics() {
  return {
    hooks: {
      init: createHookMetrics(),
      activate: createHookMetrics(),
      deactivate: createHookMetrics(),
      destroy: createHookMetrics(),
    },
    transitions: {
      attempted: 0,
      succeeded: 0,
      failed: 0,
    },
    isolation: {
      count: 0,
      lastPhase: '',
      lastErrorMessage: '',
      lastIsolatedAtIso: '',
    },
    recoveries: {
      count: 0,
      lastRecoveredAtIso: '',
    },
    registration: {
      count: 0,
      lastRegisteredAtIso: '',
      lastExtensionId: '',
    },
    resources: {
      cpuViolations: 0,
      memoryViolations: 0,
      lastHookDurationMs: 0,
      lastHeapUsedBytes: 0,
      lastHeapDeltaBytes: 0,
      lastViolationMessage: '',
    },
    lastState: '',
    lastStateChangedAtIso: '',
  };
}

function snapshotPluginMetrics(metrics) {
  return deepFreezeValue(JSON.parse(JSON.stringify(metrics || createPluginMetrics())));
}

function normalizePluginDefinition(plugin) {
  if (!plugin || typeof plugin !== 'object') {
    throw new Error('Overlay plugin registration requires a plugin object.');
  }

  const id = normalizePluginId(plugin.id);
  if (!id) {
    throw new Error('Overlay plugin requires a non-empty id.');
  }

  const createOverlayExtension = typeof plugin.createOverlayExtension === 'function'
    ? plugin.createOverlayExtension
    : null;
  const extension = plugin.extension && typeof plugin.extension === 'object'
    ? plugin.extension
    : null;

  if (!createOverlayExtension && !extension) {
    throw new Error(`Overlay plugin "${id}" requires createOverlayExtension() or extension.`);
  }

  return Object.freeze({
    id,
    version: String(plugin.version || '').trim(),
    metadata: Object.freeze({ ...(plugin.metadata || {}) }),
    resourceLimits: normalizeResourceLimits(plugin.resourceLimits),
    init: typeof plugin.init === 'function' ? plugin.init : (typeof plugin.onInit === 'function' ? plugin.onInit : null),
    activate: typeof plugin.activate === 'function'
      ? plugin.activate
      : (typeof plugin.onActivate === 'function' ? plugin.onActivate : null),
    deactivate: typeof plugin.deactivate === 'function'
      ? plugin.deactivate
      : (typeof plugin.onDeactivate === 'function' ? plugin.onDeactivate : null),
    destroy: typeof plugin.destroy === 'function'
      ? plugin.destroy
      : (typeof plugin.onDestroy === 'function' ? plugin.onDestroy : null),
    createOverlayExtension,
    extension,
  });
}

function normalizePluginExtension(plugin, candidateExtension) {
  const extension = candidateExtension && typeof candidateExtension === 'object'
    ? candidateExtension
    : null;
  if (!extension) {
    throw new Error(`Overlay plugin "${plugin.id}" returned an invalid extension.`);
  }
  const extensionId = normalizePluginId(extension.id) || `${plugin.id}.extension`;
  return {
    ...extension,
    id: extensionId,
  };
}

export default function createPhase19OverlayPluginRegistry({
  expansionFramework = createPhase19OverlayExpansionFramework(),
  plugins = [],
} = {}) {
  const pluginRecordMap = new Map();
  const extensionOwnerMap = new Map();
  let activeTransitionPluginId = '';
  let activeHookPluginId = '';
  let api = null;

  function getPluginRecord(pluginId) {
    const normalizedPluginId = normalizePluginId(pluginId);
    if (!normalizedPluginId) {
      return null;
    }
    return pluginRecordMap.get(normalizedPluginId) ?? null;
  }

  function getReadonlyRegistryView() {
    return createReadonlyFacade(api, [
      'getPlugin',
      'getPluginState',
      'getPluginExtensionId',
      'getPluginMetrics',
      'listPluginMetrics',
      'getPluginDiagnostics',
      'listPluginDiagnostics',
      'listPlugins',
    ]);
  }

  function getReadonlyFrameworkView() {
    return createReadonlyFacade(expansionFramework, [
      'getExtension',
      'listExtensions',
      'listExtensionIds',
      'getControllerConfig',
      'createRuntimeForExtension',
    ]);
  }

  function canMutate(pluginId = '') {
    const normalizedPluginId = normalizePluginId(pluginId);
    if (activeHookPluginId) {
      return false;
    }
    if (!activeTransitionPluginId) {
      return true;
    }
    if (!normalizedPluginId) {
      return false;
    }
    return activeTransitionPluginId === normalizedPluginId;
  }

  function withPluginTransition(pluginId, operation) {
    const normalizedPluginId = normalizePluginId(pluginId);
    if (!normalizedPluginId || typeof operation !== 'function') {
      return false;
    }
    if (activeTransitionPluginId && activeTransitionPluginId !== normalizedPluginId) {
      return false;
    }

    const previousTransitionPluginId = activeTransitionPluginId;
    activeTransitionPluginId = normalizedPluginId;
    try {
      return operation();
    } finally {
      activeTransitionPluginId = previousTransitionPluginId;
    }
  }

  function validateExtensionOwnership(extensionId, pluginId) {
    const normalizedExtensionId = normalizePluginId(extensionId);
    const normalizedPluginId = normalizePluginId(pluginId);
    if (!normalizedExtensionId || !normalizedPluginId) {
      return false;
    }
    const currentOwner = extensionOwnerMap.get(normalizedExtensionId);
    return !currentOwner || currentOwner === normalizedPluginId;
  }

  function getRecoveryTargetState(record) {
    if (!record) {
      return PLUGIN_STATES.REGISTERED;
    }
    if (record.stateBeforeFailure === PLUGIN_STATES.ACTIVE) {
      return PLUGIN_STATES.INACTIVE;
    }
    if (
      record.stateBeforeFailure === PLUGIN_STATES.INITIALIZED
      || record.stateBeforeFailure === PLUGIN_STATES.INACTIVE
      || record.stateBeforeFailure === PLUGIN_STATES.REGISTERED
    ) {
      return record.stateBeforeFailure;
    }
    return PLUGIN_STATES.REGISTERED;
  }

  function isolatePluginFailure(record, phase, error, context = {}, options = {}) {
    if (!record) {
      return false;
    }
    const shouldUnregisterExtension = options.unregisterExtension !== false;
    const shouldQuarantine = options.quarantine !== false;
    const { name, message } = toErrorDetails(error);
    const failureSnapshot = Object.freeze({
      phase: String(phase || 'unknown'),
      name,
      message,
      pluginId: record.plugin.id,
      extensionId: record.extension.id,
      timestampIso: new Date().toISOString(),
      contextReason: String(context?.reason || ''),
    });
    if (shouldUnregisterExtension) {
      try {
        expansionFramework.unregisterExtension(record.extension.id);
      } catch {
        // Failure isolation must never throw.
      }
    }
    record.failureCount = (Number(record.failureCount) || 0) + 1;
    record.lastFailure = failureSnapshot;
    record.failureHistory.push(failureSnapshot);
    if (record.failureHistory.length > 10) {
      record.failureHistory.shift();
    }
    if (shouldQuarantine) {
      record.stateBeforeFailure = record.state;
      record.state = PLUGIN_STATES.FAILED;
    }
    if (record.metrics) {
      record.metrics.isolation.count += 1;
      record.metrics.isolation.lastPhase = failureSnapshot.phase;
      record.metrics.isolation.lastErrorMessage = failureSnapshot.message;
      record.metrics.isolation.lastIsolatedAtIso = failureSnapshot.timestampIso;
      record.metrics.transitions.failed += 1;
      record.metrics.lastState = record.state;
      record.metrics.lastStateChangedAtIso = failureSnapshot.timestampIso;
    }
    return true;
  }

  function evaluateResourceLimitViolations(record, phase, durationMs, heapUsedBytes, heapDeltaBytes) {
    const limits = record?.plugin?.resourceLimits || DEFAULT_RESOURCE_LIMITS;
    const duration = Math.max(0, Number(durationMs) || 0);
    const heapUsed = Math.max(0, Number(heapUsedBytes) || 0);
    const heapDelta = Math.max(0, Number(heapDeltaBytes) || 0);
    const cpuExceeded = duration > limits.maxHookDurationMs;
    const heapExceeded = heapUsed > limits.maxHeapUsedBytes;
    const heapDeltaExceeded = heapDelta > limits.maxHeapDeltaBytes;

    if (record?.metrics?.resources) {
      record.metrics.resources.lastHookDurationMs = duration;
      record.metrics.resources.lastHeapUsedBytes = heapUsed;
      record.metrics.resources.lastHeapDeltaBytes = heapDelta;
      if (cpuExceeded) {
        record.metrics.resources.cpuViolations += 1;
      }
      if (heapExceeded || heapDeltaExceeded) {
        record.metrics.resources.memoryViolations += 1;
      }
    }

    if (!cpuExceeded && !heapExceeded && !heapDeltaExceeded) {
      return { ok: true };
    }

    const reasons = [];
    if (cpuExceeded) {
      reasons.push(`CPU ${duration.toFixed(3)}ms > ${limits.maxHookDurationMs}ms`);
    }
    if (heapExceeded) {
      reasons.push(`heapUsed ${heapUsed}B > ${limits.maxHeapUsedBytes}B`);
    }
    if (heapDeltaExceeded) {
      reasons.push(`heapDelta ${heapDelta}B > ${limits.maxHeapDeltaBytes}B`);
    }
    const message = `Resource limit exceeded (${reasons.join(', ')})`;
    if (record?.metrics?.resources) {
      record.metrics.resources.lastViolationMessage = message;
    }
    return {
      ok: false,
      phase: `${phase}-resource-limit`,
      error: {
        name: 'ResourceLimitError',
        message,
      },
    };
  }

  function runLifecycleHook(record, phase, context = {}) {
    const bucket = record?.metrics?.hooks?.[phase] || null;
    const hook = record?.plugin?.[phase];
    const startedAtMs = getNowMs();
    const startedHeapBytes = readHeapUsageBytes();
    const startedAtIso = new Date().toISOString();
    if (bucket) {
      bucket.calls += 1;
      bucket.lastStartedAtIso = startedAtIso;
    }
    if (typeof hook !== 'function') {
      const finishedAtMs = getNowMs();
      const durationMs = Math.max(0, finishedAtMs - startedAtMs);
      const finishedHeapBytes = readHeapUsageBytes();
      const heapDeltaBytes = Math.max(0, finishedHeapBytes - startedHeapBytes);
      if (bucket) {
        bucket.successes += 1;
        bucket.totalDurationMs += durationMs;
        bucket.lastDurationMs = durationMs;
        bucket.lastFinishedAtIso = new Date().toISOString();
        bucket.lastErrorMessage = '';
      }
      return evaluateResourceLimitViolations(record, phase, durationMs, finishedHeapBytes, heapDeltaBytes);
    }
    try {
      const previousHookPluginId = activeHookPluginId;
      activeHookPluginId = record.plugin.id;
      const lifecycleContext = deepFreezeValue({
        ...context,
        phase,
        pluginId: record.plugin.id,
        extensionId: record.extension.id,
        registry: getReadonlyRegistryView(),
        expansionFramework: getReadonlyFrameworkView(),
      });
      try {
        hook(lifecycleContext);
        const finishedAtMs = getNowMs();
        const durationMs = Math.max(0, finishedAtMs - startedAtMs);
        const finishedHeapBytes = readHeapUsageBytes();
        const heapDeltaBytes = Math.max(0, finishedHeapBytes - startedHeapBytes);
        if (bucket) {
          bucket.successes += 1;
          bucket.totalDurationMs += durationMs;
          bucket.lastDurationMs = durationMs;
          bucket.lastFinishedAtIso = new Date().toISOString();
          bucket.lastErrorMessage = '';
        }
        return evaluateResourceLimitViolations(record, phase, durationMs, finishedHeapBytes, heapDeltaBytes);
      } finally {
        activeHookPluginId = previousHookPluginId;
      }
    } catch (error) {
      const errorDetails = toErrorDetails(error);
      const finishedAtMs = getNowMs();
      const durationMs = Math.max(0, finishedAtMs - startedAtMs);
      if (bucket) {
        bucket.failures += 1;
        bucket.totalDurationMs += durationMs;
        bucket.lastDurationMs = durationMs;
        bucket.lastFinishedAtIso = new Date().toISOString();
        bucket.lastErrorMessage = errorDetails.message;
      }
      return { ok: false, error: errorDetails };
    }
  }

  function initPlugin(pluginId, context = {}) {
    if (!canMutate(pluginId)) {
      return false;
    }
    const record = getPluginRecord(pluginId);
    if (!record) {
      return false;
    }
    if (record.metrics) {
      record.metrics.transitions.attempted += 1;
    }
    return withPluginTransition(record.plugin.id, () => {
      if (record.state === PLUGIN_STATES.INITIALIZED || record.state === PLUGIN_STATES.ACTIVE || record.state === PLUGIN_STATES.INACTIVE) {
        return false;
      }
      if (record.state !== PLUGIN_STATES.REGISTERED) {
        return false;
      }
      const initResult = runLifecycleHook(record, 'init', context);
      if (!initResult.ok) {
        isolatePluginFailure(record, initResult.phase || 'init', initResult.error, context, {
          unregisterExtension: true,
          quarantine: true,
        });
        return false;
      }
      record.state = PLUGIN_STATES.INITIALIZED;
      if (record.metrics) {
        record.metrics.transitions.succeeded += 1;
        record.metrics.lastState = record.state;
        record.metrics.lastStateChangedAtIso = new Date().toISOString();
      }
      return true;
    });
  }

  function activatePlugin(pluginId, context = {}) {
    if (!canMutate(pluginId)) {
      return false;
    }
    const record = getPluginRecord(pluginId);
    if (!record) {
      return false;
    }
    if (record.metrics) {
      record.metrics.transitions.attempted += 1;
    }
    return withPluginTransition(record.plugin.id, () => {
      if (record.state === PLUGIN_STATES.ACTIVE) {
        if (record.metrics) {
          record.metrics.transitions.failed += 1;
        }
        return false;
      }
      if (record.state === PLUGIN_STATES.FAILED) {
        if (record.metrics) {
          record.metrics.transitions.failed += 1;
        }
        return false;
      }
      if (record.state === PLUGIN_STATES.REGISTERED) {
        if (!initPlugin(pluginId, context)) {
          return false;
        }
      }
      if (record.state !== PLUGIN_STATES.INITIALIZED && record.state !== PLUGIN_STATES.INACTIVE) {
        if (record.metrics) {
          record.metrics.transitions.failed += 1;
        }
        return false;
      }
      if (!validateExtensionOwnership(record.extension.id, record.plugin.id)) {
        if (record.metrics) {
          record.metrics.transitions.failed += 1;
        }
        return false;
      }

      const registered = expansionFramework.registerExtension(record.extension);
      if (!registered || !registered.id) {
        isolatePluginFailure(record, 'activate-register', new Error('extension registration failed'), context, {
          unregisterExtension: true,
          quarantine: true,
        });
        return false;
      }

      const activateResult = runLifecycleHook(record, 'activate', context);
      if (!activateResult.ok) {
        isolatePluginFailure(record, activateResult.phase || 'activate', activateResult.error, context, {
          unregisterExtension: true,
          quarantine: true,
        });
        return false;
      }

      record.state = PLUGIN_STATES.ACTIVE;
      if (record.metrics) {
        record.metrics.transitions.succeeded += 1;
        record.metrics.lastState = record.state;
        record.metrics.lastStateChangedAtIso = new Date().toISOString();
      }
      return true;
    });
  }

  function deactivatePlugin(pluginId, context = {}) {
    if (!canMutate(pluginId)) {
      return false;
    }
    const record = getPluginRecord(pluginId);
    if (!record) {
      return false;
    }
    if (record.metrics) {
      record.metrics.transitions.attempted += 1;
    }
    return withPluginTransition(record.plugin.id, () => {
      if (record.state !== PLUGIN_STATES.ACTIVE) {
        if (record.metrics) {
          record.metrics.transitions.failed += 1;
        }
        return false;
      }
      const deactivateResult = runLifecycleHook(record, 'deactivate', context);
      if (!deactivateResult.ok) {
        isolatePluginFailure(record, deactivateResult.phase || 'deactivate', deactivateResult.error, context, {
          unregisterExtension: true,
          quarantine: true,
        });
        return false;
      }

      expansionFramework.unregisterExtension(record.extension.id);
      record.state = PLUGIN_STATES.INACTIVE;
      if (record.metrics) {
        record.metrics.transitions.succeeded += 1;
        record.metrics.lastState = record.state;
        record.metrics.lastStateChangedAtIso = new Date().toISOString();
      }
      return true;
    });
  }

  function destroyPlugin(pluginId, context = {}) {
    if (!canMutate(pluginId)) {
      return false;
    }
    const normalizedPluginId = normalizePluginId(pluginId);
    const record = getPluginRecord(normalizedPluginId);
    if (!record) {
      return false;
    }
    if (record.metrics) {
      record.metrics.transitions.attempted += 1;
    }
    return withPluginTransition(record.plugin.id, () => {
      if (record.state === PLUGIN_STATES.ACTIVE) {
        if (!deactivatePlugin(normalizedPluginId, context)) {
          return false;
        }
      }
      const destroyResult = runLifecycleHook(record, 'destroy', context);
      if (!destroyResult.ok) {
        isolatePluginFailure(record, destroyResult.phase || 'destroy', destroyResult.error, context, {
          unregisterExtension: true,
          quarantine: true,
        });
        return false;
      }

      expansionFramework.unregisterExtension(record.extension.id);
      extensionOwnerMap.delete(record.extension.id);
      pluginRecordMap.delete(normalizedPluginId);
      if (record.metrics) {
        record.metrics.transitions.succeeded += 1;
        record.metrics.lastState = 'destroyed';
        record.metrics.lastStateChangedAtIso = new Date().toISOString();
      }
      return true;
    });
  }

  function registerPlugin(plugin, options = {}) {
    if (!canMutate()) {
      throw new Error('Overlay plugin mutation is not allowed during active plugin lifecycle callbacks.');
    }
    const context = options?.context || {};
    const autoActivate = options?.autoActivate !== false;
    const normalizedPlugin = normalizePluginDefinition(plugin);
    const pluginId = normalizedPlugin.id;

    if (pluginRecordMap.has(pluginId)) {
      const destroyed = destroyPlugin(pluginId, { ...context, reason: 're-register' });
      if (!destroyed) {
        throw new Error(`Overlay plugin "${pluginId}" cannot be re-registered while transition is active.`);
      }
    }

    const resolvedExtension = normalizePluginExtension(
      normalizedPlugin,
      normalizedPlugin.createOverlayExtension
        ? normalizedPlugin.createOverlayExtension({
          pluginId,
          registry: getReadonlyRegistryView(),
          expansionFramework: getReadonlyFrameworkView(),
          ...context,
        })
        : normalizedPlugin.extension
    );
    if (!validateExtensionOwnership(resolvedExtension.id, pluginId)) {
      throw new Error(`Overlay extension id "${resolvedExtension.id}" is already owned by another plugin.`);
    }

    const record = {
      plugin: normalizedPlugin,
      extension: resolvedExtension,
      state: PLUGIN_STATES.REGISTERED,
      stateBeforeFailure: '',
      failureCount: 0,
      lastFailure: null,
      failureHistory: [],
      metrics: createPluginMetrics(),
    };
    pluginRecordMap.set(pluginId, record);
    extensionOwnerMap.set(resolvedExtension.id, pluginId);
    record.metrics.registration.count += 1;
    record.metrics.registration.lastRegisteredAtIso = new Date().toISOString();
    record.metrics.registration.lastExtensionId = resolvedExtension.id;
    record.metrics.lastState = record.state;
    record.metrics.lastStateChangedAtIso = new Date().toISOString();

    if (autoActivate) {
      if (!activatePlugin(pluginId, context)) {
        throw new Error(`Overlay plugin "${pluginId}" failed lifecycle activation.`);
      }
    }

    return Object.freeze({
      pluginId,
      extensionId: resolvedExtension.id,
    });
  }

  function unregisterPlugin(pluginId, context = {}) {
    return destroyPlugin(pluginId, context);
  }

  function recoverPlugin(pluginId, options = {}) {
    if (!canMutate(pluginId)) {
      return false;
    }
    const context = options?.context || {};
    const activate = options?.activate === true;
    const record = getPluginRecord(pluginId);
    if (!record || record.state !== PLUGIN_STATES.FAILED) {
      return false;
    }
    if (record.metrics) {
      record.metrics.transitions.attempted += 1;
    }
    return withPluginTransition(record.plugin.id, () => {
      const recoveryState = getRecoveryTargetState(record);
      try {
        expansionFramework.unregisterExtension(record.extension.id);
      } catch {
        // Recovery should continue even if extension was already removed.
      }
      record.state = recoveryState;
      record.stateBeforeFailure = '';
      record.lastFailure = null;
      record.failureHistory = [];
      if (record.metrics) {
        record.metrics.recoveries.count += 1;
        record.metrics.recoveries.lastRecoveredAtIso = new Date().toISOString();
        record.metrics.transitions.succeeded += 1;
        record.metrics.lastState = record.state;
        record.metrics.lastStateChangedAtIso = new Date().toISOString();
      }
      if (!activate) {
        return true;
      }
      const activated = activatePlugin(pluginId, { ...context, reason: context?.reason || 'recover-activate' });
      if (!activated && record.metrics) {
        record.metrics.transitions.failed += 1;
      }
      return activated;
    });
  }

  function getPlugin(pluginId) {
    const record = getPluginRecord(pluginId);
    return record ? record.plugin : null;
  }

  function getPluginState(pluginId) {
    const record = getPluginRecord(pluginId);
    return record?.state || '';
  }

  function getPluginExtensionId(pluginId) {
    const record = getPluginRecord(pluginId);
    return record?.extension?.id || '';
  }

  function getPluginFailure(pluginId) {
    const record = getPluginRecord(pluginId);
    if (!record || !record.lastFailure) {
      return null;
    }
    return record.lastFailure;
  }

  function getPluginMetrics(pluginId) {
    const record = getPluginRecord(pluginId);
    if (!record || !record.metrics) {
      return null;
    }
    return snapshotPluginMetrics(record.metrics);
  }

  function listPluginMetrics() {
    const metrics = [];
    for (const [pluginId, record] of pluginRecordMap.entries()) {
      metrics.push({
        pluginId,
        extensionId: record.extension.id,
        state: record.state,
        metrics: snapshotPluginMetrics(record.metrics),
      });
    }
    return Object.freeze(metrics);
  }

  function getPluginDiagnostics(pluginId) {
    const record = getPluginRecord(pluginId);
    if (!record) {
      return null;
    }
    return deepFreezeValue({
      pluginId: record.plugin.id,
      version: record.plugin.version,
      extensionId: record.extension.id,
      state: record.state,
      resourceLimits: record.plugin.resourceLimits,
      failureCount: record.failureCount,
      lastFailure: record.lastFailure,
      metrics: snapshotPluginMetrics(record.metrics),
    });
  }

  function listPluginDiagnostics() {
    const diagnostics = [];
    for (const [pluginId] of pluginRecordMap.entries()) {
      const snapshot = getPluginDiagnostics(pluginId);
      if (!snapshot) {
        continue;
      }
      diagnostics.push(snapshot);
    }
    return Object.freeze(diagnostics);
  }

  function resetPluginMetrics(pluginId) {
    const record = getPluginRecord(pluginId);
    if (!record) {
      return false;
    }
    const registrationCount = record.metrics?.registration?.count || 0;
    const lastRegisteredAtIso = record.metrics?.registration?.lastRegisteredAtIso || '';
    const lastExtensionId = record.metrics?.registration?.lastExtensionId || record.extension.id;
    record.metrics = createPluginMetrics();
    record.metrics.registration.count = registrationCount;
    record.metrics.registration.lastRegisteredAtIso = lastRegisteredAtIso;
    record.metrics.registration.lastExtensionId = lastExtensionId;
    record.metrics.lastState = record.state;
    record.metrics.lastStateChangedAtIso = new Date().toISOString();
    return true;
  }

  function listPluginFailures() {
    const failures = [];
    for (const [pluginId, record] of pluginRecordMap.entries()) {
      if (!record.lastFailure) {
        continue;
      }
      failures.push({
        pluginId,
        extensionId: record.extension.id,
        state: record.state,
        failureCount: record.failureCount,
        lastFailure: record.lastFailure,
      });
    }
    return Object.freeze(failures);
  }

  function clearPluginFailure(pluginId) {
    const record = getPluginRecord(pluginId);
    if (!record || !record.lastFailure) {
      return false;
    }
    record.lastFailure = null;
    record.failureHistory = [];
    return true;
  }

  function listPlugins() {
    const entries = [];
    for (const [pluginId, record] of pluginRecordMap.entries()) {
      entries.push({
        id: pluginId,
        version: record.plugin.version,
        extensionId: record.extension.id,
        state: record.state,
        failureCount: record.failureCount,
        transitionAttempts: record.metrics?.transitions?.attempted || 0,
        transitionFailures: record.metrics?.transitions?.failed || 0,
        cpuViolations: record.metrics?.resources?.cpuViolations || 0,
        memoryViolations: record.metrics?.resources?.memoryViolations || 0,
      });
    }
    return Object.freeze(entries);
  }

  api = {
    registerPlugin,
    initPlugin,
    activatePlugin,
    deactivatePlugin,
    destroyPlugin,
    recoverPlugin,
    unregisterPlugin,
    getPlugin,
    getPluginState,
    getPluginExtensionId,
    getPluginFailure,
    getPluginMetrics,
    listPluginMetrics,
    getPluginDiagnostics,
    listPluginDiagnostics,
    resetPluginMetrics,
    listPluginFailures,
    clearPluginFailure,
    listPlugins,
    states: PLUGIN_STATES,
    getFramework() {
      return expansionFramework;
    },
  };

  if (Array.isArray(plugins)) {
    for (let i = 0; i < plugins.length; i += 1) {
      registerPlugin(plugins[i]);
    }
  }

  return api;
}
