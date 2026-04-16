/*
Toolbox Aid
David Quesenberry
04/16/2026
createPhase19OverlayPluginRegistry.js
*/
import createPhase19OverlayExpansionFramework from '/samples/phase-19/shared/overlay/createPhase19OverlayExpansionFramework.js';

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
  const pluginMap = new Map();
  const pluginExtensionMap = new Map();
  let api = null;

  function registerPlugin(plugin, context = {}) {
    const normalizedPlugin = normalizePluginDefinition(plugin);
    const pluginId = normalizedPlugin.id;

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

    const existingExtensionId = pluginExtensionMap.get(pluginId);
    if (existingExtensionId) {
      expansionFramework.unregisterExtension(existingExtensionId);
    }

    const registeredExtension = expansionFramework.registerExtension(resolvedExtension);
    pluginMap.set(pluginId, normalizedPlugin);
    pluginExtensionMap.set(pluginId, registeredExtension.id);

    return Object.freeze({
      pluginId,
      extensionId: registeredExtension.id,
    });
  }

  function unregisterPlugin(pluginId) {
    const normalizedPluginId = normalizePluginId(pluginId);
    if (!normalizedPluginId || !pluginMap.has(normalizedPluginId)) {
      return false;
    }

    const extensionId = pluginExtensionMap.get(normalizedPluginId);
    if (extensionId) {
      expansionFramework.unregisterExtension(extensionId);
    }
    pluginExtensionMap.delete(normalizedPluginId);
    pluginMap.delete(normalizedPluginId);
    return true;
  }

  function getPlugin(pluginId) {
    const normalizedPluginId = normalizePluginId(pluginId);
    if (!normalizedPluginId) {
      return null;
    }
    return pluginMap.get(normalizedPluginId) ?? null;
  }

  function getPluginExtensionId(pluginId) {
    const normalizedPluginId = normalizePluginId(pluginId);
    if (!normalizedPluginId) {
      return '';
    }
    return pluginExtensionMap.get(normalizedPluginId) || '';
  }

  function listPlugins() {
    const entries = [];
    for (const [pluginId, plugin] of pluginMap.entries()) {
      entries.push({
        id: pluginId,
        version: plugin.version,
        extensionId: pluginExtensionMap.get(pluginId) || '',
      });
    }
    return Object.freeze(entries);
  }

  api = {
    registerPlugin,
    unregisterPlugin,
    getPlugin,
    getPluginExtensionId,
    listPlugins,
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
