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

const SUGGESTED_TAGS = Object.freeze([
  "UI",
  "Main Palette",
  "Panel Background",
  "Panel Border",
  "Primary Button",
  "Secondary Button",
  "Warning",
  "Success",
  "Error",
  "Info",
  "Menu",
  "HUD",
  "Health",
  "Mana",
  "Stamina",
  "Score",
  "Timer",
  "Player",
  "Enemy",
  "Boss",
  "NPC",
  "Item",
  "Pickup",
  "Power Up",
  "Terrain",
  "Grass",
  "Dirt",
  "Stone",
  "Metal",
  "Wood",
  "Water",
  "Fire",
  "Ice",
  "Poison",
  "Lightning",
  "Shadow",
  "Highlight",
  "Outline",
  "Sprite",
  "Tile",
  "Background",
  "Foreground",
  "Platform",
  "Door",
  "Key",
  "Trap",
  "Projectile",
  "Particle",
  "Explosion",
  "Winter",
  "Summer",
  "Night",
  "Day",
  "Cave",
  "Castle",
  "Forest",
  "Jungle",
  "Desert",
  "Ocean",
  "Space",
  "Cyberpunk",
  "Retro",
  "8-Bit",
  "16-Bit"
]);

const PALETTE_GENERATOR_DEFAULTS = Object.freeze({
  contrast: 40,
  saturation: 100,
  hueShift: 0
});

function swatches(values) {
  return Object.freeze(values.split(/\s+/).filter(Boolean));
}

const PALETTE_VARIANTS = Object.freeze([
  { label: "Full", value: "full" },
  { label: "32 colors", value: "32" },
  { label: "16 colors", value: "16" },
  { label: "8 colors", value: "8" },
  { label: "4 colors", value: "4" },
  { label: "High Contrast", value: "high-contrast" },
  { label: "Color Blind Safe", value: "color-blind-safe" },
  { label: "Grayscale", value: "grayscale" },
  { label: "Print Friendly", value: "print-friendly" },
  { label: "Day", value: "day" },
  { label: "Night", value: "night" },
  { label: "Dawn", value: "dawn" },
  { label: "Dusk", value: "dusk" },
  { label: "Winter", value: "winter" },
  { label: "Summer", value: "summer" }
]);

const NUMERIC_VARIANT_COUNTS = Object.freeze({
  "32": 32,
  "16": 16,
  "8": 8,
  "4": 4
});

const CURATED_PALETTE_COLLECTIONS = Object.freeze([
  {
    name: "Nature",
    types: Object.freeze([
      { name: "Forest", swatches: swatches("#102A17 #1F4D25 #346B35 #5D8A3E #8FA653 #C0B36F #6F4B2E #24351F") },
      { name: "Jungle", swatches: swatches("#0E2F1D #136B38 #1F9651 #45B35F #8BCF55 #D5DA4E #F29E3D #2B6F64") },
      { name: "Desert", swatches: swatches("#4A2B1A #7A4A24 #A66D32 #D09A55 #E6C27A #F1DFA8 #B86F4B #5D4D42") },
      { name: "Mountain", swatches: swatches("#1E2930 #34434A #58666A #7F8D89 #A9B2A0 #D1C7A0 #7C6B55 #2F3B45") },
      { name: "Arctic", swatches: swatches("#183040 #2D5366 #4D7D8F #79AFC2 #B5DCE5 #E6F4F6 #9EAEB9 #3E4E63") },
      { name: "Swamp", swatches: swatches("#1B2414 #33401C #59612E #77733F #8C7F4E #4F6B47 #2E5A4C #614126") },
      { name: "Ocean", swatches: swatches("#061D34 #083A5B #0E6387 #168FA8 #37BBC1 #8EE0D1 #D4F2E6 #28517E") },
      { name: "Tropical", swatches: swatches("#006C70 #00A39B #32C56F #9FD356 #F4D35E #F29E4C #E85D75 #7F4AC8") }
    ])
  },
  {
    name: "ROYGBIV",
    types: Object.freeze([
      {
        name: "ROYGBIV",
        names: Object.freeze(["Red", "Orange", "Yellow", "Green", "Blue", "Indigo", "Violet"]),
        swatches: swatches("#FF0000 #FFA500 #FFFF00 #008000 #0000FF #4B0082 #EE82EE")
      }
    ])
  },
  {
    name: "Floral",
    types: Object.freeze([
      { name: "Rose Garden", swatches: swatches("#3A1020 #76223A #B9375E #E56B8A #F2A0A8 #FFD3C9 #446B3F #8FAE5D") },
      { name: "Spring Bloom", swatches: swatches("#6AA84F #93C47D #B6D7A8 #F9CB9C #F6B26B #EA9999 #C27BA0 #8E7CC3") },
      { name: "Wildflowers", swatches: swatches("#31572C #4F772D #90A955 #F9C74F #F9844A #F94144 #577590 #9B5DE5") },
      { name: "Lavender Field", swatches: swatches("#2E2245 #51406F #7561A8 #A38DCC #D1BCE3 #F0E4F5 #6E8B57 #B6B866") },
      { name: "Autumn Harvest", swatches: swatches("#3B1F12 #7A2E18 #B94E1F #D9822B #E9B44C #8A7F39 #5F6F2E #A4423D") }
    ])
  },
  {
    name: "Water",
    types: Object.freeze([
      { name: "Deep Ocean", swatches: swatches("#03111F #062B45 #0B4E73 #126D91 #1A8DA8 #5BB8C0 #A7D9D3 #1E3F68") },
      { name: "Tropical Reef", swatches: swatches("#004D61 #008F9A #00B8A9 #6BD6B5 #C8E675 #F9D56E #F08A5D #7B4E9D") },
      { name: "River", swatches: swatches("#20333A #31545E #4D7580 #70949A #A7B7AE #C9C7A6 #7F8C5C #4D5A3D") },
      { name: "Lake", swatches: swatches("#0B2636 #1A4B61 #3D7387 #6999A3 #A6C4C3 #D9E0D2 #6A7E64 #364A3D") },
      { name: "Storm Sea", swatches: swatches("#101820 #23313D #3B4A56 #65727B #8B969B #B7B7AC #31566D #1F2B3B") },
      { name: "Frozen Water", swatches: swatches("#153040 #2D5B70 #5A91A8 #8DC7D6 #C7EDF1 #F2FBFA #A8B8C8 #5B6D86") }
    ])
  },
  {
    name: "Elements",
    types: Object.freeze([
      { name: "Fire", swatches: swatches("#250505 #5A0F0F #9C1B16 #D94A1E #F47C20 #FFB238 #FFE06E #4A1F12") },
      { name: "Ice", swatches: swatches("#0C2735 #1B5268 #3F8FA8 #76C4D5 #BDEDF2 #F2FFFF #9CB7D3 #485E82") },
      { name: "Earth", swatches: swatches("#25170E #4B321F #74502E #9A7042 #BE955B #D7BF82 #5C6B38 #32482D") },
      { name: "Air", swatches: swatches("#D7F1F2 #A8DADC #7BC6D3 #5AA7C7 #8AB6E0 #E7D8A7 #F6F2D4 #6F8BA3") },
      { name: "Lightning", swatches: swatches("#1C1633 #3D2B6F #5F4BB6 #2EC4F1 #7FE7F5 #FFE66D #FFF3A3 #F9A620") },
      { name: "Poison", swatches: swatches("#1C1026 #3B1F5A #6A2D8F #8F3FB3 #A7C957 #6A994E #386641 #D6E681") },
      { name: "Crystal", swatches: swatches("#251A3D #4D3B78 #7F6EB2 #A997DF #D8C8FF #BDE0FE #74C0FC #3A86FF") }
    ])
  },
  {
    name: "Fantasy",
    types: Object.freeze([
      { name: "Medieval", swatches: swatches("#1F1B16 #4B3621 #7A542E #A67C45 #C7A76C #354F35 #5E7041 #7B2D26") },
      { name: "Dwarven", swatches: swatches("#1A1512 #3A2A22 #6E4D35 #9A6B3F #C58C47 #D8B45C #77706A #B23A24") },
      { name: "Elven", swatches: swatches("#12251D #25543E #4C8C63 #85B87A #C1D88A #E8DFA6 #89B6A6 #A789C5") },
      { name: "Dark Kingdom", swatches: swatches("#08070B #1E1A2B #3A2E4F #5E3F65 #7B2D3D #A63D40 #C9A45C #4A4A4A") },
      { name: "Magic", swatches: swatches("#17113A #332A78 #5946B2 #8B5FD3 #C77DFF #FF7AD9 #FFD166 #59C3C3") },
      { name: "Dragon", swatches: swatches("#1C1110 #4A1E18 #8A2F1D #C84C2A #E17A36 #F0B65A #2F5D46 #0E2A2B") }
    ])
  },
  {
    name: "Sci-Fi",
    types: Object.freeze([
      { name: "Space", swatches: swatches("#050814 #111A33 #243B6B #3D64A8 #6EA8FE #BFD7FF #F2E9E4 #7B4EAB") },
      { name: "Cyberpunk", swatches: swatches("#0A0614 #1B0C3B #4A148C #D000FF #00D9FF #00FF88 #FFE600 #FF2D75") },
      { name: "Alien World", swatches: swatches("#141522 #2B2D5C #5260A8 #5EC4A8 #8AD95E #D8F56E #FF8F5E #A24EA8") },
      { name: "Futuristic City", swatches: swatches("#11151C #263241 #405A6B #6E8AA0 #9DB6C7 #C9D6DF #FFB703 #00B4D8") },
      { name: "Robot Factory", swatches: swatches("#15191E #2B333D #4E5965 #7B8794 #AEB6BF #D8DEE4 #E76F51 #2A9D8F") }
    ])
  },
  {
    name: "Horror",
    types: Object.freeze([
      { name: "Haunted House", swatches: swatches("#0B0A0C #1C1A22 #332C3A #4D3A4F #6B4B3F #8C6D4F #B8A36A #3A4A35") },
      { name: "Gothic", swatches: swatches("#07070A #1B1720 #2E2636 #46384F #6F516C #8E6F88 #B7A28C #7C1D2A") },
      { name: "Blood Moon", swatches: swatches("#110509 #3A0B12 #6E1119 #A01821 #D13A2F #F06B3D #291A28 #5C4A5F") },
      { name: "Undead", swatches: swatches("#111510 #263026 #465642 #6F7C5E #9BA881 #C8C9A4 #5B4C5A #2C2E3A") },
      { name: "Lovecraft", swatches: swatches("#071315 #122D31 #1D555B #32807A #59A58E #9CC8A5 #47375D #2A1C3A") }
    ])
  },
  {
    name: "Modern",
    types: Object.freeze([
      { name: "City", swatches: swatches("#15191E #2E3740 #52616B #7B8794 #AEB6BF #E0E4E7 #DDA15E #3A86FF") },
      { name: "Industrial", swatches: swatches("#191716 #34312D #5B5650 #837B72 #A8A096 #D0C8BC #B35B31 #546A76") },
      { name: "Military", swatches: swatches("#151A13 #2E3A21 #4D5D2E #6C7A42 #8F955C #B8B585 #5B5141 #2F3E46") },
      { name: "Construction", swatches: swatches("#22160A #5A3510 #A96013 #E69520 #FFC857 #30343F #6C757D #E0E1DD") },
      { name: "Sports", swatches: swatches("#0B132B #1C2541 #3A506B #5BC0BE #F2F5EA #F4D35E #EE964B #F95738") }
    ])
  },
  {
    name: "Arcade",
    types: Object.freeze([
      { name: "Arcade 1978", swatches: swatches("#000000 #1B1B1B #FF0000 #FF7F00 #FFFF00 #00FF00 #00A2FF #FFFFFF") },
      { name: "Arcade 1980", swatches: swatches("#000000 #222034 #45283C #D95763 #D77BBA #8F974A #8A6F30 #E0F8CF") },
      { name: "Arcade 1985", swatches: swatches("#0F0F1B #29294A #3D6FB6 #38B6E8 #4FD65F #F9E858 #F08A38 #E84855") },
      { name: "Arcade 1990", swatches: swatches("#120D1F #2C1E4A #572C82 #B13EBA #FF4FB8 #00C2FF #00E676 #FFE15A") }
    ])
  },
  {
    name: "8-Bit",
    types: Object.freeze([
      { name: "NES Inspired", swatches: swatches("#0F0F0F #545454 #A80020 #F83800 #F8A800 #00A800 #0078F8 #FCFCFC") },
      { name: "Master System Inspired", swatches: swatches("#000000 #555555 #AA0000 #FF5500 #FFFF55 #00AA00 #5555FF #FFFFFF") },
      { name: "ZX Spectrum Inspired", swatches: swatches("#000000 #0000D7 #D70000 #D700D7 #00D700 #00D7D7 #D7D700 #FFFFFF") },
      { name: "Commodore 64 Inspired", swatches: swatches("#000000 #626262 #813338 #8E3C97 #553A9B #2C5D9F #56AC4D #B8C76F") },
      { name: "Game Boy Inspired", swatches: swatches("#0F380F #306230 #8BAC0F #9BBC0F #CBDC76 #E0F8D0 #5C7C1D #1E4A1E") }
    ])
  },
  {
    name: "16-Bit",
    types: Object.freeze([
      { name: "SNES Inspired", swatches: swatches("#0F0F2D #3C2A78 #6B4AB8 #A06CD5 #F2C14E #F78154 #4CB944 #E8F1F2") },
      { name: "Genesis Inspired", swatches: swatches("#050505 #1B1B3A #3A0CA3 #4361EE #4CC9F0 #F72585 #F8961E #F9F871") },
      { name: "TurboGrafx Inspired", swatches: swatches("#111111 #333366 #3F88C5 #44BBA4 #E94F37 #F6AE2D #F5F749 #F0F0F0") },
      { name: "Neo Geo Inspired", swatches: swatches("#080808 #27213C #5A189A #9D4EDD #F72585 #FF9E00 #70E000 #FFFFFF") }
    ])
  },
  {
    name: "32/64-Bit",
    types: Object.freeze([
      { name: "PlayStation Inspired", swatches: swatches("#101014 #2D2D35 #4A4E69 #6C757D #ADB5BD #E9ECEF #2F80ED #EB5757") },
      { name: "Nintendo 64 Inspired", swatches: swatches("#0B0B0B #3A3A3A #E63946 #F1C40F #2ECC71 #3498DB #9B59B6 #F7F7F7") },
      { name: "Saturn Inspired", swatches: swatches("#0D0D16 #252545 #4B4E8A #6979B8 #9AA7D9 #D2D8F0 #F2A65A #D94F70") }
    ])
  },
  {
    name: "Computer",
    types: Object.freeze([
      { name: "DOS VGA", swatches: swatches("#000000 #0000AA #00AA00 #00AAAA #AA0000 #AA00AA #AA5500 #FFFFFF") },
      { name: "EGA", swatches: swatches("#000000 #0000AA #00AA00 #00AAAA #AA0000 #AA00AA #AA5500 #AAAAAA") },
      { name: "CGA", swatches: swatches("#000000 #00AAAA #AA00AA #AAAAAA #0000AA #00AA00 #AA0000 #FFFFFF") },
      { name: "Amiga", swatches: swatches("#000000 #222244 #444488 #6C71C4 #B58900 #CB4B16 #859900 #FDF6E3") }
    ])
  }
]);

let editorIssues = [];
let editorTags = [];
let harmonyRows = [];
let selectedSourceSwatch = null;
let sourceSwatchRows = [];
const sourceSortState = { direction: "asc", key: "name" };
let sourceSizeState = "medium";
const userSortState = { direction: "asc", key: "hue" };
let userSizeState = "medium";
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
  generatorGenerate: document.querySelector("[data-palette-generator-generate]"),
  generatorHueShift: document.querySelector("[data-palette-generator-hue-shift]"),
  generatorPreview: document.querySelector("[data-palette-generator-preview]"),
  generatorPreviewStatus: document.querySelector("[data-palette-generator-preview-status]"),
  generatorReset: document.querySelector("[data-palette-generator-reset]"),
  generatorSaturation: document.querySelector("[data-palette-generator-saturation]"),
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
  redo: document.querySelector("[data-palette-redo]"),
  restorePickerSettings: document.querySelector("[data-palette-restore-picker-settings]"),
  selectedSummary: document.querySelector("[data-palette-selected-summary]"),
  selectedHex: document.querySelector("[data-palette-selected-hex]"),
  selectedName: document.querySelector("[data-palette-selected-name]"),
  sourceList: document.querySelector("[data-palette-source-list]"),
  sourcePinAll: document.querySelector("[data-palette-source-pin-all]"),
  sourceSearch: document.querySelector("[data-palette-source-search]"),
  sourceSelect: document.querySelector("[data-palette-source-select]"),
  sourceSize: document.querySelector("[data-palette-source-size]"),
  sourceSort: document.querySelector("[data-palette-source-sort]"),
  storagePath: document.querySelector("[data-palette-storage-path]"),
  tableCounts: document.querySelector("[data-palette-table-counts]"),
  tags: document.querySelector("[data-palette-tags]"),
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
    saturation: settings.saturation,
    sortDirection: userSortState.direction,
    sortField: userSortState.key,
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
    saturation: stored.saturation ?? "",
    sortDirection: stored.sortDirection || "",
    sortField: stored.sortField || "",
    source: swatch?.source || "",
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

function selectedThemeCollection() {
  const selected = elements.generatorCollection?.value;
  return paletteCollectionsWithSwatches().find((collection) => collection.name === selected)
    || paletteCollectionsWithSwatches()[0]
    || null;
}

function selectedPaletteType(collection = selectedThemeCollection()) {
  const selected = elements.generatorType?.value;
  return collection?.types.find((type) => type.name === selected && type.swatches.length > 0)
    || collection?.types.find((type) => type.swatches.length > 0)
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
  elements.generatorCollection.replaceChildren();
  paletteCollectionsWithSwatches().forEach((collection) => {
    elements.generatorCollection.append(createSelectOption(collection.name, collection.name));
  });
  if (current && paletteCollectionsWithSwatches().some((collection) => collection.name === current)) {
    elements.generatorCollection.value = current;
  }
}

function renderPaletteTypeOptions() {
  if (!elements.generatorType) {
    return;
  }
  const current = elements.generatorType.value;
  const collection = selectedThemeCollection();
  elements.generatorType.replaceChildren();
  collection?.types
    .filter((type) => Array.isArray(type.swatches) && type.swatches.length > 0)
    .forEach((type) => {
      elements.generatorType.append(createSelectOption(type.name, type.name));
    });
  if (current && collection?.types.some((type) => type.name === current && type.swatches.length > 0)) {
    elements.generatorType.value = current;
  }
}

function renderPaletteVariantOptions() {
  if (!elements.generatorVariant) {
    return;
  }
  const current = elements.generatorVariant.value;
  elements.generatorVariant.replaceChildren();
  PALETTE_VARIANTS.forEach((variant) => {
    elements.generatorVariant.append(createSelectOption(variant.value, variant.label));
  });
  if (current && PALETTE_VARIANTS.some((variant) => variant.value === current)) {
    elements.generatorVariant.value = current;
  }
}

function syncVariantColorCount() {
  const count = NUMERIC_VARIANT_COUNTS[selectedPaletteVariant().value];
  if (!count || !elements.generatorColors) {
    return;
  }
  const option = [...elements.generatorColors.options].find((item) => item.value === String(count));
  if (option) {
    elements.generatorColors.value = String(count);
  }
}

function initializePaletteGeneratorSelectors() {
  renderThemeCollectionOptions();
  renderPaletteTypeOptions();
  renderPaletteVariantOptions();
}

function variantAdjustedHsl(hsl, variant, column, columns) {
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
    lightness: clampNumber(transformed.lightness, 10, 90)
  };
}

function generatorLightness(baseLightness, row, rows, contrast) {
  if (rows <= 1) {
    return clampNumber(baseLightness, 10, 90);
  }
  const rowPosition = (row / (rows - 1)) * 2 - 1;
  const distance = 2 + clampNumber(contrast, 0, 100) * 0.31;
  return clampNumber(baseLightness - rowPosition * distance, 10, 90);
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
    steps: clampNumber(parseGeneratorNumber(elements.generatorSteps, 8), 2, 64),
    contrast: clampNumber(parseGeneratorNumber(elements.generatorContrast, PALETTE_GENERATOR_DEFAULTS.contrast), 0, 100),
    saturation: clampNumber(parseGeneratorNumber(elements.generatorSaturation, PALETTE_GENERATOR_DEFAULTS.saturation), 0, 100),
    hueShift: clampNumber(parseGeneratorNumber(elements.generatorHueShift, PALETTE_GENERATOR_DEFAULTS.hueShift), -180, 180)
  };
}

function generatorSwatchName(settings, row, column, hex) {
  const collection = settings.collection?.name || "Palette";
  const type = settings.paletteType?.name || "Generated";
  const variant = settings.variant?.label || "Full";
  const curatedNames = Array.isArray(settings.paletteType?.names) ? settings.paletteType.names : [];
  const family = settings.colors === curatedNames.length && curatedNames[column]
    ? curatedNames[column]
    : colorFamilyName(hex);
  return `${collection} ${type} ${variant} ${family} R${row + 1} C${column + 1}`;
}

function pickerUnavailableReason(pinnedSwatch) {
  return pinnedSwatch ? "Already in Project" : "";
}

function generatedPickerSwatches(settings = readPaletteGeneratorSettings()) {
  if (!settings.collection || !settings.paletteType) {
    return [];
  }
  const pickerSettings = currentPickerSettings(settings);
  const swatches = [];
  for (let row = 0; row < settings.steps; row += 1) {
    for (let column = 0; column < settings.colors; column += 1) {
      const baseHex = interpolateHex(settings.paletteType.swatches, column, settings.colors);
      const baseHsl = rgbToHsl(hexToRgb(baseHex));
      const adjusted = variantAdjustedHsl({
        hue: baseHsl.hue + settings.hueShift,
        saturation: baseHsl.saturation * (settings.saturation / 100),
        lightness: generatorLightness(baseHsl.lightness, row, settings.steps, settings.contrast)
      }, settings.variant, column, settings.colors);
      const hex = hslToHex(adjusted.hue, adjusted.saturation, adjusted.lightness);
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
  const swatch = document.createElement("button");
  swatch.className = "palette-generator-preview-swatch";
  swatch.type = "button";
  swatch.dataset.paletteGeneratorSwatch = "";
  swatch.dataset.paletteGeneratorRow = String(row);
  swatch.dataset.paletteGeneratorColumn = String(column);
  swatch.dataset.paletteGeneratorFamily = label;
  swatch.dataset.paletteGeneratorCollection = settings.collection?.name || "";
  swatch.dataset.paletteGeneratorTypeName = settings.paletteType?.name || "";
  swatch.dataset.paletteGeneratorVariantName = settings.variant?.label || "";
  swatch.dataset.paletteGeneratorHex = hex;
  swatch.dataset.palettePinned = String(Boolean(options.pinned));
  swatch.dataset.paletteSelected = String(Boolean(options.selected));
  swatch.dataset.paletteGeneratorName = options.pinnedSwatch?.name || generatorSwatchName(settings, row, column, hex);
  swatch.dataset.paletteGeneratorAvailability = options.available === false ? "unavailable" : "available";
  swatch.dataset.paletteGeneratorUnavailable = String(options.available === false);
  swatch.dataset.paletteGeneratorUnavailableReason = options.unavailableReason || "";
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
  if (options.selected) {
    swatch.setAttribute("aria-current", "true");
  }

  const input = document.createElement("input");
  input.type = "color";
  input.disabled = true;
  input.value = hex;
  input.dataset.paletteGeneratorColor = hex;
  input.dataset.paletteGeneratorFamily = label;
  input.setAttribute("aria-label", `${label} picker swatch ${hex}`);
  input.title = `${swatchName}${options.pinned ? " pinned" : ""}`;

  swatch.title = pickerTooltipText(tooltipSwatch, options.pickerSettings);
  swatch.append(input);
  if (options.available !== false) {
    swatch.append(createPinIndicator(Boolean(options.pinned)));
  }
  return swatch;
}

function appendPickerRows(fragment, allSwatches, settings) {
  const rows = new Map();
  allSwatches.forEach((item) => {
    const rowItems = rows.get(item.row) || new Map();
    rowItems.set(item.column, item);
    rows.set(item.row, rowItems);
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
          rowElement.append(createGeneratorPreviewInput(item.hex, settings.paletteType.name, item.row, item.column, settings, {
            available: item.available,
            pinned: Boolean(item.pinnedSwatch),
            pinnedSwatch: item.pinnedSwatch,
            selected: item.selected,
            unavailableReason: item.unavailableReason,
            pickerSettings: currentPickerSettings(settings)
          }));
        }
      }
      fragment.append(rowElement);
    });
}

function renderPaletteGeneratorPreview(action = "Palette generator preview updated.") {
  if (!elements.generatorPreview) {
    return;
  }

  const settings = readPaletteGeneratorSettings();
  const snapshot = repository.getSnapshot();
  if (!settings.collection || !settings.paletteType) {
    elements.generatorPreview.replaceChildren();
    setText(elements.generatorPreviewStatus, "No curated palette swatches are available for the selected collection and type.");
    setText(elements.generatorStatus, "Palette generator missing curated swatches.");
    return;
  }

  const allSwatches = [];
  let availableCount = 0;
  for (let row = 0; row < settings.steps; row += 1) {
    for (let column = 0; column < settings.colors; column += 1) {
      const baseHex = interpolateHex(settings.paletteType.swatches, column, settings.colors);
      const baseHsl = rgbToHsl(hexToRgb(baseHex));
      const adjusted = variantAdjustedHsl({
        hue: baseHsl.hue + settings.hueShift,
        saturation: baseHsl.saturation * (settings.saturation / 100),
        lightness: generatorLightness(baseHsl.lightness, row, settings.steps, settings.contrast)
      }, settings.variant, column, settings.colors);
      const hex = hslToHex(adjusted.hue, adjusted.saturation, adjusted.lightness);
      const pinnedSwatch = pinnedSwatchForHex(hex, snapshot);
      const unavailableReason = pickerUnavailableReason(pinnedSwatch);
      const available = !unavailableReason;
      if (available) {
        availableCount += 1;
      }
      allSwatches.push({
        available,
        column,
        hex,
        pinnedSwatch,
        row,
        selected: Boolean(pinnedSwatch && swatchKey(snapshot.selectedSwatch) === swatchKey(pinnedSwatch)),
        unavailableReason
      });
    }
  }

  const fragment = document.createDocumentFragment();
  appendPickerRows(fragment, allSwatches, settings);

  elements.generatorPreview.replaceChildren(fragment);
  setText(elements.generatorPreviewStatus, `Available Picker Swatches (${availableCount})`);
  setText(elements.generatorStatus, action);
}

function paletteGeneratorActionSummary(prefix = "Palette generator preview updated") {
  const settings = readPaletteGeneratorSettings();
  if (!settings.collection || !settings.paletteType) {
    return `${prefix}: no curated swatches resolved.`;
  }
  return `${prefix}: ${settings.collection.name} / ${settings.paletteType.name} / ${settings.variant.label}, ${settings.colors} colors x ${settings.steps} steps.`;
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
  renderPaletteGeneratorPreview("Palette generator controls reset.");
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
  if (elements.generatorSteps && settings.steps) elements.generatorSteps.value = String(settings.steps);
  if (elements.generatorContrast && settings.contrast !== undefined) elements.generatorContrast.value = String(settings.contrast);
  if (elements.generatorSaturation && settings.saturation !== undefined) elements.generatorSaturation.value = String(settings.saturation);
  if (elements.generatorHueShift && settings.hueShift !== undefined) elements.generatorHueShift.value = String(settings.hueShift);
  if (settings.sortField && SORT_OPTIONS.some((option) => option.key === settings.sortField)) {
    userSortState.key = settings.sortField;
  }
  if (["asc", "desc"].includes(settings.sortDirection)) {
    userSortState.direction = settings.sortDirection;
  }
  if (settings.swatchSize && SIZE_OPTIONS.some((option) => option.key === settings.swatchSize)) {
    userSizeState = settings.swatchSize;
  }
  selectedTagFilters.clear();
  (Array.isArray(settings.activeTags) ? settings.activeTags : []).forEach((tag) => selectedTagFilters.add(tag));
  render();
  renderPaletteGeneratorPreview(`Restored picker settings from ${settings.paletteType || "selected swatch"}.`);
  setText(elements.log, `Restored picker settings from ${settings.themeCollection || "stored"} / ${settings.paletteType || "palette"} / ${settings.variant || "variant"}.`);
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
  tile.setAttribute("aria-label", options.label || `${selected ? "Selected. " : ""}${swatchTileLabel(swatch, options.action || "Select palette color")}`);
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
  checkbox.setAttribute("aria-label", `Apply Project Palette Tags to ${swatch.name}`);
  checkbox.title = `Apply Project Palette Tags to ${swatch.name}`;

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
  setText(elements.storagePath, snapshot.palettePath);
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
      ? "Open a project before editing palette colors."
      : activeFilters.length ? "No Project Swatches colors match checked tags." : "No Project Swatches colors yet.";
    elements.userList.append(message);
    return;
  }

  checkedSwatchKeysFromSnapshot(snapshot);
  swatches.forEach((swatch) => {
    elements.userList.append(createCheckedSwatchTile(swatch, {
      action: "Select palette color",
      pinned: true,
      pressed: swatchKey(snapshot.selectedSwatch) === swatchKey(swatch),
      selected: swatchKey(snapshot.selectedSwatch) === swatchKey(swatch),
      size: userSizeState,
      swatchRow: true
    }));
  });
}

function sourcePaletteDiagnostic(snapshot) {
  return snapshot.sourcePaletteRecordCount > 0 && snapshot.sourcePaletteOptions.length === 0
    ? "Source palette records exist, but the source dropdown is empty. Check palette_source_swatches mock-DB records for valid source, palette key, hex, and name fields."
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
    elements.tagsList.append(createListItem("No tags in active palette."));
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
  const baseSwatch = snapshot.selectedSwatch || selectedSourceSwatch;
  const sourceId = elements.sourceSelect?.value || "";
  harmonyRows = baseSwatch
    ? repository.createHarmonySuggestions(baseSwatch, {
        matchSwatches: currentHarmonyMatchSwatches(),
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

  checkedSwatchKeysFromSnapshot(snapshot);
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
  renderPaletteGeneratorPreview("Palette generator preview refreshed.");
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

elements.restorePickerSettings?.addEventListener("click", () => {
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

elements.generatorPreview?.addEventListener("click", (event) => {
  const tile = event.target.closest("[data-palette-generator-swatch]");
  if (!tile) {
    return;
  }
  if (tile.dataset.paletteGeneratorUnavailable === "true") {
    const reason = tile.dataset.paletteGeneratorUnavailableReason || "Unavailable";
    setText(elements.log, `${reason} picker swatch is already present and was not added again.`);
    setText(elements.generatorStatus, `${reason} picker swatch remains visible with its original color, but duplicate add is blocked.`);
    return;
  }
  const swatch = generatedSwatchFromTile(tile);
  const result = tile.dataset.palettePinned === "true"
    ? repository.removeSwatch(swatchKey(pinnedSwatchForHex(swatch.hex)))
    : repository.pinSourceSwatch(swatch);
  applyResult({
    ...result,
    message: result.ok && tile.dataset.palettePinned !== "true"
      ? `Added picker swatch ${swatch.name} to Project Swatches.`
      : result.message
  });
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

[
  elements.generatorContrast,
  elements.generatorSaturation,
  elements.generatorHueShift
].forEach((control) => {
  control?.addEventListener("input", () => renderPaletteGeneratorPreview());
});

elements.generatorGenerate?.addEventListener("click", () => {
  const message = paletteGeneratorActionSummary("Generated palette grid");
  renderPaletteGeneratorPreview(message);
  setText(elements.log, message);
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
  const tile = event.target.closest("[data-palette-swatch-key]");
  if (!tile) {
    return;
  }

  const pin = event.target.closest("[data-palette-pin-indicator]");
  if (pin) {
    const deletingSelected = tile.dataset.paletteSelected === "true";
    const result = repository.removeSwatch(tile.dataset.paletteSwatchKey);
    selectedSourceSwatch = null;
    if (deletingSelected || !result.snapshot.selectedSwatch) {
      fillUserSwatchForm(selectedUserDefinedSwatch(result.snapshot));
    }
    applyResult(result);
    return;
  }

  const snapshot = repository.selectSwatch(tile.dataset.paletteSwatchKey);
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
  renderPaletteGeneratorPreview("Palette generator preview refreshed.");
});

elements.clearTagFilters?.addEventListener("click", () => {
  selectedTagFilters.clear();
  setText(elements.log, "Cleared Project Swatches tag filters.");
  render();
  renderPaletteGeneratorPreview("Palette generator preview refreshed.");
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

initializePaletteGeneratorSelectors();
runInitialQueryState();
render();
renderPaletteGeneratorPreview("Palette generator preview ready.");
