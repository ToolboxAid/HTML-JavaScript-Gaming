/*
Toolbox Aid
David Quesenberry
04/05/2026
registerStandard3dProviders.js
*/

import { createCameraSummaryProvider } from "./cameraSummaryProvider.js";
import { createCollisionSummaryProvider } from "./collisionSummaryProvider.js";
import { createRenderStageSummaryProvider } from "./renderStageSummaryProvider.js";
import { createSceneGraphSummaryProvider } from "./sceneGraphSummaryProvider.js";
import { createTransformSummaryProvider } from "./transformSummaryProvider.js";

export function createStandard3dProviders(options = {}) {
  const adapters = options?.adapters || {};
  const providers = [
    createTransformSummaryProvider(adapters),
    createCameraSummaryProvider(adapters),
    createRenderStageSummaryProvider(adapters),
    createCollisionSummaryProvider(adapters),
    createSceneGraphSummaryProvider(adapters)
  ];

  return {
    providers,
    providerMap: new Map(providers.map((provider) => [provider.providerId, provider]))
  };
}

export function registerStandard3dProviders(registry, options = {}) {
  if (!registry || typeof registry.registerProvider !== "function") {
    return [];
  }

  const source = typeof options?.source === "string" && options.source.trim()
    ? options.source.trim()
    : "standard.3d";

  const { providers } = createStandard3dProviders(options);
  return providers.map((provider) => registry.registerProvider(provider, source));
}
