/*
Toolbox Aid
David Quesenberry
06/26/2026
GeometryFoundation.test.mjs
*/
import assert from "node:assert/strict";
import {
  addVectors,
  boundsFromPoints,
  clamp,
  containsPoint,
  distance,
  rectangle,
  rectangleIntersection,
  rectanglesIntersect,
  scaleVector,
  subtractVectors,
  vector2,
} from "../../../www/src/shared/geometry/geometry.js";

export function run() {
  assert.equal(clamp(12, 0, 10), 10);
  assert.equal(clamp(-2, 0, 10), 0);
  assert.equal(clamp(4, 10, 0), 4);

  assert.deepEqual(vector2("2", 3), { x: 2, y: 3 });
  assert.deepEqual(addVectors({ x: 1, y: 2 }, { x: 3, y: 4 }), { x: 4, y: 6 });
  assert.deepEqual(subtractVectors({ x: 5, y: 6 }, { x: 2, y: 3 }), { x: 3, y: 3 });
  assert.deepEqual(scaleVector({ x: 2, y: -3 }, 4), { x: 8, y: -12 });
  assert.equal(distance({ x: 0, y: 0 }, { x: 3, y: 4 }), 5);

  assert.deepEqual(rectangle(10, 20, -5, -10), {
    x: 5,
    y: 10,
    width: 5,
    height: 10,
    right: 10,
    bottom: 20,
  });

  const a = rectangle(0, 0, 10, 10);
  const b = rectangle(5, 5, 10, 10);
  const c = rectangle(20, 20, 5, 5);
  assert.equal(containsPoint(a, { x: 10, y: 10 }), true);
  assert.equal(containsPoint(a, { x: 11, y: 10 }), false);
  assert.equal(rectanglesIntersect(a, b), true);
  assert.equal(rectanglesIntersect(a, c), false);
  assert.deepEqual(rectangleIntersection(a, b), rectangle(5, 5, 5, 5));
  assert.equal(rectangleIntersection(a, c), null);

  assert.deepEqual(boundsFromPoints([{ x: 2, y: 3 }, { x: -1, y: 8 }, { x: 4, y: 1 }]), rectangle(-1, 1, 5, 7));
  assert.deepEqual(boundsFromPoints([]), rectangle(0, 0, 0, 0));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
