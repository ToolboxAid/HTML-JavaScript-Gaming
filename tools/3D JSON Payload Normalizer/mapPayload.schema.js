export const MAP_PAYLOAD_SCHEMA = "tools.3d-json-payload-normalizer.document/1";

function sanitizeNumber(value, fallback = 0) {
  const numeric = Number(value);
  if (Number.isNaN(numeric) || numeric === Infinity || numeric === -Infinity) {
    return fallback;
  }
  return numeric;
}

function toObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizePoint(rawPoint, index) {
  const point = toObject(rawPoint);
  return {
    id: typeof point.id === "string" && point.id.trim() ? point.id.trim() : `p${index + 1}`,
    x: sanitizeNumber(point.x),
    y: sanitizeNumber(point.y),
    z: sanitizeNumber(point.z)
  };
}

function normalizeSegment(rawSegment, fallbackStart, fallbackEnd) {
  const segment = toObject(rawSegment);
  return {
    from: typeof segment.from === "string" && segment.from.trim() ? segment.from.trim() : fallbackStart,
    to: typeof segment.to === "string" && segment.to.trim() ? segment.to.trim() : fallbackEnd
  };
}

export function createDefaultMapPayload() {
  return {
    schema: MAP_PAYLOAD_SCHEMA,
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

export function normalizeMapPayload(rawPayload, options = {}) {
  const source = toObject(rawPayload);
  const fallbackMapId = typeof options.fallbackMapId === "string" && options.fallbackMapId.trim()
    ? options.fallbackMapId.trim()
    : "map-3d-baseline";
  const points = Array.isArray(source.points)
    ? source.points.map((point, index) => normalizePoint(point, index))
    : [];
  const pointIds = points.map((point) => point.id);
  const segments = Array.isArray(source.segments)
    ? source.segments.map((segment, index) => {
      const fallbackStart = pointIds[index] || pointIds[0] || "p1";
      const fallbackEnd = pointIds[index + 1] || pointIds[0] || fallbackStart;
      return normalizeSegment(segment, fallbackStart, fallbackEnd);
    })
    : [];
  return {
    schema: MAP_PAYLOAD_SCHEMA,
    mapId: typeof source.mapId === "string" && source.mapId.trim() ? source.mapId.trim() : fallbackMapId,
    points,
    segments
  };
}

export function validateMapPayload(rawPayload, options = {}) {
  const source = toObject(rawPayload);
  const issues = [];
  const requireSchema = options.requireSchema !== false;
  const requirePoints = options.requirePoints === true;
  const payload = normalizeMapPayload(source, options);

  if (requireSchema) {
    const schemaValue = typeof source.schema === "string" ? source.schema.trim() : "";
    if (!schemaValue) {
      issues.push(`Map payload schema is required (${MAP_PAYLOAD_SCHEMA}).`);
    } else if (schemaValue !== MAP_PAYLOAD_SCHEMA) {
      issues.push(`Map payload schema must be ${MAP_PAYLOAD_SCHEMA}.`);
    }
  }

  if (!Array.isArray(source.points)) {
    issues.push("Map payload points must be an array.");
  } else if (requirePoints && source.points.length === 0) {
    issues.push("Map payload requires at least one point.");
  }

  if (!Array.isArray(source.segments)) {
    issues.push("Map payload segments must be an array.");
  }

  if (!payload.mapId) {
    issues.push("Map payload mapId is required.");
  }

  return {
    valid: issues.length === 0,
    issues,
    payload
  };
}
