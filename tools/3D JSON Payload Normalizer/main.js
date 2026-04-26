import { safeParseJson, toPrettyJson } from "../shared/debugInspectorData.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";
import {
  createDefaultMapPayload,
  normalizeMapPayload,
  validateMapPayload
} from "./mapPayload.schema.js";

const refs = {
  normalizeButton: document.getElementById("normalize3dMapButton"),
  howToUseButton: document.getElementById("openHowToUse3dMapButton"),
  statusText: document.getElementById("map3dStatus"),
  input: document.getElementById("map3dInput"),
  output: document.getElementById("map3dOutput")
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

function buildDefaultPayload() {
  // Deprecated compatibility shim for older call-sites.
  return createDefaultMapPayload();
}

function extractMapPayloadFromPreset(rawPreset) {
  if (!rawPreset || typeof rawPreset !== "object") {
    return null;
  }
  const payload = rawPreset.payload && typeof rawPreset.payload === "object"
    ? rawPreset.payload
    : rawPreset;

  const candidateKeys = ["3d-json-payload-normalizer", "mapPayload", "mapDocument", "normalizerPayload", "document"];
  for (const key of candidateKeys) {
    const value = payload[key];
    if (value && typeof value === "object" && Array.isArray(value.points)) {
      return value;
    }
  }
  if (Array.isArray(payload.points)) {
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
    const extractedPayload = extractMapPayloadFromPreset(rawPreset);
    if (!extractedPayload) {
      throw new Error("Preset payload did not include a map payload.");
    }
    const validation = validateMapPayload(extractedPayload, {
      requireSchema: true,
      requirePoints: true
    });
    if (!validation.valid) {
      throw new Error(validation.issues.join(" "));
    }
    if (!(refs.input instanceof HTMLTextAreaElement)) {
      throw new Error("Map payload input is unavailable.");
    }
    refs.input.value = toPrettyJson(validation.payload);
    setStatus(buildPresetLoadedStatus(sampleId, samplePresetPath));
  } catch (error) {
    setStatus(`Preset load failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}

function normalizeMapPayloadAction() {
  if (!(refs.input instanceof HTMLTextAreaElement)) {
    return;
  }

  const parsed = safeParseJson(refs.input.value);
  const validation = validateMapPayload(parsed, {
    requireSchema: false,
    requirePoints: true
  });
  if (!validation.valid) {
    setStatus(`Input JSON is invalid. ${validation.issues.join(" ")}`);
    return;
  }
  const normalized = normalizeMapPayload(validation.payload, {
    fallbackMapId: "map-3d-baseline"
  });

  if (refs.output instanceof HTMLElement) {
    refs.output.textContent = toPrettyJson(normalized);
  }
  setStatus(`Payload normalized. points=${normalized.points.length}, segments=${normalized.segments.length}.`);
}

function boot3dMapEditor() {
  if (refs.normalizeButton instanceof HTMLButtonElement) {
    refs.normalizeButton.addEventListener("click", normalizeMapPayloadAction);
  }
  if (refs.howToUseButton instanceof HTMLButtonElement) {
    refs.howToUseButton.addEventListener("click", () => {
      window.location.href = "./how_to_use.html";
    });
  }
  if (refs.input instanceof HTMLTextAreaElement && !refs.input.value.trim()) {
    refs.input.value = toPrettyJson(buildDefaultPayload());
  }
  void tryLoadPresetFromQuery();
  return {
    normalize: normalizeMapPayloadAction
  };
}

registerToolBootContract("3d-json-payload-normalizer", {
  init: boot3dMapEditor,
  destroy() {
    return true;
  },
  getApi() {
    return {
      normalize: normalizeMapPayloadAction
    };
  }
});

boot3dMapEditor();
