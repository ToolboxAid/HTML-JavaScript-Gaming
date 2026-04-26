import { safeParseJson, toPrettyJson } from "../shared/debugInspectorData.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";
import {
  createDefaultCameraPathPayload,
  normalizeCameraPathPayload,
  validateCameraPathPayload
} from "../schemas/tools/cameraPathPayload.schema.js";

const refs = {
  addButton: document.getElementById("addCameraPointButton"),
  normalizeButton: document.getElementById("normalizeCameraPathButton"),
  statusText: document.getElementById("cameraPathStatus"),
  input: document.getElementById("cameraPathInput"),
  output: document.getElementById("cameraPathOutput")
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

function parseInputPayload() {
  if (!(refs.input instanceof HTMLTextAreaElement)) {
    return null;
  }
  const parsed = safeParseJson(refs.input.value);
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  const validation = validateCameraPathPayload(parsed, {
    requireSchema: false,
    requireWaypoints: false
  });
  if (!validation.valid) {
    return null;
  }
  return validation.payload;
}

function buildDefaultPayload() {
  // Deprecated compatibility shim for older call-sites.
  return createDefaultCameraPathPayload();
}

function extractCameraPathFromPreset(rawPreset) {
  if (!rawPreset || typeof rawPreset !== "object") {
    return null;
  }
  const payload = rawPreset.payload && typeof rawPreset.payload === "object"
    ? rawPreset.payload
    : rawPreset;

  const candidateKeys = ["3d-camera-path-editor", "cameraPath", "path", "cameraPathPayload"];
  for (const key of candidateKeys) {
    const value = payload[key];
    if (value && typeof value === "object" && Array.isArray(value.waypoints)) {
      return value;
    }
  }
  if (Array.isArray(payload.waypoints)) {
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
    const extractedCameraPath = extractCameraPathFromPreset(rawPreset);
    if (!extractedCameraPath) {
      throw new Error("Preset payload did not include a camera path.");
    }
    const validation = validateCameraPathPayload(extractedCameraPath, {
      requireSchema: true,
      requireWaypoints: true
    });
    if (!validation.valid) {
      throw new Error(validation.issues.join(" "));
    }
    if (!(refs.input instanceof HTMLTextAreaElement)) {
      throw new Error("Camera path input is unavailable.");
    }
    refs.input.value = toPrettyJson(validation.payload);
    setStatus(buildPresetLoadedStatus(sampleId, samplePresetPath));
  } catch (error) {
    setStatus(`Preset load failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}

function normalizeCameraPath() {
  if (!(refs.input instanceof HTMLTextAreaElement)) {
    return;
  }
  const parsed = safeParseJson(refs.input.value);
  const validation = validateCameraPathPayload(parsed, {
    requireSchema: false,
    requireWaypoints: true
  });
  if (!validation.valid) {
    setStatus(`Input JSON is invalid. ${validation.issues.join(" ")}`);
    return;
  }
  const normalized = normalizeCameraPathPayload(validation.payload, {
    fallbackPathId: "camera-path"
  });
  if (refs.output instanceof HTMLElement) {
    refs.output.textContent = toPrettyJson(normalized);
  }
  setStatus(`Path normalized. waypoints=${normalized.waypoints.length}.`);
}

function addWaypoint() {
  const parsed = parseInputPayload() || buildDefaultPayload();
  const waypoints = Array.isArray(parsed.waypoints) ? parsed.waypoints.slice() : [];
  const lastTime = waypoints.length > 0 ? Number(waypoints[waypoints.length - 1]?.t) || 0 : 0;
  waypoints.push({
    t: lastTime + 1000,
    position: { x: 0, y: 8, z: -20 },
    lookAt: { x: 0, y: 0, z: 0 }
  });
  parsed.waypoints = waypoints;
  if (refs.input instanceof HTMLTextAreaElement) {
    refs.input.value = toPrettyJson(parsed);
  }
  setStatus(`Waypoint added. total=${waypoints.length}.`);
}

function boot3dCameraPathEditor() {
  if (refs.addButton instanceof HTMLButtonElement) {
    refs.addButton.addEventListener("click", addWaypoint);
  }
  if (refs.normalizeButton instanceof HTMLButtonElement) {
    refs.normalizeButton.addEventListener("click", normalizeCameraPath);
  }
  if (refs.input instanceof HTMLTextAreaElement && !refs.input.value.trim()) {
    refs.input.value = toPrettyJson(buildDefaultPayload());
  }
  void tryLoadPresetFromQuery();
  return {
    addWaypoint,
    normalize: normalizeCameraPath
  };
}

registerToolBootContract("3d-camera-path-editor", {
  init: boot3dCameraPathEditor,
  destroy() {
    return true;
  },
  getApi() {
    return {
      addWaypoint,
      normalize: normalizeCameraPath
    };
  }
});

boot3dCameraPathEditor();
