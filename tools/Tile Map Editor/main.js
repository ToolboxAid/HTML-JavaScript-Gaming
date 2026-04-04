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

const DEFAULT_TILESET = [
  { id: 0, name: "Empty", color: "transparent" },
  { id: 1, name: "Grass", color: "#4a8f39" },
  { id: 2, name: "Dirt", color: "#7a5230" },
  { id: 3, name: "Stone", color: "#6b7280" },
  { id: 4, name: "Water", color: "#2563eb" },
  { id: 5, name: "Sand", color: "#d4b46a" },
  { id: 6, name: "Road", color: "#334155" },
  { id: 7, name: "Decor", color: "#9333ea" }
];

const RESERVED_PARALLAX_BLOCK = Object.freeze({
  schema: "toolbox.parallax/1",
  companionEditor: "ParallaxEditor",
  layers: []
});

const SAMPLE_DIRECTORY_PATH = "./samples/";
const SAMPLE_MANIFEST_PATH = "./samples/sample-manifest.json";
const DEFAULT_TILESET_SWATCH_COLOR = "#64748b";

function createDefaultTilesetAtlas(tileSize = 24) {
  const normalizedTileSize = clampInteger(tileSize, 1, 256, 24);
  return {
    schema: "toolbox.tileset-atlas/1",
    imageDataUrl: "",
    imageName: "",
    imageWidth: 0,
    imageHeight: 0,
    tileWidth: normalizedTileSize,
    tileHeight: normalizedTileSize,
    spacing: 0,
    margin: 0
  };
}

function clampInteger(value, min, max, fallback) {
  const numeric = Number.parseInt(value, 10);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, numeric));
}

function createGrid(width, height, fillValue = 0) {
  const rows = [];
  for (let y = 0; y < height; y += 1) {
    const row = [];
    for (let x = 0; x < width; x += 1) {
      row.push(fillValue);
    }
    rows.push(row);
  }
  return rows;
}

function normalizeCellValue(value) {
  const numeric = Number.parseInt(value, 10);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return 0;
  }
  return numeric;
}

function createLayer(id, name, kind, width, height) {
  return {
    id,
    name,
    kind,
    visible: true,
    locked: false,
    data: createGrid(width, height, 0)
  };
}

function cloneDeep(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function loadImageElement(source) {
  return new Promise((resolve, reject) => {
    if (typeof source !== "string" || !source.trim()) {
      reject(new Error("No image source was provided."));
      return;
    }

    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image source."));
    image.src = source;
  });
}

function computeAtlasGridMetrics(config) {
  const imageWidth = clampInteger(config?.imageWidth, 0, 8192, 0);
  const imageHeight = clampInteger(config?.imageHeight, 0, 8192, 0);
  const tileWidth = clampInteger(config?.tileWidth, 1, 512, 16);
  const tileHeight = clampInteger(config?.tileHeight, 1, 512, 16);
  const spacing = clampInteger(config?.spacing, 0, 256, 0);
  const margin = clampInteger(config?.margin, 0, 256, 0);
  const strideX = tileWidth + spacing;
  const strideY = tileHeight + spacing;

  const usableWidth = imageWidth - (margin * 2);
  const usableHeight = imageHeight - (margin * 2);
  const columns = usableWidth >= tileWidth && strideX > 0
    ? 1 + Math.floor((usableWidth - tileWidth) / strideX)
    : 0;
  const rows = usableHeight >= tileHeight && strideY > 0
    ? 1 + Math.floor((usableHeight - tileHeight) / strideY)
    : 0;

  return {
    imageWidth,
    imageHeight,
    tileWidth,
    tileHeight,
    spacing,
    margin,
    columns,
    rows,
    total: columns * rows
  };
}

function buildTilesetFromAtlas(config, startId = 1) {
  const metrics = computeAtlasGridMetrics(config);
  const tiles = [{ id: 0, name: "Empty", color: "transparent", source: null }];
  if (metrics.total <= 0) {
    return { tiles, metrics };
  }

  let nextId = Math.max(1, clampInteger(startId, 1, 9999, 1));
  for (let row = 0; row < metrics.rows; row += 1) {
    for (let col = 0; col < metrics.columns; col += 1) {
      const sourceX = metrics.margin + (col * (metrics.tileWidth + metrics.spacing));
      const sourceY = metrics.margin + (row * (metrics.tileHeight + metrics.spacing));
      tiles.push({
        id: nextId,
        name: `Tile ${nextId}`,
        color: DEFAULT_TILESET_SWATCH_COLOR,
        source: {
          kind: "atlas",
          x: sourceX,
          y: sourceY,
          width: metrics.tileWidth,
          height: metrics.tileHeight
        }
      });
      nextId += 1;
    }
  }

  return { tiles, metrics };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read selected PNG file."));
    reader.readAsDataURL(file);
  });
}

function createInitialDocument(options = {}) {
  const width = clampInteger(options.width ?? 32, 4, 256, 32);
  const height = clampInteger(options.height ?? 18, 4, 256, 18);
  const tileSize = clampInteger(options.tileSize ?? 24, 8, 64, 24);
  const mapName = typeof options.mapName === "string" && options.mapName.trim() ? options.mapName.trim() : "untitled-map";
  const createdAt = new Date().toISOString();

  return {
    schema: "toolbox.tilemap/1",
    version: 1,
    map: {
      name: mapName,
      width,
      height,
      tileSize
    },
    tileset: cloneDeep(DEFAULT_TILESET),
    tilesetAtlas: createDefaultTilesetAtlas(tileSize),
    layers: [
      createLayer("ground", "Ground", "tile", width, height),
      createLayer("collision", "Collision", "collision", width, height),
      createLayer("data", "Data", "data", width, height)
    ],
    markers: [],
    assetRefs: {
      tilemapId: "",
      tilesetId: ""
    },
    parallax: cloneDeep(RESERVED_PARALLAX_BLOCK),
    metadata: {
      createdAt,
      updatedAt: createdAt,
      notes: "Parallax data remains reserved for the separate companion editor."
    }
  };
}

function ensureGridSize(grid, width, height) {
  const nextGrid = createGrid(width, height, 0);
  if (!Array.isArray(grid)) {
    return nextGrid;
  }

  for (let y = 0; y < Math.min(height, grid.length); y += 1) {
    const row = Array.isArray(grid[y]) ? grid[y] : [];
    for (let x = 0; x < Math.min(width, row.length); x += 1) {
      nextGrid[y][x] = normalizeCellValue(row[x]);
    }
  }

  return nextGrid;
}

function sanitizeLayer(rawLayer, index, width, height) {
  const fallbackKinds = ["tile", "collision", "data"];
  const fallbackKind = fallbackKinds[index] || "tile";
  const kind = rawLayer && typeof rawLayer.kind === "string" ? rawLayer.kind : fallbackKind;
  const safeKind = ["tile", "collision", "data"].includes(kind) ? kind : "tile";
  const layerId = rawLayer && typeof rawLayer.id === "string" && rawLayer.id.trim() ? rawLayer.id.trim() : `layer-${index + 1}`;
  const layerName = rawLayer && typeof rawLayer.name === "string" && rawLayer.name.trim() ? rawLayer.name.trim() : `Layer ${index + 1}`;

  return {
    id: layerId,
    name: layerName,
    kind: safeKind,
    visible: rawLayer ? rawLayer.visible !== false : true,
    locked: rawLayer ? rawLayer.locked === true : false,
    data: ensureGridSize(rawLayer ? rawLayer.data : null, width, height)
  };
}

function sanitizeTileset(rawTileset) {
  if (!Array.isArray(rawTileset) || rawTileset.length === 0) {
    return cloneDeep(DEFAULT_TILESET);
  }

  const sanitizeTileSource = (rawSource) => {
    if (!rawSource || typeof rawSource !== "object") {
      return null;
    }

    const inferredKind = rawSource.kind === "image" || (typeof rawSource.imageDataUrl === "string" && rawSource.imageDataUrl.trim())
      ? "image"
      : "atlas";

    if (inferredKind === "image") {
      const imageDataUrl = typeof rawSource.imageDataUrl === "string" ? rawSource.imageDataUrl : "";
      if (!imageDataUrl) {
        return null;
      }
      return {
        kind: "image",
        imageDataUrl,
        imageName: typeof rawSource.imageName === "string" && rawSource.imageName.trim() ? rawSource.imageName.trim() : "tile.png",
        width: clampInteger(rawSource.width ?? rawSource.sourceWidth, 1, 512, 24),
        height: clampInteger(rawSource.height ?? rawSource.sourceHeight, 1, 512, 24)
      };
    }

    return {
      kind: "atlas",
      x: clampInteger(rawSource.x, 0, 8192, 0),
      y: clampInteger(rawSource.y, 0, 8192, 0),
      width: clampInteger(rawSource.width, 1, 512, 1),
      height: clampInteger(rawSource.height, 1, 512, 1)
    };
  };

  const tileMap = new Map();
  rawTileset.forEach((entry, index) => {
    const id = clampInteger(entry?.id ?? index, 0, 9999, index);
    if (!tileMap.has(id)) {
      const name = typeof entry?.name === "string" && entry.name.trim() ? entry.name.trim() : `Tile ${id}`;
      const color = typeof entry?.color === "string" ? entry.color : DEFAULT_TILESET_SWATCH_COLOR;
      const source = sanitizeTileSource(entry?.source);
      tileMap.set(id, { id, name, color, source });
    }
  });

  if (!tileMap.has(0)) {
    tileMap.set(0, { ...cloneDeep(DEFAULT_TILESET[0]), source: null });
  }

  const ordered = Array.from(tileMap.values()).sort((a, b) => a.id - b.id);
  const emptyTile = ordered.find((entry) => entry.id === 0);
  if (emptyTile) {
    emptyTile.source = null;
  }
  return ordered;
}

function sanitizeTilesetAtlas(rawAtlas, fallbackTileSize = 24) {
  const fallback = createDefaultTilesetAtlas(fallbackTileSize);
  if (!rawAtlas || typeof rawAtlas !== "object") {
    return fallback;
  }

  return {
    schema: "toolbox.tileset-atlas/1",
    imageDataUrl: typeof rawAtlas.imageDataUrl === "string" ? rawAtlas.imageDataUrl : "",
    imageName: typeof rawAtlas.imageName === "string" ? rawAtlas.imageName : "",
    imageWidth: clampInteger(rawAtlas.imageWidth, 0, 8192, 0),
    imageHeight: clampInteger(rawAtlas.imageHeight, 0, 8192, 0),
    tileWidth: clampInteger(rawAtlas.tileWidth, 1, 512, fallback.tileWidth),
    tileHeight: clampInteger(rawAtlas.tileHeight, 1, 512, fallback.tileHeight),
    spacing: clampInteger(rawAtlas.spacing, 0, 256, 0),
    margin: clampInteger(rawAtlas.margin, 0, 256, 0)
  };
}

function sanitizeMarkers(rawMarkers, width, height) {
  if (!Array.isArray(rawMarkers)) {
    return [];
  }

  const markers = [];
  rawMarkers.forEach((marker, index) => {
    const col = clampInteger(marker?.col, 0, width - 1, 0);
    const row = clampInteger(marker?.row, 0, height - 1, 0);
    const markerType = marker?.type === "object" ? "object" : "spawn";
    const markerName = typeof marker?.name === "string" && marker.name.trim() ? marker.name.trim() : `${markerType}-${index + 1}`;

    markers.push({
      id: typeof marker?.id === "string" && marker.id.trim() ? marker.id.trim() : `marker-${Date.now()}-${index}`,
      type: markerType,
      name: markerName,
      col,
      row,
      properties: typeof marker?.properties === "object" && marker.properties ? cloneDeep(marker.properties) : {}
    });
  });

  return markers;
}

function sanitizeAssetRefs(rawAssetRefs) {
  if (!rawAssetRefs || typeof rawAssetRefs !== "object") {
    return {
      tilemapId: "",
      tilesetId: ""
    };
  }

  return {
    ...cloneDeep(rawAssetRefs),
    tilemapId: typeof rawAssetRefs.tilemapId === "string" ? rawAssetRefs.tilemapId.trim() : "",
    tilesetId: typeof rawAssetRefs.tilesetId === "string" ? rawAssetRefs.tilesetId.trim() : "",
    parallaxSourceIds: Array.isArray(rawAssetRefs.parallaxSourceIds)
      ? Array.from(new Set(rawAssetRefs.parallaxSourceIds.filter((value) => typeof value === "string" && value.trim())))
      : undefined
  };
}

function sanitizeDocument(rawDocument) {
  const fallback = createInitialDocument();
  if (!rawDocument || typeof rawDocument !== "object") {
    return fallback;
  }

  const width = clampInteger(rawDocument?.map?.width, 4, 256, fallback.map.width);
  const height = clampInteger(rawDocument?.map?.height, 4, 256, fallback.map.height);
  const tileSize = clampInteger(rawDocument?.map?.tileSize, 8, 64, fallback.map.tileSize);
  const mapName = typeof rawDocument?.map?.name === "string" && rawDocument.map.name.trim() ? rawDocument.map.name.trim() : fallback.map.name;
  const tilesetAtlas = sanitizeTilesetAtlas(rawDocument.tilesetAtlas, tileSize);

  const rawLayers = Array.isArray(rawDocument.layers) ? rawDocument.layers : [];
  const layers = rawLayers.length > 0
    ? rawLayers.map((layer, index) => sanitizeLayer(layer, index, width, height))
    : cloneDeep(fallback.layers);

  return {
    schema: "toolbox.tilemap/1",
    version: Number.isFinite(rawDocument.version) ? rawDocument.version : 1,
    map: {
      name: mapName,
      width,
      height,
      tileSize
    },
    tileset: sanitizeTileset(rawDocument.tileset),
    tilesetAtlas,
    layers,
    markers: sanitizeMarkers(rawDocument.markers, width, height),
    assetRefs: sanitizeAssetRefs(rawDocument.assetRefs),
    parallax: {
      schema: "toolbox.parallax/1",
      companionEditor: "ParallaxEditor",
      layers: Array.isArray(rawDocument?.parallax?.layers) ? cloneDeep(rawDocument.parallax.layers) : []
    },
    metadata: {
      createdAt: typeof rawDocument?.metadata?.createdAt === "string" ? rawDocument.metadata.createdAt : fallback.metadata.createdAt,
      updatedAt: new Date().toISOString(),
      notes: "Parallax data remains reserved for the separate companion editor."
    }
  };
}

function generateLayerId(existingLayers, desiredName) {
  const base = desiredName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "layer";
  let candidate = base;
  let counter = 1;

  while (existingLayers.some((layer) => layer.id === candidate)) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }

  return candidate;
}

function createRuntimeExport(documentModel) {
  const tileLayers = [];
  const collisionLayers = [];
  const dataLayers = [];

  documentModel.layers.forEach((layer) => {
    const payload = {
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      data: cloneDeep(layer.data)
    };

    if (layer.kind === "collision") {
      collisionLayers.push(payload);
      return;
    }

    if (layer.kind === "data") {
      dataLayers.push(payload);
      return;
    }

    tileLayers.push(payload);
  });

  return {
    schema: "toolbox.tilemap-runtime/1",
    map: cloneDeep(documentModel.map),
    tileset: cloneDeep(documentModel.tileset),
    tilesetAtlas: sanitizeTilesetAtlas(documentModel.tilesetAtlas, documentModel.map.tileSize),
    layers: {
      tile: tileLayers,
      collision: collisionLayers,
      data: dataLayers
    },
    markers: cloneDeep(documentModel.markers),
    parallax: cloneDeep(documentModel.parallax)
  };
}

function downloadTextFile(fileName, content) {
  const blob = new Blob([content], { type: "application/json" });
  const blobUrl = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = fileName;
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(blobUrl);
}

function summarizeGraphFindings(findings) {
  return Array.isArray(findings) && findings.length > 0
    ? ` Graph findings: ${findings.length}.`
    : " Graph findings: none.";
}

function normalizeSamplePath(pathValue) {
  if (typeof pathValue !== "string") {
    return null;
  }

  const trimmed = pathValue.trim().replace(/\\/g, "/");
  if (!trimmed || trimmed.includes("..")) {
    return null;
  }

  if (trimmed.startsWith("./samples/")) {
    return trimmed;
  }
  if (trimmed.startsWith("samples/")) {
    return `./${trimmed}`;
  }
  return `./samples/${trimmed}`;
}

function toSampleLabel(pathValue) {
  const fileName = String(pathValue).split("/").pop() || String(pathValue);
  const base = fileName.replace(/\.json$/i, "");
  const words = base.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!words) {
    return "Sample";
  }
  return words.replace(/\b\w/g, (value) => value.toUpperCase());
}

class TileMapEditorApp {
  constructor(documentModel) {
    this.documentModel = documentModel;
    this.selectedLayerId = documentModel.layers[0]?.id || "";
    this.activeTileId = 1;
    this.activeTool = "paint";
    this.hoverCell = null;
    this.isPointerPainting = false;
    this.selectedMarkerId = "";
    this.refs = {};
    this.sampleEntries = [];
    this.isSimulationMode = false;
    this.simulation = {
      rafId: 0,
      lastTimestamp: 0,
      accumulatorMs: 0,
      playing: false,
      probeCol: 0,
      probeRow: 0,
      routeIndex: 0,
      routeDirection: 1,
      totalCells: 0,
      visitedCells: new Set(),
      collisionHits: 0,
      dataHits: 0,
      markerHits: 0,
      currentCellSummary: "",
      currentTraversalSummary: ""
    };
    this.tilesetImage = null;
    this.tilesetImageCache = new Map();
    this.assetRegistry = createAssetRegistry({ projectId: documentModel?.map?.name || "tilemap-project" });
  }

  init(rootDocument) {
    this.captureRefs(rootDocument);
    this.attachEvents();
    this.syncInputsFromDocument();
    this.renderAll();
    void this.reloadTilesetImageFromDocument({ quiet: true });
    void this.preloadIndividualTileImages({ quiet: true });
    this.loadSampleManifest();
  }

  captureRefs(rootDocument) {
    this.refs.newProjectButton = rootDocument.getElementById("newProjectButton");
    this.refs.loadProjectButton = rootDocument.getElementById("loadProjectButton");
    this.refs.loadProjectInput = rootDocument.getElementById("loadProjectInput");
    this.refs.sampleSelect = rootDocument.getElementById("sampleSelect");
    this.refs.loadSampleButton = rootDocument.getElementById("loadSampleButton");
    this.refs.saveProjectButton = rootDocument.getElementById("saveProjectButton");
    this.refs.loadAssetRegistryButton = rootDocument.getElementById("loadAssetRegistryButton");
    this.refs.loadAssetRegistryInput = rootDocument.getElementById("loadAssetRegistryInput");
    this.refs.saveAssetRegistryButton = rootDocument.getElementById("saveAssetRegistryButton");
    this.refs.simulateButton = rootDocument.getElementById("simulateButton");
    this.refs.playSimulationButton = rootDocument.getElementById("playSimulationButton");
    this.refs.pauseSimulationButton = rootDocument.getElementById("pauseSimulationButton");
    this.refs.restartSimulationButton = rootDocument.getElementById("restartSimulationButton");
    this.refs.exitSimulationButton = rootDocument.getElementById("exitSimulationButton");
    this.refs.exportRuntimeButton = rootDocument.getElementById("exportRuntimeButton");

    this.refs.mapNameInput = rootDocument.getElementById("mapNameInput");
    this.refs.mapWidthInput = rootDocument.getElementById("mapWidthInput");
    this.refs.mapHeightInput = rootDocument.getElementById("mapHeightInput");
    this.refs.tileSizeInput = rootDocument.getElementById("tileSizeInput");
    this.refs.applyMapSizeButton = rootDocument.getElementById("applyMapSizeButton");

    this.refs.activeToolSelect = rootDocument.getElementById("activeToolSelect");
    this.refs.selectedLayerKindBadge = rootDocument.getElementById("selectedLayerKindBadge");
    this.refs.activeLayerName = rootDocument.getElementById("activeLayerName");
    this.refs.canvasMeta = rootDocument.getElementById("canvasMeta");
    this.refs.simulationContext = rootDocument.getElementById("simulationContext");

    this.refs.tilePalette = rootDocument.getElementById("tilePalette");
    this.refs.loadTilesetPngButton = rootDocument.getElementById("loadTilesetPngButton");
    this.refs.loadTilesetPngInput = rootDocument.getElementById("loadTilesetPngInput");
    this.refs.loadTilePngAssetsButton = rootDocument.getElementById("loadTilePngAssetsButton");
    this.refs.loadTilePngAssetsInput = rootDocument.getElementById("loadTilePngAssetsInput");
    this.refs.tilesetTileWidthInput = rootDocument.getElementById("tilesetTileWidthInput");
    this.refs.tilesetTileHeightInput = rootDocument.getElementById("tilesetTileHeightInput");
    this.refs.tilesetSpacingInput = rootDocument.getElementById("tilesetSpacingInput");
    this.refs.tilesetMarginInput = rootDocument.getElementById("tilesetMarginInput");
    this.refs.generateTilesetButton = rootDocument.getElementById("generateTilesetButton");
    this.refs.tilesetMeta = rootDocument.getElementById("tilesetMeta");

    this.refs.layerList = rootDocument.getElementById("layerList");
    this.refs.newLayerNameInput = rootDocument.getElementById("newLayerNameInput");
    this.refs.newLayerKindSelect = rootDocument.getElementById("newLayerKindSelect");
    this.refs.addLayerButton = rootDocument.getElementById("addLayerButton");
    this.refs.removeLayerButton = rootDocument.getElementById("removeLayerButton");
    this.refs.layerVisibilityToggle = rootDocument.getElementById("layerVisibilityToggle");

    this.refs.markerTypeSelect = rootDocument.getElementById("markerTypeSelect");
    this.refs.markerNameInput = rootDocument.getElementById("markerNameInput");
    this.refs.clearMarkersButton = rootDocument.getElementById("clearMarkersButton");
    this.refs.markerList = rootDocument.getElementById("markerList");

    this.refs.statusText = rootDocument.getElementById("statusText");
    this.refs.canvasWrap = rootDocument.querySelector(".canvas-wrap");
    this.refs.mapCanvas = rootDocument.getElementById("mapCanvas");
    this.refs.canvasContext = this.refs.mapCanvas.getContext("2d", { alpha: false });
  }

  attachEvents() {
    this.refs.newProjectButton.addEventListener("click", () => this.handleNewProject());
    this.refs.loadProjectButton.addEventListener("click", () => this.refs.loadProjectInput.click());
    this.refs.loadProjectInput.addEventListener("change", (event) => this.handleLoadProject(event));
    this.refs.loadSampleButton.addEventListener("click", () => this.handleLoadSelectedSample());
    this.refs.sampleSelect.addEventListener("change", () => this.handleSampleSelectionChanged());
    this.refs.sampleSelect.addEventListener("focus", () => {
      void this.loadSampleManifest({ quiet: true });
    });
    this.refs.saveProjectButton.addEventListener("click", () => this.handleSaveProject());
    this.refs.loadAssetRegistryButton.addEventListener("click", () => this.refs.loadAssetRegistryInput.click());
    this.refs.loadAssetRegistryInput.addEventListener("change", (event) => this.handleLoadAssetRegistry(event));
    this.refs.saveAssetRegistryButton.addEventListener("click", () => this.handleSaveAssetRegistry());
    this.refs.simulateButton.addEventListener("click", () => this.enterSimulationMode());
    this.refs.playSimulationButton.addEventListener("click", () => this.resumeSimulation());
    this.refs.pauseSimulationButton.addEventListener("click", () => this.pauseSimulation());
    this.refs.restartSimulationButton.addEventListener("click", () => this.restartSimulationPosition());
    this.refs.exitSimulationButton.addEventListener("click", () => this.exitSimulationMode());
    this.refs.exportRuntimeButton.addEventListener("click", () => this.handleExportRuntime());

    this.refs.mapNameInput.addEventListener("change", () => {
      if (!this.ensureEditable()) {
        this.refs.mapNameInput.value = this.documentModel.map.name;
        return;
      }
      this.documentModel.map.name = this.refs.mapNameInput.value.trim() || "untitled-map";
      this.touchDocument();
      this.updateStatus(`Map renamed to ${this.documentModel.map.name}.`);
    });

    this.refs.applyMapSizeButton.addEventListener("click", () => this.applyMapSizing());

    this.refs.activeToolSelect.addEventListener("change", () => {
      this.activeTool = this.refs.activeToolSelect.value;
      this.updateStatus(`Tool changed to ${this.activeTool}.`);
    });

    this.refs.addLayerButton.addEventListener("click", () => this.addLayer());
    this.refs.removeLayerButton.addEventListener("click", () => this.removeSelectedLayer());
    this.refs.layerVisibilityToggle.addEventListener("click", () => this.toggleSelectedLayerVisibility());
    this.refs.loadTilesetPngButton.addEventListener("click", () => this.refs.loadTilesetPngInput.click());
    this.refs.loadTilesetPngInput.addEventListener("change", (event) => {
      void this.handleLoadTilesetPng(event);
    });
    this.refs.loadTilePngAssetsButton.addEventListener("click", () => this.refs.loadTilePngAssetsInput.click());
    this.refs.loadTilePngAssetsInput.addEventListener("change", (event) => {
      void this.handleLoadTilePngAssets(event);
    });
    this.refs.generateTilesetButton.addEventListener("click", () => {
      void this.generateTilesetFromLoadedPng();
    });

    this.refs.clearMarkersButton.addEventListener("click", () => {
      if (!this.ensureEditable()) {
        return;
      }
      this.documentModel.markers = [];
      this.selectedMarkerId = "";
      this.touchDocument();
      this.renderAll();
      this.updateStatus("All markers cleared.");
    });

    this.refs.mapCanvas.addEventListener("mousedown", (event) => this.handleCanvasPointerDown(event));
    this.refs.mapCanvas.addEventListener("mousemove", (event) => this.handleCanvasPointerMove(event));
    this.refs.mapCanvas.addEventListener("mouseleave", () => this.handleCanvasPointerLeave());
    this.refs.mapCanvas.addEventListener("contextmenu", (event) => event.preventDefault());
    if (this.refs.canvasWrap) {
      this.refs.canvasWrap.addEventListener("scroll", () => {
        if (this.isSimulationMode) {
          this.updateSimulationContext();
        }
      });
    }

    window.addEventListener("mouseup", () => {
      this.isPointerPainting = false;
    });
  }

  handleNewProject() {
    this.exitSimulationMode();
    const width = clampInteger(this.refs.mapWidthInput.value, 4, 256, 32);
    const height = clampInteger(this.refs.mapHeightInput.value, 4, 256, 18);
    const tileSize = clampInteger(this.refs.tileSizeInput.value, 8, 64, 24);
    const mapName = this.refs.mapNameInput.value.trim() || "untitled-map";

    this.documentModel = createInitialDocument({ width, height, tileSize, mapName });
    this.selectedLayerId = this.documentModel.layers[0]?.id || "";
    this.selectedMarkerId = "";
    this.activeTileId = 1;
    this.tilesetImage = null;
    this.tilesetImageCache = new Map();
    this.syncInputsFromDocument();
    this.renderAll();
    this.updateStatus("Created a new map document.");
  }

  syncAssetRegistryFromDocument(options = {}) {
    const mapName = this.documentModel?.map?.name || "tile-map";
    this.assetRegistry = sanitizeAssetRegistry(this.assetRegistry);
    this.assetRegistry.projectId = this.assetRegistry.projectId || mapName;

    const nextAssetRefs = sanitizeAssetRefs(this.documentModel.assetRefs);
    const atlas = this.documentModel.tilesetAtlas || {};
    const atlasImagePath = normalizeProjectRelativePath(atlas.imageName || options.tilesetPath || "");
    const tilemapFileName = `${mapName || "tile-map"}.tilemap.json`;
    const tilemapPath = normalizeProjectRelativePath(options.tilemapPath || `assets/tilemaps/${tilemapFileName}`);
    const tilemapId = nextAssetRefs.tilemapId || createAssetId("tilemap", mapName, "tilemap");

    nextAssetRefs.tilemapId = tilemapId;

    if (atlasImagePath) {
      const tilesetId = nextAssetRefs.tilesetId || createAssetId("tileset", mapName, "tileset");

      this.assetRegistry = upsertRegistryEntry(this.assetRegistry, "tilesets", {
        id: tilesetId,
        name: `${mapName} Tileset`,
        path: atlasImagePath,
        tileWidth: atlas.tileWidth,
        tileHeight: atlas.tileHeight,
        sourceTool: "tile-map-editor"
      });

      nextAssetRefs.tilesetId = tilesetId;
    }

    this.assetRegistry = upsertRegistryEntry(this.assetRegistry, "tilemaps", {
      id: tilemapId,
      name: mapName,
      path: tilemapPath,
      tilesetId: nextAssetRefs.tilesetId || "",
      sourceTool: "tile-map-editor"
    });

    this.documentModel.assetRefs = nextAssetRefs;
  }

  resolveAssetRefsFromRegistry() {
    const refs = sanitizeAssetRefs(this.documentModel.assetRefs);
    this.documentModel.assetRefs = refs;
    const resolution = {
      tilesetResolved: false,
      missingTilesetRef: false
    };

    if (refs.tilesetId && !normalizeProjectRelativePath(this.documentModel.tilesetAtlas?.imageName || "")) {
      const tilesetEntry = findRegistryEntryById(this.assetRegistry, "tilesets", refs.tilesetId);
      const tilesetPath = normalizeProjectRelativePath(tilesetEntry?.path || "");
      if (tilesetPath) {
        this.documentModel.tilesetAtlas.imageName = tilesetPath;
        resolution.tilesetResolved = true;
      } else {
        resolution.missingTilesetRef = true;
      }
    }

    return resolution;
  }

  handleSaveProject() {
    this.touchDocument();
    this.syncAssetRegistryFromDocument();
    const { graph, findings } = buildAssetDependencyGraph(this.assetRegistry);
    const output = cloneDeep(this.documentModel);
    output.project = {
      ...(output.project && typeof output.project === "object" ? output.project : {}),
      assetDependencyGraph: graph
    };
    const serialized = JSON.stringify(output, null, 2);
    const fileName = `${this.documentModel.map.name || "tile-map"}.tilemap.json`;
    downloadTextFile(fileName, serialized);
    this.updateStatus(
      `Saved ${fileName} (tilemapRef=${this.documentModel.assetRefs.tilemapId || "none"}, tilesetRef=${this.documentModel.assetRefs.tilesetId || "none"}).${summarizeGraphFindings(findings)}`
    );
  }

  handleSaveAssetRegistry() {
    this.syncAssetRegistryFromDocument();
    const { findings } = buildAssetDependencyGraph(this.assetRegistry);
    const payload = createRegistryDownloadPayload(this.assetRegistry);
    downloadTextFile("project.assets.json", payload);
    this.updateStatus(`Saved project.assets.json (${this.assetRegistry.tilemaps.length} tilemaps, ${this.assetRegistry.tilesets.length} tilesets).${summarizeGraphFindings(findings)}`);
  }

  handleExportRuntime() {
    const runtimePayload = createRuntimeExport(this.documentModel);
    const serialized = JSON.stringify(runtimePayload, null, 2);
    const fileName = `${this.documentModel.map.name || "tile-map"}.runtime.json`;
    downloadTextFile(fileName, serialized);
    this.updateStatus(`Exported ${fileName}.`);
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
        const parsed = JSON.parse(String(reader.result));
        this.documentModel = sanitizeDocument(parsed);
        const resolution = this.resolveAssetRefsFromRegistry();
        this.selectedLayerId = this.documentModel.layers[0]?.id || "";
        this.selectedMarkerId = "";
        this.activeTileId = this.findFirstNonEmptyTileId();
        this.tilesetImageCache = new Map();
        this.syncInputsFromDocument();
        this.renderAll();
        void this.reloadTilesetImageFromDocument({ quiet: true });
        void this.preloadIndividualTileImages({ quiet: true });
        if (resolution.tilesetResolved) {
          this.updateStatus(`Loaded ${file.name} (tileset restored from asset registry).`);
        } else if (resolution.missingTilesetRef) {
          this.updateStatus(`Loaded ${file.name} (tileset asset ref missing in registry; using embedded tileset data).`);
        } else {
          this.updateStatus(`Loaded ${file.name}.`);
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
        this.renderAll();
        void this.reloadTilesetImageFromDocument({ quiet: true });
        if (resolution.tilesetResolved) {
          this.updateStatus(`Loaded ${file.name} (${this.assetRegistry.tilemaps.length} tilemaps, ${this.assetRegistry.tilesets.length} tilesets; tileset ref restored).`);
        } else if (resolution.missingTilesetRef) {
          this.updateStatus(`Loaded ${file.name} (${this.assetRegistry.tilemaps.length} tilemaps, ${this.assetRegistry.tilesets.length} tilesets; tileset ref still unresolved).`);
        } else {
          this.updateStatus(`Loaded ${file.name} (${this.assetRegistry.tilemaps.length} tilemaps, ${this.assetRegistry.tilesets.length} tilesets).`);
        }
      } catch (error) {
        this.updateStatus(`Asset registry load failed: ${error instanceof Error ? error.message : "invalid JSON"}`);
      }

      this.refs.loadAssetRegistryInput.value = "";
    };

    reader.readAsText(file);
  }

  findFirstNonEmptyTileId() {
    const tiles = this.documentModel.tileset;
    for (let index = 0; index < tiles.length; index += 1) {
      if (tiles[index].id > 0) {
        return tiles[index].id;
      }
    }
    return tiles[0]?.id ?? 0;
  }

  readTilesetAtlasSettingsFromInputs() {
    const fallback = sanitizeTilesetAtlas(this.documentModel.tilesetAtlas, this.documentModel.map.tileSize);
    return {
      ...fallback,
      tileWidth: clampInteger(this.refs.tilesetTileWidthInput.value, 1, 512, fallback.tileWidth),
      tileHeight: clampInteger(this.refs.tilesetTileHeightInput.value, 1, 512, fallback.tileHeight),
      spacing: clampInteger(this.refs.tilesetSpacingInput.value, 0, 256, fallback.spacing),
      margin: clampInteger(this.refs.tilesetMarginInput.value, 0, 256, fallback.margin)
    };
  }

  applyTilesetAtlasSettingsFromInputs() {
    const next = this.readTilesetAtlasSettingsFromInputs();
    this.documentModel.tilesetAtlas = next;
    this.refs.tilesetTileWidthInput.value = String(next.tileWidth);
    this.refs.tilesetTileHeightInput.value = String(next.tileHeight);
    this.refs.tilesetSpacingInput.value = String(next.spacing);
    this.refs.tilesetMarginInput.value = String(next.margin);
    return next;
  }

  async reloadTilesetImageFromDocument(options = {}) {
    const quiet = options.quiet === true;
    const atlas = sanitizeTilesetAtlas(this.documentModel.tilesetAtlas, this.documentModel.map.tileSize);
    this.documentModel.tilesetAtlas = atlas;
    if (!atlas.imageDataUrl) {
      this.tilesetImage = null;
      this.renderTileset();
      this.renderTilesetMeta();
      this.renderCanvas();
      return;
    }

    try {
      const image = await loadImageElement(atlas.imageDataUrl);
      this.tilesetImage = image;
      atlas.imageWidth = image.naturalWidth || atlas.imageWidth;
      atlas.imageHeight = image.naturalHeight || atlas.imageHeight;
      this.documentModel.tilesetAtlas = atlas;
      this.renderTileset();
      this.renderTilesetMeta();
      this.renderCanvas();
    } catch (error) {
      this.tilesetImage = null;
      this.renderTileset();
      this.renderTilesetMeta();
      this.renderCanvas();
      if (!quiet) {
        this.updateStatus(`Tileset PNG failed to load: ${error instanceof Error ? error.message : "unknown error"}`);
      }
    }
  }

  getNextTileId() {
    let maxId = 0;
    this.documentModel.tileset.forEach((tile) => {
      maxId = Math.max(maxId, clampInteger(tile?.id, 0, 9999, 0));
    });
    return maxId + 1;
  }

  getPreservedTilesForAtlasRegeneration() {
    const preserved = [];
    let hasEmpty = false;
    this.documentModel.tileset.forEach((tile) => {
      if (!tile || !Number.isFinite(Number(tile.id))) {
        return;
      }
      const safeId = clampInteger(tile.id, 0, 9999, 0);
      if (safeId === 0) {
        hasEmpty = true;
        preserved.push({ ...tile, id: 0, source: null });
        return;
      }

      if (tile.source && tile.source.kind === "image") {
        preserved.push(tile);
      }
    });

    if (!hasEmpty) {
      preserved.unshift({ id: 0, name: "Empty", color: "transparent", source: null });
    }
    return preserved;
  }

  composeTilesetWithAtlasTiles(atlasTiles) {
    const preserved = this.getPreservedTilesForAtlasRegeneration();
    const baseTiles = preserved.filter((tile) => tile.id !== 0).sort((a, b) => a.id - b.id);
    const maxBaseId = baseTiles.reduce((maxId, tile) => Math.max(maxId, clampInteger(tile.id, 1, 9999, 1)), 0);
    const atlasOnlyTiles = Array.isArray(atlasTiles)
      ? atlasTiles.filter((tile) => tile && tile.id > 0)
      : [];
    const resequencedAtlasTiles = atlasOnlyTiles.map((tile, index) => {
      const nextId = maxBaseId + index + 1;
      return {
        ...tile,
        id: nextId,
        name: typeof tile.name === "string" && tile.name.trim() ? tile.name.trim() : `Tile ${nextId}`
      };
    });

    return [
      { id: 0, name: "Empty", color: "transparent", source: null },
      ...baseTiles,
      ...resequencedAtlasTiles
    ];
  }

  async preloadIndividualTileImages(options = {}) {
    const quiet = options.quiet === true;
    const loadedUrls = new Set();

    for (let index = 0; index < this.documentModel.tileset.length; index += 1) {
      const tile = this.documentModel.tileset[index];
      const source = tile?.source;
      if (!source || source.kind !== "image" || !source.imageDataUrl) {
        continue;
      }
      if (loadedUrls.has(source.imageDataUrl)) {
        continue;
      }

      loadedUrls.add(source.imageDataUrl);
      if (this.tilesetImageCache.has(source.imageDataUrl)) {
        continue;
      }

      try {
        const image = await loadImageElement(source.imageDataUrl);
        this.tilesetImageCache.set(source.imageDataUrl, image);
      } catch (error) {
        if (!quiet) {
          this.updateStatus(`Tile PNG failed to load (${source.imageName || "tile"}): ${error instanceof Error ? error.message : "unknown error"}`);
        }
      }
    }

    this.renderTileset();
    this.renderCanvas();
  }

  async handleLoadTilesetPng(event) {
    if (!this.ensureEditable()) {
      this.refs.loadTilesetPngInput.value = "";
      return;
    }
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const imageDataUrl = await readFileAsDataUrl(file);

      const image = await loadImageElement(String(imageDataUrl));
      const atlas = sanitizeTilesetAtlas(this.documentModel.tilesetAtlas, this.documentModel.map.tileSize);
      atlas.imageDataUrl = String(imageDataUrl);
      atlas.imageName = file.name || "tileset.png";
      atlas.imageWidth = image.naturalWidth || 0;
      atlas.imageHeight = image.naturalHeight || 0;
      this.documentModel.tilesetAtlas = atlas;
      this.tilesetImage = image;
      this.touchDocument();
      this.syncInputsFromDocument();
      this.renderTileset();
      this.renderCanvas();
      const successMessage = `Loaded tileset PNG ${atlas.imageName}. Set tile size/spacing/margin and click Generate Tile Grid.`;
      this.updateStatus(successMessage);
    } catch (error) {
      const failureMessage = `Tileset PNG load failed: ${error instanceof Error ? error.message : "unknown error"}`;
      this.updateStatus(failureMessage);
      if (typeof globalThis.alert === "function") {
        globalThis.alert(failureMessage);
      }
    } finally {
      this.refs.loadTilesetPngInput.value = "";
    }
  }

  async handleLoadTilePngAssets(event) {
    if (!this.ensureEditable()) {
      this.refs.loadTilePngAssetsInput.value = "";
      return;
    }

    const files = Array.from(event.target.files || []).filter((file) => file && /\.png$/i.test(file.name));
    if (files.length === 0) {
      this.refs.loadTilePngAssetsInput.value = "";
      return;
    }

    let importedCount = 0;
    let failedCount = 0;
    let firstImportedTileId = null;

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      try {
        const imageDataUrl = await readFileAsDataUrl(file);
        const image = await loadImageElement(imageDataUrl);
        const width = Math.max(1, clampInteger(image.naturalWidth, 1, 1024, this.documentModel.map.tileSize));
        const height = Math.max(1, clampInteger(image.naturalHeight, 1, 1024, this.documentModel.map.tileSize));
        const nextTileId = this.getNextTileId();
        const safeName = file.name.replace(/\.png$/i, "").trim() || `Tile ${nextTileId}`;

        this.documentModel.tileset.push({
          id: nextTileId,
          name: safeName,
          color: DEFAULT_TILESET_SWATCH_COLOR,
          source: {
            kind: "image",
            imageDataUrl,
            imageName: file.name || `${safeName}.png`,
            width,
            height
          }
        });
        this.tilesetImageCache.set(imageDataUrl, image);
        importedCount += 1;
        if (firstImportedTileId === null) {
          firstImportedTileId = nextTileId;
        }
      } catch (error) {
        failedCount += 1;
        this.updateStatus(`Tile PNG import failed (${file.name}): ${error instanceof Error ? error.message : "unknown error"}`);
      }
    }

    if (importedCount > 0) {
      this.activeTileId = firstImportedTileId ?? this.activeTileId;
      this.touchDocument();
      this.renderAll();
      this.updateStatus(`Imported ${importedCount} tile PNG asset${importedCount === 1 ? "" : "s"}${failedCount > 0 ? ` (${failedCount} failed)` : ""}.`);
    } else if (failedCount > 0) {
      const failureMessage = `Tile PNG import failed for all selected files (${failedCount}).`;
      this.updateStatus(failureMessage);
      if (typeof globalThis.alert === "function") {
        globalThis.alert(failureMessage);
      }
    }

    this.refs.loadTilePngAssetsInput.value = "";
  }

  async generateTilesetFromLoadedPng() {
    if (!this.ensureEditable()) {
      return;
    }

    const atlas = this.applyTilesetAtlasSettingsFromInputs();
    if (!atlas.imageDataUrl) {
      this.updateStatus("Load a tileset PNG before generating tiles.");
      return;
    }

    let image = this.tilesetImage;
    if (!image) {
      try {
        image = await loadImageElement(atlas.imageDataUrl);
        this.tilesetImage = image;
      } catch (error) {
        const failureMessage = `Tileset image decode failed: ${error instanceof Error ? error.message : "unknown error"}`;
        this.updateStatus(failureMessage);
        if (typeof globalThis.alert === "function") {
          globalThis.alert(failureMessage);
        }
        return;
      }
    }

    if (image && image.naturalWidth > 0 && image.naturalHeight > 0) {
      atlas.imageWidth = image.naturalWidth;
      atlas.imageHeight = image.naturalHeight;
      this.documentModel.tilesetAtlas = atlas;
      this.renderTilesetMeta();
    }

    const preservedTiles = this.getPreservedTilesForAtlasRegeneration();
    const maxPreservedId = preservedTiles.reduce((maxId, tile) => Math.max(maxId, clampInteger(tile.id, 0, 9999, 0)), 0);
    const result = buildTilesetFromAtlas(atlas, maxPreservedId + 1);
    if (result.metrics.total <= 0) {
      this.renderTilesetMeta();
      const failureMessage = `No tiles fit: image ${result.metrics.imageWidth}x${result.metrics.imageHeight}, tile ${result.metrics.tileWidth}x${result.metrics.tileHeight}, spacing ${result.metrics.spacing}, margin ${result.metrics.margin}.`;
      this.updateStatus(failureMessage);
      if (typeof globalThis.alert === "function") {
        globalThis.alert(failureMessage);
      }
      return;
    }

    this.documentModel.tileset = this.composeTilesetWithAtlasTiles(result.tiles);
    this.activeTileId = this.findFirstNonEmptyTileId();
    this.touchDocument();
    this.renderAll();
    const importedPngCount = this.documentModel.tileset.filter((tile) => tile.id > 0 && tile?.source?.kind === "image").length;
    this.updateStatus(`Generated ${result.metrics.total} atlas tiles (${result.metrics.columns} x ${result.metrics.rows}) from ${atlas.imageName || "tileset PNG"}; preserved ${importedPngCount} imported PNG tile${importedPngCount === 1 ? "" : "s"}.`);
  }

  applyMapSizing() {
    if (!this.ensureEditable()) {
      return;
    }
    const nextWidth = clampInteger(this.refs.mapWidthInput.value, 4, 256, this.documentModel.map.width);
    const nextHeight = clampInteger(this.refs.mapHeightInput.value, 4, 256, this.documentModel.map.height);
    const nextTileSize = clampInteger(this.refs.tileSizeInput.value, 8, 64, this.documentModel.map.tileSize);

    this.documentModel.map.width = nextWidth;
    this.documentModel.map.height = nextHeight;
    this.documentModel.map.tileSize = nextTileSize;

    this.documentModel.layers = this.documentModel.layers.map((layer, index) => sanitizeLayer(layer, index, nextWidth, nextHeight));
    this.documentModel.markers = sanitizeMarkers(this.documentModel.markers, nextWidth, nextHeight);

    this.touchDocument();
    this.renderAll();
    this.updateStatus(`Map resized to ${nextWidth}x${nextHeight} at ${nextTileSize}px tiles.`);
  }

  getSelectedLayer() {
    return this.documentModel.layers.find((layer) => layer.id === this.selectedLayerId) || this.documentModel.layers[0] || null;
  }

  ensureEditable() {
    if (this.isSimulationMode) {
      this.updateStatus("Exit Simulation to edit the project.");
      return false;
    }
    return true;
  }

  addLayer() {
    if (!this.ensureEditable()) {
      return;
    }
    const name = this.refs.newLayerNameInput.value.trim() || "Layer";
    const kind = ["tile", "collision", "data"].includes(this.refs.newLayerKindSelect.value)
      ? this.refs.newLayerKindSelect.value
      : "tile";

    const id = generateLayerId(this.documentModel.layers, name);
    const layer = createLayer(id, name, kind, this.documentModel.map.width, this.documentModel.map.height);

    this.documentModel.layers.push(layer);
    this.selectedLayerId = layer.id;
    this.touchDocument();
    this.renderAll();
    this.updateStatus(`Added ${kind} layer ${name}.`);
  }

  removeSelectedLayer() {
    if (!this.ensureEditable()) {
      return;
    }
    if (this.documentModel.layers.length <= 1) {
      this.updateStatus("Cannot remove the last layer.");
      return;
    }

    const targetIndex = this.documentModel.layers.findIndex((layer) => layer.id === this.selectedLayerId);
    if (targetIndex < 0) {
      return;
    }

    const removed = this.documentModel.layers[targetIndex];
    this.documentModel.layers.splice(targetIndex, 1);
    this.selectedLayerId = this.documentModel.layers[Math.max(0, targetIndex - 1)].id;
    this.touchDocument();
    this.renderAll();
    this.updateStatus(`Removed layer ${removed.name}.`);
  }

  toggleSelectedLayerVisibility() {
    if (!this.ensureEditable()) {
      return;
    }
    const layer = this.getSelectedLayer();
    if (!layer) {
      return;
    }

    layer.visible = !layer.visible;
    this.touchDocument();
    this.renderAll();
    this.updateStatus(`${layer.name} visibility: ${layer.visible ? "on" : "off"}.`);
  }

  handleCanvasPointerDown(event) {
    if (!this.ensureEditable()) {
      return;
    }
    const cell = this.getCellFromMouseEvent(event);
    if (!cell) {
      return;
    }

    if (this.activeTool === "marker") {
      if (event.button === 2) {
        this.removeMarkerAtCell(cell.col, cell.row);
      } else {
        this.placeMarkerAtCell(cell.col, cell.row);
      }
      return;
    }

    const eraseMode = event.button === 2 || this.activeTool === "erase";
    this.applyCellEdit(cell.col, cell.row, eraseMode ? "erase" : this.activeTool);

    if (this.activeTool === "paint" || this.activeTool === "erase") {
      this.isPointerPainting = event.button === 0;
    }
  }

  handleCanvasPointerMove(event) {
    const cell = this.getCellFromMouseEvent(event);
    this.hoverCell = cell;

    if (cell && this.isPointerPainting && (this.activeTool === "paint" || this.activeTool === "erase")) {
      this.applyCellEdit(cell.col, cell.row, this.activeTool);
    }

    this.renderCanvas();
    if (cell) {
      this.refs.canvasMeta.textContent = `Cell ${cell.col}, ${cell.row}`;
    } else {
      this.refs.canvasMeta.textContent = `${this.documentModel.map.width}x${this.documentModel.map.height}`;
    }
  }

  handleCanvasPointerLeave() {
    this.hoverCell = null;
    this.isPointerPainting = false;
    this.renderCanvas();
    this.refs.canvasMeta.textContent = `${this.documentModel.map.width}x${this.documentModel.map.height}`;
  }

  getCellFromMouseEvent(event) {
    const rect = this.refs.mapCanvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return null;
    }

    const canvasX = (event.clientX - rect.left) * (this.refs.mapCanvas.width / rect.width);
    const canvasY = (event.clientY - rect.top) * (this.refs.mapCanvas.height / rect.height);

    const tileSize = this.documentModel.map.tileSize;
    const col = Math.floor(canvasX / tileSize);
    const row = Math.floor(canvasY / tileSize);

    if (col < 0 || row < 0 || col >= this.documentModel.map.width || row >= this.documentModel.map.height) {
      return null;
    }

    return { col, row };
  }

  applyCellEdit(col, row, mode) {
    if (!this.ensureEditable()) {
      return;
    }
    const layer = this.getSelectedLayer();
    if (!layer || layer.locked || !layer.visible) {
      return;
    }

    if (mode === "picker") {
      const sampled = normalizeCellValue(layer.data[row][col]);
      this.activeTileId = sampled;
      this.renderTileset();
      this.updateStatus(`Sampled tile ${sampled} at ${col}, ${row}.`);
      return;
    }

    let nextValue = 0;
    if (mode === "erase") {
      nextValue = 0;
    } else if (layer.kind === "collision") {
      nextValue = 1;
    } else {
      nextValue = this.activeTileId;
    }

    if (layer.data[row][col] === nextValue) {
      return;
    }

    layer.data[row][col] = nextValue;
    this.touchDocument();
    this.renderCanvas();
  }

  placeMarkerAtCell(col, row) {
    if (!this.ensureEditable()) {
      return;
    }
    const markerType = this.refs.markerTypeSelect.value === "object" ? "object" : "spawn";
    const markerName = this.refs.markerNameInput.value.trim() || (markerType === "spawn" ? "spawn-point" : "map-object");

    const existing = this.documentModel.markers.find((marker) => marker.col === col && marker.row === row && marker.type === markerType);
    if (existing) {
      existing.name = markerName;
      this.selectedMarkerId = existing.id;
      this.touchDocument();
      this.renderAll();
      this.updateStatus(`Updated ${markerType} marker at ${col}, ${row}.`);
      return;
    }

    const marker = {
      id: `marker-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      type: markerType,
      name: markerName,
      col,
      row,
      properties: {}
    };

    this.documentModel.markers.push(marker);
    this.selectedMarkerId = marker.id;
    this.touchDocument();
    this.renderAll();
    this.updateStatus(`Placed ${markerType} marker at ${col}, ${row}.`);
  }

  removeMarkerAtCell(col, row) {
    if (!this.ensureEditable()) {
      return;
    }
    const index = this.documentModel.markers.findIndex((marker) => marker.col === col && marker.row === row);
    if (index < 0) {
      return;
    }

    const removed = this.documentModel.markers[index];
    this.documentModel.markers.splice(index, 1);
    if (this.selectedMarkerId === removed.id) {
      this.selectedMarkerId = "";
    }
    this.touchDocument();
    this.renderAll();
    this.updateStatus(`Removed marker ${removed.name}.`);
  }

  touchDocument() {
    this.documentModel.metadata.updatedAt = new Date().toISOString();
  }

  syncInputsFromDocument() {
    this.refs.mapNameInput.value = this.documentModel.map.name;
    this.refs.mapWidthInput.value = String(this.documentModel.map.width);
    this.refs.mapHeightInput.value = String(this.documentModel.map.height);
    this.refs.tileSizeInput.value = String(this.documentModel.map.tileSize);
    this.refs.activeToolSelect.value = this.activeTool;
    const atlas = sanitizeTilesetAtlas(this.documentModel.tilesetAtlas, this.documentModel.map.tileSize);
    this.documentModel.tilesetAtlas = atlas;
    this.refs.tilesetTileWidthInput.value = String(atlas.tileWidth);
    this.refs.tilesetTileHeightInput.value = String(atlas.tileHeight);
    this.refs.tilesetSpacingInput.value = String(atlas.spacing);
    this.refs.tilesetMarginInput.value = String(atlas.margin);
    this.renderTilesetMeta();
  }

  refreshSimulationActionState() {
    const inSimulation = this.isSimulationMode;
    this.refs.simulateButton.disabled = inSimulation;
    this.refs.playSimulationButton.disabled = !inSimulation || this.simulation.playing;
    this.refs.pauseSimulationButton.disabled = !inSimulation || !this.simulation.playing;
    this.refs.restartSimulationButton.disabled = !inSimulation;
    this.refs.exitSimulationButton.disabled = !inSimulation;
  }

  createSampleEntry(pathValue, labelHint = "", idHint = "") {
    const path = normalizeSamplePath(pathValue);
    if (!path) {
      return null;
    }
    const normalizedLabel = typeof labelHint === "string" ? labelHint.trim() : "";
    const fallbackLabel = toSampleLabel(path);
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
    const previousSelection = normalizeSamplePath(this.refs.sampleSelect.value);
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
        this.updateStatus(`Loaded ${sampleEntries.length} local tile-map samples from ${SAMPLE_DIRECTORY_PATH}.`);
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
          this.updateStatus(`Loaded ${sampleEntries.length} local tile-map samples from ${SAMPLE_MANIFEST_PATH}.`);
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
    const selectedPath = normalizeSamplePath(this.refs.sampleSelect.value);
    if (selectedPath) {
      this.updateStatus(`Sample selected: ${selectedPath}`);
    }
  }

  async handleLoadSelectedSample() {
    const selectedPath = normalizeSamplePath(this.refs.sampleSelect.value);
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
      this.documentModel = sanitizeDocument(raw);
      this.resolveAssetRefsFromRegistry();
      this.selectedLayerId = this.documentModel.layers[0]?.id || "";
      this.selectedMarkerId = "";
      this.activeTileId = this.findFirstNonEmptyTileId();
      this.tilesetImageCache = new Map();
      this.syncInputsFromDocument();
      this.renderAll();
      void this.reloadTilesetImageFromDocument({ quiet: true });
      void this.preloadIndividualTileImages({ quiet: true });
      this.updateStatus(`Loaded sample ${selectedPath}.`);
    } catch (error) {
      this.updateStatus(`Sample load failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  getSimulationStartCell() {
    const spawnMarker = this.documentModel.markers.find((marker) => marker.type === "spawn");
    const fallbackMarker = spawnMarker || this.documentModel.markers[0] || null;
    if (fallbackMarker) {
      return {
        col: clampInteger(fallbackMarker.col, 0, this.documentModel.map.width - 1, 0),
        row: clampInteger(fallbackMarker.row, 0, this.documentModel.map.height - 1, 0)
      };
    }
    return { col: 0, row: 0 };
  }

  getSimulationRouteIndexFromCell(col, row) {
    const mapWidth = this.documentModel.map.width;
    const safeRow = clampInteger(row, 0, this.documentModel.map.height - 1, 0);
    const safeCol = clampInteger(col, 0, mapWidth - 1, 0);
    const offset = safeRow % 2 === 0 ? safeCol : (mapWidth - 1 - safeCol);
    return (safeRow * mapWidth) + offset;
  }

  setSimulationProbeFromRouteIndex() {
    const mapWidth = this.documentModel.map.width;
    const row = Math.floor(this.simulation.routeIndex / mapWidth);
    const offset = this.simulation.routeIndex % mapWidth;
    const col = row % 2 === 0 ? offset : (mapWidth - 1 - offset);
    this.simulation.probeCol = col;
    this.simulation.probeRow = row;
  }

  inspectSimulationCell(col, row) {
    const tileLayers = this.documentModel.layers.filter((layer) => layer.kind === "tile" && layer.visible);
    const collisionLayers = this.documentModel.layers.filter((layer) => layer.kind === "collision" && layer.visible);
    const dataLayers = this.documentModel.layers.filter((layer) => layer.kind === "data" && layer.visible);

    const tileValues = tileLayers.map((layer) => normalizeCellValue(layer.data[row][col])).filter((value) => value > 0);
    const collisionHit = collisionLayers.some((layer) => normalizeCellValue(layer.data[row][col]) > 0);
    const dataValues = dataLayers.map((layer) => normalizeCellValue(layer.data[row][col])).filter((value) => value > 0);
    const markers = this.documentModel.markers.filter((marker) => marker.col === col && marker.row === row);

    return { tileValues, collisionHit, dataValues, markers };
  }

  buildSimulationCellSummaryFromDetails(details) {
    const markerText = details.markers.length > 0
      ? details.markers.map((marker) => `${marker.type}:${marker.name}`).join(", ")
      : "none";
    return `tile=${details.tileValues.length > 0 ? details.tileValues.join("|") : 0} collision=${details.collisionHit ? "hit" : "none"} data=${details.dataValues.length > 0 ? details.dataValues.join("|") : 0} objects=${markerText}`;
  }

  resetSimulationTraversalState(playing) {
    const mapWidth = this.documentModel.map.width;
    const mapHeight = this.documentModel.map.height;
    this.simulation.totalCells = mapWidth * mapHeight;
    this.simulation.routeDirection = 1;
    const startCell = this.getSimulationStartCell();
    this.simulation.routeIndex = this.getSimulationRouteIndexFromCell(startCell.col, startCell.row);
    this.simulation.playing = playing;
    this.simulation.lastTimestamp = 0;
    this.simulation.accumulatorMs = 0;
    this.simulation.visitedCells = new Set();
    this.simulation.collisionHits = 0;
    this.simulation.dataHits = 0;
    this.simulation.markerHits = 0;
    this.setSimulationProbeFromRouteIndex();

    const details = this.inspectSimulationCell(this.simulation.probeCol, this.simulation.probeRow);
    this.simulation.currentCellSummary = this.buildSimulationCellSummaryFromDetails(details);
    this.simulation.visitedCells.add(`${this.simulation.probeCol},${this.simulation.probeRow}`);
    if (details.collisionHit) {
      this.simulation.collisionHits += 1;
    }
    if (details.dataValues.length > 0) {
      this.simulation.dataHits += 1;
    }
    if (details.markers.length > 0) {
      this.simulation.markerHits += details.markers.length;
    }
    this.updateSimulationContext();
  }

  ensureSimulationProbeVisible(forceCenter = false) {
    if (!this.refs.canvasWrap) {
      return;
    }
    const wrap = this.refs.canvasWrap;
    const tileSize = this.documentModel.map.tileSize;
    const targetX = (this.simulation.probeCol * tileSize) + Math.floor(tileSize / 2);
    const targetY = (this.simulation.probeRow * tileSize) + Math.floor(tileSize / 2);
    const maxScrollX = Math.max(0, wrap.scrollWidth - wrap.clientWidth);
    const maxScrollY = Math.max(0, wrap.scrollHeight - wrap.clientHeight);

    if (forceCenter) {
      wrap.scrollLeft = Math.max(0, Math.min(maxScrollX, Math.round(targetX - (wrap.clientWidth / 2))));
      wrap.scrollTop = Math.max(0, Math.min(maxScrollY, Math.round(targetY - (wrap.clientHeight / 2))));
      return;
    }

    const marginX = Math.max(48, Math.floor(wrap.clientWidth * 0.2));
    const marginY = Math.max(48, Math.floor(wrap.clientHeight * 0.2));
    let nextScrollLeft = wrap.scrollLeft;
    let nextScrollTop = wrap.scrollTop;

    if (targetX < wrap.scrollLeft + marginX) {
      nextScrollLeft = Math.max(0, Math.round(targetX - marginX));
    } else if (targetX > wrap.scrollLeft + wrap.clientWidth - marginX) {
      nextScrollLeft = Math.min(maxScrollX, Math.round(targetX - wrap.clientWidth + marginX));
    }

    if (targetY < wrap.scrollTop + marginY) {
      nextScrollTop = Math.max(0, Math.round(targetY - marginY));
    } else if (targetY > wrap.scrollTop + wrap.clientHeight - marginY) {
      nextScrollTop = Math.min(maxScrollY, Math.round(targetY - wrap.clientHeight + marginY));
    }

    if (nextScrollLeft !== wrap.scrollLeft) {
      wrap.scrollLeft = nextScrollLeft;
    }
    if (nextScrollTop !== wrap.scrollTop) {
      wrap.scrollTop = nextScrollTop;
    }
  }

  updateSimulationContext() {
    if (!this.isSimulationMode) {
      this.refs.simulationContext.textContent = "";
      return;
    }
    const visitedCount = this.simulation.visitedCells.size;
    const totalCells = Math.max(1, this.simulation.totalCells);
    const progressPercent = Math.round((visitedCount / totalCells) * 100);
    const tileSize = this.documentModel.map.tileSize;
    const wrap = this.refs.canvasWrap;
    const viewportSummary = wrap
      ? `view c${Math.floor(wrap.scrollLeft / tileSize)}-${Math.ceil((wrap.scrollLeft + wrap.clientWidth) / tileSize)}, r${Math.floor(wrap.scrollTop / tileSize)}-${Math.ceil((wrap.scrollTop + wrap.clientHeight) / tileSize)}`
      : "view n/a";

    const playback = this.simulation.playing ? "PLAY" : "PAUSE";
    this.simulation.currentTraversalSummary = `${playback} ${progressPercent}% (${visitedCount}/${totalCells}) collisions:${this.simulation.collisionHits} data:${this.simulation.dataHits} markers:${this.simulation.markerHits} ${viewportSummary}`;
    this.refs.simulationContext.textContent = this.simulation.currentTraversalSummary;
  }

  enterSimulationMode() {
    if (this.isSimulationMode) {
      return;
    }
    this.isSimulationMode = true;
    this.isPointerPainting = false;
    this.resetSimulationTraversalState(true);
    this.refreshSimulationActionState();
    this.updateStatus("Simulation mode active. Full-map traversal preview is now running.");
    this.startSimulationLoop();
    this.ensureSimulationProbeVisible(true);
    this.renderCanvas();
  }

  pauseSimulation() {
    if (!this.isSimulationMode || !this.simulation.playing) {
      return;
    }
    this.simulation.playing = false;
    this.simulation.lastTimestamp = 0;
    this.simulation.accumulatorMs = 0;
    this.refreshSimulationActionState();
    this.updateSimulationContext();
    this.renderCanvas();
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
    this.updateSimulationContext();
    this.renderCanvas();
    this.updateStatus("Simulation resumed.");
  }

  restartSimulationPosition() {
    if (!this.isSimulationMode) {
      return;
    }
    this.resetSimulationTraversalState(this.simulation.playing);
    this.ensureSimulationProbeVisible(true);
    this.refreshSimulationActionState();
    this.renderCanvas();
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
    this.simulation.currentCellSummary = "";
    this.simulation.currentTraversalSummary = "";
    this.simulation.visitedCells = new Set();
    this.refs.simulationContext.textContent = "";
    this.isPointerPainting = false;
    this.refreshSimulationActionState();
    this.renderCanvas();
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

        const delta = timestamp - this.simulation.lastTimestamp;
        this.simulation.lastTimestamp = timestamp;
        this.simulation.accumulatorMs += delta;

        const stepMs = Math.max(100, Math.min(220, Math.round(120 + (24000 / Math.max(1200, this.simulation.totalCells)))));
        while (this.simulation.accumulatorMs >= stepMs) {
          this.advanceSimulationProbe();
          this.simulation.accumulatorMs -= stepMs;
        }
      }

      this.renderCanvas();
      this.simulation.rafId = requestAnimationFrame(tick);
    };

    this.simulation.rafId = requestAnimationFrame(tick);
  }

  advanceSimulationProbe() {
    if (this.simulation.totalCells <= 1) {
      this.updateSimulationContext();
      return;
    }

    let nextIndex = this.simulation.routeIndex + this.simulation.routeDirection;
    if (nextIndex < 0 || nextIndex >= this.simulation.totalCells) {
      this.simulation.routeDirection *= -1;
      nextIndex = this.simulation.routeIndex + this.simulation.routeDirection;
    }

    this.simulation.routeIndex = Math.max(0, Math.min(this.simulation.totalCells - 1, nextIndex));
    this.setSimulationProbeFromRouteIndex();

    const details = this.inspectSimulationCell(this.simulation.probeCol, this.simulation.probeRow);
    this.simulation.currentCellSummary = this.buildSimulationCellSummaryFromDetails(details);
    this.simulation.visitedCells.add(`${this.simulation.probeCol},${this.simulation.probeRow}`);
    if (details.collisionHit) {
      this.simulation.collisionHits += 1;
    }
    if (details.dataValues.length > 0) {
      this.simulation.dataHits += 1;
    }
    if (details.markers.length > 0) {
      this.simulation.markerHits += details.markers.length;
    }
    this.ensureSimulationProbeVisible();
    this.updateSimulationContext();
  }

  buildSimulationCellSummary(col, row) {
    const details = this.inspectSimulationCell(col, row);
    return this.buildSimulationCellSummaryFromDetails(details);
  }

  renderAll() {
    this.renderLayerList();
    this.renderTileset();
    this.renderTilesetMeta();
    this.renderMarkerList();
    this.renderCanvas();
    this.renderLayerMeta();
    this.refs.canvasMeta.textContent = `${this.documentModel.map.width}x${this.documentModel.map.height}`;
    this.refreshSimulationActionState();
    this.updateSimulationContext();
  }

  renderLayerMeta() {
    const layer = this.getSelectedLayer();
    if (!layer) {
      this.refs.selectedLayerKindBadge.textContent = "Layer: none";
      this.refs.activeLayerName.textContent = "No layer";
      return;
    }

    this.refs.selectedLayerKindBadge.textContent = `Layer: ${layer.kind}`;
    this.refs.activeLayerName.textContent = layer.name;
  }

  getTileSourceDrawInfo(tile) {
    if (!tile || tile.id <= 0 || !tile.source || typeof tile.source !== "object") {
      return null;
    }

    const source = tile.source;
    const sourceKind = source.kind === "image" ? "image" : "atlas";
    if (sourceKind === "image") {
      const imageDataUrl = typeof source.imageDataUrl === "string" ? source.imageDataUrl : "";
      if (!imageDataUrl || !this.tilesetImageCache.has(imageDataUrl)) {
        return null;
      }
      const image = this.tilesetImageCache.get(imageDataUrl);
      const sourceWidth = Math.max(1, clampInteger(image?.naturalWidth, 1, 8192, clampInteger(source.width, 1, 8192, 1)));
      const sourceHeight = Math.max(1, clampInteger(image?.naturalHeight, 1, 8192, clampInteger(source.height, 1, 8192, 1)));
      return {
        image,
        sourceX: 0,
        sourceY: 0,
        sourceWidth,
        sourceHeight,
        sourceLabel: `${source.imageName || "tile.png"} ${sourceWidth}x${sourceHeight}`
      };
    }

    if (!this.tilesetImage) {
      return null;
    }

    return {
      image: this.tilesetImage,
      sourceX: clampInteger(source.x, 0, 8192, 0),
      sourceY: clampInteger(source.y, 0, 8192, 0),
      sourceWidth: clampInteger(source.width, 1, 8192, 1),
      sourceHeight: clampInteger(source.height, 1, 8192, 1),
      sourceLabel: `${clampInteger(source.x, 0, 8192, 0)},${clampInteger(source.y, 0, 8192, 0)}`
    };
  }

  renderTileset() {
    const container = this.refs.tilePalette;
    container.innerHTML = "";

    const fragment = document.createDocumentFragment();
    this.documentModel.tileset.forEach((tile) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `tile-swatch${tile.id === this.activeTileId ? " active" : ""}`;
      button.dataset.tileId = String(tile.id);
      button.title = `${tile.name} (${tile.id})`;

      let swatch;
      const drawInfo = this.getTileSourceDrawInfo(tile);
      if (drawInfo) {
        const previewCanvas = document.createElement("canvas");
        previewCanvas.className = "tile-image-preview";
        previewCanvas.width = 28;
        previewCanvas.height = 28;
        const previewContext = previewCanvas.getContext("2d");
        if (previewContext) {
          previewContext.imageSmoothingEnabled = false;
          previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
          previewContext.drawImage(
            drawInfo.image,
            drawInfo.sourceX,
            drawInfo.sourceY,
            drawInfo.sourceWidth,
            drawInfo.sourceHeight,
            0,
            0,
            previewCanvas.width,
            previewCanvas.height
          );
        }
        swatch = previewCanvas;
      } else {
        const colorSwatch = document.createElement("span");
        colorSwatch.className = "tile-color-preview";
        colorSwatch.style.background = tile.color;
        if (tile.id === 0) {
          colorSwatch.style.backgroundImage = "repeating-linear-gradient(45deg, #0f172a 0, #0f172a 4px, #334155 4px, #334155 8px)";
        }
        swatch = colorSwatch;
      }

      const label = document.createElement("span");
      label.textContent = drawInfo
        ? `${tile.name} (${tile.id}) [${drawInfo.sourceLabel}]`
        : `${tile.name} (${tile.id})`;

      button.appendChild(swatch);
      button.appendChild(label);
      button.addEventListener("click", () => {
        this.activeTileId = tile.id;
        this.renderTileset();
        this.updateStatus(`Selected tile ${tile.name} (${tile.id}).`);
      });

      fragment.appendChild(button);
    });

    container.appendChild(fragment);
  }

  renderTilesetMeta() {
    const atlas = sanitizeTilesetAtlas(this.documentModel.tilesetAtlas, this.documentModel.map.tileSize);
    const metrics = computeAtlasGridMetrics(atlas);
    const importedPngCount = this.documentModel.tileset.filter((tile) => tile.id > 0 && tile?.source?.kind === "image").length;
    if (!atlas.imageDataUrl) {
      this.refs.tilesetMeta.textContent = `No tileset PNG loaded. Load a PNG and generate a tile grid. Imported PNG tiles: ${importedPngCount}.`;
      return;
    }

    const imageName = atlas.imageName || "tileset.png";
    const generatedCount = this.documentModel.tileset.filter((tile) => tile.id > 0 && tile?.source?.kind !== "image").length;
    this.refs.tilesetMeta.textContent = `${imageName} ${atlas.imageWidth}x${atlas.imageHeight} | slice ${atlas.tileWidth}x${atlas.tileHeight} spacing ${atlas.spacing} margin ${atlas.margin} | grid ${metrics.columns}x${metrics.rows} (${metrics.total}) | generated ${generatedCount} | imported PNG tiles ${importedPngCount}`;
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
      selectButton.className = "layer-name";
      selectButton.textContent = layer.name;
      selectButton.addEventListener("click", () => {
        this.selectedLayerId = layer.id;
        this.renderLayerList();
        this.renderLayerMeta();
        this.updateStatus(`Selected layer ${layer.name}.`);
      });

      const kind = document.createElement("span");
      kind.className = "layer-kind";
      kind.textContent = layer.kind;

      const visibilityButton = document.createElement("button");
      visibilityButton.type = "button";
      visibilityButton.textContent = layer.visible ? "Hide" : "Show";
      visibilityButton.addEventListener("click", () => {
        if (!this.ensureEditable()) {
          return;
        }
        layer.visible = !layer.visible;
        this.touchDocument();
        this.renderAll();
        this.updateStatus(`${layer.name} visibility: ${layer.visible ? "on" : "off"}.`);
      });

      row.appendChild(selectButton);
      row.appendChild(kind);
      row.appendChild(visibilityButton);

      item.appendChild(row);
      fragment.appendChild(item);
    });

    list.appendChild(fragment);
  }

  renderMarkerList() {
    const list = this.refs.markerList;
    list.innerHTML = "";

    if (this.documentModel.markers.length === 0) {
      const emptyItem = document.createElement("li");
      emptyItem.className = "marker-item";
      emptyItem.textContent = "No markers yet.";
      list.appendChild(emptyItem);
      return;
    }

    const fragment = document.createDocumentFragment();
    this.documentModel.markers.forEach((marker) => {
      const item = document.createElement("li");
      item.className = `marker-item${marker.id === this.selectedMarkerId ? " selected" : ""}`;

      const row = document.createElement("div");
      row.className = "marker-row";

      const label = document.createElement("button");
      label.type = "button";
      label.className = "marker-name";
      label.textContent = `${marker.type}: ${marker.name} @ ${marker.col},${marker.row}`;
      label.addEventListener("click", () => {
        this.selectedMarkerId = marker.id;
        this.renderMarkerList();
        this.renderCanvas();
      });

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", () => {
        if (!this.ensureEditable()) {
          return;
        }
        const index = this.documentModel.markers.findIndex((entry) => entry.id === marker.id);
        if (index >= 0) {
          this.documentModel.markers.splice(index, 1);
          if (this.selectedMarkerId === marker.id) {
            this.selectedMarkerId = "";
          }
          this.touchDocument();
          this.renderAll();
          this.updateStatus(`Removed marker ${marker.name}.`);
        }
      });

      row.appendChild(label);
      row.appendChild(removeButton);
      item.appendChild(row);
      fragment.appendChild(item);
    });

    list.appendChild(fragment);
  }

  renderCanvas() {
    const canvas = this.refs.mapCanvas;
    const context = this.refs.canvasContext;
    const { width, height, tileSize } = this.documentModel.map;

    canvas.width = width * tileSize;
    canvas.height = height * tileSize;

    context.fillStyle = "#0f172a";
    context.fillRect(0, 0, canvas.width, canvas.height);

    this.drawCheckerboard(context, width, height, tileSize);

    this.documentModel.layers.forEach((layer) => {
      if (!layer.visible) {
        return;
      }

      if (layer.kind === "tile") {
        this.drawTileLayer(context, layer, tileSize);
        return;
      }

      if (layer.kind === "collision") {
        this.drawCollisionLayer(context, layer, tileSize);
        return;
      }

      if (layer.kind === "data") {
        this.drawDataLayer(context, layer, tileSize);
      }
    });

    this.drawGrid(context, width, height, tileSize);
    this.drawMarkers(context, tileSize);
    if (this.isSimulationMode) {
      if (!this.simulation.currentCellSummary) {
        this.simulation.currentCellSummary = this.buildSimulationCellSummary(this.simulation.probeCol, this.simulation.probeRow);
      }
      this.updateSimulationContext();
      this.drawSimulationOverlay(context, tileSize);
    }

    if (this.hoverCell) {
      context.strokeStyle = "#f59e0b";
      context.lineWidth = 2;
      context.strokeRect(
        this.hoverCell.col * tileSize + 1,
        this.hoverCell.row * tileSize + 1,
        tileSize - 2,
        tileSize - 2
      );
    }
  }

  drawSimulationOverlay(context, tileSize) {
    const details = this.inspectSimulationCell(this.simulation.probeCol, this.simulation.probeRow);
    const probeX = this.simulation.probeCol * tileSize + (tileSize / 2);
    const probeY = this.simulation.probeRow * tileSize + (tileSize / 2);
    const probeRadius = Math.max(4, Math.floor(tileSize * 0.25));

    context.save();
    context.fillStyle = details.collisionHit ? "#f87171" : "#f8fafc";
    context.beginPath();
    context.arc(probeX, probeY, probeRadius, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = details.collisionHit ? "#7f1d1d" : "#0f172a";
    context.lineWidth = 2;
    context.stroke();

    context.fillStyle = "rgba(15, 23, 42, 0.82)";
    context.fillRect(8, 8, Math.min(context.canvas.width - 16, 980), 74);
    context.fillStyle = "#e2e8f0";
    context.font = "12px monospace";
    context.textBaseline = "top";
    context.fillText(`SIMULATION MODE (${this.simulation.playing ? "PLAY" : "PAUSE"})`, 14, 14);
    const summary = `cell ${this.simulation.probeCol},${this.simulation.probeRow} -> ${this.simulation.currentCellSummary}`;
    context.fillText(summary, 14, 32);
    context.fillText(this.simulation.currentTraversalSummary, 14, 50);
    context.restore();
  }

  drawCheckerboard(context, width, height, tileSize) {
    for (let row = 0; row < height; row += 1) {
      for (let col = 0; col < width; col += 1) {
        const isEven = (row + col) % 2 === 0;
        context.fillStyle = isEven ? "#122035" : "#13263f";
        context.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
      }
    }
  }

  drawTileLayer(context, layer, tileSize) {
    const tileById = new Map();
    const drawInfoByTileId = new Map();
    this.documentModel.tileset.forEach((entry) => {
      tileById.set(entry.id, entry);
      drawInfoByTileId.set(entry.id, this.getTileSourceDrawInfo(entry));
    });

    for (let row = 0; row < layer.data.length; row += 1) {
      const rowData = layer.data[row];
      for (let col = 0; col < rowData.length; col += 1) {
        const tileId = normalizeCellValue(rowData[col]);
        if (tileId === 0) {
          continue;
        }

        const tile = tileById.get(tileId);
        const drawInfo = drawInfoByTileId.get(tileId);
        if (drawInfo) {
          context.imageSmoothingEnabled = false;
          context.drawImage(
            drawInfo.image,
            drawInfo.sourceX,
            drawInfo.sourceY,
            drawInfo.sourceWidth,
            drawInfo.sourceHeight,
            col * tileSize,
            row * tileSize,
            tileSize,
            tileSize
          );
          continue;
        }

        context.fillStyle = tile ? tile.color : DEFAULT_TILESET_SWATCH_COLOR;
        context.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
      }
    }
  }

  drawCollisionLayer(context, layer, tileSize) {
    context.fillStyle = "rgba(239, 68, 68, 0.35)";
    for (let row = 0; row < layer.data.length; row += 1) {
      const rowData = layer.data[row];
      for (let col = 0; col < rowData.length; col += 1) {
        if (normalizeCellValue(rowData[col]) > 0) {
          context.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
        }
      }
    }
  }

  drawDataLayer(context, layer, tileSize) {
    context.fillStyle = "rgba(56, 189, 248, 0.22)";
    context.font = `${Math.max(10, Math.floor(tileSize * 0.4))}px monospace`;
    context.textAlign = "center";
    context.textBaseline = "middle";

    for (let row = 0; row < layer.data.length; row += 1) {
      const rowData = layer.data[row];
      for (let col = 0; col < rowData.length; col += 1) {
        const value = normalizeCellValue(rowData[col]);
        if (value <= 0) {
          continue;
        }

        context.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
        context.fillStyle = "rgba(224, 242, 254, 0.85)";
        context.fillText(String(value), col * tileSize + tileSize / 2, row * tileSize + tileSize / 2);
        context.fillStyle = "rgba(56, 189, 248, 0.22)";
      }
    }
  }

  drawGrid(context, width, height, tileSize) {
    context.beginPath();
    context.lineWidth = 1;
    context.strokeStyle = "rgba(148, 163, 184, 0.35)";

    for (let col = 0; col <= width; col += 1) {
      const x = col * tileSize + 0.5;
      context.moveTo(x, 0);
      context.lineTo(x, height * tileSize);
    }

    for (let row = 0; row <= height; row += 1) {
      const y = row * tileSize + 0.5;
      context.moveTo(0, y);
      context.lineTo(width * tileSize, y);
    }

    context.stroke();
  }

  drawMarkers(context, tileSize) {
    this.documentModel.markers.forEach((marker) => {
      const centerX = marker.col * tileSize + tileSize / 2;
      const centerY = marker.row * tileSize + tileSize / 2;
      const radius = Math.max(4, Math.floor(tileSize * 0.28));

      if (marker.type === "spawn") {
        context.fillStyle = "#22c55e";
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, Math.PI * 2);
        context.fill();
      } else {
        context.fillStyle = "#f59e0b";
        context.beginPath();
        context.moveTo(centerX, centerY - radius);
        context.lineTo(centerX + radius, centerY);
        context.lineTo(centerX, centerY + radius);
        context.lineTo(centerX - radius, centerY);
        context.closePath();
        context.fill();
      }

      if (marker.id === this.selectedMarkerId) {
        context.strokeStyle = "#ffffff";
        context.lineWidth = 2;
        context.strokeRect(marker.col * tileSize + 2, marker.row * tileSize + 2, tileSize - 4, tileSize - 4);
      }
    });
  }

  updateStatus(message) {
    this.refs.statusText.textContent = message;
  }
}

const initialDocument = createInitialDocument();
const app = new TileMapEditorApp(initialDocument);
app.init(document);
