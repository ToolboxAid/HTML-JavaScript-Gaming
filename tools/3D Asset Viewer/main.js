import { safeParseJson, toPrettyJson } from "../shared/debugInspectorData.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";

const refs = {
  inspectButton: document.getElementById("inspect3dAssetButton"),
  statusText: document.getElementById("asset3dStatus"),
  input: document.getElementById("asset3dInput"),
  output: document.getElementById("asset3dOutput")
};

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
  return {
    schema: "tools.3d-asset-viewer.asset/1",
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

function inspectAssetPayload() {
  if (!(refs.input instanceof HTMLTextAreaElement)) {
    return;
  }
  const parsed = safeParseJson(refs.input.value);
  if (!parsed || typeof parsed !== "object") {
    setStatus("Input JSON is invalid. Provide an asset object.");
    return;
  }

  const vertices = Array.isArray(parsed.vertices) ? parsed.vertices : [];
  const bounds = computeBounds(vertices);
  const report = {
    schema: "tools.3d-asset-viewer.report/1",
    assetId: typeof parsed.assetId === "string" && parsed.assetId.trim() ? parsed.assetId.trim() : "asset-3d",
    vertexCount: vertices.length,
    bounds,
    metadata: parsed.metadata && typeof parsed.metadata === "object" ? { ...parsed.metadata } : {}
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
