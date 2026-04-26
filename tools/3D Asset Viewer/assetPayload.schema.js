export const ASSET_VIEWER_PAYLOAD_SCHEMA = "tools.3d-asset-viewer.asset/1";
export const ASSET_VIEWER_REPORT_SCHEMA = "tools.3d-asset-viewer.report/1";

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

function normalizeVertex(rawVertex) {
  const vertex = toObject(rawVertex);
  return {
    x: sanitizeNumber(vertex.x),
    y: sanitizeNumber(vertex.y),
    z: sanitizeNumber(vertex.z)
  };
}

export function createDefaultAssetPayload() {
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

export function normalizeAssetPayload(rawPayload, options = {}) {
  const source = toObject(rawPayload);
  const fallbackAssetId = typeof options.fallbackAssetId === "string" && options.fallbackAssetId.trim()
    ? options.fallbackAssetId.trim()
    : "asset-3d";
  const vertices = Array.isArray(source.vertices)
    ? source.vertices.map((vertex) => normalizeVertex(vertex))
    : [];
  return {
    schema: ASSET_VIEWER_PAYLOAD_SCHEMA,
    assetId: typeof source.assetId === "string" && source.assetId.trim() ? source.assetId.trim() : fallbackAssetId,
    vertices,
    metadata: source.metadata && typeof source.metadata === "object" ? { ...source.metadata } : {}
  };
}

export function validateAssetPayload(rawPayload, options = {}) {
  const source = toObject(rawPayload);
  const issues = [];
  const requireSchema = options.requireSchema !== false;
  const requireVertices = options.requireVertices === true;
  const payload = normalizeAssetPayload(source, options);

  if (requireSchema) {
    const schemaValue = typeof source.schema === "string" ? source.schema.trim() : "";
    if (!schemaValue) {
      issues.push(`3D asset schema is required (${ASSET_VIEWER_PAYLOAD_SCHEMA}).`);
    } else if (schemaValue !== ASSET_VIEWER_PAYLOAD_SCHEMA) {
      issues.push(`3D asset schema must be ${ASSET_VIEWER_PAYLOAD_SCHEMA}.`);
    }
  }

  if (!Array.isArray(source.vertices)) {
    issues.push("3D asset vertices must be an array.");
  } else if (requireVertices && source.vertices.length === 0) {
    issues.push("3D asset payload requires at least one vertex.");
  }

  if (!payload.assetId) {
    issues.push("3D asset assetId is required.");
  }

  return {
    valid: issues.length === 0,
    issues,
    payload
  };
}
