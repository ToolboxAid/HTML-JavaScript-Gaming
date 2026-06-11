import { createGameWorkspaceMockRepository } from "./game-workspace-mock-repository.js";
import {
  loadMockDbTables,
  MOCK_DB_KEYS,
  normalizeMockDbTables,
  saveMockDbTables,
} from "../mock-db-store.js";

export const PALETTE_TOOL_KEY = "palette-browser";
export const PALETTE_WORKSPACE_PATH = `tools.${PALETTE_TOOL_KEY}.swatches`;
export const PALETTE_SOURCE_USER = "user";
export const PALETTE_SOURCE_PALETTE_COLORS = "palette-colors";

export const PALETTE_TOOL_TABLES = Object.freeze([
  "palette_colors",
  "project_workspace_palette_globals",
  "palette_swatch_usages"
]);

const PALETTE_DB_OWNER = "palette";
const PALETTE_SYSTEM_USER_KEY = MOCK_DB_KEYS.users.forgeBot;

export const PALETTE_HARMONY_MATCH_SOURCES = Object.freeze([
  { id: "calculated", label: "Calculated" },
  { id: "source", label: "Current Picker Closest Match" },
  { id: "all", label: "All Picker Swatches Closest Match" }
]);

export const PALETTE_HARMONY_SCHEMES = Object.freeze([
  { id: "achromatic", label: "Achromatic", offsets: [0, 0, 0] },
  { id: "accented-analogous", label: "Accented Analogous", offsets: [-30, 0, 30, 180] },
  { id: "analogous", label: "Analogous", offsets: [-30, 0, 30] },
  { id: "complementary", label: "Complementary", offsets: [0, 180] },
  { id: "diadic", label: "Diadic", offsets: [0, 120] },
  { id: "double-complementary", label: "Double-Complementary", offsets: [0, 60, 180, 240] },
  { id: "double-split-complementary", label: "Double-Split-Complementary", offsets: [0, 150, 210, 30, 330] },
  { id: "hexadic", label: "Hexadic", offsets: [0, 60, 120, 180, 240, 300] },
  { id: "monochromatic", label: "Monochromatic", offsets: [0, 0, 0] },
  { id: "near-complementary", label: "Near-Complementary", offsets: [0, 150] },
  { id: "polychromatic", label: "Polychromatic", offsets: [0, 72, 144, 216, 288] },
  { id: "side-complementary", label: "Side-Complementary", offsets: [0, 165, 195] },
  { id: "split-complementary", label: "Split-Complementary", offsets: [0, 150, 210] },
  { id: "square", label: "Square", offsets: [0, 90, 180, 270] },
  { id: "tetradic", label: "Tetradic", offsets: [0, 60, 180, 240] },
  { id: "triadic", label: "Triadic", offsets: [0, 120, 240] }
]);

const HEX_COLOR_PATTERN = /^#([0-9a-f]{6}|[0-9a-f]{8})$/i;
const USER_SOURCE_LABEL = "User Added";
const HARMONY_SOURCE_LABEL = "Harmony Scheme";
const SOURCE_ID_RENAMES = Object.freeze({
  crayola: PALETTE_SOURCE_PALETTE_COLORS
});

function clonePickerSettings(settings) {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    return null;
  }
  return {
    activeTags: Array.isArray(settings.activeTags) ? [...settings.activeTags] : [],
    colors: settings.colors,
    contrast: settings.contrast,
    hueShift: settings.hueShift,
    paletteType: settings.paletteType,
    saturation: settings.saturation,
    sortDirection: settings.sortDirection,
    sortField: settings.sortField,
    stepRange: settings.stepRange,
    steps: settings.steps,
    swatchSize: settings.swatchSize,
    themeCollection: settings.themeCollection,
    variant: settings.variant,
    variantValue: settings.variantValue
  };
}

function cloneColorMetadata(metadata) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }
  const cloned = {
    colors: metadata.colors,
    contrast: metadata.contrast,
    hex: metadata.hex,
    hueShift: metadata.hueShift,
    name: metadata.name,
    paletteType: metadata.paletteType,
    saturation: metadata.saturation,
    sortDirection: metadata.sortDirection,
    sortField: metadata.sortField,
    source: metadata.source,
    stepRange: metadata.stepRange,
    steps: metadata.steps,
    swatchSize: metadata.swatchSize,
    themeCollection: metadata.themeCollection,
    variant: metadata.variant,
    variantValue: metadata.variantValue
  };
  if (Array.isArray(metadata.activeTags)) {
    cloned.activeTags = [...metadata.activeTags];
  }
  if (Array.isArray(metadata.tags)) {
    cloned.tags = [...metadata.tags];
  }
  const pickerSettings = clonePickerSettings(metadata.pickerSettings);
  if (pickerSettings) {
    cloned.pickerSettings = pickerSettings;
  }
  return cloned;
}

function cloneSwatch(swatch) {
  const cloned = {
    key: swatch.key,
    hex: swatch.hex,
    name: swatch.name,
    source: swatch.source,
    tags: [...swatch.tags]
  };
  const pickerSettings = clonePickerSettings(swatch.pickerSettings);
  if (pickerSettings) {
    cloned.pickerSettings = pickerSettings;
  }
  const metadata = cloneColorMetadata(swatch.metadata);
  if (metadata) {
    cloned.metadata = metadata;
  }
  return cloned;
}

function timestampForIndex(index) {
  return new Date(Date.now() + (index % 60) * 60_000).toISOString();
}

function auditFields(timestamp, userKey = PALETTE_SYSTEM_USER_KEY) {
  return {
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: userKey,
    updatedBy: userKey
  };
}

function rowAuditFields(row = {}, index = 0) {
  const createdAt = row.createdAt || timestampForIndex(index);
  const updatedAt = row.updatedAt || createdAt;
  const createdBy = row.createdBy || PALETTE_SYSTEM_USER_KEY;
  return {
    createdAt,
    updatedAt,
    createdBy,
    updatedBy: row.updatedBy || createdBy
  };
}

export function createPaletteToolMockDbTables(tables = {}) {
  return {};
}

function cloneWorkspaceRecord(record) {
  return {
    gameId: record.gameId,
    tools: {
      [PALETTE_TOOL_KEY]: {
        swatches: record.tools[PALETTE_TOOL_KEY].swatches.map(cloneSwatch)
      }
    }
  };
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeSourceId(value) {
  const normalized = normalizeText(value).toLowerCase();
  if (!normalized) {
    return PALETTE_SOURCE_USER;
  }
  if (normalized.startsWith("crayola")) {
    return normalized === "crayola" ? PALETTE_SOURCE_PALETTE_COLORS : normalized.replace(/^crayola/, PALETTE_SOURCE_PALETTE_COLORS);
  }
  return SOURCE_ID_RENAMES[normalized] || normalized;
}

function sourceLabel(sourceId, label = "") {
  const normalizedSourceId = normalizeSourceId(sourceId);
  const rawLabel = normalizeText(label);
  if (rawLabel.toLowerCase().includes("crayola")) {
    return rawLabel.replace(/crayola/gi, "Palette Colors");
  }
  if (rawLabel) {
    return rawLabel;
  }
  if (normalizedSourceId.startsWith(PALETTE_SOURCE_PALETTE_COLORS)) {
    const suffix = normalizedSourceId.slice(PALETTE_SOURCE_PALETTE_COLORS.length).replace(/^-+/, "");
    return suffix ? `Palette Colors ${suffix}` : "Palette Colors";
  }
  return rawLabel || normalizedSourceId;
}

function normalizeHex(value) {
  const text = normalizeText(value).toUpperCase();
  return HEX_COLOR_PATTERN.test(text) ? text : "";
}

function rgbKey(hex) {
  return normalizeHex(hex).slice(0, 7);
}

function normalizeTags(value) {
  const rawTags = Array.isArray(value) ? value : normalizeText(value).split(",");
  const tags = rawTags
    .map((tag) => normalizeText(tag).toLowerCase())
    .filter(Boolean);
  return [...new Set(tags)];
}

function normalizeSource(value) {
  return normalizeSourceId(value);
}

function displaySource(value) {
  if (value === PALETTE_SOURCE_USER) {
    return USER_SOURCE_LABEL;
  }
  if (value === "harmony") {
    return HARMONY_SOURCE_LABEL;
  }
  return sourceLabel(value);
}

function isHarmonySchemeSource(value) {
  const normalized = normalizeSourceId(value);
  return PALETTE_HARMONY_SCHEMES.some((scheme) => scheme.id === normalized);
}

function displayHarmonySource(value) {
  const normalized = normalizeSourceId(value);
  return PALETTE_HARMONY_SCHEMES.find((scheme) => scheme.id === normalized)?.label || "";
}

function createEmptyWorkspaceRecord(gameId) {
  return {
    gameId,
    tools: {
      [PALETTE_TOOL_KEY]: {
        swatches: []
      }
    }
  };
}

function createIssue(field, label, action) {
  return { action, field, label };
}

function duplicateIssue(field, label, value) {
  return createIssue(field, label, `${value} already exists in Project Swatches.`);
}

export function normalizePaletteSwatchInput(input = {}, options = {}) {
  const source = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const key = normalizeText(source.swatchKey || source.key);
  const hex = normalizeHex(source.hex);
  const name = normalizeText(source.name);
  const tags = normalizeTags(source.tags);
  const pickerSettings = clonePickerSettings(source.pickerSettings);
  const metadata = cloneColorMetadata(source.metadata);

  const swatch = {
    key,
    hex,
    name,
    source: normalizeSource(source.source || options.source),
    tags
  };
  if (pickerSettings) {
    swatch.pickerSettings = pickerSettings;
  }
  if (metadata) {
    swatch.metadata = {
      ...metadata,
      hex,
      name,
      pickerSettings: pickerSettings || metadata.pickerSettings,
      source: normalizeSource(source.source || options.source),
      tags: [...tags]
    };
  }
  return swatch;
}

export function validatePaletteSwatchInput(input = {}, existingSwatches = [], options = {}) {
  const swatch = normalizePaletteSwatchInput(input, options);
  const excludeKey = normalizeText(options.excludeKey);
  const issues = [];

  if (!swatch.hex) {
    issues.push(createIssue("hex", "Hex", "Enter #RRGGBB or #RRGGBBAA."));
  }

  if (!swatch.name) {
    issues.push(createIssue("name", "Name", "Enter a name for this swatch."));
  }

  const comparableSwatches = existingSwatches.filter((existing) => existing.key !== excludeKey);
  if (swatch.key && comparableSwatches.some((existing) => existing.key === swatch.key)) {
    issues.push(duplicateIssue("key", "Duplicate Key", swatch.key));
  }

  const nameKey = swatch.name.toLowerCase();
  if (nameKey && comparableSwatches.some((existing) => existing.name.toLowerCase() === nameKey)) {
    issues.push(duplicateIssue("name", "Duplicate Name", swatch.name));
  }

  const colorKey = rgbKey(swatch.hex);
  if (colorKey && comparableSwatches.some((existing) => rgbKey(existing.hex) === colorKey)) {
    issues.push(duplicateIssue("hex", "Duplicate RGB/Hex", swatch.hex));
  }

  return {
    issues,
    status: issues.length ? "Needs Input" : "Ready",
    swatch
  };
}

export function validatePaletteWorkspacePayload(payload = {}) {
  const issues = [];
  const source = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : null;
  const tools = source?.tools;
  const paletteSection = tools?.[PALETTE_TOOL_KEY];
  const swatches = paletteSection?.swatches;

  if (!source) {
    issues.push(createIssue("payload", "Colors Payload", "Colors payload must be an object."));
  }

  if (!tools || typeof tools !== "object" || Array.isArray(tools)) {
    issues.push(createIssue("tools", "Workspace Tools", "Colors payload must contain active game swatches."));
  }

  if (!paletteSection || typeof paletteSection !== "object" || Array.isArray(paletteSection)) {
    issues.push(createIssue(PALETTE_TOOL_KEY, "Colors Section", "Colors section must be an object in the active game tool data."));
  }

  if (!Array.isArray(swatches)) {
    issues.push(createIssue("swatches", "Palette Swatches", `${PALETTE_WORKSPACE_PATH} must be an array.`));
  }

  if (issues.length) {
    return {
      issues,
      normalized: null,
      status: "Reject",
      valid: false
    };
  }

  const normalizedSwatches = [];
  swatches.forEach((candidate, index) => {
    const normalized = normalizePaletteSwatchInput(candidate);
    const validation = validatePaletteSwatchInput(normalized, normalizedSwatches);
    if (validation.issues.length) {
      validation.issues.forEach((issue) => {
        issues.push({
          ...issue,
          field: `swatches[${index}].${issue.field}`
        });
      });
    } else {
      normalizedSwatches.push(validation.swatch);
    }
  });

  return {
    issues,
    normalized: issues.length
      ? null
      : {
          tools: {
            [PALETTE_TOOL_KEY]: {
              swatches: normalizedSwatches.map(cloneSwatch)
            }
          }
        },
    status: issues.length ? "Reject" : "Ready",
    valid: issues.length === 0
  };
}

function compareSwatches(sortKey, sortDirection = "asc") {
  return (left, right) => {
    const direction = sortDirection === "desc" ? -1 : 1;
    let result = 0;
    if (sortKey === "brightness") {
      result = colorMetrics(left.hex).brightness - colorMetrics(right.hex).brightness || left.name.localeCompare(right.name);
    } else if (sortKey === "hex") {
      result = left.hex.localeCompare(right.hex);
    } else if (sortKey === "hue") {
      result = colorMetrics(left.hex).hue - colorMetrics(right.hex).hue || left.name.localeCompare(right.name);
    } else if (sortKey === "saturation") {
      result = colorMetrics(left.hex).saturation - colorMetrics(right.hex).saturation || left.name.localeCompare(right.name);
    } else if (sortKey === "source") {
      result = left.source.localeCompare(right.source) || left.name.localeCompare(right.name);
    } else if (sortKey === "tag") {
      result = (left.tags[0] || "\uffff").localeCompare(right.tags[0] || "\uffff") || left.name.localeCompare(right.name);
    } else {
      result = left.name.localeCompare(right.name);
    }
    return result * direction;
  };
}

function hexToRgb(hex) {
  const normalized = normalizeHex(hex).slice(1, 7);
  if (!normalized) {
    return null;
  }
  return {
    b: Number.parseInt(normalized.slice(4, 6), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    r: Number.parseInt(normalized.slice(0, 2), 16)
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0").toUpperCase()).join("")}`;
}

function rgbToHsl({ r, g, b }) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: lightness };
  }

  const delta = max - min;
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue = 0;
  if (max === red) {
    hue = (green - blue) / delta + (green < blue ? 6 : 0);
  } else if (max === green) {
    hue = (blue - red) / delta + 2;
  } else {
    hue = (red - green) / delta + 4;
  }

  return { h: hue * 60, s: saturation, l: lightness };
}

function colorMetrics(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return {
      brightness: 0,
      hue: 0,
      saturation: 0
    };
  }
  const hsl = rgbToHsl(rgb);
  return {
    brightness: (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000,
    hue: hsl.h,
    saturation: hsl.s
  };
}

function hueToRgb(p, q, t) {
  let value = t;
  if (value < 0) value += 1;
  if (value > 1) value -= 1;
  if (value < 1 / 6) return p + (q - p) * 6 * value;
  if (value < 1 / 2) return q;
  if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
  return p;
}

function hslToRgb({ h, s, l }) {
  const hue = (((h % 360) + 360) % 360) / 360;
  if (s === 0) {
    const gray = l * 255;
    return { r: gray, g: gray, b: gray };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: hueToRgb(p, q, hue + 1 / 3) * 255,
    g: hueToRgb(p, q, hue) * 255,
    b: hueToRgb(p, q, hue - 1 / 3) * 255
  };
}

function schemeForId(schemeId) {
  const normalized = normalizeText(schemeId) || "complementary";
  return PALETTE_HARMONY_SCHEMES.find((scheme) => scheme.id === normalized) || PALETTE_HARMONY_SCHEMES.find((scheme) => scheme.id === "complementary");
}

function matchSourceForId(matchSourceId) {
  const normalized = normalizeText(matchSourceId) || "calculated";
  return PALETTE_HARMONY_MATCH_SOURCES.some((source) => source.id === normalized) ? normalized : "calculated";
}

function distanceBetweenHex(leftHex, rightHex) {
  const left = hexToRgb(leftHex);
  const right = hexToRgb(rightHex);
  if (!left || !right) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.hypot(left.r - right.r, left.g - right.g, left.b - right.b);
}

function closestSwatch(hex, swatches) {
  return swatches.reduce((closest, swatch) => {
    const distance = distanceBetweenHex(hex, swatch.hex);
    if (!closest || distance < closest.distance) {
      return {
        distance,
        swatch
      };
    }
    return closest;
  }, null)?.swatch || null;
}

function uniqueSuggestions(suggestions) {
  const seen = new Set();
  return suggestions.filter((suggestion) => {
    const key = `${rgbKey(suggestion.hex)}-${suggestion.name.toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function withoutBaseColorSuggestions(suggestions, baseHex, schemeLabel) {
  let calculatedIndex = 0;
  return suggestions
    .filter((suggestion) => rgbKey(suggestion.hex) !== rgbKey(baseHex))
    .map((suggestion) => {
      if (suggestion.sourceName !== "Calculated") {
        return suggestion;
      }
      calculatedIndex += 1;
      return {
        ...suggestion,
        name: `${schemeLabel} ${calculatedIndex}`
      };
    });
}

function harmonyForSwatch(swatch, options = {}) {
  const rgb = hexToRgb(swatch?.hex);
  if (!rgb) {
    return [];
  }

  const hsl = rgbToHsl(rgb);
  const scheme = schemeForId(options.schemeId);
  const matchSource = matchSourceForId(options.matchSource);
  const providedMatchSwatches = Array.isArray(options.matchSwatches)
    ? options.matchSwatches
        .map((matchSwatch) => normalizePaletteSwatchInput(matchSwatch, { source: matchSwatch?.source || "generated" }))
        .filter((matchSwatch) => matchSwatch.hex)
    : [];
  const matchSwatches = matchSource === "calculated" ? [] : providedMatchSwatches;

  const calculated = scheme.offsets.map((offset, index) => {
    let suggestionHex = rgbToHex(hslToRgb({ ...hsl, h: hsl.h + offset }));
    if (scheme.id === "achromatic") {
      const lightness = index === 0 ? 0.2 : index === 1 ? 0.5 : 0.8;
      suggestionHex = rgbToHex(hslToRgb({ h: 0, s: 0, l: lightness }));
    }
    if (scheme.id === "monochromatic") {
      const lightness = index === 0 ? Math.max(0.08, hsl.l - 0.22) : index === 1 ? hsl.l : Math.min(0.92, hsl.l + 0.22);
      suggestionHex = rgbToHex(hslToRgb({ ...hsl, l: lightness }));
    }

    const closest = matchSource === "calculated" ? null : closestSwatch(suggestionHex, matchSwatches);
    const hex = closest?.hex || suggestionHex;
    return {
      hex,
      matchSource,
      name: closest ? `${scheme.label} ${closest.name}` : `${scheme.label} ${index + 1}`,
      source: closest?.source || "harmony",
      sourceName: closest?.name || "Calculated",
      tags: ["harmony", scheme.id]
    };
  });

  return withoutBaseColorSuggestions(uniqueSuggestions(calculated), swatch.hex, scheme.label);
}

function nextAvailableSwatchKey(existingSwatches, seedText = "") {
  const used = new Set(existingSwatches.map((swatch) => swatch.key));
  const root = normalizeText(seedText).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "swatch";
  let index = existingSwatches.length + 1;
  let candidate = `${root}-${index}`;
  while (used.has(candidate)) {
    index += 1;
    candidate = `${root}-${index}`;
  }
  return candidate;
}

function generatedHarmonyNameRoot(name) {
  const normalizedName = normalizeText(name);
  return normalizedName.replace(/\s+\d+$/, "") || normalizedName;
}

function nextGeneratedHarmonyName(name, existingSwatches) {
  const normalizedName = normalizeText(name);
  const usedNames = new Set(existingSwatches.map((swatch) => swatch.name.toLowerCase()));
  if (normalizedName && !usedNames.has(normalizedName.toLowerCase())) {
    return normalizedName;
  }

  const root = generatedHarmonyNameRoot(normalizedName) || "Harmony";
  let index = 1;
  let candidate = `${root} ${index}`;
  while (usedNames.has(candidate.toLowerCase())) {
    index += 1;
    candidate = `${root} ${index}`;
  }
  return candidate;
}

function createUsageId(gameId, swatchKey, assetId) {
  return `${gameId || "project"}-${swatchKey || "swatch"}-${assetId || "asset"}`;
}

export function createGameWorkspacePaletteRepository(options = {}) {
  const gameWorkspaceRepository = options.gameWorkspaceRepository || createGameWorkspaceMockRepository();
  const seedMockDbTables = {
    palette_colors: [],
    palette_swatch_usages: [],
    project_workspace_palette_globals: [],
    ...createPaletteToolMockDbTables(options.tables || {}),
  };
  const loadedMockDbTables = loadMockDbTables(PALETTE_DB_OWNER, seedMockDbTables, options).tables;
  const workspaceRecords = new Map();
  const paletteColorRows = (loadedMockDbTables.palette_colors || []).map((row) => ({
    ...row,
    tags: Array.isArray(row.tags) ? [...row.tags] : normalizeTags(row.tags),
  }));
  const usageRows = (loadedMockDbTables.palette_swatch_usages || []).map((row) => ({ ...row }));
  (loadedMockDbTables.project_workspace_palette_globals || []).forEach((row) => {
    if (row.gameId) {
      workspaceRecords.set(row.gameId, createEmptyWorkspaceRecord(row.gameId));
    }
  });
  const undoStacks = new Map();
  const redoStacks = new Map();
  let selectedSwatchKey = "";

  function persistTables() {
    saveMockDbTables(PALETTE_DB_OWNER, getTables(), options);
  }

  function getActiveGame() {
    return gameWorkspaceRepository.getActiveGame();
  }

  function activeProjectId() {
    return getActiveGame()?.id || "";
  }

  function ensureWorkspaceRecord(gameId) {
    if (!workspaceRecords.has(gameId)) {
      workspaceRecords.set(gameId, createEmptyWorkspaceRecord(gameId));
    }
    return workspaceRecords.get(gameId);
  }

  function swatchesFromColorRows(gameId) {
    return paletteColorRows
      .filter((row) => row.gameId === gameId)
      .map((row) => ({
        hex: row.hex,
        key: row.swatchKey,
        metadata: cloneColorMetadata(row.metadata) || undefined,
        name: row.name,
        pickerSettings: clonePickerSettings(row.pickerSettings) || undefined,
        source: row.source,
        tags: [...row.tags]
      }));
  }

  function replacePaletteColorRows(gameId, swatches) {
    const existingRows = new Map(
      paletteColorRows
        .filter((row) => row.gameId === gameId)
        .map((row) => [row.swatchKey, row])
    );
    for (let index = paletteColorRows.length - 1; index >= 0; index -= 1) {
      if (paletteColorRows[index].gameId === gameId) {
        paletteColorRows.splice(index, 1);
      }
    }
    const timestamp = new Date().toISOString();
    swatches.forEach((swatch, index) => {
      const existingRow = existingRows.get(swatch.key) || {};
      paletteColorRows.push({
        ...rowAuditFields({
          ...existingRow,
          updatedAt: timestamp,
          updatedBy: PALETTE_SYSTEM_USER_KEY
        }, index),
        hex: swatch.hex,
        id: `${gameId}-palette-color-${index + 1}`,
        metadata: cloneColorMetadata(swatch.metadata) || undefined,
        name: swatch.name,
        pickerSettings: clonePickerSettings(swatch.pickerSettings) || undefined,
        gameId,
        source: swatch.source,
        swatchKey: swatch.key,
        tags: [...swatch.tags]
      });
    });
  }

  function syncWorkspaceRecordFromColors(gameId) {
    const record = ensureWorkspaceRecord(gameId);
    record.tools[PALETTE_TOOL_KEY].swatches = swatchesFromColorRows(gameId).map(cloneSwatch);
    return record;
  }

  function activeWorkspaceRecord() {
    const gameId = activeProjectId();
    return gameId ? ensureWorkspaceRecord(gameId) : null;
  }

  function getActiveSwatches() {
    const gameId = activeProjectId();
    const record = gameId ? syncWorkspaceRecordFromColors(gameId) : activeWorkspaceRecord();
    if (!record) {
      return [];
    }
    const payloadValidation = validatePaletteWorkspacePayload(record);
    if (!payloadValidation.valid) {
      throw new Error(`Invalid active Colors payload rejected before render: ${payloadValidation.issues.map((issue) => issue.action).join(" ")}`);
    }
    return record.tools[PALETTE_TOOL_KEY].swatches;
  }

  function replaceSwatches(gameId, nextSwatches, optionsForReplace = {}) {
    if (!gameId) {
      return {
        ok: false,
        message: "Colors edit blocked: no active game.",
        snapshot: getSnapshot()
      };
    }

    const record = ensureWorkspaceRecord(gameId);
    const previousSwatches = record.tools[PALETTE_TOOL_KEY].swatches.map(cloneSwatch);
    const candidatePayload = {
      tools: {
        [PALETTE_TOOL_KEY]: {
          swatches: nextSwatches.map(cloneSwatch)
        }
      }
    };
    const validation = validatePaletteWorkspacePayload(candidatePayload);
    if (!validation.valid) {
      return {
        issues: validation.issues,
        ok: false,
        message: "Invalid Colors payload rejected before render.",
        snapshot: getSnapshot()
      };
    }

    if (optionsForReplace.history !== false) {
      const undoStack = undoStacks.get(gameId) || [];
      undoStack.push(previousSwatches);
      undoStacks.set(gameId, undoStack);
      redoStacks.set(gameId, []);
    }

    replacePaletteColorRows(gameId, validation.normalized.tools[PALETTE_TOOL_KEY].swatches);
    syncWorkspaceRecordFromColors(gameId);
    const activeSwatches = swatchesFromColorRows(gameId);
    if (optionsForReplace.selection === "clear") {
      selectedSwatchKey = "";
    } else if (optionsForReplace.selectedKey) {
      selectedSwatchKey = optionsForReplace.selectedKey;
    } else if (!activeSwatches.some((swatch) => swatch.key === selectedSwatchKey)) {
      selectedSwatchKey = optionsForReplace.selection === "preserve" ? "" : activeSwatches[0]?.key || "";
    }
    persistTables();

    return {
      ok: true,
      message: `Saved palette to ${PALETTE_WORKSPACE_PATH}.`,
      snapshot: getSnapshot()
    };
  }

  function saveSwatch(input = {}, optionsForSave = {}) {
    const gameId = activeProjectId();
    const swatches = getActiveSwatches();
    const inputWithKey = {
      ...input,
      key: normalizeText(input.key) || optionsForSave.excludeKey || nextAvailableSwatchKey(swatches, `${input.name || ""} ${input.hex || ""}`)
    };
    const validation = validatePaletteSwatchInput(inputWithKey, swatches, {
      excludeKey: optionsForSave.excludeKey,
      source: optionsForSave.source || PALETTE_SOURCE_USER
    });

    if (!gameId) {
      return {
        issues: [createIssue("activeProject", "Active Project", "Open a game before editing Project Swatches.")],
        ok: false,
        message: "Colors edit blocked: no active game.",
        snapshot: getSnapshot()
      };
    }

    if (validation.issues.length) {
      return {
        issues: validation.issues,
        ok: false,
        message: `Project Swatches update blocked by ${validation.issues.length} validation item${validation.issues.length === 1 ? "" : "s"}.`,
        snapshot: getSnapshot()
      };
    }

    const nextSwatches = optionsForSave.excludeKey
      ? swatches.map((swatch) => (swatch.key === optionsForSave.excludeKey ? validation.swatch : swatch))
      : [...swatches, validation.swatch];
    selectedSwatchKey = validation.swatch.key;
    return replaceSwatches(gameId, nextSwatches, {
      selectedKey: validation.swatch.key
    });
  }

  function addSwatch(input = {}) {
    return saveSwatch({
      ...input,
      tags: []
    }, { source: PALETTE_SOURCE_USER });
  }

  function updateSelectedSwatch(input = {}) {
    const swatches = getActiveSwatches();
    const selectedSwatch = getSelectedSwatch();
    if (!selectedSwatch) {
      return {
        issues: [createIssue("selectedSwatch", "Selected Swatch", "Select a Project Swatches color before updating.")],
        ok: false,
        message: "Project Swatches update blocked: no selected swatch.",
        snapshot: getSnapshot()
      };
    }

    if (!swatches.some((swatch) => swatch.key === selectedSwatch.key)) {
      return {
        issues: [createIssue("selectedSwatch", "Selected Swatch", "Selected swatch no longer exists.")],
        ok: false,
        message: "Project Swatches update blocked: selected swatch no longer exists.",
        snapshot: getSnapshot()
      };
    }

    return saveSwatch(
      {
        ...input,
        key: selectedSwatch.key,
        source: selectedSwatch.source || PALETTE_SOURCE_USER,
        tags: [...selectedSwatch.tags]
      },
      {
        excludeKey: selectedSwatch.key,
        source: selectedSwatch.source || PALETTE_SOURCE_USER
      }
    );
  }

  function updateSelectedSwatchTags(tags = []) {
    const gameId = activeProjectId();
    const swatches = getActiveSwatches();
    const selectedSwatch = getSelectedSwatch();
    if (!gameId || !selectedSwatch) {
      return {
        issues: [createIssue("selectedSwatch", "Selected Swatch", "Select a Project Swatches color before editing tags.")],
        ok: false,
        message: "Project Swatches tag update blocked: no selected swatch.",
        snapshot: getSnapshot()
      };
    }

    const validation = validatePaletteSwatchInput({
      ...selectedSwatch,
      tags: normalizeTags(tags)
    }, swatches, {
      excludeKey: selectedSwatch.key,
      source: selectedSwatch.source || PALETTE_SOURCE_USER
    });
    if (validation.issues.length) {
      return {
        issues: validation.issues,
        ok: false,
        message: `Project Swatches tag update blocked by ${validation.issues.length} validation item${validation.issues.length === 1 ? "" : "s"}.`,
        snapshot: getSnapshot()
      };
    }

    const result = replaceSwatches(gameId, swatches.map((swatch) => (
      swatch.key === selectedSwatch.key ? validation.swatch : swatch
    )), { selection: "preserve" });
    return {
      ...result,
      message: result.ok ? `Updated tags for ${selectedSwatch.name}.` : result.message
    };
  }

  function addTagToSwatches(keys = [], tag = "") {
    const gameId = activeProjectId();
    const swatches = getActiveSwatches();
    const normalizedTag = normalizeTags([tag])[0] || "";
    const targetKeys = [...new Set(keys.map(normalizeText))]
      .filter((key) => swatches.some((swatch) => swatch.key === key));

    if (!gameId) {
      return {
        issues: [createIssue("activeProject", "Active Project", "Open a game before editing Project Swatches.")],
        ok: false,
        message: "Project Swatches tag update blocked: no active game.",
        snapshot: getSnapshot()
      };
    }

    if (!normalizedTag) {
      return {
        issues: [createIssue("tags", "Tags", "Enter a tag before updating checked swatches.")],
        ok: false,
        message: "Project Swatches tag update blocked: no tag entered.",
        snapshot: getSnapshot()
      };
    }

    if (!targetKeys.length) {
      return {
        issues: [createIssue("checkedSwatches", "Checked Swatches", "Check at least one Project Swatches color before batch tagging.")],
        ok: false,
        message: "Project Swatches tag update blocked: no checked swatches.",
        snapshot: getSnapshot()
      };
    }

    const nextSwatches = swatches.map((swatch) => (
      targetKeys.includes(swatch.key)
        ? { ...swatch, tags: normalizeTags([...swatch.tags, normalizedTag]) }
        : swatch
    ));
    const result = replaceSwatches(gameId, nextSwatches, { selection: "preserve" });
    return {
      ...result,
      message: result.ok
        ? `Added tag ${normalizedTag} to ${targetKeys.length} checked swatch${targetKeys.length === 1 ? "" : "es"}.`
        : result.message
    };
  }

  function removeSwatch(key) {
    const gameId = activeProjectId();
    const normalizedKey = normalizeText(key);
    const swatchToRemove = getActiveSwatches().find((swatch) => swatch.key === normalizedKey);
    if (!gameId || !swatchToRemove) {
      return {
        issues: [createIssue("selectedSwatch", "Selected Swatch", "Select a Project Swatches color before removing.")],
        ok: false,
        message: "Project Swatches removal blocked: no selected swatch.",
        snapshot: getSnapshot()
      };
    }

    const usage = getSwatchUsage(swatchToRemove.key);
    if (usage.length) {
      return {
        issues: [createIssue("dependentTools", "Dependent Tools", `${swatchToRemove.name} is used by ${usage.map((row) => row.toolId).join(", ")}.`)],
        ok: false,
        message: "Project Swatches removal blocked: swatch is used by dependent tools.",
        snapshot: getSnapshot()
      };
    }

    const nextSwatches = getActiveSwatches().filter((swatch) => swatch.key !== swatchToRemove.key);
    const result = replaceSwatches(gameId, nextSwatches, {
      selection: selectedSwatchKey === swatchToRemove.key ? "clear" : "preserve"
    });
    return {
      ...result,
      message: result.ok ? `Removed ${swatchToRemove.name} from Project Swatches.` : result.message
    };
  }

  function removeSelectedSwatch() {
    const selectedSwatch = getSelectedSwatch();
    if (!selectedSwatch) {
      return {
        issues: [createIssue("selectedSwatch", "Selected Swatch", "Select a Project Swatches color before removing.")],
        ok: false,
        message: "Project Swatches removal blocked: no selected swatch.",
        snapshot: getSnapshot()
      };
    }

    return removeSwatch(selectedSwatch.key);
  }

  function selectSwatch(key) {
    const normalizedKey = normalizeText(key);
    if (getActiveSwatches().some((swatch) => swatch.key === normalizedKey)) {
      selectedSwatchKey = normalizedKey;
    }
    return getSnapshot();
  }

  function getSelectedSwatch() {
    return selectedSwatchKey ? getActiveSwatches().find((swatch) => swatch.key === selectedSwatchKey) || null : null;
  }

  function listSwatches(optionsForList = {}) {
    return getActiveSwatches()
      .map(cloneSwatch)
      .sort(compareSwatches(optionsForList.sortKey || "name", optionsForList.sortDirection || "asc"));
  }

  function pinSourceSwatch(sourceSwatch = {}) {
    if (findPinnedSourceSwatch(sourceSwatch)) {
      return {
        ok: true,
        message: "Source swatch already pinned.",
        snapshot: getSnapshot()
      };
    }
    return saveSwatch({
      ...sourceSwatch,
      tags: []
    }, {
      source: normalizeSource(sourceSwatch.source)
    });
  }

  function findPinnedSourceSwatch(sourceSwatch = {}) {
    const colorKey = rgbKey(sourceSwatch.hex);
    if (!colorKey) {
      return null;
    }
    return getActiveSwatches().find((swatch) => rgbKey(swatch.hex) === colorKey) || null;
  }

  function isSourceSwatchPinned(sourceSwatch = {}) {
    return Boolean(findPinnedSourceSwatch(sourceSwatch));
  }

  function displaySwatchSource(value) {
    const normalized = normalizeSourceId(value);
    if (normalized === PALETTE_SOURCE_USER) {
      return "custom";
    }
    if (isHarmonySchemeSource(normalized)) {
      return displayHarmonySource(normalized);
    }
    return displaySource(normalized);
  }

  function createHarmonySuggestions(inputSwatch = null, optionsForHarmony = {}) {
    return harmonyForSwatch(inputSwatch, optionsForHarmony);
  }

  function addHarmonySuggestion(suggestion = {}) {
    const gameId = activeProjectId();
    const swatches = getActiveSwatches();
    if (!gameId) {
      return {
        issues: [createIssue("activeProject", "Active Project", "Open a game before adding harmony colors.")],
        ok: false,
        message: "Harmony color blocked: no active game.",
        snapshot: getSnapshot()
      };
    }
    if (rgbKey(suggestion.hex) && swatches.some((swatch) => rgbKey(swatch.hex) === rgbKey(suggestion.hex))) {
      return {
        issues: [],
        ok: false,
        message: "Harmony color already exists in Project Swatches.",
        snapshot: getSnapshot()
      };
    }

    const name = nextGeneratedHarmonyName(suggestion.name, swatches);
    const key = nextAvailableSwatchKey(swatches, `${name} ${suggestion.hex || ""}`);

    const validation = validatePaletteSwatchInput({
      hex: suggestion.hex,
      key,
      name,
      source: generatedHarmonyNameRoot(name),
      tags: []
    }, swatches, { source: generatedHarmonyNameRoot(name) });
    if (validation.issues.length) {
      return {
        issues: validation.issues,
        ok: false,
        message: `Harmony color blocked by ${validation.issues.length} validation item${validation.issues.length === 1 ? "" : "s"}.`,
        snapshot: getSnapshot()
      };
    }

    return replaceSwatches(gameId, [...swatches, validation.swatch], {
      selectedKey: validation.swatch.key
    });
  }

  function addHarmonySuggestions(suggestions = []) {
    const results = [];
    suggestions.forEach((suggestion) => {
      results.push(addHarmonySuggestion(suggestion));
    });
    const added = results.filter((result) => result.ok).length;
    const skipped = results.length - added;
    return {
      issues: results.flatMap((result) => result.issues || []),
      ok: added > 0,
      message: `Harmony add complete: ${added} added, ${skipped} skipped.`,
      snapshot: getSnapshot()
    };
  }

  function toggleHarmonySuggestionPin(suggestion = {}) {
    const pinnedSwatch = findPinnedSourceSwatch(suggestion);
    if (pinnedSwatch) {
      return removeSwatch(pinnedSwatch.key);
    }
    return addHarmonySuggestion(suggestion);
  }

  function undo() {
    const gameId = activeProjectId();
    const record = gameId ? syncWorkspaceRecordFromColors(gameId) : activeWorkspaceRecord();
    const undoStack = undoStacks.get(gameId) || [];
    if (!gameId || !record || undoStack.length === 0) {
      return {
        ok: false,
        message: "Undo unavailable.",
        snapshot: getSnapshot()
      };
    }

    const redoStack = redoStacks.get(gameId) || [];
    redoStack.push(record.tools[PALETTE_TOOL_KEY].swatches.map(cloneSwatch));
    redoStacks.set(gameId, redoStack);
    const previousSwatches = undoStack.pop();
    replacePaletteColorRows(gameId, previousSwatches);
    syncWorkspaceRecordFromColors(gameId);
    selectedSwatchKey = previousSwatches[0]?.key || "";
    return {
      ok: true,
      message: "Palette undo applied.",
      snapshot: getSnapshot()
    };
  }

  function redo() {
    const gameId = activeProjectId();
    const record = gameId ? syncWorkspaceRecordFromColors(gameId) : activeWorkspaceRecord();
    const redoStack = redoStacks.get(gameId) || [];
    if (!gameId || !record || redoStack.length === 0) {
      return {
        ok: false,
        message: "Redo unavailable.",
        snapshot: getSnapshot()
      };
    }

    const undoStack = undoStacks.get(gameId) || [];
    undoStack.push(record.tools[PALETTE_TOOL_KEY].swatches.map(cloneSwatch));
    undoStacks.set(gameId, undoStack);
    const nextSwatches = redoStack.pop();
    replacePaletteColorRows(gameId, nextSwatches);
    syncWorkspaceRecordFromColors(gameId);
    selectedSwatchKey = nextSwatches[0]?.key || "";
    return {
      ok: true,
      message: "Palette redo applied.",
      snapshot: getSnapshot()
    };
  }

  function loadActiveProjectPalettePayload(payload = {}) {
    const gameId = activeProjectId();
    const validation = validatePaletteWorkspacePayload(payload);
    if (!gameId) {
      return {
        issues: [createIssue("activeProject", "Active Project", "Open a game before loading Colors payloads.")],
        ok: false,
        message: "Colors payload rejected: no active game.",
        snapshot: getSnapshot()
      };
    }
    if (!validation.valid) {
      return {
        issues: validation.issues,
        ok: false,
        message: "Invalid Colors payload rejected before render.",
        snapshot: getSnapshot()
      };
    }

    replacePaletteColorRows(gameId, validation.normalized.tools[PALETTE_TOOL_KEY].swatches);
    syncWorkspaceRecordFromColors(gameId);
    selectedSwatchKey = swatchesFromColorRows(gameId)[0]?.key || "";
    undoStacks.set(gameId, []);
    redoStacks.set(gameId, []);
    persistTables();
    return {
      ok: true,
      message: "Colors payload loaded into the active game.",
      snapshot: getSnapshot()
    };
  }

  function seedActiveProjectPalette() {
    return loadActiveProjectPalettePayload({
      tools: {
        [PALETTE_TOOL_KEY]: {
          swatches: [
            { key: "hero-blue", hex: "#1F75FE", name: "Hero Blue", source: PALETTE_SOURCE_USER, tags: ["hero", "ui"] },
            { key: "accent-orange", hex: "#FF7538", name: "Accent Orange", source: PALETTE_SOURCE_USER, tags: ["accent"] },
            { key: "backdrop-black", hex: "#232323", name: "Backdrop Black", source: PALETTE_SOURCE_USER, tags: ["background"] }
          ]
        }
      }
    });
  }

  function recordSwatchUsage(input = {}) {
    const gameId = activeProjectId();
    const swatch = findSwatch(input.key || input.swatchKey);
    if (!gameId || !swatch) {
      return {
        ok: false,
        message: "Swatch usage not recorded: Project Swatches color is missing.",
        snapshot: getSnapshot()
      };
    }

    const existingIndex = usageRows.findIndex((usage) => usage.id === createUsageId(gameId, swatch.key, input.assetId));
    const existingRow = existingIndex >= 0 ? usageRows[existingIndex] : {};
    const timestamp = new Date().toISOString();
    const row = {
      ...rowAuditFields({
        ...existingRow,
        updatedAt: timestamp,
        updatedBy: PALETTE_SYSTEM_USER_KEY
      }),
      assetId: normalizeText(input.assetId),
      id: createUsageId(gameId, swatch.key, input.assetId),
      gameId,
      swatchHex: swatch.hex,
      swatchKey: swatch.key,
      swatchName: swatch.name,
      toolId: normalizeText(input.toolId) || "assets"
    };
    if (existingIndex >= 0) {
      usageRows.splice(existingIndex, 1, row);
    } else {
      usageRows.push(row);
    }
    persistTables();
    return {
      ok: true,
      message: `Recorded ${row.toolId} usage for ${swatch.name}.`,
      snapshot: getSnapshot()
    };
  }

  function getSwatchUsage(key) {
    const gameId = activeProjectId();
    const normalizedKey = normalizeText(key);
    return usageRows
      .filter((row) => row.gameId === gameId && row.swatchKey === normalizedKey)
      .map((row) => ({ ...row }));
  }

  function findSwatch(key) {
    const normalizedKey = normalizeText(key);
    return getActiveSwatches().find((swatch) => swatch.key === normalizedKey) || null;
  }

  function clearProjectData() {
    gameWorkspaceRepository.clearTestData();
    paletteColorRows.splice(0);
    usageRows.splice(0);
    workspaceRecords.clear();
    selectedSwatchKey = "";
    persistTables();
    return getSnapshot();
  }

  function resetGameData() {
    gameWorkspaceRepository.resetGameData();
    paletteColorRows.splice(0);
    usageRows.splice(0);
    workspaceRecords.clear();
    selectedSwatchKey = "";
    persistTables();
    return getSnapshot();
  }

  function getTables() {
    return normalizeMockDbTables(PALETTE_DB_OWNER, {
      palette_colors: paletteColorRows.map((row) => ({
        ...row,
        tags: [...row.tags]
      })),
      palette_swatch_usages: usageRows.map((row) => ({ ...row })),
      project_workspace_palette_globals: [...workspaceRecords.values()].map((record, index) => ({
        ...auditFields(timestampForIndex(index + 30), PALETTE_SYSTEM_USER_KEY),
        gameId: record.gameId,
        swatchCount: swatchesFromColorRows(record.gameId).length,
        toolKey: PALETTE_TOOL_KEY,
        workspacePath: PALETTE_WORKSPACE_PATH
      }))
    }, options);
  }

  function getSnapshot(optionsForSnapshot = {}) {
    const activeProject = getActiveGame();
    const gameId = activeProject?.id || "";
    let swatches = [];
    let validation = {
      findings: [],
      status: "Ready"
    };
    let workspace = null;

    if (gameId) {
      workspace = cloneWorkspaceRecord(syncWorkspaceRecordFromColors(gameId));
      const payloadValidation = validatePaletteWorkspacePayload(workspace);
      validation = {
        findings: payloadValidation.issues,
        status: payloadValidation.valid ? "Ready" : "Reject"
      };
      swatches = payloadValidation.valid
        ? workspace.tools[PALETTE_TOOL_KEY].swatches.map(cloneSwatch).sort(compareSwatches(optionsForSnapshot.sortKey || "name", optionsForSnapshot.sortDirection || "asc"))
        : [];
    } else {
      validation = {
        findings: [createIssue("activeProject", "Active Project", "Open a game before editing Project Swatches.")],
        status: "Blocked"
      };
    }

    const selectedSwatch = gameId && validation.status === "Ready" ? getSelectedSwatch() : null;
    const tableCounts = Object.entries(getTables()).map(([table, rows]) => ({
      rows: rows.length,
      table
    }));

    return {
      activeProject,
      canRedo: Boolean(gameId && (redoStacks.get(gameId) || []).length),
      canUndo: Boolean(gameId && (undoStacks.get(gameId) || []).length),
      harmony: createHarmonySuggestions(selectedSwatch),
      palettePath: PALETTE_WORKSPACE_PATH,
      projectRequired: !gameId,
      selectedSwatch: selectedSwatch ? cloneSwatch(selectedSwatch) : null,
      swatches,
      tableCounts,
      tables: getTables(),
      validation,
      workspace
    };
  }

  return {
    addSwatch,
    addHarmonySuggestion,
    addHarmonySuggestions,
    clearProjectData,
    createHarmonySuggestions,
    displaySource: displaySwatchSource,
    findSwatch,
    getActiveGame,
    getSnapshot,
    getSwatchUsage,
    getTables,
    isSourceSwatchPinned,
    addTagToSwatches,
    listSwatches,
    loadActiveProjectPalettePayload,
    pinSourceSwatch,
    recordSwatchUsage,
    redo,
    removeSwatch,
    removeSelectedSwatch,
    resetGameData,
    seedActiveProjectPalette,
    selectSwatch,
    toggleHarmonySuggestionPin,
    undo,
    updateSelectedSwatch,
    updateSelectedSwatchTags
  };
}
