/*
Toolbox Aid
David Quesenberry
04/06/2026
createNetworkDebugSurfaceIntegration.js
*/

import { createReadOnlyNetworkProviders } from "../providers/networkDebugProviderRegistry.js";
import { asArray, asBoolean, asObject, sanitizeText, shallowCloneArray } from "../shared/networkDebugUtils.js";

const DEFAULT_NETWORK_DEBUG_CAPABILITIES = Object.freeze([
  Object.freeze({ capabilityId: "debug.overlay.panel", version: "1.0.0", required: true }),
  Object.freeze({ capabilityId: "debug.command-pack", version: "1.0.0", required: true }),
  Object.freeze({ capabilityId: "debug.diagnostics.snapshot", version: "1.0.0", required: true }),
  Object.freeze({ capabilityId: "debug.overlay.provider", version: "1.0.0", required: true })
]);

function cloneCapabilities(capabilities) {
  return asArray(capabilities).map((capability) => ({ ...asObject(capability) }));
}

function clonePanels(panels) {
  return shallowCloneArray(panels);
}

function cloneCommandPacks(commandPacks) {
  return asArray(commandPacks).map((pack) => ({
    ...asObject(pack),
    commands: shallowCloneArray(asObject(pack).commands)
  }));
}

export function createNetworkDebugPluginDefinition(options = {}) {
  const source = asObject(options);
  const pluginId = sanitizeText(source.pluginId) || "network.debug";
  const title = sanitizeText(source.title) || pluginId;
  const featureFlag = sanitizeText(source.featureFlag) || "networkDebug";
  const autoActivate = asBoolean(source.autoActivate, true);

  const providerSource = typeof source.getProviders === "function"
    ? source.getProviders()
    : source.providers;
  const panelSource = typeof source.getPanels === "function"
    ? source.getPanels()
    : source.panels;
  const commandPackSource = typeof source.getCommandPacks === "function"
    ? source.getCommandPacks()
    : source.commandPacks;

  const providers = createReadOnlyNetworkProviders(providerSource);
  const panels = clonePanels(panelSource);
  const commandPacks = cloneCommandPacks(commandPackSource);
  const capabilities = cloneCapabilities(
    asArray(source.capabilities).length > 0
      ? source.capabilities
      : DEFAULT_NETWORK_DEBUG_CAPABILITIES
  );

  return {
    pluginId,
    title,
    featureFlag,
    autoActivate,
    capabilities,
    getProviders() {
      return createReadOnlyNetworkProviders(providers);
    },
    getPanels() {
      return clonePanels(panels);
    },
    getCommandPacks() {
      return cloneCommandPacks(commandPacks);
    }
  };
}
