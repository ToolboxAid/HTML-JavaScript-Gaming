import { runAssetPipelineTooling } from "../shared/pipeline/assetPipelineTooling.js";
import { safeParseJson, toPrettyJson } from "../shared/debugInspectorData.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";

const refs = {
  runButton: document.getElementById("runAssetPipelineButton"),
  statusText: document.getElementById("assetPipelineStatus"),
  input: document.getElementById("assetPipelineInput"),
  output: document.getElementById("assetPipelineOutput")
};

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
  const normalizedSampleId = typeof sampleId === "string" ? sampleId.trim() : "";
  if (normalizedSampleId) {
    return `Loaded preset from sample ${normalizedSampleId}.`;
  }
  const normalizedPath = typeof samplePresetPath === "string" ? samplePresetPath.trim() : "";
  return normalizedPath ? `Loaded preset from ${normalizedPath}.` : "Loaded preset.";
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
    return;
  }
  const result = runAssetPipelineTooling(payload);
  if (refs.output instanceof HTMLElement) {
    refs.output.textContent = toPrettyJson(result);
  }
  const recordCount = Array.isArray(result.records) ? result.records.length : 0;
  setStatus(`Pipeline ${result.status || "unknown"}; records=${recordCount}.`);
}

function createDefaultPayload() {
  return {
    gameId: "asteroids",
    domainInputs: {
      sprites: [
        {
          assetId: "ship-main",
          runtimeFileName: "ship-main.runtime.json",
          toolDataFileName: "ship-main.tool.json",
          sourceToolId: "sprite-editor"
        }
      ]
    },
    toolStates: {
      "sprite-editor": {
        schema: "html-js-gaming.tool-state",
        version: 1,
        toolId: "sprite-editor",
        projectId: "asteroids",
        savedAtIso: "2026-01-01T00:00:00.000Z",
        state: {
          activeLayerId: "base"
        }
      }
    }
  };
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
  const sampleId = String(searchParams.get("sampleId") || "").trim();
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
    if (!(refs.input instanceof HTMLTextAreaElement)) {
      throw new Error("Pipeline input is unavailable.");
    }
    refs.input.value = toPrettyJson(pipelinePayload);
    setStatus(buildPresetLoadedStatus(sampleId, samplePresetPath));
  } catch (error) {
    setStatus(`Preset load failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}

function bootAssetPipelineTool() {
  if (refs.runButton instanceof HTMLButtonElement) {
    refs.runButton.addEventListener("click", runPipeline);
  }
  if (refs.input instanceof HTMLTextAreaElement && !refs.input.value.trim()) {
    refs.input.value = toPrettyJson(createDefaultPayload());
  }
  void tryLoadPresetFromQuery();
  return { runPipeline };
}

registerToolBootContract("asset-pipeline-tool", {
  init: bootAssetPipelineTool,
  destroy() {
    return true;
  },
  getApi() {
    return { runPipeline };
  }
});

bootAssetPipelineTool();
