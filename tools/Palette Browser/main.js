const CUSTOM_PALETTES_STORAGE_KEY = "toolboxaid.paletteBrowser.customPalettes";
const ACTIVE_PALETTE_HANDOFF_KEY = "toolboxaid.shared.activePalette";

const refs = {
  searchInput: document.getElementById("paletteSearchInput"),
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
  customPalettes: loadCustomPalettes()
};

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
    }));
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

function renderPaletteList() {
  const palettes = getVisiblePalettes();
  refs.countText.textContent = `${palettes.length} palette${palettes.length === 1 ? "" : "s"}`;
  refs.paletteList.innerHTML = palettes.map((palette) => {
    const currentClass = palette.id === state.selectedPaletteId ? " is-current" : "";
    return `
      <button type="button" data-palette-id="${palette.id}" class="${currentClass.trim()}">
        <strong>${palette.name}</strong>
        <span>${palette.entries.length} swatches | ${palette.source}</span>
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
    refs.jsonPreview.textContent = "Palette JSON preview will appear here.";
    refs.validationText.textContent = "Validation summary will appear here.";
    return;
  }

  refs.paletteTitle.textContent = palette.name;
  refs.paletteSummaryText.textContent = `${palette.entries.length} swatches | source: ${palette.source}`;
  refs.paletteNameInput.value = palette.name;
  refs.paletteNameInput.disabled = !isCustomPalette(palette);

  refs.paletteSwatches.innerHTML = palette.entries.map((entry, index) => {
    const currentClass = index === state.selectedSwatchIndex ? " is-current" : "";
    return `
      <button type="button" data-swatch-index="${index}" class="${currentClass.trim()}">
        <span class="palette-browser__swatch-chip" style="background:${entry.hex}"></span>
        <strong>${entry.name || "Unnamed"}</strong>
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
  const palette = createCustomPalette("new-palette", [
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
  const duplicate = createCustomPalette(`${palette.name}-copy`, palette.entries);
  state.customPalettes.unshift(duplicate);
  saveCustomPalettes();
  setSelectedPalette(duplicate.id);
}

function renameSelectedPalette() {
  const palette = getSelectedPalette();
  if (!isCustomPalette(palette)) {
    refs.validationText.textContent = "Duplicate a built-in palette before renaming it.";
    return;
  }
  palette.name = refs.paletteNameInput.value.trim() || palette.name;
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
  const handoff = {
    id: palette.id,
    name: palette.name,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(ACTIVE_PALETTE_HANDOFF_KEY, JSON.stringify(handoff));
  refs.selectionText.textContent = `Shared palette handoff updated: ${palette.name}`;
}

function renderStoredSelection() {
  try {
    const raw = localStorage.getItem(ACTIVE_PALETTE_HANDOFF_KEY);
    if (!raw) {
      refs.selectionText.textContent = "No handoff recorded yet.";
      return;
    }
    const parsed = JSON.parse(raw);
    refs.selectionText.textContent = `Active handoff: ${parsed.name} (${parsed.updatedAt})`;
  } catch {
    refs.selectionText.textContent = "No handoff recorded yet.";
  }
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
  refs.addSwatchButton.addEventListener("click", addSwatchToSelectedPalette);
  refs.deleteSwatchButton.addEventListener("click", deleteSelectedSwatch);
  refs.copyPaletteJsonButton.addEventListener("click", copyPaletteJson);
  refs.exportPaletteJsonButton.addEventListener("click", exportPaletteJson);
  refs.usePaletteButton.addEventListener("click", usePaletteInActiveTools);
}

function init() {
  const firstPalette = getAllPalettes()[0] ?? null;
  state.selectedPaletteId = firstPalette?.id ?? "";
  renderPaletteList();
  renderSelectedPalette();
  renderStoredSelection();
  bindEvents();
}

init();
