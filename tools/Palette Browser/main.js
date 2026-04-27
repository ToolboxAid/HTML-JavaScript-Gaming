import {
  createPaletteHandoff,
  getSharedLaunchContext,
  getToolDisplayName,
  SHARED_PALETTE_HANDOFF_EVENT,
  readSharedPaletteHandoff,
  writeSharedPaletteHandoff
} from "../shared/assetUsageIntegration.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";
import {
  getToolLoadQuerySnapshot,
  getToolLoadRequestedDataPaths,
  summarizeToolLoadData,
  logToolLoadRequest,
  logToolLoadFetch,
  logToolLoadLoaded,
  logToolLoadWarning
} from "../shared/toolLoadDiagnostics.js";
import { detectWorkspaceDocument } from "../shared/documentModeGuards.js";
import {
  normalizePaletteDocument,
  validatePaletteDocument
} from "../shared/paletteDocumentContract.js";

const CUSTOM_PALETTES_STORAGE_KEY = "toolboxaid.paletteBrowser.customPalettes";
const HIDDEN_BUILTIN_PALETTES_STORAGE_KEY = "toolboxaid.paletteBrowser.hiddenBuiltins";

const refs = {
  searchInput: document.getElementById("paletteSearchInput"),
  launchContextText: document.getElementById("launchContextText"),
  countText: document.getElementById("paletteCountText"),
  paletteList: document.getElementById("paletteList"),
  paletteTitle: document.getElementById("paletteTitle"),
  paletteSummaryText: document.getElementById("paletteSummaryText"),
  paletteSwatches: document.getElementById("paletteSwatches"),
  paletteNameInput: document.getElementById("paletteNameInput"),
  swatchColorInput: document.getElementById("swatchColorInput"),
  swatchNameInput: document.getElementById("swatchNameInput"),
  swatchSymbolInput: document.getElementById("swatchSymbolInput"),
  newPaletteButton: document.getElementById("newPaletteButton"),
  duplicatePaletteButton: document.getElementById("duplicatePaletteButton"),
  renamePaletteButton: document.getElementById("renamePaletteButton"),
  deletePaletteButton: document.getElementById("deletePaletteButton"),
  addSwatchButton: document.getElementById("addSwatchButton"),
  deleteSwatchButton: document.getElementById("deleteSwatchButton"),
  validationText: document.getElementById("paletteValidationText"),
  selectionText: document.getElementById("paletteSelectionText"),
  jsonPreview: document.getElementById("paletteJsonPreview"),
  importPaletteJsonButton: document.getElementById("importPaletteJsonButton"),
  importPaletteJsonInput: document.getElementById("importPaletteJsonInput"),
  copyPaletteJsonButton: document.getElementById("copyPaletteJsonButton"),
  exportPaletteJsonButton: document.getElementById("exportPaletteJsonButton"),
  usePaletteButton: document.getElementById("usePaletteButton")
};

const state = {
  search: "",
  selectedPaletteId: "",
  selectedSwatchIndex: 0,
  customPalettes: loadCustomPalettes(),
  hiddenBuiltInPaletteIds: loadHiddenBuiltInPaletteIds()
};

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

function setSelectionText(text, options = {}) {
  const muted = options?.muted === true;
  refs.selectionText.textContent = String(text || "");
  refs.selectionText.classList.toggle("is-context-muted", muted);
}

function isWorkspaceContext() {
  if (typeof window === "undefined") {
    return false;
  }
  const searchParams = new URLSearchParams(window.location.search);
  const currentPath = window.location.pathname || "";
  const isHostedWorkspaceView = searchParams.get("hosted") === "1"
    || searchParams.has("hostToolId")
    || searchParams.has("hostContextId");
  const isWorkspaceManagerReferrer = /\/tools\/Workspace(?:%20| )Manager\//i.test(document.referrer || "");
  const isWorkspaceManagerParent = (() => {
    try {
      return window.top !== window
        && /\/tools\/Workspace(?:%20| )Manager\//i.test(window.top.location.pathname || "");
    } catch {
      return false;
    }
  })();
  return isHostedWorkspaceView
    || isWorkspaceManagerReferrer
    || isWorkspaceManagerParent
    || /\/tools\/Workspace%20Manager\//i.test(currentPath)
    || /\/tools\/Workspace Manager\//i.test(currentPath);
}

function hasDeleteOverrideParam() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("overridReserveWorkBlock")
    ?? params.get("overrideReserveWordBlock")
    ?? "";
  return /^(1|true|yes|on)$/i.test(raw.trim());
}

function applyLaunchContext() {
  const context = getSharedLaunchContext();
  const sourceLabel = context.sourceToolId
    ? getToolDisplayName(context.sourceToolId, context.sourceToolId)
    : "Shared Tools Surface";
  refs.launchContextText.textContent = context.view === "manage"
    ? `Manage Palettes launched from ${sourceLabel}. Built-in palettes remain shared references; local edits stay exportable and non-destructive.`
    : `Browse Palettes launched from ${sourceLabel}. Select a shared palette reference to hand back into the active tool.`;
}

function loadCustomPalettes() {
  if (isWorkspaceContext()) {
    return [];
  }
  try {
    const raw = localStorage.getItem(CUSTOM_PALETTES_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCustomPalettes() {
  if (isWorkspaceContext()) {
    return;
  }
  localStorage.setItem(CUSTOM_PALETTES_STORAGE_KEY, JSON.stringify(state.customPalettes));
}

function loadHiddenBuiltInPaletteIds() {
  if (isWorkspaceContext()) {
    return [];
  }
  try {
    const raw = localStorage.getItem(HIDDEN_BUILTIN_PALETTES_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((entry) => typeof entry === "string") : [];
  } catch {
    return [];
  }
}

function saveHiddenBuiltInPaletteIds() {
  if (isWorkspaceContext()) {
    return;
  }
  localStorage.setItem(HIDDEN_BUILTIN_PALETTES_STORAGE_KEY, JSON.stringify(state.hiddenBuiltInPaletteIds));
}

function getBuiltInPalettes() {
  if (isWorkspaceContext()) {
    return [];
  }
  const paletteSource = globalThis.palettesList && typeof globalThis.palettesList === "object"
    ? globalThis.palettesList
    : {};
  return Object.entries(paletteSource)
    .filter(([, entries]) => Array.isArray(entries))
    .map(([name, entries]) => ({
      id: `builtin:${name}`,
      name,
      source: "engine",
      swatches: entries.map((entry) => ({
        symbol: typeof entry?.symbol === "string" ? entry.symbol : "",
        hex: typeof entry?.hex === "string" ? entry.hex : "",
        name: typeof entry?.name === "string" ? entry.name : ""
      }))
    }))
    .filter((palette) => !state.hiddenBuiltInPaletteIds.includes(palette.id));
}

function getAllPalettes() {
  return [...getBuiltInPalettes(), ...state.customPalettes];
}

function getVisiblePalettes() {
  const query = state.search.trim().toLowerCase();
  return getAllPalettes().filter((palette) => {
    if (!query) {
      return true;
    }
    return palette.name.toLowerCase().includes(query);
  });
}

function getSelectedPalette() {
  return getAllPalettes().find((palette) => palette.id === state.selectedPaletteId) ?? null;
}

function normalizeHandoffEntries(colors) {
  if (!Array.isArray(colors)) {
    return [];
  }
  return colors
    .map((entry, index) => ({
      symbol: typeof entry?.symbol === "string" ? entry.symbol : "",
      hex: typeof entry?.hex === "string" ? entry.hex : "",
      name: typeof entry?.name === "string" ? entry.name : `Color ${index + 1}`
    }))
    .filter((entry) => /^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(entry.hex));
}

function findPaletteBySharedHandoff(handoff) {
  if (!handoff || typeof handoff !== "object") {
    return null;
  }
  const handoffPaletteId = String(handoff.paletteId || "").trim().toLowerCase();
  const handoffDisplayName = String(handoff.displayName || "").trim().toLowerCase();
  const palettes = getAllPalettes();
  if (handoffDisplayName) {
    const nameMatch = palettes.find((palette) => String(palette.name || "").trim().toLowerCase() === handoffDisplayName) ?? null;
    if (nameMatch) {
      return nameMatch;
    }
  }
  if (handoffPaletteId) {
    const directMatch = palettes.find((palette) => String(palette.id || "").trim().toLowerCase() === handoffPaletteId) ?? null;
    if (directMatch) {
      if (handoffDisplayName) {
        const directName = String(directMatch.name || "").trim().toLowerCase();
        if (directName !== handoffDisplayName) {
          return null;
        }
      }
      return directMatch;
    }
  }
  return null;
}

function createSharedPaletteMirror(handoff) {
  const displayName = String(handoff?.displayName || "").trim();
  const swatches = normalizeHandoffEntries(handoff?.colors);
  if (!displayName || swatches.length === 0) {
    return null;
  }
  const handoffPaletteId = String(handoff?.paletteId || "").trim();
  const customId = handoffPaletteId ? `shared:${handoffPaletteId}` : `shared:${displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const existingIndex = state.customPalettes.findIndex((palette) => palette.id === customId);
  const mirrorPalette = {
    id: customId,
    name: displayName,
    source: "workspace",
    swatches
  };
  if (existingIndex >= 0) {
    state.customPalettes[existingIndex] = mirrorPalette;
  } else {
    state.customPalettes.unshift(mirrorPalette);
  }
  saveCustomPalettes();
  return mirrorPalette;
}

function selectSharedPaletteFromHandoff() {
  const handoff = readSharedPaletteHandoff();
  if (!handoff) {
    return false;
  }
  const existingMatch = findPaletteBySharedHandoff(handoff);
  if (existingMatch?.id) {
    state.selectedPaletteId = existingMatch.id;
    return true;
  }
  const mirrored = createSharedPaletteMirror(handoff);
  if (!mirrored?.id) {
    return false;
  }
  state.selectedPaletteId = mirrored.id;
  return true;
}

function syncSelectionFromSharedHandoff(options = {}) {
  const shouldRender = options.render === true;
  const previousPaletteId = state.selectedPaletteId;
  const selected = selectSharedPaletteFromHandoff();
  if (!selected) {
    return false;
  }
  if (previousPaletteId !== state.selectedPaletteId) {
    state.selectedSwatchIndex = 0;
  }
  if (shouldRender) {
    renderPaletteList();
    renderSelectedPalette();
    renderStoredSelection();
  }
  return true;
}

function isCustomPalette(palette) {
  return Boolean(palette && palette.source === "custom");
}

function normalizePaletteNameForReservedCheck(name) {
  return String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isReadOnlyPalette(palette) {
  if (!palette) {
    return true;
  }
  if (!isCustomPalette(palette)) {
    return true;
  }
  const normalizedName = normalizePaletteNameForReservedCheck(palette.name);
  return normalizedName.includes("crayola")
    || normalizedName.includes("w3c")
    || normalizedName.includes("javascript");
}

function validatePalette(palette) {
  if (!palette) {
    return ["Select a palette to validate."];
  }
  const issues = [];
  const allNames = getAllPalettes().map((entry) => entry.name.trim().toLowerCase());
  const duplicateNameCount = allNames.filter((name) => name === palette.name.trim().toLowerCase()).length;
  if (!palette.name.trim()) {
    issues.push("Palette name is required.");
  } else if (duplicateNameCount > 1) {
    issues.push(`Duplicate palette name detected: ${palette.name}.`);
  }
  palette.swatches.forEach((entry, index) => {
    if (!/^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(entry.hex || "")) {
      issues.push(`Swatch ${index + 1} has an invalid hex value.`);
    }
    if (!String(entry.name || "").trim()) {
      issues.push(`Swatch ${index + 1} is missing a name.`);
    }
  });
  return issues;
}

function formatSwatchNameForDisplay(name) {
  return String(name || "Unnamed").replace(/([a-z0-9])([A-Z])/g, "$1\u200b$2");
}

function hasReservedPaletteKeyword(name) {
  const normalizedName = normalizePaletteNameForReservedCheck(name);
  return normalizedName.includes("crayola")
    || normalizedName.includes("w3c")
    || normalizedName.includes("javascript");
}

function renderPaletteList() {
  const palettes = getVisiblePalettes();
  refs.countText.textContent = `${palettes.length} palette${palettes.length === 1 ? "" : "s"}`;
  refs.paletteList.innerHTML = palettes.map((palette) => {
    const currentClass = palette.id === state.selectedPaletteId ? " is-current" : "";
    return `
      <button type="button" data-palette-id="${palette.id}" class="${currentClass.trim()}">
        <strong>${palette.name}</strong>
        <span>(${palette.swatches.length}) swatches | ${palette.source}</span>
      </button>
    `;
  }).join("");

  if (!palettes.some((palette) => palette.id === state.selectedPaletteId)) {
    state.selectedPaletteId = "";
  }
}

function renderSelectedPalette() {
  const palette = getSelectedPalette();
  const canUseInActiveTools = isWorkspaceContext();
  const existingSharedPalette = readSharedPaletteHandoff();
  if (!palette) {
    refs.paletteTitle.textContent = "Palette Preview";
    refs.paletteSummaryText.textContent = "Select a palette to inspect its swatches.";
    refs.paletteSwatches.innerHTML = "";
    refs.paletteNameInput.value = "";
    refs.paletteNameInput.disabled = true;
    refs.swatchColorInput.disabled = true;
    refs.swatchNameInput.disabled = true;
    refs.swatchSymbolInput.disabled = true;
    refs.renamePaletteButton.disabled = true;
    refs.deletePaletteButton.disabled = true;
    refs.addSwatchButton.disabled = true;
    refs.deleteSwatchButton.disabled = true;
    refs.usePaletteButton.disabled = true;
    refs.jsonPreview.textContent = "Palette JSON preview will appear here.";
    refs.validationText.textContent = "Validation summary will appear here.";
    return;
  }

  refs.paletteTitle.textContent = palette.name;
  refs.paletteSummaryText.textContent = `${palette.swatches.length} swatches | source: ${palette.source}`;
  refs.paletteNameInput.value = palette.name;
  const readOnly = isReadOnlyPalette(palette);
  const canOverrideDeleteGuard = hasDeleteOverrideParam();
  refs.paletteNameInput.disabled = readOnly;
  refs.swatchColorInput.disabled = readOnly;
  refs.swatchNameInput.disabled = readOnly;
  refs.swatchSymbolInput.disabled = readOnly;
  refs.renamePaletteButton.disabled = readOnly;
  refs.deletePaletteButton.disabled = canOverrideDeleteGuard ? false : readOnly;
  refs.addSwatchButton.disabled = readOnly;
  refs.deleteSwatchButton.disabled = readOnly;
  refs.usePaletteButton.disabled = !canUseInActiveTools;

  refs.paletteSwatches.innerHTML = palette.swatches.map((entry, index) => {
    const currentClass = index === state.selectedSwatchIndex ? " is-current" : "";
    return `
      <button type="button" data-swatch-index="${index}" class="${currentClass.trim()}">
        <span class="palette-browser__swatch-chip" style="background:${entry.hex}"></span>
        <strong class="palette-browser__swatch-name">${formatSwatchNameForDisplay(entry.name || "Unnamed")}</strong>
        <span>${entry.symbol || "-"}</span>
      </button>
    `;
  }).join("");

  state.selectedSwatchIndex = Math.min(state.selectedSwatchIndex, Math.max(0, palette.swatches.length - 1));
  const activeEntry = palette.swatches[state.selectedSwatchIndex] ?? palette.swatches[0] ?? null;
  refs.swatchColorInput.value = activeEntry && /^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(activeEntry.hex || "") ? activeEntry.hex.slice(0, 7) : "";
  refs.swatchNameInput.value = activeEntry?.name || "";
  refs.swatchSymbolInput.value = activeEntry?.symbol || "";

  const issues = validatePalette(palette);
  refs.validationText.textContent = issues.length === 0
    ? "Palette validation passed."
    : issues.join(" ");
  refs.jsonPreview.textContent = JSON.stringify(buildPaletteDocumentPayload(palette), null, 2);
}

function setSelectedPalette(paletteId) {
  state.selectedPaletteId = paletteId;
  state.selectedSwatchIndex = 0;
  renderPaletteList();
  renderSelectedPalette();
}

function createCustomPalette(name, swatches, source = "custom") {
  return {
    id: `custom:${Date.now().toString(36)}`,
    name,
    source: typeof source === "string" && source.trim() ? source.trim() : "custom",
    swatches: swatches.map((entry) => ({
      symbol: entry.symbol || "",
      hex: entry.hex || "#ffffff",
      name: entry.name || "Unnamed"
    }))
  };
}

function makeUniquePaletteName(baseName) {
  const seed = String(baseName || "").trim();
  if (!seed) {
    throw new Error("Palette name is required.");
  }
  const normalizedSeed = seed.toLowerCase();
  const existing = new Set(getAllPalettes().map((palette) => String(palette.name || "").trim().toLowerCase()));
  if (!existing.has(normalizedSeed)) {
    return seed;
  }
  let index = 2;
  while (index < 1000) {
    const candidate = `${seed}-${index}`;
    if (!existing.has(candidate.toLowerCase())) {
      return candidate;
    }
    index += 1;
  }
  return `${seed}-${Date.now().toString(36)}`;
}

function buildPaletteDocumentPayload(palette) {
  return normalizePaletteDocument({
    schema: "html-js-gaming.palette",
    version: 1,
    name: palette?.name || "Unnamed Palette",
    source: palette?.source || "custom",
    swatches: Array.isArray(palette?.swatches) ? palette.swatches : []
  });
}

function normalizeImportedPalette(rawPayload, options = {}) {
  if (!rawPayload || typeof rawPayload !== "object") {
    throw new Error("Palette JSON must be an object.");
  }
  const payload = rawPayload.palette && typeof rawPayload.palette === "object"
    ? rawPayload.palette
    : rawPayload;
  const validation = validatePaletteDocument(payload, {
    requireSchema: options.requireSchema === true
  });
  if (!validation.valid) {
    throw new Error(validation.issues.join(" "));
  }
  const normalized = validation.palette || normalizePaletteDocument(payload);
  const normalizedName = String(normalized.name || "").trim();
  if (!normalizedName) {
    throw new Error("Palette name is required.");
  }
  return {
    name: normalizedName,
    source: String(normalized.source || "custom").trim() || "custom",
    swatches: Array.isArray(normalized.swatches) ? normalized.swatches : []
  };
}

function extractPaletteFromSamplePreset(rawPreset) {
  if (!rawPreset || typeof rawPreset !== "object") {
    return null;
  }
  const payload = rawPreset.payload && typeof rawPreset.payload === "object"
    ? rawPreset.payload
    : rawPreset;
  const config = payload.config && typeof payload.config === "object"
    ? payload.config
    : null;
  if (payload.palette && typeof payload.palette === "object") {
    return payload.palette;
  }
  if (config?.palette && typeof config.palette === "object") {
    return config.palette;
  }
  if (Array.isArray(payload.swatches)) {
    return payload;
  }
  if (Array.isArray(config?.swatches)) {
    return config;
  }
  return null;
}

function importPaletteFromPresetPayload(rawPalette) {
  const imported = normalizeImportedPalette(rawPalette, { requireSchema: false });
  let nextName = imported.name;
  if (hasReservedPaletteKeyword(nextName)) {
    nextName = `${nextName}-copy`;
  }
  if (hasReservedPaletteKeyword(nextName)) {
    nextName = "imported-palette";
  }
  nextName = makeUniquePaletteName(nextName);
  const importedPalette = createCustomPalette(nextName, imported.swatches, imported.source || "manifest");
  state.customPalettes.unshift(importedPalette);
  saveCustomPalettes();
  setSelectedPalette(importedPalette.id);
  return importedPalette;
}

async function tryLoadPresetFromQuery() {
  const searchParams = new URLSearchParams(window.location.search);
  const samplePresetPath = normalizeSamplePresetPath(searchParams.get("samplePresetPath") || "");
  const launchQuery = getToolLoadQuerySnapshot(searchParams);
  logToolLoadRequest({
    toolId: "palette-browser",
    sampleId: String(searchParams.get("sampleId") || "").trim(),
    samplePresetPath,
    requestedDataPaths: getToolLoadRequestedDataPaths(launchQuery),
    launchQuery
  });
  if (!samplePresetPath) {
    logToolLoadWarning({
      toolId: "palette-browser",
      reason: "samplePresetPath missing",
      launchQuery
    });
    return;
  }
  const sampleId = String(searchParams.get("sampleId") || "").trim();
  try {
    const presetUrl = new URL(samplePresetPath, window.location.href);
    const presetHref = presetUrl.toString();
    logToolLoadFetch({
      toolId: "palette-browser",
      phase: "attempt",
      fetchUrl: presetHref,
      requestedPath: samplePresetPath,
      pathSource: "tool-input:query.samplePresetPath"
    });
    const response = await fetch(presetHref, { cache: "no-store" });
    logToolLoadFetch({
      toolId: "palette-browser",
      phase: "response",
      fetchUrl: presetHref,
      requestedPath: samplePresetPath,
      pathSource: "tool-input:query.samplePresetPath",
      status: response.status,
      ok: response.ok
    });
    if (!response.ok) {
      throw new Error(`Preset request failed (${response.status}).`);
    }
    const rawPreset = await response.json();
    logToolLoadLoaded({
      toolId: "palette-browser",
      sampleId,
      samplePresetPath,
      fetchUrl: presetHref,
      loaded: summarizeToolLoadData(rawPreset)
    });
    const palettePayload = extractPaletteFromSamplePreset(rawPreset);
    if (!palettePayload) {
      throw new Error("Preset payload did not include a palette.");
    }
    importPaletteFromPresetPayload(palettePayload);
    setSelectionText(buildPresetLoadedStatus(sampleId, samplePresetPath));
  } catch (error) {
    logToolLoadWarning({
      toolId: "palette-browser",
      sampleId,
      samplePresetPath,
      error: error instanceof Error ? error.message : "unknown error"
    });
    setSelectionText(`Preset load failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}

async function importPaletteJsonFromFile(file) {
  if (!file) {
    return;
  }
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (detectWorkspaceDocument(parsed)) {
    throw new Error("This file is a Workspace document. Open it from Workspace Manager instead.");
  }
  const imported = normalizeImportedPalette(parsed, { requireSchema: true });
  let nextName = imported.name;
  if (hasReservedPaletteKeyword(nextName)) {
    nextName = `${nextName}-copy`;
  }
  if (hasReservedPaletteKeyword(nextName)) {
    while (true) {
      const requested = window.prompt(
        "Imported palette name contains reserved terms. Enter a new name:",
        "imported-palette"
      );
      if (requested === null) {
        setSelectionText("Palette import canceled.");
        return;
      }
      const trimmed = requested.trim() || "imported-palette";
      if (!hasReservedPaletteKeyword(trimmed)) {
        nextName = trimmed;
        break;
      }
    }
  }
  nextName = makeUniquePaletteName(nextName);
  const importedPalette = createCustomPalette(nextName, imported.swatches, imported.source || "custom");
  state.customPalettes.unshift(importedPalette);
  saveCustomPalettes();
  setSelectedPalette(importedPalette.id);
  setSelectionText(`Imported palette: ${importedPalette.name}.`);
}

function createNewPalette() {
  const requestedName = window.prompt("Name for new palette:", "new-palette");
  if (requestedName === null) {
    return;
  }
  const nextName = requestedName.trim() || "new-palette";
  if (hasReservedPaletteKeyword(nextName)) {
    refs.validationText.textContent = "Palette name cannot include reserved terms: crayola, w3c, javascript.";
    return;
  }
  const palette = createCustomPalette(nextName, [
    { symbol: "A", hex: "#ffffff", name: "White" }
  ]);
  state.customPalettes.unshift(palette);
  saveCustomPalettes();
  setSelectedPalette(palette.id);
}

function duplicateSelectedPalette() {
  const palette = getSelectedPalette();
  if (!palette) {
    return;
  }
  const suggestedName = `${palette.name}-copy`;
  let nextName = suggestedName;
  while (true) {
    const requestedName = window.prompt("Name for duplicated palette:", nextName);
    if (requestedName === null) {
      return;
    }
    nextName = requestedName.trim() || suggestedName;
    if (!hasReservedPaletteKeyword(nextName)) {
      break;
    }
    refs.validationText.textContent = "Palette name cannot include reserved terms: crayola, w3c, javascript.";
  }
  const duplicate = createCustomPalette(nextName, palette.swatches);
  state.customPalettes.unshift(duplicate);
  saveCustomPalettes();
  setSelectedPalette(duplicate.id);
}

function renameSelectedPalette() {
  const palette = getSelectedPalette();
  if (isReadOnlyPalette(palette)) {
    refs.validationText.textContent = "Duplicate a built-in palette before renaming it.";
    return;
  }
  const requestedName = refs.paletteNameInput.value.trim() || palette.name;
  if (hasReservedPaletteKeyword(requestedName)) {
    refs.validationText.textContent = "Palette name cannot include reserved terms: crayola, w3c, javascript.";
    window.alert("Palette not renamed. Reserved terms are not allowed: crayola, w3c, javascript.");
    refs.paletteNameInput.value = palette.name;
    return;
  }
  palette.name = requestedName;
  saveCustomPalettes();
  renderPaletteList();
  renderSelectedPalette();
}

function addSwatchToSelectedPalette() {
  const palette = getSelectedPalette();
  if (!isCustomPalette(palette)) {
    refs.validationText.textContent = "Duplicate a built-in palette before editing swatches.";
    return;
  }
  palette.swatches.push({
    symbol: refs.swatchSymbolInput.value.trim().slice(0, 1),
    hex: refs.swatchColorInput.value,
    name: refs.swatchNameInput.value.trim() || "New Swatch"
  });
  state.selectedSwatchIndex = palette.swatches.length - 1;
  saveCustomPalettes();
  renderSelectedPalette();
}

function updateSelectedSwatchFromInputs() {
  const palette = getSelectedPalette();
  if (isReadOnlyPalette(palette)) {
    return;
  }
  if (!palette || !Array.isArray(palette.swatches) || palette.swatches.length === 0) {
    return;
  }
  const index = Math.min(state.selectedSwatchIndex, palette.swatches.length - 1);
  const entry = palette.swatches[index];
  if (!entry) {
    return;
  }
  entry.hex = refs.swatchColorInput.value;
  entry.name = refs.swatchNameInput.value.trim() || "Unnamed";
  entry.symbol = refs.swatchSymbolInput.value.trim().slice(0, 1);
  saveCustomPalettes();
  renderSelectedPalette();
}

function deleteSelectedSwatch() {
  const palette = getSelectedPalette();
  if (!isCustomPalette(palette)) {
    refs.validationText.textContent = "Duplicate a built-in palette before editing swatches.";
    return;
  }
  if (palette.swatches.length === 0) {
    return;
  }
  palette.swatches.splice(state.selectedSwatchIndex, 1);
  state.selectedSwatchIndex = Math.max(0, state.selectedSwatchIndex - 1);
  saveCustomPalettes();
  renderSelectedPalette();
}

async function copyPaletteJson() {
  const palette = getSelectedPalette();
  if (!palette) {
    return;
  }
  const payload = JSON.stringify(buildPaletteDocumentPayload(palette), null, 2);
  try {
    await navigator.clipboard.writeText(payload);
    setSelectionText("Palette JSON copied to clipboard.");
  } catch {
    setSelectionText("Clipboard copy unavailable in this environment.");
  }
}

function exportPaletteJson() {
  const palette = getSelectedPalette();
  if (!palette) {
    return;
  }
  const payload = JSON.stringify(buildPaletteDocumentPayload(palette), null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `${palette.name.replace(/[^a-z0-9._-]+/gi, "-").toLowerCase()}.palette.json`;
  link.click();
  URL.revokeObjectURL(objectUrl);
}

function usePaletteInActiveTools() {
  const palette = getSelectedPalette();
  if (!palette) {
    return;
  }
  if (!isWorkspaceContext()) {
    setSelectionText("Use in Workspace Manager is available only in Workspace Manager context.");
    return;
  }
  if (hasReservedPaletteKeyword(palette.name)) {
    const message = "Reserved palette names cannot be used for workspace shared palette. Duplicate and rename first.";
    setSelectionText(message);
    window.alert(message);
    return;
  }
  const existingSharedPalette = readSharedPaletteHandoff();
  if (
    existingSharedPalette
    && existingSharedPalette.paletteId
    && existingSharedPalette.paletteId !== palette.id
  ) {
    const message = `Shared palette is locked to ${existingSharedPalette.displayName}. Edit swatches instead.`;
    setSelectionText(message);
    window.alert(message);
    return;
  }
  if (
    existingSharedPalette
    && existingSharedPalette.paletteId
    && existingSharedPalette.paletteId === palette.id
  ) {
    const message = "Shared palette is locked. Edit swatches instead.";
    setSelectionText(message);
    window.alert(message);
    return;
  }
  const context = getSharedLaunchContext();
  const handoff = createPaletteHandoff({
    paletteId: palette.id,
    displayName: palette.name,
    colors: palette.swatches,
    metadata: {
      source: palette.source
    },
    sourceToolId: context.sourceToolId || "palette-browser"
  });
  const stored = writeSharedPaletteHandoff(handoff);
  setSelectionText(stored
    ? `Shared palette handoff updated for ${getToolDisplayName(context.sourceToolId, "active tool")}: ${palette.name}`
    : "Shared palette handoff was not updated because the payload was invalid.");
}

function deleteSelectedPalette() {
  const palette = getSelectedPalette();
  if (!palette) {
    return;
  }
  const canOverrideDeleteGuard = hasDeleteOverrideParam();
  if (isReadOnlyPalette(palette) && !canOverrideDeleteGuard) {
    refs.validationText.textContent = "Built-in palettes cannot be deleted. Duplicate to create an editable copy.";
    return;
  }
  if (isCustomPalette(palette)) {
    state.customPalettes = state.customPalettes.filter((entry) => entry.id !== palette.id);
    saveCustomPalettes();
  } else if (canOverrideDeleteGuard) {
    if (!state.hiddenBuiltInPaletteIds.includes(palette.id)) {
      state.hiddenBuiltInPaletteIds.push(palette.id);
      saveHiddenBuiltInPaletteIds();
    }
  }
  const nextPalette = getVisiblePalettes()[0] ?? getAllPalettes()[0] ?? null;
  state.selectedPaletteId = nextPalette?.id ?? "";
  state.selectedSwatchIndex = 0;
  renderPaletteList();
  renderSelectedPalette();
}

function renderStoredSelection() {
  const workspaceMode = isWorkspaceContext();
  const handoff = readSharedPaletteHandoff();
  if (!handoff) {
    setSelectionText(workspaceMode
      ? "No handoff recorded yet."
      : "No workspace handoff recorded yet.", { muted: !workspaceMode });
    return;
  }
  setSelectionText(workspaceMode
    ? `Active handoff: ${handoff.displayName} (${handoff.selectedAt})`
    : `Last workspace handoff: ${handoff.displayName} (${handoff.selectedAt})`, { muted: !workspaceMode });
}

function bindEvents() {
  refs.searchInput.addEventListener("input", () => {
    state.search = refs.searchInput.value;
    renderPaletteList();
    renderSelectedPalette();
  });

  refs.paletteList.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("[data-palette-id]") : null;
    if (!(button instanceof HTMLElement)) {
      return;
    }
    setSelectedPalette(button.dataset.paletteId || "");
  });

  refs.paletteSwatches.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("[data-swatch-index]") : null;
    if (!(button instanceof HTMLElement)) {
      return;
    }
    state.selectedSwatchIndex = Number(button.dataset.swatchIndex || "0");
    renderSelectedPalette();
  });

  refs.newPaletteButton.addEventListener("click", createNewPalette);
  refs.duplicatePaletteButton.addEventListener("click", duplicateSelectedPalette);
  refs.renamePaletteButton.addEventListener("click", renameSelectedPalette);
  refs.deletePaletteButton.addEventListener("click", deleteSelectedPalette);
  refs.addSwatchButton.addEventListener("click", addSwatchToSelectedPalette);
  refs.deleteSwatchButton.addEventListener("click", deleteSelectedSwatch);
  refs.swatchColorInput.addEventListener("input", updateSelectedSwatchFromInputs);
  refs.swatchNameInput.addEventListener("input", updateSelectedSwatchFromInputs);
  refs.swatchSymbolInput.addEventListener("input", updateSelectedSwatchFromInputs);
  refs.importPaletteJsonButton.addEventListener("click", () => {
    refs.importPaletteJsonInput?.click();
  });
  refs.importPaletteJsonInput?.addEventListener("change", async () => {
    const file = refs.importPaletteJsonInput.files?.[0];
    refs.importPaletteJsonInput.value = "";
    if (!file) {
      return;
    }
    try {
      await importPaletteJsonFromFile(file);
    } catch (error) {
      const message = `Import failed: ${error instanceof Error ? error.message : "invalid JSON"}`;
      setSelectionText(message);
      window.alert(message);
    }
  });
  refs.copyPaletteJsonButton.addEventListener("click", copyPaletteJson);
  refs.exportPaletteJsonButton.addEventListener("click", exportPaletteJson);
  refs.usePaletteButton.addEventListener("click", usePaletteInActiveTools);
  window.addEventListener(SHARED_PALETTE_HANDOFF_EVENT, () => {
    syncSelectionFromSharedHandoff({ render: true });
  });
}

function init() {
  if (isWorkspaceContext()) {
    state.customPalettes = [];
    state.hiddenBuiltInPaletteIds = [];
  }
  const selectedFromHandoff = syncSelectionFromSharedHandoff();
  if (!selectedFromHandoff) {
    state.selectedPaletteId = "";
  }
  applyLaunchContext();
  renderPaletteList();
  renderSelectedPalette();
  renderStoredSelection();
  bindEvents();
  window.setTimeout(() => {
    syncSelectionFromSharedHandoff({ render: true });
  }, 400);
}

let initialized = false;

const paletteBrowserApi = {
  captureProjectState() {
    return {
      search: state.search,
      selectedPaletteId: state.selectedPaletteId,
      selectedSwatchIndex: state.selectedSwatchIndex,
      customPalettes: Array.isArray(state.customPalettes) ? structuredClone(state.customPalettes) : []
    };
  },
  applyProjectState(snapshot) {
    state.search = typeof snapshot?.search === "string" ? snapshot.search : "";
    state.selectedPaletteId = typeof snapshot?.selectedPaletteId === "string" ? snapshot.selectedPaletteId : state.selectedPaletteId;
    state.selectedSwatchIndex = Number.isInteger(snapshot?.selectedSwatchIndex) ? snapshot.selectedSwatchIndex : 0;
    state.customPalettes = isWorkspaceContext()
      ? []
      : (Array.isArray(snapshot?.customPalettes) ? structuredClone(snapshot.customPalettes) : []);
    if (isWorkspaceContext()) {
      syncSelectionFromSharedHandoff();
    }
    saveCustomPalettes();
    refs.searchInput.value = state.search;
    renderPaletteList();
    renderSelectedPalette();
    renderStoredSelection();
    return true;
  }
};

function bootPaletteBrowser() {
  if (!initialized) {
    init();
    void tryLoadPresetFromQuery();
    initialized = true;
  }
  window.paletteBrowserApp = paletteBrowserApi;
  return paletteBrowserApi;
}

registerToolBootContract("palette-browser", {
  init: bootPaletteBrowser,
  destroy() {
    return true;
  },
  getApi() {
    return window.paletteBrowserApp || null;
  }
});

bootPaletteBrowser();
