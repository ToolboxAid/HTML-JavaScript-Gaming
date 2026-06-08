import {
  PALETTE_SOURCE_USER,
  PALETTE_TOOL_KEY,
  PALETTE_WORKSPACE_PATH,
  createProjectWorkspacePaletteApiRepository,
  normalizePaletteSwatchInput,
  validatePaletteSwatchInput
} from "./palette-api-client.js";

const params = new URLSearchParams(window.location.search);

function sourceRepositoryOptions() {
  if (params.get("source") === "empty") {
    return { sourceMode: "empty" };
  }
  if (params.get("source") === "invalid") {
    return { sourceMode: "invalid" };
  }
  return {};
}

const repository = createProjectWorkspacePaletteApiRepository(sourceRepositoryOptions());

const SORT_OPTIONS = Object.freeze([
  { key: "hue", label: "Hue" },
  { key: "saturation", label: "Sat" },
  { key: "brightness", label: "Brit" },
  { key: "name", label: "Name" },
  { key: "tag", label: "Tag" }
]);

const SIZE_OPTIONS = Object.freeze([
  { key: "small", label: "Small" },
  { key: "medium", label: "Medium" },
  { key: "large", label: "Large" }
]);

const PALETTE_GENERATOR_DEFAULTS = Object.freeze({
  contrast: 40,
  saturation: 100,
  hueShift: 0
});

const FULL_PALETTE_ANCHORS = Object.freeze([
  { hue: 0, label: "Red" },
  { hue: 30, label: "Orange" },
  { hue: 60, label: "Yellow" },
  { hue: 120, label: "Green" },
  { hue: 220, label: "Blue" },
  { hue: 265, label: "Indigo" },
  { hue: 290, label: "Violet" }
]);

const MONOCHROME_FAMILIES = Object.freeze([
  { hue: 34, label: "Warm Gray", saturation: 12 },
  { hue: 0, label: "Neutral Gray", saturation: 0 },
  { hue: 205, label: "Cool Gray", saturation: 10 },
  { hue: 220, label: "Blue Gray", saturation: 16 }
]);

const PALETTE_TYPE_THEMES = Object.freeze({
  forest: Object.freeze({ labels: ["Fern", "Moss", "Pine", "Canopy"], hues: [92, 112, 138, 156], saturation: 68 }),
  jungle: Object.freeze({ labels: ["Leaf", "Lime", "Vine", "Lagoon"], hues: [96, 124, 148, 174], saturation: 78 }),
  desert: Object.freeze({ labels: ["Sand", "Clay", "Cactus", "Dusk"], hues: [42, 28, 78, 350], saturation: 58 }),
  ocean: Object.freeze({ labels: ["Foam", "Aqua", "Reef", "Deep Sea"], hues: [176, 190, 206, 226], saturation: 74 }),
  arctic: Object.freeze({ labels: ["Snow", "Glacier", "Iceberg", "Polar"], hues: [186, 200, 214, 236], saturation: 42 }),
  floral: Object.freeze({ labels: ["Rose", "Petal", "Lavender", "Leaf"], hues: [344, 18, 276, 116], saturation: 72 }),
  pastel: Object.freeze({ labels: ["Peach", "Mint", "Sky", "Lilac"], hues: [18, 146, 198, 278], saturation: 48 }),
  fire: Object.freeze({ labels: ["Coal", "Ember", "Flame", "Gold"], hues: [356, 12, 28, 46], saturation: 92 }),
  ice: Object.freeze({ labels: ["Frost", "Shard", "Blue Ice", "Aurora"], hues: [176, 194, 214, 154], saturation: 52 }),
  earth: Object.freeze({ labels: ["Soil", "Stone", "Bark", "Olive"], hues: [24, 38, 18, 74], saturation: 44 }),
  lightning: Object.freeze({ labels: ["Spark", "Charge", "Bolt", "Storm"], hues: [54, 190, 258, 286], saturation: 88 }),
  fantasy: Object.freeze({ labels: ["Rune", "Crystal", "Dragon", "Moon"], hues: [276, 190, 332, 48], saturation: 76 }),
  "sci-fi": Object.freeze({ labels: ["Signal", "Plasma", "Circuit", "Void"], hues: [184, 222, 132, 276], saturation: 80 }),
  cyberpunk: Object.freeze({ labels: ["Neon Pink", "Neon Blue", "Acid", "Violet"], hues: [318, 202, 78, 270], saturation: 96 }),
  arcade: Object.freeze({ labels: ["Token", "Cabinet", "Joystick", "Screen"], hues: [6, 44, 214, 132], saturation: 88 }),
  "8-bit": Object.freeze({ labels: ["Red", "Yellow", "Green", "Blue"], hues: [0, 52, 116, 220], saturation: 82 }),
  "16-bit": Object.freeze({ labels: ["Crimson", "Amber", "Teal", "Purple"], hues: [350, 40, 178, 272], saturation: 86 })
});

let editorIssues = [];
let editorTags = [];
let harmonyRows = [];
let selectedSourceSwatch = null;
let sourceSwatchRows = [];
const sourceSortState = { direction: "asc", key: "name" };
let sourceSizeState = "medium";
const userSortState = { direction: "asc", key: "name" };
let userSizeState = "medium";
const checkedSwatchSymbols = new Set();
const invalidHexPreviewValue = "#FFFFFF";

const elements = {
  activeProject: document.querySelector("[data-palette-active-project]"),
  add: document.querySelector("[data-palette-add]"),
  clear: document.querySelector("[data-palette-clear]"),
  clearChecked: document.querySelector("[data-palette-clear-checked]"),
  count: document.querySelector("[data-palette-count]"),
  editorDiagnostic: document.querySelector("[data-palette-editor-diagnostic]"),
  form: document.querySelector("[data-palette-user-swatch-form]"),
  harmonyAddAll: document.querySelector("[data-palette-harmony-add-all]"),
  harmonyGuidance: document.querySelector("[data-palette-harmony-guidance]"),
  harmonyList: document.querySelector("[data-palette-harmony-list]"),
  harmonyMatch: document.querySelector("[data-palette-harmony-match]"),
  harmonyScheme: document.querySelector("[data-palette-harmony-scheme]"),
  generatorColors: document.querySelector("[data-palette-generator-colors]"),
  generatorContrast: document.querySelector("[data-palette-generator-contrast]"),
  generatorGenerate: document.querySelector("[data-palette-generator-generate]"),
  generatorHueShift: document.querySelector("[data-palette-generator-hue-shift]"),
  generatorPreview: document.querySelector("[data-palette-generator-preview]"),
  generatorPreviewStatus: document.querySelector("[data-palette-generator-preview-status]"),
  generatorReset: document.querySelector("[data-palette-generator-reset]"),
  generatorSaturation: document.querySelector("[data-palette-generator-saturation]"),
  generatorStatus: document.querySelector("[data-palette-generator-status]"),
  generatorSteps: document.querySelector("[data-palette-generator-steps]"),
  generatorType: document.querySelector("[data-palette-generator-type]"),
  hex: document.querySelector("[data-palette-hex]"),
  hexPreview: document.querySelector("[data-palette-user-hex-preview]"),
  log: document.querySelector("[data-palette-log]"),
  name: document.querySelector("[data-palette-name]"),
  projectDiagnostic: document.querySelector("[data-palette-project-diagnostic]"),
  projectOverlay: document.querySelector("[data-palette-project-overlay]"),
  redo: document.querySelector("[data-palette-redo]"),
  selectedSummary: document.querySelector("[data-palette-selected-summary]"),
  selectedHex: document.querySelector("[data-palette-selected-hex]"),
  selectedName: document.querySelector("[data-palette-selected-name]"),
  selectedSymbol: document.querySelector("[data-palette-selected-symbol]"),
  sourceList: document.querySelector("[data-palette-source-list]"),
  sourcePinAll: document.querySelector("[data-palette-source-pin-all]"),
  sourceSearch: document.querySelector("[data-palette-source-search]"),
  sourceSelect: document.querySelector("[data-palette-source-select]"),
  sourceSize: document.querySelector("[data-palette-source-size]"),
  sourceSort: document.querySelector("[data-palette-source-sort]"),
  storagePath: document.querySelector("[data-palette-storage-path]"),
  symbol: document.querySelector("[data-palette-symbol]"),
  tableCounts: document.querySelector("[data-palette-table-counts]"),
  tags: document.querySelector("[data-palette-tags]"),
  tagSuggestions: document.querySelector("[data-palette-tag-suggestions]"),
  editorTagsList: document.querySelector("[data-palette-editor-tags-list]"),
  tagsList: document.querySelector("[data-palette-tags-list]"),
  undo: document.querySelector("[data-palette-undo]"),
  update: document.querySelector("[data-palette-update]"),
  userSwatchDiagnostic: document.querySelector("[data-palette-user-swatch-diagnostic]"),
  userList: document.querySelector("[data-palette-user-list]"),
  userSize: document.querySelector("[data-palette-user-size]"),
  userSort: document.querySelector("[data-palette-user-sort]"),
  validationList: document.querySelector("[data-palette-validation-list]"),
  validationOverlay: document.querySelector("[data-palette-validation-overlay]"),
  validationStatus: document.querySelector("[data-palette-validation-status]")
};

function setText(target, value) {
  if (target && typeof target.forEach === "function" && !target.nodeType) {
    target.forEach((item) => setText(item, value));
    return;
  }

  if (target) {
    target.textContent = value;
  }
}

function setHidden(target, hidden) {
  if (target) {
    target.hidden = hidden;
  }
}

function setDisabled(target, disabled) {
  if (target && typeof target.forEach === "function" && !target.nodeType) {
    target.forEach((item) => setDisabled(item, disabled));
    return;
  }

  if (target) {
    target.disabled = disabled;
  }
}

function createCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function createHeaderCell(text) {
  const cell = document.createElement("th");
  cell.scope = "row";
  cell.textContent = text;
  return cell;
}

function createListItem(text) {
  const item = document.createElement("li");
  item.textContent = text;
  return item;
}

function createStatusMessage(text) {
  const message = document.createElement("p");
  message.className = "status";
  message.textContent = text;
  return message;
}

function sortDirectionCaret(direction) {
  return direction === "desc" ? "v" : "^";
}

function renderSortButtons(container, state, label) {
  if (!container) {
    return;
  }
  container.replaceChildren();
  SORT_OPTIONS.forEach((option) => {
    const button = document.createElement("button");
    const active = state.key === option.key;
    button.className = active ? "btn btn--compact primary" : "btn btn--compact";
    button.type = "button";
    button.dataset.paletteSortKey = option.key;
    button.textContent = active ? `${option.label} ${sortDirectionCaret(state.direction)}` : option.label;
    button.setAttribute("aria-label", `${label} sort ${option.label}${active ? ` ${state.direction}` : ""}`);
    button.setAttribute("aria-pressed", String(active));
    container.append(button);
  });
}

function renderSizeButtons(container, activeSize, label) {
  if (!container) {
    return;
  }
  container.replaceChildren();
  SIZE_OPTIONS.forEach((option) => {
    const button = document.createElement("button");
    const active = activeSize === option.key;
    button.className = active ? "btn btn--compact primary" : "btn btn--compact";
    button.type = "button";
    button.dataset.paletteSizeKey = option.key;
    button.textContent = option.label;
    button.setAttribute("aria-label", `${label} size ${option.label}`);
    button.setAttribute("aria-pressed", String(active));
    container.append(button);
  });
}

function normalizeSwatchPreviewSize(size) {
  return ["small", "medium", "large"].includes(size) ? size : "medium";
}

function createColorPreview(hex, size = "medium") {
  const input = document.createElement("input");
  input.type = "color";
  input.disabled = true;
  input.value = hex.slice(0, 7);
  input.dataset.paletteSwatchPreview = "";
  input.dataset.paletteSwatchSize = normalizeSwatchPreviewSize(size);
  input.setAttribute("aria-label", `${hex} color preview`);
  return input;
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function parseGeneratorNumber(element, fallback) {
  const parsed = Number.parseInt(element?.value || "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function positiveHue(value) {
  return ((value % 360) + 360) % 360;
}

function componentToHex(value) {
  return Math.round(clampNumber(value, 0, 255)).toString(16).padStart(2, "0");
}

function hslToHex(hue, saturation, lightness) {
  const normalizedHue = positiveHue(hue) / 360;
  const normalizedSaturation = clampNumber(saturation, 0, 100) / 100;
  const normalizedLightness = clampNumber(lightness, 0, 100) / 100;

  if (normalizedSaturation === 0) {
    const gray = normalizedLightness * 255;
    return `#${componentToHex(gray)}${componentToHex(gray)}${componentToHex(gray)}`.toUpperCase();
  }

  const q = normalizedLightness < 0.5
    ? normalizedLightness * (1 + normalizedSaturation)
    : normalizedLightness + normalizedSaturation - normalizedLightness * normalizedSaturation;
  const p = 2 * normalizedLightness - q;
  const hueToRgb = (offset) => {
    let t = normalizedHue + offset;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  return `#${componentToHex(hueToRgb(1 / 3) * 255)}${componentToHex(hueToRgb(0) * 255)}${componentToHex(hueToRgb(-1 / 3) * 255)}`.toUpperCase();
}

function interpolatedAnchor(anchors, column, columns) {
  if (columns <= 1) {
    return anchors[0];
  }
  if (columns === anchors.length) {
    return anchors[column];
  }
  const scaled = (column / (columns - 1)) * (anchors.length - 1);
  const leftIndex = Math.floor(scaled);
  const rightIndex = Math.min(anchors.length - 1, Math.ceil(scaled));
  const amount = scaled - leftIndex;
  const left = anchors[leftIndex];
  const right = anchors[rightIndex];
  const rawDelta = right.hue - left.hue;
  const hue = left.hue + rawDelta * amount;
  return {
    hue,
    label: amount < 0.5 ? left.label : right.label
  };
}

function repeatedThemeColumn(theme, column) {
  const index = column % theme.hues.length;
  return {
    hue: theme.hues[index],
    label: theme.labels[index] || "Theme"
  };
}

function generatorColumn(type, column, columns) {
  if (type === "full") {
    return interpolatedAnchor(FULL_PALETTE_ANCHORS, column, columns);
  }
  if (type === "monochrome") {
    return repeatedThemeColumn({
      hues: MONOCHROME_FAMILIES.map((family) => family.hue),
      labels: MONOCHROME_FAMILIES.map((family) => family.label)
    }, column);
  }
  const theme = PALETTE_TYPE_THEMES[type] || PALETTE_TYPE_THEMES.fantasy;
  return repeatedThemeColumn(theme, column);
}

function generatorSaturation(type, column, saturationControl) {
  const saturationScale = clampNumber(saturationControl, 0, 100) / 100;
  if (type === "monochrome") {
    const family = MONOCHROME_FAMILIES[column % MONOCHROME_FAMILIES.length];
    return family.saturation * saturationScale;
  }
  if (type === "full") {
    return 88 * saturationScale;
  }
  const theme = PALETTE_TYPE_THEMES[type] || PALETTE_TYPE_THEMES.fantasy;
  return theme.saturation * saturationScale;
}

function generatorLightness(row, rows, contrast) {
  if (rows <= 1) {
    return 50;
  }
  const rowPosition = (row / (rows - 1)) * 2 - 1;
  const distance = 3 + clampNumber(contrast, 0, 100) * 0.29;
  return clampNumber(50 - rowPosition * distance, 18, 82);
}

function readPaletteGeneratorSettings() {
  return {
    type: elements.generatorType?.value || "full",
    colors: clampNumber(parseGeneratorNumber(elements.generatorColors, 7), 1, 256),
    steps: clampNumber(parseGeneratorNumber(elements.generatorSteps, 8), 2, 64),
    contrast: clampNumber(parseGeneratorNumber(elements.generatorContrast, PALETTE_GENERATOR_DEFAULTS.contrast), 0, 100),
    saturation: clampNumber(parseGeneratorNumber(elements.generatorSaturation, PALETTE_GENERATOR_DEFAULTS.saturation), 0, 100),
    hueShift: clampNumber(parseGeneratorNumber(elements.generatorHueShift, PALETTE_GENERATOR_DEFAULTS.hueShift), -180, 180)
  };
}

function createGeneratorPreviewInput(hex, label, row, column) {
  const swatch = document.createElement("span");
  swatch.className = "palette-generator-preview-swatch";
  swatch.dataset.paletteGeneratorSwatch = "";
  swatch.dataset.paletteGeneratorRow = String(row);
  swatch.dataset.paletteGeneratorColumn = String(column);
  swatch.dataset.paletteGeneratorFamily = label;

  const input = document.createElement("input");
  input.type = "color";
  input.disabled = true;
  input.value = hex;
  input.dataset.paletteGeneratorColor = hex;
  input.dataset.paletteGeneratorFamily = label;
  input.setAttribute("aria-label", `${label} generated swatch ${hex}`);
  input.title = `${label} ${hex}`;

  swatch.append(input);
  return swatch;
}

function paletteGeneratorSummary(type, colors, steps) {
  if (type === "full") {
    return `Full palette preview uses ROYGBIV columns with ${colors} color${colors === 1 ? "" : "s"} and ${steps} step${steps === 1 ? "" : "s"}.`;
  }
  if (type === "monochrome") {
    return `Monochrome preview uses Warm Gray, Neutral Gray, Cool Gray, and Blue Gray families.`;
  }
  const selectedLabel = elements.generatorType?.selectedOptions?.[0]?.textContent || "Palette";
  return `${selectedLabel} palette preview uses ${colors} color${colors === 1 ? "" : "s"} and ${steps} step${steps === 1 ? "" : "s"}.`;
}

function renderPaletteGeneratorPreview(action = "Palette generator preview updated.") {
  if (!elements.generatorPreview) {
    return;
  }

  const settings = readPaletteGeneratorSettings();
  const fragment = document.createDocumentFragment();
  for (let row = 0; row < settings.steps; row += 1) {
    const rowElement = document.createElement("div");
    rowElement.className = "palette-generator-preview-row";
    rowElement.setAttribute("role", "row");
    rowElement.dataset.paletteGeneratorPreviewRow = String(row);
    const lightness = generatorLightness(row, settings.steps, settings.contrast);
    for (let column = 0; column < settings.colors; column += 1) {
      const base = generatorColumn(settings.type, column, settings.colors);
      const hue = positiveHue(base.hue + settings.hueShift);
      const saturation = generatorSaturation(settings.type, column, settings.saturation);
      const hex = hslToHex(hue, saturation, lightness);
      rowElement.append(createGeneratorPreviewInput(hex, base.label, row, column));
    }
    fragment.append(rowElement);
  }

  elements.generatorPreview.replaceChildren(fragment);
  setText(elements.generatorPreviewStatus, paletteGeneratorSummary(settings.type, settings.colors, settings.steps));
  setText(elements.generatorStatus, action);
}

function resetPaletteGeneratorControls() {
  if (elements.generatorContrast) {
    elements.generatorContrast.value = String(PALETTE_GENERATOR_DEFAULTS.contrast);
  }
  if (elements.generatorSaturation) {
    elements.generatorSaturation.value = String(PALETTE_GENERATOR_DEFAULTS.saturation);
  }
  if (elements.generatorHueShift) {
    elements.generatorHueShift.value = String(PALETTE_GENERATOR_DEFAULTS.hueShift);
  }
  renderPaletteGeneratorPreview("Palette generator controls reset.");
}

function createPinIndicator(pinned) {
  const indicator = document.createElement("span");
  indicator.className = "palette-swatch-pin";
  indicator.dataset.palettePinIndicator = "";
  indicator.setAttribute("aria-hidden", "true");
  return indicator;
}

function swatchTileLabel(swatch, action) {
  return `${action} ${swatch.name}`;
}

function swatchTooltipText(swatch, sourceLabel = "") {
  return [
    `Name: ${swatch.name}`,
    `Hex: ${swatch.hex}`,
    `Source: ${sourceLabel || repository.displaySource(swatch.source)}`,
    swatch.tags.length ? `Tags: ${swatch.tags.join(", ")}` : ""
  ].filter(Boolean).join("\n");
}

function createSwatchTile(swatch, options = {}) {
  const tile = document.createElement("button");
  const pinned = Boolean(options.pinned);
  const selected = Boolean(options.selected);
  tile.className = "palette-swatch-tile";
  tile.type = "button";
  tile.dataset.palettePinned = String(pinned);
  tile.dataset.paletteSelected = String(selected);
  tile.dataset.paletteSwatchHex = swatch.hex;
  tile.dataset.paletteSwatchName = swatch.name;
  const sourceLabel = options.sourceLabel || repository.displaySource(swatch.source);
  tile.dataset.paletteSwatchSource = sourceLabel;
  tile.dataset.paletteSwatchTags = swatch.tags.join(", ");
  tile.setAttribute("aria-label", options.label || `${selected ? "Selected. " : ""}${swatchTileLabel(swatch, options.action || "Select palette color")}`);
  tile.setAttribute("aria-pressed", String(Boolean(options.pressed)));
  tile.title = options.tooltip || swatchTooltipText(swatch, sourceLabel);
  if (selected) {
    tile.setAttribute("aria-current", "true");
  }

  if (options.swatchRow) {
    tile.dataset.paletteSwatchRow = swatch.symbol;
  }
  if (Number.isInteger(options.sourceIndex)) {
    tile.dataset.paletteSourceIndex = String(options.sourceIndex);
  }
  if (Number.isInteger(options.harmonyIndex)) {
    tile.dataset.paletteHarmonyChoice = String(options.harmonyIndex);
  }

  tile.append(createColorPreview(swatch.hex, options.size || "medium"));
  if (options.showPin !== false) {
    tile.append(createPinIndicator(pinned));
  }
  return tile;
}

function createCheckedSwatchTile(swatch, options = {}) {
  const wrapper = document.createElement("span");
  wrapper.className = "palette-swatch-item";
  wrapper.dataset.paletteSwatchItem = swatch.symbol;

  const checkbox = document.createElement("input");
  checkbox.className = "palette-swatch-check";
  checkbox.type = "checkbox";
  checkbox.checked = checkedSwatchSymbols.has(swatch.symbol);
  checkbox.dataset.paletteSwatchCheck = swatch.symbol;
  checkbox.setAttribute("aria-label", `Apply Project Palette Tags to ${swatch.name}`);
  checkbox.title = `Apply Project Palette Tags to ${swatch.name}`;

  wrapper.append(checkbox, createSwatchTile(swatch, options));
  return wrapper;
}

function normalizeTag(value) {
  return String(value || "").trim().toLowerCase();
}

function readUserSwatchForm() {
  return {
    hex: elements.hex?.value,
    name: elements.name?.value,
    symbol: elements.symbol?.value
  };
}

function fillUserSwatchForm(swatch) {
  if (elements.symbol) elements.symbol.value = swatch?.symbol || "";
  if (elements.hex) elements.hex.value = swatch?.hex || "";
  if (elements.name) elements.name.value = swatch?.name || "";
  renderUserHexPreview();
}

function isUserDefinedSwatch(swatch) {
  return swatch?.source === PALETTE_SOURCE_USER;
}

function selectedUserDefinedSwatch(snapshot) {
  return isUserDefinedSwatch(snapshot?.selectedSwatch) ? snapshot.selectedSwatch : null;
}

function clearUserSwatchForm() {
  fillUserSwatchForm(null);
  editorIssues = [];
  setText(elements.userSwatchDiagnostic, "User defined swatch form cleared.");
  setText(elements.log, "User defined swatch form cleared.");
  render();
}

function selectedTagControls() {
  return [
    elements.tags
  ].filter(Boolean);
}

function checkedSwatchSymbolsFromSnapshot(snapshot) {
  const activeSymbols = new Set(snapshot.swatches.map((swatch) => swatch.symbol));
  [...checkedSwatchSymbols].forEach((symbol) => {
    if (!activeSymbols.has(symbol)) {
      checkedSwatchSymbols.delete(symbol);
    }
  });
  return [...checkedSwatchSymbols];
}

function userDefinedLocked(snapshot) {
  return snapshot.projectRequired || snapshot.validation.status === "Reject";
}

function userDefinedAddValidation(snapshot) {
  return validatePaletteSwatchInput(
    readUserSwatchForm(),
    snapshot.swatches,
    { source: PALETTE_SOURCE_USER }
  );
}

function userDefinedAddReady(snapshot) {
  return !userDefinedLocked(snapshot) && userDefinedAddValidation(snapshot).issues.length === 0;
}

function renderUserHexPreview() {
  if (!elements.hexPreview) {
    return;
  }

  const normalizedHex = normalizePaletteSwatchInput({ hex: elements.hex?.value }).hex;
  if (normalizedHex) {
    elements.hexPreview.value = normalizedHex.slice(0, 7);
    elements.hexPreview.dataset.palettePreviewState = "valid";
    elements.hexPreview.setAttribute("aria-label", `User defined hex preview ${normalizedHex}`);
    elements.hexPreview.title = `Hex preview ${normalizedHex}`;
    return;
  }

  elements.hexPreview.value = invalidHexPreviewValue;
  elements.hexPreview.dataset.palettePreviewState = "invalid";
  elements.hexPreview.setAttribute("aria-label", "Invalid or empty user defined hex preview");
  elements.hexPreview.title = "Invalid or empty hex preview";
}

function renderUserDefinedControlState(snapshot) {
  const selectedSwatch = snapshot.selectedSwatch;
  const userSwatch = selectedUserDefinedSwatch(snapshot);
  const locked = userDefinedLocked(snapshot);
  setDisabled([elements.hex, elements.name, elements.symbol, elements.clear], locked);
  setDisabled(elements.add, locked || !userDefinedAddReady(snapshot));
  setDisabled(elements.update, locked || !userSwatch);
  setText(
    elements.userSwatchDiagnostic,
    userSwatch ? `Editing base values for ${userSwatch.name}.` : selectedSwatch ? "Ready for a new user-defined swatch." : "Ready for a user-defined swatch."
  );
  renderUserHexPreview();
}

function activeTags() {
  try {
    return [...new Set(repository.getSnapshot().swatches.flatMap((swatch) => swatch.tags))].sort((left, right) => left.localeCompare(right));
  } catch {
    return [];
  }
}

function renderEditorTags() {
  if (!elements.editorTagsList) {
    return;
  }
  elements.editorTagsList.replaceChildren();
  if (!editorTags.length) {
    elements.editorTagsList.append(createStatusMessage("No tags added."));
    return;
  }
  editorTags.forEach((tag) => {
    const button = document.createElement("button");
    button.className = "btn btn--compact";
    button.type = "button";
    button.dataset.paletteTagValue = tag;
    button.textContent = tag;
    button.setAttribute("aria-label", `Remove tag ${tag}`);
    elements.editorTagsList.append(button);
  });
}

function renderTagSuggestions() {
  if (!elements.tagSuggestions) {
    return;
  }
  const query = normalizeTag(elements.tags?.value);
  elements.tagSuggestions.replaceChildren();
  activeTags()
    .filter((tag) => query && tag.includes(query) && !editorTags.includes(tag))
    .forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag;
      elements.tagSuggestions.append(option);
    });
}

function acceptTagFromInput() {
  const tag = normalizeTag(elements.tags?.value);
  if (!tag) {
    return;
  }
  const snapshot = repository.getSnapshot();
  const checkedSymbols = checkedSwatchSymbolsFromSnapshot(snapshot);
  if (!snapshot.selectedSwatch && !checkedSymbols.length) {
    editorIssues = [{
      action: "Select a Palette Colors swatch before adding tags.",
      field: "tags",
      label: "Tags"
    }];
    render();
    return;
  }
  const result = checkedSymbols.length
    ? repository.addTagToSwatches(checkedSymbols, tag)
    : repository.updateSelectedSwatchTags([...editorTags, tag]);
  if (elements.tags) {
    elements.tags.value = "";
  }
  applyResult(result);
}

function renderSourceOptions(snapshot) {
  if (!elements.sourceSelect) {
    return;
  }

  const currentSource = elements.sourceSelect.value;
  elements.sourceSelect.replaceChildren();
  if (!snapshot.sourcePaletteOptions.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = snapshot.sourcePaletteRecordCount ? "Source palettes unavailable" : "No source palette";
    elements.sourceSelect.append(option);
    elements.sourceSelect.value = "";
    elements.sourceSelect.disabled = true;
    return;
  }

  elements.sourceSelect.disabled = false;
  snapshot.sourcePaletteOptions.forEach((source) => {
    const option = document.createElement("option");
    option.value = source.id;
    option.textContent = `${source.label} (${source.swatchCount})`;
    elements.sourceSelect.append(option);
  });
  if (currentSource && snapshot.sourcePaletteOptions.some((source) => source.id === currentSource)) {
    elements.sourceSelect.value = currentSource;
  }
}

function renderPaletteControls() {
  renderSortButtons(elements.userSort, userSortState, "Active project palette");
  renderSizeButtons(elements.userSize, userSizeState, "Active project palette");
  renderSortButtons(elements.sourceSort, sourceSortState, "Source swatches");
  renderSizeButtons(elements.sourceSize, sourceSizeState, "Source swatches");
}

function renderProject(snapshot) {
  const activeProject = snapshot.activeProject;
  const selectedSwatch = snapshot.selectedSwatch;
  const userSwatch = selectedUserDefinedSwatch(snapshot);
  setText(
    elements.activeProject,
    activeProject ? `${activeProject.name} - ${activeProject.purpose}` : "No active project."
  );
  setText(
    elements.projectDiagnostic,
    activeProject ? `Palette edits save live to ${PALETTE_WORKSPACE_PATH}.` : "Active project required."
  );
  setHidden(elements.projectOverlay, !snapshot.projectRequired);
  if (selectedSwatch && !userSwatch) {
    fillUserSwatchForm(null);
  }
  renderUserDefinedControlState(snapshot);
}

function renderSelectedSwatchEditor(snapshot) {
  const selectedSwatch = snapshot.selectedSwatch;
  if (elements.selectedSymbol) elements.selectedSymbol.value = selectedSwatch?.symbol || "";
  if (elements.selectedHex) elements.selectedHex.value = selectedSwatch?.hex || "";
  if (elements.selectedName) elements.selectedName.value = selectedSwatch?.name || "";
  if (elements.tags) elements.tags.value = "";
  editorTags = Array.isArray(selectedSwatch?.tags) ? [...selectedSwatch.tags] : [];
  setDisabled([elements.selectedSymbol, elements.selectedHex, elements.selectedName], true);
  const checkedSymbols = checkedSwatchSymbolsFromSnapshot(snapshot);
  setDisabled(selectedTagControls(), snapshot.projectRequired || snapshot.validation.status === "Reject" || (!selectedSwatch && !checkedSymbols.length));
  setDisabled(elements.clearChecked, checkedSymbols.length === 0);
  setText(
    elements.editorDiagnostic,
    checkedSymbols.length
      ? `Adding tags to ${checkedSymbols.length} checked swatch${checkedSymbols.length === 1 ? "" : "es"}.`
      : selectedSwatch ? `Editing tags for ${selectedSwatch.name}.` : "Select a Palette Colors swatch to edit tags."
  );
}

function renderValidation(snapshot) {
  const findings = [...snapshot.validation.findings, ...editorIssues];
  if (elements.validationList) {
    elements.validationList.replaceChildren();
    findings.forEach((finding) => {
      elements.validationList.append(createListItem(`${finding.label}: ${finding.action}`));
    });
    if (!findings.length) {
      elements.validationList.append(createListItem("No validation errors."));
    }
  }
  setHidden(elements.validationOverlay, findings.length === 0);
  setText(elements.validationStatus, findings.length ? "Needs Input" : snapshot.validation.status);
  setText(elements.storagePath, snapshot.palettePath);
}

function renderUserPalette(snapshot) {
  if (!elements.userList) {
    return;
  }

  elements.userList.replaceChildren();
  const swatches = repository.listSwatches({
    sortDirection: userSortState.direction,
    sortKey: userSortState.key
  });
  if (swatches.length === 0) {
    const message = document.createElement("p");
    message.className = "status";
    message.textContent = snapshot.projectRequired
      ? "Open a project before editing palette colors."
      : "No project palette colors yet.";
    elements.userList.append(message);
    return;
  }

  checkedSwatchSymbolsFromSnapshot(snapshot);
  swatches.forEach((swatch) => {
    elements.userList.append(createCheckedSwatchTile(swatch, {
      action: "Select palette color",
      pinned: true,
      pressed: snapshot.selectedSwatch?.symbol === swatch.symbol,
      selected: snapshot.selectedSwatch?.symbol === swatch.symbol,
      size: userSizeState,
      swatchRow: true
    }));
  });
}

function sourcePaletteDiagnostic(snapshot) {
  return snapshot.sourcePaletteRecordCount > 0 && snapshot.sourcePaletteOptions.length === 0
    ? "Source palette records exist, but the source dropdown is empty. Check palette_source_swatches mock-DB records for valid source, symbol, hex, and name fields."
    : "";
}

function renderSourceSwatches(snapshot = repository.getSnapshot()) {
  if (!elements.sourceList) {
    return;
  }

  const sourceId = elements.sourceSelect?.value;
  sourceSwatchRows = repository.listSourceSwatches({
    query: elements.sourceSearch?.value || "",
    sortDirection: sourceSortState.direction,
    sortKey: sourceSortState.key,
    sourceId
  });
  setDisabled(elements.sourcePinAll, sourceSwatchRows.length === 0 || !repository.getActiveProject());

  elements.sourceList.replaceChildren();
  if (sourceSwatchRows.length === 0) {
    const message = document.createElement("p");
    message.className = "status";
    message.textContent = sourcePaletteDiagnostic(snapshot) || (snapshot.sourcePaletteOptions.length
      ? "No source colors match the current filter."
      : "No source palette found. Add palette_source_swatches mock-DB records to browse source colors.");
    elements.sourceList.append(message);
    return;
  }

  sourceSwatchRows.forEach((swatch, index) => {
    const pinned = repository.isSourceSwatchPinned(swatch);
    elements.sourceList.append(createSwatchTile(swatch, {
      action: pinned ? "Unpin source palette color" : "Pin source palette color",
      pinned,
      pressed: pinned,
      size: sourceSizeState,
      sourceIndex: index
    }));
  });
}

function renderTags(snapshot) {
  if (!elements.tagsList) {
    return;
  }

  const tags = [...new Set(snapshot.swatches.flatMap((swatch) => swatch.tags))].sort((left, right) => left.localeCompare(right));
  elements.tagsList.replaceChildren();
  if (!tags.length) {
    elements.tagsList.append(createListItem("No tags in active palette."));
    return;
  }
  tags.forEach((tag) => elements.tagsList.append(createListItem(tag)));
}

function renderHarmony(snapshot) {
  if (!elements.harmonyList) {
    return;
  }

  elements.harmonyList.replaceChildren();
  const baseSwatch = snapshot.selectedSwatch || selectedSourceSwatch;
  const sourceId = elements.sourceSelect?.value || "";
  harmonyRows = baseSwatch
    ? repository.createHarmonySuggestions(baseSwatch, {
        matchSource: elements.harmonyMatch?.value || "calculated",
        schemeId: elements.harmonyScheme?.value || "complementary",
        sourceId
      })
    : [];

  if (!baseSwatch) {
    elements.harmonyList.append(createStatusMessage("Select a project or source palette color to view scheme suggestions."));
    setText(elements.harmonyGuidance, "Select a project or source palette color to view scheme suggestions.");
    setDisabled(elements.harmonyAddAll, true);
    return;
  }

  if (harmonyRows.length === 0) {
    elements.harmonyList.append(createStatusMessage("No harmony scheme colors available."));
    setText(elements.harmonyGuidance, "No harmony scheme colors are available for the selected palette color.");
    setDisabled(elements.harmonyAddAll, true);
    return;
  }

  setText(elements.harmonyGuidance, `Showing ${harmonyRows.length} ${elements.harmonyScheme?.selectedOptions?.[0]?.textContent || "scheme"} colors from ${elements.harmonyMatch?.selectedOptions?.[0]?.textContent || "Calculated"}.`);
  setDisabled(elements.harmonyAddAll, false);

  const schemeLabel = elements.harmonyScheme?.selectedOptions?.[0]?.textContent || "Harmony";
  harmonyRows.forEach((suggestion, index) => {
    const pinned = repository.isSourceSwatchPinned(suggestion);
    elements.harmonyList.append(createSwatchTile({
      hex: suggestion.hex,
      name: suggestion.name,
      source: suggestion.source,
      symbol: String(index + 1),
      tags: []
    }, {
      action: pinned ? "Remove harmony swatch" : "Add harmony swatch",
      harmonyIndex: index,
      label: `${pinned ? "Remove" : "Add"} harmony swatch ${suggestion.name} ${suggestion.hex} from ${schemeLabel}.`,
      pinned,
      pressed: pinned,
      size: "medium",
      sourceLabel: schemeLabel
    }));
  });
}

function renderTables(snapshot) {
  if (!elements.tableCounts) {
    return;
  }

  elements.tableCounts.replaceChildren();
  snapshot.tableCounts.forEach((count) => {
    const row = document.createElement("tr");
    row.append(createCell(count.table), createCell(String(count.rows)));
    elements.tableCounts.append(row);
  });
}

function renderSummary(snapshot) {
  setText(elements.count, String(snapshot.swatches.length));
  setText(
    elements.selectedSummary,
    snapshot.selectedSwatch ? snapshot.selectedSwatch.name : "None"
  );
  setDisabled(elements.undo, !snapshot.canUndo);
  setDisabled(elements.redo, !snapshot.canRedo);
}

function render() {
  let snapshot;
  try {
    snapshot = repository.getSnapshot({
      sortDirection: userSortState.direction,
      sortKey: userSortState.key
    });
  } catch (error) {
    editorIssues = [{
      action: error.message,
      field: "payload",
      label: "Invalid Palette Payload"
    }];
    setText(elements.log, "Invalid palette payload rejected before render.");
    return;
  }

  checkedSwatchSymbolsFromSnapshot(snapshot);
  renderSourceOptions(snapshot);
  renderPaletteControls();
  renderProject(snapshot);
  renderSelectedSwatchEditor(snapshot);
  renderSummary(snapshot);
  renderValidation(snapshot);
  renderUserPalette(snapshot);
  renderSourceSwatches(snapshot);
  renderTags(snapshot);
  renderHarmony(snapshot);
  renderTables(snapshot);
  renderEditorTags();
  renderTagSuggestions();
}

function applyResult(result) {
  editorIssues = result.issues || [];
  if (result.snapshot) {
    fillUserSwatchForm(selectedUserDefinedSwatch(result.snapshot));
  }
  setText(elements.log, result.message);
  setText(elements.userSwatchDiagnostic, result.message);
  render();
}

function validateUserSwatch() {
  const snapshot = repository.getSnapshot();
  if (snapshot.projectRequired) {
    editorIssues = snapshot.validation.findings;
  } else {
    editorIssues = validatePaletteSwatchInput(
      readUserSwatchForm(),
      snapshot.swatches,
      { excludeSymbol: snapshot.selectedSwatch?.symbol || "" }
    ).issues;
  }
  renderUserDefinedControlState(snapshot);
  renderValidation(snapshot);
}

function runInitialQueryState() {
  if (params.get("project") === "missing" || params.get("project") === "none") {
    repository.clearProjectData();
  }

  if (params.get("palette") === "seed") {
    applyResult(repository.seedActiveProjectPalette());
  }

  if (params.get("palette") === "invalid") {
    applyResult(repository.loadActiveProjectPalettePayload({
      tools: {
        [PALETTE_TOOL_KEY]: {
          swatches: [
            { symbol: "AB", hex: "#112233", name: "Invalid Symbol" }
          ]
        }
      }
    }));
  }
}

elements.form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const snapshot = repository.getSnapshot();
  if (!userDefinedAddReady(snapshot)) {
    validateUserSwatch();
    return;
  }
  const result = repository.addSwatch(readUserSwatchForm());
  if (result.ok) {
    fillUserSwatchForm(selectedUserDefinedSwatch(result.snapshot));
  }
  applyResult(result);
});

elements.form?.addEventListener("input", validateUserSwatch);

elements.tags?.addEventListener("input", renderTagSuggestions);

elements.tags?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") {
    return;
  }
  event.preventDefault();
  acceptTagFromInput();
});

elements.editorTagsList?.addEventListener("click", (event) => {
  const tagButton = event.target.closest("[data-palette-tag-value]");
  if (!tagButton) {
    return;
  }
  const result = repository.updateSelectedSwatchTags(
    editorTags.filter((tag) => tag !== tagButton.dataset.paletteTagValue)
  );
  applyResult(result);
});

elements.update?.addEventListener("click", () => {
  const result = repository.updateSelectedSwatch(readUserSwatchForm());
  if (result.ok) {
    fillUserSwatchForm(selectedUserDefinedSwatch(result.snapshot));
  }
  applyResult(result);
});

elements.clear?.addEventListener("click", clearUserSwatchForm);

elements.clearChecked?.addEventListener("click", () => {
  checkedSwatchSymbols.clear();
  setText(elements.log, "Cleared checked palette swatches.");
  setText(elements.editorDiagnostic, "Cleared checked palette swatches.");
  render();
});

elements.undo?.addEventListener("click", () => {
  applyResult(repository.undo());
});

elements.redo?.addEventListener("click", () => {
  applyResult(repository.redo());
});

elements.userSort?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-palette-sort-key]");
  if (!button) {
    return;
  }
  const key = button.dataset.paletteSortKey;
  userSortState.direction = userSortState.key === key && userSortState.direction === "asc" ? "desc" : "asc";
  userSortState.key = key;
  render();
});

elements.userSize?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-palette-size-key]");
  if (!button) {
    return;
  }
  userSizeState = button.dataset.paletteSizeKey;
  render();
});

elements.sourceSelect?.addEventListener("change", render);
elements.sourceSearch?.addEventListener("input", renderSourceSwatches);

elements.sourcePinAll?.addEventListener("click", () => {
  applyResult(repository.pinSourceSwatches(sourceSwatchRows));
});

elements.sourceSort?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-palette-sort-key]");
  if (!button) {
    return;
  }
  const key = button.dataset.paletteSortKey;
  sourceSortState.direction = sourceSortState.key === key && sourceSortState.direction === "asc" ? "desc" : "asc";
  sourceSortState.key = key;
  renderSourceSwatches();
  renderSortButtons(elements.sourceSort, sourceSortState, "Source swatches");
});

elements.sourceSize?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-palette-size-key]");
  if (!button) {
    return;
  }
  sourceSizeState = button.dataset.paletteSizeKey;
  renderSourceSwatches();
  renderSizeButtons(elements.sourceSize, sourceSizeState, "Source swatches");
});

[
  elements.generatorType,
  elements.generatorColors,
  elements.generatorSteps
].forEach((control) => {
  control?.addEventListener("change", () => renderPaletteGeneratorPreview());
});

[
  elements.generatorContrast,
  elements.generatorSaturation,
  elements.generatorHueShift
].forEach((control) => {
  control?.addEventListener("input", () => renderPaletteGeneratorPreview());
});

elements.generatorGenerate?.addEventListener("click", () => {
  renderPaletteGeneratorPreview("Palette generated.");
});

elements.generatorReset?.addEventListener("click", resetPaletteGeneratorControls);

elements.harmonyMatch?.addEventListener("change", render);
elements.harmonyScheme?.addEventListener("change", render);
elements.harmonyList?.addEventListener("click", (event) => {
  const tile = event.target.closest("[data-palette-harmony-choice]");
  if (!tile) {
    return;
  }
  const suggestion = harmonyRows[Number(tile.dataset.paletteHarmonyChoice)];
  if (!suggestion) {
    editorIssues = [{
      action: "Select a harmony scheme color before pinning.",
      field: "harmony",
      label: "Harmony"
    }];
    render();
    return;
  }
  applyResult(repository.toggleHarmonySuggestionPin(suggestion));
});

elements.harmonyAddAll?.addEventListener("click", () => {
  if (!harmonyRows.length) {
    editorIssues = [{
      action: "Select a project or source palette color before adding harmony colors.",
      field: "harmony",
      label: "Harmony"
    }];
    render();
    return;
  }
  applyResult(repository.addHarmonySuggestions(harmonyRows));
});

elements.userList?.addEventListener("click", (event) => {
  const tile = event.target.closest("[data-palette-swatch-row]");
  if (!tile) {
    return;
  }

  const pin = event.target.closest("[data-palette-pin-indicator]");
  if (pin) {
    const deletingSelected = tile.dataset.paletteSelected === "true";
    const result = repository.removeSwatch(tile.dataset.paletteSwatchRow);
    selectedSourceSwatch = null;
    if (deletingSelected || !result.snapshot.selectedSwatch) {
      fillUserSwatchForm(selectedUserDefinedSwatch(result.snapshot));
    }
    applyResult(result);
    return;
  }

  const snapshot = repository.selectSwatch(tile.dataset.paletteSwatchRow);
  fillUserSwatchForm(selectedUserDefinedSwatch(snapshot));
  selectedSourceSwatch = null;
  editorIssues = [];
  render();
});

elements.userList?.addEventListener("change", (event) => {
  const checkbox = event.target.closest("[data-palette-swatch-check]");
  if (!checkbox) {
    return;
  }

  if (checkbox.checked) {
    checkedSwatchSymbols.add(checkbox.dataset.paletteSwatchCheck);
  } else {
    checkedSwatchSymbols.delete(checkbox.dataset.paletteSwatchCheck);
  }
  render();
});

elements.sourceList?.addEventListener("click", (event) => {
  const tile = event.target.closest("[data-palette-source-index]");
  if (!tile) {
    return;
  }

  const swatch = sourceSwatchRows[Number(tile.dataset.paletteSourceIndex)];
  if (swatch) {
    selectedSourceSwatch = swatch;
    applyResult(repository.toggleSourceSwatchPin(swatch));
  }
});

runInitialQueryState();
render();
renderPaletteGeneratorPreview("Palette generator preview ready.");
