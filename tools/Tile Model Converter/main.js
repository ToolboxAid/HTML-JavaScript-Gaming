import {
  convertAssetPipelineCandidate,
  createAssetPipelineConverterRegistry,
  listAssetPipelineConverters
} from "../shared/assetPipelineConverters.js";
import { safeParseJson, toPrettyJson } from "../shared/debugInspectorData.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";

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

  const candidate = payload.candidate && typeof payload.candidate === "object"
    ? payload.candidate
    : null;
  const conversion = payload.conversion && typeof payload.conversion === "object"
    ? payload.conversion
    : null;

  if (!candidate && !conversion) {
    return null;
  }

  return {
    candidate: candidate || {},
    conversion: conversion || {}
  };
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
