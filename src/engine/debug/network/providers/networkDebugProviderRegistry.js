/*
Toolbox Aid
David Quesenberry
04/06/2026
networkDebugProviderRegistry.js
*/

import { asArray, asBoolean, asObject, sanitizeText } from "../shared/networkDebugUtils.js";

function normalizeProviderDescriptor(descriptor, index) {
  const source = asObject(descriptor);
  const providerId = sanitizeText(source.providerId) || `network.provider.${index + 1}`;
  const title = sanitizeText(source.title) || providerId;
  const sourcePath = sanitizeText(source.sourcePath);

  return {
    providerId,
    title,
    readOnly: asBoolean(source.readOnly, true),
    sourcePath
  };
}

export function createReadOnlyNetworkProviders(descriptors = []) {
  return asArray(descriptors).map((descriptor, index) => {
    const normalized = normalizeProviderDescriptor(descriptor, index);
    return {
      ...normalized,
      readOnly: true
    };
  });
}

export function registerNetworkDebugProviders(registry, descriptors = [], source = "debug.network") {
  if (!registry || typeof registry.registerProvider !== "function") {
    return [];
  }

  const normalizedSource = sanitizeText(source) || "debug.network";
  const providers = createReadOnlyNetworkProviders(descriptors);
  return providers.map((provider) => registry.registerProvider(provider, normalizedSource));
}
