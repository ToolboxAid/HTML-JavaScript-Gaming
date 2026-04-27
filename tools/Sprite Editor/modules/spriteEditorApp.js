/*
Toolbox Aid
David Quesenberry
04/03/2026
spriteEditorApp.js
*/
import {
  DEFAULT_FPS,
  DEFAULT_HEIGHT,
  DEFAULT_PIXEL_SIZE,
  DEFAULT_WIDTH,
  HISTORY_LIMIT,
  MAX_RECENT_COLORS,
  NO_PALETTE_ID,
  PALETTE_SOURCE_ID,
  PROJECT_FORMAT,
  TOOL_IDS
} from "./constants.js";
import { colorToPickerValue, dedupeColors, isTransparent, normalizeColor, rgbaToHex } from "./colorUtils.js";
import {
  cloneFrame,
  createEmptyFrame,
  createNewProject,
  ensureProjectShape,
  frameIndex,
  resizeProject,
  serializeProject
} from "./projectModel.js";
import {
  buildAssetDependencyGraph,
  createAssetId,
  createAssetRegistry,
  createRegistryDownloadPayload,
  findRegistryEntryById,
  mergeAssetRegistries,
  normalizeProjectRelativePath,
  sanitizeAssetRegistry,
  upsertRegistryEntry
} from "../../shared/projectAssetRegistry.js";
import { registerAssetPipelineCandidate } from "../../shared/assetPipelineFoundation.js";
import {
  getBlockingAssetValidationMessage,
  hasBlockingAssetValidationFindings,
  summarizeAssetValidation,
  validateProjectAssetState
} from "../../shared/projectAssetValidation.js";
import {
  buildProjectAssetRemediation,
  getPrimaryRemediationAction,
  summarizeProjectAssetRemediation
} from "../../shared/projectAssetRemediation.js";
import { buildProjectPackage, summarizeProjectPackaging } from "../../shared/projectPackaging.js";
import { buildEditorExperienceLayer, summarizeEditorExperienceLayer } from "../../shared/editorExperienceLayer.js";
import { buildDebugVisualizationLayer, summarizeDebugVisualizationLayer } from "../../shared/debugVisualizationLayer.js";
import { addToolModeMetadata, assertStandaloneToolDocument, offerImportMismatchOptions } from "../../shared/documentModeGuards.js";
import {
  getToolLoadQuerySnapshot,
  getToolLoadRequestedDataPaths,
  summarizeToolLoadData,
  logToolLoadRequest,
  logToolLoadFetch,
  logToolLoadLoaded,
  logToolLoadWarning
} from "../../shared/toolLoadDiagnostics.js";

const CANONICAL_PALETTE_SCHEMA = "html-js-gaming.palette";
const CANONICAL_PALETTE_REQUIRED_FIELDS = Object.freeze(["schema", "version", "name", "swatches"]);
const CANONICAL_PALETTE_REQUIRED_ARRAY_FIELDS = Object.freeze(["swatches"]);

function getRequiredElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing required element: ${id}`);
  }
  return element;
}

function clamp(value, min, max, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, parsed));
}

function normalizePaletteEntryColor(value) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }
  return normalizeColor(value);
}

function extractPaletteColors(rawEntries) {
  if (!Array.isArray(rawEntries)) {
    return [];
  }

  const colors = [];
  const seen = new Set();
  rawEntries.forEach((entry) => {
    const next = normalizePaletteEntryColor(entry?.hex);
    if (!next || seen.has(next)) {
      return;
    }
    seen.add(next);
    colors.push(next);
  });
  return colors;
}

function buildEnginePaletteCatalog() {
  const source = globalThis.palettesList;
  if (!source || typeof source !== "object") {
    return {
      available: false,
      groups: {},
      options: [],
      error: "Engine palette list is unavailable. Confirm ../../src/engine/paletteList.js is loaded."
    };
  }

  const groups = {};
  const options = [{ id: NO_PALETTE_ID, label: "Select Palette..." }];
  const names = Object.keys(source);

  names.forEach((name) => {
    const colors = extractPaletteColors(source[name]);
    if (colors.length === 0) {
      return;
    }
    groups[name] = colors;
    options.push({ id: name, label: name });
  });

  if (options.length <= 1) {
    return {
      available: false,
      groups: {},
      options,
      error: "Engine palette list loaded but no usable palettes were found."
    };
  }

  return {
    available: true,
    groups,
    options,
    error: ""
  };
}

function deriveSpriteFileName(project) {
  return `sprite-project-${project.width}x${project.height}-${project.frames.length}f.json`;
}

function deriveDefaultSpriteAssetPath(project) {
  const fileName = deriveSpriteFileName(project);
  return normalizeProjectRelativePath(`assets/sprites/${fileName}`);
}

function syncRegistryProjectId(state) {
  if (!state.assetRegistry || typeof state.assetRegistry !== "object") {
    state.assetRegistry = createAssetRegistry({ projectId: "sprite-project" });
    return;
  }

  const activeSpriteId = state.project?.assetRefs?.spriteId || "";
  if (activeSpriteId) {
    state.assetRegistry.projectId = state.assetRegistry.projectId || activeSpriteId;
    return;
  }

  state.assetRegistry.projectId = state.assetRegistry.projectId || "sprite-project";
}

function syncSpriteAssetsToRegistry(state, options = {}) {
  syncRegistryProjectId(state);

  const preferredPath = normalizeProjectRelativePath(options.spritePath || "");
  const spritePath = preferredPath || deriveDefaultSpriteAssetPath(state.project);
  const spriteName = deriveSpriteFileName(state.project).replace(/\.json$/i, "");
  const spriteAssetId = createAssetId("sprite", spriteName, "sprite");
  let nextRegistry = state.assetRegistry;
  let paletteAssetId = "";

  if (isPaletteLocked(state.project) && state.project.paletteRef?.id && state.project.paletteRef.id !== NO_PALETTE_ID) {
    paletteAssetId = createAssetId("palette", state.project.paletteRef.id, "palette");
    const paletteRegistration = registerAssetPipelineCandidate({
      registry: nextRegistry,
      section: "palettes",
      ingest: {
        id: paletteAssetId,
        name: state.project.paletteRef.id,
        sourceTool: "sprite-editor"
      },
      entryFields: {
        enginePaletteId: state.project.paletteRef.id,
        colors: state.project.palette.slice()
      }
    });
    nextRegistry = paletteRegistration.registry;
  }

  const spriteRegistration = registerAssetPipelineCandidate({
    registry: nextRegistry,
    section: "sprites",
    ingest: {
      id: spriteAssetId,
      name: spriteName,
      path: spritePath,
      sourceTool: "sprite-editor"
    },
    entryFields: {
      paletteId: paletteAssetId
    }
  });
  nextRegistry = spriteRegistration.registry;

  state.assetRegistry = sanitizeAssetRegistry(nextRegistry);
  state.project.assetRefs = {
    paletteId: paletteAssetId,
    spriteId: spriteAssetId
  };
}

function resolvePaletteFromAssetRegistry(state) {
  const paletteAssetId = state.project?.assetRefs?.paletteId;
  if (!paletteAssetId || !state.enginePalette.available) {
    return false;
  }

  const entry = findRegistryEntryById(state.assetRegistry, "palettes", paletteAssetId);
  if (!entry) {
    return false;
  }

  const enginePaletteId = typeof entry.enginePaletteId === "string" && entry.enginePaletteId.trim()
    ? entry.enginePaletteId.trim()
    : typeof entry.name === "string" && entry.name.trim()
      ? entry.name.trim()
      : "";
  if (!enginePaletteId) {
    return false;
  }

  const locked = applyLockedPaletteToProject(state, enginePaletteId, { preferExistingActiveColor: true });
  if (!locked) {
    return false;
  }
  state.project.paletteRef = {
    source: PALETTE_SOURCE_ID,
    id: enginePaletteId,
    locked: true
  };
  return true;
}

function downloadBlob(blob, filename) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function summarizeGraphFindings(findings) {
  return Array.isArray(findings) && findings.length > 0
    ? ` Graph findings: ${findings.length}.`
    : " Graph findings: none.";
}

function validateSpriteProjectAssets(state) {
  const result = validateProjectAssetState({
    registry: state.assetRegistry,
    assetDependencyGraph: state.assetDependencyGraphSnapshot,
    spriteProject: state.project
  });
  state.validationResult = result;
  state.remediationResult = buildProjectAssetRemediation({
    validationResult: result,
    registry: state.assetRegistry
  });
  state.editorExperienceResult = buildEditorExperienceLayer({
    assetDependencyGraph: result.assetDependencyGraph,
    validationResult: result,
    remediationResult: state.remediationResult,
    packageResult: state.lastPackageResult,
    runtimeResult: state.lastRuntimeResult
  });
  state.debugVisualizationResult = buildDebugVisualizationLayer({
    assetDependencyGraph: result.assetDependencyGraph,
    validationResult: result,
    remediationResult: state.remediationResult,
    packageResult: state.lastPackageResult,
    runtimeResult: state.lastRuntimeResult
  });
  return result;
}

function updateRemediationUI(state) {
  const summary = summarizeProjectAssetRemediation(state.remediationResult);
  if (state.elements.remediationSummaryText) {
    state.elements.remediationSummaryText.textContent = summary;
  }
  const primaryNavigation = getPrimaryRemediationAction(state.remediationResult, "navigate");
  const primaryFix = getPrimaryRemediationAction(state.remediationResult, "confirmable-fix");
  if (state.elements.inspectRemediationButton) {
    state.elements.inspectRemediationButton.disabled = state.remediationResult?.remediation?.status !== "available";
  }
  if (state.elements.jumpToProblemButton) {
    state.elements.jumpToProblemButton.disabled = !primaryNavigation;
  }
  if (state.elements.applyRemediationButton) {
    state.elements.applyRemediationButton.disabled = !primaryFix;
  }
}

function updateEditorExperienceUI(state) {
  if (!state.elements.experienceSummaryText || !state.elements.experienceDetailsText) {
    return;
  }
  state.elements.experienceSummaryText.textContent = summarizeEditorExperienceLayer(state.editorExperienceResult);
  state.elements.experienceDetailsText.textContent = state.editorExperienceResult?.experience?.reportText || "No experience snapshot available.";
}

function updateDebugVisualizationUI(state) {
  if (!state.elements.debugSummaryText || !state.elements.debugDetailsText) {
    return;
  }
  state.elements.debugSummaryText.textContent = summarizeDebugVisualizationLayer(state.debugVisualizationResult);
  state.elements.debugDetailsText.textContent = state.debugVisualizationResult?.debugVisualization?.reportText || "No debug visualization available.";
}

function inspectRemediationActions(state) {
  const actions = state.remediationResult?.remediation?.actions || [];
  if (actions.length === 0) {
    setStatus(state, "No remediation actions are currently available.");
    return false;
  }
  const preview = actions
    .slice(0, 3)
    .map((action) => `${action.label}: ${action.message}`)
    .join(" | ");
  setStatus(state, `Remediation actions: ${preview}`);
  return true;
}

function jumpToRemediationProblem(state) {
  const action = getPrimaryRemediationAction(state.remediationResult, "navigate");
  if (!action) {
    setStatus(state, "No navigation remediation action is available.");
    return false;
  }

  if (action.findingCode === "UNRESOLVED_PALETTE_LINK") {
    state.elements.paletteSelect.focus();
    setStatus(state, `Jumped to palette selection for ${action.sourceId || "the current sprite"}: ${action.message}`);
    return true;
  }

  if (action.findingCode === "MISSING_ASSET_ID" || action.findingCode === "DUPLICATE_REGISTRY_ID") {
    state.elements.saveAssetRegistryButton.focus();
    setStatus(state, `Jumped to project I/O for ${action.sourceId || "the current sprite"}: ${action.message}`);
    return true;
  }

  state.elements.statusText.focus?.();
  setStatus(state, `Inspected ${action.sourceId || "the current issue"}: ${action.message}`);
  return true;
}

function applyRemediationAction(state) {
  const action = getPrimaryRemediationAction(state.remediationResult, "confirmable-fix");
  if (!action) {
    setStatus(state, "No confirmable remediation fix is available.");
    return false;
  }

  const shouldApply = typeof window.confirm === "function"
    ? window.confirm(`${action.label}? ${action.message}`)
    : true;
  if (!shouldApply) {
    setStatus(state, "Remediation fix canceled.");
    return false;
  }

  if (action.payload?.fixKind === "refresh-owned-registry-entry") {
    syncSpriteAssetsToRegistry(state, {});
  } else if (action.payload?.fixKind === "relink-reference" && action.payload.referenceField === "paletteId") {
    state.project.assetRefs = {
      ...(state.project.assetRefs || {}),
      paletteId: action.payload.candidateId || "",
      spriteId: state.project.assetRefs?.spriteId || ""
    };
    resolvePaletteFromAssetRegistry(state);
  } else if (action.payload?.fixKind === "refresh-graph-snapshot") {
    const validation = validateProjectAssetState({
      registry: state.assetRegistry,
      spriteProject: state.project
    });
    state.assetDependencyGraphSnapshot = validation.assetDependencyGraph;
  }

  const validation = validateSpriteProjectAssets(state);
  syncControlsFromProject(state);
  renderAll(state);
  setStatus(state, `Applied remediation: ${action.label}. Validation: ${summarizeAssetValidation(validation)}.`);
  return true;
}

function guardSpriteProjectAction(state, actionLabel) {
  const validation = validateSpriteProjectAssets(state);
  if (!hasBlockingAssetValidationFindings(validation)) {
    return validation;
  }
  setStatus(state, `${getBlockingAssetValidationMessage(actionLabel, validation)} (${summarizeAssetValidation(validation)}).`);
  return null;
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not create blob from canvas."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

function fileToText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsText(file);
  });
}

function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Failed to decode PNG image."));
      image.onload = () => resolve(image);
      image.src = String(reader.result ?? "");
    };
    reader.readAsDataURL(file);
  });
}

function createCheckerboard(context, width, height, size) {
  for (let y = 0; y < height; y += size) {
    for (let x = 0; x < width; x += size) {
      const even = ((x / size) + (y / size)) % 2 === 0;
      context.fillStyle = even ? "#314c66" : "#22374d";
      context.fillRect(x, y, size, size);
    }
  }
}

function drawFramePixels(context, frame, width, height, pixelSize, alpha = 1) {
  context.save();
  context.globalAlpha = alpha;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const color = frame.pixels[frameIndex(width, x, y)];
      if (!color) {
        continue;
      }
      context.fillStyle = color;
      context.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }

  context.restore();
}

function createImageFromFrame(frame, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("Could not acquire 2D context for export.");
  }

  const imageData = context.createImageData(width, height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const color = frame.pixels[frameIndex(width, x, y)];
      const offset = frameIndex(width, x, y) * 4;
      if (!color) {
        imageData.data[offset + 3] = 0;
        continue;
      }

      const normalized = normalizeColor(color);
      imageData.data[offset] = Number.parseInt(normalized.slice(1, 3), 16);
      imageData.data[offset + 1] = Number.parseInt(normalized.slice(3, 5), 16);
      imageData.data[offset + 2] = Number.parseInt(normalized.slice(5, 7), 16);
      imageData.data[offset + 3] = Number.parseInt(normalized.slice(7, 9), 16);
    }
  }

  context.putImageData(imageData, 0, 0);
  return canvas;
}

function createSpriteSheetCanvas(project) {
  const sheetCanvas = document.createElement("canvas");
  sheetCanvas.width = project.width * project.frames.length;
  sheetCanvas.height = project.height;

  const context = sheetCanvas.getContext("2d");
  if (!context) {
    throw new Error("Could not acquire 2D context for sprite sheet export.");
  }

  for (let i = 0; i < project.frames.length; i += 1) {
    const frameCanvas = createImageFromFrame(project.frames[i], project.width, project.height);
    context.drawImage(frameCanvas, i * project.width, 0);
  }

  return sheetCanvas;
}

function pushRecentColor(project, color) {
  const normalized = normalizeColor(color);
  const merged = dedupeColors([normalized, ...project.recentColors]);
  project.recentColors = merged.slice(0, MAX_RECENT_COLORS);
}

function selectColor(project, color) {
  project.activeColor = normalizeColor(color);
  pushRecentColor(project, project.activeColor);
}

function setPixel(frame, width, height, x, y, color) {
  if (x < 0 || y < 0) {
    return false;
  }
  if (x >= width || y >= height) {
    return false;
  }

  const index = frameIndex(width, x, y);
  const nextValue = color ? normalizeColor(color) : null;

  if (frame.pixels[index] === nextValue) {
    return false;
  }

  frame.pixels[index] = nextValue;
  return true;
}

function willPixelChange(frame, width, height, x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= height) {
    return false;
  }
  const index = frameIndex(width, x, y);
  const nextValue = color ? normalizeColor(color) : null;
  return frame.pixels[index] !== nextValue;
}

function canFloodFill(frame, width, startX, startY, replacement) {
  const startIndex = frameIndex(width, startX, startY);
  const target = frame.pixels[startIndex] ?? null;
  const nextValue = replacement ? normalizeColor(replacement) : null;
  return target !== nextValue;
}

function floodFill(frame, width, height, startX, startY, replacement) {
  const startIndex = frameIndex(width, startX, startY);
  const target = frame.pixels[startIndex] ?? null;
  const nextValue = replacement ? normalizeColor(replacement) : null;
  if (target === nextValue) {
    return false;
  }

  const queue = [[startX, startY]];
  const visited = new Uint8Array(width * height);

  while (queue.length > 0) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) {
      continue;
    }

    const idx = frameIndex(width, x, y);
    if (visited[idx] === 1) {
      continue;
    }
    visited[idx] = 1;

    const value = frame.pixels[idx] ?? null;
    if (value !== target) {
      continue;
    }

    frame.pixels[idx] = nextValue;
    queue.push([x + 1, y]);
    queue.push([x - 1, y]);
    queue.push([x, y + 1]);
    queue.push([x, y - 1]);
  }

  return true;
}

function bresenhamLine(x0, y0, x1, y1, drawPoint) {
  let x = x0;
  let y = y0;
  const dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let error = dx + dy;

  while (true) {
    drawPoint(x, y);
    if (x === x1 && y === y1) {
      break;
    }

    const e2 = 2 * error;
    if (e2 >= dy) {
      error += dy;
      x += sx;
    }
    if (e2 <= dx) {
      error += dx;
      y += sy;
    }
  }
}

function getCanvasPixelFromEvent(canvas, event, project) {
  const rect = canvas.getBoundingClientRect();
  const relativeX = ((event.clientX - rect.left) * canvas.width) / Math.max(rect.width, 1);
  const relativeY = ((event.clientY - rect.top) * canvas.height) / Math.max(rect.height, 1);

  const x = Math.floor(relativeX / project.pixelSize);
  const y = Math.floor(relativeY / project.pixelSize);

  return {
    x: Math.max(0, Math.min(project.width - 1, x)),
    y: Math.max(0, Math.min(project.height - 1, y))
  };
}

function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

function setStatus(state, message) {
  state.elements.statusText.textContent = message;
}

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
  if (trimmed.startsWith("/games/")) {
    return trimmed;
  }
  if (trimmed.startsWith("./samples/")) {
    return trimmed;
  }
  if (trimmed.startsWith("./games/")) {
    return trimmed;
  }
  if (trimmed.startsWith("samples/")) {
    return `./${trimmed}`;
  }
  if (trimmed.startsWith("games/")) {
    return `./${trimmed}`;
  }
  return "";
}

function readFirstPathValue(value) {
  if (Array.isArray(value)) {
    return normalizeSamplePresetPath(value[0] || "");
  }
  return normalizeSamplePresetPath(value || "");
}

function deriveCanonicalPalettePathFromPresetPath(samplePresetPath) {
  const normalizedPresetPath = normalizeSamplePresetPath(samplePresetPath);
  if (!normalizedPresetPath) {
    return "";
  }
  const dotted = normalizedPresetPath.replace(/\.sprite-editor\.json(?=$|[?#])/i, ".palette.json");
  if (dotted !== normalizedPresetPath) {
    return dotted;
  }
  const dashed = normalizedPresetPath.replace(/-sprite-editor\.json(?=$|[?#])/i, ".palette.json");
  if (dashed !== normalizedPresetPath) {
    return dashed;
  }
  return "";
}

function resolveRequiredPaletteInput(searchParams, requestedDataPaths, samplePresetPath) {
  const fromPalettePathParam = normalizeSamplePresetPath(searchParams.get("palettePath") || "");
  if (fromPalettePathParam) {
    return {
      path: fromPalettePathParam,
      pathSource: "tool-input:query.palettePath"
    };
  }

  const requestedEntries = Object.entries(requestedDataPaths || {});
  for (const [key, value] of requestedEntries) {
    if (!/palette/i.test(key)) {
      continue;
    }
    const normalized = readFirstPathValue(value);
    if (normalized) {
      return {
        path: normalized,
        pathSource: `tool-input:query.${key}`
      };
    }
  }

  const fromSamplePreset = deriveCanonicalPalettePathFromPresetPath(samplePresetPath);
  if (fromSamplePreset) {
    return {
      path: fromSamplePreset,
      pathSource: "tool-input:derived.samplePresetPath"
    };
  }

  return {
    path: "",
    pathSource: "tool-input:missing.palettePath"
  };
}

function extractCanonicalPalettePayload(rawPalette) {
  if (!rawPalette || typeof rawPalette !== "object" || Array.isArray(rawPalette)) {
    return null;
  }
  if (Array.isArray(rawPalette.swatches)) {
    return rawPalette;
  }
  if (rawPalette.palette && typeof rawPalette.palette === "object" && !Array.isArray(rawPalette.palette)) {
    return rawPalette.palette;
  }
  if (rawPalette.payload && typeof rawPalette.payload === "object" && !Array.isArray(rawPalette.payload)) {
    if (Array.isArray(rawPalette.payload.swatches)) {
      return rawPalette.payload;
    }
    if (rawPalette.payload.palette && typeof rawPalette.payload.palette === "object" && !Array.isArray(rawPalette.payload.palette)) {
      return rawPalette.payload.palette;
    }
  }
  return null;
}

function parseCanonicalPalettePayload(rawPalette) {
  const palette = extractCanonicalPalettePayload(rawPalette);
  if (!palette) {
    throw new Error("Palette payload did not include a canonical palette object.");
  }

  const schema = typeof palette.schema === "string" ? palette.schema.trim() : "";
  if (schema !== CANONICAL_PALETTE_SCHEMA) {
    throw new Error(`Palette schema mismatch. Expected ${CANONICAL_PALETTE_SCHEMA}.`);
  }
  if (!Number.isInteger(palette.version) || palette.version < 1) {
    throw new Error("Palette version must be an integer >= 1.");
  }
  if (typeof palette.name !== "string" || !palette.name.trim()) {
    throw new Error("Palette name is required.");
  }
  if (!Array.isArray(palette.swatches) || palette.swatches.length === 0) {
    throw new Error("Palette swatches are required.");
  }

  const colors = extractPaletteColors(palette.swatches);
  if (colors.length === 0) {
    throw new Error("Palette swatches did not contain valid colors.");
  }

  const paletteId = (
    (typeof palette.sourceId === "string" && palette.sourceId.trim())
    || (typeof palette.name === "string" && palette.name.trim())
    || "sample-palette"
  );
  const topLevelKeys = Object.keys(palette);

  return {
    paletteId,
    colors,
    swatchCount: colors.length,
    loadedSchema: schema,
    topLevelKeys
  };
}

function applyCanonicalPaletteToProject(state, canonicalPalette) {
  const colors = dedupeColors(canonicalPalette.colors).slice(0, 256);
  if (colors.length === 0) {
    throw new Error("Canonical palette did not contain usable colors.");
  }

  const previousActive = typeof state.project.activeColor === "string"
    ? normalizeColor(state.project.activeColor)
    : "";
  state.project.palette = colors;
  state.project.paletteRef = {
    source: PALETTE_SOURCE_ID,
    id: canonicalPalette.paletteId,
    locked: true
  };
  state.project.activeColor = previousActive && colors.includes(previousActive)
    ? previousActive
    : colors[0];
  state.project.recentColors = dedupeColors([state.project.activeColor, ...(state.project.recentColors || [])]).slice(0, MAX_RECENT_COLORS);
}

function buildPresetLoadedStatus(sampleId, samplePresetPath) {
  const normalizedSampleId = typeof sampleId === "string" ? sampleId.trim() : "";
  if (normalizedSampleId) {
    return `Loaded preset from sample ${normalizedSampleId}.`;
  }
  const normalizedPath = typeof samplePresetPath === "string" ? samplePresetPath.trim() : "";
  return normalizedPath ? `Loaded preset from ${normalizedPath}.` : "Loaded preset.";
}

function normalizeSampleLabel(rawLabel) {
  if (typeof rawLabel !== "string") {
    return "";
  }
  return rawLabel.trim().replace(/\s+/g, " ");
}

function buildSampleSourceLabel(source = {}) {
  const mode = typeof source.mode === "string" ? source.mode.trim() : "";
  const sampleId = typeof source.sampleId === "string" ? source.sampleId.trim() : "";
  const sampleTitle = normalizeSampleLabel(source.sampleTitle);
  const samplePresetPath = typeof source.samplePresetPath === "string" ? source.samplePresetPath.trim() : "";
  const fileName = typeof source.fileName === "string" ? source.fileName.trim() : "";

  if (sampleId && sampleTitle) {
    return `Sample ${sampleId} - ${sampleTitle}`;
  }
  if (sampleId) {
    return `Sample ${sampleId}`;
  }
  if (samplePresetPath) {
    return `Sample preset: ${samplePresetPath}`;
  }
  if (fileName) {
    return `File: ${fileName}`;
  }
  if (mode === "workspace") {
    return "Workspace state";
  }
  return "Tool mode";
}

function setSampleSource(state, source = {}) {
  state.sampleSource = {
    mode: typeof source.mode === "string" ? source.mode.trim() : "tool",
    sampleId: typeof source.sampleId === "string" ? source.sampleId.trim() : "",
    sampleTitle: normalizeSampleLabel(source.sampleTitle),
    samplePresetPath: typeof source.samplePresetPath === "string" ? source.samplePresetPath.trim() : "",
    fileName: typeof source.fileName === "string" ? source.fileName.trim() : ""
  };
}

function buildSampleSourceDetailLabel(source = {}) {
  const summary = buildSampleSourceLabel(source);
  const samplePresetPath = typeof source.samplePresetPath === "string" ? source.samplePresetPath.trim() : "";
  const fileName = typeof source.fileName === "string" ? source.fileName.trim() : "";
  const detail = samplePresetPath || fileName;
  return detail ? `${summary} (${detail})` : summary;
}

function isPaletteSelected(project) {
  return Boolean(project.paletteRef?.id && project.paletteRef.id !== NO_PALETTE_ID);
}

function isPaletteLocked(project) {
  return isPaletteSelected(project) && project.paletteRef?.locked === true;
}

function isEditingEnabled(state) {
  return Boolean(
    state.enginePalette.available
    && isPaletteLocked(state.project)
    && Array.isArray(state.project.palette)
    && state.project.palette.length > 0
    && typeof state.project.activeColor === "string"
  );
}

function ensureEditingEnabled(state, blockedMessage = "Select and lock a palette before editing.") {
  if (isEditingEnabled(state)) {
    return true;
  }
  setStatus(state, blockedMessage);
  return false;
}

function renderPaletteSelect(state) {
  const select = state.elements.paletteSelect;
  select.innerHTML = "";

  const options = state.enginePalette.options.length > 0
    ? state.enginePalette.options
    : [{ id: NO_PALETTE_ID, label: "Select Palette..." }];

  options.forEach((entry) => {
    const option = document.createElement("option");
    option.value = entry.id;
    option.textContent = entry.label;
    select.appendChild(option);
  });

  const selectedId = state.project.paletteRef?.id ?? NO_PALETTE_ID;
  const hasSelectedOption = options.some((entry) => entry.id === selectedId);
  select.value = hasSelectedOption ? selectedId : NO_PALETTE_ID;
  select.disabled = !state.enginePalette.available || isPaletteLocked(state.project);
}

function updatePaletteLockText(state) {
  if (!state.enginePalette.available) {
    state.elements.paletteLockText.textContent = state.enginePalette.error || "Engine palette list unavailable. Editing is disabled.";
    return;
  }

  if (!isPaletteLocked(state.project)) {
    state.elements.paletteLockText.textContent = "Palette not selected. Editing is disabled until you select one from the engine list.";
    return;
  }

  state.elements.paletteLockText.textContent = `Palette locked to ${state.project.paletteRef.id}. Use Create New Canvas to unlock and choose a different palette.`;
}

function applyLockedPaletteToProject(state, paletteId, options = {}) {
  const colors = state.enginePalette.groups[paletteId];
  if (!Array.isArray(colors) || colors.length === 0) {
    return false;
  }

  const previousActive = typeof state.project.activeColor === "string"
    ? normalizeColor(state.project.activeColor)
    : null;

  state.project.palette = dedupeColors(colors).slice(0, 256);
  state.project.paletteRef = {
    source: PALETTE_SOURCE_ID,
    id: paletteId,
    locked: true
  };

  if (options.preferExistingActiveColor && previousActive && state.project.palette.includes(previousActive)) {
    state.project.activeColor = previousActive;
  } else {
    state.project.activeColor = state.project.palette[0];
  }

  if (!Array.isArray(state.project.recentColors)) {
    state.project.recentColors = [];
  }

  if (state.project.activeColor) {
    const recent = dedupeColors([state.project.activeColor, ...state.project.recentColors]).slice(0, MAX_RECENT_COLORS);
    state.project.recentColors = recent;
  } else {
    state.project.recentColors = [];
  }

  return true;
}

function clearPaletteLock(state) {
  state.project.paletteRef = {
    source: PALETTE_SOURCE_ID,
    id: NO_PALETTE_ID,
    locked: false
  };
  state.project.palette = [];
  state.project.activeColor = null;
  state.project.recentColors = [];
  state.projectTool = TOOL_IDS.PENCIL;
}

function hydratePaletteFromRefIfPossible(state) {
  const paletteId = state.project.paletteRef?.id;
  if (!paletteId || paletteId === NO_PALETTE_ID) {
    return false;
  }

  if (!state.enginePalette.available) {
    return false;
  }

  const locked = applyLockedPaletteToProject(state, paletteId, { preferExistingActiveColor: true });
  if (!locked) {
    clearPaletteLock(state);
    return false;
  }
  return true;
}

function updateEditGateDisabledState(state) {
  const editable = isEditingEnabled(state);
  const toolButtons = state.elements.toolButtons.querySelectorAll("[data-tool]");

  toolButtons.forEach((button) => {
    if (button instanceof HTMLButtonElement) {
      button.disabled = !editable;
    }
  });

  state.elements.canvasWidthInput.disabled = !editable;
  state.elements.canvasHeightInput.disabled = !editable;
  state.elements.addFrameButton.disabled = !editable;
  state.elements.duplicateFrameButton.disabled = !editable;
  state.elements.deleteFrameButton.disabled = !editable;
  state.elements.prevFrameButton.disabled = !editable;
  state.elements.nextFrameButton.disabled = !editable;
  state.elements.importPngButton.disabled = !editable;
  state.elements.exportPngButton.disabled = !editable;
  state.elements.exportSheetButton.disabled = !editable;
  state.elements.gridToggle.disabled = !editable;
  state.elements.onionSkinToggle.disabled = !editable;
  state.elements.undoButton.disabled = !editable || state.history.undoStack.length === 0;
  state.elements.redoButton.disabled = !editable || state.history.redoStack.length === 0;
  state.elements.colorPicker.disabled = true;
}

function syncControlsFromProject(state) {
  state.elements.canvasWidthInput.value = String(state.project.width);
  state.elements.canvasHeightInput.value = String(state.project.height);
  state.elements.pixelSizeInput.value = String(state.project.pixelSize);
  state.elements.gridToggle.checked = state.project.showGrid;
  state.elements.onionSkinToggle.checked = state.project.onionSkin;
  state.elements.colorPicker.value = typeof state.project.activeColor === "string"
    ? colorToPickerValue(state.project.activeColor)
    : "#000000";
  renderPaletteSelect(state);
  updatePaletteLockText(state);
  updateEditGateDisabledState(state);
}

function createHistorySnapshot(state) {
  return {
    project: serializeProject(state.project, { includePalette: true }),
    projectTool: state.projectTool,
    previewFrameIndex: state.preview.frameIndex
  };
}

function applyHistorySnapshot(state, snapshot) {
  state.project = ensureProjectShape(snapshot.project);
  hydratePaletteFromRefIfPossible(state);
  state.projectTool = snapshot.projectTool ?? TOOL_IDS.PENCIL;
  syncControlsFromProject(state);
  state.preview.frameIndex = clamp(snapshot.previewFrameIndex, 0, state.project.frames.length - 1, state.project.currentFrameIndex);
}

function updateHistoryButtons(state) {
  state.elements.undoButton.disabled = state.history.undoStack.length === 0;
  state.elements.redoButton.disabled = state.history.redoStack.length === 0;
  updateEditGateDisabledState(state);
}

function pushHistory(state) {
  state.history.undoStack.push(createHistorySnapshot(state));
  if (state.history.undoStack.length > state.history.limit) {
    state.history.undoStack.shift();
  }
  state.history.redoStack = [];
  updateHistoryButtons(state);
}

function undo(state) {
  if (state.history.undoStack.length === 0) {
    setStatus(state, "Nothing to undo.");
    return;
  }

  const snapshot = state.history.undoStack.pop();
  state.history.redoStack.push(createHistorySnapshot(state));
  applyHistorySnapshot(state, snapshot);
  updateHistoryButtons(state);
  setStatus(state, "Undo applied.");
  renderAll(state);
}

function redo(state) {
  if (state.history.redoStack.length === 0) {
    setStatus(state, "Nothing to redo.");
    return;
  }

  const snapshot = state.history.redoStack.pop();
  state.history.undoStack.push(createHistorySnapshot(state));
  applyHistorySnapshot(state, snapshot);
  updateHistoryButtons(state);
  setStatus(state, "Redo applied.");
  renderAll(state);
}

function applySwatchVisual(button, color) {
  if (isTransparent(color)) {
    button.style.background = "linear-gradient(45deg, #2c445d 25%, #4d6a87 25%, #4d6a87 50%, #2c445d 50%, #2c445d 75%, #4d6a87 75%, #4d6a87 100%)";
    button.style.backgroundSize = "10px 10px";
    return;
  }
  button.style.background = normalizeColor(color);
}

function updateStatusBar(state) {
  const cursorLabel = state.cursor.x === null || state.cursor.y === null
    ? "-, -"
    : `${state.cursor.x}, ${state.cursor.y}`;
  const paletteLabel = isPaletteLocked(state.project)
    ? state.project.paletteRef.id
    : "none";
  state.elements.statusBarText.textContent = `Canvas: ${state.project.width}x${state.project.height} | Zoom: ${state.project.pixelSize} | Frame: ${state.project.currentFrameIndex + 1}/${state.project.frames.length} | Palette: ${paletteLabel} | Cursor: ${cursorLabel}`;
}

function updateToolStateText(state) {
  const toolName = state.projectTool[0].toUpperCase() + state.projectTool.slice(1);
  state.elements.toolStateText.textContent = `Tool: ${toolName}`;
  state.elements.sampleSourceText.textContent = `Source: ${buildSampleSourceLabel(state.sampleSource)}`;
  state.elements.sampleSourceDetailText.textContent = `Source details: ${buildSampleSourceDetailLabel(state.sampleSource)}.`;
  state.elements.activeColorText.textContent = `Color: ${state.project.activeColor ?? "none"}`;
  state.elements.frameStateText.textContent = `Frame: ${state.project.currentFrameIndex + 1} / ${state.project.frames.length}`;
  state.elements.toggleStateText.textContent = `Grid: ${state.project.showGrid ? "On" : "Off"} | Onion: ${state.project.onionSkin ? "On" : "Off"}`;
  updateStatusBar(state);
}

function renderPalette(state) {
  const paletteRoot = state.elements.paletteButtons;
  paletteRoot.textContent = "";

  state.project.palette.forEach((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "swatch-button";
    if (normalizeColor(color) === state.project.activeColor) {
      button.classList.add("active");
    }
    applySwatchVisual(button, color);
    button.title = normalizeColor(color);
    button.addEventListener("click", () => {
      if (!ensureEditingEnabled(state)) {
        return;
      }
      selectColor(state.project, color);
      state.elements.colorPicker.value = colorToPickerValue(state.project.activeColor);
      setStatus(state, `Active color set to ${state.project.activeColor}.`);
      renderHud(state);
      renderEditor(state);
    });
    paletteRoot.appendChild(button);
  });
}

function renderRecentColors(state) {
  const root = state.elements.recentColorButtons;
  root.textContent = "";

  state.project.recentColors.forEach((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "swatch-button";
    if (normalizeColor(color) === state.project.activeColor) {
      button.classList.add("active");
    }
    applySwatchVisual(button, color);
    button.title = normalizeColor(color);
    button.addEventListener("click", () => {
      if (!ensureEditingEnabled(state)) {
        return;
      }
      selectColor(state.project, color);
      state.elements.colorPicker.value = colorToPickerValue(state.project.activeColor);
      setStatus(state, `Picked recent color ${state.project.activeColor}.`);
      renderHud(state);
      renderEditor(state);
    });
    root.appendChild(button);
  });
}

function renderToolButtons(state) {
  state.elements.toolButtons.querySelectorAll("[data-tool]").forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    const isActive = button.dataset.tool === state.projectTool;
    button.classList.toggle("active", isActive);
  });
}

function renderHud(state) {
  if (typeof state.project.activeColor === "string") {
    state.elements.activeColorSwatch.style.background = isTransparent(state.project.activeColor)
      ? "linear-gradient(45deg, #2c445d 25%, #4d6a87 25%, #4d6a87 50%, #2c445d 50%, #2c445d 75%, #4d6a87 75%, #4d6a87 100%)"
      : state.project.activeColor;
  } else {
    state.elements.activeColorSwatch.style.background = "linear-gradient(45deg, #2c445d 25%, #4d6a87 25%, #4d6a87 50%, #2c445d 50%, #2c445d 75%, #4d6a87 75%, #4d6a87 100%)";
  }
  state.elements.activeColorSwatch.style.backgroundSize = "12px 12px";

  state.elements.frameCounter.textContent = `Frame ${state.project.currentFrameIndex + 1} / ${state.project.frames.length}`;
  state.elements.pixelSizeValue.textContent = String(state.project.pixelSize);
  state.elements.fpsValue.textContent = String(state.preview.fps);
  state.elements.colorPicker.value = typeof state.project.activeColor === "string"
    ? colorToPickerValue(state.project.activeColor)
    : "#000000";

  renderToolButtons(state);
  renderPalette(state);
  renderRecentColors(state);
  updateToolStateText(state);
  updateHistoryButtons(state);
}

function renderEditor(state) {
  const { editorCanvas } = state.elements;
  const project = state.project;
  editorCanvas.width = project.width * project.pixelSize;
  editorCanvas.height = project.height * project.pixelSize;

  const context = editorCanvas.getContext("2d");
  if (!context) {
    return;
  }

  context.clearRect(0, 0, editorCanvas.width, editorCanvas.height);

  if (project.onionSkin && project.frames.length > 1) {
    const prevIndex = (project.currentFrameIndex - 1 + project.frames.length) % project.frames.length;
    drawFramePixels(context, project.frames[prevIndex], project.width, project.height, project.pixelSize, 0.35);
  }

  drawFramePixels(context, project.frames[project.currentFrameIndex], project.width, project.height, project.pixelSize, 1);

  if (project.showGrid && project.pixelSize >= 6) {
    context.strokeStyle = "rgba(181, 221, 255, 0.22)";
    context.lineWidth = 1;
    context.beginPath();
    for (let x = 0; x <= project.width; x += 1) {
      const drawX = x * project.pixelSize + 0.5;
      context.moveTo(drawX, 0);
      context.lineTo(drawX, editorCanvas.height);
    }
    for (let y = 0; y <= project.height; y += 1) {
      const drawY = y * project.pixelSize + 0.5;
      context.moveTo(0, drawY);
      context.lineTo(editorCanvas.width, drawY);
    }
    context.stroke();
  }
}

function renderPreview(state) {
  const { previewCanvas } = state.elements;
  const project = state.project;

  const maxTarget = 220;
  const previewScale = Math.max(1, Math.floor(maxTarget / Math.max(project.width, project.height)));
  previewCanvas.width = project.width * previewScale;
  previewCanvas.height = project.height * previewScale;

  const context = previewCanvas.getContext("2d");
  if (!context) {
    return;
  }

  createCheckerboard(context, previewCanvas.width, previewCanvas.height, Math.max(6, Math.floor(previewScale * 1.5)));

  const frameIndexToRender = state.preview.playing
    ? state.preview.frameIndex
    : project.currentFrameIndex;

  drawFramePixels(
    context,
    project.frames[frameIndexToRender],
    project.width,
    project.height,
    previewScale,
    1
  );
}

function renderAll(state) {
  renderHud(state);
  renderEditor(state);
  renderPreview(state);
  updateRemediationUI(state);
}

function resetProject(state) {
  const width = clamp(state.elements.canvasWidthInput.value, 1, 256, DEFAULT_WIDTH);
  const height = clamp(state.elements.canvasHeightInput.value, 1, 256, DEFAULT_HEIGHT);

  pushHistory(state);
  state.project = createNewProject({
    width,
    height,
    pixelSize: state.project.pixelSize,
    showGrid: state.project.showGrid,
    onionSkin: state.project.onionSkin
  });

  clearPaletteLock(state);
  setSampleSource(state, { mode: "tool" });
  syncControlsFromProject(state);
  state.preview.frameIndex = 0;
  setStatus(state, `Created fresh ${width}x${height} project. Select a palette to enable editing.`);
  renderAll(state);
}

function addFrame(state) {
  if (!ensureEditingEnabled(state)) {
    return;
  }
  pushHistory(state);
  const insertAt = state.project.currentFrameIndex + 1;
  const frame = createEmptyFrame(state.project.width, state.project.height);
  state.project.frames.splice(insertAt, 0, frame);
  state.project.currentFrameIndex = insertAt;
  state.preview.frameIndex = state.project.currentFrameIndex;
  setStatus(state, `Added frame ${state.project.currentFrameIndex + 1}.`);
  renderAll(state);
}

function duplicateFrame(state) {
  if (!ensureEditingEnabled(state)) {
    return;
  }
  pushHistory(state);
  const current = state.project.frames[state.project.currentFrameIndex];
  const copy = cloneFrame(current);
  const insertAt = state.project.currentFrameIndex + 1;
  state.project.frames.splice(insertAt, 0, copy);
  state.project.currentFrameIndex = insertAt;
  state.preview.frameIndex = state.project.currentFrameIndex;
  setStatus(state, `Duplicated into frame ${state.project.currentFrameIndex + 1}.`);
  renderAll(state);
}

function deleteFrame(state) {
  if (!ensureEditingEnabled(state)) {
    return;
  }
  pushHistory(state);
  if (state.project.frames.length === 1) {
    state.project.frames[0] = createEmptyFrame(state.project.width, state.project.height);
    setStatus(state, "Cleared the only frame (minimum one frame is always preserved).");
    renderAll(state);
    return;
  }

  state.project.frames.splice(state.project.currentFrameIndex, 1);
  state.project.currentFrameIndex = Math.max(0, Math.min(state.project.currentFrameIndex, state.project.frames.length - 1));
  state.preview.frameIndex = state.project.currentFrameIndex;
  setStatus(state, `Deleted frame. Active frame is now ${state.project.currentFrameIndex + 1}.`);
  renderAll(state);
}

function shiftFrame(state, direction) {
  if (!ensureEditingEnabled(state)) {
    return;
  }
  const nextIndex = (state.project.currentFrameIndex + direction + state.project.frames.length) % state.project.frames.length;
  state.project.currentFrameIndex = nextIndex;
  if (!state.preview.playing) {
    state.preview.frameIndex = nextIndex;
  }
  setStatus(state, `Moved to frame ${nextIndex + 1} of ${state.project.frames.length}.`);
  renderAll(state);
}

async function importPngIntoCurrentFrame(state, file) {
  if (!ensureEditingEnabled(state, "Select and lock a palette before importing PNG.")) {
    return;
  }
  pushHistory(state);

  const image = await fileToImage(file);
  let resizeDecision = "not needed";

  if (image.width !== state.project.width || image.height !== state.project.height) {
    const shouldResize = window.confirm(
      `Imported PNG is ${image.width}x${image.height} but canvas is ${state.project.width}x${state.project.height}. Resize canvas to match and preserve pixels first?`
    );

    if (shouldResize) {
      resizeDecision = "accepted";
      state.project = resizeProject(state.project, image.width, image.height);
      syncControlsFromProject(state);
    } else {
      resizeDecision = "declined";
    }
  }

  const targetWidth = state.project.width;
  const targetHeight = state.project.height;

  const stagingCanvas = document.createElement("canvas");
  stagingCanvas.width = targetWidth;
  stagingCanvas.height = targetHeight;
  const stagingContext = stagingCanvas.getContext("2d", { willReadFrequently: true });

  if (!stagingContext) {
    throw new Error("Could not decode PNG frame.");
  }

  stagingContext.imageSmoothingEnabled = false;
  stagingContext.clearRect(0, 0, targetWidth, targetHeight);
  stagingContext.drawImage(image, 0, 0, targetWidth, targetHeight);

  const data = stagingContext.getImageData(0, 0, targetWidth, targetHeight).data;
  const frame = createEmptyFrame(targetWidth, targetHeight);

  for (let y = 0; y < targetHeight; y += 1) {
    for (let x = 0; x < targetWidth; x += 1) {
      const idx = frameIndex(targetWidth, x, y);
      const offset = idx * 4;
      const a = data[offset + 3];
      frame.pixels[idx] = a === 0 ? null : rgbaToHex(data[offset], data[offset + 1], data[offset + 2], a);
    }
  }

  state.project.frames[state.project.currentFrameIndex] = frame;
  setStatus(
    state,
    `Imported ${file.name} into frame ${state.project.currentFrameIndex + 1} (${image.width}x${image.height} -> ${targetWidth}x${targetHeight}, resize ${resizeDecision}).`
  );
  renderAll(state);
}

async function exportCurrentFramePng(state) {
  if (!guardSpriteProjectAction(state, "Export PNG")) {
    return;
  }
  const frame = state.project.frames[state.project.currentFrameIndex];
  const frameCanvas = createImageFromFrame(frame, state.project.width, state.project.height);
  const blob = await canvasToBlob(frameCanvas);
  const filename = `sprite-frame-${state.project.currentFrameIndex + 1}-${state.project.width}x${state.project.height}.png`;
  downloadBlob(blob, filename);
  setStatus(state, `Exported ${filename} (${state.project.width}x${state.project.height}).`);
}

async function exportSpriteSheetPng(state) {
  if (!guardSpriteProjectAction(state, "Export Sprite Sheet")) {
    return;
  }
  const sheetCanvas = createSpriteSheetCanvas(state.project);
  const blob = await canvasToBlob(sheetCanvas);
  const filename = `sprite-sheet-${state.project.frames.length}f-${state.project.width}x${state.project.height}.png`;
  downloadBlob(blob, filename);
  setStatus(state, `Exported ${filename} (${sheetCanvas.width}x${sheetCanvas.height}).`);
}

async function packageSpriteProject(state) {
  syncSpriteAssetsToRegistry(state, { spritePath: `assets/sprites/${deriveSpriteFileName(state.project)}` });
  const validation = validateSpriteProjectAssets(state);
  const packageResult = buildProjectPackage({
    registry: state.assetRegistry,
    validationResult: validation,
    spriteProject: state.project
  });
  state.lastPackageResult = packageResult;
  state.editorExperienceResult = buildEditorExperienceLayer({
    assetDependencyGraph: validation.assetDependencyGraph,
    validationResult: validation,
    remediationResult: state.remediationResult,
    packageResult: state.lastPackageResult,
    runtimeResult: state.lastRuntimeResult
  });
  state.debugVisualizationResult = buildDebugVisualizationLayer({
    assetDependencyGraph: validation.assetDependencyGraph,
    validationResult: validation,
    remediationResult: state.remediationResult,
    packageResult: state.lastPackageResult,
    runtimeResult: state.lastRuntimeResult
  });
  updateEditorExperienceUI(state);
  updateDebugVisualizationUI(state);
  if (packageResult.packageStatus !== "ready") {
    setStatus(state, `${summarizeProjectPackaging(packageResult)} ${packageResult.manifest.package.reports[0]?.message || ""}`.trim());
    return false;
  }
  const baseName = `${state.assetRegistry.projectId || "sprite-project"}.package`;
  downloadBlob(new Blob([`${JSON.stringify(packageResult.manifest, null, 2)}\n`], { type: "application/json" }), `${baseName}.json`);
  downloadBlob(new Blob([`${packageResult.reportText}\n`], { type: "text/plain" }), `${baseName}.report.txt`);
  setStatus(state, `${summarizeProjectPackaging(packageResult)} Manifest and report exported.`);
  return true;
}

async function saveAssetRegistryJson(state) {
  syncSpriteAssetsToRegistry(state, {});
  const validation = guardSpriteProjectAction(state, "Save Asset Registry");
  if (!validation) {
    return;
  }
  const { findings } = buildAssetDependencyGraph(state.assetRegistry);
  const payload = createRegistryDownloadPayload(state.assetRegistry);
  const blob = new Blob([payload], { type: "application/json" });
  const fileName = "project.assets.json";
  downloadBlob(blob, fileName);
  setStatus(
    state,
    `Saved ${fileName} with ${state.assetRegistry.sprites.length} sprite entries.${summarizeGraphFindings(findings)} Validation: ${summarizeAssetValidation(validation)}.`
  );
}

async function loadAssetRegistryJson(state, file) {
  const text = await fileToText(file);
  const parsed = JSON.parse(text);
  state.assetRegistry = mergeAssetRegistries(state.assetRegistry, parsed);

  const resolved = resolvePaletteFromAssetRegistry(state);
  if (!resolved) {
    hydratePaletteFromRefIfPossible(state);
  }

  const validation = validateSpriteProjectAssets(state);
  syncControlsFromProject(state);
  renderAll(state);
  setStatus(
    state,
    `Loaded ${file.name} (${state.assetRegistry.palettes.length} palettes, ${state.assetRegistry.sprites.length} sprites, validation: ${summarizeAssetValidation(validation)}).`
  );
}

async function saveProjectJson(state) {
  const fileName = deriveSpriteFileName(state.project);
  syncSpriteAssetsToRegistry(state, { spritePath: `assets/sprites/${fileName}` });
  const validation = guardSpriteProjectAction(state, "Save Project");
  if (!validation) {
    return;
  }
  const { graph, findings } = buildAssetDependencyGraph(state.assetRegistry);
  state.assetDependencyGraphSnapshot = graph;
  const payload = addToolModeMetadata(serializeProject(state.project), { toolId: "sprite-editor" });
  payload.project = {
    ...(payload.project && typeof payload.project === "object" ? payload.project : {}),
    assetDependencyGraph: graph
  };
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  const blob = new Blob([json], { type: "application/json" });
  downloadBlob(blob, fileName);
  setStatus(
    state,
    `Saved ${fileName} (frame ${state.project.currentFrameIndex + 1} active, asset refs: palette=${state.project.assetRefs.paletteId || "none"}, sprite=${state.project.assetRefs.spriteId || "none"}).${summarizeGraphFindings(findings)} Validation: ${summarizeAssetValidation(validation)}.`
  );
}

async function loadProjectJson(state, file) {
  const text = await fileToText(file);
  const parsed = JSON.parse(text);
  const guard = assertStandaloneToolDocument(parsed, {
    expectedLabel: "Sprite Editor project",
    acceptedFormats: [PROJECT_FORMAT],
    requiredToolId: "sprite-editor"
  });
  if (!guard.ok) {
    const handled = offerImportMismatchOptions(guard, {
      viewerToolId: "state-inspector",
      viewerPayload: parsed,
      sourceToolId: "sprite-editor"
    });
    if (handled) {
      return;
    }
    throw new Error(guard.reason);
  }
  const nextProject = ensureProjectShape(parsed);
  state.project = nextProject;
  state.assetDependencyGraphSnapshot = parsed?.project?.assetDependencyGraph || null;
  let lockMessage = "palette unresolved";

  if (hydratePaletteFromRefIfPossible(state)) {
    lockMessage = `palette locked (${state.project.paletteRef.id})`;
  } else if (resolvePaletteFromAssetRegistry(state)) {
    lockMessage = `palette locked via asset registry (${state.project.paletteRef.id})`;
  } else {
    clearPaletteLock(state);
    lockMessage = "palette selection required";
  }

  const validation = validateSpriteProjectAssets(state);
  setSampleSource(state, { mode: "tool", fileName: file?.name || "" });
  syncControlsFromProject(state);
  state.preview.frameIndex = state.project.currentFrameIndex;
  setStatus(state, `Loaded ${file.name} (${state.project.width}x${state.project.height}, ${state.project.frames.length} frames, ${lockMessage}, validation: ${summarizeAssetValidation(validation)}).`);
  renderAll(state);
}

function extractSpriteProjectFromSamplePreset(rawPreset) {
  if (!rawPreset || typeof rawPreset !== "object") {
    return null;
  }
  if (typeof rawPreset.format === "string" && Array.isArray(rawPreset.frames)) {
    return rawPreset;
  }
  const payload = rawPreset.payload && typeof rawPreset.payload === "object"
    ? rawPreset.payload
    : rawPreset;
  if (payload.spriteProject && typeof payload.spriteProject === "object") {
    return payload.spriteProject;
  }
  if (payload.project && typeof payload.project === "object") {
    return payload.project;
  }
  return null;
}

function extractSpriteAssetRegistryFromSamplePreset(rawPreset) {
  if (!rawPreset || typeof rawPreset !== "object") {
    return null;
  }
  if (rawPreset.assetRegistry && typeof rawPreset.assetRegistry === "object") {
    return rawPreset.assetRegistry;
  }
  const payload = rawPreset.payload && typeof rawPreset.payload === "object"
    ? rawPreset.payload
    : null;
  if (payload && payload.assetRegistry && typeof payload.assetRegistry === "object") {
    return payload.assetRegistry;
  }
  return null;
}

function applySamplePreset(state, rawPreset, sampleId, samplePresetPath, sampleTitleHint = "") {
  const presetProject = extractSpriteProjectFromSamplePreset(rawPreset);
  if (!presetProject || typeof presetProject !== "object") {
    throw new Error("Preset payload did not include a sprite project.");
  }

  state.project = ensureProjectShape(presetProject);

  const presetAssetRegistry = extractSpriteAssetRegistryFromSamplePreset(rawPreset);
  const presetTitle = typeof sampleTitleHint === "string" && sampleTitleHint.trim()
    ? sampleTitleHint.trim()
    : (typeof rawPreset?.title === "string"
      ? rawPreset.title
      : (typeof rawPreset?.payload?.title === "string" ? rawPreset.payload.title : ""));
  state.assetRegistry = presetAssetRegistry
    ? sanitizeAssetRegistry(presetAssetRegistry)
    : createAssetRegistry({ projectId: "sprite-project" });
  state.projectTool = TOOL_IDS.PENCIL;
  state.preview.playing = false;
  state.preview.frameIndex = state.project.currentFrameIndex;
  state.preview.accumulatorMs = 0;
  state.skipExternalProjectStateUntil = Date.now() + 3000;
  state.history.undoStack = [];
  state.history.redoStack = [];
  state.assetDependencyGraphSnapshot = null;
  setSampleSource(state, {
    mode: "sample",
    sampleId: typeof sampleId === "string" ? sampleId : "",
    sampleTitle: presetTitle,
    samplePresetPath: typeof samplePresetPath === "string" ? samplePresetPath : ""
  });

  if (!hydratePaletteFromRefIfPossible(state) && !resolvePaletteFromAssetRegistry(state)) {
    clearPaletteLock(state);
  }

  validateSpriteProjectAssets(state);
  syncControlsFromProject(state);
  renderAll(state);
  setStatus(state, buildPresetLoadedStatus(sampleId, samplePresetPath));
}

async function tryLoadPresetFromQuery(state) {
  const searchParams = new URLSearchParams(window.location.search);
  const samplePresetPath = normalizeSamplePresetPath(searchParams.get("samplePresetPath") || "");
  const sampleId = String(searchParams.get("sampleId") || "").trim();
  const sampleTitle = normalizeSampleLabel(searchParams.get("sampleTitle") || "");
  const launchQuery = getToolLoadQuerySnapshot(searchParams);
  const requestedDataPaths = getToolLoadRequestedDataPaths(launchQuery);
  const paletteInput = resolveRequiredPaletteInput(searchParams, requestedDataPaths, samplePresetPath);
  if (paletteInput.path) {
    requestedDataPaths.palettePath = paletteInput.path;
  }

  logToolLoadRequest({
    toolId: "sprite-editor",
    sampleId,
    samplePresetPath,
    requestedDataPaths,
    launchQuery
  });

  if (!samplePresetPath) {
    logToolLoadWarning({
      toolId: "sprite-editor",
      sampleId,
      reason: "samplePresetPath missing",
      launchQuery
    });
    return false;
  }

  setSampleSource(state, {
    mode: "sample",
    sampleId,
    sampleTitle,
    samplePresetPath
  });
  renderHud(state);

  const paletteRequiredFields = CANONICAL_PALETTE_REQUIRED_FIELDS.filter((field) => field !== "swatches");
  if (!paletteInput.path) {
    logToolLoadWarning({
      toolId: "sprite-editor",
      sampleId,
      samplePresetPath,
      dependencyId: "palette",
      expectedPathKey: "palettePath",
      expectedPath: "",
      expectedSchema: CANONICAL_PALETTE_SCHEMA,
      expectedTopLevelShape: [...CANONICAL_PALETTE_REQUIRED_FIELDS],
      requiredFields: paletteRequiredFields,
      requiredArrayFields: [...CANONICAL_PALETTE_REQUIRED_ARRAY_FIELDS],
      requestedDataPaths,
      launchQuery,
      error: "Required palettePath input is missing from launch query and normalized tool input."
    });
    setStatus(state, "Preset load failed: required palettePath input is missing.");
    return false;
  }

  let rawPreset = null;
  let presetHref = "";
  let receivedTopLevelKeys = [];
  try {
    const presetUrl = new URL(samplePresetPath, window.location.href);
    presetHref = presetUrl.toString();
    logToolLoadFetch({
      toolId: "sprite-editor",
      phase: "attempt",
      fetchUrl: presetHref,
      requestedPath: samplePresetPath,
      pathSource: "tool-input:query.samplePresetPath"
    });
    const response = await fetch(presetHref, { cache: "no-store" });
    logToolLoadFetch({
      toolId: "sprite-editor",
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
    rawPreset = await response.json();
    receivedTopLevelKeys = rawPreset && typeof rawPreset === "object" && !Array.isArray(rawPreset)
      ? Object.keys(rawPreset)
      : [];
    logToolLoadLoaded({
      toolId: "sprite-editor",
      sampleId,
      samplePresetPath,
      fetchUrl: presetHref,
      loaded: summarizeToolLoadData(rawPreset)
    });
  } catch (error) {
    logToolLoadWarning({
      toolId: "sprite-editor",
      sampleId,
      samplePresetPath,
      error: error instanceof Error ? error.message : "unknown error",
      receivedTopLevelKeys
    });
    setSampleSource(state, {
      mode: "sample",
      sampleId,
      sampleTitle,
      samplePresetPath
    });
    renderHud(state);
    setStatus(state, `Preset load failed: ${error instanceof Error ? error.message : "unknown error"}`);
    return false;
  }

  let paletteFetchUrl = "";
  let paletteHttpStatus = null;
  let paletteReceivedTopLevelKeys = [];
  let paletteLoadedSchema = "";
  let canonicalPalette = null;
  try {
    const paletteUrl = new URL(paletteInput.path, window.location.href);
    paletteFetchUrl = paletteUrl.toString();
    logToolLoadFetch({
      toolId: "sprite-editor",
      sampleId,
      samplePresetPath,
      dependencyId: "palette",
      phase: "attempt",
      fetchUrl: paletteFetchUrl,
      requestedPath: paletteInput.path,
      pathSource: paletteInput.pathSource,
      expectedPathKey: "palettePath",
      expectedPath: paletteInput.path,
      expectedSchema: CANONICAL_PALETTE_SCHEMA,
      expectedTopLevelShape: [...CANONICAL_PALETTE_REQUIRED_FIELDS],
      requiredFields: paletteRequiredFields,
      requiredArrayFields: [...CANONICAL_PALETTE_REQUIRED_ARRAY_FIELDS],
      requestedDataPaths,
      launchQuery
    });
    const paletteResponse = await fetch(paletteFetchUrl, { cache: "no-store" });
    paletteHttpStatus = paletteResponse.status;
    logToolLoadFetch({
      toolId: "sprite-editor",
      sampleId,
      samplePresetPath,
      dependencyId: "palette",
      phase: "response",
      fetchUrl: paletteFetchUrl,
      requestedPath: paletteInput.path,
      pathSource: paletteInput.pathSource,
      expectedPathKey: "palettePath",
      expectedPath: paletteInput.path,
      expectedSchema: CANONICAL_PALETTE_SCHEMA,
      expectedTopLevelShape: [...CANONICAL_PALETTE_REQUIRED_FIELDS],
      requiredFields: paletteRequiredFields,
      requiredArrayFields: [...CANONICAL_PALETTE_REQUIRED_ARRAY_FIELDS],
      requestedDataPaths,
      launchQuery,
      status: paletteResponse.status,
      ok: paletteResponse.ok
    });
    if (!paletteResponse.ok) {
      throw new Error(`Palette request failed (${paletteResponse.status}).`);
    }

    const rawPalette = await paletteResponse.json();
    canonicalPalette = parseCanonicalPalettePayload(rawPalette);
    paletteReceivedTopLevelKeys = canonicalPalette.topLevelKeys.slice();
    paletteLoadedSchema = canonicalPalette.loadedSchema;
    logToolLoadLoaded({
      toolId: "sprite-editor",
      sampleId,
      samplePresetPath,
      dependencyId: "palette",
      fetchUrl: paletteFetchUrl,
      requestedPath: paletteInput.path,
      pathSource: paletteInput.pathSource,
      expectedPathKey: "palettePath",
      expectedPath: paletteInput.path,
      expectedSchema: CANONICAL_PALETTE_SCHEMA,
      expectedTopLevelShape: [...CANONICAL_PALETTE_REQUIRED_FIELDS],
      requiredFields: paletteRequiredFields,
      requiredArrayFields: [...CANONICAL_PALETTE_REQUIRED_ARRAY_FIELDS],
      requestedDataPaths,
      launchQuery,
      loaded: summarizeToolLoadData(rawPalette),
      loadedSchema: canonicalPalette.loadedSchema,
      arrayCounts: {
        swatches: canonicalPalette.swatchCount
      }
    });
  } catch (error) {
    logToolLoadWarning({
      toolId: "sprite-editor",
      sampleId,
      samplePresetPath,
      dependencyId: "palette",
      fetchUrl: paletteFetchUrl,
      requestedPath: paletteInput.path,
      pathSource: paletteInput.pathSource,
      expectedPathKey: "palettePath",
      expectedPath: paletteInput.path,
      expectedSchema: CANONICAL_PALETTE_SCHEMA,
      expectedTopLevelShape: [...CANONICAL_PALETTE_REQUIRED_FIELDS],
      requiredFields: paletteRequiredFields,
      requiredArrayFields: [...CANONICAL_PALETTE_REQUIRED_ARRAY_FIELDS],
      requestedDataPaths,
      launchQuery,
      receivedTopLevelKeys: paletteReceivedTopLevelKeys,
      loadedSchema: paletteLoadedSchema,
      status: paletteHttpStatus,
      error: error instanceof Error ? error.message : "unknown error"
    });
    setStatus(state, `Preset load failed: ${error instanceof Error ? error.message : "unknown error"}`);
    return false;
  }

  try {
    applySamplePreset(state, rawPreset, sampleId, samplePresetPath, sampleTitle);
    applyCanonicalPaletteToProject(state, canonicalPalette);
    validateSpriteProjectAssets(state);
    syncControlsFromProject(state);
    renderAll(state);
    setStatus(state, buildPresetLoadedStatus(sampleId, samplePresetPath));
    return true;
  } catch (error) {
    logToolLoadWarning({
      toolId: "sprite-editor",
      sampleId,
      samplePresetPath,
      fetchUrl: presetHref,
      error: error instanceof Error ? error.message : "unknown error",
      receivedTopLevelKeys
    });
    setSampleSource(state, {
      mode: "sample",
      sampleId,
      sampleTitle,
      samplePresetPath
    });
    renderHud(state);
    setStatus(state, `Preset load failed: ${error instanceof Error ? error.message : "unknown error"}`);
    return false;
  }
}

function bindPointerDrawing(state) {
  const canvas = state.elements.editorCanvas;
  let pointerDown = false;
  let lastPoint = null;
  let strokeHistoryPushed = false;

  const applyDrawAt = (x, y) => {
    const frame = state.project.frames[state.project.currentFrameIndex];
    const color = state.projectTool === TOOL_IDS.ERASER ? null : state.project.activeColor;
    if (!willPixelChange(frame, state.project.width, state.project.height, x, y, color)) {
      return false;
    }
    if (!strokeHistoryPushed) {
      pushHistory(state);
      strokeHistoryPushed = true;
    }
    return setPixel(frame, state.project.width, state.project.height, x, y, color);
  };

  const onPointerDown = (event) => {
    if (event.button !== 0) {
      return;
    }
    if (!ensureEditingEnabled(state)) {
      return;
    }

    const point = getCanvasPixelFromEvent(canvas, event, state.project);
    state.cursor.x = point.x;
    state.cursor.y = point.y;

    if (state.projectTool === TOOL_IDS.FILL) {
      const frame = state.project.frames[state.project.currentFrameIndex];
      const fillColor = state.project.activeColor;
      if (canFloodFill(frame, state.project.width, point.x, point.y, fillColor)) {
        pushHistory(state);
        floodFill(frame, state.project.width, state.project.height, point.x, point.y, fillColor);
        setStatus(state, `Fill applied on frame ${state.project.currentFrameIndex + 1}.`);
        renderEditor(state);
        renderPreview(state);
      }
      renderHud(state);
      return;
    }

    pointerDown = true;
    canvas.setPointerCapture(event.pointerId);
    lastPoint = point;
    const changed = applyDrawAt(point.x, point.y);
    if (changed) {
      renderEditor(state);
      renderPreview(state);
    }
    renderHud(state);
  };

  const onPointerMove = (event) => {
    const point = getCanvasPixelFromEvent(canvas, event, state.project);
    state.cursor.x = point.x;
    state.cursor.y = point.y;

    if (!pointerDown || !lastPoint) {
      renderHud(state);
      return;
    }

    let changed = false;

    bresenhamLine(lastPoint.x, lastPoint.y, point.x, point.y, (x, y) => {
      const didChange = applyDrawAt(x, y);
      if (didChange) {
        changed = true;
      }
    });

    lastPoint = point;
    if (changed) {
      renderEditor(state);
      renderPreview(state);
    }
    renderHud(state);
  };

  const onPointerUp = (event) => {
    if (!pointerDown) {
      return;
    }

    pointerDown = false;
    lastPoint = null;
    strokeHistoryPushed = false;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  };

  const onPointerLeave = () => {
    state.cursor.x = null;
    state.cursor.y = null;
    renderHud(state);
  };

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("lostpointercapture", () => {
    pointerDown = false;
    lastPoint = null;
    strokeHistoryPushed = false;
  });
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("contextmenu", (event) => event.preventDefault());
}

function bindShortcuts(state) {
  window.addEventListener("keydown", (event) => {
    if (isEditableTarget(event.target)) {
      return;
    }

    const key = event.key.toLowerCase();

    if ((event.ctrlKey || event.metaKey) && !event.altKey) {
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        if (ensureEditingEnabled(state)) {
          undo(state);
        }
        return;
      }

      if (key === "y" || (key === "z" && event.shiftKey)) {
        event.preventDefault();
        if (ensureEditingEnabled(state)) {
          redo(state);
        }
        return;
      }
    }

    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (key === "p") {
      event.preventDefault();
      if (!ensureEditingEnabled(state)) {
        return;
      }
      state.projectTool = TOOL_IDS.PENCIL;
      setStatus(state, "Tool set to Pencil.");
      renderHud(state);
      return;
    }

    if (key === "e") {
      event.preventDefault();
      if (!ensureEditingEnabled(state)) {
        return;
      }
      state.projectTool = TOOL_IDS.ERASER;
      setStatus(state, "Tool set to Eraser.");
      renderHud(state);
      return;
    }

    if (key === "f") {
      event.preventDefault();
      if (!ensureEditingEnabled(state)) {
        return;
      }
      state.projectTool = TOOL_IDS.FILL;
      setStatus(state, "Tool set to Fill.");
      renderHud(state);
      return;
    }

    if (key === "g") {
      event.preventDefault();
      if (!ensureEditingEnabled(state)) {
        return;
      }
      state.project.showGrid = !state.project.showGrid;
      state.elements.gridToggle.checked = state.project.showGrid;
      setStatus(state, `Grid ${state.project.showGrid ? "enabled" : "disabled"} via shortcut.`);
      renderEditor(state);
      renderHud(state);
      return;
    }

    if (key === "o") {
      event.preventDefault();
      if (!ensureEditingEnabled(state)) {
        return;
      }
      state.project.onionSkin = !state.project.onionSkin;
      state.elements.onionSkinToggle.checked = state.project.onionSkin;
      setStatus(state, `Onion skin ${state.project.onionSkin ? "enabled" : "disabled"} via shortcut.`);
      renderEditor(state);
      renderHud(state);
      return;
    }

    if (event.key === "[") {
      event.preventDefault();
      if (ensureEditingEnabled(state)) {
        shiftFrame(state, -1);
      }
      return;
    }

    if (event.key === "]") {
      event.preventDefault();
      if (ensureEditingEnabled(state)) {
        shiftFrame(state, 1);
      }
    }
  });
}

function bindControls(state) {
  const {
    addFrameButton,
    canvasHeightInput,
    canvasWidthInput,
    colorPicker,
    deleteFrameButton,
    duplicateFrameButton,
    exportPngButton,
    exportSheetButton,
    packageProjectButton,
    fpsInput,
    gridToggle,
    importPngButton,
    importPngInput,
    loadProjectButton,
    loadProjectInput,
    loadAssetRegistryButton,
    loadAssetRegistryInput,
    newCanvasButton,
    nextFrameButton,
    onionSkinToggle,
    paletteSelect,
    pausePreviewButton,
    pixelSizeInput,
    playPreviewButton,
    prevFrameButton,
    redoButton,
    refreshDebugVisualizationButton,
    resetPreviewButton,
    refreshExperienceButton,
    saveAssetRegistryButton,
    saveProjectButton,
    inspectRemediationButton,
    jumpToProblemButton,
    applyRemediationButton,
    toolButtons,
    undoButton
  } = state.elements;

  paletteSelect.addEventListener("change", () => {
    const requestedId = paletteSelect.value;

    if (!state.enginePalette.available) {
      setStatus(state, state.enginePalette.error || "Engine palette list unavailable.");
      paletteSelect.value = NO_PALETTE_ID;
      return;
    }

    if (isPaletteLocked(state.project)) {
      paletteSelect.value = state.project.paletteRef.id;
      setStatus(state, "Palette is locked for this project. Use Create New Canvas to choose a different palette.");
      return;
    }

    if (requestedId === NO_PALETTE_ID) {
      setStatus(state, "Select a palette to enable editing.");
      return;
    }

    const didLock = applyLockedPaletteToProject(state, requestedId, { preferExistingActiveColor: false });
    if (!didLock) {
      setStatus(state, `Palette ${requestedId} is unavailable in engine palette list.`);
      paletteSelect.value = NO_PALETTE_ID;
      return;
    }

    syncControlsFromProject(state);
    setStatus(state, `Palette ${requestedId} selected and locked for this project session.`);
    renderAll(state);
  });

  newCanvasButton.addEventListener("click", () => {
    resetProject(state);
  });

  const resizeWithFeedback = (nextWidth, nextHeight) => {
    if (!ensureEditingEnabled(state)) {
      return;
    }
    if (nextWidth === state.project.width && nextHeight === state.project.height) {
      return;
    }
    pushHistory(state);
    state.project = resizeProject(state.project, nextWidth, nextHeight);
    syncControlsFromProject(state);
    setStatus(state, `Resized canvas to ${state.project.width}x${state.project.height} (preserve mode: nearest-neighbor).`);
    renderAll(state);
  };

  canvasWidthInput.addEventListener("change", () => {
    const width = clamp(canvasWidthInput.value, 1, 256, state.project.width);
    resizeWithFeedback(width, state.project.height);
  });

  canvasHeightInput.addEventListener("change", () => {
    const height = clamp(canvasHeightInput.value, 1, 256, state.project.height);
    resizeWithFeedback(state.project.width, height);
  });

  pixelSizeInput.addEventListener("input", () => {
    state.project.pixelSize = clamp(pixelSizeInput.value, 4, 40, DEFAULT_PIXEL_SIZE);
    setStatus(state, `Zoom set to ${state.project.pixelSize}.`);
    renderAll(state);
  });

  gridToggle.addEventListener("change", () => {
    state.project.showGrid = gridToggle.checked;
    setStatus(state, `Grid ${state.project.showGrid ? "enabled" : "disabled"}.`);
    renderEditor(state);
    renderHud(state);
  });

  onionSkinToggle.addEventListener("change", () => {
    state.project.onionSkin = onionSkinToggle.checked;
    setStatus(state, `Onion skin ${state.project.onionSkin ? "enabled" : "disabled"}.`);
    renderEditor(state);
    renderHud(state);
  });

  colorPicker.addEventListener("input", () => {
    if (!ensureEditingEnabled(state)) {
      return;
    }
    if (!state.project.activeColor) {
      setStatus(state, "Select a palette color swatch.");
      colorPicker.value = "#000000";
      return;
    }
    colorPicker.value = colorToPickerValue(state.project.activeColor);
    setStatus(state, "Use palette swatches to change color.");
    renderAll(state);
  });

  toolButtons.querySelectorAll("[data-tool]").forEach((button) => {
    button.addEventListener("click", () => {
      const tool = button.getAttribute("data-tool");
      if (!tool) {
        return;
      }
      if (!ensureEditingEnabled(state)) {
        return;
      }
      state.projectTool = tool;
      setStatus(state, `${tool[0].toUpperCase()}${tool.slice(1)} tool selected.`);
      renderHud(state);
    });
  });

  addFrameButton.addEventListener("click", () => addFrame(state));
  duplicateFrameButton.addEventListener("click", () => duplicateFrame(state));
  deleteFrameButton.addEventListener("click", () => deleteFrame(state));
  prevFrameButton.addEventListener("click", () => shiftFrame(state, -1));
  nextFrameButton.addEventListener("click", () => shiftFrame(state, 1));
  undoButton.addEventListener("click", () => {
    if (ensureEditingEnabled(state)) {
      undo(state);
    }
  });
  redoButton.addEventListener("click", () => {
    if (ensureEditingEnabled(state)) {
      redo(state);
    }
  });

  playPreviewButton.addEventListener("click", () => {
    state.preview.playing = true;
    setStatus(state, `Preview playing at ${state.preview.fps} FPS.`);
  });

  pausePreviewButton.addEventListener("click", () => {
    state.preview.playing = false;
    setStatus(state, "Preview paused.");
    renderPreview(state);
  });

  resetPreviewButton.addEventListener("click", () => {
    state.preview.playing = false;
    state.preview.frameIndex = state.project.currentFrameIndex;
    setStatus(state, `Preview reset to frame ${state.project.currentFrameIndex + 1}.`);
    renderPreview(state);
  });

  fpsInput.addEventListener("input", () => {
    state.preview.fps = clamp(fpsInput.value, 1, 24, DEFAULT_FPS);
    setStatus(state, `Preview FPS set to ${state.preview.fps}.`);
    renderHud(state);
  });

  importPngButton.addEventListener("click", () => importPngInput.click());
  importPngInput.addEventListener("change", async () => {
    const file = importPngInput.files?.[0];
    importPngInput.value = "";
    if (!file) {
      return;
    }

    try {
      await importPngIntoCurrentFrame(state, file);
    } catch (error) {
      setStatus(state, `PNG import failed for ${file.name}: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  });

  exportPngButton.addEventListener("click", async () => {
    try {
      await exportCurrentFramePng(state);
    } catch (error) {
      setStatus(state, `PNG export failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  });

  exportSheetButton.addEventListener("click", async () => {
    try {
      await exportSpriteSheetPng(state);
    } catch (error) {
      setStatus(state, `Sprite sheet export failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  });
  packageProjectButton.addEventListener("click", async () => {
    try {
      await packageSpriteProject(state);
    } catch (error) {
      setStatus(state, `Package export failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  });

  saveProjectButton.addEventListener("click", async () => {
    try {
      await saveProjectJson(state);
    } catch (error) {
      setStatus(state, `JSON save failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  });

  saveAssetRegistryButton.addEventListener("click", async () => {
    try {
      await saveAssetRegistryJson(state);
    } catch (error) {
      setStatus(state, `Asset registry save failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  });

  loadProjectButton.addEventListener("click", () => loadProjectInput.click());
  loadProjectInput.addEventListener("change", async () => {
    const file = loadProjectInput.files?.[0];
    loadProjectInput.value = "";
    if (!file) {
      return;
    }

    try {
      await loadProjectJson(state, file);
    } catch (error) {
      setStatus(state, `JSON load failed for ${file.name}: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  });

  loadAssetRegistryButton.addEventListener("click", () => loadAssetRegistryInput.click());
  loadAssetRegistryInput.addEventListener("change", async () => {
    const file = loadAssetRegistryInput.files?.[0];
    loadAssetRegistryInput.value = "";
    if (!file) {
      return;
    }

    try {
      await loadAssetRegistryJson(state, file);
    } catch (error) {
      setStatus(state, `Asset registry load failed for ${file.name}: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  });

  inspectRemediationButton.addEventListener("click", () => {
    validateSpriteProjectAssets(state);
    inspectRemediationActions(state);
    updateRemediationUI(state);
  });
  jumpToProblemButton.addEventListener("click", () => {
    validateSpriteProjectAssets(state);
    jumpToRemediationProblem(state);
    updateRemediationUI(state);
  });
  applyRemediationButton.addEventListener("click", () => {
    validateSpriteProjectAssets(state);
    applyRemediationAction(state);
    updateRemediationUI(state);
  });
  refreshExperienceButton.addEventListener("click", () => {
    validateSpriteProjectAssets(state);
    updateRemediationUI(state);
    updateEditorExperienceUI(state);
    setStatus(state, summarizeEditorExperienceLayer(state.editorExperienceResult));
  });
  refreshDebugVisualizationButton.addEventListener("click", () => {
    validateSpriteProjectAssets(state);
    updateDebugVisualizationUI(state);
    setStatus(state, summarizeDebugVisualizationLayer(state.debugVisualizationResult));
  });
}

function startPreviewLoop(state) {
  const step = (timestamp) => {
    if (!state.preview.lastTimestamp) {
      state.preview.lastTimestamp = timestamp;
    }

    const deltaMs = timestamp - state.preview.lastTimestamp;
    state.preview.lastTimestamp = timestamp;

    if (state.preview.playing) {
      const frameDuration = 1000 / Math.max(1, state.preview.fps);
      state.preview.accumulatorMs += deltaMs;

      while (state.preview.accumulatorMs >= frameDuration) {
        state.preview.accumulatorMs -= frameDuration;
        state.preview.frameIndex = (state.preview.frameIndex + 1) % state.project.frames.length;
      }

      renderPreview(state);
    }

    window.requestAnimationFrame(step);
  };

  window.requestAnimationFrame(step);
}

export function initializeSpriteEditorApp() {
  const state = {
    project: createNewProject({
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      pixelSize: DEFAULT_PIXEL_SIZE
    }),
    assetRegistry: createAssetRegistry({ projectId: "sprite-project" }),
    enginePalette: buildEnginePaletteCatalog(),
    projectTool: TOOL_IDS.PENCIL,
    preview: {
      playing: false,
      fps: DEFAULT_FPS,
      frameIndex: 0,
      lastTimestamp: 0,
      accumulatorMs: 0
    },
    history: {
      undoStack: [],
      redoStack: [],
      limit: HISTORY_LIMIT
    },
    assetDependencyGraphSnapshot: null,
    validationResult: null,
    remediationResult: { remediation: { status: "unavailable", actions: [] } },
    lastPackageResult: null,
    lastRuntimeResult: null,
    editorExperienceResult: null,
    debugVisualizationResult: null,
    sampleSource: {
      mode: "tool",
      sampleId: "",
      sampleTitle: "",
      samplePresetPath: "",
      fileName: ""
    },
    skipExternalProjectStateUntil: 0,
    cursor: {
      x: null,
      y: null
    },
    elements: {
      activeColorSwatch: getRequiredElement("activeColorSwatch"),
      activeColorText: getRequiredElement("activeColorText"),
      addFrameButton: getRequiredElement("addFrameButton"),
      canvasHeightInput: getRequiredElement("canvasHeightInput"),
      canvasWidthInput: getRequiredElement("canvasWidthInput"),
      colorPicker: getRequiredElement("colorPicker"),
      deleteFrameButton: getRequiredElement("deleteFrameButton"),
      duplicateFrameButton: getRequiredElement("duplicateFrameButton"),
      editorCanvas: getRequiredElement("editorCanvas"),
      exportPngButton: getRequiredElement("exportPngButton"),
      exportSheetButton: getRequiredElement("exportSheetButton"),
      packageProjectButton: getRequiredElement("packageProjectButton"),
      fpsInput: getRequiredElement("fpsInput"),
      fpsValue: getRequiredElement("fpsValue"),
      frameCounter: getRequiredElement("frameCounter"),
      frameStateText: getRequiredElement("frameStateText"),
      gridToggle: getRequiredElement("gridToggle"),
      importPngButton: getRequiredElement("importPngButton"),
      importPngInput: getRequiredElement("importPngInput"),
      loadAssetRegistryButton: getRequiredElement("loadAssetRegistryButton"),
      loadAssetRegistryInput: getRequiredElement("loadAssetRegistryInput"),
      loadProjectButton: getRequiredElement("loadProjectButton"),
      loadProjectInput: getRequiredElement("loadProjectInput"),
      newCanvasButton: getRequiredElement("newCanvasButton"),
      nextFrameButton: getRequiredElement("nextFrameButton"),
      onionSkinToggle: getRequiredElement("onionSkinToggle"),
      paletteLockText: getRequiredElement("paletteLockText"),
      paletteSelect: getRequiredElement("paletteSelect"),
      pausePreviewButton: getRequiredElement("pausePreviewButton"),
      paletteButtons: getRequiredElement("paletteButtons"),
      pixelSizeInput: getRequiredElement("pixelSizeInput"),
      pixelSizeValue: getRequiredElement("pixelSizeValue"),
      playPreviewButton: getRequiredElement("playPreviewButton"),
      prevFrameButton: getRequiredElement("prevFrameButton"),
      previewCanvas: getRequiredElement("previewCanvas"),
      recentColorButtons: getRequiredElement("recentColorButtons"),
      redoButton: getRequiredElement("redoButton"),
      resetPreviewButton: getRequiredElement("resetPreviewButton"),
      remediationSummaryText: getRequiredElement("remediationSummaryText"),
      experienceSummaryText: getRequiredElement("experienceSummaryText"),
      experienceDetailsText: getRequiredElement("experienceDetailsText"),
      refreshExperienceButton: getRequiredElement("refreshExperienceButton"),
      debugSummaryText: getRequiredElement("debugSummaryText"),
      debugDetailsText: getRequiredElement("debugDetailsText"),
      refreshDebugVisualizationButton: getRequiredElement("refreshDebugVisualizationButton"),
      inspectRemediationButton: getRequiredElement("inspectRemediationButton"),
      jumpToProblemButton: getRequiredElement("jumpToProblemButton"),
      applyRemediationButton: getRequiredElement("applyRemediationButton"),
      saveAssetRegistryButton: getRequiredElement("saveAssetRegistryButton"),
      saveProjectButton: getRequiredElement("saveProjectButton"),
      sampleSourceDetailText: getRequiredElement("sampleSourceDetailText"),
      sampleSourceText: getRequiredElement("sampleSourceText"),
      statusBarText: getRequiredElement("statusBarText"),
      statusText: getRequiredElement("statusText"),
      toggleStateText: getRequiredElement("toggleStateText"),
      toolButtons: getRequiredElement("toolButtons"),
      toolStateText: getRequiredElement("toolStateText"),
      undoButton: getRequiredElement("undoButton")
    }
  };

  syncControlsFromProject(state);
  validateSpriteProjectAssets(state);
  updateEditorExperienceUI(state);
  updateDebugVisualizationUI(state);
  state.elements.fpsInput.value = String(state.preview.fps);

  bindControls(state);
  bindShortcuts(state);
  bindPointerDrawing(state);
  renderAll(state);
  startPreviewLoop(state);

  if (!state.enginePalette.available) {
    setStatus(state, state.enginePalette.error || "Engine palette list unavailable. Editing is disabled.");
  } else {
    setStatus(state, "Select a palette from engine paletteList to enable editing.");
  }

  state.applyProjectSystemState = (snapshot) => {
    if (Date.now() <= Number(state.skipExternalProjectStateUntil || 0)) {
      state.skipExternalProjectStateUntil = 0;
      return;
    }
    const nextProject = ensureProjectShape(snapshot?.project || createNewProject({
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      pixelSize: DEFAULT_PIXEL_SIZE
    }));
    state.project = nextProject;
    state.assetRegistry = snapshot?.assetRegistry && typeof snapshot.assetRegistry === "object"
      ? sanitizeAssetRegistry(snapshot.assetRegistry)
      : createAssetRegistry({ projectId: "sprite-project" });
    state.projectTool = typeof snapshot?.projectTool === "string" ? snapshot.projectTool : TOOL_IDS.PENCIL;
    state.preview.fps = Number.isFinite(Number(snapshot?.preview?.fps)) ? Number(snapshot.preview.fps) : DEFAULT_FPS;
    state.preview.frameIndex = Number.isFinite(Number(snapshot?.preview?.frameIndex)) ? Number(snapshot.preview.frameIndex) : state.project.currentFrameIndex;
    state.preview.playing = snapshot?.preview?.playing === true;
    setSampleSource(state, { mode: "workspace" });
    validateSpriteProjectAssets(state);
    syncControlsFromProject(state);
    renderAll(state);
    setStatus(state, `Project state loaded (${state.project.width}x${state.project.height}, ${state.project.frames.length} frames).`);
  };

  void tryLoadPresetFromQuery(state);

  return state;
}
