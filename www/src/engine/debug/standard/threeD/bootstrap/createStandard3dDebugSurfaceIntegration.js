/*
Toolbox Aid
David Quesenberry
04/06/2026
createStandard3dDebugSurfaceIntegration.js
*/

import { createStandard3dPanels } from "../panels/registerStandard3dPanels.js";
import { createStandard3dProviders } from "../providers/registerStandard3dProviders.js";
import { asObject, sanitizeText } from "../shared/threeDDebugUtils.js";

const DEFAULT_3D_DEBUG_CAPABILITIES = Object.freeze([
  Object.freeze({ capabilityId: "debug.overlay.panel", version: "1.0.0", required: true }),
  Object.freeze({ capabilityId: "debug.overlay.provider", version: "1.0.0", required: true })
]);

function cloneCapabilities(capabilities) {
  return Array.isArray(capabilities)
    ? capabilities.map((capability) => ({ ...asObject(capability) }))
    : [];
}

function clonePanels(panels) {
  return Array.isArray(panels)
    ? panels.map((panel) => ({ ...asObject(panel) }))
    : [];
}

function toReadOnlyProviderDescriptors(providers) {
  return providers.map((provider) => {
    const source = asObject(provider);
    return {
      providerId: sanitizeText(source.providerId),
      title: sanitizeText(source.title) || sanitizeText(source.providerId),
      readOnly: true,
      sourcePath: `threeD.${sanitizeText(source.providerId) || "snapshot"}`
    };
  });
}

export function createStandard3dDebugPluginDefinition(options = {}) {
  const source = asObject(options);
  const pluginId = sanitizeText(source.pluginId) || "standard.3d";
  const title = sanitizeText(source.title) || "Standard 3D Debug";
  const featureFlag = sanitizeText(source.featureFlag) || "standard3dDebug";
  const autoActivate = source.autoActivate === true;
  const adapters = asObject(source.adapters);
  const defaultPanelsEnabled = source.panelsEnabled === true;

  return {
    pluginId,
    title,
    featureFlag,
    autoActivate,
    capabilities: cloneCapabilities(
      Array.isArray(source.capabilities) && source.capabilities.length > 0
        ? source.capabilities
        : DEFAULT_3D_DEBUG_CAPABILITIES
    ),
    getProviders() {
      const { providers } = createStandard3dProviders({ adapters });
      return toReadOnlyProviderDescriptors(providers);
    },
    getPanels() {
      const { providerMap } = createStandard3dProviders({ adapters });
      return clonePanels(
        createStandard3dPanels({
          providerMap,
          enabled: defaultPanelsEnabled
        })
      );
    },
    getCommandPacks() {
      return [];
    }
  };
}
