import { createProjectWorkspaceMockRepository } from "../project-workspace/project-workspace-mock-repository.js";

export const PALETTE_TOOL_KEY = "palette-browser";
export const PALETTE_WORKSPACE_PATH = `tools.${PALETTE_TOOL_KEY}.swatches`;
export const PALETTE_SOURCE_USER = "user";
export const PALETTE_SOURCE_PALETTE_COLORS = "palette-colors";

export const PALETTE_TOOL_TABLES = Object.freeze([
  "palette_colors",
  "project_workspace_palette_globals",
  "palette_swatch_usages"
]);

export const PALETTE_HARMONY_MATCH_SOURCES = Object.freeze([
  { id: "calculated", label: "Calculated" },
  { id: "source", label: "Source Palette Closest Match" },
  { id: "all", label: "All Palettes Closest Match" }
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
const SYMBOL_CANDIDATES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@$%^&*()-+=[]{};:,.?";

const DEFAULT_SOURCE_PALETTES = Object.freeze({
  [PALETTE_SOURCE_PALETTE_COLORS]: Object.freeze([
    { symbol: "!", hex: "#232323", name: "Black", source: PALETTE_SOURCE_PALETTE_COLORS },
    { symbol: "#", hex: "#B4674D", name: "Brown", source: PALETTE_SOURCE_PALETTE_COLORS },
    { symbol: "$", hex: "#FF7538", name: "Orange", source: PALETTE_SOURCE_PALETTE_COLORS },
    { symbol: "%", hex: "#FCE883", name: "Yellow", source: PALETTE_SOURCE_PALETTE_COLORS },
    { symbol: "&", hex: "#1CAC78", name: "Green", source: PALETTE_SOURCE_PALETTE_COLORS },
    { symbol: "(", hex: "#1F75FE", name: "Blue", source: PALETTE_SOURCE_PALETTE_COLORS },
    { symbol: ")", hex: "#926EAE", name: "Violet", source: PALETTE_SOURCE_PALETTE_COLORS },
    { symbol: "*", hex: "#EE204D", name: "Red", source: PALETTE_SOURCE_PALETTE_COLORS }
  ]),
  javascript: Object.freeze([
    { symbol: "R", hex: "#FF0000", name: "Red", source: "javascript" },
    { symbol: "G", hex: "#008000", name: "Green", source: "javascript" },
    { symbol: "B", hex: "#0000FF", name: "Blue", source: "javascript" },
    { symbol: "K", hex: "#000000", name: "Black", source: "javascript" },
    { symbol: "W", hex: "#FFFFFF", name: "White", source: "javascript" }
  ]),
  w3c: Object.freeze([
    { symbol: "A", hex: "#00FFFF", name: "Aqua", source: "w3c" },
    { symbol: "F", hex: "#FF00FF", name: "Fuchsia", source: "w3c" },
    { symbol: "L", hex: "#00FF00", name: "Lime", source: "w3c" },
    { symbol: "M", hex: "#800000", name: "Maroon", source: "w3c" },
    { symbol: "N", hex: "#000080", name: "Navy", source: "w3c" }
  ])
});

const DEFAULT_SOURCE_PALETTE_LABELS = Object.freeze({
  [PALETTE_SOURCE_PALETTE_COLORS]: "Palette Colors",
  javascript: "JavaScript",
  w3c: "W3C"
});

function cloneSwatch(swatch) {
  return {
    symbol: swatch.symbol,
    hex: swatch.hex,
    name: swatch.name,
    source: swatch.source,
    tags: [...swatch.tags]
  };
}

function cloneWorkspaceRecord(record) {
  return {
    projectId: record.projectId,
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

function sourceLabel(sourceId, sourcePaletteLabels = DEFAULT_SOURCE_PALETTE_LABELS) {
  const normalizedSourceId = normalizeSourceId(sourceId);
  const rawLabel = normalizeText(sourcePaletteLabels?.[sourceId]) || normalizeText(sourcePaletteLabels?.[normalizedSourceId]);
  if (normalizedSourceId.startsWith(PALETTE_SOURCE_PALETTE_COLORS)) {
    const suffix = normalizedSourceId.slice(PALETTE_SOURCE_PALETTE_COLORS.length).replace(/^-+/, "");
    return suffix ? `Palette Colors ${suffix}` : "Palette Colors";
  }
  if (rawLabel.toLowerCase().includes("crayola")) {
    return rawLabel.replace(/crayola/gi, "Palette Colors");
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

function isOneCharacter(value) {
  return Array.from(value).length === 1;
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

function createEmptyWorkspaceRecord(projectId) {
  return {
    projectId,
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
  return createIssue(field, label, `${value} already exists in the active project palette.`);
}

export function normalizePaletteSwatchInput(input = {}, options = {}) {
  const source = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const symbol = normalizeText(source.symbol);
  const hex = normalizeHex(source.hex);
  const name = normalizeText(source.name);
  const tags = normalizeTags(source.tags);

  return {
    symbol,
    hex,
    name,
    source: normalizeSource(source.source || options.source),
    tags
  };
}

export function validatePaletteSwatchInput(input = {}, existingSwatches = [], options = {}) {
  const swatch = normalizePaletteSwatchInput(input, options);
  const excludeSymbol = normalizeText(options.excludeSymbol);
  const issues = [];

  if (!swatch.symbol) {
    issues.push(createIssue("symbol", "Symbol", "Enter a symbol for this swatch."));
  } else if (!isOneCharacter(swatch.symbol)) {
    issues.push(createIssue("symbol", "Symbol", "Symbol must be exactly one character."));
  }

  if (!swatch.hex) {
    issues.push(createIssue("hex", "Hex", "Enter #RRGGBB or #RRGGBBAA."));
  }

  if (!swatch.name) {
    issues.push(createIssue("name", "Name", "Enter a name for this swatch."));
  }

  const comparableSwatches = existingSwatches.filter((existing) => existing.symbol !== excludeSymbol);
  if (swatch.symbol && comparableSwatches.some((existing) => existing.symbol === swatch.symbol)) {
    issues.push(duplicateIssue("symbol", "Duplicate Symbol", swatch.symbol));
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
    issues.push(createIssue("payload", "Palette Payload", "Palette payload must be an object."));
  }

  if (!tools || typeof tools !== "object" || Array.isArray(tools)) {
    issues.push(createIssue("tools", "Workspace Tools", `Palette payload must contain ${PALETTE_WORKSPACE_PATH}.`));
  }

  if (!paletteSection || typeof paletteSection !== "object" || Array.isArray(paletteSection)) {
    issues.push(createIssue(PALETTE_TOOL_KEY, "Palette Section", `Palette section must be an object at tools.${PALETTE_TOOL_KEY}.`));
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

function normalizeSourcePalettes(sourcePalettes = DEFAULT_SOURCE_PALETTES, sourcePaletteLabels = DEFAULT_SOURCE_PALETTE_LABELS) {
  const entries = Object.entries(sourcePalettes && typeof sourcePalettes === "object" ? sourcePalettes : DEFAULT_SOURCE_PALETTES);
  const normalizedPalettes = {};
  const normalizedLabels = {};

  entries.forEach(([sourceId, swatches]) => {
    const normalizedSourceId = normalizeSourceId(sourceId);
    if (!normalizedSourceId || !Array.isArray(swatches)) {
      return;
    }
    const normalizedSwatches = swatches
      .map((swatch) => normalizePaletteSwatchInput(swatch, { source: normalizedSourceId }))
      .filter((swatch) => swatch.symbol && isOneCharacter(swatch.symbol) && swatch.hex && swatch.name);

    if (normalizedSwatches.length) {
      normalizedPalettes[normalizedSourceId] = [
        ...(normalizedPalettes[normalizedSourceId] || []),
        ...normalizedSwatches.map(cloneSwatch)
      ];
      normalizedLabels[normalizedSourceId] = sourceLabel(sourceId, sourcePaletteLabels);
    }
  });

  return {
    labels: Object.freeze(normalizedLabels),
    palettes: Object.freeze(normalizedPalettes)
  };
}

function compareSwatches(sortKey) {
  return (left, right) => {
    if (sortKey === "brightness") {
      return colorMetrics(left.hex).brightness - colorMetrics(right.hex).brightness || left.name.localeCompare(right.name);
    }
    if (sortKey === "hex") {
      return left.hex.localeCompare(right.hex);
    }
    if (sortKey === "hue") {
      return colorMetrics(left.hex).hue - colorMetrics(right.hex).hue || left.name.localeCompare(right.name);
    }
    if (sortKey === "saturation") {
      return colorMetrics(left.hex).saturation - colorMetrics(right.hex).saturation || left.name.localeCompare(right.name);
    }
    if (sortKey === "source") {
      return left.source.localeCompare(right.source) || left.name.localeCompare(right.name);
    }
    if (sortKey === "symbol") {
      return left.symbol.localeCompare(right.symbol);
    }
    if (sortKey === "tag") {
      return (left.tags[0] || "\uffff").localeCompare(right.tags[0] || "\uffff") || left.name.localeCompare(right.name);
    }
    return left.name.localeCompare(right.name);
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

function harmonyForSwatch(swatch, options = {}, sourcePaletteData = null) {
  const rgb = hexToRgb(swatch?.hex);
  if (!rgb) {
    return [];
  }

  const hsl = rgbToHsl(rgb);
  const scheme = schemeForId(options.schemeId);
  const matchSource = matchSourceForId(options.matchSource);
  const sourceId = normalizeSourceId(options.sourceId);
  const sourcePalettes = sourcePaletteData?.palettes || {};
  const sourceSwatches = matchSource === "source"
    ? sourcePalettes[sourceId] || []
    : Object.values(sourcePalettes).flat();

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

    const closest = matchSource === "calculated" ? null : closestSwatch(suggestionHex, sourceSwatches);
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

  return uniqueSuggestions(calculated);
}

function nextAvailableSymbol(existingSwatches, seedText = "") {
  const used = new Set(existingSwatches.map((swatch) => swatch.symbol));
  const seedCandidates = Array.from(normalizeText(seedText).toUpperCase().replace(/[^A-Z0-9]/g, ""));
  const candidates = [...seedCandidates, ...Array.from(SYMBOL_CANDIDATES)];
  return candidates.find((candidate) => !used.has(candidate)) || "";
}

function createUsageId(projectId, swatchSymbol, assetId) {
  return `${projectId || "project"}-${swatchSymbol || "swatch"}-${assetId || "asset"}`;
}

export function createProjectWorkspacePaletteRepository(options = {}) {
  const projectWorkspaceRepository = options.projectWorkspaceRepository || createProjectWorkspaceMockRepository();
  const sourcePaletteData = normalizeSourcePalettes(options.sourcePalettes, options.sourcePaletteLabels);
  const workspaceRecords = new Map();
  const paletteColorRows = [];
  const usageRows = [];
  const undoStacks = new Map();
  const redoStacks = new Map();
  let selectedSymbol = "";

  function getActiveProject() {
    return projectWorkspaceRepository.getActiveProject();
  }

  function activeProjectId() {
    return getActiveProject()?.id || "";
  }

  function ensureWorkspaceRecord(projectId) {
    if (!workspaceRecords.has(projectId)) {
      workspaceRecords.set(projectId, createEmptyWorkspaceRecord(projectId));
    }
    return workspaceRecords.get(projectId);
  }

  function swatchesFromColorRows(projectId) {
    return paletteColorRows
      .filter((row) => row.projectId === projectId)
      .map((row) => ({
        hex: row.hex,
        name: row.name,
        source: row.source,
        symbol: row.symbol,
        tags: [...row.tags]
      }));
  }

  function replacePaletteColorRows(projectId, swatches) {
    for (let index = paletteColorRows.length - 1; index >= 0; index -= 1) {
      if (paletteColorRows[index].projectId === projectId) {
        paletteColorRows.splice(index, 1);
      }
    }
    swatches.forEach((swatch, index) => {
      paletteColorRows.push({
        hex: swatch.hex,
        id: `${projectId}-palette-color-${index + 1}`,
        name: swatch.name,
        projectId,
        source: swatch.source,
        symbol: swatch.symbol,
        tags: [...swatch.tags]
      });
    });
  }

  function syncWorkspaceRecordFromColors(projectId) {
    const record = ensureWorkspaceRecord(projectId);
    record.tools[PALETTE_TOOL_KEY].swatches = swatchesFromColorRows(projectId).map(cloneSwatch);
    return record;
  }

  function activeWorkspaceRecord() {
    const projectId = activeProjectId();
    return projectId ? ensureWorkspaceRecord(projectId) : null;
  }

  function getActiveSwatches() {
    const projectId = activeProjectId();
    const record = projectId ? syncWorkspaceRecordFromColors(projectId) : activeWorkspaceRecord();
    if (!record) {
      return [];
    }
    const payloadValidation = validatePaletteWorkspacePayload(record);
    if (!payloadValidation.valid) {
      throw new Error(`Invalid active palette payload rejected before render: ${payloadValidation.issues.map((issue) => issue.action).join(" ")}`);
    }
    return record.tools[PALETTE_TOOL_KEY].swatches;
  }

  function replaceSwatches(projectId, nextSwatches, optionsForReplace = {}) {
    if (!projectId) {
      return {
        ok: false,
        message: "Palette edit blocked: no active project.",
        snapshot: getSnapshot()
      };
    }

    const record = ensureWorkspaceRecord(projectId);
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
        message: `Invalid palette payload rejected before render at ${PALETTE_WORKSPACE_PATH}.`,
        snapshot: getSnapshot()
      };
    }

    if (optionsForReplace.history !== false) {
      const undoStack = undoStacks.get(projectId) || [];
      undoStack.push(previousSwatches);
      undoStacks.set(projectId, undoStack);
      redoStacks.set(projectId, []);
    }

    replacePaletteColorRows(projectId, validation.normalized.tools[PALETTE_TOOL_KEY].swatches);
    syncWorkspaceRecordFromColors(projectId);
    const activeSwatches = swatchesFromColorRows(projectId);
    if (!activeSwatches.some((swatch) => swatch.symbol === selectedSymbol)) {
      selectedSymbol = activeSwatches[0]?.symbol || "";
    }

    return {
      ok: true,
      message: `Saved palette to ${PALETTE_WORKSPACE_PATH}.`,
      snapshot: getSnapshot()
    };
  }

  function saveSwatch(input = {}, optionsForSave = {}) {
    const projectId = activeProjectId();
    const swatches = getActiveSwatches();
    const validation = validatePaletteSwatchInput(input, swatches, {
      excludeSymbol: optionsForSave.excludeSymbol,
      source: optionsForSave.source || PALETTE_SOURCE_USER
    });

    if (!projectId) {
      return {
        issues: [createIssue("activeProject", "Active Project", "Open a project before editing palette swatches.")],
        ok: false,
        message: "Palette edit blocked: no active project.",
        snapshot: getSnapshot()
      };
    }

    if (validation.issues.length) {
      return {
        issues: validation.issues,
        ok: false,
        message: `Palette swatch blocked by ${validation.issues.length} validation item${validation.issues.length === 1 ? "" : "s"}.`,
        snapshot: getSnapshot()
      };
    }

    const nextSwatches = optionsForSave.excludeSymbol
      ? swatches.map((swatch) => (swatch.symbol === optionsForSave.excludeSymbol ? validation.swatch : swatch))
      : [...swatches, validation.swatch];
    selectedSymbol = validation.swatch.symbol;
    return replaceSwatches(projectId, nextSwatches);
  }

  function addSwatch(input = {}) {
    return saveSwatch(input, { source: PALETTE_SOURCE_USER });
  }

  function updateSelectedSwatch(input = {}) {
    const swatches = getActiveSwatches();
    const selectedSwatch = getSelectedSwatch();
    if (!selectedSwatch) {
      return {
        issues: [createIssue("selectedSwatch", "Selected Swatch", "Select a project palette swatch before updating.")],
        ok: false,
        message: "Palette update blocked: no selected swatch.",
        snapshot: getSnapshot()
      };
    }

    if (!swatches.some((swatch) => swatch.symbol === selectedSwatch.symbol)) {
      return {
        issues: [createIssue("selectedSwatch", "Selected Swatch", "Selected swatch no longer exists.")],
        ok: false,
        message: "Palette update blocked: selected swatch no longer exists.",
        snapshot: getSnapshot()
      };
    }

    return saveSwatch(
      {
        ...input,
        source: selectedSwatch.source || PALETTE_SOURCE_USER
      },
      {
        excludeSymbol: selectedSwatch.symbol,
        source: selectedSwatch.source || PALETTE_SOURCE_USER
      }
    );
  }

  function removeSelectedSwatch() {
    const projectId = activeProjectId();
    const selectedSwatch = getSelectedSwatch();
    if (!projectId || !selectedSwatch) {
      return {
        issues: [createIssue("selectedSwatch", "Selected Swatch", "Select a project palette swatch before removing.")],
        ok: false,
        message: "Palette removal blocked: no selected swatch.",
        snapshot: getSnapshot()
      };
    }

    const usage = getSwatchUsage(selectedSwatch.symbol);
    if (usage.length) {
      return {
        issues: [createIssue("dependentTools", "Dependent Tools", `${selectedSwatch.name} is used by ${usage.map((row) => row.toolId).join(", ")}.`)],
        ok: false,
        message: "Palette removal blocked: swatch is used by dependent tools.",
        snapshot: getSnapshot()
      };
    }

    const nextSwatches = getActiveSwatches().filter((swatch) => swatch.symbol !== selectedSwatch.symbol);
    selectedSymbol = nextSwatches[0]?.symbol || "";
    return replaceSwatches(projectId, nextSwatches);
  }

  function selectSwatch(symbol) {
    const normalizedSymbol = normalizeText(symbol);
    if (getActiveSwatches().some((swatch) => swatch.symbol === normalizedSymbol)) {
      selectedSymbol = normalizedSymbol;
    }
    return getSnapshot();
  }

  function getSelectedSwatch() {
    return getActiveSwatches().find((swatch) => swatch.symbol === selectedSymbol) || getActiveSwatches()[0] || null;
  }

  function listSwatches(optionsForList = {}) {
    return getActiveSwatches()
      .map(cloneSwatch)
      .sort(compareSwatches(optionsForList.sortKey || "name"));
  }

  function sourcePaletteOptions() {
    return Object.keys(sourcePaletteData.palettes)
      .sort((left, right) => sourcePaletteData.labels[left].localeCompare(sourcePaletteData.labels[right]))
      .map((sourceId) => ({
        id: sourceId,
        label: sourcePaletteData.labels[sourceId],
        swatchCount: sourcePaletteData.palettes[sourceId].length
      }));
  }

  function listSourceSwatches(optionsForList = {}) {
    const sourceId = normalizeText(optionsForList.sourceId) || sourcePaletteOptions()[0]?.id || "";
    const query = normalizeText(optionsForList.query).toLowerCase();
    const swatches = sourcePaletteData.palettes[sourceId] || [];
    return swatches
      .filter((swatch) => {
        if (!query) {
          return true;
        }
        return [swatch.symbol, swatch.hex, swatch.name, swatch.source, ...swatch.tags]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .map(cloneSwatch)
      .sort(compareSwatches(optionsForList.sortKey || "name"));
  }

  function pinSourceSwatch(sourceSwatch = {}) {
    return saveSwatch(sourceSwatch, {
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

  function toggleSourceSwatchPin(sourceSwatch = {}) {
    const pinnedSwatch = findPinnedSourceSwatch(sourceSwatch);
    if (pinnedSwatch) {
      selectedSymbol = pinnedSwatch.symbol;
      return removeSelectedSwatch();
    }
    return pinSourceSwatch(sourceSwatch);
  }

  function createHarmonySuggestions(inputSwatch = null, optionsForHarmony = {}) {
    return harmonyForSwatch(inputSwatch, optionsForHarmony, sourcePaletteData);
  }

  function addHarmonySuggestion(suggestion = {}) {
    const swatches = getActiveSwatches();
    const symbol = nextAvailableSymbol(swatches, suggestion.name);
    if (!symbol) {
      return {
        issues: [createIssue("symbol", "Symbol", "No available one-character palette symbol remains.")],
        ok: false,
        message: "Harmony color blocked: no available symbol.",
        snapshot: getSnapshot()
      };
    }
    return saveSwatch({
      hex: suggestion.hex,
      name: suggestion.name,
      source: "harmony",
      symbol,
      tags: Array.isArray(suggestion.tags) ? suggestion.tags : ["harmony"]
    }, { source: "harmony" });
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

  function undo() {
    const projectId = activeProjectId();
    const record = projectId ? syncWorkspaceRecordFromColors(projectId) : activeWorkspaceRecord();
    const undoStack = undoStacks.get(projectId) || [];
    if (!projectId || !record || undoStack.length === 0) {
      return {
        ok: false,
        message: "Undo unavailable.",
        snapshot: getSnapshot()
      };
    }

    const redoStack = redoStacks.get(projectId) || [];
    redoStack.push(record.tools[PALETTE_TOOL_KEY].swatches.map(cloneSwatch));
    redoStacks.set(projectId, redoStack);
    const previousSwatches = undoStack.pop();
    replacePaletteColorRows(projectId, previousSwatches);
    syncWorkspaceRecordFromColors(projectId);
    selectedSymbol = previousSwatches[0]?.symbol || "";
    return {
      ok: true,
      message: "Palette undo applied.",
      snapshot: getSnapshot()
    };
  }

  function redo() {
    const projectId = activeProjectId();
    const record = projectId ? syncWorkspaceRecordFromColors(projectId) : activeWorkspaceRecord();
    const redoStack = redoStacks.get(projectId) || [];
    if (!projectId || !record || redoStack.length === 0) {
      return {
        ok: false,
        message: "Redo unavailable.",
        snapshot: getSnapshot()
      };
    }

    const undoStack = undoStacks.get(projectId) || [];
    undoStack.push(record.tools[PALETTE_TOOL_KEY].swatches.map(cloneSwatch));
    undoStacks.set(projectId, undoStack);
    const nextSwatches = redoStack.pop();
    replacePaletteColorRows(projectId, nextSwatches);
    syncWorkspaceRecordFromColors(projectId);
    selectedSymbol = nextSwatches[0]?.symbol || "";
    return {
      ok: true,
      message: "Palette redo applied.",
      snapshot: getSnapshot()
    };
  }

  function loadActiveProjectPalettePayload(payload = {}) {
    const projectId = activeProjectId();
    const validation = validatePaletteWorkspacePayload(payload);
    if (!projectId) {
      return {
        issues: [createIssue("activeProject", "Active Project", "Open a project before loading palette payloads.")],
        ok: false,
        message: "Palette payload rejected: no active project.",
        snapshot: getSnapshot()
      };
    }
    if (!validation.valid) {
      return {
        issues: validation.issues,
        ok: false,
        message: `Invalid palette payload rejected before render at ${PALETTE_WORKSPACE_PATH}.`,
        snapshot: getSnapshot()
      };
    }

    replacePaletteColorRows(projectId, validation.normalized.tools[PALETTE_TOOL_KEY].swatches);
    syncWorkspaceRecordFromColors(projectId);
    selectedSymbol = swatchesFromColorRows(projectId)[0]?.symbol || "";
    undoStacks.set(projectId, []);
    redoStacks.set(projectId, []);
    return {
      ok: true,
      message: `Palette payload loaded into ${PALETTE_WORKSPACE_PATH}.`,
      snapshot: getSnapshot()
    };
  }

  function seedActiveProjectPalette() {
    return loadActiveProjectPalettePayload({
      tools: {
        [PALETTE_TOOL_KEY]: {
          swatches: [
            { symbol: "H", hex: "#1F75FE", name: "Hero Blue", source: PALETTE_SOURCE_USER, tags: ["hero", "ui"] },
            { symbol: "A", hex: "#FF7538", name: "Accent Orange", source: PALETTE_SOURCE_USER, tags: ["accent"] },
            { symbol: "B", hex: "#232323", name: "Backdrop Black", source: PALETTE_SOURCE_USER, tags: ["background"] }
          ]
        }
      }
    });
  }

  function recordSwatchUsage(input = {}) {
    const projectId = activeProjectId();
    const swatch = findSwatch(input.symbol);
    if (!projectId || !swatch) {
      return {
        ok: false,
        message: "Swatch usage not recorded: active project palette swatch is missing.",
        snapshot: getSnapshot()
      };
    }

    const row = {
      assetId: normalizeText(input.assetId),
      id: createUsageId(projectId, swatch.symbol, input.assetId),
      projectId,
      swatchHex: swatch.hex,
      swatchName: swatch.name,
      swatchSymbol: swatch.symbol,
      toolId: normalizeText(input.toolId) || "assets"
    };
    const existingIndex = usageRows.findIndex((usage) => usage.id === row.id);
    if (existingIndex >= 0) {
      usageRows.splice(existingIndex, 1, row);
    } else {
      usageRows.push(row);
    }
    return {
      ok: true,
      message: `Recorded ${row.toolId} usage for ${swatch.name}.`,
      snapshot: getSnapshot()
    };
  }

  function getSwatchUsage(symbol) {
    const projectId = activeProjectId();
    const normalizedSymbol = normalizeText(symbol);
    return usageRows
      .filter((row) => row.projectId === projectId && row.swatchSymbol === normalizedSymbol)
      .map((row) => ({ ...row }));
  }

  function findSwatch(symbol) {
    const normalizedSymbol = normalizeText(symbol);
    return getActiveSwatches().find((swatch) => swatch.symbol === normalizedSymbol) || null;
  }

  function clearProjectData() {
    projectWorkspaceRepository.clearTestData();
    paletteColorRows.splice(0);
    usageRows.splice(0);
    workspaceRecords.clear();
    selectedSymbol = "";
    return getSnapshot();
  }

  function resetProjectData() {
    projectWorkspaceRepository.resetProjectData();
    paletteColorRows.splice(0);
    usageRows.splice(0);
    workspaceRecords.clear();
    selectedSymbol = "";
    return getSnapshot();
  }

  function getTables() {
    return {
      palette_colors: paletteColorRows.map((row) => ({
        ...row,
        tags: [...row.tags]
      })),
      palette_swatch_usages: usageRows.map((row) => ({ ...row })),
      project_workspace_palette_globals: [...workspaceRecords.values()].map((record) => ({
        projectId: record.projectId,
        swatchCount: swatchesFromColorRows(record.projectId).length,
        toolKey: PALETTE_TOOL_KEY,
        workspacePath: PALETTE_WORKSPACE_PATH
      }))
    };
  }

  function getSnapshot(optionsForSnapshot = {}) {
    const activeProject = getActiveProject();
    const projectId = activeProject?.id || "";
    let swatches = [];
    let validation = {
      findings: [],
      status: "Ready"
    };
    let workspace = null;

    if (projectId) {
      workspace = cloneWorkspaceRecord(syncWorkspaceRecordFromColors(projectId));
      const payloadValidation = validatePaletteWorkspacePayload(workspace);
      validation = {
        findings: payloadValidation.issues,
        status: payloadValidation.valid ? "Ready" : "Reject"
      };
      swatches = payloadValidation.valid
        ? workspace.tools[PALETTE_TOOL_KEY].swatches.map(cloneSwatch).sort(compareSwatches(optionsForSnapshot.sortKey || "name"))
        : [];
    } else {
      validation = {
        findings: [createIssue("activeProject", "Active Project", "Open a project before editing palette swatches.")],
        status: "Blocked"
      };
    }

    const selectedSwatch = projectId && validation.status === "Ready" ? getSelectedSwatch() : null;
    const tableCounts = Object.entries(getTables()).map(([table, rows]) => ({
      rows: rows.length,
      table
    }));

    return {
      activeProject,
      canRedo: Boolean(projectId && (redoStacks.get(projectId) || []).length),
      canUndo: Boolean(projectId && (undoStacks.get(projectId) || []).length),
      harmony: createHarmonySuggestions(selectedSwatch),
      palettePath: PALETTE_WORKSPACE_PATH,
      projectRequired: !projectId,
      selectedSwatch: selectedSwatch ? cloneSwatch(selectedSwatch) : null,
      sourcePaletteOptions: sourcePaletteOptions(),
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
    displaySource,
    findSwatch,
    getActiveProject,
    getSnapshot,
    getSwatchUsage,
    getTables,
    isSourceSwatchPinned,
    listSourceSwatches,
    listSwatches,
    loadActiveProjectPalettePayload,
    pinSourceSwatch,
    recordSwatchUsage,
    redo,
    removeSelectedSwatch,
    resetProjectData,
    seedActiveProjectPalette,
    selectSwatch,
    sourcePaletteOptions,
    toggleSourceSwatchPin,
    undo,
    updateSelectedSwatch
  };
}
