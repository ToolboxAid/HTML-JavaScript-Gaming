/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeMovementProcessing.test.mjs
*/
import assert from "node:assert/strict";
import {
  RUNTIME_MOVEMENT_ERRORS,
  processRuntimeMovement,
} from "../../../www/src/engine/runtime/runtimeMovementProcessing.js";

export function run() {
  const runtimeObjects = [
    Object.freeze({
      instanceId: "player.1",
      objectType: "dynamic",
      position: Object.freeze({ x: 1, y: 1 }),
      previousPosition: Object.freeze({ x: 1, y: 1 }),
      size: Object.freeze({ width: 1, height: 1 }),
      velocity: Object.freeze({ x: 0, y: 0 }),
    }),
    Object.freeze({
      instanceId: "wall.1",
      objectType: "static",
      position: Object.freeze({ x: 10, y: 1 }),
      previousPosition: Object.freeze({ x: 10, y: 1 }),
      size: Object.freeze({ width: 1, height: 1 }),
      velocity: Object.freeze({ x: 0, y: 0 }),
    }),
  ];
  const movingObjects = runtimeObjects.map((runtimeObject) => runtimeObject.instanceId === "player.1"
    ? Object.freeze({ ...runtimeObject, velocity: Object.freeze({ x: 10, y: 0 }) })
    : runtimeObject);
  const result = processRuntimeMovement(movingObjects, { deltaSeconds: 0.1 });

  assert.equal(result.valid, true);
  assert.equal(result.runtimeObjects.find((runtimeObject) => runtimeObject.instanceId === "player.1").position.x, 2);
  assert.equal(result.runtimeObjects.find((runtimeObject) => runtimeObject.instanceId === "wall.1").position.x, 10);

  const invalidResult = processRuntimeMovement(runtimeObjects, { deltaSeconds: -1 });
  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [RUNTIME_MOVEMENT_ERRORS.DELTA_INVALID]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
