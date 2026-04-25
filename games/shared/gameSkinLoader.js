import {
  preloadWorkspaceGameAssetCatalog,
  resolveWorkspaceGameAssetPath
} from "/games/shared/workspaceGameAssetCatalog.js";

const SKIN_OVERRIDE_STORAGE_PREFIX = "toolbox.game.skin.override.";
const SKIN_DOCUMENT_KIND = "game-skin";
const SKIN_DOCUMENT_VERSION = 1;

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeGameId(value) {
  return normalizeText(value).toLowerCase();
}

function normalizePath(value) {
  const path = normalizeText(value).replace(/\\/g, "/");
  if (!path || path.includes("..")) {
    return "";
  }
  if (/^(https?:|blob:|data:)/i.test(path)) {
    return path;
  }
  return path.startsWith("/") ? path : `/${path.replace(/^\.?\//, "")}`;
}

function toObject(value) {
  return value && typeof value === "object" ? value : {};
}

function deepClone(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

function deepMerge(baseValue, patchValue) {
  if (Array.isArray(baseValue) || Array.isArray(patchValue)) {
    return Array.isArray(patchValue) ? patchValue.slice() : [];
  }
  const base = toObject(baseValue);
  const patch = toObject(patchValue);
  const merged = { ...base };
  Object.keys(patch).forEach((key) => {
    const baseChild = base[key];
    const patchChild = patch[key];
    if (patchChild && typeof patchChild === "object" && !Array.isArray(patchChild)) {
      merged[key] = deepMerge(baseChild, patchChild);
      return;
    }
    merged[key] = patchChild;
  });
  return merged;
}

function extractSkinObject(rawValue) {
  const raw = toObject(rawValue);
  if (raw.documentKind === SKIN_DOCUMENT_KIND) {
    return raw;
  }
  if (raw.skin && typeof raw.skin === "object") {
    return raw.skin;
  }
  if (raw.payload && typeof raw.payload === "object" && raw.payload.skin && typeof raw.payload.skin === "object") {
    return raw.payload.skin;
  }
  return raw;
}

function normalizeSkinDocument(rawValue, expectedGameId, fallbackSchema) {
  const source = extractSkinObject(rawValue);
  if (!source || typeof source !== "object" || Object.keys(source).length === 0) {
    return null;
  }
  const normalized = deepClone(source) || {};
  normalized.documentKind = SKIN_DOCUMENT_KIND;
  normalized.version = Number.isFinite(Number(normalized.version))
    ? Number(normalized.version)
    : SKIN_DOCUMENT_VERSION;
  normalized.schema = normalizeText(normalized.schema) || fallbackSchema || "games.generic.skin/1";
  normalized.gameId = normalizeText(normalized.gameId) || expectedGameId;
  normalized.name = normalizeText(normalized.name) || `${normalized.gameId || "Game"} Skin`;
  normalized.colors = toObject(normalized.colors);
  normalized.sizing = toObject(normalized.sizing);
  normalized.entities = toObject(normalized.entities);
  return normalized;
}

function getStorageKey(gameId) {
  const safeGameId = normalizeGameId(gameId);
  return safeGameId ? `${SKIN_OVERRIDE_STORAGE_PREFIX}${safeGameId}` : "";
}

export function readGameSkinOverride(gameId, options = {}) {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  const storageKey = getStorageKey(gameId);
  if (!storageKey) {
    return null;
  }
  const fallbackSchema = normalizeText(options.fallbackSchema) || "games.generic.skin/1";
  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) {
      return null;
    }
    const parsed = JSON.parse(rawValue);
    return normalizeSkinDocument(parsed, normalizeText(gameId), fallbackSchema);
  } catch {
    return null;
  }
}

export function writeGameSkinOverride(gameId, skinDocument, options = {}) {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }
  const storageKey = getStorageKey(gameId);
  if (!storageKey) {
    return false;
  }
  const fallbackSchema = normalizeText(options.fallbackSchema) || "games.generic.skin/1";
  const normalized = normalizeSkinDocument(skinDocument, normalizeText(gameId), fallbackSchema);
  if (!normalized) {
    return false;
  }
  window.localStorage.setItem(storageKey, JSON.stringify(normalized, null, 2));
  return true;
}

export function clearGameSkinOverride(gameId) {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }
  const storageKey = getStorageKey(gameId);
  if (!storageKey) {
    return false;
  }
  window.localStorage.removeItem(storageKey);
  return true;
}

async function fetchSkinDocumentFromPath(path, expectedGameId, fallbackSchema) {
  const normalizedPath = normalizePath(path);
  if (!normalizedPath || typeof fetch !== "function") {
    return null;
  }
  try {
    const response = await fetch(normalizedPath, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    const payload = await response.json();
    return normalizeSkinDocument(payload, expectedGameId, fallbackSchema);
  } catch {
    return null;
  }
}

function resolveSkinAssetPath(gameId, fallbackPath) {
  const safeFallbackPath = normalizePath(fallbackPath);
  const primary = resolveWorkspaceGameAssetPath(gameId, "skin.main", safeFallbackPath);
  if (primary) {
    return primary;
  }
  return resolveWorkspaceGameAssetPath(gameId, "skin", safeFallbackPath);
}

export async function loadGameSkin(options = {}) {
  const expectedGameId = normalizeText(options.gameId);
  const fallbackSchema = normalizeText(options.fallbackSchema) || "games.generic.skin/1";
  const fallbackSkin = normalizeSkinDocument(options.fallbackSkin, expectedGameId, fallbackSchema)
    || normalizeSkinDocument({
      gameId: expectedGameId,
      schema: fallbackSchema,
      name: `${expectedGameId || "Game"} Skin`,
      colors: {},
      sizing: {},
      entities: {}
    }, expectedGameId, fallbackSchema);

  const storedSkin = readGameSkinOverride(expectedGameId, { fallbackSchema });
  if (storedSkin) {
    return {
      skin: deepMerge(fallbackSkin, storedSkin),
      source: "local-storage",
      path: ""
    };
  }

  if (expectedGameId) {
    await preloadWorkspaceGameAssetCatalog(expectedGameId);
  }

  const skinPath = resolveSkinAssetPath(expectedGameId, options.defaultSkinPath);
  const loadedSkin = await fetchSkinDocumentFromPath(skinPath, expectedGameId, fallbackSchema);
  if (loadedSkin) {
    return {
      skin: deepMerge(fallbackSkin, loadedSkin),
      source: "skin-file",
      path: skinPath
    };
  }

  return {
    skin: fallbackSkin,
    source: "fallback",
    path: ""
  };
}

