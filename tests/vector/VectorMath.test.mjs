/*
 Toolbox Aid
 David Quesenberry
 03/23/2026
 VectorMath.test.mjs
*/
import assert from 'node:assert/strict';
import { vectorFromAngle } from '../../src/shared/math/vectorMath.js';

function assertClose(actual, expected, tolerance = 1e-9) {
  assert.equal(Math.abs(actual - expected) <= tolerance, true);
}

export function run() {
  const right = vectorFromAngle(0);
  assertClose(right.x, 1);
  assertClose(right.y, 0);

  const up = vectorFromAngle(-Math.PI / 2, 2);
  assertClose(up.x, 0);
  assertClose(up.y, -2);

  const diagonal = vectorFromAngle(Math.PI / 4, Math.sqrt(2));
  assertClose(diagonal.x, 1);
  assertClose(diagonal.y, 1);
}
