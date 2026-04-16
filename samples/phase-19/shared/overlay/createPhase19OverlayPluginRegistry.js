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
});

function normalizePluginId(pluginId) {
  return String(pluginId || '').trim();
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
  let api = null;

  function getPluginRecord(pluginId) {
    const normalizedPluginId = normalizePluginId(pluginId);
    if (!normalizedPluginId) {
      return null;
    }
    return pluginRecordMap.get(normalizedPluginId) ?? null;
  }

  function runLifecycleHook(record, phase, context = {}) {
    const hook = record?.plugin?.[phase];
    if (typeof hook !== 'function') {
      return true;
    }
    try {
      hook({
        ...context,
        phase,
        pluginId: record.plugin.id,
        extensionId: record.extension.id,
        registry: api,
        expansionFramework,
      });
      return true;
    } catch {
      return false;
    }
  }

  function initPlugin(pluginId, context = {}) {
    const record = getPluginRecord(pluginId);
    if (!record) {
      return false;
    }
    if (record.state === PLUGIN_STATES.INITIALIZED || record.state === PLUGIN_STATES.ACTIVE || record.state === PLUGIN_STATES.INACTIVE) {
      return false;
    }
    if (record.state !== PLUGIN_STATES.REGISTERED) {
      return false;
    }
    if (!runLifecycleHook(record, 'init', context)) {
      return false;
    }
    record.state = PLUGIN_STATES.INITIALIZED;
    return true;
  }

  function activatePlugin(pluginId, context = {}) {
    const record = getPluginRecord(pluginId);
    if (!record) {
      return false;
    }
    if (record.state === PLUGIN_STATES.ACTIVE) {
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

    const registered = expansionFramework.registerExtension(record.extension);
    if (!registered || !registered.id) {
      return false;
    }

    if (!runLifecycleHook(record, 'activate', context)) {
      expansionFramework.unregisterExtension(record.extension.id);
      return false;
    }

    record.state = PLUGIN_STATES.ACTIVE;
    return true;
  }

  function deactivatePlugin(pluginId, context = {}) {
    const record = getPluginRecord(pluginId);
    if (!record) {
      return false;
    }
    if (record.state !== PLUGIN_STATES.ACTIVE) {
      return false;
    }
    if (!runLifecycleHook(record, 'deactivate', context)) {
      return false;
    }

    expansionFramework.unregisterExtension(record.extension.id);
    record.state = PLUGIN_STATES.INACTIVE;
    return true;
  }

  function destroyPlugin(pluginId, context = {}) {
    const normalizedPluginId = normalizePluginId(pluginId);
    const record = getPluginRecord(normalizedPluginId);
    if (!record) {
      return false;
    }
    if (record.state === PLUGIN_STATES.ACTIVE) {
      if (!deactivatePlugin(normalizedPluginId, context)) {
        return false;
      }
    }
    if (!runLifecycleHook(record, 'destroy', context)) {
      return false;
    }

    expansionFramework.unregisterExtension(record.extension.id);
    pluginRecordMap.delete(normalizedPluginId);
    return true;
  }

  function registerPlugin(plugin, options = {}) {
    const context = options?.context || {};
    const autoActivate = options?.autoActivate !== false;
    const normalizedPlugin = normalizePluginDefinition(plugin);
    const pluginId = normalizedPlugin.id;

    if (pluginRecordMap.has(pluginId)) {
      destroyPlugin(pluginId, { ...context, reason: 're-register' });
    }

    const resolvedExtension = normalizePluginExtension(
      normalizedPlugin,
      normalizedPlugin.createOverlayExtension
        ? normalizedPlugin.createOverlayExtension({
          pluginId,
          registry: api,
          expansionFramework,
          ...context,
        })
        : normalizedPlugin.extension
    );

    const record = {
      plugin: normalizedPlugin,
      extension: resolvedExtension,
      state: PLUGIN_STATES.REGISTERED,
    };
    pluginRecordMap.set(pluginId, record);

    if (autoActivate) {
      if (!activatePlugin(pluginId, context)) {
        pluginRecordMap.delete(pluginId);
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

  function listPlugins() {
    const entries = [];
    for (const [pluginId, record] of pluginRecordMap.entries()) {
      entries.push({
        id: pluginId,
        version: record.plugin.version,
        extensionId: record.extension.id,
        state: record.state,
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
    unregisterPlugin,
    getPlugin,
    getPluginState,
    getPluginExtensionId,
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
