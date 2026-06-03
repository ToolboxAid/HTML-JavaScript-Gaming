import { getObjectVectorCollisionOutlinePoints } from '/src/engine/collision/objectVector.js';
import { isRecord } from '/src/shared/object/objects.js';
import { deepClone } from '/src/shared/json/clone.js';

const ASTEROIDS_OBJECT_VECTOR_TOOL_KEY = 'object-vector-studio-v2';
const OBJECT_VECTOR_PAYLOAD_KEYS = new Set(['version', 'toolId', 'name', 'objects']);

export const ASTEROIDS_OBJECT_GEOMETRY_IDS = Object.freeze({
  asteroidLarge: 'object.asteroids.large-asteroid',
  asteroidMedium: 'object.asteroids.medium-asteroid',
  asteroidSmall: 'object.asteroids.small-asteroid',
  bullet: 'object.asteroids.bullet',
  ship: 'object.asteroids.ship',
  ufoLarge: 'object.asteroids.large-ufo',
  ufoSmall: 'object.asteroids.small-ufo',
});

export const ASTEROIDS_REQUIRED_MANIFEST_GEOMETRY_IDS = Object.freeze([
  ASTEROIDS_OBJECT_GEOMETRY_IDS.asteroidLarge,
  ASTEROIDS_OBJECT_GEOMETRY_IDS.asteroidMedium,
  ASTEROIDS_OBJECT_GEOMETRY_IDS.asteroidSmall,
  ASTEROIDS_OBJECT_GEOMETRY_IDS.bullet,
  ASTEROIDS_OBJECT_GEOMETRY_IDS.ship,
  ASTEROIDS_OBJECT_GEOMETRY_IDS.ufoLarge,
  ASTEROIDS_OBJECT_GEOMETRY_IDS.ufoSmall,
]);

export const ASTEROIDS_ASTEROID_SIZE_OBJECT_IDS = Object.freeze({
  1: ASTEROIDS_OBJECT_GEOMETRY_IDS.asteroidSmall,
  2: ASTEROIDS_OBJECT_GEOMETRY_IDS.asteroidMedium,
  3: ASTEROIDS_OBJECT_GEOMETRY_IDS.asteroidLarge,
});

export const ASTEROIDS_UFO_TYPE_OBJECT_IDS = Object.freeze({
  large: ASTEROIDS_OBJECT_GEOMETRY_IDS.ufoLarge,
  small: ASTEROIDS_OBJECT_GEOMETRY_IDS.ufoSmall,
});

function normalizeString(value) {
  return String(value || '').trim();
}

function isObjectVectorId(id) {
  return normalizeString(id).startsWith('object.');
}

function oldObjectSignal(object) {
  const text = [
    object?.id,
    object?.name,
    ...(Array.isArray(object?.tags) ? object.tags : []),
  ].map((value) => normalizeString(value).toLowerCase()).join(' ');
  return /(^|[.\s_-])(old|legacy|deprecated|archive|archived|renamed|stale)($|[.\s_-])/.test(text);
}

function objectVectorGeometryPoints(object) {
  return getObjectVectorCollisionOutlinePoints(object);
}

function requiredObjectGeometryPointCount(objectId) {
  return objectId === ASTEROIDS_OBJECT_GEOMETRY_IDS.ufoLarge
    || objectId === ASTEROIDS_OBJECT_GEOMETRY_IDS.ufoSmall
    ? 2
    : 3;
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

function validateRequiredObjectGeometry(objectsById, errors) {
  ASTEROIDS_REQUIRED_MANIFEST_GEOMETRY_IDS.forEach((objectId) => {
    const object = objectsById.get(objectId);
    if (!object) {
      return;
    }
    if (oldObjectSignal(object)) {
      errors.push(`Asteroids Object Vector manifest object ${objectId} is marked old/legacy/deprecated and cannot be used as active runtime geometry.`);
      return;
    }
    const points = objectVectorGeometryPoints(object);
    const minimumPoints = requiredObjectGeometryPointCount(objectId);
    if (points.length < minimumPoints) {
      errors.push(`Asteroids Object Vector manifest object ${objectId} must contain visible polygon/polyline/line geometry with at least ${minimumPoints} points.`);
    }
  });
}

export function loadAsteroidsObjectGeometryFromManifest(manifest, {
  logger = null,
  sourceLabel = 'old_games/Asteroids/game.manifest.json',
} = {}) {
  const objectVectorPayload = manifest?.tools?.[ASTEROIDS_OBJECT_VECTOR_TOOL_KEY];
  const errors = [];
  if (!isRecord(objectVectorPayload)) {
    errors.push(`Asteroids Object Vector manifest is missing root.tools.${ASTEROIDS_OBJECT_VECTOR_TOOL_KEY}.`);
  } else {
    Object.keys(objectVectorPayload)
      .filter((key) => !OBJECT_VECTOR_PAYLOAD_KEYS.has(key))
      .forEach((key) => {
        errors.push(`Asteroids Object Vector manifest must not define root.tools.${ASTEROIDS_OBJECT_VECTOR_TOOL_KEY}.${key}; object geometry resolves from objects[].id and objects[].shapes.`);
      });
  }
  const objects = Array.isArray(objectVectorPayload?.objects)
    ? objectVectorPayload.objects
      .filter((object) => isRecord(object) && normalizeString(object.id))
      .map((object) => deepClone(object))
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
  validateRequiredObjectGeometry(objectsById, errors);
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
    payload: deepClone(objectVectorPayload),
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

export function validateAsteroidsRuntimeObjectIds(objectsById, {
  logger = null,
  sourceLabel = 'Asteroids Object Vector runtime assets',
} = {}) {
  const errors = [];
  const objectMap = objectsById instanceof Map ? objectsById : new Map();
  ASTEROIDS_REQUIRED_MANIFEST_GEOMETRY_IDS.forEach((objectId) => {
    const object = objectMap.get(objectId);
    if (!object) {
      const message = `Asteroids Object Vector runtime object ${objectId} is missing from ${sourceLabel}.`;
      errors.push({ details: { objectId, sourceLabel }, level: 'FAIL', message });
      logValidation(logger, 'FAIL', message, { objectId, sourceLabel });
      return;
    }
    if (oldObjectSignal(object)) {
      const message = `Asteroids Object Vector runtime object ${objectId} is marked old/legacy/deprecated and cannot be used as active runtime geometry.`;
      errors.push({ details: { objectId, sourceLabel }, level: 'FAIL', message });
      logValidation(logger, 'FAIL', message, { objectId, sourceLabel });
      return;
    }
    if (!Array.isArray(object.shapes) || !object.shapes.length) {
      const message = `Asteroids Object Vector runtime object ${objectId} must contain at least one shape.`;
      errors.push({ details: { objectId, sourceLabel }, level: 'FAIL', message });
      logValidation(logger, 'FAIL', message, { objectId, sourceLabel });
    }
  });
  return {
    errors,
    objectIds: ASTEROIDS_REQUIRED_MANIFEST_GEOMETRY_IDS.filter((objectId) => objectMap.has(objectId)),
    ok: errors.length === 0,
    warnings: [],
  };
}

export function getAsteroidsObjectGeometryPoints(objectGeometry, objectId) {
  return objectVectorGeometryPoints(objectGeometry?.objectsById?.get(objectId));
}

export function requireAsteroidsObjectGeometryPoints(objectGeometry, objectId, label = objectId, minimumPoints = requiredObjectGeometryPointCount(objectId)) {
  const points = getAsteroidsObjectGeometryPoints(objectGeometry, objectId);
  if (points.length < minimumPoints) {
    throw new Error(`Asteroids required Object Vector manifest geometry ${label} (${objectId}) is missing or has fewer than ${minimumPoints} points.`);
  }
  return points;
}
