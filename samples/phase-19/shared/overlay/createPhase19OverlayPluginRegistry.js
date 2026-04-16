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

function normalizePluginId(pluginId) {
  return String(pluginId || '').trim();
}

function toErrorDetails(error) {
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
    return true;
  }

  function runLifecycleHook(record, phase, context = {}) {
    const hook = record?.plugin?.[phase];
    if (typeof hook !== 'function') {
      return { ok: true };
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
        return { ok: true };
      } finally {
        activeHookPluginId = previousHookPluginId;
      }
    } catch (error) {
      return { ok: false, error: toErrorDetails(error) };
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
    return withPluginTransition(record.plugin.id, () => {
      if (record.state === PLUGIN_STATES.INITIALIZED || record.state === PLUGIN_STATES.ACTIVE || record.state === PLUGIN_STATES.INACTIVE) {
        return false;
      }
      if (record.state !== PLUGIN_STATES.REGISTERED) {
        return false;
      }
      const initResult = runLifecycleHook(record, 'init', context);
      if (!initResult.ok) {
        isolatePluginFailure(record, 'init', initResult.error, context, {
          unregisterExtension: true,
          quarantine: true,
        });
        return false;
      }
      record.state = PLUGIN_STATES.INITIALIZED;
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
    return withPluginTransition(record.plugin.id, () => {
      if (record.state === PLUGIN_STATES.ACTIVE) {
        return false;
      }
      if (record.state === PLUGIN_STATES.FAILED) {
        return false;
      }
      if (record.state === PLUGIN_STATES.REGISTERED) {
        if (!initPlugin(pluginId, context)) {
          return false;
        }
      }
      if (record.state !== PLUGIN_STATES.INITIALIZED && record.state !== PLUGIN_STATES.INACTIVE) {
        return false;
      }
      if (!validateExtensionOwnership(record.extension.id, record.plugin.id)) {
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
        isolatePluginFailure(record, 'activate', activateResult.error, context, {
          unregisterExtension: true,
          quarantine: true,
        });
        return false;
      }

      record.state = PLUGIN_STATES.ACTIVE;
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
    return withPluginTransition(record.plugin.id, () => {
      if (record.state !== PLUGIN_STATES.ACTIVE) {
        return false;
      }
      const deactivateResult = runLifecycleHook(record, 'deactivate', context);
      if (!deactivateResult.ok) {
        isolatePluginFailure(record, 'deactivate', deactivateResult.error, context, {
          unregisterExtension: true,
          quarantine: true,
        });
        return false;
      }

      expansionFramework.unregisterExtension(record.extension.id);
      record.state = PLUGIN_STATES.INACTIVE;
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
    return withPluginTransition(record.plugin.id, () => {
      if (record.state === PLUGIN_STATES.ACTIVE) {
        if (!deactivatePlugin(normalizedPluginId, context)) {
          return false;
        }
      }
      const destroyResult = runLifecycleHook(record, 'destroy', context);
      if (!destroyResult.ok) {
        isolatePluginFailure(record, 'destroy', destroyResult.error, context, {
          unregisterExtension: true,
          quarantine: true,
        });
        return false;
      }

      expansionFramework.unregisterExtension(record.extension.id);
      extensionOwnerMap.delete(record.extension.id);
      pluginRecordMap.delete(normalizedPluginId);
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
    };
    pluginRecordMap.set(pluginId, record);
    extensionOwnerMap.set(resolvedExtension.id, pluginId);

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
      if (!activate) {
        return true;
      }
      return activatePlugin(pluginId, { ...context, reason: context?.reason || 'recover-activate' });
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
