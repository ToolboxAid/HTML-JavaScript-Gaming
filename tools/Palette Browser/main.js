import {
  createPaletteHandoff,
  getSharedLaunchContext,
  getToolDisplayName,
  readSharedPaletteHandoff,
  writeSharedPaletteHandoff
} from "../shared/assetUsageIntegration.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";

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
  localStorage.setItem(CUSTOM_PALETTES_STORAGE_KEY, JSON.stringify(state.customPalettes));
}

function loadHiddenBuiltInPaletteIds() {
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
  localStorage.setItem(HIDDEN_BUILTIN_PALETTES_STORAGE_KEY, JSON.stringify(state.hiddenBuiltInPaletteIds));
}

function getBuiltInPalettes() {
  const paletteSource = globalThis.palettesList && typeof globalThis.palettesList === "object"
    ? globalThis.palettesList
    : {};
  return Object.entries(paletteSource)
    .filter(([, entries]) => Array.isArray(entries))
    .map(([name, entries]) => ({
      id: `builtin:${name}`,
      name,
      source: "engine",
      entries: entries.map((entry) => ({
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
  palette.entries.forEach((entry, index) => {
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
        <span>(${palette.entries.length}) swatches | ${palette.source}</span>
      </button>
    `;
  }).join("");

  if (!palettes.some((palette) => palette.id === state.selectedPaletteId)) {
    state.selectedPaletteId = palettes[0]?.id ?? "";
  }
}

function renderSelectedPalette() {
  const palette = getSelectedPalette();
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
    refs.jsonPreview.textContent = "Palette JSON preview will appear here.";
    refs.validationText.textContent = "Validation summary will appear here.";
    return;
  }

  refs.paletteTitle.textContent = palette.name;
  refs.paletteSummaryText.textContent = `${palette.entries.length} swatches | source: ${palette.source}`;
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

  refs.paletteSwatches.innerHTML = palette.entries.map((entry, index) => {
    const currentClass = index === state.selectedSwatchIndex ? " is-current" : "";
    return `
      <button type="button" data-swatch-index="${index}" class="${currentClass.trim()}">
        <span class="palette-browser__swatch-chip" style="background:${entry.hex}"></span>
        <strong class="palette-browser__swatch-name">${formatSwatchNameForDisplay(entry.name || "Unnamed")}</strong>
        <span>${entry.symbol || "-"}</span>
      </button>
    `;
  }).join("");

  const activeEntry = palette.entries[state.selectedSwatchIndex] ?? palette.entries[0] ?? { hex: "#ffffff", name: "", symbol: "" };
  state.selectedSwatchIndex = Math.min(state.selectedSwatchIndex, Math.max(0, palette.entries.length - 1));
  refs.swatchColorInput.value = /^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(activeEntry.hex || "") ? activeEntry.hex.slice(0, 7) : "#ffffff";
  refs.swatchNameInput.value = activeEntry.name || "";
  refs.swatchSymbolInput.value = activeEntry.symbol || "";

  const issues = validatePalette(palette);
  refs.validationText.textContent = issues.length === 0
    ? "Palette validation passed."
    : issues.join(" ");
  refs.jsonPreview.textContent = JSON.stringify({
    name: palette.name,
    source: palette.source,
    entries: palette.entries
  }, null, 2);
}

function setSelectedPalette(paletteId) {
  state.selectedPaletteId = paletteId;
  state.selectedSwatchIndex = 0;
  renderPaletteList();
  renderSelectedPalette();
}

function createCustomPalette(name, entries) {
  return {
    id: `custom:${Date.now().toString(36)}`,
    name,
    source: "custom",
    entries: entries.map((entry) => ({
      symbol: entry.symbol || "",
      hex: entry.hex || "#ffffff",
      name: entry.name || "Unnamed"
    }))
  };
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
  const duplicate = createCustomPalette(nextName, palette.entries);
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
  palette.entries.push({
    symbol: refs.swatchSymbolInput.value.trim().slice(0, 2),
    hex: refs.swatchColorInput.value,
    name: refs.swatchNameInput.value.trim() || "New Swatch"
  });
  state.selectedSwatchIndex = palette.entries.length - 1;
  saveCustomPalettes();
  renderSelectedPalette();
}

function updateSelectedSwatchFromInputs() {
  const palette = getSelectedPalette();
  if (isReadOnlyPalette(palette)) {
    return;
  }
  if (!palette || !Array.isArray(palette.entries) || palette.entries.length === 0) {
    return;
  }
  const index = Math.min(state.selectedSwatchIndex, palette.entries.length - 1);
  const entry = palette.entries[index];
  if (!entry) {
    return;
  }
  entry.hex = refs.swatchColorInput.value;
  entry.name = refs.swatchNameInput.value.trim() || "Unnamed";
  entry.symbol = refs.swatchSymbolInput.value.trim().slice(0, 2);
  saveCustomPalettes();
  renderSelectedPalette();
}

function deleteSelectedSwatch() {
  const palette = getSelectedPalette();
  if (!isCustomPalette(palette)) {
    refs.validationText.textContent = "Duplicate a built-in palette before editing swatches.";
    return;
  }
  if (palette.entries.length === 0) {
    return;
  }
  palette.entries.splice(state.selectedSwatchIndex, 1);
  state.selectedSwatchIndex = Math.max(0, state.selectedSwatchIndex - 1);
  saveCustomPalettes();
  renderSelectedPalette();
}

async function copyPaletteJson() {
  const palette = getSelectedPalette();
  if (!palette) {
    return;
  }
  const payload = JSON.stringify({
    name: palette.name,
    entries: palette.entries
  }, null, 2);
  try {
    await navigator.clipboard.writeText(payload);
    refs.selectionText.textContent = "Palette JSON copied to clipboard.";
  } catch {
    refs.selectionText.textContent = "Clipboard copy unavailable in this environment.";
  }
}

function exportPaletteJson() {
  const palette = getSelectedPalette();
  if (!palette) {
    return;
  }
  const payload = JSON.stringify({
    name: palette.name,
    entries: palette.entries
  }, null, 2);
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
  const context = getSharedLaunchContext();
  const handoff = createPaletteHandoff({
    paletteId: palette.id,
    displayName: palette.name,
    colors: palette.entries,
    metadata: {
      source: palette.source
    },
    sourceToolId: context.sourceToolId || "palette-browser"
  });
  const stored = writeSharedPaletteHandoff(handoff);
  refs.selectionText.textContent = stored
    ? `Shared palette handoff updated for ${getToolDisplayName(context.sourceToolId, "active tool")}: ${palette.name}`
    : "Shared palette handoff was not updated because the payload was invalid.";
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
  const handoff = readSharedPaletteHandoff();
  if (!handoff) {
    refs.selectionText.textContent = "No handoff recorded yet.";
    return;
  }
  refs.selectionText.textContent = `Active handoff: ${handoff.displayName} (${handoff.selectedAt})`;
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
  refs.copyPaletteJsonButton.addEventListener("click", copyPaletteJson);
  refs.exportPaletteJsonButton.addEventListener("click", exportPaletteJson);
  refs.usePaletteButton.addEventListener("click", usePaletteInActiveTools);
}

function init() {
  const firstPalette = getAllPalettes()[0] ?? null;
  state.selectedPaletteId = firstPalette?.id ?? "";
  applyLaunchContext();
  renderPaletteList();
  renderSelectedPalette();
  renderStoredSelection();
  bindEvents();
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
    state.customPalettes = Array.isArray(snapshot?.customPalettes) ? structuredClone(snapshot.customPalettes) : [];
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
