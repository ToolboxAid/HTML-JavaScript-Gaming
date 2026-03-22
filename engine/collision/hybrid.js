/*
Toolbox Aid
David Quesenberry
03/22/2026
hybrid.js
*/
import { isColliding } from './aabb.js';
import { arePolygonsColliding, getPolygonBounds } from './polygon.js';
import { areMasksColliding } from './raster.js';

export function runHybridCollision({
  boundsA,
  boundsB,
  polygonA = null,
  polygonB = null,
  maskA = null,
  maskB = null,
  maskAX = 0,
  maskAY = 0,
  maskBX = 0,
  maskBY = 0,
} = {}) {
  const result = {
    bounds: false,
    shape: false,
    pixel: false,
    collided: false,
  };

  result.bounds = isColliding(boundsA, boundsB);
  if (!result.bounds) {
    return result;
  }

  result.shape = polygonA && polygonB
    ? arePolygonsColliding(polygonA, polygonB)
    : true;
  if (!result.shape) {
    return result;
  }

  result.pixel = maskA && maskB
    ? areMasksColliding(maskA, maskAX, maskAY, maskB, maskBX, maskBY)
    : true;
  result.collided = result.bounds && result.shape && result.pixel;
  return result;
}

export function getCollisionBoundsFromPolygon(points) {
  return getPolygonBounds(points);
}
