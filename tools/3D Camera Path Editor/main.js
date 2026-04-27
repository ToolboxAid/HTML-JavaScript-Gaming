import { safeParseJson, toPrettyJson } from "../shared/debugInspectorData.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";

const refs = {
  addButton: document.getElementById("addCameraPointButton"),
  normalizeButton: document.getElementById("normalizeCameraPathButton"),
  statusText: document.getElementById("cameraPathStatus"),
  input: document.getElementById("cameraPathInput"),
  output: document.getElementById("cameraPathOutput")
};

const CAMERA_PATH_PAYLOAD_SCHEMA = "tools.3d-camera-path.path/1";

function sanitizeNumber(value, fallback = 0) {
  const numeric = Number(value);
  if (Number.isNaN(numeric) || numeric === Infinity || numeric === -Infinity) {
    return fallback;
  }
  return numeric;
}

function normalizeCameraPathPayload(rawPayload) {
  if (!rawPayload || typeof rawPayload !== "object") {
    return buildDefaultPayload();
  }
  const rawWaypoints = Array.isArray(rawPayload.waypoints) ? rawPayload.waypoints : [];
  const waypoints = rawWaypoints.map((rawWaypoint, index) => {
    const point = rawWaypoint && typeof rawWaypoint === "object" ? rawWaypoint : {};
    return {
      t: sanitizeNumber(point.t, index * 1000),
      position: {
        x: sanitizeNumber(point.position?.x),
        y: sanitizeNumber(point.position?.y),
        z: sanitizeNumber(point.position?.z)
      },
      lookAt: {
        x: sanitizeNumber(point.lookAt?.x),
        y: sanitizeNumber(point.lookAt?.y),
        z: sanitizeNumber(point.lookAt?.z)
      }
    };
  });
  waypoints.sort((left, right) => left.t - right.t);
  return {
    schema: typeof rawPayload.schema === "string" && rawPayload.schema.trim()
      ? rawPayload.schema.trim()
      : CAMERA_PATH_PAYLOAD_SCHEMA,
    pathId: typeof rawPayload.pathId === "string" && rawPayload.pathId.trim()
      ? rawPayload.pathId.trim()
      : "camera-path",
    waypoints
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

function parseInputPayload() {
  if (!(refs.input instanceof HTMLTextAreaElement)) {
    return null;
  }
  const parsed = safeParseJson(refs.input.value);
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  return normalizeCameraPathPayload(parsed);
}

function buildDefaultPayload() {
  return {
    schema: CAMERA_PATH_PAYLOAD_SCHEMA,
    pathId: "camera-orbit-a",
    waypoints: [
      {
        t: 0,
        position: { x: 0, y: 8, z: -20 },
        lookAt: { x: 0, y: 0, z: 0 }
      },
      {
        t: 2000,
        position: { x: 10, y: 10, z: -10 },
        lookAt: { x: 0, y: 0, z: 0 }
      }
    ]
  };
}

function extractCameraPathFromPreset(rawPreset) {
  if (!rawPreset || typeof rawPreset !== "object") {
    return null;
  }
  const payload = rawPreset.payload && typeof rawPreset.payload === "object"
    ? rawPreset.payload
    : rawPreset;
  const config = payload.config && typeof payload.config === "object"
    ? payload.config
    : null;

  const candidateKeys = ["3d-camera-path-editor", "cameraPath", "path", "cameraPathPayload"];
  for (const key of candidateKeys) {
    const value = payload[key];
    if (value && typeof value === "object" && Array.isArray(value.waypoints)) {
      return value;
    }
  }
  for (const key of candidateKeys) {
    const value = config?.[key];
    if (value && typeof value === "object" && Array.isArray(value.waypoints)) {
      return value;
    }
  }
  if (Array.isArray(payload.waypoints)) {
    return payload;
  }
  if (Array.isArray(config?.waypoints)) {
    return config;
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
    if (!Array.isArray(extractedCameraPath.waypoints) || extractedCameraPath.waypoints.length === 0) {
      throw new Error("Preset camera path must include at least one waypoint.");
    }
    if (!(refs.input instanceof HTMLTextAreaElement)) {
      throw new Error("Camera path input is unavailable.");
    }
    refs.input.value = toPrettyJson(normalizeCameraPathPayload(extractedCameraPath));
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
  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.waypoints) || parsed.waypoints.length === 0) {
    setStatus("Input JSON is invalid. Camera path requires at least one waypoint.");
    return;
  }
  const normalized = normalizeCameraPathPayload(parsed);
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
