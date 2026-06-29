/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeEnvironmentForceInstantiation.test.mjs
*/
import assert from "node:assert/strict";
import {
  RUNTIME_ENVIRONMENT_FORCE_ERRORS,
  instantiateEnvironmentForces,
} from "../../../www/src/engine/runtime/runtimeEnvironmentForceInstantiation.js";
import { createManifestDrivenRuntimeFixture } from "./RuntimeManifestDrivenFixture.mjs";

export function run() {
  const manifest = createManifestDrivenRuntimeFixture();
  const result = instantiateEnvironmentForces(manifest.environmentForces);

  assert.equal(result.valid, true);
  assert.equal(result.environmentForces.length, 3);
  assert.deepEqual(result.environmentForces.find((force) => force.forceId === "wind").vector, { x: 1, y: 0 });
  assert.equal(result.environmentForces.find((force) => force.forceId === "rain").weatherType, "rain");
  assert.equal(Object.hasOwn(result.environmentForces[0], "terrainMaterial"), false);
  assert.equal(Object.hasOwn(result.environmentForces[0], "objectType"), false);

  const invalidResult = instantiateEnvironmentForces({
    wind: {
      forceType: "wind",
      strength: 1,
    },
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(
    invalidResult.errors.map((error) => error.code),
    [RUNTIME_ENVIRONMENT_FORCE_ERRORS.VECTOR_INVALID]
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
