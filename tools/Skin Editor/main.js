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
  colorList: document.getElementById("skinEditorColorList"),
  sizingList: document.getElementById("skinEditorSizingList"),
  entitiesList: document.getElementById("skinEditorEntitiesList"),
  previewCanvas: document.getElementById("skinEditorPreviewCanvas"),
  previewItemSelect: document.getElementById("skinEditorPreviewItemSelect"),
  focusedControls: document.getElementById("skinEditorFocusedControls"),
  previewNote: document.getElementById("skinEditorPreviewNote")
};

const state = {
  activeGameId: "",
  activeSkin: null,
  activeSource: "n/a",
  previewItem: "paddle",
  previewBrickIndex: 0,
  presetSkinPath: "",
  presetSkin: null
};
const BREAKOUT_BRICK_KEYS = Object.freeze(["brick1", "brick2", "brick3", "brick4", "brick5", "brick6"]);

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toObject(value) {
  return value && typeof value === "object" ? value : {};
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

function deepClone(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
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
    objects: deepClone(normalized?.objects && typeof normalized.objects === "object" ? normalized.objects : {}) || {},
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

function formatPath(path) {
  return path.reduce((result, segment) => {
    if (typeof segment === "number") {
      return `${result}[${segment}]`;
    }
    return result ? `${result}.${segment}` : segment;
  }, "");
}

function setValueAtPath(target, path, value) {
  if (!target || typeof target !== "object" || !Array.isArray(path) || path.length === 0) {
    return false;
  }
  let current = target;
  for (let index = 0; index < path.length - 1; index += 1) {
    const segment = path[index];
    const nextSegment = path[index + 1];
    if (current[segment] == null || typeof current[segment] !== "object") {
      current[segment] = typeof nextSegment === "number" ? [] : {};
    }
    current = current[segment];
  }
  current[path[path.length - 1]] = value;
  return true;
}

function getValueAtPath(target, path, fallbackValue = null) {
  if (!target || typeof target !== "object" || !Array.isArray(path) || path.length === 0) {
    return fallbackValue;
  }
  let current = target;
  for (let index = 0; index < path.length; index += 1) {
    const segment = path[index];
    if (current == null || typeof current !== "object" || !(segment in current)) {
      return fallbackValue;
    }
    current = current[segment];
  }
  return current;
}

function readFirstValue(paths = [], fallbackValue = null) {
  for (let index = 0; index < paths.length; index += 1) {
    const value = getValueAtPath(state.activeSkin, paths[index], undefined);
    if (value === undefined || value === null) {
      continue;
    }
    if (typeof value === "string" && !value.trim()) {
      continue;
    }
    return value;
  }
  return fallbackValue;
}

function readNumberValue(path, fallbackValue = 0) {
  const value = getValueAtPath(state.activeSkin, path, fallbackValue);
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallbackValue;
}

function readColorValue(path, fallbackValue = "#ffffff") {
  const value = normalizeText(getValueAtPath(state.activeSkin, path, fallbackValue));
  return value || fallbackValue;
}

function readNumberFromPaths(paths, fallbackValue = 0) {
  const value = readFirstValue(paths, fallbackValue);
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallbackValue;
}

function readColorFromPaths(paths, fallbackValue = "#ffffff") {
  const value = normalizeText(readFirstValue(paths, fallbackValue));
  return value || fallbackValue;
}

function getBreakoutBrickKeys() {
  const objects = state.activeSkin && typeof state.activeSkin.objects === "object" ? state.activeSkin.objects : {};
  const keys = BREAKOUT_BRICK_KEYS.filter((brickKey) => objects[brickKey] && typeof objects[brickKey] === "object");
  return keys.length ? keys : BREAKOUT_BRICK_KEYS.slice();
}

function collectLeafEntries(value, path, matcher, entries = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      collectLeafEntries(entry, [...path, index], matcher, entries);
    });
    return entries;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, entry]) => {
      collectLeafEntries(entry, [...path, key], matcher, entries);
    });
    return entries;
  }
  if (matcher(value)) {
    entries.push({ path, value });
  }
  return entries;
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

function setEmptyMessage(container, text) {
  if (!(container instanceof HTMLElement)) {
    return;
  }
  container.innerHTML = "";
  const note = document.createElement("p");
  note.className = "skin-editor-empty";
  note.textContent = text;
  container.appendChild(note);
}

function commitVisualValue(path, value) {
  if (!state.activeSkin || typeof state.activeSkin !== "object") {
    return;
  }
  setValueAtPath(state.activeSkin, path, value);
  updateEditorFromState("visual-editor");
  renderPreviewSuite();
}

function createBasicField(className, value) {
  const input = document.createElement("input");
  input.className = className;
  input.value = value;
  return input;
}

function setPreviewNote(message = "") {
  if (refs.previewNote instanceof HTMLElement) {
    refs.previewNote.textContent = message;
  }
}

function createFocusedNumberControl(labelText, path, options = {}) {
  const row = document.createElement("div");
  row.className = "skin-editor-row skin-editor-row--number";
  const label = document.createElement("span");
  label.className = "skin-editor-row-label";
  label.textContent = labelText;
  const currentValue = readNumberValue(path, options.fallback ?? 0);

  const slider = createBasicField("skin-editor-slider", String(currentValue));
  slider.type = "range";
  slider.min = String(options.min ?? 0);
  slider.max = String(options.max ?? Math.max(20, Math.ceil(Math.abs(currentValue) * 2) + 5));
  slider.step = options.step ?? numberStep(currentValue);

  const numberInput = createBasicField("skin-editor-field", String(currentValue));
  numberInput.type = "number";
  numberInput.step = String(options.step ?? numberStep(currentValue));
  numberInput.addEventListener("change", () => {
    const parsed = Number(numberInput.value);
    if (!Number.isFinite(parsed)) {
      return;
    }
    slider.value = String(parsed);
    commitVisualValue(path, parsed);
  });
  slider.addEventListener("input", () => {
    numberInput.value = slider.value;
    commitVisualValue(path, Number(slider.value));
  });

  row.appendChild(label);
  row.appendChild(slider);
  row.appendChild(numberInput);
  return row;
}

function createFocusedColorControl(labelText, path, fallbackColor = "#ffffff") {
  const row = document.createElement("div");
  row.className = "skin-editor-row";
  const label = document.createElement("span");
  label.className = "skin-editor-row-label";
  label.textContent = labelText;
  const currentColor = readColorValue(path, fallbackColor);
  const colorMeta = parseHexForPicker(currentColor);

  const picker = document.createElement("input");
  picker.className = "skin-editor-color-input";
  picker.type = "color";
  picker.disabled = !colorMeta;
  picker.value = colorMeta ? colorMeta.picker : "#ffffff";

  const colorText = createBasicField("skin-editor-field", currentColor);
  colorText.type = "text";
  colorText.addEventListener("change", () => {
    commitVisualValue(path, colorText.value);
  });
  picker.addEventListener("input", () => {
    const previous = parseHexForPicker(colorText.value) || colorMeta;
    const alphaSuffix = previous?.alpha || "";
    const nextValue = `${picker.value}${alphaSuffix}`;
    colorText.value = nextValue;
    commitVisualValue(path, nextValue);
  });

  row.appendChild(label);
  row.appendChild(picker);
  row.appendChild(colorText);
  return row;
}

function createFocusedBrickRowControl() {
  const row = document.createElement("div");
  row.className = "skin-editor-row skin-editor-row--brick-row";
  const label = document.createElement("span");
  label.className = "skin-editor-row-label";
  label.textContent = "brick object";

  const select = document.createElement("select");
  select.className = "skin-editor-field";
  const brickKeys = getBreakoutBrickKeys();
  const safeIndex = Math.max(0, Math.min(state.previewBrickIndex, Math.max(0, brickKeys.length - 1)));
  state.previewBrickIndex = safeIndex;
  for (let index = 0; index < brickKeys.length; index += 1) {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = brickKeys[index];
    select.appendChild(option);
  }
  select.value = String(safeIndex);
  select.addEventListener("change", () => {
    const parsed = Number(select.value);
    state.previewBrickIndex = Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
    renderPreviewSuite();
  });

  const spacer = document.createElement("div");
  row.appendChild(label);
  row.appendChild(select);
  row.appendChild(spacer);
  return row;
}

function drawBreakoutPreview() {
  if (!(refs.previewCanvas instanceof HTMLCanvasElement)) {
    return;
  }
  const context = refs.previewCanvas.getContext("2d");
  if (!context) {
    return;
  }
  const previewWidth = Math.max(420, refs.previewCanvas.clientWidth || refs.previewCanvas.width || 720);
  const previewHeight = 260;
  const deviceScale = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  refs.previewCanvas.width = previewWidth * deviceScale;
  refs.previewCanvas.height = previewHeight * deviceScale;
  context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
  context.clearRect(0, 0, previewWidth, previewHeight);

  const game = getSelectedGameOption();
  if (!game || game.id !== "Breakout" || !state.activeSkin) {
    context.fillStyle = "#0a0817";
    context.fillRect(0, 0, previewWidth, previewHeight);
    setPreviewNote("Live canvas drawing is currently available for Breakout skins.");
    return;
  }
  setPreviewNote("Breakout live preview updates as you edit.");

  const canvasPadding = 14;
  const playAreaX = canvasPadding;
  const playAreaY = canvasPadding;
  const playAreaWidth = previewWidth - canvasPadding * 2;
  const playAreaHeight = previewHeight - canvasPadding * 2;
  const wallThickness = 8;

  const background = readColorFromPaths([["objects", "background", "color"], ["colors", "background"]], "#000000");
  const wall = readColorFromPaths([["objects", "wall", "color"], ["colors", "wall"]], "#f8f8f2");
  const paddleColor = readColorFromPaths([["objects", "paddle", "color"], ["colors", "paddle"]], "#f8f8f2");
  const ballColor = readColorFromPaths([["objects", "ball", "color"], ["colors", "ball"]], "#f8f8f2");
  const brickKeys = getBreakoutBrickKeys();
  const brickObjects = brickKeys.map((brickKey) => toObject(getValueAtPath(state.activeSkin, ["objects", brickKey], {})));
  const brickGap = Math.max(2, readNumberFromPaths([["objects", "brickLayout", "gap"], ["objects", "brick", "gap"], ["sizing", "brickGap"]], 6));
  const paddleWidth = Math.max(20, readNumberFromPaths([["objects", "paddle", "width"], ["sizing", "paddleWidth"]], 118));
  const paddleHeight = Math.max(6, readNumberFromPaths([["objects", "paddle", "height"], ["sizing", "paddleHeight"]], 18));
  const ballSize = Math.max(6, readNumberFromPaths([["objects", "ball", "size"], ["sizing", "ballSize"]], 14));

  context.fillStyle = "#100a20";
  context.fillRect(0, 0, previewWidth, previewHeight);
  context.fillStyle = background;
  context.fillRect(playAreaX, playAreaY, playAreaWidth, playAreaHeight);

  context.strokeStyle = wall;
  context.lineWidth = wallThickness;
  context.strokeRect(
    playAreaX + wallThickness / 2,
    playAreaY + wallThickness / 2,
    playAreaWidth - wallThickness,
    playAreaHeight - wallThickness
  );

  const bricksStartX = playAreaX + 30;
  const bricksStartY = playAreaY + 30;
  let brickCursorX = bricksStartX;
  brickObjects.forEach((brickObject) => {
    const brickWidth = Math.max(12, Number(brickObject.width) || 78);
    const brickHeight = Math.max(8, Number(brickObject.height) || 24);
    const color = normalizeText(brickObject.color) || "#ff595e";
    const brickX = brickCursorX;
    const brickY = bricksStartY;
    context.fillStyle = color;
    context.fillRect(brickX, brickY, brickWidth, brickHeight);
    brickCursorX += brickWidth + brickGap;
  });

  const paddleX = playAreaX + (playAreaWidth - paddleWidth) / 2;
  const paddleY = playAreaY + playAreaHeight - paddleHeight - 22;
  context.fillStyle = paddleColor;
  context.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);

  const ballRadius = ballSize / 2;
  const ballX = playAreaX + playAreaWidth / 2;
  const ballY = paddleY - 24;
  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  context.fillStyle = ballColor;
  context.fill();

  context.strokeStyle = "rgba(255,255,255,0.9)";
  context.lineWidth = 2;
  if (state.previewItem === "paddle") {
    context.strokeRect(paddleX - 3, paddleY - 3, paddleWidth + 6, paddleHeight + 6);
  } else if (state.previewItem === "ball") {
    context.beginPath();
    context.arc(ballX, ballY, ballRadius + 4, 0, Math.PI * 2);
    context.stroke();
  } else if (state.previewItem === "brick") {
    const selectedIndex = Math.max(0, Math.min(state.previewBrickIndex, Math.max(0, brickObjects.length - 1)));
    let targetX = bricksStartX;
    for (let index = 0; index < selectedIndex; index += 1) {
      const priorWidth = Math.max(12, Number(brickObjects[index]?.width) || 78);
      targetX += priorWidth + brickGap;
    }
    const selectedWidth = Math.max(12, Number(brickObjects[selectedIndex]?.width) || 78);
    const selectedHeight = Math.max(8, Number(brickObjects[selectedIndex]?.height) || 24);
    context.strokeRect(targetX - 3, bricksStartY - 3, selectedWidth + 6, selectedHeight + 6);
  }
}

function renderFocusedControls() {
  if (!(refs.focusedControls instanceof HTMLElement)) {
    return;
  }
  refs.focusedControls.innerHTML = "";
  const game = getSelectedGameOption();
  if (!game || game.id !== "Breakout") {
    setEmptyMessage(refs.focusedControls, "Focused controls are currently available for Breakout.");
    if (refs.previewItemSelect instanceof HTMLSelectElement) {
      refs.previewItemSelect.disabled = true;
    }
    return;
  }
  if (refs.previewItemSelect instanceof HTMLSelectElement) {
    refs.previewItemSelect.disabled = false;
  }

  if (state.previewItem === "ball") {
    refs.focusedControls.appendChild(createFocusedNumberControl("ballSize", ["objects", "ball", "size"], { min: 6, max: 80, step: "1" }));
    refs.focusedControls.appendChild(createFocusedColorControl("ball color", ["objects", "ball", "color"], "#f8f8f2"));
    return;
  }

  if (state.previewItem === "brick") {
    const brickKeys = getBreakoutBrickKeys();
    const selectedBrickKey = brickKeys[Math.max(0, Math.min(state.previewBrickIndex, brickKeys.length - 1))] || "brick1";
    refs.focusedControls.appendChild(createFocusedBrickRowControl());
    refs.focusedControls.appendChild(createFocusedNumberControl(`${selectedBrickKey}.width`, ["objects", selectedBrickKey, "width"], { min: 12, max: 180, step: "1" }));
    refs.focusedControls.appendChild(createFocusedNumberControl(`${selectedBrickKey}.height`, ["objects", selectedBrickKey, "height"], { min: 8, max: 80, step: "1" }));
    refs.focusedControls.appendChild(createFocusedNumberControl("brickLayout.gap", ["objects", "brickLayout", "gap"], { min: 0, max: 24, step: "1" }));
    refs.focusedControls.appendChild(
      createFocusedColorControl(
        `${selectedBrickKey}.color`,
        ["objects", selectedBrickKey, "color"],
        "#ff595e"
      )
    );
    return;
  }

  refs.focusedControls.appendChild(createFocusedNumberControl("paddleWidth", ["objects", "paddle", "width"], { min: 20, max: 260, step: "1" }));
  refs.focusedControls.appendChild(createFocusedNumberControl("paddleHeight", ["objects", "paddle", "height"], { min: 6, max: 80, step: "1" }));
  refs.focusedControls.appendChild(createFocusedColorControl("paddle color", ["objects", "paddle", "color"], "#f8f8f2"));
}

function renderPreviewSuite() {
  drawBreakoutPreview();
  renderFocusedControls();
}

function renderColorControls() {
  if (!(refs.colorList instanceof HTMLElement)) {
    return;
  }
  refs.colorList.innerHTML = "";
  const objects = state.activeSkin && typeof state.activeSkin.objects === "object" ? state.activeSkin.objects : {};
  const entries = collectLeafEntries(objects, ["objects"], (value) => typeof value === "string");
  if (entries.length === 0) {
    setEmptyMessage(refs.colorList, "No color fields were found.");
    return;
  }

  entries.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "skin-editor-row";
    const pathLabel = document.createElement("span");
    pathLabel.className = "skin-editor-row-label";
    pathLabel.textContent = formatPath(entry.path.slice(1));

    const colorMeta = parseHexForPicker(entry.value);
    const picker = document.createElement("input");
    picker.className = "skin-editor-color-input";
    picker.type = "color";
    picker.disabled = !colorMeta;
    picker.value = colorMeta ? colorMeta.picker : "#000000";

    const textField = createBasicField("skin-editor-field", String(entry.value));
    textField.type = "text";
    textField.addEventListener("change", () => {
      commitVisualValue(entry.path, textField.value);
      const updatedMeta = parseHexForPicker(textField.value);
      if (updatedMeta) {
        picker.disabled = false;
        picker.value = updatedMeta.picker;
      } else {
        picker.disabled = true;
      }
    });
    picker.addEventListener("input", () => {
      const previous = parseHexForPicker(textField.value) || colorMeta;
      const alphaSuffix = previous?.alpha || "";
      const nextValue = `${picker.value}${alphaSuffix}`;
      textField.value = nextValue;
      commitVisualValue(entry.path, nextValue);
    });

    row.appendChild(pathLabel);
    row.appendChild(picker);
    row.appendChild(textField);
    refs.colorList.appendChild(row);
  });
}

function numberStep(value) {
  return Number.isInteger(value) ? "1" : "0.1";
}

function renderSizingControls() {
  if (!(refs.sizingList instanceof HTMLElement)) {
    return;
  }
  refs.sizingList.innerHTML = "";
  const objects = state.activeSkin && typeof state.activeSkin.objects === "object" ? state.activeSkin.objects : {};
  const entries = collectLeafEntries(objects, ["objects"], (value) => typeof value === "number" && Number.isFinite(value));
  if (entries.length === 0) {
    setEmptyMessage(refs.sizingList, "No numeric sizing fields were found.");
    return;
  }

  entries.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "skin-editor-row skin-editor-row--number";
    const label = document.createElement("span");
    label.className = "skin-editor-row-label";
    label.textContent = formatPath(entry.path.slice(1));

    const slider = createBasicField("skin-editor-slider", String(entry.value));
    slider.type = "range";
    slider.min = "0";
    slider.max = String(Math.max(10, Math.ceil(Math.abs(entry.value) * 2) + 5));
    slider.step = numberStep(entry.value);

    const numeric = createBasicField("skin-editor-field", String(entry.value));
    numeric.type = "number";
    numeric.step = numberStep(entry.value);
    numeric.addEventListener("change", () => {
      const parsed = Number(numeric.value);
      if (!Number.isFinite(parsed)) {
        return;
      }
      slider.value = String(parsed);
      commitVisualValue(entry.path, parsed);
    });
    slider.addEventListener("input", () => {
      numeric.value = slider.value;
      commitVisualValue(entry.path, Number(slider.value));
    });

    row.appendChild(label);
    row.appendChild(slider);
    row.appendChild(numeric);
    refs.sizingList.appendChild(row);
  });
}

function appendEntityField(groupContainer, path, value) {
  const row = document.createElement("div");
  const suffix = path.slice(2);
  const label = document.createElement("span");
  label.className = "skin-editor-row-label";
  label.textContent = formatPath(suffix);

  if (typeof value === "number" && Number.isFinite(value)) {
    row.className = "skin-editor-row skin-editor-row--number";
    const slider = createBasicField("skin-editor-slider", String(value));
    slider.type = "range";
    slider.min = "0";
    slider.max = String(Math.max(10, Math.ceil(Math.abs(value) * 2) + 5));
    slider.step = numberStep(value);
    const numeric = createBasicField("skin-editor-field", String(value));
    numeric.type = "number";
    numeric.step = numberStep(value);
    numeric.addEventListener("change", () => {
      const parsed = Number(numeric.value);
      if (!Number.isFinite(parsed)) {
        return;
      }
      slider.value = String(parsed);
      commitVisualValue(path, parsed);
    });
    slider.addEventListener("input", () => {
      numeric.value = slider.value;
      commitVisualValue(path, Number(slider.value));
    });
    row.appendChild(label);
    row.appendChild(slider);
    row.appendChild(numeric);
    groupContainer.appendChild(row);
    return;
  }

  if (typeof value === "boolean") {
    row.className = "skin-editor-row";
    const spacer = document.createElement("div");
    const checkboxWrap = document.createElement("div");
    checkboxWrap.className = "skin-editor-checkbox-wrap";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "skin-editor-checkbox";
    checkbox.checked = value;
    checkbox.addEventListener("change", () => {
      commitVisualValue(path, checkbox.checked);
    });
    checkboxWrap.appendChild(checkbox);
    row.appendChild(label);
    row.appendChild(checkboxWrap);
    row.appendChild(spacer);
    groupContainer.appendChild(row);
    return;
  }

  if (typeof value === "string") {
    row.className = "skin-editor-row";
    const colorMeta = parseHexForPicker(value);
    const picker = document.createElement("input");
    picker.className = "skin-editor-color-input";
    picker.type = "color";
    picker.disabled = !colorMeta;
    picker.value = colorMeta ? colorMeta.picker : "#000000";
    const textField = createBasicField("skin-editor-field", value);
    textField.type = "text";
    textField.addEventListener("change", () => {
      commitVisualValue(path, textField.value);
      const updatedMeta = parseHexForPicker(textField.value);
      if (updatedMeta) {
        picker.disabled = false;
        picker.value = updatedMeta.picker;
      } else {
        picker.disabled = true;
      }
    });
    picker.addEventListener("input", () => {
      const previous = parseHexForPicker(textField.value) || colorMeta;
      const alphaSuffix = previous?.alpha || "";
      const nextValue = `${picker.value}${alphaSuffix}`;
      textField.value = nextValue;
      commitVisualValue(path, nextValue);
    });
    row.appendChild(label);
    row.appendChild(picker);
    row.appendChild(textField);
    groupContainer.appendChild(row);
    return;
  }
}

function renderEntityControls() {
  if (!(refs.entitiesList instanceof HTMLElement)) {
    return;
  }
  refs.entitiesList.innerHTML = "";
  const entities = state.activeSkin && typeof state.activeSkin.entities === "object" ? state.activeSkin.entities : {};
  const groupEntries = Object.entries(entities);
  if (groupEntries.length === 0) {
    setEmptyMessage(refs.entitiesList, "No entity fields were found.");
    return;
  }

  groupEntries.forEach(([groupName, groupValue], index) => {
    const details = document.createElement("details");
    details.className = "skin-editor-entity-group";
    details.open = index === 0;
    const summary = document.createElement("summary");
    summary.textContent = groupName;
    details.appendChild(summary);

    const fieldsWrap = document.createElement("div");
    fieldsWrap.className = "skin-editor-entity-fields";
    const entries = collectLeafEntries(
      groupValue,
      ["entities", groupName],
      (value) => ["string", "number", "boolean"].includes(typeof value)
    );
    if (entries.length === 0) {
      const note = document.createElement("p");
      note.className = "skin-editor-empty";
      note.textContent = "No editable fields in this group.";
      fieldsWrap.appendChild(note);
    } else {
      entries.forEach((entry) => {
        appendEntityField(fieldsWrap, entry.path, entry.value);
      });
    }
    details.appendChild(fieldsWrap);
    refs.entitiesList.appendChild(details);
  });
}

function renderVisualEditor() {
  renderColorControls();
  renderSizingControls();
  renderEntityControls();
}

function setCurrentSkinDocument(rawSkin, source = "loaded") {
  const game = getSelectedGameOption();
  if (!game) {
    return;
  }
  const normalized = toObjectCentricSkinDocument(game, rawSkin);
  state.activeSkin = deepClone(normalized) || normalized;
  updateEditorFromState(source);
  renderVisualEditor();
  renderPreviewSuite();
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
  refs.previewItemSelect?.addEventListener("change", (event) => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }
    state.previewItem = normalizeText(target.value) || "paddle";
    renderPreviewSuite();
  });
  window.addEventListener("resize", () => {
    drawBreakoutPreview();
  });
}

async function bootSkinEditor() {
  const { gameId, presetLoaded } = await loadPresetFromQuery();
  resolveActiveGameOption(gameId);
  if (refs.previewItemSelect instanceof HTMLSelectElement) {
    refs.previewItemSelect.value = state.previewItem;
  }
  bindEvents();
  await loadActiveSkinForSelectedGame();
  if (presetLoaded) {
    setStatus("Loaded game preset. Visual controls are ready.");
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
