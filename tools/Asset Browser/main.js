import {
  createAssetHandoff,
  getSharedLaunchContext,
  getToolDisplayName,
  readSharedAssetHandoff,
  writeSharedAssetHandoff
} from "../shared/assetUsageIntegration.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";
import {
  getToolLoadQuerySnapshot,
  getToolLoadRequestedDataPaths,
  summarizeToolLoadData,
  logToolLoadRequest,
  logToolLoadFetch,
  logToolLoadLoaded,
  logToolLoadWarning,
  logToolUiControlReady,
  logToolUiFinalReady,
  logToolUiLifecycle
} from "../shared/toolLoadDiagnostics.js";
import { ACTIVE_PROJECT_STORAGE_KEY } from "../shared/projectManifestContract.js";

const APPROVED_DESTINATIONS = Object.freeze({
  "Vector Assets": "games/<project>/assets/vectors/",
  "Sprite Projects": "games/<project>/assets/sprites/",
  "Tilemaps": "games/<project>/assets/tilemaps/",
  "Parallax Scenes": "games/<project>/assets/parallax/",
  "Palettes": "games/<project>/assets/palettes/",
  "Skins": "games/<project>/assets/skins/",
  "Workflow JSON": "games/<project>/config/"
});

const GAME_ASSET_CATALOG_SCHEMA = "html-js-gaming.game-asset-catalog";
const GAME_ASSET_CATALOG_VERSION = 1;
const GAME_MANIFEST_SCHEMA = "html-js-gaming.game-manifest";
const APPROVED_ASSET_STATUS = Object.freeze({
  success: "approved-assets-success",
  loadedEmpty: "approved-assets-loaded-empty",
  sourceMissing: "approved-assets-source-missing",
  sourceWrongShape: "approved-assets-source-wrong-shape"
});

const refs = {
  categoryFilter: document.getElementById("assetCategoryFilter"),
  searchInput: document.getElementById("assetSearchInput"),
  launchContextText: document.getElementById("launchContextText"),
  countText: document.getElementById("assetCountText"),
  assetList: document.getElementById("assetList"),
  previewTitle: document.getElementById("assetPreviewTitle"),
  previewMeta: document.getElementById("assetPreviewMeta"),
  previewCanvas: document.getElementById("assetPreviewCanvas"),
  useAssetInToolButton: document.getElementById("useAssetInToolButton"),
  previewText: document.getElementById("assetPreviewText"),
  importFileInput: document.getElementById("importFileInput"),
  importCategorySelect: document.getElementById("importCategorySelect"),
  importDestinationSelect: document.getElementById("importDestinationSelect"),
  importNameInput: document.getElementById("importNameInput"),
  validateImportButton: document.getElementById("validateImportButton"),
  downloadImportPlanButton: document.getElementById("downloadImportPlanButton"),
  importStatusText: document.getElementById("importStatusText"),
  importPlanText: document.getElementById("importPlanText")
};

function normalizeSamplePresetPath(pathValue) {
  if (typeof pathValue !== "string") {
    return "";
  }
  const trimmed = pathValue.trim().replace(/\\/g, "/");
  if (!trimmed || trimmed.includes("..")) {
    return "";
  }
  if (trimmed.startsWith("/samples/")) {
    return trimmed;
  }
  if (trimmed.startsWith("./samples/")) {
    return trimmed;
  }
  if (trimmed.startsWith("samples/")) {
    return `./${trimmed}`;
  }
  return "";
}

function buildPresetLoadedStatus(sampleId, samplePresetPath) {
  const normalizedSampleId = typeof sampleId === "string" ? sampleId.trim() : "";
  if (normalizedSampleId) {
    return `Loaded preset from sample ${normalizedSampleId}.`;
  }
  const normalizedPath = typeof samplePresetPath === "string" ? samplePresetPath.trim() : "";
  return normalizedPath ? `Loaded preset from ${normalizedPath}.` : "Loaded preset.";
}

const state = {
  selectedCategory: "All",
  search: "",
  selectedAssetId: "",
  assetCatalog: [],
  catalogLoadInfo: {
    status: APPROVED_ASSET_STATUS.sourceMissing,
    candidateCount: 0,
    declaredCount: 0,
    source: "none",
    checkedSources: []
  }
};

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeLocalPath(pathValue) {
  const text = sanitizeText(pathValue).replace(/\\/g, "/");
  if (!text || text.includes("..")) {
    return "";
  }
  return text;
}

function toTitleCase(value) {
  return String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
    .join(" ");
}

function humanizeAssetId(assetId) {
  const normalized = sanitizeText(assetId)
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ");
  return normalized ? toTitleCase(normalized) : "Shared Asset";
}

function normalizeExplicitCatalogPath(pathValue) {
  const normalized = normalizeLocalPath(pathValue);
  if (!normalized || !normalized.toLowerCase().endsWith(".json")) {
    return "";
  }
  return normalized;
}

function readActiveProjectManifest() {
  try {
    const raw = window.localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function collectCatalogPathCandidates() {
  const candidates = new Set();
  const params = new URLSearchParams(window.location.search);
  const directCatalog = params.get("assetCatalogPath") || "";
  const sharedAsset = readSharedAssetHandoff();
  const manifest = readActiveProjectManifest();
  const manifestAsset = manifest?.sharedReferences?.asset || null;
  const manifestPalette = manifest?.sharedReferences?.palette || null;
  const manifestToolState = manifest?.tools && typeof manifest.tools === "object"
    ? manifest.tools["asset-browser"]
    : null;

  [
    normalizeExplicitCatalogPath(directCatalog),
    normalizeExplicitCatalogPath(sharedAsset?.metadata?.assetCatalogPath || sharedAsset?.assetCatalogPath || ""),
    normalizeExplicitCatalogPath(manifestAsset?.metadata?.assetCatalogPath || manifestAsset?.assetCatalogPath || ""),
    normalizeExplicitCatalogPath(manifestPalette?.metadata?.assetCatalogPath || manifestPalette?.assetCatalogPath || ""),
    normalizeExplicitCatalogPath(manifestToolState?.assetCatalogPath || ""),
    normalizeExplicitCatalogPath(manifestToolState?.catalogPath || ""),
    normalizeExplicitCatalogPath(manifestAsset?.metadata?.sourcePath || manifestAsset?.sourcePath || ""),
    normalizeExplicitCatalogPath(manifestPalette?.metadata?.sourcePath || manifestPalette?.sourcePath || "")
  ].forEach((candidate) => {
    if (candidate) {
      candidates.add(candidate);
    }
  });

  return Array.from(candidates);
}

function mapKindToCategory(kind) {
  const normalizedKind = sanitizeText(kind).toLowerCase();
  switch (normalizedKind) {
    case "vector":
      return "Vector Assets";
    case "sprite":
      return "Sprite Projects";
    case "tilemap":
      return "Tilemaps";
    case "parallax":
    case "background":
      return "Parallax Scenes";
    case "palette":
      return "Palettes";
    case "skin":
      return "Skins";
    default:
      return "Workflow JSON";
  }
}

function normalizeCatalogEntries(rawEntries) {
  const source = rawEntries && typeof rawEntries === "object" ? rawEntries : {};
  const entries = [];
  Object.entries(source).forEach(([assetId, rawEntry]) => {
    const safeAssetId = sanitizeText(assetId);
    const entry = rawEntry && typeof rawEntry === "object" ? rawEntry : null;
    const path = normalizeLocalPath(entry?.path || entry?.runtimePath || entry?.href || "");
    const kind = sanitizeText(entry?.kind || "other").toLowerCase();
    if (!safeAssetId || !path) {
      return;
    }
    entries.push({
      id: safeAssetId,
      label: humanizeAssetId(safeAssetId),
      category: mapKindToCategory(kind),
      kind: kind || "other",
      path
    });
  });
  return entries;
}

function inferAssetKindFromPath(assetPath) {
  const normalizedPath = normalizeLocalPath(assetPath).toLowerCase();
  if (normalizedPath.endsWith(".svg")) {
    return "vector";
  }
  if (normalizedPath.endsWith(".sprite.json") || normalizedPath.endsWith(".png")) {
    return "sprite";
  }
  if (normalizedPath.endsWith(".tilemap.json") || normalizedPath.endsWith(".tileset.json")) {
    return "tilemap";
  }
  if (normalizedPath.endsWith(".parallax.json")) {
    return "parallax";
  }
  if (normalizedPath.endsWith(".palette.json")) {
    return "palette";
  }
  if (normalizedPath.endsWith(".skin.json")) {
    return "skin";
  }
  return "other";
}

function normalizeManifestAssetEntries(rawAssets = {}) {
  const source = rawAssets && typeof rawAssets === "object" ? rawAssets : {};
  const entries = [];
  const seen = new Set();

  const pushEntry = (assetId, rawEntry) => {
    const safeAssetId = sanitizeText(assetId);
    const entry = rawEntry && typeof rawEntry === "object" ? rawEntry : null;
    const path = normalizeLocalPath(entry?.path || entry?.runtimePath || entry?.href || "");
    if (!safeAssetId || !path) {
      return;
    }
    if (seen.has(safeAssetId)) {
      return;
    }
    seen.add(safeAssetId);
    const kind = sanitizeText(entry?.kind || inferAssetKindFromPath(path)).toLowerCase() || "other";
    entries.push({
      id: safeAssetId,
      label: humanizeAssetId(safeAssetId),
      category: mapKindToCategory(kind),
      kind,
      path
    });
  };

  Object.entries(source).forEach(([key, value]) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return;
    }
    if (typeof value.path === "string") {
      pushEntry(key, value);
    }
    Object.entries(value).forEach(([nestedKey, nestedValue]) => {
      if (!nestedValue || typeof nestedValue !== "object" || Array.isArray(nestedValue)) {
        return;
      }
      if (typeof nestedValue.path === "string") {
        pushEntry(nestedKey, nestedValue);
      }
    });
  });

  return entries;
}

function normalizeManifestToolAssetEntries(payload) {
  const manifest = payload && typeof payload === "object" ? payload : {};
  const tools = manifest.tools && typeof manifest.tools === "object" ? manifest.tools : {};
  const assetBrowser = tools["asset-browser"] && typeof tools["asset-browser"] === "object"
    ? tools["asset-browser"]
    : {};
  return normalizeManifestAssetEntries(assetBrowser.assets);
}

async function readCatalogEntriesFromPath(catalogPath) {
  const safeCatalogPath = normalizeLocalPath(catalogPath);
  if (!safeCatalogPath) {
    return {
      status: APPROVED_ASSET_STATUS.sourceMissing,
      source: "none",
      entries: [],
      reason: "Catalog path was missing or invalid."
    };
  }
  try {
    const response = await fetch(safeCatalogPath, { cache: "no-store" });
    if (!response.ok) {
      return {
        status: APPROVED_ASSET_STATUS.sourceMissing,
        source: safeCatalogPath,
        entries: [],
        reason: `Catalog request failed (${response.status}).`
      };
    }
    const payload = await response.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return {
        status: APPROVED_ASSET_STATUS.sourceWrongShape,
        source: safeCatalogPath,
        entries: [],
        reason: "Catalog payload was not an object."
      };
    }
    const schema = sanitizeText(payload?.schema);
    const version = Number(payload?.version);
    let entries = [];
    if (schema !== GAME_ASSET_CATALOG_SCHEMA || version !== GAME_ASSET_CATALOG_VERSION) {
      if (schema === GAME_MANIFEST_SCHEMA) {
        entries = normalizeManifestToolAssetEntries(payload);
      } else {
        entries = normalizeManifestToolAssetEntries(payload);
      }
      return {
        status: entries.length > 0 ? APPROVED_ASSET_STATUS.success : APPROVED_ASSET_STATUS.loadedEmpty,
        source: safeCatalogPath,
        entries,
        reason: entries.length > 0
          ? "Manifest-style approved assets resolved."
          : "Manifest payload loaded but no approved assets were declared."
      };
    }
    entries = normalizeCatalogEntries(payload.assets || payload.entries);
    return {
      status: entries.length > 0 ? APPROVED_ASSET_STATUS.success : APPROVED_ASSET_STATUS.loadedEmpty,
      source: safeCatalogPath,
      entries,
      reason: entries.length > 0
        ? "Approved asset catalog loaded."
        : "Approved asset catalog loaded but empty."
    };
  } catch (error) {
    return {
      status: APPROVED_ASSET_STATUS.sourceWrongShape,
      source: safeCatalogPath,
      entries: [],
      reason: `Catalog parse failed: ${error instanceof Error ? error.message : "unknown error"}.`
    };
  }
}

async function hydrateCatalogLabels(entries) {
  const source = Array.isArray(entries) ? entries : [];
  const labeledEntries = await Promise.all(source.map(async (entry) => {
    if (!entry.path.toLowerCase().endsWith(".json")) {
      return entry;
    }
    try {
      const response = await fetch(entry.path, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("missing");
      }
      const payload = await response.json();
      const payloadName = sanitizeText(payload?.name);
      if (payloadName) {
        return { ...entry, label: payloadName };
      }
      return entry;
    } catch {
      return entry;
    }
  }));
  return labeledEntries;
}

async function loadCatalogEntriesFromContext() {
  const candidates = collectCatalogPathCandidates();
  const checkedSources = [];
  let firstEmpty = null;
  let firstWrongShape = null;
  let firstMissing = null;
  state.catalogLoadInfo = {
    status: APPROVED_ASSET_STATUS.sourceMissing,
    candidateCount: candidates.length,
    declaredCount: 0,
    source: "none",
    checkedSources
  };
  for (const candidate of candidates) {
    const result = await readCatalogEntriesFromPath(candidate);
    checkedSources.push(result.source || candidate);
    if (result.status === APPROVED_ASSET_STATUS.success) {
      state.catalogLoadInfo = {
        status: APPROVED_ASSET_STATUS.success,
        candidateCount: candidates.length,
        declaredCount: result.entries.length,
        source: result.source || candidate,
        checkedSources
      };
      return hydrateCatalogLabels(result.entries);
    }
    if (!firstEmpty && result.status === APPROVED_ASSET_STATUS.loadedEmpty) {
      firstEmpty = result;
    }
    if (!firstWrongShape && result.status === APPROVED_ASSET_STATUS.sourceWrongShape) {
      firstWrongShape = result;
    }
    if (!firstMissing && result.status === APPROVED_ASSET_STATUS.sourceMissing) {
      firstMissing = result;
    }
  }
  const manifest = readActiveProjectManifest();
  const manifestEntries = normalizeManifestToolAssetEntries(manifest);
  const manifestSource = "active-project-manifest.tools.asset-browser.assets";
  checkedSources.push(manifestSource);
  if (manifestEntries.length > 0) {
    state.catalogLoadInfo = {
      status: APPROVED_ASSET_STATUS.success,
      candidateCount: candidates.length,
      declaredCount: manifestEntries.length,
      source: manifestSource,
      checkedSources
    };
    return hydrateCatalogLabels(manifestEntries);
  }
  if (manifest && typeof manifest === "object") {
    state.catalogLoadInfo = {
      status: APPROVED_ASSET_STATUS.loadedEmpty,
      candidateCount: candidates.length,
      declaredCount: 0,
      source: manifestSource,
      checkedSources
    };
    return [];
  }
  if (firstEmpty) {
    state.catalogLoadInfo = {
      status: APPROVED_ASSET_STATUS.loadedEmpty,
      candidateCount: candidates.length,
      declaredCount: 0,
      source: firstEmpty.source || "none",
      checkedSources
    };
    return [];
  }
  if (firstWrongShape) {
    state.catalogLoadInfo = {
      status: APPROVED_ASSET_STATUS.sourceWrongShape,
      candidateCount: candidates.length,
      declaredCount: 0,
      source: firstWrongShape.source || "none",
      checkedSources
    };
    return [];
  }
  if (firstMissing) {
    state.catalogLoadInfo = {
      status: APPROVED_ASSET_STATUS.sourceMissing,
      candidateCount: candidates.length,
      declaredCount: 0,
      source: firstMissing.source || "none",
      checkedSources
    };
    return [];
  }
  return [];
}

function emitAssetBrowserControlReadiness() {
  const searchParams = new URLSearchParams(window.location.search);
  const sampleId = String(searchParams.get("sampleId") || "").trim();
  const approvedCount = Array.isArray(state.assetCatalog) ? state.assetCatalog.length : 0;
  const hasDeclaredSource = Number(state.catalogLoadInfo?.declaredCount || 0) > 0;
  const selectedAsset = getSelectedAsset();
  const hasSelection = Boolean(selectedAsset);
  const hasImportDestination = Boolean(String(refs.importDestinationSelect.value || "").trim());
  const hasImportName = Boolean(normalizeImportName(refs.importNameInput.value || ""));
  const importActionReady = hasSelection && hasImportDestination && hasImportName;
  const approvedAssetsState = String(state.catalogLoadInfo?.status || APPROVED_ASSET_STATUS.sourceMissing);
  const approvedClassification = approvedCount > 0
    ? "success"
    : (approvedAssetsState === APPROVED_ASSET_STATUS.loadedEmpty
      ? "empty"
      : (approvedAssetsState === APPROVED_ASSET_STATUS.sourceWrongShape ? "wrong-shape" : "missing"));

  logToolUiControlReady({
    toolId: "asset-browser",
    sampleId,
    controlId: "approved-asset-list",
    requiredData: "explicit-approved-asset-catalog-or-manifest-assets",
    loaded: approvedCount > 0,
    count: approvedCount,
    value: approvedCount,
    source: state.catalogLoadInfo?.source || "none",
    approvedAssetsState,
    classification: approvedClassification
  });
  logToolUiControlReady({
    toolId: "asset-browser",
    sampleId,
    controlId: "selected-asset-preview",
    requiredData: "selected-approved-asset",
    loaded: hasSelection,
    value: selectedAsset ? selectedAsset.id : "none",
    classification: hasSelection ? "success" : (approvedCount > 0 ? "missing" : "empty")
  });
  logToolUiControlReady({
    toolId: "asset-browser",
    sampleId,
    controlId: "import-action-readiness",
    requiredData: "selected-approved-asset-and-import-destination",
    loaded: importActionReady,
    value: importActionReady ? "ready" : "blocked",
    classification: importActionReady ? "success" : (approvedCount > 0 ? "missing" : "empty")
  });
  logToolUiLifecycle({
    toolId: "asset-browser",
    sampleId,
    phase: "render",
    cause: "asset-browser-control-sync",
    approvedAssetsState,
    classification: "success"
  });
  logToolUiFinalReady({
    toolId: "asset-browser",
    sampleId,
    requiredInputsReady: hasDeclaredSource && approvedCount > 0,
    requiredControlsReady: approvedCount > 0 && hasSelection,
    requiredOutputsReady: Boolean(String(refs.importStatusText.textContent || "").trim()),
    lifecycleStable: true,
    classification: approvedCount > 0 && hasSelection ? "success" : approvedClassification
  });
}

function buildApprovedAssetStatusText(approvedCount, info) {
  const source = String(info?.source || "none");
  const checkedSources = Array.isArray(info?.checkedSources) ? info.checkedSources.filter(Boolean) : [];
  const checkedText = checkedSources.length > 0 ? checkedSources.join(", ") : "none";
  const status = String(info?.status || APPROVED_ASSET_STATUS.sourceMissing);
  if (status === APPROVED_ASSET_STATUS.success) {
    return `${approvedCount} approved asset${approvedCount === 1 ? "" : "s"} | source: ${source}`;
  }
  if (status === APPROVED_ASSET_STATUS.loadedEmpty) {
    return "0 approved assets | source checked and empty."
      + ` Source: ${source}. Checked: ${checkedText}.`;
  }
  if (status === APPROVED_ASSET_STATUS.sourceWrongShape) {
    return "0 approved assets | source loaded with wrong shape."
      + ` Source: ${source}. Checked: ${checkedText}.`;
  }
  return "0 approved assets | source missing."
    + ` Last source: ${source}. Checked: ${checkedText}.`;
}

function buildApprovedAssetEmptyStateText(info) {
  const source = String(info?.source || "none");
  const status = String(info?.status || APPROVED_ASSET_STATUS.sourceMissing);
  if (status === APPROVED_ASSET_STATUS.loadedEmpty) {
    return `No approved assets found. Source loaded and empty: ${source}.`;
  }
  if (status === APPROVED_ASSET_STATUS.sourceWrongShape) {
    return `Approved asset source had unexpected shape: ${source}.`;
  }
  return "No approved asset source was loaded."
    + ` Checked source: ${source}.`;
}

function getCategoryOrder() {
  const categories = new Set(Object.keys(APPROVED_DESTINATIONS));
  state.assetCatalog.forEach((entry) => {
    if (entry?.category) {
      categories.add(entry.category);
    }
  });
  return ["All", ...Array.from(categories)];
}

function extractAssetBrowserPreset(rawPreset) {
  if (!rawPreset || typeof rawPreset !== "object") {
    return null;
  }
  const payload = rawPreset.payload && typeof rawPreset.payload === "object"
    ? rawPreset.payload
    : rawPreset;
  const config = payload.config && typeof payload.config === "object"
    ? payload.config
    : null;

  const direct = payload.assetBrowserPreset;
  if (direct && typeof direct === "object") {
    return direct;
  }
  const configured = config?.assetBrowserPreset;
  if (configured && typeof configured === "object") {
    return configured;
  }
  if (
    typeof payload.selectedAssetId === "string"
    || typeof payload.selectedCategory === "string"
    || typeof payload.search === "string"
  ) {
    return payload;
  }
  return null;
}

function applyAssetBrowserPreset(preset) {
  if (!preset || typeof preset !== "object") {
    return false;
  }
  if (typeof preset.selectedCategory === "string" && getCategoryOrder().includes(preset.selectedCategory)) {
    state.selectedCategory = preset.selectedCategory;
    refs.categoryFilter.value = preset.selectedCategory;
  }
  if (typeof preset.search === "string") {
    state.search = preset.search;
    refs.searchInput.value = preset.search;
  }
  if (typeof preset.selectedAssetId === "string" && state.assetCatalog.some((entry) => entry.id === preset.selectedAssetId)) {
    state.selectedAssetId = preset.selectedAssetId;
  }
  if (typeof preset.importCategory === "string" && APPROVED_DESTINATIONS[preset.importCategory]) {
    refs.importCategorySelect.value = preset.importCategory;
    populateDestinationOptions(preset.importCategory);
  }
  if (typeof preset.importDestination === "string") {
    refs.importDestinationSelect.value = preset.importDestination;
  }
  if (typeof preset.importName === "string") {
    refs.importNameInput.value = preset.importName;
  }
  renderAssetList();
  renderPreview();
  renderImportPlan();
  return true;
}

function resolveInitialSelectedAssetId() {
  const current = sanitizeText(state.selectedAssetId);
  if (current && state.assetCatalog.some((entry) => entry.id === current)) {
    return current;
  }
  const shared = readSharedAssetHandoff();
  const sharedId = sanitizeText(shared?.assetId);
  if (sharedId && state.assetCatalog.some((entry) => entry.id === sharedId)) {
    return sharedId;
  }
  return "";
}

async function hydrateApprovedAssetCatalog() {
  state.assetCatalog = await loadCatalogEntriesFromContext();
  state.selectedAssetId = resolveInitialSelectedAssetId();
  const categories = getCategoryOrder();
  if (!categories.includes(state.selectedCategory)) {
    state.selectedCategory = "All";
  }
}

async function tryLoadPresetFromQuery() {
  const searchParams = new URLSearchParams(window.location.search);
  const samplePresetPath = normalizeSamplePresetPath(searchParams.get("samplePresetPath") || "");
  const launchQuery = getToolLoadQuerySnapshot(searchParams);
  logToolLoadRequest({
    toolId: "asset-browser",
    sampleId: String(searchParams.get("sampleId") || "").trim(),
    samplePresetPath,
    requestedDataPaths: getToolLoadRequestedDataPaths(launchQuery),
    launchQuery
  });
  if (!samplePresetPath) {
    logToolLoadWarning({
      toolId: "asset-browser",
      reason: "samplePresetPath missing",
      launchQuery
    });
    return;
  }
  const sampleId = String(searchParams.get("sampleId") || "").trim();
  try {
    const presetUrl = new URL(samplePresetPath, window.location.href);
    const presetHref = presetUrl.toString();
    logToolLoadFetch({
      toolId: "asset-browser",
      phase: "attempt",
      fetchUrl: presetHref,
      requestedPath: samplePresetPath,
      pathSource: "tool-input:query.samplePresetPath"
    });
    const response = await fetch(presetHref, { cache: "no-store" });
    logToolLoadFetch({
      toolId: "asset-browser",
      phase: "response",
      fetchUrl: presetHref,
      requestedPath: samplePresetPath,
      pathSource: "tool-input:query.samplePresetPath",
      status: response.status,
      ok: response.ok
    });
    if (!response.ok) {
      throw new Error(`Preset request failed (${response.status}).`);
    }
    const rawPreset = await response.json();
    logToolLoadLoaded({
      toolId: "asset-browser",
      sampleId,
      samplePresetPath,
      fetchUrl: presetHref,
      loaded: summarizeToolLoadData(rawPreset)
    });
    const preset = extractAssetBrowserPreset(rawPreset);
    if (!preset || !applyAssetBrowserPreset(preset)) {
      throw new Error("Preset payload did not include Asset Browser preset fields.");
    }
    refs.importStatusText.textContent = buildPresetLoadedStatus(sampleId, samplePresetPath);
  } catch (error) {
    logToolLoadWarning({
      toolId: "asset-browser",
      sampleId,
      samplePresetPath,
      error: error instanceof Error ? error.message : "unknown error"
    });
    refs.importStatusText.textContent = `Preset load failed: ${error instanceof Error ? error.message : "unknown error"}`;
  }
}

function getAssetTypeFromCategory(category) {
  switch (category) {
    case "Vector Assets":
      return "vector";
    case "Sprite Projects":
      return "sprite";
    case "Tilemaps":
      return "tilemap";
    case "Parallax Scenes":
      return "background";
    case "Palettes":
      return "palette";
    case "Skins":
      return "skin";
    default:
      return "other";
  }
}

function applyLaunchContext() {
  const context = getSharedLaunchContext();
  const sourceLabel = context.sourceToolId
    ? getToolDisplayName(context.sourceToolId, context.sourceToolId)
    : "Shared Tools Surface";

  refs.launchContextText.textContent = context.view === "import"
    ? `Import Assets launched from ${sourceLabel}. Generated plans stay non-destructive and point to shared destination folders.`
    : `Browse Assets launched from ${sourceLabel}. Choose a shared asset reference and publish it back to the active tool.`;

  if (context.view === "import") {
    refs.importStatusText.textContent = `Import Assets requested by ${sourceLabel}. Choose a local file to validate a shared import plan.`;
  }
}

function getVisibleAssets() {
  const query = state.search.trim().toLowerCase();
  return state.assetCatalog.filter((entry) => {
    const categoryMatch = state.selectedCategory === "All" || entry.category === state.selectedCategory;
    if (!categoryMatch) {
      return false;
    }
    if (!query) {
      return true;
    }
    return `${entry.label} ${entry.path} ${entry.category}`.toLowerCase().includes(query);
  });
}

function getSelectedAsset() {
  return state.assetCatalog.find((entry) => entry.id === state.selectedAssetId) ?? null;
}

function getPathExtension(assetPath) {
  const cleaned = String(assetPath || "").split("?")[0];
  const match = cleaned.match(/\.([^.\\/]+)$/);
  return match ? match[1].toLowerCase() : "";
}

function populateCategoryControls() {
  refs.categoryFilter.innerHTML = getCategoryOrder()
    .map((label) => `<option value="${label}">${label}</option>`)
    .join("");
  refs.importCategorySelect.innerHTML = Object.keys(APPROVED_DESTINATIONS)
    .map((label) => `<option value="${label}">${label}</option>`)
    .join("");
  refs.categoryFilter.value = state.selectedCategory;
  refs.importCategorySelect.value = "Vector Assets";
}

function populateDestinationOptions(category) {
  const categories = category && APPROVED_DESTINATIONS[category]
    ? [category]
    : Object.keys(APPROVED_DESTINATIONS);
  refs.importDestinationSelect.innerHTML = categories
    .map((name) => `<option value="${APPROVED_DESTINATIONS[name]}">${APPROVED_DESTINATIONS[name]}</option>`)
    .join("");
}

function renderAssetList() {
  const entries = getVisibleAssets();
  refs.countText.textContent = buildApprovedAssetStatusText(entries.length, state.catalogLoadInfo);
  refs.assetList.innerHTML = entries.length > 0
    ? entries.map((entry) => {
      const currentClass = entry.id === state.selectedAssetId ? " is-current" : "";
      return `
      <button type="button" data-asset-id="${entry.id}" class="${currentClass.trim()}">
        <strong>${entry.label}</strong>
        <span>${entry.category}</span>
        <span>${entry.path}</span>
      </button>
    `;
    }).join("")
    : `<p class="asset-browser__empty">${buildApprovedAssetEmptyStateText(state.catalogLoadInfo)}</p>`;

  if (!entries.some((entry) => entry.id === state.selectedAssetId)) {
    state.selectedAssetId = "";
  }
}

async function renderPreview() {
  const selectedAsset = getSelectedAsset();
  if (!selectedAsset) {
    refs.previewTitle.textContent = "Preview";
    refs.previewMeta.textContent = "Select an approved asset from the catalog.";
    refs.previewCanvas.innerHTML = '<p class="asset-browser__empty">No asset selected.</p>';
    refs.previewText.textContent = "Choose a file to inspect metadata and content.";
    return;
  }

  refs.previewTitle.textContent = selectedAsset.label;
  const suggestedDestination = APPROVED_DESTINATIONS[selectedAsset.category] || "games/<project>/assets/";
  refs.previewMeta.textContent = `${selectedAsset.category} | ${selectedAsset.path} | Suggested destination: ${suggestedDestination}`;

  const extension = getPathExtension(selectedAsset.path);
  try {
    if (extension === "svg") {
      refs.previewCanvas.innerHTML = `<img src="${selectedAsset.path}" alt="${selectedAsset.label}" />`;
      const svgText = await fetch(selectedAsset.path).then((response) => response.text());
      refs.previewText.textContent = svgText.slice(0, 2400);
      return;
    }

    const text = await fetch(selectedAsset.path).then((response) => response.text());
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(extension)) {
      refs.previewCanvas.innerHTML = `<img src="${selectedAsset.path}" alt="${selectedAsset.label}" />`;
      refs.previewText.textContent = `${selectedAsset.label}\nBinary preview asset\n${selectedAsset.path}`;
      return;
    }

    refs.previewCanvas.innerHTML = '<p class="asset-browser__empty">Text and metadata preview ready.</p>';
    if (extension === "json") {
      const parsed = JSON.parse(text);
      const keys = Object.keys(parsed);
      refs.previewText.textContent = `${selectedAsset.label}\nTop-level keys: ${keys.join(", ") || "(none)"}\n\n${JSON.stringify(parsed, null, 2).slice(0, 2400)}`;
      return;
    }
    refs.previewText.textContent = text.slice(0, 2400);
  } catch (error) {
    refs.previewCanvas.innerHTML = '<p class="asset-browser__empty">Preview unavailable.</p>';
    refs.previewText.textContent = `Preview failed for ${selectedAsset.path}\n${error instanceof Error ? error.message : String(error)}`;
  }
}

function inferCategoryFromFileName(fileName) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".vector.json") || lower.endsWith(".svg")) {
    return "Vector Assets";
  }
  if (lower.endsWith(".sprite.json") || lower.endsWith(".png")) {
    return "Sprite Projects";
  }
  if (lower.endsWith(".tilemap.json") || lower.endsWith(".tileset.json")) {
    return "Tilemaps";
  }
  if (lower.endsWith(".parallax.json")) {
    return "Parallax Scenes";
  }
  if (lower.endsWith(".palette.json")) {
    return "Palettes";
  }
  if (lower.endsWith(".skin.json")) {
    return "Skins";
  }
  return "Workflow JSON";
}

function normalizeImportName(fileName) {
  const lower = String(fileName || "").trim().toLowerCase();
  return lower.replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function buildImportPlan() {
  const file = refs.importFileInput.files?.[0] ?? null;
  if (!file) {
    return {
      valid: false,
      message: "Choose a local file to generate an import plan."
    };
  }

  const importCategory = refs.importCategorySelect.value || inferCategoryFromFileName(file.name);
  const destinationFolder = refs.importDestinationSelect.value || APPROVED_DESTINATIONS[importCategory];
  const normalizedName = normalizeImportName(refs.importNameInput.value || file.name);
  const validName = /^[a-z0-9][a-z0-9._-]*$/.test(normalizedName);
  const conflicts = state.assetCatalog.filter((entry) => entry.category === importCategory)
    .map((entry) => entry.path.split("/").pop()?.toLowerCase() || "")
    .filter((name) => name === normalizedName);

  const warnings = [];
  if (!validName) {
    warnings.push("Import name must be lowercase and use only a-z, 0-9, dot, underscore, or dash.");
  }
  if (conflicts.length > 0) {
    warnings.push(`A file named ${normalizedName} already exists in the approved ${importCategory} catalog.`);
  }

  const plan = {
    tool: "Asset Browser / Import Hub",
    sourceFileName: file.name,
    sourceFileSize: file.size,
    sourceMimeType: file.type || "application/octet-stream",
    importCategory,
    destinationFolder,
    proposedFileName: normalizedName,
    conflictDetected: conflicts.length > 0,
    nonDestructive: true,
    status: warnings.length === 0 ? "ready" : "needs-attention"
  };

  return {
    valid: warnings.length === 0,
    message: warnings.length === 0
      ? "Import plan is valid. Download the JSON and place the file manually in the approved destination."
      : warnings.join(" "),
    plan
  };
}

function renderImportPlan() {
  const result = buildImportPlan();
  refs.importStatusText.textContent = result.message;
  refs.importPlanText.textContent = result.plan
    ? JSON.stringify(result.plan, null, 2)
    : "Import plan output will appear here.";
}

function downloadImportPlan() {
  const result = buildImportPlan();
  if (!result.plan) {
    refs.importStatusText.textContent = result.message;
    return;
  }
  const payload = JSON.stringify(result.plan, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `${result.plan.proposedFileName || "import-plan"}.import-plan.json`;
  link.click();
  URL.revokeObjectURL(objectUrl);
}

function useSelectedAssetInActiveTool() {
  const selectedAsset = getSelectedAsset();
  const context = getSharedLaunchContext();
  if (!selectedAsset) {
    refs.launchContextText.textContent = "Select an approved asset before publishing a shared handoff.";
    return;
  }

  const handoff = createAssetHandoff({
    assetId: selectedAsset.id,
    assetType: getAssetTypeFromCategory(selectedAsset.category),
    sourcePath: selectedAsset.path,
    displayName: selectedAsset.label,
    tags: [selectedAsset.category],
    metadata: {
      category: selectedAsset.category
    },
    sourceToolId: context.sourceToolId || "asset-browser"
  });
  const stored = writeSharedAssetHandoff(handoff);
  refs.launchContextText.textContent = stored
    ? `Shared asset handoff updated for ${getToolDisplayName(context.sourceToolId, "active tool")}: ${selectedAsset.label}`
    : "Shared asset handoff was not updated because the payload was invalid.";
}

function syncImportFormFromFile() {
  const file = refs.importFileInput.files?.[0] ?? null;
  if (!file) {
    refs.importStatusText.textContent = "No local file selected.";
    refs.importPlanText.textContent = "Import plan output will appear here.";
    return;
  }
  const inferredCategory = inferCategoryFromFileName(file.name);
  refs.importCategorySelect.value = inferredCategory;
  populateDestinationOptions(inferredCategory);
  refs.importNameInput.value = normalizeImportName(file.name);
    renderImportPlan();
    emitAssetBrowserControlReadiness();
  }

function bindEvents() {
  refs.categoryFilter.addEventListener("change", () => {
    state.selectedCategory = refs.categoryFilter.value;
    renderAssetList();
    renderPreview();
    emitAssetBrowserControlReadiness();
  });

  refs.searchInput.addEventListener("input", () => {
    state.search = refs.searchInput.value;
    renderAssetList();
    renderPreview();
    emitAssetBrowserControlReadiness();
  });

  refs.assetList.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("[data-asset-id]") : null;
    if (!(button instanceof HTMLElement)) {
      return;
    }
    state.selectedAssetId = button.dataset.assetId || "";
    renderAssetList();
    renderPreview();
    emitAssetBrowserControlReadiness();
  });

  refs.importFileInput.addEventListener("change", syncImportFormFromFile);
  refs.importCategorySelect.addEventListener("change", () => {
    populateDestinationOptions(refs.importCategorySelect.value);
    renderImportPlan();
    emitAssetBrowserControlReadiness();
  });
  refs.importNameInput.addEventListener("input", () => {
    renderImportPlan();
    emitAssetBrowserControlReadiness();
  });
  refs.validateImportButton.addEventListener("click", () => {
    renderImportPlan();
    emitAssetBrowserControlReadiness();
  });
  refs.downloadImportPlanButton.addEventListener("click", downloadImportPlan);
  refs.useAssetInToolButton.addEventListener("click", useSelectedAssetInActiveTool);
}

async function init() {
  await hydrateApprovedAssetCatalog();
  const approvedAssetsState = String(state.catalogLoadInfo?.status || APPROVED_ASSET_STATUS.sourceMissing);
  const approvedClassification = approvedAssetsState === APPROVED_ASSET_STATUS.loadedEmpty
    ? "empty"
    : (approvedAssetsState === APPROVED_ASSET_STATUS.sourceWrongShape ? "wrong-shape" : "missing");
  if (approvedAssetsState === APPROVED_ASSET_STATUS.success) {
    logToolLoadLoaded({
      toolId: "asset-browser",
      loaded: {
        approvedAssetsState,
        count: state.assetCatalog.length,
        source: state.catalogLoadInfo?.source || "none"
      }
    });
  } else {
    logToolLoadWarning({
      toolId: "asset-browser",
      reason: buildApprovedAssetEmptyStateText(state.catalogLoadInfo),
      approvedAssetsState,
      source: state.catalogLoadInfo?.source || "none",
      classification: approvedClassification
    });
  }
  populateCategoryControls();
  populateDestinationOptions(refs.importCategorySelect.value);
  applyLaunchContext();
  if (state.assetCatalog.length === 0) {
    refs.importStatusText.textContent = buildApprovedAssetEmptyStateText(state.catalogLoadInfo);
  }
  renderAssetList();
  await renderPreview();
  renderImportPlan();
  emitAssetBrowserControlReadiness();
  bindEvents();
}

let initialized = false;

const assetBrowserApi = {
  captureProjectState() {
    return {
      selectedCategory: state.selectedCategory,
      search: state.search,
      selectedAssetId: state.selectedAssetId,
      importCategory: refs.importCategorySelect.value,
      importDestination: refs.importDestinationSelect.value,
      importName: refs.importNameInput.value
    };
  },
  applyProjectState(snapshot) {
    state.selectedCategory = typeof snapshot?.selectedCategory === "string" ? snapshot.selectedCategory : "All";
    state.search = typeof snapshot?.search === "string" ? snapshot.search : "";
    state.selectedAssetId = typeof snapshot?.selectedAssetId === "string" ? snapshot.selectedAssetId : state.selectedAssetId;
    refs.categoryFilter.value = state.selectedCategory;
    refs.searchInput.value = state.search;
    refs.importCategorySelect.value = snapshot?.importCategory || refs.importCategorySelect.value;
    populateDestinationOptions(refs.importCategorySelect.value);
    refs.importDestinationSelect.value = snapshot?.importDestination || refs.importDestinationSelect.value;
    refs.importNameInput.value = typeof snapshot?.importName === "string" ? snapshot.importName : "";
    renderAssetList();
    renderPreview();
    renderImportPlan();
    emitAssetBrowserControlReadiness();
    return true;
  }
};

function bootAssetBrowser() {
  if (!initialized) {
    void init().then(() => tryLoadPresetFromQuery());
    initialized = true;
  }
  window.assetBrowserApp = assetBrowserApi;
  return assetBrowserApi;
}

registerToolBootContract("asset-browser", {
  init: bootAssetBrowser,
  destroy() {
    return true;
  },
  getApi() {
    return window.assetBrowserApp || null;
  }
});

bootAssetBrowser();
