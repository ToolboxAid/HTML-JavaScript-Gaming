/*
Toolbox Aid
David Quesenberry
03/30/2026
main.js
*/

const SVG_NS = "http://www.w3.org/2000/svg";
const SAMPLE_MANIFEST_PATH = "./samples/sample-manifest.json";
const DRAWABLE_SELECTOR = "rect,ellipse,circle,line,polyline,path";
const ALLOWED_IMPORT_TAGS = new Set([
  "svg",
  "g",
  "defs",
  "lineargradient",
  "radialgradient",
  "stop",
  "rect",
  "ellipse",
  "circle",
  "line",
  "polyline",
  "path",
  "title",
  "desc"
]);

const state = {
  documentName: "untitled-background",
  canvasWidth: 1600,
  canvasHeight: 900,
  zoom: 1,
  panX: 0,
  panY: 0,
  activeTool: "select",
  fill: null,
  stroke: null,
  activePaletteTarget: "paint",
  strokeWidth: 2,
  usedColors: [],
  paletteEntries: [],
  selectedId: null,
  drag: null,
  pendingPolyline: null,
  pendingFreehand: null,
  sampleEntries: [],
  elementIdCounter: 1
};

const refs = {
  newSvgButton: document.getElementById("newSvgButton"),
  loadSvgButton: document.getElementById("loadSvgButton"),
  loadSvgInput: document.getElementById("loadSvgInput"),
  saveSvgButton: document.getElementById("saveSvgButton"),
  sampleSelect: document.getElementById("sampleSelect"),
  refreshSamplesButton: document.getElementById("refreshSamplesButton"),
  loadSampleButton: document.getElementById("loadSampleButton"),
  canvasWidthInput: document.getElementById("canvasWidthInput"),
  canvasHeightInput: document.getElementById("canvasHeightInput"),
  applyCanvasSizeButton: document.getElementById("applyCanvasSizeButton"),
  zoomOutButton: document.getElementById("zoomOutButton"),
  zoomPercentInput: document.getElementById("zoomPercentInput"),
  zoomInButton: document.getElementById("zoomInButton"),
  resetViewButton: document.getElementById("resetViewButton"),
  toolGrid: document.getElementById("toolGrid"),
  setPaletteTargetPaintButton: document.getElementById("setPaletteTargetPaintButton"),
  setPaletteTargetStrokeButton: document.getElementById("setPaletteTargetStrokeButton"),
  paletteStateReadout: document.getElementById("paletteStateReadout"),
  activePaintSwatch: document.getElementById("activePaintSwatch"),
  activePaintLabel: document.getElementById("activePaintLabel"),
  activeStrokeSwatch: document.getElementById("activeStrokeSwatch"),
  activeStrokeLabel: document.getElementById("activeStrokeLabel"),
  usedColorStrip: document.getElementById("usedColorStrip"),
  mainPaletteGrid: document.getElementById("mainPaletteGrid"),
  strokeWidthInput: document.getElementById("strokeWidthInput"),
  applyStyleButton: document.getElementById("applyStyleButton"),
  deleteSelectedButton: document.getElementById("deleteSelectedButton"),
  selectionReadout: document.getElementById("selectionReadout"),
  pointerReadout: document.getElementById("pointerReadout"),
  viewReadout: document.getElementById("viewReadout"),
  canvasMeta: document.getElementById("canvasMeta"),
  canvasViewport: document.getElementById("canvasViewport"),
  editorSvg: document.getElementById("editorSvg"),
  sceneRoot: document.getElementById("sceneRoot"),
  selectionOverlay: document.getElementById("selectionOverlay"),
  selectionBounds: document.getElementById("selectionBounds"),
  statusText: document.getElementById("statusText"),
  elementList: document.getElementById("elementList"),
  sendBackwardButton: document.getElementById("sendBackwardButton"),
  bringForwardButton: document.getElementById("bringForwardButton")
};

function clamp(value, min, max, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, numeric));
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

function setStatus(text) {
  refs.statusText.textContent = text;
}

const DRAW_TOOL_SET = new Set(["rect", "ellipse", "line", "polyline", "path"]);
const FALLBACK_PALETTE = [
  { hex: "#232323", name: "Black" },
  { hex: "#EDEDED", name: "White" },
  { hex: "#FF5349", name: "Red Orange" },
  { hex: "#FF7538", name: "Orange" },
  { hex: "#FCE883", name: "Yellow" },
  { hex: "#1CAC78", name: "Green" },
  { hex: "#1F75FE", name: "Blue" },
  { hex: "#926EAE", name: "Violet" }
];

function normalizeHexColor(value) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const hex = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  if (!/^[0-9a-fA-F]{3,8}$/.test(hex)) {
    return null;
  }
  if (hex.length === 3 || hex.length === 4) {
    return `#${hex.slice(0, 3).split("").map((ch) => ch + ch).join("").toUpperCase()}`;
  }
  if (hex.length === 6 || hex.length === 8) {
    return `#${hex.slice(0, 6).toUpperCase()}`;
  }
  return null;
}

function normalizeColorValue(value) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim().toLowerCase();
  if (!trimmed || trimmed === "none" || trimmed === "transparent" || trimmed.startsWith("url(")) {
    return null;
  }
  const hex = normalizeHexColor(trimmed);
  if (hex) {
    return hex;
  }
  const rgbMatch = trimmed.match(/^rgba?\(([^)]+)\)$/i);
  if (!rgbMatch) {
    return null;
  }
  const parts = rgbMatch[1].split(",").map((part) => Number(part.trim()));
  if (parts.length < 3 || parts.slice(0, 3).some((part) => !Number.isFinite(part))) {
    return null;
  }
  const [r, g, b] = parts;
  const toHex = (channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hasRequiredStyleSelection() {
  return Boolean(normalizeColorValue(state.fill) && normalizeColorValue(state.stroke));
}

function getEditingGateMessage() {
  const missing = [];
  if (!normalizeColorValue(state.fill)) {
    missing.push("Paint");
  }
  if (!normalizeColorValue(state.stroke)) {
    missing.push("Stroke");
  }
  if (missing.length === 0) {
    return "Editing enabled.";
  }
  return `Select ${missing.join(" and ")} from the palette to enable editing.`;
}

function getPaletteLibrary() {
  if (typeof globalThis.palettesList === "object" && globalThis.palettesList) {
    return globalThis.palettesList;
  }
  return null;
}

function loadPaletteEntriesFromExistingWorkflow() {
  const library = getPaletteLibrary();
  const seen = new Set();
  const entries = [];

  const consumePalette = (paletteName, paletteEntries) => {
    if (!Array.isArray(paletteEntries)) {
      return;
    }
    paletteEntries.forEach((entry, index) => {
      const normalizedHex = normalizeColorValue(entry?.hex);
      if (!normalizedHex || seen.has(normalizedHex)) {
        return;
      }
      seen.add(normalizedHex);
      entries.push({
        hex: normalizedHex,
        name: typeof entry?.name === "string" && entry.name.trim() ? entry.name.trim() : `${paletteName} ${index + 1}`
      });
    });
  };

  if (library) {
    const preferred = ["default", "crayola024", "crayola016", "crayola008"];
    preferred.forEach((name) => {
      if (Object.prototype.hasOwnProperty.call(library, name)) {
        consumePalette(name, library[name]);
      }
    });
    Object.keys(library).forEach((name) => consumePalette(name, library[name]));
  }

  if (entries.length === 0) {
    FALLBACK_PALETTE.forEach((entry) => entries.push(entry));
  }

  return entries;
}

function createSwatchButton(colorHex, options = {}) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `palette-swatch${options.used ? " used" : ""}`;
  button.title = options.name ? `${options.name} (${colorHex})` : colorHex;
  button.dataset.color = colorHex;
  button.style.backgroundColor = colorHex;
  button.addEventListener("click", () => {
    applyPaletteColorSelection(colorHex, options.used ? "used-colors" : "palette");
  });
  return button;
}

function renderMainPaletteGrid() {
  refs.mainPaletteGrid.innerHTML = "";
  state.paletteEntries.forEach((entry) => {
    const swatch = createSwatchButton(entry.hex, { name: entry.name, used: false });
    const isActiveColor = state.activePaletteTarget === "paint"
      ? normalizeColorValue(state.fill) === entry.hex
      : normalizeColorValue(state.stroke) === entry.hex;
    if (isActiveColor) {
      swatch.classList.add("active-target-color");
    }
    refs.mainPaletteGrid.appendChild(swatch);
  });
}

function renderUsedColorStrip() {
  refs.usedColorStrip.innerHTML = "";
  if (state.usedColors.length === 0) {
    const empty = document.createElement("span");
    empty.className = "muted";
    empty.textContent = "No used colors in this document yet.";
    refs.usedColorStrip.appendChild(empty);
    return;
  }

  state.usedColors.forEach((colorHex) => {
    const swatch = createSwatchButton(colorHex, { used: true });
    const isActiveColor = state.activePaletteTarget === "paint"
      ? normalizeColorValue(state.fill) === colorHex
      : normalizeColorValue(state.stroke) === colorHex;
    if (isActiveColor) {
      swatch.classList.add("active-target-color");
    }
    refs.usedColorStrip.appendChild(swatch);
  });
}

function refreshUsedColors() {
  const discovered = [];
  const discoveredSet = new Set();

  getDrawableElements().forEach((element) => {
    const fill = normalizeColorValue(element.getAttribute("fill") || element.style.fill || "");
    const stroke = normalizeColorValue(element.getAttribute("stroke") || element.style.stroke || "");
    if (fill && !discoveredSet.has(fill)) {
      discoveredSet.add(fill);
      discovered.push(fill);
    }
    if (stroke && !discoveredSet.has(stroke)) {
      discoveredSet.add(stroke);
      discovered.push(stroke);
    }
  });

  const retained = state.usedColors.filter((colorHex) => discoveredSet.has(colorHex));
  discovered.forEach((colorHex) => {
    if (!retained.includes(colorHex)) {
      retained.push(colorHex);
    }
  });
  state.usedColors = retained;
  renderUsedColorStrip();
  renderMainPaletteGrid();
}

function updatePaletteReadout() {
  const target = state.activePaletteTarget === "paint" ? "Paint" : "Stroke";
  const paintHex = normalizeColorValue(state.fill);
  const strokeHex = normalizeColorValue(state.stroke);

  refs.setPaletteTargetPaintButton.classList.toggle("active", state.activePaletteTarget === "paint");
  refs.setPaletteTargetStrokeButton.classList.toggle("active", state.activePaletteTarget === "stroke");

  refs.activePaintSwatch.style.backgroundColor = paintHex || "transparent";
  refs.activeStrokeSwatch.style.backgroundColor = strokeHex || "transparent";
  refs.activePaintSwatch.classList.toggle("empty", !paintHex);
  refs.activeStrokeSwatch.classList.toggle("empty", !strokeHex);

  refs.activePaintLabel.textContent = paintHex ? `Paint: ${paintHex}` : "Paint: not selected";
  refs.activeStrokeLabel.textContent = strokeHex ? `Stroke: ${strokeHex}` : "Stroke: not selected";
  refs.paletteStateReadout.textContent = `${getEditingGateMessage()} Target: ${target}.`;
}

function applyEnablementState() {
  const hasStyleSelection = hasRequiredStyleSelection();
  const hasObjectSelection = Boolean(getSelectedElement());

  refs.applyCanvasSizeButton.disabled = !hasStyleSelection;
  refs.strokeWidthInput.disabled = !hasStyleSelection;
  refs.applyStyleButton.disabled = !(hasStyleSelection && hasObjectSelection);
  refs.deleteSelectedButton.disabled = !(hasStyleSelection && hasObjectSelection);
  refs.sendBackwardButton.disabled = !(hasStyleSelection && hasObjectSelection);
  refs.bringForwardButton.disabled = !(hasStyleSelection && hasObjectSelection);

  refs.toolGrid.querySelectorAll("[data-tool]").forEach((button) => {
    const isDrawTool = DRAW_TOOL_SET.has(button.dataset.tool || "");
    const isDisabled = isDrawTool && !hasStyleSelection;
    button.disabled = isDisabled;
    button.classList.toggle("locked", isDisabled);
  });

  if (!hasStyleSelection && DRAW_TOOL_SET.has(state.activeTool)) {
    setActiveTool("select", { silent: true });
  }

  updatePaletteReadout();
}

function setPaletteTarget(target, options = {}) {
  state.activePaletteTarget = target === "stroke" ? "stroke" : "paint";
  updatePaletteReadout();
  renderUsedColorStrip();
  renderMainPaletteGrid();
  if (!options.silent) {
    setStatus(`Palette target set to ${state.activePaletteTarget}.`);
  }
}

function applyPaletteColorSelection(colorHex, sourceLabel = "palette") {
  const normalized = normalizeColorValue(colorHex);
  if (!normalized) {
    return;
  }

  if (state.activePaletteTarget === "paint") {
    state.fill = normalized;
  } else {
    state.stroke = normalized;
  }

  applyEnablementState();
  setStatus(`Selected ${normalized} from ${sourceLabel} for ${state.activePaletteTarget}.`);
}

function createSvgElement(tagName) {
  return document.createElementNS(SVG_NS, tagName);
}

function getDrawableElements() {
  return Array.from(refs.sceneRoot.querySelectorAll(DRAWABLE_SELECTOR));
}

function ensureEditorIdentity(element) {
  if (!(element instanceof SVGElement)) {
    return null;
  }

  if (!element.dataset.editorId) {
    element.dataset.editorId = `svg-bg-${state.elementIdCounter}`;
    state.elementIdCounter += 1;
  }

  if (!element.getAttribute("id")) {
    element.setAttribute("id", element.dataset.editorId);
  }

  return element.dataset.editorId;
}

function getSelectedElement() {
  if (!state.selectedId) {
    return null;
  }

  return refs.sceneRoot.querySelector(`[data-editor-id="${state.selectedId}"]`);
}

function setActiveTool(toolName, options = {}) {
  const targetButton = refs.toolGrid.querySelector(`[data-tool="${toolName}"]`);
  if (targetButton && targetButton.disabled) {
    return;
  }
  state.activeTool = toolName;
  refs.toolGrid.querySelectorAll("[data-tool]").forEach((button) => {
    button.classList.toggle("active", button.dataset.tool === toolName);
  });
  if (!options.silent) {
    setStatus(`Active tool: ${toolName}.`);
  }
}

function updateCanvasMeta() {
  const elementCount = getDrawableElements().length;
  refs.canvasMeta.textContent = `${state.canvasWidth} x ${state.canvasHeight} | ${elementCount} element${elementCount === 1 ? "" : "s"}`;
}

function updateViewReadout() {
  refs.viewReadout.textContent = `view: zoom ${Math.round(state.zoom * 100)}%, pan ${Math.round(state.panX)}, ${Math.round(state.panY)}`;
  refs.zoomPercentInput.value = Math.round(state.zoom * 100);
}

function setViewTransform() {
  refs.sceneRoot.setAttribute("transform", `translate(${round2(state.panX)} ${round2(state.panY)}) scale(${round2(state.zoom)})`);
  updateViewReadout();
  updateSelectionOverlay();
}

function getScenePoint(event) {
  const bounds = refs.editorSvg.getBoundingClientRect();
  const x = (event.clientX - bounds.left - state.panX) / state.zoom;
  const y = (event.clientY - bounds.top - state.panY) / state.zoom;
  return { x, y };
}

function safeGetBBox(element) {
  try {
    return element.getBBox();
  } catch (error) {
    return null;
  }
}

function clearSelection() {
  state.selectedId = null;
  refs.selectionReadout.textContent = "No element selected.";
  refs.selectionOverlay.classList.add("hidden");
  renderElementList();
  applyEnablementState();
}

function selectElement(element) {
  if (!(element instanceof SVGElement)) {
    clearSelection();
    return;
  }

  state.selectedId = ensureEditorIdentity(element);
  const tagName = element.tagName.toLowerCase();
  const bbox = safeGetBBox(element);
  const bboxText = bbox ? `bounds: ${Math.round(bbox.x)}, ${Math.round(bbox.y)}, ${Math.round(bbox.width)} x ${Math.round(bbox.height)}` : "bounds: unavailable";
  refs.selectionReadout.textContent = `${tagName} | id: ${element.getAttribute("id")} | ${bboxText}`;
  renderElementList();
  updateSelectionOverlay();
  applyEnablementState();
}

function updateSelectionOverlay() {
  const element = getSelectedElement();
  if (!element) {
    refs.selectionOverlay.classList.add("hidden");
    return;
  }

  const bbox = safeGetBBox(element);
  if (!bbox || !Number.isFinite(bbox.width) || !Number.isFinite(bbox.height)) {
    refs.selectionOverlay.classList.add("hidden");
    return;
  }

  const left = bbox.x * state.zoom + state.panX;
  const top = bbox.y * state.zoom + state.panY;
  const width = Math.max(1, bbox.width * state.zoom);
  const height = Math.max(1, bbox.height * state.zoom);

  refs.selectionOverlay.classList.remove("hidden");
  refs.selectionOverlay.classList.toggle("gated", !hasRequiredStyleSelection());
  refs.selectionBounds.style.left = `${left}px`;
  refs.selectionBounds.style.top = `${top}px`;
  refs.selectionBounds.style.width = `${width}px`;
  refs.selectionBounds.style.height = `${height}px`;

  refs.selectionOverlay.querySelectorAll(".resize-handle").forEach((handle) => {
    const handleName = handle.dataset.handle;
    let x = left;
    let y = top;

    if (handleName === "ne") {
      x = left + width;
    } else if (handleName === "sw") {
      y = top + height;
    } else if (handleName === "se") {
      x = left + width;
      y = top + height;
    }

    handle.style.left = `${x - 6}px`;
    handle.style.top = `${y - 6}px`;
  });
}

function renderElementList() {
  refs.elementList.innerHTML = "";
  const elements = getDrawableElements();

  if (elements.length === 0) {
    const item = document.createElement("li");
    item.className = "muted";
    item.textContent = "No drawable elements.";
    refs.elementList.appendChild(item);
    updateCanvasMeta();
    applyEnablementState();
    return;
  }

  elements.forEach((element, index) => {
    const editorId = ensureEditorIdentity(element);
    const item = document.createElement("li");
    item.className = "element-item";
    if (state.selectedId === editorId) {
      item.classList.add("selected");
    }

    const selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.className = "element-select";
    selectButton.textContent = `${index + 1}. ${element.tagName.toLowerCase()} (${element.getAttribute("id")})`;
    selectButton.addEventListener("click", () => {
      selectElement(element);
    });

    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = element.tagName.toLowerCase();

    item.appendChild(selectButton);
    item.appendChild(chip);
    refs.elementList.appendChild(item);
  });

  updateCanvasMeta();
  applyEnablementState();
}

function setCanvasSize(width, height) {
  state.canvasWidth = clamp(width, 256, 8192, 1600);
  state.canvasHeight = clamp(height, 256, 8192, 900);
  refs.canvasWidthInput.value = String(Math.trunc(state.canvasWidth));
  refs.canvasHeightInput.value = String(Math.trunc(state.canvasHeight));
  refs.editorSvg.setAttribute("viewBox", `0 0 ${Math.trunc(state.canvasWidth)} ${Math.trunc(state.canvasHeight)}`);
  refs.editorSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  updateCanvasMeta();
}

function createNewDocument() {
  refs.sceneRoot.replaceChildren();
  state.documentName = "untitled-background";
  state.elementIdCounter = 1;
  state.usedColors = [];
  state.pendingPolyline = null;
  state.pendingFreehand = null;
  clearSelection();
  setCanvasSize(refs.canvasWidthInput.value, refs.canvasHeightInput.value);
  refreshUsedColors();
  applyEnablementState();
  setStatus("Created new SVG background document.");
}

function setZoom(nextZoom, anchorClientPoint = null) {
  const clampedZoom = clamp(nextZoom, 0.25, 8, state.zoom);
  const bounds = refs.editorSvg.getBoundingClientRect();
  const anchor = anchorClientPoint || {
    x: bounds.left + bounds.width / 2,
    y: bounds.top + bounds.height / 2
  };

  const sceneX = (anchor.x - bounds.left - state.panX) / state.zoom;
  const sceneY = (anchor.y - bounds.top - state.panY) / state.zoom;
  state.zoom = clampedZoom;
  state.panX = anchor.x - bounds.left - sceneX * state.zoom;
  state.panY = anchor.y - bounds.top - sceneY * state.zoom;
  setViewTransform();
}

function resetView() {
  state.zoom = 1;
  state.panX = 0;
  state.panY = 0;
  setViewTransform();
}

function applyCurrentStyle(element) {
  const fillColor = normalizeColorValue(state.fill);
  const strokeColor = normalizeColorValue(state.stroke);
  if (!fillColor || !strokeColor) {
    return;
  }
  element.setAttribute("fill", fillColor);
  element.setAttribute("stroke", strokeColor);
  element.setAttribute("stroke-width", String(state.strokeWidth));
  element.setAttribute("stroke-linecap", "round");
  element.setAttribute("stroke-linejoin", "round");
}

function createShapeForTool(toolName, point) {
  let element = null;

  if (toolName === "rect") {
    element = createSvgElement("rect");
    element.setAttribute("x", String(round2(point.x)));
    element.setAttribute("y", String(round2(point.y)));
    element.setAttribute("width", "1");
    element.setAttribute("height", "1");
  } else if (toolName === "ellipse") {
    element = createSvgElement("ellipse");
    element.setAttribute("cx", String(round2(point.x)));
    element.setAttribute("cy", String(round2(point.y)));
    element.setAttribute("rx", "1");
    element.setAttribute("ry", "1");
  } else if (toolName === "line") {
    element = createSvgElement("line");
    element.setAttribute("x1", String(round2(point.x)));
    element.setAttribute("y1", String(round2(point.y)));
    element.setAttribute("x2", String(round2(point.x)));
    element.setAttribute("y2", String(round2(point.y)));
    element.setAttribute("fill", "none");
  }

  if (!element) {
    return null;
  }

  applyCurrentStyle(element);
  ensureEditorIdentity(element);
  refs.sceneRoot.appendChild(element);
  refreshUsedColors();
  return element;
}

function updateDragShape(drag, point, forceCircle = false) {
  const element = drag.element;
  if (!element) {
    return;
  }

  if (drag.kind === "draw-rect") {
    const x = Math.min(drag.start.x, point.x);
    const y = Math.min(drag.start.y, point.y);
    const width = Math.max(1, Math.abs(point.x - drag.start.x));
    const height = Math.max(1, Math.abs(point.y - drag.start.y));
    element.setAttribute("x", String(round2(x)));
    element.setAttribute("y", String(round2(y)));
    element.setAttribute("width", String(round2(width)));
    element.setAttribute("height", String(round2(height)));
  } else if (drag.kind === "draw-ellipse") {
    const centerX = (drag.start.x + point.x) / 2;
    const centerY = (drag.start.y + point.y) / 2;
    let rx = Math.max(1, Math.abs(point.x - drag.start.x) / 2);
    let ry = Math.max(1, Math.abs(point.y - drag.start.y) / 2);

    if (forceCircle) {
      const radius = Math.max(rx, ry);
      rx = radius;
      ry = radius;
    }

    element.setAttribute("cx", String(round2(centerX)));
    element.setAttribute("cy", String(round2(centerY)));
    element.setAttribute("rx", String(round2(rx)));
    element.setAttribute("ry", String(round2(ry)));
  } else if (drag.kind === "draw-line") {
    element.setAttribute("x2", String(round2(point.x)));
    element.setAttribute("y2", String(round2(point.y)));
  }
}

function parsePointsAttribute(pointsValue) {
  if (typeof pointsValue !== "string" || !pointsValue.trim()) {
    return [];
  }

  const pairs = pointsValue.trim().split(/\s+/);
  const points = [];

  pairs.forEach((pair) => {
    const [rawX, rawY] = pair.split(",");
    const x = Number(rawX);
    const y = Number(rawY);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      points.push({ x, y });
    }
  });

  return points;
}

function pointsToAttribute(points) {
  return points.map((point) => `${round2(point.x)},${round2(point.y)}`).join(" ");
}

function pointsToPath(points, closed = false) {
  if (!Array.isArray(points) || points.length === 0) {
    return "";
  }

  const segments = [`M ${round2(points[0].x)} ${round2(points[0].y)}`];
  for (let index = 1; index < points.length; index += 1) {
    segments.push(`L ${round2(points[index].x)} ${round2(points[index].y)}`);
  }
  if (closed) {
    segments.push("Z");
  }
  return segments.join(" ");
}

function parsePathPoints(pathData) {
  if (typeof pathData !== "string" || !pathData.trim()) {
    return null;
  }

  const tokens = pathData.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g);
  if (!tokens || tokens.length === 0) {
    return null;
  }

  const points = [];
  let command = null;
  let cursorX = 0;
  let cursorY = 0;
  let index = 0;
  let closed = false;

  while (index < tokens.length) {
    const token = tokens[index];
    if (/^[a-zA-Z]$/.test(token)) {
      command = token;
      index += 1;
      if (command === "Z" || command === "z") {
        closed = true;
      }
      continue;
    }

    if (command === "M" || command === "L") {
      const x = Number(tokens[index]);
      const y = Number(tokens[index + 1]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return null;
      }
      cursorX = x;
      cursorY = y;
      points.push({ x: cursorX, y: cursorY });
      if (command === "M") {
        command = "L";
      }
      index += 2;
      continue;
    }

    if (command === "m" || command === "l") {
      const dx = Number(tokens[index]);
      const dy = Number(tokens[index + 1]);
      if (!Number.isFinite(dx) || !Number.isFinite(dy)) {
        return null;
      }
      cursorX += dx;
      cursorY += dy;
      points.push({ x: cursorX, y: cursorY });
      if (command === "m") {
        command = "l";
      }
      index += 2;
      continue;
    }

    return null;
  }

  if (points.length === 0) {
    return null;
  }

  return { points, closed };
}

function captureGeometry(element) {
  if (!(element instanceof SVGElement)) {
    return null;
  }

  const type = element.tagName.toLowerCase();
  const bbox = safeGetBBox(element);
  if (!bbox) {
    return null;
  }

  if (type === "rect") {
    return {
      type,
      bbox,
      x: Number(element.getAttribute("x") || 0),
      y: Number(element.getAttribute("y") || 0),
      width: Number(element.getAttribute("width") || 0),
      height: Number(element.getAttribute("height") || 0)
    };
  }

  if (type === "ellipse") {
    return {
      type,
      bbox,
      cx: Number(element.getAttribute("cx") || 0),
      cy: Number(element.getAttribute("cy") || 0),
      rx: Number(element.getAttribute("rx") || 0),
      ry: Number(element.getAttribute("ry") || 0)
    };
  }

  if (type === "circle") {
    return {
      type,
      bbox,
      cx: Number(element.getAttribute("cx") || 0),
      cy: Number(element.getAttribute("cy") || 0),
      r: Number(element.getAttribute("r") || 0)
    };
  }

  if (type === "line") {
    return {
      type,
      bbox,
      x1: Number(element.getAttribute("x1") || 0),
      y1: Number(element.getAttribute("y1") || 0),
      x2: Number(element.getAttribute("x2") || 0),
      y2: Number(element.getAttribute("y2") || 0)
    };
  }

  if (type === "polyline") {
    return {
      type,
      bbox,
      points: parsePointsAttribute(element.getAttribute("points") || "")
    };
  }

  if (type === "path") {
    const parsed = parsePathPoints(element.getAttribute("d") || "");
    return {
      type,
      bbox,
      points: parsed ? parsed.points : [],
      closed: parsed ? parsed.closed : false,
      unsupported: !parsed
    };
  }

  return null;
}

function translateGeometry(element, snapshot, deltaX, deltaY) {
  if (!snapshot) {
    return;
  }

  if (snapshot.type === "rect") {
    element.setAttribute("x", String(round2(snapshot.x + deltaX)));
    element.setAttribute("y", String(round2(snapshot.y + deltaY)));
    return;
  }

  if (snapshot.type === "ellipse") {
    element.setAttribute("cx", String(round2(snapshot.cx + deltaX)));
    element.setAttribute("cy", String(round2(snapshot.cy + deltaY)));
    return;
  }

  if (snapshot.type === "circle") {
    element.setAttribute("cx", String(round2(snapshot.cx + deltaX)));
    element.setAttribute("cy", String(round2(snapshot.cy + deltaY)));
    return;
  }

  if (snapshot.type === "line") {
    element.setAttribute("x1", String(round2(snapshot.x1 + deltaX)));
    element.setAttribute("y1", String(round2(snapshot.y1 + deltaY)));
    element.setAttribute("x2", String(round2(snapshot.x2 + deltaX)));
    element.setAttribute("y2", String(round2(snapshot.y2 + deltaY)));
    return;
  }

  if (snapshot.type === "polyline") {
    const movedPoints = snapshot.points.map((point) => ({ x: point.x + deltaX, y: point.y + deltaY }));
    element.setAttribute("points", pointsToAttribute(movedPoints));
    return;
  }

  if (snapshot.type === "path" && !snapshot.unsupported) {
    const movedPoints = snapshot.points.map((point) => ({ x: point.x + deltaX, y: point.y + deltaY }));
    element.setAttribute("d", pointsToPath(movedPoints, snapshot.closed));
  }
}

function mapPointToNewBounds(point, sourceBounds, targetBounds) {
  const sourceWidth = sourceBounds.width === 0 ? 1 : sourceBounds.width;
  const sourceHeight = sourceBounds.height === 0 ? 1 : sourceBounds.height;
  const scaleX = targetBounds.width / sourceWidth;
  const scaleY = targetBounds.height / sourceHeight;
  const x = targetBounds.x + (point.x - sourceBounds.x) * scaleX;
  const y = targetBounds.y + (point.y - sourceBounds.y) * scaleY;
  return { x, y };
}

function resizeGeometry(element, snapshot, nextBounds) {
  if (!snapshot || snapshot.type === "path" && snapshot.unsupported) {
    return false;
  }

  if (snapshot.type === "rect") {
    element.setAttribute("x", String(round2(nextBounds.x)));
    element.setAttribute("y", String(round2(nextBounds.y)));
    element.setAttribute("width", String(round2(nextBounds.width)));
    element.setAttribute("height", String(round2(nextBounds.height)));
    return true;
  }

  if (snapshot.type === "ellipse") {
    element.setAttribute("cx", String(round2(nextBounds.x + nextBounds.width / 2)));
    element.setAttribute("cy", String(round2(nextBounds.y + nextBounds.height / 2)));
    element.setAttribute("rx", String(round2(nextBounds.width / 2)));
    element.setAttribute("ry", String(round2(nextBounds.height / 2)));
    return true;
  }

  if (snapshot.type === "circle") {
    const radius = Math.max(1, Math.min(nextBounds.width, nextBounds.height) / 2);
    element.setAttribute("cx", String(round2(nextBounds.x + nextBounds.width / 2)));
    element.setAttribute("cy", String(round2(nextBounds.y + nextBounds.height / 2)));
    element.setAttribute("r", String(round2(radius)));
    return true;
  }

  if (snapshot.type === "line") {
    const firstPoint = mapPointToNewBounds(
      { x: snapshot.x1, y: snapshot.y1 },
      snapshot.bbox,
      nextBounds
    );
    const secondPoint = mapPointToNewBounds(
      { x: snapshot.x2, y: snapshot.y2 },
      snapshot.bbox,
      nextBounds
    );
    element.setAttribute("x1", String(round2(firstPoint.x)));
    element.setAttribute("y1", String(round2(firstPoint.y)));
    element.setAttribute("x2", String(round2(secondPoint.x)));
    element.setAttribute("y2", String(round2(secondPoint.y)));
    return true;
  }

  if (snapshot.type === "polyline") {
    const nextPoints = snapshot.points.map((point) => mapPointToNewBounds(point, snapshot.bbox, nextBounds));
    element.setAttribute("points", pointsToAttribute(nextPoints));
    return true;
  }

  if (snapshot.type === "path") {
    const nextPoints = snapshot.points.map((point) => mapPointToNewBounds(point, snapshot.bbox, nextBounds));
    element.setAttribute("d", pointsToPath(nextPoints, snapshot.closed));
    return true;
  }

  return false;
}

function computeResizeBounds(originalBounds, handle, deltaX, deltaY) {
  const minimumSize = 4;
  let x1 = originalBounds.x;
  let y1 = originalBounds.y;
  let x2 = originalBounds.x + originalBounds.width;
  let y2 = originalBounds.y + originalBounds.height;

  if (handle.includes("w")) {
    x1 = Math.min(originalBounds.x + deltaX, x2 - minimumSize);
  }
  if (handle.includes("e")) {
    x2 = Math.max(originalBounds.x + originalBounds.width + deltaX, x1 + minimumSize);
  }
  if (handle.includes("n")) {
    y1 = Math.min(originalBounds.y + deltaY, y2 - minimumSize);
  }
  if (handle.includes("s")) {
    y2 = Math.max(originalBounds.y + originalBounds.height + deltaY, y1 + minimumSize);
  }

  return {
    x: x1,
    y: y1,
    width: x2 - x1,
    height: y2 - y1
  };
}

function findDrawableElementFromTarget(target) {
  if (!(target instanceof Element)) {
    return null;
  }
  return target.closest(DRAWABLE_SELECTOR);
}

function finalizePendingPolyline(commit = true) {
  if (!state.pendingPolyline) {
    return;
  }

  const { element, points } = state.pendingPolyline;
  state.pendingPolyline = null;

  if (!commit || points.length < 2) {
    element.remove();
    refreshUsedColors();
    setStatus("Polyline canceled.");
    renderElementList();
    return;
  }

  element.setAttribute("points", pointsToAttribute(points));
  refreshUsedColors();
  selectElement(element);
  setStatus("Polyline committed.");
}

function handlePolylineClick(point) {
  if (!state.pendingPolyline) {
    const element = createSvgElement("polyline");
    applyCurrentStyle(element);
    element.setAttribute("fill", "none");
    const points = [{ x: point.x, y: point.y }];
    element.setAttribute("points", pointsToAttribute(points));
    ensureEditorIdentity(element);
    refs.sceneRoot.appendChild(element);
    state.pendingPolyline = { element, points };
    refreshUsedColors();
    selectElement(element);
    renderElementList();
    setStatus("Polyline started. Click to add points, double click or Enter to finish.");
    return;
  }

  state.pendingPolyline.points.push({ x: point.x, y: point.y });
  const previewPoints = state.pendingPolyline.points;
  state.pendingPolyline.element.setAttribute("points", pointsToAttribute(previewPoints));
}

function updatePolylinePreview(point) {
  if (!state.pendingPolyline) {
    return;
  }

  const committed = state.pendingPolyline.points;
  const previewPoints = [...committed, { x: point.x, y: point.y }];
  state.pendingPolyline.element.setAttribute("points", pointsToAttribute(previewPoints));
}

function startFreehandPath(point) {
  const element = createSvgElement("path");
  applyCurrentStyle(element);
  element.setAttribute("fill", "none");
  const points = [{ x: point.x, y: point.y }];
  element.setAttribute("d", pointsToPath(points, false));
  ensureEditorIdentity(element);
  refs.sceneRoot.appendChild(element);
  refreshUsedColors();
  state.pendingFreehand = {
    element,
    points
  };
  selectElement(element);
}

function appendFreehandPoint(point) {
  if (!state.pendingFreehand) {
    return;
  }

  const points = state.pendingFreehand.points;
  const previous = points[points.length - 1];
  const dx = point.x - previous.x;
  const dy = point.y - previous.y;
  if (Math.hypot(dx, dy) < (2 / state.zoom)) {
    return;
  }

  points.push({ x: point.x, y: point.y });
  state.pendingFreehand.element.setAttribute("d", pointsToPath(points, false));
}

function finalizeFreehandPath(commit = true) {
  if (!state.pendingFreehand) {
    return;
  }

  const { element, points } = state.pendingFreehand;
  state.pendingFreehand = null;
  if (!commit || points.length < 2) {
    element.remove();
    refreshUsedColors();
    setStatus("Path canceled.");
    renderElementList();
    return;
  }

  element.setAttribute("d", pointsToPath(points, false));
  refreshUsedColors();
  selectElement(element);
  setStatus("Path committed.");
}

function onSvgPointerDown(event) {
  if (event.target && event.target.closest(".resize-handle")) {
    return;
  }

  const scenePoint = getScenePoint(event);
  refs.pointerReadout.textContent = `pointer: ${Math.round(scenePoint.x)}, ${Math.round(scenePoint.y)}`;

  if (event.button === 1) {
    state.drag = {
      kind: "pan",
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startPanX: state.panX,
      startPanY: state.panY
    };
    refs.editorSvg.setPointerCapture(event.pointerId);
    event.preventDefault();
    return;
  }

  if (event.button !== 0) {
    return;
  }

  if (state.activeTool === "polyline") {
    if (!hasRequiredStyleSelection()) {
      setStatus("Select Paint and Stroke from the palette before drawing.");
      return;
    }
    handlePolylineClick(scenePoint);
    renderElementList();
    event.preventDefault();
    return;
  }

  if (state.activeTool === "path") {
    if (!hasRequiredStyleSelection()) {
      setStatus("Select Paint and Stroke from the palette before drawing.");
      return;
    }
    finalizePendingPolyline(false);
    startFreehandPath(scenePoint);
    state.drag = {
      kind: "draw-path",
      pointerId: event.pointerId
    };
    refs.editorSvg.setPointerCapture(event.pointerId);
    renderElementList();
    event.preventDefault();
    return;
  }

  const hitShape = findDrawableElementFromTarget(event.target);

  if (state.activeTool === "select") {
    finalizePendingPolyline(true);
    if (hitShape) {
      selectElement(hitShape);
      const snapshot = captureGeometry(hitShape);
      if (snapshot && hasRequiredStyleSelection()) {
        state.drag = {
          kind: "move",
          pointerId: event.pointerId,
          element: hitShape,
          start: scenePoint,
          snapshot
        };
        refs.editorSvg.setPointerCapture(event.pointerId);
      }
    } else {
      clearSelection();
    }
    event.preventDefault();
    return;
  }

  if (state.activeTool === "rect" || state.activeTool === "ellipse" || state.activeTool === "line") {
    if (!hasRequiredStyleSelection()) {
      setStatus("Select Paint and Stroke from the palette before drawing.");
      return;
    }
    finalizePendingPolyline(true);
    const shape = createShapeForTool(state.activeTool, scenePoint);
    if (!shape) {
      return;
    }
    const drawKind = `draw-${state.activeTool}`;
    state.drag = {
      kind: drawKind,
      pointerId: event.pointerId,
      element: shape,
      start: scenePoint
    };
    selectElement(shape);
    refs.editorSvg.setPointerCapture(event.pointerId);
    renderElementList();
    event.preventDefault();
  }
}

function onSvgPointerMove(event) {
  const scenePoint = getScenePoint(event);
  refs.pointerReadout.textContent = `pointer: ${Math.round(scenePoint.x)}, ${Math.round(scenePoint.y)}`;

  if (state.pendingPolyline && state.activeTool === "polyline") {
    updatePolylinePreview(scenePoint);
  }

  if (!state.drag || state.drag.pointerId !== event.pointerId) {
    return;
  }

  if (state.drag.kind === "pan") {
    state.panX = state.drag.startPanX + (event.clientX - state.drag.startClientX);
    state.panY = state.drag.startPanY + (event.clientY - state.drag.startClientY);
    setViewTransform();
    return;
  }

  if (state.drag.kind === "draw-rect" || state.drag.kind === "draw-ellipse" || state.drag.kind === "draw-line") {
    updateDragShape(state.drag, scenePoint, event.shiftKey);
    updateSelectionOverlay();
    return;
  }

  if (state.drag.kind === "draw-path") {
    appendFreehandPoint(scenePoint);
    updateSelectionOverlay();
    return;
  }

  if (state.drag.kind === "move") {
    const deltaX = scenePoint.x - state.drag.start.x;
    const deltaY = scenePoint.y - state.drag.start.y;
    translateGeometry(state.drag.element, state.drag.snapshot, deltaX, deltaY);
    selectElement(state.drag.element);
    return;
  }

  if (state.drag.kind === "resize") {
    const deltaX = scenePoint.x - state.drag.start.x;
    const deltaY = scenePoint.y - state.drag.start.y;
    const nextBounds = computeResizeBounds(state.drag.snapshot.bbox, state.drag.handle, deltaX, deltaY);
    const resized = resizeGeometry(state.drag.element, state.drag.snapshot, nextBounds);
    if (resized) {
      selectElement(state.drag.element);
    }
  }
}

function finalizeDragOperation(event) {
  if (!state.drag || state.drag.pointerId !== event.pointerId) {
    return;
  }

  if (state.drag.kind === "draw-path") {
    finalizeFreehandPath(true);
  }

  if (state.drag.kind.startsWith("draw-")) {
    const drawnElement = state.drag.element;
    if (drawnElement instanceof SVGElement) {
      selectElement(drawnElement);
    }
    renderElementList();
  }

  state.drag = null;
  if (refs.editorSvg.hasPointerCapture(event.pointerId)) {
    refs.editorSvg.releasePointerCapture(event.pointerId);
  }
  updateSelectionOverlay();
}

function onCanvasWheel(event) {
  event.preventDefault();
  const direction = event.deltaY < 0 ? 1.1 : 0.9;
  setZoom(state.zoom * direction, { x: event.clientX, y: event.clientY });
}

function deleteSelectedElement() {
  if (!hasRequiredStyleSelection()) {
    setStatus("Select Paint and Stroke from the palette first.");
    return;
  }
  const selected = getSelectedElement();
  if (!selected) {
    return;
  }
  selected.remove();
  refreshUsedColors();
  clearSelection();
  renderElementList();
  setStatus("Deleted selected element.");
}

function moveSelectedForward() {
  if (!hasRequiredStyleSelection()) {
    setStatus("Select Paint and Stroke from the palette first.");
    return;
  }
  const selected = getSelectedElement();
  if (!selected || !selected.parentNode) {
    return;
  }
  const next = selected.nextElementSibling;
  if (!next) {
    return;
  }
  selected.parentNode.insertBefore(next, selected);
  renderElementList();
  selectElement(selected);
}

function moveSelectedBackward() {
  if (!hasRequiredStyleSelection()) {
    setStatus("Select Paint and Stroke from the palette first.");
    return;
  }
  const selected = getSelectedElement();
  if (!selected || !selected.parentNode) {
    return;
  }
  const previous = selected.previousElementSibling;
  if (!previous) {
    return;
  }
  selected.parentNode.insertBefore(selected, previous);
  renderElementList();
  selectElement(selected);
}

function applyStyleToSelection() {
  if (!hasRequiredStyleSelection()) {
    setStatus("Select Paint and Stroke from the palette first.");
    return;
  }
  const selected = getSelectedElement();
  if (!selected) {
    setStatus("No selected element to style.");
    return;
  }
  applyCurrentStyle(selected);
  refreshUsedColors();
  applyEnablementState();
  setStatus("Applied style to selected element.");
}

function stripEditorAttributes(node) {
  if (!(node instanceof Element)) {
    return;
  }
  node.removeAttribute("data-editor-id");
  Array.from(node.children).forEach((child) => {
    stripEditorAttributes(child);
  });
}

function serializeCurrentSvg() {
  const outputSvg = createSvgElement("svg");
  outputSvg.setAttribute("xmlns", SVG_NS);
  outputSvg.setAttribute("width", String(Math.trunc(state.canvasWidth)));
  outputSvg.setAttribute("height", String(Math.trunc(state.canvasHeight)));
  outputSvg.setAttribute("viewBox", `0 0 ${Math.trunc(state.canvasWidth)} ${Math.trunc(state.canvasHeight)}`);

  Array.from(refs.sceneRoot.childNodes).forEach((node) => {
    if (!(node instanceof Element)) {
      return;
    }
    const clone = node.cloneNode(true);
    stripEditorAttributes(clone);
    outputSvg.appendChild(clone);
  });

  const serialized = new XMLSerializer().serializeToString(outputSvg);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${serialized}\n`;
}

function downloadTextFile(fileName, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
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

function parseDimension(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }
  const numeric = Number(value.replace("px", "").trim());
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return fallback;
  }
  return numeric;
}

function sanitizeImportNode(node) {
  if (!(node instanceof Element)) {
    return null;
  }
  const tagName = node.tagName.toLowerCase();
  if (!ALLOWED_IMPORT_TAGS.has(tagName)) {
    return null;
  }

  const cloned = node.cloneNode(false);
  Array.from(node.attributes).forEach((attribute) => {
    const name = attribute.name.toLowerCase();
    if (name.startsWith("on")) {
      return;
    }
    if (name === "data-editor-id") {
      return;
    }
    cloned.setAttribute(attribute.name, attribute.value);
  });

  Array.from(node.childNodes).forEach((childNode) => {
    if (childNode.nodeType === Node.ELEMENT_NODE) {
      const childElement = sanitizeImportNode(childNode);
      if (childElement) {
        cloned.appendChild(childElement);
      }
      return;
    }

    if (childNode.nodeType === Node.TEXT_NODE) {
      const textValue = childNode.nodeValue || "";
      if (textValue.trim()) {
        cloned.appendChild(document.createTextNode(textValue));
      }
    }
  });

  return cloned;
}

function loadSvgFromText(svgText, sourceName = "loaded-svg") {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(svgText, "image/svg+xml");
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) {
    throw new Error("Failed to parse SVG.");
  }

  const sourceSvg = xmlDoc.querySelector("svg");
  if (!sourceSvg) {
    throw new Error("No <svg> root found in file.");
  }

  const viewBoxAttr = sourceSvg.getAttribute("viewBox");
  let width = parseDimension(sourceSvg.getAttribute("width"), state.canvasWidth);
  let height = parseDimension(sourceSvg.getAttribute("height"), state.canvasHeight);

  if (viewBoxAttr) {
    const parts = viewBoxAttr.trim().split(/\s+/).map((value) => Number(value));
    if (parts.length === 4 && Number.isFinite(parts[2]) && Number.isFinite(parts[3]) && parts[2] > 0 && parts[3] > 0) {
      width = parts[2];
      height = parts[3];
    }
  }

  setCanvasSize(width, height);
  refs.sceneRoot.replaceChildren();

  Array.from(sourceSvg.childNodes).forEach((node) => {
    if (!(node instanceof Element)) {
      return;
    }
    const imported = sanitizeImportNode(node);
    if (imported) {
      refs.sceneRoot.appendChild(document.importNode(imported, true));
    }
  });

  getDrawableElements().forEach((element) => {
    ensureEditorIdentity(element);
  });

  state.documentName = sourceName.replace(/\.svg$/i, "") || "loaded-background";
  clearSelection();
  renderElementList();
  refreshUsedColors();
  applyEnablementState();
  setStatus(`Loaded SVG: ${sourceName}`);
}

function normalizeSamplePath(pathValue) {
  if (typeof pathValue !== "string") {
    return null;
  }
  const normalized = pathValue.trim().replace(/\\/g, "/");
  if (!normalized || normalized.includes("..")) {
    return null;
  }
  if (normalized.startsWith("./samples/")) {
    return normalized;
  }
  if (normalized.startsWith("samples/")) {
    return `./${normalized}`;
  }
  return `./samples/${normalized}`;
}

async function refreshSampleOptions(preserveSelection = true) {
  const previousValue = refs.sampleSelect.value;
  refs.sampleSelect.innerHTML = "";
  state.sampleEntries = [];

  try {
    const response = await fetch(SAMPLE_MANIFEST_PATH, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Manifest request failed: ${response.status}`);
    }
    const manifest = await response.json();
    const rawSamples = Array.isArray(manifest?.samples) ? manifest.samples : [];
    const seen = new Set();

    rawSamples.forEach((entry, index) => {
      const path = normalizeSamplePath(entry?.path);
      if (!path || seen.has(path)) {
        return;
      }
      seen.add(path);
      const label = typeof entry?.label === "string" && entry.label.trim()
        ? entry.label.trim()
        : `Sample ${index + 1}`;
      const id = typeof entry?.id === "string" && entry.id.trim()
        ? entry.id.trim()
        : `sample-${index + 1}`;
      state.sampleEntries.push({ id, label, path });
    });
  } catch (error) {
    setStatus(`Sample manifest unavailable (${error.message}).`);
  }

  if (state.sampleEntries.length === 0) {
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "No samples loaded";
    refs.sampleSelect.appendChild(emptyOption);
    refs.loadSampleButton.disabled = true;
    return;
  }

  state.sampleEntries.forEach((entry) => {
    const option = document.createElement("option");
    option.value = entry.path;
    option.textContent = entry.label;
    refs.sampleSelect.appendChild(option);
  });

  if (preserveSelection && state.sampleEntries.some((entry) => entry.path === previousValue)) {
    refs.sampleSelect.value = previousValue;
  } else {
    refs.sampleSelect.value = state.sampleEntries[0].path;
  }

  refs.loadSampleButton.disabled = false;
}

async function loadSelectedSample() {
  await refreshSampleOptions(true);
  const selectedPath = refs.sampleSelect.value;
  if (!selectedPath) {
    setStatus("No sample selected.");
    return;
  }

  const response = await fetch(selectedPath, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Sample fetch failed: ${response.status}`);
  }
  const svgText = await response.text();
  const sampleName = selectedPath.split("/").pop() || "sample.svg";
  loadSvgFromText(svgText, sampleName);
}

function bindEvents() {
  refs.newSvgButton.addEventListener("click", () => {
    finalizePendingPolyline(false);
    finalizeFreehandPath(false);
    createNewDocument();
  });

  refs.loadSvgButton.addEventListener("click", () => {
    refs.loadSvgInput.click();
  });

  refs.loadSvgInput.addEventListener("change", async (event) => {
    const [file] = event.target.files || [];
    if (!file) {
      return;
    }
    const text = await file.text();
    loadSvgFromText(text, file.name);
    refs.loadSvgInput.value = "";
  });

  refs.saveSvgButton.addEventListener("click", () => {
    finalizePendingPolyline(true);
    const content = serializeCurrentSvg();
    const fileName = `${state.documentName || "background-art"}.svg`;
    downloadTextFile(fileName, content, "image/svg+xml");
    setStatus(`Saved ${fileName}.`);
  });

  refs.refreshSamplesButton.addEventListener("click", async () => {
    await refreshSampleOptions(true);
    setStatus("Sample list refreshed from local manifest.");
  });

  refs.loadSampleButton.addEventListener("click", async () => {
    try {
      await loadSelectedSample();
    } catch (error) {
      setStatus(`Failed to load sample (${error.message}).`);
    }
  });

  refs.applyCanvasSizeButton.addEventListener("click", () => {
    if (!hasRequiredStyleSelection()) {
      setStatus("Select Paint and Stroke from the palette before editing.");
      return;
    }
    setCanvasSize(refs.canvasWidthInput.value, refs.canvasHeightInput.value);
    setStatus("Updated canvas size.");
  });

  refs.zoomInButton.addEventListener("click", () => {
    setZoom(state.zoom * 1.15);
  });

  refs.zoomOutButton.addEventListener("click", () => {
    setZoom(state.zoom / 1.15);
  });

  refs.zoomPercentInput.addEventListener("change", () => {
    const value = clamp(refs.zoomPercentInput.value, 25, 800, 100);
    setZoom(value / 100);
  });

  refs.resetViewButton.addEventListener("click", () => {
    resetView();
  });

  refs.toolGrid.querySelectorAll("[data-tool]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.tool !== "polyline") {
        finalizePendingPolyline(true);
      }
      setActiveTool(button.dataset.tool);
    });
  });

  refs.setPaletteTargetPaintButton.addEventListener("click", () => {
    setPaletteTarget("paint");
  });

  refs.setPaletteTargetStrokeButton.addEventListener("click", () => {
    setPaletteTarget("stroke");
  });

  refs.strokeWidthInput.addEventListener("input", () => {
    state.strokeWidth = clamp(refs.strokeWidthInput.value, 0, 128, state.strokeWidth);
    applyEnablementState();
  });

  refs.applyStyleButton.addEventListener("click", applyStyleToSelection);
  refs.deleteSelectedButton.addEventListener("click", deleteSelectedElement);
  refs.sendBackwardButton.addEventListener("click", moveSelectedBackward);
  refs.bringForwardButton.addEventListener("click", moveSelectedForward);

  refs.editorSvg.addEventListener("pointerdown", onSvgPointerDown);
  refs.editorSvg.addEventListener("pointermove", onSvgPointerMove);
  refs.editorSvg.addEventListener("pointerup", finalizeDragOperation);
  refs.editorSvg.addEventListener("pointercancel", finalizeDragOperation);
  refs.editorSvg.addEventListener("wheel", onCanvasWheel, { passive: false });
  refs.editorSvg.addEventListener("dblclick", () => {
    if (state.pendingPolyline) {
      finalizePendingPolyline(true);
      renderElementList();
    }
  });

  refs.selectionOverlay.querySelectorAll(".resize-handle").forEach((handleButton) => {
    handleButton.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!hasRequiredStyleSelection()) {
        setStatus("Select Paint and Stroke from the palette before editing.");
        return;
      }
      const selected = getSelectedElement();
      if (!selected) {
        return;
      }
      const snapshot = captureGeometry(selected);
      if (!snapshot || snapshot.unsupported) {
        return;
      }
      state.drag = {
        kind: "resize",
        pointerId: event.pointerId,
        element: selected,
        snapshot,
        start: getScenePoint(event),
        handle: handleButton.dataset.handle || "se"
      };
      handleButton.setPointerCapture(event.pointerId);
    });

    handleButton.addEventListener("pointermove", (event) => {
      if (!state.drag || state.drag.pointerId !== event.pointerId || state.drag.kind !== "resize") {
        return;
      }
      const scenePoint = getScenePoint(event);
      const deltaX = scenePoint.x - state.drag.start.x;
      const deltaY = scenePoint.y - state.drag.start.y;
      const nextBounds = computeResizeBounds(state.drag.snapshot.bbox, state.drag.handle, deltaX, deltaY);
      const resized = resizeGeometry(state.drag.element, state.drag.snapshot, nextBounds);
      if (resized) {
        selectElement(state.drag.element);
      }
    });

    handleButton.addEventListener("pointerup", (event) => {
      if (handleButton.hasPointerCapture(event.pointerId)) {
        handleButton.releasePointerCapture(event.pointerId);
      }
      if (state.drag && state.drag.pointerId === event.pointerId && state.drag.kind === "resize") {
        state.drag = null;
      }
      updateSelectionOverlay();
      renderElementList();
    });

    handleButton.addEventListener("pointercancel", (event) => {
      if (handleButton.hasPointerCapture(event.pointerId)) {
        handleButton.releasePointerCapture(event.pointerId);
      }
      if (state.drag && state.drag.pointerId === event.pointerId && state.drag.kind === "resize") {
        state.drag = null;
      }
      updateSelectionOverlay();
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Delete" || event.key === "Backspace") {
      if (document.activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
        return;
      }
      event.preventDefault();
      deleteSelectedElement();
      return;
    }

    if (event.key === "Escape") {
      if (state.pendingPolyline) {
        finalizePendingPolyline(false);
        renderElementList();
      }
      if (state.pendingFreehand) {
        finalizeFreehandPath(false);
        renderElementList();
      }
      clearSelection();
      setStatus("Selection cleared.");
      return;
    }

    if (event.key === "Enter" && state.pendingPolyline) {
      event.preventDefault();
      finalizePendingPolyline(true);
      renderElementList();
    }
  });

  window.addEventListener("resize", () => {
    updateSelectionOverlay();
  });
}

async function initialize() {
  state.paletteEntries = loadPaletteEntriesFromExistingWorkflow();
  bindEvents();
  setCanvasSize(state.canvasWidth, state.canvasHeight);
  resetView();
  renderMainPaletteGrid();
  renderUsedColorStrip();
  setPaletteTarget("paint", { silent: true });
  applyEnablementState();
  renderElementList();
  await refreshSampleOptions(false);
  setStatus("SVG Background Editor ready.");
}

initialize();
