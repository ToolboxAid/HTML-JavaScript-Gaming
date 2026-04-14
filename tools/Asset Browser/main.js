import {
  createAssetHandoff,
  getSharedLaunchContext,
  getToolDisplayName,
  writeSharedAssetHandoff
} from "../shared/assetUsageIntegration.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";

const APPROVED_DESTINATIONS = Object.freeze({
  "Vector Assets": "games/<project>/assets/vectors/",
  "Sprite Projects": "games/<project>/assets/sprites/",
  "Tilemaps": "games/<project>/assets/tilemaps/",
  "Parallax Scenes": "games/<project>/assets/parallax/",
  "Palettes": "games/<project>/assets/palettes/",
  "Workflow JSON": "games/<project>/config/"
});

const ASSET_CATALOG = Object.freeze([
  {
    id: "asset-vector-player",
    label: "Asteroids Ship Vector",
    category: "Vector Assets",
    path: "../../games/Asteroids/assets/vectors/asteroids-ship.vector.json"
  },
  {
    id: "asset-vector-title",
    label: "Asteroids Title Vector",
    category: "Vector Assets",
    path: "../../games/Asteroids/assets/vectors/asteroids-title.vector.json"
  },
  {
    id: "asset-sprite-demo",
    label: "Asteroids Sprite Project",
    category: "Sprite Projects",
    path: "../../games/Asteroids/assets/sprites/asteroids-demo.sprite.json"
  },
  {
    id: "asset-tilemap-template",
    label: "Vector Arcade Template Tilemap",
    category: "Tilemaps",
    path: "../../games/vector-arcade-sample/assets/data/tilemaps/template-arena.tilemap.json"
  },
  {
    id: "asset-parallax-template",
    label: "Template Backdrop Parallax",
    category: "Parallax Scenes",
    path: "../../games/vector-arcade-sample/assets/data/parallax/template-backdrop.parallax.json"
  },
  {
    id: "asset-parallax-svg",
    label: "Template Backdrop SVG",
    category: "Parallax Scenes",
    path: "../../games/vector-arcade-sample/assets/data/parallax/template-backdrop.svg"
  },
  {
    id: "asset-palette-primary",
    label: "Vector Native Primary Palette",
    category: "Palettes",
    path: "../../games/vector-arcade-sample/assets/data/palettes/vector-native-primary.palette.json"
  },
  {
    id: "asset-project-config",
    label: "Vector Arcade Sample Project Config",
    category: "Workflow JSON",
    path: "../../games/vector-arcade-sample/config/sample.project.json"
  }
]);

const CATEGORY_ORDER = ["All", ...Object.keys(APPROVED_DESTINATIONS)];

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

const state = {
  selectedCategory: "All",
  search: "",
  selectedAssetId: ASSET_CATALOG[0]?.id ?? ""
};

function getAssetTypeFromCategory(category) {
  switch (category) {
    case "Vector Assets":
      return "vector";
    case "Sprite Projects":
      return "sprite";
    case "Tilemaps":
      return "tileset";
    case "Parallax Scenes":
      return "background";
    case "Palettes":
      return "palette";
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
  return ASSET_CATALOG.filter((entry) => {
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
  return ASSET_CATALOG.find((entry) => entry.id === state.selectedAssetId) ?? null;
}

function getPathExtension(assetPath) {
  const cleaned = String(assetPath || "").split("?")[0];
  const match = cleaned.match(/\.([^.\\/]+)$/);
  return match ? match[1].toLowerCase() : "";
}

function populateCategoryControls() {
  refs.categoryFilter.innerHTML = CATEGORY_ORDER
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
  refs.countText.textContent = `${entries.length} approved asset${entries.length === 1 ? "" : "s"}`;
  refs.assetList.innerHTML = entries.map((entry) => {
    const currentClass = entry.id === state.selectedAssetId ? " is-current" : "";
    return `
      <button type="button" data-asset-id="${entry.id}" class="${currentClass.trim()}">
        <strong>${entry.label}</strong>
        <span>${entry.category}</span>
        <span>${entry.path}</span>
      </button>
    `;
  }).join("");

  if (!entries.some((entry) => entry.id === state.selectedAssetId)) {
    state.selectedAssetId = entries[0]?.id ?? "";
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
  refs.previewMeta.textContent = `${selectedAsset.category} | ${selectedAsset.path} | Suggested destination: ${APPROVED_DESTINATIONS[selectedAsset.category]}`;

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
  const conflicts = ASSET_CATALOG.filter((entry) => entry.category === importCategory)
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
  writeSharedAssetHandoff(handoff);
  refs.launchContextText.textContent = `Shared asset handoff updated for ${getToolDisplayName(context.sourceToolId, "active tool")}: ${selectedAsset.label}`;
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
}

function bindEvents() {
  refs.categoryFilter.addEventListener("change", () => {
    state.selectedCategory = refs.categoryFilter.value;
    renderAssetList();
    renderPreview();
  });

  refs.searchInput.addEventListener("input", () => {
    state.search = refs.searchInput.value;
    renderAssetList();
    renderPreview();
  });

  refs.assetList.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("[data-asset-id]") : null;
    if (!(button instanceof HTMLElement)) {
      return;
    }
    state.selectedAssetId = button.dataset.assetId || "";
    renderAssetList();
    renderPreview();
  });

  refs.importFileInput.addEventListener("change", syncImportFormFromFile);
  refs.importCategorySelect.addEventListener("change", () => {
    populateDestinationOptions(refs.importCategorySelect.value);
    renderImportPlan();
  });
  refs.importNameInput.addEventListener("input", renderImportPlan);
  refs.validateImportButton.addEventListener("click", renderImportPlan);
  refs.downloadImportPlanButton.addEventListener("click", downloadImportPlan);
  refs.useAssetInToolButton.addEventListener("click", useSelectedAssetInActiveTool);
}

function init() {
  populateCategoryControls();
  populateDestinationOptions(refs.importCategorySelect.value);
  applyLaunchContext();
  renderAssetList();
  renderPreview();
  renderImportPlan();
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
    return true;
  }
};

function bootAssetBrowser() {
  if (!initialized) {
    init();
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

