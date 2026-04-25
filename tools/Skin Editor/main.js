import { safeParseJson, toPrettyJson } from "../shared/debugInspectorData.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";
import { readSharedPaletteHandoff } from "../shared/assetUsageIntegration.js";
import {
  loadGameSkin,
  normalizeGameSkinDocument
} from "/games/shared/gameSkinLoader.js";

const GAME_OPTIONS = Object.freeze([
  {
    id: "Breakout",
    label: "Breakout",
    gameHref: "/games/Breakout/index.html",
    expectedSchema: "games.breakout.skin/1"
  },
  {
    id: "Pong",
    label: "Pong",
    gameHref: "/games/Pong/index.html",
    expectedSchema: "games.pong.skin/1"
  },
  {
    id: "SolarSystem",
    label: "Solar System",
    gameHref: "/games/SolarSystem/index.html",
    expectedSchema: "games.solar-system.skin/1"
  },
  {
    id: "Bouncing-ball",
    label: "Bouncing Ball",
    gameHref: "/games/Bouncing-ball/index.html",
    expectedSchema: "games.bouncing-ball.skin/1"
  }
]);

const refs = {
  loadButton: document.getElementById("skinEditorLoadButton"),
  saveOverrideButton: document.getElementById("skinEditorSaveOverrideButton"),
  clearOverrideButton: document.getElementById("skinEditorClearOverrideButton"),
  importInput: document.getElementById("skinEditorImportInput"),
  exportButton: document.getElementById("skinEditorExportButton"),
  openGameButton: document.getElementById("skinEditorOpenGameButton"),
  howToUseButton: document.getElementById("skinEditorHowToUseButton"),
  syncVisualButton: document.getElementById("skinEditorSyncVisualButton"),
  statusText: document.getElementById("skinEditorStatus"),
  input: document.getElementById("skinEditorInput"),
  summary: document.getElementById("skinEditorSummary"),
  contextGame: document.getElementById("skinEditorContextGame"),
  contextSchema: document.getElementById("skinEditorContextSchema"),
  contextSource: document.getElementById("skinEditorContextSource"),
  newShapeType: document.getElementById("skinEditorNewShapeType"),
  newShapeName: document.getElementById("skinEditorNewShapeName"),
  addShapeButton: document.getElementById("skinEditorAddShapeButton"),
  renameObjectButton: document.getElementById("skinEditorRenameObjectButton"),
  deleteObjectButton: document.getElementById("skinEditorDeleteObjectButton"),
  flattenObjectsButton: document.getElementById("skinEditorFlattenObjectsButton"),
  moveObjectUpButton: document.getElementById("skinEditorMoveObjectUpButton"),
  moveObjectDownButton: document.getElementById("skinEditorMoveObjectDownButton"),
  objectList: document.getElementById("skinEditorObjectList"),
  paletteList: document.getElementById("skinEditorPaletteList"),
  selectedObjectName: document.getElementById("skinEditorSelectedObjectName"),
  selectedObjectColor: document.getElementById("skinEditorSelectedObjectColor"),
  objectControls: document.getElementById("skinEditorObjectControls"),
  previewCanvas: document.getElementById("skinEditorPreviewCanvas"),
  previewNote: document.getElementById("skinEditorPreviewNote")
};

const state = {
  activeGameId: "",
  activeSkin: null,
  activeSource: "n/a",
  presetSkin: null,
  selectedObjectKey: "",
  selectedObjectKeys: [],
  selectedColorSwatch: "",
  skipAutoSelectOnce: false
};

const SUPPORTED_OBJECT_SHAPES = Object.freeze([
  "circle",
  "oval",
  "rectangle",
  "square",
  "triangle",
  "line",
  "arc",
  "sector",
  "capsule",
  "polygon",
  "star",
  "ring",
  "flattened",
  "hud-color",
  "wall",
  "wall-multi-side"
]);

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toObject(value) {
  return value && typeof value === "object" ? value : {};
}

function deepClone(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

function normalizeSamplePresetPath(pathValue) {
  const path = normalizeText(pathValue).replace(/\\/g, "/");
  if (!path || path.includes("..")) {
    return "";
  }
  if (path.startsWith("/samples/") || path.startsWith("/games/")) {
    return path;
  }
  if (path.startsWith("./samples/") || path.startsWith("./games/")) {
    return `/${path.slice(2)}`;
  }
  if (path.startsWith("samples/") || path.startsWith("games/")) {
    return `/${path}`;
  }
  return "";
}

function getGameOptionById(gameId) {
  const normalized = normalizeText(gameId).toLowerCase();
  return GAME_OPTIONS.find((option) => option.id.toLowerCase() === normalized) || null;
}

function getSelectedGameOption() {
  return getGameOptionById(state.activeGameId);
}

function resolveActiveGameOption(initialGameId = "") {
  const selected = getGameOptionById(initialGameId);
  state.activeGameId = selected ? selected.id : "";
  return selected;
}

function getObjectKeys() {
  const objects = toObject(state.activeSkin?.objects);
  return Object.keys(objects);
}

function isFlattenIneligibleObjectKey(objectKey) {
  return inferShapeTypeFromObjectKey(objectKey) === "hud-color";
}

function getValidSelectedObjectKeys() {
  const keys = getObjectKeys();
  if (!keys.length || !Array.isArray(state.selectedObjectKeys)) {
    return [];
  }
  return Array.from(new Set(
    state.selectedObjectKeys.filter((key) => keys.includes(key) && !isFlattenIneligibleObjectKey(key))
  ));
}

function getSelectedObjectKeysInObjectOrder() {
  const keys = getObjectKeys();
  const selectedKeySet = new Set(getValidSelectedObjectKeys());
  return keys.filter((key) => selectedKeySet.has(key));
}

function getSelectedShapeTypeValue() {
  return refs.newShapeType instanceof HTMLSelectElement
    ? normalizeText(refs.newShapeType.value).toLowerCase()
    : "";
}

function updateAddShapeButtonState() {
  if (!(refs.addShapeButton instanceof HTMLButtonElement)) {
    return;
  }
  const selectedType = getSelectedShapeTypeValue();
  const disabled = selectedType === "flattened";
  refs.addShapeButton.disabled = disabled;
  refs.addShapeButton.title = disabled
    ? "Flattened objects are created only with the Flatten button."
    : "";
}

function updateFlattenButtonState() {
  const validSelection = getValidSelectedObjectKeys();
  state.selectedObjectKeys = validSelection;
  if (refs.flattenObjectsButton instanceof HTMLButtonElement) {
    refs.flattenObjectsButton.disabled = validSelection.length < 2;
  }
}

function updateObjectOrderButtonState() {
  const keys = getObjectKeys();
  const selectedKey = normalizeText(state.selectedObjectKey);
  const selectedIndex = keys.indexOf(selectedKey);
  const hasSelection = selectedIndex >= 0;

  if (refs.moveObjectUpButton instanceof HTMLButtonElement) {
    refs.moveObjectUpButton.disabled = !hasSelection || selectedIndex <= 0;
  }
  if (refs.moveObjectDownButton instanceof HTMLButtonElement) {
    refs.moveObjectDownButton.disabled = !hasSelection || selectedIndex >= keys.length - 1;
  }
}

function setStatus(message) {
  if (refs.statusText instanceof HTMLElement) {
    refs.statusText.textContent = message;
  }
}

function setSummary(payload) {
  if (refs.summary instanceof HTMLElement) {
    refs.summary.textContent = payload;
  }
}

function updateContextChips(game, source, skinDocument) {
  if (refs.contextGame instanceof HTMLElement) {
    refs.contextGame.textContent = `Game: ${game?.label || "n/a"}`;
  }
  if (refs.contextSchema instanceof HTMLElement) {
    refs.contextSchema.textContent = `Schema: ${normalizeText(skinDocument?.schema) || "n/a"}`;
  }
  if (refs.contextSource instanceof HTMLElement) {
    refs.contextSource.textContent = `Source: ${normalizeText(source) || "n/a"}`;
  }
}

function formatSummary(game, source, skinDocument) {
  const objects = skinDocument && typeof skinDocument.objects === "object" ? skinDocument.objects : {};
  const entities = skinDocument && typeof skinDocument.entities === "object" ? skinDocument.entities : {};
  const topObjectKeys = Object.keys(objects);
  const topEntityKeys = Object.keys(entities);
  return [
    `Game: ${game.label}`,
    `Source: ${source}`,
    `Schema: ${normalizeText(skinDocument?.schema) || "(missing)"}`,
    `Document Kind: ${normalizeText(skinDocument?.documentKind) || "(missing)"}`,
    `Object Keys: ${topObjectKeys.length ? topObjectKeys.join(", ") : "none"}`,
    `Entity Keys: ${topEntityKeys.length ? topEntityKeys.join(", ") : "none"}`,
    "",
    toPrettyJson(skinDocument || {})
  ].join("\n");
}

function parseEditorSkin() {
  if (!(refs.input instanceof HTMLTextAreaElement)) {
    return null;
  }
  const parsed = safeParseJson(refs.input.value);
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  return parsed;
}

function toDownloadName(gameId) {
  const normalized = normalizeText(gameId).toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  return `${normalized || "game"}-skin.json`;
}

function deriveCatalogPathFromGameHref(gameHref) {
  const href = normalizeText(gameHref).replace(/\\/g, "/");
  if (!href || !href.startsWith("/games/")) {
    return "";
  }
  if (href.endsWith("/index.html")) {
    return `${href.slice(0, -"/index.html".length)}/assets/workspace.asset-catalog.json`;
  }
  if (href.endsWith("/")) {
    return `${href}assets/workspace.asset-catalog.json`;
  }
  return "";
}

function downloadTextFile(filename, contents) {
  const blob = new Blob([contents], { type: "application/json" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

function buildNormalizedSkinDocument(game, parsedSkin) {
  return normalizeGameSkinDocument(parsedSkin, {
    expectedGameId: game.id,
    expectedSchema: game.expectedSchema
  });
}

function toObjectCentricSkinDocument(game, rawSkin) {
  const normalized = buildNormalizedSkinDocument(game, rawSkin);
  if (!normalized) {
    return null;
  }
  return {
    documentKind: normalizeText(normalized?.documentKind),
    version: Number(normalized?.version),
    schema: normalizeText(normalized?.schema),
    gameId: normalizeText(normalized?.gameId),
    name: normalizeText(normalized?.name),
    objects: deepClone(toObject(normalized?.objects)) || {},
    entities: {}
  };
}

function resolveCurrentSkinDocument() {
  const game = getSelectedGameOption();
  if (!game) {
    return null;
  }
  const parsed = parseEditorSkin();
  return parsed ? toObjectCentricSkinDocument(game, parsed) : null;
}

function getSkinShapeIssues(skinDocument) {
  const skin = toObject(skinDocument);
  const objects = toObject(skin.objects);
  const issues = [];
  Object.entries(objects).forEach(([objectKey, objectValue]) => {
    const object = toObject(objectValue);
    const shape = normalizeText(object.shape).toLowerCase();
    if (!shape) {
      issues.push(`objects.${objectKey}: missing required shape.`);
      return;
    }
    if (!SUPPORTED_OBJECT_SHAPES.includes(shape)) {
      issues.push(`objects.${objectKey}: unsupported shape '${shape}'.`);
    }
  });
  return issues;
}

function extractRawSkinForValidation(rawSkin) {
  const source = toObject(rawSkin);
  if (source.payload && typeof source.payload === "object" && source.payload.skin && typeof source.payload.skin === "object") {
    return source.payload.skin;
  }
  if (source.skin && typeof source.skin === "object") {
    return source.skin;
  }
  return source;
}

function getRawSkinShapeIssues(rawSkin) {
  const skin = extractRawSkinForValidation(rawSkin);
  return getSkinShapeIssues(skin);
}

function ensureSelectedObjectKey() {
  const keys = getObjectKeys();
  if (!keys.length) {
    state.selectedObjectKey = "";
    state.selectedObjectKeys = [];
    updateFlattenButtonState();
    updateObjectOrderButtonState();
    return;
  }

  const normalizedSelection = getValidSelectedObjectKeys();
  if (state.skipAutoSelectOnce && !normalizeText(state.selectedObjectKey)) {
    state.skipAutoSelectOnce = false;
    state.selectedObjectKeys = normalizedSelection;
    updateFlattenButtonState();
    updateObjectOrderButtonState();
    return;
  }

  if (!keys.includes(state.selectedObjectKey)) {
    state.selectedObjectKey = keys[0];
  }
  state.selectedObjectKeys = Array.from(new Set(normalizedSelection));
  updateFlattenButtonState();
  updateObjectOrderButtonState();
}

function parseHexForPicker(value) {
  const text = normalizeText(value).toLowerCase();
  const match = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(text);
  if (!match) {
    return null;
  }
  const body = match[1];
  if (body.length === 3) {
    return {
      picker: `#${body.split("").map((char) => `${char}${char}`).join("")}`,
      alpha: ""
    };
  }
  if (body.length === 4) {
    return {
      picker: `#${body.slice(0, 3).split("").map((char) => `${char}${char}`).join("")}`,
      alpha: `${body[3]}${body[3]}`
    };
  }
  if (body.length === 6) {
    return {
      picker: `#${body}`,
      alpha: ""
    };
  }
  return {
    picker: `#${body.slice(0, 6)}`,
    alpha: body.slice(6, 8)
  };
}

function createBasicField(className, value) {
  const input = document.createElement("input");
  input.className = className;
  input.value = value;
  return input;
}

function numberStep(value) {
  return Number.isInteger(value) ? "1" : "0.1";
}

function isPositiveDimensionKey(propertyKey) {
  return /(width|height|size|length|radius|thickness|diameter|gap)/i.test(normalizeText(propertyKey));
}

function clampNumericProperty(propertyKey, value) {
  if (!Number.isFinite(value)) {
    return value;
  }
  if (/sides?/i.test(normalizeText(propertyKey))) {
    return Math.max(3, Math.round(value));
  }
  if (isPositiveDimensionKey(propertyKey)) {
    return Math.max(1, value);
  }
  return value;
}

function wrapAngleDegrees(value) {
  if (!Number.isFinite(value)) {
    return value;
  }
  let wrapped = value;
  while (wrapped > 360) {
    wrapped -= 360;
  }
  while (wrapped < 0) {
    wrapped += 360;
  }
  return wrapped;
}

function normalizeObjectKey(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeObjectKeyPreserveCase(value) {
  return normalizeText(value)
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hasObjectKey(objects, candidateKey, { caseInsensitive = false } = {}) {
  if (!caseInsensitive) {
    return Object.prototype.hasOwnProperty.call(objects, candidateKey);
  }
  const candidate = normalizeText(candidateKey).toLowerCase();
  return Object.keys(objects).some((key) => normalizeText(key).toLowerCase() === candidate);
}

function ensureUniqueObjectKey(baseKey, { preserveCase = false } = {}) {
  const objects = toObject(state.activeSkin?.objects);
  const normalizedBase = preserveCase
    ? (normalizeObjectKeyPreserveCase(baseKey) || "shape")
    : (normalizeObjectKey(baseKey) || "shape");
  const caseInsensitive = preserveCase;
  if (!hasObjectKey(objects, normalizedBase, { caseInsensitive })) {
    return normalizedBase;
  }
  let index = 2;
  while (hasObjectKey(objects, `${normalizedBase}-${index}`, { caseInsensitive })) {
    index += 1;
  }
  return `${normalizedBase}-${index}`;
}

function createShapePreset(shapeType) {
  const type = normalizeText(shapeType).toLowerCase();
  if (type === "hud-color") {
    return {
      shape: "hud-color",
      color: "#f8f8f2"
    };
  }
  if (type === "flattened") {
    return {
      shape: "flattened",
      components: []
    };
  }
  if (type === "triangle") {
    return {
      shape: "triangle",
      color: "#f8f8f2",
      width: 120,
      height: 96
    };
  }
  if (type === "line") {
    return {
      shape: "line",
      color: "#f8f8f2",
      x1: -60,
      y1: 0,
      x2: 60,
      y2: 0,
      thickness: 6,
      roundedCorner: false
    };
  }
  if (type === "arc") {
    return {
      shape: "arc",
      color: "#f8f8f2",
      radius: 64,
      startAngle: 210,
      endAngle: 330,
      thickness: 6
    };
  }
  if (type === "sector") {
    return {
      shape: "sector",
      color: "#f8f8f2",
      radius: 64,
      startAngle: 220,
      endAngle: 320
    };
  }
  if (type === "capsule") {
    return {
      shape: "capsule",
      color: "#f8f8f2",
      width: 164,
      height: 64
    };
  }
  if (type === "polygon") {
    return {
      shape: "polygon",
      color: "#f8f8f2",
      sides: 6,
      radius: 56
    };
  }
  if (type === "star") {
    return {
      shape: "star",
      color: "#f8f8f2",
      sides: 5,
      outerRadius: 56,
      innerRadius: 26
    };
  }
  if (type === "wall-multi-side") {
    return {
      shape: "wall",
      color: "#f8f8f2",
      thickness: 16,
      left: true,
      right: true,
      top: true,
      bottom: false
    };
  }
  if (type === "circle") {
    return { color: "#f8f8f2", radius: 42 };
  }
  if (type === "oval") {
    return {
      shape: "oval",
      color: "#f8f8f2",
      width: 140,
      height: 90
    };
  }
  if (type === "square") {
    return { color: "#f8f8f2", width: 96, height: 96 };
  }
  if (type === "ring") {
    return { color: "#f8f8f2", innerRadius: 26, outerRadius: 56 };
  }
  return { color: "#f8f8f2", width: 140, height: 90 };
}

function drawRegularPolygonPath(context, centerX, centerY, radius, sides, rotationRadians = -Math.PI / 2) {
  const vertexCount = Math.max(3, Math.round(Number(sides) || 3));
  const drawRadius = Math.max(2, Number(radius) || 2);
  context.beginPath();
  for (let index = 0; index < vertexCount; index += 1) {
    const angle = rotationRadians + (index * Math.PI * 2) / vertexCount;
    const x = centerX + Math.cos(angle) * drawRadius;
    const y = centerY + Math.sin(angle) * drawRadius;
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }
  context.closePath();
}

function drawStarPath(context, centerX, centerY, outerRadius, innerRadius, points, rotationRadians = -Math.PI / 2) {
  const pointCount = Math.max(3, Math.round(Number(points) || 5));
  const outer = Math.max(2, Number(outerRadius) || 2);
  const inner = Math.max(1, Math.min(outer - 1, Number(innerRadius) || Math.max(1, outer / 2)));
  const vertexCount = pointCount * 2;
  context.beginPath();
  for (let index = 0; index < vertexCount; index += 1) {
    const angle = rotationRadians + (index * Math.PI) / pointCount;
    const radius = index % 2 === 0 ? outer : inner;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }
  context.closePath();
}

function sanitizePositiveDimensionsInDocument(skinDocument) {
  const skinDoc = skinDocument && typeof skinDocument === "object" ? skinDocument : {};
  const objects = toObject(skinDoc.objects);
  Object.values(objects).forEach((objectValue) => {
    const object = toObject(objectValue);
    Object.entries(object).forEach(([propertyKey, propertyValue]) => {
      if (typeof propertyValue === "number" && Number.isFinite(propertyValue) && isPositiveDimensionKey(propertyKey)) {
        object[propertyKey] = Math.max(1, propertyValue);
      }
    });
  });
  skinDoc.objects = objects;
  return skinDoc;
}

function updateEditorFromState(source = "visual-editor") {
  const game = getSelectedGameOption();
  if (!game || !state.activeSkin) {
    return;
  }
  if (refs.input instanceof HTMLTextAreaElement) {
    refs.input.value = toPrettyJson(state.activeSkin);
  }
  state.activeSource = source;
  setSummary(formatSummary(game, source, state.activeSkin));
  updateContextChips(game, source, state.activeSkin);
}

function setPreviewNote(message = "") {
  if (refs.previewNote instanceof HTMLElement) {
    refs.previewNote.textContent = message;
  }
}

function setSelectedObjectNameLabel() {
  if (!(refs.selectedObjectName instanceof HTMLElement)) {
    return;
  }
  refs.selectedObjectName.textContent = state.selectedObjectKey || "none";
}

function getSelectedObjectColorValue() {
  const selectedObject = toObject(state.activeSkin?.objects?.[state.selectedObjectKey]);
  if (parseHexForPicker(selectedObject.color)) {
    return normalizeText(selectedObject.color);
  }
  const firstColor = Object.values(selectedObject)
    .find((value) => typeof value === "string" && parseHexForPicker(value));
  return typeof firstColor === "string" ? normalizeText(firstColor) : "";
}

function setSelectedObjectColorLabel() {
  if (!(refs.selectedObjectColor instanceof HTMLElement)) {
    return;
  }
  const colorValue = getSelectedObjectColorValue();
  refs.selectedObjectColor.textContent = colorValue ? `Color: ${colorValue}` : "Color: none";
}

function inferShapeTypeFromSelectedObject() {
  return inferShapeTypeFromObjectKey(state.selectedObjectKey);
}

function inferShapeTypeFromObjectKey(objectKey) {
  const selectedObject = toObject(state.activeSkin?.objects?.[objectKey]);
  const shape = normalizeText(selectedObject.shape).toLowerCase();
  if (shape === "wall") {
    return "wall-multi-side";
  }
  if (shape && SUPPORTED_OBJECT_SHAPES.includes(shape)) {
    return shape;
  }
  return "";
}

function syncShapeTypeControlFromSelection() {
  if (!(refs.newShapeType instanceof HTMLSelectElement)) {
    return;
  }
  const inferredShapeType = inferShapeTypeFromSelectedObject();
  const optionExists = Array.from(refs.newShapeType.options).some((option) => option.value === inferredShapeType);
  if (optionExists) {
    refs.newShapeType.value = inferredShapeType;
  }
  updateAddShapeButtonState();
}

function syncSelectedObjectUiFromSelection() {
  if (refs.newShapeName instanceof HTMLInputElement) {
    refs.newShapeName.value = state.selectedObjectKey || "";
  }
  state.selectedColorSwatch = getSelectedObjectColorValue();
  setSelectedObjectNameLabel();
  setSelectedObjectColorLabel();
  syncShapeTypeControlFromSelection();
}

function selectObjectKey(objectKey) {
  state.selectedObjectKey = objectKey;
  syncSelectedObjectUiFromSelection();
  updateFlattenButtonState();
  updateObjectOrderButtonState();
  renderObjectList();
  renderPaletteList();
  renderObjectControls();
  drawSelectedObjectPreview();
}

function setObjectSelected(objectKey, selected) {
  const currentSelection = Array.isArray(state.selectedObjectKeys) ? [...state.selectedObjectKeys] : [];
  const nextSelection = selected
    ? Array.from(new Set([...currentSelection, objectKey]))
    : currentSelection.filter((key) => key !== objectKey);
  state.selectedObjectKeys = nextSelection;
  syncSelectedObjectUiFromSelection();
  updateFlattenButtonState();
  updateObjectOrderButtonState();
  renderObjectList();
  renderPaletteList();
  renderObjectControls();
  drawSelectedObjectPreview();
}

function setObjectPropertyValue(objectKey, propertyKey, value) {
  if (!state.activeSkin || typeof state.activeSkin !== "object") {
    return;
  }
  if (!state.activeSkin.objects || typeof state.activeSkin.objects !== "object") {
    state.activeSkin.objects = {};
  }
  if (!state.activeSkin.objects[objectKey] || typeof state.activeSkin.objects[objectKey] !== "object") {
    state.activeSkin.objects[objectKey] = {};
  }
  let nextValue = typeof value === "number"
    ? clampNumericProperty(propertyKey, value)
    : value;
  const normalizedPropertyKey = normalizeText(propertyKey).toLowerCase();
  const inferredShapeType = inferShapeTypeFromObjectKey(objectKey);
  if (typeof nextValue === "number"
    && Number.isFinite(nextValue)
    && ["startangle", "endangle"].includes(normalizedPropertyKey)
    && ["arc", "sector"].includes(inferredShapeType)) {
    nextValue = wrapAngleDegrees(nextValue);
  }
  const isSquareObject = inferredShapeType === "square";
  if (isSquareObject
    && typeof nextValue === "number"
    && Number.isFinite(nextValue)
    && ["size", "width", "height"].includes(normalizedPropertyKey)) {
    const squareSize = clampNumericProperty("size", nextValue);
    state.activeSkin.objects[objectKey].size = squareSize;
    state.activeSkin.objects[objectKey].width = squareSize;
    state.activeSkin.objects[objectKey].height = squareSize;
    updateEditorFromState("visual-editor");
    syncSelectedObjectUiFromSelection();
    renderPaletteList();
    renderObjectControls();
    drawSelectedObjectPreview();
    return;
  }
  state.activeSkin.objects[objectKey][propertyKey] = nextValue;
  updateEditorFromState("visual-editor");
  syncSelectedObjectUiFromSelection();
  renderPaletteList();
  renderObjectControls();
  drawSelectedObjectPreview();
}

function getSelectedObjectColorPropertyKeys() {
  const selectedObject = toObject(state.activeSkin?.objects?.[state.selectedObjectKey]);
  return Object.entries(selectedObject)
    .filter(([, value]) => typeof value === "string" && parseHexForPicker(value))
    .map(([key]) => key);
}

function applyPaletteColorToSelectedObject(colorValue) {
  if (!state.activeSkin || typeof state.activeSkin !== "object") {
    return;
  }
  const selectedKey = state.selectedObjectKey;
  if (!selectedKey) {
    setStatus("Select an object before applying a palette color.");
    return;
  }
  const colorKeys = getSelectedObjectColorPropertyKeys();
  const selectedObject = toObject(state.activeSkin.objects?.[selectedKey]);
  if (colorKeys.length) {
    colorKeys.forEach((colorKey) => {
      selectedObject[colorKey] = colorValue;
    });
  } else {
    selectedObject.color = colorValue;
  }
  state.activeSkin.objects[selectedKey] = selectedObject;
  state.selectedColorSwatch = colorValue;
  updateEditorFromState("palette");
  syncSelectedObjectUiFromSelection();
  renderPaletteList();
  renderObjectControls();
  drawSelectedObjectPreview();
  setStatus(`Applied palette color to '${selectedKey}'.`);
}

function renderPaletteList() {
  if (!(refs.paletteList instanceof HTMLElement)) {
    return;
  }
  refs.paletteList.innerHTML = "";
  const sharedPalette = readSharedPaletteHandoff();
  const entries = Array.isArray(sharedPalette?.colors) ? sharedPalette.colors : [];
  const swatches = entries
    .map((entry, index) => {
      const color = normalizeText(entry?.hex);
      if (!parseHexForPicker(color)) {
        return null;
      }
      const swatchName = normalizeText(entry?.name) || `Swatch ${index + 1}`;
      const swatchSymbol = normalizeText(entry?.symbol);
      const prefix = swatchSymbol ? `\`${swatchSymbol}\` ` : "";
      return {
        id: `${sharedPalette?.paletteId || "shared-palette"}.${index}`,
        label: `${prefix}${swatchName}`,
        color
      };
    })
    .filter((entry) => Boolean(entry));

  if (!sharedPalette) {
    const empty = document.createElement("p");
    empty.className = "skin-editor-empty";
    empty.textContent = "No shared palette selected. Open Palette Browser and select Use in Workspace Manager.";
    refs.paletteList.appendChild(empty);
    return;
  }

  if (!swatches.length) {
    const empty = document.createElement("p");
    empty.className = "skin-editor-empty";
    empty.textContent = "Shared palette has no valid swatches.";
    refs.paletteList.appendChild(empty);
    return;
  }

  const paletteLabel = document.createElement("p");
  paletteLabel.className = "skin-editor-empty";
  const paletteName = normalizeText(sharedPalette.displayName) || normalizeText(sharedPalette.paletteId) || "Shared Palette";
  paletteLabel.textContent = `Shared palette '${paletteName}' (${swatches.length}).`;
  refs.paletteList.appendChild(paletteLabel);

  const selectedObjectColor = normalizeText(state.selectedColorSwatch || getSelectedObjectColorValue()).toLowerCase();
  let activeMarked = false;

  swatches.forEach((swatch) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "skin-editor-palette-swatch";
    if (!activeMarked && selectedObjectColor && selectedObjectColor === swatch.color.toLowerCase()) {
      row.classList.add("is-active");
      activeMarked = true;
    }
    const chip = document.createElement("span");
    chip.className = "skin-editor-palette-swatch-chip";
    chip.style.background = swatch.color;
    const label = document.createElement("span");
    label.className = "skin-editor-palette-swatch-label";
    label.textContent = swatch.label;
    const hex = document.createElement("span");
    hex.className = "skin-editor-palette-swatch-hex";
    hex.textContent = swatch.color.toUpperCase();
    row.appendChild(chip);
    row.appendChild(label);
    row.appendChild(hex);
    row.addEventListener("click", () => {
      applyPaletteColorToSelectedObject(swatch.color);
    });
    refs.paletteList.appendChild(row);
  });
}

function renderObjectList() {
  if (!(refs.objectList instanceof HTMLElement)) {
    return;
  }
  refs.objectList.innerHTML = "";
  const keys = getObjectKeys();
  const selectedObjectKeys = getValidSelectedObjectKeys();
  state.selectedObjectKeys = selectedObjectKeys;
  updateFlattenButtonState();
  updateObjectOrderButtonState();
  if (!keys.length) {
    const note = document.createElement("p");
    note.className = "skin-editor-empty";
    note.textContent = "No objects found in this skin.";
    refs.objectList.appendChild(note);
    return;
  }

  keys.forEach((objectKey) => {
    const row = document.createElement("div");
    row.className = "skin-editor-object-row";
    const flattenIneligible = isFlattenIneligibleObjectKey(objectKey);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "skin-editor-object-check";
    checkbox.checked = !flattenIneligible && selectedObjectKeys.includes(objectKey);
    checkbox.disabled = flattenIneligible;
    if (flattenIneligible) {
      checkbox.title = "HUD Color objects cannot be included in flatten.";
    }
    checkbox.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    checkbox.addEventListener("change", () => {
      setObjectSelected(objectKey, checkbox.checked);
    });

    const button = document.createElement("button");
    button.type = "button";
    button.className = "skin-editor-object-button";
    if (objectKey === state.selectedObjectKey) {
      button.classList.add("is-active");
    }
    button.textContent = objectKey;
    button.addEventListener("click", () => {
      selectObjectKey(objectKey);
    });
    row.appendChild(checkbox);
    row.appendChild(button);
    refs.objectList.appendChild(row);
  });
}

function renderObjectControls() {
  if (!(refs.objectControls instanceof HTMLElement)) {
    return;
  }
  refs.objectControls.innerHTML = "";

  const selectedKey = state.selectedObjectKey;
  const selectedObject = toObject(state.activeSkin?.objects?.[selectedKey]);
  const inferredShapeType = inferShapeTypeFromObjectKey(selectedKey);
  const entries = Object.entries(selectedObject);
  if (!selectedKey || entries.length === 0) {
    const note = document.createElement("p");
    note.className = "skin-editor-empty";
    note.textContent = "Select an object to edit its properties.";
    refs.objectControls.appendChild(note);
    return;
  }

  if (inferredShapeType === "square") {
    const sizeCandidates = [Number(selectedObject.size), Number(selectedObject.width), Number(selectedObject.height)]
      .filter((entry) => Number.isFinite(entry));
    const sizeValue = clampNumericProperty("size", sizeCandidates.find((entry) => entry > 0) ?? sizeCandidates[0] ?? 96);
    const sizeRow = document.createElement("div");
    sizeRow.className = "skin-editor-row skin-editor-row--number";
    const sizeLabel = document.createElement("span");
    sizeLabel.className = "skin-editor-row-label";
    sizeLabel.textContent = "Size";
    const sizeInput = createBasicField("skin-editor-field", String(sizeValue));
    sizeInput.type = "number";
    sizeInput.step = numberStep(sizeValue);
    sizeInput.min = "1";
    sizeInput.addEventListener("input", () => {
      const parsed = clampNumericProperty("size", Number(sizeInput.value));
      if (!Number.isFinite(parsed)) {
        return;
      }
      sizeInput.value = String(parsed);
      setObjectPropertyValue(selectedKey, "size", parsed);
    });
    sizeRow.appendChild(sizeLabel);
    sizeRow.appendChild(sizeInput);
    refs.objectControls.appendChild(sizeRow);
  }

  if (inferredShapeType === "line") {
    const roundedRow = document.createElement("div");
    roundedRow.className = "skin-editor-row skin-editor-row--boolean";
    const roundedLabel = document.createElement("span");
    roundedLabel.className = "skin-editor-row-label";
    roundedLabel.textContent = "Rounded corner";
    const roundedCheckbox = document.createElement("input");
    roundedCheckbox.type = "checkbox";
    roundedCheckbox.className = "skin-editor-checkbox";
    roundedCheckbox.checked = selectedObject.roundedCorner === true;
    roundedCheckbox.addEventListener("change", () => {
      setObjectPropertyValue(selectedKey, "roundedCorner", roundedCheckbox.checked);
    });
    roundedRow.appendChild(roundedLabel);
    roundedRow.appendChild(roundedCheckbox);
    refs.objectControls.appendChild(roundedRow);
  }

  entries.forEach(([propertyKey, propertyValue]) => {
    if (propertyKey === "shape") {
      return;
    }
    if (inferredShapeType === "square" && ["width", "height", "size"].includes(normalizeText(propertyKey).toLowerCase())) {
      return;
    }
    if (inferredShapeType === "line" && normalizeText(propertyKey).toLowerCase() === "roundedcorner") {
      return;
    }
    if (typeof propertyValue === "number" && Number.isFinite(propertyValue)) {
      const normalizedPropertyKey = normalizeText(propertyKey).toLowerCase();
      const isAngleProperty = ["startangle", "endangle"].includes(normalizedPropertyKey);
      const minValue = /sides?/i.test(normalizeText(propertyKey))
        ? 3
        : (isPositiveDimensionKey(propertyKey) ? 1 : 0);
      const safeValue = clampNumericProperty(propertyKey, propertyValue);
      const row = document.createElement("div");
      row.className = "skin-editor-row skin-editor-row--number";
      const label = document.createElement("span");
      label.className = "skin-editor-row-label";
      label.textContent = propertyKey;

      const numeric = createBasicField("skin-editor-field", String(safeValue));
      numeric.type = "number";
      numeric.step = numberStep(safeValue);
      if (isAngleProperty) {
        numeric.removeAttribute("min");
      } else {
        numeric.min = String(minValue);
      }
      numeric.addEventListener("input", () => {
        const parsed = clampNumericProperty(propertyKey, Number(numeric.value));
        if (!Number.isFinite(parsed)) {
          return;
        }
        numeric.value = String(parsed);
        setObjectPropertyValue(selectedKey, propertyKey, parsed);
      });

      row.appendChild(label);
      row.appendChild(numeric);
      refs.objectControls.appendChild(row);
      return;
    }

    if (typeof propertyValue === "boolean") {
      const row = document.createElement("div");
      row.className = "skin-editor-row skin-editor-row--boolean";
      const label = document.createElement("span");
      label.className = "skin-editor-row-label";
      label.textContent = propertyKey;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "skin-editor-checkbox";
      checkbox.checked = propertyValue;
      checkbox.addEventListener("change", () => {
        setObjectPropertyValue(selectedKey, propertyKey, checkbox.checked);
      });

      row.appendChild(label);
      row.appendChild(checkbox);
      refs.objectControls.appendChild(row);
      return;
    }

    if (typeof propertyValue === "string") {
      const isColorString = Boolean(parseHexForPicker(propertyValue));
      if (isColorString) {
        return;
      }
      const row = document.createElement("div");
      row.className = "skin-editor-row";
      const label = document.createElement("span");
      label.className = "skin-editor-row-label";
      label.textContent = propertyKey;
      const textField = createBasicField("skin-editor-field", propertyValue);
      textField.type = "text";
      textField.addEventListener("change", () => {
        setObjectPropertyValue(selectedKey, propertyKey, textField.value);
      });
      row.appendChild(label);
      row.appendChild(textField);
      refs.objectControls.appendChild(row);
    }
  });

  if (!refs.objectControls.childElementCount) {
    const note = document.createElement("p");
    note.className = "skin-editor-empty";
    note.textContent = "This object has no editable scalar properties.";
    refs.objectControls.appendChild(note);
  }
}

function drawSelectedObjectPreview() {
  if (!(refs.previewCanvas instanceof HTMLCanvasElement)) {
    return;
  }
  const context = refs.previewCanvas.getContext("2d");
  if (!context) {
    return;
  }

  const previewWidth = Math.max(480, refs.previewCanvas.clientWidth || 960);
  const previewHeight = Math.max(320, refs.previewCanvas.clientHeight || 560);
  const deviceScale = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  refs.previewCanvas.width = previewWidth * deviceScale;
  refs.previewCanvas.height = previewHeight * deviceScale;
  context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);

  const selectedKey = state.selectedObjectKey;
  const selectedObject = toObject(state.activeSkin?.objects?.[selectedKey]);
  const selectedKeys = getSelectedObjectKeysInObjectOrder();
  const backgroundColor = normalizeText(state.activeSkin?.objects?.background?.color);
  const sceneBackground = parseHexForPicker(backgroundColor) ? backgroundColor : "#120b24";

  context.clearRect(0, 0, previewWidth, previewHeight);
  context.fillStyle = sceneBackground;
  context.fillRect(0, 0, previewWidth, previewHeight);
  context.strokeStyle = "rgba(255,255,255,0.26)";
  context.lineWidth = 2;
  context.strokeRect(12, 12, previewWidth - 24, previewHeight - 24);

  const drawObjectInPreview = (objectValue) => {
    const object = toObject(objectValue);
    const objectColor = normalizeText(object.color);
    if (!parseHexForPicker(objectColor)) {
      return;
    }
    const drawColor = objectColor;
    const shapeType = normalizeText(object.shape).toLowerCase();
    const centerX = Math.round(previewWidth / 2);
    const centerY = Math.round(previewHeight / 2);
    const width = Math.max(12, Number(object.width) || Number(object.size) || 120);
    const height = Math.max(12, Number(object.height) || Number(object.size) || 80);
    const radius = Math.max(6, Number(object.radius) || Number(object.size) || 40);
    const innerRadius = Math.max(4, Number(object.innerRadius) || 24);
    const outerRadius = Math.max(innerRadius + 4, Number(object.outerRadius) || 52);
    const polygonSides = Math.max(3, Math.round(Number(object.sides) || 6));
    const thickness = Math.max(1, Number(object.thickness) || 1);
    const hasRectProps = Number.isFinite(Number(object.width))
      || Number.isFinite(Number(object.height))
      || Number.isFinite(Number(object.size));
    const hasCircleProps = Number.isFinite(Number(object.radius))
      || Number.isFinite(Number(object.outerRadius))
      || Number.isFinite(Number(object.innerRadius));

    context.fillStyle = drawColor;

    if (shapeType === "flattened" && Array.isArray(object.components)) {
      const components = object.components
        .map((entry) => toObject(entry))
        .filter((entry) => Object.keys(entry).length > 0);
      if (!components.length) {
        context.fillRect(centerX - 60, centerY - 60, 120, 120);
        return;
      }
      components.forEach((component) => {
        drawObjectInPreview(component);
      });
      return;
    }

    if (shapeType === "star") {
      drawStarPath(context, centerX, centerY, outerRadius, innerRadius, polygonSides);
      context.fill();
      return;
    }
    if (shapeType === "polygon") {
      drawRegularPolygonPath(context, centerX, centerY, radius, polygonSides);
      context.fill();
      return;
    }
    if (shapeType === "triangle") {
      context.beginPath();
      context.moveTo(centerX, centerY - height / 2);
      context.lineTo(centerX + width / 2, centerY + height / 2);
      context.lineTo(centerX - width / 2, centerY + height / 2);
      context.closePath();
      context.fill();
      return;
    }
    if (shapeType === "line") {
      const x1 = centerX + (Number.isFinite(Number(object.x1)) ? Number(object.x1) : -width / 2);
      const y1 = centerY + (Number.isFinite(Number(object.y1)) ? Number(object.y1) : 0);
      const x2 = centerX + (Number.isFinite(Number(object.x2)) ? Number(object.x2) : width / 2);
      const y2 = centerY + (Number.isFinite(Number(object.y2)) ? Number(object.y2) : 0);
      const roundedCorner = object.roundedCorner === true;
      context.strokeStyle = drawColor;
      context.lineWidth = Math.max(1, Number(object.thickness) || 4);
      context.lineCap = roundedCorner ? "round" : "square";
      context.lineJoin = roundedCorner ? "round" : "miter";
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.stroke();
      return;
    }
    if (shapeType === "arc") {
      const startAngle = ((Number(object.startAngle) || 0) * Math.PI) / 180;
      const endAngle = ((Number(object.endAngle) || 90) * Math.PI) / 180;
      context.strokeStyle = drawColor;
      context.lineWidth = Math.max(1, Number(object.thickness) || 4);
      context.lineCap = "round";
      context.beginPath();
      context.arc(centerX, centerY, radius, startAngle, endAngle);
      context.stroke();
      return;
    }
    if (shapeType === "sector") {
      const startAngle = ((Number(object.startAngle) || 0) * Math.PI) / 180;
      const endAngle = ((Number(object.endAngle) || 90) * Math.PI) / 180;
      context.beginPath();
      context.moveTo(centerX, centerY);
      context.arc(centerX, centerY, radius, startAngle, endAngle);
      context.closePath();
      context.fill();
      return;
    }
    if (shapeType === "capsule") {
      const capsuleWidth = Math.max(12, width);
      const capsuleHeight = Math.max(12, height);
      const halfW = capsuleWidth / 2;
      const halfH = capsuleHeight / 2;
      context.beginPath();
      if (capsuleWidth >= capsuleHeight) {
        const capRadius = halfH;
        const left = centerX - halfW;
        const right = centerX + halfW;
        const top = centerY - halfH;
        const bottom = centerY + halfH;
        context.moveTo(left + capRadius, top);
        context.lineTo(right - capRadius, top);
        context.arc(right - capRadius, centerY, capRadius, -Math.PI / 2, Math.PI / 2);
        context.lineTo(left + capRadius, bottom);
        context.arc(left + capRadius, centerY, capRadius, Math.PI / 2, (3 * Math.PI) / 2);
      } else {
        const capRadius = halfW;
        const left = centerX - halfW;
        const right = centerX + halfW;
        const top = centerY - halfH;
        const bottom = centerY + halfH;
        context.moveTo(left, top + capRadius);
        context.arc(centerX, top + capRadius, capRadius, Math.PI, 0);
        context.lineTo(right, bottom - capRadius);
        context.arc(centerX, bottom - capRadius, capRadius, 0, Math.PI);
      }
      context.closePath();
      context.fill();
      return;
    }
    if (shapeType === "oval") {
      context.beginPath();
      context.ellipse(
        centerX,
        centerY,
        Math.max(6, width / 2),
        Math.max(6, height / 2),
        0,
        0,
        Math.PI * 2
      );
      context.fill();
      return;
    }
    if (shapeType === "ring" || (Number.isFinite(Number(object.outerRadius)) && Number.isFinite(Number(object.innerRadius)))) {
      context.beginPath();
      context.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
      context.arc(centerX, centerY, innerRadius, 0, Math.PI * 2, true);
      context.fill();
      return;
    }
    if (shapeType === "wall" || (Number.isFinite(Number(object.thickness)) && !hasRectProps && !hasCircleProps)) {
      const margin = 36;
      const usableWidth = Math.max(40, previewWidth - margin * 2);
      const usableHeight = Math.max(40, previewHeight - margin * 2);
      const drawTop = object.top !== false;
      const drawLeft = object.left !== false;
      const drawRight = object.right !== false;
      const drawBottom = object.bottom === true;
      if (drawTop) {
        context.fillRect(margin, margin, usableWidth, thickness);
      }
      if (drawLeft) {
        context.fillRect(margin, margin, thickness, usableHeight);
      }
      if (drawRight) {
        context.fillRect(margin + usableWidth - thickness, margin, thickness, usableHeight);
      }
      if (drawBottom) {
        context.fillRect(margin, margin + usableHeight - thickness, usableWidth, thickness);
      }
      return;
    }
    if (Number.isFinite(Number(object.radius))) {
      context.beginPath();
      context.arc(centerX, centerY, radius, 0, Math.PI * 2);
      context.fill();
      return;
    }
    if (hasRectProps) {
      if (Number.isFinite(Number(object.thickness))) {
        context.strokeStyle = drawColor;
        context.lineWidth = thickness;
        context.strokeRect(
          Math.round(centerX - width / 2),
          Math.round(centerY - height / 2),
          Math.round(width),
          Math.round(height)
        );
      } else {
        context.fillRect(
          Math.round(centerX - width / 2),
          Math.round(centerY - height / 2),
          Math.round(width),
          Math.round(height)
        );
      }
      return;
    }
    context.fillRect(centerX - 60, centerY - 60, 120, 120);
  };

  if (!selectedKey && selectedKeys.length < 2) {
    setPreviewNote("");
    return;
  }

  if (selectedKeys.length >= 2) {
    selectedKeys.forEach((key) => {
      drawObjectInPreview(state.activeSkin?.objects?.[key]);
    });
  } else {
    drawObjectInPreview(selectedObject);
  }

  context.fillStyle = "#ffffff";
  context.font = "700 18px 'Segoe UI', sans-serif";
  context.textAlign = "left";
  context.textBaseline = "top";
  if (selectedKeys.length >= 2) {
    context.fillText(`Flatten Preview (${selectedKeys.length})`, 20, 20);
  } else {
    context.fillText(selectedKey, 20, 20);
  }
  setPreviewNote("");
}

function renderWorkbench() {
  ensureSelectedObjectKey();
  updateFlattenButtonState();
  updateObjectOrderButtonState();
  syncSelectedObjectUiFromSelection();
  renderObjectList();
  renderPaletteList();
  renderObjectControls();
  drawSelectedObjectPreview();
}

function setCurrentSkinDocument(rawSkin, source = "loaded") {
  const game = getSelectedGameOption();
  if (!game) {
    return false;
  }
  const normalizedDocument = toObjectCentricSkinDocument(game, rawSkin);
  if (!normalizedDocument) {
    const rawShapeIssues = getRawSkinShapeIssues(rawSkin);
    if (rawShapeIssues.length) {
      setStatus(`Skin load failed: ${rawShapeIssues[0]} Add shape to every object entry.`);
      return false;
    }
    setStatus("Skin load failed: skin JSON is invalid for this game/schema.");
    return false;
  }
  const shapeIssues = getSkinShapeIssues(normalizedDocument);
  if (shapeIssues.length) {
    setStatus(`Skin load failed: ${shapeIssues[0]} Add shape to every object entry.`);
    return false;
  }
  const normalized = sanitizePositiveDimensionsInDocument(normalizedDocument);
  state.activeSkin = deepClone(normalized) || normalized;
  state.selectedObjectKeys = [];
  state.skipAutoSelectOnce = false;
  updateEditorFromState(source);
  renderWorkbench();
  return true;
}

async function loadActiveSkinForSelectedGame() {
  const game = getSelectedGameOption();
  if (!game) {
    setStatus("Missing game context. Launch Skin Editor from a game/workspace link that includes a valid gameId.");
    return;
  }
  const shouldUsePreset = state.presetSkin
    && normalizeText(state.presetSkin.gameId).toLowerCase() === game.id.toLowerCase();
  if (shouldUsePreset) {
    const loadedPresetSkin = buildNormalizedSkinDocument(game, state.presetSkin);
    state.presetSkin = null;
    if (!setCurrentSkinDocument(loadedPresetSkin, "preset")) {
      return;
    }
    setStatus(`Loaded preset skin for ${game.label}.`);
    return;
  }

  let result;
  try {
    result = await loadGameSkin({
      gameId: game.id,
      expectedSchema: game.expectedSchema,
      catalogPath: deriveCatalogPathFromGameHref(game.gameHref)
    });
  } catch (error) {
    setStatus(`Skin load failed: ${error instanceof Error ? error.message : "unknown error"}`);
    return;
  }

  const loadedSkin = buildNormalizedSkinDocument(game, result.skin);
  if (!setCurrentSkinDocument(loadedSkin, result.source)) {
    return;
  }
  setStatus(`Loaded active skin for ${game.label}.`);
}

async function applySkinOverride() {
  setStatus("Save Override is disabled. Skin Editor now uses source-of-truth workspace skin JSON only.");
}

async function clearSkinOverride() {
  setStatus("Clear Override is disabled. Skin Editor now uses source-of-truth workspace skin JSON only.");
}

function exportSkinJson() {
  const game = getSelectedGameOption();
  if (!game) {
    setStatus("No supported game context was resolved.");
    return;
  }
  const normalized = resolveCurrentSkinDocument();
  if (!normalized) {
    setStatus("Skin JSON is invalid.");
    return;
  }
  downloadTextFile(toDownloadName(game.id), `${toPrettyJson(normalized)}\n`);
  setStatus(`Exported ${toDownloadName(game.id)}.`);
}

function openSelectedGame() {
  const game = getSelectedGameOption();
  if (!game) {
    setStatus("No supported game context was resolved.");
    return;
  }
  window.location.href = game.gameHref;
}

async function importSkinJsonFromFile(file) {
  if (!file) {
    return;
  }
  const text = await file.text();
  const parsed = safeParseJson(text);
  if (!parsed || typeof parsed !== "object") {
    setStatus("Import failed: file is not valid JSON.");
    return;
  }
  if (!setCurrentSkinDocument(parsed, "import")) {
    return;
  }
  setStatus("Imported skin JSON.");
}

function syncVisualFromJson() {
  const parsed = parseEditorSkin();
  if (!parsed) {
    setStatus("Skin JSON is invalid. Fix JSON and try Sync Visual From JSON.");
    return;
  }
  if (!setCurrentSkinDocument(parsed, "json-input")) {
    return;
  }
  setStatus("Visual controls synced from JSON.");
}

function addShapeFromControls() {
  const game = getSelectedGameOption();
  if (!game) {
    setStatus("No supported game context was resolved.");
    return;
  }
  if (!state.activeSkin || typeof state.activeSkin !== "object") {
    setStatus("Load a skin before adding a shape.");
    return;
  }
  const selectedType = getSelectedShapeTypeValue();
  if (!selectedType) {
    setStatus("Select an object Shape/Type before adding.");
    return;
  }
  if (selectedType === "flattened") {
    updateAddShapeButtonState();
    setStatus("Flattened objects are created only with the Flatten button.");
    return;
  }
  const typedName = refs.newShapeName instanceof HTMLInputElement
    ? refs.newShapeName.value
    : "";
  const baseKey = normalizeObjectKey(typedName);
  if (!baseKey) {
    setStatus("Enter an object name before adding.");
    return;
  }
  const nextKey = ensureUniqueObjectKey(baseKey);
  const preset = createShapePreset(selectedType);

  if (!state.activeSkin.objects || typeof state.activeSkin.objects !== "object") {
    state.activeSkin.objects = {};
  }
  state.activeSkin.objects[nextKey] = preset;
  state.selectedObjectKey = nextKey;
  state.selectedObjectKeys = [nextKey];
  if (refs.newShapeName instanceof HTMLInputElement) {
    refs.newShapeName.value = nextKey;
  }
  updateEditorFromState("visual-editor");
  renderWorkbench();
  setStatus(`Added '${nextKey}'.`);
}

function renameObjectFromControls() {
  if (!state.activeSkin || typeof state.activeSkin !== "object") {
    setStatus("Load a skin before renaming an object.");
    return;
  }
  const selectedKey = normalizeText(state.selectedObjectKey);
  if (!selectedKey) {
    setStatus("Select an object to rename.");
    return;
  }
  const typedName = refs.newShapeName instanceof HTMLInputElement
    ? refs.newShapeName.value
    : "";
  const nextKey = normalizeObjectKey(typedName);
  if (!nextKey) {
    setStatus("Enter a valid object name before renaming.");
    return;
  }
  if (!state.activeSkin.objects || typeof state.activeSkin.objects !== "object") {
    state.activeSkin.objects = {};
  }
  const objects = state.activeSkin.objects;
  if (!Object.prototype.hasOwnProperty.call(objects, selectedKey)) {
    setStatus("Selected object no longer exists.");
    return;
  }
  if (nextKey === selectedKey) {
    setStatus(`Already named '${selectedKey}'.`);
    return;
  }
  if (Object.prototype.hasOwnProperty.call(objects, nextKey)) {
    setStatus(`'${nextKey}' already exists. Choose a different name.`);
    return;
  }
  objects[nextKey] = objects[selectedKey];
  delete objects[selectedKey];
  state.selectedObjectKey = nextKey;
  state.selectedObjectKeys = state.selectedObjectKeys.map((key) => (key === selectedKey ? nextKey : key));
  if (refs.newShapeName instanceof HTMLInputElement) {
    refs.newShapeName.value = nextKey;
  }
  updateEditorFromState("visual-editor");
  renderWorkbench();
  setStatus(`Renamed '${selectedKey}' to '${nextKey}'.`);
}

function deleteObjectFromControls() {
  if (!state.activeSkin || typeof state.activeSkin !== "object") {
    setStatus("Load a skin before deleting.");
    return;
  }
  const selectedKey = normalizeText(state.selectedObjectKey);
  if (!selectedKey) {
    setStatus("Select an item to delete.");
    return;
  }
  if (!state.activeSkin.objects || typeof state.activeSkin.objects !== "object") {
    state.activeSkin.objects = {};
  }
  const objects = state.activeSkin.objects;
  if (!Object.prototype.hasOwnProperty.call(objects, selectedKey)) {
    setStatus("Selected item no longer exists.");
    return;
  }
  delete objects[selectedKey];
  state.selectedObjectKeys = state.selectedObjectKeys.filter((key) => key !== selectedKey);
  const nextKey = Object.keys(objects)[0] || "";
  state.selectedObjectKey = nextKey;
  if (nextKey && !state.selectedObjectKeys.includes(nextKey)) {
    state.selectedObjectKeys = [...state.selectedObjectKeys, nextKey];
  }
  if (refs.newShapeName instanceof HTMLInputElement) {
    refs.newShapeName.value = nextKey;
  }
  updateEditorFromState("visual-editor");
  renderWorkbench();
  setStatus(`Deleted '${selectedKey}'.`);
}

function moveSelectedObjectByOffset(offset) {
  if (!state.activeSkin || typeof state.activeSkin !== "object") {
    setStatus("Load a skin before reordering objects.");
    return;
  }
  if (!state.activeSkin.objects || typeof state.activeSkin.objects !== "object") {
    state.activeSkin.objects = {};
  }

  const objects = state.activeSkin.objects;
  const keys = Object.keys(objects);
  const selectedKey = normalizeText(state.selectedObjectKey);
  if (!selectedKey) {
    setStatus("Select an object before reordering.");
    return;
  }
  const selectedIndex = keys.indexOf(selectedKey);
  if (selectedIndex < 0) {
    setStatus("Selected object no longer exists.");
    return;
  }

  const targetIndex = selectedIndex + offset;
  if (targetIndex < 0 || targetIndex >= keys.length) {
    const boundaryLabel = offset < 0 ? "top" : "bottom";
    setStatus(`'${selectedKey}' is already at the ${boundaryLabel} of the object order.`);
    updateObjectOrderButtonState();
    return;
  }

  const nextKeys = [...keys];
  const [movedKey] = nextKeys.splice(selectedIndex, 1);
  nextKeys.splice(targetIndex, 0, movedKey);

  const nextObjects = {};
  nextKeys.forEach((key) => {
    nextObjects[key] = objects[key];
  });
  state.activeSkin.objects = nextObjects;

  const selectedSet = new Set(getValidSelectedObjectKeys());
  state.selectedObjectKeys = nextKeys.filter((key) => selectedSet.has(key));

  updateEditorFromState("visual-editor");
  renderWorkbench();
  setStatus(`Moved '${selectedKey}' ${offset < 0 ? "up" : "down"} in object order.`);
}

function flattenSelectedObjects() {
  if (!state.activeSkin || typeof state.activeSkin !== "object") {
    setStatus("Load a skin before flattening.");
    return;
  }
  if (!state.activeSkin.objects || typeof state.activeSkin.objects !== "object") {
    state.activeSkin.objects = {};
  }
  const objects = state.activeSkin.objects;
  const selectedKeys = getSelectedObjectKeysInObjectOrder()
    .filter((key) => Object.prototype.hasOwnProperty.call(objects, key));
  state.selectedObjectKeys = selectedKeys;
  updateFlattenButtonState();
  if (selectedKeys.length < 2) {
    setStatus("Select at least 2 objects to flatten.");
    return;
  }

  const typedName = refs.newShapeName instanceof HTMLInputElement ? refs.newShapeName.value : "";
  const baseKey = normalizeObjectKey(typedName) || "flattened";
  const nextKey = ensureUniqueObjectKey(baseKey);
  const firstColor = selectedKeys
    .map((key) => toObject(objects[key]))
    .map((entry) => (parseHexForPicker(entry.color) ? normalizeText(entry.color) : ""))
    .find((entry) => Boolean(entry)) || "#f8f8f2";
  const components = selectedKeys.map((key) => ({
    name: key,
    ...deepClone(toObject(objects[key]))
  }));

  selectedKeys.forEach((key) => {
    delete objects[key];
  });
  objects[nextKey] = {
    shape: "flattened",
    color: firstColor,
    components
  };
  state.selectedObjectKey = "";
  state.selectedObjectKeys = [];
  state.skipAutoSelectOnce = true;
  if (refs.newShapeName instanceof HTMLInputElement) {
    refs.newShapeName.value = "";
  }
  updateEditorFromState("visual-editor");
  renderWorkbench();
  setStatus(`Flattened ${selectedKeys.length} objects into '${nextKey}'.`);
}

function extractPresetPayload(rawPreset) {
  if (!rawPreset || typeof rawPreset !== "object") {
    return {};
  }
  const payload = rawPreset.payload && typeof rawPreset.payload === "object"
    ? rawPreset.payload
    : rawPreset;
  return payload && typeof payload === "object" ? payload : {};
}

async function loadPresetFromQuery() {
  const searchParams = new URLSearchParams(window.location.search);
  const requestedGameId = normalizeText(searchParams.get("gameId") || searchParams.get("game"));
  const samplePresetPath = normalizeSamplePresetPath(searchParams.get("samplePresetPath"));
  if (!samplePresetPath) {
    return {
      gameId: requestedGameId,
      presetLoaded: false
    };
  }

  try {
    const presetUrl = new URL(samplePresetPath, window.location.href);
    const response = await fetch(presetUrl.toString(), { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Preset request failed (${response.status}).`);
    }
    const rawPreset = await response.json();
    const payload = extractPresetPayload(rawPreset);
    state.presetSkin = payload.skin && typeof payload.skin === "object" ? payload.skin : null;
    const gameId = normalizeText(payload.gameId || requestedGameId);
    return {
      gameId,
      presetLoaded: true
    };
  } catch (error) {
    setStatus(`Preset load failed: ${error instanceof Error ? error.message : "unknown error"}`);
    return {
      gameId: requestedGameId,
      presetLoaded: false
    };
  }
}

function bindEvents() {
  updateAddShapeButtonState();
  updateFlattenButtonState();
  updateObjectOrderButtonState();
  if (refs.saveOverrideButton instanceof HTMLButtonElement) {
    refs.saveOverrideButton.disabled = true;
    refs.saveOverrideButton.title = "Disabled: source-of-truth workspace JSON only.";
  }
  if (refs.clearOverrideButton instanceof HTMLButtonElement) {
    refs.clearOverrideButton.disabled = true;
    refs.clearOverrideButton.title = "Disabled: source-of-truth workspace JSON only.";
  }
  refs.loadButton?.addEventListener("click", () => {
    void loadActiveSkinForSelectedGame();
  });
  refs.saveOverrideButton?.addEventListener("click", () => {
    void applySkinOverride();
  });
  refs.clearOverrideButton?.addEventListener("click", () => {
    void clearSkinOverride();
  });
  refs.exportButton?.addEventListener("click", exportSkinJson);
  refs.openGameButton?.addEventListener("click", openSelectedGame);
  refs.howToUseButton?.addEventListener("click", () => {
    window.location.href = "./how_to_use.html";
  });
  refs.newShapeType?.addEventListener("change", () => {
    updateAddShapeButtonState();
  });
  refs.syncVisualButton?.addEventListener("click", syncVisualFromJson);
  refs.addShapeButton?.addEventListener("click", addShapeFromControls);
  refs.renameObjectButton?.addEventListener("click", renameObjectFromControls);
  refs.deleteObjectButton?.addEventListener("click", deleteObjectFromControls);
  refs.moveObjectUpButton?.addEventListener("click", () => {
    moveSelectedObjectByOffset(-1);
  });
  refs.moveObjectDownButton?.addEventListener("click", () => {
    moveSelectedObjectByOffset(1);
  });
  refs.flattenObjectsButton?.addEventListener("click", flattenSelectedObjects);
  refs.importInput?.addEventListener("change", (event) => {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const file = input.files && input.files[0];
    if (file) {
      void importSkinJsonFromFile(file);
    }
    input.value = "";
  });
  window.addEventListener("resize", () => {
    drawSelectedObjectPreview();
  });
}

async function bootSkinEditor() {
  const { gameId, presetLoaded } = await loadPresetFromQuery();
  const resolvedGame = resolveActiveGameOption(gameId);
  bindEvents();
  if (!resolvedGame) {
    setStatus("Missing game context. Launch Skin Editor from a game/workspace link that includes a valid gameId.");
    updateFlattenButtonState();
    renderPaletteList();
    return;
  }
  await loadActiveSkinForSelectedGame();
  if (!readSharedPaletteHandoff()) {
    setStatus("Shared palette is required. Open Palette Browser and use 'Use in Workspace Manager' first.");
    return;
  }
  if (presetLoaded) {
    setStatus("Loaded game preset. Object workbench is ready.");
  }
}

registerToolBootContract("skin-editor", {
  init: bootSkinEditor,
  destroy() {
    return true;
  },
  getApi() {
    return {
      loadActiveSkinForSelectedGame,
      applySkinOverride,
      clearSkinOverride
    };
  }
});

void bootSkinEditor();
