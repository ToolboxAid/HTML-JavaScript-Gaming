import { ObjectVectorRuntimeAssetService } from "../../../src/engine/rendering/index.js";

const WORKSPACE_TOOL_SESSION_KEY = "workspace.tools.object-vector-studio-v2";
const WORKSPACE_PALETTE_SESSION_KEY = "workspace.tools.palette-manager-v2";
const RUNTIME_PALETTE_SESSION_KEY = "object-vector-studio-v2.runtimePalette";
const TOOL_DISPLAY_MODE_KEY = "object-vector-studio-v2.toolDisplayMode";
const GRID_SNAP_SESSION_KEY = "object-vector-studio-v2.gridSnap";
const ANGLE_SNAP_SESSION_KEY = "object-vector-studio-v2.angleSnap";
const GRID_RENDER_SESSION_KEY = "object-vector-studio-v2.gridRender";
const DEFAULT_OBJECT_TYPE = "object";
const DEFAULT_ASSET_CATEGORY = "object";
const SVG_NS = "http://www.w3.org/2000/svg";
const DEFAULT_VIEWPORT = Object.freeze({ height: 220, width: 320, x: 0, y: 0, zoom: 1 });

const OBJECT_TYPES = Object.freeze(["actor", "enemy", "object", "pickup", "ship", "ui", "weapon"]);
const ASSET_CATEGORIES = Object.freeze(["actor", "enemy", "object", "pickup", "ship", "ui", "weapon"]);
const OBJECT_STATE_IDS = Object.freeze(["idle", "thrust", "damaged", "destroyed", "active", "inactive"]);

const OBJECT_TEMPLATES = Object.freeze({
  asteroid: { label: "Asteroid", type: "enemy" },
  bullet: { label: "Bullet", type: "weapon" },
  pickup: { label: "Pickup", type: "pickup" },
  ship: { label: "Ship", type: "ship" },
  ufo: { label: "UFO", type: "enemy" }
});

const OBJECT_STATE_LABELS = Object.freeze({
  active: "Active",
  damaged: "Damaged",
  destroyed: "Destroyed",
  idle: "Idle",
  inactive: "Inactive",
  thrust: "Thrust"
});

const OBJECT_TYPE_DETAILS = Object.freeze({
  actor: "Actor entity metadata framework for reusable gameplay participants.",
  enemy: "Enemy entity metadata framework for hostile reusable objects.",
  object: "Generic reusable gameplay object metadata framework.",
  pickup: "Pickup entity metadata framework for collectibles and rewards.",
  ship: "Ship entity metadata framework for player, NPC, or vehicle objects.",
  ui: "UI vector asset metadata framework for interface objects.",
  weapon: "Weapon entity metadata framework for projectile or attack objects."
});

const SHAPE_TYPE_DETAILS = Object.freeze({
  arc: "Arc primitive metadata with center, radius, and angle span.",
  circle: "Circle primitive metadata with center point and radius.",
  ellipse: "Ellipse primitive metadata with center point and radius pair.",
  line: "Line primitive metadata with start and end points.",
  polygon: "Polygon primitive metadata with ordered point ownership.",
  rectangle: "Rectangle primitive metadata with position and dimensions.",
  text: "Text primitive metadata with position, font size, and content."
});

const PRIMITIVE_TOOLS = Object.freeze(["rectangle", "circle", "ellipse", "line", "polygon", "arc", "text"]);

function objectTypeKey(object) {
  const rawType = object?.type || DEFAULT_OBJECT_TYPE;
  const key = String(rawType).trim().toLowerCase();
  return key || DEFAULT_OBJECT_TYPE;
}

function objectTypeLabel(object) {
  return objectTypeKey(object).replace(/(^|-)([a-z])/g, (match) => match.toUpperCase()).replaceAll("-", " ");
}

function objectTypeDescription(object) {
  return OBJECT_TYPE_DETAILS[objectTypeKey(object)] || OBJECT_TYPE_DETAILS.object;
}

function shapeTypeLabel(shape) {
  return shape.type.replace(/(^|-)([a-z])/g, (match) => match.toUpperCase()).replaceAll("-", " ");
}

function objectCountLabel(count) {
  return `${count} ${count === 1 ? "object" : "objects"}`;
}

function shapeCountLabel(count) {
  return `${count} ${count === 1 ? "shape" : "shapes"}`;
}

function assetCountLabel(count) {
  return `${count} ${count === 1 ? "library asset" : "library assets"}`;
}

function tagList(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }
  return String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function assetCategoryLabel(value) {
  return String(value || DEFAULT_ASSET_CATEGORY)
    .replace(/(^|-)([a-z])/g, (match) => match.toUpperCase())
    .replaceAll("-", " ");
}

function slugifyObjectName(name) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "object";
}

function sortedShapes(object) {
  return [...(object?.shapes || [])].sort((left, right) => left.order - right.order);
}

function sortedFrames(state) {
  return [...(state?.frames || [])].sort((left, right) => left.order - right.order);
}

function swatchColor(swatch) {
  return swatch?.value || swatch?.hex || swatch?.color || "";
}

function shapeBounds(shape) {
  if (shape.type === "rectangle") {
    return {
      height: shape.geometry.height,
      width: shape.geometry.width,
      x: shape.geometry.x,
      y: shape.geometry.y
    };
  }
  if (shape.type === "circle") {
    return {
      height: shape.geometry.r * 2,
      width: shape.geometry.r * 2,
      x: shape.geometry.cx - shape.geometry.r,
      y: shape.geometry.cy - shape.geometry.r
    };
  }
  if (shape.type === "ellipse") {
    return {
      height: shape.geometry.ry * 2,
      width: shape.geometry.rx * 2,
      x: shape.geometry.cx - shape.geometry.rx,
      y: shape.geometry.cy - shape.geometry.ry
    };
  }
  if (shape.type === "line") {
    const x = Math.min(shape.geometry.x1, shape.geometry.x2);
    const y = Math.min(shape.geometry.y1, shape.geometry.y2);
    return {
      height: Math.max(1, Math.abs(shape.geometry.y2 - shape.geometry.y1)),
      width: Math.max(1, Math.abs(shape.geometry.x2 - shape.geometry.x1)),
      x,
      y
    };
  }
  if (shape.type === "polygon") {
    const xValues = shape.geometry.points.map((point) => point.x);
    const yValues = shape.geometry.points.map((point) => point.y);
    const minX = Math.min(...xValues);
    const minY = Math.min(...yValues);
    return {
      height: Math.max(1, Math.max(...yValues) - minY),
      width: Math.max(1, Math.max(...xValues) - minX),
      x: minX,
      y: minY
    };
  }
  if (shape.type === "arc") {
    return {
      height: shape.geometry.r * 2,
      width: shape.geometry.r * 2,
      x: shape.geometry.cx - shape.geometry.r,
      y: shape.geometry.cy - shape.geometry.r
    };
  }
  if (shape.type === "text") {
    return {
      height: shape.geometry.fontSize,
      width: Math.max(24, shape.geometry.text.length * shape.geometry.fontSize * 0.6),
      x: shape.geometry.x,
      y: shape.geometry.y - shape.geometry.fontSize
    };
  }
  throw new Error(`unsupported shape bounds for ${shape.type}`);
}

function defaultShapeTransform(shape) {
  const bounds = shapeBounds(shape);
  return {
    originX: Number((bounds.x + bounds.width / 2).toFixed(3)),
    originY: Number((bounds.y + bounds.height / 2).toFixed(3)),
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    x: 0,
    y: 0
  };
}

export class ToolStarterApp {
  constructor({ accordions, actionNav, elements, runtimeAssetService = null, schemaService, shell, statusLog, windowRef = window }) {
    this.accordions = accordions;
    this.actionNav = actionNav;
    this.elements = elements;
    this.schemaService = schemaService;
    this.shell = shell;
    this.statusLog = statusLog;
    this.runtimeAssetService = runtimeAssetService || new ObjectVectorRuntimeAssetService({ logger: statusLog });
    this.window = windowRef;
    this.currentPayload = null;
    this.runtimePalette = null;
    this.runtimePaletteSource = "";
    this.selectedObjectId = "";
    this.selectedShapeId = "";
    this.selectedShapeIds = new Set();
    this.selectedStateId = "";
    this.selectedFrameId = "";
    this.playbackTimerId = 0;
    this.isAnimationPlaying = false;
    this.gridSnapEnabled = false;
    this.angleSnapEnabled = false;
    this.gridRenderEnabled = false;
    this.schemaReady = false;
    this.viewport = { ...DEFAULT_VIEWPORT };
  }

  async start() {
    this.window.__objectVectorStudioV2App = this;
    this.shell.mount();
    this.accordions.forEach((accordion) => accordion.mount());
    this.actionNav.mount({
      onCopyJson: () => {
        void this.copyJson();
      },
      onExportJson: () => this.exportJson(),
      onImportJson: (file) => {
        void this.importJson(file);
      },
      onReturnToWorkspace: (url) => {
        this.window.location.href = url;
      }
    });
    this.statusLog.mount();
    this.bindObjectActions();
    this.bindToolToggles();
    this.bindSnapControls();
    this.bindViewportControls();
    this.bindObjectFilters();
    this.bindAnimationControls();
    this.bindKeyboardShortcuts();
    this.applyToolDisplayMode(this.window.sessionStorage?.getItem(TOOL_DISPLAY_MODE_KEY) || "words", false);
    this.applySnapState();
    this.updateViewport();
    this.actionNav.setImportEnabled(false);
    this.renderEmptyState("Object Vector Studio V2 schema contract is loading.");
    this.statusLog.write("OK Object Vector Studio V2 layout shell ready.");
    await this.schemaService.loadSchema();
    this.schemaReady = true;
    this.statusLog.write(`OK Object Vector Studio V2 schema contract loaded from ${this.schemaService.schemaPath}.`);
    await this.loadRuntimePaletteFromSources();
    this.renderEmptyState("Schema-only loading is idle. Import JSON or launch with workspace toolState data. Runtime palette is required before rendering.");
    if (this.actionNav.isWorkspaceLaunch()) {
      this.loadWorkspaceToolState();
    }
  }

  async loadRuntimePaletteFromSources() {
    const params = new URLSearchParams(this.window.location.search);
    const paletteSourcePath = params.get("paletteSourcePath") || "";
    if (paletteSourcePath) {
      await this.loadPaletteFromUrl(paletteSourcePath);
      if (this.runtimePalette) {
        return;
      }
    }

    if (this.actionNav.isWorkspaceLaunch() && this.loadPaletteFromWorkspaceSession()) {
      return;
    }

    if (this.loadPaletteFromSessionKey(RUNTIME_PALETTE_SESSION_KEY)) {
      return;
    }
    this.loadPaletteFromWorkspaceSession();
  }

  async loadPaletteFromUrl(paletteSourcePath) {
    let paletteUrl;
    try {
      paletteUrl = new URL(paletteSourcePath, this.window.location.href);
      const response = await this.window.fetch(paletteUrl, { cache: "no-store" });
      if (!response.ok) {
        this.statusLog.write(`FAIL Runtime palette load failed from ${paletteSourcePath}: ${response.status}.`);
        return;
      }
      const palette = await response.json();
      this.acceptRuntimePalette(palette, `paletteSourcePath:${paletteSourcePath}`, true);
    } catch (error) {
      this.statusLog.write(`FAIL Runtime palette load failed from ${paletteSourcePath}: ${error.message}`);
    }
  }

  loadPaletteFromSessionKey(sessionKey) {
    const storedPalette = this.window.sessionStorage?.getItem(sessionKey) || "";
    if (!storedPalette) {
      return false;
    }
    try {
      const palette = JSON.parse(storedPalette);
      return this.acceptRuntimePalette(palette, sessionKey, sessionKey !== RUNTIME_PALETTE_SESSION_KEY);
    } catch (error) {
      this.statusLog.write(`FAIL Runtime palette load failed from ${sessionKey}: ${error.message}`);
      return false;
    }
  }

  loadPaletteFromWorkspaceSession() {
    const storedSession = this.window.sessionStorage?.getItem(WORKSPACE_PALETTE_SESSION_KEY) || "";
    if (!storedSession) {
      return false;
    }
    try {
      const session = JSON.parse(storedSession);
      const palette = session?.data && typeof session.data === "object" ? session.data : session;
      return this.acceptRuntimePalette(palette, `${WORKSPACE_PALETTE_SESSION_KEY}.data`, true);
    } catch (error) {
      this.statusLog.write(`FAIL Runtime palette load failed from ${WORKSPACE_PALETTE_SESSION_KEY}: ${error.message}`);
      return false;
    }
  }

  acceptRuntimePalette(palette, sourceLabel, persistToRuntimeSession) {
    const validation = this.schemaService.validateRuntimePalette(palette, sourceLabel);
    if (!validation.ok) {
      this.runtimePalette = null;
      this.runtimePaletteSource = "";
      this.statusLog.write(`FAIL Runtime palette validation failed from ${sourceLabel}: ${validation.errors.join(" ")}`);
      return false;
    }
    this.runtimePalette = validation.palette;
    this.runtimePaletteSource = sourceLabel;
    if (persistToRuntimeSession) {
      this.window.sessionStorage?.setItem(RUNTIME_PALETTE_SESSION_KEY, JSON.stringify(validation.palette));
    }
    this.statusLog.write(`OK Runtime palette loaded from ${sourceLabel}: ${validation.palette.swatches.length} swatches.`);
    return true;
  }

  bindObjectActions() {
    this.elements.addObjectButton.addEventListener("click", () => this.addObject());
    this.elements.createTemplateButton.addEventListener("click", () => this.createObjectFromTemplate());
    this.elements.createStateButton.addEventListener("click", () => this.createSelectedState());
    this.elements.createLibraryAssetButton.addEventListener("click", () => this.createLibraryAssetForSelectedObject());
    this.elements.renameObjectButton.addEventListener("click", () => this.renameSelectedObject());
    this.elements.duplicateObjectButton.addEventListener("click", () => this.duplicateSelectedObject());
    this.elements.duplicateAsLocalButton.addEventListener("click", () => this.duplicateSelectedObjectAsLocal());
    this.elements.deleteObjectButton.addEventListener("click", () => this.deleteSelectedObject());
    this.elements.flattenObjectButton.addEventListener("click", () => this.flattenSelectedObject());
    this.elements.objectTypeSelect.addEventListener("change", () => this.updateSelectedObjectType());
    this.elements.exportSvgButton.addEventListener("click", () => this.exportSelectedObjectSvg());
  }

  bindAnimationControls() {
    this.elements.stateSelect.addEventListener("change", () => this.selectState(this.elements.stateSelect.value, "state selector"));
    this.elements.duplicateFrameButton.addEventListener("click", () => this.duplicateSelectedFrame());
    this.elements.frameEarlierButton.addEventListener("click", () => this.moveSelectedFrame("earlier"));
    this.elements.frameLaterButton.addEventListener("click", () => this.moveSelectedFrame("later"));
    this.elements.playButton.addEventListener("click", () => this.playAnimation());
    this.elements.pauseButton.addEventListener("click", () => this.pauseAnimation());
    this.elements.stopButton.addEventListener("click", () => this.stopAnimation());
    this.elements.runtimePreviewButton.addEventListener("click", () => {
      void this.previewRuntimeAsset();
    });
    this.elements.onionSkinToggle.addEventListener("change", () => {
      this.renderWorkSurface();
      this.statusLog.write(`OK Onion-skin preview ${this.elements.onionSkinToggle.checked ? "enabled" : "disabled"}.`);
    });
  }

  bindToolToggles() {
    this.elements.toolLabelModeButton.addEventListener("click", () => {
      const nextMode = this.elements.toolToggleGrid.classList.contains("is-icon-only") ? "words" : "icons";
      this.applyToolDisplayMode(nextMode, true);
    });

    this.elements.toolToggles.forEach((button) => {
      button.addEventListener("click", () => {
        const tool = button.dataset.shapeTool || "unknown";
        this.setActiveToolButton(button);
        if (PRIMITIVE_TOOLS.includes(tool)) {
          this.createShape(tool);
          return;
        }
        this.statusLog.write(`OK Shape/Tools mode selected: ${tool}.`);
      });
    });
  }

  bindSnapControls() {
    this.elements.gridSnapButton.addEventListener("click", () => {
      this.gridSnapEnabled = !this.gridSnapEnabled;
      this.window.sessionStorage?.setItem(GRID_SNAP_SESSION_KEY, this.gridSnapEnabled ? "1" : "0");
      this.applySnapState();
      this.statusLog.write(`OK Grid snap ${this.gridSnapEnabled ? "enabled" : "disabled"}.`);
    });
    this.elements.angleSnapButton.addEventListener("click", () => {
      this.angleSnapEnabled = !this.angleSnapEnabled;
      this.window.sessionStorage?.setItem(ANGLE_SNAP_SESSION_KEY, this.angleSnapEnabled ? "1" : "0");
      this.applySnapState();
      this.statusLog.write(`OK Angle snap ${this.angleSnapEnabled ? "enabled" : "disabled"}.`);
    });
    this.elements.gridRenderButton.addEventListener("click", () => {
      this.gridRenderEnabled = !this.gridRenderEnabled;
      this.window.sessionStorage?.setItem(GRID_RENDER_SESSION_KEY, this.gridRenderEnabled ? "1" : "0");
      this.applySnapState();
      this.renderWorkSurface();
      this.statusLog.write(`OK Grid rendering ${this.gridRenderEnabled ? "enabled" : "disabled"}.`);
    });
  }

  bindViewportControls() {
    this.elements.zoomInButton.addEventListener("click", () => this.zoomViewport(1.25));
    this.elements.zoomOutButton.addEventListener("click", () => this.zoomViewport(0.8));
    this.elements.panLeftButton.addEventListener("click", () => this.panViewport(-20, 0));
    this.elements.panRightButton.addEventListener("click", () => this.panViewport(20, 0));
    this.elements.resetViewButton.addEventListener("click", () => this.resetViewport());
    this.elements.renderSurface.addEventListener("mousemove", (event) => this.updateCoordinateDisplay(event));
  }

  bindObjectFilters() {
    this.elements.categoryFilter.addEventListener("change", () => {
      this.renderObjectTiles();
      this.statusLog.write(`OK Object category filter set to ${this.elements.categoryFilter.value}.`);
    });
    this.elements.searchFilter.addEventListener("input", () => {
      this.renderObjectTiles();
    });
    this.elements.assetCategoryFilter.addEventListener("change", () => {
      this.renderAssetLibrary();
      this.statusLog.write(`OK Asset library category filter set to ${this.elements.assetCategoryFilter.value}.`);
    });
    this.elements.assetSearchFilter.addEventListener("input", () => {
      this.renderAssetLibrary();
    });
  }

  bindKeyboardShortcuts() {
    this.elements.renderSurface.addEventListener("keydown", (event) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        this.deleteSelectedShape("keyboard");
      }
    });
  }

  applySnapState() {
    this.gridSnapEnabled = this.window.sessionStorage?.getItem(GRID_SNAP_SESSION_KEY) === "1";
    this.angleSnapEnabled = this.window.sessionStorage?.getItem(ANGLE_SNAP_SESSION_KEY) === "1";
    this.gridRenderEnabled = this.window.sessionStorage?.getItem(GRID_RENDER_SESSION_KEY) === "1";
    this.elements.gridSnapButton.setAttribute("aria-pressed", String(this.gridSnapEnabled));
    this.elements.angleSnapButton.setAttribute("aria-pressed", String(this.angleSnapEnabled));
    this.elements.gridRenderButton.setAttribute("aria-pressed", String(this.gridRenderEnabled));
  }

  applyToolDisplayMode(mode, shouldLog) {
    const isCompact = mode === "icons";
    this.elements.toolToggleGrid.classList.toggle("is-icon-only", isCompact);
    this.elements.toolLabelModeButton.setAttribute("aria-pressed", String(isCompact));
    this.elements.toolLabelModeButton.textContent = isCompact ? "Words" : "Icons";
    this.window.sessionStorage?.setItem(TOOL_DISPLAY_MODE_KEY, isCompact ? "icons" : "words");
    if (shouldLog) {
      this.statusLog.write(`OK Shape/Tools display mode set to ${isCompact ? "compact icons" : "words and icons"}.`);
    }
  }

  setActiveToolButton(button) {
    this.elements.toolToggles.forEach((candidate) => {
      candidate.classList.toggle("is-active", candidate === button);
      candidate.setAttribute("aria-pressed", String(candidate === button));
    });
  }

  renderEmptyState(message) {
    this.currentPayload = null;
    this.selectedObjectId = "";
    this.selectedShapeId = "";
    this.selectedShapeIds.clear();
    this.selectedStateId = "";
    this.selectedFrameId = "";
    this.stopPlaybackTimer();
    this.elements.sourceSummary.value = "No schema-loaded payload";
    this.elements.paletteGate.value = this.runtimePalette ? "Palette loaded" : "Required before render";
    this.elements.objectCount.value = objectCountLabel(0);
    this.elements.shapeCount.value = shapeCountLabel(0);
    this.elements.objectNameInput.value = "";
    this.elements.objectTypeSelect.value = DEFAULT_OBJECT_TYPE;
    this.elements.assetCategorySelect.value = DEFAULT_ASSET_CATEGORY;
    this.elements.assetTagsInput.value = "";
    this.elements.stateSelect.value = "";
    this.elements.loadStatus.textContent = message;
    this.elements.paletteSummary.textContent = this.runtimePalette
      ? `Runtime palette ${this.paletteDisplayName()}: ${this.runtimePalette.swatches.length} swatches.`
      : "Palette required before render.";
    this.elements.objectDetails.textContent = "No object selected.";
    this.elements.selectedItemVisibility.textContent = "Selected Object: none. Selected Shape: none. Selected State: none. Selected Frame: none.";
    this.elements.selectionMetrics.textContent = "Selection metrics: none.";
    this.elements.jsonDetails.textContent = "{}";
    this.renderFrameTimeline();
    this.elements.renderSummary.textContent = "Render mode: idle. Capture mode: none.";
    this.elements.coordinateDisplay.textContent = "Origin: 0, 0 | Zoom 100%";
    this.elements.renderSurface.replaceChildren();
    this.renderCenterOriginMarker();
    this.elements.objectTiles.replaceChildren(this.createEmptyObjectTile());
    this.renderAssetLibrary();
    this.actionNav.setJsonPayloadActionsEnabled(false);
    this.elements.exportSvgButton.disabled = true;
    this.actionNav.setImportEnabled(this.schemaReady && !this.actionNav.isWorkspaceLaunch());
    this.updateObjectActionState();
  }

  createEmptyObjectTile() {
    const tile = document.createElement("article");
    tile.className = "object-vector-studio-v2__object-tile object-vector-studio-v2__object-tile--empty";
    tile.textContent = "No objects loaded. Import schema-valid Object Vector Studio V2 JSON and provide a runtime palette to show object tiles.";
    return tile;
  }

  async importJson(file) {
    if (!file) {
      this.statusLog.write("FAIL Import JSON blocked: choose an Object Vector Studio V2 JSON file.");
      return;
    }

    let payload;
    try {
      payload = JSON.parse(await file.text());
    } catch (error) {
      this.statusLog.write(`FAIL Import JSON blocked: ${file.name || "selected file"} is invalid JSON: ${error.message}`);
      return;
    }

    this.loadPayload(payload, `import:${file.name || "selected file"}`);
  }

  loadWorkspaceToolState() {
    const storedPayload = this.window.sessionStorage?.getItem(WORKSPACE_TOOL_SESSION_KEY) || "";
    if (!storedPayload) {
      const message = `Schema-only workspace loading blocked: ${WORKSPACE_TOOL_SESSION_KEY} is missing. A schema-valid Object Vector Studio V2 payload is required.`;
      this.renderEmptyState(message);
      this.statusLog.write(`FAIL ${message}`);
      return;
    }

    let payload;
    try {
      const session = JSON.parse(storedPayload);
      payload = session?.data && typeof session.data === "object" ? session.data : session;
    } catch (error) {
      const message = `Schema-only workspace loading blocked: ${WORKSPACE_TOOL_SESSION_KEY} is invalid JSON: ${error.message}`;
      this.renderEmptyState(message);
      this.statusLog.write(`FAIL ${message}`);
      return;
    }

    this.loadPayload(payload, WORKSPACE_TOOL_SESSION_KEY);
  }

  loadPayload(payload, sourceLabel) {
    const validation = this.schemaService.validatePayload(payload);
    if (!validation.ok) {
      const message = `Object Vector Studio V2 schema validation failed from ${sourceLabel}: ${validation.errors.join(" ")}`;
      this.renderEmptyState(message);
      this.statusLog.write(`FAIL ${message}`);
      return;
    }

    this.currentPayload = validation.payload;
    this.applyLoadedRuntimeState(sourceLabel);
    this.elements.sourceSummary.value = sourceLabel;
    this.elements.loadStatus.textContent = `Schema-valid payload loaded from ${sourceLabel}.`;
    this.actionNav.setJsonPayloadActionsEnabled(true);
    this.actionNav.setImportEnabled(!this.actionNav.isWorkspaceLaunch());
    this.renderPayload();
    this.statusLog.write(`OK Loaded Object Vector Studio V2 schema payload from ${sourceLabel}: ${this.currentPayload.objects.length} objects. ${assetCountLabel(this.currentPayload.assetLibrary?.assets?.length || 0)}.`);
  }

  applyLoadedRuntimeState(sourceLabel) {
    const selectedObject = this.currentPayload.objects[0] || null;
    this.selectedObjectId = selectedObject?.id || "";
    const selectedShape = sortedShapes(selectedObject)[0] || null;
    this.selectedShapeId = selectedShape?.id || "";
    this.selectedShapeIds = new Set(this.selectedShapeId ? [this.selectedShapeId] : []);
    const selectedState = this.objectStates(selectedObject)[0] || null;
    this.selectedStateId = selectedState?.id || "";
    this.selectedFrameId = selectedState ? sortedFrames(selectedState)[0]?.id || "" : "";
    this.viewport = { ...DEFAULT_VIEWPORT };
    this.updateViewport();
    if (sourceLabel) {
      this.statusLog.write(`OK Runtime selection initialized from ${sourceLabel}: ${this.selectedObjectId || "no object selected"}.`);
    }
  }

  renderPayload() {
    if (!this.currentPayload) {
      return;
    }

    const validation = this.schemaService.validatePayload(this.currentPayload);
    if (!validation.ok) {
      const message = `Render blocked by Object Vector Studio V2 schema validation: ${validation.errors.join(" ")}`;
      this.renderEmptyState(message);
      this.statusLog.write(`FAIL ${message}`);
      return;
    }

    this.currentPayload = validation.payload;
    if (!this.runtimePalette) {
      this.loadPaletteFromSessionKey(RUNTIME_PALETTE_SESSION_KEY) || this.loadPaletteFromWorkspaceSession();
    }
    const paletteValidation = this.schemaService.validateRuntimePalette(this.runtimePalette, "runtime palette");
    if (!paletteValidation.ok) {
      const message = `Render blocked: runtime palette is required separately from Object Vector Studio V2 JSON. ${paletteValidation.errors.join(" ")}`;
      this.renderPaletteRequiredState(message);
      this.statusLog.write(`FAIL ${message}`);
      return;
    }
    this.runtimePalette = paletteValidation.palette;
    this.ensureSelectedShape();
    this.ensureSelectedFrame();
    this.renderPalette();
    this.renderObjectTiles();
    this.renderAssetLibrary();
    this.renderSelectedObject();
    this.renderWorkSurface();
    this.updateObjectActionState();
  }

  renderPaletteRequiredState(message) {
    this.selectedObjectId = "";
    this.selectedShapeId = "";
    this.selectedShapeIds.clear();
    this.selectedStateId = "";
    this.selectedFrameId = "";
    this.stopPlaybackTimer();
    this.elements.paletteGate.value = "Required before render";
    this.elements.loadStatus.textContent = message;
    this.elements.paletteSummary.textContent = message;
    this.elements.objectCount.value = objectCountLabel(0);
    this.elements.shapeCount.value = shapeCountLabel(0);
    this.elements.objectNameInput.value = "";
    this.elements.objectTypeSelect.value = DEFAULT_OBJECT_TYPE;
    this.elements.assetCategorySelect.value = DEFAULT_ASSET_CATEGORY;
    this.elements.assetTagsInput.value = "";
    this.elements.stateSelect.value = "";
    this.elements.objectDetails.textContent = "Runtime palette required before object render.";
    this.elements.selectedItemVisibility.textContent = "Selected Object: none. Selected Shape: none. Selected State: none. Selected Frame: none.";
    this.elements.selectionMetrics.textContent = "Selection metrics: none.";
    this.elements.jsonDetails.textContent = "{}";
    this.renderFrameTimeline();
    this.elements.renderSummary.textContent = "Render mode: blocked. Capture mode: none.";
    this.elements.renderSurface.replaceChildren();
    this.renderCenterOriginMarker();
    const tile = this.createEmptyObjectTile();
    tile.textContent = "Runtime palette required before rendering object tiles.";
    this.elements.objectTiles.replaceChildren(tile);
    this.renderAssetLibrary();
    this.actionNav.setJsonPayloadActionsEnabled(Boolean(this.currentPayload));
    this.elements.exportSvgButton.disabled = true;
    this.actionNav.setImportEnabled(this.schemaReady && !this.actionNav.isWorkspaceLaunch());
    this.updateObjectActionState();
  }

  renderPalette() {
    const swatchCount = this.runtimePalette.swatches.length;
    this.elements.paletteGate.value = "Palette loaded";
    this.elements.paletteSummary.replaceChildren();
    const heading = document.createElement("p");
    heading.textContent = `Palette ${this.paletteDisplayName()}: ${swatchCount} read-only swatches. Palette source is session/workspace data and is not stored in Object Vector Studio V2 JSON.`;
    const list = document.createElement("div");
    list.className = "object-vector-studio-v2__palette-swatch-list";
    this.runtimePalette.swatches.forEach((swatch, index) => {
      const label = swatch?.name || swatch?.id || swatch?.symbol || `swatch-${index + 1}`;
      const color = swatchColor(swatch);
      const item = document.createElement("button");
      item.className = "object-vector-studio-v2__palette-swatch";
      item.type = "button";
      item.dataset.paletteColor = color;
      item.dataset.paletteLabel = label;
      item.dataset.paletteDetails = `${label}: ${color || "value unavailable"}`;
      item.title = item.dataset.paletteDetails;
      item.setAttribute("aria-label", `Palette swatch ${item.dataset.paletteDetails}`);
      if (color) {
        item.style.setProperty("--object-vector-studio-v2-swatch", color);
      }
      item.addEventListener("click", () => this.applyPaletteColor(color, label));
      list.append(item);
    });
    this.elements.paletteSummary.append(heading, list);
  }

  paletteDisplayName() {
    return this.runtimePalette?.id || this.runtimePalette?.name || this.runtimePaletteSource || "runtime palette";
  }

  renderObjectTiles() {
    this.elements.objectCount.value = objectCountLabel(this.currentPayload.objects.length);
    this.elements.objectTiles.replaceChildren();
    if (!this.currentPayload.objects.length) {
      this.elements.objectTiles.append(this.createEmptyObjectTile());
      return;
    }

    const filteredObjects = this.filteredObjects();
    if (!filteredObjects.length) {
      const tile = this.createEmptyObjectTile();
      tile.textContent = "No objects match the current category or search filter.";
      this.elements.objectTiles.append(tile);
      return;
    }

    filteredObjects.forEach((object) => {
      const tile = document.createElement("button");
      tile.className = "object-vector-studio-v2__object-tile";
      tile.type = "button";
      tile.dataset.objectId = object.id;
      tile.title = `Select object ${object.name}`;
      tile.setAttribute("aria-pressed", String(object.id === this.selectedObjectId));
      tile.classList.toggle("is-selected", object.id === this.selectedObjectId);

      const thumbnail = this.createObjectThumbnail(object);
      const name = document.createElement("span");
      name.className = "object-vector-studio-v2__object-tile-name";
      name.textContent = object.name;

      const meta = document.createElement("span");
      meta.className = "object-vector-studio-v2__object-tile-meta";
      const libraryRefs = this.assetLibraryAssets().filter((asset) => asset.objectId === object.id).length;
      const inheritedText = object.baseObjectId ? ` - inherits ${object.baseObjectId}` : "";
      meta.textContent = `${object.id} - ${objectTypeLabel(object)} - ${shapeCountLabel(object.shapes.length)} - ${libraryRefs} refs${inheritedText}`;

      const copy = document.createElement("span");
      copy.className = "object-vector-studio-v2__object-tile-copy";
      copy.append(name, meta);

      tile.append(thumbnail, copy);
      tile.addEventListener("click", () => {
        this.selectObject(object.id, "tile");
      });
      this.elements.objectTiles.append(tile);
    });
  }

  filteredObjects() {
    const category = this.elements.categoryFilter.value || "all";
    const query = this.elements.searchFilter.value.trim().toLowerCase();
    return this.currentPayload.objects.filter((object) => {
      const matchesCategory = category === "all" || objectTypeKey(object) === category;
      const haystack = `${object.id} ${object.name} ${objectTypeKey(object)} ${(object.tags || []).join(" ")} ${object.category || ""} ${object.baseObjectId || ""}`.toLowerCase();
      return matchesCategory && (!query || haystack.includes(query));
    });
  }

  assetLibraryAssets() {
    return Array.isArray(this.currentPayload?.assetLibrary?.assets)
      ? this.currentPayload.assetLibrary.assets
      : [];
  }

  filteredLibraryAssets() {
    const category = this.elements.assetCategoryFilter.value || "all";
    const query = this.elements.assetSearchFilter.value.trim().toLowerCase();
    return this.assetLibraryAssets().filter((asset) => {
      const matchesCategory = category === "all" || asset.category === category;
      const haystack = `${asset.id} ${asset.name} ${asset.objectId} ${asset.category} ${asset.tags.join(" ")}`.toLowerCase();
      return matchesCategory && (!query || haystack.includes(query));
    });
  }

  renderAssetLibrary() {
    this.elements.assetLibraryBrowser.replaceChildren();
    const assets = this.filteredLibraryAssets();
    if (!this.currentPayload) {
      this.elements.assetLibraryBrowser.append(this.createEmptyLibraryTile("No schema-valid payload loaded."));
      this.elements.assetUsageReport.textContent = "No library usage loaded.";
      this.elements.dependencyGraph.textContent = "No dependency graph loaded.";
      return;
    }
    if (!assets.length) {
      this.elements.assetLibraryBrowser.append(this.createEmptyLibraryTile("No reusable assets match the current library filter."));
    }
    assets.forEach((asset) => {
      const button = document.createElement("button");
      button.className = "object-vector-studio-v2__asset-tile";
      button.type = "button";
      button.dataset.assetId = asset.id;
      button.dataset.objectId = asset.objectId;
      button.title = `Select reusable asset ${asset.name}; source object ${asset.objectId}`;
      button.setAttribute("aria-pressed", String(asset.objectId === this.selectedObjectId));

      const name = document.createElement("span");
      name.className = "object-vector-studio-v2__object-tile-name";
      name.textContent = asset.name;
      const meta = document.createElement("span");
      meta.className = "object-vector-studio-v2__object-tile-meta";
      meta.textContent = `${asset.id} -> ${asset.objectId} - ${assetCategoryLabel(asset.category)} - ${asset.tags.join(", ") || "no tags"}`;
      button.append(name, meta);
      button.addEventListener("click", () => {
        this.selectObject(asset.objectId, `asset library ${asset.id}`);
        this.statusLog.write(`OK Asset library selected ${asset.id}; object reference ${asset.objectId}.`);
      });
      this.elements.assetLibraryBrowser.append(button);
    });
    const usageLines = this.assetLibraryAssets().map((asset) => `${asset.id}: ${asset.objectId}`);
    this.elements.assetUsageReport.textContent = `${assetCountLabel(this.assetLibraryAssets().length)} registered.\n${usageLines.join("\n") || "No shared asset references."}`;
    const graphLines = this.currentPayload.objects
      .map((object) => `${object.id}${object.baseObjectId ? ` inherits ${object.baseObjectId}` : " has no base object"}`);
    this.elements.dependencyGraph.textContent = `Dependency graph:\n${graphLines.join("\n") || "No objects loaded."}`;
  }

  createEmptyLibraryTile(message) {
    const tile = document.createElement("article");
    tile.className = "object-vector-studio-v2__asset-tile object-vector-studio-v2__asset-tile--empty";
    tile.textContent = message;
    return tile;
  }

  createObjectThumbnail(object) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.classList.add("object-vector-studio-v2__object-thumbnail");
    svg.dataset.objectThumbnail = object.id;
    svg.setAttribute("aria-label", `${object.name} thumbnail`);
    svg.setAttribute("role", "img");

    const bounds = this.objectBounds(object, { includeInvisible: false });
    const padding = 12;
    svg.setAttribute("viewBox", `${bounds.x - padding} ${bounds.y - padding} ${bounds.width + padding * 2} ${bounds.height + padding * 2}`);
    sortedShapes(object).filter((shape) => shape.visible).forEach((shape) => {
      try {
        const element = this.createSvgShape(shape);
        element.classList.add("object-vector-studio-v2__object-thumbnail-shape");
        svg.append(element);
      } catch (error) {
        this.statusLog.write(`FAIL Thumbnail render failed for ${object.id}/${shape.id} (${shape.type}): ${error.message}`);
      }
    });
    if (!svg.children.length) {
      const empty = document.createElementNS(SVG_NS, "rect");
      empty.setAttribute("x", bounds.x);
      empty.setAttribute("y", bounds.y);
      empty.setAttribute("width", bounds.width);
      empty.setAttribute("height", bounds.height);
      empty.classList.add("object-vector-studio-v2__object-thumbnail-empty");
      svg.append(empty);
    }
    return svg;
  }

  renderSelectedObject() {
    const selected = this.selectedObject();
    if (!selected) {
      this.elements.objectNameInput.value = "";
      this.elements.objectTypeSelect.value = DEFAULT_OBJECT_TYPE;
      this.elements.assetCategorySelect.value = DEFAULT_ASSET_CATEGORY;
      this.elements.assetTagsInput.value = "";
      this.elements.stateSelect.value = "";
      this.elements.shapeCount.value = shapeCountLabel(0);
      this.elements.objectDetails.textContent = "No object selected.";
      this.elements.selectedItemVisibility.textContent = "Selected Object: none. Selected Shape: none. Selected State: none. Selected Frame: none.";
      this.elements.selectionMetrics.textContent = "Selection metrics: none.";
      this.elements.jsonDetails.textContent = "{}";
      this.renderFrameTimeline();
      return;
    }

    const shape = this.selectedShape();
    this.elements.objectNameInput.value = selected.name;
    this.elements.objectTypeSelect.value = objectTypeKey(selected);
    this.elements.assetCategorySelect.value = this.validAssetCategory(selected.category || selected.type);
    this.elements.assetTagsInput.value = (selected.tags || []).join(", ");
    this.elements.stateSelect.value = this.selectedStateId || "";
    this.elements.shapeCount.value = shapeCountLabel(selected.shapes.length);
    this.elements.objectDetails.replaceChildren(this.createObjectDetails(selected, shape));
    this.elements.selectedItemVisibility.textContent = [
      `Selected Object: ${selected.name} (${selected.id})`,
      `Selected Shape: ${shape ? `${shape.id} (${shape.type})` : "none"}`,
      `Selected State: ${this.selectedStateId || "none"}`,
      `Selected Frame: ${this.selectedFrameId || "none"}`,
      `Selection Count: ${this.selectedShapeIds.size} ${this.selectedShapeIds.size === 1 ? "shape" : "shapes"}`
    ].join(" | ");
    this.updateSelectionMetrics(selected, shape);
    this.elements.jsonDetails.textContent = JSON.stringify({
      object: selected,
      selectedFrame: this.activeFrame(),
      selectedShape: shape,
      selectedShapeIds: Array.from(this.selectedShapeIds),
      selectedState: this.selectedState()
    }, null, 2);
    this.renderFrameTimeline();
  }

  renderFrameTimeline() {
    this.elements.frameTimeline.replaceChildren();
    const object = this.selectedObject();
    const state = this.selectedState();
    if (!object || !state) {
      const empty = document.createElement("p");
      empty.className = "tool-starter__hint";
      empty.textContent = "No state timeline selected.";
      this.elements.frameTimeline.append(empty);
      this.updateAnimationActionState();
      return;
    }

    sortedFrames(state).forEach((frame) => {
      const button = document.createElement("button");
      button.className = "object-vector-studio-v2__frame-tile";
      button.type = "button";
      button.dataset.stateId = state.id;
      button.dataset.frameId = frame.id;
      button.title = `Select frame ${frame.id} in state ${state.id}`;
      button.setAttribute("aria-pressed", String(frame.id === this.selectedFrameId));
      button.classList.toggle("is-selected", frame.id === this.selectedFrameId);
      button.append(this.createFrameThumbnail(object, frame));
      const label = document.createElement("span");
      label.textContent = `${frame.order}. ${frame.id}`;
      button.append(label);
      button.addEventListener("click", () => this.selectFrame(frame.id, "timeline"));
      this.elements.frameTimeline.append(button);
    });
    this.updateAnimationActionState();
  }

  createFrameThumbnail(object, frame) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.classList.add("object-vector-studio-v2__frame-thumbnail");
    svg.dataset.frameThumbnail = frame.id;
    const bounds = this.objectBoundsForFrame(object, frame);
    const padding = 12;
    svg.setAttribute("viewBox", `${bounds.x - padding} ${bounds.y - padding} ${bounds.width + padding * 2} ${bounds.height + padding * 2}`);
    sortedShapes(object).forEach((shape) => {
      const renderShape = this.effectiveShapeForFrame(shape, frame);
      if (!renderShape.visible) {
        return;
      }
      try {
        svg.append(this.createSvgShape(renderShape));
      } catch (error) {
        this.statusLog.write(`FAIL Frame thumbnail render failed for ${object.id}/${frame.id}/${shape.id}: ${error.message}`);
      }
    });
    return svg;
  }

  createObjectDetails(object, shape) {
    const wrapper = document.createElement("div");
    wrapper.className = "object-vector-studio-v2__object-detail-stack";
    const libraryAssets = this.assetLibraryAssets().filter((asset) => asset.objectId === object.id);
    const metadataHeading = document.createElement("h3");
    metadataHeading.textContent = "Read-only Object Metadata";
    wrapper.append(metadataHeading);
    wrapper.append(this.createDetailGrid([
      ["Object Name", object.name],
      ["Object ID", object.id],
      ["Object Type", objectTypeLabel(object)],
      ["Asset Category", assetCategoryLabel(object.category || object.type)],
      ["Asset Tags", (object.tags || []).join(", ") || "None"],
      ["Library Refs", libraryAssets.map((asset) => asset.id).join(", ") || "None"],
      ["Base Object", object.baseObjectId || "None"],
      ["Inherited Fields", object.baseObjectId ? "Base shapes/states are read-only until Duplicate As Local." : "None"],
      ["Object Metadata", objectTypeDescription(object)],
      ["States", String(this.objectStates(object).length)],
      ["Active Frame", this.activeFrame()?.id || "None"],
      ["Shape Count", shapeCountLabel(object.shapes.length)]
    ]));

    const shapePanel = document.createElement("section");
    shapePanel.className = "object-vector-studio-v2__shape-panel";
    const heading = document.createElement("h3");
    heading.textContent = shape ? `Selected Shape: ${shape.id}` : "Selected Shape";
    shapePanel.append(heading);
    if (!shape) {
      const empty = document.createElement("p");
      empty.textContent = "No shape selected. Create a primitive from Shape/Tools.";
      shapePanel.append(empty);
      wrapper.append(shapePanel);
      return wrapper;
    }

    const transform = this.shapeTransform(shape);
    const editableHint = document.createElement("p");
    editableHint.className = "tool-starter__hint";
    editableHint.textContent = "Editable fields below are limited to schema-valid geometry, transform, visibility, lock, order, and grouping fields for the selected shape.";
    shapePanel.append(this.createDetailGrid([
      ["Shape Type", shapeTypeLabel(shape)],
      ["Shape Details", SHAPE_TYPE_DETAILS[shape.type]],
      ["Order", String(shape.order)],
      ["Group", shape.groupId || "None"],
      ["Visible", shape.visible ? "Visible" : "Hidden"],
      ["Locked", shape.locked ? "Locked" : "Unlocked"],
      ["Color", shape.style.fill === "none" ? shape.style.stroke : shape.style.fill],
      ["Transform", `x ${transform.x}, y ${transform.y}, rot ${transform.rotation}, scale ${transform.scaleX} x ${transform.scaleY}`]
    ]));
    shapePanel.append(editableHint);
    shapePanel.append(this.createShapeGeometryControls(shape));
    shapePanel.append(this.createShapeTransformControls(shape));
    shapePanel.append(this.createShapeActions(shape));
    wrapper.append(shapePanel);
    return wrapper;
  }

  createDetailGrid(entries) {
    const grid = document.createElement("div");
    grid.className = "object-vector-studio-v2__object-detail-grid";
    entries.forEach(([label, value]) => {
      const labelElement = document.createElement("span");
      labelElement.className = "object-vector-studio-v2__detail-label";
      labelElement.textContent = label;
      const valueElement = document.createElement("span");
      valueElement.className = "object-vector-studio-v2__detail-value";
      valueElement.textContent = value;
      grid.append(labelElement, valueElement);
    });
    return grid;
  }

  createShapeGeometryControls(shape) {
    const section = document.createElement("section");
    section.className = "object-vector-studio-v2__edit-panel";
    const heading = document.createElement("h4");
    heading.textContent = `${shapeTypeLabel(shape)} Geometry`;
    const grid = document.createElement("div");
    grid.className = "object-vector-studio-v2__edit-grid";
    this.shapeGeometryFields(shape).forEach((field) => {
      const label = document.createElement("label");
      label.className = "object-vector-studio-v2__edit-field";
      const caption = document.createElement("span");
      caption.textContent = field.label;
      const input = document.createElement("input");
      input.dataset.shapeGeometryField = field.key;
      input.type = field.kind;
      input.value = String(field.value);
      label.append(caption, input);
      grid.append(label);
    });
    const applyButton = document.createElement("button");
    applyButton.id = "objectVectorStudioV2ApplyGeometryButton";
    applyButton.type = "button";
    applyButton.textContent = "Apply Geometry";
    applyButton.addEventListener("click", () => this.applyShapeGeometryEdits());
    section.append(heading, grid, applyButton);
    return section;
  }

  createShapeTransformControls(shape) {
    const section = document.createElement("section");
    section.className = "object-vector-studio-v2__edit-panel";
    const heading = document.createElement("h4");
    heading.textContent = "Transform";
    const grid = document.createElement("div");
    grid.className = "object-vector-studio-v2__edit-grid";
    const transform = this.shapeTransform(shape);
    [
      ["objectVectorStudioV2MoveXInput", "Move X", "10"],
      ["objectVectorStudioV2MoveYInput", "Move Y", "0"],
      ["objectVectorStudioV2RotateInput", "Rotate", "15"],
      ["objectVectorStudioV2ScaleInput", "Scale", "1.1"],
      ["objectVectorStudioV2ResizeInput", "Resize", "10"],
      ["objectVectorStudioV2OriginXInput", "Origin X", String(transform.originX)],
      ["objectVectorStudioV2OriginYInput", "Origin Y", String(transform.originY)]
    ].forEach(([id, labelText, value]) => {
      const label = document.createElement("label");
      label.className = "object-vector-studio-v2__edit-field";
      const caption = document.createElement("span");
      caption.textContent = labelText;
      const input = document.createElement("input");
      input.id = id;
      input.type = "number";
      input.step = "0.1";
      input.value = value;
      label.append(caption, input);
      grid.append(label);
    });
    const actions = document.createElement("div");
    actions.className = "object-vector-studio-v2__shape-actions";
    [
      ["objectVectorStudioV2MoveShapeButton", "Move", () => this.moveSelectedShape()],
      ["objectVectorStudioV2RotateShapeButton", "Rotate", () => this.rotateSelectedShape()],
      ["objectVectorStudioV2ScaleShapeButton", "Scale", () => this.scaleSelectedShape()],
      ["objectVectorStudioV2ResizeShapeButton", "Resize", () => this.resizeSelectedShape()],
      ["objectVectorStudioV2ApplyOriginButton", "Apply Origin", () => this.applySelectedShapeOrigin()]
    ].forEach(([id, label, handler]) => {
      const button = document.createElement("button");
      button.id = id;
      button.type = "button";
      button.textContent = label;
      button.addEventListener("click", handler);
      actions.append(button);
    });
    section.append(heading, grid, actions);
    return section;
  }

  shapeGeometryFields(shape) {
    if (shape.type === "rectangle") {
      return ["x", "y", "width", "height"].map((key) => ({ key, kind: "number", label: key, value: shape.geometry[key] }));
    }
    if (shape.type === "circle") {
      return ["cx", "cy", "r"].map((key) => ({ key, kind: "number", label: key, value: shape.geometry[key] }));
    }
    if (shape.type === "ellipse") {
      return ["cx", "cy", "rx", "ry"].map((key) => ({ key, kind: "number", label: key, value: shape.geometry[key] }));
    }
    if (shape.type === "line") {
      return ["x1", "y1", "x2", "y2"].map((key) => ({ key, kind: "number", label: key, value: shape.geometry[key] }));
    }
    if (shape.type === "arc") {
      return ["cx", "cy", "r", "startAngle", "endAngle"].map((key) => ({ key, kind: "number", label: key, value: shape.geometry[key] }));
    }
    if (shape.type === "text") {
      return [
        { key: "x", kind: "number", label: "x", value: shape.geometry.x },
        { key: "y", kind: "number", label: "y", value: shape.geometry.y },
        { key: "fontSize", kind: "number", label: "fontSize", value: shape.geometry.fontSize },
        { key: "text", kind: "text", label: "text", value: shape.geometry.text }
      ];
    }
    return [
      {
        key: "points",
        kind: "text",
        label: "points",
        value: shape.geometry.points.map((point) => `${point.x},${point.y}`).join(" ")
      }
    ];
  }

  createShapeActions(shape) {
    const actions = document.createElement("div");
    actions.className = "object-vector-studio-v2__shape-actions";
    [
      ["objectVectorStudioV2ShapeVisibilityButton", shape.visible ? "Hide Shape" : "Show Shape", () => this.toggleSelectedShapeVisibility()],
      ["objectVectorStudioV2ShapeLockButton", shape.locked ? "Unlock Shape" : "Lock Shape", () => this.toggleSelectedShapeLock()],
      ["objectVectorStudioV2DuplicateShapeButton", "Duplicate Shape", () => this.duplicateSelectedShape()],
      ["objectVectorStudioV2DeleteShapeButton", "Delete Shape", () => this.deleteSelectedShape("button")],
      ["objectVectorStudioV2BringForwardButton", "Bring Forward", () => this.changeSelectedShapeOrder("forward")],
      ["objectVectorStudioV2SendBackwardButton", "Send Backward", () => this.changeSelectedShapeOrder("backward")],
      ["objectVectorStudioV2BringToFrontButton", "Bring To Front", () => this.changeSelectedShapeOrder("front")],
      ["objectVectorStudioV2SendToBackButton", "Send To Back", () => this.changeSelectedShapeOrder("back")],
      ["objectVectorStudioV2GroupShapesButton", "Group Shapes", () => this.groupSelectedShapes()],
      ["objectVectorStudioV2UngroupShapesButton", "Ungroup", () => this.ungroupSelectedShapes()]
    ].forEach(([id, label, handler]) => {
      const button = document.createElement("button");
      button.id = id;
      button.type = "button";
      button.textContent = label;
      button.addEventListener("click", handler);
      actions.append(button);
    });
    return actions;
  }

  renderWorkSurface() {
    const object = this.selectedObject();
    this.elements.renderSurface.replaceChildren();
    if (this.gridRenderEnabled) {
      this.renderGridLines();
    }
    if (!object) {
      this.renderCenterOriginMarker();
      this.elements.renderSummary.textContent = "Render mode: idle. Capture mode: none.";
      return;
    }

    if (this.elements.onionSkinToggle.checked) {
      this.renderOnionSkin(object);
    }
    let renderedCount = 0;
    sortedShapes(object).forEach((shape) => {
      const renderShape = this.effectiveShape(shape);
      if (!renderShape.visible) {
        return;
      }
      try {
        const element = this.createSvgShape(renderShape);
        element.dataset.shapeId = shape.id;
        element.dataset.shapeType = shape.type;
        element.classList.add("object-vector-studio-v2__shape");
        element.classList.toggle("is-selected", this.selectedShapeIds.has(shape.id));
        element.setAttribute("tabindex", "0");
        element.addEventListener("click", (event) => {
          event.stopPropagation();
          this.selectShape(shape.id, "render surface", { additive: event.shiftKey });
        });
        this.elements.renderSurface.append(element);
        renderedCount += 1;
      } catch (error) {
        this.statusLog.write(`FAIL Render mode svg-work-surface failed for shape ${shape.id} (${shape.type}): ${error.message}`);
      }
    });
    this.renderObjectBounds(object);
    this.renderSelectionOverlay(object);
    this.renderCenterOriginMarker();

    const frame = this.activeFrame();
    const message = `Render mode svg-work-surface: rendered ${object.name} with ${renderedCount} visible shapes${frame ? ` for ${this.selectedStateId}/${frame.id}` : ""}; capture mode none.`;
    this.elements.renderSummary.textContent = message;
    this.statusLog.write(`OK ${message}`);
  }

  renderOnionSkin(object) {
    const previousFrame = this.previousFrame();
    if (!previousFrame) {
      return;
    }
    const group = document.createElementNS(SVG_NS, "g");
    group.classList.add("object-vector-studio-v2__onion-skin");
    group.dataset.onionSkinFrame = previousFrame.id;
    sortedShapes(object).forEach((shape) => {
      const renderShape = this.effectiveShapeForFrame(shape, previousFrame);
      if (!renderShape.visible) {
        return;
      }
      try {
        group.append(this.createSvgShape(renderShape));
      } catch (error) {
        this.statusLog.write(`FAIL Onion-skin render failed for ${object.name}/${shape.id}: ${error.message}`);
      }
    });
    this.elements.renderSurface.append(group);
  }

  renderGridLines() {
    const group = document.createElementNS(SVG_NS, "g");
    group.classList.add("object-vector-studio-v2__grid-lines");
    group.dataset.gridRendered = "true";
    for (let x = -160; x <= 160; x += 20) {
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("x1", x);
      line.setAttribute("x2", x);
      line.setAttribute("y1", -110);
      line.setAttribute("y2", 110);
      group.append(line);
    }
    for (let y = -100; y <= 100; y += 20) {
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("x1", -160);
      line.setAttribute("x2", 160);
      line.setAttribute("y1", y);
      line.setAttribute("y2", y);
      group.append(line);
    }
    this.elements.renderSurface.append(group);
  }

  renderObjectBounds(object) {
    const bounds = this.objectBounds(object, { includeInvisible: false });
    const box = document.createElementNS(SVG_NS, "rect");
    box.classList.add("object-vector-studio-v2__object-bounds");
    box.dataset.objectBounds = object.id;
    box.setAttribute("x", bounds.x - 6);
    box.setAttribute("y", bounds.y - 6);
    box.setAttribute("width", bounds.width + 12);
    box.setAttribute("height", bounds.height + 12);
    this.elements.renderSurface.append(box);
  }

  renderCenterOriginMarker() {
    const marker = document.createElementNS(SVG_NS, "circle");
    marker.classList.add("object-vector-studio-v2__center-origin-dot");
    marker.dataset.centerOrigin = "0,0";
    marker.setAttribute("cx", "0");
    marker.setAttribute("cy", "0");
    marker.setAttribute("r", "3");
    marker.setAttribute("aria-label", "Canvas origin 0,0");
    this.elements.renderSurface.append(marker);
  }

  createSvgShape(shape) {
    if (shape.type === "rectangle") {
      const element = document.createElementNS(SVG_NS, "rect");
      element.setAttribute("x", shape.geometry.x);
      element.setAttribute("y", shape.geometry.y);
      element.setAttribute("width", shape.geometry.width);
      element.setAttribute("height", shape.geometry.height);
      this.applySvgStyle(element, shape);
      return element;
    }
    if (shape.type === "circle") {
      const element = document.createElementNS(SVG_NS, "circle");
      element.setAttribute("cx", shape.geometry.cx);
      element.setAttribute("cy", shape.geometry.cy);
      element.setAttribute("r", shape.geometry.r);
      this.applySvgStyle(element, shape);
      return element;
    }
    if (shape.type === "ellipse") {
      const element = document.createElementNS(SVG_NS, "ellipse");
      element.setAttribute("cx", shape.geometry.cx);
      element.setAttribute("cy", shape.geometry.cy);
      element.setAttribute("rx", shape.geometry.rx);
      element.setAttribute("ry", shape.geometry.ry);
      this.applySvgStyle(element, shape);
      return element;
    }
    if (shape.type === "line") {
      const element = document.createElementNS(SVG_NS, "line");
      element.setAttribute("x1", shape.geometry.x1);
      element.setAttribute("y1", shape.geometry.y1);
      element.setAttribute("x2", shape.geometry.x2);
      element.setAttribute("y2", shape.geometry.y2);
      this.applySvgStyle(element, shape);
      return element;
    }
    if (shape.type === "polygon") {
      const element = document.createElementNS(SVG_NS, "polygon");
      element.setAttribute("points", shape.geometry.points.map((point) => `${point.x},${point.y}`).join(" "));
      this.applySvgStyle(element, shape);
      return element;
    }
    if (shape.type === "arc") {
      const element = document.createElementNS(SVG_NS, "path");
      element.setAttribute("d", this.arcPath(shape.geometry));
      this.applySvgStyle(element, shape);
      return element;
    }
    if (shape.type === "text") {
      const element = document.createElementNS(SVG_NS, "text");
      element.setAttribute("x", shape.geometry.x);
      element.setAttribute("y", shape.geometry.y);
      element.setAttribute("font-size", shape.geometry.fontSize);
      element.textContent = shape.geometry.text;
      this.applySvgStyle(element, shape);
      return element;
    }
    throw new Error(`unsupported shape type ${shape.type}`);
  }

  applySvgStyle(element, shape) {
    element.setAttribute("fill", shape.style.fill);
    element.setAttribute("stroke", shape.style.stroke);
    element.setAttribute("stroke-width", shape.style.strokeWidth);
    const transform = this.shapeTransform(shape);
    element.setAttribute("transform", this.svgTransformAttribute(transform));
  }

  shapeTransform(shape) {
    return shape.transform || defaultShapeTransform(shape);
  }

  effectiveShape(shape) {
    return this.effectiveShapeForFrame(shape, this.activeFrame());
  }

  effectiveShapeForFrame(shape, frame) {
    const effective = JSON.parse(JSON.stringify(shape));
    const override = frame?.shapeOverrides?.find((entry) => entry.shapeId === shape.id) || null;
    if (override && Object.prototype.hasOwnProperty.call(override, "visible")) {
      effective.visible = override.visible;
    }
    if (override?.transform) {
      effective.transform = { ...override.transform };
    }
    return effective;
  }

  svgTransformAttribute(transform) {
    return [
      `translate(${transform.x} ${transform.y})`,
      `translate(${transform.originX} ${transform.originY})`,
      `rotate(${transform.rotation})`,
      `scale(${transform.scaleX} ${transform.scaleY})`,
      `translate(${-transform.originX} ${-transform.originY})`
    ].join(" ");
  }

  transformedBounds(shape) {
    const bounds = shapeBounds(shape);
    const transform = this.shapeTransform(shape);
    return {
      height: Math.max(1, bounds.height * transform.scaleY),
      originX: transform.originX + transform.x,
      originY: transform.originY + transform.y,
      width: Math.max(1, bounds.width * transform.scaleX),
      x: bounds.x + transform.x,
      y: bounds.y + transform.y
    };
  }

  objectBounds(object, { includeInvisible = true } = {}) {
    const shapes = sortedShapes(object).filter((shape) => includeInvisible || shape.visible);
    if (!shapes.length) {
      return {
        height: 80,
        width: 120,
        x: -60,
        y: -40
      };
    }

    const activeFrame = object?.id === this.selectedObjectId ? this.activeFrame() : null;
    const bounds = shapes.map((shape) => this.transformedBounds(this.effectiveShapeForFrame(shape, activeFrame)));
    const minX = Math.min(...bounds.map((entry) => entry.x));
    const minY = Math.min(...bounds.map((entry) => entry.y));
    const maxX = Math.max(...bounds.map((entry) => entry.x + entry.width));
    const maxY = Math.max(...bounds.map((entry) => entry.y + entry.height));
    return {
      height: Number((maxY - minY).toFixed(3)),
      width: Number((maxX - minX).toFixed(3)),
      x: Number(minX.toFixed(3)),
      y: Number(minY.toFixed(3))
    };
  }

  objectBoundsForFrame(object, frame) {
    const shapes = sortedShapes(object)
      .map((shape) => this.effectiveShapeForFrame(shape, frame))
      .filter((shape) => shape.visible);
    if (!shapes.length) {
      return {
        height: 80,
        width: 120,
        x: -60,
        y: -40
      };
    }
    const bounds = shapes.map((shape) => this.transformedBounds(shape));
    const minX = Math.min(...bounds.map((entry) => entry.x));
    const minY = Math.min(...bounds.map((entry) => entry.y));
    const maxX = Math.max(...bounds.map((entry) => entry.x + entry.width));
    const maxY = Math.max(...bounds.map((entry) => entry.y + entry.height));
    return {
      height: Number((maxY - minY).toFixed(3)),
      width: Number((maxX - minX).toFixed(3)),
      x: Number(minX.toFixed(3)),
      y: Number(minY.toFixed(3))
    };
  }

  updateSelectionMetrics(object, shape) {
    const bounds = shape ? this.transformedBounds(shape) : this.objectBounds(object);
    const selectedLabel = shape ? `${shape.id} (${shape.type})` : object.name;
    this.elements.selectionMetrics.textContent = [
      `Selection: ${selectedLabel}`,
      `state ${this.selectedStateId || "none"}`,
      `frame ${this.selectedFrameId || "none"}`,
      `bounds ${this.formatViewportNumber(bounds.width)} x ${this.formatViewportNumber(bounds.height)}`,
      `origin ${this.formatViewportNumber(this.viewport.x)}, ${this.formatViewportNumber(this.viewport.y)}`,
      `zoom ${Math.round(this.viewport.zoom * 100)}%`
    ].join(" | ");
  }

  renderSelectionOverlay(object) {
    const selectedShape = this.selectedShape();
    if (!selectedShape || selectedShape.visible === false) {
      return;
    }
    try {
      const bounds = this.transformedBounds(this.effectiveShape(selectedShape));
      const box = document.createElementNS(SVG_NS, "rect");
      box.classList.add("object-vector-studio-v2__selection-box");
      box.dataset.selectionBounds = selectedShape.id;
      box.setAttribute("x", bounds.x - 4);
      box.setAttribute("y", bounds.y - 4);
      box.setAttribute("width", bounds.width + 8);
      box.setAttribute("height", bounds.height + 8);
      this.elements.renderSurface.append(box);

      [
        [bounds.x - 4, bounds.y - 4, "nw"],
        [bounds.x + bounds.width + 4, bounds.y - 4, "ne"],
        [bounds.x - 4, bounds.y + bounds.height + 4, "sw"],
        [bounds.x + bounds.width + 4, bounds.y + bounds.height + 4, "se"]
      ].forEach(([cx, cy, handle]) => {
        const point = document.createElementNS(SVG_NS, "rect");
        point.classList.add("object-vector-studio-v2__resize-handle");
        point.dataset.resizeHandle = handle;
        point.dataset.resizeShapeId = selectedShape.id;
        point.setAttribute("x", cx - 3);
        point.setAttribute("y", cy - 3);
        point.setAttribute("width", 6);
        point.setAttribute("height", 6);
        this.elements.renderSurface.append(point);
      });

      const pivot = document.createElementNS(SVG_NS, "g");
      pivot.classList.add("object-vector-studio-v2__pivot-origin");
      pivot.dataset.pivotOrigin = selectedShape.id;
      const horizontal = document.createElementNS(SVG_NS, "line");
      horizontal.setAttribute("x1", bounds.originX - 7);
      horizontal.setAttribute("x2", bounds.originX + 7);
      horizontal.setAttribute("y1", bounds.originY);
      horizontal.setAttribute("y2", bounds.originY);
      const vertical = document.createElementNS(SVG_NS, "line");
      vertical.setAttribute("x1", bounds.originX);
      vertical.setAttribute("x2", bounds.originX);
      vertical.setAttribute("y1", bounds.originY - 7);
      vertical.setAttribute("y2", bounds.originY + 7);
      pivot.append(horizontal, vertical);
      this.elements.renderSurface.append(pivot);
    } catch (error) {
      this.statusLog.write(`FAIL Selection overlay render failed for ${object.name}/${selectedShape.id} (${selectedShape.type}): ${error.message}`);
    }
  }

  arcPath(geometry) {
    const start = this.polarPoint(geometry.cx, geometry.cy, geometry.r, geometry.startAngle);
    const end = this.polarPoint(geometry.cx, geometry.cy, geometry.r, geometry.endAngle);
    const largeArc = Math.abs(geometry.endAngle - geometry.startAngle) > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${geometry.r} ${geometry.r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  }

  polarPoint(cx, cy, radius, degrees) {
    const radians = (degrees - 90) * Math.PI / 180;
    return {
      x: Number((cx + radius * Math.cos(radians)).toFixed(3)),
      y: Number((cy + radius * Math.sin(radians)).toFixed(3))
    };
  }

  updateViewport() {
    const width = DEFAULT_VIEWPORT.width / this.viewport.zoom;
    const height = DEFAULT_VIEWPORT.height / this.viewport.zoom;
    const viewX = this.formatViewportNumber(this.viewport.x - width / 2);
    const viewY = this.formatViewportNumber(this.viewport.y - height / 2);
    this.elements.renderSurface.setAttribute("viewBox", `${viewX} ${viewY} ${this.formatViewportNumber(width)} ${this.formatViewportNumber(height)}`);
    this.elements.coordinateDisplay.textContent = `Origin: ${this.formatViewportNumber(this.viewport.x)}, ${this.formatViewportNumber(this.viewport.y)} | Canvas 0,0 centered | Zoom ${Math.round(this.viewport.zoom * 100)}%`;
    const object = this.selectedObject();
    if (object) {
      this.updateSelectionMetrics(object, this.selectedShape());
    }
  }

  formatViewportNumber(value) {
    const normalized = Number(Number(value).toFixed(3));
    return Object.is(normalized, -0) ? 0 : normalized;
  }

  zoomViewport(factor) {
    const nextZoom = Number((this.viewport.zoom * factor).toFixed(3));
    if (!Number.isFinite(nextZoom) || nextZoom < 0.25 || nextZoom > 4) {
      this.statusLog.write(`WARN Viewport zoom skipped: ${nextZoom} is outside 25% to 400%.`);
      return;
    }
    this.viewport.zoom = nextZoom;
    this.updateViewport();
    this.statusLog.write(`OK Viewport zoom set to ${Math.round(this.viewport.zoom * 100)}%.`);
  }

  panViewport(x, y) {
    this.viewport.x = Number((this.viewport.x + x).toFixed(3));
    this.viewport.y = Number((this.viewport.y + y).toFixed(3));
    this.updateViewport();
    this.statusLog.write(`OK Viewport pan set to ${this.viewport.x}, ${this.viewport.y}.`);
  }

  resetViewport() {
    this.viewport = { ...DEFAULT_VIEWPORT };
    this.updateViewport();
    this.statusLog.write("OK Viewport reset to 100% at origin 0,0.");
  }

  updateCoordinateDisplay(event) {
    const bounds = this.elements.renderSurface.getBoundingClientRect();
    if (!bounds.width || !bounds.height) {
      return;
    }
    const viewWidth = DEFAULT_VIEWPORT.width / this.viewport.zoom;
    const viewHeight = DEFAULT_VIEWPORT.height / this.viewport.zoom;
    const x = this.viewport.x - viewWidth / 2 + ((event.clientX - bounds.left) / bounds.width) * viewWidth;
    const y = this.viewport.y - viewHeight / 2 + ((event.clientY - bounds.top) / bounds.height) * viewHeight;
    this.elements.coordinateDisplay.textContent = `Pointer ${Math.round(x)}, ${Math.round(y)} | Canvas origin 0,0 centered | Zoom ${Math.round(this.viewport.zoom * 100)}%`;
  }

  selectObject(objectId, sourceLabel) {
    if (!this.currentPayload?.objects.some((object) => object.id === objectId)) {
      this.statusLog.write(`WARN Select object skipped: object id ${objectId || "unknown"} is not available.`);
      return;
    }

    this.selectedObjectId = objectId;
    const selectedObject = this.selectedObject();
    this.selectedShapeId = sortedShapes(selectedObject)[0]?.id || "";
    this.selectedShapeIds = new Set(this.selectedShapeId ? [this.selectedShapeId] : []);
    const selectedState = this.objectStates(selectedObject)[0] || null;
    this.selectedStateId = selectedState?.id || "";
    this.selectedFrameId = selectedState ? sortedFrames(selectedState)[0]?.id || "" : "";
    this.renderPayload();
    const selected = this.selectedObject();
    this.statusLog.write(`OK Selected object from ${sourceLabel}: ${selected.name}.`);
  }

  selectShape(shapeId, sourceLabel, options = {}) {
    const object = this.selectedObject();
    if (!object?.shapes.some((shape) => shape.id === shapeId)) {
      this.statusLog.write(`WARN Select shape skipped: shape id ${shapeId || "unknown"} is not available.`);
      return;
    }

    this.selectedShapeId = shapeId;
    if (options.additive) {
      if (this.selectedShapeIds.has(shapeId) && this.selectedShapeIds.size > 1) {
        this.selectedShapeIds.delete(shapeId);
        this.selectedShapeId = Array.from(this.selectedShapeIds).at(-1) || "";
      } else {
        this.selectedShapeIds.add(shapeId);
      }
    } else {
      this.selectedShapeIds = new Set([shapeId]);
    }
    this.renderPayload();
    const shape = this.selectedShape();
    this.statusLog.write(`OK Selected shape from ${sourceLabel}: ${shape.id} (${shape.type}). Multi-select count: ${this.selectedShapeIds.size}.`);
  }

  selectState(stateId, sourceLabel) {
    const object = this.selectedObject();
    if (!object) {
      this.statusLog.write("WARN State selection skipped: no object is selected.");
      this.elements.stateSelect.value = "";
      return;
    }
    if (!stateId) {
      this.selectedStateId = "";
      this.selectedFrameId = "";
      this.stopPlaybackTimer();
      this.renderPayload();
      this.statusLog.write(`OK State selection cleared from ${sourceLabel}.`);
      return;
    }
    const state = this.objectStates(object).find((candidate) => candidate.id === stateId);
    if (!state) {
      this.statusLog.write(`WARN State selection pending: ${stateId} is not created for ${object.name}. Use Create State to add it.`);
      this.selectedStateId = "";
      this.selectedFrameId = "";
      this.renderFrameTimeline();
      this.updateAnimationActionState();
      return;
    }
    this.selectedStateId = state.id;
    this.selectedFrameId = sortedFrames(state)[0]?.id || "";
    this.stopPlaybackTimer();
    this.renderPayload();
    this.statusLog.write(`OK Selected state ${OBJECT_STATE_LABELS[state.id]} from ${sourceLabel}; active object remains ${object.name}.`);
  }

  selectFrame(frameId, sourceLabel) {
    const state = this.selectedState();
    if (!state) {
      this.statusLog.write("WARN Frame selection skipped: no state is selected.");
      return;
    }
    const frame = sortedFrames(state).find((candidate) => candidate.id === frameId);
    if (!frame) {
      this.statusLog.write(`WARN Frame selection skipped: frame id ${frameId || "unknown"} is not available.`);
      return;
    }
    this.selectedFrameId = frame.id;
    this.renderPayload();
    this.statusLog.write(`OK Selected frame ${frame.id} from ${sourceLabel}.`);
  }

  createSelectedState() {
    const object = this.selectedObject();
    if (!object) {
      this.statusLog.write("WARN Create state skipped: no object is selected.");
      return;
    }
    const stateId = this.elements.stateSelect.value;
    if (!OBJECT_STATE_IDS.includes(stateId)) {
      this.statusLog.write("FAIL Create state blocked: choose idle, thrust, damaged, destroyed, active, or inactive.");
      return;
    }
    if (this.objectStates(object).some((state) => state.id === stateId)) {
      this.statusLog.write(`WARN Create state skipped: ${OBJECT_STATE_LABELS[stateId]} already exists for ${object.name}.`);
      this.selectState(stateId, "existing state");
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((candidate) => candidate.id === object.id);
    nextObject.states = this.objectStates(nextObject);
    const frame = this.createFrameSnapshot(nextObject, stateId, `${stateId}-frame-1`, 1);
    nextObject.states.push({
      frames: [frame],
      id: stateId,
      name: OBJECT_STATE_LABELS[stateId]
    });
    this.commitPayloadUpdate(nextPayload, object.id, this.selectedShapeId, `OK Created state ${OBJECT_STATE_LABELS[stateId]} with frame ${frame.id}.`, "Create state failed schema validation", {
      selectedFrameId: frame.id,
      selectedStateId: stateId
    });
  }

  duplicateSelectedFrame() {
    const object = this.selectedObject();
    const state = this.selectedState();
    const frame = this.activeFrame();
    if (!object || !state || !frame) {
      this.statusLog.write("WARN Duplicate frame skipped: select an object state and frame first.");
      return;
    }
    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((candidate) => candidate.id === object.id);
    const nextState = this.objectStates(nextObject).find((candidate) => candidate.id === state.id);
    const frameCopy = JSON.parse(JSON.stringify(frame));
    frameCopy.id = this.uniqueFrameId(nextState);
    frameCopy.order = sortedFrames(nextState).length + 1;
    nextState.frames.push(frameCopy);
    this.commitPayloadUpdate(nextPayload, object.id, this.selectedShapeId, `OK Duplicated frame ${frame.id} as ${frameCopy.id}.`, "Duplicate frame failed schema validation", {
      selectedFrameId: frameCopy.id,
      selectedStateId: state.id
    });
  }

  moveSelectedFrame(direction) {
    const object = this.selectedObject();
    const state = this.selectedState();
    const frame = this.activeFrame();
    if (!object || !state || !frame) {
      this.statusLog.write(`WARN Move frame ${direction} skipped: select an object state and frame first.`);
      return;
    }
    const frames = sortedFrames(state);
    const index = frames.findIndex((candidate) => candidate.id === frame.id);
    const nextIndex = direction === "earlier" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= frames.length) {
      this.statusLog.write(`WARN Move frame ${direction} skipped: frame ${frame.id} cannot move ${direction}.`);
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((candidate) => candidate.id === object.id);
    const nextState = this.objectStates(nextObject).find((candidate) => candidate.id === state.id);
    const nextFrames = sortedFrames(nextState);
    const [movedFrame] = nextFrames.splice(index, 1);
    nextFrames.splice(nextIndex, 0, movedFrame);
    nextFrames.forEach((candidate, frameIndex) => {
      candidate.order = frameIndex + 1;
    });
    nextState.frames = nextFrames;
    this.commitPayloadUpdate(nextPayload, object.id, this.selectedShapeId, `OK Moved frame ${frame.id} ${direction}.`, "Move frame failed schema validation", {
      selectedFrameId: frame.id,
      selectedStateId: state.id
    });
  }

  playAnimation() {
    const state = this.selectedState();
    const frames = sortedFrames(state);
    if (!state || !frames.length) {
      this.statusLog.write("FAIL Playback blocked: create and select an animation state with at least one frame.");
      return;
    }
    const fps = Number(this.elements.fpsInput.value);
    if (!Number.isInteger(fps) || fps < 1 || fps > 60) {
      this.statusLog.write("FAIL Playback blocked: FPS must be an integer from 1 to 60.");
      return;
    }
    this.stopPlaybackTimer(false);
    this.isAnimationPlaying = true;
    this.updateAnimationActionState();
    this.playbackTimerId = this.window.setInterval(() => this.advancePlaybackFrame(), Math.round(1000 / fps));
    this.statusLog.write(`OK Playback started for state ${OBJECT_STATE_LABELS[state.id]} at ${fps} FPS.`);
  }

  pauseAnimation() {
    if (!this.isAnimationPlaying) {
      this.statusLog.write("WARN Playback pause skipped: animation is not playing.");
      return;
    }
    this.stopPlaybackTimer(false);
    this.statusLog.write(`OK Playback paused at frame ${this.selectedFrameId || "none"}.`);
  }

  stopAnimation() {
    const state = this.selectedState();
    this.stopPlaybackTimer(false);
    if (state) {
      this.selectedFrameId = sortedFrames(state)[0]?.id || "";
      this.renderPayload();
    }
    this.statusLog.write("OK Playback stopped.");
  }

  stopPlaybackTimer(shouldRender = true) {
    if (this.playbackTimerId) {
      this.window.clearInterval(this.playbackTimerId);
      this.playbackTimerId = 0;
    }
    this.isAnimationPlaying = false;
    if (shouldRender) {
      this.updateAnimationActionState();
    }
  }

  advancePlaybackFrame() {
    const state = this.selectedState();
    const frames = sortedFrames(state);
    if (!state || !frames.length) {
      this.stopPlaybackTimer();
      this.statusLog.write("FAIL Playback stopped: selected state or frame timeline is missing.");
      return;
    }
    const index = Math.max(0, frames.findIndex((frame) => frame.id === this.selectedFrameId));
    const nextFrame = frames[index + 1];
    if (nextFrame) {
      this.selectedFrameId = nextFrame.id;
      this.renderPayload();
      return;
    }
    if (this.elements.loopToggle.checked) {
      this.selectedFrameId = frames[0].id;
      this.renderPayload();
      return;
    }
    this.stopPlaybackTimer();
    this.statusLog.write(`OK Playback completed for state ${OBJECT_STATE_LABELS[state.id]}.`);
  }

  addObject() {
    const name = this.elements.objectNameInput.value.trim();
    if (!this.currentPayload) {
      this.statusLog.write("FAIL Add object blocked: load a schema-valid Object Vector Studio V2 payload before adding objects.");
      return;
    }
    if (!name) {
      this.statusLog.write("FAIL Add object blocked: enter an object name.");
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const id = this.uniqueObjectId(name, nextPayload.objects);
    nextPayload.objects.push({
      category: this.validAssetCategory(this.elements.assetCategorySelect.value),
      id,
      name,
      shapes: [],
      tags: tagList(this.elements.assetTagsInput.value),
      type: DEFAULT_OBJECT_TYPE
    });
    this.commitPayloadUpdate(nextPayload, id, "", `OK Added object ${name} with id ${id}.`, "Add object failed schema validation");
  }

  createObjectFromTemplate() {
    if (!this.currentPayload) {
      this.statusLog.write("FAIL Create template blocked: load a schema-valid Object Vector Studio V2 payload before adding template objects.");
      return;
    }

    const templateKey = this.elements.templateSelect.value || "ship";
    const template = OBJECT_TEMPLATES[templateKey];
    if (!template) {
      this.statusLog.write(`FAIL Create template blocked: unknown template ${templateKey}.`);
      return;
    }

    const color = this.firstPaletteColor();
    if (!color) {
      this.statusLog.write(`FAIL Create template ${template.label} blocked: palette swatches do not provide a usable color value.`);
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const object = this.buildTemplateObject(templateKey, nextPayload.objects, color);
    nextPayload.objects.push(object);
    const selectedShapeId = sortedShapes(object)[0]?.id || "";
    this.commitPayloadUpdate(
      nextPayload,
      object.id,
      selectedShapeId,
      `OK Created ${template.label} template object ${object.name} with ${object.shapes.length} shapes.`,
      `${template.label} template object failed schema validation`
    );
  }

  buildTemplateObject(templateKey, objects, color) {
    const template = OBJECT_TEMPLATES[templateKey];
    const name = `${template.label} Template`;
    const id = this.uniqueObjectId(name, objects);
    const accent = this.secondPaletteColor(color);
    const shape = (type, suffix, order, geometry, style = {}) => ({
      geometry,
      id: `${id}-${suffix}`,
      locked: false,
      order,
      style: {
        fill: style.fill ?? (["arc", "line"].includes(type) ? "none" : color),
        stroke: style.stroke ?? accent,
        strokeWidth: style.strokeWidth ?? 3
      },
      transform: {
        originX: 0,
        originY: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        x: 0,
        y: 0
      },
      type,
      visible: true
    });
    const templates = {
      asteroid: [
        shape("polygon", "body", 1, { points: [{ x: -62, y: -22 }, { x: -34, y: -58 }, { x: 18, y: -48 }, { x: 62, y: -12 }, { x: 42, y: 42 }, { x: -22, y: 54 }, { x: -70, y: 16 }] }),
        shape("circle", "crater", 2, { cx: 18, cy: -8, r: 10 }, { fill: "none", stroke: accent, strokeWidth: 2 })
      ],
      bullet: [
        shape("rectangle", "core", 1, { height: 12, width: 76, x: -38, y: -6 }),
        shape("line", "trail", 2, { x1: -70, x2: -42, y1: 0, y2: 0 }, { stroke: accent, strokeWidth: 4 })
      ],
      pickup: [
        shape("circle", "halo", 1, { cx: 0, cy: 0, r: 46 }, { fill: "none", stroke: accent, strokeWidth: 4 }),
        shape("polygon", "gem", 2, { points: [{ x: 0, y: -42 }, { x: 34, y: -10 }, { x: 20, y: 42 }, { x: -20, y: 42 }, { x: -34, y: -10 }] })
      ],
      ship: [
        shape("polygon", "hull", 1, { points: [{ x: 0, y: -64 }, { x: 48, y: 48 }, { x: 0, y: 24 }, { x: -48, y: 48 }] }),
        shape("line", "spine", 2, { x1: 0, x2: 0, y1: -44, y2: 34 }, { stroke: accent, strokeWidth: 4 })
      ],
      ufo: [
        shape("ellipse", "saucer", 1, { cx: 0, cy: 12, rx: 74, ry: 24 }),
        shape("ellipse", "dome", 2, { cx: 0, cy: -10, rx: 34, ry: 24 }, { fill: accent, stroke: color, strokeWidth: 3 })
      ]
    };
    return {
      category: this.validAssetCategory(template.type),
      id,
      name,
      shapes: templates[templateKey],
      tags: [templateKey, template.type, "template"],
      type: template.type
    };
  }

  updateSelectedObjectType() {
    const selected = this.selectedObject();
    if (!selected) {
      this.statusLog.write("WARN Object type update skipped: no object is selected.");
      this.elements.objectTypeSelect.value = DEFAULT_OBJECT_TYPE;
      return;
    }

    const type = this.validObjectType(this.elements.objectTypeSelect.value);
    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((object) => object.id === selected.id);
    nextObject.type = type;
    this.commitPayloadUpdate(nextPayload, selected.id, this.selectedShapeId, `OK Object ${selected.name} type set to ${objectTypeLabel(nextObject)}.`, "Object type update failed schema validation");
  }

  renameSelectedObject() {
    const selected = this.selectedObject();
    if (!selected) {
      this.statusLog.write("WARN Rename object skipped: no object is selected.");
      return;
    }

    const name = this.elements.objectNameInput.value.trim();
    if (!name) {
      this.statusLog.write("FAIL Rename object blocked: enter an object name.");
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((object) => object.id === selected.id);
    nextObject.name = name;
    this.commitPayloadUpdate(nextPayload, selected.id, this.selectedShapeId, `OK Renamed object ${selected.id} to ${name}.`, "Rename object failed schema validation");
  }

  duplicateSelectedObject() {
    const selected = this.selectedObject();
    if (!selected) {
      this.statusLog.write("WARN Duplicate object skipped: no object is selected.");
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const objectCopy = JSON.parse(JSON.stringify(selected));
    objectCopy.id = this.uniqueObjectId(`${selected.name} Copy`, nextPayload.objects);
    objectCopy.name = `${selected.name} Copy`;
    nextPayload.objects.push(objectCopy);
    const selectedShapeId = sortedShapes(objectCopy)[0]?.id || "";
    this.commitPayloadUpdate(nextPayload, objectCopy.id, selectedShapeId, `OK Duplicated object ${selected.name} as ${objectCopy.name}.`, "Duplicate object failed schema validation");
  }

  createLibraryAssetForSelectedObject() {
    const selected = this.selectedObject();
    if (!selected) {
      this.statusLog.write("FAIL Library asset creation blocked: select a schema-valid object first.");
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    nextPayload.assetLibrary = nextPayload.assetLibrary || { assets: [] };
    const nextObject = nextPayload.objects.find((object) => object.id === selected.id);
    nextObject.category = this.validAssetCategory(this.elements.assetCategorySelect.value || nextObject.category || nextObject.type);
    nextObject.tags = tagList(this.elements.assetTagsInput.value || nextObject.tags || [nextObject.type]);
    const asset = {
      category: nextObject.category,
      id: this.uniqueAssetId(nextObject.name, nextPayload.assetLibrary.assets),
      name: nextObject.name,
      objectId: nextObject.id,
      tags: nextObject.tags
    };
    nextPayload.assetLibrary.assets.push(asset);
    this.commitPayloadUpdate(nextPayload, selected.id, this.selectedShapeId, `OK Created reusable library asset ${asset.id} for ${selected.name}.`, "Library asset creation failed schema validation");
  }

  duplicateSelectedObjectAsLocal() {
    const selected = this.selectedObject();
    if (!selected) {
      this.statusLog.write("WARN Duplicate As Local skipped: no object is selected.");
      return;
    }

    const resolved = this.resolveObjectForPayload(this.currentPayload, selected.id);
    if (!resolved) {
      this.statusLog.write(`FAIL Duplicate As Local blocked: inheritance dependency resolution failed for ${selected.id}.`);
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const localCopy = JSON.parse(JSON.stringify(resolved));
    delete localCopy.baseObjectId;
    delete localCopy.inheritedFrom;
    localCopy.id = this.uniqueObjectId(`${selected.name} Local Copy`, nextPayload.objects);
    localCopy.name = `${selected.name} Local Copy`;
    localCopy.category = this.validAssetCategory(localCopy.category || localCopy.type);
    localCopy.tags = Array.from(new Set([...(localCopy.tags || []), "local"]));
    nextPayload.objects.push(localCopy);
    const selectedShapeId = sortedShapes(localCopy)[0]?.id || "";
    this.commitPayloadUpdate(nextPayload, localCopy.id, selectedShapeId, `OK Duplicated ${selected.name} as local object ${localCopy.name}; inherited fields are now editable locally.`, "Duplicate As Local failed schema validation");
  }

  deleteSelectedObject() {
    const selected = this.selectedObject();
    if (!selected) {
      this.statusLog.write("WARN Delete object skipped: no object is selected.");
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    nextPayload.objects = nextPayload.objects.filter((object) => object.id !== selected.id);
    const selectedObjectId = nextPayload.objects[0]?.id || "";
    const selectedShapeId = sortedShapes(nextPayload.objects[0])[0]?.id || "";
    this.commitPayloadUpdate(nextPayload, selectedObjectId, selectedShapeId, `OK Deleted object ${selected.name}.`, "Delete object failed schema validation");
  }

  flattenSelectedObject() {
    const selected = this.selectedObject();
    if (!selected) {
      this.statusLog.write("WARN Flatten object skipped: no object is selected.");
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((object) => object.id === selected.id);
    if (!nextObject.shapes.length) {
      this.statusLog.write(`WARN Flatten object skipped: ${selected.name} has no shapes to flatten.`);
      return;
    }
    const rotatedShape = sortedShapes(nextObject).find((shape) => this.shapeTransform(shape).rotation !== 0);
    if (rotatedShape) {
      this.statusLog.write(`FAIL Flatten object blocked: shape ${rotatedShape.id} has rotation ${this.shapeTransform(rotatedShape).rotation}; rotate-safe flatten is not available in this schema pass.`);
      return;
    }
    let flattenedCount = 0;
    nextObject.shapes = sortedShapes(nextObject).map((shape, index) => {
      const flattened = this.flattenShapeTransform(shape);
      flattened.order = index + 1;
      flattenedCount += 1;
      return flattened;
    });
    const selectedShapeId = sortedShapes(nextObject)[0]?.id || "";
    this.commitPayloadUpdate(nextPayload, selected.id, selectedShapeId, `OK Flattened object ${selected.name}: baked transforms into ${flattenedCount} shapes.`, "Flatten object failed schema validation");
  }

  createShape(type) {
    const object = this.selectedObject();
    if (!object) {
      this.statusLog.write(`FAIL Create ${type} blocked: select a schema-valid object first.`);
      return;
    }

    const color = this.firstPaletteColor();
    if (!color) {
      this.statusLog.write(`FAIL Create ${type} blocked: palette swatches do not provide a usable color value.`);
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((candidate) => candidate.id === object.id);
    const order = nextObject.shapes.length ? Math.max(...nextObject.shapes.map((shape) => shape.order)) + 1 : 1;
    const shape = this.createPrimitiveShape(type, this.uniqueShapeId(type, nextObject.shapes), order, color);
    nextObject.shapes.push(shape);
    this.commitPayloadUpdate(nextPayload, nextObject.id, shape.id, `OK Created ${type} shape ${shape.id} on ${nextObject.name}.`, `Create ${type} failed schema validation`);
  }

  createPrimitiveShape(type, id, order, color) {
    const withTransform = (shape) => ({
      ...shape,
      transform: defaultShapeTransform(shape)
    });
    const base = {
      id,
      locked: false,
      order,
      style: {
        fill: ["arc", "line"].includes(type) ? "none" : color,
        stroke: color,
        strokeWidth: 3
      },
      type,
      visible: true
    };
    if (type === "rectangle") {
      return withTransform({ ...base, geometry: { height: 62, width: 86, x: -90, y: -30 } });
    }
    if (type === "circle") {
      return withTransform({ ...base, geometry: { cx: 70, cy: -10, r: 30 } });
    }
    if (type === "ellipse") {
      return withTransform({ ...base, geometry: { cx: 70, cy: 70, rx: 52, ry: 26 } });
    }
    if (type === "line") {
      return withTransform({ ...base, geometry: { x1: -100, x2: 0, y1: 80, y2: 30 } });
    }
    if (type === "polygon") {
      return withTransform({
        ...base,
        geometry: {
          points: [
            { x: 0, y: -80 },
            { x: 40, y: -8 },
            { x: -38, y: -8 }
          ]
        }
      });
    }
    if (type === "arc") {
      return withTransform({ ...base, geometry: { cx: 0, cy: 70, endAngle: 135, r: 42, startAngle: -135 } });
    }
    if (type === "text") {
      return withTransform({ ...base, geometry: { fontSize: 24, text: "Text", x: -30, y: 40 } });
    }
    return base;
  }

  flattenShapeTransform(shape) {
    const nextShape = JSON.parse(JSON.stringify(shape));
    const transform = this.shapeTransform(nextShape);
    const applyX = (value) => Number((transform.x + transform.originX + (value - transform.originX) * transform.scaleX).toFixed(3));
    const applyY = (value) => Number((transform.y + transform.originY + (value - transform.originY) * transform.scaleY).toFixed(3));
    if (nextShape.type === "rectangle") {
      nextShape.geometry.x = applyX(nextShape.geometry.x);
      nextShape.geometry.y = applyY(nextShape.geometry.y);
      nextShape.geometry.width = Number((nextShape.geometry.width * transform.scaleX).toFixed(3));
      nextShape.geometry.height = Number((nextShape.geometry.height * transform.scaleY).toFixed(3));
    } else if (nextShape.type === "circle") {
      nextShape.geometry.cx = applyX(nextShape.geometry.cx);
      nextShape.geometry.cy = applyY(nextShape.geometry.cy);
      nextShape.geometry.r = Number((nextShape.geometry.r * Math.max(transform.scaleX, transform.scaleY)).toFixed(3));
    } else if (nextShape.type === "ellipse") {
      nextShape.geometry.cx = applyX(nextShape.geometry.cx);
      nextShape.geometry.cy = applyY(nextShape.geometry.cy);
      nextShape.geometry.rx = Number((nextShape.geometry.rx * transform.scaleX).toFixed(3));
      nextShape.geometry.ry = Number((nextShape.geometry.ry * transform.scaleY).toFixed(3));
    } else if (nextShape.type === "line") {
      nextShape.geometry.x1 = applyX(nextShape.geometry.x1);
      nextShape.geometry.y1 = applyY(nextShape.geometry.y1);
      nextShape.geometry.x2 = applyX(nextShape.geometry.x2);
      nextShape.geometry.y2 = applyY(nextShape.geometry.y2);
    } else if (nextShape.type === "polygon") {
      nextShape.geometry.points = nextShape.geometry.points.map((point) => ({
        x: applyX(point.x),
        y: applyY(point.y)
      }));
    } else if (nextShape.type === "arc") {
      nextShape.geometry.cx = applyX(nextShape.geometry.cx);
      nextShape.geometry.cy = applyY(nextShape.geometry.cy);
      nextShape.geometry.r = Number((nextShape.geometry.r * Math.max(transform.scaleX, transform.scaleY)).toFixed(3));
    } else if (nextShape.type === "text") {
      nextShape.geometry.x = applyX(nextShape.geometry.x);
      nextShape.geometry.y = applyY(nextShape.geometry.y);
      nextShape.geometry.fontSize = Number((nextShape.geometry.fontSize * Math.max(transform.scaleX, transform.scaleY)).toFixed(3));
    }
    nextShape.transform = defaultShapeTransform(nextShape);
    return nextShape;
  }

  applyPaletteColor(color, label) {
    const selected = this.selectedShape();
    if (!selected) {
      this.statusLog.write("FAIL Palette color application blocked: select a shape first.");
      return;
    }
    if (!color) {
      this.statusLog.write(`FAIL Palette color application blocked: swatch ${label} has no usable color value.`);
      return;
    }
    if (selected.locked) {
      this.statusLog.write(`WARN Palette color application skipped: shape ${selected.id} is locked.`);
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const shape = this.findShapeInPayload(nextPayload, selected.id);
    if (["arc", "line"].includes(shape.type)) {
      shape.style.stroke = color;
    } else {
      shape.style.fill = color;
    }
    this.commitPayloadUpdate(nextPayload, this.selectedObjectId, selected.id, `OK Applied palette color ${color} from ${label} to shape ${selected.id}.`, "Palette color application failed schema validation");
  }

  toggleSelectedShapeVisibility() {
    const selected = this.selectedShape();
    if (!selected) {
      this.statusLog.write("WARN Shape visibility skipped: no shape is selected.");
      return;
    }
    if (selected.locked) {
      this.statusLog.write(`WARN Shape visibility skipped: shape ${selected.id} is locked.`);
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const override = this.frameOverrideInPayload(nextPayload, selected.id, { create: true });
    if (override) {
      const nextVisible = !this.effectiveShape(selected).visible;
      override.visible = nextVisible;
      this.commitPayloadUpdate(nextPayload, this.selectedObjectId, selected.id, `OK State ${this.selectedStateId} frame ${this.selectedFrameId} shape ${selected.id} visibility set to ${nextVisible ? "visible" : "hidden"}.`, "State frame visibility failed schema validation");
      return;
    }
    const shape = this.findShapeInPayload(nextPayload, selected.id);
    shape.visible = !shape.visible;
    this.commitPayloadUpdate(nextPayload, this.selectedObjectId, selected.id, `OK Shape ${selected.id} visibility set to ${shape.visible ? "visible" : "hidden"}.`, "Shape visibility failed schema validation");
  }

  toggleSelectedShapeLock() {
    const selected = this.selectedShape();
    if (!selected) {
      this.statusLog.write("WARN Shape lock skipped: no shape is selected.");
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const shape = this.findShapeInPayload(nextPayload, selected.id);
    shape.locked = !shape.locked;
    this.commitPayloadUpdate(nextPayload, this.selectedObjectId, selected.id, `OK Shape ${selected.id} lock set to ${shape.locked ? "locked" : "unlocked"}.`, "Shape lock failed schema validation");
  }

  changeSelectedShapeOrder(action) {
    const selected = this.selectedShape();
    if (!selected) {
      this.statusLog.write("WARN Shape order skipped: no shape is selected.");
      return;
    }
    if (selected.locked) {
      this.statusLog.write(`WARN Shape order skipped: shape ${selected.id} is locked.`);
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const object = nextPayload.objects.find((candidate) => candidate.id === this.selectedObjectId);
    const shapes = sortedShapes(object);
    const index = shapes.findIndex((shape) => shape.id === selected.id);
    if (shapes.length < 2) {
      this.statusLog.write(`WARN Shape order skipped: shape ${selected.id} is the only shape in ${object.name}.`);
      return;
    }

    const nextIndexByAction = {
      back: 0,
      backward: index - 1,
      forward: index + 1,
      front: shapes.length - 1
    };
    const nextIndex = nextIndexByAction[action];
    if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= shapes.length || nextIndex === index) {
      this.statusLog.write(`WARN Shape z-order skipped: shape ${selected.id} cannot move ${action}.`);
      return;
    }

    const [movedShape] = shapes.splice(index, 1);
    shapes.splice(nextIndex, 0, movedShape);
    shapes.forEach((shape, shapeIndex) => {
      shape.order = shapeIndex + 1;
    });
    object.shapes = shapes;
    this.commitPayloadUpdate(nextPayload, this.selectedObjectId, selected.id, `OK Shape ${selected.id} z-order ${action}.`, "Shape z-order failed schema validation");
  }

  moveSelectedShape() {
    const x = this.numberInputValue("objectVectorStudioV2MoveXInput", "Move X");
    const y = this.numberInputValue("objectVectorStudioV2MoveYInput", "Move Y");
    if (!x.ok || !y.ok) {
      this.statusLog.write(`FAIL Invalid transform rejected for shape ${this.selectedShapeId || "unknown"}: ${x.error || y.error}`);
      return;
    }
    const moveX = this.snapDistance(x.value);
    const moveY = this.snapDistance(y.value);
    this.updateSelectedShapeTransform("move", (shape) => {
      shape.transform = this.ensureShapeTransform(shape);
      shape.transform.x = Number((shape.transform.x + moveX).toFixed(3));
      shape.transform.y = Number((shape.transform.y + moveY).toFixed(3));
    }, `OK Moved shape ${this.selectedShapeId} by ${moveX}, ${moveY}.`);
  }

  rotateSelectedShape() {
    const input = this.numberInputValue("objectVectorStudioV2RotateInput", "Rotate");
    if (!input.ok) {
      this.statusLog.write(`FAIL Invalid transform rejected for shape ${this.selectedShapeId || "unknown"}: ${input.error}`);
      return;
    }
    const rotation = this.snapAngle(input.value);
    this.updateSelectedShapeTransform("rotate", (shape) => {
      shape.transform = this.ensureShapeTransform(shape);
      shape.transform.rotation = Number((shape.transform.rotation + rotation).toFixed(3));
    }, `OK Rotated shape ${this.selectedShapeId} by ${rotation} degrees.`);
  }

  scaleSelectedShape() {
    const input = this.numberInputValue("objectVectorStudioV2ScaleInput", "Scale");
    if (!input.ok || input.value <= 0) {
      this.statusLog.write(`FAIL Invalid transform rejected for shape ${this.selectedShapeId || "unknown"}: scale must be greater than 0.`);
      return;
    }
    this.updateSelectedShapeTransform("scale", (shape) => {
      shape.transform = this.ensureShapeTransform(shape);
      shape.transform.scaleX = Number((shape.transform.scaleX * input.value).toFixed(3));
      shape.transform.scaleY = Number((shape.transform.scaleY * input.value).toFixed(3));
    }, `OK Scaled shape ${this.selectedShapeId} by ${input.value}.`);
  }

  resizeSelectedShape() {
    const input = this.numberInputValue("objectVectorStudioV2ResizeInput", "Resize");
    if (!input.ok) {
      this.statusLog.write(`FAIL Invalid transform rejected for shape ${this.selectedShapeId || "unknown"}: ${input.error}`);
      return;
    }
    this.updateSelectedShapeTransform("resize", (shape) => {
      this.resizeShapeGeometry(shape, input.value);
      shape.transform = this.ensureShapeTransform(shape);
    }, `OK Resized shape ${this.selectedShapeId} by ${input.value}.`);
  }

  applySelectedShapeOrigin() {
    const originX = this.numberInputValue("objectVectorStudioV2OriginXInput", "Origin X");
    const originY = this.numberInputValue("objectVectorStudioV2OriginYInput", "Origin Y");
    if (!originX.ok || !originY.ok) {
      this.statusLog.write(`FAIL Invalid transform rejected for shape ${this.selectedShapeId || "unknown"}: ${originX.error || originY.error}`);
      return;
    }
    this.updateSelectedShapeTransform("origin", (shape) => {
      shape.transform = this.ensureShapeTransform(shape);
      shape.transform.originX = Number(originX.value.toFixed(3));
      shape.transform.originY = Number(originY.value.toFixed(3));
    }, `OK Updated shape ${this.selectedShapeId} origin/pivot to ${originX.value}, ${originY.value}.`);
  }

  groupSelectedShapes() {
    const object = this.selectedObject();
    if (!object || this.selectedShapeIds.size < 2) {
      this.statusLog.write("WARN Group shapes skipped: select at least two shapes.");
      return;
    }
    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((candidate) => candidate.id === object.id);
    const groupId = this.uniqueGroupId(nextObject);
    nextObject.shapes.forEach((shape) => {
      if (this.selectedShapeIds.has(shape.id)) {
        shape.groupId = groupId;
      }
    });
    this.commitPayloadUpdate(nextPayload, object.id, this.selectedShapeId, `OK Grouped ${this.selectedShapeIds.size} shapes into ${groupId}.`, "Group shapes failed schema validation");
  }

  ungroupSelectedShapes() {
    const object = this.selectedObject();
    const selected = this.selectedShape();
    if (!object || !selected) {
      this.statusLog.write("WARN Ungroup skipped: no shape is selected.");
      return;
    }
    const groupId = selected.groupId;
    if (!groupId) {
      this.statusLog.write(`WARN Ungroup skipped: shape ${selected.id} is not grouped.`);
      return;
    }
    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((candidate) => candidate.id === object.id);
    nextObject.shapes.forEach((shape) => {
      if (shape.groupId === groupId) {
        delete shape.groupId;
      }
    });
    this.commitPayloadUpdate(nextPayload, object.id, selected.id, `OK Ungrouped shapes from ${groupId}.`, "Ungroup shapes failed schema validation");
  }

  applyShapeGeometryEdits() {
    const selected = this.selectedShape();
    if (!selected) {
      this.statusLog.write("WARN Geometry edit skipped: no shape is selected.");
      return;
    }
    const fields = Array.from(this.elements.objectDetails.querySelectorAll("[data-shape-geometry-field]"));
    this.updateSelectedShapeTransform("geometry edit", (shape) => {
      if (shape.type === "polygon") {
        const pointsInput = fields.find((input) => input.dataset.shapeGeometryField === "points");
        shape.geometry.points = this.parsePolygonPoints(pointsInput?.value || "");
      } else {
        fields.forEach((input) => {
          const key = input.dataset.shapeGeometryField;
          shape.geometry[key] = input.type === "number" ? Number(input.value) : input.value;
        });
      }
      shape.transform = this.ensureShapeTransform(shape);
    }, `OK Applied geometry edits to shape ${selected.id}.`);
  }

  updateSelectedShapeTransform(operation, updater, okMessage) {
    const selected = this.selectedShape();
    if (!selected) {
      this.statusLog.write(`WARN Transform ${operation} skipped: no shape is selected.`);
      return;
    }
    if (selected.locked) {
      this.statusLog.write(`WARN Transform ${operation} skipped: shape ${selected.id} is locked.`);
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const override = this.frameOverrideInPayload(nextPayload, selected.id, { create: true });
    const shape = override
      ? this.effectiveShapeForFrame(this.findShapeInPayload(nextPayload, selected.id), this.activeFrame())
      : this.findShapeInPayload(nextPayload, selected.id);
    try {
      updater(shape);
      const transformErrors = this.validateShapeForTransform(shape);
      if (transformErrors.length) {
        this.statusLog.write(`FAIL Invalid transform rejected for shape ${selected.id}: ${transformErrors.join(" ")}`);
        return;
      }
    } catch (error) {
      this.statusLog.write(`FAIL Invalid transform rejected for shape ${selected.id}: ${error.message}`);
      return;
    }
    if (override) {
      override.transform = this.ensureShapeTransform(shape);
    }
    this.commitPayloadUpdate(nextPayload, this.selectedObjectId, selected.id, okMessage, `Transform ${operation} failed schema validation`);
  }

  duplicateSelectedShape() {
    const selected = this.selectedShape();
    if (!selected) {
      this.statusLog.write("WARN Duplicate shape skipped: no shape is selected.");
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const object = nextPayload.objects.find((candidate) => candidate.id === this.selectedObjectId);
    const shape = JSON.parse(JSON.stringify(selected));
    shape.id = this.uniqueShapeId(selected.type, object.shapes);
    shape.order = object.shapes.length ? Math.max(...object.shapes.map((candidate) => candidate.order)) + 1 : 1;
    shape.transform = this.ensureShapeTransform(shape);
    shape.transform.x = Number((shape.transform.x + 10).toFixed(3));
    shape.transform.y = Number((shape.transform.y + 10).toFixed(3));
    object.shapes.push(shape);
    this.commitPayloadUpdate(nextPayload, object.id, shape.id, `OK Duplicated shape ${selected.id} as ${shape.id}.`, "Duplicate shape failed schema validation");
  }

  deleteSelectedShape(sourceLabel) {
    const selected = this.selectedShape();
    if (!selected) {
      this.statusLog.write(`WARN Delete shape skipped from ${sourceLabel}: no shape is selected.`);
      return;
    }
    if (selected.locked) {
      this.statusLog.write(`WARN Delete shape skipped: shape ${selected.id} is locked.`);
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const object = nextPayload.objects.find((candidate) => candidate.id === this.selectedObjectId);
    object.shapes = sortedShapes(object).filter((shape) => shape.id !== selected.id)
      .map((shape, index) => ({ ...shape, order: index + 1 }));
    const selectedShapeId = sortedShapes(object)[0]?.id || "";
    this.commitPayloadUpdate(nextPayload, object.id, selectedShapeId, `OK Deleted shape ${selected.id} from ${sourceLabel}.`, "Delete shape failed schema validation");
  }

  numberInputValue(id, label) {
    const element = this.window.document.getElementById(id);
    const value = Number(element?.value);
    if (!Number.isFinite(value)) {
      return {
        error: `${label} must be a finite number.`,
        ok: false,
        value: 0
      };
    }
    return {
      error: "",
      ok: true,
      value
    };
  }

  snapDistance(value) {
    if (!this.gridSnapEnabled) {
      return value;
    }
    return Math.round(value / 10) * 10;
  }

  snapAngle(value) {
    if (!this.angleSnapEnabled) {
      return value;
    }
    return Math.round(value / 15) * 15;
  }

  ensureShapeTransform(shape) {
    if (!shape.transform) {
      return defaultShapeTransform(shape);
    }
    return { ...shape.transform };
  }

  resizeShapeGeometry(shape, amount) {
    if (shape.type === "rectangle") {
      shape.geometry.width = Number((shape.geometry.width + amount).toFixed(3));
      shape.geometry.height = Number((shape.geometry.height + amount).toFixed(3));
      return;
    }
    if (shape.type === "circle") {
      shape.geometry.r = Number((shape.geometry.r + amount).toFixed(3));
      return;
    }
    if (shape.type === "ellipse") {
      shape.geometry.rx = Number((shape.geometry.rx + amount).toFixed(3));
      shape.geometry.ry = Number((shape.geometry.ry + amount).toFixed(3));
      return;
    }
    if (shape.type === "line") {
      shape.geometry.x2 = Number((shape.geometry.x2 + amount).toFixed(3));
      return;
    }
    if (shape.type === "arc") {
      shape.geometry.r = Number((shape.geometry.r + amount).toFixed(3));
      return;
    }
    if (shape.type === "text") {
      shape.geometry.fontSize = Number((shape.geometry.fontSize + amount).toFixed(3));
      return;
    }
    const factor = 1 + amount / 100;
    const bounds = shapeBounds(shape);
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    shape.geometry.points = shape.geometry.points.map((point) => ({
      x: Number((centerX + (point.x - centerX) * factor).toFixed(3)),
      y: Number((centerY + (point.y - centerY) * factor).toFixed(3))
    }));
  }

  parsePolygonPoints(value) {
    const points = value.trim().split(/\s+/).filter(Boolean).map((token) => {
      const [xValue, yValue] = token.split(",");
      return {
        x: Number(xValue),
        y: Number(yValue)
      };
    });
    if (points.length < 3 || points.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y))) {
      throw new Error("polygon points must contain at least three x,y pairs.");
    }
    return points;
  }

  validateShapeForTransform(shape) {
    const errors = [];
    try {
      const bounds = shapeBounds(shape);
      if (bounds.width <= 0 || bounds.height <= 0) {
        errors.push("shape bounds must remain positive.");
      }
    } catch (error) {
      errors.push(error.message);
    }
    const transform = shape.transform;
    if (!transform) {
      return errors;
    }
    ["x", "y", "rotation", "scaleX", "scaleY", "originX", "originY"].forEach((key) => {
      if (!Number.isFinite(transform[key])) {
        errors.push(`transform.${key} must be a finite number.`);
      }
    });
    if (Number.isFinite(transform.scaleX) && transform.scaleX <= 0) {
      errors.push("scaleX must be greater than 0.");
    }
    if (Number.isFinite(transform.scaleY) && transform.scaleY <= 0) {
      errors.push("scaleY must be greater than 0.");
    }
    return errors;
  }

  commitPayloadUpdate(nextPayload, selectedObjectId, selectedShapeId, okMessage, failPrefix, options = {}) {
    const validation = this.schemaService.validatePayload(nextPayload);
    if (!validation.ok) {
      this.statusLog.write(`FAIL ${failPrefix}: ${validation.errors.join(" ")}`);
      return;
    }

    this.currentPayload = validation.payload;
    this.selectedObjectId = selectedObjectId;
    this.selectedShapeId = selectedShapeId || "";
    this.selectedShapeIds = new Set(this.selectedShapeId ? [this.selectedShapeId] : []);
    this.selectedStateId = options.selectedStateId ?? this.selectedStateId;
    this.selectedFrameId = options.selectedFrameId ?? this.selectedFrameId;
    this.ensureSelectedFrame();
    this.actionNav.setJsonPayloadActionsEnabled(true);
    this.renderPayload();
    this.statusLog.write(okMessage);
  }

  cloneCurrentPayload() {
    if (typeof this.window.structuredClone === "function") {
      return this.window.structuredClone(this.currentPayload);
    }
    return JSON.parse(JSON.stringify(this.currentPayload));
  }

  selectedObject() {
    return this.currentPayload?.objects.find((object) => object.id === this.selectedObjectId) || null;
  }

  resolveObjectForPayload(payload, objectId, chain = []) {
    const object = payload?.objects.find((candidate) => candidate.id === objectId) || null;
    if (!object) {
      return null;
    }
    if (chain.includes(object.id)) {
      return null;
    }
    if (!object.baseObjectId) {
      return JSON.parse(JSON.stringify(object));
    }
    const baseObject = this.resolveObjectForPayload(payload, object.baseObjectId, [...chain, object.id]);
    if (!baseObject) {
      return null;
    }
    const shapeById = new Map(baseObject.shapes.map((shape) => [shape.id, JSON.parse(JSON.stringify(shape))]));
    object.shapes.forEach((shape) => {
      shapeById.set(shape.id, JSON.parse(JSON.stringify(shape)));
    });
    const stateById = new Map((baseObject.states || []).map((state) => [state.id, JSON.parse(JSON.stringify(state))]));
    (object.states || []).forEach((state) => {
      stateById.set(state.id, JSON.parse(JSON.stringify(state)));
    });
    const resolved = {
      ...baseObject,
      ...JSON.parse(JSON.stringify(object)),
      inheritedFrom: object.baseObjectId,
      shapes: Array.from(shapeById.values()).sort((left, right) => left.order - right.order)
    };
    if (stateById.size) {
      resolved.states = Array.from(stateById.values());
    } else {
      delete resolved.states;
    }
    return resolved;
  }

  selectedShape() {
    return this.selectedObject()?.shapes.find((shape) => shape.id === this.selectedShapeId) || null;
  }

  ensureSelectedShape() {
    const object = this.selectedObject();
    if (!object) {
      this.selectedShapeId = "";
      this.selectedShapeIds.clear();
      return;
    }
    if (object.shapes.some((shape) => shape.id === this.selectedShapeId)) {
      if (!this.selectedShapeIds.size) {
        this.selectedShapeIds = new Set([this.selectedShapeId]);
      }
      return;
    }
    this.selectedShapeId = sortedShapes(object)[0]?.id || "";
    this.selectedShapeIds = new Set(this.selectedShapeId ? [this.selectedShapeId] : []);
  }

  ensureSelectedFrame() {
    const object = this.selectedObject();
    if (!object) {
      this.selectedStateId = "";
      this.selectedFrameId = "";
      return;
    }
    const states = this.objectStates(object);
    const state = states.find((candidate) => candidate.id === this.selectedStateId) || states[0] || null;
    this.selectedStateId = state?.id || "";
    if (!state) {
      this.selectedFrameId = "";
      return;
    }
    const frames = sortedFrames(state);
    const frame = frames.find((candidate) => candidate.id === this.selectedFrameId) || frames[0] || null;
    this.selectedFrameId = frame?.id || "";
  }

  objectStates(object) {
    return Array.isArray(object?.states) ? object.states : [];
  }

  selectedState() {
    return this.objectStates(this.selectedObject()).find((state) => state.id === this.selectedStateId) || null;
  }

  activeFrame() {
    return sortedFrames(this.selectedState()).find((frame) => frame.id === this.selectedFrameId) || null;
  }

  previousFrame() {
    const state = this.selectedState();
    const frame = this.activeFrame();
    if (!state || !frame) {
      return null;
    }
    const frames = sortedFrames(state);
    const index = frames.findIndex((candidate) => candidate.id === frame.id);
    return index > 0 ? frames[index - 1] : null;
  }

  createFrameSnapshot(object, stateId, frameId, order) {
    return {
      durationFrames: 1,
      id: frameId,
      order,
      shapeOverrides: sortedShapes(object).map((shape) => ({
        shapeId: shape.id,
        transform: this.shapeTransform(shape),
        visible: shape.visible
      }))
    };
  }

  frameOverrideInPayload(payload, shapeId, { create = false } = {}) {
    const object = payload.objects.find((candidate) => candidate.id === this.selectedObjectId);
    const state = this.objectStates(object).find((candidate) => candidate.id === this.selectedStateId);
    const frame = sortedFrames(state).find((candidate) => candidate.id === this.selectedFrameId);
    if (!object || !state || !frame) {
      return null;
    }
    let override = frame.shapeOverrides.find((entry) => entry.shapeId === shapeId);
    if (!override && create) {
      const baseShape = object.shapes.find((shape) => shape.id === shapeId);
      if (!baseShape) {
        return null;
      }
      override = {
        shapeId,
        transform: this.shapeTransform(baseShape),
        visible: baseShape.visible
      };
      frame.shapeOverrides.push(override);
    }
    return override || null;
  }

  findShapeInPayload(payload, shapeId) {
    return payload.objects
      .find((object) => object.id === this.selectedObjectId)
      ?.shapes.find((shape) => shape.id === shapeId);
  }

  firstPaletteColor() {
    const swatch = this.runtimePalette?.swatches.find((candidate) => swatchColor(candidate));
    return swatchColor(swatch);
  }

  secondPaletteColor(firstColor) {
    const swatch = this.runtimePalette?.swatches.find((candidate) => swatchColor(candidate) && swatchColor(candidate) !== firstColor);
    return swatchColor(swatch) || firstColor;
  }

  validObjectType(value) {
    const type = String(value || "").trim().toLowerCase();
    return OBJECT_TYPES.includes(type) ? type : DEFAULT_OBJECT_TYPE;
  }

  validAssetCategory(value) {
    const category = String(value || "").trim().toLowerCase();
    return ASSET_CATEGORIES.includes(category) ? category : DEFAULT_ASSET_CATEGORY;
  }

  uniqueObjectId(name, objects) {
    const baseId = slugifyObjectName(name);
    const usedIds = new Set(objects.map((object) => object.id));
    if (!usedIds.has(baseId)) {
      return baseId;
    }

    let suffix = 2;
    let candidate = `${baseId}-${suffix}`;
    while (usedIds.has(candidate)) {
      suffix += 1;
      candidate = `${baseId}-${suffix}`;
    }
    return candidate;
  }

  uniqueAssetId(name, assets) {
    const baseId = `asset.${slugifyObjectName(name)}`;
    const usedIds = new Set(assets.map((asset) => asset.id));
    if (!usedIds.has(baseId)) {
      return baseId;
    }

    let suffix = 2;
    let candidate = `${baseId}-${suffix}`;
    while (usedIds.has(candidate)) {
      suffix += 1;
      candidate = `${baseId}-${suffix}`;
    }
    return candidate;
  }

  uniqueShapeId(type, shapes) {
    const usedIds = new Set(shapes.map((shape) => shape.id));
    let suffix = shapes.length + 1;
    let candidate = `${type}-${suffix}`;
    while (usedIds.has(candidate)) {
      suffix += 1;
      candidate = `${type}-${suffix}`;
    }
    return candidate;
  }

  uniqueGroupId(object) {
    const usedIds = new Set((object?.shapes || []).map((shape) => shape.groupId).filter(Boolean));
    let suffix = usedIds.size + 1;
    let candidate = `group-${suffix}`;
    while (usedIds.has(candidate)) {
      suffix += 1;
      candidate = `group-${suffix}`;
    }
    return candidate;
  }

  uniqueFrameId(state) {
    const usedIds = new Set(sortedFrames(state).map((frame) => frame.id));
    let suffix = usedIds.size + 1;
    let candidate = `${state.id}-frame-${suffix}`;
    while (usedIds.has(candidate)) {
      suffix += 1;
      candidate = `${state.id}-frame-${suffix}`;
    }
    return candidate;
  }

  updateObjectActionState() {
    const hasSelectedObject = Boolean(this.selectedObject());
    const selectedObject = this.selectedObject();
    const noPayloadReason = "Disabled until a schema-valid Object Vector Studio V2 payload is loaded.";
    const noObjectReason = "Disabled until a schema-valid object is selected.";
    const noInheritedReason = "Disabled unless the selected object inherits from a base object; use Duplicate for local copies.";
    this.setControlDisabled(this.elements.createTemplateButton, !this.currentPayload, noPayloadReason, "Create an object from the selected template.");
    this.setControlDisabled(this.elements.objectTypeSelect, !hasSelectedObject && !this.currentPayload, noPayloadReason, "Set object type metadata for the next or selected object.");
    this.setControlDisabled(this.elements.createStateButton, !hasSelectedObject, noObjectReason, "Create the selected state on the active object.");
    this.setControlDisabled(this.elements.renameObjectButton, !hasSelectedObject, noObjectReason, "Rename the selected object.");
    this.setControlDisabled(this.elements.duplicateObjectButton, !hasSelectedObject, noObjectReason, "Duplicate the selected object.");
    this.setControlDisabled(
      this.elements.duplicateAsLocalButton,
      !hasSelectedObject || !selectedObject?.baseObjectId,
      hasSelectedObject ? noInheritedReason : noObjectReason,
      "Detach the inherited selected object into a local editable copy."
    );
    this.setControlDisabled(this.elements.deleteObjectButton, !hasSelectedObject, noObjectReason, "Delete the selected object.");
    this.setControlDisabled(this.elements.flattenObjectButton, !hasSelectedObject, noObjectReason, "Bake selected object transforms into local shape data.");
    this.setControlDisabled(this.elements.createLibraryAssetButton, !hasSelectedObject, noObjectReason, "Register the selected object as a reusable library asset.");
    this.setControlDisabled(this.elements.exportSvgButton, !hasSelectedObject, noObjectReason, "Export the selected object as SVG.");
    this.setControlDisabled(this.elements.runtimePreviewButton, !hasSelectedObject, noObjectReason, "Preview the selected object through the runtime asset renderer.");
    this.updateDisabledReasonSummary();
    this.updateAnimationActionState();
  }

  updateAnimationActionState() {
    const state = this.selectedState();
    const frames = sortedFrames(state);
    const hasFrame = Boolean(state && this.activeFrame());
    const frameIndex = frames.findIndex((frame) => frame.id === this.selectedFrameId);
    const noFrameReason = "Disabled until the selected object has an active state frame.";
    this.setControlDisabled(this.elements.duplicateFrameButton, !hasFrame, noFrameReason, "Duplicate the active animation frame.");
    this.setControlDisabled(this.elements.frameEarlierButton, !hasFrame || frameIndex <= 0, hasFrame ? "Disabled because the selected frame is already first." : noFrameReason, "Move the selected frame earlier.");
    this.setControlDisabled(this.elements.frameLaterButton, !hasFrame || frameIndex >= frames.length - 1, hasFrame ? "Disabled because the selected frame is already last." : noFrameReason, "Move the selected frame later.");
    this.setControlDisabled(this.elements.playButton, !hasFrame || this.isAnimationPlaying, this.isAnimationPlaying ? "Disabled while playback is already running." : noFrameReason, "Play the selected state timeline.");
    this.setControlDisabled(this.elements.pauseButton, !this.isAnimationPlaying, "Disabled until playback starts.", "Pause animation playback.");
    this.setControlDisabled(this.elements.stopButton, !hasFrame, noFrameReason, "Stop animation playback.");
  }

  setControlDisabled(element, isDisabled, disabledReason, enabledTitle) {
    element.disabled = isDisabled;
    element.title = isDisabled ? disabledReason : enabledTitle;
    element.setAttribute("aria-disabled", String(isDisabled));
    if (isDisabled) {
      element.dataset.disabledReason = disabledReason;
      return;
    }
    delete element.dataset.disabledReason;
  }

  updateDisabledReasonSummary() {
    const reasons = [];
    if (!this.currentPayload) {
      reasons.push("load a schema-valid payload");
    }
    if (!this.runtimePalette) {
      reasons.push("provide a read-only runtime palette from session/workspace");
    }
    const selectedObject = this.selectedObject();
    if (!selectedObject) {
      reasons.push("select an object to enable object, SVG, runtime preview, and state actions");
    } else if (!selectedObject.baseObjectId) {
      reasons.push("Duplicate As Local is available only for inherited objects");
    }
    if (!this.activeFrame()) {
      reasons.push("create/select a state frame for playback and frame actions");
    }
    this.elements.disabledReason.textContent = reasons.length
      ? `Disabled controls: ${reasons.join("; ")}.`
      : "All current Object Vector Studio V2 controls are reviewable for the selected object, shape, state, and frame.";
  }

  async copyJson() {
    const payload = this.validatedJsonActionPayload("Copy JSON");
    if (!payload) {
      return;
    }

    const json = JSON.stringify(payload, null, 2);
    if (typeof this.window.navigator?.clipboard?.writeText !== "function") {
      this.statusLog.write("WARN Clipboard API unavailable. JSON Details remains read-only on the active object.");
      return;
    }

    try {
      await this.window.navigator.clipboard.writeText(json);
      this.statusLog.write(`OK Object Vector Studio V2 JSON copied with ${payload.objects.length} objects and ${assetCountLabel(payload.assetLibrary?.assets?.length || 0)}.`);
    } catch (error) {
      this.statusLog.write(`FAIL Copy JSON failed: ${error.message}`);
    }
  }

  async previewRuntimeAsset() {
    const object = this.selectedObject();
    const payload = this.validatedJsonActionPayload("Runtime Preview");
    if (!object || !payload) {
      this.statusLog.write("FAIL Runtime Preview blocked: select a schema-valid Object Vector Studio V2 object first.");
      return;
    }
    if (!this.runtimePalette) {
      this.loadPaletteFromSessionKey(RUNTIME_PALETTE_SESSION_KEY) || this.loadPaletteFromWorkspaceSession();
    }
    if (!this.runtimePalette) {
      this.statusLog.write("FAIL Runtime Preview blocked: runtime palette is required from workspace/session and must not be embedded in object JSON.");
      return;
    }

    const assetSet = await this.runtimeAssetService.loadPayload(payload, {
      sourceLabel: "Object Vector Studio V2 runtime preview"
    });
    if (!assetSet) {
      return;
    }
    const result = this.runtimeAssetService.createSvgString(assetSet, {
      assetId: this.assetLibraryAssets().find((asset) => asset.objectId === object.id)?.id || "",
      elapsedMs: 0,
      frameId: this.selectedFrameId,
      objectId: object.id,
      stateId: this.selectedStateId
    });
    if (!result.ok) {
      return;
    }

    this.elements.renderSurface.dataset.runtimePreview = "true";
    this.elements.renderSurface.dataset.runtimePreviewFrame = this.selectedFrameId || "";
    this.elements.renderSurface.dataset.runtimePreviewState = this.selectedStateId || "";
    const message = `Runtime preview launched for ${object.name}${this.selectedStateId ? ` state ${this.selectedStateId}` : ""}${this.selectedFrameId ? ` frame ${this.selectedFrameId}` : ""}.`;
    this.elements.renderSummary.textContent = `${message} Palette source: ${this.runtimePaletteSource}.`;
    this.statusLog.write(`OK ${message} Runtime palette source ${this.runtimePaletteSource}; object JSON remains palette-free.`);
  }

  exportJson() {
    const payload = this.validatedJsonActionPayload("Export");
    if (!payload) {
      return;
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = this.window.document.createElement("a");
    anchor.href = url;
    anchor.download = "object-vector-studio-v2.json";
    anchor.click();
    URL.revokeObjectURL(url);
    this.statusLog.write(`OK Export JSON prepared for ${payload.objects.length} Object Vector Studio V2 objects and ${assetCountLabel(payload.assetLibrary?.assets?.length || 0)}.`);
  }

  exportSelectedObjectSvg() {
    const object = this.selectedObject();
    if (!object) {
      this.statusLog.write("FAIL Export SVG blocked: no Object Vector Studio V2 object is selected.");
      return;
    }

    try {
      const svg = this.createObjectSvgExport(object);
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const anchor = this.window.document.createElement("a");
      anchor.href = url;
      anchor.download = `${slugifyObjectName(object.name)}.svg`;
      anchor.click();
      URL.revokeObjectURL(url);
      const visibleShapeCount = sortedShapes(object).filter((shape) => shape.visible).length;
      this.statusLog.write(`OK Export SVG generated for ${object.name}: ${visibleShapeCount} visible shapes.`);
    } catch (error) {
      this.statusLog.write(`FAIL Export SVG failed for ${object.name}: ${error.message}`);
    }
  }

  createObjectSvgExport(object) {
    const validation = this.schemaService.validatePayload(this.currentPayload);
    if (!validation.ok) {
      throw new Error(`schema validation failed: ${validation.errors.join(" ")}`);
    }
    const visibleShapes = sortedShapes(object).filter((shape) => this.effectiveShape(shape).visible);
    if (!visibleShapes.length) {
      throw new Error("selected object has no visible shapes.");
    }
    const bounds = this.objectBounds(object, { includeInvisible: false });
    const padding = 12;
    const svg = this.window.document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("xmlns", SVG_NS);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", `${object.name} Object Vector Studio V2 export`);
    if (this.selectedStateId) {
      svg.dataset.objectState = this.selectedStateId;
    }
    if (this.selectedFrameId) {
      svg.dataset.objectFrame = this.selectedFrameId;
    }
    svg.setAttribute("viewBox", `${bounds.x - padding} ${bounds.y - padding} ${bounds.width + padding * 2} ${bounds.height + padding * 2}`);
    if (this.selectedStateId || this.selectedFrameId) {
      const metadata = this.window.document.createElementNS(SVG_NS, "metadata");
      metadata.textContent = JSON.stringify({
        frameId: this.selectedFrameId || null,
        stateId: this.selectedStateId || null,
        toolId: "object-vector-studio-v2"
      });
      svg.append(metadata);
    }
    visibleShapes.forEach((shape) => {
      const element = this.createSvgShape(this.effectiveShape(shape));
      element.removeAttribute("tabindex");
      element.removeAttribute("class");
      svg.append(element);
    });
    return new this.window.XMLSerializer().serializeToString(svg);
  }

  validatedJsonActionPayload(actionLabel) {
    if (!this.currentPayload) {
      this.statusLog.write(`FAIL ${actionLabel} blocked: no schema-valid Object Vector Studio V2 payload is loaded.`);
      return null;
    }
    const payload = this.cloneCurrentPayload();
    const validation = this.schemaService.validatePayload(payload);
    if (!validation.ok) {
      this.statusLog.write(`FAIL ${actionLabel} blocked by Object Vector Studio V2 schema: ${validation.errors.join(" ")}`);
      return null;
    }
    return validation.payload;
  }
}
