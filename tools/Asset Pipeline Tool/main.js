import { runAssetPipelineTooling } from "../shared/pipeline/assetPipelineTooling.js";
import { safeParseJson, toPrettyJson } from "../shared/debugInspectorData.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";
import { ACTIVE_PROJECT_STORAGE_KEY } from "../shared/projectManifestContract.js";

const GAME_ASSET_CATALOG_SCHEMA = "html-js-gaming.game-asset-catalog";
const GAME_ASSET_CATALOG_VERSION = 1;
const ASSET_PIPELINE_DOMAINS = Object.freeze({
  sprites: "sprites",
  tilemaps: "tilemaps",
  parallax: "parallax",
  vectors: "vectors"
});

const refs = {
  runButton: document.getElementById("runAssetPipelineButton"),
  loadFromPresetButton: document.getElementById("loadPipelineFromPresetButton"),
  loadFromWorkspaceButton: document.getElementById("loadPipelineFromWorkspaceButton"),
  loadJsonFileButton: document.getElementById("loadPipelineJsonFileButton"),
  jsonFileInput: document.getElementById("pipelineJsonFileInput"),
  statusText: document.getElementById("assetPipelineStatus"),
  input: document.getElementById("assetPipelineInput"),
  output: document.getElementById("assetPipelineOutput")
};

function setOutput(value) {
  if (!(refs.output instanceof HTMLElement)) {
    return;
  }
  refs.output.textContent = typeof value === "string" ? value : toPrettyJson(value);
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cloneJson(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

function toSlug(value, fallback = "game") {
  const text = normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return text || fallback;
}

function readLaunchContextFromQuery() {
  const searchParams = new URLSearchParams(window.location.search);
  return {
    gameId: normalizeText(searchParams.get("gameId")),
    gameTitle: normalizeText(searchParams.get("gameTitle")),
    gameHref: normalizeText(searchParams.get("gameHref")),
    assetCatalogPath: normalizeCatalogPath(searchParams.get("assetCatalogPath"))
  };
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
  if (trimmed.startsWith("./samples/")) {
    return trimmed;
  }
  if (trimmed.startsWith("samples/")) {
    return `./${trimmed}`;
  }
  return "";
}

function buildPresetLoadedStatus(sampleId, samplePresetPath) {
  const normalizedSampleId = normalizeText(sampleId);
  if (normalizedSampleId) {
    return `Loaded preset from sample ${normalizedSampleId}.`;
  }
  const normalizedPath = normalizeText(samplePresetPath);
  return normalizedPath ? `Loaded preset from ${normalizedPath}.` : "Loaded preset.";
}

function buildPresetLoadedWithContextStatus(launchGameId, samplePresetPath) {
  const safeGameId = normalizeText(launchGameId);
  const safePresetPath = normalizeText(samplePresetPath);
  if (!safeGameId) {
    return "Loaded preset with launch context.";
  }
  if (safePresetPath.startsWith("/samples/")) {
    return `Loaded shared sample preset template. Launch context applied for game ${safeGameId}.`;
  }
  return `Loaded preset. Launch context applied for game ${safeGameId}.`;
}

function applyLaunchContextToPayload(rawPayload, launchContext = {}) {
  const payload = rawPayload && typeof rawPayload === "object" ? cloneJson(rawPayload) : null;
  if (!payload || typeof payload !== "object") {
    return {
      payload: rawPayload,
      overridden: false
    };
  }

  const gameId = normalizeText(launchContext.gameId);
  if (!gameId) {
    return {
      payload,
      overridden: false
    };
  }

  let overridden = false;
  const originalGameId = normalizeText(payload.gameId);
  if (normalizeText(payload.gameId) !== gameId) {
    payload.gameId = gameId;
    overridden = true;
  }

  if (/^sample-\d{4}$/i.test(originalGameId)) {
    const gameSlug = toSlug(gameId, "game");
    const rewrite = (value) => normalizeText(value).replace(/^sample-\d{4}/i, gameSlug);
    const domains = payload.domainInputs && typeof payload.domainInputs === "object"
      ? payload.domainInputs
      : {};
    Object.values(domains).forEach((records) => {
      if (!Array.isArray(records)) {
        return;
      }
      records.forEach((record) => {
        if (!record || typeof record !== "object") {
          return;
        }
        const nextAssetId = rewrite(record.assetId);
        if (nextAssetId && nextAssetId !== record.assetId) {
          record.assetId = nextAssetId;
          overridden = true;
        }
        const nextRuntimeFileName = rewrite(record.runtimeFileName);
        if (nextRuntimeFileName && nextRuntimeFileName !== record.runtimeFileName) {
          record.runtimeFileName = nextRuntimeFileName;
          overridden = true;
        }
        const nextToolDataFileName = rewrite(record.toolDataFileName);
        if (nextToolDataFileName && nextToolDataFileName !== record.toolDataFileName) {
          record.toolDataFileName = nextToolDataFileName;
          overridden = true;
        }
      });
    });
  }

  if (payload.toolStates && typeof payload.toolStates === "object") {
    Object.values(payload.toolStates).forEach((toolState) => {
      if (!toolState || typeof toolState !== "object") {
        return;
      }
      if (normalizeText(toolState.projectId) !== gameId) {
        toolState.projectId = gameId;
        overridden = true;
      }
    });
  }

  return {
    payload,
    overridden
  };
}

function setStatus(message) {
  if (refs.statusText instanceof HTMLElement) {
    refs.statusText.textContent = message;
  }
}

function setInputValue(value) {
  if (!(refs.input instanceof HTMLTextAreaElement)) {
    return false;
  }
  refs.input.value = typeof value === "string" ? value : toPrettyJson(value);
  return true;
}

function parseJsonObjectString(value) {
  const parsed = safeParseJson(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }
  return parsed;
}

function createEmptyDomainInputs() {
  return {
    sprites: [],
    tilemaps: [],
    parallax: [],
    vectors: []
  };
}

function normalizeAssetId(value, fallback = "asset") {
  return toSlug(normalizeText(value), fallback);
}

function deriveGameIdFromManifest(manifest) {
  const launchContext = readLaunchContextFromQuery();
  const launchGameId = normalizeText(launchContext.gameId);
  if (launchGameId) {
    return launchGameId;
  }

  const sourceToolStates = manifest?.tools && typeof manifest.tools === "object"
    ? Object.values(manifest.tools)
    : [];
  for (const toolState of sourceToolStates) {
    const projectId = normalizeText(toolState?.projectId);
    if (projectId) {
      return projectId;
    }
  }

  const metadataGameId = normalizeText(manifest?.sharedReferences?.asset?.metadata?.gameId)
    || normalizeText(manifest?.sharedReferences?.palette?.metadata?.gameId);
  if (metadataGameId) {
    return metadataGameId;
  }

  return normalizeText(manifest?.name);
}

function appendDomainRecord(domainInputs, domain, assetId, sourceToolId) {
  if (!domainInputs || typeof domainInputs !== "object") {
    return;
  }
  const targetDomain = normalizeText(domain);
  if (!Object.prototype.hasOwnProperty.call(domainInputs, targetDomain) || !Array.isArray(domainInputs[targetDomain])) {
    return;
  }
  const normalizedAssetId = normalizeAssetId(assetId, `${targetDomain}-asset`);
  if (!normalizedAssetId) {
    return;
  }
  const entries = domainInputs[targetDomain];
  if (entries.some((entry) => normalizeText(entry?.assetId) === normalizedAssetId)) {
    return;
  }
  entries.push({
    assetId: normalizedAssetId,
    runtimeFileName: `${normalizedAssetId}.runtime.json`,
    toolDataFileName: `${normalizedAssetId}.tool.json`,
    sourceToolId: normalizeText(sourceToolId)
  });
}

function appendDomainRecordsFromToolIntegration(domainInputs, manifest) {
  const assetReferences = manifest?.toolIntegration?.assetReferences || {};
  const spriteIds = Array.isArray(assetReferences.spriteIds) ? assetReferences.spriteIds : [];
  const tilemapIds = Array.isArray(assetReferences.tilemapIds) ? assetReferences.tilemapIds : [];
  const parallaxSourceIds = Array.isArray(assetReferences.parallaxSourceIds) ? assetReferences.parallaxSourceIds : [];
  const vectorIds = Array.isArray(assetReferences.vectorIds) ? assetReferences.vectorIds : [];

  spriteIds.forEach((assetId) => appendDomainRecord(domainInputs, ASSET_PIPELINE_DOMAINS.sprites, assetId, "sprite-editor"));
  tilemapIds.forEach((assetId) => appendDomainRecord(domainInputs, ASSET_PIPELINE_DOMAINS.tilemaps, assetId, "tile-map-editor"));
  parallaxSourceIds.forEach((assetId) => appendDomainRecord(domainInputs, ASSET_PIPELINE_DOMAINS.parallax, assetId, "parallax-editor"));
  vectorIds.forEach((assetId) => appendDomainRecord(domainInputs, ASSET_PIPELINE_DOMAINS.vectors, assetId, "vector-asset-studio"));
}

function normalizeCatalogPath(pathValue) {
  const value = normalizeText(pathValue).replace(/\\/g, "/");
  if (!value || value.includes("..") || !value.startsWith("/")) {
    return "";
  }
  return value;
}

function normalizeExplicitCatalogPath(pathValue) {
  const normalizedPath = normalizeCatalogPath(pathValue);
  if (!normalizedPath || !normalizedPath.toLowerCase().endsWith(".json")) {
    return "";
  }
  return normalizedPath;
}

function buildCatalogPathCandidates(manifest) {
  const candidates = new Set();
  const launchContext = readLaunchContextFromQuery();
  const manifestAsset = manifest?.sharedReferences?.asset || null;
  const manifestPalette = manifest?.sharedReferences?.palette || null;
  const manifestToolState = manifest?.tools && typeof manifest.tools === "object"
    ? manifest.tools["asset-pipeline-tool"]
    : null;

  [
    normalizeExplicitCatalogPath(launchContext.assetCatalogPath),
    normalizeExplicitCatalogPath(manifestAsset?.metadata?.assetCatalogPath || manifestAsset?.assetCatalogPath || ""),
    normalizeExplicitCatalogPath(manifestPalette?.metadata?.assetCatalogPath || manifestPalette?.assetCatalogPath || ""),
    normalizeExplicitCatalogPath(manifestToolState?.assetCatalogPath || ""),
    normalizeExplicitCatalogPath(manifestToolState?.catalogPath || ""),
    normalizeExplicitCatalogPath(manifestAsset?.metadata?.sourcePath || manifestAsset?.sourcePath || ""),
    normalizeExplicitCatalogPath(manifestPalette?.metadata?.sourcePath || manifestPalette?.sourcePath || "")
  ].forEach((candidatePath) => {
    if (candidatePath) {
      candidates.add(candidatePath);
    }
  });

  return Array.from(candidates).filter(Boolean);
}

function inferDomainFromCatalogKind(kind) {
  const normalizedKind = normalizeText(kind).toLowerCase();
  if (normalizedKind === "sprite") {
    return ASSET_PIPELINE_DOMAINS.sprites;
  }
  if (normalizedKind === "tilemap") {
    return ASSET_PIPELINE_DOMAINS.tilemaps;
  }
  if (normalizedKind === "parallax" || normalizedKind === "background") {
    return ASSET_PIPELINE_DOMAINS.parallax;
  }
  if (normalizedKind === "vector") {
    return ASSET_PIPELINE_DOMAINS.vectors;
  }
  return "";
}

function inferSourceToolIdForDomain(domain) {
  if (domain === ASSET_PIPELINE_DOMAINS.sprites) {
    return "sprite-editor";
  }
  if (domain === ASSET_PIPELINE_DOMAINS.tilemaps) {
    return "tile-map-editor";
  }
  if (domain === ASSET_PIPELINE_DOMAINS.parallax) {
    return "parallax-editor";
  }
  if (domain === ASSET_PIPELINE_DOMAINS.vectors) {
    return "vector-asset-studio";
  }
  return "";
}

function appendDomainRecordsFromCatalogEntries(domainInputs, catalogAssets) {
  if (!catalogAssets || typeof catalogAssets !== "object") {
    return;
  }
  Object.entries(catalogAssets).forEach(([assetId, entry]) => {
    const safeAssetId = normalizeText(assetId);
    const safeEntry = entry && typeof entry === "object" ? entry : {};
    const domain = inferDomainFromCatalogKind(safeEntry.kind);
    if (!domain) {
      return;
    }
    const sourceToolId = inferSourceToolIdForDomain(domain);
    const normalizedAssetId = normalizeAssetId(safeAssetId, `${domain}-asset`);
    if (!normalizedAssetId) {
      return;
    }
    const entries = domainInputs[domain];
    if (!Array.isArray(entries) || entries.some((record) => normalizeText(record?.assetId) === normalizedAssetId)) {
      return;
    }
    entries.push({
      assetId: normalizedAssetId,
      runtimeFileName: `${normalizedAssetId}.runtime.json`,
      toolDataFileName: `${normalizedAssetId}.tool.json`,
      sourceToolId
    });
  });
}

async function readWorkspaceAssetCatalog(gameId, manifest) {
  const candidates = buildCatalogPathCandidates(manifest);
  for (const pathValue of candidates) {
    try {
      const response = await fetch(pathValue, { cache: "no-store" });
      if (!response.ok) {
        continue;
      }
      const payload = await response.json();
      const schema = normalizeText(payload?.schema);
      const version = Number(payload?.version);
      if (schema !== GAME_ASSET_CATALOG_SCHEMA || version !== GAME_ASSET_CATALOG_VERSION) {
        continue;
      }
      const assets = payload.assets && typeof payload.assets === "object" ? payload.assets : {};
      return { path: pathValue, assets };
    } catch {
      // Try the next candidate path.
    }
  }
  return null;
}

async function buildPipelinePayloadFromWorkspace(manifest) {
  if (!manifest || typeof manifest !== "object") {
    return null;
  }
  const gameId = deriveGameIdFromManifest(manifest);
  if (!gameId) {
    return null;
  }
  const domainInputs = createEmptyDomainInputs();
  appendDomainRecordsFromToolIntegration(domainInputs, manifest);

  const catalog = await readWorkspaceAssetCatalog(gameId, manifest);
  if (catalog) {
    appendDomainRecordsFromCatalogEntries(domainInputs, catalog.assets);
  }

  const toolStates = manifest.tools && typeof manifest.tools === "object"
    ? cloneJson(manifest.tools) || {}
    : {};

  return {
    payload: {
      gameId,
      domainInputs,
      toolStates
    },
    catalogPath: catalog?.path || ""
  };
}

function extractPipelinePayloadFromSource(rawSource) {
  if (!rawSource || typeof rawSource !== "object") {
    return null;
  }

  const source = rawSource && typeof rawSource === "object" ? rawSource : {};
  const directKeys = ["pipelinePayload", "pipelineOptions", "assetPipelinePayload"];
  for (const key of directKeys) {
    const value = source[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value;
    }
  }

  const textKeys = ["pipelineInput", "input"];
  for (const key of textKeys) {
    if (typeof source[key] !== "string") {
      continue;
    }
    const parsed = parseJsonObjectString(source[key]);
    if (parsed) {
      return parsed;
    }
  }

  if (source.snapshot && typeof source.snapshot === "object") {
    const nested = extractPipelinePayloadFromSource(source.snapshot);
    if (nested) {
      return nested;
    }
  }

  if (source.state && typeof source.state === "object") {
    const nested = extractPipelinePayloadFromSource(source.state);
    if (nested) {
      return nested;
    }
  }

  if (source.gameId || source.domainInputs || source.toolStates) {
    return source;
  }

  return null;
}

function readActiveProjectManifest() {
  try {
    const raw = window.localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function getInputPayload() {
  if (!(refs.input instanceof HTMLTextAreaElement)) {
    return null;
  }
  const parsed = safeParseJson(refs.input.value);
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  return parsed;
}

function runPipeline() {
  const payload = getInputPayload();
  if (!payload) {
    setStatus("Input JSON is invalid. Provide a pipeline options object.");
    setOutput({
      schema: "html-js-gaming.asset-pipeline-tooling",
      version: 1,
      status: "invalid",
      errors: [
        {
          code: "PIPELINE_INPUT_INVALID",
          stage: "load",
          message: "Pipeline input must be a valid JSON object."
        }
      ],
      records: []
    });
    return;
  }
  const result = runAssetPipelineTooling(payload);
  setOutput(result);
  const recordCount = Array.isArray(result.records) ? result.records.length : 0;
  setStatus(`Pipeline ${result.status || "unknown"}; records=${recordCount}.`);
}

function extractPipelinePayloadFromPreset(rawPreset) {
  if (!rawPreset || typeof rawPreset !== "object") {
    return null;
  }
  const payload = rawPreset.payload && typeof rawPreset.payload === "object"
    ? rawPreset.payload
    : rawPreset;

  const candidateKeys = ["pipelinePayload", "pipelineOptions", "assetPipelinePayload"];
  for (const key of candidateKeys) {
    const value = payload[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value;
    }
  }
  if (payload && typeof payload === "object" && (payload.gameId || payload.domainInputs || payload.toolStates)) {
    return payload;
  }
  return null;
}

function loadPipelinePayloadIntoInput(payload, statusMessage) {
  if (!setInputValue(payload)) {
    throw new Error("Pipeline input is unavailable.");
  }
  setStatus(statusMessage);
}

async function loadPipelineFromWorkspaceState() {
  const manifest = readActiveProjectManifest();
  if (!manifest) {
    setStatus("Workspace load failed: no active workspace manifest found.");
    return;
  }
  const toolState = manifest.tools && typeof manifest.tools === "object"
    ? manifest.tools["asset-pipeline-tool"]
    : null;
  const payload = toolState && typeof toolState === "object"
    ? extractPipelinePayloadFromSource(toolState)
    : null;
  if (payload) {
    const workspaceName = normalizeText(manifest.name);
    loadPipelinePayloadIntoInput(
      payload,
      workspaceName
        ? `Loaded pipeline input from workspace state (${workspaceName}).`
        : "Loaded pipeline input from workspace state."
    );
    return;
  }

  const built = await buildPipelinePayloadFromWorkspace(manifest);
  if (!built?.payload) {
    setStatus("Workspace load failed: no saved pipeline state and unable to build payload from active workspace manifest.");
    return;
  }

  const totalRecords = Object.values(built.payload.domainInputs || {}).reduce((sum, records) => (
    sum + (Array.isArray(records) ? records.length : 0)
  ), 0);
  const workspaceName = normalizeText(manifest.name);
  const catalogDetail = built.catalogPath ? ` Catalog: ${built.catalogPath}.` : "";
  loadPipelinePayloadIntoInput(
    built.payload,
    workspaceName
      ? `Built pipeline input from workspace manifest (${workspaceName}); records=${totalRecords}.${catalogDetail}`
      : `Built pipeline input from workspace manifest; records=${totalRecords}.${catalogDetail}`
  );
}

async function loadPipelineFromJsonFile(file) {
  if (!file) {
    setStatus("JSON file load canceled.");
    return;
  }
  try {
    const text = await file.text();
    const parsed = parseJsonObjectString(text);
    if (!parsed) {
      throw new Error("Selected file must contain a valid JSON object.");
    }
    const payload = extractPipelinePayloadFromSource(parsed);
    if (!payload) {
      throw new Error("Selected file does not contain pipeline options.");
    }
    loadPipelinePayloadIntoInput(payload, `Loaded pipeline input from file ${file.name}.`);
  } catch (error) {
    setStatus(`JSON file load failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}

async function tryLoadPresetFromQuery(options = {}) {
  const reportMissing = options && options.reportMissing === true;
  const searchParams = new URLSearchParams(window.location.search);
  const samplePresetPath = normalizeSamplePresetPath(searchParams.get("samplePresetPath") || "");
  if (!samplePresetPath) {
    if (reportMissing) {
      setStatus("Preset load failed: samplePresetPath is missing from the URL query.");
    }
    return;
  }
  const sampleId = normalizeText(searchParams.get("sampleId"));
  const launchContext = readLaunchContextFromQuery();
  try {
    const presetUrl = new URL(samplePresetPath, window.location.href);
    const response = await fetch(presetUrl.toString(), { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Preset request failed (${response.status}).`);
    }
    const rawPreset = await response.json();
    const pipelinePayload = extractPipelinePayloadFromPreset(rawPreset);
    if (!pipelinePayload) {
      throw new Error("Preset payload did not include pipeline options.");
    }
    const adapted = applyLaunchContextToPayload(pipelinePayload, launchContext);
    if (!setInputValue(adapted.payload)) {
      throw new Error("Pipeline input is unavailable.");
    }
    const loadedStatus = buildPresetLoadedStatus(sampleId, samplePresetPath);
    if (adapted.overridden && launchContext.gameId) {
      setStatus(buildPresetLoadedWithContextStatus(launchContext.gameId, samplePresetPath));
      return;
    }
    setStatus(loadedStatus);
  } catch (error) {
    setStatus(`Preset load failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}

function bootAssetPipelineTool() {
  if (refs.runButton instanceof HTMLButtonElement) {
    refs.runButton.addEventListener("click", runPipeline);
  }
  if (refs.loadFromPresetButton instanceof HTMLButtonElement) {
    refs.loadFromPresetButton.addEventListener("click", () => {
      void tryLoadPresetFromQuery({ reportMissing: true });
    });
  }
  if (refs.loadFromWorkspaceButton instanceof HTMLButtonElement) {
    refs.loadFromWorkspaceButton.addEventListener("click", () => {
      void loadPipelineFromWorkspaceState();
    });
  }
  if (refs.loadJsonFileButton instanceof HTMLButtonElement && refs.jsonFileInput instanceof HTMLInputElement) {
    refs.loadJsonFileButton.addEventListener("click", () => {
      refs.jsonFileInput.value = "";
      refs.jsonFileInput.click();
    });
    refs.jsonFileInput.addEventListener("change", () => {
      const file = refs.jsonFileInput instanceof HTMLInputElement ? refs.jsonFileInput.files?.[0] : null;
      void loadPipelineFromJsonFile(file ?? null);
    });
  }
  if (refs.input instanceof HTMLTextAreaElement && !refs.input.value.trim()) {
    setStatus("Awaiting source pipeline JSON. No default payload is applied.");
  }
  void tryLoadPresetFromQuery();
  window.assetPipelineToolApp = assetPipelineToolApi;
  return assetPipelineToolApi;
}

const assetPipelineToolApi = {
  captureProjectState() {
    return {
      pipelineInput: refs.input instanceof HTMLTextAreaElement ? refs.input.value : ""
    };
  },
  applyProjectState(snapshot) {
    if (!(refs.input instanceof HTMLTextAreaElement)) {
      return false;
    }
    const nextInput = typeof snapshot?.pipelineInput === "string"
      ? snapshot.pipelineInput
      : (snapshot?.pipelinePayload && typeof snapshot.pipelinePayload === "object"
        ? toPrettyJson(snapshot.pipelinePayload)
        : "");
    if (!nextInput) {
      return false;
    }
    refs.input.value = nextInput;
    setStatus("Pipeline state loaded from workspace source data.");
    return true;
  },
  runPipeline
};

registerToolBootContract("asset-pipeline-tool", {
  init: bootAssetPipelineTool,
  destroy() {
    return true;
  },
  getApi() {
    return window.assetPipelineToolApp || assetPipelineToolApi;
  }
});

bootAssetPipelineTool();
