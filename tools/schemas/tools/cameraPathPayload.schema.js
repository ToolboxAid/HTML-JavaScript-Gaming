export const CAMERA_PATH_PAYLOAD_SCHEMA = "tools.3d-camera-path.path/1";

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

function sanitizeWaypoint(rawPoint, index) {
  const point = toObject(rawPoint);
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

export function createDefaultCameraPathPayload() {
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

export function normalizeCameraPathPayload(rawPayload, options = {}) {
  const source = toObject(rawPayload);
  const fallbackPathId = typeof options.fallbackPathId === "string" && options.fallbackPathId.trim()
    ? options.fallbackPathId.trim()
    : "camera-path";
  const waypoints = Array.isArray(source.waypoints)
    ? source.waypoints.map((point, index) => sanitizeWaypoint(point, index))
    : [];
  return {
    schema: CAMERA_PATH_PAYLOAD_SCHEMA,
    pathId: typeof source.pathId === "string" && source.pathId.trim() ? source.pathId.trim() : fallbackPathId,
    waypoints: waypoints.sort((left, right) => left.t - right.t)
  };
}

export function validateCameraPathPayload(rawPayload, options = {}) {
  const source = toObject(rawPayload);
  const issues = [];
  const requireSchema = options.requireSchema !== false;
  const requireWaypoints = options.requireWaypoints === true;
  const payload = normalizeCameraPathPayload(source, options);

  if (requireSchema) {
    const schemaValue = typeof source.schema === "string" ? source.schema.trim() : "";
    if (!schemaValue) {
      issues.push(`Camera path schema is required (${CAMERA_PATH_PAYLOAD_SCHEMA}).`);
    } else if (schemaValue !== CAMERA_PATH_PAYLOAD_SCHEMA) {
      issues.push(`Camera path schema must be ${CAMERA_PATH_PAYLOAD_SCHEMA}.`);
    }
  }

  if (!Array.isArray(source.waypoints)) {
    issues.push("Camera path waypoints must be an array.");
  } else if (requireWaypoints && source.waypoints.length === 0) {
    issues.push("Camera path requires at least one waypoint.");
  }

  if (!payload.pathId) {
    issues.push("Camera path pathId is required.");
  }

  return {
    valid: issues.length === 0,
    issues,
    payload
  };
}
