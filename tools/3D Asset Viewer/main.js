import { safeParseJson, toPrettyJson } from "../shared/debugInspectorData.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";

const refs = {
  inspectButton: document.getElementById("inspect3dAssetButton"),
  statusText: document.getElementById("asset3dStatus"),
  input: document.getElementById("asset3dInput"),
  output: document.getElementById("asset3dOutput")
};

const ASSET_VIEWER_PAYLOAD_SCHEMA = "tools.3d-asset-viewer.asset/1";
const ASSET_VIEWER_REPORT_SCHEMA = "tools.3d-asset-viewer.report/1";

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

function sanitizeNumber(value) {
  const numeric = Number(value);
  return Number.isNaN(numeric) || numeric === Infinity || numeric === -Infinity ? 0 : numeric;
}

function computeBounds(vertices) {
  if (!Array.isArray(vertices) || vertices.length === 0) {
    return null;
  }
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;

  vertices.forEach((vertex) => {
    const x = sanitizeNumber(vertex?.x);
    const y = sanitizeNumber(vertex?.y);
    const z = sanitizeNumber(vertex?.z);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    minZ = Math.min(minZ, z);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    maxZ = Math.max(maxZ, z);
  });

  return {
    min: { x: minX, y: minY, z: minZ },
    max: { x: maxX, y: maxY, z: maxZ },
    size: { x: maxX - minX, y: maxY - minY, z: maxZ - minZ }
  };
}

function buildDefaultPayload() {
  return {
    schema: ASSET_VIEWER_PAYLOAD_SCHEMA,
    assetId: "ship-hull",
    vertices: [
      { x: -1, y: -0.5, z: -2 },
      { x: 1, y: -0.5, z: -2 },
      { x: 0, y: 0.75, z: 2 }
    ],
    metadata: {
      sourceToolId: "vector-asset-studio"
    }
  };
}

function normalizeAssetPayload(rawPayload) {
  if (!rawPayload || typeof rawPayload !== "object") {
    return buildDefaultPayload();
  }
  const rawVertices = Array.isArray(rawPayload.vertices) ? rawPayload.vertices : [];
  const vertices = rawVertices.map((rawVertex) => {
    const vertex = rawVertex && typeof rawVertex === "object" ? rawVertex : {};
    return {
      x: sanitizeNumber(vertex.x),
      y: sanitizeNumber(vertex.y),
      z: sanitizeNumber(vertex.z)
    };
  });
  return {
    schema: typeof rawPayload.schema === "string" && rawPayload.schema.trim()
      ? rawPayload.schema.trim()
      : ASSET_VIEWER_PAYLOAD_SCHEMA,
    assetId: typeof rawPayload.assetId === "string" && rawPayload.assetId.trim()
      ? rawPayload.assetId.trim()
      : "asset-3d",
    vertices,
    metadata: rawPayload.metadata && typeof rawPayload.metadata === "object" ? { ...rawPayload.metadata } : {}
  };
}

function extractAssetPayloadFromPreset(rawPreset) {
  if (!rawPreset || typeof rawPreset !== "object") {
    return null;
  }
  const payload = rawPreset.payload && typeof rawPreset.payload === "object"
    ? rawPreset.payload
    : rawPreset;

  const candidateKeys = ["3d-asset-viewer", "asset3d", "asset", "assetPayload", "viewerPayload"];
  for (const key of candidateKeys) {
    const value = payload[key];
    if (value && typeof value === "object" && Array.isArray(value.vertices)) {
      return value;
    }
  }
  if (Array.isArray(payload.vertices)) {
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
    const extractedPayload = extractAssetPayloadFromPreset(rawPreset);
    if (!extractedPayload) {
      throw new Error("Preset payload did not include a 3D asset payload.");
    }
    if (!Array.isArray(extractedPayload.vertices) || extractedPayload.vertices.length === 0) {
      throw new Error("Preset payload must include at least one vertex.");
    }
    if (!(refs.input instanceof HTMLTextAreaElement)) {
      throw new Error("Asset input is unavailable.");
    }
    refs.input.value = toPrettyJson(normalizeAssetPayload(extractedPayload));
    setStatus(buildPresetLoadedStatus(sampleId, samplePresetPath));
  } catch (error) {
    setStatus(`Preset load failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}

function inspectAssetPayload() {
  if (!(refs.input instanceof HTMLTextAreaElement)) {
    return;
  }
  const parsed = safeParseJson(refs.input.value);
  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.vertices) || parsed.vertices.length === 0) {
    setStatus("Input JSON is invalid. 3D asset payload requires at least one vertex.");
    return;
  }

  const assetPayload = normalizeAssetPayload(parsed);
  const vertices = Array.isArray(assetPayload.vertices) ? assetPayload.vertices : [];
  const bounds = computeBounds(vertices);
  const report = {
    schema: ASSET_VIEWER_REPORT_SCHEMA,
    assetId: assetPayload.assetId,
    vertexCount: vertices.length,
    bounds,
    metadata: assetPayload.metadata && typeof assetPayload.metadata === "object" ? { ...assetPayload.metadata } : {}
  };

  if (refs.output instanceof HTMLElement) {
    refs.output.textContent = toPrettyJson(report);
  }
  setStatus(`Inspection complete. vertices=${report.vertexCount}.`);
}

function boot3dAssetViewer() {
  if (refs.inspectButton instanceof HTMLButtonElement) {
    refs.inspectButton.addEventListener("click", inspectAssetPayload);
  }
  if (refs.input instanceof HTMLTextAreaElement && !refs.input.value.trim()) {
    refs.input.value = toPrettyJson(buildDefaultPayload());
  }
  void tryLoadPresetFromQuery();
  return {
    inspect: inspectAssetPayload
  };
}

registerToolBootContract("3d-asset-viewer", {
  init: boot3dAssetViewer,
  destroy() {
    return true;
  },
  getApi() {
    return {
      inspect: inspectAssetPayload
    };
  }
});

boot3dAssetViewer();
