import { sanitizeRuntimeText } from "./runtimeAssetSharedUtils.js";

export function validatePackageManifest(manifest) {
  const pkg = manifest?.package;
  if (!pkg || typeof pkg !== "object") {
    throw new Error("Invalid packaged input: missing package root.");
  }
  if (!Number.isFinite(pkg.version)) {
    throw new Error("Invalid packaged input: package.version must be numeric.");
  }
  if (!sanitizeRuntimeText(pkg.projectId)) {
    throw new Error("Invalid packaged input: package.projectId is required.");
  }
  if (!Array.isArray(pkg.assets) || pkg.assets.length === 0) {
    throw new Error("Invalid packaged input: package.assets must contain at least one asset.");
  }
  if (!Array.isArray(pkg.dependencies)) {
    throw new Error("Invalid packaged input: package.dependencies must be an array.");
  }
  if (!Array.isArray(pkg.roots) || pkg.roots.length === 0) {
    throw new Error("Invalid packaged input: package.roots must contain at least one startup root.");
  }

  const seenIds = new Set();
  pkg.assets.forEach((asset, index) => {
    const id = sanitizeRuntimeText(asset?.id);
    const type = sanitizeRuntimeText(asset?.type);
    if (!id) {
      throw new Error(`Invalid packaged input: asset at index ${index} is missing id.`);
    }
    if (!type) {
      throw new Error(`Invalid packaged input: asset ${id} is missing type.`);
    }
    if (seenIds.has(id)) {
      throw new Error(`Invalid packaged input: duplicate packaged asset ${id}.`);
    }
    seenIds.add(id);
  });

  pkg.roots.forEach((root, index) => {
    const id = sanitizeRuntimeText(root?.id);
    if (!id || !seenIds.has(id)) {
      throw new Error(`Invalid packaged input: startup root at index ${index} does not resolve to a packaged asset.`);
    }
  });

  pkg.dependencies.forEach((dependency, index) => {
    const from = sanitizeRuntimeText(dependency?.from);
    const to = sanitizeRuntimeText(dependency?.to);
    const type = sanitizeRuntimeText(dependency?.type);
    if (!from || !to || !type) {
      throw new Error(`Invalid packaged input: dependency at index ${index} is incomplete.`);
    }
    if (!seenIds.has(from) || !seenIds.has(to)) {
      throw new Error(`Invalid packaged input: dependency ${from} -> ${to} references a missing packaged asset.`);
    }
  });

  return pkg;
}

export function createRegistryDefinition(asset, source) {
  const type = sanitizeRuntimeText(asset?.type);
  const sourceType = type === "image" ? "image" : "data";
  return {
    id: sanitizeRuntimeText(asset?.id),
    type: sourceType,
    path: sanitizeRuntimeText(asset?.path),
    source
  };
}
