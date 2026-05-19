import {
  ASTEROID_SIZE_RUNTIME_OBJECT_KEYS,
  resolveAsteroidsTaggedObject,
} from './asteroidsObjectTags.js';

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

function createProfilesFromObjects(objects, options = {}) {
  const profiles = {};

  Object.entries(ASTEROID_SIZE_RUNTIME_OBJECT_KEYS).forEach(([size, objectKey]) => {
    const object = resolveAsteroidsTaggedObject(objects, objectKey, options);
    const points = centerPoints(extractPrimaryPolygonPoints(object));
    if (points.length < 3) {
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
