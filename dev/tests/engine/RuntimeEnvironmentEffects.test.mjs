/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeEnvironmentEffects.test.mjs
*/
import assert from "node:assert/strict";
import {
  RUNTIME_ENVIRONMENT_EFFECT_ERRORS,
  applyRuntimeEnvironmentEffects,
} from "../../../www/src/engine/runtime/runtimeEnvironmentEffects.js";

export function run() {
  const runtimeObjects = [
    Object.freeze({
      instanceId: "player.1",
      objectType: "dynamic",
      velocity: Object.freeze({ x: 0, y: 0 }),
    }),
    Object.freeze({
      instanceId: "wall.1",
      objectType: "static",
      velocity: Object.freeze({ x: 0, y: 0 }),
    }),
  ];
  const environmentForces = [
    Object.freeze({
      forceId: "wind",
      forceType: "wind",
      vector: Object.freeze({ x: 1, y: 0 }),
      strength: 1,
    }),
  ];
  const result = applyRuntimeEnvironmentEffects(runtimeObjects, environmentForces, { deltaSeconds: 0.1 });

  assert.equal(result.valid, true);
  assert.equal(result.runtimeObjects.find((runtimeObject) => runtimeObject.instanceId === "player.1").velocity.x, 0.1);
  assert.equal(result.runtimeObjects.find((runtimeObject) => runtimeObject.instanceId === "wall.1").velocity.x, 0);

  const invalidResult = applyRuntimeEnvironmentEffects(runtimeObjects, environmentForces, { deltaSeconds: -1 });
  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [RUNTIME_ENVIRONMENT_EFFECT_ERRORS.DELTA_INVALID]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
