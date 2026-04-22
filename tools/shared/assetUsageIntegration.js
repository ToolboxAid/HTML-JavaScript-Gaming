import { getToolById } from "../toolRegistry.js";

export const SHARED_ASSET_HANDOFF_KEY = "toolboxaid.shared.assetHandoff";
export const SHARED_PALETTE_HANDOFF_KEY = "toolboxaid.shared.paletteHandoff";

export const SHARED_ACTION_LABELS = Object.freeze({
  browseAssets: "Browse Assets",
  importAssets: "Import Assets",
  browsePalettes: "Browse Palettes",
  managePalettes: "Manage Palettes"
});

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function safeParseJson(raw) {
  if (typeof raw !== "string" || !raw.trim()) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeTimestamp(value) {
  const text = sanitizeText(value);
  return text || new Date().toISOString();
}

function normalizeAssetType(value) {
  const text = sanitizeText(value);
  return text || "other";
}

function normalizeMetadata(value) {
  return isRecord(value) ? { ...value } : {};
}

function normalizeAssetTags(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((entry) => sanitizeText(entry))
    .filter((entry) => Boolean(entry));
}

function normalizePaletteColors(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((entry) => isRecord(entry))
    .map((entry) => ({
      symbol: sanitizeText(entry.symbol),
      hex: sanitizeText(entry.hex),
      name: sanitizeText(entry.name)
    }));
}

export function normalizeSharedAssetHandoff(raw) {
  if (!isRecord(raw)) {
    return null;
  }

  const assetId = sanitizeText(raw.assetId);
  const sourcePath = sanitizeText(raw.sourcePath);
  if (!assetId || !sourcePath) {
    return null;
  }

  return {
    assetId,
    assetType: normalizeAssetType(raw.assetType),
    sourcePath,
    displayName: sanitizeText(raw.displayName) || assetId,
    tags: normalizeAssetTags(raw.tags),
    metadata: normalizeMetadata(raw.metadata),
    sourceToolId: sanitizeText(raw.sourceToolId),
    selectedAt: normalizeTimestamp(raw.selectedAt)
  };
}

export function normalizeSharedPaletteHandoff(raw) {
  if (!isRecord(raw)) {
    return null;
  }

  const paletteId = sanitizeText(raw.paletteId);
  if (!paletteId) {
    return null;
  }

  return {
    paletteId,
    displayName: sanitizeText(raw.displayName) || paletteId,
    colors: normalizePaletteColors(raw.colors),
    metadata: normalizeMetadata(raw.metadata),
    sourceToolId: sanitizeText(raw.sourceToolId),
    selectedAt: normalizeTimestamp(raw.selectedAt)
  };
}

export function getSharedLaunchContext() {
  if (typeof window === "undefined") {
    return { view: "", sourceToolId: "" };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    view: params.get("view") || "",
    sourceToolId: params.get("sourceToolId") || ""
  };
}

export function getToolDisplayName(toolId, fallback = "Current Tool") {
  return getToolById(toolId)?.displayName || fallback;
}

export function getSharedToolHref(targetToolId, pageMode = "tool", options = {}) {
  const entry = getToolById(targetToolId);
  if (!entry) {
    return "#";
  }
  const prefix = pageMode === "landing" ? "./" : "../";
  const params = new URLSearchParams();
  if (options.view) {
    params.set("view", options.view);
  }
  if (options.sourceToolId) {
    params.set("sourceToolId", options.sourceToolId);
  }
  const query = params.toString();
  return `${prefix}${entry.entryPoint}${query ? `?${query}` : ""}`;
}

export function getSharedShellActions(currentToolId, pageMode = "tool") {
  const { view } = getSharedLaunchContext();
  return [
    {
      id: "browse-assets",
      targetToolId: "asset-browser",
      label: SHARED_ACTION_LABELS.browseAssets,
      href: getSharedToolHref("asset-browser", pageMode, { view: "browse", sourceToolId: currentToolId }),
      current: currentToolId === "asset-browser" && view !== "import"
    },
    {
      id: "import-assets",
      targetToolId: "asset-browser",
      label: SHARED_ACTION_LABELS.importAssets,
      href: getSharedToolHref("asset-browser", pageMode, { view: "import", sourceToolId: currentToolId }),
      current: currentToolId === "asset-browser" && view === "import"
    },
    {
      id: "browse-palettes",
      targetToolId: "palette-browser",
      label: SHARED_ACTION_LABELS.browsePalettes,
      href: getSharedToolHref("palette-browser", pageMode, { view: "browse", sourceToolId: currentToolId }),
      current: currentToolId === "palette-browser" && view !== "manage"
    },
    {
      id: "manage-palettes",
      targetToolId: "palette-browser",
      label: SHARED_ACTION_LABELS.managePalettes,
      href: getSharedToolHref("palette-browser", pageMode, { view: "manage", sourceToolId: currentToolId }),
      current: currentToolId === "palette-browser" && view === "manage"
    }
  ];
}

export function createAssetHandoff({
  assetId,
  assetType,
  sourcePath,
  displayName,
  tags = [],
  metadata = {},
  sourceToolId = ""
}) {
  return normalizeSharedAssetHandoff({
    assetId: String(assetId || ""),
    assetType: String(assetType || "other"),
    sourcePath: String(sourcePath || ""),
    displayName: String(displayName || "Unnamed Asset"),
    tags: Array.isArray(tags) ? [...tags] : [],
    metadata: metadata && typeof metadata === "object" ? { ...metadata } : {},
    sourceToolId: String(sourceToolId || ""),
    selectedAt: new Date().toISOString()
  });
}

export function createPaletteHandoff({
  paletteId,
  displayName,
  colors = [],
  metadata = {},
  sourceToolId = ""
}) {
  return normalizeSharedPaletteHandoff({
    paletteId: String(paletteId || ""),
    displayName: String(displayName || "Unnamed Palette"),
    colors: Array.isArray(colors) ? colors.map((entry) => ({ ...entry })) : [],
    metadata: metadata && typeof metadata === "object" ? { ...metadata } : {},
    sourceToolId: String(sourceToolId || ""),
    selectedAt: new Date().toISOString()
  });
}

export function readSharedAssetHandoff() {
  if (typeof window === "undefined") {
    return null;
  }
  return normalizeSharedAssetHandoff(safeParseJson(window.localStorage.getItem(SHARED_ASSET_HANDOFF_KEY)));
}

export function readSharedPaletteHandoff() {
  if (typeof window === "undefined") {
    return null;
  }
  return normalizeSharedPaletteHandoff(safeParseJson(window.localStorage.getItem(SHARED_PALETTE_HANDOFF_KEY)));
}

export function writeSharedAssetHandoff(handoff) {
  if (typeof window === "undefined") {
    return false;
  }
  const normalized = normalizeSharedAssetHandoff(handoff);
  if (!normalized) {
    return false;
  }
  window.localStorage.setItem(SHARED_ASSET_HANDOFF_KEY, JSON.stringify(normalized));
  return true;
}

export function writeSharedPaletteHandoff(handoff) {
  if (typeof window === "undefined") {
    return false;
  }
  const normalized = normalizeSharedPaletteHandoff(handoff);
  if (!normalized) {
    return false;
  }
  window.localStorage.setItem(SHARED_PALETTE_HANDOFF_KEY, JSON.stringify(normalized));
  return true;
}

export function clearSharedAssetHandoff() {
  if (typeof window === "undefined") {
    return false;
  }
  window.localStorage.removeItem(SHARED_ASSET_HANDOFF_KEY);
  return true;
}

export function clearSharedPaletteHandoff() {
  if (typeof window === "undefined") {
    return false;
  }
  window.localStorage.removeItem(SHARED_PALETTE_HANDOFF_KEY);
  return true;
}
