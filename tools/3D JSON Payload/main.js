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
  normalizeButton: document.getElementById("normalize3dMapButton"),
  howToUseButton: document.getElementById("openHowToUse3dMapButton"),
  statusText: document.getElementById("map3dStatus"),
  input: document.getElementById("map3dInput"),
  output: document.getElementById("map3dOutput")
};

const MAP_PAYLOAD_SCHEMA = "tools.3d-json-payload.document/1";
const MAP_NORMALIZER_EMPTY_STATE_MESSAGE = "No map payload loaded. Provide explicit JSON input or launch with samplePresetPath.";

function sanitizeNumber(value, fallback = 0) {
  const numeric = Number(value);
  if (Number.isNaN(numeric) || numeric === Infinity || numeric === -Infinity) {
    return fallback;
  }
  return numeric;
}

function normalizeMapPayload(rawPayload) {
  if (!rawPayload || typeof rawPayload !== "object") {
    return {
      schema: MAP_PAYLOAD_SCHEMA,
      mapId: "map-3d",
      points: [],
      segments: []
    };
  }
  const rawPoints = Array.isArray(rawPayload.points) ? rawPayload.points : [];
  const points = rawPoints.map((rawPoint, index) => {
    const point = rawPoint && typeof rawPoint === "object" ? rawPoint : {};
    return {
      id: typeof point.id === "string" && point.id.trim() ? point.id.trim() : `p${index + 1}`,
      x: sanitizeNumber(point.x),
      y: sanitizeNumber(point.y),
      z: sanitizeNumber(point.z)
    };
  });
  const knownIds = new Set(points.map((point) => point.id));
  const rawSegments = Array.isArray(rawPayload.segments) ? rawPayload.segments : [];
  const segments = rawSegments
    .map((rawSegment) => {
      const segment = rawSegment && typeof rawSegment === "object" ? rawSegment : {};
      return {
        from: typeof segment.from === "string" ? segment.from.trim() : "",
        to: typeof segment.to === "string" ? segment.to.trim() : ""
      };
    })
    .filter((segment) => segment.from && segment.to && knownIds.has(segment.from) && knownIds.has(segment.to));

  return {
    schema: typeof rawPayload.schema === "string" && rawPayload.schema.trim()
      ? rawPayload.schema.trim()
      : MAP_PAYLOAD_SCHEMA,
    mapId: typeof rawPayload.mapId === "string" && rawPayload.mapId.trim()
      ? rawPayload.mapId.trim()
      : "map-3d-baseline",
    points,
    segments
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

async function tryLoadPresetFromQuery() {
  const searchParams = new URLSearchParams(window.location.search);
  const samplePresetPath = normalizeSamplePresetPath(searchParams.get("samplePresetPath") || "");
  const launchQuery = getToolLoadQuerySnapshot(searchParams);
  logToolLoadRequest({
    toolId: "3d-json-payload",
    sampleId: String(searchParams.get("sampleId") || "").trim(),
    samplePresetPath,
    requestedDataPaths: getToolLoadRequestedDataPaths(launchQuery),
    launchQuery
  });
  if (!samplePresetPath) {
    logToolLoadWarning({
      toolId: "3d-json-payload",
      reason: "samplePresetPath missing",
      launchQuery
    });
    setStatus(MAP_NORMALIZER_EMPTY_STATE_MESSAGE);
    return;
  }
  const sampleId = String(searchParams.get("sampleId") || "").trim();
  try {
    const presetUrl = new URL(samplePresetPath, window.location.href);
    const presetHref = presetUrl.toString();
    logToolLoadFetch({
      toolId: "3d-json-payload",
      phase: "attempt",
      fetchUrl: presetHref,
      requestedPath: samplePresetPath,
      pathSource: "tool-input:query.samplePresetPath"
    });
    const response = await fetch(presetHref, { cache: "no-store" });
    logToolLoadFetch({
      toolId: "3d-json-payload",
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
    await logToolLoadLoaded({
      toolId: "3d-json-payload",
      toolName: "3D JSON Payload",
      sampleId,
      samplePresetPath,
      requestedPath: samplePresetPath,
      fetchUrl: presetHref,
      loadedDocument: rawPreset,
      loaded: summarizeToolLoadData(rawPreset)
    });
    const extractedPayload = rawPreset?.payload?.mapPayload;
    if (!(refs.input instanceof HTMLTextAreaElement)) {
      throw new Error("Map payload input is unavailable.");
    }
    refs.input.value = toPrettyJson(extractedPayload);
    setStatus(buildPresetLoadedStatus(sampleId, samplePresetPath));
  } catch (error) {
    logToolLoadWarning({
      toolId: "3d-json-payload",
      sampleId,
      samplePresetPath,
      error: error instanceof Error ? error.message : "unknown error"
    });
    setStatus(`Preset load failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}

function normalizeMapPayloadAction() {
  if (!(refs.input instanceof HTMLTextAreaElement)) {
    return;
  }

  const parsed = safeParseJson(refs.input.value);
  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.points) || parsed.points.length === 0) {
    setStatus("Input JSON is invalid. Map payload requires at least one point.");
    return;
  }
  const normalized = normalizeMapPayload(parsed);

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
    setStatus(MAP_NORMALIZER_EMPTY_STATE_MESSAGE);
  }
  void tryLoadPresetFromQuery();
  return {
    normalize: normalizeMapPayloadAction
  };
}

registerToolBootContract("3d-json-payload", {
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
