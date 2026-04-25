import { runAssetPipelineTooling } from "../shared/pipeline/assetPipelineTooling.js";
import { safeParseJson, toPrettyJson } from "../shared/debugInspectorData.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";

const refs = {
  runButton: document.getElementById("runAssetPipelineButton"),
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
    gameTitle: normalizeText(searchParams.get("gameTitle"))
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

async function tryLoadPresetFromQuery() {
  const searchParams = new URLSearchParams(window.location.search);
  const samplePresetPath = normalizeSamplePresetPath(searchParams.get("samplePresetPath") || "");
  if (!samplePresetPath) {
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
    if (!(refs.input instanceof HTMLTextAreaElement)) {
      throw new Error("Pipeline input is unavailable.");
    }
    refs.input.value = toPrettyJson(adapted.payload);
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
