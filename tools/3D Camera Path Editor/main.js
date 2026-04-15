import { safeParseJson, toPrettyJson } from "../shared/debugInspectorData.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";

const refs = {
  addButton: document.getElementById("addCameraPointButton"),
  normalizeButton: document.getElementById("normalizeCameraPathButton"),
  statusText: document.getElementById("cameraPathStatus"),
  input: document.getElementById("cameraPathInput"),
  output: document.getElementById("cameraPathOutput")
};

function setStatus(message) {
  if (refs.statusText instanceof HTMLElement) {
    refs.statusText.textContent = message;
  }
}

function sanitizeNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeWaypoint(rawPoint, index) {
  const point = rawPoint && typeof rawPoint === "object" ? rawPoint : {};
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
}

function parseInputPayload() {
  if (!(refs.input instanceof HTMLTextAreaElement)) {
    return null;
  }
  const parsed = safeParseJson(refs.input.value);
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  return parsed;
}

function buildDefaultPayload() {
  return {
    schema: "tools.3d-camera-path.path/1",
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

function normalizeCameraPath() {
  const parsed = parseInputPayload();
  if (!parsed) {
    setStatus("Input JSON is invalid. Provide a camera path object.");
    return;
  }
  const waypoints = Array.isArray(parsed.waypoints)
    ? parsed.waypoints.map((point, index) => normalizeWaypoint(point, index))
    : [];
  const normalized = {
    schema: "tools.3d-camera-path.path/1",
    pathId: typeof parsed.pathId === "string" && parsed.pathId.trim() ? parsed.pathId.trim() : "camera-path",
    waypoints: waypoints.sort((left, right) => left.t - right.t)
  };
  if (refs.output instanceof HTMLElement) {
    refs.output.textContent = toPrettyJson(normalized);
  }
  setStatus(`Path normalized. waypoints=${normalized.waypoints.length}.`);
}

function addWaypoint() {
  const parsed = parseInputPayload() || buildDefaultPayload();
  const waypoints = Array.isArray(parsed.waypoints) ? parsed.waypoints.slice() : [];
  const lastTime = waypoints.length > 0 ? sanitizeNumber(waypoints[waypoints.length - 1]?.t, 0) : 0;
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
