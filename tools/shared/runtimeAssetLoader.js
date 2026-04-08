import AssetRegistry from "../../engine/assets/AssetRegistry.js";
import AssetLoaderSystem from "../../engine/assets/AssetLoaderSystem.js";
import ImageAssetLoader from "../../engine/assets/ImageAssetLoader.js";
import { prepareVectorGeometryRuntimeAsset } from "./vectorGeometryRuntime.js";
import { ensureArray } from "../../src/shared/utils/arrayUtils.js";
import { cloneJson } from "../../src/shared/utils/jsonUtils.js";

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function createReport(level, code, message) {
  return {
    level: sanitizeText(level) || "info",
    code: sanitizeText(code),
    message: sanitizeText(message)
  };
}

function createLoaderState(status, reports, extra = {}) {
  return {
    runtimeLoader: {
      status,
      loadedAssets: ensureArray(extra.loadedAssets),
      failedAt: extra.failedAt ?? null,
      reports
    }
  };
}

function validatePackageManifest(manifest) {
  const pkg = manifest?.package;
  if (!pkg || typeof pkg !== "object") {
    throw new Error("Invalid packaged input: missing package root.");
  }
  if (!Number.isFinite(pkg.version)) {
    throw new Error("Invalid packaged input: package.version must be numeric.");
  }
  if (!sanitizeText(pkg.projectId)) {
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
    const id = sanitizeText(asset?.id);
    const type = sanitizeText(asset?.type);
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
    const id = sanitizeText(root?.id);
    if (!id || !seenIds.has(id)) {
      throw new Error(`Invalid packaged input: startup root at index ${index} does not resolve to a packaged asset.`);
    }
  });

  pkg.dependencies.forEach((dependency, index) => {
    const from = sanitizeText(dependency?.from);
    const to = sanitizeText(dependency?.to);
    const type = sanitizeText(dependency?.type);
    if (!from || !to || !type) {
      throw new Error(`Invalid packaged input: dependency at index ${index} is incomplete.`);
    }
    if (!seenIds.has(from) || !seenIds.has(to)) {
      throw new Error(`Invalid packaged input: dependency ${from} -> ${to} references a missing packaged asset.`);
    }
  });

  return pkg;
}

function createRegistryDefinition(asset, source) {
  const type = sanitizeText(asset?.type);
  const sourceType = type === "image" ? "image" : "data";
  return {
    id: sanitizeText(asset?.id),
    type: sourceType,
    path: sanitizeText(asset?.path),
    source
  };
}

function toBootstrapData(packageManifest, loadedAssets) {
  const pkg = packageManifest.package;
  return {
    projectId: pkg.projectId,
    startupAssetIds: pkg.roots.map((root) => sanitizeText(root.id)),
    assetTable: loadedAssets.reduce((accumulator, entry) => {
      accumulator[entry.id] = entry.asset;
      return accumulator;
    }, {}),
    packageManifest: cloneJson(packageManifest)
  };
}

function finalizeLoadedAsset(asset, loadedAsset) {
  if (sanitizeText(asset?.type) !== "vector") {
    return loadedAsset;
  }
  return prepareVectorGeometryRuntimeAsset(loadedAsset, {
    sourcePath: sanitizeText(asset?.path),
    assetId: sanitizeText(asset?.id)
  });
}

export function summarizeRuntimeAssetLoader(result) {
  const loader = result?.runtimeLoader || {};
  if (loader.status === "ready") {
    return `Runtime loader ready with ${loader.loadedAssets.length} assets.`;
  }
  if (loader.status === "failed") {
    return `Runtime loader failed at ${loader.failedAt || "unknown asset"}.`;
  }
  if (loader.status === "loading") {
    return "Runtime loader is loading.";
  }
  return "Runtime loader is idle.";
}

export async function loadPackagedProjectRuntime(options = {}) {
  const reports = [];
  let manifest;

  try {
    manifest = options.packageManifest && typeof options.packageManifest === "object"
      ? cloneJson(options.packageManifest)
      : null;
    const pkg = validatePackageManifest(manifest);
    reports.push(createReport("info", "MANIFEST_ACCEPTED", `Accepted package manifest for ${pkg.projectId}.`));
  } catch (error) {
    reports.push(createReport("error", "INVALID_PACKAGE_MANIFEST", error instanceof Error ? error.message : "Invalid packaged input."));
    return {
      ...createLoaderState("failed", reports, { failedAt: "manifest" }),
      bootstrap: null
    };
  }

  const pkg = manifest.package;
  const registry = new AssetRegistry();
  const assetProvider = typeof options.resolvePackagedAsset === "function"
    ? options.resolvePackagedAsset
    : (asset) => asset?.path || null;
  const loaderSystem = new AssetLoaderSystem({
    registry,
    imageLoader: options.imageLoader || new ImageAssetLoader(),
    loaders: options.loaders || {}
  });
  const loadedAssets = [];

  reports.push(createReport("info", "LOAD_SEQUENCE_START", `Starting deterministic packaged load for ${pkg.assets.length} assets.`));

  for (let index = 0; index < pkg.assets.length; index += 1) {
    const asset = pkg.assets[index];
    const assetId = sanitizeText(asset?.id);
    const resolvedSource = assetProvider(asset, manifest);
    if (resolvedSource === undefined || resolvedSource === null || resolvedSource === "") {
      reports.push(createReport("error", "MISSING_PACKAGED_ASSET", `Required packaged asset ${assetId} could not be resolved from package input.`));
      return {
        ...createLoaderState("failed", reports, { failedAt: assetId, loadedAssets }),
        bootstrap: null
      };
    }

    registry.register(assetId, createRegistryDefinition(asset, resolvedSource));
    const result = await loaderSystem.loadOne(assetId, registry.get(assetId));
    if (result.status !== "ready") {
      reports.push(createReport("error", "ASSET_LOAD_FAILED", `Failed to load packaged asset ${assetId}: ${result.error || "unknown error"}`));
      return {
        ...createLoaderState("failed", reports, { failedAt: assetId, loadedAssets }),
        bootstrap: null
      };
    }
    const finalizedAsset = finalizeLoadedAsset(asset, result.asset);
    if (sanitizeText(asset?.type) === "vector") {
      reports.push(createReport("info", "VECTOR_RUNTIME_READY", `Prepared vector geometry runtime data for ${assetId}.`));
    }
    loadedAssets.push({
      id: result.id,
      type: result.type,
      asset: finalizedAsset
    });
  }

  reports.push(createReport("info", "LOAD_SEQUENCE_READY", `All packaged assets loaded in manifest order for ${pkg.projectId}.`));
  const bootstrap = toBootstrapData(manifest, loadedAssets);
  return {
    ...createLoaderState("ready", reports, { loadedAssets }),
    bootstrap
  };
}
