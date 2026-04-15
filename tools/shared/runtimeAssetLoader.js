import AssetRegistry from "../../src/engine/assets/AssetRegistry.js";
import AssetLoaderSystem from "../../src/engine/assets/AssetLoaderSystem.js";
import ImageAssetLoader from "../../src/engine/assets/ImageAssetLoader.js";
import { prepareVectorGeometryRuntimeAsset } from "./vectorGeometryRuntime.js";
import { validatePackageManifest, createRegistryDefinition } from "./runtimeAssetValidationUtils.js";
import { createRuntimeReport, sanitizeRuntimeText } from "./runtimeAssetSharedUtils.js";
import { ensureArray } from "../../src/shared/utils/arrayUtils.js";
import { cloneJson } from "../../src/shared/utils/jsonUtils.js";

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

function toBootstrapData(packageManifest, loadedAssets) {
  const pkg = packageManifest.package;
  return {
    projectId: pkg.projectId,
    startupAssetIds: pkg.roots.map((root) => sanitizeRuntimeText(root.id)),
    assetTable: loadedAssets.reduce((accumulator, entry) => {
      accumulator[entry.id] = entry.asset;
      return accumulator;
    }, {}),
    packageManifest: cloneJson(packageManifest)
  };
}

function finalizeLoadedAsset(asset, loadedAsset) {
  if (sanitizeRuntimeText(asset?.type) !== "vector") {
    return loadedAsset;
  }
  return prepareVectorGeometryRuntimeAsset(loadedAsset, {
    sourcePath: sanitizeRuntimeText(asset?.path),
    assetId: sanitizeRuntimeText(asset?.id)
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
    reports.push(createRuntimeReport("info", "MANIFEST_ACCEPTED", `Accepted package manifest for ${pkg.projectId}.`));
  } catch (error) {
    reports.push(createRuntimeReport("error", "INVALID_PACKAGE_MANIFEST", error instanceof Error ? error.message : "Invalid packaged input."));
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

  reports.push(createRuntimeReport("info", "LOAD_SEQUENCE_START", `Starting deterministic packaged load for ${pkg.assets.length} assets.`));

  for (let index = 0; index < pkg.assets.length; index += 1) {
    const asset = pkg.assets[index];
    const assetId = sanitizeRuntimeText(asset?.id);
    const resolvedSource = assetProvider(asset, manifest);
    if (resolvedSource === undefined || resolvedSource === null || resolvedSource === "") {
      reports.push(createRuntimeReport("error", "MISSING_PACKAGED_ASSET", `Required packaged asset ${assetId} could not be resolved from package input.`));
      return {
        ...createLoaderState("failed", reports, { failedAt: assetId, loadedAssets }),
        bootstrap: null
      };
    }

    registry.register(assetId, createRegistryDefinition(asset, resolvedSource));
    const result = await loaderSystem.loadOne(assetId, registry.get(assetId));
    if (result.status !== "ready") {
      reports.push(createRuntimeReport("error", "ASSET_LOAD_FAILED", `Failed to load packaged asset ${assetId}: ${result.error || "unknown error"}`));
      return {
        ...createLoaderState("failed", reports, { failedAt: assetId, loadedAssets }),
        bootstrap: null
      };
    }
    const finalizedAsset = finalizeLoadedAsset(asset, result.asset);
    if (sanitizeRuntimeText(asset?.type) === "vector") {
      reports.push(createRuntimeReport("info", "VECTOR_RUNTIME_READY", `Prepared vector geometry runtime data for ${assetId}.`));
    }
    loadedAssets.push({
      id: result.id,
      type: result.type,
      asset: finalizedAsset
    });
  }

  reports.push(createRuntimeReport("info", "LOAD_SEQUENCE_READY", `All packaged assets loaded in manifest order for ${pkg.projectId}.`));
  const bootstrap = toBootstrapData(manifest, loadedAssets);
  return {
    ...createLoaderState("ready", reports, { loadedAssets }),
    bootstrap
  };
}

