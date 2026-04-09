import AssetRegistry from "../../src/engine/assets/AssetRegistry.js";
import AssetLoaderSystem from "../../src/engine/assets/AssetLoaderSystem.js";
import ImageAssetLoader from "../../src/engine/assets/ImageAssetLoader.js";
import { cloneJson } from "../../src/shared/utils/jsonUtils.js";
import { validatePackageManifest, createRegistryDefinition } from "./runtimeAssetValidationUtils.js";

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

function collectBootAssetIds(pkg) {
  const adjacency = new Map();
  pkg.dependencies.forEach((dependency) => {
    const from = sanitizeText(dependency?.from);
    const to = sanitizeText(dependency?.to);
    if (!from || !to) {
      return;
    }
    if (!adjacency.has(from)) {
      adjacency.set(from, []);
    }
    adjacency.get(from).push(to);
  });
  adjacency.forEach((targets) => targets.sort((left, right) => left.localeCompare(right)));

  const boot = new Set();
  const visit = (assetId) => {
    if (boot.has(assetId)) {
      return;
    }
    boot.add(assetId);
    const targets = adjacency.get(assetId) || [];
    targets.forEach((target) => visit(target));
  };

  pkg.roots
    .map((root) => sanitizeText(root?.id))
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right))
    .forEach((assetId) => visit(assetId));

  return pkg.assets
    .map((asset) => sanitizeText(asset?.id))
    .filter((assetId) => boot.has(assetId));
}

export function summarizeRuntimeStreaming(result) {
  if (result?.streaming?.status === "ready") {
    return `Runtime streaming ready with ${result.streaming.chunks.length} chunks.`;
  }
  if (result?.streaming?.status === "failed") {
    return `Runtime streaming failed at ${sanitizeText(result.streaming.failedAt) || "unknown"}.`;
  }
  return "Runtime streaming unavailable.";
}

export function buildRuntimeStreamingManifest(options = {}) {
  const reports = [];
  try {
    const manifest = options.packageManifest && typeof options.packageManifest === "object"
      ? cloneJson(options.packageManifest)
      : null;
    const pkg = validatePackageManifest(manifest);
    const chunkSize = Math.max(1, Number.parseInt(options.chunkSize, 10) || 2);
    const bootAssetIds = collectBootAssetIds(pkg);
    const remainder = pkg.assets
      .map((asset) => sanitizeText(asset?.id))
      .filter((assetId) => assetId && !bootAssetIds.includes(assetId));
    const chunks = [
      {
        id: "boot",
        lazy: false,
        assetIds: bootAssetIds
      }
    ];
    for (let index = 0; index < remainder.length; index += chunkSize) {
      chunks.push({
        id: `chunk-${String(chunks.length).padStart(3, "0")}`,
        lazy: true,
        assetIds: remainder.slice(index, index + chunkSize)
      });
    }
    reports.push(createReport("info", "STREAMING_READY", `Streaming manifest created with ${chunks.length} chunks.`));
    return {
      streaming: {
        status: "ready",
        chunks,
        reports,
        packageManifest: {
          ...manifest,
          streaming: {
            version: 1,
            chunks,
            reports: cloneJson(reports)
          }
        }
      }
    };
  } catch (error) {
    reports.push(createReport("error", "INVALID_STREAMING_INPUT", error instanceof Error ? error.message : "Invalid streaming input."));
    return {
      streaming: {
        status: "failed",
        failedAt: "manifest",
        chunks: [],
        reports
      }
    };
  }
}

export async function loadRuntimeStreamingChunks(options = {}) {
  const streamingPlan = options.streamingManifest?.streaming?.chunks
    ? options.streamingManifest
    : buildRuntimeStreamingManifest({ packageManifest: options.packageManifest, chunkSize: options.chunkSize }).streaming?.packageManifest;
  const pkg = streamingPlan?.package;
  const streaming = streamingPlan?.streaming;
  const reports = [];

  try {
    validatePackageManifest(streamingPlan);
    if (!streaming || !Array.isArray(streaming.chunks) || streaming.chunks.length === 0) {
      throw new Error("Streaming manifest is missing chunk definitions.");
    }
  } catch (error) {
    reports.push(createReport("error", "INVALID_STREAMING_MANIFEST", error instanceof Error ? error.message : "Invalid streaming manifest."));
    return {
      streaming: {
        status: "failed",
        failedAt: "manifest",
        loadedAssets: [],
        reports
      }
    };
  }

  const requestedChunkIds = Array.isArray(options.chunkIds) && options.chunkIds.length > 0
    ? options.chunkIds.map((chunkId) => sanitizeText(chunkId)).filter(Boolean)
    : ["boot"];
  const chunkMap = new Map(streaming.chunks.map((chunk) => [sanitizeText(chunk.id), chunk]));
  const registry = new AssetRegistry();
  const loaderSystem = new AssetLoaderSystem({
    registry,
    imageLoader: options.imageLoader || new ImageAssetLoader(),
    loaders: options.loaders || {}
  });
  const assetMap = new Map((pkg.assets || []).map((asset) => [sanitizeText(asset.id), asset]));
  const loadedAssets = [];
  const seenAssetIds = new Set(options.loadedAssetIds || []);
  const resolvePackagedAsset = typeof options.resolvePackagedAsset === "function"
    ? options.resolvePackagedAsset
    : (asset) => asset?.path || null;

  for (let index = 0; index < requestedChunkIds.length; index += 1) {
    const chunkId = requestedChunkIds[index];
    const chunk = chunkMap.get(chunkId);
    if (!chunk) {
      reports.push(createReport("error", "UNKNOWN_STREAM_CHUNK", `Requested stream chunk ${chunkId} does not exist.`));
      return {
        streaming: {
          status: "failed",
          failedAt: chunkId,
          loadedAssets,
          reports
        }
      };
    }

    for (let assetIndex = 0; assetIndex < chunk.assetIds.length; assetIndex += 1) {
      const assetId = sanitizeText(chunk.assetIds[assetIndex]);
      if (!assetId || seenAssetIds.has(assetId)) {
        continue;
      }
      const asset = assetMap.get(assetId);
      if (!asset) {
        reports.push(createReport("error", "MISSING_STREAM_ASSET", `Stream chunk ${chunkId} references missing asset ${assetId}.`));
        return {
          streaming: {
            status: "failed",
            failedAt: assetId,
            loadedAssets,
            reports
          }
        };
      }
      const source = resolvePackagedAsset(asset, streamingPlan);
      if (source === undefined || source === null || source === "") {
        reports.push(createReport("error", "MISSING_STREAM_SOURCE", `Packaged stream asset ${assetId} could not be resolved.`));
        return {
          streaming: {
            status: "failed",
            failedAt: assetId,
            loadedAssets,
            reports
          }
        };
      }
      registry.register(assetId, createRegistryDefinition(asset, source));
      const result = await loaderSystem.loadOne(assetId, registry.get(assetId));
      if (result.status !== "ready") {
        reports.push(createReport("error", "STREAM_ASSET_LOAD_FAILED", `Failed to load streamed asset ${assetId}: ${result.error || "unknown error"}`));
        return {
          streaming: {
            status: "failed",
            failedAt: assetId,
            loadedAssets,
            reports
          }
        };
      }
      seenAssetIds.add(assetId);
      loadedAssets.push({
        id: result.id,
        type: result.type,
        asset: result.asset,
        chunkId
      });
    }
  }

  reports.push(createReport("info", "STREAM_CHUNKS_READY", `Loaded ${loadedAssets.length} streamed asset entries across ${requestedChunkIds.length} chunks.`));
  return {
    streaming: {
      status: "ready",
      loadedAssets,
      chunks: streaming.chunks,
      reports
    }
  };
}
