/*
Toolbox Aid
David Quesenberry
04/05/2026
debugPluginSystem.js
*/

import { asArray, asObject, sanitizeText } from "../../../src/engine/debug/inspectors/shared/inspectorUtils.js";
import { isObject } from "../../../src/shared/utils/objectUtils.js";

function asPositiveInt(value, fallback) {
  const normalized = Number.isFinite(value) ? Math.floor(Number(value)) : fallback;
  return normalized > 0 ? normalized : fallback;
}

function cloneJson(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function toResult(status, code, message, details = {}) {
  return {
    status: status === "failed" ? "failed" : "ready",
    code: sanitizeText(code) || (status === "failed" ? "PLUGIN_FAILED" : "PLUGIN_OK"),
    message: sanitizeText(message) || "",
    details: isObject(details) ? details : {}
  };
}

function normalizeCapabilityDescriptor(raw = {}) {
  const source = asObject(raw);
  return {
    capabilityId: sanitizeText(source.capabilityId),
    version: sanitizeText(source.version) || "1.0.0",
    required: source.required === true,
    compatibility: sanitizeText(source.compatibility) || "",
    notes: sanitizeText(source.notes) || ""
  };
}

function normalizePluginDescriptor(raw = {}) {
  const source = asObject(raw);
  return {
    pluginId: sanitizeText(source.pluginId),
    title: sanitizeText(source.title) || sanitizeText(source.pluginId),
    featureFlag: sanitizeText(source.featureFlag),
    autoActivate: source.autoActivate === true,
    capabilities: asArray(source.capabilities).map((capability) => normalizeCapabilityDescriptor(capability)),
    init: typeof source.init === "function" ? source.init : null,
    activate: typeof source.activate === "function" ? source.activate : null,
    deactivate: typeof source.deactivate === "function" ? source.deactivate : null,
    dispose: typeof source.dispose === "function" ? source.dispose : null,
    getCommandPacks: typeof source.getCommandPacks === "function" ? source.getCommandPacks : null,
    getPanels: typeof source.getPanels === "function" ? source.getPanels : null,
    getProviders: typeof source.getProviders === "function" ? source.getProviders : null,
    commandPacks: asArray(source.commandPacks),
    panels: asArray(source.panels),
    providers: asArray(source.providers)
  };
}

function validatePluginDescriptor(descriptor) {
  const pluginId = sanitizeText(descriptor?.pluginId);
  if (!pluginId) {
    return "pluginId is required.";
  }

  if (!sanitizeText(descriptor?.title)) {
    return "title is required.";
  }

  const lifecycleHooks = ["init", "activate", "deactivate", "dispose"];
  for (let index = 0; index < lifecycleHooks.length; index += 1) {
    const hook = lifecycleHooks[index];
    const handler = descriptor?.[hook];
    if (handler !== null && handler !== undefined && typeof handler !== "function") {
      return `${hook} must be a function when provided.`;
    }
  }

  const capabilities = asArray(descriptor?.capabilities);
  for (let index = 0; index < capabilities.length; index += 1) {
    const capability = capabilities[index];
    if (!sanitizeText(capability?.capabilityId)) {
      return `capabilities[${index}] capabilityId is required.`;
    }
  }

  return "";
}

function createExtensionLimits(raw = {}) {
  const source = asObject(raw);
  return {
    commandPacksPerPlugin: asPositiveInt(source.commandPacksPerPlugin, 8),
    panelsPerPlugin: asPositiveInt(source.panelsPerPlugin, 12),
    providersPerPlugin: asPositiveInt(source.providersPerPlugin, 20)
  };
}

function normalizeAvailableCapabilities(raw) {
  const source = asArray(raw);
  const map = new Map();
  source.forEach((entry) => {
    if (typeof entry === "string") {
      const capabilityId = sanitizeText(entry);
      if (capabilityId) {
        map.set(capabilityId, {
          capabilityId,
          version: "1.0.0"
        });
      }
      return;
    }

    const descriptor = normalizeCapabilityDescriptor(entry);
    if (descriptor.capabilityId) {
      map.set(descriptor.capabilityId, descriptor);
    }
  });
  return map;
}

function normalizeFeatureFlags(raw) {
  return asObject(raw);
}

function createContextApi(deps, entry, extensionLimits) {
  const extensionState = entry.extensionState;

  function checkLimit(currentSize, maxSize, code, target) {
    if (currentSize >= maxSize) {
      return toResult(
        "failed",
        code,
        `${target} registration limit reached for plugin ${entry.descriptor.pluginId}.`,
        {
          pluginId: entry.descriptor.pluginId,
          limit: maxSize
        }
      );
    }
    return null;
  }

  function wrapCommandPack(pack) {
    const source = asObject(pack);
    const packId = sanitizeText(source.packId);
    const commands = asArray(source.commands);

    return {
      ...source,
      packId,
      commands: commands.map((command) => {
        const commandSource = asObject(command);
        return {
          ...commandSource,
          handler(context, args) {
            if (entry.disposed === true || entry.active !== true) {
              return {
                status: "failed",
                title: `Plugin ${entry.descriptor.pluginId}`,
                lines: [`Plugin ${entry.descriptor.pluginId} is not active.`],
                code: "PLUGIN_INACTIVE"
              };
            }

            const nextContext = {
              ...asObject(context),
              plugin: {
                pluginId: entry.descriptor.pluginId,
                title: entry.descriptor.title,
                providers: Object.fromEntries(extensionState.providers)
              }
            };

            return typeof commandSource.handler === "function"
              ? commandSource.handler(nextContext, args)
              : null;
          }
        };
      })
    };
  }

  return Object.freeze({
    pluginId: entry.descriptor.pluginId,
    title: entry.descriptor.title,
    listCapabilities() {
      return entry.descriptor.capabilities.map((capability) => cloneJson(capability));
    },
    getRuntimeSnapshot() {
      return cloneJson(deps.getRuntimeSnapshot());
    },
    getDiagnosticsSnapshot() {
      return cloneJson(deps.getDiagnosticsSnapshot());
    },
    registerCommandPack(pack) {
      const capacityError = checkLimit(
        extensionState.commandPacks.size,
        extensionLimits.commandPacksPerPlugin,
        "PLUGIN_COMMAND_PACK_LIMIT",
        "Command pack"
      );
      if (capacityError) {
        return capacityError;
      }

      const wrappedPack = wrapCommandPack(pack);
      const packId = sanitizeText(wrappedPack.packId);
      if (!packId) {
        return toResult("failed", "PLUGIN_COMMAND_PACK_INVALID", "packId is required.", {
          pluginId: entry.descriptor.pluginId
        });
      }

      if (extensionState.commandPacks.has(packId)) {
        return toResult("failed", "PLUGIN_COMMAND_PACK_DUPLICATE", `Command pack ${packId} already registered.`, {
          pluginId: entry.descriptor.pluginId,
          packId
        });
      }

      const registration = deps.commandRegistry.registerPack(wrappedPack);
      if (registration.status !== "ready") {
        return toResult("failed", "PLUGIN_COMMAND_PACK_REJECTED", `Command pack ${packId} rejected.`, {
          pluginId: entry.descriptor.pluginId,
          packId,
          registration
        });
      }

      extensionState.commandPacks.add(packId);
      return toResult("ready", "PLUGIN_COMMAND_PACK_REGISTERED", `Command pack ${packId} registered.`, {
        pluginId: entry.descriptor.pluginId,
        packId
      });
    },
    registerPanel(panel) {
      const capacityError = checkLimit(
        extensionState.panels.size,
        extensionLimits.panelsPerPlugin,
        "PLUGIN_PANEL_LIMIT",
        "Panel"
      );
      if (capacityError) {
        return capacityError;
      }

      const panelSource = asObject(panel);
      const panelId = sanitizeText(panelSource.id);
      if (!panelId) {
        return toResult("failed", "PLUGIN_PANEL_INVALID", "Panel id is required.", {
          pluginId: entry.descriptor.pluginId
        });
      }

      if (extensionState.panels.has(panelId)) {
        return toResult("failed", "PLUGIN_PANEL_DUPLICATE", `Panel ${panelId} already registered.`, {
          pluginId: entry.descriptor.pluginId,
          panelId
        });
      }

      const registration = deps.panelRegistry.registerPanel(
        {
          ...panelSource,
          enabled: false
        },
        "plugin"
      );

      if (registration.status !== "registered") {
        return toResult("failed", "PLUGIN_PANEL_REJECTED", `Panel ${panelId} rejected.`, {
          pluginId: entry.descriptor.pluginId,
          panelId,
          registration
        });
      }

      extensionState.panels.set(panelId, panelSource.enabled === true);
      return toResult("ready", "PLUGIN_PANEL_REGISTERED", `Panel ${panelId} registered.`, {
        pluginId: entry.descriptor.pluginId,
        panelId
      });
    },
    registerProvider(provider) {
      const capacityError = checkLimit(
        extensionState.providers.size,
        extensionLimits.providersPerPlugin,
        "PLUGIN_PROVIDER_LIMIT",
        "Provider"
      );
      if (capacityError) {
        return capacityError;
      }

      const providerSource = asObject(provider);
      const providerId = sanitizeText(providerSource.providerId || providerSource.id);
      if (!providerId) {
        return toResult("failed", "PLUGIN_PROVIDER_INVALID", "providerId is required.", {
          pluginId: entry.descriptor.pluginId
        });
      }

      if (extensionState.providers.has(providerId)) {
        return toResult("failed", "PLUGIN_PROVIDER_DUPLICATE", `Provider ${providerId} already registered.`, {
          pluginId: entry.descriptor.pluginId,
          providerId
        });
      }

      extensionState.providers.set(providerId, cloneJson(providerSource));
      return toResult("ready", "PLUGIN_PROVIDER_REGISTERED", `Provider ${providerId} registered.`, {
        pluginId: entry.descriptor.pluginId,
        providerId
      });
    }
  });
}

function runHookSafely(hookName, hook, contextApi, entry) {
  if (typeof hook !== "function") {
    return toResult("ready", "PLUGIN_HOOK_SKIPPED", `${hookName} skipped for ${entry.descriptor.pluginId}.`, {
      pluginId: entry.descriptor.pluginId,
      hook: hookName
    });
  }

  try {
    hook(contextApi);
    return toResult("ready", "PLUGIN_HOOK_OK", `${hookName} completed for ${entry.descriptor.pluginId}.`, {
      pluginId: entry.descriptor.pluginId,
      hook: hookName
    });
  } catch (error) {
    return toResult("failed", "PLUGIN_HOOK_FAILED", `${hookName} failed for ${entry.descriptor.pluginId}.`, {
      pluginId: entry.descriptor.pluginId,
      hook: hookName,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

function checkCapabilities(entry, availableCapabilities) {
  const missing = [];
  entry.descriptor.capabilities
    .filter((capability) => capability.required === true)
    .forEach((capability) => {
      if (!availableCapabilities.has(capability.capabilityId)) {
        missing.push(capability.capabilityId);
      }
    });

  if (missing.length > 0) {
    return toResult("failed", "PLUGIN_CAPABILITIES_MISSING", `Missing required capabilities: ${missing.join(", ")}.`, {
      pluginId: entry.descriptor.pluginId,
      missing
    });
  }

  return toResult("ready", "PLUGIN_CAPABILITIES_OK", "Required capabilities satisfied.", {
    pluginId: entry.descriptor.pluginId
  });
}

function isFeatureEnabled(entry, featureFlags) {
  const flagName = sanitizeText(entry.descriptor.featureFlag);
  if (!flagName) {
    return true;
  }

  if (!Object.prototype.hasOwnProperty.call(featureFlags, flagName)) {
    return false;
  }

  return featureFlags[flagName] === true;
}

export function createDebugPluginRegistry(options = {}) {
  const commandRegistry = options?.commandRegistry;
  const panelRegistry = options?.panelRegistry;

  if (!commandRegistry || typeof commandRegistry.registerPack !== "function") {
    throw new Error("createDebugPluginRegistry requires commandRegistry.registerPack.");
  }

  if (!panelRegistry || typeof panelRegistry.registerPanel !== "function" || typeof panelRegistry.setPanelEnabled !== "function") {
    throw new Error("createDebugPluginRegistry requires panelRegistry register/set APIs.");
  }

  const getRuntimeSnapshot = typeof options?.getRuntimeSnapshot === "function"
    ? options.getRuntimeSnapshot
    : () => ({});
  const getDiagnosticsSnapshot = typeof options?.getDiagnosticsSnapshot === "function"
    ? options.getDiagnosticsSnapshot
    : () => ({});

  const extensionLimits = createExtensionLimits(options?.limits);
  const availableCapabilities = normalizeAvailableCapabilities(options?.availableCapabilities);
  const featureFlags = normalizeFeatureFlags(options?.featureFlags);

  const pluginMap = new Map();

  function createEntry(descriptor) {
    return {
      descriptor,
      initialized: false,
      active: false,
      disposed: false,
      status: "registered",
      contextApi: null,
      extensionState: {
        commandPacks: new Set(),
        panels: new Map(),
        providers: new Map()
      }
    };
  }

  function ensureContext(entry) {
    if (entry.contextApi) {
      return entry.contextApi;
    }

    entry.contextApi = createContextApi(
      {
        commandRegistry,
        panelRegistry,
        getRuntimeSnapshot,
        getDiagnosticsSnapshot
      },
      entry,
      extensionLimits
    );
    return entry.contextApi;
  }

  function loadExtensions(entry) {
    const contextApi = ensureContext(entry);

    const commandPacks = [
      ...asArray(entry.descriptor.commandPacks),
      ...asArray(entry.descriptor.getCommandPacks ? entry.descriptor.getCommandPacks(contextApi) : [])
    ];
    const panels = [
      ...asArray(entry.descriptor.panels),
      ...asArray(entry.descriptor.getPanels ? entry.descriptor.getPanels(contextApi) : [])
    ];
    const providers = [
      ...asArray(entry.descriptor.providers),
      ...asArray(entry.descriptor.getProviders ? entry.descriptor.getProviders(contextApi) : [])
    ];

    for (let index = 0; index < commandPacks.length; index += 1) {
      const report = contextApi.registerCommandPack(commandPacks[index]);
      if (report.status !== "ready") {
        return report;
      }
    }

    for (let index = 0; index < panels.length; index += 1) {
      const report = contextApi.registerPanel(panels[index]);
      if (report.status !== "ready") {
        return report;
      }
    }

    for (let index = 0; index < providers.length; index += 1) {
      const report = contextApi.registerProvider(providers[index]);
      if (report.status !== "ready") {
        return report;
      }
    }

    return toResult("ready", "PLUGIN_EXTENSIONS_READY", `Extensions ready for ${entry.descriptor.pluginId}.`, {
      pluginId: entry.descriptor.pluginId,
      commandPackCount: entry.extensionState.commandPacks.size,
      panelCount: entry.extensionState.panels.size,
      providerCount: entry.extensionState.providers.size
    });
  }

  function initializePlugin(entry) {
    if (entry.initialized === true) {
      return toResult("ready", "PLUGIN_ALREADY_INITIALIZED", `Plugin ${entry.descriptor.pluginId} already initialized.`, {
        pluginId: entry.descriptor.pluginId
      });
    }

    if (!isFeatureEnabled(entry, featureFlags)) {
      entry.status = "disabled";
      return toResult("failed", "PLUGIN_FEATURE_DISABLED", `Feature flag disabled for ${entry.descriptor.pluginId}.`, {
        pluginId: entry.descriptor.pluginId,
        featureFlag: entry.descriptor.featureFlag
      });
    }

    const capabilityReport = checkCapabilities(entry, availableCapabilities);
    if (capabilityReport.status !== "ready") {
      entry.status = "blocked";
      return capabilityReport;
    }

    const contextApi = ensureContext(entry);
    const initReport = runHookSafely("init", entry.descriptor.init, contextApi, entry);
    if (initReport.status !== "ready") {
      entry.status = "failed";
      return initReport;
    }

    const extensionReport = loadExtensions(entry);
    if (extensionReport.status !== "ready") {
      entry.status = "failed";
      return extensionReport;
    }

    entry.initialized = true;
    entry.disposed = false;
    entry.status = "inactive";

    return toResult("ready", "PLUGIN_INITIALIZED", `Plugin ${entry.descriptor.pluginId} initialized.`, {
      pluginId: entry.descriptor.pluginId
    });
  }

  function applyPanelActivation(entry, enabled) {
    entry.extensionState.panels.forEach((defaultEnabled, panelId) => {
      const targetEnabled = enabled === true ? defaultEnabled === true : false;
      panelRegistry.setPanelEnabled(panelId, targetEnabled);
    });
  }

  function activatePlugin(pluginId) {
    const key = sanitizeText(pluginId);
    const entry = pluginMap.get(key);
    if (!entry) {
      return toResult("failed", "PLUGIN_NOT_FOUND", `Plugin ${key || "n/a"} not found.`, { pluginId: key });
    }

    const initReport = initializePlugin(entry);
    if (initReport.status !== "ready") {
      return initReport;
    }

    if (entry.active === true) {
      return toResult("ready", "PLUGIN_ALREADY_ACTIVE", `Plugin ${entry.descriptor.pluginId} already active.`, {
        pluginId: entry.descriptor.pluginId
      });
    }

    const contextApi = ensureContext(entry);
    const activateReport = runHookSafely("activate", entry.descriptor.activate, contextApi, entry);
    if (activateReport.status !== "ready") {
      return activateReport;
    }

    entry.active = true;
    entry.status = "active";
    applyPanelActivation(entry, true);

    return toResult("ready", "PLUGIN_ACTIVATED", `Plugin ${entry.descriptor.pluginId} activated.`, {
      pluginId: entry.descriptor.pluginId
    });
  }

  function deactivatePlugin(pluginId) {
    const key = sanitizeText(pluginId);
    const entry = pluginMap.get(key);
    if (!entry) {
      return toResult("failed", "PLUGIN_NOT_FOUND", `Plugin ${key || "n/a"} not found.`, { pluginId: key });
    }

    if (entry.active !== true) {
      return toResult("ready", "PLUGIN_ALREADY_INACTIVE", `Plugin ${entry.descriptor.pluginId} already inactive.`, {
        pluginId: entry.descriptor.pluginId
      });
    }

    const contextApi = ensureContext(entry);
    const deactivateReport = runHookSafely("deactivate", entry.descriptor.deactivate, contextApi, entry);
    if (deactivateReport.status !== "ready") {
      return deactivateReport;
    }

    entry.active = false;
    entry.status = "inactive";
    applyPanelActivation(entry, false);

    return toResult("ready", "PLUGIN_DEACTIVATED", `Plugin ${entry.descriptor.pluginId} deactivated.`, {
      pluginId: entry.descriptor.pluginId
    });
  }

  function disposePlugin(entry) {
    if (entry.disposed === true) {
      return toResult("ready", "PLUGIN_ALREADY_DISPOSED", `Plugin ${entry.descriptor.pluginId} already disposed.`, {
        pluginId: entry.descriptor.pluginId
      });
    }

    deactivatePlugin(entry.descriptor.pluginId);

    const contextApi = ensureContext(entry);
    const disposeReport = runHookSafely("dispose", entry.descriptor.dispose, contextApi, entry);
    if (disposeReport.status !== "ready") {
      return disposeReport;
    }

    entry.disposed = true;
    entry.status = "disposed";
    return toResult("ready", "PLUGIN_DISPOSED", `Plugin ${entry.descriptor.pluginId} disposed.`, {
      pluginId: entry.descriptor.pluginId
    });
  }

  function registerPlugin(descriptorInput) {
    const descriptor = normalizePluginDescriptor(descriptorInput);
    const validationError = validatePluginDescriptor(descriptor);
    if (validationError) {
      return toResult("failed", "PLUGIN_DESCRIPTOR_INVALID", validationError, {
        pluginId: sanitizeText(descriptorInput?.pluginId)
      });
    }

    if (pluginMap.has(descriptor.pluginId)) {
      return toResult("failed", "PLUGIN_DUPLICATE", `Plugin ${descriptor.pluginId} already registered.`, {
        pluginId: descriptor.pluginId
      });
    }

    const entry = createEntry(descriptor);
    pluginMap.set(descriptor.pluginId, entry);
    return toResult("ready", "PLUGIN_REGISTERED", `Plugin ${descriptor.pluginId} registered.`, {
      pluginId: descriptor.pluginId
    });
  }

  function unregisterPlugin(pluginId) {
    const key = sanitizeText(pluginId);
    const entry = pluginMap.get(key);
    if (!entry) {
      return toResult("failed", "PLUGIN_NOT_FOUND", `Plugin ${key || "n/a"} not found.`, {
        pluginId: key
      });
    }

    const disposeReport = disposePlugin(entry);
    if (disposeReport.status !== "ready") {
      return disposeReport;
    }

    pluginMap.delete(key);
    return toResult("ready", "PLUGIN_UNREGISTERED", `Plugin ${key} unregistered.`, {
      pluginId: key
    });
  }

  function listPlugins() {
    return Array.from(pluginMap.values())
      .map((entry) => ({
        pluginId: entry.descriptor.pluginId,
        title: entry.descriptor.title,
        status: entry.status,
        initialized: entry.initialized,
        active: entry.active,
        disposed: entry.disposed,
        commandPackCount: entry.extensionState.commandPacks.size,
        panelCount: entry.extensionState.panels.size,
        providerCount: entry.extensionState.providers.size,
        capabilities: entry.descriptor.capabilities.map((capability) => cloneJson(capability))
      }))
      .sort((left, right) => left.pluginId.localeCompare(right.pluginId));
  }

  function registerPlugins(descriptors = [], activate = false) {
    const source = asArray(descriptors);
    const reports = [];

    source.forEach((descriptor) => {
      const registration = registerPlugin(descriptor);
      reports.push(registration);
      if (registration.status === "ready" && (activate === true || descriptor?.autoActivate === true)) {
        reports.push(activatePlugin(descriptor.pluginId));
      }
    });

    return reports;
  }

  function dispose() {
    const reports = [];
    Array.from(pluginMap.values()).forEach((entry) => {
      reports.push(disposePlugin(entry));
    });
    pluginMap.clear();
    return reports;
  }

  return {
    registerPlugin,
    unregisterPlugin,
    listPlugins,
    activatePlugin,
    deactivatePlugin,
    registerPlugins,
    dispose,
    getAvailableCapabilities() {
      return Array.from(availableCapabilities.values()).map((capability) => cloneJson(capability));
    },
    getLimits() {
      return cloneJson(extensionLimits);
    }
  };
}
