const GLOBAL_PALETTE_TOOL_KEY = "palette-browser";
const HEX_COLOR_PATTERN = /^#[0-9A-F]{6}$/;

const SOURCE_PALETTES = Object.freeze({
  crayola: Object.freeze([
    { symbol: "R", hex: "#ED0A3F", name: "Red", source: "crayola" },
    { symbol: "O", hex: "#FF8833", name: "Orange", source: "crayola" },
    { symbol: "Y", hex: "#FBE870", name: "Yellow", source: "crayola" },
    { symbol: "G", hex: "#01A368", name: "Green", source: "crayola" },
    { symbol: "B", hex: "#0066FF", name: "Blue", source: "crayola" },
    { symbol: "V", hex: "#8359A3", name: "Violet", source: "crayola" },
    { symbol: "K", hex: "#000000", name: "Black", source: "crayola" },
    { symbol: "W", hex: "#FFFFFF", name: "White", source: "crayola" }
  ]),
  w3c: Object.freeze([
    { symbol: "R", hex: "#FF0000", name: "Red", source: "w3c" },
    { symbol: "L", hex: "#00FF00", name: "Lime", source: "w3c" },
    { symbol: "B", hex: "#0000FF", name: "Blue", source: "w3c" },
    { symbol: "C", hex: "#00FFFF", name: "Cyan", source: "w3c" },
    { symbol: "M", hex: "#FF00FF", name: "Magenta", source: "w3c" },
    { symbol: "Y", hex: "#FFFF00", name: "Yellow", source: "w3c" },
    { symbol: "K", hex: "#000000", name: "Black", source: "w3c" },
    { symbol: "W", hex: "#FFFFFF", name: "White", source: "w3c" }
  ]),
  javascript: Object.freeze([
    { symbol: "J", hex: "#F7DF1E", name: "JavaScript Yellow", source: "javascript" },
    { symbol: "N", hex: "#323330", name: "JavaScript Near Black", source: "javascript" },
    { symbol: "T", hex: "#3178C6", name: "TypeScript Blue", source: "javascript" },
    { symbol: "V", hex: "#42B883", name: "Vue Green", source: "javascript" },
    { symbol: "R", hex: "#61DAFB", name: "React Cyan", source: "javascript" },
    { symbol: "S", hex: "#CC6699", name: "Sass Pink", source: "javascript" },
    { symbol: "D", hex: "#764ABC", name: "Redux Purple", source: "javascript" },
    { symbol: "E", hex: "#47848F", name: "Electron Teal", source: "javascript" }
  ])
});

const refs = {
  userPaletteCount: document.getElementById("userPaletteCount"),
  userSwatchList: document.getElementById("userSwatchList"),
  sourcePaletteSelect: document.getElementById("sourcePaletteSelect"),
  sourceSearchInput: document.getElementById("sourceSearchInput"),
  sourceSwatchList: document.getElementById("sourceSwatchList"),
  editorTitle: document.getElementById("editorTitle"),
  selectedSwatchPreview: document.getElementById("selectedSwatchPreview"),
  swatchSymbolInput: document.getElementById("swatchSymbolInput"),
  swatchHexInput: document.getElementById("swatchHexInput"),
  swatchNameInput: document.getElementById("swatchNameInput"),
  swatchSourceInput: document.getElementById("swatchSourceInput"),
  addSwatchButton: document.getElementById("addSwatchButton"),
  updateSwatchButton: document.getElementById("updateSwatchButton"),
  removeSwatchButton: document.getElementById("removeSwatchButton"),
  clearFormButton: document.getElementById("clearFormButton"),
  importPaletteButton: document.getElementById("importPaletteButton"),
  importPaletteInput: document.getElementById("importPaletteInput"),
  copyPaletteButton: document.getElementById("copyPaletteButton"),
  exportPaletteButton: document.getElementById("exportPaletteButton"),
  paletteJsonPreview: document.getElementById("paletteJsonPreview"),
  paletteStatus: document.getElementById("paletteStatus"),
  paletteErrorList: document.getElementById("paletteErrorList")
};

const state = {
  userSwatches: [],
  selectedUserIndex: -1,
  sourcePaletteId: "crayola",
  sourceSearch: "",
  errors: []
};

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeHex(value) {
  return sanitizeText(value).toUpperCase();
}

function swatchKey(swatch) {
  return [
    sanitizeText(swatch?.symbol),
    normalizeHex(swatch?.hex),
    sanitizeText(swatch?.name).toLowerCase(),
    sanitizeText(swatch?.source).toLowerCase()
  ].join("|");
}

function cloneSwatch(swatch) {
  return {
    symbol: sanitizeText(swatch.symbol),
    hex: normalizeHex(swatch.hex),
    name: sanitizeText(swatch.name),
    source: sanitizeText(swatch.source)
  };
}

export function isSwatchUsedByTool() {
  return false;
}

function validateSwatch(swatch, indexLabel) {
  const issues = [];
  const label = sanitizeText(indexLabel) || "swatch";
  if (sanitizeText(swatch?.symbol).length !== 1) {
    issues.push(`${label}.symbol is required and must be exactly one character.`);
  }
  if (!HEX_COLOR_PATTERN.test(normalizeHex(swatch?.hex))) {
    issues.push(`${label}.hex is required and must be #RRGGBB.`);
  }
  if (!sanitizeText(swatch?.name)) {
    issues.push(`${label}.name is required.`);
  }
  if (!sanitizeText(swatch?.source)) {
    issues.push(`${label}.source is required.`);
  }
  return issues;
}

function validateUserSwatches(swatches) {
  const issues = [];
  if (!Array.isArray(swatches)) {
    return ["tools.palette-browser.swatches must be an array."];
  }
  swatches.forEach((swatch, index) => {
    issues.push(...validateSwatch(swatch, `swatches[${index}]`));
  });
  return issues;
}

function buildGlobalPaletteValue() {
  return {
    swatches: state.userSwatches.map(cloneSwatch)
  };
}

function buildExportDocument() {
  return {
    tools: {
      [GLOBAL_PALETTE_TOOL_KEY]: buildGlobalPaletteValue()
    }
  };
}

function setErrors(errors) {
  state.errors = Array.isArray(errors) ? errors : [];
}

function setStatus(message) {
  refs.paletteStatus.textContent = sanitizeText(message) || "Ready.";
}

function renderErrors(errors = state.errors) {
  refs.paletteErrorList.replaceChildren();
  const errorEntries = Array.isArray(errors) ? errors : [];
  errorEntries.forEach((error) => {
    const item = document.createElement("li");
    item.textContent = error;
    refs.paletteErrorList.appendChild(item);
  });
}

function renderJsonPreview() {
  refs.paletteJsonPreview.textContent = JSON.stringify(buildExportDocument(), null, 2);
}

function renderSelectedSwatchPreview(swatch) {
  const color = HEX_COLOR_PATTERN.test(normalizeHex(swatch?.hex)) ? normalizeHex(swatch.hex) : "#000000";
  refs.selectedSwatchPreview.style.background = color;
}

function setFormFromSwatch(swatch) {
  refs.swatchSymbolInput.value = sanitizeText(swatch?.symbol);
  refs.swatchHexInput.value = normalizeHex(swatch?.hex);
  refs.swatchNameInput.value = sanitizeText(swatch?.name);
  refs.swatchSourceInput.value = sanitizeText(swatch?.source);
  renderSelectedSwatchPreview(swatch);
}

function clearForm() {
  state.selectedUserIndex = -1;
  refs.editorTitle.textContent = "Selected Swatch";
  setFormFromSwatch({ symbol: "", hex: "", name: "", source: "" });
}

function readFormSwatch() {
  return {
    symbol: sanitizeText(refs.swatchSymbolInput.value),
    hex: normalizeHex(refs.swatchHexInput.value),
    name: sanitizeText(refs.swatchNameInput.value),
    source: sanitizeText(refs.swatchSourceInput.value)
  };
}

function findUserSwatchIndex(swatch) {
  const key = swatchKey(swatch);
  return state.userSwatches.findIndex((entry) => swatchKey(entry) === key);
}

function getVisibleSourceSwatches() {
  const sourceSwatches = SOURCE_PALETTES[state.sourcePaletteId] || [];
  const query = state.sourceSearch.toLowerCase();
  if (!query) {
    return sourceSwatches;
  }
  return sourceSwatches.filter((swatch) => {
    return swatch.name.toLowerCase().includes(query)
      || swatch.hex.toLowerCase().includes(query)
      || swatch.symbol.toLowerCase().includes(query);
  });
}

function createSwatchRow(swatch, options) {
  const row = document.createElement("div");
  row.className = "palette-manager-v2__swatch-row";
  if (options.selected) {
    row.classList.add("is-selected");
  }

  const chip = document.createElement("span");
  chip.className = "palette-manager-v2__swatch-chip";
  chip.style.background = swatch.hex;

  const copy = document.createElement("div");
  copy.className = "palette-manager-v2__swatch-copy";

  const name = document.createElement("p");
  name.className = "palette-manager-v2__swatch-name";
  name.textContent = swatch.name;

  const meta = document.createElement("p");
  meta.className = "palette-manager-v2__swatch-meta";
  meta.textContent = `${swatch.symbol} | ${swatch.hex} | ${swatch.source}`;

  copy.append(name, meta);

  const tack = document.createElement("button");
  tack.type = "button";
  tack.className = "palette-manager-v2__pin-button";
  tack.classList.toggle("is-pinned", options.pinned);
  tack.textContent = "Tack";
  tack.title = options.pinned ? "Remove pinned swatch" : "Pin to user palette";
  tack.setAttribute("aria-label", tack.title);
  tack.addEventListener("click", (event) => {
    event.stopPropagation();
    options.onTack();
  });

  row.append(chip, copy, tack);
  if (options.onSelect) {
    row.addEventListener("click", options.onSelect);
  }
  return row;
}

function renderUserSwatches() {
  refs.userPaletteCount.textContent = `${state.userSwatches.length} user swatches`;
  refs.userSwatchList.replaceChildren();
  if (state.userSwatches.length === 0) {
    const empty = document.createElement("p");
    empty.className = "palette-manager-v2__meta";
    empty.textContent = "No user swatches.";
    refs.userSwatchList.appendChild(empty);
    return;
  }
  state.userSwatches.forEach((swatch, index) => {
    refs.userSwatchList.appendChild(createSwatchRow(swatch, {
      pinned: true,
      selected: index === state.selectedUserIndex,
      onSelect: () => {
        state.selectedUserIndex = index;
        refs.editorTitle.textContent = `Editing ${swatch.name}`;
        setFormFromSwatch(swatch);
        render();
      },
      onTack: () => removeUserSwatch(index)
    }));
  });
}

function renderSourceSwatches() {
  refs.sourceSwatchList.replaceChildren();
  const visibleSwatches = getVisibleSourceSwatches();
  if (visibleSwatches.length === 0) {
    const empty = document.createElement("p");
    empty.className = "palette-manager-v2__meta";
    empty.textContent = "No source swatches match the search.";
    refs.sourceSwatchList.appendChild(empty);
    return;
  }
  visibleSwatches.forEach((swatch) => {
    const userIndex = findUserSwatchIndex(swatch);
    refs.sourceSwatchList.appendChild(createSwatchRow(swatch, {
      pinned: userIndex >= 0,
      selected: false,
      onSelect: () => {
        refs.editorTitle.textContent = `Browsing ${swatch.name}`;
        setFormFromSwatch(swatch);
      },
      onTack: () => {
        if (userIndex >= 0) {
          removeUserSwatch(userIndex);
          return;
        }
        pinSourceSwatch(swatch);
      }
    }));
  });
}

function renderValidation() {
  const validationErrors = validateUserSwatches(state.userSwatches);
  renderErrors([...state.errors, ...validationErrors]);
}

function render() {
  renderUserSwatches();
  renderSourceSwatches();
  renderJsonPreview();
  renderValidation();
}

function addUserSwatch() {
  const swatch = readFormSwatch();
  const errors = validateSwatch(swatch, "new swatch");
  if (errors.length > 0) {
    setErrors(errors);
    setStatus("User swatch was not added.");
    render();
    return;
  }
  state.userSwatches.push(cloneSwatch(swatch));
  state.selectedUserIndex = state.userSwatches.length - 1;
  setErrors([]);
  setStatus(`Added ${swatch.name}.`);
  render();
}

function updateSelectedSwatch() {
  if (state.selectedUserIndex < 0 || state.selectedUserIndex >= state.userSwatches.length) {
    setErrors(["Select a user swatch before updating."]);
    setStatus("No user swatch selected.");
    render();
    return;
  }
  const swatch = readFormSwatch();
  const errors = validateSwatch(swatch, "selected swatch");
  if (errors.length > 0) {
    setErrors(errors);
    setStatus("Selected swatch was not updated.");
    render();
    return;
  }
  state.userSwatches[state.selectedUserIndex] = cloneSwatch(swatch);
  setErrors([]);
  setStatus(`Updated ${swatch.name}.`);
  render();
}

function removeUserSwatch(index) {
  const swatch = state.userSwatches[index];
  if (!swatch) {
    return;
  }
  if (isSwatchUsedByTool(swatch)) {
    setErrors([`${swatch.name} is used by another tool and cannot be removed.`]);
    setStatus("Pinned swatch removal blocked.");
    render();
    return;
  }
  state.userSwatches.splice(index, 1);
  if (state.selectedUserIndex === index) {
    clearForm();
  } else if (state.selectedUserIndex > index) {
    state.selectedUserIndex -= 1;
  }
  setErrors([]);
  setStatus(`Removed ${swatch.name}.`);
  render();
}

function removeSelectedSwatch() {
  if (state.selectedUserIndex < 0 || state.selectedUserIndex >= state.userSwatches.length) {
    setErrors(["Select a user swatch before removing."]);
    setStatus("No user swatch selected.");
    render();
    return;
  }
  removeUserSwatch(state.selectedUserIndex);
}

function pinSourceSwatch(swatch) {
  const pinnedSwatch = cloneSwatch(swatch);
  const errors = validateSwatch(pinnedSwatch, "source swatch");
  if (errors.length > 0) {
    setErrors(errors);
    setStatus("Source swatch was not pinned.");
    render();
    return;
  }
  state.userSwatches.push(pinnedSwatch);
  state.selectedUserIndex = state.userSwatches.length - 1;
  refs.editorTitle.textContent = `Editing ${pinnedSwatch.name}`;
  setFormFromSwatch(pinnedSwatch);
  setErrors([]);
  setStatus(`Pinned ${pinnedSwatch.name}.`);
  render();
}

function extractImportedPaletteDocument(rawDocument) {
  if (!rawDocument || typeof rawDocument !== "object" || Array.isArray(rawDocument)) {
    return { swatches: null, errors: ["Imported JSON must be an object."] };
  }
  const tools = rawDocument.tools;
  if (!tools || typeof tools !== "object" || Array.isArray(tools)) {
    return { swatches: null, errors: ["Imported JSON must contain a tools object."] };
  }
  const paletteValue = tools[GLOBAL_PALETTE_TOOL_KEY];
  if (!paletteValue || typeof paletteValue !== "object" || Array.isArray(paletteValue)) {
    return { swatches: null, errors: ["Imported JSON must contain tools.palette-browser."] };
  }
  if (!Array.isArray(paletteValue.swatches)) {
    return { swatches: null, errors: ["tools.palette-browser.swatches must be an array."] };
  }
  const swatches = paletteValue.swatches.map(cloneSwatch);
  const errors = validateUserSwatches(swatches);
  return { swatches: errors.length === 0 ? swatches : null, errors };
}

async function importPaletteJsonFromFile(file) {
  const rawText = await file.text();
  let parsed = null;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    setErrors(["Imported file is not valid JSON."]);
    setStatus("Import rejected.");
    render();
    return;
  }
  const importResult = extractImportedPaletteDocument(parsed);
  if (importResult.errors.length > 0) {
    setErrors(importResult.errors);
    setStatus("Import rejected.");
    render();
    return;
  }
  state.userSwatches = importResult.swatches;
  clearForm();
  setErrors([]);
  setStatus(`Imported ${state.userSwatches.length} user swatches.`);
  render();
}

function exportPaletteJson() {
  const errors = validateUserSwatches(state.userSwatches);
  if (errors.length > 0) {
    setErrors(errors);
    setStatus("Export blocked.");
    render();
    return;
  }
  const blob = new Blob([JSON.stringify(buildExportDocument(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "tools.palette-browser.json";
  link.click();
  URL.revokeObjectURL(url);
  setErrors([]);
  setStatus("Exported tools.palette-browser JSON.");
  render();
}

async function copyPaletteJson() {
  const errors = validateUserSwatches(state.userSwatches);
  if (errors.length > 0) {
    setErrors(errors);
    setStatus("Copy blocked.");
    render();
    return;
  }
  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
    setErrors(["Clipboard API is unavailable."]);
    setStatus("Copy blocked.");
    render();
    return;
  }
  try {
    await navigator.clipboard.writeText(JSON.stringify(buildExportDocument(), null, 2));
  } catch {
    setErrors(["Clipboard write failed."]);
    setStatus("Copy blocked.");
    render();
    return;
  }
  setErrors([]);
  setStatus("Copied tools.palette-browser JSON.");
  render();
}

function bindEvents() {
  refs.sourcePaletteSelect.addEventListener("change", () => {
    state.sourcePaletteId = refs.sourcePaletteSelect.value;
    state.sourceSearch = "";
    refs.sourceSearchInput.value = "";
    setErrors([]);
    setStatus(`Browsing ${state.sourcePaletteId}.`);
    render();
  });
  refs.sourceSearchInput.addEventListener("input", () => {
    state.sourceSearch = refs.sourceSearchInput.value.trim();
    renderSourceSwatches();
  });
  refs.swatchHexInput.addEventListener("input", () => {
    renderSelectedSwatchPreview(readFormSwatch());
  });
  refs.addSwatchButton.addEventListener("click", addUserSwatch);
  refs.updateSwatchButton.addEventListener("click", updateSelectedSwatch);
  refs.removeSwatchButton.addEventListener("click", removeSelectedSwatch);
  refs.clearFormButton.addEventListener("click", () => {
    clearForm();
    setErrors([]);
    setStatus("Form cleared.");
    render();
  });
  refs.importPaletteButton.addEventListener("click", () => {
    refs.importPaletteInput.click();
  });
  refs.importPaletteInput.addEventListener("change", () => {
    const file = refs.importPaletteInput.files?.[0] || null;
    refs.importPaletteInput.value = "";
    if (file) {
      void importPaletteJsonFromFile(file);
    }
  });
  refs.copyPaletteButton.addEventListener("click", () => {
    void copyPaletteJson();
  });
  refs.exportPaletteButton.addEventListener("click", exportPaletteJson);
}

function init() {
  bindEvents();
  clearForm();
  render();
}

window.paletteManagerV2App = {
  getPaletteValue: buildGlobalPaletteValue,
  getExportDocument: buildExportDocument,
  isSwatchUsedByTool
};

init();
