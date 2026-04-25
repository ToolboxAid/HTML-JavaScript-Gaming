import { safeParseJson, toPrettyJson } from "../shared/debugInspectorData.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";
import {
  clearGameSkinOverride,
  loadGameSkin,
  normalizeGameSkinDocument,
  writeGameSkinOverride
} from "/games/shared/gameSkinLoader.js";

const GAME_OPTIONS = Object.freeze([
  {
    id: "Breakout",
    label: "Breakout",
    gameHref: "/games/Breakout/index.html",
    defaultSkinPath: "/games/Breakout/assets/skins/default.json",
    fallbackSchema: "games.breakout.skin/1"
  },
  {
    id: "Pong",
    label: "Pong",
    gameHref: "/games/Pong/index.html",
    defaultSkinPath: "/games/Pong/assets/skins/default.json",
    fallbackSchema: "games.pong.skin/1"
  },
  {
    id: "SolarSystem",
    label: "Solar System",
    gameHref: "/games/SolarSystem/index.html",
    defaultSkinPath: "/games/SolarSystem/assets/skins/default.json",
    fallbackSchema: "games.solar-system.skin/1"
  },
  {
    id: "Bouncing-ball",
    label: "Bouncing Ball",
    gameHref: "/games/Bouncing-ball/index.html",
    defaultSkinPath: "/games/Bouncing-ball/assets/skins/default.json",
    fallbackSchema: "games.bouncing-ball.skin/1"
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
  presetSkinPath: "",
  presetSkin: null,
  selectedObjectKey: "",
  selectedObjectKeys: [],
  selectedColorSwatch: ""
};

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
  return getGameOptionById(state.activeGameId) || GAME_OPTIONS[0] || null;
}

function resolveActiveGameOption(initialGameId = "") {
  const selected = getGameOptionById(initialGameId) || GAME_OPTIONS[0] || null;
  state.activeGameId = selected ? selected.id : "";
  return selected;
}

function getObjectKeys() {
  const objects = toObject(state.activeSkin?.objects);
  return Object.keys(objects);
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
    fallbackSchema: game.fallbackSchema
  }) || {
    documentKind: "game-skin",
    version: 1,
    schema: game.fallbackSchema,
    gameId: game.id,
    name: `${game.label} Skin`,
    objects: {},
    entities: {}
  };
}

function toObjectCentricSkinDocument(game, rawSkin) {
  const normalized = buildNormalizedSkinDocument(game, rawSkin);
  return {
    documentKind: normalizeText(normalized?.documentKind) || "game-skin",
    version: Number.isFinite(Number(normalized?.version)) ? Number(normalized.version) : 1,
    schema: normalizeText(normalized?.schema) || game.fallbackSchema,
    gameId: normalizeText(normalized?.gameId) || game.id,
    name: normalizeText(normalized?.name) || `${game.label} Skin`,
    objects: deepClone(toObject(normalized?.objects)) || {},
    entities: {}
  };
}

function resolveCurrentSkinDocument({ allowStateFallback = true } = {}) {
  const game = getSelectedGameOption();
  if (!game) {
    return null;
  }
  const parsed = parseEditorSkin();
  if (parsed) {
    return toObjectCentricSkinDocument(game, parsed);
  }
  if (allowStateFallback && state.activeSkin && typeof state.activeSkin === "object") {
    return toObjectCentricSkinDocument(game, state.activeSkin);
  }
  return null;
}

function ensureSelectedObjectKey() {
  const keys = getObjectKeys();
  if (!keys.length) {
    state.selectedObjectKey = "";
    state.selectedObjectKeys = [];
    return;
  }
  if (!keys.includes(state.selectedObjectKey)) {
    state.selectedObjectKey = keys[0];
  }
  const normalizedSelection = Array.isArray(state.selectedObjectKeys)
    ? state.selectedObjectKeys.filter((key) => keys.includes(key))
    : [];
  if (!normalizedSelection.includes(state.selectedObjectKey)) {
    normalizedSelection.unshift(state.selectedObjectKey);
  }
  state.selectedObjectKeys = Array.from(new Set(normalizedSelection));
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

function toCamelSegments(value) {
  return normalizeText(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((entry) => Boolean(entry));
}

function toCamelCaseFromParts(parts) {
  if (!parts.length) {
    return "";
  }
  return parts
    .map((part, index) => (index === 0
      ? part
      : `${part.charAt(0).toUpperCase()}${part.slice(1)}`))
    .join("");
}

function normalizeHudColorName(value) {
  const allParts = toCamelSegments(value);
  const nonHudParts = allParts.filter((part, index) => !(index === 0 && part === "hud"));
  const suffix = toCamelCaseFromParts(nonHudParts) || "color";
  return `hud${suffix.charAt(0).toUpperCase()}${suffix.slice(1)}`;
}

function shouldEnforceHudName({ selectedType = "", currentKey = "", typedName = "" } = {}) {
  const type = normalizeText(selectedType).toLowerCase();
  const current = normalizeText(currentKey).toLowerCase();
  const typed = normalizeText(typedName).toLowerCase();
  return type === "hud-color" || current.startsWith("hud") || typed.startsWith("hud");
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
    return { color: "#f8f8f2" };
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
  if (type === "wall-3-sides") {
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
    return { color: "#f8f8f2", width: 140, height: 90 };
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
  const selectedObject = toObject(state.activeSkin?.objects?.[state.selectedObjectKey]);
  const shape = normalizeText(selectedObject.shape).toLowerCase();
  if (shape === "wall") {
    return "wall-3-sides";
  }
  if (shape && ["circle", "oval", "rectangle", "square", "polygon", "star", "ring", "hud-color"].includes(shape)) {
    return shape;
  }
  const hasSides = Number.isFinite(Number(selectedObject.sides));
  const hasRadius = Number.isFinite(Number(selectedObject.radius));
  const hasInner = Number.isFinite(Number(selectedObject.innerRadius));
  const hasOuter = Number.isFinite(Number(selectedObject.outerRadius));
  const hasWidth = Number.isFinite(Number(selectedObject.width));
  const hasHeight = Number.isFinite(Number(selectedObject.height));
  const hasThickness = Number.isFinite(Number(selectedObject.thickness));
  const hasWallFlags = ["left", "right", "top", "bottom"].some((key) => typeof selectedObject[key] === "boolean");
  const keyStartsHud = normalizeText(state.selectedObjectKey).toLowerCase().startsWith("hud");

  if (hasThickness && hasWallFlags) {
    return "wall-3-sides";
  }
  if (hasSides && hasOuter && hasInner) {
    return "star";
  }
  if (hasSides) {
    return "polygon";
  }
  if (hasOuter && hasInner) {
    return "ring";
  }
  if (hasRadius && hasWidth && hasHeight) {
    return "oval";
  }
  if (hasRadius) {
    return "circle";
  }
  if (hasWidth || hasHeight) {
    const width = Number(selectedObject.width) || Number(selectedObject.size) || 0;
    const height = Number(selectedObject.height) || Number(selectedObject.size) || 0;
    if (width > 0 && height > 0 && Math.abs(width - height) <= 0.001) {
      return "square";
    }
    return "rectangle";
  }
  if (keyStartsHud || (getSelectedObjectColorPropertyKeys().length > 0 && Object.keys(selectedObject).length <= 2)) {
    return "hud-color";
  }
  return "rectangle";
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
  const nextValue = typeof value === "number"
    ? clampNumericProperty(propertyKey, value)
    : value;
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
  const objects = toObject(state.activeSkin?.objects);
  const colorMap = new Map();
  Object.entries(objects).forEach(([objectKey, objectValue]) => {
    const shapeObject = toObject(objectValue);
    Object.entries(shapeObject).forEach(([propertyKey, propertyValue]) => {
      const color = typeof propertyValue === "string" ? normalizeText(propertyValue) : "";
      if (!parseHexForPicker(color)) {
        return;
      }
      const token = color.toLowerCase();
      if (!colorMap.has(token)) {
        colorMap.set(token, {
          id: `${objectKey}.${propertyKey}`,
          label: `${objectKey}.${propertyKey}`,
          color
        });
      }
    });
  });
  const swatches = Array.from(colorMap.values());

  if (!swatches.length) {
    const empty = document.createElement("p");
    empty.className = "skin-editor-empty";
    empty.textContent = "No object colors found.";
    refs.paletteList.appendChild(empty);
    return;
  }

  const paletteLabel = document.createElement("p");
  paletteLabel.className = "skin-editor-empty";
  paletteLabel.textContent = `Palette rebuilt from object colors (${swatches.length}).`;
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
    row.appendChild(chip);
    row.appendChild(label);
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

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "skin-editor-object-check";
    checkbox.checked = state.selectedObjectKeys.includes(objectKey);
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
  const entries = Object.entries(selectedObject);
  if (!selectedKey || entries.length === 0) {
    const note = document.createElement("p");
    note.className = "skin-editor-empty";
    note.textContent = "Select an object to edit its properties.";
    refs.objectControls.appendChild(note);
    return;
  }

  entries.forEach(([propertyKey, propertyValue]) => {
    if (propertyKey === "shape") {
      return;
    }
    if (typeof propertyValue === "number" && Number.isFinite(propertyValue)) {
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
      numeric.min = String(minValue);
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
  const backgroundColor = normalizeText(state.activeSkin?.objects?.background?.color);
  const sceneBackground = parseHexForPicker(backgroundColor) ? backgroundColor : "#120b24";

  context.clearRect(0, 0, previewWidth, previewHeight);
  context.fillStyle = sceneBackground;
  context.fillRect(0, 0, previewWidth, previewHeight);
  context.strokeStyle = "rgba(255,255,255,0.26)";
  context.lineWidth = 2;
  context.strokeRect(12, 12, previewWidth - 24, previewHeight - 24);

  if (!selectedKey) {
    setPreviewNote("Select an object from the left list to preview and edit.");
    return;
  }

  const drawColor = parseHexForPicker(selectedObject.color) ? selectedObject.color : "#f8f8f2";
  const shapeType = normalizeText(selectedObject.shape).toLowerCase();
  const centerX = Math.round(previewWidth / 2);
  const centerY = Math.round(previewHeight / 2);
  const width = Math.max(12, Number(selectedObject.width) || Number(selectedObject.size) || 120);
  const height = Math.max(12, Number(selectedObject.height) || Number(selectedObject.size) || 80);
  const radius = Math.max(6, Number(selectedObject.radius) || Number(selectedObject.size) || 40);
  const innerRadius = Math.max(4, Number(selectedObject.innerRadius) || 24);
  const outerRadius = Math.max(innerRadius + 4, Number(selectedObject.outerRadius) || 52);
  const polygonSides = Math.max(3, Math.round(Number(selectedObject.sides) || 6));
  const thickness = Math.max(1, Number(selectedObject.thickness) || 1);
  const hasRectProps = Number.isFinite(Number(selectedObject.width))
    || Number.isFinite(Number(selectedObject.height))
    || Number.isFinite(Number(selectedObject.size));
  const hasCircleProps = Number.isFinite(Number(selectedObject.radius))
    || Number.isFinite(Number(selectedObject.outerRadius))
    || Number.isFinite(Number(selectedObject.innerRadius));

  context.fillStyle = drawColor;

  if (shapeType === "flattened" && Array.isArray(selectedObject.components)) {
    const components = selectedObject.components
      .map((entry) => toObject(entry))
      .filter((entry) => Object.keys(entry).length > 0);
    if (!components.length) {
      context.fillRect(centerX - 60, centerY - 60, 120, 120);
    } else {
      components.forEach((component, index) => {
        const offsetX = ((index % 3) - 1) * 14;
        const offsetY = (Math.floor(index / 3) - 1) * 10;
        const componentColor = parseHexForPicker(component.color) ? component.color : drawColor;
        context.fillStyle = componentColor;
        const componentShape = normalizeText(component.shape).toLowerCase();
        const componentWidth = Math.max(10, Number(component.width) || Number(component.size) || 58);
        const componentHeight = Math.max(10, Number(component.height) || Number(component.size) || 40);
        const componentRadius = Math.max(6, Number(component.radius) || Number(component.size) || 20);
        if (componentShape === "star") {
          drawStarPath(context, centerX + offsetX, centerY + offsetY, Math.max(12, Number(component.outerRadius) || 24), Math.max(6, Number(component.innerRadius) || 12), Math.max(3, Number(component.sides) || 5));
          context.fill();
        } else if (componentShape === "polygon") {
          drawRegularPolygonPath(context, centerX + offsetX, centerY + offsetY, componentRadius, Math.max(3, Number(component.sides) || 6));
          context.fill();
        } else if (Number.isFinite(Number(component.radius))) {
          context.beginPath();
          context.arc(centerX + offsetX, centerY + offsetY, componentRadius, 0, Math.PI * 2);
          context.fill();
        } else {
          context.fillRect(
            Math.round(centerX + offsetX - componentWidth / 2),
            Math.round(centerY + offsetY - componentHeight / 2),
            Math.round(componentWidth),
            Math.round(componentHeight)
          );
        }
      });
      context.fillStyle = "#ffffff";
      context.font = "600 13px 'Segoe UI', sans-serif";
      context.fillText(`${components.length} merged objects`, 20, 44);
    }
  } else if (shapeType === "star") {
    drawStarPath(context, centerX, centerY, outerRadius, innerRadius, polygonSides);
    context.fill();
  } else if (shapeType === "polygon") {
    drawRegularPolygonPath(context, centerX, centerY, radius, polygonSides);
    context.fill();
  } else if (shapeType === "ring" || (Number.isFinite(Number(selectedObject.outerRadius)) && Number.isFinite(Number(selectedObject.innerRadius)))) {
    context.beginPath();
    context.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
    context.arc(centerX, centerY, innerRadius, 0, Math.PI * 2, true);
    context.fill();
  } else if (shapeType === "wall" || (Number.isFinite(Number(selectedObject.thickness)) && !hasRectProps && !hasCircleProps)) {
    const margin = 36;
    const usableWidth = Math.max(40, previewWidth - margin * 2);
    const usableHeight = Math.max(40, previewHeight - margin * 2);
    const drawTop = selectedObject.top !== false;
    const drawLeft = selectedObject.left !== false;
    const drawRight = selectedObject.right !== false;
    const drawBottom = selectedObject.bottom === true;
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
  } else if (Number.isFinite(Number(selectedObject.radius))) {
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.fill();
  } else if (hasRectProps) {
    if (Number.isFinite(Number(selectedObject.thickness))) {
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
  } else {
    context.fillRect(centerX - 60, centerY - 60, 120, 120);
  }

  context.fillStyle = "#ffffff";
  context.font = "700 18px 'Segoe UI', sans-serif";
  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillText(selectedKey, 20, 20);

  const descriptor = Object.entries(selectedObject)
    .filter(([, value]) => ["string", "number", "boolean"].includes(typeof value))
    .map(([key, value]) => `${key}: ${String(value)}`)
    .slice(0, 5)
    .join(" | ");
  setPreviewNote(descriptor || "Editing selected object.");
}

function renderWorkbench() {
  ensureSelectedObjectKey();
  syncSelectedObjectUiFromSelection();
  renderObjectList();
  renderPaletteList();
  renderObjectControls();
  drawSelectedObjectPreview();
}

function setCurrentSkinDocument(rawSkin, source = "loaded") {
  const game = getSelectedGameOption();
  if (!game) {
    return;
  }
  const normalized = sanitizePositiveDimensionsInDocument(toObjectCentricSkinDocument(game, rawSkin));
  state.activeSkin = deepClone(normalized) || normalized;
  state.selectedObjectKeys = [];
  updateEditorFromState(source);
  renderWorkbench();
}

async function loadActiveSkinForSelectedGame() {
  const game = getSelectedGameOption();
  if (!game) {
    setStatus("No supported game context was resolved.");
    return;
  }
  const fallbackSkin = {
    documentKind: "game-skin",
    version: 1,
    schema: game.fallbackSchema,
    gameId: game.id,
    name: `${game.label} Skin`,
    objects: {},
    entities: {}
  };

  let result;
  try {
    result = await loadGameSkin({
      gameId: game.id,
      defaultSkinPath: state.presetSkinPath || game.defaultSkinPath,
      fallbackSkin,
      fallbackSchema: game.fallbackSchema
    });
  } catch (error) {
    setStatus(`Skin load failed: ${error instanceof Error ? error.message : "unknown error"}`);
    return;
  }

  const shouldUsePreset = state.presetSkin
    && normalizeText(state.presetSkin.gameId).toLowerCase() === game.id.toLowerCase();
  const skinSource = shouldUsePreset ? "preset" : result.source;
  const loadedSkin = shouldUsePreset
    ? buildNormalizedSkinDocument(game, state.presetSkin)
    : buildNormalizedSkinDocument(game, result.skin);
  if (shouldUsePreset) {
    state.presetSkin = null;
  }

  setCurrentSkinDocument(loadedSkin, skinSource);
  setStatus(`Loaded active skin for ${game.label}.`);
}

async function applySkinOverride() {
  const game = getSelectedGameOption();
  if (!game) {
    setStatus("No supported game context was resolved.");
    return;
  }
  const normalized = resolveCurrentSkinDocument({ allowStateFallback: true });
  if (!normalized) {
    setStatus("Skin JSON is invalid.");
    return;
  }

  state.presetSkin = null;
  const saved = writeGameSkinOverride(game.id, normalized, { fallbackSchema: game.fallbackSchema });
  if (!saved) {
    setStatus("Unable to save override in this browser session.");
    return;
  }

  setCurrentSkinDocument(normalized, "local-storage");
  setStatus(`Saved override for ${game.label}. Open the game to verify live skin changes.`);
}

async function clearSkinOverride() {
  const game = getSelectedGameOption();
  if (!game) {
    setStatus("No supported game context was resolved.");
    return;
  }
  clearGameSkinOverride(game.id);
  setStatus(`Cleared override for ${game.label}.`);
  await loadActiveSkinForSelectedGame();
}

function exportSkinJson() {
  const game = getSelectedGameOption();
  if (!game) {
    setStatus("No supported game context was resolved.");
    return;
  }
  const normalized = resolveCurrentSkinDocument({ allowStateFallback: true });
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
  setCurrentSkinDocument(parsed, "import");
  setStatus("Imported skin JSON.");
}

function syncVisualFromJson() {
  const parsed = parseEditorSkin();
  if (!parsed) {
    setStatus("Skin JSON is invalid. Fix JSON and try Sync Visual From JSON.");
    return;
  }
  setCurrentSkinDocument(parsed, "json-input");
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
  const selectedType = refs.newShapeType instanceof HTMLSelectElement
    ? normalizeText(refs.newShapeType.value).toLowerCase()
    : "rectangle";
  const typedName = refs.newShapeName instanceof HTMLInputElement
    ? refs.newShapeName.value
    : "";
  const hudNameMode = shouldEnforceHudName({ selectedType, typedName });
  const baseKey = hudNameMode
    ? normalizeHudColorName(typedName)
    : (normalizeObjectKey(typedName) || selectedType || "shape");
  const nextKey = ensureUniqueObjectKey(baseKey, { preserveCase: hudNameMode });
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
  const nextKey = shouldEnforceHudName({ currentKey: selectedKey, typedName })
    ? normalizeHudColorName(typedName)
    : normalizeObjectKey(typedName);
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

function flattenSelectedObjects() {
  if (!state.activeSkin || typeof state.activeSkin !== "object") {
    setStatus("Load a skin before flattening.");
    return;
  }
  if (!state.activeSkin.objects || typeof state.activeSkin.objects !== "object") {
    state.activeSkin.objects = {};
  }
  const objects = state.activeSkin.objects;
  const selectedKeys = Array.from(
    new Set(state.selectedObjectKeys.filter((key) => Object.prototype.hasOwnProperty.call(objects, key)))
  );
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
  state.selectedObjectKey = nextKey;
  state.selectedObjectKeys = [nextKey];
  if (refs.newShapeName instanceof HTMLInputElement) {
    refs.newShapeName.value = nextKey;
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
  const samplePresetPath = normalizeSamplePresetPath(searchParams.get("samplePresetPath"));
  if (!samplePresetPath) {
    return {
      gameId: normalizeText(searchParams.get("gameId")),
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
    state.presetSkinPath = normalizeSamplePresetPath(payload.skinPath);
    state.presetSkin = payload.skin && typeof payload.skin === "object" ? payload.skin : null;
    const gameId = normalizeText(payload.gameId || searchParams.get("gameId"));
    return {
      gameId,
      presetLoaded: true
    };
  } catch (error) {
    setStatus(`Preset load failed: ${error instanceof Error ? error.message : "unknown error"}`);
    return {
      gameId: normalizeText(searchParams.get("gameId")),
      presetLoaded: false
    };
  }
}

function bindEvents() {
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
  refs.syncVisualButton?.addEventListener("click", syncVisualFromJson);
  refs.addShapeButton?.addEventListener("click", addShapeFromControls);
  refs.renameObjectButton?.addEventListener("click", renameObjectFromControls);
  refs.deleteObjectButton?.addEventListener("click", deleteObjectFromControls);
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
  resolveActiveGameOption(gameId);
  bindEvents();
  await loadActiveSkinForSelectedGame();
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
