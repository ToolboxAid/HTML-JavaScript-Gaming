const GAME_ASSET_CATALOG_SCHEMA = "html-js-gaming.game-asset-catalog";
const GAME_ASSET_CATALOG_VERSION = 1;
const DEFAULT_GAME_ASSET_CATALOG_FILENAME = "workspace.asset-catalog.json";

const catalogCache = new Map();

function normalizeGameId(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function toObject(value) {
  return value && typeof value === "object" ? value : {};
}

function normalizeCatalogPath(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) {
    return "";
  }
  if (/^(https?:|data:|blob:)/i.test(raw)) {
    return raw;
  }
  const normalized = raw.startsWith("/") ? raw : `/${raw.replace(/^\.?\//, "")}`;
  return normalized.replace(/\\/g, "/");
}

function normalizeCatalogEntry(rawEntry) {
  const entry = toObject(rawEntry);
  const path = normalizeCatalogPath(entry.path || entry.runtimePath || entry.href);
  if (!path) {
    return null;
  }
  return {
    path,
    kind: typeof entry.kind === "string" ? entry.kind.trim() : "",
    source: typeof entry.source === "string" ? entry.source.trim() : ""
  };
}

function normalizeCatalogEntries(rawEntries) {
  const entries = toObject(rawEntries);
  const normalized = {};
  Object.entries(entries).forEach(([assetId, rawEntry]) => {
    const safeAssetId = typeof assetId === "string" ? assetId.trim() : "";
    if (!safeAssetId) {
      return;
    }
    const normalizedEntry = normalizeCatalogEntry(rawEntry);
    if (!normalizedEntry) {
      return;
    }
    normalized[safeAssetId] = normalizedEntry;
  });
  return normalized;
}

function deriveCatalogPathFromGameHref(gameHref) {
  const href = normalizeCatalogPath(gameHref);
  if (!href || !href.includes("/games/")) {
    return "";
  }
  if (href.endsWith("/index.html")) {
    return `${href.slice(0, -"/index.html".length)}/assets/${DEFAULT_GAME_ASSET_CATALOG_FILENAME}`;
  }
  if (href.endsWith("/")) {
    return `${href}assets/${DEFAULT_GAME_ASSET_CATALOG_FILENAME}`;
  }
  return "";
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
  const assetCatalog = normalizeCatalogEntries(runtimeGame.assetCatalog);
  const assetCatalogPath = normalizeCatalogPath(
    runtimeGame.assetCatalogPath || deriveCatalogPathFromGameHref(runtimeGame.href)
  );
  return {
    assetCatalog,
    assetCatalogPath
  };
}

function getCachedCatalogRecord(gameId) {
  return catalogCache.get(gameId) || null;
}

function setCachedCatalogRecord(gameId, record) {
  const current = catalogCache.get(gameId) || {};
  const merged = {
    entries: current.entries || {},
    path: current.path || "",
    status: current.status || "idle",
    promise: null,
    ...record
  };
  catalogCache.set(gameId, merged);
  return merged;
}

function primeCatalogFromRuntime(gameId) {
  const runtimeRecord = readRuntimeGameRecord(gameId);
  if (!runtimeRecord) {
    return null;
  }
  const hasEntries = Object.keys(runtimeRecord.assetCatalog).length > 0;
  if (!hasEntries && !runtimeRecord.assetCatalogPath) {
    return null;
  }
  return setCachedCatalogRecord(gameId, {
    entries: hasEntries ? runtimeRecord.assetCatalog : (getCachedCatalogRecord(gameId)?.entries || {}),
    path: runtimeRecord.assetCatalogPath || getCachedCatalogRecord(gameId)?.path || "",
    status: hasEntries ? "ready" : "idle",
    promise: null
  });
}

export function primeWorkspaceGameAssetCatalog(options = {}) {
  const gameId = normalizeGameId(options.gameId);
  if (!gameId) {
    return null;
  }
  const entries = normalizeCatalogEntries(options.assetCatalog);
  const path = normalizeCatalogPath(options.assetCatalogPath);
  return setCachedCatalogRecord(gameId, {
    entries,
    path,
    status: Object.keys(entries).length > 0 ? "ready" : "idle",
    promise: null
  });
}

function normalizeCatalogPayload(payload) {
  const source = toObject(payload);
  const schema = typeof source.schema === "string" ? source.schema.trim() : "";
  const version = Number(source.version);
  const entries = normalizeCatalogEntries(source.assets || source.entries);
  const isValidSchema = schema === GAME_ASSET_CATALOG_SCHEMA;
  const isValidVersion = Number.isFinite(version) && version === GAME_ASSET_CATALOG_VERSION;
  return {
    schema,
    version,
    entries,
    valid: isValidSchema && isValidVersion
  };
}

export async function preloadWorkspaceGameAssetCatalog(gameIdInput, options = {}) {
  const gameId = normalizeGameId(gameIdInput);
  if (!gameId) {
    return {};
  }

  const primed = primeCatalogFromRuntime(gameId);
  const current = primed || getCachedCatalogRecord(gameId);
  if (current?.status === "ready") {
    return current.entries;
  }
  if (current?.promise) {
    return current.promise;
  }

  const requestedPath = normalizeCatalogPath(options.catalogPath);
  const catalogPath = requestedPath || current?.path || "";
  if (!catalogPath || typeof fetch !== "function") {
    return current?.entries || {};
  }

  const pending = (async () => {
    try {
      const response = await fetch(catalogPath, { cache: "no-store" });
      if (!response.ok) {
        setCachedCatalogRecord(gameId, {
          status: "error",
          promise: null
        });
        return current?.entries || {};
      }
      const payload = await response.json();
      const normalized = normalizeCatalogPayload(payload);
      setCachedCatalogRecord(gameId, {
        entries: normalized.entries,
        path: catalogPath,
        status: normalized.valid ? "ready" : "invalid",
        promise: null
      });
      return normalized.entries;
    } catch {
      setCachedCatalogRecord(gameId, {
        status: "error",
        promise: null
      });
      return current?.entries || {};
    }
  })();

  setCachedCatalogRecord(gameId, {
    path: catalogPath,
    status: "loading",
    promise: pending
  });

  return pending;
}

function getCatalogEntries(gameIdInput) {
  const gameId = normalizeGameId(gameIdInput);
  if (!gameId) {
    return {};
  }
  const primed = primeCatalogFromRuntime(gameId);
  return (primed || getCachedCatalogRecord(gameId))?.entries || {};
}

export function resolveWorkspaceGameAssetPath(gameId, assetId, fallbackPath = "") {
  const safeAssetId = typeof assetId === "string" ? assetId.trim() : "";
  if (!safeAssetId) {
    return normalizeCatalogPath(fallbackPath);
  }

  const entries = getCatalogEntries(gameId);
  const entry = entries[safeAssetId];
  if (entry?.path) {
    return entry.path;
  }
  return normalizeCatalogPath(fallbackPath);
}

export function getWorkspaceGameAssetCatalogPath(gameIdInput) {
  const gameId = normalizeGameId(gameIdInput);
  if (!gameId) {
    return "";
  }
  const primed = primeCatalogFromRuntime(gameId);
  return (primed || getCachedCatalogRecord(gameId))?.path || "";
}
