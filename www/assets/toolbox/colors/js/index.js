import {
  callServerToolFunction,
  createServerRepositoryClient,
  readServerToolConstants,
  requireServerConstant,
} from "../../../../../src/api/server-api-client.js";

const constants = readServerToolConstants("palette");

export const PALETTE_SOURCE_USER = requireServerConstant(constants, "PALETTE_SOURCE_USER", "palette");
export const PALETTE_TOOL_KEY = requireServerConstant(constants, "PALETTE_TOOL_KEY", "palette");
export const PALETTE_WORKSPACE_PATH = requireServerConstant(constants, "PALETTE_WORKSPACE_PATH", "palette");
export const CURATED_PALETTE_COLLECTIONS = Object.freeze(requireServerConstant(constants, "CURATED_PALETTE_COLLECTIONS", "palette"));
export const NUMERIC_VARIANT_COUNTS = Object.freeze(requireServerConstant(constants, "NUMERIC_VARIANT_COUNTS", "palette"));
export const PALETTE_GENERATOR_DEFAULTS = Object.freeze(requireServerConstant(constants, "PALETTE_GENERATOR_DEFAULTS", "palette"));
export const PALETTE_VARIANTS = Object.freeze(requireServerConstant(constants, "PALETTE_VARIANTS", "palette"));
export const PICKER_PREVIEW_DEFAULTS = Object.freeze(requireServerConstant(constants, "PICKER_PREVIEW_DEFAULTS", "palette"));
export const PICKER_PREVIEW_SORT_OPTIONS = Object.freeze(requireServerConstant(constants, "PICKER_PREVIEW_SORT_OPTIONS", "palette"));
export const SIZE_OPTIONS = Object.freeze(requireServerConstant(constants, "SIZE_OPTIONS", "palette"));
export const SORT_OPTIONS = Object.freeze(requireServerConstant(constants, "SORT_OPTIONS", "palette"));
export const SUGGESTED_TAGS = Object.freeze(requireServerConstant(constants, "SUGGESTED_TAGS", "palette"));

export function createGameWorkspacePaletteApiRepository(options = {}) {
  return createServerRepositoryClient("palette", options);
}

export function normalizePaletteSwatchInput(input) {
  return callServerToolFunction("palette", "normalizePaletteSwatchInput", input);
}

export function validatePaletteSwatchInput(input, existingSwatches, options) {
  return callServerToolFunction("palette", "validatePaletteSwatchInput", input, existingSwatches, options);
}

const params = new URLSearchParams(window.location.search);

const repository = createGameWorkspacePaletteApiRepository();


const PALETTE_SORTER = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base"
});


let editorIssues = [];
let editorTags = [];
let harmonyRows = [];
const userSortState = { direction: "asc", key: "hue" };
const previewSortState = { direction: "asc", key: "default" };
let userSizeState = "medium";
let lastGeneratorPointerActivation = { at: 0, tile: null };
const checkedSwatchKeys = new Set();
const selectedTagFilters = new Set();
let tagMatchMode = "any";
const invalidHexPreviewValue = "#FFFFFF";
const GENERATED_SWATCH_SOURCE = "generated";

const elements = {
  activeProject: document.querySelector("[data-palette-active-project]"),
  add: document.querySelector("[data-palette-add]"),
  clear: document.querySelector("[data-palette-clear]"),
  clearChecked: document.querySelector("[data-palette-clear-checked]"),
  clearTagFilters: document.querySelector("[data-palette-clear-tag-filters]"),
  count: document.querySelector("[data-palette-count]"),
  editorDiagnostic: document.querySelector("[data-palette-editor-diagnostic]"),
  form: document.querySelector("[data-palette-user-swatch-form]"),
  harmonyAddAll: document.querySelector("[data-palette-harmony-add-all]"),
  harmonyGuidance: document.querySelector("[data-palette-harmony-guidance]"),
  harmonyList: document.querySelector("[data-palette-harmony-list]"),
  harmonyMatch: document.querySelector("[data-palette-harmony-match]"),
  harmonyScheme: document.querySelector("[data-palette-harmony-scheme]"),
  generatorColors: document.querySelector("[data-palette-generator-colors]"),
  generatorCollection: document.querySelector("[data-palette-theme-collection]"),
  generatorContrast: document.querySelector("[data-palette-generator-contrast]"),
  generatorContrastValue: document.querySelector("[data-palette-generator-contrast-value]"),
  generatorGridSummary: document.querySelector("[data-palette-generator-grid-summary]"),
  generatorHueShift: document.querySelector("[data-palette-generator-hue-shift]"),
  generatorHueShiftValue: document.querySelector("[data-palette-generator-hue-shift-value]"),
  generatorPreview: document.querySelector("[data-palette-generator-preview]"),
  generatorPreviewStatus: document.querySelector("[data-palette-generator-preview-status]"),
  generatorReset: document.querySelector("[data-palette-generator-reset]"),
  generatorSaturation: document.querySelector("[data-palette-generator-saturation]"),
  generatorSaturationValue: document.querySelector("[data-palette-generator-saturation-value]"),
  generatorStepRange: document.querySelector("[data-palette-generator-step-range]"),
  generatorStepRangeValue: document.querySelector("[data-palette-generator-step-range-value]"),
  generatorStatus: document.querySelector("[data-palette-generator-status]"),
  generatorSteps: document.querySelector("[data-palette-generator-steps]"),
  generatorType: document.querySelector("[data-palette-generator-type]"),
  generatorVariant: document.querySelector("[data-palette-generator-variant]"),
  hex: document.querySelector("[data-palette-hex]"),
  hexPreview: document.querySelector("[data-palette-user-hex-preview]"),
  log: document.querySelector("[data-palette-log]"),
  name: document.querySelector("[data-palette-name]"),
  projectDiagnostic: document.querySelector("[data-palette-project-diagnostic]"),
  projectOverlay: document.querySelector("[data-palette-project-overlay]"),
  previewBrightness: document.querySelector("[data-palette-preview-brightness]"),
  previewBrightnessValue: document.querySelector("[data-palette-preview-brightness-value]"),
  previewControls: document.querySelector("[data-palette-preview-controls]"),
  previewHue: document.querySelector("[data-palette-preview-hue]"),
  previewHueValue: document.querySelector("[data-palette-preview-hue-value]"),
  previewReset: document.querySelector("[data-palette-preview-reset]"),
  previewSaturation: document.querySelector("[data-palette-preview-saturation]"),
  previewSaturationValue: document.querySelector("[data-palette-preview-saturation-value]"),
  redo: document.querySelector("[data-palette-redo]"),
  restorePickerSettings: document.querySelector("[data-palette-restore-picker-settings]"),
  selectedSummary: document.querySelector("[data-palette-selected-summary]"),
  selectedHex: document.querySelector("[data-palette-selected-hex]"),
  selectedName: document.querySelector("[data-palette-selected-name]"),
  showDuplicates: document.querySelector("[data-palette-show-duplicates]"),
  storagePath: document.querySelector("[data-palette-storage-path]"),
  tableCounts: document.querySelector("[data-palette-table-counts]"),
  tags: document.querySelector("[data-palette-tags]"),
  tagsHelpList: document.querySelector("[data-palette-tags-help-list]"),
  tagSuggestions: document.querySelector("[data-palette-tag-suggestions]"),
  tagMatchModes: document.querySelectorAll("[data-palette-tag-match-mode]"),
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

function swatchKey(swatch) {
  return swatch?.key || "";
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

function renderPickerPreviewSortButtons() {
  if (!elements.previewControls) {
    return;
  }
  elements.previewControls.replaceChildren();
  PICKER_PREVIEW_SORT_OPTIONS.forEach((option) => {
    const button = document.createElement("button");
    const active = previewSortState.key === option.key;
    button.className = active ? "btn btn--compact primary" : "btn btn--compact";
    button.type = "button";
    button.dataset.palettePreviewSortKey = option.key;
    button.textContent = active && option.key !== "default"
      ? `${option.label} ${sortDirectionCaret(previewSortState.direction)}`
      : option.label;
    button.setAttribute("aria-label", `Picker Preview sort ${option.label}${active ? ` ${previewSortState.direction}` : ""}`);
    button.setAttribute("aria-pressed", String(active));
    elements.previewControls.append(button);
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

function hexToRgb(hex) {
  const normalized = String(hex || "").replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(normalized)) {
    return { red: 0, green: 0, blue: 0 };
  }
  return {
    red: Number.parseInt(normalized.slice(0, 2), 16),
    green: Number.parseInt(normalized.slice(2, 4), 16),
    blue: Number.parseInt(normalized.slice(4, 6), 16)
  };
}

function rgbToHex({ red, green, blue }) {
  return `#${componentToHex(red)}${componentToHex(green)}${componentToHex(blue)}`.toUpperCase();
}

function rgbToHsl({ red, green, blue }) {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;

  if (max === min) {
    return { hue: 0, saturation: 0, lightness: lightness * 100 };
  }

  const delta = max - min;
  const saturation = lightness > 0.5
    ? delta / (2 - max - min)
    : delta / (max + min);
  let hue;
  if (max === r) {
    hue = (g - b) / delta + (g < b ? 6 : 0);
  } else if (max === g) {
    hue = (b - r) / delta + 2;
  } else {
    hue = (r - g) / delta + 4;
  }

  return {
    hue: hue * 60,
    saturation: saturation * 100,
    lightness: lightness * 100
  };
}

function swatchColorKey(hex) {
  return String(hex || "").trim().toUpperCase().slice(0, 7);
}

function colorFamilyName(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return "Generated Color";
  }
  const hsl = rgbToHsl(rgb);
  if (hsl.saturation < 8) {
    return hsl.lightness < 30 ? "Dark Gray" : hsl.lightness > 72 ? "Light Gray" : "Neutral Gray";
  }
  const hue = positiveHue(hsl.hue);
  if (hue < 20 || hue >= 340) return "Red";
  if (hue < 45) return "Orange";
  if (hue < 70) return "Yellow";
  if (hue < 165) return "Green";
  if (hue < 195) return "Cyan";
  if (hue < 255) return "Blue";
  if (hue < 290) return "Violet";
  if (hue < 340) return "Magenta";
  return "Generated Color";
}

function pinnedSwatchForHex(hex, snapshot = repository.getSnapshot()) {
  const colorKey = swatchColorKey(hex);
  if (!colorKey) {
    return null;
  }
  return snapshot.swatches.find((swatch) => swatchColorKey(swatch.hex) === colorKey) || null;
}

function selectedOptionText(element) {
  return element?.selectedOptions?.[0]?.textContent || element?.value || "";
}

function currentPickerSettings(settings = readPaletteGeneratorSettings()) {
  return {
    activeTags: [...selectedTagFilters],
    colors: settings.colors,
    contrast: settings.contrast,
    hueShift: settings.hueShift,
    paletteType: settings.paletteType?.name || selectedOptionText(elements.generatorType),
    previewBrightness: settings.previewBrightness,
    previewHue: settings.previewHue,
    previewSaturation: settings.previewSaturation,
    saturation: settings.saturation,
    sortDirection: previewSortState.key === "default" ? userSortState.direction : previewSortState.direction,
    sortField: previewSortState.key === "default" ? userSortState.key : previewSortState.key,
    stepRange: settings.stepRange,
    steps: settings.steps,
    swatchSize: userSizeState,
    themeCollection: settings.collection?.name || selectedOptionText(elements.generatorCollection),
    variant: settings.variant?.label || selectedOptionText(elements.generatorVariant),
    variantValue: settings.variant?.value || elements.generatorVariant?.value || ""
  };
}

function metadataFromPickerSettings(swatch, settings = null) {
  const stored = settings && typeof settings === "object" ? settings : {};
  return {
    activeTags: Array.isArray(stored.activeTags) ? [...stored.activeTags] : [],
    colors: stored.colors ?? "",
    contrast: stored.contrast ?? "",
    hex: swatch?.hex || "",
    hueShift: stored.hueShift ?? "",
    name: swatch?.name || "",
    paletteType: stored.paletteType || "Custom",
    pickerSettings: stored,
    previewBrightness: stored.previewBrightness ?? "",
    previewHue: stored.previewHue ?? "",
    previewSaturation: stored.previewSaturation ?? "",
    saturation: stored.saturation ?? "",
    sortDirection: stored.sortDirection || "",
    sortField: stored.sortField || "",
    source: swatch?.source || "",
    stepRange: stored.stepRange ?? "",
    steps: stored.steps ?? "",
    swatchSize: stored.swatchSize || "",
    tags: Array.isArray(swatch?.tags) ? [...swatch.tags] : [],
    themeCollection: stored.themeCollection || "User Defined",
    variant: stored.variant || "",
    variantValue: stored.variantValue || ""
  };
}

function swatchMetadata(swatch, sourceLabel = "") {
  const metadata = swatch?.metadata && typeof swatch.metadata === "object" ? swatch.metadata : {};
  const pickerSettings = swatch?.pickerSettings || metadata.pickerSettings || null;
  return {
    ...metadataFromPickerSettings({
      hex: swatch?.hex || metadata.hex,
      name: swatch?.name || metadata.name,
      source: sourceLabel || swatch?.source || metadata.source,
      tags: Array.isArray(swatch?.tags) ? swatch.tags : metadata.tags
    }, pickerSettings),
    ...metadata,
    hex: swatch?.hex || metadata.hex || "",
    name: swatch?.name || metadata.name || "",
    paletteType: metadata.paletteType || pickerSettings?.paletteType || "Custom",
    source: sourceLabel || metadata.source || swatch?.source || "",
    tags: Array.isArray(swatch?.tags) ? [...swatch.tags] : Array.isArray(metadata.tags) ? [...metadata.tags] : [],
    themeCollection: metadata.themeCollection || pickerSettings?.themeCollection || "User Defined"
  };
}

function pickerTooltipText(swatch, settings = swatch?.pickerSettings) {
  const metadata = swatchMetadata({ ...swatch, pickerSettings: settings });
  return [
    `Name: ${metadata.name || "Generated color"}`,
    `Hex: ${metadata.hex || "Not stored"}`,
    `Theme: ${metadata.themeCollection || "User Defined"}`,
    `Palette Type: ${metadata.paletteType || "Custom"}`
  ].join("\n");
}

function interpolateHex(swatchesToInterpolate, column, columns) {
  if (!Array.isArray(swatchesToInterpolate) || swatchesToInterpolate.length === 0) {
    return "#000000";
  }
  if (columns <= 1) {
    return swatchesToInterpolate[0];
  }
  if (columns === swatchesToInterpolate.length) {
    return swatchesToInterpolate[column];
  }
  const scaled = (column / (columns - 1)) * (swatchesToInterpolate.length - 1);
  const leftIndex = Math.floor(scaled);
  const rightIndex = Math.min(swatchesToInterpolate.length - 1, Math.ceil(scaled));
  const amount = scaled - leftIndex;
  const left = hexToRgb(swatchesToInterpolate[leftIndex]);
  const right = hexToRgb(swatchesToInterpolate[rightIndex]);
  return rgbToHex({
    red: left.red + (right.red - left.red) * amount,
    green: left.green + (right.green - left.green) * amount,
    blue: left.blue + (right.blue - left.blue) * amount
  });
}

function createSelectOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

function paletteCollectionsWithSwatches() {
  return CURATED_PALETTE_COLLECTIONS.filter((collection) => (
    collection.types.some((type) => Array.isArray(type.swatches) && type.swatches.length > 0)
  ));
}

function alphaName(left, right) {
  return PALETTE_SORTER.compare(left.name || left.label || "", right.name || right.label || "");
}

function sortedPaletteCollections() {
  return [...paletteCollectionsWithSwatches()].sort(alphaName);
}

function paletteTypesWithSwatches(collection) {
  return (collection?.types || []).filter((type) => Array.isArray(type.swatches) && type.swatches.length > 0);
}

function sortedPaletteTypes(collection) {
  return paletteTypesWithSwatches(collection).sort(alphaName);
}

function sortedPaletteVariants() {
  const fullVariant = PALETTE_VARIANTS.find((variant) => variant.value === "full") || PALETTE_VARIANTS[0];
  return [
    fullVariant,
    ...PALETTE_VARIANTS
      .filter((variant) => variant !== fullVariant)
      .sort(alphaName)
  ];
}

function selectedThemeCollection() {
  const selected = elements.generatorCollection?.value;
  return paletteCollectionsWithSwatches().find((collection) => collection.name === selected)
    || paletteCollectionsWithSwatches()[0]
    || null;
}

function selectedPaletteType(collection = selectedThemeCollection()) {
  const selected = elements.generatorType?.value;
  return paletteTypesWithSwatches(collection).find((type) => type.name === selected)
    || paletteTypesWithSwatches(collection)[0]
    || null;
}

function selectedPaletteVariant() {
  const selected = elements.generatorVariant?.value;
  return PALETTE_VARIANTS.find((variant) => variant.value === selected) || PALETTE_VARIANTS[0];
}

function renderThemeCollectionOptions() {
  if (!elements.generatorCollection) {
    return;
  }
  const current = elements.generatorCollection.value;
  const collections = paletteCollectionsWithSwatches();
  const preferred = current && collections.some((collection) => collection.name === current)
    ? current
    : collections[0]?.name;
  elements.generatorCollection.replaceChildren();
  sortedPaletteCollections().forEach((collection) => {
    elements.generatorCollection.append(createSelectOption(collection.name, collection.name));
  });
  if (preferred) {
    elements.generatorCollection.value = preferred;
  }
}

function renderPaletteTypeOptions() {
  if (!elements.generatorType) {
    return;
  }
  const current = elements.generatorType.value;
  const collection = selectedThemeCollection();
  const types = paletteTypesWithSwatches(collection);
  const preferred = current && types.some((type) => type.name === current)
    ? current
    : types[0]?.name;
  elements.generatorType.replaceChildren();
  sortedPaletteTypes(collection).forEach((type) => {
    elements.generatorType.append(createSelectOption(type.name, type.name));
  });
  if (preferred) {
    elements.generatorType.value = preferred;
  }
}

function renderPaletteVariantOptions() {
  if (!elements.generatorVariant) {
    return;
  }
  const current = elements.generatorVariant.value;
  elements.generatorVariant.replaceChildren();
  sortedPaletteVariants().forEach((variant) => {
    elements.generatorVariant.append(createSelectOption(variant.value, variant.label));
  });
  if (current && PALETTE_VARIANTS.some((variant) => variant.value === current)) {
    elements.generatorVariant.value = current;
  } else {
    elements.generatorVariant.value = "full";
  }
}

function syncVariantColorCount() {
  const count = NUMERIC_VARIANT_COUNTS[selectedPaletteVariant().value];
  if (!count || !elements.generatorColors) {
    return;
  }
  elements.generatorColors.value = String(count);
}

function initializePaletteGeneratorSelectors() {
  renderThemeCollectionOptions();
  renderPaletteTypeOptions();
  renderPaletteVariantOptions();
}

function variantAdjustedHsl(hsl, variant, column, columns, lightnessBounds = { minimum: 0, maximum: 100 }) {
  const safeHueSequence = [210, 35, 265, 175, 45, 320, 95, 15];
  const colorBlindHue = safeHueSequence[column % safeHueSequence.length];
  const variantTransforms = {
    "color-blind-safe": () => ({
      hue: hsl.hue * 0.25 + colorBlindHue * 0.75,
      saturation: clampNumber(Math.max(hsl.saturation, 56), 0, 82),
      lightness: clampNumber(hsl.lightness, 24, 76)
    }),
    dawn: () => ({
      hue: hsl.hue + 12,
      saturation: hsl.saturation * 0.85,
      lightness: hsl.lightness + 6
    }),
    day: () => ({
      hue: hsl.hue,
      saturation: hsl.saturation,
      lightness: hsl.lightness + 8
    }),
    dusk: () => ({
      hue: hsl.hue - 12,
      saturation: hsl.saturation * 0.85,
      lightness: hsl.lightness - 6
    }),
    grayscale: () => ({
      hue: hsl.hue,
      saturation: 0,
      lightness: hsl.lightness
    }),
    "high-contrast": () => ({
      hue: hsl.hue,
      saturation: Math.min(100, hsl.saturation * 1.18 + 8),
      lightness: hsl.lightness >= 50
        ? clampNumber(hsl.lightness + 10, 12, 88)
        : clampNumber(hsl.lightness - 10, 12, 88)
    }),
    night: () => ({
      hue: hsl.hue,
      saturation: hsl.saturation * 0.8,
      lightness: hsl.lightness - 16
    }),
    "print-friendly": () => ({
      hue: hsl.hue,
      saturation: hsl.saturation * 0.55,
      lightness: clampNumber(hsl.lightness, 24, 76)
    }),
    summer: () => ({
      hue: hsl.hue - 6,
      saturation: hsl.saturation * 1.1,
      lightness: hsl.lightness + 6
    }),
    winter: () => ({
      hue: hsl.hue + 18,
      saturation: hsl.saturation * 0.65,
      lightness: hsl.lightness + 4
    })
  };
  const transformed = variantTransforms[variant.value]?.() || hsl;
  return {
    hue: positiveHue(transformed.hue),
    saturation: clampNumber(transformed.saturation, 0, 100),
    lightness: clampNumber(transformed.lightness, lightnessBounds.minimum, lightnessBounds.maximum)
  };
}

function generatorLightness(baseLightness, row, rows, contrast, stepRange = PALETTE_GENERATOR_DEFAULTS.stepRange) {
  if (rows <= 1) {
    return clampNumber(baseLightness, 0, 100);
  }
  const rowPosition = (row / (rows - 1)) * 2 - 1;
  const normalizedStepRange = clampNumber(stepRange, 0, 100);
  const magnitude = Math.abs(rowPosition);
  if (magnitude === 0) {
    return clampNumber(baseLightness, 0, 100);
  }
  const direction = rowPosition < 0 ? 1 : -1;
  const defaultDistance = 2 + clampNumber(contrast, 0, 100) * 0.31;
  const subtleTarget = clampNumber(baseLightness + direction * 2 * magnitude, 10, 90);
  const defaultTarget = clampNumber(baseLightness + direction * defaultDistance * magnitude, 10, 90);
  const extremeTarget = baseLightness + direction * (direction > 0 ? 100 - baseLightness : baseLightness) * magnitude;
  if (normalizedStepRange <= PALETTE_GENERATOR_DEFAULTS.stepRange) {
    const defaultRatio = normalizedStepRange / PALETTE_GENERATOR_DEFAULTS.stepRange;
    return subtleTarget + (defaultTarget - subtleTarget) * defaultRatio;
  }
  const extremeRatio = (normalizedStepRange - PALETTE_GENERATOR_DEFAULTS.stepRange) / PALETTE_GENERATOR_DEFAULTS.stepRange;
  return defaultTarget + (extremeTarget - defaultTarget) * extremeRatio;
}

function actualPaletteGeneratorRows(steps) {
  return Math.max(1, Math.round(clampNumber(Number(steps) || 0, 0, 64)) * 2 + 1);
}

function readPaletteGeneratorSettings() {
  const collection = selectedThemeCollection();
  const paletteType = selectedPaletteType(collection);
  const variant = selectedPaletteVariant();
  return {
    collection,
    paletteType,
    variant,
    colors: clampNumber(parseGeneratorNumber(elements.generatorColors, 8), 1, 256),
    steps: Math.round(clampNumber(parseGeneratorNumber(elements.generatorSteps, PALETTE_GENERATOR_DEFAULTS.steps), 0, 64)),
    contrast: clampNumber(parseGeneratorNumber(elements.generatorContrast, PALETTE_GENERATOR_DEFAULTS.contrast), 0, 100),
    saturation: clampNumber(parseGeneratorNumber(elements.generatorSaturation, PALETTE_GENERATOR_DEFAULTS.saturation), 0, 100),
    hueShift: clampNumber(parseGeneratorNumber(elements.generatorHueShift, PALETTE_GENERATOR_DEFAULTS.hueShift), -180, 180),
    stepRange: clampNumber(parseGeneratorNumber(elements.generatorStepRange, PALETTE_GENERATOR_DEFAULTS.stepRange), 0, 100),
    previewHue: clampNumber(parseGeneratorNumber(elements.previewHue, PICKER_PREVIEW_DEFAULTS.hue), -180, 180),
    previewSaturation: clampNumber(parseGeneratorNumber(elements.previewSaturation, PICKER_PREVIEW_DEFAULTS.saturation), 0, 200),
    previewBrightness: clampNumber(parseGeneratorNumber(elements.previewBrightness, PICKER_PREVIEW_DEFAULTS.brightness), 0, 200)
  };
}

function formatPercentSliderValue(value) {
  return `${Math.round(Number(value) || 0)}%`;
}

function formatHueShiftSliderValue(value) {
  const rounded = Math.round(Number(value) || 0);
  return `${rounded > 0 ? "+" : ""}${rounded}°`;
}

function renderPaletteGeneratorSliderValues(settings = readPaletteGeneratorSettings()) {
  setText(elements.generatorContrastValue, formatPercentSliderValue(settings.contrast));
  setText(elements.generatorSaturationValue, formatPercentSliderValue(settings.saturation));
  setText(elements.generatorHueShiftValue, formatHueShiftSliderValue(settings.hueShift));
  setText(elements.generatorStepRangeValue, formatPercentSliderValue(settings.stepRange));
  setText(elements.previewHueValue, formatHueShiftSliderValue(settings.previewHue));
  setText(elements.previewSaturationValue, formatPercentSliderValue(settings.previewSaturation));
  setText(elements.previewBrightnessValue, formatPercentSliderValue(settings.previewBrightness));
}

function pickerPreviewAdjustedHsl(hsl, settings) {
  return {
    hue: positiveHue(hsl.hue + settings.previewHue),
    saturation: clampNumber(hsl.saturation * (settings.previewSaturation / 100), 0, 100),
    lightness: clampNumber(hsl.lightness * (settings.previewBrightness / 100), 0, 100)
  };
}

function generatorSwatchName(settings, row, column, hex) {
  const collection = settings.collection?.name || "Colors";
  const type = settings.paletteType?.name || "Generated";
  const variant = settings.variant?.label || "Full";
  const curatedNames = Array.isArray(settings.paletteType?.names) ? settings.paletteType.names : [];
  const family = settings.colors === curatedNames.length && curatedNames[column]
    ? curatedNames[column]
    : colorFamilyName(hex);
  return `${collection} ${type} ${variant} ${family} ${swatchColorKey(hex)}`;
}

function showDuplicatePickerSwatches() {
  return elements.showDuplicates ? elements.showDuplicates.checked : true;
}

function duplicatePickerHexReasons(swatches) {
  const columnHexGroups = new Map();
  swatches.forEach((swatch) => {
    const key = `${swatch.column}:${swatchColorKey(swatch.hex)}`;
    const group = columnHexGroups.get(key) || [];
    group.push(swatch);
    columnHexGroups.set(key, group);
  });

  const reasons = new Map();
  columnHexGroups.forEach((group) => {
    if (group.length <= 1) {
      return;
    }
    const topRow = Math.min(...group.map((swatch) => swatch.row));
    group.forEach((swatch) => {
      if (swatch.row !== topRow) {
        reasons.set(`${swatch.row}:${swatch.column}`, "Duplicate Hex in Column");
      }
    });
  });
  return reasons;
}

function generatedPickerSwatches(settings = readPaletteGeneratorSettings()) {
  if (!settings.collection || !settings.paletteType) {
    return [];
  }
  const pickerSettings = currentPickerSettings(settings);
  const swatches = [];
  const rows = actualPaletteGeneratorRows(settings.steps);
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < settings.colors; column += 1) {
      const baseHex = interpolateHex(settings.paletteType.swatches, column, settings.colors);
      const baseHsl = rgbToHsl(hexToRgb(baseHex));
      const adjusted = variantAdjustedHsl({
        hue: baseHsl.hue + settings.hueShift,
        saturation: baseHsl.saturation * (settings.saturation / 100),
        lightness: generatorLightness(baseHsl.lightness, row, rows, settings.contrast, settings.stepRange)
      }, settings.variant, column, settings.colors);
      const previewAdjusted = pickerPreviewAdjustedHsl(adjusted, settings);
      const hex = hslToHex(previewAdjusted.hue, previewAdjusted.saturation, previewAdjusted.lightness);
      const swatch = {
        hex,
        name: generatorSwatchName(settings, row, column, hex),
        pickerSettings,
        source: GENERATED_SWATCH_SOURCE,
        tags: []
      };
      swatches.push({
        ...swatch,
        column,
        label: settings.paletteType.name,
        metadata: metadataFromPickerSettings(swatch, pickerSettings),
        row
      });
    }
  }
  return swatches;
}

function createGeneratorPreviewInput(hex, label, row, column, settings, options = {}) {
  const swatch = document.createElement("div");
  swatch.className = "palette-generator-preview-swatch";
  swatch.setAttribute("role", "button");
  swatch.tabIndex = 0;
  swatch.dataset.paletteGeneratorSwatch = "";
  swatch.dataset.paletteGeneratorRow = String(row);
  swatch.dataset.paletteGeneratorColumn = String(column);
  swatch.dataset.paletteGeneratorFamily = label;
  swatch.dataset.paletteGeneratorCollection = settings.collection?.name || "";
  swatch.dataset.paletteGeneratorTypeName = settings.paletteType?.name || "";
  swatch.dataset.paletteGeneratorVariantName = settings.variant?.label || "";
  swatch.dataset.paletteGeneratorHex = hex;
  swatch.dataset.palettePinned = String(Boolean(options.pinned));
  swatch.dataset.paletteSelected = "false";
  swatch.dataset.paletteGeneratorName = options.pinnedSwatch?.name || generatorSwatchName(settings, row, column, hex);
  swatch.dataset.paletteGeneratorAvailability = options.available === false ? "unavailable" : "available";
  swatch.dataset.paletteGeneratorUnavailable = String(options.available === false);
  swatch.dataset.paletteGeneratorUnavailableReason = options.unavailableReason || "";
  swatch.dataset.paletteGeneratorDuplicateHidden = String(Boolean(options.hideDuplicate));
  const swatchName = generatorSwatchName(settings, row, column, hex);
  const tooltipSwatch = {
    hex,
    name: options.pinnedSwatch?.name || swatchName,
    pickerSettings: options.pickerSettings
  };
  swatch.setAttribute("aria-label", options.available === false
    ? `${options.unavailableReason || "Unavailable"} picker swatch ${swatchName}`
    : `${options.pinned ? "Remove" : "Add"} picker swatch ${swatchName}`);
  swatch.setAttribute("aria-pressed", String(Boolean(options.pinned)));

  const visual = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  visual.classList.add("palette-generator-preview-color");
  visual.dataset.paletteGeneratorColor = hex;
  visual.dataset.paletteGeneratorFamily = label;
  visual.dataset.paletteGeneratorVisibleColor = options.hideDuplicate ? "transparent" : hex;
  visual.setAttribute("aria-hidden", "true");
  visual.setAttribute("focusable", "false");
  visual.setAttribute("preserveAspectRatio", "none");
  visual.setAttribute("viewBox", "0 0 1 1");
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("width", "1");
  rect.setAttribute("height", "1");
  rect.setAttribute("fill", options.hideDuplicate ? "transparent" : hex);
  visual.append(rect);

  swatch.title = pickerTooltipText(tooltipSwatch, options.pickerSettings);
  swatch.append(visual);
  if (options.available !== false) {
    swatch.append(createPinIndicator(Boolean(options.pinned)));
  }
  return swatch;
}

function pickerPreviewSortValue(swatch, key) {
  if (key === "default") {
    return (swatch.row * 1000) + swatch.column;
  }
  const hsl = rgbToHsl(hexToRgb(swatch.hex));
  if (key === "hue") {
    return positiveHue(hsl.hue);
  }
  if (key === "saturation") {
    return hsl.saturation;
  }
  if (key === "brightness") {
    return hsl.lightness;
  }
  return (swatch.row * 1000) + swatch.column;
}

function sortedPickerPreviewSwatches(swatches, settings) {
  if (previewSortState.key === "default") {
    return swatches.map((swatch) => ({
      ...swatch,
      displayColumn: swatch.column,
      displayRow: swatch.row
    }));
  }
  const direction = previewSortState.direction === "desc" ? -1 : 1;
  return [...swatches]
    .sort((left, right) => {
      const primary = pickerPreviewSortValue(left, previewSortState.key) - pickerPreviewSortValue(right, previewSortState.key);
      if (primary !== 0) {
        return primary * direction;
      }
      return ((left.row * settings.colors) + left.column) - ((right.row * settings.colors) + right.column);
    })
    .map((swatch, index) => ({
      ...swatch,
      displayColumn: index % settings.colors,
      displayRow: Math.floor(index / settings.colors)
    }));
}

function appendPickerRows(fragment, allSwatches, settings) {
  const rows = new Map();
  allSwatches.forEach((item) => {
    const displayRow = item.displayRow ?? item.row;
    const displayColumn = item.displayColumn ?? item.column;
    const rowItems = rows.get(displayRow) || new Map();
    rowItems.set(displayColumn, item);
    rows.set(displayRow, rowItems);
  });
  [...rows.entries()]
    .sort(([left], [right]) => left - right)
    .forEach(([row, rowItems]) => {
      const rowElement = document.createElement("div");
      rowElement.className = "palette-generator-preview-row";
      rowElement.setAttribute("role", "row");
      rowElement.dataset.paletteGeneratorPreviewRow = String(row);
      for (let column = 0; column < settings.colors; column += 1) {
        const item = rowItems.get(column);
        if (item) {
          rowElement.append(createGeneratorPreviewInput(item.hex, settings.paletteType.name, item.displayRow ?? item.row, item.displayColumn ?? item.column, settings, {
            available: item.available,
            pinned: Boolean(item.pinnedSwatch),
            pinnedSwatch: item.pinnedSwatch,
            selected: item.selected,
            unavailableReason: item.unavailableReason,
            hideDuplicate: item.duplicateHidden,
            pickerSettings: currentPickerSettings(settings)
          }));
        }
      }
      fragment.append(rowElement);
    });
}

function renderPaletteGeneratorPreview(action = "Picker Preview updated.") {
  if (!elements.generatorPreview) {
    return;
  }

  const settings = readPaletteGeneratorSettings();
  renderPaletteGeneratorSliderValues(settings);
  const rows = actualPaletteGeneratorRows(settings.steps);
  const showDuplicates = showDuplicatePickerSwatches();
  const snapshot = repository.getSnapshot();
  if (!settings.collection || !settings.paletteType) {
    elements.generatorPreview.replaceChildren();
    setText(elements.generatorPreviewStatus, "No curated picker swatches are available for the selected collection and type.");
    setText(elements.generatorStatus, "Picker Preview missing curated swatches.");
    return;
  }

  const allSwatches = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < settings.colors; column += 1) {
      const baseHex = interpolateHex(settings.paletteType.swatches, column, settings.colors);
      const baseHsl = rgbToHsl(hexToRgb(baseHex));
      const adjusted = variantAdjustedHsl({
        hue: baseHsl.hue + settings.hueShift,
        saturation: baseHsl.saturation * (settings.saturation / 100),
        lightness: generatorLightness(baseHsl.lightness, row, rows, settings.contrast, settings.stepRange)
      }, settings.variant, column, settings.colors);
      const previewAdjusted = pickerPreviewAdjustedHsl(adjusted, settings);
      const hex = hslToHex(previewAdjusted.hue, previewAdjusted.saturation, previewAdjusted.lightness);
      const pinnedSwatch = pinnedSwatchForHex(hex, snapshot);
      allSwatches.push({
        column,
        hex,
        pinnedSwatch,
        row
      });
    }
  }
  const duplicateReasons = duplicatePickerHexReasons(allSwatches);
  let availableCount = 0;
  allSwatches.forEach((swatch) => {
    const unavailableReason = duplicateReasons.get(`${swatch.row}:${swatch.column}`) || "";
    swatch.unavailableReason = unavailableReason;
    swatch.available = !unavailableReason;
    swatch.duplicateHidden = Boolean(unavailableReason && !showDuplicates);
    if (swatch.available && !swatch.pinnedSwatch) {
      availableCount += 1;
    }
  });

  const fragment = document.createDocumentFragment();
  appendPickerRows(fragment, sortedPickerPreviewSwatches(allSwatches, settings), settings);

  elements.generatorPreview.replaceChildren(fragment);
  setText(elements.generatorPreviewStatus, `Available Picker Swatches (${availableCount})`);
  setText(elements.generatorGridSummary, `Grid ${settings.colors} x ${rows}`);
  setText(elements.generatorStatus, action);
}

function generatedSwatchFromTile(tile) {
  const pickerSettings = currentPickerSettings();
  const swatch = {
    hex: tile.dataset.paletteGeneratorHex,
    name: tile.dataset.paletteGeneratorName,
    pickerSettings,
    source: GENERATED_SWATCH_SOURCE,
    tags: []
  };
  return {
    ...swatch,
    metadata: metadataFromPickerSettings(swatch, pickerSettings)
  };
}

function activateGeneratorPreviewTile(tile) {
  if (!tile) {
    return;
  }
  if (tile.dataset.paletteGeneratorUnavailable === "true") {
    const reason = tile.dataset.paletteGeneratorUnavailableReason || "Unavailable";
    setText(elements.log, `${reason} picker swatch has no pin and was not added.`);
    setText(elements.generatorStatus, `${reason} picker swatch remains visible with its original color, but add is blocked.`);
    return;
  }
  const swatch = generatedSwatchFromTile(tile);
  const pinnedSwatch = pinnedSwatchForHex(swatch.hex);
  const removing = tile.dataset.palettePinned === "true" && pinnedSwatch;
  const result = removing
    ? repository.removeSwatch(swatchKey(pinnedSwatch))
    : repository.pinSourceSwatch(swatch);
  applyResult({
    ...result,
    message: result.ok
      ? removing
        ? `Removed picker swatch ${swatch.name} from Project Swatches.`
        : `Added picker swatch ${swatch.name} to Project Swatches.`
      : result.message
  });
}

function currentHarmonyMatchSwatches() {
  return generatedPickerSwatches(readPaletteGeneratorSettings()).map((swatch) => ({
    hex: swatch.hex,
    metadata: swatch.metadata,
    name: swatch.name,
    pickerSettings: swatch.pickerSettings,
    source: GENERATED_SWATCH_SOURCE,
    tags: swatch.tags
  }));
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
  if (elements.generatorStepRange) {
    elements.generatorStepRange.value = String(PALETTE_GENERATOR_DEFAULTS.stepRange);
  }
  renderPaletteGeneratorPreview("Picker controls reset.");
}

function resetPickerPreviewControls() {
  if (elements.previewHue) {
    elements.previewHue.value = String(PICKER_PREVIEW_DEFAULTS.hue);
  }
  if (elements.previewSaturation) {
    elements.previewSaturation.value = String(PICKER_PREVIEW_DEFAULTS.saturation);
  }
  if (elements.previewBrightness) {
    elements.previewBrightness.value = String(PICKER_PREVIEW_DEFAULTS.brightness);
  }
  renderPaletteGeneratorPreview("Picker Preview controls reset to default.");
}

function resetPaletteGeneratorSlider(control) {
  if (!control) {
    return;
  }
  if (control === elements.generatorContrast) {
    control.value = String(PALETTE_GENERATOR_DEFAULTS.contrast);
  } else if (control === elements.generatorSaturation) {
    control.value = String(PALETTE_GENERATOR_DEFAULTS.saturation);
  } else if (control === elements.generatorHueShift) {
    control.value = String(PALETTE_GENERATOR_DEFAULTS.hueShift);
  } else if (control === elements.generatorStepRange) {
    control.value = String(PALETTE_GENERATOR_DEFAULTS.stepRange);
  } else if (control === elements.previewHue) {
    control.value = String(PICKER_PREVIEW_DEFAULTS.hue);
  } else if (control === elements.previewSaturation) {
    control.value = String(PICKER_PREVIEW_DEFAULTS.saturation);
  } else if (control === elements.previewBrightness) {
    control.value = String(PICKER_PREVIEW_DEFAULTS.brightness);
  }
  renderPaletteGeneratorPreview(`${control.labels?.[0]?.textContent || "Slider"} reset to default.`);
}

function setSelectValueByTextOrValue(select, preferredValue, preferredText) {
  if (!select) {
    return false;
  }
  const option = [...select.options].find((item) => (
    item.value === String(preferredValue || "") || item.textContent === String(preferredText || "")
  ));
  if (!option) {
    return false;
  }
  select.value = option.value;
  return true;
}

function applyPickerSettings(settings = null) {
  if (!settings || typeof settings !== "object") {
    setText(elements.log, "Restore Picker Settings unavailable: selected swatch has no stored picker settings.");
    return;
  }
  setSelectValueByTextOrValue(elements.generatorCollection, settings.themeCollection, settings.themeCollection);
  renderPaletteTypeOptions();
  setSelectValueByTextOrValue(elements.generatorType, settings.paletteType, settings.paletteType);
  renderPaletteVariantOptions();
  setSelectValueByTextOrValue(elements.generatorVariant, settings.variantValue, settings.variant);
  if (elements.generatorColors && settings.colors) elements.generatorColors.value = String(settings.colors);
  if (elements.generatorSteps && settings.steps !== undefined) elements.generatorSteps.value = String(settings.steps);
  if (elements.generatorContrast && settings.contrast !== undefined) elements.generatorContrast.value = String(settings.contrast);
  if (elements.generatorSaturation && settings.saturation !== undefined) elements.generatorSaturation.value = String(settings.saturation);
  if (elements.generatorHueShift && settings.hueShift !== undefined) elements.generatorHueShift.value = String(settings.hueShift);
  if (elements.generatorStepRange && settings.stepRange !== undefined) elements.generatorStepRange.value = String(settings.stepRange);
  if (elements.previewHue && settings.previewHue !== undefined) elements.previewHue.value = String(settings.previewHue);
  if (elements.previewSaturation && settings.previewSaturation !== undefined) elements.previewSaturation.value = String(settings.previewSaturation);
  if (elements.previewBrightness && settings.previewBrightness !== undefined) elements.previewBrightness.value = String(settings.previewBrightness);
  if (settings.sortField && PICKER_PREVIEW_SORT_OPTIONS.some((option) => option.key === settings.sortField)) {
    previewSortState.key = settings.sortField;
  }
  if (["asc", "desc"].includes(settings.sortDirection)) {
    previewSortState.direction = settings.sortDirection;
  }
  if (settings.swatchSize && SIZE_OPTIONS.some((option) => option.key === settings.swatchSize)) {
    userSizeState = settings.swatchSize;
  }
  selectedTagFilters.clear();
  (Array.isArray(settings.activeTags) ? settings.activeTags : []).forEach((tag) => selectedTagFilters.add(tag));
  render();
  renderPaletteGeneratorPreview(`Restored picker settings from ${settings.paletteType || "selected swatch"}.`);
  setText(elements.log, `Restored picker settings from ${settings.themeCollection || "stored"} / ${settings.paletteType || "type"} / ${settings.variant || "variant"}.`);
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
  const metadata = swatchMetadata(swatch, sourceLabel);
  return [
    `Name: ${metadata.name || swatch.name}`,
    `Hex: ${metadata.hex || swatch.hex}`,
    `Theme: ${metadata.themeCollection || "User Defined"}`,
    `Palette Type: ${metadata.paletteType || "Custom"}`
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
  const metadata = swatchMetadata(swatch, sourceLabel);
  Object.entries(metadata).forEach(([key, value]) => {
    if (Array.isArray(value) || (value && typeof value === "object")) {
      tile.dataset[`paletteMetadata${key[0].toUpperCase()}${key.slice(1)}`] = JSON.stringify(value);
    } else {
      tile.dataset[`paletteMetadata${key[0].toUpperCase()}${key.slice(1)}`] = String(value ?? "");
    }
  });
  tile.setAttribute("aria-label", options.label || `${selected ? "Selected. " : ""}${swatchTileLabel(swatch, options.action || "Select color")}`);
  tile.setAttribute("aria-pressed", String(Boolean(options.pressed)));
  tile.title = options.tooltip || swatchTooltipText(swatch, sourceLabel);
  if (selected) {
    tile.setAttribute("aria-current", "true");
  }

  if (options.swatchRow) {
    tile.dataset.paletteSwatchKey = swatchKey(swatch);
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
  wrapper.dataset.paletteSwatchItem = swatchKey(swatch);

  const checkbox = document.createElement("input");
  checkbox.className = "palette-swatch-check";
  checkbox.type = "checkbox";
  checkbox.checked = checkedSwatchKeys.has(swatchKey(swatch));
  checkbox.dataset.paletteSwatchCheck = swatchKey(swatch);
  checkbox.setAttribute("aria-label", `Apply Tags to ${swatch.name}`);
  checkbox.title = `Apply Tags to ${swatch.name}`;

  wrapper.append(createSwatchTile(swatch, options), checkbox);
  return wrapper;
}

function normalizeTag(value) {
  return String(value || "").trim().toLowerCase();
}

function readUserSwatchForm() {
  const swatch = {
    hex: elements.hex?.value,
    name: elements.name?.value,
    source: PALETTE_SOURCE_USER,
    tags: []
  };
  return {
    ...swatch,
    metadata: metadataFromPickerSettings(swatch, null)
  };
}

function fillUserSwatchForm(swatch) {
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

function checkedSwatchKeysFromSnapshot(snapshot) {
  const activeKeys = new Set(snapshot.swatches.map(swatchKey));
  [...checkedSwatchKeys].forEach((key) => {
    if (!activeKeys.has(key)) {
      checkedSwatchKeys.delete(key);
    }
  });
  return [...checkedSwatchKeys];
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
  setDisabled([elements.hex, elements.name, elements.clear], locked);
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
  const suggestions = [...new Map(
    [...activeTags(), ...SUGGESTED_TAGS]
      .map((tag) => [normalizeTag(tag), tag])
      .filter(([tag]) => tag && !editorTags.includes(tag))
  ).values()];
  elements.tagSuggestions.replaceChildren();
  suggestions
    .filter((tag) => query && normalizeTag(tag).includes(query))
    .forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag;
      elements.tagSuggestions.append(option);
    });
}

function renderTagHelpSuggestions() {
  if (!elements.tagsHelpList) {
    return;
  }
  elements.tagsHelpList.replaceChildren();
  SUGGESTED_TAGS.forEach((tag) => {
    elements.tagsHelpList.append(createListItem(tag));
  });
}

function acceptTagFromInput() {
  const tag = normalizeTag(elements.tags?.value);
  if (!tag) {
    return;
  }
  const snapshot = repository.getSnapshot();
  const checkedKeys = checkedSwatchKeysFromSnapshot(snapshot);
  if (!snapshot.selectedSwatch && !checkedKeys.length) {
    editorIssues = [{
      action: "Select a Project Swatches color before adding tags.",
      field: "tags",
      label: "Tags"
    }];
    render();
    return;
  }
  const result = checkedKeys.length
    ? repository.addTagToSwatches(checkedKeys, tag)
    : repository.updateSelectedSwatchTags([...editorTags, tag]);
  if (elements.tags) {
    elements.tags.value = "";
  }
  applyResult(result);
}

function renderPaletteControls() {
  renderSortButtons(elements.userSort, userSortState, "Project Swatches");
  renderSizeButtons(elements.userSize, userSizeState, "Project Swatches");
  renderPickerPreviewSortButtons();
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
    activeProject ? "Colors edits save live to the active project." : "Active project required."
  );
  setHidden(elements.projectOverlay, !snapshot.projectRequired);
  if (selectedSwatch && !userSwatch) {
    fillUserSwatchForm(null);
  }
  renderUserDefinedControlState(snapshot);
}

function renderSelectedSwatchEditor(snapshot) {
  const selectedSwatch = snapshot.selectedSwatch;
  if (elements.selectedHex) elements.selectedHex.value = selectedSwatch?.hex || "";
  if (elements.selectedName) elements.selectedName.value = selectedSwatch?.name || "";
  if (elements.tags) elements.tags.value = "";
  editorTags = Array.isArray(selectedSwatch?.tags) ? [...selectedSwatch.tags] : [];
  setDisabled([elements.selectedHex, elements.selectedName], true);
  const checkedKeys = checkedSwatchKeysFromSnapshot(snapshot);
  setDisabled(selectedTagControls(), snapshot.projectRequired || snapshot.validation.status === "Reject" || (!selectedSwatch && !checkedKeys.length));
  setDisabled(elements.clearChecked, checkedKeys.length === 0);
  setDisabled(elements.restorePickerSettings, !selectedSwatch?.pickerSettings);
  setText(
    elements.editorDiagnostic,
    checkedKeys.length
      ? `Adding tags to ${checkedKeys.length} checked swatch${checkedKeys.length === 1 ? "" : "es"}.`
      : selectedSwatch ? `Editing tags for ${selectedSwatch.name}.` : "Select a Project Swatches color to edit tags."
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
  setText(elements.storagePath, "Colors storage contract active.");
}

function renderUserPalette(snapshot) {
  if (!elements.userList) {
    return;
  }

  elements.userList.replaceChildren();
  const activeFilters = [...selectedTagFilters];
  const matchesTagFilters = (swatch) => {
    if (!activeFilters.length) {
      return true;
    }
    return tagMatchMode === "all"
      ? activeFilters.every((tag) => swatch.tags.includes(tag))
      : activeFilters.some((tag) => swatch.tags.includes(tag));
  };
  const swatches = repository.listSwatches({
    sortDirection: userSortState.direction,
    sortKey: userSortState.key
  }).filter(matchesTagFilters);
  if (swatches.length === 0) {
    const message = document.createElement("p");
    message.className = "status";
    message.textContent = snapshot.projectRequired
      ? "Open a project before editing project swatches."
      : activeFilters.length ? "No Project Swatches colors match checked tags." : "No Project Swatches colors yet.";
    elements.userList.append(message);
    return;
  }

  checkedSwatchKeysFromSnapshot(snapshot);
  swatches.forEach((swatch) => {
    elements.userList.append(createCheckedSwatchTile(swatch, {
      action: "Select Project Swatches color",
      pinned: true,
      pressed: swatchKey(snapshot.selectedSwatch) === swatchKey(swatch),
      selected: swatchKey(snapshot.selectedSwatch) === swatchKey(swatch),
      size: userSizeState,
      swatchRow: true
    }));
  });
}

function renderTags(snapshot) {
  if (!elements.tagsList) {
    return;
  }

  setDisabled(elements.clearTagFilters, selectedTagFilters.size === 0);
  elements.tagMatchModes?.forEach((control) => {
    control.checked = control.value === tagMatchMode;
  });
  const tags = [...new Set(snapshot.swatches.flatMap((swatch) => swatch.tags))].sort((left, right) => left.localeCompare(right));
  [...selectedTagFilters].forEach((tag) => {
    if (!tags.includes(tag)) {
      selectedTagFilters.delete(tag);
    }
  });
  elements.tagsList.replaceChildren();
  if (!tags.length) {
    elements.tagsList.append(createListItem("No tags in Project Swatches."));
    return;
  }
  tags.forEach((tag) => {
    const item = document.createElement("li");
    const label = document.createElement("label");
    label.className = "field-inline";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = selectedTagFilters.has(tag);
    checkbox.dataset.paletteTagFilter = tag;
    checkbox.setAttribute("aria-label", `Filter Project Swatches by tag ${tag}`);
    const text = document.createElement("span");
    text.textContent = tag;
    label.append(checkbox, text);
    item.append(label);
    elements.tagsList.append(item);
  });
}

function renderHarmony(snapshot) {
  if (!elements.harmonyList) {
    return;
  }

  elements.harmonyList.replaceChildren();
  const baseSwatch = snapshot.selectedSwatch;
  harmonyRows = baseSwatch
    ? repository.createHarmonySuggestions(baseSwatch, {
        matchSwatches: currentHarmonyMatchSwatches(),
        matchSource: elements.harmonyMatch?.value || "calculated",
        schemeId: elements.harmonyScheme?.value || "complementary"
      })
    : [];

  if (!baseSwatch) {
    elements.harmonyList.append(createStatusMessage("Select a project or source color to view scheme suggestions."));
    setText(elements.harmonyGuidance, "Select a project or source color to view scheme suggestions.");
    setDisabled(elements.harmonyAddAll, true);
    return;
  }

  if (harmonyRows.length === 0) {
    elements.harmonyList.append(createStatusMessage("No harmony scheme colors available."));
    setText(elements.harmonyGuidance, "No harmony scheme colors are available for the selected color.");
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
    row.append(createCell(displayColorsTableName(count.table)), createCell(String(count.rows)));
    elements.tableCounts.append(row);
  });
}

function displayColorsTableName(tableName) {
  const names = {
    palette_colors: "Project Swatches",
    palette_swatch_usages: "Swatch Usage",
    project_workspace_palette_globals: "Project Swatch Settings"
  };
  return names[tableName] || tableName;
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
      label: "Invalid Colors Payload"
    }];
    setText(elements.log, "Invalid Colors payload rejected before render.");
    return;
  }

  checkedSwatchKeysFromSnapshot(snapshot);
  renderPaletteControls();
  renderProject(snapshot);
  renderSelectedSwatchEditor(snapshot);
  renderSummary(snapshot);
  renderValidation(snapshot);
  renderUserPalette(snapshot);
  renderTags(snapshot);
  renderHarmony(snapshot);
  renderTables(snapshot);
  renderEditorTags();
  renderTagSuggestions();
  renderTagHelpSuggestions();
}

function applyResult(result) {
  editorIssues = result.issues || [];
  if (result.snapshot) {
    fillUserSwatchForm(selectedUserDefinedSwatch(result.snapshot));
  }
  setText(elements.log, result.message);
  setText(elements.userSwatchDiagnostic, result.message);
  render();
  renderPaletteGeneratorPreview("Picker Preview refreshed.");
}

function validateUserSwatch() {
  const snapshot = repository.getSnapshot();
  if (snapshot.projectRequired) {
    editorIssues = snapshot.validation.findings;
  } else {
    editorIssues = validatePaletteSwatchInput(
      readUserSwatchForm(),
      snapshot.swatches,
    { excludeKey: swatchKey(snapshot.selectedSwatch) }
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
            { hex: "#12", name: "" }
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
  checkedSwatchKeys.clear();
  setText(elements.log, "Cleared checked Project Swatches.");
  setText(elements.editorDiagnostic, "Cleared checked Project Swatches.");
  render();
});

elements.undo?.addEventListener("click", () => {
  applyResult(repository.undo());
});

elements.redo?.addEventListener("click", () => {
  applyResult(repository.redo());
});

elements.restorePickerSettings?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  applyPickerSettings(repository.getSnapshot().selectedSwatch?.pickerSettings);
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

elements.generatorPreview?.addEventListener("pointerup", (event) => {
  if (event.button !== 0) {
    return;
  }
  const tile = event.target.closest("[data-palette-generator-swatch]");
  if (!tile) {
    return;
  }
  lastGeneratorPointerActivation = { at: performance.now(), tile };
  activateGeneratorPreviewTile(tile);
});

elements.generatorPreview?.addEventListener("click", (event) => {
  const tile = event.target.closest("[data-palette-generator-swatch]");
  if (!tile) {
    return;
  }
  if (lastGeneratorPointerActivation.tile === tile && performance.now() - lastGeneratorPointerActivation.at < 500) {
    return;
  }
  activateGeneratorPreviewTile(tile);
});

elements.generatorPreview?.addEventListener("keydown", (event) => {
  if (![" ", "Enter"].includes(event.key)) {
    return;
  }
  const tile = event.target.closest("[data-palette-generator-swatch]");
  if (!tile) {
    return;
  }
  event.preventDefault();
  tile.click();
});

elements.showDuplicates?.addEventListener("click", (event) => {
  event.stopPropagation();
});

elements.showDuplicates?.addEventListener("change", (event) => {
  event.stopPropagation();
  renderPaletteGeneratorPreview(event.target.checked
    ? "Showing duplicate picker swatches."
    : "Hiding duplicate picker swatches.");
});

elements.previewControls?.addEventListener("click", (event) => {
  event.stopPropagation();
  const button = event.target.closest("[data-palette-preview-sort-key]");
  if (!button) {
    return;
  }
  const nextKey = button.dataset.palettePreviewSortKey;
  if (nextKey === "default") {
    previewSortState.key = "default";
    previewSortState.direction = "asc";
  } else if (previewSortState.key === nextKey) {
    previewSortState.direction = previewSortState.direction === "asc" ? "desc" : "asc";
  } else {
    previewSortState.key = nextKey;
    previewSortState.direction = "asc";
  }
  renderPaletteControls();
  renderPaletteGeneratorPreview(`Picker Preview sorted by ${button.textContent.trim()}.`);
});

elements.generatorCollection?.addEventListener("change", () => {
  renderPaletteTypeOptions();
  renderPaletteGeneratorPreview();
});

elements.generatorType?.addEventListener("change", () => renderPaletteGeneratorPreview());

elements.generatorVariant?.addEventListener("change", () => {
  syncVariantColorCount();
  renderPaletteGeneratorPreview();
});

[
  elements.generatorColors,
  elements.generatorSteps
].forEach((control) => {
  control?.addEventListener("change", () => renderPaletteGeneratorPreview());
});

elements.generatorSteps?.addEventListener("input", () => renderPaletteGeneratorPreview());
elements.generatorColors?.addEventListener("input", () => renderPaletteGeneratorPreview());

[
  elements.generatorContrast,
  elements.generatorSaturation,
  elements.generatorHueShift,
  elements.generatorStepRange
].forEach((control) => {
  control?.addEventListener("input", () => renderPaletteGeneratorPreview());
  control?.addEventListener("dblclick", () => resetPaletteGeneratorSlider(control));
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
      action: "Select a project or source color before adding harmony colors.",
      field: "harmony",
      label: "Harmony"
    }];
    render();
    return;
  }
  applyResult(repository.addHarmonySuggestions(harmonyRows));
});

elements.userList?.addEventListener("click", (event) => {
  const tile = event.target.closest("[data-palette-swatch-key]");
  if (!tile) {
    return;
  }

  const pin = event.target.closest("[data-palette-pin-indicator]");
  if (pin) {
    const deletingSelected = tile.dataset.paletteSelected === "true";
    const result = repository.removeSwatch(tile.dataset.paletteSwatchKey);
    if (deletingSelected || !result.snapshot.selectedSwatch) {
      fillUserSwatchForm(selectedUserDefinedSwatch(result.snapshot));
    }
    applyResult(result);
    return;
  }

  const snapshot = repository.selectSwatch(tile.dataset.paletteSwatchKey);
  fillUserSwatchForm(selectedUserDefinedSwatch(snapshot));
  editorIssues = [];
  render();
});

elements.userList?.addEventListener("change", (event) => {
  const checkbox = event.target.closest("[data-palette-swatch-check]");
  if (!checkbox) {
    return;
  }

  if (checkbox.checked) {
    checkedSwatchKeys.add(checkbox.dataset.paletteSwatchCheck);
  } else {
    checkedSwatchKeys.delete(checkbox.dataset.paletteSwatchCheck);
  }
  render();
});

elements.tagsList?.addEventListener("change", (event) => {
  const checkbox = event.target.closest("[data-palette-tag-filter]");
  if (!checkbox) {
    return;
  }
  if (checkbox.checked) {
    selectedTagFilters.add(checkbox.dataset.paletteTagFilter);
  } else {
    selectedTagFilters.delete(checkbox.dataset.paletteTagFilter);
  }
  setText(
    elements.log,
    selectedTagFilters.size
      ? `Filtered Project Swatches by ${[...selectedTagFilters].join(", ")}.`
      : "Cleared Project Swatches tag filters."
  );
  render();
  renderPaletteGeneratorPreview("Picker Preview refreshed.");
});

elements.clearTagFilters?.addEventListener("click", () => {
  selectedTagFilters.clear();
  setText(elements.log, "Cleared Project Swatches tag filters.");
  render();
  renderPaletteGeneratorPreview("Picker Preview refreshed.");
});

elements.tagMatchModes?.forEach((control) => {
  control.addEventListener("change", () => {
    if (!control.checked) {
      return;
    }
    tagMatchMode = control.value === "all" ? "all" : "any";
    setText(elements.log, `Project Swatches tag match mode: ${control.nextElementSibling?.textContent || control.value}.`);
    render();
  });
});

initializePaletteGeneratorSelectors();
runInitialQueryState();
render();
renderPaletteGeneratorPreview("Picker Preview ready.");
