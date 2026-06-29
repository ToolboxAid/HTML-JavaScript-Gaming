import assert from "node:assert/strict";
import {
  aabbContactState,
  aabbOverlap,
  collisionTime,
  normalizeBoundingBox,
  sweptAabb,
} from "../../../www/src/engine/collision/hitboxCollision.js";

export function run() {
  const normalized = normalizeBoundingBox({ height: -8, width: 10, x: 5, y: 12 });
  assert.deepEqual(
    {
      bottom: normalized.bottom,
      height: normalized.height,
      left: normalized.left,
      right: normalized.right,
      top: normalized.top,
      width: normalized.width,
      x: normalized.x,
      y: normalized.y,
    },
    {
      bottom: 12,
      height: 8,
      left: 5,
      right: 15,
      top: 4,
      width: 10,
      x: 5,
      y: 4,
    },
  );

  const overlap = aabbOverlap(
    { x: 0, y: 0, width: 10, height: 10 },
    { x: 5, y: 5, width: 10, height: 10 },
  );
  assert.equal(overlap.overlap, true);
  assert.deepEqual(
    {
      height: overlap.intersection.height,
      width: overlap.intersection.width,
      x: overlap.intersection.x,
      y: overlap.intersection.y,
    },
    { height: 5, width: 5, x: 5, y: 5 },
  );
  assert.equal(aabbOverlap({ x: 0, y: 0, width: 4, height: 4 }, { x: 5, y: 0, width: 4, height: 4 }).overlap, false);
  assert.equal(aabbContactState({ x: 0, y: 0, width: 4, height: 4 }, { x: 5, y: 0, width: 4, height: 4 }).state, "separated");
  assert.equal(aabbContactState({ x: 0, y: 0, width: 4, height: 4 }, { x: 4, y: 0, width: 4, height: 4 }).state, "touching");
  assert.equal(aabbContactState({ x: 0, y: 0, width: 4, height: 4 }, { x: 3, y: 0, width: 4, height: 4 }).state, "overlapping");

  const highSpeedImpact = sweptAabb({
    movingBox: { x: 0, y: 0, width: 10, height: 10 },
    targetBox: { x: 0, y: 50, width: 10, height: 10 },
    velocity: { x: 0, y: 100 },
  });
  assert.equal(highSpeedImpact.collided, true);
  assert.equal(highSpeedImpact.collisionTime, 0.4);
  assert.deepEqual(highSpeedImpact.impactNormal, { x: 0, y: -1 });
  assert.deepEqual(highSpeedImpact.beforePosition, { x: 0, y: 0 });
  assert.deepEqual(highSpeedImpact.afterPosition, { x: 0, y: 100 });
  assert.deepEqual(highSpeedImpact.impactPosition, { x: 0, y: 40 });
  assert.deepEqual(highSpeedImpact.impactPoint, { x: 5, y: 50 });
  assert.equal(collisionTime(highSpeedImpact), 0.4);

  const horizontalImpact = sweptAabb({
    movingBox: { x: 0, y: 0, width: 10, height: 10 },
    targetBox: { x: 30, y: 0, width: 10, height: 10 },
    velocity: { x: 40, y: 0 },
  });
  assert.equal(horizontalImpact.collided, true);
  assert.equal(horizontalImpact.collisionTime, 0.5);
  assert.deepEqual(horizontalImpact.impactNormal, { x: -1, y: 0 });
  assert.deepEqual(horizontalImpact.impactPoint, { x: 30, y: 5 });

  const miss = sweptAabb({
    movingBox: { x: 0, y: 0, width: 10, height: 10 },
    targetBox: { x: 0, y: 50, width: 10, height: 10 },
    velocity: { x: 100, y: 0 },
  });
  assert.equal(miss.collided, false);
  assert.equal(miss.collisionTime, null);
  assert.equal(miss.impactPoint, null);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
