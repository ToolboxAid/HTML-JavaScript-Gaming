import { toObject } from "../../src/shared/object/objects.js";

const GAME_MANIFEST_SCHEMA = "html-js-gaming.game-manifest";

const manifestAssetCache = new Map();

function normalizeGameId(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeSourcePath(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) {
    return "";
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
    return raw;
  }
  const normalized = raw.startsWith("/") ? raw : `/${raw.replace(/^\.?\//, "")}`;
  return normalized.replace(/\\/g, "/");
}

function normalizeAssetsPath(value) {
  return typeof value === "string"
    ? value.trim().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "")
    : "";
}

function normalizeManifestAssetPath(value, assetsPath) {
  const raw = typeof value === "string" ? value.trim().replace(/\\/g, "/") : "";
  if (!raw) {
    return "";
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith("/")) {
    return normalizeSourcePath(raw);
  }

  const baseAssetsPath = normalizeAssetsPath(assetsPath);
  if (!baseAssetsPath) {
    return normalizeSourcePath(raw);
  }
  if (raw.startsWith("old_games/") || raw.startsWith(`${baseAssetsPath}/`)) {
    return normalizeSourcePath(raw);
  }

  const relativePath = raw.startsWith("assets/")
    ? raw.slice("assets/".length)
    : raw.replace(/^\.?\//, "");
  return normalizeSourcePath(`${baseAssetsPath}/${relativePath}`);
}

function normalizeManifestAssetEntry(rawEntry, assetsPath) {
  const entry = toObject(rawEntry);
  const path = normalizeManifestAssetPath(entry.path || entry.runtimePath || entry.href, assetsPath);
  if (!path) {
    return null;
  }
  return {
    path,
    kind: typeof entry.kind === "string" ? entry.kind.trim() : "",
    source: typeof entry.source === "string" ? entry.source.trim() : ""
  };
}

function normalizeManifestAssetEntries(rawEntries, assetsPath) {
  const entries = toObject(rawEntries);
  const normalized = {};
  Object.entries(entries).forEach(([assetId, rawEntry]) => {
    const safeAssetId = typeof assetId === "string" ? assetId.trim() : "";
    if (!safeAssetId) {
      return;
    }
    const normalizedEntry = normalizeManifestAssetEntry(rawEntry, assetsPath);
    if (!normalizedEntry) {
      return;
    }
    normalized[safeAssetId] = normalizedEntry;
  });
  return normalized;
}

function normalizeRuntimeAssetEntry(rawEntry) {
  const entry = toObject(rawEntry);
  const path = normalizeSourcePath(entry.path || entry.runtimePath || entry.href);
  if (!path) {
    return null;
  }
  return {
    path,
    kind: typeof entry.kind === "string" ? entry.kind.trim() : "",
    source: typeof entry.source === "string" ? entry.source.trim() : ""
  };
}

function normalizeRuntimeAssetEntries(rawEntries) {
  const entries = toObject(rawEntries);
  const normalized = {};
  Object.entries(entries).forEach(([assetId, rawEntry]) => {
    const safeAssetId = typeof assetId === "string" ? assetId.trim() : "";
    if (!safeAssetId) {
      return;
    }
    const normalizedEntry = normalizeRuntimeAssetEntry(rawEntry);
    if (!normalizedEntry) {
      return;
    }
    normalized[safeAssetId] = normalizedEntry;
  });
  return normalized;
}

function readRuntimeGameRecord(gameId) {
  if (typeof window === "undefined") {
    return null;
  }
  const runtime = window.__WORKSPACE_GAME_RUNTIME__;
  if (!runtime || typeof runtime !== "object") {
    return null;
  }
  const runtimeGame = runtime.game;
  if (!runtimeGame || typeof runtimeGame !== "object") {
    return null;
  }
  const runtimeGameId = normalizeGameId(runtimeGame.id);
  if (!runtimeGameId || runtimeGameId !== gameId) {
    return null;
  }
  const assets = normalizeRuntimeAssetEntries(runtimeGame.manifestAssets || runtimeGame.assetCatalog);
  const sourcePath = normalizeSourcePath(
    runtimeGame.manifestAssetSourcePath || runtimeGame.assetCatalogPath
  );
  return {
    assets,
    sourcePath
  };
}

function getCachedManifestRecord(gameId) {
  return manifestAssetCache.get(gameId) || null;
}

function setCachedManifestRecord(gameId, record) {
  const current = manifestAssetCache.get(gameId) || {};
  const merged = {
    entries: current.entries || {},
    path: current.path || "",
    status: current.status || "idle",
    promise: null,
    ...record
  };
  manifestAssetCache.set(gameId, merged);
  return merged;
}

function primeAssetsFromRuntime(gameId) {
  const runtimeRecord = readRuntimeGameRecord(gameId);
  if (!runtimeRecord) {
    return null;
  }
  const hasEntries = Object.keys(runtimeRecord.assets).length > 0;
  if (!hasEntries && !runtimeRecord.sourcePath) {
    return null;
  }
  return setCachedManifestRecord(gameId, {
    entries: hasEntries ? runtimeRecord.assets : (getCachedManifestRecord(gameId)?.entries || {}),
    path: runtimeRecord.sourcePath || getCachedManifestRecord(gameId)?.path || "",
    status: hasEntries ? "ready" : "idle",
    promise: null
  });
}

export function primeGameManifestAssets(options = {}) {
  const gameId = normalizeGameId(options.gameId);
  if (!gameId) {
    return null;
  }
  const entries = normalizeRuntimeAssetEntries(options.assets || options.manifestAssets);
  const path = normalizeSourcePath(options.manifestPath || options.sourcePath);
  return setCachedManifestRecord(gameId, {
    entries,
    path,
    status: Object.keys(entries).length > 0 ? "ready" : "idle",
    promise: null
  });
}

function normalizeManifestPayload(payload) {
  const source = toObject(payload);
  const schema = typeof source.schema === "string" ? source.schema.trim() : "";
  const version = Number(source.version);
  const workspaceBlock = toObject(source.workspace || {});
  const tools = toObject(source.tools || workspaceBlock.tools);
  const gameFolder = typeof source.game?.folder === "string" ? source.game.folder.trim() : "";
  const assetsPath = normalizeAssetsPath(workspaceBlock.assetsPath || source.assetsPath || (gameFolder ? `old_games/${gameFolder}/assets` : ""));
  const assetManagerEntries = normalizeManifestAssetEntries(
    tools?.["asset-manager-v2"]?.assets,
    assetsPath
  );
  const isValidSchema = schema === GAME_MANIFEST_SCHEMA;
  const isValidVersion = Number.isFinite(version) && version >= 1;
  return {
    schema,
    version,
    entries: assetManagerEntries,
    valid: isValidSchema && isValidVersion
  };
}

export async function preloadGameManifestAssets(gameIdInput, options = {}) {
  const gameId = normalizeGameId(gameIdInput);
  if (!gameId) {
    return {};
  }

  const primed = primeAssetsFromRuntime(gameId);
  const current = primed || getCachedManifestRecord(gameId);
  if (current?.status === "ready") {
    return current.entries;
  }
  if (current?.promise) {
    return current.promise;
  }

  const requestedPath = normalizeSourcePath(options.manifestPath || options.sourcePath);
  const manifestPath = requestedPath || current?.path || "";
  if (!manifestPath || typeof fetch !== "function") {
    return current?.entries || {};
  }

  const pending = (async () => {
    try {
      const response = await fetch(manifestPath, { cache: "no-store" });
      if (!response.ok) {
        setCachedManifestRecord(gameId, {
          status: "error",
          promise: null
        });
        return current?.entries || {};
      }
      const payload = await response.json();
      const normalized = normalizeManifestPayload(payload);
      setCachedManifestRecord(gameId, {
        entries: normalized.entries,
        path: manifestPath,
        status: normalized.valid ? "ready" : "invalid",
        promise: null
      });
      return normalized.entries;
    } catch {
      setCachedManifestRecord(gameId, {
        status: "error",
        promise: null
      });
      return current?.entries || {};
    }
  })();

  setCachedManifestRecord(gameId, {
    path: manifestPath,
    status: "loading",
    promise: pending
  });

  return pending;
}

function getManifestAssetEntries(gameIdInput) {
  const gameId = normalizeGameId(gameIdInput);
  if (!gameId) {
    return {};
  }
  const primed = primeAssetsFromRuntime(gameId);
  return (primed || getCachedManifestRecord(gameId))?.entries || {};
}

export function resolveGameManifestAssetPath(gameId, assetId) {
  const safeAssetId = typeof assetId === "string" ? assetId.trim() : "";
  if (!safeAssetId) {
    return "";
  }

  const entries = getManifestAssetEntries(gameId);
  const entry = entries[safeAssetId];
  if (entry?.path) {
    return entry.path;
  }
  return "";
}

export function getGameManifestAssetSourcePath(gameIdInput) {
  const gameId = normalizeGameId(gameIdInput);
  if (!gameId) {
    return "";
  }
  const primed = primeAssetsFromRuntime(gameId);
  return (primed || getCachedManifestRecord(gameId))?.path || "";
}
