import {
  ASTEROIDS_ASTEROID_SIZE_OBJECT_IDS,
} from './asteroidsObjectGeometryManifest.js';
import { getObjectVectorCollisionOutlinePoints } from '/src/engine/collision/index.js';
import { asArray } from '/src/shared/arrays.js';
import { centerPoints, maxRadius } from '/src/shared/geometry.js';

const ASTEROID_SIZE_LABELS = Object.freeze({
  1: 'SML',
  2: 'MED',
  3: 'LRG',
});

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
    const points = centerPoints(getObjectVectorCollisionOutlinePoints(object));
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
