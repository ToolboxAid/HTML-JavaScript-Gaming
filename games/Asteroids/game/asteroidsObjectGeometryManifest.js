import {
  validateAsteroidsRuntimeObjectTags,
} from './asteroidsObjectTags.js';

const ASTEROIDS_OBJECT_VECTOR_TOOL_KEY = 'object-vector-studio-v2';
const OBJECT_VECTOR_PAYLOAD_KEYS = new Set(['version', 'toolId', 'name', 'objects']);

export const ASTEROIDS_OBJECT_GEOMETRY_IDS = Object.freeze({
  asteroidLarge: 'object.asteroids.large-asteroid',
  asteroidMedium: 'object.asteroids.medium-asteroid',
  asteroidSmall: 'object.asteroids.small-asteroid',
  bullet: 'object.asteroids.bullet',
  attractShip: 'object.asteroids.ship',
  attractUfo: 'object.asteroids.large-ufo',
});

export const ASTEROIDS_REQUIRED_MANIFEST_GEOMETRY_IDS = Object.freeze([
  ASTEROIDS_OBJECT_GEOMETRY_IDS.asteroidLarge,
  ASTEROIDS_OBJECT_GEOMETRY_IDS.asteroidMedium,
  ASTEROIDS_OBJECT_GEOMETRY_IDS.asteroidSmall,
  ASTEROIDS_OBJECT_GEOMETRY_IDS.attractShip,
  ASTEROIDS_OBJECT_GEOMETRY_IDS.attractUfo,
  ASTEROIDS_OBJECT_GEOMETRY_IDS.bullet,
]);

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

function requiredObjectGeometryPointCount(objectKey) {
  return objectKey === 'ufoLarge' || objectKey === 'ufoSmall' ? 2 : 3;
}

function objectForKey(objectsByKey, objectKey) {
  return objectsByKey?.[objectKey] || null;
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

function validateRequiredObjectGeometry(objects, errors) {
  const tagValidation = validateAsteroidsRuntimeObjectTags(objects);
  tagValidation.errors.forEach((entry) => {
    errors.push(entry.message);
  });
  Object.entries(tagValidation.objectsByKey).forEach(([objectKey, object]) => {
    const points = objectVectorGeometryPoints(object);
    const minimumPoints = requiredObjectGeometryPointCount(objectKey);
    if (points.length < minimumPoints) {
      errors.push(`Asteroids Object Vector manifest object ${objectKey} (${object.id}) must contain visible polygon/polyline/line geometry with at least ${minimumPoints} points.`);
    }
  });
  return tagValidation.objectsByKey;
}

export function loadAsteroidsObjectGeometryFromManifest(manifest, {
  logger = null,
  sourceLabel = 'games/Asteroids/game.manifest.json',
} = {}) {
  const objectVectorPayload = manifest?.tools?.[ASTEROIDS_OBJECT_VECTOR_TOOL_KEY];
  const errors = [];
  if (!isRecord(objectVectorPayload)) {
    errors.push(`Asteroids Object Vector manifest is missing root.tools.${ASTEROIDS_OBJECT_VECTOR_TOOL_KEY}.`);
  } else {
    Object.keys(objectVectorPayload)
      .filter((key) => !OBJECT_VECTOR_PAYLOAD_KEYS.has(key))
      .forEach((key) => {
        errors.push(`Asteroids Object Vector manifest must not define root.tools.${ASTEROIDS_OBJECT_VECTOR_TOOL_KEY}.${key}; object geometry resolves from objects[].tags and objects[].shapes.`);
      });
  }
  const objects = Array.isArray(objectVectorPayload?.objects)
    ? objectVectorPayload.objects
      .filter((object) => isRecord(object) && normalizeString(object.id))
      .map((object) => clone(object))
    : [];
  const objectsById = new Map(objects.map((object) => [object.id, object]));
  ASTEROIDS_REQUIRED_MANIFEST_GEOMETRY_IDS.forEach((id) => {
    if (!isObjectVectorId(id)) {
      errors.push(`Asteroids required manifest geometry ${id} must resolve through root.tools.${ASTEROIDS_OBJECT_VECTOR_TOOL_KEY}.objects.`);
      return;
    }
    const object = objectsById.get(id);
    if (!object) {
      errors.push(`Asteroids Object Vector manifest object ${id} is missing from root.tools.${ASTEROIDS_OBJECT_VECTOR_TOOL_KEY}.objects.`);
      return;
    }
    if (!Array.isArray(object.shapes) || !object.shapes.length) {
      errors.push(`Asteroids Object Vector manifest object ${id} must contain at least one shape.`);
    }
  });
  const objectsByKey = validateRequiredObjectGeometry(objects, errors);
  if (errors.length) {
    errors.forEach((message) => logValidation(logger, 'FAIL', message, { sourceLabel }));
    return {
      errors,
      objectGeometry: null,
      ok: false,
    };
  }
  const objectGeometry = {
    objects,
    objectsById,
    objectsByKey,
    payload: clone(objectVectorPayload),
    sourceLabel,
  };
  logValidation(logger, 'OK', `Asteroids Object Vector manifest geometry loaded from ${sourceLabel}: ${objects.length} objects.`, {
    objectCount: objects.length,
  });
  return {
    errors: [],
    objectGeometry,
    ok: true,
  };
}

export function getAsteroidsObjectGeometryPoints(objectGeometry, objectKey) {
  return objectVectorGeometryPoints(
    objectForKey(objectGeometry?.objectsByKey, objectKey)
  );
}

export function requireAsteroidsObjectGeometryPoints(objectGeometry, objectKey, label = objectKey, minimumPoints = requiredObjectGeometryPointCount(objectKey)) {
  const points = getAsteroidsObjectGeometryPoints(objectGeometry, objectKey);
  if (points.length < minimumPoints) {
    throw new Error(`Asteroids required Object Vector manifest geometry ${label} (${objectKey}) is missing or has fewer than ${minimumPoints} points.`);
  }
  return points;
}
