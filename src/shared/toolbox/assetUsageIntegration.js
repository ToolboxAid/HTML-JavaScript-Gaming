import LocalStorageService from '../../engine/persistence/LocalStorageService.js';
import { sanitizeText } from "../string/strings.js";
import { getToolById } from "../../../www/toolbox/tool-registry-api-client.js";

export const SHARED_ASSET_HANDOFF_KEY = "toolboxaid.shared.assetHandoff";
export const SHARED_PALETTE_HANDOFF_KEY = "toolboxaid.shared.paletteHandoff";
export const SHARED_ASSET_HANDOFF_EVENT = "toolboxaid.shared.assetHandoff.changed";
export const SHARED_PALETTE_HANDOFF_EVENT = "toolboxaid.shared.paletteHandoff.changed";

export const SHARED_ACTION_LABELS = Object.freeze({
  paletteManager: "Palette Manager"
});

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
      key: sanitizeText(entry.key || entry.swatchKey),
      hex: sanitizeText(entry.hex),
      name: sanitizeText(entry.name)
    }));
}

function dispatchHandoffChanged(eventName, detail = {}) {
  if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") {
    return;
  }
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

function isHostedWorkspaceMode() {
  if (typeof window === "undefined") {
    return false;
  }
  const params = new URLSearchParams(window.location.search);
  return params.get("hosted") === "1"
    && Boolean(sanitizeText(params.get("hostToolId")))
    && Boolean(sanitizeText(params.get("hostContextId")));
}

function getSharedLocalStorage() {
  return typeof window === "undefined" ? null : new LocalStorageService();
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
  return [
    {
      id: "palette-manager",
      targetToolId: "palette-manager-v2",
      label: SHARED_ACTION_LABELS.paletteManager,
      href: getSharedToolHref("palette-manager-v2", pageMode, { sourceToolId: currentToolId }),
      current: currentToolId === "palette-manager-v2"
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
  const storage = getSharedLocalStorage();
  if (!storage) {
    return null;
  }
  if (isHostedWorkspaceMode()) {
    return null;
  }
  const normalized = normalizeSharedAssetHandoff(safeParseJson(storage.getItem(SHARED_ASSET_HANDOFF_KEY, null)));
  console.log("[LEGACY_BADGE_WRITE]", {
    source: "readSharedAssetHandoff",
    action: "read-asset-handoff",
    assetId: normalized?.assetId || "",
    assetType: normalized?.assetType || "",
    displayName: normalized?.displayName || "",
    sourcePath: normalized?.sourcePath || "",
    sourceToolId: normalized?.sourceToolId || ""
  });
  return normalized;
}

export function readSharedPaletteHandoff() {
  const storage = getSharedLocalStorage();
  if (!storage) {
    return null;
  }
  if (isHostedWorkspaceMode()) {
    return null;
  }
  const normalized = normalizeSharedPaletteHandoff(safeParseJson(storage.getItem(SHARED_PALETTE_HANDOFF_KEY, null)));
  console.log("[LEGACY_BADGE_WRITE]", {
    source: "readSharedPaletteHandoff",
    action: "read-palette-handoff",
    paletteId: normalized?.paletteId || "",
    displayName: normalized?.displayName || "",
    sourceToolId: normalized?.sourceToolId || ""
  });
  return normalized;
}

export function writeSharedAssetHandoff(handoff) {
  const storage = getSharedLocalStorage();
  if (!storage) {
    return false;
  }
  if (isHostedWorkspaceMode()) {
    return false;
  }
  const normalized = normalizeSharedAssetHandoff(handoff);
  if (!normalized) {
    return false;
  }
  console.log("[LEGACY_BADGE_WRITE]", {
    source: "writeSharedAssetHandoff",
    action: "write-asset-handoff",
    assetId: normalized.assetId,
    assetType: normalized.assetType,
    displayName: normalized.displayName,
    sourcePath: normalized.sourcePath,
    sourceToolId: normalized.sourceToolId
  });
  if (!storage.setItem(SHARED_ASSET_HANDOFF_KEY, JSON.stringify(normalized))) {
    return false;
  }
  dispatchHandoffChanged(SHARED_ASSET_HANDOFF_EVENT, {
    key: SHARED_ASSET_HANDOFF_KEY,
    action: "write",
    handoff: normalized
  });
  return true;
}

export function writeSharedPaletteHandoff(handoff) {
  const storage = getSharedLocalStorage();
  if (!storage) {
    return false;
  }
  if (isHostedWorkspaceMode()) {
    return false;
  }
  const normalized = normalizeSharedPaletteHandoff(handoff);
  if (!normalized) {
    return false;
  }
  console.log("[LEGACY_BADGE_WRITE]", {
    source: "writeSharedPaletteHandoff",
    action: "write-palette-handoff",
    paletteId: normalized.paletteId,
    displayName: normalized.displayName,
    sourceToolId: normalized.sourceToolId
  });
  if (!storage.setItem(SHARED_PALETTE_HANDOFF_KEY, JSON.stringify(normalized))) {
    return false;
  }
  dispatchHandoffChanged(SHARED_PALETTE_HANDOFF_EVENT, {
    key: SHARED_PALETTE_HANDOFF_KEY,
    action: "write",
    handoff: normalized
  });
  return true;
}

export function clearSharedAssetHandoff() {
  const storage = getSharedLocalStorage();
  if (!storage) {
    return false;
  }
  if (isHostedWorkspaceMode()) {
    return false;
  }
  storage.removeItem(SHARED_ASSET_HANDOFF_KEY);
  dispatchHandoffChanged(SHARED_ASSET_HANDOFF_EVENT, {
    key: SHARED_ASSET_HANDOFF_KEY,
    action: "clear"
  });
  return true;
}

export function clearSharedPaletteHandoff() {
  const storage = getSharedLocalStorage();
  if (!storage) {
    return false;
  }
  if (isHostedWorkspaceMode()) {
    return false;
  }
  storage.removeItem(SHARED_PALETTE_HANDOFF_KEY);
  dispatchHandoffChanged(SHARED_PALETTE_HANDOFF_EVENT, {
    key: SHARED_PALETTE_HANDOFF_KEY,
    action: "clear"
  });
  return true;
}
