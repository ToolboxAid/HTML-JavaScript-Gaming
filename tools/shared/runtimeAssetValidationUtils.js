import { trimSafe } from "../../src/shared/utils/stringUtils.js";

export function validatePackageManifest(manifest) {
  const pkg = manifest?.package;
  if (!pkg || typeof pkg !== "object") {
    throw new Error("Invalid packaged input: missing package root.");
  }
  if (!Number.isFinite(pkg.version)) {
    throw new Error("Invalid packaged input: package.version must be numeric.");
  }
  if (!trimSafe(pkg.projectId)) {
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
    const id = trimSafe(asset?.id);
    const type = trimSafe(asset?.type);
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
    const id = trimSafe(root?.id);
    if (!id || !seenIds.has(id)) {
      throw new Error(`Invalid packaged input: startup root at index ${index} does not resolve to a packaged asset.`);
    }
  });

  pkg.dependencies.forEach((dependency, index) => {
    const from = trimSafe(dependency?.from);
    const to = trimSafe(dependency?.to);
    const type = trimSafe(dependency?.type);
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
  const type = trimSafe(asset?.type);
  const sourceType = type === "image" ? "image" : "data";
  return {
    id: trimSafe(asset?.id),
    type: sourceType,
    path: trimSafe(asset?.path),
    source
  };
}
