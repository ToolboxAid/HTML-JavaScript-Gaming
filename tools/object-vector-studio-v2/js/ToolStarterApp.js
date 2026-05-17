import { ObjectVectorRuntimeAssetService } from "../../../src/engine/rendering/index.js";

const WORKSPACE_TOOL_SESSION_KEY = "workspace.tools.object-vector-studio-v2";
const WORKSPACE_PALETTE_SESSION_KEY = "workspace.tools.palette-manager-v2";
const RUNTIME_PALETTE_SESSION_KEY = "object-vector-studio-v2.runtimePalette";
const TOOL_DISPLAY_MODE_KEY = "object-vector-studio-v2.toolDisplayMode";
const SNAP_MODE_SESSION_KEY = "object-vector-studio-v2.snapMode";
const ANGLE_SNAP_SESSION_KEY = "object-vector-studio-v2.angleSnap";
const ANGLE_SNAP_STEP_SESSION_KEY = "object-vector-studio-v2.angleSnapStep";
const GRID_RENDER_SESSION_KEY = "object-vector-studio-v2.gridRender";
const CENTER_ORIGIN_SESSION_KEY = "object-vector-studio-v2.centerOrigin";
const SVG_NS = "http://www.w3.org/2000/svg";
const DEFAULT_VIEWPORT = Object.freeze({ height: 220, width: 320, x: 0, y: 0, zoom: 0.1 });
const GRID_STEP = 10;
const OBJECT_PREVIEW_DRAWING_SCALE = GRID_STEP;
const MAX_ZOOM = 0.5;
const MIN_ZOOM = 0.01;
const ZOOM_STEP = 0.01;
const TRANSPARENT_STYLE_COLOR = "#00000000";
const PREVIEW_HISTORY_LIMIT = 50;
const SNAP_MODES = Object.freeze(["grid", "point", "none"]);
const ANGLE_SNAP_STEPS = Object.freeze([15, 30, 45, 90]);
const POINT_SNAP_RADIUS = 1.5;
const SNAP_MODE_DETAILS = Object.freeze({
  grid: {
    iconKey: "snapGrid",
    label: "Snap Grid",
    title: "Snap drawing and point dragging to grid intersections"
  },
  none: {
    iconKey: "snapNone",
    label: "Snap None",
    title: "Disable drawing and point-drag snapping"
  },
  point: {
    iconKey: "snapPoint",
    label: "Snap Point",
    title: "Snap drawing and point dragging to visible shape points"
  }
});

const objectVectorStudioIcon = (name, glyph) => Object.freeze({ glyph, name });

const OBJECT_VECTOR_STUDIO_ICON_GLYPHS = Object.freeze({
  add: objectVectorStudioIcon("nf-fa-plus", "\uf067"),
  angle: objectVectorStudioIcon("nf-md-angle_acute", "\u{f0937}"),
  arc: objectVectorStudioIcon("nf-md-vector_radius", "\u{f074a}"),
  bri: objectVectorStudioIcon("nf-fa-sun_o", "\uf185"),
  bringForward: objectVectorStudioIcon("nf-fa-arrow_up", "\uf062"),
  bringFront: objectVectorStudioIcon("nf-fa-angle_double_up", "\uf102"),
  center: objectVectorStudioIcon("nf-fa-dot_circle_o", "\uf192"),
  circle: objectVectorStudioIcon("nf-md-vector_circle_variant", "\u{f0557}"),
  copy: objectVectorStudioIcon("nf-fa-copy", "\uf0c5"),
  delete: objectVectorStudioIcon("nf-md-trash_can_outline", "\u{f0a7a}"),
  duplicate: objectVectorStudioIcon("nf-fa-copy", "\uf0c5"),
  edit: objectVectorStudioIcon("nf-fa-pencil_square_o", "\uf044"),
  ellipse: objectVectorStudioIcon("nf-md-vector_ellipse", "\u{f0893}"),
  eye: objectVectorStudioIcon("nf-fa-eye", "\uf06e"),
  eyeOff: objectVectorStudioIcon("nf-fa-eye_slash", "\uf070"),
  grid: objectVectorStudioIcon("nf-md-grid", "\u{f02c1}"),
  gridOff: objectVectorStudioIcon("nf-md-grid_off", "\u{f02c2}"),
  polyline: objectVectorStudioIcon("nf-md-vector_polyline", "\u{f0561}"),
  snapGrid: objectVectorStudioIcon("nf-md-grid_large", "\u{f0758}"),
  snapNone: objectVectorStudioIcon("nf-fa-not_equal", "\u{efcb}"),
  snapPoint: objectVectorStudioIcon("nf-md-vector_point", "\u{f055f}"),
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
  paste: objectVectorStudioIcon("nf-oct-paste", "\uf0ea"),
  picker: objectVectorStudioIcon("nf-fa-eye_dropper", "\uf1fb"),
  polygon: objectVectorStudioIcon("nf-md-vector_polygon", "\u{f0560}"),
  rectangle: objectVectorStudioIcon("nf-md-vector_rectangle", "\u{f05c6}"),
  redo: objectVectorStudioIcon("nf-md-redo", "\u{f044e}"),
  reset: objectVectorStudioIcon("nf-fa-undo", "\uf0e2"),
  resize: objectVectorStudioIcon("nf-md-resize", "\u{f0a68}"),
  rotate: objectVectorStudioIcon("nf-fa-repeat", "\uf01e"),
  sat: objectVectorStudioIcon("nf-fa-tint", "\uf043"),
  scale: objectVectorStudioIcon("nf-fa-scale_unbalanced", "\u{eddf}"),
  select: objectVectorStudioIcon("nf-md-select", "\u{f0485}"),
  sendBack: objectVectorStudioIcon("nf-fa-angle_double_down", "\uf103"),
  sendBackward: objectVectorStudioIcon("nf-fa-arrow_down", "\uf063"),
  stroke: objectVectorStudioIcon("nf-fa-pencil", "\uf040"),
  square: objectVectorStudioIcon("nf-fa-vector_square", "\u{ee92}"),
  tag: objectVectorStudioIcon("nf-fa-tag", "\uf02b"),
  text: objectVectorStudioIcon("nf-fa-font", "\uf031"),
  triangle: objectVectorStudioIcon("nf-md-vector_triangle", "\u{f0563}"),
  ungroup: objectVectorStudioIcon("nf-fa-object_ungroup", "\uf248"),
  undo: objectVectorStudioIcon("nf-md-undo", "\u{f054c}"),
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
  [".object-vector-studio-v2__palette-sort [data-palette-sort='tag']", "tag"],
  ["#objectVectorStudioV2ZoomOutButton", "zoomOut"],
  ["#objectVectorStudioV2ZoomInButton", "zoomIn"],
  ["#objectVectorStudioV2PanUpButton", "panUp"],
  ["#objectVectorStudioV2PanDownButton", "panDown"],
  ["#objectVectorStudioV2PanLeftButton", "panLeft"],
  ["#objectVectorStudioV2PanRightButton", "panRight"],
  ["#objectVectorStudioV2ResetViewButton", "reset"],
  ["#objectVectorStudioV2CenterDotButton", "center"],
  ["#objectVectorStudioV2FrameLeftButton", "panLeft"],
  ["#objectVectorStudioV2FrameEarlierButton", "panLeft"],
  ["#objectVectorStudioV2DuplicateFrameButton", "duplicate"],
  ["#objectVectorStudioV2FrameLaterButton", "panRight"],
  ["#objectVectorStudioV2FrameRightButton", "panRight"],
  ["#objectVectorStudioV2DeleteFrameButton", "delete"],
  ["#objectVectorStudioV2PreviewUndoButton", "undo"],
  ["#objectVectorStudioV2PreviewRedoButton", "redo"],
  ["#objectVectorStudioV2PreviewCopyButton", "copy"],
  ["#objectVectorStudioV2PreviewPasteButton", "paste"],
  ["#objectVectorStudioV2AngleSnapButton", "angle"],
  ["#objectVectorStudioV2GridRenderButton", "grid"],
  [".object-vector-studio-v2__shape-icon--select", "select"],
  [".object-vector-studio-v2__shape-icon--triangle", "triangle"],
  [".object-vector-studio-v2__shape-icon--rectangle", "rectangle"],
  [".object-vector-studio-v2__shape-icon--square", "square"],
  [".object-vector-studio-v2__shape-icon--circle", "circle"],
  [".object-vector-studio-v2__shape-icon--ellipse", "ellipse"],
  [".object-vector-studio-v2__shape-icon--line", "line"],
  [".object-vector-studio-v2__shape-icon--picker", "picker"],
  [".object-vector-studio-v2__shape-icon--polygon", "polygon"],
  [".object-vector-studio-v2__shape-icon--polyline", "polyline"],
  [".object-vector-studio-v2__shape-icon--arc", "arc"],
  [".object-vector-studio-v2__shape-icon--text", "text"],
  [".object-vector-studio-v2__z-icon--bring-forward", "bringForward"],
  [".object-vector-studio-v2__z-icon--send-backward", "sendBackward"],
  [".object-vector-studio-v2__z-icon--bring-front", "bringFront"],
  [".object-vector-studio-v2__z-icon--send-back", "sendBack"],
  [".object-vector-studio-v2__z-icon--group", "group"],
  [".object-vector-studio-v2__z-icon--ungroup", "ungroup"]
]);

const OBJECT_STATE_IDS = Object.freeze(["idle", "move", "active", "inactive", "damaged", "destroyed"]);

const OBJECT_STATE_LABELS = Object.freeze({
  active: "Active",
  damaged: "Damaged",
  destroyed: "Destroyed",
  idle: "Idle",
  inactive: "Inactive",
  move: "Move"
});

const OBJECT_STATE_HELP = Object.freeze({
  active: ["Object is enabled and participating in gameplay.", "Typically the default active runtime state."],
  damaged: ["Object is visually damaged but still active."],
  destroyed: ["Object destruction/death state.", "Usually final or transitional before removal."],
  idle: ["Default stationary state.", "No movement or action animation active."],
  inactive: ["Object is disabled, hidden, sleeping, or not participating in gameplay."],
  move: ["Movement/action state.", "Used for thrusting, walking, flying, or active movement visuals."]
});

const GROUP_COLOR_SWATCHES = Object.freeze(["#22d3ee", "#a78bfa", "#fb7185", "#34d399", "#fbbf24", "#60a5fa", "#f472b6", "#4ade80"]);

const SHAPE_TYPE_DETAILS = Object.freeze({
  arc: "Arc primitive metadata with center, radius, and angle span.",
  circle: "Circle primitive metadata with center point and radius.",
  ellipse: "Ellipse primitive metadata with center point and radius pair.",
  line: "Line primitive metadata with start and end points.",
  polygon: "Polygon primitive metadata with ordered point ownership.",
  polyline: "Polyline primitive metadata with ordered open point ownership.",
  rectangle: "Rectangle primitive metadata with position and dimensions.",
  square: "Square tool metadata backed by rectangle geometry with equal width and height.",
  text: "Text primitive metadata with position, font size, and content."
});

const PRIMITIVE_TOOLS = Object.freeze(["triangle", "rectangle", "square", "circle", "ellipse", "line", "polygon", "polyline", "arc", "text"]);
const POINT_STYLE_VALUES = Object.freeze(["round", "square"]);
const OPEN_POINT_STYLE_TOOLS = Object.freeze(new Set(["line", "polyline", "arc"]));
const CLOSED_POINT_STYLE_TOOLS = Object.freeze(new Set(["polygon", "rectangle"]));
const OBJECT_ID_SIZE_WORDS = Object.freeze(new Set(["large", "medium", "small"]));
const OBJECT_ID_ORDERED_NOUNS = Object.freeze(new Set(["asteroid", "ufo"]));

function shapeTool(shape) {
  return String(shape?.tool || "").trim().toLowerCase();
}

function shapeGeometryTool(shape) {
  const tool = shapeTool(shape);
  if (tool === "triangle") {
    return "polygon";
  }
  if (tool === "square") {
    return "rectangle";
  }
  return tool;
}

function shapeTypeLabel(shapeOrTool) {
  const tool = typeof shapeOrTool === "string" ? shapeOrTool : shapeTool(shapeOrTool);
  return tool.replace(/(^|-)([a-z])/g, (match) => match.toUpperCase()).replaceAll("-", " ");
}

function shapeDisplayLabel(shape) {
  return shapeTypeLabel(shape);
}

function shapeCountLabel(count) {
  return `${count} ${count === 1 ? "shape" : "shapes"}`;
}

function normalizeShapeIndex(value) {
  const index = Number(value);
  return Number.isInteger(index) && index >= 0 ? index : -1;
}

function linePoint(geometry, pointKey) {
  return geometry?.[pointKey];
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

function canonicalObjectSlug(name, gameKey = "") {
  const gameWords = slugifyObjectName(gameKey).split("-").filter(Boolean);
  let words = slugifyObjectName(name).split("-").filter(Boolean);
  if (gameWords.length && gameWords.every((word, index) => words[index] === word)) {
    words = words.slice(gameWords.length);
  }
  words = words.filter((word, index) => index === 0 || word !== words[index - 1]);
  if (words.length === 2 && OBJECT_ID_ORDERED_NOUNS.has(words[0]) && OBJECT_ID_SIZE_WORDS.has(words[1])) {
    words = [words[1], words[0]];
  }
  if (words.length > 2 && words.at(-1) === "1" && OBJECT_ID_ORDERED_NOUNS.has(words.at(-2))) {
    words = words.slice(0, -1);
  }
  return words.join("-") || "object";
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

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
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
  const geometryTool = shapeGeometryTool(shape);
  if (geometryTool === "rectangle") {
    return {
      height: shape.geometry.height,
      width: shape.geometry.width,
      x: shape.geometry.x,
      y: shape.geometry.y
    };
  }
  if (geometryTool === "circle") {
    return {
      height: shape.geometry.r * 2,
      width: shape.geometry.r * 2,
      x: shape.geometry.cx - shape.geometry.r,
      y: shape.geometry.cy - shape.geometry.r
    };
  }
  if (geometryTool === "ellipse") {
    return {
      height: shape.geometry.ry * 2,
      width: shape.geometry.rx * 2,
      x: shape.geometry.cx - shape.geometry.rx,
      y: shape.geometry.cy - shape.geometry.ry
    };
  }
  if (geometryTool === "line") {
    const point1 = linePoint(shape.geometry, "point1");
    const point2 = linePoint(shape.geometry, "point2");
    const x = Math.min(point1.x, point2.x);
    const y = Math.min(point1.y, point2.y);
    return {
      height: Math.max(1, Math.abs(point2.y - point1.y)),
      width: Math.max(1, Math.abs(point2.x - point1.x)),
      x,
      y
    };
  }
  if (geometryTool === "polygon" || geometryTool === "polyline") {
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
  if (geometryTool === "arc") {
    return {
      height: shape.geometry.r * 2,
      width: shape.geometry.r * 2,
      x: shape.geometry.cx - shape.geometry.r,
      y: shape.geometry.cy - shape.geometry.r
    };
  }
  if (geometryTool === "text") {
    return {
      height: shape.geometry.fontSize,
      width: Math.max(24, shape.geometry.text.length * shape.geometry.fontSize * 0.6),
      x: shape.geometry.x,
      y: shape.geometry.y - shape.geometry.fontSize
    };
  }
  throw new Error(`unsupported shape bounds for ${shapeTool(shape)}`);
}

function boundsCornerPoints(bounds) {
  return [
    { x: bounds.x, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    { x: bounds.x, y: bounds.y + bounds.height }
  ];
}

function ellipseSamplePoints(cx, cy, rx, ry, sampleCount = 64) {
  return Array.from({ length: sampleCount }, (_, index) => {
    const radians = (index / sampleCount) * Math.PI * 2;
    return {
      x: cx + Math.cos(radians) * rx,
      y: cy + Math.sin(radians) * ry
    };
  });
}

function arcSamplePoints(geometry, sampleCount = 32) {
  const startAngle = geometry.startAngle;
  const endAngle = geometry.endAngle;
  const span = endAngle - startAngle;
  const steps = Math.max(1, Math.ceil(Math.abs(span) / (360 / sampleCount)));

  return Array.from({ length: steps + 1 }, (_, index) => {
    const angle = startAngle + (span * index) / steps;
    const radians = ((angle - 90) * Math.PI) / 180;
    return {
      x: geometry.cx + Math.cos(radians) * geometry.r,
      y: geometry.cy + Math.sin(radians) * geometry.r
    };
  });
}

function shapeBoundsPoints(shape) {
  const geometryTool = shapeGeometryTool(shape);
  if (geometryTool === "line") {
    return [linePoint(shape.geometry, "point1"), linePoint(shape.geometry, "point2")].filter(Boolean);
  }
  if (geometryTool === "polygon" || geometryTool === "polyline") {
    return Array.isArray(shape.geometry.points) ? shape.geometry.points : [];
  }
  if (geometryTool === "circle") {
    return ellipseSamplePoints(shape.geometry.cx, shape.geometry.cy, shape.geometry.r, shape.geometry.r);
  }
  if (geometryTool === "ellipse") {
    return ellipseSamplePoints(shape.geometry.cx, shape.geometry.cy, shape.geometry.rx, shape.geometry.ry);
  }
  if (geometryTool === "arc") {
    return arcSamplePoints(shape.geometry);
  }
  return boundsCornerPoints(shapeBounds(shape));
}

function defaultShapeTransform(shape) {
  const bounds = shapeBounds(shape);
  return {
    shapeOrigin: {
      x: Number((bounds.x + bounds.width / 2).toFixed(3)),
      y: Number((bounds.y + bounds.height / 2).toFixed(3))
    },
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
    this.selectedShapeIndex = -1;
    this.selectedShapeIndexes = new Set();
    this.directSelectedShapeIndexes = new Set();
    this.selectedStateId = "";
    this.selectedFrameId = "";
    this.playbackTimerId = 0;
    this.isAnimationPlaying = false;
    this.activeTool = "select";
    this.paletteTarget = "paint";
    this.paletteSortMode = "name";
    this.paletteSortDirection = "asc";
    this.selectedFillColor = "#ffffff";
    this.selectedStrokeColor = "#000000";
    this.selectedFillLabel = "default fill";
    this.selectedStrokeLabel = "default stroke";
    this.selectedFillOpacity = 1;
    this.selectedStrokeOpacity = 1;
    this.isPaintDragging = false;
    this.activeDrawing = null;
    this.drawingPreviewPoint = null;
    this.drawingHintClientPoint = null;
    this.previewClipboardShape = null;
    this.previewUndoStack = [];
    this.previewRedoStack = [];
    this.previewPointerEdit = null;
    this.transformInputValues = new Map();
    this.stateControlStateId = "";
    this.pendingAddObjectClick = false;
    this.hiddenObjectIds = new Set();
    this.lockedObjectIds = new Set();
    this.snapMode = this.readSnapMode();
    this.angleSnapEnabled = false;
    this.angleSnapStep = 15;
    this.gridRenderEnabled = true;
    this.centerOriginVisible = this.window.sessionStorage?.getItem(CENTER_ORIGIN_SESSION_KEY) !== "0";
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
    this.bindPreviewEditActions();
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
    this.statusLog.write("INFO Tools primitive buttons enter drawing mode; use the canvas to commit schema-valid geometry.");
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
    this.elements.deleteFrameButton.addEventListener("click", () => this.deleteSelectedFrame());
    this.elements.duplicateFrameButton.addEventListener("click", () => this.duplicateSelectedFrame());
    this.elements.frameLeftButton.addEventListener("click", () => this.moveSelectedFrame("earlier", "left"));
    this.elements.frameEarlierButton.addEventListener("click", () => this.moveSelectedFrame("earlier", "earlier"));
    this.elements.frameLaterButton.addEventListener("click", () => this.moveSelectedFrame("later", "later"));
    this.elements.frameRightButton.addEventListener("click", () => this.moveSelectedFrame("later", "right"));
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
        this.setPaletteTarget("stroke", false);
        if (PRIMITIVE_TOOLS.includes(tool)) {
          this.startDrawingMode(tool);
          return;
        }
        this.cancelActiveDrawing("tool switch", { log: false });
        this.activeTool = tool;
        if (tool === "select" && this.selectedShapeIndex >= 0) {
          const clearedShape = this.selectedShapeIndex;
          this.selectedShapeIndex = -1;
          this.selectedShapeIndexes.clear();
          this.directSelectedShapeIndexes.clear();
          this.renderObjectTiles();
          this.renderSelectedObject();
          this.renderWorkSurface();
          this.updateObjectActionState();
          this.statusLog.write(`OK Select tool cleared selected shape row ${clearedShape}.`);
          return;
        }
        this.statusLog.write(`OK Tools mode selected: ${tool}.`);
      });
    });
  }

  bindSnapControls() {
    this.elements.snapModeButton.addEventListener("click", () => this.cycleSnapMode());
    this.elements.angleSnapButton.addEventListener("click", () => {
      this.angleSnapEnabled = !this.angleSnapEnabled;
      this.window.sessionStorage?.setItem(ANGLE_SNAP_SESSION_KEY, this.angleSnapEnabled ? "1" : "0");
      this.applySnapState();
      this.statusLog.write(`OK Snap angle ${this.angleSnapEnabled ? "enabled" : "disabled"}: Rotate action ${this.angleSnapEnabled ? `uses dropdown values in ${this.angleSnapStep} degree increments` : "uses raw numeric textbox values"}.`);
    });
    this.elements.gridRenderButton.addEventListener("click", () => {
      this.gridRenderEnabled = !this.gridRenderEnabled;
      this.window.sessionStorage?.setItem(GRID_RENDER_SESSION_KEY, this.gridRenderEnabled ? "1" : "0");
      this.applySnapState();
      this.renderWorkSurface();
      this.statusLog.write(`OK Grid rendering ${this.gridRenderEnabled ? "enabled" : "disabled"}.`);
    });
    this.elements.centerDotButton.addEventListener("click", () => this.toggleCenterOriginMarker());
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
    [
      this.elements.fillOpacity,
      this.elements.strokeOpacity
    ].forEach((input) => input.addEventListener("input", () => this.clearInputValidity(input)));
    this.elements.fillOpacity.addEventListener("change", () => this.changePaletteOpacity("fill"));
    this.elements.strokeOpacity.addEventListener("change", () => this.changePaletteOpacity("stroke"));
    this.elements.paletteSortButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const nextSortMode = button.dataset.paletteSort || "name";
        if (this.paletteSortMode === nextSortMode) {
          this.paletteSortDirection = this.paletteSortDirection === "asc" ? "desc" : "asc";
        } else {
          this.paletteSortMode = nextSortMode;
          this.paletteSortDirection = "asc";
        }
        this.updatePaletteSortButtons();
        if (this.runtimePalette) {
          this.renderPalette();
        }
        this.statusLog.write(`OK Palette sort set to ${this.paletteSortMode} ${this.paletteSortDirection}.`);
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
    this.updatePaletteModeSwatches();
    if (this.runtimePalette) {
      this.renderPalette();
    }
    if (shouldLog) {
      this.cancelActiveDrawing("palette mode change", { log: false });
      this.activeTool = this.paletteTarget === "stroke" ? "stroke" : "paint";
      this.setActiveToolButton(null);
      this.statusLog.write(`OK Palette target set to ${this.paletteTarget === "stroke" ? "Stroke" : "Paint"}.`);
    }
  }

  updatePaletteSortButtons() {
    this.elements.paletteSortButtons.forEach((button) => {
      const isActive = button.dataset.paletteSort === this.paletteSortMode;
      const baseLabel = button.dataset.paletteSortLabel || button.textContent.replace(/[▲▼]\s*$/u, "").trim() || shapeTypeLabel(button.dataset.paletteSort || "name");
      button.dataset.paletteSortLabel = baseLabel;
      button.dataset.sortDirection = isActive ? this.paletteSortDirection : "";
      button.textContent = "";
      const label = document.createElement("span");
      label.textContent = baseLabel;
      button.append(label);
      const caret = document.createElement("span");
      caret.className = "object-vector-studio-v2__palette-sort-caret";
      caret.setAttribute("aria-hidden", "true");
      caret.textContent = isActive ? (this.paletteSortDirection === "asc" ? "▲" : "▼") : "◇";
      button.append(caret);
      button.setAttribute("aria-pressed", String(isActive));
      button.setAttribute("aria-label", `${baseLabel} sort ${isActive ? this.paletteSortDirection : "inactive"}`);
      button.title = isActive ? `Sort ${baseLabel} ${this.paletteSortDirection === "asc" ? "ascending" : "descending"}` : `Sort ${baseLabel} ascending`;
      button.classList.toggle("is-active", isActive);
    });
  }

  updatePaletteModeSwatches() {
    this.elements.paintModeButton.style.setProperty("--object-vector-studio-v2-mode-swatch", this.selectedFillColor);
    this.elements.paintModeButton.style.setProperty("--object-vector-studio-v2-mode-opacity", String(this.selectedFillOpacity));
    this.elements.strokeModeButton.style.setProperty("--object-vector-studio-v2-mode-swatch", this.selectedStrokeColor);
    this.elements.strokeModeButton.style.setProperty("--object-vector-studio-v2-mode-opacity", String(this.selectedStrokeOpacity));
    this.elements.paintModeButton.dataset.paletteModeColor = this.selectedFillColor;
    this.elements.paintModeButton.dataset.paletteModeOpacity = String(this.selectedFillOpacity);
    this.elements.strokeModeButton.dataset.paletteModeColor = this.selectedStrokeColor;
    this.elements.strokeModeButton.dataset.paletteModeOpacity = String(this.selectedStrokeOpacity);
  }

  pointStyleValue(value) {
    return POINT_STYLE_VALUES.includes(value) ? value : "square";
  }

  strokeLinejoinValue(value = "round") {
    return this.pointStyleValue(value) === "square" ? "miter" : "round";
  }

  supportsOpenPointStyle(shape) {
    return OPEN_POINT_STYLE_TOOLS.has(shapeGeometryTool(shape));
  }

  supportsClosedPointStyle(shape) {
    return CLOSED_POINT_STYLE_TOOLS.has(shapeGeometryTool(shape));
  }

  shapeSupportsPointRoundingControls(shape) {
    const geometryTool = shapeGeometryTool(shape);
    return !["circle", "ellipse", "text"].includes(geometryTool) && this.shapeGeometryPointCount(shape) > 0;
  }

  shapeSupportsRoundingRadiusControl(shape) {
    return ["polygon", "polyline", "rectangle"].includes(shapeGeometryTool(shape)) && this.shapeGeometryPointCount(shape) > 0;
  }

  shapeRoundingRadius(shape) {
    const value = Number(shape?.style?.roundingRadius);
    if (Number.isFinite(value) && value >= 0) {
      return value;
    }
    return 4;
  }

  shapeUnifiedPointStyle(shape) {
    const pointStyles = this.shapePointStyleValues(shape);
    if (pointStyles.length) {
      const geometryTool = shapeGeometryTool(shape);
      if (geometryTool === "polygon" || geometryTool === "polyline" || geometryTool === "rectangle") {
        return "square";
      }
      return this.pointStyleValue(shape?.style?.pointStyle ?? shape?.style?.strokeLinecap);
    }
    return this.pointStyleValue(shape?.style?.pointStyle ?? shape?.style?.strokeLinecap);
  }

  shapeStartPointStyle(shape) {
    const pointStyles = this.shapePointStyleValues(shape);
    if (pointStyles.length) {
      return pointStyles[0];
    }
    return this.pointStyleValue(shape?.style?.startPointStyle ?? shape?.style?.strokeLinecap ?? shape?.style?.pointStyle);
  }

  shapeEndPointStyle(shape) {
    const pointStyles = this.shapePointStyleValues(shape);
    if (pointStyles.length) {
      return pointStyles.at(-1);
    }
    return this.pointStyleValue(shape?.style?.endPointStyle ?? shape?.style?.strokeLinecap ?? shape?.style?.pointStyle);
  }

  openShapeUsesSplitPointStyles(shape) {
    return this.supportsOpenPointStyle(shape) && this.shapeStartPointStyle(shape) !== this.shapeEndPointStyle(shape);
  }

  shapeGeometryPointCount(shape) {
    return this.shapeGeometryPoints(shape).length;
  }

  shapeGeometryPoints(shape) {
    const geometryTool = shapeGeometryTool(shape);
    if (geometryTool === "line") {
      return [linePoint(shape.geometry, "point1"), linePoint(shape.geometry, "point2")];
    }
    if (geometryTool === "arc") {
      return [
        this.polarPoint(shape.geometry.cx, shape.geometry.cy, shape.geometry.r, shape.geometry.startAngle),
        this.polarPoint(shape.geometry.cx, shape.geometry.cy, shape.geometry.r, shape.geometry.endAngle)
      ];
    }
    if (geometryTool === "rectangle") {
      const x = Number(shape.geometry.x) || 0;
      const y = Number(shape.geometry.y) || 0;
      const width = Number(shape.geometry.width) || 0;
      const height = Number(shape.geometry.height) || 0;
      return [
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height }
      ];
    }
    if ((geometryTool === "polygon" || geometryTool === "polyline") && Array.isArray(shape?.geometry?.points)) {
      return shape.geometry.points;
    }
    return [];
  }

  shapePointRoundingValues(shape) {
    const pointCount = this.shapeGeometryPointCount(shape);
    if (!pointCount) {
      return [];
    }
    const explicit = Array.isArray(shape?.style?.pointRounding) ? shape.style.pointRounding : null;
    if (explicit) {
      return Array.from({ length: pointCount }, (_, index) => explicit[index] === true);
    }
    const geometryTool = shapeGeometryTool(shape);
    if (geometryTool === "polygon" || geometryTool === "rectangle") {
      return Array.from({ length: pointCount }, () => false);
    }
    return Array.from({ length: pointCount }, (_, index) => {
      if (geometryTool === "line" || geometryTool === "polyline") {
        if (index === 0) {
          return this.pointStyleValue(shape?.style?.startPointStyle ?? shape?.style?.strokeLinecap ?? shape?.style?.pointStyle) === "round";
        }
        if (index === pointCount - 1) {
          return this.pointStyleValue(shape?.style?.endPointStyle ?? shape?.style?.strokeLinecap ?? shape?.style?.pointStyle) === "round";
        }
        if (geometryTool === "polyline") {
          return false;
        }
      }
      return this.pointStyleValue(shape?.style?.pointStyle ?? shape?.style?.strokeLinecap) === "round";
    });
  }

  shapePointStyleValues(shape) {
    return this.shapePointRoundingValues(shape).map((isRounded) => isRounded ? "round" : "square");
  }

  shapeJoinPointIndexes(shape, pointCount = this.shapeGeometryPointCount(shape)) {
    const geometryTool = shapeGeometryTool(shape);
    if (geometryTool === "polyline") {
      return Array.from({ length: Math.max(0, pointCount - 2) }, (_, index) => index + 1);
    }
    if (geometryTool === "polygon") {
      return Array.from({ length: pointCount }, (_, index) => index);
    }
    return [];
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
    this.elements.renderSurface.addEventListener("pointerdown", (event) => this.handleRenderSurfacePointerDown(event));
    this.elements.renderSurface.addEventListener("contextmenu", (event) => event.preventDefault());
    this.elements.renderSurface.addEventListener("dblclick", (event) => this.finishMultiPointDrawing("double-click", event));
    this.window.addEventListener("pointermove", (event) => this.updatePreviewPointerEdit(event));
    this.window.addEventListener("pointermove", (event) => this.updateDrawingPreview(event));
    this.elements.renderSurface.addEventListener("wheel", (event) => {
      event.preventDefault();
      this.zoomViewportByStepAtPointer(event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP, event);
    }, { passive: false });
    this.window.addEventListener("pointerup", (event) => {
      this.isPaintDragging = false;
      this.finishPreviewPointerEdit(event);
    });
  }

  bindPreviewEditActions() {
    this.elements.previewUndoButton.addEventListener("click", () => this.undoPreviewEdit());
    this.elements.previewRedoButton.addEventListener("click", () => this.redoPreviewEdit());
    this.elements.previewCopyButton.addEventListener("click", () => this.copyPreviewSelection());
    this.elements.previewPasteButton.addEventListener("click", () => this.pastePreviewClipboard());
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
      if (event.key === "Enter" && this.activeDrawing) {
        event.preventDefault();
        this.finishMultiPointDrawing("Enter", event);
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
        this.activateToolMode("picker", "keyboard");
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
    this.snapMode = this.readSnapMode();
    this.angleSnapEnabled = this.window.sessionStorage?.getItem(ANGLE_SNAP_SESSION_KEY) === "1";
    this.angleSnapStep = this.readAngleSnapStep();
    this.gridRenderEnabled = this.window.sessionStorage?.getItem(GRID_RENDER_SESSION_KEY) !== "0";
    this.centerOriginVisible = this.window.sessionStorage?.getItem(CENTER_ORIGIN_SESSION_KEY) !== "0";
    const snapDetails = SNAP_MODE_DETAILS[this.snapMode] || SNAP_MODE_DETAILS.grid;
    this.elements.snapModeButton.textContent = snapDetails.label;
    this.elements.snapModeButton.dataset.snapMode = this.snapMode;
    this.elements.snapModeButton.setAttribute("aria-label", snapDetails.label);
    this.elements.snapModeButton.setAttribute("aria-pressed", String(this.snapMode !== "none"));
    this.elements.snapModeButton.title = snapDetails.title;
    this.applyIconGlyph(this.elements.snapModeButton, snapDetails.iconKey);
    this.elements.renderSurface.classList.toggle("is-snap-point-mode", this.snapMode === "point");
    this.elements.angleSnapButton.setAttribute("aria-pressed", String(this.angleSnapEnabled));
    this.elements.angleSnapButton.textContent = "Snap Angle";
    this.elements.angleSnapButton.setAttribute("aria-label", "Snap Angle for Shape/Object Rotate");
    this.elements.angleSnapButton.title = "Snap Angle switches Rotate to a constrained dropdown using the selected 15, 30, 45, or 90 degree step.";
    this.elements.gridRenderButton.setAttribute("aria-pressed", String(this.gridRenderEnabled));
    this.applyIconGlyph(this.elements.gridRenderButton, this.gridRenderEnabled ? "grid" : "gridOff");
    this.elements.centerDotButton.setAttribute("aria-pressed", String(this.centerOriginVisible));
    this.elements.renderSurface.classList.toggle("is-grid-visible", this.gridRenderEnabled);
    this.updateRotateSnapControls();
  }

  updateRotateSnapControls(scope = this.window.document) {
    const root = scope || this.window.document;
    [
      {
        inputId: "objectVectorStudioV2RotateInput",
        selectId: "objectVectorStudioV2RotateSnapSelect",
        stepId: "objectVectorStudioV2SnapAngleStepSelect"
      },
      {
        inputId: "objectVectorStudioV2ObjectRotateInput",
        selectId: "objectVectorStudioV2ObjectRotateSnapSelect",
        stepId: "objectVectorStudioV2ObjectSnapAngleStepSelect"
      }
    ].forEach(({ inputId, selectId, stepId }) => {
      const numericInput = root.querySelector?.(`#${inputId}`) || this.window.document.getElementById(inputId);
      const snapSelect = root.querySelector?.(`#${selectId}`) || this.window.document.getElementById(selectId);
      const stepSelect = root.querySelector?.(`#${stepId}`) || this.window.document.getElementById(stepId);
      if (!numericInput && !snapSelect && !stepSelect) {
        return;
      }
      const row = (numericInput || snapSelect || stepSelect)?.closest?.(".object-vector-studio-v2__transform-control-row--rotate") || null;
      const panelDisabled = row?.closest?.(".object-vector-studio-v2__shape-panel")?.classList.contains("is-disabled") === true;
      row?.classList.toggle("is-angle-snap-enabled", this.angleSnapEnabled);
      if (stepSelect) {
        stepSelect.value = String(this.angleSnapStep);
        stepSelect.disabled = panelDisabled || !this.angleSnapEnabled;
        stepSelect.hidden = !this.angleSnapEnabled;
        const stepField = stepSelect.closest(".object-vector-studio-v2__snap-angle-step-field");
        if (stepField) {
          stepField.hidden = !this.angleSnapEnabled;
        }
      }
      if (snapSelect) {
        const preferred = snapSelect.value || numericInput?.value || this.transformInputValue(snapSelect.id, "15");
        this.populateRotateSnapSelect(snapSelect, this.angleSnapStep, preferred);
        snapSelect.disabled = panelDisabled || !this.angleSnapEnabled;
        snapSelect.hidden = !this.angleSnapEnabled;
      }
      if (numericInput) {
        numericInput.disabled = panelDisabled || this.angleSnapEnabled;
        numericInput.hidden = this.angleSnapEnabled;
      }
    });
  }

  populateRotateSnapSelect(select, step, preferredValue = "15") {
    if (!select) {
      return;
    }
    const normalizedStep = ANGLE_SNAP_STEPS.includes(Number(step)) ? Number(step) : 15;
    const previous = Number(preferredValue);
    const normalizedPreferred = Number.isFinite(previous)
      ? this.normalizeRotationDegrees(Math.round(previous / normalizedStep) * normalizedStep)
      : normalizedStep;
    select.replaceChildren();
    for (let value = 0; value < 360; value += normalizedStep) {
      const option = document.createElement("option");
      option.value = String(value);
      option.textContent = String(value);
      select.append(option);
    }
    select.value = Array.from(select.options).some((option) => option.value === String(normalizedPreferred))
      ? String(normalizedPreferred)
      : "0";
    this.transformInputValues.set(select.id, select.value);
  }

  readSnapMode() {
    const storedMode = this.window.sessionStorage?.getItem(SNAP_MODE_SESSION_KEY) || "grid";
    return SNAP_MODES.includes(storedMode) ? storedMode : "grid";
  }

  readAngleSnapStep() {
    const storedStep = Number(this.window.sessionStorage?.getItem(ANGLE_SNAP_STEP_SESSION_KEY) || 15);
    return ANGLE_SNAP_STEPS.includes(storedStep) ? storedStep : 15;
  }

  setSnapMode(mode, label = "") {
    if (!SNAP_MODES.includes(mode)) {
      this.statusLog.write(`WARN Snap mode skipped: ${mode || "unknown"} is not supported.`);
      return;
    }
    this.snapMode = mode;
    this.window.sessionStorage?.setItem(SNAP_MODE_SESSION_KEY, mode);
    this.applySnapState();
    this.renderWorkSurface();
    this.statusLog.write(`OK ${label || shapeTypeLabel(mode)} mode selected for drawing and point dragging.`);
  }

  cycleSnapMode() {
    const currentIndex = SNAP_MODES.indexOf(this.snapMode);
    const nextMode = SNAP_MODES[(currentIndex + 1) % SNAP_MODES.length] || "grid";
    this.setSnapMode(nextMode, SNAP_MODE_DETAILS[nextMode]?.label);
  }

  applyToolDisplayMode(mode, shouldLog) {
    const isCompact = mode === "icons";
    this.elements.toolToggleGrid.classList.toggle("is-icon-only", isCompact);
    this.elements.toolLabelModeButton.setAttribute("aria-pressed", String(isCompact));
    this.elements.toolLabelModeButton.textContent = isCompact ? "Words" : "Icons";
    this.window.sessionStorage?.setItem(TOOL_DISPLAY_MODE_KEY, isCompact ? "icons" : "words");
    if (shouldLog) {
      this.statusLog.write(`OK Tools display mode set to ${isCompact ? "compact icons" : "words and icons"}.`);
    }
  }

  setActiveToolButton(button) {
    this.elements.toolToggles.forEach((candidate) => {
      candidate.classList.toggle("is-active", candidate === button);
      candidate.setAttribute("aria-pressed", String(candidate === button));
    });
  }

  activateToolMode(tool, sourceLabel) {
    if (!PRIMITIVE_TOOLS.includes(tool)) {
      this.cancelActiveDrawing("tool mode change", { log: false });
    }
    this.activeTool = tool;
    const button = this.elements.toolToggles.find((candidate) => candidate.dataset.shapeTool === tool) || null;
    this.setActiveToolButton(button);
    if (tool === "paint") {
      this.setPaletteTarget("paint", false);
    } else if (tool === "stroke") {
      this.setPaletteTarget("stroke", false);
    } else {
      this.setPaletteTarget("stroke", false);
    }
    this.statusLog.write(`OK Tools mode selected from ${sourceLabel}: ${tool}.`);
  }

  renderEmptyState(message) {
    this.currentPayload = null;
    this.selectedObjectId = "";
    this.selectedShapeIndex = -1;
    this.selectedShapeIndexes.clear();
    this.directSelectedShapeIndexes.clear();
    this.activeDrawing = null;
    this.drawingPreviewPoint = null;
    this.activeDrawing = null;
    this.drawingPreviewPoint = null;
    this.clearPreviewEditState({ clipboard: true });
    this.selectedStateId = "";
    this.stateControlStateId = "";
    this.selectedFrameId = "";
    this.stopPlaybackTimer();
    this.updateObjectsHeader(0, 0);
    this.updatePaletteHeader(this.runtimePalette?.swatches?.length || 0);
    this.elements.objectNameInput.value = "";
    this.elements.objectTagInput.value = "";
    this.renderObjectTagList(null);
    this.elements.paletteSummary.textContent = this.runtimePalette ? "" : "Palette required before render.";
    this.elements.shapeGeometryDetails.textContent = "No object selected.";
    this.updateShapeGeometryHeader(null);
    this.elements.objectTransform.textContent = "No object selected.";
    this.elements.shapeTransform.textContent = "No shape selected.";
    this.elements.objectPreviewFooter.textContent = "Object ID: none";
    this.elements.jsonDetails.textContent = "{}";
    this.renderFrameTimeline();
    this.updateViewport();
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
    const stateCount = this.objectStates(this.selectedObject()).length;
    this.elements.objectsCount.textContent = `(${objectCount} obj, states ${stateCount}, ${shapeCount} ${shapeCount === 1 ? "shape" : "shapes"})`;
  }

  updateShapeGeometryHeader(shape) {
    this.elements.shapeGeometrySummary.textContent = "";
    if (this.elements.shapeGeometryName) {
      this.elements.shapeGeometryName.textContent = "";
    }
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
    this.statusLog.write(`OK Loaded Object Vector Studio V2 schema payload from ${sourceLabel}: ${this.currentPayload.objects.length} objects.`);
  }

  applyLoadedRuntimeState(sourceLabel) {
    const selectedObject = this.currentPayload.objects[0] || null;
    this.selectedObjectId = selectedObject?.id || "";
    const selectedShape = sortedShapes(selectedObject)[0] || null;
    this.selectedShapeIndex = selectedShape ? 0 : -1;
    this.selectedShapeIndexes = new Set(this.selectedShapeIndex >= 0 ? [this.selectedShapeIndex] : []);
    this.directSelectedShapeIndexes = new Set(this.selectedShapeIndex >= 0 ? [this.selectedShapeIndex] : []);
    const selectedState = this.objectStates(selectedObject)[0] || null;
    this.selectedStateId = selectedState?.id || "";
    this.stateControlStateId = this.selectedStateId || OBJECT_STATE_IDS[0];
    this.selectedFrameId = selectedState ? sortedFrames(selectedState)[0]?.id || "" : "";
    this.hiddenObjectIds.clear();
    this.lockedObjectIds.clear();
    this.clearPreviewEditState({ clipboard: true });
    this.activeDrawing = null;
    this.drawingPreviewPoint = null;
    this.viewport = { ...DEFAULT_VIEWPORT };
    this.updateViewport();
    if (sourceLabel) {
      this.statusLog.write(`OK Runtime selection initialized from ${sourceLabel}: ${this.selectedObjectId || "no object selected"}.`);
    }
  }

  renderPayload(options = {}) {
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
    if (options.syncPaletteSelection !== false) {
      this.syncPaletteSelectionFromCurrentShape({ render: false });
    }
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
    this.selectedShapeIndex = -1;
    this.selectedShapeIndexes.clear();
    this.directSelectedShapeIndexes.clear();
    this.selectedStateId = "";
    this.stateControlStateId = "";
    this.selectedFrameId = "";
    this.stopPlaybackTimer();
    this.updateObjectsHeader(0, 0);
    this.updatePaletteHeader(0);
    this.elements.paletteSummary.textContent = message;
    this.elements.objectNameInput.value = "";
    this.elements.objectTagInput.value = "";
    this.renderObjectTagList(null);
    this.elements.shapeGeometryDetails.textContent = "Runtime palette required before object render.";
    this.updateShapeGeometryHeader(null);
    this.elements.objectTransform.textContent = "Runtime palette required before object transform.";
    this.elements.shapeTransform.textContent = "Runtime palette required before shape transform.";
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
      item.dataset.paletteTags = tagList(swatch?.tags).join(", ");
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
      let result = 0;
      if (this.paletteSortMode === "name") {
        result = collator.compare(leftLabel, rightLabel);
      } else if (this.paletteSortMode === "tag") {
        const leftTags = tagList(left?.tags).join(", ");
        const rightTags = tagList(right?.tags).join(", ");
        if (leftTags && !rightTags) {
          return -1;
        }
        if (!leftTags && rightTags) {
          return 1;
        }
        result = collator.compare(leftTags, rightTags) || collator.compare(leftLabel, rightLabel);
      } else {
        const leftMetrics = colorMetrics(swatchColor(left));
        const rightMetrics = colorMetrics(swatchColor(right));
        result = (leftMetrics[this.paletteSortMode] - rightMetrics[this.paletteSortMode]) || collator.compare(leftLabel, rightLabel);
      }
      return this.paletteSortDirection === "desc" ? -result : result;
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
        tile.append(this.createObjectStatePanel(object), this.createObjectTileShapeList(object));
      }
      this.elements.objectTiles.append(tile);
    });
    this.restoreObjectsScroll(previousScrollTop);
  }

  renderShapeTiles(object = this.selectedObject()) {
    void object;
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

  createObjectStatePanel(object) {
    const panel = document.createElement("div");
    panel.className = "object-vector-studio-v2__object-state-panel";
    panel.addEventListener("click", (event) => event.stopPropagation());

    const controls = document.createElement("div");
    controls.className = "object-vector-studio-v2__object-state-controls";
    controls.setAttribute("aria-label", "Object state controls");

    const selectedStateId = this.stateControlSelectionId(object);
    const stateExists = this.objectStates(object).some((state) => state.id === selectedStateId);
    const isLocked = this.isObjectLocked(object.id);

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.dataset.objectStateAction = "add";
    addButton.textContent = "Add";
    addButton.title = stateExists ? "Selected state already exists." : `Add ${selectedStateId} state`;
    addButton.disabled = isLocked || stateExists || !OBJECT_STATE_IDS.includes(selectedStateId);
    addButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.createSelectedState(selectedStateId);
    });

    const select = document.createElement("select");
    select.dataset.objectStateSelect = object.id;
    select.setAttribute("aria-label", "State");
    OBJECT_STATE_IDS.forEach((stateId) => {
      const option = document.createElement("option");
      option.value = stateId;
      option.textContent = stateId;
      select.append(option);
    });
    select.value = selectedStateId;
    select.addEventListener("change", (event) => {
      event.stopPropagation();
      this.stateControlStateId = select.value;
      const nextState = this.objectStates(this.selectedObject()).find((state) => state.id === select.value);
      if (nextState) {
        this.selectState(nextState.id, "state dropdown");
        return;
      }
      this.renderPayload();
      this.statusLog.write(`INFO State ${select.value} is ready to add for ${object.name}.`);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.dataset.objectStateAction = "delete";
    deleteButton.textContent = "Delete";
    deleteButton.title = stateExists ? `Delete ${selectedStateId} state` : "Selected state has not been added.";
    deleteButton.disabled = isLocked || !stateExists || this.objectStates(object).length <= 1;
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.deleteSelectedState(selectedStateId);
    });

    const helpButton = document.createElement("button");
    helpButton.className = "object-vector-studio-v2__object-state-help";
    helpButton.type = "button";
    helpButton.textContent = "?";
    const allHelpText = this.allStateHelpText();
    helpButton.title = allHelpText;
    helpButton.dataset.objectStateHelp = "all";
    helpButton.setAttribute("aria-label", `State help for all states: ${allHelpText.replace(/\s+/gu, " ")}`);

    controls.append(select, addButton, deleteButton, helpButton);
    panel.append(controls, this.createObjectStateTileList(object));
    return panel;
  }

  createObjectStateTileList(object) {
    const states = this.objectStates(object);
    const list = document.createElement("div");
    list.className = "object-vector-studio-v2__object-state-tiles";
    list.setAttribute("aria-label", "Object states");
    if (!states.length) {
      const empty = document.createElement("span");
      empty.className = "object-vector-studio-v2__shape-list-empty";
      empty.textContent = "No states.";
      list.append(empty);
      return list;
    }

    states.forEach((state) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.objectStateTile = state.id;
      button.textContent = state.id;
      button.title = `Select ${state.id} state`;
      button.setAttribute("aria-pressed", String(state.id === this.selectedStateId));
      button.classList.toggle("is-selected", state.id === this.selectedStateId);
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        this.selectState(state.id, "state tile");
      });
      list.append(button);
    });
    return list;
  }

  stateControlSelectionId(object) {
    if (OBJECT_STATE_IDS.includes(this.stateControlStateId)) {
      return this.stateControlStateId;
    }
    if (OBJECT_STATE_IDS.includes(this.selectedStateId)) {
      return this.selectedStateId;
    }
    const firstState = this.objectStates(object).find((state) => OBJECT_STATE_IDS.includes(state.id));
    return firstState?.id || OBJECT_STATE_IDS[0];
  }

  createObjectTileShapeList(object) {
    const list = document.createElement("div");
    list.className = "object-vector-studio-v2__object-tile-shapes";
    const displayedShapes = sortedShapes(object)
      .map((shape, shapeIndex) => ({ shape, shapeIndex }))
      .reverse();
    displayedShapes.forEach(({ shape, shapeIndex }) => {
      const displayShape = object.id === this.selectedObjectId ? this.effectiveShape(shape, shapeIndex) : shape;
      const row = document.createElement("div");
      row.className = "object-vector-studio-v2__object-tile-shape-row";
      row.classList.toggle("is-selected", this.selectedShapeIndexes.has(shapeIndex));
      const selectButton = document.createElement("button");
      selectButton.type = "button";
      selectButton.className = "object-vector-studio-v2__shape-select";
      selectButton.dataset.objectTileShapeIndex = String(shapeIndex);
      selectButton.setAttribute("aria-pressed", String(this.selectedShapeIndexes.has(shapeIndex)));
      const label = document.createElement("span");
      label.className = "object-vector-studio-v2__shape-select-label";
      label.textContent = `${shapeIndex}. ${shapeDisplayLabel(shape)}`;
      selectButton.append(label);
      selectButton.addEventListener("click", (event) => {
        event.stopPropagation();
        this.selectShape(shapeIndex, "object tile shape list", { additive: event.shiftKey || event.ctrlKey || event.metaKey });
      });
      const actions = document.createElement("div");
      actions.className = "object-vector-studio-v2__shape-inline-actions";
      const groupButton = this.createShapeGroupButton(shape, shapeIndex);
      const visibilityButton = document.createElement("button");
      visibilityButton.type = "button";
      visibilityButton.className = "object-vector-studio-v2__shape-inline-button object-vector-studio-v2__shape-eye-inline";
      visibilityButton.dataset.shapeVisibilityIndex = String(shapeIndex);
      visibilityButton.setAttribute("aria-label", `${displayShape.visible ? "Hide" : "Show"} shape ${shapeDisplayLabel(shape)} in the selected state/frame`);
      visibilityButton.title = "Toggle state/frame shape visibility";
      visibilityButton.append(this.createIconSpan("eye", displayShape.visible));
      visibilityButton.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });
      visibilityButton.addEventListener("click", (event) => {
        event.stopPropagation();
        this.toggleShapeVisibilityByIndex(shapeIndex, object.id);
      });
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "object-vector-studio-v2__shape-inline-button object-vector-studio-v2__shape-delete-inline";
      deleteButton.dataset.shapeDeleteIndex = String(shapeIndex);
      deleteButton.dataset.shapeDeleteObjectId = object.id;
      deleteButton.setAttribute("aria-label", `Delete shape ${shapeDisplayLabel(shape)}`);
      deleteButton.title = "Delete this base shape from every state";
      deleteButton.append(this.createIconSpan("delete", true));
      deleteButton.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });
      deleteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        this.deleteShapeByIndex(shapeIndex, "object tile shape delete", object.id);
      });
      if (groupButton) {
        actions.append(groupButton);
      }
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
    list.append(this.createSelectedShapeActions(object));
    return list;
  }

  createShapeGroupButton(shape, shapeIndex) {
    const groupId = String(shape.groupId || "").trim();
    if (!groupId) {
      return null;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "object-vector-studio-v2__shape-inline-button object-vector-studio-v2__shape-group-button";
    button.dataset.shapeGroupId = groupId;
    button.setAttribute("aria-label", `Shape group ${groupId}`);
    button.title = `Shape group ${groupId}`;
    button.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      this.selectShapeGroup(groupId, shapeIndex, "shape group icon");
    });
    button.append(this.createGroupIndicator(groupId));
    return button;
  }

  createGroupIndicator(groupId) {
    const icon = document.createElement("span");
    icon.className = "object-vector-studio-v2__shape-group-indicator object-vector-studio-v2__tile-icon object-vector-studio-v2__tile-icon--group";
    icon.style.setProperty("--object-vector-studio-v2-shape-group-color", this.groupColor(groupId));
    this.applyIconGlyph(icon, "group");
    return icon;
  }

  createSelectedShapeActions(object) {
    const actions = document.createElement("div");
    actions.className = "object-vector-studio-v2__shape-list-actions object-vector-studio-v2__z-order-actions is-icon-only";
    actions.setAttribute("aria-label", "Selected shape move and group controls");
    const shape = this.selectedShape();
    const isLocked = this.isObjectLocked(object.id);
    const noShapeReason = "Disabled until a schema-valid shape is selected.";
    [
      { action: "back", iconClass: "send-back", iconKey: "sendBack", label: "Send To Back", title: "Send selected shape to the back." },
      { action: "backward", iconClass: "send-backward", iconKey: "sendBackward", label: "Move Backward", title: "Move selected shape backward one row." },
      { action: "forward", iconClass: "bring-forward", iconKey: "bringForward", label: "Move Forward", title: "Move selected shape forward one row." },
      { action: "front", iconClass: "bring-front", iconKey: "bringFront", label: "Bring To Front", title: "Bring selected shape to the front." }
    ].forEach((definition) => {
      const button = this.createShapeActionButton(definition.label, definition.iconClass, definition.iconKey, definition.title, () => this.changeSelectedShapeOrder(definition.action));
      this.setControlDisabled(button, !shape || isLocked, isLocked ? `Disabled because ${object.name} is locked for this runtime session.` : noShapeReason, definition.title);
      actions.append(button);
    });

    const groupButton = this.createShapeActionButton("Group", "group", "group", "Group selected shapes. Shift-click shapes to select more than one.", () => this.groupSelectedShapes());
    this.setControlDisabled(
      groupButton,
      this.selectedShapeIndexes.size < 2 || isLocked,
      isLocked ? `Disabled because ${object.name} is locked for this runtime session.` : "Disabled until two or more shapes are selected. Shift-click shapes in the preview or object shape list to build a group selection.",
      "Group selected shapes. Shift-click shapes to select more than one."
    );
    actions.append(groupButton);

    const ungroupButton = this.createShapeActionButton("Ungroup", "ungroup", "ungroup", "Ungroup selected shapes.", () => this.ungroupSelectedShapes());
    const hasValidGroup = this.shapeBelongsToValidGroup(object, this.selectedShapeIndex);
    this.setControlDisabled(
      ungroupButton,
      !shape || isLocked || !hasValidGroup,
      isLocked ? `Disabled because ${object.name} is locked for this runtime session.` : "Disabled until the selected shape belongs to a group with at least two shapes.",
      "Ungroup selected shapes."
    );
    actions.append(ungroupButton);
    return actions;
  }

  createShapeActionButton(labelText, iconClass, iconKey, title, onClick) {
    const button = document.createElement("button");
    button.className = "object-vector-studio-v2__z-action";
    button.type = "button";
    button.dataset.shapeListAction = labelText.toLowerCase().replace(/\s+/gu, "-");
    button.setAttribute("aria-label", labelText);
    button.title = title;
    const icon = document.createElement("span");
    icon.className = `object-vector-studio-v2__z-icon object-vector-studio-v2__z-icon--${iconClass}`;
    icon.setAttribute("aria-hidden", "true");
    this.applyIconGlyph(icon, iconKey);
    const label = document.createElement("span");
    label.className = "object-vector-studio-v2__z-label";
    label.textContent = labelText;
    button.append(icon, label);
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      onClick();
    });
    return button;
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

  renderDependencyGraph() {
    if (!this.currentPayload) {
      this.elements.dependencyGraph.textContent = "No dependency graph loaded.";
      return;
    }
    const usageLines = this.currentPayload.objects.map((object) => `${object.id}: ${object.name}${tagList(object.tags).length ? ` [${tagList(object.tags).join(", ")}]` : ""}`);
    const graphLines = this.currentPayload.objects
      .map((object) => `${object.id}${object.baseObjectId ? ` inherits ${object.baseObjectId}` : " has no base object"}`);
    this.elements.dependencyGraph.textContent = [
      "Dependency details:",
      graphLines.join("\n") || "No objects loaded.",
      "",
      "Object tags:",
      usageLines.join("\n") || "No object tags."
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
    sortedShapes(object).filter((shape) => shape.visible).forEach((shape, shapeIndex) => {
      try {
        const element = this.createSvgShape(shape);
        element.classList.add("object-vector-studio-v2__object-thumbnail-shape");
        svg.append(element);
        this.appendShapePointStyleCaps(svg, shape);
      } catch (error) {
        this.statusLog.write(`FAIL Thumbnail render failed for ${object.id}/shape-${shapeIndex} (${shapeTool(shape)}): ${error.message}`);
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
      this.elements.shapeGeometryDetails.textContent = "No object selected.";
      this.elements.objectTransform.textContent = "No object selected.";
      this.elements.shapeTransform.textContent = "No shape selected.";
      this.updateShapeGeometryHeader(null);
      this.elements.objectPreviewFooter.textContent = "Object ID: none";
      this.elements.jsonDetails.textContent = "{}";
      this.renderFrameTimeline();
      return;
    }

    const shape = this.selectedShape();
    this.elements.objectNameInput.value = selected.name;
    this.renderObjectTagList(selected);
    this.updateObjectsHeader(this.currentPayload.objects.length, selected.shapes.length);
    this.elements.shapeGeometryDetails.replaceChildren(this.createShapeGeometryDetails(selected, shape));
    this.elements.objectTransform.replaceChildren(this.createObjectTransformDetails(selected));
    this.elements.shapeTransform.replaceChildren(this.createShapeTransformDetails(shape));
    this.updateShapeGeometryHeader(shape);
    this.elements.objectPreviewFooter.textContent = `Object ID: ${selected.id}`;
    this.updateSelectedObjectJsonDetails();
    this.renderFrameTimeline();
  }

  updateSelectedObjectJsonDetails() {
    const selected = this.selectedObject();
    if (!selected) {
      this.elements.jsonDetails.textContent = "{}";
      return;
    }
    const shape = this.selectedShape();
    this.elements.jsonDetails.textContent = JSON.stringify({
      object: selected,
      selectedFrame: this.activeFrame(),
      selectedShape: shape,
      selectedShapeIndexes: Array.from(this.selectedShapeIndexes),
      selectedState: this.selectedState()
    }, null, 2);
  }

  updateTransformSummaryText() {
    const summary = this.elements.shapeTransform.querySelector(".object-vector-studio-v2__transform-summary");
    const shape = this.selectedShape();
    if (!summary || !shape) {
      return;
    }
    summary.textContent = this.formatTransformSummary(this.shapeTransform(this.effectiveShape(shape)));
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
      const button = document.createElement("div");
      button.className = "object-vector-studio-v2__frame-tile";
      button.dataset.stateId = state.id;
      button.dataset.frameId = frame.id;
      button.title = `Select frame ${frame.id} in state ${state.id}`;
      button.setAttribute("aria-pressed", String(frame.id === this.selectedFrameId));
      button.setAttribute("role", "button");
      button.tabIndex = 0;
      button.classList.toggle("is-selected", frame.id === this.selectedFrameId);
      button.append(this.createFrameThumbnail(object, frame));
      const label = document.createElement("span");
      label.textContent = `${frame.order}. ${frame.id}`;
      button.append(label);
      button.addEventListener("click", () => this.selectFrame(frame.id, "timeline"));
      button.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }
        event.preventDefault();
        this.selectFrame(frame.id, "timeline");
      });
      this.elements.frameTimeline.append(button);
    });
    this.updateAnimationActionState();
  }

  stateHelpText(stateId) {
    const helpLines = OBJECT_STATE_HELP[stateId] || [`No contextual help is available for state ${stateId || "unknown"}.`];
    return helpLines.join("\n");
  }

  allStateHelpText() {
    return OBJECT_STATE_IDS
      .map((stateId) => `${stateId}\n${this.stateHelpText(stateId)}`)
      .join("\n\n");
  }

  createFrameThumbnail(object, frame) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.classList.add("object-vector-studio-v2__frame-thumbnail");
    svg.dataset.frameThumbnail = frame.id;
    const bounds = this.objectBoundsForFrame(object, frame);
    const padding = 12;
    svg.setAttribute("viewBox", `${bounds.x - padding} ${bounds.y - padding} ${bounds.width + padding * 2} ${bounds.height + padding * 2}`);
    sortedShapes(object).forEach((shape, shapeIndex) => {
      const renderShape = this.effectiveShapeForFrame(shape, frame, shapeIndex);
      if (!renderShape.visible) {
        return;
      }
      try {
        svg.append(this.createSvgShape(renderShape));
        this.appendShapePointStyleCaps(svg, renderShape);
      } catch (error) {
        this.statusLog.write(`FAIL Frame thumbnail render failed for ${object.id}/${frame.id}/shape-${shapeIndex}: ${error.message}`);
      }
    });
    return svg;
  }

  createShapeGeometryDetails(object, shape) {
    const wrapper = document.createElement("div");
    wrapper.className = "object-vector-studio-v2__object-detail-stack";
    if (!shape) {
      const shapePanel = document.createElement("section");
      shapePanel.className = "object-vector-studio-v2__shape-panel";
      const empty = document.createElement("p");
      empty.textContent = "No shape selected. Create a primitive from Tools.";
      shapePanel.append(empty);
      wrapper.append(shapePanel);
      return wrapper;
    }

    wrapper.append(this.createShapeGeometryControls(shape), this.createSelectedShapeSummary(shape));
    if (!this.canUseShapeGeometry()) {
      this.setGeometryPanelDisabled(wrapper, "Shape Geometry is disabled until exactly one shape is selected.");
    }
    return wrapper;
  }

  createSelectedShapeSummary(shape) {
    const shapePanel = document.createElement("section");
    shapePanel.className = "object-vector-studio-v2__shape-panel";
    const groupRow = document.createElement("div");
    groupRow.className = "object-vector-studio-v2__shape-group-summary";
    const label = document.createElement("span");
    label.className = "object-vector-studio-v2__detail-label";
    label.textContent = "Group";
    const value = document.createElement("span");
    value.className = "object-vector-studio-v2__detail-value object-vector-studio-v2__shape-group-summary-value";
    if (shape.groupId) {
      value.append(this.createGroupIndicator(shape.groupId), document.createTextNode(shape.groupId));
    } else {
      value.textContent = "None";
    }
    groupRow.append(label, value);
    shapePanel.append(groupRow);
    return shapePanel;
  }

  shapeSummaryTypeLabel(shape) {
    return shapeTool(shape);
  }

  isTriangleShape(shape) {
    return this.shapeSummaryTypeLabel(shape) === "triangle";
  }

  isEditablePolygonShape(shape) {
    const geometryTool = shapeGeometryTool(shape);
    return (geometryTool === "polygon" && !this.isTriangleShape(shape)) || geometryTool === "polyline";
  }

  shapeGeometryHeadingLabel(shape) {
    return shapeTypeLabel(shape);
  }

  createObjectTransformDetails(object) {
    const wrapper = document.createElement("div");
    wrapper.className = "object-vector-studio-v2__object-detail-stack";
    if (!object) {
      const empty = document.createElement("p");
      empty.textContent = "No object selected.";
      wrapper.append(empty);
      return wrapper;
    }

    const transformPanel = document.createElement("section");
    transformPanel.className = "object-vector-studio-v2__shape-panel";
    const summary = document.createElement("p");
    summary.className = "object-vector-studio-v2__transform-summary";
    summary.dataset.transformSummary = "object";
    summary.textContent = this.formatObjectTransformSummary(object);
    transformPanel.append(this.createObjectTransformControls(object), summary);
    wrapper.append(transformPanel);
    return wrapper;
  }

  createShapeTransformDetails(shape) {
    const wrapper = document.createElement("div");
    wrapper.className = "object-vector-studio-v2__object-detail-stack";
    if (!shape) {
      const empty = document.createElement("p");
      empty.textContent = "No shape selected. Create a primitive from Tools.";
      wrapper.append(empty);
      return wrapper;
    }

    const transformPanel = document.createElement("section");
    transformPanel.className = "object-vector-studio-v2__shape-panel";
    const transform = this.shapeTransform(this.effectiveShape(shape));
    const summary = document.createElement("p");
    summary.className = "object-vector-studio-v2__transform-summary";
    summary.dataset.transformSummary = "shape";
    summary.textContent = this.formatTransformSummary(transform);
    transformPanel.append(this.createShapeTransformControls(shape), summary);
    if (!this.canUseShapeTransform()) {
      this.setTransformPanelDisabled(transformPanel, "Shape Transform is disabled until exactly one shape is selected.");
    }
    wrapper.append(transformPanel);
    return wrapper;
  }

  canUseShapeTransform() {
    return this.selectedShapeIndex >= 0 && this.selectedShapeIndexes.size === 1;
  }

  canUseShapeGeometry() {
    return this.selectedShapeIndex >= 0 && this.selectedShapeIndexes.size === 1;
  }

  setGeometryPanelDisabled(panel, reason) {
    panel.classList.add("is-disabled");
    panel.querySelectorAll("input, select, button").forEach((control) => {
      control.disabled = true;
      control.dataset.disabledReason = reason;
      control.title = reason;
    });
  }

  setTransformPanelDisabled(panel, reason) {
    panel.classList.add("is-disabled");
    panel.querySelectorAll("input, select, button").forEach((control) => {
      control.disabled = true;
      control.dataset.disabledReason = reason;
      control.title = reason;
    });
  }

  formatTransformSummary(transform) {
    const rotation = this.normalizeRotationDegrees(transform.rotation);
    const scaleText = transform.scaleX === transform.scaleY
      ? String(transform.scaleX)
      : `${transform.scaleX} x ${transform.scaleY}`;
    return `x ${transform.x}, y ${transform.y}, rot ${rotation}, scale ${scaleText}`;
  }

  formatObjectTransformSummary(object) {
    const shapes = sortedShapes(object);
    const origin = this.objectTransformOrigin(object);
    if (!shapes.length) {
      return `origin ${origin.x}, ${origin.y}, rot 0, scale 1`;
    }
    const frame = object?.id === this.selectedObjectId ? this.activeFrame() : null;
    const transforms = shapes.map((shape, shapeIndex) => this.shapeTransform(this.effectiveShapeForFrame(shape, frame, shapeIndex)));
    const sameNumber = (key) => transforms.every((transform) => Math.abs(transform[key] - transforms[0][key]) < 0.001);
    const sameScale = transforms.every((transform) => Math.abs(transform.scaleX - transforms[0].scaleX) < 0.001 && Math.abs(transform.scaleY - transforms[0].scaleY) < 0.001);
    const scaleText = sameScale
      ? (Math.abs(transforms[0].scaleX - transforms[0].scaleY) < 0.001
        ? String(this.formatViewportNumber(transforms[0].scaleX))
        : `${this.formatViewportNumber(transforms[0].scaleX)} x ${this.formatViewportNumber(transforms[0].scaleY)}`)
      : "mixed";
    const rotationText = sameNumber("rotation") ? String(this.normalizeRotationDegrees(transforms[0].rotation)) : "mixed";
    return `origin ${origin.x}, ${origin.y}, rot ${rotationText}, scale ${scaleText}`;
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
    const geometryTool = shapeGeometryTool(shape);
    section.className = `object-vector-studio-v2__edit-panel object-vector-studio-v2__edit-panel--geometry object-vector-studio-v2__edit-panel--${geometryTool}`;
    if (geometryTool === "polygon" || geometryTool === "polyline") {
      section.classList.add("object-vector-studio-v2__edit-panel--polygon");
    }
    const heading = document.createElement("h4");
    heading.textContent = `${this.shapeGeometryHeadingLabel(shape)} Geometry`;
    const grid = document.createElement("div");
    grid.className = geometryTool === "polygon" || geometryTool === "polyline"
      ? "object-vector-studio-v2__polygon-point-list"
      : `object-vector-studio-v2__edit-grid object-vector-studio-v2__edit-grid--${geometryTool}${geometryTool === "ellipse" ? " object-vector-studio-v2__edit-grid--ellipse" : ""}`;
    const editablePolygon = this.isEditablePolygonShape(shape);
    if (geometryTool === "polygon" || geometryTool === "polyline") {
      const pointRounding = this.shapePointRoundingValues(shape);
      grid.append(this.createPointRowHeader({ addable: editablePolygon, deletable: editablePolygon }));
      shape.geometry.points.forEach((point, index) => {
        grid.append(this.createPolygonPointRow(point, index, {
          addable: editablePolygon,
          deletable: editablePolygon,
          rounded: pointRounding[index] === true,
          selectable: false
        }));
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
        input.value = field.kind === "number" ? String(this.formatViewportNumber(field.value)) : String(field.value);
        this.bindGeometryAutoApplyInput(input);
        label.append(caption, input);
        grid.append(label);
      });
    }
    section.append(heading);
    const roundingRadiusControl = this.createRoundingRadiusControl(shape);
    if (roundingRadiusControl) {
      section.append(roundingRadiusControl);
    }
    section.append(grid);
    if (geometryTool !== "polygon" && geometryTool !== "polyline" && this.shapeSupportsPointRoundingControls(shape)) {
      section.append(this.createShapePointRoundingControls(shape));
    }
    return section;
  }

  createRoundingRadiusControl(shape) {
    if (!this.shapeSupportsRoundingRadiusControl(shape)) {
      return null;
    }
    const label = document.createElement("label");
    label.className = "object-vector-studio-v2__rounding-radius-field";
    const caption = document.createElement("span");
    caption.textContent = "Rounding Radius";
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.step = "0.1";
    input.value = String(this.formatViewportNumber(this.shapeRoundingRadius(shape)));
    input.dataset.shapeRoundingRadius = "true";
    input.setAttribute("aria-label", "Rounding radius");
    input.addEventListener("input", () => this.clearInputValidity(input));
    input.addEventListener("change", () => {
      const shapeIndex = this.selectedShapeIndex;
      this.window.setTimeout(() => {
        if (this.selectedShapeIndex !== shapeIndex) {
          return;
        }
        this.updateSelectedShapeRoundingRadius(input);
      }, 0);
    });
    label.append(caption, input);
    return label;
  }

  updateSelectedShapeRoundingRadius(input) {
    const selected = this.selectedShape();
    if (!selected) {
      this.statusLog.write("WARN Rounding radius update skipped: no shape is selected.");
      return;
    }
    if (!this.canUseShapeGeometry()) {
      this.statusLog.write("WARN Rounding radius update skipped: select exactly one shape.");
      return;
    }
    if (!this.shapeSupportsPointRoundingControls(selected)) {
      this.statusLog.write(`WARN Rounding radius update skipped: ${shapeTypeLabel(selected)} does not use rounded points.`);
      return;
    }
    const rawValue = String(input?.value ?? "").trim();
    const value = Number(rawValue);
    if (rawValue === "" || !Number.isFinite(value) || value < 0) {
      const error = "Rounding Radius must be a finite number greater than or equal to 0.";
      this.markInputInvalid(input, error);
      this.statusLog.write(`FAIL Invalid rounding radius rejected for shape row ${this.selectedShapeIndex}: ${error}`);
      return;
    }
    if (this.guardSelectedObjectMutation("Rounding radius update")) {
      return;
    }
    this.clearInputValidity(input);
    const roundedValue = Number(value.toFixed(3));
    const nextPayload = this.cloneCurrentPayload();
    const nextShape = this.findShapeInPayload(nextPayload, this.selectedShapeIndex);
    if (!nextShape) {
      this.statusLog.write(`WARN Rounding radius update skipped: selected shape row ${this.selectedShapeIndex} was not found.`);
      return;
    }
    nextShape.style = {
      ...nextShape.style,
      roundingRadius: roundedValue
    };
    this.commitPayloadUpdate(nextPayload, this.selectedObjectId, this.selectedShapeIndex, `OK Updated rounding radius to ${roundedValue} for shape row ${this.selectedShapeIndex}.`, "Rounding radius update failed schema validation");
  }

  updateSelectedShapePointRounding(pointIndex, isRounded) {
    const selected = this.selectedShape();
    if (!selected) {
      this.statusLog.write("WARN Point rounding update skipped: no shape is selected.");
      return;
    }
    if (!this.canUseShapeGeometry()) {
      this.statusLog.write("WARN Point rounding update skipped: select exactly one shape.");
      return;
    }
    if (!this.shapeSupportsPointRoundingControls(selected)) {
      this.statusLog.write(`WARN Point rounding update skipped: ${shapeTypeLabel(selected)} does not use editable point rows.`);
      return;
    }
    if (this.guardSelectedObjectMutation("Point rounding update")) {
      return;
    }
    const objectIndex = this.currentPayload.objects.findIndex((object) => object.id === this.selectedObjectId);
    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects[objectIndex];
    const nextShape = sortedShapes(nextObject)[this.selectedShapeIndex];
    if (!nextShape) {
      this.statusLog.write(`WARN Point rounding update skipped: selected shape row ${this.selectedShapeIndex} was not found.`);
      return;
    }
    const pointCount = this.shapeGeometryPointCount(nextShape);
    if (!Number.isInteger(pointIndex) || pointIndex < 0 || pointIndex >= pointCount) {
      this.statusLog.write(`WARN Point rounding update skipped: point ${pointIndex + 1} is not available.`);
      return;
    }
    const pointRounding = this.normalizedPointRounding(nextShape, pointCount);
    pointRounding[pointIndex] = isRounded === true;
    this.applyPointRoundingToShape(nextShape, pointRounding);
    const pointStyle = isRounded ? "round" : "square";
    this.commitPayloadUpdate(nextPayload, this.selectedObjectId, this.selectedShapeIndex, `OK Updated point ${pointIndex + 1} rounding to ${pointStyle} for shape row ${this.selectedShapeIndex}.`, "Point rounding update failed schema validation");
  }

  bindGeometryAutoApplyInput(input) {
    input.addEventListener("input", () => this.clearInputValidity(input));
    input.addEventListener("change", () => {
      const shapeIndex = this.selectedShapeIndex;
      this.window.setTimeout(() => {
        if (this.selectedShapeIndex !== shapeIndex) {
          return;
        }
        this.applyShapeGeometryEdits({
          okMessage: `OK Auto-applied geometry edits to shape row ${this.selectedShapeIndex}.`
        });
      }, 0);
    });
  }

  createPointRowHeader({ addable = false, deletable = false } = {}) {
    const header = document.createElement("div");
    header.className = "object-vector-studio-v2__polygon-point-header";
    header.setAttribute("aria-hidden", "true");
    ["", "", "", "Round", "", ""].forEach((label) => {
      const cell = document.createElement("span");
      cell.textContent = label;
      header.append(cell);
    });
    return header;
  }

  createPolygonPointRow(point, index, { addable = true, deletable = true, rounded = false, selectable = true } = {}) {
    const row = document.createElement("div");
    row.className = "object-vector-studio-v2__polygon-point-field";
    row.dataset.polygonPointIndex = String(index);
    if (selectable) {
      row.dataset.polygonPointSelectable = "true";
      row.setAttribute("role", "button");
      row.setAttribute("tabindex", "0");
      row.setAttribute("aria-pressed", "false");
      row.title = "Select this point row for Add Point.";
      row.addEventListener("click", (event) => this.handlePolygonPointRowSelection(event, row));
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.togglePolygonPointRowSelection(row, event);
        }
      });
    }
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
      input.value = String(this.formatViewportNumber(value));
      this.bindGeometryAutoApplyInput(input);
      label.append(axisLabel, input);
      row.append(label);
    });
    const roundLabel = document.createElement("label");
    roundLabel.className = "object-vector-studio-v2__polygon-point-rounding";
    const roundCaption = document.createElement("span");
    roundCaption.textContent = "Round";
    const roundCheckbox = document.createElement("input");
    roundCheckbox.type = "checkbox";
    roundCheckbox.checked = rounded === true;
    roundCheckbox.dataset.polygonPointRound = "true";
    roundCheckbox.dataset.polygonPointIndex = String(index);
    roundCheckbox.setAttribute("aria-label", `Round point ${index + 1}`);
    roundCheckbox.addEventListener("click", (event) => event.stopPropagation());
    roundCheckbox.addEventListener("change", () => this.updateSelectedShapePointRounding(index, roundCheckbox.checked));
    roundLabel.append(roundCaption, roundCheckbox);
    row.append(roundLabel);
    if (addable) {
      const addButton = document.createElement("button");
      addButton.type = "button";
      addButton.className = "object-vector-studio-v2__polygon-point-add";
      addButton.dataset.polygonPointAdd = "true";
      addButton.dataset.polygonPointIndex = String(index);
      addButton.setAttribute("aria-label", `Add point after point ${index + 1}`);
      addButton.title = `Add point after point ${index + 1}`;
      this.applyIconGlyph(addButton, "add");
      addButton.addEventListener("pointerdown", (event) => event.stopPropagation());
      addButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.addPolygonPointAfterRow(index, addButton);
      });
      row.append(addButton);
    }
    if (deletable) {
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "object-vector-studio-v2__polygon-point-delete";
      deleteButton.dataset.polygonPointDelete = "true";
      deleteButton.dataset.polygonPointIndex = String(index);
      deleteButton.setAttribute("aria-label", `Delete point ${index + 1}`);
      deleteButton.title = `Delete point ${index + 1}`;
      this.applyIconGlyph(deleteButton, "delete");
      deleteButton.addEventListener("pointerdown", (event) => event.stopPropagation());
      deleteButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.deletePolygonPointRow(index, deleteButton);
      });
      row.append(deleteButton);
    }
    return row;
  }

  createShapePointRoundingControls(shape) {
    const panel = document.createElement("div");
    panel.className = "object-vector-studio-v2__point-rounding-panel";
    const heading = document.createElement("h4");
    heading.textContent = "Point Rounding";
    const list = document.createElement("div");
    list.className = "object-vector-studio-v2__polygon-point-list object-vector-studio-v2__point-rounding-list";
    const points = this.shapeGeometryPoints(shape);
    const pointRounding = this.shapePointRoundingValues(shape);
    list.append(this.createPointRowHeader());
    points.forEach((point, index) => {
      list.append(this.createReadonlyPointRoundingRow(shape, point, index, pointRounding[index] === true));
    });
    panel.append(heading, list);
    return panel;
  }

  createReadonlyPointRoundingRow(shape, point, index, rounded = false) {
    const row = document.createElement("div");
    row.className = "object-vector-studio-v2__polygon-point-field object-vector-studio-v2__polygon-point-field--rounding-only";
    row.dataset.polygonPointIndex = String(index);
    const label = document.createElement("span");
    label.className = "object-vector-studio-v2__polygon-point-label";
    const geometryTool = shapeGeometryTool(shape);
    label.textContent = OPEN_POINT_STYLE_TOOLS.has(geometryTool)
      ? (index === 0 ? "Start" : "End")
      : `Point ${index + 1}`;
    row.append(label);
    [
      ["X", point.x],
      ["Y", point.y]
    ].forEach(([axis, value]) => {
      const field = document.createElement("span");
      field.className = "object-vector-studio-v2__polygon-point-axis object-vector-studio-v2__polygon-point-axis--readonly";
      const axisLabel = document.createElement("span");
      axisLabel.textContent = axis;
      const valueElement = document.createElement("span");
      valueElement.className = "object-vector-studio-v2__polygon-point-value";
      valueElement.textContent = String(this.formatViewportNumber(value));
      field.append(axisLabel, valueElement);
      row.append(field);
    });
    const roundLabel = document.createElement("label");
    roundLabel.className = "object-vector-studio-v2__polygon-point-rounding";
    const roundCaption = document.createElement("span");
    roundCaption.textContent = "Round";
    const roundCheckbox = document.createElement("input");
    roundCheckbox.type = "checkbox";
    roundCheckbox.checked = rounded === true;
    roundCheckbox.dataset.polygonPointRound = "true";
    roundCheckbox.dataset.polygonPointIndex = String(index);
    roundCheckbox.setAttribute("aria-label", `Round ${label.textContent.toLowerCase()} point`);
    roundCheckbox.addEventListener("change", () => this.updateSelectedShapePointRounding(index, roundCheckbox.checked));
    roundLabel.append(roundCaption, roundCheckbox);
    row.append(roundLabel);
    return row;
  }

  handlePolygonPointRowSelection(event, row) {
    if (event.target.closest("input, button, select, textarea, label")) {
      return;
    }
    this.togglePolygonPointRowSelection(row, event);
  }

  togglePolygonPointRowSelection(row, event = null) {
    if (!row?.dataset || row.dataset.polygonPointSelectable !== "true") {
      return;
    }
    const shouldExtend = Boolean(event?.ctrlKey || event?.metaKey || event?.shiftKey);
    if (!shouldExtend) {
      this.elements.shapeGeometryDetails.querySelectorAll("[data-polygon-point-action-selected='true']").forEach((candidate) => {
        if (candidate !== row) {
          delete candidate.dataset.polygonPointActionSelected;
          candidate.classList.remove("is-action-selected");
          candidate.setAttribute("aria-pressed", "false");
        }
      });
    }
    const isSelected = row.dataset.polygonPointActionSelected === "true";
    if (isSelected) {
      delete row.dataset.polygonPointActionSelected;
      row.classList.remove("is-action-selected");
      row.setAttribute("aria-pressed", "false");
      return;
    }
    row.dataset.polygonPointActionSelected = "true";
    row.classList.add("is-action-selected");
    row.setAttribute("aria-pressed", "true");
  }

  createShapeTransformControls(shape) {
    const section = document.createElement("section");
    section.className = "object-vector-studio-v2__edit-panel object-vector-studio-v2__edit-panel--transform";
    const transform = this.shapeTransform(this.effectiveShape(shape));
    section.append(
      this.createMoveControlRow(),
      this.createOriginControlRow(transform),
      this.createRotateControlRow(),
      this.createScaleControlRow(transform)
    );
    return section;
  }

  createObjectTransformControls(object) {
    const section = document.createElement("section");
    section.className = "object-vector-studio-v2__edit-panel object-vector-studio-v2__edit-panel--transform object-vector-studio-v2__edit-panel--object-transform";
    const origin = this.objectTransformOrigin(object);
    const objectScaleInput = Number(this.transformInputValue("objectVectorStudioV2ObjectScaleInput", "1"));
    const objectScale = Number.isFinite(objectScaleInput) && objectScaleInput > 0 ? objectScaleInput : 1;
    section.append(
      this.createObjectOriginControlRow(origin),
      this.createObjectRotateControlRow(),
      this.createScaleControlRow({ scaleX: objectScale, scaleY: objectScale }, {
        downLargeId: "objectVectorStudioV2ObjectScaleDownLargeButton",
        downSmallId: "objectVectorStudioV2ObjectScaleDownSmallButton",
        inputId: "objectVectorStudioV2ObjectScaleInput",
        inputLabel: "Object Scale",
        onInput: (input) => this.applyObjectScaleInputLive(input),
        onResize: () => this.resizeSelectedObject(),
        onStep: (delta) => this.adjustSelectedObjectScale(delta),
        resizeButtonId: "objectVectorStudioV2ObjectResizeButton",
        upLargeId: "objectVectorStudioV2ObjectScaleUpLargeButton",
        upSmallId: "objectVectorStudioV2ObjectScaleUpSmallButton"
      })
    );
    return section;
  }

  createMoveControlRow() {
    return this.createTransformAxisControlRow({
      action: () => this.moveSelectedShape(),
      buttonId: "objectVectorStudioV2MoveShapeButton",
      buttonLabel: "Move",
      iconKey: "move",
      label: "Move",
      rowType: "move",
      xInput: { id: "objectVectorStudioV2MoveXInput", label: "Move X", value: "10" },
      yInput: { id: "objectVectorStudioV2MoveYInput", label: "Move Y", value: "0" }
    });
  }

  createOriginControlRow(transform) {
    return this.createTransformAxisControlRow({
      action: () => this.applySelectedShapeOrigin(),
      buttonId: "objectVectorStudioV2ApplyOriginButton",
      buttonLabel: "Apply",
      buttonTitle: "Apply Origin",
      label: "Origin",
      rowType: "origin",
      extraButtons: [
        this.createTransformActionButton({
          handler: () => this.autoOriginSelectedShapePivot(),
          id: "objectVectorStudioV2AutoOriginButton",
          label: "Auto",
          title: "Auto Origin"
        })
      ],
      xInput: { id: "objectVectorStudioV2OriginXInput", label: "Origin X", value: String(this.formatViewportNumber(transform.shapeOrigin.x)) },
      yInput: { id: "objectVectorStudioV2OriginYInput", label: "Origin Y", value: String(this.formatViewportNumber(transform.shapeOrigin.y)) }
    });
  }

  createObjectOriginControlRow(origin) {
    return this.createTransformAxisControlRow({
      action: () => this.applySelectedObjectOrigin(),
      buttonId: "objectVectorStudioV2ObjectApplyOriginButton",
      buttonLabel: "Apply",
      buttonTitle: "Apply Object Origin",
      label: "Origin",
      rowType: "origin",
      extraButtons: [
        this.createTransformActionButton({
          handler: () => this.autoOriginSelectedObjectPivot(),
          id: "objectVectorStudioV2ObjectAutoOriginButton",
          label: "Auto",
          title: "Auto Origin"
        })
      ],
      xInput: { id: "objectVectorStudioV2ObjectOriginXInput", label: "Object Origin X", value: String(this.formatViewportNumber(origin.x)) },
      yInput: { id: "objectVectorStudioV2ObjectOriginYInput", label: "Object Origin Y", value: String(this.formatViewportNumber(origin.y)) }
    });
  }

  createRotateControlRow() {
    const row = document.createElement("div");
    row.className = "object-vector-studio-v2__transform-control-row object-vector-studio-v2__transform-control-row--rotate";
    row.dataset.transformControlRow = "rotate";
    const label = document.createElement("span");
    label.className = "object-vector-studio-v2__transform-control-label";
    label.textContent = "Rotate";
    const input = this.createTransformNumberInput("objectVectorStudioV2RotateInput", "Rotate", "15", {
      max: "359",
      min: "-359"
    });
    const snapSelect = this.createRotateSnapSelect();
    const stepField = this.createAngleSnapStepField();
    const button = this.createTransformActionButton({
      handler: () => this.rotateSelectedShape(),
      iconKey: "rotate",
      id: "objectVectorStudioV2RotateShapeButton",
      label: "Rotate"
    });
    row.append(label, input, snapSelect, stepField, button);
    this.updateRotateSnapControls(row);
    return row;
  }

  createObjectRotateControlRow() {
    const row = document.createElement("div");
    row.className = "object-vector-studio-v2__transform-control-row object-vector-studio-v2__transform-control-row--rotate object-vector-studio-v2__transform-control-row--object-rotate";
    row.dataset.transformControlRow = "rotate";
    const label = document.createElement("span");
    label.className = "object-vector-studio-v2__transform-control-label";
    label.textContent = "Rotate";
    const input = this.createTransformNumberInput("objectVectorStudioV2ObjectRotateInput", "Object Rotate", "15", {
      max: "359",
      min: "-359"
    });
    const snapSelect = this.createRotateSnapSelect({
      id: "objectVectorStudioV2ObjectRotateSnapSelect",
      label: "Object Rotate Snap Angle"
    });
    const stepField = this.createAngleSnapStepField({
      id: "objectVectorStudioV2ObjectSnapAngleStepSelect",
      label: "Object Snap Angle Step"
    });
    const button = this.createTransformActionButton({
      handler: () => this.rotateSelectedObject(),
      iconKey: "rotate",
      id: "objectVectorStudioV2ObjectRotateButton",
      label: "Rotate"
    });
    row.append(label, input, snapSelect, stepField, button);
    this.updateRotateSnapControls(row);
    return row;
  }

  createRotateSnapSelect(options = {}) {
    const {
      id = "objectVectorStudioV2RotateSnapSelect",
      label = "Rotate Snap Angle"
    } = options;
    const select = document.createElement("select");
    select.id = id;
    select.className = "object-vector-studio-v2__rotate-snap-select";
    select.setAttribute("aria-label", label);
    select.title = "Valid Rotate values generated by the selected Snap Angle step.";
    this.populateRotateSnapSelect(select, this.angleSnapStep, this.transformInputValue(select.id, "15"));
    select.addEventListener("change", () => {
      this.transformInputValues.set(select.id, select.value);
    });
    return select;
  }

  createAngleSnapStepField(options = {}) {
    const {
      id = "objectVectorStudioV2SnapAngleStepSelect",
      label: labelText = "Snap Angle Step"
    } = options;
    const labelElement = document.createElement("label");
    labelElement.className = "object-vector-studio-v2__snap-angle-step-field";
    const text = document.createElement("span");
    text.textContent = "Step";
    const select = document.createElement("select");
    select.id = id;
    select.setAttribute("aria-label", labelText);
    select.title = "Choose the angle increment used to generate Rotate dropdown values.";
    ANGLE_SNAP_STEPS.forEach((step) => {
      const option = document.createElement("option");
      option.value = String(step);
      option.textContent = String(step);
      select.append(option);
    });
    select.value = String(this.angleSnapStep);
    select.addEventListener("change", () => {
      const nextStep = Number(select.value);
      this.angleSnapStep = ANGLE_SNAP_STEPS.includes(nextStep) ? nextStep : 15;
      this.window.sessionStorage?.setItem(ANGLE_SNAP_STEP_SESSION_KEY, String(this.angleSnapStep));
      this.updateRotateSnapControls();
      this.statusLog.write(`OK Snap angle step set to ${this.angleSnapStep} degrees.`);
    });
    labelElement.append(text, select);
    return labelElement;
  }

  createTransformAxisControlRow({ action, buttonId, buttonLabel, buttonTitle, extraButtons = [], iconKey, label, rowType, xInput, yInput }) {
    const row = document.createElement("div");
    row.className = `object-vector-studio-v2__transform-control-row object-vector-studio-v2__transform-control-row--${rowType}`;
    row.dataset.transformControlRow = rowType;
    const rowLabel = document.createElement("span");
    rowLabel.className = "object-vector-studio-v2__transform-control-label";
    rowLabel.textContent = label;
    const actionButton = this.createTransformActionButton({
        handler: action,
        iconKey,
        id: buttonId,
        label: buttonLabel,
        title: buttonTitle
      });
    row.append(
      rowLabel,
      this.createTransformAxisField("X", xInput),
      this.createTransformAxisField("Y", yInput),
      actionButton,
      ...extraButtons
    );
    return row;
  }

  createTransformAxisField(axisLabel, inputOptions) {
    const label = document.createElement("label");
    label.className = "object-vector-studio-v2__transform-axis-field";
    const axis = document.createElement("span");
    axis.textContent = axisLabel;
    label.append(axis, this.createTransformNumberInput(inputOptions.id, inputOptions.label, inputOptions.value));
    return label;
  }

  createTransformNumberInput(id, label, value, options = {}) {
    const input = document.createElement("input");
    input.id = id;
    input.type = "number";
    input.step = "0.1";
    const initialValue = this.transformInputValue(id, value);
    const numericInitialValue = Number(initialValue);
    input.value = String(initialValue).trim() !== "" && Number.isFinite(numericInitialValue)
      ? String(this.formatViewportNumber(numericInitialValue))
      : initialValue;
    input.setAttribute("aria-label", label);
    if (options.min !== undefined) {
      input.min = options.min;
    }
    if (options.max !== undefined) {
      input.max = options.max;
    }
    input.addEventListener("input", () => {
      this.transformInputValues.set(id, input.value);
      this.clearInputValidity(input);
    });
    return input;
  }

  createTransformActionButton({ handler, iconKey, id, label, title }) {
    const button = document.createElement("button");
    button.id = id;
    button.type = "button";
    button.textContent = label;
    if (title) {
      button.title = title;
      button.setAttribute("aria-label", title);
    }
    this.applyIconGlyph(button, iconKey);
    button.addEventListener("click", handler);
    return button;
  }

  createScaleControlRow(transform, options = {}) {
    const {
      downLargeId = "objectVectorStudioV2ScaleDownLargeButton",
      downSmallId = "objectVectorStudioV2ScaleDownSmallButton",
      inputId = "objectVectorStudioV2ScaleInput",
      inputLabel = "Scale",
      onInput = (input) => this.applyScaleInputLive(input),
      onResize = () => this.resizeSelectedShape(),
      onStep = (delta) => this.adjustSelectedShapeScale(delta),
      resizeButtonId = "objectVectorStudioV2ResizeShapeButton",
      upLargeId = "objectVectorStudioV2ScaleUpLargeButton",
      upSmallId = "objectVectorStudioV2ScaleUpSmallButton"
    } = options;
    const row = document.createElement("div");
    row.className = "object-vector-studio-v2__scale-control-row";
    const label = document.createElement("span");
    label.className = "object-vector-studio-v2__scale-control-label";
    label.textContent = "Scale";
    row.append(label);

    [
      [downLargeId, "--", -0.1],
      [downSmallId, "-", -0.01]
    ].forEach(([id, text, delta]) => {
      row.append(this.createScaleStepButton(id, text, delta, onStep));
    });

    const input = document.createElement("input");
    input.id = inputId;
    input.className = "object-vector-studio-v2__scale-input";
    input.type = "number";
    input.min = "0.01";
    input.step = "0.01";
    input.value = this.formatScaleInputValue(transform.scaleX);
    input.setAttribute("aria-label", inputLabel);
    input.addEventListener("input", () => {
      this.transformInputValues.set(input.id, input.value);
      onInput(input);
    });
    row.append(input);

    [
      [upSmallId, "+", 0.01],
      [upLargeId, "++", 0.1]
    ].forEach(([id, text, delta]) => {
      row.append(this.createScaleStepButton(id, text, delta, onStep));
    });

    const resizeButton = document.createElement("button");
    resizeButton.id = resizeButtonId;
    resizeButton.className = "object-vector-studio-v2__scale-resize-button";
    resizeButton.type = "button";
    resizeButton.textContent = "Resize";
    resizeButton.title = "Resize Geometry";
    resizeButton.setAttribute("aria-label", "Resize Geometry");
    this.applyIconGlyph(resizeButton, "resize");
    resizeButton.addEventListener("click", onResize);
    row.append(resizeButton);
    return row;
  }

  createScaleStepButton(id, text, delta, onStep = (scaleDelta) => this.adjustSelectedShapeScale(scaleDelta)) {
    const button = document.createElement("button");
    button.id = id;
    button.type = "button";
    button.dataset.scaleStep = String(delta);
    button.textContent = text;
    button.title = `Scale ${delta > 0 ? "up" : "down"} ${Math.abs(delta).toFixed(2)}`;
    button.addEventListener("click", () => onStep(delta));
    return button;
  }

  transformInputValue(id, defaultValue) {
    return this.transformInputValues.has(id) ? this.transformInputValues.get(id) : defaultValue;
  }

  shapeGeometryFields(shape) {
    const geometryTool = shapeGeometryTool(shape);
    if (shapeTool(shape) === "square") {
      return [
        { key: "x", kind: "number", label: "x", value: shape.geometry.x },
        { key: "y", kind: "number", label: "y", value: shape.geometry.y },
        { key: "size", kind: "number", label: "Size", value: shape.geometry.width, wide: true }
      ];
    }
    if (geometryTool === "rectangle") {
      return ["x", "y", "width", "height"].map((key) => ({ key, kind: "number", label: key, value: shape.geometry[key] }));
    }
    if (geometryTool === "circle") {
      return ["cx", "cy", "r"].map((key) => ({ key, kind: "number", label: key, value: shape.geometry[key], wide: key === "r" }));
    }
    if (geometryTool === "ellipse") {
      return [
        { key: "cx", kind: "number", label: "Cx", value: shape.geometry.cx },
        { key: "cy", kind: "number", label: "Cy", value: shape.geometry.cy },
        { key: "rx", kind: "number", label: "Rx", value: shape.geometry.rx },
        { key: "ry", kind: "number", label: "Ry", value: shape.geometry.ry }
      ];
    }
    if (geometryTool === "line") {
      const point1 = linePoint(shape.geometry, "point1");
      const point2 = linePoint(shape.geometry, "point2");
      return [
        { key: "point1.x", kind: "number", label: "Point 1 X", value: point1.x },
        { key: "point1.y", kind: "number", label: "Point 1 Y", value: point1.y },
        { key: "point2.x", kind: "number", label: "Point 2 X", value: point2.x },
        { key: "point2.y", kind: "number", label: "Point 2 Y", value: point2.y }
      ];
    }
    if (geometryTool === "arc") {
      return ["cx", "cy", "r", "startAngle", "endAngle"].map((key) => ({
        key,
        kind: "number",
        label: key,
        value: shape.geometry[key],
        wide: key === "r"
      }));
    }
    if (geometryTool === "text") {
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
    this.elements.renderSurface.classList.toggle("is-drawing-mode", Boolean(this.activeDrawing));
    this.removeDrawingHint();
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
    const hitLayer = document.createElementNS(SVG_NS, "g");
    hitLayer.classList.add("object-vector-studio-v2__shape-hit-layer");
    this.elements.renderSurface.append(hitLayer);
    sortedShapes(object).forEach((shape, shapeIndex) => {
      const renderShape = this.effectiveShape(shape, shapeIndex);
      if (!renderShape.visible) {
        return;
      }
      try {
        const element = this.createSvgShape(renderShape, { drawingScale: OBJECT_PREVIEW_DRAWING_SCALE });
        element.dataset.shapeIndex = String(shapeIndex);
        element.dataset.renderShapeTool = shapeTool(shape);
        element.classList.add("object-vector-studio-v2__shape");
        element.classList.toggle("is-selected", this.selectedShapeIndexes.has(shapeIndex));
        element.setAttribute("tabindex", "0");
        this.bindRenderedShapePointerEvents(element, shape, shapeIndex);
        this.elements.renderSurface.append(element);
        this.appendShapePointStyleCaps(this.elements.renderSurface, renderShape, { drawingScale: OBJECT_PREVIEW_DRAWING_SCALE });
        hitLayer.append(this.createShapeHitArea(renderShape, shape, shapeIndex));
        renderedCount += 1;
      } catch (error) {
        this.statusLog.write(`FAIL Render mode svg-work-surface failed for shape-${shapeIndex} (${shapeTool(shape)}): ${error.message}`);
      }
    });
    if (!hitLayer.childNodes.length) {
      hitLayer.remove();
    }
    this.renderObjectBounds(object);
    this.renderSnapPointTargets(object);
    this.renderDrawingPreview();
    this.renderDrawingHint();
    this.renderSelectionOverlay(object);
    this.renderCenterOriginMarker();

    const frame = this.activeFrame();
    const message = `Render mode svg-work-surface: rendered ${object.name} with ${renderedCount} visible shapes${frame ? ` for ${this.selectedStateId}/${frame.id}` : ""}; capture mode none.`;
    this.statusLog.write(`OK ${message}`);
  }

  bindRenderedShapePointerEvents(element, shape, shapeIndex) {
    element.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      if (event.button === 2) {
        event.preventDefault();
        return;
      }
      if (this.activeDrawing) {
        this.handleDrawingPointerDown(event);
        return;
      }
      if (this.activeTool === "paint" || this.activeTool === "stroke") {
        this.isPaintDragging = true;
        return;
      }
      this.startPreviewShapeMove(event, shapeIndex);
    });
    element.addEventListener("click", (event) => {
      event.stopPropagation();
      if (this.activeDrawing) {
        return;
      }
      this.handleShapePointer(event, shape, shapeIndex, { source: "render surface click" });
    });
    element.addEventListener("contextmenu", (event) => this.handleShapeContextMenu(event, shape, shapeIndex));
    element.addEventListener("pointerenter", (event) => {
      if (this.isPaintDragging) {
        event.stopPropagation();
        this.handleShapePointer(event, shape, shapeIndex, { source: "render surface drag" });
      }
    });
  }

  createShapeHitArea(renderShape, sourceShape, shapeIndex) {
    const hitArea = this.createSvgShape(renderShape, { drawingScale: OBJECT_PREVIEW_DRAWING_SCALE });
    const geometryTool = shapeGeometryTool(sourceShape);
    hitArea.classList.add("object-vector-studio-v2__shape-hit-area");
    hitArea.dataset.shapeHitIndex = String(shapeIndex);
    hitArea.dataset.shapeHitTool = shapeTool(sourceShape);
    hitArea.removeAttribute("tabindex");
    hitArea.setAttribute("fill", ["arc", "line", "polyline"].includes(geometryTool) ? "none" : "transparent");
    hitArea.setAttribute("stroke", "transparent");
    hitArea.setAttribute("stroke-width", String(Math.max(12, Number(renderShape.style?.strokeWidth) || 1)));
    hitArea.setAttribute("pointer-events", "all");
    hitArea.setAttribute("aria-hidden", "true");
    this.bindRenderedShapePointerEvents(hitArea, sourceShape, shapeIndex);
    return hitArea;
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

  handleShapePointer(event, shape, shapeIndex, options = {}) {
    if (event.altKey || this.activeTool === "picker") {
      this.sampleShapeStyle(shapeIndex);
      return;
    }
    if (event.shiftKey) {
      this.selectShape(shapeIndex, "render surface additive", { additive: true });
      return;
    }
    const isStrokeMode = this.activeTool === "stroke";
    const isPaintMode = this.activeTool === "paint";
    if (isStrokeMode || isPaintMode) {
      if (options.dragStart) {
        this.isPaintDragging = true;
      }
      this.applySelectedPaletteColorToShape(shapeIndex, isStrokeMode ? "stroke" : "fill", options.source || (options.dragStart ? "render surface click" : "render surface drag"));
      return;
    }
    this.selectShape(shapeIndex, "render surface");
  }

  handleShapeContextMenu(event, shape, shapeIndex) {
    event.preventDefault();
    if (this.activeDrawing || this.previewPointerEdit) {
      return;
    }
    this.applyTransparentStyleToShape(shapeIndex, "fill", "right-click");
  }

  renderOnionSkin(object) {
    const previousFrame = this.previousFrame();
    if (!previousFrame) {
      return;
    }
    const group = document.createElementNS(SVG_NS, "g");
    group.classList.add("object-vector-studio-v2__onion-skin");
    group.dataset.onionSkinFrame = previousFrame.id;
    sortedShapes(object).forEach((shape, shapeIndex) => {
      const renderShape = this.effectiveShapeForFrame(shape, previousFrame, shapeIndex);
      if (!renderShape.visible) {
        return;
      }
      try {
        group.append(this.createSvgShape(renderShape, { drawingScale: OBJECT_PREVIEW_DRAWING_SCALE }));
        this.appendShapePointStyleCaps(group, renderShape, { drawingScale: OBJECT_PREVIEW_DRAWING_SCALE });
      } catch (error) {
        this.statusLog.write(`FAIL Onion-skin render failed for ${object.name}/shape-${shapeIndex}: ${error.message}`);
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

  renderSnapPointTargets(object) {
    if (this.snapMode !== "point") {
      return;
    }
    const points = this.visibleSnapPoints(object);
    if (!points.length) {
      return;
    }
    const group = document.createElementNS(SVG_NS, "g");
    group.classList.add("object-vector-studio-v2__snap-targets");
    points.forEach((point, index) => {
      const target = document.createElementNS(SVG_NS, "circle");
      target.classList.add("object-vector-studio-v2__snap-target");
      target.dataset.snapTargetIndex = String(index);
      target.setAttribute("cx", this.scaleDrawingValue(point.x, OBJECT_PREVIEW_DRAWING_SCALE));
      target.setAttribute("cy", this.scaleDrawingValue(point.y, OBJECT_PREVIEW_DRAWING_SCALE));
      target.setAttribute("r", 4);
      group.append(target);
    });
    this.elements.renderSurface.append(group);
  }

  renderDrawingPreview() {
    if (!this.activeDrawing) {
      return;
    }
    const previewShape = this.previewShapeFromDrawing();
    if (!previewShape) {
      return;
    }
    try {
      const element = this.createSvgShape(previewShape, { drawingScale: OBJECT_PREVIEW_DRAWING_SCALE });
      element.classList.add("object-vector-studio-v2__drawing-preview");
      element.dataset.drawingPreviewTool = this.activeDrawing.tool;
      this.applyDrawingPreviewPresentation(element, previewShape);
      this.elements.renderSurface.append(element);
      this.appendShapePointStyleCaps(this.elements.renderSurface, previewShape, { drawingScale: OBJECT_PREVIEW_DRAWING_SCALE });
    } catch (error) {
      this.statusLog.write(`FAIL Drawing preview failed for ${this.activeDrawing.tool}: ${error.message}`);
    }
  }

  renderDrawingHint() {
    const drawing = this.activeDrawing;
    if (!drawing || !["polygon", "polyline"].includes(drawing.tool) || !this.drawingPreviewPoint) {
      this.removeDrawingHint();
      return;
    }
    const workArea = this.elements.renderSurface.closest(".object-vector-studio-v2__work-area");
    if (!workArea) {
      return;
    }
    const clientPoint = this.drawingHintClientPoint || this.clientPointFromDrawingPoint(this.drawingPreviewPoint);
    if (!clientPoint) {
      this.removeDrawingHint();
      return;
    }
    const workAreaBounds = workArea.getBoundingClientRect();
    const hint = document.createElement("div");
    hint.className = "object-vector-studio-v2__drawing-hint";
    hint.dataset.drawingHintTool = drawing.tool;
    hint.textContent = "Double-click / Enter to complete";
    hint.style.left = `${Math.round(clientPoint.x - workAreaBounds.left + 12)}px`;
    hint.style.top = `${Math.round(clientPoint.y - workAreaBounds.top + 16)}px`;
    workArea.append(hint);
  }

  removeDrawingHint() {
    this.elements.renderSurface.closest(".object-vector-studio-v2__work-area")
      ?.querySelector(".object-vector-studio-v2__drawing-hint")
      ?.remove();
  }

  clientPointFromDrawingPoint(point) {
    const bounds = this.elements.renderSurface.getBoundingClientRect();
    if (!bounds.width || !bounds.height) {
      return null;
    }
    const viewWidth = DEFAULT_VIEWPORT.width / this.viewport.zoom;
    const viewHeight = DEFAULT_VIEWPORT.height / this.viewport.zoom;
    const drawingX = point.x * OBJECT_PREVIEW_DRAWING_SCALE;
    const drawingY = point.y * OBJECT_PREVIEW_DRAWING_SCALE;
    return {
      x: bounds.left + ((drawingX - this.viewport.x + viewWidth / 2) / viewWidth) * bounds.width,
      y: bounds.top + ((drawingY - this.viewport.y + viewHeight / 2) / viewHeight) * bounds.height
    };
  }

  applyDrawingPreviewPresentation(element, previewShape) {
    if (shapeGeometryTool(previewShape) === "text") {
      element.style.strokeDasharray = "none";
      return;
    }
    element.style.strokeDasharray = this.drawingPreviewDashArray(previewShape.style.strokeWidth);
    const previewPointStyle = this.supportsOpenPointStyle(previewShape)
      ? (this.openShapeUsesSplitPointStyles(previewShape) ? "butt" : this.shapeStartPointStyle(previewShape))
      : this.shapeUnifiedPointStyle(previewShape);
    element.style.strokeLinecap = previewPointStyle;
    element.style.strokeLinejoin = this.strokeLinejoinValue(this.shapeUnifiedPointStyle(previewShape));
  }

  drawingPreviewDashArray(strokeWidth) {
    const normalizedWidth = Number(strokeWidth);
    const width = Number.isFinite(normalizedWidth) && normalizedWidth > 0 ? normalizedWidth : 2;
    const unitsPerPixel = this.svgUnitsPerCssPixel();
    const dashPixels = Math.max(12, Math.min(24, width * 1.1));
    const gapPixels = Math.max(8, Math.min(18, width * 0.75));
    return `${this.formatViewportNumber(dashPixels * unitsPerPixel)} ${this.formatViewportNumber(gapPixels * unitsPerPixel)}`;
  }

  svgUnitsPerCssPixel() {
    const bounds = this.elements.renderSurface.getBoundingClientRect();
    const viewBox = this.elements.renderSurface.viewBox?.baseVal;
    if (!bounds.width || !viewBox?.width) {
      return 1;
    }
    return viewBox.width / bounds.width;
  }

  visibleSnapPoints(object = this.selectedObject(), options = {}) {
    if (!object) {
      return [];
    }
    const points = [];
    sortedShapes(object).forEach((shape, shapeIndex) => {
      if (normalizeShapeIndex(options.excludeShapeIndex) === shapeIndex) {
        return;
      }
      const effective = this.effectiveShape(shape, shapeIndex);
      if (!effective.visible) {
        return;
      }
      const transform = this.shapeTransform(effective);
      const definitions = this.geometryPointHandleDefinitions(effective);
      const shapePoints = definitions.length
        ? definitions.map((definition) => definition.point)
        : boundsCornerPoints(shapeBounds(effective));
      shapePoints.forEach((point) => points.push(this.transformedPoint(point, transform)));
    });
    return points;
  }

  nearestVisibleSnapPoint(point, options = {}) {
    const candidates = this.visibleSnapPoints(this.selectedObject(), options);
    let nearest = null;
    candidates.forEach((candidate) => {
      const distance = Math.hypot(candidate.x - point.x, candidate.y - point.y);
      if (distance <= POINT_SNAP_RADIUS && (!nearest || distance < nearest.distance)) {
        nearest = { distance, point: candidate };
      }
    });
    return nearest?.point || null;
  }

  normalizeDrawingPoint(point) {
    return {
      x: this.formatViewportNumber(point?.x || 0),
      y: this.formatViewportNumber(point?.y || 0)
    };
  }

  snapCanvasPoint(point, options = {}) {
    if (this.snapMode === "grid") {
      return {
        x: Math.round(point.x),
        y: Math.round(point.y)
      };
    }
    if (this.snapMode === "point") {
      const target = this.nearestVisibleSnapPoint(point, options);
      if (target) {
        return {
          x: this.formatViewportNumber(target.x),
          y: this.formatViewportNumber(target.y)
        };
      }
    }
    return this.normalizeDrawingPoint(point);
  }

  supportsDrawingAngleSnap(tool) {
    return ["line", "polygon", "polyline"].includes(tool);
  }

  drawingAngleSnapAnchor(drawing) {
    if (!drawing || !this.supportsDrawingAngleSnap(drawing.tool)) {
      return null;
    }
    if (drawing.flow === "two-click") {
      return drawing.start || null;
    }
    if (drawing.flow === "points") {
      return drawing.points.at(-1) || null;
    }
    return null;
  }

  snapPointToDrawingAngle(anchor, point) {
    const normalizedAnchor = this.normalizeDrawingPoint(anchor);
    const normalizedPoint = this.normalizeDrawingPoint(point);
    const dx = normalizedPoint.x - normalizedAnchor.x;
    const dy = normalizedPoint.y - normalizedAnchor.y;
    const distance = Math.hypot(dx, dy);
    if (!distance) {
      return normalizedPoint;
    }
    const degrees = Math.atan2(dy, dx) * 180 / Math.PI;
    const snappedDegrees = this.snapAngle(degrees);
    const radians = snappedDegrees * Math.PI / 180;
    return {
      x: this.formatViewportNumber(normalizedAnchor.x + Math.cos(radians) * distance),
      y: this.formatViewportNumber(normalizedAnchor.y + Math.sin(radians) * distance)
    };
  }

  snapDrawingPoint(point, drawing, options = {}) {
    const snappedPoint = this.snapCanvasPoint(point, options);
    if (!this.angleSnapEnabled) {
      return this.normalizeDrawingPoint(snappedPoint);
    }
    const anchor = this.drawingAngleSnapAnchor(drawing);
    if (!anchor) {
      return this.normalizeDrawingPoint(snappedPoint);
    }
    return this.snapPointToDrawingAngle(anchor, snappedPoint);
  }

  createSvgShape(shape, { drawingScale = 1 } = {}) {
    const geometryTool = shapeGeometryTool(shape);
    if (geometryTool === "rectangle") {
      const roundedPath = this.roundedPointPath(shape, { closed: true, drawingScale });
      const element = document.createElementNS(SVG_NS, roundedPath ? "path" : "rect");
      if (roundedPath) {
        element.setAttribute("d", roundedPath);
        element.dataset.roundedPointRender = "path";
        element.setAttribute("points", this.svgPointList(this.shapeGeometryPoints(shape), drawingScale));
      }
      element.setAttribute("x", this.scaleDrawingValue(shape.geometry.x, drawingScale));
      element.setAttribute("y", this.scaleDrawingValue(shape.geometry.y, drawingScale));
      element.setAttribute("width", this.scaleDrawingValue(shape.geometry.width, drawingScale));
      element.setAttribute("height", this.scaleDrawingValue(shape.geometry.height, drawingScale));
      this.applySvgStyle(element, shape, { drawingScale });
      return element;
    }
    if (geometryTool === "circle") {
      const element = document.createElementNS(SVG_NS, "circle");
      element.setAttribute("cx", this.scaleDrawingValue(shape.geometry.cx, drawingScale));
      element.setAttribute("cy", this.scaleDrawingValue(shape.geometry.cy, drawingScale));
      element.setAttribute("r", this.scaleDrawingValue(shape.geometry.r, drawingScale));
      this.applySvgStyle(element, shape, { drawingScale });
      return element;
    }
    if (geometryTool === "ellipse") {
      const element = document.createElementNS(SVG_NS, "ellipse");
      element.setAttribute("cx", this.scaleDrawingValue(shape.geometry.cx, drawingScale));
      element.setAttribute("cy", this.scaleDrawingValue(shape.geometry.cy, drawingScale));
      element.setAttribute("rx", this.scaleDrawingValue(shape.geometry.rx, drawingScale));
      element.setAttribute("ry", this.scaleDrawingValue(shape.geometry.ry, drawingScale));
      this.applySvgStyle(element, shape, { drawingScale });
      return element;
    }
    if (geometryTool === "line") {
      const element = document.createElementNS(SVG_NS, "line");
      element.setAttribute("x1", this.scaleDrawingValue(shape.geometry.point1.x, drawingScale));
      element.setAttribute("y1", this.scaleDrawingValue(shape.geometry.point1.y, drawingScale));
      element.setAttribute("x2", this.scaleDrawingValue(shape.geometry.point2.x, drawingScale));
      element.setAttribute("y2", this.scaleDrawingValue(shape.geometry.point2.y, drawingScale));
      this.applySvgStyle(element, shape, { drawingScale });
      return element;
    }
    if (geometryTool === "polygon") {
      const roundedPath = this.roundedPointPath(shape, { closed: true, drawingScale });
      const element = document.createElementNS(SVG_NS, roundedPath ? "path" : "polygon");
      const points = this.svgPointList(shape.geometry.points, drawingScale);
      if (roundedPath) {
        element.setAttribute("d", roundedPath);
        element.dataset.roundedPointRender = "path";
      }
      element.setAttribute("points", points);
      this.applySvgStyle(element, shape, { drawingScale });
      return element;
    }
    if (geometryTool === "polyline") {
      const roundedPath = this.roundedPointPath(shape, { closed: false, drawingScale });
      const element = document.createElementNS(SVG_NS, roundedPath ? "path" : "polyline");
      const points = this.svgPointList(shape.geometry.points, drawingScale);
      if (roundedPath) {
        element.setAttribute("d", roundedPath);
        element.dataset.roundedPointRender = "path";
      }
      element.setAttribute("points", points);
      this.applySvgStyle(element, shape, { drawingScale });
      return element;
    }
    if (geometryTool === "arc") {
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
    if (geometryTool === "text") {
      const element = document.createElementNS(SVG_NS, "text");
      element.setAttribute("x", this.scaleDrawingValue(shape.geometry.x, drawingScale));
      element.setAttribute("y", this.scaleDrawingValue(shape.geometry.y, drawingScale));
      element.setAttribute("font-size", this.scaleDrawingValue(shape.geometry.fontSize, drawingScale));
      element.textContent = shape.geometry.text;
      this.applySvgStyle(element, shape, { drawingScale });
      return element;
    }
    throw new Error(`unsupported shape tool ${shapeTool(shape)}`);
  }

  svgPointList(points, drawingScale = 1) {
    return points.map((point) => `${this.scaleDrawingValue(point.x, drawingScale)},${this.scaleDrawingValue(point.y, drawingScale)}`).join(" ");
  }

  roundedPointPath(shape, { closed, drawingScale = 1 } = {}) {
    const geometryTool = shapeGeometryTool(shape);
    if (!["polygon", "polyline", "rectangle"].includes(geometryTool)) {
      return "";
    }
    const sourcePoints = geometryTool === "rectangle" ? this.shapeGeometryPoints(shape) : shape.geometry.points;
    if (!Array.isArray(sourcePoints)) {
      return "";
    }
    const pointCount = sourcePoints.length;
    if (pointCount < (closed ? 3 : 3)) {
      return "";
    }
    const pointRounding = this.shapePointRoundingValues(shape);
    const roundedIndexes = pointRounding
      .map((isRounded, index) => isRounded === true ? index : -1)
      .filter((index) => index >= 0 && (closed || (index > 0 && index < pointCount - 1)));
    if (!roundedIndexes.length) {
      return "";
    }
    const points = sourcePoints.map((point) => ({
      x: Number(this.scaleDrawingValue(point.x, drawingScale)),
      y: Number(this.scaleDrawingValue(point.y, drawingScale))
    }));
    const preferredRadius = this.shapeRoundingRadius(shape) * drawingScale;
    if (preferredRadius <= 0) {
      return "";
    }
    const roundedVertex = (index) => {
      if (pointRounding[index] !== true || (!closed && (index === 0 || index === pointCount - 1))) {
        return null;
      }
      const previous = points[index === 0 ? pointCount - 1 : index - 1];
      const current = points[index];
      const next = points[index === pointCount - 1 ? 0 : index + 1];
      if (!previous || !current || !next) {
        return null;
      }
      const previousDistance = Math.hypot(previous.x - current.x, previous.y - current.y);
      const nextDistance = Math.hypot(next.x - current.x, next.y - current.y);
      if (previousDistance <= 0 || nextDistance <= 0) {
        return null;
      }
      const radius = Math.min(preferredRadius, previousDistance / 2, nextDistance / 2);
      if (radius <= 0) {
        return null;
      }
      return {
        after: {
          x: current.x + (next.x - current.x) / nextDistance * radius,
          y: current.y + (next.y - current.y) / nextDistance * radius
        },
        before: {
          x: current.x + (previous.x - current.x) / previousDistance * radius,
          y: current.y + (previous.y - current.y) / previousDistance * radius
        },
        current
      };
    };
    const commandPoint = (point) => `${this.formatViewportNumber(point.x)} ${this.formatViewportNumber(point.y)}`;
    const appendVertex = (commands, index) => {
      const rounded = roundedVertex(index);
      if (!rounded) {
        commands.push(`L ${commandPoint(points[index])}`);
        return;
      }
      commands.push(`L ${commandPoint(rounded.before)}`);
      commands.push(`Q ${commandPoint(rounded.current)} ${commandPoint(rounded.after)}`);
    };
    if (closed) {
      const start = roundedVertex(0)?.after || points[0];
      const commands = [`M ${commandPoint(start)}`];
      for (let index = 1; index < pointCount; index += 1) {
        appendVertex(commands, index);
      }
      appendVertex(commands, 0);
      commands.push("Z");
      return commands.join(" ");
    }
    const commands = [`M ${commandPoint(points[0])}`];
    for (let index = 1; index < pointCount - 1; index += 1) {
      appendVertex(commands, index);
    }
    commands.push(`L ${commandPoint(points[pointCount - 1])}`);
    return commands.join(" ");
  }

  applySvgStyle(element, shape, { drawingScale = 1 } = {}) {
    const geometryTool = shapeGeometryTool(shape);
    element.setAttribute("fill", shape.style.fill);
    element.setAttribute("stroke", shape.style.stroke);
    element.setAttribute("stroke-width", shape.style.strokeWidth);
    element.setAttribute("fill-opacity", shape.style.fillOpacity);
    element.setAttribute("stroke-opacity", shape.style.strokeOpacity);
    if (OPEN_POINT_STYLE_TOOLS.has(geometryTool)) {
      const lineCap = this.openShapeUsesSplitPointStyles(shape) ? "butt" : this.shapeStartPointStyle(shape);
      element.setAttribute("stroke-linecap", lineCap);
      element.setAttribute("stroke-linejoin", this.strokeLinejoinValue(this.shapeUnifiedPointStyle(shape)));
      element.dataset.pointStyle = this.shapeUnifiedPointStyle(shape);
      element.dataset.startPointStyle = this.shapeStartPointStyle(shape);
      element.dataset.endPointStyle = this.shapeEndPointStyle(shape);
    } else if (CLOSED_POINT_STYLE_TOOLS.has(geometryTool)) {
      const pointStyle = this.shapeUnifiedPointStyle(shape);
      element.setAttribute("stroke-linecap", pointStyle);
      element.setAttribute("stroke-linejoin", this.strokeLinejoinValue(pointStyle));
      element.dataset.pointStyle = pointStyle;
    }
    const transform = this.scaledDrawingTransform(this.shapeTransform(shape), drawingScale);
    element.setAttribute("transform", this.svgTransformAttribute(transform));
  }

  appendShapePointStyleCaps(parent, shape, { drawingScale = 1 } = {}) {
    const endpoints = this.openShapeEndpointPoints(shape);
    const pointMarkers = this.shapePointStyleMarkers(shape);
    if (!this.openShapeUsesSplitPointStyles(shape) && !pointMarkers.length) {
      return;
    }
    const group = document.createElementNS(SVG_NS, "g");
    group.classList.add("object-vector-studio-v2__point-style-caps");
    group.dataset.pointStyleCaps = shapeTool(shape);
    group.setAttribute("aria-hidden", "true");
    group.setAttribute("pointer-events", "none");
    group.setAttribute("transform", this.svgTransformAttribute(this.scaledDrawingTransform(this.shapeTransform(shape), drawingScale)));
    if (this.openShapeUsesSplitPointStyles(shape) && endpoints) {
      [
        ["start", endpoints.start.point, this.shapeStartPointStyle(shape), endpoints.start.angle],
        ["end", endpoints.end.point, this.shapeEndPointStyle(shape), endpoints.end.angle]
      ].forEach(([endpoint, point, pointStyle, angle]) => {
        group.append(this.createPointStyleCapMarker(point, pointStyle, shape, endpoint, drawingScale, angle));
      });
    }
    pointMarkers.forEach(({ angle = 0, markerId, point, pointStyle }) => {
      group.append(this.createPointStyleCapMarker(point, pointStyle, shape, markerId, drawingScale, angle));
    });
    parent.append(group);
  }

  shapePointStyleMarkers(shape) {
    const geometryTool = shapeGeometryTool(shape);
    if (!["polygon", "polyline", "rectangle"].includes(geometryTool)) {
      return [];
    }
    const points = this.shapeGeometryPoints(shape);
    const styles = this.shapePointStyleValues(shape);
    return points
      .map((point, index) => ({ index, point, pointStyle: styles[index] }))
      .filter(({ index, pointStyle }) => pointStyle === "round"
        && !(geometryTool === "polyline" && (index === 0 || index === points.length - 1)))
      .map(({ index, point, pointStyle }) => ({
        markerId: `point-${index}`,
        point,
        pointStyle
      }));
  }

  createPointStyleCapMarker(point, pointStyle, shape, endpoint, drawingScale, angle = 0) {
    const strokeWidth = Math.max(1, Number(shape.style?.strokeWidth) || 1);
    const size = strokeWidth;
    const x = this.scaleDrawingValue(point.x, drawingScale);
    const y = this.scaleDrawingValue(point.y, drawingScale);
    const marker = pointStyle === "square"
      ? document.createElementNS(SVG_NS, "rect")
      : document.createElementNS(SVG_NS, "circle");
    marker.classList.add("object-vector-studio-v2__point-style-cap");
    marker.dataset.pointStyleCap = endpoint;
    marker.dataset.pointStyle = pointStyle;
    marker.setAttribute("fill", shape.style.stroke);
    marker.setAttribute("fill-opacity", shape.style.strokeOpacity);
    marker.setAttribute("stroke", "none");
    if (pointStyle === "square") {
      marker.setAttribute("x", x - size / 2);
      marker.setAttribute("y", y - size / 2);
      marker.setAttribute("width", size);
      marker.setAttribute("height", size);
      marker.setAttribute("transform", `rotate(${this.formatViewportNumber(angle)} ${this.formatViewportNumber(x)} ${this.formatViewportNumber(y)})`);
      return marker;
    }
    marker.setAttribute("cx", x);
    marker.setAttribute("cy", y);
    marker.setAttribute("r", size / 2);
    return marker;
  }

  openShapeEndpointPoints(shape) {
    const geometryTool = shapeGeometryTool(shape);
    if (geometryTool === "line") {
      const start = linePoint(shape.geometry, "point1");
      const end = linePoint(shape.geometry, "point2");
      const angle = this.angleBetweenPoints(start, end);
      return {
        end: { angle, point: end },
        start: { angle, point: start }
      };
    }
    if (geometryTool === "polyline" && Array.isArray(shape.geometry?.points) && shape.geometry.points.length >= 2) {
      const points = shape.geometry.points;
      return {
        end: { angle: this.angleBetweenPoints(points.at(-2), points.at(-1)), point: points.at(-1) },
        start: { angle: this.angleBetweenPoints(points[0], points[1]), point: points[0] }
      };
    }
    if (geometryTool === "arc") {
      const start = this.polarPoint(shape.geometry.cx, shape.geometry.cy, shape.geometry.r, shape.geometry.startAngle);
      const end = this.polarPoint(shape.geometry.cx, shape.geometry.cy, shape.geometry.r, shape.geometry.endAngle);
      return {
        end: { angle: Number(shape.geometry.endAngle) + 90, point: end },
        start: { angle: Number(shape.geometry.startAngle) + 90, point: start }
      };
    }
    return null;
  }

  angleBetweenPoints(start, end) {
    if (!start || !end) {
      return 0;
    }
    return Math.atan2(Number(end.y) - Number(start.y), Number(end.x) - Number(start.x)) * 180 / Math.PI;
  }

  shapeTransform(shape) {
    return shape.transform || defaultShapeTransform(shape);
  }

  effectiveShape(shape, shapeIndex = this.selectedShapeIndex) {
    return this.effectiveShapeForFrame(shape, this.activeFrame(), shapeIndex);
  }

  effectiveShapeForFrame(shape, frame, shapeIndex) {
    const effective = JSON.parse(JSON.stringify(shape));
    const override = frame?.shapeOverrides?.find((entry) => entry.shapeIndex === shapeIndex) || null;
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
      `translate(${transform.shapeOrigin.x} ${transform.shapeOrigin.y})`,
      `rotate(${transform.rotation})`,
      `scale(${transform.scaleX} ${transform.scaleY})`,
      `translate(${-transform.shapeOrigin.x} ${-transform.shapeOrigin.y})`
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
      shapeOrigin: {
        x: this.scaleDrawingValue(transform.shapeOrigin.x, drawingScale),
        y: this.scaleDrawingValue(transform.shapeOrigin.y, drawingScale)
      },
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

  transformedPoint(point, transform) {
    const radians = (transform.rotation * Math.PI) / 180;
    const relativeX = (point.x - transform.shapeOrigin.x) * transform.scaleX;
    const relativeY = (point.y - transform.shapeOrigin.y) * transform.scaleY;
    const rotatedX = relativeX * Math.cos(radians) - relativeY * Math.sin(radians);
    const rotatedY = relativeX * Math.sin(radians) + relativeY * Math.cos(radians);

    return {
      x: transform.x + transform.shapeOrigin.x + rotatedX,
      y: transform.y + transform.shapeOrigin.y + rotatedY
    };
  }

  localPointFromTransformedPoint(point, transform) {
    const radians = (transform.rotation * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const dx = Number(point.x) - transform.x - transform.shapeOrigin.x;
    const dy = Number(point.y) - transform.y - transform.shapeOrigin.y;
    const unrotatedX = dx * cos + dy * sin;
    const unrotatedY = -dx * sin + dy * cos;
    return {
      x: this.formatViewportNumber(transform.shapeOrigin.x + unrotatedX / transform.scaleX),
      y: this.formatViewportNumber(transform.shapeOrigin.y + unrotatedY / transform.scaleY)
    };
  }

  transformWithBalancedOrigin(transform, worldCenter) {
    const normalized = this.ensureShapeTransform({ transform });
    const origin = this.localPointFromTransformedPoint(worldCenter, normalized);
    return {
      ...normalized,
      shapeOrigin: origin,
      x: this.formatViewportNumber(worldCenter.x - origin.x),
      y: this.formatViewportNumber(worldCenter.y - origin.y)
    };
  }

  transformWithScaledOriginAroundPivot(transform, pivot, scale) {
    const normalized = this.ensureShapeTransform({ transform });
    const originWorld = this.transformedPoint(normalized.shapeOrigin, normalized);
    const nextOriginWorld = {
      x: this.formatViewportNumber(pivot.x + (originWorld.x - pivot.x) * scale),
      y: this.formatViewportNumber(pivot.y + (originWorld.y - pivot.y) * scale)
    };
    return {
      ...normalized,
      scaleX: Number(scale.toFixed(3)),
      scaleY: Number(scale.toFixed(3)),
      x: this.formatViewportNumber(nextOriginWorld.x - normalized.shapeOrigin.x),
      y: this.formatViewportNumber(nextOriginWorld.y - normalized.shapeOrigin.y)
    };
  }

  transformedBounds(shape, { drawingScale = 1 } = {}) {
    const transform = this.shapeTransform(shape);
    const points = shapeBoundsPoints(shape).map((point) => this.transformedPoint(point, transform));
    const xValues = points.map((point) => point.x);
    const yValues = points.map((point) => point.y);
    const minX = Math.min(...xValues);
    const minY = Math.min(...yValues);
    const origin = this.transformedPoint(transform.shapeOrigin, transform);

    return this.scaledDrawingBounds({
      height: Math.max(1, Math.max(...yValues) - minY),
      originX: origin.x,
      originY: origin.y,
      width: Math.max(1, Math.max(...xValues) - minX),
      x: minX,
      y: minY
    }, drawingScale);
  }

  objectBounds(object, { drawingScale = 1, includeInvisible = true } = {}) {
    const activeFrame = object?.id === this.selectedObjectId ? this.activeFrame() : null;
    const shapes = sortedShapes(object)
      .map((shape, shapeIndex) => ({ shape, shapeIndex }))
      .map(({ shape, shapeIndex }) => ({
        shape: this.effectiveShapeForFrame(shape, activeFrame, shapeIndex),
        shapeIndex
      }))
      .filter((entry) => includeInvisible || entry.shape.visible !== false);
    if (!shapes.length) {
      return {
        height: 80,
        width: 120,
        x: -60,
        y: -40
      };
    }

    const bounds = shapes.map(({ shape }) => this.transformedBounds(shape, { drawingScale }));
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
      .map((shape, shapeIndex) => this.effectiveShapeForFrame(shape, frame, shapeIndex))
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

  shapeSetBounds(object, shapeIndexes, { drawingScale = 1, includeInvisible = false } = {}) {
    const activeFrame = object?.id === this.selectedObjectId ? this.activeFrame() : null;
    const objectShapes = sortedShapes(object);
    const targetIndexes = Array.from(new Set(Array.from(shapeIndexes || [])
      .map((shapeIndex) => normalizeShapeIndex(shapeIndex))
      .filter((shapeIndex) => shapeIndex >= 0 && shapeIndex < objectShapes.length)))
      .sort((left, right) => left - right);
    const shapes = targetIndexes
      .map((shapeIndex) => this.effectiveShapeForFrame(objectShapes[shapeIndex], activeFrame, shapeIndex))
      .filter((shape) => includeInvisible || shape.visible !== false);
    if (!shapes.length) {
      return null;
    }
    const bounds = shapes.map((shape) => this.transformedBounds(shape, { drawingScale }));
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
      box.dataset.selectionBounds = String(this.selectedShapeIndex);
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
        point.dataset.resizeShapeIndex = String(this.selectedShapeIndex);
        if (shapeGeometryTool(selectedShape) === "rectangle") {
          point.classList.add("object-vector-studio-v2__geometry-point-handle");
          point.dataset.geometryPointHandle = `rectangle-${handle}`;
          point.dataset.geometryPointKind = "rectangle-corner";
        }
        const handleSize = shapeGeometryTool(selectedShape) === "circle" ? 5 : 3;
        point.setAttribute("x", cx - handleSize / 2);
        point.setAttribute("y", cy - handleSize / 2);
        point.setAttribute("width", handleSize);
        point.setAttribute("height", handleSize);
        point.addEventListener("pointerdown", (event) => this.startPreviewHandleEdit(event, this.selectedShapeIndex, { handle, mode: "resize" }));
        this.elements.renderSurface.append(point);
      });

      this.renderGeometryPointHandles(selectedShape);

      const pivot = document.createElementNS(SVG_NS, "g");
      pivot.classList.add("object-vector-studio-v2__pivot-origin");
      pivot.dataset.pivotOrigin = String(this.selectedShapeIndex);
      pivot.setAttribute("role", "img");
      pivot.setAttribute("aria-label", "Origin/Pivot marker for selected shape rotation and scale");
      const pivotTitle = document.createElementNS(SVG_NS, "title");
      pivotTitle.textContent = "Origin/Pivot: rotate and scale pivot for the selected shape.";
      const horizontal = document.createElementNS(SVG_NS, "line");
      horizontal.setAttribute("x1", bounds.originX - 4);
      horizontal.setAttribute("x2", bounds.originX + 4);
      horizontal.setAttribute("y1", bounds.originY);
      horizontal.setAttribute("y2", bounds.originY);
      const vertical = document.createElementNS(SVG_NS, "line");
      vertical.setAttribute("x1", bounds.originX);
      vertical.setAttribute("x2", bounds.originX);
      vertical.setAttribute("y1", bounds.originY - 4);
      vertical.setAttribute("y2", bounds.originY + 4);
      pivot.append(pivotTitle, horizontal, vertical);
      this.elements.renderSurface.append(pivot);
    } catch (error) {
      this.statusLog.write(`FAIL Selection overlay render failed for ${object.name}/shape-${this.selectedShapeIndex} (${shapeTool(selectedShape)}): ${error.message}`);
    }
  }

  renderGeometryPointHandles(shape) {
    const effectiveShape = this.effectiveShape(shape);
    const transform = this.shapeTransform(effectiveShape);
    this.geometryPointHandleDefinitions(effectiveShape).forEach((definition) => {
      const position = this.transformedPoint(definition.point, transform);
      const point = document.createElementNS(SVG_NS, "rect");
      point.classList.add("object-vector-studio-v2__resize-handle", "object-vector-studio-v2__geometry-point-handle");
      if (definition.className) {
        point.classList.add(definition.className);
      }
      point.dataset.geometryPointHandle = definition.id;
      point.dataset.geometryPointKind = definition.kind;
      point.dataset.resizeShapeIndex = String(this.selectedShapeIndex);
      if (definition.endpoint) {
        point.dataset.lineEndpoint = definition.endpoint;
      }
      point.setAttribute("x", this.scaleDrawingValue(position.x, OBJECT_PREVIEW_DRAWING_SCALE) - 2);
      point.setAttribute("y", this.scaleDrawingValue(position.y, OBJECT_PREVIEW_DRAWING_SCALE) - 2);
      point.setAttribute("width", 4);
      point.setAttribute("height", 4);
      point.setAttribute("aria-label", definition.label);
      point.addEventListener("pointerdown", (event) => this.startPreviewHandleEdit(event, this.selectedShapeIndex, definition.editOptions));
      this.elements.renderSurface.append(point);
    });
  }

  geometryPointHandleDefinitions(shape) {
    const geometryTool = shapeGeometryTool(shape);
    const geometry = shape.geometry;
    if (geometryTool === "polygon" || geometryTool === "polyline") {
      return geometry.points.map((point, index) => ({
        editOptions: {
          mode: "geometry-point",
          point: { ...point },
          pointIndex: index
        },
        id: `${geometryTool}-${index}`,
        kind: this.isTriangleShape(shape) ? "triangle-point" : `${geometryTool}-point`,
        label: `Move point ${index + 1}`,
        point
      }));
    }
    if (geometryTool === "line") {
      return [
        ["start", "point1", linePoint(geometry, "point1")],
        ["end", "point2", linePoint(geometry, "point2")]
      ].map(([endpoint, key, point], index) => ({
        className: "object-vector-studio-v2__line-endpoint-handle",
        editOptions: {
          endpoint,
          mode: "line-endpoint"
        },
        endpoint,
        id: `line-${endpoint}`,
        kind: key,
        label: `Move line point ${index + 1}`,
        point
      }));
    }
    if (geometryTool === "circle") {
      return [
        {
          control: "center",
          id: "circle-center",
          kind: "center",
          label: "Move circle center",
          point: { x: geometry.cx, y: geometry.cy }
        },
        {
          control: "radius",
          id: "circle-radius",
          kind: "radius",
          label: "Adjust circle radius",
          point: { x: geometry.cx + geometry.r, y: geometry.cy }
        }
      ].map((definition) => ({
        ...definition,
        editOptions: {
          control: definition.control,
          mode: "geometry-point",
          point: { ...definition.point }
        }
      }));
    }
    if (geometryTool === "ellipse") {
      return [
        {
          control: "center",
          id: "ellipse-center",
          kind: "center",
          label: "Move ellipse center",
          point: { x: geometry.cx, y: geometry.cy }
        },
        {
          control: "rx",
          id: "ellipse-rx",
          kind: "rx",
          label: "Adjust ellipse rx",
          point: { x: geometry.cx + geometry.rx, y: geometry.cy }
        },
        {
          control: "ry",
          id: "ellipse-ry",
          kind: "ry",
          label: "Adjust ellipse ry",
          point: { x: geometry.cx, y: geometry.cy + geometry.ry }
        }
      ].map((definition) => ({
        ...definition,
        editOptions: {
          control: definition.control,
          mode: "geometry-point",
          point: { ...definition.point }
        }
      }));
    }
    if (geometryTool === "arc") {
      return [
        {
          control: "center",
          id: "arc-center",
          kind: "center",
          label: "Move arc center",
          point: { x: geometry.cx, y: geometry.cy }
        },
        {
          control: "start",
          id: "arc-start",
          kind: "startAngle",
          label: "Move arc start point",
          point: this.polarPoint(geometry.cx, geometry.cy, geometry.r, geometry.startAngle)
        },
        {
          control: "end",
          id: "arc-end",
          kind: "endAngle",
          label: "Move arc end point",
          point: this.polarPoint(geometry.cx, geometry.cy, geometry.r, geometry.endAngle)
        }
      ].map((definition) => ({
        ...definition,
        editOptions: {
          control: definition.control,
          mode: "geometry-point",
          point: { ...definition.point }
        }
      }));
    }
    if (geometryTool === "text") {
      const point = { x: geometry.x, y: geometry.y };
      return [
        {
          editOptions: {
            control: "anchor",
            mode: "geometry-point",
            point: { ...point }
          },
          id: "text-anchor",
          kind: "anchor",
          label: "Move text anchor",
          point
        }
      ];
    }
    return [];
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
    this.elements.coordinateDisplay.textContent = `Origin: ${this.formatLogicalCoordinate(this.viewport.x)}, ${this.formatLogicalCoordinate(this.viewport.y)} | ${this.canvasOriginDisplayText()} | Zoom ${this.formatZoomPercentage() * 10}%`;
  }

  formatViewportNumber(value) {
    const normalized = Number(Number(value).toFixed(3));
    return Object.is(normalized, -0) ? 0 : normalized;
  }

  canvasOriginDisplayText() {
    const x = this.formatLogicalCoordinate(-this.viewport.x);
    const y = this.formatLogicalCoordinate(-this.viewport.y);
    if (x === 0 && y === 0) {
      return "Canvas origin 0,0 centered";
    }
    return `Canvas origin ${x},${y} from center`;
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

  zoomViewportByStepAtPointer(step, event) {
    const nextZoom = Number((this.viewport.zoom + step).toFixed(3));
    this.zoomViewportAtPointer(nextZoom, event);
  }

  zoomViewport(nextZoom) {
    if (!Number.isFinite(nextZoom)) {
      this.statusLog.write("WARN Viewport zoom skipped: zoom value is invalid.");
      return;
    }
    this.viewport.zoom = this.clampedViewportZoom(nextZoom);
    this.updateViewport();
    this.renderWorkSurface();
    this.statusLog.write(`OK Viewport zoom set to ${this.formatZoomPercentage() * 10}%.`);
  }

  zoomViewportAtPointer(nextZoom, event) {
    if (!Number.isFinite(nextZoom)) {
      this.statusLog.write("WARN Viewport zoom skipped: zoom value is invalid.");
      return;
    }
    const anchor = this.viewportPointFromEvent(event);
    if (!anchor) {
      this.zoomViewport(nextZoom);
      return;
    }
    const zoom = this.clampedViewportZoom(nextZoom);
    const viewWidth = DEFAULT_VIEWPORT.width / zoom;
    const viewHeight = DEFAULT_VIEWPORT.height / zoom;
    this.viewport.zoom = zoom;
    this.viewport.x = Number((anchor.x - (anchor.ratioX - 0.5) * viewWidth).toFixed(6));
    this.viewport.y = Number((anchor.y - (anchor.ratioY - 0.5) * viewHeight).toFixed(6));
    this.updateViewport();
    this.renderWorkSurface();
    this.updateCoordinateDisplay(event);
    this.statusLog.write(`OK Viewport zoom set to ${this.formatZoomPercentage() * 10}%.`);
  }

  clampedViewportZoom(zoom) {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(zoom.toFixed(3))));
  }

  panViewport(x, y) {
    this.viewport.x = Number((this.viewport.x + x).toFixed(3));
    this.viewport.y = Number((this.viewport.y + y).toFixed(3));
    this.updateViewport();
    this.statusLog.write(`OK Viewport pan set to ${this.viewport.x}, ${this.viewport.y}.`);
  }

  toggleCenterOriginMarker() {
    this.centerOriginVisible = !this.centerOriginVisible;
    this.window.sessionStorage?.setItem(CENTER_ORIGIN_SESSION_KEY, this.centerOriginVisible ? "1" : "0");
    this.applySnapState();
    this.renderWorkSurface();
    this.statusLog.write(`OK Center dot ${this.centerOriginVisible ? "visible" : "hidden"}.`);
  }

  resetViewport() {
    this.viewport = { ...DEFAULT_VIEWPORT };
    this.updateViewport();
    this.statusLog.write(`OK Viewport reset to ${this.formatZoomPercentage() * 10}% at origin 0,0.`);
  }

  updateCoordinateDisplay(event) {
    const point = this.viewportPointFromEvent(event);
    if (!point) {
      return;
    }
    this.elements.coordinateDisplay.textContent = `Pointer ${this.formatLogicalPointerCoordinate(point.x)}, ${this.formatLogicalPointerCoordinate(point.y)} | ${this.canvasOriginDisplayText()} | Zoom ${this.formatZoomPercentage() * 10}%`;
  }

  viewportPointFromEvent(event) {
    return this.viewportPointFromClient(event.clientX, event.clientY);
  }

  viewportPointFromClient(clientX, clientY, zoom = this.viewport.zoom, viewport = this.viewport) {
    const bounds = this.elements.renderSurface.getBoundingClientRect();
    if (!bounds.width || !bounds.height) {
      return null;
    }
    const ratioX = (clientX - bounds.left) / bounds.width;
    const ratioY = (clientY - bounds.top) / bounds.height;
    const viewWidth = DEFAULT_VIEWPORT.width / zoom;
    const viewHeight = DEFAULT_VIEWPORT.height / zoom;
    return {
      ratioX,
      ratioY,
      x: viewport.x - viewWidth / 2 + ratioX * viewWidth,
      y: viewport.y - viewHeight / 2 + ratioY * viewHeight
    };
  }

  pointerPreviewPoint(event) {
    const point = this.viewportPointFromEvent(event);
    if (!point) {
      return { x: 0, y: 0 };
    }
    return {
      x: this.formatViewportNumber(point.x / OBJECT_PREVIEW_DRAWING_SCALE),
      y: this.formatViewportNumber(point.y / OBJECT_PREVIEW_DRAWING_SCALE)
    };
  }

  startDrawingMode(tool) {
    if (!PRIMITIVE_TOOLS.includes(tool)) {
      this.statusLog.write(`WARN Drawing mode skipped: ${tool || "unknown"} is not a drawable shape tool.`);
      return;
    }
    this.activeTool = tool;
    this.previewPointerEdit = null;
    this.activeDrawing = this.createDrawingState(tool);
    this.drawingPreviewPoint = null;
    this.drawingHintClientPoint = null;
    this.renderWorkSurface();
    const objectHint = this.selectedObject() ? "" : " Select a schema-valid object before committing geometry.";
    const drawingHelp = ["polygon", "polyline"].includes(tool)
      ? "Click to add points.\n\nDouble-click to finish."
      : "Click once to start, move to preview, then click again to finish.";
    this.statusLog.write(`OK Drawing mode selected: ${shapeTypeLabel(tool)}. ${drawingHelp}${objectHint}`);
  }

  createDrawingState(tool) {
    const flow = ["polygon", "polyline"].includes(tool)
      ? "points"
      : "two-click";
    return {
      flow,
      points: [],
      preview: null,
      start: null,
      style: this.drawingStyleFromActivePalette(),
      tool
    };
  }

  drawingStyleFromActivePalette() {
    const { pointStyle, startPointStyle, endPointStyle, strokeLinecap, ...styleDefault } = this.schemaDefault("style");
    const strokeWidth = Number(this.elements.strokeWidth?.value);
    return {
      ...styleDefault,
      fill: TRANSPARENT_STYLE_COLOR,
      fillOpacity: this.selectedFillOpacity,
      stroke: this.selectedStrokeColor || this.currentTargetColor() || "#ffffff",
      strokeOpacity: this.selectedStrokeOpacity,
      strokeWidth: Number.isFinite(strokeWidth) && strokeWidth > 0 ? strokeWidth : styleDefault.strokeWidth
    };
  }

  cancelActiveDrawing(sourceLabel = "cancel", { log = true } = {}) {
    if (!this.activeDrawing) {
      return;
    }
    const tool = this.activeDrawing.tool;
    this.activeDrawing = null;
    this.drawingPreviewPoint = null;
    this.drawingHintClientPoint = null;
    this.activeTool = "select";
    const selectButton = this.elements.toolToggles.find((candidate) => candidate.dataset.shapeTool === "select") || null;
    this.setActiveToolButton(selectButton);
    this.renderWorkSurface();
    if (log) {
      this.statusLog.write(`OK Canceled ${shapeTypeLabel(tool)} drawing from ${sourceLabel}; no invalid geometry was committed.`);
    }
  }

  handleRenderSurfacePointerDown(event) {
    if (this.activeDrawing) {
      this.handleDrawingPointerDown(event);
      return;
    }
    if (event.button !== 0 || this.previewPointerEdit) {
      return;
    }
    if (event.target === this.elements.renderSurface || event.target?.classList?.contains("object-vector-studio-v2__svg-grid") || event.target?.classList?.contains("object-vector-studio-v2__center-origin-dot")) {
      this.deselectShape("empty canvas");
    }
  }

  deselectShape(sourceLabel = "selection") {
    if (this.selectedShapeIndex < 0 && !this.selectedShapeIndexes.size && !this.directSelectedShapeIndexes.size) {
      return;
    }
    this.selectedShapeIndex = -1;
    this.selectedShapeIndexes.clear();
    this.directSelectedShapeIndexes.clear();
    this.renderObjectTiles();
    this.renderSelectedObject();
    this.renderWorkSurface();
    this.updateObjectActionState();
    this.statusLog.write(`OK Deselected shape from ${sourceLabel}.`);
  }

  handleDrawingPointerDown(event) {
    const drawing = this.activeDrawing;
    if (!drawing || event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const point = this.snapDrawingPoint(this.pointerPreviewPoint(event), drawing);
    this.drawingPreviewPoint = point;
    this.drawingHintClientPoint = { x: event.clientX, y: event.clientY };
    if (drawing.flow === "points") {
      if (!drawing.points.length) {
        drawing.style = this.drawingStyleFromActivePalette();
      }
      drawing.points.push(point);
      drawing.preview = point;
      this.renderWorkSurface();
      this.statusLog.write(`OK Added ${shapeTypeLabel(drawing.tool)} point ${drawing.points.length}.`);
      return;
    }
    if (drawing.flow === "two-click") {
      if (!drawing.start) {
        drawing.style = this.drawingStyleFromActivePalette();
        drawing.start = point;
        drawing.preview = null;
        this.renderWorkSurface();
        this.statusLog.write(`OK Started ${shapeTypeLabel(drawing.tool)} drawing.`);
        return;
      }
      drawing.preview = point;
      const geometry = this.geometryFromDrawingPoints(drawing.tool, [drawing.start, point], point);
      this.commitDrawnShape(drawing.tool, geometry, "canvas click");
      return;
    }
    this.renderWorkSurface();
  }

  updateDrawingPreview(event) {
    const drawing = this.activeDrawing;
    if (!drawing) {
      return;
    }
    if (drawing.flow === "two-click" && !drawing.start) {
      return;
    }
    const point = this.snapDrawingPoint(this.pointerPreviewPoint(event), drawing);
    if (drawing.preview && Math.abs(point.x - drawing.preview.x) < 0.001 && Math.abs(point.y - drawing.preview.y) < 0.001) {
      return;
    }
    drawing.preview = point;
    this.drawingPreviewPoint = point;
    this.drawingHintClientPoint = { x: event.clientX, y: event.clientY };
    this.renderWorkSurface();
  }

  finishMultiPointDrawing(sourceLabel = "finish", event = null) {
    const drawing = this.activeDrawing;
    if (!drawing || drawing.flow !== "points" || !["polygon", "polyline"].includes(drawing.tool)) {
      return;
    }
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const geometry = this.geometryFromDrawingPoints(drawing.tool, drawing.points, drawing.preview || drawing.points.at(-1));
    this.commitDrawnShape(drawing.tool, geometry, sourceLabel);
  }

  previewShapeFromDrawing() {
    const drawing = this.activeDrawing;
    if (!drawing) {
      return null;
    }
    const points = [...drawing.points];
    if (drawing.flow === "points" && drawing.preview && points.length) {
      points.push(drawing.preview);
    }
    if (drawing.flow === "two-click" && drawing.start && drawing.preview) {
      points.push(drawing.start, drawing.preview);
    }
    if (!points.length) {
      return null;
    }
    const geometry = this.geometryFromDrawingPoints(drawing.tool === "polygon" && points.length < 4 ? "polyline" : drawing.tool, points, drawing.preview);
    if (!geometry) {
      return null;
    }
    const tool = drawing.tool === "polygon" && points.length < 4 ? "polyline" : drawing.tool;
    const shape = {
      geometry,
      locked: false,
      order: 0,
      style: {
        ...drawing.style
      },
      tool,
      transform: {
        shapeOrigin: { x: 0, y: 0 },
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        x: 0,
        y: 0
      },
      visible: true
    };
    shape.transform = defaultShapeTransform(shape);
    return shape;
  }

  geometryFromDrawingPoints(tool, points, previewPoint = null) {
    const cleanPoints = points
      .filter(Boolean)
      .map((point) => ({
        x: this.formatViewportNumber(point.x),
        y: this.formatViewportNumber(point.y)
      }));
    if (tool === "line") {
      if (cleanPoints.length < 2) {
        return null;
      }
      return { point1: cleanPoints[0], point2: cleanPoints[1] };
    }
    if (tool === "polygon" || tool === "polyline") {
      return { points: cleanPoints };
    }
    if (tool === "rectangle" || tool === "square") {
      if (cleanPoints.length < 2) {
        return null;
      }
      const [start, end] = cleanPoints;
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);
      if (tool === "square") {
        const size = Math.max(width, height);
        return {
          height: size,
          width: size,
          x: end.x < start.x ? start.x - size : start.x,
          y: end.y < start.y ? start.y - size : start.y
        };
      }
      return {
        height,
        width,
        x: Math.min(start.x, end.x),
        y: Math.min(start.y, end.y)
      };
    }
    if (tool === "triangle") {
      if (cleanPoints.length < 2) {
        return null;
      }
      const [start, end] = cleanPoints;
      const minX = Math.min(start.x, end.x);
      const maxX = Math.max(start.x, end.x);
      const minY = Math.min(start.y, end.y);
      const maxY = Math.max(start.y, end.y);
      return {
        points: [
          { x: Number(((minX + maxX) / 2).toFixed(3)), y: minY },
          { x: maxX, y: maxY },
          { x: minX, y: maxY }
        ]
      };
    }
    if (tool === "circle") {
      if (cleanPoints.length < 2) {
        return null;
      }
      const [center, edge] = cleanPoints;
      return {
        cx: center.x,
        cy: center.y,
        r: this.radiusFromControlPoint(center, edge)
      };
    }
    if (tool === "ellipse") {
      if (cleanPoints.length < 2) {
        return null;
      }
      const [start, end] = cleanPoints;
      return {
        cx: Number(((start.x + end.x) / 2).toFixed(3)),
        cy: Number(((start.y + end.y) / 2).toFixed(3)),
        rx: Number((Math.max(0, Math.abs(end.x - start.x)) / 2).toFixed(3)),
        ry: Number((Math.max(0, Math.abs(end.y - start.y)) / 2).toFixed(3))
      };
    }
    if (tool === "arc") {
      if (cleanPoints.length < 2) {
        return null;
      }
      const [center, edge] = cleanPoints;
      return {
        cx: center.x,
        cy: center.y,
        endAngle: 135,
        r: this.radiusFromControlPoint(center, edge),
        startAngle: -135
      };
    }
    if (tool === "text") {
      if (cleanPoints.length < 2) {
        return null;
      }
      const [start, end] = cleanPoints;
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);
      if (width <= 0 && height <= 0) {
        return null;
      }
      const fontSize = Number(Math.max(1, height || width * 0.5).toFixed(3));
      return {
        fontSize,
        text: "Text",
        x: Math.min(start.x, end.x),
        y: Number((Math.min(start.y, end.y) + fontSize).toFixed(3))
      };
    }
    return null;
  }

  validateDrawnGeometry(tool, geometry) {
    if (!geometry) {
      return `${shapeTypeLabel(tool)} drawing has no geometry.`;
    }
    if (tool === "line") {
      const distance = Math.hypot(geometry.point2.x - geometry.point1.x, geometry.point2.y - geometry.point1.y);
      return distance > 0 ? "" : "line requires two distinct points.";
    }
    if (tool === "polyline") {
      return geometry.points.length >= 2 ? "" : "polyline requires at least two points.";
    }
    if (tool === "polygon") {
      return geometry.points.length >= 4 ? "" : "polygon requires at least four points.";
    }
    if (tool === "triangle") {
      return geometry.points.length === 3 ? "" : "triangle requires exactly three points.";
    }
    if (tool === "rectangle" || tool === "square") {
      return geometry.width > 0 && geometry.height > 0 ? "" : `${shapeTypeLabel(tool)} requires non-zero width and height.`;
    }
    if (tool === "circle" || tool === "arc") {
      return geometry.r > 0 ? "" : `${shapeTypeLabel(tool)} requires a non-zero radius.`;
    }
    if (tool === "ellipse") {
      return geometry.rx > 0 && geometry.ry > 0 ? "" : "ellipse requires non-zero rx and ry.";
    }
    if (tool === "text") {
      return geometry.text && geometry.fontSize > 0 ? "" : "text requires two distinct points, content, and a positive font size.";
    }
    return "";
  }

  commitDrawnShape(type, geometry, sourceLabel) {
    const geometryError = this.validateDrawnGeometry(type, geometry);
    if (geometryError) {
      this.statusLog.write(`FAIL Create ${type} blocked: ${geometryError}`);
      return;
    }
    this.createShape(type, { geometry, sourceLabel, style: this.activeDrawing?.style || null });
  }

  startPreviewShapeMove(event, shapeIndex) {
    const normalizedIndex = normalizeShapeIndex(shapeIndex);
    if (event.button !== 0 || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey || !this.selectedShapeIndexes.has(normalizedIndex)) {
      return;
    }
    const selected = this.selectedShape();
    if (!selected || this.selectedShapeIndex !== normalizedIndex) {
      return;
    }
    event.preventDefault();
    const object = this.selectedObject();
    const objectShapes = sortedShapes(object);
    const groupId = String(objectShapes[normalizedIndex]?.groupId || "").trim();
    const targetIndexes = this.shapeBelongsToValidGroup(object, normalizedIndex)
      ? this.shapeSelectionGroupIndexes(objectShapes, normalizedIndex)
      : [normalizedIndex];
    if (targetIndexes.length > 1) {
      const lockedIndex = targetIndexes.find((targetIndex) => objectShapes[targetIndex]?.locked);
      if (Number.isInteger(lockedIndex)) {
        this.statusLog.write(`WARN Drag group skipped: shape row ${lockedIndex} is locked.`);
        return;
      }
      const activeFrame = this.activeFrame();
      this.selectedShapeIndexes = new Set(targetIndexes);
      this.directSelectedShapeIndexes = new Set([normalizedIndex]);
      this.previewPointerEdit = {
        mode: "move-group",
        groupId,
        historyRecorded: false,
        historySnapshot: this.cloneCurrentPayload(),
        lastDelta: { x: 0, y: 0 },
        originalTransforms: Object.fromEntries(targetIndexes.map((targetIndex) => {
          const effectiveShape = this.effectiveShapeForFrame(objectShapes[targetIndex], activeFrame, targetIndex);
          return [targetIndex, this.ensureShapeTransform(effectiveShape)];
        })),
        shapeIndex: normalizedIndex,
        start: this.snapCanvasPoint(this.pointerPreviewPoint(event), { excludeShapeIndex: normalizedIndex }),
        targetIndexes
      };
      return;
    }
    this.previewPointerEdit = {
      mode: "move",
      historyRecorded: false,
      historySnapshot: this.cloneCurrentPayload(),
      lastDelta: { x: 0, y: 0 },
      originalGeometry: JSON.parse(JSON.stringify(selected.geometry)),
      originalTransform: { ...this.shapeTransform(selected) },
      shapeIndex: normalizedIndex,
      start: this.snapCanvasPoint(this.pointerPreviewPoint(event), { excludeShapeIndex: normalizedIndex })
    };
  }

  startPreviewHandleEdit(event, shapeIndex, options) {
    const normalizedIndex = normalizeShapeIndex(shapeIndex);
    if (event.button !== 0) {
      return;
    }
    const selected = this.selectedShape();
    if (!selected || this.selectedShapeIndex !== normalizedIndex) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.previewPointerEdit = {
      ...options,
      historyRecorded: false,
      historySnapshot: this.cloneCurrentPayload(),
      lastDelta: { x: 0, y: 0 },
      originalGeometry: JSON.parse(JSON.stringify(selected.geometry)),
      originalTransform: { ...this.shapeTransform(selected) },
      shapeIndex: normalizedIndex,
      start: this.snapCanvasPoint(this.pointerPreviewPoint(event), { excludeShapeIndex: normalizedIndex })
    };
  }

  previewPointerEditDelta(edit, event) {
    const rawEnd = this.pointerPreviewPoint(event);
    const end = this.snapCanvasPoint(rawEnd, { excludeShapeIndex: edit.shapeIndex });
    return {
      x: this.formatViewportNumber(end.x - edit.start.x),
      y: this.formatViewportNumber(end.y - edit.start.y)
    };
  }

  updatePreviewPointerEdit(event) {
    const edit = this.previewPointerEdit;
    if (!edit || event.buttons !== 1) {
      return;
    }
    const delta = this.previewPointerEditDelta(edit, event);
    if (Math.abs(delta.x - edit.lastDelta.x) < 0.001 && Math.abs(delta.y - edit.lastDelta.y) < 0.001) {
      return;
    }
    this.recordPreviewPointerEditStart(edit);
    edit.lastDelta = delta;
    this.applyPreviewPointerEdit(edit, delta, { live: true });
  }

  finishPreviewPointerEdit(event) {
    const edit = this.previewPointerEdit;
    if (!edit) {
      return;
    }
    this.previewPointerEdit = null;
    const delta = this.previewPointerEditDelta(edit, event);
    if (Math.abs(delta.x) < 0.001 && Math.abs(delta.y) < 0.001) {
      return;
    }
    this.recordPreviewPointerEditStart(edit);
    this.applyPreviewPointerEdit(edit, delta, { live: false });
  }

  recordPreviewPointerEditStart(edit) {
    if (edit.historyRecorded || !edit.historySnapshot) {
      return;
    }
    this.previewUndoStack.push(this.clonePayloadValue(edit.historySnapshot));
    if (this.previewUndoStack.length > PREVIEW_HISTORY_LIMIT) {
      this.previewUndoStack.shift();
    }
    this.previewRedoStack = [];
    edit.historyRecorded = true;
    this.updatePreviewEditActionState();
  }

  applyPreviewPointerEdit(edit, delta, { live = false } = {}) {
    if (edit.mode === "move") {
      this.updateSelectedShapeTransform("preview move", (shape) => {
        shape.transform = this.ensureShapeTransform(shape);
        shape.transform.x = Number((edit.originalTransform.x + delta.x).toFixed(3));
        shape.transform.y = Number((edit.originalTransform.y + delta.y).toFixed(3));
      }, `OK ${live ? "Live " : ""}Dragged shape row ${edit.shapeIndex} by ${delta.x}, ${delta.y}.`, { skipPreviewHistory: true });
      return;
    }

    if (edit.mode === "move-group") {
      this.applyPreviewGroupMove(edit, delta, { live });
      return;
    }

    if (edit.mode === "line-endpoint") {
      this.updateSelectedShapeGeometry("preview line endpoint", (shape) => {
        shape.geometry = this.previewLineEndpointGeometry(shape, edit, delta);
      }, `OK ${live ? "Live " : ""}Moved line ${edit.endpoint} for shape row ${edit.shapeIndex}.`, { skipPreviewHistory: true });
      return;
    }

    if (edit.mode === "geometry-point") {
      this.updateSelectedShapeGeometry("preview point handle", (shape) => {
        shape.geometry = this.previewGeometryPointGeometry(shape, edit, delta);
      }, `OK ${live ? "Live " : ""}Moved geometry point ${edit.control || edit.pointIndex + 1 || "handle"} for shape row ${edit.shapeIndex}.`, { skipPreviewHistory: true });
      return;
    }

    if (edit.mode === "resize") {
      this.updateSelectedShapeGeometry("preview resize", (shape) => {
        shape.geometry = this.previewResizeGeometry(shape, edit, delta);
      }, `OK ${live ? "Live " : ""}Resized shape row ${edit.shapeIndex} with ${edit.handle} handle.`, { skipPreviewHistory: true });
    }
  }

  applyPreviewGroupMove(edit, delta, { live = false } = {}) {
    const object = this.selectedObject();
    const objectShapes = sortedShapes(object);
    const targetIndexes = Array.from(new Set((edit.targetIndexes || [])
      .map((shapeIndex) => normalizeShapeIndex(shapeIndex))
      .filter((shapeIndex) => shapeIndex >= 0 && shapeIndex < objectShapes.length)))
      .sort((left, right) => left - right);
    if (!object || targetIndexes.length < 2) {
      this.statusLog.write("WARN Drag group skipped: selected group is not available.");
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const activeFrame = this.activeFrame();
    try {
      targetIndexes.forEach((shapeIndex) => {
        const originalTransform = edit.originalTransforms?.[shapeIndex];
        if (!originalTransform) {
          throw new Error(`shape row ${shapeIndex} original transform is not available.`);
        }
        const override = this.frameOverrideInPayload(nextPayload, shapeIndex, { create: true });
        const baseShape = this.findShapeInPayload(nextPayload, shapeIndex);
        const shape = override
          ? this.effectiveShapeForFrame(baseShape, activeFrame, shapeIndex)
          : baseShape;
        if (!shape) {
          throw new Error(`shape row ${shapeIndex} is not available.`);
        }
        shape.transform = this.ensureShapeTransform({
          transform: {
            ...originalTransform,
            x: Number((originalTransform.x + delta.x).toFixed(3)),
            y: Number((originalTransform.y + delta.y).toFixed(3))
          }
        });
        const transformErrors = this.validateShapeForTransform(shape);
        if (transformErrors.length) {
          throw new Error(`shape row ${shapeIndex}: ${transformErrors.join(" ")}`);
        }
        if (override) {
          override.transform = this.ensureShapeTransform(shape);
        }
      });
    } catch (error) {
      this.statusLog.write(`FAIL Invalid drag rejected for group ${edit.groupId || "selected group"}: ${error.message}`);
      return;
    }

    this.commitPayloadUpdate(nextPayload, object.id, this.selectedShapeIndex, `OK ${live ? "Live " : ""}Dragged group ${edit.groupId || "selected group"} (${targetIndexes.length} shapes) by ${delta.x}, ${delta.y}.`, "Drag group failed schema validation", {
      directSelectedShapeIndexes: new Set([edit.shapeIndex]),
      selectedShapeIndexes: new Set(targetIndexes),
      skipPreviewHistory: true
    });
  }

  previewLineEndpointGeometry(shape, edit, delta) {
    const geometry = JSON.parse(JSON.stringify(edit.originalGeometry));
    if (shapeGeometryTool(shape) !== "line") {
      return geometry;
    }
    if (edit.endpoint === "start") {
      geometry.point1.x = Number((edit.originalGeometry.point1.x + delta.x).toFixed(3));
      geometry.point1.y = Number((edit.originalGeometry.point1.y + delta.y).toFixed(3));
    } else {
      geometry.point2.x = Number((edit.originalGeometry.point2.x + delta.x).toFixed(3));
      geometry.point2.y = Number((edit.originalGeometry.point2.y + delta.y).toFixed(3));
    }
    return geometry;
  }

  previewResizeGeometry(shape, edit, delta) {
    const geometry = JSON.parse(JSON.stringify(edit.originalGeometry));
    const geometryTool = shapeGeometryTool(shape);
    if (geometryTool === "rectangle") {
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
    if (geometryTool === "ellipse") {
      geometry.rx = Number(Math.max(1, edit.originalGeometry.rx + (edit.handle.includes("e") ? delta.x : -delta.x)).toFixed(3));
      geometry.ry = Number(Math.max(1, edit.originalGeometry.ry + (edit.handle.includes("s") ? delta.y : -delta.y)).toFixed(3));
      return geometry;
    }
    if (geometryTool === "circle") {
      const bounds = shapeBounds({ ...shape, geometry: edit.originalGeometry });
      const nextBounds = this.resizedGeometryBounds(bounds, edit.handle, delta);
      const diameter = Math.max(1, Math.min(Math.abs(nextBounds.width), Math.abs(nextBounds.height)));
      geometry.cx = Number((nextBounds.x + nextBounds.width / 2).toFixed(3));
      geometry.cy = Number((nextBounds.y + nextBounds.height / 2).toFixed(3));
      geometry.r = Number((diameter / 2).toFixed(3));
      return geometry;
    }
    if (geometryTool === "polygon" || geometryTool === "polyline") {
      const bounds = shapeBounds({ ...shape, geometry: edit.originalGeometry });
      const nextBounds = this.resizedGeometryBounds(bounds, edit.handle, delta);
      geometry.points = edit.originalGeometry.points.map((point) => this.mapPointBetweenBounds(point, bounds, nextBounds));
      return geometry;
    }
    if (geometryTool === "line") {
      const bounds = shapeBounds({ ...shape, geometry: edit.originalGeometry });
      const nextBounds = this.resizedGeometryBounds(bounds, edit.handle, delta);
      geometry.point1 = this.mapPointBetweenBounds(edit.originalGeometry.point1, bounds, nextBounds);
      geometry.point2 = this.mapPointBetweenBounds(edit.originalGeometry.point2, bounds, nextBounds);
      return geometry;
    }
    if (geometryTool === "arc") {
      const bounds = shapeBounds({ ...shape, geometry: edit.originalGeometry });
      const nextBounds = this.resizedGeometryBounds(bounds, edit.handle, delta);
      geometry.cx = Number((nextBounds.x + nextBounds.width / 2).toFixed(3));
      geometry.cy = Number((nextBounds.y + nextBounds.height / 2).toFixed(3));
      geometry.r = Number((Math.max(1, Math.min(nextBounds.width, nextBounds.height) / 2)).toFixed(3));
      return geometry;
    }
    if (geometryTool === "text") {
      const bounds = shapeBounds({ ...shape, geometry: edit.originalGeometry });
      const nextBounds = this.resizedGeometryBounds(bounds, edit.handle, delta);
      const anchor = this.mapPointBetweenBounds({ x: edit.originalGeometry.x, y: edit.originalGeometry.y }, bounds, nextBounds);
      const scaleY = nextBounds.height / Math.max(1, bounds.height);
      geometry.x = anchor.x;
      geometry.y = anchor.y;
      geometry.fontSize = Number(Math.max(1, edit.originalGeometry.fontSize * scaleY).toFixed(3));
      return geometry;
    }
    return geometry;
  }

  resizedGeometryBounds(bounds, handle, delta) {
    const next = { ...bounds };
    if (handle.includes("w")) {
      next.x = Number((bounds.x + delta.x).toFixed(3));
      next.width = Number((bounds.width - delta.x).toFixed(3));
    }
    if (handle.includes("e")) {
      next.width = Number((bounds.width + delta.x).toFixed(3));
    }
    if (handle.includes("n")) {
      next.y = Number((bounds.y + delta.y).toFixed(3));
      next.height = Number((bounds.height - delta.y).toFixed(3));
    }
    if (handle.includes("s")) {
      next.height = Number((bounds.height + delta.y).toFixed(3));
    }
    if (next.width <= 0 || next.height <= 0) {
      throw new Error("resize would invert or collapse geometry bounds.");
    }
    return next;
  }

  mapPointBetweenBounds(point, bounds, nextBounds) {
    const xRatio = bounds.width <= 0 ? 0 : (point.x - bounds.x) / bounds.width;
    const yRatio = bounds.height <= 0 ? 0 : (point.y - bounds.y) / bounds.height;
    return {
      x: Number((nextBounds.x + xRatio * nextBounds.width).toFixed(3)),
      y: Number((nextBounds.y + yRatio * nextBounds.height).toFixed(3))
    };
  }

  previewGeometryPointGeometry(shape, edit, delta) {
    const geometry = JSON.parse(JSON.stringify(edit.originalGeometry));
    const geometryTool = shapeGeometryTool(shape);
    const movedPoint = {
      x: Number((edit.point.x + delta.x).toFixed(3)),
      y: Number((edit.point.y + delta.y).toFixed(3))
    };
    if (geometryTool === "polygon" || geometryTool === "polyline") {
      const pointIndex = normalizeShapeIndex(edit.pointIndex);
      if (pointIndex >= 0 && pointIndex < geometry.points.length) {
        geometry.points[pointIndex] = movedPoint;
      }
      return geometry;
    }
    if (geometryTool === "circle") {
      if (edit.control === "center") {
        geometry.cx = Number((edit.originalGeometry.cx + delta.x).toFixed(3));
        geometry.cy = Number((edit.originalGeometry.cy + delta.y).toFixed(3));
        return geometry;
      }
      if (edit.control === "radius") {
        geometry.r = this.radiusFromControlPoint({ x: edit.originalGeometry.cx, y: edit.originalGeometry.cy }, movedPoint);
      }
      return geometry;
    }
    if (geometryTool === "ellipse") {
      if (edit.control === "center") {
        geometry.cx = Number((edit.originalGeometry.cx + delta.x).toFixed(3));
        geometry.cy = Number((edit.originalGeometry.cy + delta.y).toFixed(3));
        return geometry;
      }
      if (edit.control === "rx") {
        geometry.rx = this.axisRadiusFromControlPoint(edit.originalGeometry.cx, movedPoint.x);
      }
      if (edit.control === "ry") {
        geometry.ry = this.axisRadiusFromControlPoint(edit.originalGeometry.cy, movedPoint.y);
      }
      return geometry;
    }
    if (geometryTool === "arc") {
      if (edit.control === "center") {
        geometry.cx = Number((edit.originalGeometry.cx + delta.x).toFixed(3));
        geometry.cy = Number((edit.originalGeometry.cy + delta.y).toFixed(3));
        return geometry;
      }
      if (edit.control === "start" || edit.control === "end") {
        const center = { x: edit.originalGeometry.cx, y: edit.originalGeometry.cy };
        geometry.r = this.radiusFromControlPoint(center, movedPoint);
        geometry[edit.control === "start" ? "startAngle" : "endAngle"] = this.angleFromControlPoint(center, movedPoint);
      }
      return geometry;
    }
    if (geometryTool === "text") {
      geometry.x = movedPoint.x;
      geometry.y = movedPoint.y;
      return geometry;
    }
    return geometry;
  }

  radiusFromControlPoint(center, point) {
    return Number(Math.max(1, Math.hypot(point.x - center.x, point.y - center.y)).toFixed(3));
  }

  axisRadiusFromControlPoint(centerValue, pointValue) {
    return Number(Math.max(1, Math.abs(pointValue - centerValue)).toFixed(3));
  }

  angleFromControlPoint(center, point) {
    const degrees = (Math.atan2(point.y - center.y, point.x - center.x) * 180) / Math.PI + 90;
    return this.normalizeRotationDegrees(degrees);
  }

  selectObject(objectId, sourceLabel) {
    if (!this.currentPayload?.objects.some((object) => object.id === objectId)) {
      this.statusLog.write(`WARN Select object skipped: object id ${objectId || "unknown"} is not available.`);
      return;
    }

    const scrollState = this.captureLeftPanelScrollState();
    this.selectedObjectId = objectId;
    const selectedObject = this.selectedObject();
    this.selectedShapeIndex = sortedShapes(selectedObject).length ? 0 : -1;
    this.selectedShapeIndexes = new Set(this.selectedShapeIndex >= 0 ? [this.selectedShapeIndex] : []);
    this.directSelectedShapeIndexes = new Set(this.selectedShapeIndex >= 0 ? [this.selectedShapeIndex] : []);
    const selectedState = this.objectStates(selectedObject)[0] || null;
    this.selectedStateId = selectedState?.id || "";
    this.stateControlStateId = this.selectedStateId || OBJECT_STATE_IDS[0];
    this.selectedFrameId = selectedState ? sortedFrames(selectedState)[0]?.id || "" : "";
    this.syncPaletteSelectionFromCurrentShape({ logMissing: true });
    this.setPaletteTarget("stroke", false);
    this.renderPayload();
    this.restoreLeftPanelScrollState(scrollState);
    const selected = this.selectedObject();
    this.statusLog.write(`OK Selected object from ${sourceLabel}: ${selected.name}.`);
  }

  selectShape(shapeIndex, sourceLabel, options = {}) {
    const object = this.selectedObject();
    const normalizedIndex = normalizeShapeIndex(shapeIndex);
    const shapes = sortedShapes(object);
    if (normalizedIndex < 0 || normalizedIndex >= shapes.length) {
      this.statusLog.write(`WARN Select shape skipped: shape row ${shapeIndex ?? "unknown"} is not available.`);
      return;
    }

    const scrollState = this.captureLeftPanelScrollState();
    this.selectedShapeIndex = normalizedIndex;
    if (options.additive) {
      if (this.selectedShapeIndexes.has(normalizedIndex) && this.selectedShapeIndexes.size > 1) {
        this.selectedShapeIndexes.delete(normalizedIndex);
        this.directSelectedShapeIndexes = new Set(this.selectedShapeIndexes);
        this.selectedShapeIndex = Array.from(this.selectedShapeIndexes).at(-1) ?? -1;
      } else {
        this.selectedShapeIndexes.add(normalizedIndex);
        this.directSelectedShapeIndexes = new Set(this.selectedShapeIndexes);
      }
    } else {
      this.selectedShapeIndexes = new Set([normalizedIndex]);
      this.directSelectedShapeIndexes = new Set([normalizedIndex]);
    }
    this.syncPaletteSelectionFromCurrentShape({ logMissing: true });
    this.setPaletteTarget("stroke", false);
    this.renderPayload();
    this.restoreLeftPanelScrollState(scrollState);
    const shape = this.selectedShape();
    this.statusLog.write(`OK Selected shape from ${sourceLabel}: row ${this.selectedShapeIndex} (${shapeTool(shape)}). Multi-select count: ${this.selectedShapeIndexes.size}.`);
  }

  selectShapeGroup(groupId, shapeIndex, sourceLabel = "shape group") {
    const object = this.selectedObject();
    const shapes = sortedShapes(object);
    const normalizedGroupId = String(groupId || "").trim();
    if (!normalizedGroupId) {
      this.statusLog.write("WARN Select group skipped: shape group id is not available.");
      return;
    }
    const groupIndexes = shapes
      .map((shape, index) => String(shape?.groupId || "").trim() === normalizedGroupId ? index : -1)
      .filter((index) => index >= 0);
    if (groupIndexes.length < 2) {
      this.statusLog.write(`WARN Select group skipped: group ${normalizedGroupId} has fewer than two shapes.`);
      return;
    }

    const normalizedIndex = normalizeShapeIndex(shapeIndex);
    const nextSelectedIndex = groupIndexes.includes(normalizedIndex) ? normalizedIndex : groupIndexes[0];
    const scrollState = this.captureLeftPanelScrollState();
    this.selectedShapeIndex = nextSelectedIndex;
    this.selectedShapeIndexes = new Set(groupIndexes);
    this.directSelectedShapeIndexes = new Set(groupIndexes);
    this.syncPaletteSelectionFromCurrentShape({ logMissing: true });
    this.setPaletteTarget("stroke", false);
    this.renderPayload();
    this.restoreLeftPanelScrollState(scrollState);
    this.statusLog.write(`OK Selected group ${normalizedGroupId} from ${sourceLabel}: ${groupIndexes.length} shapes.`);
  }

  shapeSelectionGroupIndexes(shapes, shapeIndex) {
    const shape = shapes[shapeIndex];
    const groupId = String(shape?.groupId || "").trim();
    if (!groupId) {
      return [shapeIndex];
    }
    return shapes
      .map((candidate, index) => String(candidate?.groupId || "").trim() === groupId ? index : -1)
      .filter((index) => index >= 0);
  }

  shapeBelongsToValidGroup(object, shapeIndex) {
    const shapes = sortedShapes(object);
    const shape = shapes[normalizeShapeIndex(shapeIndex)];
    const groupId = String(shape?.groupId || "").trim();
    if (!groupId) {
      return false;
    }
    return shapes.filter((candidate) => String(candidate?.groupId || "").trim() === groupId).length >= 2;
  }

  selectState(stateId, sourceLabel) {
    const object = this.selectedObject();
    if (!object) {
      this.statusLog.write("WARN State selection skipped: no object is selected.");
      return;
    }
    if (!stateId) {
      this.selectedStateId = "";
      this.stateControlStateId = "";
      this.selectedFrameId = "";
      this.stopPlaybackTimer();
      this.renderPayload();
      this.statusLog.write(`OK State selection cleared from ${sourceLabel}.`);
      return;
    }
    const state = this.objectStates(object).find((candidate) => candidate.id === stateId);
    if (!state) {
      this.statusLog.write(`WARN State selection pending: ${stateId} is not created for ${object.name}. Use Add to create it.`);
      this.selectedStateId = "";
      this.stateControlStateId = stateId;
      this.selectedFrameId = "";
      this.renderFrameTimeline();
      this.updateAnimationActionState();
      return;
    }
    this.selectedStateId = state.id;
    this.stateControlStateId = state.id;
    this.selectedFrameId = sortedFrames(state)[0]?.id || "";
    this.stopPlaybackTimer();
    this.renderPayload();
    this.statusLog.write(`OK Selected state ${OBJECT_STATE_LABELS[state.id] || state.id} from ${sourceLabel}; active object remains ${object.name}.`);
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

  createSelectedState(stateId = this.stateControlSelectionId(this.selectedObject())) {
    const object = this.selectedObject();
    if (!object) {
      this.statusLog.write("WARN Create state skipped: no object is selected.");
      return;
    }
    if (this.guardSelectedObjectMutation("Create state")) {
      return;
    }
    if (!OBJECT_STATE_IDS.includes(stateId)) {
      this.statusLog.write(`FAIL Create state blocked: choose ${OBJECT_STATE_IDS.join(", ")}.`);
      return;
    }
    if (this.objectStates(object).some((state) => state.id === stateId)) {
      this.statusLog.write(`WARN Create state skipped: ${OBJECT_STATE_LABELS[stateId] || stateId} already exists for ${object.name}.`);
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((candidate) => candidate.id === object.id);
    nextObject.states = this.objectStates(nextObject);
    const frame = this.createFrameSnapshot(nextObject, stateId, "frame-1", 1);
    nextObject.states.push({
      frames: [frame],
      id: stateId,
      name: OBJECT_STATE_LABELS[stateId] || stateId
    });
    this.commitPayloadUpdate(nextPayload, object.id, this.selectedShapeIndex, `OK Created state ${OBJECT_STATE_LABELS[stateId] || stateId} with frame ${frame.id}.`, "Create state failed schema validation", {
      selectedFrameId: frame.id,
      selectedStateId: stateId
    });
  }

  deleteSelectedState(stateId = this.selectedStateId) {
    const object = this.selectedObject();
    if (!object) {
      this.statusLog.write("WARN Delete state skipped: no object is selected.");
      return;
    }
    if (this.guardSelectedObjectMutation("Delete state")) {
      return;
    }
    const states = this.objectStates(object);
    const stateIndex = states.findIndex((state) => state.id === stateId);
    if (stateIndex < 0) {
      this.statusLog.write(`WARN Delete state skipped: ${stateId || "unknown"} is not created for ${object.name}.`);
      return;
    }
    if (states.length <= 1) {
      this.statusLog.write(`WARN Delete state skipped: ${stateId} is the only state for ${object.name}.`);
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((candidate) => candidate.id === object.id);
    nextObject.states = this.objectStates(nextObject).filter((state) => state.id !== stateId);
    const nextState = nextObject.states[Math.min(stateIndex, nextObject.states.length - 1)] || nextObject.states[0] || null;
    const nextFrame = sortedFrames(nextState)[0] || null;
    this.commitPayloadUpdate(nextPayload, object.id, this.selectedShapeIndex, `OK Deleted state ${stateId} from ${object.name}.`, "Delete state failed schema validation", {
      selectedFrameId: nextFrame?.id || "",
      selectedStateId: nextState?.id || ""
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
    this.commitPayloadUpdate(nextPayload, object.id, this.selectedShapeIndex, `OK Duplicated frame ${frame.id} as ${frameCopy.id}.`, "Duplicate frame failed schema validation", {
      selectedFrameId: frameCopy.id,
      selectedStateId: state.id
    });
  }

  deleteSelectedFrame() {
    const object = this.selectedObject();
    const state = this.selectedState();
    const frame = this.activeFrame();
    if (!object || !state || !frame) {
      this.statusLog.write("WARN Delete frame skipped: select an object state and frame first.");
      return;
    }
    if (this.guardSelectedObjectMutation("Delete frame")) {
      return;
    }
    const frames = sortedFrames(state);
    if (frames.length <= 1) {
      this.statusLog.write(`WARN Delete frame skipped: frame ${frame.id} is the only frame in ${OBJECT_STATE_LABELS[state.id] || state.id}.`);
      return;
    }
    const index = frames.findIndex((candidate) => candidate.id === frame.id);
    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((candidate) => candidate.id === object.id);
    const nextState = this.objectStates(nextObject).find((candidate) => candidate.id === state.id);
    const nextFrames = sortedFrames(nextState).filter((candidate) => candidate.id !== frame.id);
    nextFrames.forEach((candidate, frameIndex) => {
      candidate.order = frameIndex + 1;
    });
    nextState.frames = nextFrames;
    const nextSelectedFrame = nextFrames[Math.min(index, nextFrames.length - 1)] || nextFrames[0];
    this.commitPayloadUpdate(nextPayload, object.id, this.selectedShapeIndex, `OK Deleted frame ${frame.id} from ${OBJECT_STATE_LABELS[state.id] || state.id}.`, "Delete frame failed schema validation", {
      selectedFrameId: nextSelectedFrame.id,
      selectedStateId: state.id
    });
  }

  moveSelectedFrame(direction, controlLabel = direction) {
    const object = this.selectedObject();
    const state = this.selectedState();
    const frame = this.activeFrame();
    if (!object || !state || !frame) {
      this.statusLog.write(`WARN Move frame ${controlLabel} skipped: select an object state and frame first.`);
      return;
    }
    if (this.guardSelectedObjectMutation("Move frame")) {
      return;
    }
    const frames = sortedFrames(state);
    const index = frames.findIndex((candidate) => candidate.id === frame.id);
    const nextIndex = direction === "earlier" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= frames.length) {
      this.statusLog.write(`WARN Move frame ${controlLabel} skipped: frame ${frame.id} cannot move ${controlLabel}.`);
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
    this.commitPayloadUpdate(nextPayload, object.id, this.selectedShapeIndex, `OK Moved frame ${frame.id} ${controlLabel}.`, "Move frame failed schema validation", {
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
    this.statusLog.write(`OK Playback started for state ${OBJECT_STATE_LABELS[state.id] || state.id} at ${fps} FPS.`);
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
    this.statusLog.write(`OK Playback completed for state ${OBJECT_STATE_LABELS[state.id] || state.id}.`);
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
    let objectDefault;
    try {
      objectDefault = this.schemaDefault("object");
    } catch (error) {
      this.statusLog.write(`FAIL Add object blocked: ${error.message}`);
      return;
    }
    nextPayload.objects.push({
      ...objectDefault,
      id,
      name,
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
    this.commitPayloadUpdate(nextPayload, selected.id, this.selectedShapeIndex, `OK Added tag ${addedTags.join(", ")} to ${selected.name}.`, "Object tag update failed schema validation");
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
    this.commitPayloadUpdate(nextPayload, selected.id, this.selectedShapeIndex, `OK Removed tag ${tag} from ${selected.name}.`, "Object tag update failed schema validation");
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
    nextObject.id = nextId;
    nextObject.name = name;
    this.commitPayloadUpdate(nextPayload, nextId, this.selectedShapeIndex, `OK Renamed object ${oldId} to ${name} and updated object/game/name id to ${nextId}.`, "Rename object failed schema validation");
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
    const selectedShapeIndex = sortedShapes(objectCopy).length ? 0 : -1;
    this.commitPayloadUpdate(nextPayload, objectCopy.id, selectedShapeIndex, `OK Duplicated object ${selected.name} as ${objectCopy.name}.`, "Duplicate object failed schema validation");
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
    const selectedShapeIndex = nextPayload.objects[0] && sortedShapes(nextPayload.objects[0]).length ? 0 : -1;
    this.commitPayloadUpdate(nextPayload, selectedObjectId, selectedShapeIndex, `OK Deleted object ${selected.name}.`, "Delete object failed schema validation");
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
    const selectedShapeStillExists = Number.isInteger(this.selectedShapeIndex) && this.selectedShapeIndex >= 0 && this.selectedShapeIndex < sortedShapes(nextSelectedObject).length;
    const selectedShapeIndex = selectedShapeStillExists ? this.selectedShapeIndex : nextSelectedObject && sortedShapes(nextSelectedObject).length ? 0 : -1;
    this.hiddenObjectIds.delete(selected.id);
    this.lockedObjectIds.delete(selected.id);
    this.commitPayloadUpdate(nextPayload, selectedObjectId, selectedShapeIndex, `OK Deleted object ${selected.name} from ${sourceLabel}.`, "Delete object failed schema validation");
  }

  removeDeletedObjectReferences(payload, objectId) {
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
    const collectShapeCount = (object, seen = new Set()) => {
      if (!object || seen.has(object.id)) {
        return 0;
      }
      seen.add(object.id);
      const shapeByOrder = object.baseObjectId
        ? new Map(collectShapeRows(objectsById.get(object.baseObjectId), seen))
        : new Map();
      object.shapes.forEach((shape) => shapeByOrder.set(shape.order, shape));
      return shapeByOrder.size;
    };
    const collectShapeRows = (object, seen = new Set()) => {
      if (!object || seen.has(object.id)) {
        return [];
      }
      seen.add(object.id);
      const shapeByOrder = object.baseObjectId
        ? new Map(collectShapeRows(objectsById.get(object.baseObjectId), seen))
        : new Map();
      object.shapes.forEach((shape) => shapeByOrder.set(shape.order, shape));
      return Array.from(shapeByOrder.entries());
    };
    payload.objects.forEach((object) => {
      const shapeCount = collectShapeCount(object);
      this.objectStates(object).forEach((state) => {
        state.frames.forEach((frame) => {
          frame.shapeOverrides = frame.shapeOverrides.filter((override) => override.shapeIndex < shapeCount);
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
    const selectedShapeIndex = sortedShapes(nextObject).length ? 0 : -1;
    this.commitPayloadUpdate(nextPayload, selected.id, selectedShapeIndex, `OK Flattened object ${selected.name}: baked transforms into ${flattenedCount} shapes.`, "Flatten object failed schema validation");
  }

  schemaDefault(definitionName) {
    if (typeof this.schemaService.getDefinitionDefault !== "function") {
      throw new Error("Object Vector Studio V2 schema default reader is unavailable.");
    }
    return this.schemaService.getDefinitionDefault(definitionName);
  }

  createShapeStyleDefault(type, color, styleOverride = null) {
    const { pointStyle, startPointStyle, endPointStyle, strokeLinecap, ...style } = this.schemaDefault("style");
    const strokeColor = styleOverride?.stroke || this.selectedStrokeColor || color;
    return {
      ...style,
      ...(styleOverride || {}),
      fill: TRANSPARENT_STYLE_COLOR,
      fillOpacity: styleOverride?.fillOpacity ?? this.selectedFillOpacity,
      stroke: strokeColor,
      strokeOpacity: styleOverride?.strokeOpacity ?? this.selectedStrokeOpacity,
      strokeWidth: styleOverride?.strokeWidth ?? style.strokeWidth
    };
  }

  createShapeTransformDefault(shape) {
    const transform = this.schemaDefault("transform");
    const centeredTransform = defaultShapeTransform(shape);
    return {
      ...transform,
      shapeOrigin: centeredTransform.shapeOrigin
    };
  }

  createShape(type, options = {}) {
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
    let shape;
    try {
      shape = this.createPrimitiveShape(type, order, color, options.geometry, options.style);
    } catch (error) {
      this.statusLog.write(`FAIL Create ${type} blocked: ${error.message}`);
      return;
    }
    nextObject.shapes.push(shape);
    this.activeDrawing = PRIMITIVE_TOOLS.includes(type) ? this.createDrawingState(type) : null;
    this.drawingPreviewPoint = null;
    this.commitPayloadUpdate(nextPayload, nextObject.id, sortedShapes(nextObject).length - 1, `OK Created ${type} shape on ${nextObject.name} from ${options.sourceLabel || "canvas drawing"}.`, `Create ${type} failed schema validation`);
  }

  createPrimitiveShape(type, order, color, geometry = null, styleOverride = null) {
    if (!PRIMITIVE_TOOLS.includes(type)) {
      throw new Error(`unsupported shape tool ${type}.`);
    }
    if (!geometry) {
      throw new Error(`${shapeTypeLabel(type)} requires committed canvas placement geometry.`);
    }

    const base = this.schemaDefault("shapeCommon");
    const shape = {
      ...base,
      geometry: JSON.parse(JSON.stringify(geometry)),
      order,
      style: this.createShapeStyleDefault(type, color, styleOverride),
      tool: type,
      visible: base.visible
    };
    if (type === "square") {
      const size = Math.min(shape.geometry.width, shape.geometry.height);
      shape.geometry.width = size;
      shape.geometry.height = size;
    }
    shape.transform = this.createShapeTransformDefault(shape);
    return shape;
  }

  flattenShapeTransform(shape) {
    const nextShape = JSON.parse(JSON.stringify(shape));
    const transform = this.shapeTransform(nextShape);
    const applyX = (value) => Number((transform.x + transform.shapeOrigin.x + (value - transform.shapeOrigin.x) * transform.scaleX).toFixed(3));
    const applyY = (value) => Number((transform.y + transform.shapeOrigin.y + (value - transform.shapeOrigin.y) * transform.scaleY).toFixed(3));
    const geometryTool = shapeGeometryTool(nextShape);
    if (geometryTool === "rectangle") {
      nextShape.geometry.x = applyX(nextShape.geometry.x);
      nextShape.geometry.y = applyY(nextShape.geometry.y);
      nextShape.geometry.width = Number((nextShape.geometry.width * transform.scaleX).toFixed(3));
      nextShape.geometry.height = Number((nextShape.geometry.height * transform.scaleY).toFixed(3));
    } else if (geometryTool === "circle") {
      nextShape.geometry.cx = applyX(nextShape.geometry.cx);
      nextShape.geometry.cy = applyY(nextShape.geometry.cy);
      nextShape.geometry.r = Number((nextShape.geometry.r * Math.max(transform.scaleX, transform.scaleY)).toFixed(3));
    } else if (geometryTool === "ellipse") {
      nextShape.geometry.cx = applyX(nextShape.geometry.cx);
      nextShape.geometry.cy = applyY(nextShape.geometry.cy);
      nextShape.geometry.rx = Number((nextShape.geometry.rx * transform.scaleX).toFixed(3));
      nextShape.geometry.ry = Number((nextShape.geometry.ry * transform.scaleY).toFixed(3));
    } else if (geometryTool === "line") {
      nextShape.geometry.point1.x = applyX(nextShape.geometry.point1.x);
      nextShape.geometry.point1.y = applyY(nextShape.geometry.point1.y);
      nextShape.geometry.point2.x = applyX(nextShape.geometry.point2.x);
      nextShape.geometry.point2.y = applyY(nextShape.geometry.point2.y);
    } else if (geometryTool === "polygon" || geometryTool === "polyline") {
      nextShape.geometry.points = nextShape.geometry.points.map((point) => ({
        x: applyX(point.x),
        y: applyY(point.y)
      }));
    } else if (geometryTool === "arc") {
      nextShape.geometry.cx = applyX(nextShape.geometry.cx);
      nextShape.geometry.cy = applyY(nextShape.geometry.cy);
      nextShape.geometry.r = Number((nextShape.geometry.r * Math.max(transform.scaleX, transform.scaleY)).toFixed(3));
    } else if (geometryTool === "text") {
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

  directStyleColorLabel(color) {
    const normalized = String(color || "").trim().toLowerCase();
    if (normalized === TRANSPARENT_STYLE_COLOR || normalized === "transparent") {
      return "transparent";
    }
    if (normalized === "none") {
      return "none";
    }
    return "";
  }

  paletteLabelForColor(color, fallbackLabel) {
    const swatch = this.paletteSwatchForColor(color);
    return swatch?.name || swatch?.id || swatch?.symbol || this.directStyleColorLabel(color) || fallbackLabel;
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
      if (!normalizedColor || normalizedColor === "none" || this.directStyleColorLabel(normalizedColor)) {
        return;
      }
      const swatch = this.paletteSwatchForColor(normalizedColor);
      if (!swatch) {
        if (logMissing) {
          this.statusLog.write(`WARN Palette sync skipped for selected ${shapeTool(shape)} ${target} color ${normalizedColor}: color is not in the loaded palette.`);
        }
        return;
      }
      const label = swatch.name || swatch.id || swatch.symbol || shapeDisplayLabel(shape);
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

  opacityInputValue(target) {
    const element = target === "stroke" ? this.elements.strokeOpacity : this.elements.fillOpacity;
    const rawValue = element?.value?.trim() || "";
    const value = Number(rawValue);
    if (!Number.isInteger(value) || value < 0 || value > 255) {
      const error = `${target === "stroke" ? "Stroke" : "Fill"} opacity must be a whole number between 0 and 255.`;
      this.markInputInvalid(element, error);
      return { ok: false, error };
    }
    this.clearInputValidity(element);
    return { ok: true, value: this.opacityFromInputByte(value) };
  }

  opacityFromInputByte(value) {
    return Number((value / 255).toFixed(3));
  }

  opacityInputDisplayValue(value) {
    if (!Number.isFinite(value)) {
      return "255";
    }
    const clamped = Math.min(1, Math.max(0, value));
    return String(Math.round(clamped * 255));
  }

  changePaletteOpacity(target) {
    const normalizedTarget = target === "stroke" ? "stroke" : "fill";
    const opacity = this.opacityInputValue(normalizedTarget);
    if (!opacity.ok) {
      this.statusLog.write(`FAIL Palette ${normalizedTarget} opacity rejected: ${opacity.error}`);
      return;
    }
    if (normalizedTarget === "stroke") {
      this.selectedStrokeOpacity = opacity.value;
    } else {
      this.selectedFillOpacity = opacity.value;
    }
    this.updatePaletteModeSwatches();
    this.statusLog.write(`OK Selected ${normalizedTarget} opacity ${opacity.value}.`);
  }

  selectPaletteColor(color, label) {
    if (!color) {
      this.statusLog.write(`FAIL Palette color selection blocked: swatch ${label} has no usable color value.`);
      return false;
    }
    const swatch = this.paletteSwatchForColor(color);
    if (!swatch) {
      this.statusLog.write(`FAIL Palette color selection rejected: ${color} is not in the loaded palette.`);
      return false;
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
    return true;
  }

  applyPaletteColor(color, label) {
    this.selectPaletteColor(color, label);
  }

  applySelectedPaletteColorToShape(shapeIndex, target, sourceLabel) {
    const selectedIndex = normalizeShapeIndex(shapeIndex);
    const selected = sortedShapes(this.selectedObject())[selectedIndex] || null;
    if (!selected) {
      this.statusLog.write("FAIL Palette color application blocked: select a shape first.");
      return;
    }
    if (selected.locked) {
      this.statusLog.write(`WARN Palette color application skipped: shape row ${selectedIndex} is locked.`);
      return;
    }
    if (this.guardSelectedObjectMutation("Palette color application")) {
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const shape = this.findShapeInPayload(nextPayload, selectedIndex);
    const strokeWidth = Number(this.elements.strokeWidth.value);
    const shouldApplyStroke = target === "stroke";
    const color = shouldApplyStroke ? this.selectedStrokeColor : this.selectedFillColor;
    const label = shouldApplyStroke ? this.selectedStrokeLabel : this.selectedFillLabel;
    if (!color) {
      this.statusLog.write(`FAIL Palette color application blocked: no ${shouldApplyStroke ? "stroke" : "paint"} color is selected.`);
      return;
    }
    const swatch = this.paletteSwatchForColor(color);
    const directLabel = this.directStyleColorLabel(color);
    if (!swatch && !directLabel) {
      this.statusLog.write(`FAIL Palette color application rejected: ${color} is not in the loaded palette.`);
      return;
    }
    const paletteLabel = swatch?.name || swatch?.id || swatch?.symbol || directLabel || label;
    if (shouldApplyStroke) {
      shape.style.stroke = color;
      shape.style.strokeWidth = Number.isFinite(strokeWidth) && strokeWidth > 0 ? strokeWidth : 2;
      shape.style.strokeOpacity = this.selectedStrokeOpacity;
    } else {
      shape.style.fill = color;
      shape.style.fillOpacity = this.selectedFillOpacity;
    }
    const targetLabel = shouldApplyStroke ? `Target: stroke width ${shape.style.strokeWidth}, opacity ${shape.style.strokeOpacity}.` : `Target: paint opacity ${shape.style.fillOpacity}.`;
    this.commitPayloadUpdate(nextPayload, this.selectedObjectId, selectedIndex, `OK Applied palette color ${color} from ${paletteLabel} to shape row ${selectedIndex} by ${sourceLabel}. ${targetLabel}`, "Palette color application failed schema validation", {
      syncPaletteSelection: false
    });
  }

  applyTransparentStyleToShape(shapeIndex, target, sourceLabel) {
    const selectedIndex = normalizeShapeIndex(shapeIndex);
    const selected = sortedShapes(this.selectedObject())[selectedIndex] || null;
    if (!selected) {
      this.statusLog.write(`WARN Transparent style skipped: shape row ${shapeIndex ?? "unknown"} is not available.`);
      return;
    }
    if (selected.locked) {
      this.statusLog.write(`WARN Transparent style skipped: shape row ${selectedIndex} is locked.`);
      return;
    }
    if (this.guardSelectedObjectMutation("Transparent style application")) {
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const shape = this.findShapeInPayload(nextPayload, selectedIndex);
    const shouldApplyStroke = target === "stroke";
    if (shouldApplyStroke) {
      shape.style.stroke = TRANSPARENT_STYLE_COLOR;
    } else {
      shape.style.fill = TRANSPARENT_STYLE_COLOR;
    }
    this.commitPayloadUpdate(nextPayload, this.selectedObjectId, this.selectedShapeIndex, `OK Applied transparent ${shouldApplyStroke ? "stroke" : "fill"} to shape row ${selectedIndex} by ${sourceLabel}.`, "Transparent style application failed schema validation", {
      syncPaletteSelection: false
    });
  }

  sampleShapeStyle(shapeIndex) {
    const selectedIndex = normalizeShapeIndex(shapeIndex);
    const selected = sortedShapes(this.selectedObject())[selectedIndex] || null;
    if (!selected) {
      this.statusLog.write(`WARN Picker skipped: shape row ${shapeIndex ?? "unknown"} is not available.`);
      return;
    }
    const effectiveShape = this.effectiveShape(selected, selectedIndex);
    const style = effectiveShape.style || {};
    if (style.fill) {
      this.selectedFillColor = style.fill;
      this.selectedFillLabel = this.paletteLabelForColor(style.fill, shapeDisplayLabel(selected));
    }
    if (style.stroke) {
      this.selectedStrokeColor = style.stroke;
      this.selectedStrokeLabel = this.paletteLabelForColor(style.stroke, shapeDisplayLabel(selected));
    }
    if (Number.isFinite(style.fillOpacity)) {
      this.selectedFillOpacity = style.fillOpacity;
      this.elements.fillOpacity.value = this.opacityInputDisplayValue(style.fillOpacity);
      this.clearInputValidity(this.elements.fillOpacity);
    }
    if (Number.isFinite(style.strokeOpacity)) {
      this.selectedStrokeOpacity = style.strokeOpacity;
      this.elements.strokeOpacity.value = this.opacityInputDisplayValue(style.strokeOpacity);
      this.clearInputValidity(this.elements.strokeOpacity);
    }
    if (Number.isFinite(style.strokeWidth) && style.strokeWidth > 0) {
      this.elements.strokeWidth.value = String(style.strokeWidth);
    }
    this.updatePaletteModeSwatches();
    if (this.runtimePalette) {
      this.renderPalette();
    }
    this.statusLog.write(`OK Picker sampled shape row ${selectedIndex}: fill ${style.fill || "none"}, stroke ${style.stroke || "none"}, fill opacity ${Number.isFinite(style.fillOpacity) ? style.fillOpacity : "n/a"}, stroke opacity ${Number.isFinite(style.strokeOpacity) ? style.strokeOpacity : "n/a"}, stroke width ${Number.isFinite(style.strokeWidth) ? style.strokeWidth : "n/a"}.`);
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
    this.toggleShapeVisibilityByIndex(this.selectedShapeIndex, this.selectedObjectId);
  }

  toggleShapeVisibilityByIndex(shapeIndex, objectId = this.selectedObjectId) {
    const normalizedIndex = normalizeShapeIndex(shapeIndex);
    const object = this.currentPayload?.objects.find((candidate) => candidate.id === objectId) || null;
    const shape = sortedShapes(object)[normalizedIndex] || null;
    if (!object || !shape) {
      this.statusLog.write("WARN Shape visibility skipped: no shape is selected.");
      return;
    }
    if (shape.locked) {
      this.statusLog.write(`WARN Shape visibility skipped: shape row ${normalizedIndex} is locked.`);
      return;
    }
    if (this.isObjectLocked(object.id)) {
      this.statusLog.write(`WARN Shape visibility blocked: object ${object.name} is locked for this runtime session.`);
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((candidate) => candidate.id === object.id);
    const targetIsSelectedObject = object.id === this.selectedObjectId;
    const state = targetIsSelectedObject ? this.objectStates(nextObject).find((candidate) => candidate.id === this.selectedStateId) : null;
    const frame = targetIsSelectedObject ? sortedFrames(state).find((candidate) => candidate.id === this.selectedFrameId) : null;
    if (frame && !Array.isArray(frame.shapeOverrides)) {
      frame.shapeOverrides = [];
    }
    let override = frame?.shapeOverrides.find((entry) => entry.shapeIndex === normalizedIndex) || null;
    if (frame) {
      const baseShape = sortedShapes(nextObject)[normalizedIndex];
      if (!override) {
        override = {
          shapeIndex: normalizedIndex,
          transform: this.shapeTransform(baseShape),
          visible: baseShape.visible
        };
        frame.shapeOverrides.push(override);
      }
      const nextVisible = !this.effectiveShapeForFrame(shape, this.activeFrame(), normalizedIndex).visible;
      override.visible = nextVisible;
      this.commitPayloadUpdate(nextPayload, this.selectedObjectId, this.selectedShapeIndex, `OK State ${this.selectedStateId} frame ${this.selectedFrameId} shape row ${normalizedIndex} visibility set to ${nextVisible ? "visible" : "hidden"}.`, "State frame visibility failed schema validation", {
        directSelectedShapeIndexes: this.directSelectedShapeIndexes,
        selectedShapeIndexes: this.selectedShapeIndexes
      });
      return;
    }
    const nextShape = sortedShapes(nextObject)[normalizedIndex];
    nextShape.visible = !nextShape.visible;
    this.commitPayloadUpdate(nextPayload, this.selectedObjectId, this.selectedShapeIndex, `OK Shape row ${normalizedIndex} visibility set to ${nextShape.visible ? "visible" : "hidden"}.`, "Shape visibility failed schema validation", {
      directSelectedShapeIndexes: this.directSelectedShapeIndexes,
      selectedShapeIndexes: this.selectedShapeIndexes
    });
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
    const shape = this.findShapeInPayload(nextPayload, this.selectedShapeIndex);
    shape.locked = !shape.locked;
    this.commitPayloadUpdate(nextPayload, this.selectedObjectId, this.selectedShapeIndex, `OK Shape row ${this.selectedShapeIndex} lock set to ${shape.locked ? "locked" : "unlocked"}.`, "Shape lock failed schema validation");
  }

  changeSelectedShapeOrder(action) {
    const selected = this.selectedShape();
    if (!selected) {
      this.statusLog.write("WARN Shape order skipped: no shape is selected.");
      return;
    }
    if (selected.locked) {
      this.statusLog.write(`WARN Shape order skipped: shape row ${this.selectedShapeIndex} is locked.`);
      return;
    }
    if (this.guardSelectedObjectMutation("Shape order")) {
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const object = nextPayload.objects.find((candidate) => candidate.id === this.selectedObjectId);
    const shapes = sortedShapes(object);
    const index = this.selectedShapeIndex;
    if (shapes.length < 2) {
      this.statusLog.write(`WARN Shape order skipped: shape row ${index} is the only shape in ${object.name}.`);
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
      this.statusLog.write(`WARN Shape z-order skipped: shape row ${index} cannot move ${action}.`);
      return;
    }

    const oldShapes = shapes.slice();
    const [movedShape] = shapes.splice(index, 1);
    shapes.splice(nextIndex, 0, movedShape);
    shapes.forEach((shape, shapeIndex) => {
      shape.order = shapeIndex + 1;
    });
    object.shapes = shapes;
    this.remapShapeOverrideIndexes(object, oldShapes, shapes);
    this.commitPayloadUpdate(nextPayload, this.selectedObjectId, nextIndex, `OK Shape row ${index} z-order ${action}.`, "Shape z-order failed schema validation");
  }

  objectTransformOrigin(object) {
    if (object?.objectOrigin && Number.isFinite(Number(object.objectOrigin.x)) && Number.isFinite(Number(object.objectOrigin.y))) {
      return {
        x: this.formatViewportNumber(Number(object.objectOrigin.x)),
        y: this.formatViewportNumber(Number(object.objectOrigin.y))
      };
    }
    const bounds = this.objectBounds(object, { includeInvisible: false });
    return {
      x: this.formatViewportNumber(bounds.x + bounds.width / 2),
      y: this.formatViewportNumber(bounds.y + bounds.height / 2)
    };
  }

  updateSelectedObjectOrigin(origin, okMessage) {
    const object = this.selectedObject();
    if (!object) {
      this.statusLog.write("WARN Object Transform origin skipped: no object is selected.");
      return false;
    }
    if (this.guardSelectedObjectMutation("Object Transform origin")) {
      return false;
    }
    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((candidate) => candidate.id === object.id);
    nextObject.objectOrigin = {
      x: Number(origin.x.toFixed(3)),
      y: Number(origin.y.toFixed(3))
    };
    return this.commitPayloadUpdate(
      nextPayload,
      object.id,
      this.selectedShapeIndex,
      okMessage,
      "Object Transform origin failed schema validation",
      {
        directSelectedShapeIndexes: this.directSelectedShapeIndexes,
        selectedShapeIndexes: this.selectedShapeIndexes
      }
    );
  }

  selectedObjectShapeIndexes(object = this.selectedObject()) {
    return sortedShapes(object).map((shape, shapeIndex) => shapeIndex);
  }

  readObjectOriginInputs() {
    const originX = this.numberInputValue("objectVectorStudioV2ObjectOriginXInput", "Object Origin X");
    const originY = this.numberInputValue("objectVectorStudioV2ObjectOriginYInput", "Object Origin Y");
    if (!originX.ok || !originY.ok) {
      return {
        error: originX.error || originY.error,
        ok: false,
        value: { x: 0, y: 0 }
      };
    }
    return {
      error: "",
      ok: true,
      value: {
        x: Number(originX.value.toFixed(3)),
        y: Number(originY.value.toFixed(3))
      }
    };
  }

  updateSelectedObjectTransforms(operation, updater, okMessage, failPrefix = `Object Transform ${operation} failed schema validation`, options = {}) {
    const object = this.selectedObject();
    if (!object) {
      this.statusLog.write(`WARN Object Transform ${operation} skipped: no object is selected.`);
      return false;
    }
    if (this.guardSelectedObjectMutation(`Object Transform ${operation}`)) {
      return false;
    }

    const targetIndexes = this.selectedObjectShapeIndexes(object);
    if (!targetIndexes.length) {
      this.statusLog.write(`WARN Object Transform ${operation} skipped: object ${object.name} has no shapes.`);
      return false;
    }
    const lockedIndex = targetIndexes.find((shapeIndex) => sortedShapes(object)[shapeIndex]?.locked);
    if (Number.isInteger(lockedIndex)) {
      this.statusLog.write(`WARN Object Transform ${operation} skipped: shape row ${lockedIndex} is locked.`);
      return false;
    }

    const nextPayload = this.cloneCurrentPayload();
    const activeFrame = this.activeFrame();
    try {
      targetIndexes.forEach((shapeIndex) => {
        const override = this.frameOverrideInPayload(nextPayload, shapeIndex, { create: true });
        const baseShape = this.findShapeInPayload(nextPayload, shapeIndex);
        const shape = override
          ? this.effectiveShapeForFrame(baseShape, activeFrame, shapeIndex)
          : baseShape;
        if (!shape) {
          throw new Error(`shape row ${shapeIndex} is not available.`);
        }
        updater(shape, shapeIndex);
        shape.transform = this.ensureShapeTransform(shape);
        const transformErrors = this.validateShapeForTransform(shape);
        if (transformErrors.length) {
          throw new Error(`shape row ${shapeIndex}: ${transformErrors.join(" ")}`);
        }
        if (override) {
          override.transform = this.ensureShapeTransform(shape);
        }
      });
    } catch (error) {
      this.statusLog.write(`FAIL Invalid object transform rejected for ${object.name}: ${error.message}`);
      return false;
    }

    return this.commitPayloadUpdate(nextPayload, object.id, this.selectedShapeIndex, okMessage, failPrefix, {
      directSelectedShapeIndexes: this.directSelectedShapeIndexes,
      dirtyReason: options.dirtyReason,
      selectedShapeIndexes: this.selectedShapeIndexes
    });
  }

  rotateSelectedObject() {
    const input = this.objectRotateInputValue();
    if (!input.ok) {
      this.statusLog.write(`FAIL Invalid object transform rejected: ${input.error}`);
      return;
    }
    const origin = this.readObjectOriginInputs();
    if (!origin.ok) {
      this.statusLog.write(`FAIL Invalid object transform rejected: ${origin.error}`);
      return;
    }
    const rotation = this.snapAngle(input.value);
    const snapAngleStatus = this.formatSnapAngleRotateStatus(input.value, rotation);
    const object = this.selectedObject();
    const activeFrame = this.activeFrame();
    const targetIndexes = this.selectedObjectShapeIndexes(object);
    const nextTransforms = new Map(targetIndexes.map((shapeIndex) => {
      const effectiveShape = this.effectiveShapeForFrame(sortedShapes(object)[shapeIndex], activeFrame, shapeIndex);
      const transform = this.ensureShapeTransform(effectiveShape);
      const originPoint = this.transformedPoint(transform.shapeOrigin, transform);
      const rotatedOriginPoint = this.rotatePointAround(originPoint, origin.value, rotation);
      return [shapeIndex, {
        ...transform,
        rotation: this.normalizeRotationDegrees(transform.rotation + rotation),
        x: Number((rotatedOriginPoint.x - transform.shapeOrigin.x).toFixed(3)),
        y: Number((rotatedOriginPoint.y - transform.shapeOrigin.y).toFixed(3))
      }];
    }));
    this.updateSelectedObjectTransforms("rotate", (shape, shapeIndex) => {
      shape.transform = this.ensureShapeTransform({ transform: nextTransforms.get(shapeIndex) });
    }, `OK Rotated object ${object?.name || "selected object"} (${targetIndexes.length} shapes) by ${rotation} degrees around origin ${origin.value.x}, ${origin.value.y}.${snapAngleStatus}`);
  }

  applySelectedObjectOrigin() {
    const origin = this.readObjectOriginInputs();
    if (!origin.ok) {
      this.statusLog.write(`FAIL Invalid object transform rejected: ${origin.error}`);
      return;
    }
    const object = this.selectedObject();
    this.updateSelectedObjectOrigin(origin.value, `OK Updated object ${object?.name || "selected object"} origin/pivot to ${origin.value.x}, ${origin.value.y}.`);
  }

  autoOriginSelectedObjectPivot() {
    const object = this.selectedObject();
    if (!object) {
      this.statusLog.write("WARN Auto Origin skipped: no object is selected.");
      return;
    }
    const visibleShapes = sortedShapes(object)
      .map((shape, shapeIndex) => this.effectiveShapeForFrame(shape, this.activeFrame(), shapeIndex))
      .filter((shape) => shape.visible !== false);
    if (!visibleShapes.length) {
      this.statusLog.write(`FAIL Auto Origin blocked: object ${object.name} has no visible geometry.`);
      return;
    }
    const bounds = this.objectBounds(object, { includeInvisible: false });
    const balancedCenter = {
      x: this.formatViewportNumber(bounds.x + bounds.width / 2),
      y: this.formatViewportNumber(bounds.y + bounds.height / 2)
    };
    this.transformInputValues.set("objectVectorStudioV2ObjectOriginXInput", String(balancedCenter.x));
    this.transformInputValues.set("objectVectorStudioV2ObjectOriginYInput", String(balancedCenter.y));
    this.updateSelectedObjectOrigin(balancedCenter, `OK Auto Origin updated object ${object.name} origin/pivot from visible object bounds ${balancedCenter.x}, ${balancedCenter.y}.`);
  }

  moveSelectedShape() {
    if (!this.canUseShapeTransform()) {
      this.statusLog.write("WARN Shape Transform move skipped: select exactly one shape.");
      return;
    }
    const x = this.numberInputValue("objectVectorStudioV2MoveXInput", "Move X");
    const y = this.numberInputValue("objectVectorStudioV2MoveYInput", "Move Y");
    if (!x.ok || !y.ok) {
      this.statusLog.write(`FAIL Invalid transform rejected for shape row ${this.selectedShapeIndex}: ${x.error || y.error}`);
      return;
    }
    const moveX = this.snapDistance(x.value);
    const moveY = this.snapDistance(y.value);
    const object = this.selectedObject();
    if (this.shapeBelongsToValidGroup(object, this.selectedShapeIndex)) {
      const targetIndexes = this.shapeSelectionGroupIndexes(sortedShapes(object), this.selectedShapeIndex);
      const groupId = String(sortedShapes(object)[this.selectedShapeIndex]?.groupId || "").trim();
      this.moveSelectedShapeGroup(targetIndexes, moveX, moveY, groupId);
      return;
    }
    this.updateSelectedShapeTransform("move", (shape) => {
      shape.transform = this.ensureShapeTransform(shape);
      shape.transform.x = Number((shape.transform.x + moveX).toFixed(3));
      shape.transform.y = Number((shape.transform.y + moveY).toFixed(3));
    }, `OK Moved shape row ${this.selectedShapeIndex} by ${moveX}, ${moveY}.`);
  }

  moveSelectedShapeGroup(shapeIndexes, moveX, moveY, groupId) {
    const object = this.selectedObject();
    if (!object) {
      this.statusLog.write("WARN Transform move skipped: no object is selected.");
      return;
    }
    if (this.guardSelectedObjectMutation("Transform move")) {
      return;
    }

    const objectShapes = sortedShapes(object);
    const targetIndexes = Array.from(new Set(shapeIndexes
      .map((shapeIndex) => normalizeShapeIndex(shapeIndex))
      .filter((shapeIndex) => shapeIndex >= 0 && shapeIndex < objectShapes.length)))
      .sort((left, right) => left - right);
    if (targetIndexes.length < 2) {
      this.updateSelectedShapeTransform("move", (shape) => {
        shape.transform = this.ensureShapeTransform(shape);
        shape.transform.x = Number((shape.transform.x + moveX).toFixed(3));
        shape.transform.y = Number((shape.transform.y + moveY).toFixed(3));
      }, `OK Moved shape row ${this.selectedShapeIndex} by ${moveX}, ${moveY}.`);
      return;
    }

    const lockedIndex = targetIndexes.find((shapeIndex) => objectShapes[shapeIndex]?.locked);
    if (Number.isInteger(lockedIndex)) {
      this.statusLog.write(`WARN Transform move skipped: shape row ${lockedIndex} is locked.`);
      return;
    }

    this.selectedShapeIndexes = new Set(targetIndexes);
    const directShapeIndexes = this.directSelectedShapeIndexes.size
      ? new Set(Array.from(this.directSelectedShapeIndexes).filter((shapeIndex) => targetIndexes.includes(shapeIndex)))
      : new Set([this.selectedShapeIndex]);
    if (!directShapeIndexes.size && this.selectedShapeIndex >= 0) {
      directShapeIndexes.add(this.selectedShapeIndex);
    }

    const nextPayload = this.cloneCurrentPayload();
    try {
      targetIndexes.forEach((shapeIndex) => {
        const override = this.frameOverrideInPayload(nextPayload, shapeIndex, { create: true });
        const shape = override
          ? this.effectiveShapeForFrame(this.findShapeInPayload(nextPayload, shapeIndex), this.activeFrame(), shapeIndex)
          : this.findShapeInPayload(nextPayload, shapeIndex);
        if (!shape) {
          throw new Error(`shape row ${shapeIndex} is not available.`);
        }
        shape.transform = this.ensureShapeTransform(shape);
        shape.transform.x = Number((shape.transform.x + moveX).toFixed(3));
        shape.transform.y = Number((shape.transform.y + moveY).toFixed(3));
        const transformErrors = this.validateShapeForTransform(shape);
        if (transformErrors.length) {
          throw new Error(`shape row ${shapeIndex}: ${transformErrors.join(" ")}`);
        }
        if (override) {
          override.transform = this.ensureShapeTransform(shape);
        }
      });
    } catch (error) {
      this.statusLog.write(`FAIL Invalid transform rejected for group ${groupId || "selected group"}: ${error.message}`);
      return;
    }

    this.commitPayloadUpdate(nextPayload, this.selectedObjectId, this.selectedShapeIndex, `OK Moved group ${groupId || "selected group"} (${targetIndexes.length} shapes) by ${moveX}, ${moveY}.`, "Transform move failed schema validation", {
      directSelectedShapeIndexes: directShapeIndexes,
      selectedShapeIndexes: new Set(targetIndexes)
    });
  }

  rotateSelectedShape() {
    if (!this.canUseShapeTransform()) {
      this.statusLog.write("WARN Shape Transform rotate skipped: select exactly one shape.");
      return;
    }
    const input = this.rotateInputValue();
    if (!input.ok) {
      this.statusLog.write(`FAIL Invalid transform rejected for shape row ${this.selectedShapeIndex}: ${input.error}`);
      return;
    }
    const rotation = this.snapAngle(input.value);
    const snapAngleStatus = this.formatSnapAngleRotateStatus(input.value, rotation);
    this.updateSelectedShapeTransform("rotate", (shape) => {
      shape.transform = this.ensureShapeTransform(shape);
      shape.transform.rotation = this.normalizeRotationDegrees(shape.transform.rotation + rotation);
    }, `OK Rotated shape row ${this.selectedShapeIndex} by ${rotation} degrees.${snapAngleStatus}`);
  }

  rotateSelectedShapeGroup(shapeIndexes, rotation, groupId, snapAngleStatus = "", options = {}) {
    const object = this.selectedObject();
    if (!object) {
      this.statusLog.write("WARN Transform rotate skipped: no object is selected.");
      return;
    }
    if (this.guardSelectedObjectMutation("Transform rotate")) {
      return;
    }

    const objectShapes = sortedShapes(object);
    const targetIndexes = Array.from(new Set(shapeIndexes
      .map((shapeIndex) => normalizeShapeIndex(shapeIndex))
      .filter((shapeIndex) => shapeIndex >= 0 && shapeIndex < objectShapes.length)))
      .sort((left, right) => left - right);
    if (targetIndexes.length < 2) {
      this.updateSelectedShapeTransform("rotate", (shape) => {
        shape.transform = this.ensureShapeTransform(shape);
        shape.transform.rotation = this.normalizeRotationDegrees(shape.transform.rotation + rotation);
      }, `OK Rotated shape row ${this.selectedShapeIndex} by ${rotation} degrees.${snapAngleStatus}`);
      return;
    }

    const lockedIndex = targetIndexes.find((shapeIndex) => objectShapes[shapeIndex]?.locked);
    if (Number.isInteger(lockedIndex)) {
      this.statusLog.write(`WARN Transform rotate skipped: shape row ${lockedIndex} is locked.`);
      return;
    }

    const frame = this.activeFrame();
    const pivot = options.pivot || (() => {
      const pivotShape = this.effectiveShapeForFrame(objectShapes[this.selectedShapeIndex], frame, this.selectedShapeIndex);
      const pivotTransform = this.ensureShapeTransform(pivotShape);
      return this.transformedPoint(pivotTransform.shapeOrigin, pivotTransform);
    })();
    const nextTransforms = new Map(targetIndexes.map((shapeIndex) => {
      const effectiveShape = this.effectiveShapeForFrame(objectShapes[shapeIndex], frame, shapeIndex);
      const transform = this.ensureShapeTransform(effectiveShape);
      const originPoint = this.transformedPoint(transform.shapeOrigin, transform);
      const rotatedOriginPoint = this.rotatePointAround(originPoint, pivot, rotation);
      return [shapeIndex, {
        ...transform,
        rotation: this.normalizeRotationDegrees(transform.rotation + rotation),
        x: Number((rotatedOriginPoint.x - transform.shapeOrigin.x).toFixed(3)),
        y: Number((rotatedOriginPoint.y - transform.shapeOrigin.y).toFixed(3))
      }];
    }));

    this.selectedShapeIndexes = new Set(targetIndexes);
    const directShapeIndexes = options.directSelectedShapeIndexes
      ? new Set(Array.from(options.directSelectedShapeIndexes).filter((shapeIndex) => targetIndexes.includes(shapeIndex)))
      : (this.directSelectedShapeIndexes.size
      ? new Set(Array.from(this.directSelectedShapeIndexes).filter((shapeIndex) => targetIndexes.includes(shapeIndex)))
      : new Set([this.selectedShapeIndex]));
    if (!directShapeIndexes.size && this.selectedShapeIndex >= 0) {
      directShapeIndexes.add(this.selectedShapeIndex);
    }

    const nextPayload = this.cloneCurrentPayload();
    try {
      targetIndexes.forEach((shapeIndex) => {
        const override = this.frameOverrideInPayload(nextPayload, shapeIndex, { create: true });
        const shape = override
          ? this.effectiveShapeForFrame(this.findShapeInPayload(nextPayload, shapeIndex), frame, shapeIndex)
          : this.findShapeInPayload(nextPayload, shapeIndex);
        if (!shape) {
          throw new Error(`shape row ${shapeIndex} is not available.`);
        }
        shape.transform = this.ensureShapeTransform({ transform: nextTransforms.get(shapeIndex) });
        const transformErrors = this.validateShapeForTransform(shape);
        if (transformErrors.length) {
          throw new Error(`shape row ${shapeIndex}: ${transformErrors.join(" ")}`);
        }
        if (override) {
          override.transform = this.ensureShapeTransform(shape);
        }
      });
    } catch (error) {
      this.statusLog.write(`FAIL Invalid transform rejected for ${options.failSubject || `group ${groupId || "selected group"}`}: ${error.message}`);
      return;
    }

    const logSubject = options.logSubject || `group ${groupId || "selected group"}`;
    this.commitPayloadUpdate(nextPayload, this.selectedObjectId, this.selectedShapeIndex, `OK Rotated ${logSubject} (${targetIndexes.length} shapes) by ${rotation} degrees.${snapAngleStatus}`, "Transform rotate failed schema validation", {
      directSelectedShapeIndexes: directShapeIndexes,
      selectedShapeIndexes: new Set(targetIndexes)
    });
  }

  formatSnapAngleRotateStatus(rawRotation, appliedRotation) {
    if (this.angleSnapEnabled) {
      return ` Snap Angle active: ${rawRotation} -> ${appliedRotation}.`;
    }
    return " Snap Angle disabled: raw rotation applied.";
  }

  rotateInputValue() {
    if (!this.angleSnapEnabled) {
      const input = this.numberInputValue("objectVectorStudioV2RotateInput", "Rotate");
      return { ...input, rawValue: String(input.value) };
    }
    const select = this.window.document.getElementById("objectVectorStudioV2RotateSnapSelect");
    const rawValue = select?.value?.trim() || "";
    const value = Number(rawValue);
    if (!select || rawValue === "" || !Number.isFinite(value)) {
      const error = "Rotate Snap Angle must be a valid dropdown value.";
      this.markInputInvalid(select, error);
      return { error, ok: false, rawValue, value: 0 };
    }
    this.clearInputValidity(select);
    return { error: "", ok: true, rawValue, value };
  }

  objectRotateInputValue() {
    if (!this.angleSnapEnabled) {
      const input = this.numberInputValue("objectVectorStudioV2ObjectRotateInput", "Object Rotate");
      return { ...input, rawValue: String(input.value) };
    }
    const select = this.window.document.getElementById("objectVectorStudioV2ObjectRotateSnapSelect");
    const rawValue = select?.value?.trim() || "";
    const value = Number(rawValue);
    if (!select || rawValue === "" || !Number.isFinite(value)) {
      const error = "Object Rotate Snap Angle must be a valid dropdown value.";
      this.markInputInvalid(select, error);
      return { error, ok: false, rawValue, value: 0 };
    }
    this.clearInputValidity(select);
    return { error: "", ok: true, rawValue, value };
  }

  rotatePointAround(point, pivot, rotation) {
    const radians = (rotation * Math.PI) / 180;
    const relativeX = point.x - pivot.x;
    const relativeY = point.y - pivot.y;
    return {
      x: pivot.x + relativeX * Math.cos(radians) - relativeY * Math.sin(radians),
      y: pivot.y + relativeX * Math.sin(radians) + relativeY * Math.cos(radians)
    };
  }

  normalizeRotationDegrees(value) {
    if (!Number.isFinite(value)) {
      return value;
    }
    const normalized = ((value % 360) + 360) % 360;
    return Number(normalized.toFixed(3));
  }

  formatScaleInputValue(value) {
    return String(Number(Number(value).toFixed(3)));
  }

  readScaleInput(inputId = "objectVectorStudioV2ScaleInput", label = "Scale") {
    const input = this.numberInputValue(inputId, label);
    if (!input.ok) {
      return input;
    }
    if (input.value <= 0) {
      this.markInputInvalid(this.window.document.getElementById(inputId), `${label} must be greater than 0.`);
      return { error: "scale must be greater than 0.", ok: false, value: input.value };
    }
    return { error: "", ok: true, value: Number(input.value.toFixed(3)) };
  }

  applyScaleInputLive(inputElement) {
    const rawValue = inputElement?.value?.trim() || "";
    if (!rawValue) {
      this.markInputInvalid(inputElement, "Scale must be a finite number.");
      return;
    }
    const input = this.readScaleInput();
    if (!input.ok) {
      this.statusLog.write(`FAIL Invalid transform rejected for shape row ${this.selectedShapeIndex}: ${input.error}`);
      return;
    }
    this.applySelectedShapeScaleValue(input.value, {
      okMessage: `OK Scale preview set to ${this.formatScaleInputValue(input.value)} for shape row ${this.selectedShapeIndex}.`,
      renderControls: false
    });
  }

  adjustSelectedShapeScale(delta) {
    const input = this.readScaleInput();
    if (!input.ok) {
      this.statusLog.write(`FAIL Invalid transform rejected for shape row ${this.selectedShapeIndex}: ${input.error}`);
      return;
    }
    const nextScale = Number((input.value + delta).toFixed(3));
    if (nextScale <= 0) {
      this.markInputInvalid(this.window.document.getElementById("objectVectorStudioV2ScaleInput"), "Scale must be greater than 0.");
      this.statusLog.write(`FAIL Invalid transform rejected for shape row ${this.selectedShapeIndex}: scale must be greater than 0.`);
      return;
    }
    const inputElement = this.window.document.getElementById("objectVectorStudioV2ScaleInput");
    if (inputElement) {
      inputElement.value = this.formatScaleInputValue(nextScale);
      this.transformInputValues.set(inputElement.id, inputElement.value);
    }
    this.applySelectedShapeScaleValue(nextScale, {
      okMessage: `OK Scale preview set to ${this.formatScaleInputValue(nextScale)} for shape row ${this.selectedShapeIndex}.`,
      renderControls: false
    });
  }

  applySelectedShapeScaleValue(scale, { okMessage, renderControls = false } = {}) {
    if (!this.canUseShapeTransform()) {
      this.statusLog.write("WARN Transform scale skipped: select exactly one shape.");
      return false;
    }
    const selected = this.selectedShape();
    if (!selected) {
      this.statusLog.write("WARN Transform scale skipped: no shape is selected.");
      return false;
    }
    if (selected.locked) {
      this.statusLog.write(`WARN Transform scale skipped: shape row ${this.selectedShapeIndex} is locked.`);
      return false;
    }
    if (this.guardSelectedObjectMutation("Transform scale")) {
      return false;
    }

    const nextPayload = this.cloneCurrentPayload();
    const override = this.frameOverrideInPayload(nextPayload, this.selectedShapeIndex, { create: true });
    const shape = override
      ? this.effectiveShapeForFrame(this.findShapeInPayload(nextPayload, this.selectedShapeIndex), this.activeFrame(), this.selectedShapeIndex)
      : this.findShapeInPayload(nextPayload, this.selectedShapeIndex);
    shape.transform = this.ensureShapeTransform(shape);
    shape.transform.scaleX = Number(scale.toFixed(3));
    shape.transform.scaleY = Number(scale.toFixed(3));
    const transformErrors = this.validateShapeForTransform(shape);
    if (transformErrors.length) {
      this.statusLog.write(`FAIL Invalid transform rejected for shape row ${this.selectedShapeIndex}: ${transformErrors.join(" ")}`);
      return false;
    }
    if (override) {
      override.transform = this.ensureShapeTransform(shape);
    }

    const validation = this.schemaService.validatePayload(nextPayload);
    if (!validation.ok) {
      this.statusLog.write(`FAIL Transform scale failed schema validation: ${validation.errors.join(" ")}`);
      return false;
    }
    const hasPayloadChange = this.hasPayloadChanged(validation.payload);
    const workspaceSync = this.syncWorkspaceToolSessionPayload(validation.payload, {
      changedKeys: ["data.objects"],
      reason: "object-vector-transform-scale"
    });
    if (!workspaceSync.ok) {
      this.statusLog.write(`FAIL Transform scale failed schema validation: ${workspaceSync.message}`);
      return false;
    }

    this.recordPreviewHistorySnapshot(hasPayloadChange);
    this.currentPayload = validation.payload;
    this.actionNav.setJsonPayloadActionsEnabled(true);
    this.ensureSelectedFrame();
    if (renderControls) {
      this.renderPayload();
    } else {
      this.renderObjectTiles();
      this.renderShapeTiles();
      this.renderWorkSurface();
      this.updateTransformSummaryText();
      this.updateSelectedObjectJsonDetails();
      this.updateObjectActionState();
    }
    if (workspaceSync.changed) {
      this.statusLog.write(`OK Object Vector Studio V2 workspace dirty state: true; reason=${workspaceSync.reason}; changedKeys=${workspaceSync.changedKeys.join(", ")}.`);
    }
    if (okMessage) {
      this.statusLog.write(okMessage);
    }
    return true;
  }

  applyObjectScaleInputLive(inputElement) {
    const rawValue = inputElement?.value?.trim() || "";
    if (!rawValue) {
      this.markInputInvalid(inputElement, "Object Scale must be a finite number.");
      return;
    }
    const input = this.readScaleInput("objectVectorStudioV2ObjectScaleInput", "Object Scale");
    if (!input.ok) {
      this.statusLog.write(`FAIL Invalid object transform rejected: ${input.error}`);
      return;
    }
    this.applySelectedObjectScaleValue(input.value, {
      okMessage: `OK Object scale preview set to ${this.formatScaleInputValue(input.value)} for ${this.selectedObject()?.name || "selected object"}.`
    });
  }

  adjustSelectedObjectScale(delta) {
    const input = this.readScaleInput("objectVectorStudioV2ObjectScaleInput", "Object Scale");
    if (!input.ok) {
      this.statusLog.write(`FAIL Invalid object transform rejected: ${input.error}`);
      return;
    }
    const nextScale = Number((input.value + delta).toFixed(3));
    if (nextScale <= 0) {
      this.markInputInvalid(this.window.document.getElementById("objectVectorStudioV2ObjectScaleInput"), "Object Scale must be greater than 0.");
      this.statusLog.write("FAIL Invalid object transform rejected: scale must be greater than 0.");
      return;
    }
    const inputElement = this.window.document.getElementById("objectVectorStudioV2ObjectScaleInput");
    if (inputElement) {
      inputElement.value = this.formatScaleInputValue(nextScale);
      this.transformInputValues.set(inputElement.id, inputElement.value);
    }
    this.applySelectedObjectScaleValue(nextScale, {
      okMessage: `OK Object scale preview set to ${this.formatScaleInputValue(nextScale)} for ${this.selectedObject()?.name || "selected object"}.`
    });
  }

  applySelectedObjectScaleValue(scale, { okMessage } = {}) {
    const origin = this.readObjectOriginInputs();
    if (!origin.ok) {
      this.statusLog.write(`FAIL Invalid object transform rejected: ${origin.error}`);
      return false;
    }
    const object = this.selectedObject();
    return this.updateSelectedObjectTransforms("scale", (shape) => {
      shape.transform = this.transformWithScaledOriginAroundPivot(this.ensureShapeTransform(shape), origin.value, scale);
    }, okMessage || `OK Object scale preview set to ${this.formatScaleInputValue(scale)} for ${object?.name || "selected object"}.`, "Object Transform scale failed schema validation");
  }

  resizeSelectedObject() {
    const input = this.readScaleInput("objectVectorStudioV2ObjectScaleInput", "Object Scale");
    if (!input.ok) {
      this.statusLog.write(`FAIL Resize Geometry rejected for selected object: ${input.error}`);
      return;
    }
    const origin = this.readObjectOriginInputs();
    if (!origin.ok) {
      this.statusLog.write(`FAIL Resize Geometry rejected for selected object: ${origin.error}`);
      return;
    }
    const object = this.selectedObject();
    if (!object) {
      this.statusLog.write("WARN Resize Geometry skipped: no object is selected.");
      return;
    }
    if (this.guardSelectedObjectMutation("Resize Geometry")) {
      return;
    }

    const targetIndexes = this.selectedObjectShapeIndexes(object);
    const lockedIndex = targetIndexes.find((shapeIndex) => sortedShapes(object)[shapeIndex]?.locked);
    if (Number.isInteger(lockedIndex)) {
      this.statusLog.write(`WARN Resize Geometry skipped: shape row ${lockedIndex} is locked.`);
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    try {
      targetIndexes.forEach((shapeIndex) => {
        const baseShape = this.findShapeInPayload(nextPayload, shapeIndex);
        const override = this.frameOverrideInPayload(nextPayload, shapeIndex, { create: false });
        const transformTarget = override?.transform ? { transform: override.transform, geometry: baseShape.geometry } : baseShape;
        const transform = this.transformWithScaledOriginAroundPivot(this.ensureShapeTransform(transformTarget), origin.value, input.value);
        this.resizeShapeGeometryByTransformScale(baseShape, transform);
        transform.scaleX = 1;
        transform.scaleY = 1;
        if (override?.transform) {
          override.transform = transform;
        } else {
          baseShape.transform = transform;
        }
        const transformErrors = this.validateShapeForTransform(baseShape);
        if (transformErrors.length) {
          throw new Error(`shape row ${shapeIndex}: ${transformErrors.join(" ")}`);
        }
      });
    } catch (error) {
      this.statusLog.write(`FAIL Resize Geometry rejected for selected object: ${error.message}`);
      return;
    }

    this.transformInputValues.set("objectVectorStudioV2ObjectScaleInput", "1");
    this.commitPayloadUpdate(
      nextPayload,
      object.id,
      this.selectedShapeIndex,
      `OK Resize Geometry applied scale ${this.formatScaleInputValue(input.value)} to object ${object.name} (${targetIndexes.length} shapes); transform scale reset to 1.`,
      "Resize Geometry failed schema validation",
      {
        directSelectedShapeIndexes: this.directSelectedShapeIndexes,
        selectedShapeIndexes: this.selectedShapeIndexes
      }
    );
  }

  resizeSelectedShape() {
    if (!this.canUseShapeTransform()) {
      this.statusLog.write("WARN Resize Geometry skipped: select exactly one shape.");
      return;
    }
    const input = this.readScaleInput();
    if (!input.ok) {
      this.statusLog.write(`FAIL Resize Geometry rejected for shape row ${this.selectedShapeIndex}: ${input.error}`);
      return;
    }

    const selected = this.selectedShape();
    if (!selected) {
      this.statusLog.write("WARN Resize Geometry skipped: no shape is selected.");
      return;
    }
    if (selected.locked) {
      this.statusLog.write(`WARN Resize Geometry skipped: shape row ${this.selectedShapeIndex} is locked.`);
      return;
    }
    if (this.guardSelectedObjectMutation("Resize Geometry")) {
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const baseShape = this.findShapeInPayload(nextPayload, this.selectedShapeIndex);
    const override = this.frameOverrideInPayload(nextPayload, this.selectedShapeIndex, { create: false });
    const transformTarget = override?.transform ? { transform: override.transform, geometry: baseShape.geometry } : baseShape;
    const transform = this.ensureShapeTransform(transformTarget);
    transform.scaleX = input.value;
    transform.scaleY = input.value;

    try {
      this.resizeShapeGeometryByTransformScale(baseShape, transform);
      transform.scaleX = 1;
      transform.scaleY = 1;
      if (override?.transform) {
        override.transform = transform;
      } else {
        baseShape.transform = transform;
      }
      const transformErrors = this.validateShapeForTransform(baseShape);
      if (transformErrors.length) {
        this.statusLog.write(`FAIL Resize Geometry rejected for shape row ${this.selectedShapeIndex}: ${transformErrors.join(" ")}`);
        return;
      }
    } catch (error) {
      this.statusLog.write(`FAIL Resize Geometry rejected for shape row ${this.selectedShapeIndex}: ${error.message}`);
      return;
    }

    this.transformInputValues.set("objectVectorStudioV2ScaleInput", "1");
    this.commitPayloadUpdate(
      nextPayload,
      this.selectedObjectId,
      this.selectedShapeIndex,
      `OK Resize Geometry applied scale ${this.formatScaleInputValue(input.value)} to shape row ${this.selectedShapeIndex}; transform scale reset to 1.`,
      "Resize Geometry failed schema validation"
    );
  }

  applySelectedShapeOrigin() {
    if (!this.canUseShapeTransform()) {
      this.statusLog.write("WARN Transform origin skipped: select exactly one shape.");
      return;
    }
    const originX = this.numberInputValue("objectVectorStudioV2OriginXInput", "Origin X");
    const originY = this.numberInputValue("objectVectorStudioV2OriginYInput", "Origin Y");
    if (!originX.ok || !originY.ok) {
      this.statusLog.write(`FAIL Invalid transform rejected for shape row ${this.selectedShapeIndex}: ${originX.error || originY.error}`);
      return;
    }
    this.updateSelectedShapeTransform("origin", (shape) => {
      shape.transform = this.ensureShapeTransform(shape);
      shape.transform.shapeOrigin = {
        x: Number(originX.value.toFixed(3)),
        y: Number(originY.value.toFixed(3))
      };
    }, `OK Updated shape row ${this.selectedShapeIndex} origin/pivot to ${originX.value}, ${originY.value}.`);
  }

  autoOriginSelectedShapePivot() {
    if (!this.canUseShapeTransform()) {
      this.statusLog.write("WARN Auto Origin skipped: select exactly one shape.");
      return;
    }
    const object = this.selectedObject();
    if (!object) {
      this.statusLog.write("WARN Auto Origin skipped: no object is selected.");
      return;
    }
    const selected = this.selectedShape();
    if (!selected) {
      this.statusLog.write("WARN Auto Origin skipped: no shape is selected.");
      return;
    }
    const effectiveSelected = this.effectiveShape(selected, this.selectedShapeIndex);
    if (effectiveSelected.visible === false) {
      this.statusLog.write(`FAIL Auto Origin blocked: shape row ${this.selectedShapeIndex} is hidden.`);
      return;
    }
    const bounds = shapeBounds(effectiveSelected);
    const center = {
      x: this.formatViewportNumber(bounds.x + bounds.width / 2),
      y: this.formatViewportNumber(bounds.y + bounds.height / 2)
    };
    this.updateSelectedShapeTransform("auto origin", (shape) => {
      shape.transform = this.ensureShapeTransform(shape);
      shape.transform.shapeOrigin = center;
    }, `OK Auto Origin updated shape row ${this.selectedShapeIndex} origin/pivot from selected shape bounds ${center.x}, ${center.y}.`);
  }

  groupSelectedShapes() {
    const object = this.selectedObject();
    if (!object || this.selectedShapeIndexes.size < 2) {
      this.statusLog.write("WARN Group shapes skipped: select at least two shapes.");
      return;
    }
    if (this.guardSelectedObjectMutation("Group shapes")) {
      return;
    }
    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((candidate) => candidate.id === object.id);
    const groupId = this.uniqueGroupId(nextObject);
    const directIndexes = Array.from(this.directSelectedShapeIndexes)
      .map((shapeIndex) => normalizeShapeIndex(shapeIndex))
      .filter((shapeIndex) => this.selectedShapeIndexes.has(shapeIndex));
    const selectedIndexes = new Set((directIndexes.length >= 2 ? directIndexes : Array.from(this.selectedShapeIndexes))
      .map((shapeIndex) => normalizeShapeIndex(shapeIndex))
      .filter((shapeIndex) => shapeIndex >= 0));
    if (selectedIndexes.size < 2) {
      this.statusLog.write("WARN Group shapes skipped: select at least two shapes.");
      return;
    }
    sortedShapes(nextObject).forEach((shape, shapeIndex) => {
      if (selectedIndexes.has(shapeIndex)) {
        shape.groupId = groupId;
      }
    });
    this.pruneSingleMemberShapeGroups(nextObject);
    this.commitPayloadUpdate(nextPayload, object.id, this.selectedShapeIndex, `OK Grouped ${selectedIndexes.size} shapes into ${groupId}.`, "Group shapes failed schema validation", {
      directSelectedShapeIndexes: selectedIndexes,
      selectedShapeIndexes: selectedIndexes
    });
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
    const selectedIndexes = new Set(this.selectedShapeIndexes);
    const selectedGroupIds = new Set(sortedShapes(object)
      .filter((shape, shapeIndex) => selectedIndexes.has(shapeIndex) && shape.groupId)
      .map((shape) => shape.groupId));
    if (!selectedGroupIds.size) {
      this.statusLog.write("WARN Ungroup skipped: selected shapes are not grouped.");
      return;
    }
    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((candidate) => candidate.id === object.id);
    sortedShapes(nextObject).forEach((shape, shapeIndex) => {
      if (selectedIndexes.has(shapeIndex) && selectedGroupIds.has(shape.groupId)) {
        delete shape.groupId;
      }
    });
    this.pruneSingleMemberShapeGroups(nextObject);
    this.commitPayloadUpdate(nextPayload, object.id, this.selectedShapeIndex, `OK Ungrouped ${selectedIndexes.size} selected shapes from ${Array.from(selectedGroupIds).join(", ")}.`, "Ungroup shapes failed schema validation", {
      directSelectedShapeIndexes: selectedIndexes,
      selectedShapeIndexes: selectedIndexes
    });
  }

  pruneSingleMemberShapeGroups(object) {
    const groupCounts = new Map();
    sortedShapes(object).forEach((shape) => {
      const groupId = String(shape.groupId || "").trim();
      if (!groupId) {
        return;
      }
      groupCounts.set(groupId, (groupCounts.get(groupId) || 0) + 1);
    });
    sortedShapes(object).forEach((shape) => {
      const groupId = String(shape.groupId || "").trim();
      if (groupId && groupCounts.get(groupId) < 2) {
        delete shape.groupId;
      }
    });
  }

  applyShapeGeometryEdits(options = {}) {
    const selected = this.selectedShape();
    if (!selected) {
      this.statusLog.write("WARN Geometry edit skipped: no shape is selected.");
      return false;
    }
    if (!this.canUseShapeGeometry()) {
      this.statusLog.write("WARN Geometry edit skipped: select exactly one shape.");
      return false;
    }
    if (this.guardSelectedObjectMutation("Geometry edit")) {
      return false;
    }
    const fields = Array.from(this.elements.shapeGeometryDetails.querySelectorAll("[data-shape-geometry-field]"));
    const geometry = this.readShapeGeometryFields(selected, fields);
    if (!geometry.ok) {
      this.statusLog.write(`FAIL Invalid geometry rejected for shape row ${this.selectedShapeIndex}: ${geometry.error}`);
      return false;
    }
    return this.updateSelectedShapeGeometry("geometry edit", (shape) => {
      shape.geometry = geometry.value;
      if (shapeGeometryTool(shape) === "polygon" || shapeGeometryTool(shape) === "polyline") {
        const pointRounding = this.currentPointRoundingRows(geometry.value.points.length);
        this.applyPointRoundingToShape(shape, pointRounding);
      }
      shape.transform = this.ensureShapeTransform(shape);
    }, options.okMessage || `OK Auto-applied geometry edits to shape row ${this.selectedShapeIndex}.`);
  }

  addPolygonPointAfterRow(pointIndex, sourceButton = null) {
    const selected = this.selectedShape();
    if (!selected || !["polygon", "polyline"].includes(shapeGeometryTool(selected))) {
      this.statusLog.write("WARN Add point skipped: no editable point-list shape is selected.");
      return;
    }
    if (!this.canUseShapeGeometry()) {
      this.statusLog.write("WARN Add point skipped: select exactly one shape.");
      return;
    }
    if (!this.isEditablePolygonShape(selected)) {
      this.statusLog.write(`WARN Add point skipped for shape row ${this.selectedShapeIndex}: triangle point count is fixed.`);
      return;
    }
    const geometry = this.readCurrentPolygonGeometry(selected);
    if (!geometry.ok) {
      this.markPolygonPointAddInvalid(sourceButton, geometry.error);
      this.statusLog.write(`FAIL Add point rejected for shape row ${this.selectedShapeIndex}: ${geometry.error}`);
      return;
    }
    const points = geometry.value.points;
    const pointRounding = this.currentPointRoundingRows(points.length);
    const insertAfterIndex = Number(pointIndex);
    if (!Number.isInteger(insertAfterIndex) || insertAfterIndex < 0 || insertAfterIndex >= points.length) {
      const message = `point ${insertAfterIndex + 1} is not available.`;
      this.markPolygonPointAddInvalid(sourceButton, message);
      this.statusLog.write(`FAIL Add point rejected for shape row ${this.selectedShapeIndex}: ${message}`);
      return;
    }
    const currentPoint = points[insertAfterIndex];
    const nextPoint = {
      x: Number(currentPoint.x),
      y: Number(currentPoint.y)
    };
    points.splice(insertAfterIndex + 1, 0, nextPoint);
    pointRounding.splice(insertAfterIndex + 1, 0, pointRounding[insertAfterIndex] === true);
    this.rebuildPolygonPointList(points, pointRounding);
    this.clearPolygonPointSelections();
    this.clearPolygonPointAddValidity();
    this.clearPolygonPointDeleteValidity();
    this.applyShapeGeometryEdits({
      okMessage: `OK Added copied point after point ${insertAfterIndex + 1} for shape row ${this.selectedShapeIndex}.`
    });
  }

  deletePolygonPointRow(pointIndex, sourceButton = null) {
    const selected = this.selectedShape();
    if (!selected || !["polygon", "polyline"].includes(shapeGeometryTool(selected))) {
      this.statusLog.write("WARN Delete point skipped: no editable point-list shape is selected.");
      return;
    }
    if (!this.canUseShapeGeometry()) {
      this.statusLog.write("WARN Delete point skipped: select exactly one shape.");
      return;
    }
    if (!this.isEditablePolygonShape(selected)) {
      this.statusLog.write(`WARN Delete point skipped for shape row ${this.selectedShapeIndex}: triangle point count is fixed.`);
      return;
    }
    const geometry = this.readCurrentPolygonGeometry(selected);
    if (!geometry.ok) {
      this.markPolygonPointDeleteInvalid(sourceButton, geometry.error);
      this.statusLog.write(`FAIL Delete point rejected for shape row ${this.selectedShapeIndex}: ${geometry.error}`);
      return;
    }
    const normalizedIndex = Number(pointIndex);
    if (!Number.isInteger(normalizedIndex) || normalizedIndex < 0 || normalizedIndex >= geometry.value.points.length) {
      const message = `point ${normalizedIndex + 1} is not available.`;
      this.markPolygonPointDeleteInvalid(sourceButton, message);
      this.statusLog.write(`FAIL Delete point rejected for shape row ${this.selectedShapeIndex}: ${message}`);
      return;
    }
    const minPointCount = shapeGeometryTool(selected) === "polyline" ? 2 : 4;
    if (geometry.value.points.length - 1 < minPointCount) {
      const message = `${shapeGeometryTool(selected)} must keep at least ${minPointCount} points.`;
      this.markPolygonPointDeleteInvalid(sourceButton, message);
      this.statusLog.write(`FAIL Delete point rejected for shape row ${this.selectedShapeIndex}: ${message}`);
      return;
    }
    const nextPoints = geometry.value.points.filter((_, index) => index !== normalizedIndex);
    const nextPointRounding = this.currentPointRoundingRows(geometry.value.points.length).filter((_, index) => index !== normalizedIndex);
    if (nextPoints.length < minPointCount) {
      const message = `${shapeGeometryTool(selected)} must keep at least ${minPointCount} points.`;
      this.markPolygonPointDeleteInvalid(sourceButton, message);
      this.statusLog.write(`FAIL Delete point rejected for shape row ${this.selectedShapeIndex}: ${message}`);
      return;
    }
    this.rebuildPolygonPointList(nextPoints, nextPointRounding);
    this.clearPolygonPointSelections();
    this.clearPolygonPointAddValidity();
    this.clearPolygonPointDeleteValidity();
    this.applyShapeGeometryEdits({
      okMessage: `OK Deleted point ${normalizedIndex + 1} from shape row ${this.selectedShapeIndex}.`
    });
  }

  readCurrentPolygonGeometry(shape) {
    const fields = Array.from(this.elements.shapeGeometryDetails.querySelectorAll("[data-shape-geometry-field='points']"));
    return this.readShapeGeometryFields(shape, fields);
  }

  clearPolygonPointSelections() {
    this.elements.shapeGeometryDetails.querySelectorAll("[data-polygon-point-action-selected='true']").forEach((row) => {
      delete row.dataset.polygonPointActionSelected;
      row.classList.remove("is-action-selected");
      row.setAttribute("aria-pressed", "false");
    });
  }

  markPolygonPointAddInvalid(sourceButton, message) {
    if (!sourceButton) {
      return;
    }
    sourceButton.dataset.validationState = "invalid";
    sourceButton.setAttribute("aria-invalid", "true");
    sourceButton.title = message;
  }

  clearPolygonPointAddValidity() {
    this.elements.shapeGeometryDetails.querySelectorAll("[data-polygon-point-add='true']").forEach((button) => {
      delete button.dataset.validationState;
      button.removeAttribute("aria-invalid");
      button.title = `Add point after point ${Number(button.dataset.polygonPointIndex) + 1}`;
    });
  }

  markPolygonPointDeleteInvalid(sourceButton, message) {
    if (!sourceButton) {
      return;
    }
    sourceButton.dataset.validationState = "invalid";
    sourceButton.setAttribute("aria-invalid", "true");
    sourceButton.title = message;
  }

  clearPolygonPointDeleteValidity() {
    this.elements.shapeGeometryDetails.querySelectorAll("[data-polygon-point-delete='true']").forEach((button) => {
      delete button.dataset.validationState;
      button.removeAttribute("aria-invalid");
      button.title = `Delete point ${Number(button.dataset.polygonPointIndex) + 1}`;
    });
  }

  currentPointRoundingRows(expectedCount = null) {
    const checkboxes = Array.from(this.elements.shapeGeometryDetails.querySelectorAll("[data-polygon-point-round='true']"));
    const pointRounding = checkboxes
      .sort((left, right) => Number(left.dataset.polygonPointIndex) - Number(right.dataset.polygonPointIndex))
      .map((checkbox) => checkbox.checked === true);
    const count = Number.isInteger(expectedCount) ? expectedCount : pointRounding.length;
    return Array.from({ length: count }, (_, index) => pointRounding[index] === true);
  }

  normalizedPointRounding(shape, pointCount = this.shapeGeometryPointCount(shape)) {
    const values = this.shapePointRoundingValues(shape);
    return Array.from({ length: pointCount }, (_, index) => values[index] === true);
  }

  applyPointRoundingToShape(shape, pointRounding) {
    const normalized = Array.from({ length: this.shapeGeometryPointCount(shape) || pointRounding.length }, (_, index) => pointRounding[index] === true);
    shape.style = { ...shape.style, pointRounding: normalized };
    delete shape.style.strokeLinecap;
    shape.style.startPointStyle = normalized[0] ? "round" : "square";
    shape.style.endPointStyle = normalized.at(-1) ? "round" : "square";
    shape.style.pointStyle = "square";
  }

  rebuildPolygonPointList(points, pointRounding = null) {
    const list = this.elements.shapeGeometryDetails.querySelector(".object-vector-studio-v2__polygon-point-list");
    if (!list) {
      return;
    }
    const selected = this.selectedShape();
    const selectable = this.isEditablePolygonShape(selected);
    const rounding = pointRounding || this.normalizedPointRounding(selected, points.length);
    list.replaceChildren(this.createPointRowHeader({ addable: selectable, deletable: selectable }), ...points.map((point, index) => this.createPolygonPointRow(point, index, {
      addable: selectable,
      deletable: selectable,
      rounded: rounding[index] === true,
      selectable: false
    })));
  }

  reindexPolygonPointRows() {
    this.elements.shapeGeometryDetails.querySelectorAll(".object-vector-studio-v2__polygon-point-field").forEach((row, index) => {
      const caption = row.querySelector(".object-vector-studio-v2__polygon-point-label");
      if (caption) {
        caption.textContent = `Point ${index + 1}`;
      }
      row.querySelectorAll("[data-polygon-point-index]").forEach((input) => {
        input.dataset.polygonPointIndex = String(index);
      });
      row.dataset.polygonPointIndex = String(index);
      const roundCheckbox = row.querySelector("[data-polygon-point-round='true']");
      if (roundCheckbox) {
        roundCheckbox.setAttribute("aria-label", `Round point ${index + 1}`);
      }
      const addButton = row.querySelector("[data-polygon-point-add='true']");
      if (addButton) {
        addButton.setAttribute("aria-label", `Add point after point ${index + 1}`);
        addButton.title = `Add point after point ${index + 1}`;
      }
      const deleteButton = row.querySelector("[data-polygon-point-delete='true']");
      if (deleteButton) {
        deleteButton.setAttribute("aria-label", `Delete point ${index + 1}`);
        deleteButton.title = `Delete point ${index + 1}`;
      }
    });
  }

  readShapeGeometryFields(shape, fields) {
    try {
      if (shapeGeometryTool(shape) === "polygon" || shapeGeometryTool(shape) === "polyline") {
        const pointInputs = fields.filter((input) => input.dataset.shapeGeometryField === "points");
        const geometryTool = shapeGeometryTool(shape);
        const requiredPointCount = this.isTriangleShape(shape) ? 3 : geometryTool === "polyline" ? 2 : 4;
        const shapeLabel = this.isTriangleShape(shape) ? "triangle" : geometryTool;
        if (pointInputs.length < requiredPointCount) {
          throw new Error(`${shapeLabel} points must contain at least ${requiredPointCount} point rows.`);
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
        if (pointRows.size < requiredPointCount) {
          throw new Error(`${shapeLabel} points must contain at least ${requiredPointCount} point rows.`);
        }
        if (this.isTriangleShape(shape) && pointRows.size !== 3) {
          throw new Error("triangle points must contain exactly three point rows.");
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
          this.writeGeometryFieldValue(geometry, key, parsed.value);
        } else {
          this.clearInputValidity(input);
          this.writeGeometryFieldValue(geometry, key, input.value);
        }
      }
      if (shapeTool(shape) === "square") {
        const sizeInput = fields.find((input) => input.dataset.shapeGeometryField === "size") || null;
        if (!(geometry.size > 0)) {
          const message = "Size must be greater than 0.";
          if (sizeInput) {
            this.markInputInvalid(sizeInput, message);
          }
          return { error: message, ok: false, value: null };
        }
        return {
          ok: true,
          value: {
            height: geometry.size,
            width: geometry.size,
            x: geometry.x,
            y: geometry.y
          }
        };
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

  writeGeometryFieldValue(geometry, key, value) {
    if (!key.includes(".")) {
      geometry[key] = value;
      return;
    }
    const [parentKey, childKey] = key.split(".");
    geometry[parentKey] = {
      ...(geometry[parentKey] || {}),
      [childKey]: value
    };
  }

  updateSelectedShapeGeometry(operation, updater, okMessage, options = {}) {
    const selected = this.selectedShape();
    if (!selected) {
      this.statusLog.write(`WARN Geometry ${operation} skipped: no shape is selected.`);
      return false;
    }
    if (selected.locked) {
      this.statusLog.write(`WARN Geometry ${operation} skipped: shape row ${this.selectedShapeIndex} is locked.`);
      return false;
    }
    if (this.guardSelectedObjectMutation(`Geometry ${operation}`)) {
      return false;
    }

    const nextPayload = this.cloneCurrentPayload();
    const shape = this.findShapeInPayload(nextPayload, this.selectedShapeIndex);
    try {
      updater(shape);
      shape.transform = this.ensureShapeTransform(shape);
      const transformErrors = this.validateShapeForTransform(shape);
      if (transformErrors.length) {
        this.statusLog.write(`FAIL Invalid geometry rejected for shape row ${this.selectedShapeIndex}: ${transformErrors.join(" ")}`);
        return false;
      }
    } catch (error) {
      this.statusLog.write(`FAIL Invalid geometry rejected for shape row ${this.selectedShapeIndex}: ${error.message}`);
      return false;
    }
    return this.commitPayloadUpdate(nextPayload, this.selectedObjectId, this.selectedShapeIndex, okMessage, `Geometry ${operation} failed schema validation`, options);
  }

  updateSelectedShapeTransform(operation, updater, okMessage, options = {}) {
    const selected = this.selectedShape();
    if (!selected) {
      this.statusLog.write(`WARN Transform ${operation} skipped: no shape is selected.`);
      return;
    }
    if (selected.locked) {
      this.statusLog.write(`WARN Transform ${operation} skipped: shape row ${this.selectedShapeIndex} is locked.`);
      return;
    }
    if (this.guardSelectedObjectMutation(`Transform ${operation}`)) {
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const override = this.frameOverrideInPayload(nextPayload, this.selectedShapeIndex, { create: true });
    const shape = override
      ? this.effectiveShapeForFrame(this.findShapeInPayload(nextPayload, this.selectedShapeIndex), this.activeFrame(), this.selectedShapeIndex)
      : this.findShapeInPayload(nextPayload, this.selectedShapeIndex);
    try {
      updater(shape);
      const transformErrors = this.validateShapeForTransform(shape);
      if (transformErrors.length) {
        this.statusLog.write(`FAIL Invalid transform rejected for shape row ${this.selectedShapeIndex}: ${transformErrors.join(" ")}`);
        return;
      }
    } catch (error) {
      this.statusLog.write(`FAIL Invalid transform rejected for shape row ${this.selectedShapeIndex}: ${error.message}`);
      return;
    }
    if (override) {
      override.transform = this.ensureShapeTransform(shape);
    }
    this.commitPayloadUpdate(nextPayload, this.selectedObjectId, this.selectedShapeIndex, okMessage, `Transform ${operation} failed schema validation`, options);
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
    shape.order = object.shapes.length ? Math.max(...object.shapes.map((candidate) => candidate.order)) + 1 : 1;
    shape.transform = this.ensureShapeTransform(shape);
    shape.transform.x = Number((shape.transform.x + 10).toFixed(3));
    shape.transform.y = Number((shape.transform.y + 10).toFixed(3));
    object.shapes.push(shape);
    this.commitPayloadUpdate(nextPayload, object.id, sortedShapes(object).length - 1, `OK Duplicated shape row ${this.selectedShapeIndex}.`, "Duplicate shape failed schema validation");
  }

  deleteSelectedShape(sourceLabel) {
    const selected = this.selectedShape();
    if (!selected) {
      this.statusLog.write(`WARN Delete shape skipped from ${sourceLabel}: no shape is selected.`);
      return;
    }
    if (selected.locked) {
      this.statusLog.write(`WARN Delete shape skipped: shape row ${this.selectedShapeIndex} is locked.`);
      return;
    }
    if (this.guardSelectedObjectMutation("Delete shape")) {
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const object = nextPayload.objects.find((candidate) => candidate.id === this.selectedObjectId);
    const deleteIndex = this.selectedShapeIndex;
    object.shapes = sortedShapes(object).filter((shape, shapeIndex) => shapeIndex !== deleteIndex)
      .map((shape, index) => ({ ...shape, order: index + 1 }));
    this.pruneSingleMemberShapeGroups(object);
    this.removeDeletedShapeReferences(object, deleteIndex);
    this.removeDanglingShapeOverrideReferences(nextPayload);
    const selectedShapeIndex = sortedShapes(object).length ? 0 : -1;
    this.commitPayloadUpdate(nextPayload, object.id, selectedShapeIndex, `OK Deleted shape row ${deleteIndex} from ${sourceLabel}.`, "Delete shape failed schema validation");
  }

  deleteShapeByIndex(shapeIndex, sourceLabel, objectId = this.selectedObjectId) {
    const deleteIndex = normalizeShapeIndex(shapeIndex);
    const object = this.currentPayload?.objects.find((candidate) => candidate.id === objectId) || null;
    const shape = sortedShapes(object)[deleteIndex] || null;
    if (!object || !shape) {
      this.statusLog.write(`WARN Delete shape skipped from ${sourceLabel}: shape row ${shapeIndex ?? "unknown"} is not available.`);
      return;
    }
    if (shape.locked) {
      this.statusLog.write(`WARN Delete shape skipped: shape row ${deleteIndex} is locked.`);
      return;
    }
    if (this.isObjectLocked(object.id)) {
      this.statusLog.write(`WARN Delete shape blocked: object ${object.name} is locked for this runtime session.`);
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((candidate) => candidate.id === object.id);
    nextObject.shapes = sortedShapes(nextObject).filter((candidate, index) => index !== deleteIndex)
      .map((candidate, index) => ({ ...candidate, order: index + 1 }));
    this.pruneSingleMemberShapeGroups(nextObject);
    this.removeDeletedShapeReferences(nextObject, deleteIndex);
    this.removeDanglingShapeOverrideReferences(nextPayload);
    const selectedShapeStillExists = this.selectedShapeIndex >= 0 && this.selectedShapeIndex < sortedShapes(nextObject).length;
    const selectedShapeIndex = selectedShapeStillExists ? this.selectedShapeIndex : sortedShapes(nextObject).length ? 0 : -1;
    this.commitPayloadUpdate(nextPayload, object.id, selectedShapeIndex, `OK Deleted shape row ${deleteIndex} from ${sourceLabel}.`, "Delete shape failed schema validation");
  }

  removeDeletedShapeReferences(object, deletedShapeIndex) {
    this.objectStates(object).forEach((state) => {
      state.frames.forEach((frame) => {
        frame.shapeOverrides = frame.shapeOverrides
          .filter((override) => override.shapeIndex !== deletedShapeIndex)
          .map((override) => ({
            ...override,
            shapeIndex: override.shapeIndex > deletedShapeIndex ? override.shapeIndex - 1 : override.shapeIndex
          }));
      });
    });
  }

  remapShapeOverrideIndexes(object, oldShapes, nextShapes) {
    const oldIndexToNextIndex = new Map();
    oldShapes.forEach((shape, oldIndex) => {
      oldIndexToNextIndex.set(oldIndex, nextShapes.indexOf(shape));
    });
    this.objectStates(object).forEach((state) => {
      state.frames.forEach((frame) => {
        frame.shapeOverrides = frame.shapeOverrides
          .map((override) => {
            const nextIndex = oldIndexToNextIndex.get(override.shapeIndex);
            return Number.isInteger(nextIndex) && nextIndex >= 0
              ? { ...override, shapeIndex: nextIndex }
              : null;
          })
          .filter(Boolean);
      });
    });
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
    const normalizedValue = this.formatViewportNumber(value);
    element.value = String(normalizedValue);
    return { error: "", ok: true, value: normalizedValue };
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
    return value;
  }

  snapAngle(value) {
    if (!this.angleSnapEnabled) {
      return value;
    }
    const step = ANGLE_SNAP_STEPS.includes(this.angleSnapStep) ? this.angleSnapStep : 15;
    return Math.round(value / step) * step;
  }

  ensureShapeTransform(shape) {
    if (!shape.transform) {
      return defaultShapeTransform(shape);
    }
    return {
      ...shape.transform,
      shapeOrigin: { ...shape.transform.shapeOrigin }
    };
  }

  resizeShapeGeometryByTransformScale(shape, transform) {
    if (!Number.isFinite(transform.scaleX) || !Number.isFinite(transform.scaleY) || transform.scaleX <= 0 || transform.scaleY <= 0) {
      throw new Error("scale must be greater than 0.");
    }
    const scaleX = transform.scaleX;
    const scaleY = transform.scaleY;
    const uniformScale = Number(((scaleX + scaleY) / 2).toFixed(3));
    const requiresUniformScale = (label) => {
      if (Math.abs(scaleX - scaleY) > 0.001) {
        throw new Error(`${label} geometry cannot bake non-uniform scale; set matching X/Y scale first.`);
      }
      return uniformScale;
    };
    const applyX = (value) => Number((transform.shapeOrigin.x + (value - transform.shapeOrigin.x) * scaleX).toFixed(3));
    const applyY = (value) => Number((transform.shapeOrigin.y + (value - transform.shapeOrigin.y) * scaleY).toFixed(3));
    const geometryTool = shapeGeometryTool(shape);
    if (geometryTool === "rectangle") {
      shape.geometry.x = applyX(shape.geometry.x);
      shape.geometry.y = applyY(shape.geometry.y);
      shape.geometry.width = Number((shape.geometry.width * scaleX).toFixed(3));
      shape.geometry.height = Number((shape.geometry.height * scaleY).toFixed(3));
      return;
    }
    if (geometryTool === "circle") {
      const scale = requiresUniformScale("circle");
      shape.geometry.cx = applyX(shape.geometry.cx);
      shape.geometry.cy = applyY(shape.geometry.cy);
      shape.geometry.r = Number((shape.geometry.r * scale).toFixed(3));
      return;
    }
    if (geometryTool === "ellipse") {
      shape.geometry.cx = applyX(shape.geometry.cx);
      shape.geometry.cy = applyY(shape.geometry.cy);
      shape.geometry.rx = Number((shape.geometry.rx * scaleX).toFixed(3));
      shape.geometry.ry = Number((shape.geometry.ry * scaleY).toFixed(3));
      return;
    }
    if (geometryTool === "line") {
      shape.geometry.point1.x = applyX(shape.geometry.point1.x);
      shape.geometry.point1.y = applyY(shape.geometry.point1.y);
      shape.geometry.point2.x = applyX(shape.geometry.point2.x);
      shape.geometry.point2.y = applyY(shape.geometry.point2.y);
      return;
    }
    if (geometryTool === "arc") {
      const scale = requiresUniformScale("arc");
      shape.geometry.cx = applyX(shape.geometry.cx);
      shape.geometry.cy = applyY(shape.geometry.cy);
      shape.geometry.r = Number((shape.geometry.r * scale).toFixed(3));
      return;
    }
    if (geometryTool === "text") {
      const scale = requiresUniformScale("text");
      shape.geometry.x = applyX(shape.geometry.x);
      shape.geometry.y = applyY(shape.geometry.y);
      shape.geometry.fontSize = Number((shape.geometry.fontSize * scale).toFixed(3));
      return;
    }
    shape.geometry.points = shape.geometry.points.map((point) => ({
      x: applyX(point.x),
      y: applyY(point.y)
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
    ["x", "y", "rotation", "scaleX", "scaleY"].forEach((key) => {
      if (!Number.isFinite(transform[key])) {
        errors.push(`transform.${key} must be a finite number.`);
      }
    });
    if (!transform.shapeOrigin || !Number.isFinite(transform.shapeOrigin.x) || !Number.isFinite(transform.shapeOrigin.y)) {
      errors.push("transform.shapeOrigin.x and transform.shapeOrigin.y must be finite numbers.");
    }
    if (Number.isFinite(transform.scaleX) && transform.scaleX <= 0) {
      errors.push("scaleX must be greater than 0.");
    }
    if (Number.isFinite(transform.scaleY) && transform.scaleY <= 0) {
      errors.push("scaleY must be greater than 0.");
    }
    return errors;
  }

  commitPayloadUpdate(nextPayload, selectedObjectId, selectedShapeIndex, okMessage, failPrefix, options = {}) {
    const validation = this.schemaService.validatePayload(nextPayload);
    if (!validation.ok) {
      this.statusLog.write(`FAIL ${failPrefix}: ${validation.errors.join(" ")}`);
      return false;
    }
    const hasPayloadChange = this.hasPayloadChanged(validation.payload);

    const workspaceSync = this.syncWorkspaceToolSessionPayload(validation.payload, {
      changedKeys: options.changedKeys,
      reason: options.dirtyReason
    });
    if (!workspaceSync.ok) {
      this.statusLog.write(`FAIL ${failPrefix}: ${workspaceSync.message}`);
      return false;
    }

    this.recordPreviewHistorySnapshot(hasPayloadChange, options);
    this.currentPayload = validation.payload;
    this.selectedObjectId = selectedObjectId;
    this.selectedShapeIndex = normalizeShapeIndex(selectedShapeIndex);
    this.selectedShapeIndexes = options.selectedShapeIndexes
      ? new Set(Array.from(options.selectedShapeIndexes).map((index) => normalizeShapeIndex(index)).filter((index) => index >= 0))
      : new Set(this.selectedShapeIndex >= 0 ? [this.selectedShapeIndex] : []);
    this.directSelectedShapeIndexes = options.directSelectedShapeIndexes
      ? new Set(Array.from(options.directSelectedShapeIndexes).map((index) => normalizeShapeIndex(index)).filter((index) => index >= 0))
      : (options.selectedShapeIndexes
        ? new Set(this.selectedShapeIndexes)
        : new Set(this.selectedShapeIndex >= 0 ? [this.selectedShapeIndex] : []));
    this.selectedStateId = options.selectedStateId ?? this.selectedStateId;
    this.stateControlStateId = this.selectedStateId || this.stateControlStateId;
    this.selectedFrameId = options.selectedFrameId ?? this.selectedFrameId;
    this.ensureSelectedFrame();
    this.actionNav.setJsonPayloadActionsEnabled(true);
    this.renderPayload({ syncPaletteSelection: options.syncPaletteSelection !== false });
    if (workspaceSync.changed) {
      this.statusLog.write(`OK Object Vector Studio V2 workspace dirty state: true; reason=${workspaceSync.reason}; changedKeys=${workspaceSync.changedKeys.join(", ")}.`);
    }
    this.statusLog.write(okMessage);
    return true;
  }

  syncWorkspaceToolSessionPayload(payload, { changedKeys = ["data.objects"], reason = "object-vector-updated" } = {}) {
    if (!this.actionNav.isWorkspaceLaunch()) {
      return { changed: false, ok: true };
    }
    const rawSession = this.window.sessionStorage?.getItem(WORKSPACE_TOOL_SESSION_KEY) || "";
    if (!rawSession) {
      return { ok: false, message: `workspace dirty tracking failed: missing ${WORKSPACE_TOOL_SESSION_KEY}.` };
    }

    let session;
    try {
      session = JSON.parse(rawSession);
    } catch (error) {
      return { ok: false, message: `workspace dirty tracking failed: ${WORKSPACE_TOOL_SESSION_KEY} is invalid JSON: ${error.message}.` };
    }
    if (!isPlainObject(session)
      || !isPlainObject(session.schema)
      || !isPlainObject(session.workspace)
      || !Object.prototype.hasOwnProperty.call(session, "data")
      || !isPlainObject(session.dirty)) {
      return { ok: false, message: `workspace dirty tracking failed: ${WORKSPACE_TOOL_SESSION_KEY} must use the normalized schema/workspace/data/dirty object shape.` };
    }

    const dataChanged = JSON.stringify(session.data) !== JSON.stringify(payload);
    if (!dataChanged) {
      return { changed: false, ok: true };
    }

    const normalizedKeys = this.normalizedWorkspaceDirtyKeys(changedKeys);
    const previousKeys = session.dirty.isDirty === true
      ? this.normalizedWorkspaceDirtyKeys(session.dirty.changedKeys)
      : [];
    const mergedChangedKeys = Array.from(new Set([...previousKeys, ...normalizedKeys]));
    const dirtyReason = String(reason || "object-vector-updated").trim() || "object-vector-updated";
    const nextSession = {
      ...session,
      data: payload,
      dirty: {
        isDirty: true,
        reason: dirtyReason,
        changedAt: new Date().toISOString(),
        changedKeys: mergedChangedKeys
      }
    };
    try {
      this.window.sessionStorage?.setItem(WORKSPACE_TOOL_SESSION_KEY, JSON.stringify(nextSession));
    } catch (error) {
      return { ok: false, message: `workspace dirty tracking failed: unable to write ${WORKSPACE_TOOL_SESSION_KEY}: ${error.message}.` };
    }
    return {
      changed: true,
      changedKeys: mergedChangedKeys,
      ok: true,
      reason: dirtyReason,
      session: nextSession
    };
  }

  normalizedWorkspaceDirtyKeys(changedKeys) {
    const keys = Array.isArray(changedKeys) ? changedKeys : ["data.objects"];
    const normalized = keys
      .map((key) => String(key || "").trim())
      .filter(Boolean);
    return normalized.length ? normalized : ["data.objects"];
  }

  hasPayloadChanged(nextPayload) {
    return Boolean(this.currentPayload) && JSON.stringify(this.currentPayload) !== JSON.stringify(nextPayload);
  }

  recordPreviewHistorySnapshot(hasPayloadChange, options = {}) {
    if (!hasPayloadChange || options.skipPreviewHistory || !this.currentPayload) {
      return;
    }
    this.previewUndoStack.push(this.cloneCurrentPayload());
    if (this.previewUndoStack.length > PREVIEW_HISTORY_LIMIT) {
      this.previewUndoStack.shift();
    }
    this.previewRedoStack = [];
  }

  cloneCurrentPayload() {
    return this.clonePayloadValue(this.currentPayload);
  }

  clonePayloadValue(payload) {
    if (typeof this.window.structuredClone === "function") {
      return this.window.structuredClone(payload);
    }
    return JSON.parse(JSON.stringify(payload));
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
    const shapeByOrder = new Map(baseObject.shapes.map((shape) => [shape.order, JSON.parse(JSON.stringify(shape))]));
    object.shapes.forEach((shape) => {
      shapeByOrder.set(shape.order, JSON.parse(JSON.stringify(shape)));
    });
    const stateById = new Map((baseObject.states || []).map((state) => [state.id, JSON.parse(JSON.stringify(state))]));
    (object.states || []).forEach((state) => {
      stateById.set(state.id, JSON.parse(JSON.stringify(state)));
    });
    const resolved = {
      ...baseObject,
      ...JSON.parse(JSON.stringify(object)),
      inheritedFrom: object.baseObjectId,
      shapes: Array.from(shapeByOrder.values()).sort((left, right) => left.order - right.order)
    };
    if (stateById.size) {
      resolved.states = Array.from(stateById.values());
    } else {
      delete resolved.states;
    }
    return resolved;
  }

  selectedShape() {
    return sortedShapes(this.selectedObject())[this.selectedShapeIndex] || null;
  }

  ensureSelectedShape() {
    const object = this.selectedObject();
    if (!object) {
      this.selectedShapeIndex = -1;
      this.selectedShapeIndexes.clear();
      this.directSelectedShapeIndexes.clear();
      return;
    }
    if (this.selectedShapeIndex >= 0 && this.selectedShapeIndex < sortedShapes(object).length) {
      if (!this.selectedShapeIndexes.size) {
        this.selectedShapeIndexes = new Set([this.selectedShapeIndex]);
      }
      this.directSelectedShapeIndexes = new Set(Array.from(this.directSelectedShapeIndexes)
        .map((index) => normalizeShapeIndex(index))
        .filter((index) => index >= 0 && index < sortedShapes(object).length));
      if (!this.directSelectedShapeIndexes.size) {
        this.directSelectedShapeIndexes = new Set([this.selectedShapeIndex]);
      }
      return;
    }
    this.selectedShapeIndex = sortedShapes(object).length ? 0 : -1;
    this.selectedShapeIndexes = new Set(this.selectedShapeIndex >= 0 ? [this.selectedShapeIndex] : []);
    this.directSelectedShapeIndexes = new Set(this.selectedShapeIndex >= 0 ? [this.selectedShapeIndex] : []);
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
    if (!OBJECT_STATE_IDS.includes(this.stateControlStateId)) {
      this.stateControlStateId = this.selectedStateId || OBJECT_STATE_IDS[0];
    }
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

  groupColor(groupId) {
    const text = String(groupId || "");
    const hash = Array.from(text).reduce((total, character) => total + character.codePointAt(0), 0);
    return GROUP_COLOR_SWATCHES[hash % GROUP_COLOR_SWATCHES.length];
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
      shapeOverrides: sortedShapes(object).map((shape, shapeIndex) => ({
        shapeIndex,
        transform: this.shapeTransform(shape),
        visible: shape.visible
      }))
    };
  }

  frameOverrideInPayload(payload, shapeIndex, { create = false } = {}) {
    const normalizedIndex = normalizeShapeIndex(shapeIndex);
    const object = payload.objects.find((candidate) => candidate.id === this.selectedObjectId);
    const state = this.objectStates(object).find((candidate) => candidate.id === this.selectedStateId);
    const frame = sortedFrames(state).find((candidate) => candidate.id === this.selectedFrameId);
    if (!object || !state || !frame) {
      return null;
    }
    let override = frame.shapeOverrides.find((entry) => entry.shapeIndex === normalizedIndex);
    if (!override && create) {
      const baseShape = sortedShapes(object)[normalizedIndex];
      if (!baseShape) {
        return null;
      }
      override = {
        shapeIndex: normalizedIndex,
        transform: this.shapeTransform(baseShape),
        visible: baseShape.visible
      };
      frame.shapeOverrides.push(override);
    }
    return override || null;
  }

  findShapeInPayload(payload, shapeIndex) {
    const object = payload.objects.find((candidate) => candidate.id === this.selectedObjectId);
    return sortedShapes(object)[normalizeShapeIndex(shapeIndex)] || null;
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
    const baseId = `object.${gameKey}.${canonicalObjectSlug(name, gameKey)}`;
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
    let suffix = 1;
    let candidate = `frame-${suffix}`;
    while (usedIds.has(candidate)) {
      suffix += 1;
      candidate = `frame-${suffix}`;
    }
    return candidate;
  }

  clearPreviewEditState({ clipboard = false } = {}) {
    this.previewUndoStack = [];
    this.previewRedoStack = [];
    if (clipboard) {
      this.previewClipboardShape = null;
    }
  }

  copyPreviewSelection() {
    const shape = this.selectedShape();
    if (!shape) {
      this.statusLog.write("WARN Copy skipped: no Object Preview shape is selected.");
      this.updatePreviewEditActionState();
      return;
    }
    this.previewClipboardShape = this.clonePayloadValue(shape);
    this.updatePreviewEditActionState();
    this.statusLog.write(`OK Copied shape row ${this.selectedShapeIndex} to Object Preview clipboard.`);
  }

  pastePreviewClipboard() {
    const object = this.selectedObject();
    if (!object) {
      this.statusLog.write("WARN Paste skipped: no object is selected.");
      this.updatePreviewEditActionState();
      return;
    }
    if (!this.previewClipboardShape) {
      this.statusLog.write("WARN Paste skipped: Object Preview clipboard is empty.");
      this.updatePreviewEditActionState();
      return;
    }
    if (this.guardSelectedObjectMutation("Paste shape")) {
      this.updatePreviewEditActionState();
      return;
    }

    const nextPayload = this.cloneCurrentPayload();
    const nextObject = nextPayload.objects.find((candidate) => candidate.id === object.id);
    const shape = this.clonePayloadValue(this.previewClipboardShape);
    shape.order = nextObject.shapes.length ? Math.max(...nextObject.shapes.map((candidate) => candidate.order)) + 1 : 1;
    shape.transform = this.ensureShapeTransform(shape);
    shape.transform.x = Number((shape.transform.x + 10).toFixed(3));
    shape.transform.y = Number((shape.transform.y + 10).toFixed(3));
    nextObject.shapes.push(shape);
    this.commitPayloadUpdate(nextPayload, nextObject.id, sortedShapes(nextObject).length - 1, `OK Pasted copied shape into ${nextObject.name}.`, "Paste shape failed schema validation");
  }

  undoPreviewEdit() {
    if (!this.previewUndoStack.length) {
      this.statusLog.write("WARN Undo skipped: no Object Preview edit history is available.");
      this.updatePreviewEditActionState();
      return;
    }
    const targetPayload = this.previewUndoStack.at(-1);
    const currentPayload = this.cloneCurrentPayload();
    if (!this.applyPreviewHistoryPayload(targetPayload, "Undo")) {
      this.updatePreviewEditActionState();
      return;
    }
    this.previewUndoStack.pop();
    this.previewRedoStack.push(currentPayload);
    if (this.previewRedoStack.length > PREVIEW_HISTORY_LIMIT) {
      this.previewRedoStack.shift();
    }
    this.updatePreviewEditActionState();
  }

  redoPreviewEdit() {
    if (!this.previewRedoStack.length) {
      this.statusLog.write("WARN Redo skipped: no Object Preview redo history is available.");
      this.updatePreviewEditActionState();
      return;
    }
    const targetPayload = this.previewRedoStack.at(-1);
    const currentPayload = this.cloneCurrentPayload();
    if (!this.applyPreviewHistoryPayload(targetPayload, "Redo")) {
      this.updatePreviewEditActionState();
      return;
    }
    this.previewRedoStack.pop();
    this.previewUndoStack.push(currentPayload);
    if (this.previewUndoStack.length > PREVIEW_HISTORY_LIMIT) {
      this.previewUndoStack.shift();
    }
    this.updatePreviewEditActionState();
  }

  applyPreviewHistoryPayload(payload, actionLabel) {
    const validation = this.schemaService.validatePayload(payload);
    if (!validation.ok) {
      this.statusLog.write(`FAIL ${actionLabel} failed schema validation: ${validation.errors.join(" ")}`);
      return false;
    }
    const workspaceSync = this.syncWorkspaceToolSessionPayload(validation.payload, {
      changedKeys: ["data.objects"],
      reason: `object-vector-preview-${actionLabel.toLowerCase()}`
    });
    if (!workspaceSync.ok) {
      this.statusLog.write(`FAIL ${actionLabel} failed schema validation: ${workspaceSync.message}`);
      return false;
    }
    this.currentPayload = validation.payload;
    if (!this.currentPayload.objects.some((object) => object.id === this.selectedObjectId)) {
      this.selectedObjectId = this.currentPayload.objects[0]?.id || "";
      this.selectedShapeIndex = -1;
      this.selectedShapeIndexes.clear();
      this.directSelectedShapeIndexes.clear();
    }
    this.actionNav.setJsonPayloadActionsEnabled(true);
    this.renderPayload({ syncPaletteSelection: false });
    if (workspaceSync.changed) {
      this.statusLog.write(`OK Object Vector Studio V2 workspace dirty state: true; reason=${workspaceSync.reason}; changedKeys=${workspaceSync.changedKeys.join(", ")}.`);
    }
    this.statusLog.write(`OK ${actionLabel} applied to Object Preview edits.`);
    return true;
  }

  updatePreviewEditActionState() {
    const object = this.selectedObject();
    const shape = this.selectedShape();
    const noShapeReason = "Disabled until a schema-valid shape is selected.";
    const noObjectReason = "Disabled until a schema-valid object is selected.";
    const lockedReason = object ? `Disabled because ${object.name} is locked for this runtime session.` : noObjectReason;
    const isLocked = Boolean(object && this.isObjectLocked(object.id));
    this.setControlDisabled(this.elements.previewUndoButton, !this.previewUndoStack.length, "Disabled until an Object Preview edit can be undone.", "Undo the last Object Preview edit.");
    this.setControlDisabled(this.elements.previewRedoButton, !this.previewRedoStack.length, "Disabled until an Object Preview edit can be redone.", "Redo the last undone Object Preview edit.");
    this.setControlDisabled(this.elements.previewCopyButton, !shape, noShapeReason, "Copy the selected shape.");
    this.setControlDisabled(this.elements.previewPasteButton, !object || !this.previewClipboardShape || isLocked, !object ? noObjectReason : (isLocked ? lockedReason : "Disabled until a shape has been copied."), "Paste the copied shape into the selected object.");
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
    this.updatePreviewEditActionState();
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
    this.setControlDisabled(this.elements.deleteFrameButton, !hasFrame || isLocked || frames.length <= 1, isLocked ? lockedReason : (hasFrame ? "Disabled because the selected state needs at least one frame." : noFrameReason), "Delete the selected animation frame.");
    this.setControlDisabled(this.elements.frameLeftButton, !hasFrame || isLocked || frameIndex <= 0, isLocked ? lockedReason : (hasFrame ? "Disabled because the selected frame is already first." : noFrameReason), "Move the selected frame left.");
    this.setControlDisabled(this.elements.frameEarlierButton, !hasFrame || isLocked || frameIndex <= 0, isLocked ? lockedReason : (hasFrame ? "Disabled because the selected frame is already first." : noFrameReason), "Move the selected frame earlier.");
    this.setControlDisabled(this.elements.frameLaterButton, !hasFrame || isLocked || frameIndex >= frames.length - 1, isLocked ? lockedReason : (hasFrame ? "Disabled because the selected frame is already last." : noFrameReason), "Move the selected frame later.");
    this.setControlDisabled(this.elements.frameRightButton, !hasFrame || isLocked || frameIndex >= frames.length - 1, isLocked ? lockedReason : (hasFrame ? "Disabled because the selected frame is already last." : noFrameReason), "Move the selected frame right.");
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
      this.statusLog.write(`OK Object Vector Studio V2 JSON copied with ${payload.objects.length} objects.`);
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
    this.statusLog.write(`OK Export JSON prepared for ${payload.objects.length} Object Vector Studio V2 objects.`);
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
      this.appendShapePointStyleCaps(svg, this.effectiveShape(shape));
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
