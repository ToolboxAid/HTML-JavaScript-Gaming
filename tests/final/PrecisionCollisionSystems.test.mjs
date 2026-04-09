/*
Toolbox Aid
David Quesenberry
03/22/2026
PrecisionCollisionSystems.test.mjs
*/
import assert from 'node:assert/strict';
import { transformPoints } from '/src/engine/vector/index.js';
import {
  arePolygonsColliding,
  isPointInPolygon,
  createRasterMask,
  areMasksColliding,
  runHybridCollision,
  getPolygonBounds,
} from '/src/engine/collision/index.js';

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
}
