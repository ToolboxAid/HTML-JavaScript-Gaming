import {
  ASTEROIDS_REQUIRED_RUNTIME_OBJECT_ROLE_IDS,
  validateAsteroidsRuntimeObjectRoles,
} from './asteroidsObjectVectorRoles.js';

const ASTEROIDS_OBJECT_VECTOR_TOOL_KEY = 'object-vector-studio-v2';
const ASTEROIDS_OBJECT_VECTOR_DOCUMENT_KEY = 'vectorMaps';

export const ASTEROIDS_OBJECT_VECTOR_IDS = Object.freeze({
  attractAsteroid: 'object.asteroids.large-asteroid',
  bullet: 'object.asteroids.bullet',
  attractShip: 'object.asteroids.ship',
  attractUfo: 'object.asteroids.large-ufo',
});

export const ASTEROIDS_REQUIRED_MANIFEST_GEOMETRY_IDS = Object.freeze([
  ASTEROIDS_OBJECT_VECTOR_IDS.attractAsteroid,
  ASTEROIDS_OBJECT_VECTOR_IDS.attractShip,
  ASTEROIDS_OBJECT_VECTOR_IDS.attractUfo,
  ASTEROIDS_OBJECT_VECTOR_IDS.bullet,
]);

export const ASTEROIDS_REQUIRED_OBJECT_VECTOR_ROLE_IDS = ASTEROIDS_REQUIRED_RUNTIME_OBJECT_ROLE_IDS;

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeString(value) {
  return String(value || '').trim();
}

function isObjectVectorId(id) {
  return normalizeString(id).startsWith('object.');
}

function normalizePoint(point) {
  return {
    x: Number(point?.x ?? 0),
    y: Number(point?.y ?? 0),
  };
}

function normalizePoints(points) {
  return Array.isArray(points)
    ? points.map(normalizePoint).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
    : [];
}

function shapeTool(shape) {
  return normalizeString(shape?.tool).toLowerCase();
}

function sortedShapes(object) {
  return Array.isArray(object?.shapes)
    ? [...object.shapes].sort((left, right) => Number(left?.order ?? 0) - Number(right?.order ?? 0))
    : [];
}

function shapeGeometryPoints(shape) {
  const tool = shapeTool(shape);
  if (tool === 'polygon' || tool === 'polyline') {
    return normalizePoints(shape?.geometry?.points);
  }
  if (tool === 'line') {
    return normalizePoints([shape?.geometry?.point1, shape?.geometry?.point2]);
  }
  return [];
}

function objectVectorGeometryPoints(object) {
  const shapes = sortedShapes(object).filter((shape) => shape?.visible !== false);
  const shape = shapes.find((candidate) => {
    const tool = shapeTool(candidate);
    return tool === 'polygon' || tool === 'polyline';
  }) || shapes.find((candidate) => shapeTool(candidate) === 'line');
  return shapeGeometryPoints(shape);
}

function requiredObjectGeometryPointCount(roleId) {
  return roleId === 'ufoLarge' || roleId === 'ufoSmall' ? 2 : 3;
}

function objectForRole(objectsByRole, roleId) {
  return objectsByRole?.[roleId] || null;
}

function logValidation(logger, level, message, details = {}) {
  if (!logger) {
    return;
  }
  if (typeof logger.log === 'function') {
    logger.log(level, message, details);
    return;
  }
  const method = level === 'FAIL' ? 'error' : (level === 'WARN' ? 'warn' : 'info');
  logger[method]?.(message, details);
}

function validateRequiredObjectGeometry(objectVectorMaps, errors) {
  const roleValidation = validateAsteroidsRuntimeObjectRoles(objectVectorMaps);
  roleValidation.errors.forEach((entry) => {
    errors.push(entry.message);
  });
  Object.entries(roleValidation.objectsByRole).forEach(([roleId, object]) => {
    const points = objectVectorGeometryPoints(object);
    const minimumPoints = requiredObjectGeometryPointCount(roleId);
    if (points.length < minimumPoints) {
      errors.push(`Asteroids Object Vector manifest role ${roleId} object ${object.id} must contain visible polygon/polyline/line geometry with at least ${minimumPoints} points.`);
    }
  });
  return roleValidation.objectsByRole;
}

export function loadAsteroidsVectorMapsFromManifest(manifest, {
  logger = null,
  sourceLabel = 'games/Asteroids/game.manifest.json',
} = {}) {
  const objectVectorPayload = manifest?.tools?.[ASTEROIDS_OBJECT_VECTOR_TOOL_KEY];
  const document = objectVectorPayload?.[ASTEROIDS_OBJECT_VECTOR_DOCUMENT_KEY];
  const errors = [];
  if (!isRecord(document)) {
    errors.push(`Asteroids Object Vector manifest is missing root.tools.${ASTEROIDS_OBJECT_VECTOR_TOOL_KEY}.${ASTEROIDS_OBJECT_VECTOR_DOCUMENT_KEY}.`);
  } else if (Object.hasOwn(document, 'objectVectorRoles')) {
    errors.push(`Asteroids Object Vector manifest must not define ${ASTEROIDS_OBJECT_VECTOR_DOCUMENT_KEY}.objectVectorRoles; runtime roles resolve from objects[].tags.`);
  }
  const sharedShapes = Array.isArray(document?.shapes)
    ? document.shapes.map((shape) => clone(shape))
    : [];
  const objectVectorMaps = Array.isArray(objectVectorPayload?.objects)
    ? objectVectorPayload.objects
      .filter((object) => isRecord(object) && normalizeString(object.id))
      .map((object) => clone(object))
    : [];
  const objectVectorMapsById = new Map(objectVectorMaps.map((object) => [object.id, object]));
  ASTEROIDS_REQUIRED_MANIFEST_GEOMETRY_IDS.forEach((id) => {
    if (!isObjectVectorId(id)) {
      errors.push(`Asteroids required manifest geometry ${id} must resolve through root.tools.${ASTEROIDS_OBJECT_VECTOR_TOOL_KEY}.objects.`);
      return;
    }
    const object = objectVectorMapsById.get(id);
    if (!object) {
      errors.push(`Asteroids Object Vector manifest map ${id} is missing from root.tools.${ASTEROIDS_OBJECT_VECTOR_TOOL_KEY}.objects.`);
      return;
    }
    if (!Array.isArray(object.shapes) || !object.shapes.length) {
      errors.push(`Asteroids Object Vector manifest map ${id} must contain at least one shape.`);
    }
  });
  const objectsByRole = validateRequiredObjectGeometry(objectVectorMaps, errors);
  if (errors.length) {
    errors.forEach((message) => logValidation(logger, 'FAIL', message, { sourceLabel }));
    return {
      errors,
      ok: false,
      vectorMaps: null,
    };
  }
  const vectorMaps = {
    document: clone(document),
    objectVectorMaps,
    objectVectorMapsById,
    objectsByRole,
    shapes: sharedShapes,
    sourceLabel,
  };
  logValidation(logger, 'OK', `Asteroids Object Vector manifest geometry loaded from ${sourceLabel}: ${objectVectorMaps.length} objects, ${sharedShapes.length} shared shapes.`, {
    objectCount: objectVectorMaps.length,
    sharedShapeCount: sharedShapes.length,
  });
  return {
    errors: [],
    ok: true,
    vectorMaps,
  };
}

export function getAsteroidsObjectVectorPoints(vectorMaps, roleId) {
  return objectVectorGeometryPoints(
    objectForRole(vectorMaps?.objectsByRole, roleId)
  );
}

export function requireAsteroidsObjectVectorPoints(vectorMaps, roleId, label = roleId, minimumPoints = requiredObjectGeometryPointCount(roleId)) {
  const points = getAsteroidsObjectVectorPoints(vectorMaps, roleId);
  if (points.length < minimumPoints) {
    throw new Error(`Asteroids required Object Vector manifest geometry ${label} (${roleId}) is missing or has fewer than ${minimumPoints} points.`);
  }
  return points;
}
