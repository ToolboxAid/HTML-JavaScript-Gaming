import { safeParseJson, toPrettyJson } from "../shared/debugInspectorData.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";
import {
  clearGameSkinOverride,
  loadGameSkin,
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
  gameSelect: document.getElementById("skinEditorGameSelect"),
  loadButton: document.getElementById("skinEditorLoadButton"),
  saveOverrideButton: document.getElementById("skinEditorSaveOverrideButton"),
  clearOverrideButton: document.getElementById("skinEditorClearOverrideButton"),
  importInput: document.getElementById("skinEditorImportInput"),
  exportButton: document.getElementById("skinEditorExportButton"),
  openGameButton: document.getElementById("skinEditorOpenGameButton"),
  howToUseButton: document.getElementById("skinEditorHowToUseButton"),
  statusText: document.getElementById("skinEditorStatus"),
  input: document.getElementById("skinEditorInput"),
  summary: document.getElementById("skinEditorSummary")
};

const state = {
  presetSkinPath: "",
  presetSkin: null
};

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
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
  if (!(refs.gameSelect instanceof HTMLSelectElement)) {
    return null;
  }
  return getGameOptionById(refs.gameSelect.value);
}

function setStatus(message) {
  if (refs.statusText instanceof HTMLElement) {
    refs.statusText.textContent = message;
  }
}

function setSummary(payload) {
  if (!(refs.summary instanceof HTMLElement)) {
    return;
  }
  refs.summary.textContent = payload;
}

function formatSummary(game, source, skinDocument) {
  const colors = skinDocument && typeof skinDocument.colors === "object" ? skinDocument.colors : {};
  const sizing = skinDocument && typeof skinDocument.sizing === "object" ? skinDocument.sizing : {};
  const entities = skinDocument && typeof skinDocument.entities === "object" ? skinDocument.entities : {};
  const topColorKeys = Object.keys(colors);
  const topSizingKeys = Object.keys(sizing);
  const topEntityKeys = Object.keys(entities);
  return [
    `Game: ${game.label}`,
    `Source: ${source}`,
    `Schema: ${normalizeText(skinDocument?.schema) || "(missing)"}`,
    `Document Kind: ${normalizeText(skinDocument?.documentKind) || "(missing)"}`,
    `Color Keys: ${topColorKeys.length ? topColorKeys.join(", ") : "none"}`,
    `Sizing Keys: ${topSizingKeys.length ? topSizingKeys.join(", ") : "none"}`,
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
  const source = parsedSkin && typeof parsedSkin === "object" ? parsedSkin : {};
  return {
    ...source,
    documentKind: "game-skin",
    version: Number.isFinite(Number(source.version)) ? Number(source.version) : 1,
    schema: normalizeText(source.schema) || game.fallbackSchema,
    gameId: game.id,
    name: normalizeText(source.name) || `${game.label} Skin`
  };
}

async function loadActiveSkinForSelectedGame() {
  const game = getSelectedGameOption();
  if (!game) {
    setStatus("Select a supported game.");
    return;
  }
  const fallbackSkin = {
    documentKind: "game-skin",
    version: 1,
    schema: game.fallbackSchema,
    gameId: game.id,
    name: `${game.label} Skin`,
    colors: {},
    sizing: {},
    entities: {}
  };

  const result = await loadGameSkin({
    gameId: game.id,
    defaultSkinPath: state.presetSkinPath || game.defaultSkinPath,
    fallbackSkin,
    fallbackSchema: game.fallbackSchema
  });

  const shouldUsePreset = state.presetSkin
    && normalizeText(state.presetSkin.gameId).toLowerCase() === game.id.toLowerCase();
  const loadedSkin = shouldUsePreset
    ? buildNormalizedSkinDocument(game, state.presetSkin)
    : buildNormalizedSkinDocument(game, result.skin);
  if (shouldUsePreset) {
    state.presetSkin = null;
  }

  if (refs.input instanceof HTMLTextAreaElement) {
    refs.input.value = toPrettyJson(loadedSkin);
  }
  setSummary(formatSummary(game, state.presetSkin ? "preset" : result.source, loadedSkin));
  setStatus(`Loaded active skin for ${game.label}.`);
}

async function applySkinOverride() {
  const game = getSelectedGameOption();
  if (!game) {
    setStatus("Select a supported game.");
    return;
  }
  const parsed = parseEditorSkin();
  if (!parsed) {
    setStatus("Skin JSON is invalid.");
    return;
  }

  const normalized = buildNormalizedSkinDocument(game, parsed);
  state.presetSkin = null;
  const saved = writeGameSkinOverride(game.id, normalized, { fallbackSchema: game.fallbackSchema });
  if (!saved) {
    setStatus("Unable to save override in this browser session.");
    return;
  }

  if (refs.input instanceof HTMLTextAreaElement) {
    refs.input.value = toPrettyJson(normalized);
  }
  setSummary(formatSummary(game, "local-storage", normalized));
  setStatus(`Saved override for ${game.label}. Open the game to verify live skin changes.`);
}

async function clearSkinOverride() {
  const game = getSelectedGameOption();
  if (!game) {
    setStatus("Select a supported game.");
    return;
  }
  clearGameSkinOverride(game.id);
  setStatus(`Cleared override for ${game.label}.`);
  await loadActiveSkinForSelectedGame();
}

function exportSkinJson() {
  const game = getSelectedGameOption();
  if (!game) {
    setStatus("Select a supported game.");
    return;
  }
  const parsed = parseEditorSkin();
  if (!parsed) {
    setStatus("Skin JSON is invalid.");
    return;
  }
  const normalized = buildNormalizedSkinDocument(game, parsed);
  downloadTextFile(toDownloadName(game.id), `${toPrettyJson(normalized)}\n`);
  setStatus(`Exported ${toDownloadName(game.id)}.`);
}

function openSelectedGame() {
  const game = getSelectedGameOption();
  if (!game) {
    setStatus("Select a supported game.");
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
  if (refs.input instanceof HTMLTextAreaElement) {
    refs.input.value = toPrettyJson(parsed);
  }
  setStatus("Imported skin JSON. Review and click Apply Skin Override.");
}

function populateGameSelect(initialGameId = "") {
  if (!(refs.gameSelect instanceof HTMLSelectElement)) {
    return;
  }
  refs.gameSelect.innerHTML = GAME_OPTIONS
    .map((game) => `<option value="${game.id}">${game.label}</option>`)
    .join("");

  const selected = getGameOptionById(initialGameId) || GAME_OPTIONS[0];
  refs.gameSelect.value = selected.id;
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
  refs.gameSelect?.addEventListener("change", () => {
    state.presetSkin = null;
    state.presetSkinPath = "";
    void loadActiveSkinForSelectedGame();
  });
}

async function bootSkinEditor() {
  const { gameId, presetLoaded } = await loadPresetFromQuery();
  populateGameSelect(gameId);
  bindEvents();
  await loadActiveSkinForSelectedGame();
  if (presetLoaded) {
    setStatus("Loaded game preset. Edit JSON and click Apply Skin Override.");
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
