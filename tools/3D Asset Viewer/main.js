import { safeParseJson, toPrettyJson } from "../shared/debugInspectorData.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";
import {
  ASSET_VIEWER_REPORT_SCHEMA,
  createDefaultAssetPayload,
  validateAssetPayload
} from "../schemas/tools/assetPayload.schema.js";

const refs = {
  inspectButton: document.getElementById("inspect3dAssetButton"),
  statusText: document.getElementById("asset3dStatus"),
  input: document.getElementById("asset3dInput"),
  output: document.getElementById("asset3dOutput")
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

function sanitizeNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
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
  // Deprecated compatibility shim for older call-sites.
  return createDefaultAssetPayload();
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
    const validation = validateAssetPayload(extractedPayload, {
      requireSchema: true,
      requireVertices: true
    });
    if (!validation.valid) {
      throw new Error(validation.issues.join(" "));
    }
    if (!(refs.input instanceof HTMLTextAreaElement)) {
      throw new Error("Asset input is unavailable.");
    }
    refs.input.value = toPrettyJson(validation.payload);
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
  const validation = validateAssetPayload(parsed, {
    requireSchema: false,
    requireVertices: true
  });
  if (!validation.valid) {
    setStatus(`Input JSON is invalid. ${validation.issues.join(" ")}`);
    return;
  }

  const assetPayload = validation.payload;
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
