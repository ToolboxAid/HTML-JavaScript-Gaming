import { ObjectVectorRuntimeAssetService } from "../../../src/engine/rendering/index.js";

const WORKSPACE_TOOL_SESSION_KEY = "workspace.tools.object-vector-studio-v2";
const WORKSPACE_PALETTE_SESSION_KEY = "workspace.tools.palette-manager-v2";
const RUNTIME_PALETTE_SESSION_KEY = "object-vector-studio-v2.runtimePalette";
const TOOL_DISPLAY_MODE_KEY = "object-vector-studio-v2.toolDisplayMode";
const GRID_SNAP_SESSION_KEY = "object-vector-studio-v2.gridSnap";
const ANGLE_SNAP_SESSION_KEY = "object-vector-studio-v2.angleSnap";
const GRID_RENDER_SESSION_KEY = "object-vector-studio-v2.gridRender";
const CENTER_ORIGIN_SESSION_KEY = "object-vector-studio-v2.centerOrigin";
const SVG_NS = "http://www.w3.org/2000/svg";
const DEFAULT_VIEWPORT = Object.freeze({ height: 220, width: 320, x: 0, y: 0, zoom: 0.1 });
const GRID_STEP = 10;
const OBJECT_PREVIEW_DRAWING_SCALE = GRID_STEP;
const MAX_ZOOM = 0.5;
const MIN_ZOOM = 0.01;
const ZOOM_STEP = 0.01;

const objectVectorStudioIcon = (name, glyph) => Object.freeze({ glyph, name });

const OBJECT_VECTOR_STUDIO_ICON_GLYPHS = Object.freeze({
  add: objectVectorStudioIcon("nf-fa-plus", "\uf067"),
  angle: objectVectorStudioIcon("nf-fa-sliders", "\uf1de"),
  arc: objectVectorStudioIcon("nf-fa-history", "\uf1da"),
  bri: objectVectorStudioIcon("nf-fa-sun_o", "\uf185"),
  bringForward: objectVectorStudioIcon("nf-fa-arrow_up", "\uf062"),
  bringFront: objectVectorStudioIcon("nf-fa-angle_double_up", "\uf102"),
  center: objectVectorStudioIcon("nf-fa-dot_circle_o", "\uf192"),
  circle: objectVectorStudioIcon("nf-fa-circle_o", "\uf10c"),
  delete: objectVectorStudioIcon("nf-md-trash_can_outline", "\u{f0a7a}"),
  duplicate: objectVectorStudioIcon("nf-fa-copy", "\uf0c5"),
  edit: objectVectorStudioIcon("nf-fa-pencil_square_o", "\uf044"),
  ellipse: objectVectorStudioIcon("nf-fa-circle_o", "\uf10c"),
  eye: objectVectorStudioIcon("nf-fa-eye", "\uf06e"),
  eyeOff: objectVectorStudioIcon("nf-fa-eye_slash", "\uf070"),
  grid: objectVectorStudioIcon("nf-md-grid_off", "\u{f02c2}"),
  group: objectVectorStudioIcon("nf-fa-object_group", "\uf247"),
  hue: objectVectorStudioIcon("nf-fa-eyedropper", "\uf1fb"),
  line: objectVectorStudioIcon("nf-md-vector_line", "\u{f055e}"),
  lock: objectVectorStudioIcon("nf-fa-lock", "\uf023"),
  move: objectVectorStudioIcon("nf-fa-arrows", "\uf047"),
  name: objectVectorStudioIcon("nf-fa-font", "\uf031"),
  paint: objectVectorStudioIcon("nf-fa-paint_brush", "\uf1fc"),
  panDown: objectVectorStudioIcon("nf-fa-arrow_down", "\uf063"),
  panLeft: objectVectorStudioIcon("nf-fa-arrow_left", "\uf060"),
  panRight: objectVectorStudioIcon("nf-fa-arrow_right", "\uf061"),
  panUp: objectVectorStudioIcon("nf-fa-arrow_up", "\uf062"),
  polygon: objectVectorStudioIcon("nf-md-vector_polygon", "\u{f0560}"),
  rectangle: objectVectorStudioIcon("nf-md-vector_rectangle", "\u{f05c6}"),
  reset: objectVectorStudioIcon("nf-fa-undo", "\uf0e2"),
  resize: objectVectorStudioIcon("nf-fa-expand", "\uf065"),
  rotate: objectVectorStudioIcon("nf-fa-repeat", "\uf01e"),
  sat: objectVectorStudioIcon("nf-fa-tint", "\uf043"),
  scale: objectVectorStudioIcon("nf-fa-expand", "\uf065"),
  select: objectVectorStudioIcon("nf-md-select", "\u{f0485}"),
  sendBack: objectVectorStudioIcon("nf-fa-angle_double_down", "\uf103"),
  sendBackward: objectVectorStudioIcon("nf-fa-arrow_down", "\uf063"),
  stroke: objectVectorStudioIcon("nf-fa-pencil", "\uf040"),
  text: objectVectorStudioIcon("nf-fa-font", "\uf031"),
  triangle: objectVectorStudioIcon("nf-md-vector_triangle", "\u{f0563}"),
  ungroup: objectVectorStudioIcon("nf-fa-object_ungroup", "\uf248"),
  unlock: objectVectorStudioIcon("nf-fa-unlock", "\uf09c"),
  zoomIn: objectVectorStudioIcon("nf-oct-zoom_in", "\u{f531}"),
  zoomOut: objectVectorStudioIcon("nf-oct-zoom_out", "\u{f532}")
});

const OBJECT_VECTOR_STUDIO_STATIC_ICON_TARGETS = Object.freeze([
  ["#objectVectorStudioV2AddTagButton", "add"],
  ["#objectVectorStudioV2AddObjectButton", "add"],
  ["#objectVectorStudioV2RenameObjectButton", "edit"],
  ["#objectVectorStudioV2DuplicateObjectButton", "duplicate"],
  ["#objectVectorStudioV2PaintModeButton", "paint"],
  ["#objectVectorStudioV2StrokeModeButton", "stroke"],
  [".object-vector-studio-v2__palette-sort [data-palette-sort='hue']", "hue"],
  [".object-vector-studio-v2__palette-sort [data-palette-sort='sat']", "sat"],
  [".object-vector-studio-v2__palette-sort [data-palette-sort='bri']", "bri"],
  [".object-vector-studio-v2__palette-sort [data-palette-sort='name']", "name"],
  ["#objectVectorStudioV2ZoomOutButton", "zoomOut"],
  ["#objectVectorStudioV2ZoomInButton", "zoomIn"],
  ["#objectVectorStudioV2PanUpButton", "panUp"],
  ["#objectVectorStudioV2PanDownButton", "panDown"],
  ["#objectVectorStudioV2PanLeftButton", "panLeft"],
  ["#objectVectorStudioV2PanRightButton", "panRight"],
  ["#objectVectorStudioV2ResetViewButton", "reset"],
  ["#objectVectorStudioV2CenterDotButton", "center"],
  ["#objectVectorStudioV2DuplicateFrameButton", "duplicate"],
  ["#objectVectorStudioV2GridSnapButton", "grid"],
  ["#objectVectorStudioV2AngleSnapButton", "angle"],
  ["#objectVectorStudioV2GridRenderButton", "grid"],
  [".object-vector-studio-v2__shape-icon--select", "select"],
  [".object-vector-studio-v2__shape-icon--triangle", "triangle"],
  [".object-vector-studio-v2__shape-icon--rectangle", "rectangle"],
  [".object-vector-studio-v2__shape-icon--circle", "circle"],
  [".object-vector-studio-v2__shape-icon--ellipse", "ellipse"],
  [".object-vector-studio-v2__shape-icon--line", "line"],
  [".object-vector-studio-v2__shape-icon--polygon", "polygon"],
  [".object-vector-studio-v2__shape-icon--arc", "arc"],
  [".object-vector-studio-v2__shape-icon--text", "text"],
  [".object-vector-studio-v2__z-icon--bring-forward", "bringForward"],
  [".object-vector-studio-v2__z-icon--send-backward", "sendBackward"],
  [".object-vector-studio-v2__z-icon--bring-front", "bringFront"],
  [".object-vector-studio-v2__z-icon--send-back", "sendBack"],
  [".object-vector-studio-v2__z-icon--group", "group"],
  [".object-vector-studio-v2__z-icon--ungroup", "ungroup"]
]);

const OBJECT_STATE_IDS = Object.freeze(["idle", "thrust", "damaged", "destroyed", "active", "inactive"]);

const OBJECT_STATE_LABELS = Object.freeze({
  active: "Active",
  damaged: "Damaged",
  destroyed: "Destroyed",
  idle: "Idle",
  inactive: "Inactive",
  thrust: "Thrust"
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

const PRIMITIVE_TOOLS = Object.freeze(["triangle", "rectangle", "circle", "ellipse", "line", "polygon", "arc", "text"]);

function shapeTypeLabel(shape) {
  return shape.type.replace(/(^|-)([a-z])/g, (match) => match.toUpperCase()).replaceAll("-", " ");
}

function shapeCountLabel(count) {
  return `${count} ${count === 1 ? "shape" : "shapes"}`;
}

function assetCountLabel(count) {
  return `${count} ${count === 1 ? "library asset" : "library assets"}`;
}

function tagList(value) {
  if (Array.isArray(value)) {
    return Array.from(new Set(value.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean))).sort();
  }
  return Array.from(new Set(String(value || "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean))).sort();
}

function slugifyObjectName(name) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "object";
}

function objectGameSegment(objectId) {
  const match = /^object\.([a-z0-9-]+)\./.exec(String(objectId || ""));
  return match?.[1] || "";
}

function payloadGameSlugFromName(name) {
  const slug = slugifyObjectName(name || "game")
    .replace(/-(object-vector-assets|object-vector-asset|object-assets|object-set|payload|assets)$/u, "");
  return slug || "game";
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

function colorMetrics(color) {
  const hex = String(color || "").trim().replace(/^#/, "");
  if (!/^[0-9a-f]{6}$/i.test(hex)) {
    return { bri: 0, hue: 0, sat: 0 };
  }
  const red = parseInt(hex.slice(0, 2), 16) / 255;
  const green = parseInt(hex.slice(2, 4), 16) / 255;
  const blue = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;
  if (delta !== 0) {
    if (max === red) {
      hue = ((green - blue) / delta) % 6;
    } else if (max === green) {
      hue = (blue - red) / delta + 2;
    } else {
      hue = (red - green) / delta + 4;
    }
    hue = Math.round(hue * 60);
    if (hue < 0) {
      hue += 360;
    }
  }
  return {
    bri: max,
    hue,
    sat: max === 0 ? 0 : delta / max
  };
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
    this.activeTool = "select";
    this.paletteTarget = "paint";
    this.paletteSortMode = "name";
    this.selectedFillColor = "#ffffff";
    this.selectedStrokeColor = "#000000";
    this.selectedFillLabel = "default fill";
    this.selectedStrokeLabel = "default stroke";
    this.isPaintDragging = false;
    this.previewPointerEdit = null;
    this.transformInputValues = new Map();
    this.shapeToolLabelsById = new Map();
    this.pendingAddObjectClick = false;
    this.hiddenObjectIds = new Set();
    this.lockedObjectIds = new Set();
    this.gridSnapEnabled = false;
    this.angleSnapEnabled = false;
    this.gridRenderEnabled = true;
    this.centerOriginVisible = true;
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
    this.applyNerdFontIcons();
    this.bindObjectActions();
    this.bindToolToggles();
    this.bindSnapControls();
    this.bindPaletteControls();
    this.bindViewportControls();
    this.bindObjectFilters();
    this.bindAnimationControls();
    this.bindJsonDetailsActions();
    this.bindKeyboardShortcuts();
    this.applyToolDisplayMode(this.window.sessionStorage?.getItem(TOOL_DISPLAY_MODE_KEY) || "words", false);
    this.applySnapState();
    this.updateViewport();
    this.actionNav.setImportEnabled(false);
    this.renderEmptyState("Object Vector Studio V2 schema contract is loading.");
    this.statusLog.write("OK Object Vector Studio V2 layout shell ready.");
    this.statusLog.write("INFO Schema-only loading is idle. Import JSON or launch with workspace toolState data. Runtime palette is required before rendering.");
    this.statusLog.write("INFO Shape/Tools primitive buttons create schema-valid shapes on the selected object.");
    this.statusLog.write("INFO Disabled controls stay inactive until a schema-valid payload, runtime palette, selected object, or active frame is available.");
    this.statusLog.write("INFO Object identity uses object.game.name ids.");
    this.statusLog.write("INFO Paint and stroke selection is structured to scale later into shaders, gradients, patterns, neon, SVG export, and runtime rendering.");
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
    const firstColor = validation.palette.swatches.map((swatch) => swatchColor(swatch)).find(Boolean);
    if (firstColor) {
      this.selectedFillColor = firstColor;
      this.selectedStrokeColor = firstColor;
      const firstSwatch = validation.palette.swatches.find((swatch) => swatchColor(swatch) === firstColor);
      const firstLabel = firstSwatch?.name || firstSwatch?.id || firstSwatch?.symbol || "first swatch";
      this.selectedFillLabel = firstLabel;
      this.selectedStrokeLabel = firstLabel;
    }
    if (persistToRuntimeSession) {
      this.window.sessionStorage?.setItem(RUNTIME_PALETTE_SESSION_KEY, JSON.stringify(validation.palette));
    }
    this.statusLog.write(`OK Runtime palette loaded from ${sourceLabel}: ${validation.palette.swatches.length} swatches.`);
    this.statusLog.write("INFO Runtime palette is read-only session/workspace data; Object Vector JSON remains palette-free.");
    return true;
  }

  bindObjectActions() {
    this.elements.addObjectButton.addEventListener("pointerdown", () => {
      this.pendingAddObjectClick = true;
    });
    this.elements.addObjectButton.addEventListener("click", () => this.addObject());
    this.elements.addTagButton.addEventListener("click", () => this.addTagToSelectedObject());
    this.elements.objectNameInput.addEventListener("input", () => this.updateObjectPreviewFooterFromNameInput());
    this.elements.renameObjectButton.addEventListener("click", () => this.renameSelectedObject());
    this.elements.duplicateObjectButton.addEventListener("click", () => this.duplicateSelectedObject());
    this.elements.deleteObjectButton?.addEventListener("click", () => this.deleteSelectedObject());
    this.elements.exportSvgButton.addEventListener("click", () => this.exportSelectedObjectSvg());
    this.elements.bringForwardButton.addEventListener("click", () => this.changeSelectedShapeOrder("forward"));
    this.elements.sendBackwardButton.addEventListener("click", () => this.changeSelectedShapeOrder("backward"));
    this.elements.bringToFrontButton.addEventListener("click", () => this.changeSelectedShapeOrder("front"));
    this.elements.sendToBackButton.addEventListener("click", () => this.changeSelectedShapeOrder("back"));
    this.elements.groupShapesButton.addEventListener("click", () => this.groupSelectedShapes());
    this.elements.ungroupButton.addEventListener("click", () => this.ungroupSelectedShapes());
  }

  applyNerdFontIcons() {
    OBJECT_VECTOR_STUDIO_STATIC_ICON_TARGETS.forEach(([selector, iconKey]) => {
      this.window.document.querySelectorAll(selector).forEach((element) => this.applyIconGlyph(element, iconKey));
    });
  }

  applyIconGlyph(element, iconKey) {
    const icon = OBJECT_VECTOR_STUDIO_ICON_GLYPHS[iconKey];
    if (!element || !icon?.glyph) {
      return;
    }
    element.dataset.ovsIcon = icon.glyph;
    element.dataset.ovsIconKey = iconKey;
    element.dataset.ovsIconName = icon.name;
    element.classList.add("object-vector-studio-v2__nerd-icon");
  }

  bindAnimationControls() {
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
        this.activeTool = tool;
        if (PRIMITIVE_TOOLS.includes(tool)) {
          this.createShape(tool);
          return;
        }
        if (tool === "select" && this.selectedShapeId) {
          const clearedShape = this.selectedShapeId;
          this.selectedShapeId = "";
          this.selectedShapeIds.clear();
          this.renderObjectTiles();
          this.renderSelectedObject();
          this.renderWorkSurface();
          this.updateObjectActionState();
          this.statusLog.write(`OK Select tool cleared selected shape ${clearedShape}.`);
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
    this.elements.centerDotButton.addEventListener("click", () => {
      this.centerOriginVisible = !this.centerOriginVisible;
      this.window.sessionStorage?.setItem(CENTER_ORIGIN_SESSION_KEY, this.centerOriginVisible ? "1" : "0");
      this.applySnapState();
      this.renderWorkSurface();
      this.statusLog.write(`OK Center dot ${this.centerOriginVisible ? "shown" : "hidden"}.`);
    });
  }

  bindPaletteControls() {
    this.elements.paintModeButton.addEventListener("click", () => this.setPaletteTarget("paint"));
    this.elements.strokeModeButton.addEventListener("click", () => this.setPaletteTarget("stroke"));
    this.elements.strokeWidth.addEventListener("change", () => {
      const width = Number(this.elements.strokeWidth.value);
      if (!Number.isFinite(width) || width <= 0) {
        this.elements.strokeWidth.value = "2";
        this.statusLog.write("WARN Stroke width reset to 2: value must be greater than 0.");
        return;
      }
      this.statusLog.write(`OK Palette stroke width set to ${width}.`);
    });
    this.elements.paletteSortButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.paletteSortMode = button.dataset.paletteSort || "name";
        this.updatePaletteSortButtons();
        if (this.runtimePalette) {
          this.renderPalette();
        }
        this.statusLog.write(`OK Palette sort set to ${this.paletteSortMode}.`);
      });
    });
    this.setPaletteTarget("paint", false);
    this.updatePaletteSortButtons();
    this.updatePaletteModeSwatches();
  }

  bindJsonDetailsActions() {
    this.elements.copyJsonDetailsButton.addEventListener("click", (event) => {
      event.stopPropagation();
      void this.copyJson();
    });
  }

  setPaletteTarget(target, shouldLog = true) {
    this.paletteTarget = target === "stroke" ? "stroke" : "paint";
    this.elements.paintModeButton.setAttribute("aria-pressed", String(this.paletteTarget === "paint"));
    this.elements.strokeModeButton.setAttribute("aria-pressed", String(this.paletteTarget === "stroke"));
    this.elements.paintModeButton.classList.toggle("is-active", this.paletteTarget === "paint");
    this.elements.strokeModeButton.classList.toggle("is-active", this.paletteTarget === "stroke");
    this.syncPaletteSelectionFromCurrentShape({ logMissing: shouldLog, render: false });
    this.updatePaletteModeSwatches();
    if (this.runtimePalette) {
      this.renderPalette();
    }
    if (shouldLog) {
      this.activeTool = this.paletteTarget === "stroke" ? "stroke" : "paint";
      this.setActiveToolButton(null);
      this.statusLog.write(`OK Palette target set to ${this.paletteTarget === "stroke" ? "Stroke" : "Paint"}.`);
    }
  }

  updatePaletteSortButtons() {
    this.elements.paletteSortButtons.forEach((button) => {
      const isActive = button.dataset.paletteSort === this.paletteSortMode;
      button.setAttribute("aria-pressed", String(isActive));
      button.classList.toggle("is-active", isActive);
    });
  }

  updatePaletteModeSwatches() {
    this.elements.paintModeButton.style.setProperty("--object-vector-studio-v2-mode-swatch", this.selectedFillColor);
    this.elements.strokeModeButton.style.setProperty("--object-vector-studio-v2-mode-swatch", this.selectedStrokeColor);
    this.elements.paintModeButton.dataset.paletteModeColor = this.selectedFillColor;
    this.elements.strokeModeButton.dataset.paletteModeColor = this.selectedStrokeColor;
  }

  bindViewportControls() {
    this.elements.zoomInButton.addEventListener("click", () => this.zoomViewportByStep(ZOOM_STEP));
    this.elements.zoomOutButton.addEventListener("click", () => this.zoomViewportByStep(-ZOOM_STEP));
    this.elements.panUpButton.addEventListener("click", () => this.panViewport(0, -20));
    this.elements.panDownButton.addEventListener("click", () => this.panViewport(0, 20));
    this.elements.panLeftButton.addEventListener("click", () => this.panViewport(-20, 0));
    this.elements.panRightButton.addEventListener("click", () => this.panViewport(20, 0));
    this.elements.resetViewButton.addEventListener("click", () => this.resetViewport());
    this.elements.renderSurface.addEventListener("mousemove", (event) => this.updateCoordinateDisplay(event));
    this.elements.renderSurface.addEventListener("wheel", (event) => {
      event.preventDefault();
      this.zoomViewportByStep(event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
    }, { passive: false });
    this.window.addEventListener("pointerup", (event) => {
      this.isPaintDragging = false;
      this.finishPreviewPointerEdit(event);
    });
  }

  bindObjectFilters() {
    this.elements.tagFilter.addEventListener("change", () => {
      this.renderObjectTiles();
      this.statusLog.write(`OK Object tag filter set to ${this.elements.tagFilter.value}.`);
    });
    this.elements.searchFilter.addEventListener("input", () => {
      this.renderObjectTiles();
    });
  }

  bindKeyboardShortcuts() {
    const handleShortcut = (event) => {
      if (event.defaultPrevented) {
        return;
      }
      const tagName = event.target?.tagName || "";
      if (["INPUT", "SELECT", "TEXTAREA"].includes(tagName)) {
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        this.deleteSelectedShape("keyboard");
        return;
      }
      const key = event.key.toLowerCase();
      if (key === "v") {
        event.preventDefault();
        this.activateToolMode("select", "keyboard");
      } else if (key === "f") {
        event.preventDefault();
        this.setPaletteTarget("paint");
      } else if (key === "s") {
        event.preventDefault();
        this.setPaletteTarget("stroke");
      } else if (key === "i") {
        event.preventDefault();
        this.activateToolMode("eyedropper", "keyboard");
      } else if (key === "x") {
        event.preventDefault();
        this.swapFillStrokeColors();
      } else if (key === "d") {
        event.preventDefault();
        this.restoreDefaultColors();
      }
    };
    this.elements.renderSurface.addEventListener("keydown", handleShortcut);
    this.window.document.addEventListener("keydown", handleShortcut);
  }

  applySnapState() {
    this.gridSnapEnabled = this.window.sessionStorage?.getItem(GRID_SNAP_SESSION_KEY) === "1";
    this.angleSnapEnabled = this.window.sessionStorage?.getItem(ANGLE_SNAP_SESSION_KEY) === "1";
    this.gridRenderEnabled = this.window.sessionStorage?.getItem(GRID_RENDER_SESSION_KEY) !== "0";
    this.centerOriginVisible = this.window.sessionStorage?.getItem(CENTER_ORIGIN_SESSION_KEY) !== "0";
    this.elements.gridSnapButton.setAttribute("aria-pressed", String(this.gridSnapEnabled));
    this.elements.angleSnapButton.setAttribute("aria-pressed", String(this.angleSnapEnabled));
    this.elements.gridRenderButton.setAttribute("aria-pressed", String(this.gridRenderEnabled));
    this.elements.centerDotButton.setAttribute("aria-pressed", String(this.centerOriginVisible));
    this.elements.renderSurface.classList.toggle("is-grid-visible", this.gridRenderEnabled);
  }

  applyToolDisplayMode(mode, shouldLog) {
    const isCompact = mode === "icons";
    this.elements.toolToggleGrid.classList.toggle("is-icon-only", isCompact);
    this.elements.zOrderActions.classList.toggle("is-icon-only", isCompact);
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

  activateToolMode(tool, sourceLabel) {
    this.activeTool = tool;
    const button = this.elements.toolToggles.find((candidate) => candidate.dataset.shapeTool === tool) || null;
    this.setActiveToolButton(button);
    if (tool === "paint") {
      this.setPaletteTarget("paint", false);
    } else if (tool === "stroke") {
      this.setPaletteTarget("stroke", false);
    }
    this.statusLog.write(`OK Shape/Tools mode selected from ${sourceLabel}: ${tool}.`);
  }

  renderEmptyState(message) {
    this.currentPayload = null;
    this.selectedObjectId = "";
    this.selectedShapeId = "";
    this.selectedShapeIds.clear();
    this.selectedStateId = "";
    this.selectedFrameId = "";
    this.shapeToolLabelsById.clear();
    this.stopPlaybackTimer();
    this.updateObjectsHeader(0, 0);
    this.updatePaletteHeader(this.runtimePalette?.swatches?.length || 0);
    this.elements.objectNameInput.value = "";
    this.elements.objectTagInput.value = "";
    this.renderObjectTagList(null);
    this.elements.paletteSummary.textContent = this.runtimePalette ? "" : "Palette required before render.";
    this.elements.objectDetails.textContent = "No object selected.";
    this.elements.objectTransform.textContent = "No shape selected.";
    this.elements.objectPreviewFooter.textContent = "Object ID: none";
    this.elements.jsonDetails.textContent = "{}";
    this.renderFrameTimeline();
    this.elements.coordinateDisplay.textContent = `Origin: 0, 0 | Canvas 0,0 centered | Zoom ${this.formatZoomPercentage() * 10}%`;
    this.elements.renderSurface.replaceChildren();
    this.renderSvgGrid();
    this.renderCenterOriginMarker();
    this.elements.objectTiles.replaceChildren(this.createEmptyObjectTile());
    this.renderDependencyGraph();
    this.actionNav.setJsonPayloadActionsEnabled(false);
    this.elements.exportSvgButton.disabled = true;
    this.actionNav.setImportEnabled(this.schemaReady && !this.actionNav.isWorkspaceLaunch());
    this.updateObjectActionState();
  }

  updateObjectsHeader(objectCount, shapeCount) {
    this.elements.objectsCount.textContent = `(${objectCount} obj, ${shapeCount} ${shapeCount === 1 ? "shape" : "shapes"})`;
  }

  updatePaletteHeader(swatchCount) {
    this.elements.paletteSwatchCount.textContent = `(${swatchCount} ${swatchCount === 1 ? "swatch" : "swatches"})`;
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
    this.hiddenObjectIds.clear();
    this.lockedObjectIds.clear();
    this.shapeToolLabelsById.clear();
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
    this.syncPaletteSelectionFromCurrentShape({ render: false });
    if (this.runtimePalette) {
      this.renderPalette();
    }
    this.renderTagFilter();
    this.renderObjectTiles();
    this.renderDependencyGraph();
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
    this.updateObjectsHeader(0, 0);
    this.updatePaletteHeader(0);
    this.elements.paletteSummary.textContent = message;
    this.elements.objectNameInput.value = "";
    this.elements.objectTagInput.value = "";
    this.renderObjectTagList(null);
    this.elements.objectDetails.textContent = "Runtime palette required before object render.";
    this.elements.objectTransform.textContent = "Runtime palette required before object transform.";
    this.elements.objectPreviewFooter.textContent = "Object ID: none";
    this.elements.jsonDetails.textContent = "{}";
    this.renderFrameTimeline();
    this.elements.renderSurface.replaceChildren();
    this.renderSvgGrid();
    this.renderCenterOriginMarker();
    const tile = this.createEmptyObjectTile();
    tile.textContent = "Runtime palette required before rendering object tiles.";
    this.elements.objectTiles.replaceChildren(tile);
    this.renderDependencyGraph();
    this.actionNav.setJsonPayloadActionsEnabled(Boolean(this.currentPayload));
    this.elements.exportSvgButton.disabled = true;
    this.actionNav.setImportEnabled(this.schemaReady && !this.actionNav.isWorkspaceLaunch());
    this.updateObjectActionState();
  }

  renderPalette() {
    const swatchCount = this.runtimePalette.swatches.length;
    this.updatePaletteModeSwatches();
    this.updatePaletteHeader(swatchCount);
    this.elements.paletteSummary.replaceChildren();
    this.sortedPaletteSwatches().forEach((swatch, index) => {
      const label = swatch?.name || swatch?.id || swatch?.symbol || `swatch-${index + 1}`;
      const color = swatchColor(swatch);
      const item = document.createElement("button");
      item.className = "object-vector-studio-v2__palette-swatch";
      item.type = "button";
      item.dataset.paletteColor = color;
      item.dataset.paletteLabel = label;
      item.dataset.paletteDetails = `${label}\n${color || "value unavailable"}`;
      item.title = item.dataset.paletteDetails;
      item.setAttribute("aria-label", `Palette swatch ${label} ${color || "value unavailable"}`);
      item.classList.toggle("is-selected", color && color === this.currentTargetColor());
      if (color) {
        item.style.setProperty("--object-vector-studio-v2-swatch", color);
      }
      item.addEventListener("click", () => this.selectPaletteColor(color, label));
      this.elements.paletteSummary.append(item);
    });
  }

  sortedPaletteSwatches() {
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
    return [...this.runtimePalette.swatches].sort((left, right) => {
      const leftLabel = left?.name || left?.id || left?.symbol || "";
      const rightLabel = right?.name || right?.id || right?.symbol || "";
      if (this.paletteSortMode === "name") {
        return collator.compare(leftLabel, rightLabel);
      }
      const leftMetrics = colorMetrics(swatchColor(left));
      const rightMetrics = colorMetrics(swatchColor(right));
      return (leftMetrics[this.paletteSortMode] - rightMetrics[this.paletteSortMode]) || collator.compare(leftLabel, rightLabel);
    });
  }

  paletteDisplayName() {
    return this.runtimePalette?.id || this.runtimePalette?.name || this.runtimePaletteSource || "runtime palette";
  }

  renderObjectTiles() {
    const previousScrollTop = this.elements.objectsContent.scrollTop;
    this.updateObjectsHeader(this.currentPayload.objects.length, this.selectedObject()?.shapes.length || 0);
    this.elements.objectTiles.replaceChildren();
    if (!this.currentPayload.objects.length) {
      this.elements.objectTiles.append(this.createEmptyObjectTile());
      this.restoreObjectsScroll(previousScrollTop);
      return;
    }

    const filteredObjects = this.filteredObjects();
    if (!filteredObjects.length) {
      const tile = this.createEmptyObjectTile();
      tile.textContent = "No objects match the current tag or search filter.";
      this.elements.objectTiles.append(tile);
      this.restoreObjectsScroll(previousScrollTop);
      return;
    }

    filteredObjects.forEach((object) => {
      const tile = document.createElement("article");
      tile.className = "object-vector-studio-v2__object-tile";
      tile.dataset.objectId = object.id;
      tile.classList.toggle("is-selected", object.id === this.selectedObjectId);
      tile.classList.toggle("is-hidden", this.isObjectHidden(object.id));
      tile.classList.toggle("is-locked", this.isObjectLocked(object.id));
      tile.setAttribute("aria-pressed", String(object.id === this.selectedObjectId));

      const selectButton = document.createElement("button");
      selectButton.className = "object-vector-studio-v2__object-select";
      selectButton.type = "button";
      selectButton.title = `Select object ${object.name}`;
      selectButton.setAttribute("aria-pressed", String(object.id === this.selectedObjectId));

      const thumbnail = this.createObjectThumbnail(object);
      const name = document.createElement("span");
      name.className = "object-vector-studio-v2__object-tile-name";
      name.textContent = object.name;

      const meta = document.createElement("span");
      meta.className = "object-vector-studio-v2__object-tile-meta";
      const tags = tagList(object.tags);
      const inheritedText = object.baseObjectId ? ` - inherits ${object.baseObjectId}` : "";
      const gameSegment = objectGameSegment(object.id) || this.payloadGameKey();
      meta.textContent = `object > ${gameSegment} > ${object.name} | ${shapeCountLabel(object.shapes.length)}${tags.length ? ` | ${tags.join(", ")}` : ""}${inheritedText}`;

      const copy = document.createElement("span");
      copy.className = "object-vector-studio-v2__object-tile-copy";
      copy.append(name, meta);

      selectButton.append(thumbnail, copy);
      selectButton.addEventListener("click", () => {
        this.selectObject(object.id, "tile");
      });

      const controls = document.createElement("div");
      controls.className = "object-vector-studio-v2__object-tile-controls";
      controls.append(
        this.createObjectTileControl(object, "visibility"),
        this.createObjectTileControl(object, "lock"),
        this.createObjectTileControl(object, "delete")
      );
      tile.append(selectButton, controls);
      tile.addEventListener("click", () => {
        this.selectObject(object.id, "tile");
      });
      if (object.id === this.selectedObjectId) {
        tile.append(this.createObjectTileShapeList(object));
      }
      this.elements.objectTiles.append(tile);
    });
    this.restoreObjectsScroll(previousScrollTop);
  }

  restoreObjectsScroll(scrollTop) {
    this.restoreElementScrollTop(this.elements.objectsContent, scrollTop);
  }

  captureLeftPanelScrollState() {
    return {
      leftPanelScrollTop: this.elements.leftPanel.scrollTop,
      objectsScrollTop: this.elements.objectsContent.scrollTop
    };
  }

  restoreLeftPanelScrollState(scrollState) {
    this.restoreElementScrollTop(this.elements.leftPanel, scrollState.leftPanelScrollTop);
    this.restoreElementScrollTop(this.elements.objectsContent, scrollState.objectsScrollTop);
  }

  restoreElementScrollTop(element, scrollTop) {
    const maxScrollTop = Math.max(0, element.scrollHeight - element.clientHeight);
    element.scrollTop = Math.min(scrollTop, maxScrollTop);
  }

  createObjectTileControl(object, kind) {
    const button = document.createElement("button");
    button.className = "object-vector-studio-v2__object-tile-control";
    button.type = "button";
    const isVisibility = kind === "visibility";
    const isDelete = kind === "delete";
    const isLocked = this.isObjectLocked(object.id);
    const isActive = isVisibility ? !this.isObjectHidden(object.id) : !isDelete && isLocked;
    button.dataset.objectControl = kind;
    button.dataset.objectControlId = object.id;
    if (isDelete) {
      button.classList.add("object-vector-studio-v2__object-tile-control--delete");
      button.setAttribute("aria-label", `Delete object ${object.name}`);
      button.append(this.createIconSpan("delete", true));
      button.title = isLocked ? "Unlock object before deleting" : "Delete this object";
      button.disabled = isLocked;
    } else {
      button.setAttribute("aria-pressed", String(isActive));
      button.setAttribute("aria-label", isVisibility ? `${isActive ? "Hide" : "Show"} object ${object.name}` : `${isActive ? "Unlock" : "Lock"} object ${object.name}`);
      button.append(this.createIconSpan(isVisibility ? "eye" : "lock", isActive));
      button.title = isVisibility ? "Toggle object visibility" : "Toggle runtime object lock";
    }
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (isVisibility) {
        this.toggleObjectVisibility(object.id);
      } else if (isDelete) {
        this.deleteObjectById(object.id, "object tile delete");
      } else {
        this.toggleObjectLock(object.id);
      }
    });
    return button;
  }

  createIconSpan(kind, isActive = true) {
    const icon = document.createElement("span");
    icon.className = `object-vector-studio-v2__tile-icon object-vector-studio-v2__tile-icon--${kind}`;
    icon.classList.toggle("is-off", !isActive);
    icon.setAttribute("aria-hidden", "true");
    const iconKey = kind === "eye" && !isActive ? "eyeOff" : kind === "lock" && !isActive ? "unlock" : kind;
    this.applyIconGlyph(icon, iconKey);
    return icon;
  }

  createObjectTileShapeList(object) {
    const list = document.createElement("div");
    list.className = "object-vector-studio-v2__object-tile-shapes";
    sortedShapes(object).forEach((shape) => {
      const row = document.createElement("div");
      row.className = "object-vector-studio-v2__object-tile-shape-row";
      row.classList.toggle("is-selected", this.selectedShapeIds.has(shape.id));
      const selectButton = document.createElement("button");
      selectButton.type = "button";
      selectButton.className = "object-vector-studio-v2__shape-select";
      selectButton.dataset.objectTileShapeId = shape.id;
      selectButton.setAttribute("aria-pressed", String(this.selectedShapeIds.has(shape.id)));
      const label = document.createElement("span");
      label.className = "object-vector-studio-v2__shape-select-label";
      label.textContent = `${shape.order}. ${shape.id}`;
      selectButton.append(label);
      selectButton.addEventListener("click", (event) => {
        event.stopPropagation();
        this.selectShape(shape.id, "object tile shape list", { additive: event.shiftKey || event.ctrlKey || event.metaKey });
      });
      const actions = document.createElement("div");
      actions.className = "object-vector-studio-v2__shape-inline-actions";
      const visibilityButton = document.createElement("button");
      visibilityButton.type = "button";
      visibilityButton.className = "object-vector-studio-v2__shape-inline-button object-vector-studio-v2__shape-eye-inline";
      visibilityButton.dataset.shapeVisibilityId = shape.id;
      visibilityButton.setAttribute("aria-label", `${shape.visible ? "Hide" : "Show"} shape ${shape.id}`);
      visibilityButton.title = "Toggle shape visibility";
      visibilityButton.append(this.createIconSpan("eye", shape.visible));
      visibilityButton.addEventListener("click", (event) => {
        event.stopPropagation();
        this.selectShape(shape.id, "object tile shape visibility");
        this.toggleSelectedShapeVisibility();
      });
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "object-vector-studio-v2__shape-inline-button object-vector-studio-v2__shape-delete-inline";
      deleteButton.dataset.shapeDeleteId = shape.id;
      deleteButton.dataset.shapeDeleteObjectId = object.id;
      deleteButton.setAttribute("aria-label", `Delete shape ${shape.id}`);
      deleteButton.title = "Delete this shape";
      deleteButton.append(this.createIconSpan("delete", true));
      deleteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        this.deleteShapeById(shape.id, "object tile shape delete", object.id);
      });
      actions.append(visibilityButton, deleteButton);
      row.append(selectButton, actions);
      list.append(row);
    });
    if (!list.children.length) {
      const empty = document.createElement("div");
      empty.className = "object-vector-studio-v2__shape-list-empty";
      empty.textContent = "No shapes.";
      list.append(empty);
    }
    return list;
  }

  isObjectHidden(objectId) {
    return this.hiddenObjectIds.has(objectId);
  }

  isObjectLocked(objectId) {
    return this.lockedObjectIds.has(objectId);
  }

  toggleObjectVisibility(objectId) {
    const object = this.currentPayload?.objects.find((candidate) => candidate.id === objectId);
    if (!object) {
      this.statusLog.write(`WARN Object visibility skipped: object id ${objectId || "unknown"} is not available.`);
      return;
    }
    if (this.hiddenObjectIds.has(objectId)) {
      this.hiddenObjectIds.delete(objectId);
    } else {
      this.hiddenObjectIds.add(objectId);
    }
    this.renderPayload();
    this.statusLog.write(`OK Object ${object.name} visibility set to ${this.isObjectHidden(objectId) ? "hidden" : "visible"} for this runtime session.`);
  }

  toggleObjectLock(objectId) {
    const object = this.currentPayload?.objects.find((candidate) => candidate.id === objectId);
    if (!object) {
      this.statusLog.write(`WARN Object lock skipped: object id ${objectId || "unknown"} is not available.`);
      return;
    }
    if (this.lockedObjectIds.has(objectId)) {
      this.lockedObjectIds.delete(objectId);
    } else {
      this.lockedObjectIds.add(objectId);
    }
    this.renderPayload();
    this.statusLog.write(`OK Object ${object.name} lock set to ${this.isObjectLocked(objectId) ? "locked" : "unlocked"} for this runtime session.`);
  }

  filteredObjects() {
    const tag = this.elements.tagFilter.value || "all";
    const query = this.elements.searchFilter.value.trim().toLowerCase();
    return this.currentPayload.objects.filter((object) => {
      const matchesTag = tag === "all" || tagList(object.tags).includes(tag);
      const haystack = `${object.id} ${object.name} ${objectGameSegment(object.id)} ${(object.tags || []).join(" ")} ${object.baseObjectId || ""}`.toLowerCase();
      return matchesTag && (!query || haystack.includes(query));
    });
  }

  renderTagFilter() {
    const selectedValue = this.elements.tagFilter.value || "all";
    this.elements.tagFilter.replaceChildren();
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All";
    this.elements.tagFilter.append(allOption);
    this.availableObjectTags().forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = tag;
      this.elements.tagFilter.append(option);
    });
    this.elements.tagFilter.value = Array.from(this.elements.tagFilter.options).some((option) => option.value === selectedValue) ? selectedValue : "all";
  }

  availableObjectTags() {
    return Array.from(new Set((this.currentPayload?.objects || []).flatMap((object) => tagList(object.tags)))).sort();
  }

  assetLibraryAssets() {
    return Array.isArray(this.currentPayload?.assetLibrary?.assets)
      ? this.currentPayload.assetLibrary.assets
      : [];
  }

  renderDependencyGraph() {
    if (!this.currentPayload) {
      this.elements.dependencyGraph.textContent = "No dependency graph loaded.";
      return;
    }
    const usageLines = this.assetLibraryAssets().map((asset) => `${asset.id}: ${asset.objectId}`);
    const graphLines = this.currentPayload.objects
      .map((object) => `${object.id}${object.baseObjectId ? ` inherits ${object.baseObjectId}` : " has no base object"}`);
    this.elements.dependencyGraph.textContent = [
      "Dependency graph:",
      graphLines.join("\n") || "No objects loaded.",
      "",
      "Deferred reusable library capability:",
      usageLines.join("\n") || "No shared asset references."
    ].join("\n");
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
      this.elements.objectTagInput.value = "";
      this.renderObjectTagList(null);
      this.updateObjectsHeader(this.currentPayload?.objects.length || 0, 0);
      this.elements.objectDetails.textContent = "No object selected.";
      this.elements.objectTransform.textContent = "No shape selected.";
      this.elements.objectPreviewFooter.textContent = "Object ID: none";
      this.elements.jsonDetails.textContent = "{}";
      this.renderFrameTimeline();
      return;
    }

    const shape = this.selectedShape();
    this.elements.objectNameInput.value = selected.name;
    this.renderObjectTagList(selected);
    this.updateObjectsHeader(this.currentPayload.objects.length, selected.shapes.length);
    this.elements.objectDetails.replaceChildren(this.createObjectDetails(selected, shape));
    this.elements.objectTransform.replaceChildren(this.createObjectTransformDetails(shape));
    this.elements.objectPreviewFooter.textContent = `Object ID: ${selected.id}`;
    this.elements.jsonDetails.textContent = JSON.stringify({
      object: selected,
      selectedFrame: this.activeFrame(),
      selectedShape: shape,
      selectedShapeIds: Array.from(this.selectedShapeIds),
      selectedState: this.selectedState()
    }, null, 2);
    this.renderFrameTimeline();
  }

  updateObjectPreviewFooterFromNameInput() {
    const selected = this.selectedObject();
    if (!selected) {
      this.elements.objectPreviewFooter.textContent = "Object ID: none";
      return;
    }

    const name = this.elements.objectNameInput.value.trim();
    if (!name) {
      this.elements.objectPreviewFooter.textContent = `Object ID: ${selected.id}`;
      return;
    }

    const siblingObjects = this.currentPayload.objects.filter((object) => object.id !== selected.id);
    const previewId = this.uniqueObjectId(name, siblingObjects, objectGameSegment(selected.id) || this.payloadGameKey());
    this.elements.objectPreviewFooter.textContent = `Object ID: ${previewId}`;
  }

  renderObjectTagList(object) {
    this.elements.objectTagList.replaceChildren();
    if (!object) {
      const empty = document.createElement("span");
      empty.className = "object-vector-studio-v2__shape-list-empty";
      empty.textContent = "No selected object tags.";
      this.elements.objectTagList.append(empty);
      return;
    }
    const tags = tagList(object.tags);
    if (!tags.length) {
      const empty = document.createElement("span");
      empty.className = "object-vector-studio-v2__shape-list-empty";
      empty.textContent = "No tags.";
      this.elements.objectTagList.append(empty);
      return;
    }
    tags.forEach((tag) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.objectTag = tag;
      button.textContent = tag;
      button.title = `Remove tag ${tag}`;
      button.addEventListener("click", () => this.removeTagFromSelectedObject(tag));
      this.elements.objectTagList.append(button);
    });
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
    if (!shape) {
      const shapePanel = document.createElement("section");
      shapePanel.className = "object-vector-studio-v2__shape-panel";
      const empty = document.createElement("p");
      empty.textContent = "No shape selected. Create a primitive from Shape/Tools.";
      shapePanel.append(empty);
      wrapper.append(shapePanel);
      return wrapper;
    }

    wrapper.append(this.createShapeGeometryControls(shape), this.createSelectedShapeSummary(shape));
    return wrapper;
  }

  createSelectedShapeSummary(shape) {
    const shapePanel = document.createElement("section");
    shapePanel.className = "object-vector-studio-v2__shape-panel";
    shapePanel.append(this.createDetailGrid([
      ["Shape", `${shape.id} (${this.shapeSummaryTypeLabel(shape)})`],
      ["Group", shape.groupId || "None"]
    ]));
    return shapePanel;
  }

  shapeSummaryTypeLabel(shape) {
    return this.shapeToolLabelsById.get(shape.id)?.toLowerCase() || shape.type;
  }

  shapeGeometryHeadingLabel(shape) {
    return this.shapeToolLabelsById.get(shape.id) || shapeTypeLabel(shape);
  }

  createObjectTransformDetails(shape) {
    const wrapper = document.createElement("div");
    wrapper.className = "object-vector-studio-v2__object-detail-stack";
    if (!shape) {
      const empty = document.createElement("p");
      empty.textContent = "No shape selected. Create a primitive from Shape/Tools.";
      wrapper.append(empty);
      return wrapper;
    }

    const transformPanel = document.createElement("section");
    transformPanel.className = "object-vector-studio-v2__shape-panel";
    const heading = document.createElement("h3");
    heading.textContent = `Selected Shape: ${shape.id}`;
    const transform = this.shapeTransform(this.effectiveShape(shape));
    const summary = document.createElement("p");
    summary.className = "object-vector-studio-v2__transform-summary";
    summary.textContent = this.formatTransformSummary(transform);
    transformPanel.append(this.createShapeTransformControls(shape));
    transformPanel.prepend(heading, summary);
    wrapper.append(transformPanel);
    return wrapper;
  }

  formatTransformSummary(transform) {
    return `Transform x ${transform.x}, y ${transform.y}, rot ${transform.rotation}, scale ${transform.scaleX} x ${transform.scaleY}`;
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
    section.className = `object-vector-studio-v2__edit-panel object-vector-studio-v2__edit-panel--geometry object-vector-studio-v2__edit-panel--${shape.type}`;
    if (shape.type === "polygon") {
      section.classList.add("object-vector-studio-v2__edit-panel--polygon");
    }
    const heading = document.createElement("h4");
    heading.textContent = `${this.shapeGeometryHeadingLabel(shape)} Geometry`;
    const grid = document.createElement("div");
    grid.className = shape.type === "polygon"
      ? "object-vector-studio-v2__polygon-point-list"
      : `object-vector-studio-v2__edit-grid object-vector-studio-v2__edit-grid--${shape.type}${shape.type === "ellipse" ? " object-vector-studio-v2__edit-grid--ellipse" : ""}`;
    if (shape.type === "polygon") {
      shape.geometry.points.forEach((point, index) => {
        grid.append(this.createPolygonPointRow(point, index));
      });
    } else {
      this.shapeGeometryFields(shape).forEach((field) => {
        const label = document.createElement("label");
        label.className = "object-vector-studio-v2__edit-field";
        if (field.wide) {
          label.classList.add("object-vector-studio-v2__edit-field--wide");
        }
        const caption = document.createElement("span");
        caption.textContent = field.label;
        const input = document.createElement("input");
        input.dataset.shapeGeometryField = field.key;
        input.type = field.kind;
        input.value = String(field.value);
        input.addEventListener("input", () => this.clearInputValidity(input));
        label.append(caption, input);
        grid.append(label);
      });
    }
    const applyButton = document.createElement("button");
    applyButton.id = "objectVectorStudioV2ApplyGeometryButton";
    applyButton.type = "button";
    applyButton.textContent = "Apply Geometry";
    this.applyIconGlyph(applyButton, "edit");
    applyButton.addEventListener("click", () => this.applyShapeGeometryEdits());
    if (shape.type === "polygon") {
      section.append(heading, grid, this.createPolygonSideActions(), applyButton);
    } else {
      section.append(heading, grid, applyButton);
    }
    return section;
  }

  createPolygonPointRow(point, index) {
    const row = document.createElement("div");
    row.className = "object-vector-studio-v2__polygon-point-field";
    const caption = document.createElement("span");
    caption.className = "object-vector-studio-v2__polygon-point-label";
    caption.textContent = `Point ${index + 1}`;
    row.append(caption);
    [
      ["x", "X", point.x],
      ["y", "Y", point.y]
    ].forEach(([axis, labelText, value]) => {
      const label = document.createElement("label");
      label.className = "object-vector-studio-v2__polygon-point-axis";
      const axisLabel = document.createElement("span");
      axisLabel.textContent = labelText;
      const input = document.createElement("input");
      input.dataset.shapeGeometryField = "points";
      input.dataset.polygonPointAxis = axis;
      input.dataset.polygonPointIndex = String(index);
      input.inputMode = "decimal";
      input.type = "text";
      input.value = String(value);
      input.addEventListener("input", () => this.clearInputValidity(input));
      label.append(axisLabel, input);
      row.append(label);
    });
    return row;
  }

  createPolygonSideActions() {
    const actions = document.createElement("div");
    actions.className = "object-vector-studio-v2__polygon-side-actions";
    [
      ["add", "Add Side", "add", () => this.addPolygonSideRow()],
      ["subtract", "Subtract Side", "line", () => this.subtractPolygonSideRow()]
    ].forEach(([action, label, iconKey, handler]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.polygonSideAction = action;
      button.textContent = label;
      this.applyIconGlyph(button, iconKey);
      button.addEventListener("click", handler);
      actions.append(button);
    });
    return actions;
  }

  createShapeTransformControls(shape) {
    const section = document.createElement("section");
    section.className = "object-vector-studio-v2__edit-panel object-vector-studio-v2__edit-panel--transform";
    const heading = document.createElement("h4");
    heading.textContent = "Transform";
    const grid = document.createElement("div");
    grid.className = "object-vector-studio-v2__edit-grid";
    const transform = this.shapeTransform(this.effectiveShape(shape));
    [
      ["objectVectorStudioV2MoveXInput", "Move X", "10"],
      ["objectVectorStudioV2MoveYInput", "Move Y", "0"],
      ["objectVectorStudioV2RotateInput", "Rotate", "15"],
      ["objectVectorStudioV2ScaleInput", "Scale", "1.1"],
      ["objectVectorStudioV2OriginXInput", "Origin X", String(transform.originX)],
      ["objectVectorStudioV2OriginYInput", "Origin Y", String(transform.originY)],
      ["objectVectorStudioV2ResizeInput", "Resize", "10"]
    ].forEach(([id, labelText, value]) => {
      const label = document.createElement("label");
      label.className = "object-vector-studio-v2__edit-field object-vector-studio-v2__edit-field--inline";
      const caption = document.createElement("span");
      caption.textContent = labelText;
      const input = document.createElement("input");
      input.id = id;
      input.type = "number";
      input.step = "0.1";
      input.value = this.transformInputValue(id, value);
      input.addEventListener("input", () => {
        this.transformInputValues.set(id, input.value);
        this.clearInputValidity(input);
      });
      label.append(caption, input);
      grid.append(label);
    });
    const actions = document.createElement("div");
    actions.className = "object-vector-studio-v2__shape-actions";
    [
      ["objectVectorStudioV2MoveShapeButton", "Move", "move", () => this.moveSelectedShape()],
      ["objectVectorStudioV2RotateShapeButton", "Rotate", "rotate", () => this.rotateSelectedShape()],
      ["objectVectorStudioV2ScaleShapeButton", "Scale", "scale", () => this.scaleSelectedShape()],
      ["objectVectorStudioV2ResizeShapeButton", "Resize", "resize", () => this.resizeSelectedShape()],
      ["objectVectorStudioV2ApplyOriginButton", "Apply Origin", "center", () => this.applySelectedShapeOrigin()]
    ].forEach(([id, label, iconKey, handler]) => {
      const button = document.createElement("button");
      button.id = id;
      button.type = "button";
      button.textContent = label;
      this.applyIconGlyph(button, iconKey);
      button.addEventListener("click", handler);
      actions.append(button);
    });
    section.append(heading, grid, actions);
    return section;
  }

  transformInputValue(id, defaultValue) {
    return this.transformInputValues.has(id) ? this.transformInputValues.get(id) : defaultValue;
  }

  shapeGeometryFields(shape) {
    if (shape.type === "rectangle") {
      return ["x", "y", "width", "height"].map((key) => ({ key, kind: "number", label: key, value: shape.geometry[key] }));
    }
    if (shape.type === "circle") {
      return ["cx", "cy", "r"].map((key) => ({ key, kind: "number", label: key, value: shape.geometry[key], wide: key === "r" }));
    }
    if (shape.type === "ellipse") {
      return [
        { key: "cx", kind: "number", label: "Cx", value: shape.geometry.cx },
        { key: "cy", kind: "number", label: "Cy", value: shape.geometry.cy },
        { key: "rx", kind: "number", label: "Rx", value: shape.geometry.rx },
        { key: "ry", kind: "number", label: "Ry", value: shape.geometry.ry }
      ];
    }
    if (shape.type === "line") {
      return ["x1", "y1", "x2", "y2"].map((key) => ({ key, kind: "number", label: key, value: shape.geometry[key] }));
    }
    if (shape.type === "arc") {
      return ["cx", "cy", "r", "startAngle", "endAngle"].map((key) => ({
        key,
        kind: "number",
        label: key,
        value: shape.geometry[key],
        wide: key === "r"
      }));
    }
    if (shape.type === "text") {
      return [
        { key: "x", kind: "number", label: "x", value: shape.geometry.x },
        { key: "y", kind: "number", label: "y", value: shape.geometry.y },
        { key: "fontSize", kind: "number", label: "fontSize", value: shape.geometry.fontSize, wide: true },
        { key: "text", kind: "text", label: "text", value: shape.geometry.text, wide: true }
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

  renderWorkSurface() {
    const object = this.selectedObject();
    this.elements.renderSurface.replaceChildren();
    this.renderSvgGrid();
    if (!object) {
      this.renderCenterOriginMarker();
      return;
    }
    if (this.isObjectHidden(object.id)) {
      this.renderCenterOriginMarker();
      this.statusLog.write(`OK Render mode svg-work-surface: object ${object.name} is hidden for this runtime session; capture mode none.`);
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
        const element = this.createSvgShape(renderShape, { drawingScale: OBJECT_PREVIEW_DRAWING_SCALE });
        element.dataset.shapeId = shape.id;
        element.dataset.shapeType = shape.type;
        element.classList.add("object-vector-studio-v2__shape");
        element.classList.toggle("is-selected", this.selectedShapeIds.has(shape.id));
        element.setAttribute("tabindex", "0");
        element.addEventListener("pointerdown", (event) => {
          event.stopPropagation();
          if (this.activeTool === "paint" || this.activeTool === "stroke") {
            this.isPaintDragging = true;
            return;
          }
          this.startPreviewShapeMove(event, shape.id);
        });
        element.addEventListener("click", (event) => {
          event.stopPropagation();
          this.handleShapePointer(event, shape, { source: "render surface click" });
        });
        element.addEventListener("pointerenter", (event) => {
          if (this.isPaintDragging) {
            event.stopPropagation();
            this.handleShapePointer(event, shape, { source: "render surface drag" });
          }
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
    this.statusLog.write(`OK ${message}`);
  }

  renderSvgGrid() {
    if (!this.gridRenderEnabled) {
      return;
    }
    const width = DEFAULT_VIEWPORT.width / this.viewport.zoom;
    const height = DEFAULT_VIEWPORT.height / this.viewport.zoom;
    const minX = this.viewport.x - width / 2;
    const maxX = this.viewport.x + width / 2;
    const minY = this.viewport.y - height / 2;
    const maxY = this.viewport.y + height / 2;
    const group = document.createElementNS(SVG_NS, "g");
    group.classList.add("object-vector-studio-v2__svg-grid");
    group.dataset.gridRendered = "true";
    for (let x = Math.floor(minX / GRID_STEP) * GRID_STEP; x <= maxX; x += GRID_STEP) {
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("x1", this.formatViewportNumber(x));
      line.setAttribute("x2", this.formatViewportNumber(x));
      line.setAttribute("y1", this.formatViewportNumber(minY));
      line.setAttribute("y2", this.formatViewportNumber(maxY));
      group.append(line);
    }
    for (let y = Math.floor(minY / GRID_STEP) * GRID_STEP; y <= maxY; y += GRID_STEP) {
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("x1", this.formatViewportNumber(minX));
      line.setAttribute("x2", this.formatViewportNumber(maxX));
      line.setAttribute("y1", this.formatViewportNumber(y));
      line.setAttribute("y2", this.formatViewportNumber(y));
      group.append(line);
    }
    this.elements.renderSurface.append(group);
  }

  handleShapePointer(event, shape, options = {}) {
    if (event.altKey || this.activeTool === "eyedropper") {
      const target = this.paletteTarget === "stroke" ? "stroke" : "fill";
      this.sampleShapeColor(shape.id, target);
      return;
    }
    if (event.shiftKey) {
      this.selectShape(shape.id, "render surface additive", { additive: true });
      return;
    }
    const isStrokeMode = this.activeTool === "stroke";
    const isPaintMode = this.activeTool === "paint";
    if (isStrokeMode || isPaintMode) {
      if (options.dragStart) {
        this.isPaintDragging = true;
      }
      this.applySelectedPaletteColorToShape(shape.id, isStrokeMode ? "stroke" : "fill", options.source || (options.dragStart ? "render surface click" : "render surface drag"));
      return;
    }
    this.selectShape(shape.id, "render surface");
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
        group.append(this.createSvgShape(renderShape, { drawingScale: OBJECT_PREVIEW_DRAWING_SCALE }));
      } catch (error) {
        this.statusLog.write(`FAIL Onion-skin render failed for ${object.name}/${shape.id}: ${error.message}`);
      }
    });
    this.elements.renderSurface.append(group);
  }

  renderObjectBounds(object) {
    const bounds = this.objectBounds(object, { drawingScale: OBJECT_PREVIEW_DRAWING_SCALE, includeInvisible: false });
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
    if (!this.centerOriginVisible) {
      return;
    }
    const marker = document.createElementNS(SVG_NS, "circle");
    marker.classList.add("object-vector-studio-v2__center-origin-dot");
    marker.dataset.centerOrigin = "0,0";
    marker.setAttribute("cx", "0");
    marker.setAttribute("cy", "0");
    marker.setAttribute("r", "9");
    marker.setAttribute("aria-label", "Canvas origin 0,0");
    this.elements.renderSurface.append(marker);
  }

  createSvgShape(shape, { drawingScale = 1 } = {}) {
    if (shape.type === "rectangle") {
      const element = document.createElementNS(SVG_NS, "rect");
      element.setAttribute("x", this.scaleDrawingValue(shape.geometry.x, drawingScale));
      element.setAttribute("y", this.scaleDrawingValue(shape.geometry.y, drawingScale));
      element.setAttribute("width", this.scaleDrawingValue(shape.geometry.width, drawingScale));
      element.setAttribute("height", this.scaleDrawingValue(shape.geometry.height, drawingScale));
      this.applySvgStyle(element, shape, { drawingScale });
      return element;
    }
    if (shape.type === "circle") {
      const element = document.createElementNS(SVG_NS, "circle");
      element.setAttribute("cx", this.scaleDrawingValue(shape.geometry.cx, drawingScale));
      element.setAttribute("cy", this.scaleDrawingValue(shape.geometry.cy, drawingScale));
      element.setAttribute("r", this.scaleDrawingValue(shape.geometry.r, drawingScale));
      this.applySvgStyle(element, shape, { drawingScale });
      return element;
    }
    if (shape.type === "ellipse") {
      const element = document.createElementNS(SVG_NS, "ellipse");
      element.setAttribute("cx", this.scaleDrawingValue(shape.geometry.cx, drawingScale));
      element.setAttribute("cy", this.scaleDrawingValue(shape.geometry.cy, drawingScale));
      element.setAttribute("rx", this.scaleDrawingValue(shape.geometry.rx, drawingScale));
      element.setAttribute("ry", this.scaleDrawingValue(shape.geometry.ry, drawingScale));
      this.applySvgStyle(element, shape, { drawingScale });
      return element;
    }
    if (shape.type === "line") {
      const element = document.createElementNS(SVG_NS, "line");
      element.setAttribute("x1", this.scaleDrawingValue(shape.geometry.x1, drawingScale));
      element.setAttribute("y1", this.scaleDrawingValue(shape.geometry.y1, drawingScale));
      element.setAttribute("x2", this.scaleDrawingValue(shape.geometry.x2, drawingScale));
      element.setAttribute("y2", this.scaleDrawingValue(shape.geometry.y2, drawingScale));
      this.applySvgStyle(element, shape, { drawingScale });
      return element;
    }
    if (shape.type === "polygon") {
      const element = document.createElementNS(SVG_NS, "polygon");
      element.setAttribute("points", shape.geometry.points.map((point) => `${this.scaleDrawingValue(point.x, drawingScale)},${this.scaleDrawingValue(point.y, drawingScale)}`).join(" "));
      this.applySvgStyle(element, shape, { drawingScale });
      return element;
    }
    if (shape.type === "arc") {
      const element = document.createElementNS(SVG_NS, "path");
      element.setAttribute("d", this.arcPath({
        ...shape.geometry,
        cx: this.scaleDrawingValue(shape.geometry.cx, drawingScale),
        cy: this.scaleDrawingValue(shape.geometry.cy, drawingScale),
        r: this.scaleDrawingValue(shape.geometry.r, drawingScale)
      }));
      this.applySvgStyle(element, shape, { drawingScale });
      return element;
    }
    if (shape.type === "text") {
      const element = document.createElementNS(SVG_NS, "text");
      element.setAttribute("x", this.scaleDrawingValue(shape.geometry.x, drawingScale));
      element.setAttribute("y", this.scaleDrawingValue(shape.geometry.y, drawingScale));
      element.setAttribute("font-size", this.scaleDrawingValue(shape.geometry.fontSize, drawingScale));
      element.textContent = shape.geometry.text;
      this.applySvgStyle(element, shape, { drawingScale });
      return element;
    }
    throw new Error(`unsupported shape type ${shape.type}`);
  }

  applySvgStyle(element, shape, { drawingScale = 1 } = {}) {
    element.setAttribute("fill", shape.style.fill);
    element.setAttribute("stroke", shape.style.stroke);
    element.setAttribute("stroke-width", shape.style.strokeWidth);
    const transform = this.scaledDrawingTransform(this.shapeTransform(shape), drawingScale);
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

  scaleDrawingValue(value, drawingScale = 1) {
    return drawingScale === 1 ? value : this.formatViewportNumber(value * drawingScale);
  }

  scaledDrawingTransform(transform, drawingScale = 1) {
    if (drawingScale === 1) {
      return transform;
    }
    return {
      ...transform,
      originX: this.scaleDrawingValue(transform.originX, drawingScale),
      originY: this.scaleDrawingValue(transform.originY, drawingScale),
      x: this.scaleDrawingValue(transform.x, drawingScale),
      y: this.scaleDrawingValue(transform.y, drawingScale)
    };
  }

  scaledDrawingBounds(bounds, drawingScale = 1) {
    if (drawingScale === 1) {
      return bounds;
    }
    return {
      height: this.scaleDrawingValue(bounds.height, drawingScale),
      originX: this.scaleDrawingValue(bounds.originX, drawingScale),
      originY: this.scaleDrawingValue(bounds.originY, drawingScale),
      width: this.scaleDrawingValue(bounds.width, drawingScale),
      x: this.scaleDrawingValue(bounds.x, drawingScale),
      y: this.scaleDrawingValue(bounds.y, drawingScale)
    };
  }

  transformedBounds(shape, { drawingScale = 1 } = {}) {
    const bounds = shapeBounds(shape);
    const transform = this.shapeTransform(shape);
    return this.scaledDrawingBounds({
      height: Math.max(1, bounds.height * transform.scaleY),
      originX: transform.originX + transform.x,
      originY: transform.originY + transform.y,
      width: Math.max(1, bounds.width * transform.scaleX),
      x: bounds.x + transform.x,
      y: bounds.y + transform.y
    }, drawingScale);
  }

  objectBounds(object, { drawingScale = 1, includeInvisible = true } = {}) {
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
    const bounds = shapes.map((shape) => this.transformedBounds(this.effectiveShapeForFrame(shape, activeFrame), { drawingScale }));
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

  renderSelectionOverlay(object) {
    const selectedShape = this.selectedShape();
    if (!selectedShape || selectedShape.visible === false) {
      return;
    }
    try {
      const bounds = this.transformedBounds(this.effectiveShape(selectedShape), { drawingScale: OBJECT_PREVIEW_DRAWING_SCALE });
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
        point.setAttribute("x", cx - 1.5);
        point.setAttribute("y", cy - 1.5);
        point.setAttribute("width", 3);
        point.setAttribute("height", 3);
        point.addEventListener("pointerdown", (event) => this.startPreviewHandleEdit(event, selectedShape.id, { handle, mode: "resize" }));
        this.elements.renderSurface.append(point);
      });

      if (selectedShape.type === "line") {
        const effectiveLine = this.effectiveShape(selectedShape);
        const transform = this.shapeTransform(effectiveLine);
        [
          ["start", effectiveLine.geometry.x1 + transform.x, effectiveLine.geometry.y1 + transform.y],
          ["end", effectiveLine.geometry.x2 + transform.x, effectiveLine.geometry.y2 + transform.y]
        ].forEach(([endpoint, x, y]) => {
          const point = document.createElementNS(SVG_NS, "rect");
          point.classList.add("object-vector-studio-v2__resize-handle", "object-vector-studio-v2__line-endpoint-handle");
          point.dataset.lineEndpoint = endpoint;
          point.dataset.resizeShapeId = selectedShape.id;
          point.setAttribute("x", this.scaleDrawingValue(x, OBJECT_PREVIEW_DRAWING_SCALE) - 2);
          point.setAttribute("y", this.scaleDrawingValue(y, OBJECT_PREVIEW_DRAWING_SCALE) - 2);
          point.setAttribute("width", 4);
          point.setAttribute("height", 4);
          point.addEventListener("pointerdown", (event) => this.startPreviewHandleEdit(event, selectedShape.id, { endpoint, mode: "line-endpoint" }));
          this.elements.renderSurface.append(point);
        });
      }

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
    this.elements.coordinateDisplay.textContent = `Origin: ${this.formatLogicalCoordinate(this.viewport.x)}, ${this.formatLogicalCoordinate(this.viewport.y)} | Canvas 0,0 centered | Zoom ${this.formatZoomPercentage() * 10}%`;
  }

  formatViewportNumber(value) {
    const normalized = Number(Number(value).toFixed(3));
    return Object.is(normalized, -0) ? 0 : normalized;
  }

  formatLogicalCoordinate(value) {
    return this.formatViewportNumber(value / GRID_STEP);
  }

  formatLogicalPointerCoordinate(value) {
    return Math.round(this.formatLogicalCoordinate(value));
  }

  formatZoomPercentage() {
    return Math.round(this.viewport.zoom * 100);
  }

  zoomViewportByStep(step) {
    const nextZoom = Number((this.viewport.zoom + step).toFixed(3));
    this.zoomViewport(nextZoom);
  }

  zoomViewport(nextZoom) {
    if (!Number.isFinite(nextZoom)) {
      this.statusLog.write("WARN Viewport zoom skipped: zoom value is invalid.");
      return;
    }
    this.viewport.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(nextZoom.toFixed(3))));
    this.updateViewport();
    this.renderWorkSurface();
    this.statusLog.write(`OK Viewport zoom set to ${this.formatZoomPercentage() * 10}%.`);
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
    this.statusLog.write(`OK Viewport reset to ${this.formatZoomPercentage() * 10}% at origin 0,0.`);
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
    this.elements.coordinateDisplay.textContent = `Pointer ${this.formatLogicalPointerCoordinate(x)}, ${this.formatLogicalPointerCoordinate(y)} | Canvas origin 0,0 centered | Zoom ${this.formatZoomPercentage() * 10}%`;
  }

  pointerPreviewPoint(event) {
    const bounds = this.elements.renderSurface.getBoundingClientRect();
    const viewWidth = DEFAULT_VIEWPORT.width / this.viewport.zoom;
    const viewHeight = DEFAULT_VIEWPORT.height / this.viewport.zoom;
    const x = this.viewport.x - viewWidth / 2 + ((event.clientX - bounds.left) / bounds.width) * viewWidth;
    const y = this.viewport.y - viewHeight / 2 + ((event.clientY - bounds.top) / bounds.height) * viewHeight;
    return {
      x: this.formatViewportNumber(x / OBJECT_PREVIEW_DRAWING_SCALE),
      y: this.formatViewportNumber(y / OBJECT_PREVIEW_DRAWING_SCALE)
    };
  }

  startPreviewShapeMove(event, shapeId) {
    if (event.button !== 0 || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey || !this.selectedShapeIds.has(shapeId)) {
      return;
    }
    const selected = this.selectedShape();
    if (!selected || selected.id !== shapeId) {
      return;
    }
    event.preventDefault();
    this.previewPointerEdit = {
      mode: "move",
      originalGeometry: JSON.parse(JSON.stringify(selected.geometry)),
      originalTransform: { ...this.shapeTransform(selected) },
      shapeId,
      start: this.pointerPreviewPoint(event)
    };
  }

  startPreviewHandleEdit(event, shapeId, options) {
    if (event.button !== 0) {
      return;
    }
    const selected = this.selectedShape();
    if (!selected || selected.id !== shapeId) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.previewPointerEdit = {
      ...options,
      originalGeometry: JSON.parse(JSON.stringify(selected.geometry)),
      originalTransform: { ...this.shapeTransform(selected) },
      shapeId,
      start: this.pointerPreviewPoint(event)
    };
  }

  finishPreviewPointerEdit(event) {
    const edit = this.previewPointerEdit;
    if (!edit) {
      return;
    }
    this.previewPointerEdit = null;
    const end = this.pointerPreviewPoint(event);
    const delta = {
      x: this.snapDistance(this.formatViewportNumber(end.x - edit.start.x)),
      y: this.snapDistance(this.formatViewportNumber(end.y - edit.start.y))
    };
    if (Math.abs(delta.x) < 0.001 && Math.abs(delta.y) < 0.001) {
      return;
    }

    if (edit.mode === "move") {
      this.updateSelectedShapeTransform("preview move", (shape) => {
        shape.transform = this.ensureShapeTransform(shape);
        shape.transform.x = Number((edit.originalTransform.x + delta.x).toFixed(3));
        shape.transform.y = Number((edit.originalTransform.y + delta.y).toFixed(3));
      }, `OK Dragged shape ${edit.shapeId} by ${delta.x}, ${delta.y}.`);
      return;
    }

    if (edit.mode === "line-endpoint") {
      this.updateSelectedShapeGeometry("preview line endpoint", (shape) => {
        shape.geometry = this.previewLineEndpointGeometry(shape, edit, delta);
      }, `OK Moved line ${edit.endpoint} for shape ${edit.shapeId}.`);
      return;
    }

    if (edit.mode === "resize") {
      this.updateSelectedShapeGeometry("preview resize", (shape) => {
        shape.geometry = this.previewResizeGeometry(shape, edit, delta);
      }, `OK Resized shape ${edit.shapeId} with ${edit.handle} handle.`);
    }
  }

  previewLineEndpointGeometry(shape, edit, delta) {
    const geometry = { ...edit.originalGeometry };
    if (shape.type !== "line") {
      return geometry;
    }
    if (edit.endpoint === "start") {
      geometry.x1 = Number((edit.originalGeometry.x1 + delta.x).toFixed(3));
      geometry.y1 = Number((edit.originalGeometry.y1 + delta.y).toFixed(3));
    } else {
      geometry.x2 = Number((edit.originalGeometry.x2 + delta.x).toFixed(3));
      geometry.y2 = Number((edit.originalGeometry.y2 + delta.y).toFixed(3));
    }
    return geometry;
  }

  previewResizeGeometry(shape, edit, delta) {
    const geometry = JSON.parse(JSON.stringify(edit.originalGeometry));
    if (shape.type === "rectangle") {
      if (edit.handle.includes("w")) {
        geometry.x = Number((edit.originalGeometry.x + delta.x).toFixed(3));
        geometry.width = Number((edit.originalGeometry.width - delta.x).toFixed(3));
      }
      if (edit.handle.includes("e")) {
        geometry.width = Number((edit.originalGeometry.width + delta.x).toFixed(3));
      }
      if (edit.handle.includes("n")) {
        geometry.y = Number((edit.originalGeometry.y + delta.y).toFixed(3));
        geometry.height = Number((edit.originalGeometry.height - delta.y).toFixed(3));
      }
      if (edit.handle.includes("s")) {
        geometry.height = Number((edit.originalGeometry.height + delta.y).toFixed(3));
      }
      return geometry;
    }
    if (shape.type === "ellipse") {
      geometry.rx = Number(Math.max(1, edit.originalGeometry.rx + (edit.handle.includes("e") ? delta.x : -delta.x)).toFixed(3));
      geometry.ry = Number(Math.max(1, edit.originalGeometry.ry + (edit.handle.includes("s") ? delta.y : -delta.y)).toFixed(3));
      return geometry;
    }
    if (shape.type === "circle") {
      const radiusDelta = Math.max(Math.abs(delta.x), Math.abs(delta.y));
      const sign = edit.handle.includes("n") || edit.handle.includes("w") ? -1 : 1;
      geometry.r = Number(Math.max(1, edit.originalGeometry.r + radiusDelta * sign).toFixed(3));
      return geometry;
    }
    return geometry;
  }

  selectObject(objectId, sourceLabel) {
    if (!this.currentPayload?.objects.some((object) => object.id === objectId)) {
      this.statusLog.write(`WARN Select object skipped: object id ${objectId || "unknown"} is not available.`);
      return;
    }

    const scrollState = this.captureLeftPanelScrollState();
    this.selectedObjectId = objectId;
    const selectedObject = this.selectedObject();
    this.selectedShapeId = sortedShapes(selectedObject)[0]?.id || "";
    this.selectedShapeIds = new Set(this.selectedShapeId ? [this.selectedShapeId] : []);
    const selectedState = this.objectStates(selectedObject)[0] || null;
    this.selectedStateId = selectedState?.id || "";
    this.selectedFrameId = selectedState ? sortedFrames(selectedState)[0]?.id || "" : "";
    this.syncPaletteSelectionFromCurrentShape({ logMissing: true });
    this.renderPayload();
    this.restoreLeftPanelScrollState(scrollState);
    const selected = this.selectedObject();
    this.statusLog.write(`OK Selected object from ${sourceLabel}: ${selected.name}.`);
  }

  selectShape(shapeId, sourceLabel, options = {}) {
    const object = this.selectedObject();
    if (!object?.shapes.some((shape) => shape.id === shapeId)) {
      this.statusLog.write(`WARN Select shape skipped: shape id ${shapeId || "unknown"} is not available.`);
      return;
    }

    const scrollState = this.captureLeftPanelScrollState();
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
    this.syncPaletteSelectionFromCurrentShape({ logMissing: true });
    this.renderPayload();
    this.restoreLeftPanelScrollState(scrollState);
    const shape = this.selectedShape();
    this.statusLog.write(`OK Selected shape from ${sourceLabel}: ${shape.id} (${shape.type}). Multi-select count: ${this.selectedShapeIds.size}.`);
  }

  selectState(stateId, sourceLabel) {
    const object = this.selectedObject();
    if (!object) {
      this.statusLog.write("WARN State selection skipped: no object is selected.");
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
    if (this.guardSelectedObjectMutation("Create state")) {
      return;
    }
    const stateId = "idle";
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
    if (this.guardSelectedObjectMutation("Duplicate frame")) {
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
    if (this.guardSelectedObjectMutation("Move frame")) {
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
    this.pendingAddObjectClick = false;
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
      id,
      name,
      shapes: [],
      tags: tagList(this.elements.objectTagInput.value)
    });
    this.commitPayloadUpdate(nextPayload, id, "", `OK Added object ${name} with object/game/name id ${id}.`, "Add object failed schema validation");
  }

  addTagToSelectedObject() {
    const selected = this.selectedObject();
    if (!selected) {
      this.statusLog.write("WARN Tag add skipped: no object is selected.");
      return;
    }
    if (this.guardSelectedObjectMutation("Tag add")) {
      return;
    }
    const tags = tagList(this.elements.objectTagInput.value);
    if (!tags.length) {
      this.statusLog.write("FAIL Tag add blocked: enter a tag name.");
      return;
    }
    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((object) => object.id === selected.id);
    const nextTags = tagList(nextObject.tags);
    const addedTags = [];
    tags.forEach((tag) => {
      const nextTag = this.uniqueTag(tag, nextTags);
      nextTags.push(nextTag);
      addedTags.push(nextTag);
    });
    nextObject.tags = nextTags.sort();
    this.elements.objectTagInput.value = "";
    this.commitPayloadUpdate(nextPayload, selected.id, this.selectedShapeId, `OK Added tag ${addedTags.join(", ")} to ${selected.name}.`, "Object tag update failed schema validation");
  }

  removeTagFromSelectedObject(tag) {
    const selected = this.selectedObject();
    if (!selected) {
      this.statusLog.write("WARN Tag remove skipped: no object is selected.");
      return;
    }
    if (this.guardSelectedObjectMutation("Tag remove")) {
      return;
    }
    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((object) => object.id === selected.id);
    nextObject.tags = tagList(nextObject.tags).filter((candidate) => candidate !== tag);
    this.commitPayloadUpdate(nextPayload, selected.id, this.selectedShapeId, `OK Removed tag ${tag} from ${selected.name}.`, "Object tag update failed schema validation");
  }

  renameSelectedObject() {
    const selected = this.selectedObject();
    if (!selected) {
      this.statusLog.write("WARN Rename object skipped: no object is selected.");
      return;
    }
    if (this.guardSelectedObjectMutation("Rename object")) {
      return;
    }

    const name = this.elements.objectNameInput.value.trim();
    if (!name) {
      this.statusLog.write("FAIL Rename object blocked: enter an object name.");
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((object) => object.id === selected.id);
    const oldId = nextObject.id;
    const siblingObjects = nextPayload.objects.filter((object) => object.id !== oldId);
    const nextId = this.uniqueObjectId(name, siblingObjects, objectGameSegment(oldId) || this.payloadGameKey());
    nextPayload.objects.forEach((object) => {
      if (object.baseObjectId === oldId) {
        object.baseObjectId = nextId;
      }
    });
    (nextPayload.assetLibrary?.assets || []).forEach((asset) => {
      if (asset.objectId === oldId) {
        asset.objectId = nextId;
      }
    });
    nextObject.id = nextId;
    nextObject.name = name;
    this.commitPayloadUpdate(nextPayload, nextId, this.selectedShapeId, `OK Renamed object ${oldId} to ${name} and updated object/game/name id to ${nextId}.`, "Rename object failed schema validation");
  }

  duplicateSelectedObject() {
    const selected = this.selectedObject();
    if (!selected) {
      this.statusLog.write("WARN Duplicate object skipped: no object is selected.");
      return;
    }
    if (this.guardSelectedObjectMutation("Duplicate object")) {
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const objectCopy = JSON.parse(JSON.stringify(selected));
    objectCopy.id = this.uniqueObjectId(`${selected.name} Copy`, nextPayload.objects, objectGameSegment(selected.id) || this.payloadGameKey());
    objectCopy.name = `${selected.name} Copy`;
    nextPayload.objects.push(objectCopy);
    const selectedShapeId = sortedShapes(objectCopy)[0]?.id || "";
    this.commitPayloadUpdate(nextPayload, objectCopy.id, selectedShapeId, `OK Duplicated object ${selected.name} as ${objectCopy.name}.`, "Duplicate object failed schema validation");
  }

  deleteSelectedObject() {
    const selected = this.selectedObject();
    if (!selected) {
      this.statusLog.write("WARN Delete object skipped: no object is selected.");
      return;
    }
    if (this.guardSelectedObjectMutation("Delete object")) {
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    nextPayload.objects = nextPayload.objects.filter((object) => object.id !== selected.id);
    this.removeDeletedObjectReferences(nextPayload, selected.id);
    this.removeDanglingShapeOverrideReferences(nextPayload);
    const selectedObjectId = nextPayload.objects[0]?.id || "";
    const selectedShapeId = nextPayload.objects[0] ? sortedShapes(nextPayload.objects[0])[0]?.id || "" : "";
    this.commitPayloadUpdate(nextPayload, selectedObjectId, selectedShapeId, `OK Deleted object ${selected.name}.`, "Delete object failed schema validation");
  }

  deleteObjectById(objectId, sourceLabel) {
    const selected = this.currentPayload?.objects.find((object) => object.id === objectId);
    if (!selected) {
      this.statusLog.write(`WARN Delete object skipped: object id ${objectId || "unknown"} is not available.`);
      return;
    }
    if (this.isObjectLocked(selected.id)) {
      this.statusLog.write(`WARN Delete object blocked: object ${selected.name} is locked for this runtime session.`);
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    nextPayload.objects = nextPayload.objects.filter((object) => object.id !== selected.id);
    this.removeDeletedObjectReferences(nextPayload, selected.id);
    this.removeDanglingShapeOverrideReferences(nextPayload);
    const selectedObjectStillExists = nextPayload.objects.some((object) => object.id === this.selectedObjectId);
    const nextSelectedObject = selectedObjectStillExists
      ? nextPayload.objects.find((object) => object.id === this.selectedObjectId)
      : nextPayload.objects[0] || null;
    const selectedObjectId = nextSelectedObject?.id || "";
    const selectedShapeStillExists = nextSelectedObject?.shapes.some((shape) => shape.id === this.selectedShapeId);
    const selectedShapeId = selectedShapeStillExists ? this.selectedShapeId : nextSelectedObject ? sortedShapes(nextSelectedObject)[0]?.id || "" : "";
    this.hiddenObjectIds.delete(selected.id);
    this.lockedObjectIds.delete(selected.id);
    this.commitPayloadUpdate(nextPayload, selectedObjectId, selectedShapeId, `OK Deleted object ${selected.name} from ${sourceLabel}.`, "Delete object failed schema validation");
  }

  removeDeletedObjectReferences(payload, objectId) {
    if (Array.isArray(payload.assetLibrary?.assets)) {
      payload.assetLibrary.assets = payload.assetLibrary.assets.filter((asset) => asset.objectId !== objectId);
    }
    payload.objects.forEach((object) => {
      if (object.baseObjectId === objectId) {
        delete object.baseObjectId;
      }
    });
    this.removeDirectReferenceEntries(payload, "objectId", objectId);
  }

  removeDirectReferenceEntries(value, referenceKey, targetId) {
    if (!value || typeof value !== "object") {
      return;
    }
    if (Array.isArray(value)) {
      for (let index = value.length - 1; index >= 0; index -= 1) {
        const item = value[index];
        if (item && typeof item === "object" && item[referenceKey] === targetId) {
          value.splice(index, 1);
        } else {
          this.removeDirectReferenceEntries(item, referenceKey, targetId);
        }
      }
      return;
    }
    Object.entries(value).forEach(([key, child]) => {
      if (key === referenceKey && child === targetId) {
        delete value[key];
        return;
      }
      this.removeDirectReferenceEntries(child, referenceKey, targetId);
    });
  }

  removeDanglingShapeOverrideReferences(payload) {
    const objectsById = new Map(payload.objects.map((object) => [object.id, object]));
    const collectShapeIds = (object, seen = new Set()) => {
      if (!object || seen.has(object.id)) {
        return new Set();
      }
      seen.add(object.id);
      const shapeIds = object.baseObjectId
        ? collectShapeIds(objectsById.get(object.baseObjectId), seen)
        : new Set();
      object.shapes.forEach((shape) => shapeIds.add(shape.id));
      return shapeIds;
    };
    payload.objects.forEach((object) => {
      const validShapeIds = collectShapeIds(object);
      this.objectStates(object).forEach((state) => {
        state.frames.forEach((frame) => {
          frame.shapeOverrides = frame.shapeOverrides.filter((override) => validShapeIds.has(override.shapeId));
        });
      });
    });
  }

  flattenSelectedObject() {
    const selected = this.selectedObject();
    if (!selected) {
      this.statusLog.write("WARN Flatten object skipped: no object is selected.");
      return;
    }
    if (this.guardSelectedObjectMutation("Flatten object")) {
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
    if (this.guardSelectedObjectMutation(`Create ${type}`)) {
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
    const shapeType = type === "triangle" ? "polygon" : type;
    const shape = this.createPrimitiveShape(type, this.uniqueShapeId(shapeType, nextObject.shapes), order, color);
    if (type === "triangle") {
      this.shapeToolLabelsById.set(shape.id, "Triangle");
    }
    nextObject.shapes.push(shape);
    this.commitPayloadUpdate(nextPayload, nextObject.id, shape.id, `OK Created ${type} shape ${shape.id} on ${nextObject.name}.`, `Create ${type} failed schema validation`);
  }

  createPrimitiveShape(type, id, order, color) {
    const withTransform = (shape) => ({
      ...shape,
      transform: defaultShapeTransform(shape)
    });
    const schemaType = type === "triangle" ? "polygon" : type;
    const base = {
      id,
      locked: false,
      order,
      style: {
        fill: ["arc", "line"].includes(schemaType) ? "none" : color,
        stroke: color,
        strokeWidth: 3
      },
      type: schemaType,
      visible: true
    };
    if (type === "rectangle") {
      return withTransform({ ...base, geometry: { height: 60, width: 80, x: -80, y: -30 } });
    }
    if (type === "circle") {
      return withTransform({ ...base, geometry: { cx: 70, cy: -10, r: 30 } });
    }
    if (type === "ellipse") {
      return withTransform({ ...base, geometry: { cx: 70, cy: 70, rx: 50, ry: 30 } });
    }
    if (type === "line") {
      return withTransform({ ...base, geometry: { x1: -100, x2: 0, y1: 80, y2: 30 } });
    }
    if (type === "polygon" || type === "triangle") {
      return withTransform({
        ...base,
        geometry: {
          points: [
            { x: 0, y: -80 },
            { x: 40, y: -10 },
            { x: -40, y: -10 }
          ]
        }
      });
    }
    if (type === "arc") {
      return withTransform({ ...base, geometry: { cx: 0, cy: 70, endAngle: 135, r: 40, startAngle: -135 } });
    }
    if (type === "text") {
      return withTransform({ ...base, geometry: { fontSize: 20, text: "Text", x: -30, y: 40 } });
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

  currentTargetColor() {
    return this.paletteTarget === "stroke" ? this.selectedStrokeColor : this.selectedFillColor;
  }

  paletteSwatchForColor(color) {
    const normalized = String(color || "").trim().toLowerCase();
    if (!normalized || !this.runtimePalette?.swatches?.length) {
      return null;
    }
    return this.runtimePalette.swatches.find((swatch) => String(swatchColor(swatch)).trim().toLowerCase() === normalized) || null;
  }

  paletteLabelForColor(color, fallbackLabel) {
    const swatch = this.paletteSwatchForColor(color);
    return swatch?.name || swatch?.id || swatch?.symbol || fallbackLabel;
  }

  syncPaletteSelectionFromCurrentShape(options = {}) {
    this.syncPaletteSelectionFromShape(this.selectedShape(), options);
  }

  syncPaletteSelectionFromShape(shape, options = {}) {
    if (!shape || !this.runtimePalette) {
      return;
    }
    const { logMissing = false, render = true } = options;
    const effectiveShape = this.effectiveShape(shape);
    let changed = false;
    const syncTarget = (target, color) => {
      const normalizedColor = String(color || "").trim();
      if (!normalizedColor || normalizedColor === "none") {
        return;
      }
      const swatch = this.paletteSwatchForColor(normalizedColor);
      if (!swatch) {
        if (logMissing) {
          this.statusLog.write(`WARN Palette sync skipped for ${shape.id} ${target} color ${normalizedColor}: color is not in the loaded palette.`);
        }
        return;
      }
      const label = swatch.name || swatch.id || swatch.symbol || shape.id;
      const paletteColor = swatchColor(swatch) || normalizedColor;
      if (target === "stroke") {
        changed = changed || this.selectedStrokeColor !== paletteColor || this.selectedStrokeLabel !== label;
        this.selectedStrokeColor = paletteColor;
        this.selectedStrokeLabel = label;
        return;
      }
      changed = changed || this.selectedFillColor !== paletteColor || this.selectedFillLabel !== label;
      this.selectedFillColor = paletteColor;
      this.selectedFillLabel = label;
    };
    syncTarget("paint", effectiveShape.style?.fill);
    syncTarget("stroke", effectiveShape.style?.stroke);
    if (changed && render) {
      this.renderPalette();
    }
  }

  selectPaletteColor(color, label, options = {}) {
    if (!color) {
      this.statusLog.write(`FAIL Palette color application blocked: swatch ${label} has no usable color value.`);
      return;
    }
    const swatch = this.paletteSwatchForColor(color);
    if (!swatch) {
      this.statusLog.write(`FAIL Palette color selection rejected: ${color} is not in the loaded palette.`);
      return;
    }
    const paletteLabel = swatch.name || swatch.id || swatch.symbol || label;
    if (this.paletteTarget === "stroke") {
      this.selectedStrokeColor = color;
      this.selectedStrokeLabel = paletteLabel;
    } else {
      this.selectedFillColor = color;
      this.selectedFillLabel = paletteLabel;
    }
    if (this.runtimePalette) {
      this.renderPalette();
    }
    this.statusLog.write(`OK Selected ${this.paletteTarget === "stroke" ? "stroke" : "paint"} color ${color} from ${paletteLabel}.`);
    if (options.applyToSelection === false || !this.selectedShapeId) {
      return;
    }
    this.applySelectedPaletteColorToShape(this.selectedShapeId, this.paletteTarget === "stroke" ? "stroke" : "fill", "palette swatch");
  }

  applyPaletteColor(color, label) {
    this.selectPaletteColor(color, label);
  }

  applySelectedPaletteColorToShape(shapeId, target, sourceLabel) {
    const selected = this.selectedObject()?.shapes.find((shape) => shape.id === shapeId);
    if (!selected) {
      this.statusLog.write("FAIL Palette color application blocked: select a shape first.");
      return;
    }
    if (selected.locked) {
      this.statusLog.write(`WARN Palette color application skipped: shape ${selected.id} is locked.`);
      return;
    }
    if (this.guardSelectedObjectMutation("Palette color application")) {
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const shape = this.findShapeInPayload(nextPayload, selected.id);
    const strokeWidth = Number(this.elements.strokeWidth.value);
    const shouldApplyStroke = target === "stroke" || ["arc", "line"].includes(shape.type);
    const color = shouldApplyStroke ? this.selectedStrokeColor : this.selectedFillColor;
    const label = shouldApplyStroke ? this.selectedStrokeLabel : this.selectedFillLabel;
    if (!color) {
      this.statusLog.write(`FAIL Palette color application blocked: no ${shouldApplyStroke ? "stroke" : "paint"} color is selected.`);
      return;
    }
    const swatch = this.paletteSwatchForColor(color);
    if (!swatch) {
      this.statusLog.write(`FAIL Palette color application rejected: ${color} is not in the loaded palette.`);
      return;
    }
    const paletteLabel = swatch.name || swatch.id || swatch.symbol || label;
    if (shouldApplyStroke) {
      shape.style.stroke = color;
      shape.style.strokeWidth = Number.isFinite(strokeWidth) && strokeWidth > 0 ? strokeWidth : 2;
    } else {
      shape.style.fill = color;
    }
    const targetLabel = shouldApplyStroke ? `Target: stroke width ${shape.style.strokeWidth}.` : "Target: paint.";
    this.commitPayloadUpdate(nextPayload, this.selectedObjectId, selected.id, `OK Applied palette color ${color} from ${paletteLabel} to shape ${selected.id} by ${sourceLabel}. ${targetLabel}`, "Palette color application failed schema validation");
  }

  sampleShapeColor(shapeId, target) {
    const selected = this.selectedObject()?.shapes.find((shape) => shape.id === shapeId);
    if (!selected) {
      this.statusLog.write(`WARN Eyedropper skipped: shape ${shapeId || "unknown"} is not available.`);
      return;
    }
    const color = target === "stroke" ? selected.style.stroke : selected.style.fill;
    if (!color || color === "none") {
      this.statusLog.write(`WARN Eyedropper skipped: shape ${selected.id} has no ${target} color.`);
      return;
    }
    const swatch = this.paletteSwatchForColor(color);
    if (!swatch) {
      this.statusLog.write(`FAIL Eyedropper rejected ${target} color ${color} from shape ${selected.id}: color is not in the loaded palette.`);
      return;
    }
    const label = swatch.name || swatch.id || swatch.symbol || selected.id;
    if (target === "stroke") {
      this.selectedStrokeColor = color;
      this.selectedStrokeLabel = label;
      this.setPaletteTarget("stroke", false);
    } else {
      this.selectedFillColor = color;
      this.selectedFillLabel = label;
      this.setPaletteTarget("paint", false);
    }
    if (this.runtimePalette) {
      this.renderPalette();
    }
    this.statusLog.write(`OK Sampled ${target} color ${color} from shape ${selected.id}.`);
  }

  swapFillStrokeColors() {
    const nextFill = this.selectedStrokeColor;
    const nextFillLabel = this.selectedStrokeLabel;
    this.selectedStrokeColor = this.selectedFillColor;
    this.selectedStrokeLabel = this.selectedFillLabel;
    this.selectedFillColor = nextFill;
    this.selectedFillLabel = nextFillLabel;
    if (this.runtimePalette) {
      this.renderPalette();
    }
    this.statusLog.write(`OK Swapped fill and stroke colors: fill ${this.selectedFillColor}, stroke ${this.selectedStrokeColor}.`);
  }

  restoreDefaultColors() {
    const fillColor = this.firstPaletteColor();
    const strokeColor = this.secondPaletteColor(fillColor);
    if (!fillColor || !strokeColor) {
      this.statusLog.write("FAIL Default colors blocked: a loaded palette color is required.");
      return;
    }
    this.selectedFillColor = fillColor;
    this.selectedStrokeColor = strokeColor;
    this.selectedFillLabel = this.paletteLabelForColor(fillColor, "default fill");
    this.selectedStrokeLabel = this.paletteLabelForColor(strokeColor, "default stroke");
    this.renderPalette();
    this.statusLog.write(`OK Restored default paint/stroke colors from loaded palette: fill ${fillColor}, stroke ${strokeColor}.`);
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
    if (this.guardSelectedObjectMutation("Shape visibility")) {
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
    if (this.guardSelectedObjectMutation("Shape lock")) {
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
    if (this.guardSelectedObjectMutation("Shape order")) {
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
    if (!input.ok) {
      this.statusLog.write(`FAIL Invalid transform rejected for shape ${this.selectedShapeId || "unknown"}: ${input.error}`);
      return;
    }
    if (input.value <= 0) {
      this.markInputInvalid(this.window.document.getElementById("objectVectorStudioV2ScaleInput"), "Scale must be greater than 0.");
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
    if (this.guardSelectedObjectMutation("Group shapes")) {
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
    if (this.guardSelectedObjectMutation("Ungroup shapes")) {
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
    if (this.guardSelectedObjectMutation("Geometry edit")) {
      return;
    }
    const fields = Array.from(this.elements.objectDetails.querySelectorAll("[data-shape-geometry-field]"));
    const geometry = this.readShapeGeometryFields(selected, fields);
    if (!geometry.ok) {
      this.statusLog.write(`FAIL Invalid geometry rejected for shape ${selected.id}: ${geometry.error}`);
      return;
    }
    this.updateSelectedShapeGeometry("geometry edit", (shape) => {
      shape.geometry = geometry.value;
      shape.transform = this.ensureShapeTransform(shape);
    }, `OK Applied geometry edits to shape ${selected.id}.`);
  }

  addPolygonSideRow() {
    const selected = this.selectedShape();
    if (!selected || selected.type !== "polygon") {
      this.statusLog.write("WARN Add polygon side skipped: no polygon shape is selected.");
      return;
    }
    const geometry = this.readCurrentPolygonGeometry(selected);
    if (!geometry.ok) {
      this.statusLog.write(`FAIL Add polygon side rejected for shape ${selected.id}: ${geometry.error}`);
      return;
    }
    const points = geometry.value.points;
    const nextPoint = this.nextPolygonSidePoint(points);
    const list = this.elements.objectDetails.querySelector(".object-vector-studio-v2__polygon-point-list");
    list?.append(this.createPolygonPointRow(nextPoint, points.length));
    this.clearPolygonSideActionValidity();
    this.statusLog.write(`OK Added polygon side to shape ${selected.id}.`);
  }

  subtractPolygonSideRow() {
    const selected = this.selectedShape();
    if (!selected || selected.type !== "polygon") {
      this.statusLog.write("WARN Subtract polygon side skipped: no polygon shape is selected.");
      return;
    }
    const geometry = this.readCurrentPolygonGeometry(selected);
    if (!geometry.ok) {
      this.statusLog.write(`FAIL Subtract polygon side rejected for shape ${selected.id}: ${geometry.error}`);
      return;
    }
    if (geometry.value.points.length <= 3) {
      const message = "polygon must keep at least three sides.";
      this.markPolygonSideActionInvalid("subtract", message);
      this.statusLog.write(`FAIL Subtract polygon side rejected for shape ${selected.id}: ${message}`);
      return;
    }
    const rows = Array.from(this.elements.objectDetails.querySelectorAll(".object-vector-studio-v2__polygon-point-field"));
    rows.at(-1)?.remove();
    this.reindexPolygonPointRows();
    this.clearPolygonSideActionValidity();
    this.statusLog.write(`OK Subtracted polygon side from shape ${selected.id}.`);
  }

  readCurrentPolygonGeometry(shape) {
    const fields = Array.from(this.elements.objectDetails.querySelectorAll("[data-shape-geometry-field='points']"));
    return this.readShapeGeometryFields(shape, fields);
  }

  nextPolygonSidePoint(points) {
    const previous = points.at(-2) || { x: 0, y: 0 };
    const last = points.at(-1) || { x: 0, y: 0 };
    const deltaX = last.x - previous.x;
    const deltaY = last.y - previous.y;
    return {
      x: Number((last.x + (deltaX || 10)).toFixed(3)),
      y: Number((last.y + (deltaY || 10)).toFixed(3))
    };
  }

  reindexPolygonPointRows() {
    this.elements.objectDetails.querySelectorAll(".object-vector-studio-v2__polygon-point-field").forEach((row, index) => {
      const caption = row.querySelector(".object-vector-studio-v2__polygon-point-label");
      if (caption) {
        caption.textContent = `Point ${index + 1}`;
      }
      row.querySelectorAll("[data-polygon-point-index]").forEach((input) => {
        input.dataset.polygonPointIndex = String(index);
      });
    });
  }

  markPolygonSideActionInvalid(action, message) {
    const button = this.elements.objectDetails.querySelector(`[data-polygon-side-action='${action}']`);
    if (!button) {
      return;
    }
    button.dataset.validationState = "invalid";
    button.setAttribute("aria-invalid", "true");
    button.title = message;
  }

  clearPolygonSideActionValidity() {
    this.elements.objectDetails.querySelectorAll("[data-polygon-side-action]").forEach((button) => {
      delete button.dataset.validationState;
      button.removeAttribute("aria-invalid");
      button.title = "";
    });
  }

  readShapeGeometryFields(shape, fields) {
    try {
      if (shape.type === "polygon") {
        const pointInputs = fields.filter((input) => input.dataset.shapeGeometryField === "points");
        if (pointInputs.length < 3) {
          throw new Error("polygon points must contain at least three point rows.");
        }
        const pointRows = new Map();
        pointInputs.forEach((input) => {
          const index = Number(input.dataset.polygonPointIndex);
          const axis = input.dataset.polygonPointAxis;
          if (!pointRows.has(index)) {
            pointRows.set(index, {});
          }
          pointRows.get(index)[axis] = input;
        });
        if (pointRows.size < 3) {
          throw new Error("polygon points must contain at least three point rows.");
        }
        const points = [];
        for (const index of [...pointRows.keys()].sort((left, right) => left - right)) {
          const row = pointRows.get(index);
          const pointNumber = index + 1;
          const x = this.numberInputElementValue(row.x, `Point ${pointNumber} X`);
          const y = this.numberInputElementValue(row.y, `Point ${pointNumber} Y`);
          if (!x.ok || !y.ok) {
            return { error: x.error || y.error, ok: false, value: null };
          }
          points.push({ x: x.value, y: y.value });
        }
        return { ok: true, value: { points } };
      }
      const geometry = {};
      for (const input of fields) {
        const key = input.dataset.shapeGeometryField;
        if (input.type === "number") {
          const parsed = this.numberInputElementValue(input, key);
          if (!parsed.ok) {
            return { error: parsed.error, ok: false, value: null };
          }
          geometry[key] = parsed.value;
        } else {
          this.clearInputValidity(input);
          geometry[key] = input.value;
        }
      }
      return { ok: true, value: geometry };
    } catch (error) {
      if (error.input) {
        this.markInputInvalid(error.input, error.message);
      } else {
        const pointsInput = fields.find((input) => input.dataset.shapeGeometryField === "points");
        if (pointsInput) {
          this.markInputInvalid(pointsInput, error.message);
        }
      }
      return { error: error.message, ok: false, value: null };
    }
  }

  updateSelectedShapeGeometry(operation, updater, okMessage) {
    const selected = this.selectedShape();
    if (!selected) {
      this.statusLog.write(`WARN Geometry ${operation} skipped: no shape is selected.`);
      return;
    }
    if (selected.locked) {
      this.statusLog.write(`WARN Geometry ${operation} skipped: shape ${selected.id} is locked.`);
      return;
    }
    if (this.guardSelectedObjectMutation(`Geometry ${operation}`)) {
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const shape = this.findShapeInPayload(nextPayload, selected.id);
    try {
      updater(shape);
      shape.transform = this.ensureShapeTransform(shape);
      const transformErrors = this.validateShapeForTransform(shape);
      if (transformErrors.length) {
        this.statusLog.write(`FAIL Invalid geometry rejected for shape ${selected.id}: ${transformErrors.join(" ")}`);
        return;
      }
    } catch (error) {
      this.statusLog.write(`FAIL Invalid geometry rejected for shape ${selected.id}: ${error.message}`);
      return;
    }
    this.commitPayloadUpdate(nextPayload, this.selectedObjectId, selected.id, okMessage, `Geometry ${operation} failed schema validation`);
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
    if (this.guardSelectedObjectMutation(`Transform ${operation}`)) {
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
    if (this.guardSelectedObjectMutation("Duplicate shape")) {
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
    if (this.guardSelectedObjectMutation("Delete shape")) {
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const object = nextPayload.objects.find((candidate) => candidate.id === this.selectedObjectId);
    object.shapes = sortedShapes(object).filter((shape) => shape.id !== selected.id)
      .map((shape, index) => ({ ...shape, order: index + 1 }));
    this.removeDeletedShapeReferences(object, selected.id);
    this.removeDanglingShapeOverrideReferences(nextPayload);
    const selectedShapeId = sortedShapes(object)[0]?.id || "";
    this.commitPayloadUpdate(nextPayload, object.id, selectedShapeId, `OK Deleted shape ${selected.id} from ${sourceLabel}.`, "Delete shape failed schema validation");
  }

  deleteShapeById(shapeId, sourceLabel, objectId = this.selectedObjectId) {
    const object = this.currentPayload?.objects.find((candidate) => candidate.id === objectId) || null;
    const shape = object?.shapes.find((candidate) => candidate.id === shapeId) || null;
    if (!object || !shape) {
      this.statusLog.write(`WARN Delete shape skipped from ${sourceLabel}: shape ${shapeId || "unknown"} is not available.`);
      return;
    }
    if (shape.locked) {
      this.statusLog.write(`WARN Delete shape skipped: shape ${shape.id} is locked.`);
      return;
    }
    if (this.isObjectLocked(object.id)) {
      this.statusLog.write(`WARN Delete shape blocked: object ${object.name} is locked for this runtime session.`);
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((candidate) => candidate.id === object.id);
    nextObject.shapes = sortedShapes(nextObject).filter((candidate) => candidate.id !== shape.id)
      .map((candidate, index) => ({ ...candidate, order: index + 1 }));
    this.removeDeletedShapeReferences(nextObject, shape.id);
    this.removeDanglingShapeOverrideReferences(nextPayload);
    const selectedShapeStillExists = nextObject.shapes.some((candidate) => candidate.id === this.selectedShapeId);
    const selectedShapeId = selectedShapeStillExists ? this.selectedShapeId : sortedShapes(nextObject)[0]?.id || "";
    this.commitPayloadUpdate(nextPayload, object.id, selectedShapeId, `OK Deleted shape ${shape.id} from ${sourceLabel}.`, "Delete shape failed schema validation");
  }

  removeDeletedShapeReferences(object, shapeId) {
    this.removeDirectReferenceEntries(object, "shapeId", shapeId);
  }

  numberInputValue(id, label) {
    const element = this.window.document.getElementById(id);
    return this.numberInputElementValue(element, label);
  }

  numberInputElementValue(element, label) {
    const rawValue = element?.value?.trim() || "";
    const value = Number(rawValue);
    if (!element || rawValue === "" || !Number.isFinite(value)) {
      const error = `${label} must be a finite number.`;
      this.markInputInvalid(element, error);
      return { error, ok: false, value: 0 };
    }
    this.clearInputValidity(element);
    return { error: "", ok: true, value };
  }

  markInputInvalid(element, message) {
    if (!element) {
      return;
    }
    element.classList.add("is-invalid");
    element.setAttribute("aria-invalid", "true");
    element.setCustomValidity(message);
    element.reportValidity();
  }

  clearInputValidity(element) {
    if (!element) {
      return;
    }
    element.classList.remove("is-invalid");
    element.removeAttribute("aria-invalid");
    element.setCustomValidity("");
  }

  snapDistance(value) {
    if (!this.gridSnapEnabled) {
      return value;
    }
    const snapped = Math.round(Math.abs(value) / GRID_STEP) * GRID_STEP;
    return value < 0 ? -snapped : snapped;
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

  guardSelectedObjectMutation(actionLabel) {
    const object = this.selectedObject();
    if (!object) {
      this.statusLog.write(`WARN ${actionLabel} skipped: no object is selected.`);
      return true;
    }
    if (!this.isObjectLocked(object.id)) {
      return false;
    }
    this.statusLog.write(`WARN ${actionLabel} blocked: object ${object.name} is locked for this runtime session.`);
    return true;
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

  uniqueObjectId(name, objects, gameKey = this.payloadGameKey()) {
    const baseId = `object.${gameKey}.${slugifyObjectName(name)}`;
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

  payloadGameKey() {
    const counts = new Map();
    (this.currentPayload?.objects || []).forEach((object) => {
      const segment = objectGameSegment(object.id);
      if (segment) {
        counts.set(segment, (counts.get(segment) || 0) + 1);
      }
    });
    const existingGame = [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0]?.[0];
    return existingGame || payloadGameSlugFromName(this.currentPayload?.name);
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

  uniqueTag(tag, tags) {
    const baseTag = slugifyObjectName(tag);
    const usedTags = new Set(tags);
    if (!usedTags.has(baseTag)) {
      return baseTag;
    }

    let suffix = 2;
    let candidate = `${baseTag}-${suffix}`;
    while (usedTags.has(candidate)) {
      suffix += 1;
      candidate = `${baseTag}-${suffix}`;
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
    const noObjectReason = "Disabled until a schema-valid object is selected.";
    const lockedReason = selectedObject ? `Disabled because ${selectedObject.name} is locked for this runtime session.` : noObjectReason;
    const isLocked = Boolean(selectedObject && this.isObjectLocked(selectedObject.id));
    this.setControlDisabled(this.elements.renameObjectButton, !hasSelectedObject || isLocked, lockedReason, "Rename the selected object.");
    this.setControlDisabled(this.elements.duplicateObjectButton, !hasSelectedObject || isLocked, lockedReason, "Duplicate the selected object.");
    if (this.elements.deleteObjectButton) {
      this.setControlDisabled(this.elements.deleteObjectButton, !hasSelectedObject || isLocked, lockedReason, "Delete the selected object.");
    }
    this.setControlDisabled(this.elements.exportSvgButton, !hasSelectedObject, noObjectReason, "Export the selected object as SVG.");
    this.setControlDisabled(this.elements.runtimePreviewButton, !hasSelectedObject, noObjectReason, "Preview the selected object through the runtime asset renderer.");
    const hasSelectedShape = Boolean(this.selectedShape());
    const noShapeReason = "Disabled until a schema-valid shape is selected.";
    [this.elements.bringForwardButton, this.elements.sendBackwardButton, this.elements.bringToFrontButton, this.elements.sendToBackButton, this.elements.ungroupButton].forEach((button) => {
      this.setControlDisabled(button, !hasSelectedShape || isLocked, isLocked ? lockedReason : noShapeReason, "Adjust selected shape ordering or grouping.");
    });
    this.setControlDisabled(
      this.elements.groupShapesButton,
      this.selectedShapeIds.size < 2 || isLocked,
      isLocked ? lockedReason : "Disabled until two or more shapes are selected. Shift-click shapes in the preview or object shape list to build a group selection.",
      "Group selected shapes. Shift-click shapes to select more than one."
    );
    this.updateAnimationActionState();
  }

  updateAnimationActionState() {
    const state = this.selectedState();
    const frames = sortedFrames(state);
    const hasFrame = Boolean(state && this.activeFrame());
    const frameIndex = frames.findIndex((frame) => frame.id === this.selectedFrameId);
    const noFrameReason = "Disabled until the selected object has an active state frame.";
    const object = this.selectedObject();
    const isLocked = Boolean(object && this.isObjectLocked(object.id));
    const lockedReason = object ? `Disabled because ${object.name} is locked for this runtime session.` : noFrameReason;
    this.setControlDisabled(this.elements.duplicateFrameButton, !hasFrame || isLocked, isLocked ? lockedReason : noFrameReason, "Duplicate the active animation frame.");
    this.setControlDisabled(this.elements.frameEarlierButton, !hasFrame || isLocked || frameIndex <= 0, isLocked ? lockedReason : (hasFrame ? "Disabled because the selected frame is already first." : noFrameReason), "Move the selected frame earlier.");
    this.setControlDisabled(this.elements.frameLaterButton, !hasFrame || isLocked || frameIndex >= frames.length - 1, isLocked ? lockedReason : (hasFrame ? "Disabled because the selected frame is already last." : noFrameReason), "Move the selected frame later.");
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
