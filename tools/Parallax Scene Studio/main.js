/*
Toolbox Aid
David Quesenberry
03/30/2026
main.js
*/
import {
  buildAssetDependencyGraph,
  createAssetId,
  createAssetRegistry,
  createRegistryDownloadPayload,
  findRegistryEntryById,
  mergeAssetRegistries,
  normalizeProjectRelativePath,
  sanitizeAssetRegistry,
  upsertRegistryEntry
} from "../shared/projectAssetRegistry.js";
import { registerAssetPipelineCandidate } from "../shared/assetPipelineFoundation.js";
import {
  getBlockingAssetValidationMessage,
  hasBlockingAssetValidationFindings,
  summarizeAssetValidation,
  validateProjectAssetState
} from "../shared/projectAssetValidation.js";
import {
  buildProjectAssetRemediation,
  getPrimaryRemediationAction,
  summarizeProjectAssetRemediation
} from "../shared/projectAssetRemediation.js";
import { buildProjectPackage, summarizeProjectPackaging } from "../shared/projectPackaging.js";
import { buildEditorExperienceLayer, summarizeEditorExperienceLayer } from "../shared/editorExperienceLayer.js";
import { buildDebugVisualizationLayer, summarizeDebugVisualizationLayer } from "../shared/debugVisualizationLayer.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";
import { createLivePreviewSyncBridge, validateStateBindingPayload } from "../shared/livePreviewSyncChannel.js";
import { normalizeToolSamplePath, toToolSampleLabel } from "../shared/toolSampleCatalog.js";
import { addToolModeMetadata, assertStandaloneToolDocument, offerImportMismatchOptions } from "../shared/documentModeGuards.js";

const SAMPLE_DIRECTORY_PATH = "./samples/";
const SAMPLE_MANIFEST_PATH = "./samples/sample-manifest.json";

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

function clamp(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, number));
}

function cloneDeep(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function normalizeMapMeta(rawMap) {
  const width = clamp(rawMap?.width, 4, 1024, 32);
  const height = clamp(rawMap?.height, 4, 1024, 18);
  const tileSize = clamp(rawMap?.tileSize, 8, 128, 24);
  const name = typeof rawMap?.name === "string" && rawMap.name.trim() ? rawMap.name.trim() : "untitled-map";

  return {
    name,
    width,
    height,
    tileSize,
    pixelWidth: width * tileSize,
    pixelHeight: height * tileSize
  };
}

function createDefaultLayer(index = 0, name = "Parallax Layer") {
  return {
    id: `parallax-layer-${Date.now()}-${index}`,
    name,
    parallaxSourceId: "",
    drawOrder: index,
    imageSource: "",
    scrollFactorX: 0.4,
    scrollFactorY: 0.3,
    offsetX: 0,
    offsetY: 0,
    repeatX: true,
    repeatY: false,
    wrapMode: "wrap",
    opacity: 1,
    visible: true
  };
}

function normalizeLayer(rawLayer, index = 0) {
  const fallback = createDefaultLayer(index, `Parallax Layer ${index + 1}`);
  const repeatX = rawLayer?.repeatX !== false;
  const repeatY = rawLayer?.repeatY === true;
  const wrapMode = rawLayer?.wrapMode === "clamp" ? "clamp" : "wrap";

  return {
    id: typeof rawLayer?.id === "string" && rawLayer.id.trim() ? rawLayer.id.trim() : fallback.id,
    name: typeof rawLayer?.name === "string" && rawLayer.name.trim() ? rawLayer.name.trim() : fallback.name,
    parallaxSourceId: typeof rawLayer?.parallaxSourceId === "string" ? rawLayer.parallaxSourceId.trim() : "",
    drawOrder: Math.trunc(clamp(rawLayer?.drawOrder, -999, 999, index)),
    imageSource: typeof rawLayer?.imageSource === "string" ? rawLayer.imageSource : "",
    scrollFactorX: clamp(rawLayer?.scrollFactorX, -4, 4, fallback.scrollFactorX),
    scrollFactorY: clamp(rawLayer?.scrollFactorY, -4, 4, fallback.scrollFactorY),
    offsetX: Math.trunc(clamp(rawLayer?.offsetX, -4096, 4096, 0)),
    offsetY: Math.trunc(clamp(rawLayer?.offsetY, -4096, 4096, 0)),
    repeatX,
    repeatY,
    wrapMode,
    opacity: clamp(rawLayer?.opacity, 0, 1, 1),
    visible: rawLayer?.visible !== false
  };
}

function sortLayersByOrder(layers) {
  layers.sort((a, b) => {
    if (a.drawOrder !== b.drawOrder) {
      return a.drawOrder - b.drawOrder;
    }
    return a.name.localeCompare(b.name);
  });
}

function normalizeDrawOrderSequence(layers) {
  sortLayersByOrder(layers);
  layers.forEach((layer, index) => {
    layer.drawOrder = index;
  });
}

function sanitizeAssetRefs(rawAssetRefs) {
  if (!rawAssetRefs || typeof rawAssetRefs !== "object") {
    return {
      parallaxSourceIds: []
    };
  }

  const parallaxSourceIds = Array.isArray(rawAssetRefs.parallaxSourceIds)
    ? rawAssetRefs.parallaxSourceIds.filter((value) => typeof value === "string" && value.trim())
    : [];

  return {
    parallaxSourceIds: Array.from(new Set(parallaxSourceIds))
  };
}

function createRegistryManagedParallaxSaveDocument(documentModel) {
  const output = cloneDeep(documentModel);
  output.assetRefs = sanitizeAssetRefs(output.assetRefs);

  output.layers = (Array.isArray(output.layers) ? output.layers : []).map((layer) => {
    const nextLayer = normalizeLayer(layer);
    if (nextLayer.parallaxSourceId && !normalizeProjectRelativePath(nextLayer.imageSource || "")) {
      nextLayer.imageSource = "";
    }
    return nextLayer;
  });

  return output;
}

function createInitialParallaxDocument(options = {}) {
  const map = normalizeMapMeta(options.map || {});
  const createdAt = new Date().toISOString();
  const layers = [
    {
      ...createDefaultLayer(0, "Sky"),
      scrollFactorX: 0.2,
      scrollFactorY: 0.05,
      opacity: 1,
      repeatY: false
    },
    {
      ...createDefaultLayer(1, "Far Mountains"),
      scrollFactorX: 0.4,
      scrollFactorY: 0.15,
      opacity: 0.95
    },
    {
      ...createDefaultLayer(2, "Near Trees"),
      scrollFactorX: 0.75,
      scrollFactorY: 0.35,
      opacity: 0.9
    }
  ];

  normalizeDrawOrderSequence(layers);

  return {
    schema: "toolbox.parallax/1",
    version: 1,
    companionEditor: "ParallaxEditor",
    map,
    layers,
    assetRefs: {
      parallaxSourceIds: []
    },
    metadata: {
      createdAt,
      updatedAt: createdAt,
      source: "parallax-editor-companion"
    }
  };
}

function sanitizeParallaxDocument(rawDocument, fallbackMap = null) {
  const fallback = createInitialParallaxDocument({ map: fallbackMap || undefined });
  if (!rawDocument || typeof rawDocument !== "object") {
    return fallback;
  }

  const map = normalizeMapMeta(rawDocument.map || fallback.map);
  const rawLayers = Array.isArray(rawDocument.layers) ? rawDocument.layers : [];
  const layers = rawLayers.length > 0
    ? rawLayers.map((layer, index) => normalizeLayer(layer, index))
    : cloneDeep(fallback.layers);
  normalizeDrawOrderSequence(layers);

  return {
    schema: "toolbox.parallax/1",
    version: Number.isFinite(rawDocument.version) ? rawDocument.version : 1,
    companionEditor: "ParallaxEditor",
    map,
    layers,
    assetRefs: sanitizeAssetRefs(rawDocument.assetRefs),
    metadata: {
      createdAt: typeof rawDocument?.metadata?.createdAt === "string" ? rawDocument.metadata.createdAt : fallback.metadata.createdAt,
      updatedAt: new Date().toISOString(),
      source: "parallax-editor-companion"
    }
  };
}

function extractParallaxDocument(rawAnyDocument) {
  if (!rawAnyDocument || typeof rawAnyDocument !== "object") {
    throw new Error("Expected a JSON object.");
  }

  if (rawAnyDocument.schema === "toolbox.parallax/1") {
    return sanitizeParallaxDocument(rawAnyDocument);
  }

  if (rawAnyDocument.schema === "toolbox.tilemap/1") {
    const map = normalizeMapMeta(rawAnyDocument.map || {});
    const rawParallax = rawAnyDocument.parallax && typeof rawAnyDocument.parallax === "object"
      ? rawAnyDocument.parallax
      : { schema: "toolbox.parallax/1", layers: [] };

    const merged = {
      schema: "toolbox.parallax/1",
      version: 1,
      companionEditor: "ParallaxEditor",
      map,
      layers: Array.isArray(rawParallax.layers) ? rawParallax.layers : [],
      assetRefs: rawAnyDocument.assetRefs
    };

    return sanitizeParallaxDocument(merged, map);
  }

  if (rawAnyDocument.parallax && rawAnyDocument.map) {
    const map = normalizeMapMeta(rawAnyDocument.map);
    const merged = {
      schema: "toolbox.parallax/1",
      version: 1,
      companionEditor: "ParallaxEditor",
      map,
      layers: Array.isArray(rawAnyDocument.parallax.layers) ? rawAnyDocument.parallax.layers : [],
      assetRefs: rawAnyDocument.assetRefs
    };
    return sanitizeParallaxDocument(merged, map);
  }

  throw new Error("Unsupported schema. Expected toolbox.tilemap/1 or toolbox.parallax/1.");
}

function extractParallaxDocumentFromSamplePreset(rawPreset) {
  if (!rawPreset || typeof rawPreset !== "object") {
    return rawPreset;
  }

  const payload = rawPreset.payload;
  if (payload && typeof payload === "object") {
    if (payload.parallaxDocument && typeof payload.parallaxDocument === "object") {
      return payload.parallaxDocument;
    }
    if (payload.parallax && typeof payload.parallax === "object") {
      return payload.parallax;
    }
  }

  return rawPreset;
}

function createTilemapParallaxPatch(parallaxDocument) {
  return {
    schema: "toolbox.tilemap-parallax-patch/1",
    map: cloneDeep(parallaxDocument.map),
    assetRefs: sanitizeAssetRefs(parallaxDocument.assetRefs),
    parallax: {
      schema: "toolbox.parallax/1",
      companionEditor: "ParallaxEditor",
      layers: cloneDeep(parallaxDocument.layers)
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      generatedBy: "tools/Parallax Scene Studio"
    }
  };
}

function createDownload(fileName, content) {
  const blob = new Blob([content], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(href);
}

function summarizeGraphFindings(findings) {
  return Array.isArray(findings) && findings.length > 0
    ? ` Graph findings: ${findings.length}.`
    : " Graph findings: none.";
}

function mod(value, range) {
  if (range === 0) {
    return 0;
  }
  return ((value % range) + range) % range;
}

function getLayerVisualColor(layer) {
  const hashSource = `${layer.id}|${layer.name}`;
  let hash = 0;
  for (let i = 0; i < hashSource.length; i += 1) {
    hash = ((hash << 5) - hash) + hashSource.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 56% 42%)`;
}

class ParallaxEditorApp {
  constructor(documentModel) {
    this.documentModel = documentModel;
    this.selectedLayerId = documentModel.layers[0]?.id || "";
    this.cameraX = 0;
    this.cameraY = 0;
    this.refs = {};
    this.imageCache = new Map();
    this.imageCacheVersion = 0;
    this.sampleEntries = [];
    this.isSimulationMode = false;
    this.simulation = {
      rafId: 0,
      lastTimestamp: 0,
      accumulatorMs: 0,
      playing: false,
      baseCameraX: 0,
      baseCameraY: 0,
      startCameraX: 0,
      startCameraY: 0,
      endCameraX: 0,
      endCameraY: 0,
      traversedDistance: 0,
      traversalDistance: 0,
      traversalDurationMs: 14000
    };
    this.assetRegistry = createAssetRegistry({ projectId: documentModel?.map?.name || "parallax-project" });
    this.assetDependencyGraphSnapshot = null;
    this.validationResult = null;
    this.remediationResult = { remediation: { status: "unavailable", actions: [] } };
    this.lastPackageResult = null;
    this.lastRuntimeResult = null;
    this.editorExperienceResult = null;
    this.debugVisualizationResult = null;
    this.livePreviewSync = createLivePreviewSyncBridge({ sourceId: "parallax-editor" });
    this.livePreviewSyncFrame = 0;
    this.pendingLivePreviewReason = "init";
    this.boundRuntimeState = null;
    this.lastRuntimeBindingStatusAt = 0;
    this.skipExternalProjectStateUntil = 0;
    this.transientLayerImageSourceByName = new Map();
  }

  invalidateImageCache() {
    this.imageCache.clear();
    this.imageCacheVersion += 1;
  }

  clearTransientLayerImageSources() {
    this.transientLayerImageSourceByName.forEach((objectUrl) => {
      if (typeof objectUrl === "string" && objectUrl.startsWith("blob:")) {
        URL.revokeObjectURL(objectUrl);
      }
    });
    this.transientLayerImageSourceByName.clear();
  }

  setTransientLayerImageSource(imageSource, objectUrl) {
    const key = typeof imageSource === "string" ? imageSource.trim() : "";
    if (!key || typeof objectUrl !== "string" || !objectUrl.trim()) {
      return;
    }
    const existing = this.transientLayerImageSourceByName.get(key);
    if (typeof existing === "string" && existing.startsWith("blob:")) {
      URL.revokeObjectURL(existing);
    }
    this.transientLayerImageSourceByName.set(key, objectUrl.trim());
  }

  getTransientLayerImageSource(imageSource) {
    const key = typeof imageSource === "string" ? imageSource.trim() : "";
    if (!key) {
      return "";
    }
    return this.transientLayerImageSourceByName.get(key) || "";
  }

  init(rootDocument) {
    this.captureRefs(rootDocument);
    this.attachEvents();
    this.syncFullscreenState();
    this.syncInputsFromDocument();
    this.renderAll();
    this.bindRuntimeStateSync();
    this.queueLivePreviewSync("init");
    const hasSamplePresetQuery = new URLSearchParams(window.location.search).has("samplePresetPath");
    this.loadSampleManifest({ quiet: hasSamplePresetQuery });
    void this.tryLoadPresetFromQuery();
  }

  captureRefs(rootDocument) {
    this.refs.newProjectButton = rootDocument.getElementById("newProjectButton");
    this.refs.loadProjectButton = rootDocument.getElementById("loadProjectButton");
    this.refs.loadProjectInput = rootDocument.getElementById("loadProjectInput");
    this.refs.saveProjectButton = rootDocument.getElementById("saveProjectButton");
    this.refs.loadAssetRegistryButton = rootDocument.getElementById("loadAssetRegistryButton");
    this.refs.loadAssetRegistryInput = rootDocument.getElementById("loadAssetRegistryInput");
    this.refs.saveAssetRegistryButton = rootDocument.getElementById("saveAssetRegistryButton");
    this.refs.simulateButton = rootDocument.getElementById("simulateButton");
    this.refs.playSimulationButton = rootDocument.getElementById("playSimulationButton");
    this.refs.pauseSimulationButton = rootDocument.getElementById("pauseSimulationButton");
    this.refs.restartSimulationButton = rootDocument.getElementById("restartSimulationButton");
    this.refs.exitSimulationButton = rootDocument.getElementById("exitSimulationButton");
    this.refs.exportParallaxPatchButton = rootDocument.getElementById("exportParallaxPatchButton");
    this.refs.packageProjectButton = rootDocument.getElementById("packageProjectButton");
    this.refs.remediationSummaryText = rootDocument.getElementById("remediationSummaryText");
    this.refs.experienceSummaryText = rootDocument.getElementById("experienceSummaryText");
    this.refs.experienceDetailsText = rootDocument.getElementById("experienceDetailsText");
    this.refs.refreshExperienceButton = rootDocument.getElementById("refreshExperienceButton");
    this.refs.debugSummaryText = rootDocument.getElementById("debugSummaryText");
    this.refs.debugDetailsText = rootDocument.getElementById("debugDetailsText");
    this.refs.refreshDebugVisualizationButton = rootDocument.getElementById("refreshDebugVisualizationButton");
    this.refs.inspectRemediationButton = rootDocument.getElementById("inspectRemediationButton");
    this.refs.jumpToProblemButton = rootDocument.getElementById("jumpToProblemButton");
    this.refs.applyRemediationButton = rootDocument.getElementById("applyRemediationButton");

    this.refs.projectNameInput = rootDocument.getElementById("projectNameInput");
    this.refs.mapWidthInput = rootDocument.getElementById("mapWidthInput");
    this.refs.mapHeightInput = rootDocument.getElementById("mapHeightInput");
    this.refs.tileSizeInput = rootDocument.getElementById("tileSizeInput");
    this.refs.applyMapMetaButton = rootDocument.getElementById("applyMapMetaButton");
    this.refs.sampleSelect = rootDocument.getElementById("sampleSelect");
    this.refs.loadSampleButton = rootDocument.getElementById("loadSampleButton");

    this.refs.layerList = rootDocument.getElementById("layerList");
    this.refs.newLayerNameInput = rootDocument.getElementById("newLayerNameInput");
    this.refs.addLayerButton = rootDocument.getElementById("addLayerButton");
    this.refs.removeLayerButton = rootDocument.getElementById("removeLayerButton");
    this.refs.duplicateLayerButton = rootDocument.getElementById("duplicateLayerButton");
    this.refs.moveLayerUpButton = rootDocument.getElementById("moveLayerUpButton");
    this.refs.moveLayerDownButton = rootDocument.getElementById("moveLayerDownButton");

    this.refs.cameraXInput = rootDocument.getElementById("cameraXInput");
    this.refs.cameraYInput = rootDocument.getElementById("cameraYInput");
    this.refs.cameraReadout = rootDocument.getElementById("cameraReadout");

    this.refs.layerNameInput = rootDocument.getElementById("layerNameInput");
    this.refs.layerDrawOrderInput = rootDocument.getElementById("layerDrawOrderInput");
    this.refs.layerOpacityInput = rootDocument.getElementById("layerOpacityInput");
    this.refs.layerVisibleSelect = rootDocument.getElementById("layerVisibleSelect");

    this.refs.layerImageSourceInput = rootDocument.getElementById("layerImageSourceInput");
    this.refs.applyImageSourceButton = rootDocument.getElementById("applyImageSourceButton");
    this.refs.layerImageFileInput = rootDocument.getElementById("layerImageFileInput");

    this.refs.scrollFactorXInput = rootDocument.getElementById("scrollFactorXInput");
    this.refs.scrollFactorYInput = rootDocument.getElementById("scrollFactorYInput");
    this.refs.offsetXInput = rootDocument.getElementById("offsetXInput");
    this.refs.offsetYInput = rootDocument.getElementById("offsetYInput");
    this.refs.repeatXSelect = rootDocument.getElementById("repeatXSelect");
    this.refs.repeatYSelect = rootDocument.getElementById("repeatYSelect");
    this.refs.wrapModeSelect = rootDocument.getElementById("wrapModeSelect");
    this.refs.applyLayerSettingsButton = rootDocument.getElementById("applyLayerSettingsButton");

    this.refs.previewMeta = rootDocument.getElementById("previewMeta");
    this.refs.simulationContext = rootDocument.getElementById("simulationContext");
    this.refs.previewDetailsText = rootDocument.getElementById("previewDetailsText");
    this.refs.statusText = rootDocument.getElementById("statusText");
    this.refs.appShell = rootDocument.querySelector(".app-shell");
    this.refs.leftSidebar = rootDocument.getElementById("leftSidebar");
    this.refs.rightSidebar = rootDocument.getElementById("rightSidebar");
    this.refs.leftPanelAccordions = Array.from(rootDocument.querySelectorAll("#leftSidebar .panel-accordion"));
    this.refs.rightPanelAccordions = Array.from(rootDocument.querySelectorAll("#rightSidebar .panel-accordion"));
    this.refs.overlayToggleButtons = Array.from(rootDocument.querySelectorAll("[data-overlay-toggle]"));
    this.refs.previewWrap = rootDocument.querySelector(".preview-wrap");
    this.refs.previewCanvas = rootDocument.getElementById("previewCanvas");
    this.refs.previewContext = this.refs.previewCanvas.getContext("2d", { alpha: false });
  }

  attachEvents() {
    this.refs.newProjectButton.addEventListener("click", () => this.handleNewProject());
    this.refs.loadProjectButton.addEventListener("click", () => this.refs.loadProjectInput.click());
    this.refs.loadProjectInput.addEventListener("change", (event) => this.handleLoadProject(event));
    this.refs.saveProjectButton.addEventListener("click", () => this.handleSaveProject());
    this.refs.loadAssetRegistryButton.addEventListener("click", () => this.refs.loadAssetRegistryInput.click());
    this.refs.loadAssetRegistryInput.addEventListener("change", (event) => this.handleLoadAssetRegistry(event));
    this.refs.saveAssetRegistryButton.addEventListener("click", () => this.handleSaveAssetRegistry());
    this.refs.simulateButton.addEventListener("click", () => this.enterSimulationMode());
    this.refs.playSimulationButton.addEventListener("click", () => this.resumeSimulation());
    this.refs.pauseSimulationButton.addEventListener("click", () => this.pauseSimulation());
    this.refs.restartSimulationButton.addEventListener("click", () => this.restartSimulationPosition());
    this.refs.exitSimulationButton.addEventListener("click", () => this.exitSimulationMode());
    this.refs.exportParallaxPatchButton.addEventListener("click", () => this.handleExportTilemapPatch());
    this.refs.packageProjectButton.addEventListener("click", () => this.handlePackageProject());
    this.refs.refreshExperienceButton.addEventListener("click", () => this.refreshExperienceSnapshot());
    this.refs.refreshDebugVisualizationButton.addEventListener("click", () => this.refreshDebugVisualizationSnapshot());
    this.refs.inspectRemediationButton.addEventListener("click", () => this.inspectRemediationActions());
    this.refs.jumpToProblemButton.addEventListener("click", () => this.jumpToRemediationProblem());
    this.refs.applyRemediationButton.addEventListener("click", () => this.applyRemediationAction());
    this.refs.overlayToggleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const side = button.dataset.overlaySide === "left" ? "left" : "right";
        const targetId = button.dataset.overlayTarget || "";
        this.toggleOverlayPanel(side, targetId);
      });
    });
    this.refs.leftPanelAccordions.forEach((panel) => {
      panel.addEventListener("toggle", () => this.handleOverlayAccordionToggle("left", panel));
    });
    this.refs.rightPanelAccordions.forEach((panel) => {
      panel.addEventListener("toggle", () => this.handleOverlayAccordionToggle("right", panel));
    });
    document.addEventListener("fullscreenchange", () => {
      this.syncFullscreenState();
      this.refs.leftSidebar?.classList.remove("visible-overlay");
      this.refs.rightSidebar?.classList.remove("visible-overlay");
      this.syncOverlayToggleButtons();
    });

    this.refs.applyMapMetaButton.addEventListener("click", () => this.applyMapMetaFromInputs());
    this.refs.projectNameInput.addEventListener("change", () => this.applyMapMetaFromInputs());
    this.refs.loadSampleButton.addEventListener("click", () => this.handleLoadSelectedSample());
    this.refs.sampleSelect.addEventListener("change", () => this.handleSampleSelectionChanged());
    this.refs.sampleSelect.addEventListener("focus", () => {
      void this.loadSampleManifest({ quiet: true });
    });

    this.refs.addLayerButton.addEventListener("click", () => this.addLayer());
    this.refs.removeLayerButton.addEventListener("click", () => this.removeSelectedLayer());
    this.refs.duplicateLayerButton.addEventListener("click", () => this.duplicateSelectedLayer());
    this.refs.moveLayerUpButton.addEventListener("click", () => this.moveSelectedLayer(-1));
    this.refs.moveLayerDownButton.addEventListener("click", () => this.moveSelectedLayer(1));

    this.refs.layerNameInput.addEventListener("change", () => this.applyBasicLayerFields());
    this.refs.layerDrawOrderInput.addEventListener("change", () => this.applyBasicLayerFields());
    this.refs.layerOpacityInput.addEventListener("change", () => this.applyBasicLayerFields());
    this.refs.layerVisibleSelect.addEventListener("change", () => this.applyBasicLayerFields());

    this.refs.applyImageSourceButton.addEventListener("click", () => this.applyImageSourceFromInput());
    this.refs.layerImageFileInput.addEventListener("change", (event) => this.assignLocalImageFile(event));

    this.refs.applyLayerSettingsButton.addEventListener("click", () => this.applyExtendedLayerSettings());

    this.refs.cameraXInput.addEventListener("input", () => this.handleCameraChange());
    this.refs.cameraYInput.addEventListener("input", () => this.handleCameraChange());
    if (this.refs.previewWrap) {
      this.refs.previewWrap.addEventListener("scroll", () => {
        if (this.isSimulationMode) {
          this.updateSimulationContextReadout();
        }
      });
    }
  }

  syncFullscreenState() {
    document.body.classList.toggle("fullscreen-mode", Boolean(document.fullscreenElement));
    this.syncOverlayToggleButtons();
  }

  syncOverlayToggleButtons() {
    const fullscreenActive = Boolean(document.fullscreenElement);
    this.refs.overlayToggleButtons.forEach((button) => {
      const side = button.dataset.overlaySide === "left" ? "left" : "right";
      const targetId = button.dataset.overlayTarget || "";
      const sidebar = this.getOverlaySidebar(side);
      const target = targetId ? document.getElementById(targetId) : null;
      const active = Boolean(
        fullscreenActive
        && sidebar instanceof HTMLElement
        && sidebar.classList.contains("visible-overlay")
        && target instanceof HTMLElement
        && target.open
      );
      button.setAttribute("aria-expanded", active ? "true" : "false");
      const symbol = button.querySelector(".overlay-toggle-symbol");
      if (symbol) {
        symbol.textContent = active ? "-" : "+";
      }
      const hideWhileOverlayOpen = Boolean(
        fullscreenActive
        && sidebar instanceof HTMLElement
        && sidebar.classList.contains("visible-overlay")
      );
      button.classList.toggle("is-hidden-while-overlay-open", hideWhileOverlayOpen);
    });
  }

  getOverlaySidebar(side) {
    return side === "left" ? this.refs.leftSidebar : this.refs.rightSidebar;
  }

  getOverlayPanels(side) {
    return side === "left" ? this.refs.leftPanelAccordions : this.refs.rightPanelAccordions;
  }

  toggleOverlayPanel(side, targetId) {
    const sidebar = this.getOverlaySidebar(side);
    const panels = this.getOverlayPanels(side);
    if (!(sidebar instanceof HTMLElement) || !Array.isArray(panels) || panels.length === 0) {
      return;
    }
    const target = panels.find((panel) => panel.id === targetId);
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const fullscreenActive = Boolean(document.fullscreenElement);
    if (!fullscreenActive) {
      target.open = !target.open;
      this.syncOverlayToggleButtons();
      return;
    }

    const overlayVisible = sidebar.classList.contains("visible-overlay");
    if (!overlayVisible) {
      sidebar.classList.add("visible-overlay");
      target.open = true;
    } else {
      target.open = !target.open;
    }
    if (!panels.some((panel) => panel.open)) {
      sidebar.classList.remove("visible-overlay");
    }

    this.syncOverlayToggleButtons();
  }

  handleOverlayAccordionToggle(side, panel) {
    if (!document.fullscreenElement) {
      return;
    }
    const sidebar = this.getOverlaySidebar(side);
    const panels = this.getOverlayPanels(side);
    if (!(sidebar instanceof HTMLElement) || !Array.isArray(panels)) {
      return;
    }
    if (panel.open) {
      sidebar.classList.add("visible-overlay");
    } else if (!panels.some((entry) => entry.open)) {
      sidebar.classList.remove("visible-overlay");
    }
    this.syncOverlayToggleButtons();
  }

  getSelectedLayer() {
    return this.documentModel.layers.find((layer) => layer.id === this.selectedLayerId) || this.documentModel.layers[0] || null;
  }

  touchDocument() {
    this.documentModel.metadata.updatedAt = new Date().toISOString();
    this.queueLivePreviewSync("document-update");
  }

  bindRuntimeStateSync() {
    this.livePreviewSync.subscribe((payload, envelope) => {
      if (envelope?.eventType !== "runtime-state-binding") {
        return;
      }
      const validation = validateStateBindingPayload(payload);
      if (!validation.valid || !payload?.runtimeState) {
        return;
      }
      this.boundRuntimeState = payload.runtimeState;
      const now = Date.now();
      if ((now - this.lastRuntimeBindingStatusAt) < 500) {
        return;
      }
      this.lastRuntimeBindingStatusAt = now;
      const heroX = Number(this.boundRuntimeState.heroX).toFixed(1);
      const heroY = Number(this.boundRuntimeState.heroY).toFixed(1);
      const cameraX = Number(this.boundRuntimeState.cameraX).toFixed(1);
      const cameraY = Number(this.boundRuntimeState.cameraY).toFixed(1);
      this.updateStatus(`Runtime bound: hero(${heroX}, ${heroY}) camera(${cameraX}, ${cameraY}).`);
    });
  }

  publishLivePreviewSync(reason = "update") {
    this.livePreviewSync.publish(
      {
        toolId: "parallax-editor",
        reason,
        parallaxDocument: cloneDeep(this.documentModel)
      },
      "tool-live-preview-sync"
    );
  }

  queueLivePreviewSync(reason = "update") {
    this.pendingLivePreviewReason = reason;
    if (this.livePreviewSyncFrame) {
      return;
    }
    const schedule = typeof requestAnimationFrame === "function"
      ? requestAnimationFrame
      : (callback) => setTimeout(callback, 16);
    this.livePreviewSyncFrame = schedule(() => {
      this.livePreviewSyncFrame = 0;
      this.publishLivePreviewSync(this.pendingLivePreviewReason);
    });
  }

  updateStatus(message) {
    this.refs.statusText.textContent = message;
  }

  syncInputsFromDocument() {
    this.refs.projectNameInput.value = this.documentModel.map.name;
    this.refs.mapWidthInput.value = String(this.documentModel.map.width);
    this.refs.mapHeightInput.value = String(this.documentModel.map.height);
    this.refs.tileSizeInput.value = String(this.documentModel.map.tileSize);
    this.updateCameraInputBounds();
    this.refs.cameraXInput.value = String(this.cameraX);
    this.refs.cameraYInput.value = String(this.cameraY);
  }

  updateCameraInputBounds() {
    const maxHorizontal = Math.max(1024, this.documentModel.map.pixelWidth);
    const maxVertical = Math.max(1024, this.documentModel.map.pixelHeight);
    this.refs.cameraXInput.min = String(-maxHorizontal);
    this.refs.cameraXInput.max = String(maxHorizontal);
    this.refs.cameraYInput.min = String(-maxVertical);
    this.refs.cameraYInput.max = String(maxVertical);
  }

  refreshSimulationActionState() {
    const inSimulation = this.isSimulationMode;
    this.refs.simulateButton.disabled = inSimulation;
    this.refs.playSimulationButton.disabled = !inSimulation || this.simulation.playing;
    this.refs.pauseSimulationButton.disabled = !inSimulation || !this.simulation.playing;
    this.refs.restartSimulationButton.disabled = !inSimulation;
    this.refs.exitSimulationButton.disabled = !inSimulation;
    this.refs.cameraXInput.disabled = inSimulation;
    this.refs.cameraYInput.disabled = inSimulation;
  }

  configureSimulationTraverse(playing) {
    const viewportWidth = this.refs.previewCanvas.width;
    const worldWidth = Math.max(1, this.documentModel.map.pixelWidth);
    const startCameraX = -Math.floor(viewportWidth * 0.2);
    const endCameraX = Math.max(startCameraX + 1, worldWidth - Math.floor(viewportWidth * 0.8));

    this.simulation.startCameraX = startCameraX;
    this.simulation.endCameraX = endCameraX;
    this.simulation.startCameraY = 0;
    this.simulation.endCameraY = 0;
    this.simulation.traversalDistance = Math.max(1, Math.abs(endCameraX - startCameraX));
    this.simulation.traversalDurationMs = Math.max(9000, Math.min(24000, 9000 + (this.simulation.traversalDistance * 9)));
    this.simulation.traversedDistance = 0;
    this.simulation.playing = playing;
    this.simulation.lastTimestamp = 0;
    this.simulation.accumulatorMs = 0;

    this.cameraX = startCameraX;
    this.cameraY = 0;
    if (this.refs.previewWrap) {
      this.refs.previewWrap.scrollTop = 0;
    }
    this.refs.cameraXInput.value = String(this.cameraX);
    this.refs.cameraYInput.value = String(this.cameraY);
    this.refs.cameraReadout.textContent = `camera: ${this.cameraX}, ${this.cameraY}`;
    this.updateSimulationContextReadout();
  }

  getSimulationProgress() {
    if (!this.isSimulationMode || this.simulation.traversalDistance <= 0) {
      return 0;
    }
    return Math.max(0, Math.min(1, this.simulation.traversedDistance / this.simulation.traversalDistance));
  }

  updateSimulationContextReadout() {
    if (!this.isSimulationMode) {
      this.refs.simulationContext.textContent = "";
      return;
    }

    const sortedLayers = cloneDeep(this.documentModel.layers);
    sortLayersByOrder(sortedLayers);
    const progress = this.getSimulationProgress();
    const progressPercent = Math.round(progress * 100);
    const repeatCount = sortedLayers.filter((layer) => layer.repeatX || layer.repeatY).length;
    const wrapCount = sortedLayers.filter((layer) => layer.wrapMode === "wrap").length;
    const backLayer = sortedLayers[0]?.name || "none";
    const frontLayer = sortedLayers[sortedLayers.length - 1]?.name || "none";
    const mode = this.simulation.playing ? "PLAY" : "PAUSE";
    this.refs.simulationContext.textContent = `${mode} ${progressPercent}% cam:${this.cameraX},${this.cameraY} depth:${backLayer}->${frontLayer} repeat:${repeatCount}/${sortedLayers.length} wrap:${wrapCount}`;
  }

  applySimulationCameraAtProgress(progress) {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const nextX = this.simulation.startCameraX
      + ((this.simulation.endCameraX - this.simulation.startCameraX) * clampedProgress);

    this.cameraX = Math.round(nextX);
    this.cameraY = 0;
    this.refs.cameraXInput.value = String(this.cameraX);
    this.refs.cameraYInput.value = String(this.cameraY);
    this.refs.cameraReadout.textContent = `camera: ${this.cameraX}, ${this.cameraY}`;
  }

  enterSimulationMode() {
    if (this.isSimulationMode) {
      return;
    }

    this.isSimulationMode = true;
    this.simulation.baseCameraX = this.cameraX;
    this.simulation.baseCameraY = this.cameraY;
    this.configureSimulationTraverse(true);
    this.refreshSimulationActionState();
    this.updateStatus("Simulation mode active. Running full-map parallax traversal.");
    this.startSimulationLoop();
    this.renderPreview();
  }

  pauseSimulation() {
    if (!this.isSimulationMode || !this.simulation.playing) {
      return;
    }
    this.simulation.playing = false;
    this.simulation.lastTimestamp = 0;
    this.simulation.accumulatorMs = 0;
    this.refreshSimulationActionState();
    this.updateSimulationContextReadout();
    this.renderPreview();
    this.updateStatus("Simulation paused.");
  }

  resumeSimulation() {
    if (!this.isSimulationMode || this.simulation.playing) {
      return;
    }
    this.simulation.playing = true;
    this.simulation.lastTimestamp = 0;
    this.simulation.accumulatorMs = 0;
    this.refreshSimulationActionState();
    this.updateSimulationContextReadout();
    this.renderPreview();
    this.updateStatus("Simulation resumed.");
  }

  restartSimulationPosition() {
    if (!this.isSimulationMode) {
      return;
    }
    this.configureSimulationTraverse(this.simulation.playing);
    this.refreshSimulationActionState();
    this.renderPreview();
    this.updateStatus("Simulation restarted from the initial traversal position.");
  }

  exitSimulationMode() {
    const wasSimulationMode = this.isSimulationMode;
    if (!wasSimulationMode && !this.simulation.rafId) {
      return;
    }

    this.isSimulationMode = false;
    if (this.simulation.rafId) {
      cancelAnimationFrame(this.simulation.rafId);
      this.simulation.rafId = 0;
    }

    this.simulation.playing = false;
    this.simulation.lastTimestamp = 0;
    this.simulation.accumulatorMs = 0;
    this.simulation.traversedDistance = 0;
    this.simulation.traversalDistance = 0;
    this.cameraX = this.simulation.baseCameraX;
    this.cameraY = this.simulation.baseCameraY;
    this.refs.cameraXInput.value = String(this.cameraX);
    this.refs.cameraYInput.value = String(this.cameraY);
    this.refs.simulationContext.textContent = "";
    this.refreshSimulationActionState();
    this.renderPreview();
    if (wasSimulationMode) {
      this.updateStatus("Exited simulation mode.");
    }
  }

  startSimulationLoop() {
    const tick = (timestamp) => {
      if (!this.isSimulationMode) {
        return;
      }

      if (this.simulation.playing) {
        if (this.simulation.lastTimestamp === 0) {
          this.simulation.lastTimestamp = timestamp;
        }
        const deltaMs = timestamp - this.simulation.lastTimestamp;
        this.simulation.lastTimestamp = timestamp;
        this.advanceSimulationCamera(deltaMs);
      }

      this.renderPreview();
      this.simulation.rafId = requestAnimationFrame(tick);
    };

    this.simulation.rafId = requestAnimationFrame(tick);
  }

  advanceSimulationCamera(deltaMs) {
    const durationMs = Math.max(1, this.simulation.traversalDurationMs);
    const advanceBy = Math.max(0, deltaMs) * (this.simulation.traversalDistance / durationMs);
    this.simulation.traversedDistance = Math.min(
      this.simulation.traversalDistance,
      this.simulation.traversedDistance + advanceBy
    );
    const progress = this.getSimulationProgress();
    this.applySimulationCameraAtProgress(progress);
    this.updateSimulationContextReadout();

    if (progress >= 1) {
      this.simulation.playing = false;
      this.refreshSimulationActionState();
      this.updateStatus("Simulation reached the end of the full-map traverse.");
    }
  }

  createSampleEntry(pathValue, labelHint = "", idHint = "") {
    const path = normalizeToolSamplePath(pathValue);
    if (!path) {
      return null;
    }
    const normalizedLabel = typeof labelHint === "string" ? labelHint.trim() : "";
    const fallbackLabel = toToolSampleLabel(path);
    return {
      id: typeof idHint === "string" && idHint.trim() ? idHint.trim() : path,
      label: normalizedLabel && !/[\\/]/.test(normalizedLabel) ? normalizedLabel : fallbackLabel,
      path
    };
  }

  async discoverSampleEntriesFromDirectory() {
    const directoryUrl = new URL(SAMPLE_DIRECTORY_PATH, window.location.href);
    const response = await fetch(directoryUrl.toString(), { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Directory request failed (${response.status}).`);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const documentModel = parser.parseFromString(html, "text/html");
    const anchors = Array.from(documentModel.querySelectorAll("a[href]"));
    const discovered = [];
    const seenPaths = new Set();

    anchors.forEach((anchor) => {
      const href = anchor.getAttribute("href");
      if (!href) {
        return;
      }
      const resolved = new URL(href, directoryUrl);
      const fileName = decodeURIComponent((resolved.pathname.split("/").pop() || "").trim());
      if (!fileName || !fileName.toLowerCase().endsWith(".json")) {
        return;
      }
      if (fileName.toLowerCase() === "sample-manifest.json") {
        return;
      }

      const entry = this.createSampleEntry(fileName, anchor.textContent || "", fileName);
      if (!entry || seenPaths.has(entry.path)) {
        return;
      }
      seenPaths.add(entry.path);
      discovered.push(entry);
    });

    discovered.sort((left, right) => left.label.localeCompare(right.label));
    return discovered;
  }

  collectSampleEntriesFromManifest(manifest) {
    const rawSamples = Array.isArray(manifest?.samples) ? manifest.samples : [];
    return rawSamples
      .map((entry) => this.createSampleEntry(entry?.path, entry?.label, entry?.id))
      .filter((entry) => entry !== null);
  }

  async loadSampleManifest(options = {}) {
    const quiet = options.quiet === true;
    const previousSelection = normalizeToolSamplePath(this.refs.sampleSelect.value);
    if (!quiet) {
      this.refs.sampleSelect.innerHTML = "<option value=\"\">Loading samples...</option>";
      this.refs.loadSampleButton.disabled = true;
    }

    try {
      const sampleEntries = await this.discoverSampleEntriesFromDirectory();
      if (sampleEntries.length === 0) {
        throw new Error("No sample JSON files were discovered in ./samples/.");
      }
      this.sampleEntries = sampleEntries;
      this.renderSampleOptions(previousSelection);
      if (!quiet) {
        this.updateStatus(`Loaded ${sampleEntries.length} samples from ${SAMPLE_DIRECTORY_PATH}.`);
      }
      return;
    } catch (directoryError) {
      try {
        const manifestUrl = new URL(SAMPLE_MANIFEST_PATH, window.location.href);
        const response = await fetch(manifestUrl.toString(), { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Manifest request failed (${response.status}).`);
        }

        const manifest = await response.json();
        const sampleEntries = this.collectSampleEntriesFromManifest(manifest);
        if (sampleEntries.length === 0) {
          throw new Error("Sample manifest had no valid entries.");
        }

        this.sampleEntries = sampleEntries;
        this.renderSampleOptions(previousSelection);
        if (!quiet) {
          this.updateStatus(`Loaded ${sampleEntries.length} samples from ${SAMPLE_MANIFEST_PATH}.`);
        }
      } catch (error) {
        this.sampleEntries = [];
        this.renderSampleOptions(previousSelection);
        if (!quiet) {
          this.updateStatus(`Sample discovery unavailable: ${error instanceof Error ? error.message : "unknown error"}`);
        }
      }
    }
  }

  renderSampleOptions(preferredPath = "") {
    const select = this.refs.sampleSelect;
    select.innerHTML = "";

    if (this.sampleEntries.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No samples available";
      select.appendChild(option);
      this.refs.loadSampleButton.disabled = true;
      return;
    }

    const promptOption = document.createElement("option");
    promptOption.value = "";
    promptOption.textContent = "Select a sample...";
    select.appendChild(promptOption);

    this.sampleEntries.forEach((entry) => {
      const option = document.createElement("option");
      option.value = entry.path;
      option.textContent = entry.label;
      select.appendChild(option);
    });

    if (preferredPath && this.sampleEntries.some((entry) => entry.path === preferredPath)) {
      select.value = preferredPath;
    }
    this.refs.loadSampleButton.disabled = false;
  }

  handleSampleSelectionChanged() {
    const selectedPath = normalizeToolSamplePath(this.refs.sampleSelect.value);
    if (!selectedPath) {
      return;
    }
    this.updateStatus(`Sample selected: ${selectedPath}`);
  }

  async handleLoadSelectedSample() {
    const selectedPath = normalizeToolSamplePath(this.refs.sampleSelect.value);
    if (!selectedPath) {
      this.updateStatus("Select a sample before loading.");
      return;
    }

    this.exitSimulationMode();
    try {
      const sampleUrl = new URL(selectedPath, window.location.href);
      const response = await fetch(sampleUrl.toString(), { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Sample request failed (${response.status}).`);
      }

      const raw = await response.json();
      this.applyParallaxDocument(extractParallaxDocument(raw));
      this.queueLivePreviewSync("load-sample");
      this.updateStatus(`Loaded sample ${selectedPath}.`);
    } catch (error) {
      this.updateStatus(`Sample load failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  async tryLoadPresetFromQuery() {
    const searchParams = new URLSearchParams(window.location.search);
    const samplePresetPath = normalizeSamplePresetPath(searchParams.get("samplePresetPath") || "");
    if (!samplePresetPath) {
      return;
    }

    const sampleId = String(searchParams.get("sampleId") || "").trim();
    this.exitSimulationMode();
    try {
      const presetUrl = new URL(samplePresetPath, window.location.href);
      const response = await fetch(presetUrl.toString(), { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Preset request failed (${response.status}).`);
      }
      const rawPreset = await response.json();
      const toolDocument = extractParallaxDocumentFromSamplePreset(rawPreset);
      this.skipExternalProjectStateUntil = Date.now() + 3000;
      this.applyParallaxDocument(extractParallaxDocument(toolDocument));
      this.queueLivePreviewSync("sample-preset");
      this.updateStatus(buildPresetLoadedStatus(sampleId, samplePresetPath));
    } catch (error) {
      this.updateStatus(`Preset load failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  applyParallaxDocument(nextDocument) {
    this.documentModel = nextDocument;
    this.resolveAssetRefsFromRegistry();
    normalizeDrawOrderSequence(this.documentModel.layers);
    this.selectedLayerId = this.documentModel.layers[0]?.id || "";
    this.clearTransientLayerImageSources();
    this.invalidateImageCache();
    this.cameraX = 0;
    this.cameraY = 0;
    this.syncInputsFromDocument();
    this.renderAll();
  }

  handleNewProject() {
    this.exitSimulationMode();
    this.documentModel = createInitialParallaxDocument({ map: this.documentModel.map });
    this.selectedLayerId = this.documentModel.layers[0]?.id || "";
    this.clearTransientLayerImageSources();
    this.invalidateImageCache();
    this.cameraX = 0;
    this.cameraY = 0;
    this.syncInputsFromDocument();
    this.renderAll();
    this.queueLivePreviewSync("new-project");
    this.updateStatus("Created new parallax document.");
  }

  syncAssetRegistryFromDocument() {
    const projectName = this.documentModel?.map?.name || "parallax-map";
    this.assetRegistry = sanitizeAssetRegistry(this.assetRegistry);
    this.assetRegistry.projectId = this.assetRegistry.projectId || projectName;

    const sourceIds = [];
    this.documentModel.layers.forEach((layer, index) => {
      const layerPath = normalizeProjectRelativePath(layer?.imageSource || "");
      if (!layerPath) {
        return;
      }

      const imageId = createAssetId("image", layerPath, `parallax-image-${index + 1}`);
      const sourceId = layer.parallaxSourceId || createAssetId("parallax", layer.id || layer.name || `source-${index + 1}`, `source-${index + 1}`);
      layer.parallaxSourceId = sourceId;

      const imageRegistration = registerAssetPipelineCandidate({
        registry: this.assetRegistry,
        section: "images",
        ingest: {
          id: imageId,
          name: layer.name || `Parallax Layer ${index + 1}`,
          path: layerPath,
          sourceTool: "parallax-editor"
        }
      });
      this.assetRegistry = imageRegistration.registry;

      const sourceRegistration = registerAssetPipelineCandidate({
        registry: this.assetRegistry,
        section: "parallaxSources",
        ingest: {
          id: sourceId,
          name: layer.name || `Parallax Layer ${index + 1}`,
          path: layerPath,
          sourceTool: "parallax-editor"
        },
        entryFields: {
          imageId
        }
      });
      this.assetRegistry = sourceRegistration.registry;

      sourceIds.push(sourceId);
    });

    this.documentModel.assetRefs = {
      parallaxSourceIds: Array.from(new Set(sourceIds))
    };
  }

  resolveAssetRefsFromRegistry() {
    this.documentModel.assetRefs = sanitizeAssetRefs(this.documentModel.assetRefs);
    const sourceIds = this.documentModel.assetRefs.parallaxSourceIds;
    if (!Array.isArray(sourceIds) || sourceIds.length === 0) {
      return {
        resolvedCount: 0,
        unresolvedCount: 0
      };
    }

    let fallbackIndex = 0;
    let resolvedCount = 0;
    let unresolvedCount = 0;
    this.documentModel.layers.forEach((layer) => {
      const sourceId = layer.parallaxSourceId || sourceIds[fallbackIndex] || "";
      if (!sourceId) {
        return;
      }

      if (!layer.parallaxSourceId) {
        layer.parallaxSourceId = sourceId;
      }

      if (normalizeProjectRelativePath(layer.imageSource || "")) {
        fallbackIndex += 1;
        return;
      }

      const sourceEntry = findRegistryEntryById(this.assetRegistry, "parallaxSources", sourceId);
      const sourcePath = normalizeProjectRelativePath(sourceEntry?.path || "");
      if (sourcePath) {
        layer.imageSource = sourcePath;
        resolvedCount += 1;
      } else {
        unresolvedCount += 1;
      }
      fallbackIndex += 1;
    });

    return {
      resolvedCount,
      unresolvedCount
    };
  }

  handleSaveProject() {
    this.touchDocument();
    this.syncAssetRegistryFromDocument();
    const validation = this.validateProjectAssets();
    if (hasBlockingAssetValidationFindings(validation)) {
      this.updateStatus(`${getBlockingAssetValidationMessage("Save Project", validation)} (${summarizeAssetValidation(validation)}).`);
      return;
    }
    const output = addToolModeMetadata(createRegistryManagedParallaxSaveDocument(this.documentModel), { toolId: "parallax-editor" });
    const { graph, findings } = buildAssetDependencyGraph(this.assetRegistry);
    this.assetDependencyGraphSnapshot = graph;
    output.project = {
      ...(output.project && typeof output.project === "object" ? output.project : {}),
      assetDependencyGraph: graph
    };
    const payload = JSON.stringify(output, null, 2);
    const fileName = `${this.documentModel.map.name || "map"}.parallax.json`;
    createDownload(fileName, payload);
    this.updateStatus(`Saved ${fileName} (${output.assetRefs.parallaxSourceIds.length} parallax asset refs, ID-based layer references).${summarizeGraphFindings(findings)} Validation: ${summarizeAssetValidation(validation)}.`);
  }

  handleSaveAssetRegistry() {
    this.syncAssetRegistryFromDocument();
    const validation = this.validateProjectAssets();
    if (hasBlockingAssetValidationFindings(validation)) {
      this.updateStatus(`${getBlockingAssetValidationMessage("Save Asset Registry", validation)} (${summarizeAssetValidation(validation)}).`);
      return;
    }
    const { findings } = buildAssetDependencyGraph(this.assetRegistry);
    const payload = createRegistryDownloadPayload(this.assetRegistry);
    createDownload("project.assets.json", payload);
    this.updateStatus(`Saved project.assets.json (${this.assetRegistry.parallaxSources.length} parallax sources).${summarizeGraphFindings(findings)} Validation: ${summarizeAssetValidation(validation)}.`);
  }

  handleExportTilemapPatch() {
    const validation = this.validateProjectAssets();
    if (hasBlockingAssetValidationFindings(validation)) {
      this.updateStatus(`${getBlockingAssetValidationMessage("Export Parallax Patch", validation)} (${summarizeAssetValidation(validation)}).`);
      return;
    }
    const patch = createTilemapParallaxPatch(createRegistryManagedParallaxSaveDocument(this.documentModel));
    const payload = JSON.stringify(patch, null, 2);
    const fileName = `${this.documentModel.map.name || "map"}.tilemap-parallax.patch.json`;
    createDownload(fileName, payload);
    this.updateStatus(`Exported ${fileName}. Validation: ${summarizeAssetValidation(validation)}.`);
  }

  handlePackageProject() {
    this.touchDocument();
    this.syncAssetRegistryFromDocument();
    const validation = this.validateProjectAssets();
    const persistableDocument = createRegistryManagedParallaxSaveDocument(this.documentModel);
    const packageResult = buildProjectPackage({
      registry: this.assetRegistry,
      validationResult: validation,
      parallaxDocument: persistableDocument
    });
    this.lastPackageResult = packageResult;
    this.editorExperienceResult = buildEditorExperienceLayer({
      assetDependencyGraph: validation.assetDependencyGraph,
      validationResult: validation,
      remediationResult: this.remediationResult,
      packageResult: this.lastPackageResult,
      runtimeResult: this.lastRuntimeResult
    });
    this.debugVisualizationResult = buildDebugVisualizationLayer({
      assetDependencyGraph: validation.assetDependencyGraph,
      validationResult: validation,
      remediationResult: this.remediationResult,
      packageResult: this.lastPackageResult,
      runtimeResult: this.lastRuntimeResult
    });
    this.updateEditorExperienceUI();
    this.updateDebugVisualizationUI();
    if (packageResult.packageStatus !== "ready") {
      this.updateStatus(`${summarizeProjectPackaging(packageResult)} ${packageResult.manifest.package.reports[0]?.message || ""}`.trim());
      return;
    }
    const fileBase = `${this.assetRegistry.projectId || this.documentModel.map.name || "parallax-project"}.package`;
    createDownload(`${fileBase}.json`, `${JSON.stringify(packageResult.manifest, null, 2)}\n`);
    createDownload(`${fileBase}.report.txt`, `${packageResult.reportText}\n`);
    this.updateStatus(`${summarizeProjectPackaging(packageResult)} Manifest and report exported.`);
  }

  handleLoadProject(event) {
    this.exitSimulationMode();
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result));
        const guard = assertStandaloneToolDocument(raw, {
          expectedLabel: "Parallax project",
          acceptedSchemas: ["toolbox.parallax/1", "toolbox.tilemap/1"],
          requiredToolId: "parallax-editor"
        });
        if (!guard.ok) {
          const handled = offerImportMismatchOptions(guard, {
            viewerToolId: "state-inspector",
            viewerPayload: raw,
            sourceToolId: "parallax-editor"
          });
          if (handled) {
            return;
          }
          throw new Error(guard.reason);
        }
        this.documentModel = extractParallaxDocument(raw);
        this.assetDependencyGraphSnapshot = raw?.project?.assetDependencyGraph || null;
        const resolution = this.resolveAssetRefsFromRegistry();
        normalizeDrawOrderSequence(this.documentModel.layers);
        this.selectedLayerId = this.documentModel.layers[0]?.id || "";
        this.clearTransientLayerImageSources();
        this.invalidateImageCache();
        this.cameraX = 0;
        this.cameraY = 0;
        this.syncInputsFromDocument();
        this.renderAll();
        this.queueLivePreviewSync("load-project");
        const validation = this.validateProjectAssets();
        if (resolution.resolvedCount > 0) {
          this.updateStatus(`Loaded ${file.name} (${resolution.resolvedCount} layer image refs restored from asset registry, validation: ${summarizeAssetValidation(validation)}).`);
        } else if (resolution.unresolvedCount > 0) {
          this.updateStatus(`Loaded ${file.name} (${resolution.unresolvedCount} registry image refs unresolved; layer image paths are missing, validation: ${summarizeAssetValidation(validation)}).`);
        } else {
          this.updateStatus(`Loaded ${file.name} (validation: ${summarizeAssetValidation(validation)}).`);
        }
      } catch (error) {
        this.updateStatus(`Load failed: ${error instanceof Error ? error.message : "invalid JSON"}`);
      }
      this.refs.loadProjectInput.value = "";
    };

    reader.readAsText(file);
  }

  handleLoadAssetRegistry(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        this.assetRegistry = mergeAssetRegistries(this.assetRegistry, parsed);
        const resolution = this.resolveAssetRefsFromRegistry();
        this.invalidateImageCache();
        this.renderAll();
        const validation = this.validateProjectAssets();
        if (resolution.resolvedCount > 0) {
          this.updateStatus(`Loaded ${file.name} (${this.assetRegistry.parallaxSources.length} parallax sources; ${resolution.resolvedCount} layer refs restored; validation: ${summarizeAssetValidation(validation)}).`);
        } else if (resolution.unresolvedCount > 0) {
          this.updateStatus(`Loaded ${file.name} (${this.assetRegistry.parallaxSources.length} parallax sources; ${resolution.unresolvedCount} refs still unresolved; validation: ${summarizeAssetValidation(validation)}).`);
        } else {
          this.updateStatus(`Loaded ${file.name} (${this.assetRegistry.parallaxSources.length} parallax sources, validation: ${summarizeAssetValidation(validation)}).`);
        }
      } catch (error) {
        this.updateStatus(`Asset registry load failed: ${error instanceof Error ? error.message : "invalid JSON"}`);
      }
      this.refs.loadAssetRegistryInput.value = "";
    };

    reader.readAsText(file);
  }

  applyMapMetaFromInputs() {
    const map = normalizeMapMeta({
      name: this.refs.projectNameInput.value,
      width: this.refs.mapWidthInput.value,
      height: this.refs.mapHeightInput.value,
      tileSize: this.refs.tileSizeInput.value
    });

    this.documentModel.map = map;
    this.updateCameraInputBounds();
    this.touchDocument();
    this.renderPreview();
    this.refs.previewMeta.textContent = `${map.width}x${map.height} @ ${map.tileSize}px (${map.pixelWidth}x${map.pixelHeight})`;
    this.updateStatus("Updated map metadata for parallax preview.");
  }

  addLayer() {
    const name = this.refs.newLayerNameInput.value.trim() || `Parallax Layer ${this.documentModel.layers.length + 1}`;
    const newLayer = createDefaultLayer(this.documentModel.layers.length, name);
    newLayer.drawOrder = this.documentModel.layers.length;

    this.documentModel.layers.push(newLayer);
    normalizeDrawOrderSequence(this.documentModel.layers);
    this.selectedLayerId = newLayer.id;
    this.touchDocument();
    this.renderAll();
    this.updateStatus(`Added layer ${name}.`);
  }

  removeSelectedLayer() {
    if (this.documentModel.layers.length <= 1) {
      this.updateStatus("Cannot remove the last parallax layer.");
      return;
    }

    const index = this.documentModel.layers.findIndex((layer) => layer.id === this.selectedLayerId);
    if (index < 0) {
      return;
    }

    const removed = this.documentModel.layers[index];
    this.documentModel.layers.splice(index, 1);
    normalizeDrawOrderSequence(this.documentModel.layers);
    this.selectedLayerId = this.documentModel.layers[Math.max(0, index - 1)]?.id || this.documentModel.layers[0].id;
    this.touchDocument();
    this.renderAll();
    this.updateStatus(`Removed layer ${removed.name}.`);
  }

  duplicateSelectedLayer() {
    const selected = this.getSelectedLayer();
    if (!selected) {
      return;
    }

    const duplicate = normalizeLayer(cloneDeep(selected), this.documentModel.layers.length);
    duplicate.id = `parallax-layer-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    duplicate.name = `${selected.name} Copy`;
    duplicate.drawOrder = this.documentModel.layers.length;

    this.documentModel.layers.push(duplicate);
    normalizeDrawOrderSequence(this.documentModel.layers);
    this.selectedLayerId = duplicate.id;
    this.touchDocument();
    this.renderAll();
    this.updateStatus(`Duplicated layer ${selected.name}.`);
  }

  moveSelectedLayer(direction) {
    const currentIndex = this.documentModel.layers.findIndex((layer) => layer.id === this.selectedLayerId);
    if (currentIndex < 0) {
      return;
    }

    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= this.documentModel.layers.length) {
      return;
    }

    const [layer] = this.documentModel.layers.splice(currentIndex, 1);
    this.documentModel.layers.splice(nextIndex, 0, layer);
    // Preserve the user-driven array move, then reindex drawOrder without re-sorting.
    this.documentModel.layers.forEach((entry, index) => {
      entry.drawOrder = index;
    });
    this.selectedLayerId = layer.id;
    this.touchDocument();
    this.renderAll();
    this.updateStatus(`Moved layer ${layer.name} ${direction < 0 ? "up" : "down"}.`);
  }

  applyBasicLayerFields() {
    const layer = this.getSelectedLayer();
    if (!layer) {
      return;
    }

    layer.name = this.refs.layerNameInput.value.trim() || layer.name;
    layer.drawOrder = Math.trunc(clamp(this.refs.layerDrawOrderInput.value, -999, 999, layer.drawOrder));
    layer.opacity = clamp(this.refs.layerOpacityInput.value, 0, 1, layer.opacity);
    layer.visible = this.refs.layerVisibleSelect.value === "true";

    normalizeDrawOrderSequence(this.documentModel.layers);
    this.touchDocument();
    this.renderAll();
    this.updateStatus(`Updated basic layer settings for ${layer.name}.`);
  }

  applyExtendedLayerSettings() {
    const layer = this.getSelectedLayer();
    if (!layer) {
      return;
    }

    layer.scrollFactorX = clamp(this.refs.scrollFactorXInput.value, -4, 4, layer.scrollFactorX);
    layer.scrollFactorY = clamp(this.refs.scrollFactorYInput.value, -4, 4, layer.scrollFactorY);
    layer.offsetX = Math.trunc(clamp(this.refs.offsetXInput.value, -4096, 4096, layer.offsetX));
    layer.offsetY = Math.trunc(clamp(this.refs.offsetYInput.value, -4096, 4096, layer.offsetY));
    layer.repeatX = this.refs.repeatXSelect.value === "true";
    layer.repeatY = this.refs.repeatYSelect.value === "true";
    layer.wrapMode = this.refs.wrapModeSelect.value === "clamp" ? "clamp" : "wrap";

    this.touchDocument();
    this.renderAll();
    this.updateStatus(`Applied scroll/repeat settings for ${layer.name}.`);
  }

  applyImageSourceFromInput() {
    const layer = this.getSelectedLayer();
    if (!layer) {
      return;
    }

    const source = this.refs.layerImageSourceInput.value.trim();
    if (layer.imageSource && layer.imageSource !== source) {
      const previousTransient = this.getTransientLayerImageSource(layer.imageSource);
      if (previousTransient) {
        URL.revokeObjectURL(previousTransient);
        this.transientLayerImageSourceByName.delete(layer.imageSource.trim());
      }
    }
    layer.imageSource = source;

    this.invalidateImageCache();
    this.touchDocument();
    this.renderAll();
    this.updateStatus(source ? `Assigned image source to ${layer.name}.` : `Cleared image source for ${layer.name}.`);
  }

  assignLocalImageFile(event) {
    const layer = this.getSelectedLayer();
    if (!layer) {
      return;
    }

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const previousSource = layer.imageSource;
    const objectUrl = URL.createObjectURL(file);
    layer.imageSource = file.name;
    this.setTransientLayerImageSource(layer.imageSource, objectUrl);
    if (previousSource && previousSource !== layer.imageSource) {
      const previousTransient = this.getTransientLayerImageSource(previousSource);
      if (previousTransient) {
        URL.revokeObjectURL(previousTransient);
        this.transientLayerImageSourceByName.delete(previousSource.trim());
      }
    }
    this.invalidateImageCache();
    this.touchDocument();
    this.renderAll();
    this.updateStatus(`Assigned local image file ${file.name} to ${layer.name}.`);
    this.refs.layerImageFileInput.value = "";
  }

  handleCameraChange() {
    if (this.isSimulationMode) {
      return;
    }
    const maxHorizontal = Math.max(1024, this.documentModel.map.pixelWidth);
    const maxVertical = Math.max(1024, this.documentModel.map.pixelHeight);
    this.cameraX = Math.trunc(clamp(this.refs.cameraXInput.value, -maxHorizontal, maxHorizontal, 0));
    this.cameraY = Math.trunc(clamp(this.refs.cameraYInput.value, -maxVertical, maxVertical, 0));
    this.refs.cameraReadout.textContent = `camera: ${this.cameraX}, ${this.cameraY}`;
    this.renderPreview();
  }

  renderAll() {
    normalizeDrawOrderSequence(this.documentModel.layers);
    this.renderLayerList();
    this.renderSelectedLayerFields();
    this.renderPreview();
    this.refs.previewMeta.textContent = `${this.documentModel.map.width}x${this.documentModel.map.height} @ ${this.documentModel.map.tileSize}px (${this.documentModel.map.pixelWidth}x${this.documentModel.map.pixelHeight})`;
    this.refs.cameraReadout.textContent = `camera: ${this.cameraX}, ${this.cameraY}`;
    this.refreshSimulationActionState();
    this.updateSimulationContextReadout();
    this.updateRemediationUI();
    this.updateEditorExperienceUI();
    this.updateDebugVisualizationUI();
  }

  renderLayerList() {
    const list = this.refs.layerList;
    list.innerHTML = "";

    const fragment = document.createDocumentFragment();
    this.documentModel.layers.forEach((layer) => {
      const item = document.createElement("li");
      item.className = `layer-item${layer.id === this.selectedLayerId ? " selected" : ""}`;

      const row = document.createElement("div");
      row.className = "layer-row";

      const selectButton = document.createElement("button");
      selectButton.type = "button";
      selectButton.className = "layer-select-btn";
      selectButton.textContent = layer.name;
      selectButton.addEventListener("click", () => {
        this.selectedLayerId = layer.id;
        this.renderAll();
        this.updateStatus(`Selected layer ${layer.name}.`);
      });

      const orderChip = document.createElement("span");
      orderChip.className = "layer-order-chip";
      orderChip.textContent = `order ${layer.drawOrder}`;

      row.appendChild(selectButton);
      row.appendChild(orderChip);
      item.appendChild(row);
      fragment.appendChild(item);
    });

    list.appendChild(fragment);
  }

  renderSelectedLayerFields() {
    const layer = this.getSelectedLayer();
    if (!layer) {
      return;
    }

    this.refs.layerNameInput.value = layer.name;
    this.refs.layerDrawOrderInput.value = String(layer.drawOrder);
    this.refs.layerOpacityInput.value = String(layer.opacity);
    this.refs.layerVisibleSelect.value = layer.visible ? "true" : "false";

    this.refs.layerImageSourceInput.value = layer.imageSource || "";
    this.refs.scrollFactorXInput.value = String(layer.scrollFactorX);
    this.refs.scrollFactorYInput.value = String(layer.scrollFactorY);
    this.refs.offsetXInput.value = String(layer.offsetX);
    this.refs.offsetYInput.value = String(layer.offsetY);
    this.refs.repeatXSelect.value = layer.repeatX ? "true" : "false";
    this.refs.repeatYSelect.value = layer.repeatY ? "true" : "false";
    this.refs.wrapModeSelect.value = layer.wrapMode;
  }

  resolveLayerImageUrl(source) {
    if (!source || source.startsWith("blob:")) {
      return source;
    }

    try {
      const url = new URL(source, window.location.href);
      url.searchParams.set("_cb", String(this.imageCacheVersion));
      return url.toString();
    } catch (error) {
      const separator = source.includes("?") ? "&" : "?";
      return `${source}${separator}_cb=${this.imageCacheVersion}`;
    }
  }

  getLayerImageRecord(layer) {
    const source = this.getTransientLayerImageSource(layer.imageSource) || layer.imageSource;
    if (!source) {
      return null;
    }

    const cacheKey = `${source}::v${this.imageCacheVersion}`;
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey);
    }

    const record = {
      status: "loading",
      image: new Image(),
      error: null
    };

    record.image.onload = () => {
      record.status = "ready";
      this.renderPreview();
    };
    record.image.onerror = () => {
      record.status = "error";
      record.error = "Image failed to load.";
      this.renderPreview();
    };

    if (!source.startsWith("blob:")) {
      record.image.crossOrigin = "anonymous";
    }
    record.image.src = this.resolveLayerImageUrl(source);

    this.imageCache.set(cacheKey, record);
    return record;
  }

  drawFallbackLayer(context, layer, viewportWidth, viewportHeight, screenX, screenY) {
    const color = getLayerVisualColor(layer);
    context.fillStyle = color;

    if (layer.repeatX || layer.repeatY) {
      context.globalAlpha = layer.opacity * 0.25;
      context.fillRect(0, 0, viewportWidth, viewportHeight);
      context.globalAlpha = layer.opacity * 0.6;
      const stripeHeight = Math.max(24, Math.floor(viewportHeight / 10));
      for (let y = 0; y < viewportHeight; y += stripeHeight * 2) {
        context.fillRect(0, y, viewportWidth, stripeHeight);
      }
      return;
    }

    const width = Math.max(240, Math.floor(viewportWidth * 0.4));
    const height = Math.max(140, Math.floor(viewportHeight * 0.25));
    context.globalAlpha = layer.opacity * 0.65;
    context.fillRect(screenX, screenY, width, height);
  }

  drawSingleLayer(context, layer, viewportWidth, viewportHeight, mapOriginX, mapOriginY) {
    if (!layer.visible || layer.opacity <= 0) {
      return;
    }

    const screenX = Math.round(mapOriginX + (-this.cameraX * layer.scrollFactorX) + layer.offsetX);
    const screenY = Math.round(mapOriginY + (-this.cameraY * layer.scrollFactorY) + layer.offsetY);

    context.save();
    context.globalAlpha = layer.opacity;

    const imageRecord = this.getLayerImageRecord(layer);
    if (!imageRecord || imageRecord.status === "error" || imageRecord.status === "loading") {
      this.drawFallbackLayer(context, layer, viewportWidth, viewportHeight, screenX, screenY);
      context.restore();
      return;
    }

    const image = imageRecord.image;
    const tileWidth = Math.max(1, image.naturalWidth || image.width || viewportWidth);
    const tileHeight = Math.max(1, image.naturalHeight || image.height || viewportHeight);

    const xPositions = [];
    const yPositions = [];

    if (layer.repeatX) {
      if (layer.wrapMode === "wrap") {
        let startX = mod(screenX, tileWidth) - tileWidth;
        for (let x = startX; x <= viewportWidth + tileWidth; x += tileWidth) {
          xPositions.push(x);
        }
      } else {
        for (let x = screenX; x <= viewportWidth + tileWidth; x += tileWidth) {
          xPositions.push(x);
        }
        for (let x = screenX - tileWidth; x >= -tileWidth; x -= tileWidth) {
          xPositions.push(x);
        }
      }
    } else {
      xPositions.push(screenX);
    }

    if (layer.repeatY) {
      if (layer.wrapMode === "wrap") {
        let startY = mod(screenY, tileHeight) - tileHeight;
        for (let y = startY; y <= viewportHeight + tileHeight; y += tileHeight) {
          yPositions.push(y);
        }
      } else {
        for (let y = screenY; y <= viewportHeight + tileHeight; y += tileHeight) {
          yPositions.push(y);
        }
        for (let y = screenY - tileHeight; y >= -tileHeight; y -= tileHeight) {
          yPositions.push(y);
        }
      }
    } else {
      yPositions.push(screenY);
    }

    for (let yi = 0; yi < yPositions.length; yi += 1) {
      for (let xi = 0; xi < xPositions.length; xi += 1) {
        context.drawImage(image, Math.round(xPositions[xi]), Math.round(yPositions[yi]));
      }
    }

    context.restore();
  }

  ensureSimulationViewportFocus(focusX) {
    if (!this.isSimulationMode || !this.refs.previewWrap) {
      return;
    }
    const wrap = this.refs.previewWrap;
    const maxScrollX = Math.max(0, wrap.scrollWidth - wrap.clientWidth);
    const targetLeft = Math.max(0, Math.min(maxScrollX, Math.round(focusX - (wrap.clientWidth * 0.45))));
    if (wrap.scrollLeft !== targetLeft) {
      wrap.scrollLeft = targetLeft;
    }
    if (wrap.scrollTop !== 0) {
      wrap.scrollTop = 0;
    }
  }

  renderPreview() {
    const context = this.refs.previewContext;
    const canvas = this.refs.previewCanvas;
    const desiredWidth = Math.max(960, Math.min(4096, this.documentModel.map.pixelWidth + 360));
    const desiredHeight = Math.max(540, Math.min(2160, this.documentModel.map.pixelHeight + 260));
    if (canvas.width !== desiredWidth) {
      canvas.width = desiredWidth;
    }
    if (canvas.height !== desiredHeight) {
      canvas.height = desiredHeight;
    }
    const viewportWidth = canvas.width;
    const viewportHeight = canvas.height;
    const worldWidth = this.documentModel.map.pixelWidth;
    const worldHeight = this.documentModel.map.pixelHeight;
    const mapOriginX = Math.max(20, Math.round((viewportWidth - worldWidth) / 2));
    const mapOriginY = Math.max(20, Math.round((viewportHeight - worldHeight) / 2));

    context.fillStyle = "#0b1830";
    context.fillRect(0, 0, viewportWidth, viewportHeight);

    context.fillStyle = "#0f2340";
    for (let y = 0; y < viewportHeight; y += 48) {
      context.fillRect(0, y, viewportWidth, 24);
    }

    const sortedLayers = cloneDeep(this.documentModel.layers);
    sortLayersByOrder(sortedLayers);

    const progress = this.getSimulationProgress();
    const proxyX = mapOriginX + Math.round(progress * Math.max(1, worldWidth - 1));
    const proxyY = mapOriginY + Math.round(worldHeight * 0.62);
    const visibleHeroLayer = sortedLayers.find((layer) => {
      if (!layer.visible) {
        return false;
      }
      const id = typeof layer.id === "string" ? layer.id.toLowerCase() : "";
      const name = typeof layer.name === "string" ? layer.name.toLowerCase() : "";
      return id.includes("hero") || name.includes("hero");
    });
    const heroDrawOrder = visibleHeroLayer ? visibleHeroLayer.drawOrder : null;
    let markerDrawn = false;
    const drawTraversalMarker = (includeTrackLine) => {
      if (includeTrackLine) {
        context.strokeStyle = "rgba(244, 244, 245, 0.35)";
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(proxyX, mapOriginY);
        context.lineTo(proxyX, mapOriginY + worldHeight);
        context.stroke();
      }
      context.fillStyle = this.isSimulationMode ? "#f59e0b" : "#e2e8f0";
      context.beginPath();
      context.arc(proxyX, proxyY, 8, 0, Math.PI * 2);
      context.fill();
    };

    sortedLayers.forEach((layer) => {
      this.drawSingleLayer(context, layer, viewportWidth, viewportHeight, mapOriginX, mapOriginY);
      if (!markerDrawn && heroDrawOrder !== null && layer.drawOrder >= heroDrawOrder) {
        drawTraversalMarker(false);
        markerDrawn = true;
      }
    });
    if (!markerDrawn) {
      drawTraversalMarker(true);
    }

    context.strokeStyle = "rgba(255, 255, 255, 0.45)";
    context.lineWidth = 2;
    context.strokeRect(mapOriginX, mapOriginY, worldWidth, worldHeight);
    this.ensureSimulationViewportFocus(proxyX);

    const modeText = this.isSimulationMode
      ? `SIMULATION ${this.simulation.playing ? "PLAY" : "PAUSE"}`
      : "EDIT";
    const repeatCount = sortedLayers.filter((layer) => layer.repeatX || layer.repeatY).length;
    const wrapCount = sortedLayers.filter((layer) => layer.wrapMode === "wrap").length;

    if (this.refs.previewDetailsText instanceof HTMLElement) {
      const lines = [
        `Mode: ${modeText}`,
        `Map: ${this.documentModel.map.name}`,
        `Camera: ${this.cameraX}, ${this.cameraY}`,
        `Traverse: ${Math.round(progress * 100)}% (${Math.round(this.simulation.traversedDistance)}/${Math.round(this.simulation.traversalDistance || 0)} px)`,
        `Layers: ${sortedLayers.length} repeat=${repeatCount} wrap=${wrapCount}`
      ];
      sortedLayers.slice(0, 3).forEach((layer) => {
        lines.push(`${layer.drawOrder}:${layer.name} sf(${layer.scrollFactorX.toFixed(2)},${layer.scrollFactorY.toFixed(2)}) ${layer.repeatX ? "RX" : "--"}/${layer.repeatY ? "RY" : "--"} ${layer.wrapMode}`);
      });
      this.refs.previewDetailsText.textContent = lines.join("\n");
    }
    this.updateSimulationContextReadout();
  }

  validateProjectAssets() {
    this.validationResult = validateProjectAssetState({
      registry: this.assetRegistry,
      assetDependencyGraph: this.assetDependencyGraphSnapshot,
      parallaxDocument: this.documentModel
    });
    this.remediationResult = buildProjectAssetRemediation({
      validationResult: this.validationResult,
      registry: this.assetRegistry
    });
    this.editorExperienceResult = buildEditorExperienceLayer({
      assetDependencyGraph: this.validationResult.assetDependencyGraph,
      validationResult: this.validationResult,
      remediationResult: this.remediationResult,
      packageResult: this.lastPackageResult,
      runtimeResult: this.lastRuntimeResult
    });
    this.debugVisualizationResult = buildDebugVisualizationLayer({
      assetDependencyGraph: this.validationResult.assetDependencyGraph,
      validationResult: this.validationResult,
      remediationResult: this.remediationResult,
      packageResult: this.lastPackageResult,
      runtimeResult: this.lastRuntimeResult
    });
    return this.validationResult;
  }

  updateRemediationUI() {
    if (!this.refs.remediationSummaryText) {
      return;
    }
    this.refs.remediationSummaryText.textContent = summarizeProjectAssetRemediation(this.remediationResult);
    const navigateAction = getPrimaryRemediationAction(this.remediationResult, "navigate");
    const fixAction = getPrimaryRemediationAction(this.remediationResult, "confirmable-fix");
    this.refs.inspectRemediationButton.disabled = this.remediationResult?.remediation?.status !== "available";
    this.refs.jumpToProblemButton.disabled = !navigateAction;
    this.refs.applyRemediationButton.disabled = !fixAction;
  }

  updateEditorExperienceUI() {
    if (!this.refs.experienceSummaryText || !this.refs.experienceDetailsText) {
      return;
    }
    this.refs.experienceSummaryText.textContent = summarizeEditorExperienceLayer(this.editorExperienceResult);
    this.refs.experienceDetailsText.textContent = this.editorExperienceResult?.experience?.reportText || "No experience snapshot available.";
  }

  updateDebugVisualizationUI() {
    if (!this.refs.debugSummaryText || !this.refs.debugDetailsText) {
      return;
    }
    this.refs.debugSummaryText.textContent = summarizeDebugVisualizationLayer(this.debugVisualizationResult);
    this.refs.debugDetailsText.textContent = this.debugVisualizationResult?.debugVisualization?.reportText || "No debug visualization available.";
  }

  refreshExperienceSnapshot() {
    this.validateProjectAssets();
    this.updateEditorExperienceUI();
    this.updateStatus(summarizeEditorExperienceLayer(this.editorExperienceResult));
  }

  refreshDebugVisualizationSnapshot() {
    this.validateProjectAssets();
    this.updateDebugVisualizationUI();
    this.updateStatus(summarizeDebugVisualizationLayer(this.debugVisualizationResult));
  }

  inspectRemediationActions() {
    this.validateProjectAssets();
    const actions = this.remediationResult?.remediation?.actions || [];
    if (actions.length === 0) {
      this.updateStatus("No remediation actions are currently available.");
      this.updateRemediationUI();
      return false;
    }
    this.updateStatus(`Remediation actions: ${actions.slice(0, 3).map((action) => `${action.label}: ${action.message}`).join(" | ")}`);
    this.updateRemediationUI();
    return true;
  }

  jumpToRemediationProblem() {
    this.validateProjectAssets();
    const action = getPrimaryRemediationAction(this.remediationResult, "navigate");
    if (!action) {
      this.updateStatus("No navigation remediation action is available.");
      this.updateRemediationUI();
      return false;
    }

    if (action.findingCode === "UNRESOLVED_IMAGE_LINK") {
      const targetLayer = this.documentModel.layers.find((layer) => layer.id === action.sourceId) || this.documentModel.layers[0] || null;
      if (targetLayer) {
        this.selectedLayerId = targetLayer.id;
      }
      this.renderAll();
      this.refs.layerImageSourceInput.focus();
      this.updateStatus(`Jumped to image assignment for ${action.sourceId || "the current layer"}: ${action.message}`);
    } else if (action.findingCode === "MISSING_ASSET_ID" || action.findingCode === "DUPLICATE_REGISTRY_ID") {
      this.refs.saveAssetRegistryButton.focus();
      this.updateStatus(`Jumped to project I/O: ${action.message}`);
    } else {
      this.updateStatus(`Inspected ${action.sourceId || "the current issue"}: ${action.message}`);
    }
    this.updateRemediationUI();
    return true;
  }

  applyRemediationAction() {
    this.validateProjectAssets();
    const action = getPrimaryRemediationAction(this.remediationResult, "confirmable-fix");
    if (!action) {
      this.updateStatus("No confirmable remediation fix is available.");
      this.updateRemediationUI();
      return false;
    }

    const shouldApply = typeof globalThis.confirm === "function"
      ? globalThis.confirm(`${action.label}? ${action.message}`)
      : true;
    if (!shouldApply) {
      this.updateStatus("Remediation fix canceled.");
      this.updateRemediationUI();
      return false;
    }

    if (action.payload?.fixKind === "refresh-owned-registry-entry") {
      this.syncAssetRegistryFromDocument();
    } else if (action.payload?.fixKind === "relink-reference" && action.payload.referenceField === "parallaxSourceId") {
      const targetLayer = this.documentModel.layers.find((layer) => layer.id === action.sourceId) || this.getSelectedLayer();
      if (targetLayer) {
        targetLayer.parallaxSourceId = action.payload.candidateId || "";
      }
      this.resolveAssetRefsFromRegistry();
    } else if (action.payload?.fixKind === "refresh-graph-snapshot") {
      const validation = validateProjectAssetState({
        registry: this.assetRegistry,
        parallaxDocument: this.documentModel
      });
      this.assetDependencyGraphSnapshot = validation.assetDependencyGraph;
    }

    const validation = this.validateProjectAssets();
    this.renderAll();
    this.updateStatus(`Applied remediation: ${action.label}. Validation: ${summarizeAssetValidation(validation)}.`);
    return true;
  }
}

let parallaxSceneStudioApp = null;

function bootParallaxSceneStudio() {
  if (parallaxSceneStudioApp) {
    window.parallaxSceneStudioApp = parallaxSceneStudioApp;
    return parallaxSceneStudioApp;
  }

  const initialDocument = createInitialParallaxDocument();
  const app = new ParallaxEditorApp(initialDocument);
  app.init(document);
  app.applyProjectSystemState = function applyProjectSystemState(snapshot) {
    if (Date.now() <= Number(this.skipExternalProjectStateUntil || 0)) {
      this.skipExternalProjectStateUntil = 0;
      return;
    }
    const nextDocument = sanitizeParallaxDocument(snapshot?.documentModel);
    this.documentModel = nextDocument;
    this.assetRegistry = snapshot?.assetRegistry && typeof snapshot.assetRegistry === "object"
      ? sanitizeAssetRegistry(snapshot.assetRegistry)
      : createAssetRegistry({ projectId: nextDocument?.map?.name || "parallax-project" });
    this.selectedLayerId = typeof snapshot?.selectedLayerId === "string" && nextDocument.layers.some((layer) => layer.id === snapshot.selectedLayerId)
      ? snapshot.selectedLayerId
      : nextDocument.layers[0]?.id || "";
    this.cameraX = Number.isFinite(Number(snapshot?.cameraX)) ? Number(snapshot.cameraX) : 0;
    this.cameraY = Number.isFinite(Number(snapshot?.cameraY)) ? Number(snapshot.cameraY) : 0;
    this.resolveAssetRefsFromRegistry();
    this.clearTransientLayerImageSources();
    this.invalidateImageCache();
    this.syncInputsFromDocument();
    this.renderAll();
    this.updateStatus(`Project state loaded for ${this.documentModel.map.name}.`);
  };
  parallaxSceneStudioApp = app;
  window.parallaxSceneStudioApp = parallaxSceneStudioApp;
  return parallaxSceneStudioApp;
}

registerToolBootContract("parallax-editor", {
  init: bootParallaxSceneStudio,
  destroy() {
    return true;
  },
  getApi() {
    return window.parallaxSceneStudioApp || null;
  }
});

bootParallaxSceneStudio();
