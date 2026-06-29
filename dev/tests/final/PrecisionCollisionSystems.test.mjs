/*
Toolbox Aid
David Quesenberry
03/22/2026
PrecisionCollisionSystems.test.mjs
*/
import assert from 'node:assert/strict';
import { transformPoints } from '../../../www/src/engine/rendering/VectorDrawing.js';
import { arePolygonsColliding, isPointInPolygon, getPolygonBounds } from '../../../www/src/engine/collision/polygon.js';
import { createRasterMask, areMasksColliding } from '../../../www/src/engine/collision/raster.js';
import { evaluateObjectVectorCollisionPair, getObjectVectorCollisionOutlinePoints, transformCollisionPoints } from '../../../www/src/engine/collision/objectVector.js';
import { runHybridCollision } from '../../../www/src/engine/collision/hybrid.js';

export function run() {
  const transformed = transformPoints(
    [{ x: 0, y: -10 }, { x: 10, y: 10 }, { x: -10, y: 10 }],
    { x: 100, y: 100, rotation: Math.PI / 2, scale: 2 },
  );
  assert.equal(transformed.length, 3);

  const polyA = [{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 10, y: 20 }];
  const polyB = [{ x: 8, y: 4 }, { x: 28, y: 4 }, { x: 18, y: 24 }];
  const polyC = [{ x: 50, y: 50 }, { x: 70, y: 50 }, { x: 60, y: 70 }];
  assert.equal(arePolygonsColliding(polyA, polyB), true);
  assert.equal(arePolygonsColliding(polyA, polyC), false);
  assert.equal(isPointInPolygon({ x: 10, y: 10 }, polyA), true);
  assert.equal(isPointInPolygon({ x: 30, y: 10 }, polyA), false);

  const concaveVectorPolygon = [
    { x: 0, y: 0 },
    { x: 40, y: 0 },
    { x: 40, y: 40 },
    { x: 25, y: 40 },
    { x: 25, y: 15 },
    { x: 15, y: 15 },
    { x: 15, y: 40 },
    { x: 0, y: 40 },
  ];
  const concaveEdgeOverlap = [
    { x: 13, y: 22 },
    { x: 17, y: 22 },
    { x: 17, y: 28 },
    { x: 13, y: 28 },
  ];
  const concaveNotchMiss = [
    { x: 17, y: 22 },
    { x: 23, y: 22 },
    { x: 23, y: 28 },
    { x: 17, y: 28 },
  ];
  const concaveContainedOverlap = [
    { x: 18, y: 5 },
    { x: 22, y: 5 },
    { x: 22, y: 10 },
    { x: 18, y: 10 },
  ];
  assert.equal(arePolygonsColliding(concaveVectorPolygon, concaveEdgeOverlap), true);
  assert.equal(arePolygonsColliding(concaveVectorPolygon, concaveNotchMiss), false);
  assert.equal(arePolygonsColliding(concaveVectorPolygon, concaveContainedOverlap), true);
  assert.equal(isPointInPolygon({ x: 15, y: 22 }, concaveVectorPolygon), true);
  assert.equal(isPointInPolygon({ x: 20, y: 22 }, concaveVectorPolygon), false);

  const maskA = createRasterMask([
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
  ]);
  const maskB = createRasterMask([
    [1, 0, 0],
    [1, 1, 0],
    [0, 0, 0],
  ]);
  assert.equal(areMasksColliding(maskA, 10, 10, maskB, 11, 10), true);
  assert.equal(areMasksColliding(maskA, 10, 10, maskB, 20, 20), false);

  const hybridHit = runHybridCollision({
    boundsA: getPolygonBounds(polyA),
    boundsB: getPolygonBounds(polyB),
    polygonA: polyA,
    polygonB: polyB,
    maskA,
    maskB,
    maskAX: 10,
    maskAY: 10,
    maskBX: 11,
    maskBY: 10,
  });
  assert.equal(hybridHit.collided, true);

  const hybridMiss = runHybridCollision({
    boundsA: getPolygonBounds(polyA),
    boundsB: getPolygonBounds(polyC),
    polygonA: polyA,
    polygonB: polyC,
  });
  assert.equal(hybridMiss.collided, false);

  const objectA = {
    id: 'object.test.ship',
    name: 'Ship',
    objectOrigin: { x: 0, y: 0 },
    shapes: [{
      geometry: { points: polyA },
      order: 0,
      tool: 'polygon',
      transform: { rotation: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 },
      visible: true,
    }],
    states: [{ id: 'active', name: 'Active', frames: [{ id: 'frame-1', order: 0, durationFrames: 1, shapeOverrides: [] }] }],
  };
  const objectB = {
    id: 'object.test.asteroid',
    name: 'Asteroid',
    objectOrigin: { x: 0, y: 0 },
    shapes: [{
      geometry: { points: polyB },
      order: 0,
      tool: 'polygon',
      transform: { rotation: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 },
      visible: true,
    }],
    states: [{ id: 'active', name: 'Active', frames: [{ id: 'frame-1', order: 0, durationFrames: 1, shapeOverrides: [] }] }],
  };
  const objectVectorHit = evaluateObjectVectorCollisionPair({
    instanceA: { x: 0, y: 0, rotation: 0 },
    instanceB: { x: 0, y: 0, rotation: 0 },
    mode: 'auto',
    objectA,
    objectB,
  });
  assert.equal(objectVectorHit.mode, 'vector');
  assert.equal(objectVectorHit.collided, true);
  assert.equal(objectVectorHit.enginePath, 'www/src/engine/collision/objectVector.js');
  assert.equal(getObjectVectorCollisionOutlinePoints(objectA).length, polyA.length);
  const collisionTransform = transformCollisionPoints([{ x: 10, y: 0 }], { x: 4, y: 5, rotation: Math.PI / 2 });
  assert.equal(Math.abs(collisionTransform[0].x - 4) < 1e-9, true);
  assert.equal(Math.abs(collisionTransform[0].y - 15) < 1e-9, true);
}
