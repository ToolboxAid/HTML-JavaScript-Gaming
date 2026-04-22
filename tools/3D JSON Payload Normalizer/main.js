import { safeParseJson, toPrettyJson } from "../shared/debugInspectorData.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";

const refs = {
  normalizeButton: document.getElementById("normalize3dMapButton"),
  howToUseButton: document.getElementById("openHowToUse3dMapButton"),
  statusText: document.getElementById("map3dStatus"),
  input: document.getElementById("map3dInput"),
  output: document.getElementById("map3dOutput")
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

function normalizePoint(rawPoint, index) {
  const point = rawPoint && typeof rawPoint === "object" ? rawPoint : {};
  return {
    id: typeof point.id === "string" && point.id.trim() ? point.id.trim() : `p${index + 1}`,
    x: sanitizeNumber(point.x),
    y: sanitizeNumber(point.y),
    z: sanitizeNumber(point.z)
  };
}

function normalizeSegment(rawSegment, fallbackStart, fallbackEnd) {
  const segment = rawSegment && typeof rawSegment === "object" ? rawSegment : {};
  return {
    from: typeof segment.from === "string" && segment.from.trim() ? segment.from.trim() : fallbackStart,
    to: typeof segment.to === "string" && segment.to.trim() ? segment.to.trim() : fallbackEnd
  };
}

function buildDefaultPayload() {
  return {
    schema: "tools.3d-json-payload-normalizer.document/1",
    mapId: "map-3d-baseline",
    points: [
      { id: "p1", x: -10, y: 0, z: 5 },
      { id: "p2", x: 10, y: 0, z: 5 },
      { id: "p3", x: 0, y: 0, z: -8 }
    ],
    segments: [
      { from: "p1", to: "p2" },
      { from: "p2", to: "p3" }
    ]
  };
}

function normalizeMapPayload() {
  if (!(refs.input instanceof HTMLTextAreaElement)) {
    return;
  }

  const parsed = safeParseJson(refs.input.value);
  if (!parsed || typeof parsed !== "object") {
    setStatus("Input JSON is invalid. Provide a payload object.");
    return;
  }

  const points = Array.isArray(parsed.points)
    ? parsed.points.map((point, index) => normalizePoint(point, index))
    : [];

  const pointIds = points.map((point) => point.id);
  const segments = Array.isArray(parsed.segments)
    ? parsed.segments.map((segment, index) => {
      const fallbackStart = pointIds[index] || pointIds[0] || "p1";
      const fallbackEnd = pointIds[index + 1] || pointIds[0] || fallbackStart;
      return normalizeSegment(segment, fallbackStart, fallbackEnd);
    })
    : [];

  const normalized = {
    schema: "tools.3d-json-payload-normalizer.document/1",
    mapId: typeof parsed.mapId === "string" && parsed.mapId.trim() ? parsed.mapId.trim() : "map-3d-baseline",
    points,
    segments
  };

  if (refs.output instanceof HTMLElement) {
    refs.output.textContent = toPrettyJson(normalized);
  }
  setStatus(`Payload normalized. points=${points.length}, segments=${segments.length}.`);
}

function boot3dMapEditor() {
  if (refs.normalizeButton instanceof HTMLButtonElement) {
    refs.normalizeButton.addEventListener("click", normalizeMapPayload);
  }
  if (refs.howToUseButton instanceof HTMLButtonElement) {
    refs.howToUseButton.addEventListener("click", () => {
      window.location.href = "./how_to_use.html";
    });
  }
  if (refs.input instanceof HTMLTextAreaElement && !refs.input.value.trim()) {
    refs.input.value = toPrettyJson(buildDefaultPayload());
  }
  return {
    normalize: normalizeMapPayload
  };
}

registerToolBootContract("3d-json-payload-normalizer", {
  init: boot3dMapEditor,
  destroy() {
    return true;
  },
  getApi() {
    return {
      normalize: normalizeMapPayload
    };
  }
});

boot3dMapEditor();
