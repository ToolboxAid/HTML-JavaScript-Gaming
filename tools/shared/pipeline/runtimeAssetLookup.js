import { cloneJson } from "../../../src/shared/utils/jsonUtils.js";
import { safeString } from "../projectSystemValueUtils.js";
import { coordinateGameAssetManifest } from "./gameAssetManifestCoordinator.js";
import { createRuntimeAssetBinding, resolveRuntimeAsset } from "./runtimeAssetBinding.js";
import { validateRuntimeResolvedAsset } from "./runtimeAssetValidation.js";
import { appendAssetError, appendAssetErrors } from "./assetErrorHandling.js";

const RUNTIME_BINDING_PREFIXES = Object.freeze({
  "vector.": "vectors",
  "tilemap.": "tilemaps",
  "parallax.": "parallax",
  "sprite.": "sprites"
});

function toObject(value) {
  return value && typeof value === "object" ? value : {};
}

function toSlug(value, fallback = "asset") {
  const text = safeString(value, fallback)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return text || fallback;
}

export function getRuntimeBindingDomain(assetId) {
  const normalizedId = safeString(assetId, "").toLowerCase();
  const matchedPrefix = Object.keys(RUNTIME_BINDING_PREFIXES)
    .find((prefix) => normalizedId.startsWith(prefix));
  return matchedPrefix ? RUNTIME_BINDING_PREFIXES[matchedPrefix] : "";
}

function normalizeRuntimeRecord(gameId, assetId, source, options) {
  const domain = getRuntimeBindingDomain(assetId);
  if (!domain) {
    return null;
  }

  const sourceObject = toObject(source);
  const runtimePath = safeString(sourceObject.file || sourceObject.path, "");
  if (!runtimePath) {
    return null;
  }

  return {
    domain,
    assetId: safeString(assetId, ""),
    runtimePath,
    toolDataPath: `games/${toSlug(gameId, "game")}/assets/${domain}/data/${toSlug(assetId, `${domain}-asset`)}.tool.json`,
    sourceToolId: safeString(options.sourceToolId, "runtime-asset-lookup")
  };
}

function buildRuntimeRecords(gameId, runtimeAssetSources, options) {
  return Object.entries(toObject(runtimeAssetSources))
    .map(([assetId, source]) => normalizeRuntimeRecord(gameId, assetId, source, options))
    .filter(Boolean);
}

export function createRuntimeManifestAssetLookup(options = {}) {
  const runtimeAssetSources = toObject(options.runtimeAssetSources);
  const gameId = safeString(options.gameId, "game");
  const recordOptions = {
    sourceToolId: safeString(options.sourceToolId, "runtime-asset-lookup")
  };

  const records = Array.isArray(options.records)
    ? options.records.slice()
    : buildRuntimeRecords(gameId, runtimeAssetSources, recordOptions);

  const coordinatedManifest = coordinateGameAssetManifest({
    gameId,
    records
  });
  const binding = createRuntimeAssetBinding(coordinatedManifest.manifest);
  const missingBindingBehavior = options.missingBindingBehavior === "null" ? "null" : "static";
  const errors = [];

  appendAssetErrors(
    errors,
    (binding.issues || []).map((message) => ({
      code: "RUNTIME_BINDING_INVALID",
      stage: "runtime-binding",
      message,
      domain: "",
      assetId: ""
    }))
  );
  appendAssetErrors(
    errors,
    (binding.rejected || []).map((entry) => ({
      code: "RUNTIME_BINDING_REJECTED",
      stage: "runtime-binding",
      message: `Rejected runtime binding for ${safeString(entry.assetId, "unknown")} (${safeString(entry.reason, "unknown-reason")}).`,
      domain: safeString(entry.domain, ""),
      assetId: safeString(entry.assetId, "")
    }))
  );

  function resolvePackagedAsset(asset) {
    const assetId = safeString(asset?.id, "");
    if (!assetId) {
      return null;
    }

    if (safeString(asset?.type, "") === "image") {
      if (typeof options.resolveImageAsset === "function") {
        return options.resolveImageAsset(asset);
      }
      return {
        image: {
          width: 960,
          height: 720,
          src: safeString(asset?.path, "")
        },
        status: "provided-loaded"
      };
    }

    const staticSource = runtimeAssetSources[assetId] ? cloneJson(runtimeAssetSources[assetId]) : null;
    const domain = getRuntimeBindingDomain(assetId);
    if (!domain) {
      return staticSource;
    }

    const runtimeRecord = resolveRuntimeAsset(binding, { domain, assetId });
    if (!runtimeRecord) {
      appendAssetError(errors, {
        code: "RUNTIME_LOOKUP_MISSING_BINDING",
        stage: "runtime-lookup",
        domain,
        assetId,
        message: `Missing runtime binding for ${assetId}.`
      });
      return missingBindingBehavior === "null" ? null : staticSource;
    }

    const mergedSource = staticSource || {};
    mergedSource.file = runtimeRecord.runtimePath;
    if (typeof mergedSource.path === "string") {
      mergedSource.path = runtimeRecord.runtimePath;
    }

    const validation = validateRuntimeResolvedAsset({
      domain,
      assetId,
      runtimePath: runtimeRecord.runtimePath,
      source: mergedSource
    });
    if (!validation.valid) {
      appendAssetErrors(errors, validation.errors);
      return null;
    }

    return mergedSource;
  }

  return {
    binding,
    records,
    gameAssetManifest: coordinatedManifest,
    errors,
    getErrors() {
      return errors.slice();
    },
    getDebugState() {
      return {
        lookup: {
          status: binding.status,
          gameId: safeString(binding.gameId, gameId),
          recordCount: records.length,
          domainCounts: Object.fromEntries(
            Object.entries(binding.domains || {}).map(([domain, entries]) => [domain, Array.isArray(entries) ? entries.length : 0])
          ),
          rejectedCount: Array.isArray(binding.rejected) ? binding.rejected.length : 0,
          errorCount: errors.length
        },
        manifest: cloneJson(coordinatedManifest.manifest),
        errors: errors.slice()
      };
    },
    resolvePackagedAsset
  };
}
