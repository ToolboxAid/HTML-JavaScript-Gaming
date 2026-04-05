import { getToolById } from "../toolRegistry.js";

export const SHARED_ASSET_HANDOFF_KEY = "toolboxaid.shared.assetHandoff";
export const SHARED_PALETTE_HANDOFF_KEY = "toolboxaid.shared.paletteHandoff";

export const SHARED_ACTION_LABELS = Object.freeze({
  browseAssets: "Browse Assets",
  importAssets: "Import Assets",
  browsePalettes: "Browse Palettes",
  managePalettes: "Manage Palettes"
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
      label: SHARED_ACTION_LABELS.browseAssets,
      href: getSharedToolHref("asset-browser", pageMode, { view: "browse", sourceToolId: currentToolId }),
      current: currentToolId === "asset-browser" && view !== "import"
    },
    {
      id: "import-assets",
      label: SHARED_ACTION_LABELS.importAssets,
      href: getSharedToolHref("asset-browser", pageMode, { view: "import", sourceToolId: currentToolId }),
      current: currentToolId === "asset-browser" && view === "import"
    },
    {
      id: "browse-palettes",
      label: SHARED_ACTION_LABELS.browsePalettes,
      href: getSharedToolHref("palette-browser", pageMode, { view: "browse", sourceToolId: currentToolId }),
      current: currentToolId === "palette-browser" && view !== "manage"
    },
    {
      id: "manage-palettes",
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
  return {
    assetId: String(assetId || ""),
    assetType: String(assetType || "other"),
    sourcePath: String(sourcePath || ""),
    displayName: String(displayName || "Unnamed Asset"),
    tags: Array.isArray(tags) ? [...tags] : [],
    metadata: metadata && typeof metadata === "object" ? { ...metadata } : {},
    sourceToolId: String(sourceToolId || ""),
    selectedAt: new Date().toISOString()
  };
}

export function createPaletteHandoff({
  paletteId,
  displayName,
  colors = [],
  metadata = {},
  sourceToolId = ""
}) {
  return {
    paletteId: String(paletteId || ""),
    displayName: String(displayName || "Unnamed Palette"),
    colors: Array.isArray(colors) ? colors.map((entry) => ({ ...entry })) : [],
    metadata: metadata && typeof metadata === "object" ? { ...metadata } : {},
    sourceToolId: String(sourceToolId || ""),
    selectedAt: new Date().toISOString()
  };
}

export function readSharedAssetHandoff() {
  if (typeof window === "undefined") {
    return null;
  }
  return safeParseJson(window.localStorage.getItem(SHARED_ASSET_HANDOFF_KEY));
}

export function readSharedPaletteHandoff() {
  if (typeof window === "undefined") {
    return null;
  }
  return safeParseJson(window.localStorage.getItem(SHARED_PALETTE_HANDOFF_KEY));
}

export function writeSharedAssetHandoff(handoff) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(SHARED_ASSET_HANDOFF_KEY, JSON.stringify(handoff));
}

export function writeSharedPaletteHandoff(handoff) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(SHARED_PALETTE_HANDOFF_KEY, JSON.stringify(handoff));
}
