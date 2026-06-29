import { toObject } from "../../shared/object/objects.js";
import { normalizePathSeparators } from "../../shared/string/strings.js";

function safeText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function hasUrlProtocol(value) {
  return /^[a-z][a-z0-9+.-]*:/i.test(value);
}

function discoverGameIdFromDocument(documentRef) {
  const pathname = normalizePathSeparators(documentRef?.location?.pathname || "");
  if (!pathname) {
    return "";
  }
  const match = pathname.match(/\/archive\/v1-v2\/games\/([^/]+)\//i);
  return match ? safeText(match[1], "") : "";
}

function normalizeManifestPath(value) {
  const normalized = normalizePathSeparators(value);
  if (!normalized) {
    return "";
  }
  if (hasUrlProtocol(normalized) || normalized.startsWith("//")) {
    return normalized;
  }
  return normalized.startsWith("/") ? normalized : `/${normalized.replace(/^\/+/, "")}`;
}

function deriveManifestPathFromGameId(gameId) {
  const safeGameId = safeText(gameId, "");
  if (!safeGameId) {
    return "";
  }
  return `/archive/v1-v2/games/${safeGameId}/game.manifest.json`;
}

function deriveManifestPath(options = {}) {
  const explicit = normalizeManifestPath(options.manifestPath);
  if (explicit) {
    return explicit;
  }

  const gameId = safeText(options.gameId, "") || discoverGameIdFromDocument(options.documentRef || null);
  return deriveManifestPathFromGameId(gameId);
}

function resolveManifestRelativePath(pathValue, manifestPath) {
  const normalized = normalizePathSeparators(pathValue);
  if (!normalized || hasUrlProtocol(normalized) || normalized.startsWith("/") || normalized.startsWith("//")) {
    return normalized;
  }
  const baseManifestPath = normalizeManifestPath(manifestPath);
  if (!baseManifestPath) {
    return normalized;
  }
  const slashIndex = baseManifestPath.lastIndexOf("/");
  const baseFolder = slashIndex >= 0 ? baseManifestPath.slice(0, slashIndex) : "";
  return `${baseFolder}/${normalized.replace(/^\/+/, "")}`;
}

function normalizeAssetEntry(rawEntry, fallbackId = "", manifestPath = "", sourceToolId = "") {
  const entry = toObject(rawEntry);
  const path = resolveManifestRelativePath(entry.path || entry.runtimePath || entry.href, manifestPath);
  if (!path) {
    return null;
  }
  return {
    id: safeText(entry.id, "") || safeText(fallbackId, ""),
    kind: safeText(entry.kind, "").toLowerCase(),
    path,
    role: safeText(entry.role, "").toLowerCase(),
    sourceToolId: safeText(sourceToolId, "").toLowerCase(),
    type: safeText(entry.type, "").toLowerCase()
  };
}

function normalizeColorEntry(rawEntry, fallbackId = "") {
  const entry = toObject(rawEntry);
  const color = toObject(entry.color);
  const hex = safeText(color.hex, "");
  if (!hex) {
    return null;
  }
  return {
    id: safeText(entry.id, "") || safeText(fallbackId, ""),
    hex,
    kind: safeText(entry.kind, "").toLowerCase(),
    name: safeText(color.name, ""),
    path: safeText(entry.path || entry.runtimePath || entry.href, ""),
    role: safeText(entry.role, "").toLowerCase(),
    type: safeText(entry.type, "").toLowerCase()
  };
}

function collectImageEntriesFromManifest(manifestPayload, { manifestPath = "" } = {}) {
  const payload = toObject(manifestPayload);
  const entries = [];

  const isImageEntry = (entry) => {
    if (entry.type === "color" || entry.kind === "hex" || safeText(entry.path, "").startsWith("palette://")) {
      return false;
    }
    return entry.type === "image"
      || entry.kind === "image"
      || entry.role === "background"
      || entry.role === "bezel"
      || entry.role === "preview"
      || safeText(entry.id, "").toLowerCase().includes(".image.");
  };

  const pushEntry = (entry) => {
    if (!entry || !entry.path) {
      return;
    }
    if (!isImageEntry(entry)) {
      return;
    }
    entries.push(entry);
  };

  const assetManagerAssets = toObject(payload?.tools?.["asset-manager-v2"]?.assets);
  Object.entries(assetManagerAssets).forEach(([assetId, rawEntry]) => {
    pushEntry(normalizeAssetEntry(rawEntry, assetId, manifestPath, "asset-manager-v2"));
  });

  return entries;
}

function collectColorEntriesFromManifest(manifestPayload) {
  const payload = toObject(manifestPayload);
  const entries = [];
  const assetManagerAssets = toObject(payload?.tools?.["asset-manager-v2"]?.assets);
  Object.entries(assetManagerAssets).forEach(([assetId, rawEntry]) => {
    const entry = normalizeColorEntry(rawEntry, assetId);
    if (entry?.type === "color") {
      entries.push(entry);
    }
  });
  return entries;
}

function chooseGameBackgroundColor(entries) {
  const normalizedEntries = Array.isArray(entries) ? entries : [];
  return normalizedEntries.find((entry) => entry.id === "assets.color.background.game")
    || normalizedEntries.find((entry) => entry.role === "background" && entry.id.includes(".background.game"))
    || null;
}

function chooseAssetManagerImagePath(entries, semanticRole) {
  const normalizedEntries = Array.isArray(entries) ? entries : [];
  const role = safeText(semanticRole, "").toLowerCase();
  if (!role) {
    return "";
  }
  const asset = normalizedEntries.find((entry) => (
    entry?.sourceToolId === "asset-manager-v2"
    && entry?.type === "image"
    && entry?.role === role
    && safeText(entry?.path, "")
  ));
  return asset?.path || "";
}

const manifestCache = new Map();

async function readManifestPayload(manifestPath, documentRef = null) {
  const normalizedPath = normalizeManifestPath(manifestPath);
  if (!normalizedPath) {
    return null;
  }

  if (manifestCache.has(normalizedPath)) {
    return manifestCache.get(normalizedPath);
  }

  if (typeof fetch !== "function") {
    manifestCache.set(normalizedPath, null);
    return null;
  }

  try {
    const response = await fetch(resolveRuntimeAssetUrl(normalizedPath, documentRef), { cache: "no-store" });
    if (!response.ok) {
      manifestCache.set(normalizedPath, null);
      return null;
    }
    const payload = await response.json();
    const normalizedPayload = payload && typeof payload === "object" && !Array.isArray(payload)
      ? payload
      : null;
    manifestCache.set(normalizedPath, normalizedPayload);
    return normalizedPayload;
  } catch {
    manifestCache.set(normalizedPath, null);
    return null;
  }
}

export function resolveRuntimeAssetUrl(pathValue, documentRef = null) {
  const normalized = normalizePathSeparators(pathValue);
  if (!normalized) {
    return "";
  }

  if (hasUrlProtocol(normalized) || normalized.startsWith("//")) {
    return normalized;
  }

  if (normalized.startsWith("/")) {
    return normalized;
  }

  if (normalized.startsWith("./") || normalized.startsWith("../")) {
    try {
      const baseHref = safeText(documentRef?.location?.href, "http://localhost/");
      return new URL(normalized, baseHref).pathname;
    } catch {
      return `/${normalized.replace(/^\/+/, "")}`;
    }
  }

  return `/${normalized.replace(/^\/+/, "")}`;
}

export function resolveGameImageConventionPaths(options = {}) {
  const gameId = safeText(options.gameId, "") || discoverGameIdFromDocument(options.documentRef || null);
  const manifestPath = deriveManifestPath({
    gameId,
    documentRef: options.documentRef || null,
    manifestPath: options.manifestPath
  });
  return {
    gameId,
    manifestPath,
    backgroundColorAssetId: "",
    backgroundColorHex: "",
    backgroundColorName: "",
    backgroundColorPath: "",
    backgroundPath: "",
    bezelPath: "",
    previewPath: ""
  };
}

export async function resolveManifestChromeAssetPaths(options = {}) {
  const base = resolveGameImageConventionPaths(options);
  const manifestPayload = options.manifestPayload && typeof options.manifestPayload === "object" && !Array.isArray(options.manifestPayload)
    ? options.manifestPayload
    : await readManifestPayload(base.manifestPath, options.documentRef || null);

  if (!manifestPayload) {
    return {
      ...base,
      manifestPayload: null
    };
  }

  const imageEntries = collectImageEntriesFromManifest(manifestPayload, { manifestPath: base.manifestPath });
  const backgroundColor = chooseGameBackgroundColor(collectColorEntriesFromManifest(manifestPayload));
  return {
    ...base,
    manifestPayload,
    backgroundColorAssetId: backgroundColor?.id || "",
    backgroundColorHex: backgroundColor?.hex || "",
    backgroundColorName: backgroundColor?.name || "",
    backgroundColorPath: backgroundColor?.path || "",
    backgroundPath: chooseAssetManagerImagePath(imageEntries, "background"),
    bezelPath: chooseAssetManagerImagePath(imageEntries, "bezel"),
    previewPath: chooseAssetManagerImagePath(imageEntries, "preview")
  };
}

function resolveSiblingPath(pathValue, fileName) {
  const normalizedPath = normalizePathSeparators(pathValue);
  const normalizedName = safeText(fileName, "");
  if (!normalizedPath || !normalizedName) {
    return "";
  }

  const slashIndex = normalizedPath.lastIndexOf("/");
  if (slashIndex < 0) {
    return normalizedName;
  }

  return `${normalizedPath.slice(0, slashIndex + 1)}${normalizedName}`;
}

export function resolveBezelStretchOverridePath(options = {}) {
  const manifestPath = deriveManifestPath(options);
  if (manifestPath) {
    return normalizeManifestPath(manifestPath);
  }

  const fileName = safeText(options.fileName, "bezel.stretch.override.json");
  const explicitBezelPath = safeText(options.bezelPath, "");
  if (explicitBezelPath) {
    return resolveSiblingPath(explicitBezelPath, fileName);
  }
  return "";
}
