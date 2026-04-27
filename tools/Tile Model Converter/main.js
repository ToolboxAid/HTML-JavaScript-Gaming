import {
  convertAssetPipelineCandidate,
  createAssetPipelineConverterRegistry,
  listAssetPipelineConverters
} from "../shared/assetPipelineConverters.js";
import { safeParseJson, toPrettyJson } from "../shared/debugInspectorData.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";
import {
  getToolLoadQuerySnapshot,
  getToolLoadRequestedDataPaths,
  summarizeToolLoadData,
  logToolLoadRequest,
  logToolLoadFetch,
  logToolLoadLoaded,
  logToolLoadWarning
} from "../shared/toolLoadDiagnostics.js";

const refs = {
  runButton: document.getElementById("runConverterButton"),
  statusText: document.getElementById("converterStatus"),
  input: document.getElementById("converterInput"),
  output: document.getElementById("converterOutput")
};

const converterRegistry = createAssetPipelineConverterRegistry();

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

function runConversion() {
  const payload = getInputPayload();
  if (!payload) {
    setStatus("Input JSON is invalid. Provide candidate/conversion payload.");
    return;
  }
  const candidate = payload.candidate && typeof payload.candidate === "object" ? payload.candidate : {};
  const conversion = payload.conversion && typeof payload.conversion === "object" ? payload.conversion : {};
  const result = convertAssetPipelineCandidate(candidate, {
    conversion,
    converterRegistry
  });
  if (refs.output instanceof HTMLElement) {
    refs.output.textContent = toPrettyJson({
      availableConverters: listAssetPipelineConverters(converterRegistry),
      result
    });
  }
  setStatus(`Conversion ${result.applied ? "applied" : "not-applied"} (${result.converterId || "no-converter"}).`);
}

function extractConverterPayloadFromPreset(rawPreset) {
  if (!rawPreset || typeof rawPreset !== "object") {
    return null;
  }

  const payload = rawPreset.payload && typeof rawPreset.payload === "object"
    ? rawPreset.payload
    : rawPreset;
  const config = payload.config && typeof payload.config === "object"
    ? payload.config
    : null;

  const candidate = payload.candidate && typeof payload.candidate === "object"
    ? payload.candidate
    : null;
  const conversion = payload.conversion && typeof payload.conversion === "object"
    ? payload.conversion
    : null;
  const configCandidate = config?.candidate && typeof config.candidate === "object"
    ? config.candidate
    : null;
  const configConversion = config?.conversion && typeof config.conversion === "object"
    ? config.conversion
    : null;

  if (!candidate && !conversion && !configCandidate && !configConversion) {
    return null;
  }

  return {
    candidate: candidate || configCandidate || {},
    conversion: conversion || configConversion || {}
  };
}

async function tryLoadPresetFromQuery() {
  const searchParams = new URLSearchParams(window.location.search);
  const samplePresetPath = normalizeSamplePresetPath(searchParams.get("samplePresetPath") || "");
  const launchQuery = getToolLoadQuerySnapshot(searchParams);
  logToolLoadRequest({
    toolId: "tile-model-converter",
    sampleId: String(searchParams.get("sampleId") || "").trim(),
    samplePresetPath,
    requestedDataPaths: getToolLoadRequestedDataPaths(launchQuery),
    launchQuery
  });
  if (!samplePresetPath) {
    logToolLoadWarning({
      toolId: "tile-model-converter",
      reason: "samplePresetPath missing",
      launchQuery
    });
    return;
  }

  const sampleId = String(searchParams.get("sampleId") || "").trim();
  try {
    const presetUrl = new URL(samplePresetPath, window.location.href);
    const presetHref = presetUrl.toString();
    logToolLoadFetch({
      toolId: "tile-model-converter",
      phase: "attempt",
      fetchUrl: presetHref,
      requestedPath: samplePresetPath,
      pathSource: "tool-input:query.samplePresetPath"
    });
    const response = await fetch(presetHref, { cache: "no-store" });
    logToolLoadFetch({
      toolId: "tile-model-converter",
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
    const rawPreset = await response.json();
    logToolLoadLoaded({
      toolId: "tile-model-converter",
      sampleId,
      samplePresetPath,
      fetchUrl: presetHref,
      loaded: summarizeToolLoadData(rawPreset)
    });
    const payload = extractConverterPayloadFromPreset(rawPreset);
    if (!payload) {
      throw new Error("Preset payload did not include candidate/conversion data.");
    }
    if (!(refs.input instanceof HTMLTextAreaElement)) {
      throw new Error("Converter input is unavailable.");
    }
    refs.input.value = toPrettyJson(payload);
    setStatus(buildPresetLoadedStatus(sampleId, samplePresetPath));
  } catch (error) {
    logToolLoadWarning({
      toolId: "tile-model-converter",
      sampleId,
      samplePresetPath,
      error: error instanceof Error ? error.message : "unknown error"
    });
    setStatus(`Preset load failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}

function bootTileModelConverter() {
  if (refs.runButton instanceof HTMLButtonElement) {
    refs.runButton.addEventListener("click", runConversion);
  }
  if (refs.input instanceof HTMLTextAreaElement && !refs.input.value.trim()) {
    setStatus("Awaiting source converter JSON. No default payload is applied.");
  }
  void tryLoadPresetFromQuery();
  return { runConversion };
}

registerToolBootContract("tile-model-converter", {
  init: bootTileModelConverter,
  destroy() {
    return true;
  },
  getApi() {
    return { runConversion };
  }
});

bootTileModelConverter();
