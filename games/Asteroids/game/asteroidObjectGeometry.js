import {
  ASTEROIDS_ASTEROID_SIZE_OBJECT_IDS,
} from './asteroidsObjectGeometryManifest.js';

const ASTEROID_SIZE_LABELS = Object.freeze({
  1: 'SML',
  2: 'MED',
  3: 'LRG',
});

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function toSafeNumber(value, fallback = 0) {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) || Math.abs(numberValue) === Infinity ? fallback : numberValue;
}

function cleanPoint(point) {
  return {
    x: toSafeNumber(point?.x, 0),
    y: toSafeNumber(point?.y, 0),
  };
}

function centerPoints(points) {
  if (!points.length) {
    return [];
  }
  const xs = points.map(({ x }) => x);
  const ys = points.map(({ y }) => y);
  const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
  const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;
  return points.map(({ x, y }) => ({
    x: x - centerX,
    y: y - centerY,
  }));
}

function maxRadius(points) {
  if (!points.length) {
    return 0;
  }
  return Math.max(...points.map(({ x, y }) => Math.sqrt(x * x + y * y)));
}

function sortedShapes(object) {
  return [...asArray(object?.shapes)].sort((left, right) => (
    toSafeNumber(left?.order, 0) - toSafeNumber(right?.order, 0)
  ));
}

function extractPrimaryPolygonPoints(object) {
  const shape = sortedShapes(object).find((candidate) => (
    candidate?.visible !== false
    && candidate?.tool === 'polygon'
    && asArray(candidate?.geometry?.points).length >= 3
  ));
  return asArray(shape?.geometry?.points).map(cleanPoint);
}

function logProfileFailure(logger, message, details = {}) {
  if (!logger) {
    return;
  }
  if (typeof logger.log === 'function') {
    logger.log('FAIL', message, details);
    return;
  }
  logger.error?.(message, details);
}

function createProfilesFromObjects(objects, options = {}) {
  const profiles = {};
  const objectsById = new Map(asArray(objects).map((object) => [object?.id, object]).filter(([id]) => id));

  Object.entries(ASTEROIDS_ASTEROID_SIZE_OBJECT_IDS).forEach(([size, objectId]) => {
    const object = objectsById.get(objectId);
    if (!object) {
      logProfileFailure(options.logger, `Asteroids asteroid geometry profile ${objectId} is missing from Object Vector manifest objects.`, {
        objectId,
        size,
      });
      return;
    }
    const points = centerPoints(extractPrimaryPolygonPoints(object));
    if (points.length < 3) {
      logProfileFailure(options.logger, `Asteroids asteroid geometry profile ${objectId} must contain visible polygon geometry with at least 3 points.`, {
        objectId,
        size,
      });
      return;
    }
    const sizeId = Number(size);
    profiles[sizeId] = {
      id: sizeId,
      label: ASTEROID_SIZE_LABELS[sizeId] || String(sizeId),
      objectId: object.id,
      points,
      radius: maxRadius(points),
    };
  });

  return profiles;
}

export function createAsteroidGeometryProfilesFromObjectVectorPayload(payload, options = {}) {
  return createProfilesFromObjects(payload?.objects, options);
}

export function createAsteroidGeometryProfilesFromObjectVectorAssets(assetSet, options = {}) {
  if (assetSet?.objectsById instanceof Map) {
    return createProfilesFromObjects([...assetSet.objectsById.values()], options);
  }
  return createAsteroidGeometryProfilesFromObjectVectorPayload(assetSet?.payload, options);
}
