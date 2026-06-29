/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeTerrainEffects.test.mjs
*/
import assert from "node:assert/strict";
import {
  RUNTIME_TERRAIN_EFFECT_ERRORS,
  applyRuntimeTerrainEffects,
} from "../../../www/src/engine/runtime/runtimeTerrainEffects.js";

export function run() {
  const runtimeObjects = [
    Object.freeze({
      instanceId: "player.1",
      objectType: "dynamic",
      velocity: Object.freeze({ x: 0, y: 0 }),
      health: 100,
    }),
    Object.freeze({
      instanceId: "bumblebee.1",
      objectType: "killable",
      velocity: Object.freeze({ x: 0, y: 0 }),
      health: 20,
    }),
  ];
  const terrainMaterials = [
    Object.freeze({ materialId: "ice", passable: true, blocked: false, slide: Object.freeze({ x: 2, y: 0 }) }),
    Object.freeze({ materialId: "lava", passable: true, blocked: false, slide: null, surfaceDamage: 4 }),
  ];
  const result = applyRuntimeTerrainEffects(
    runtimeObjects,
    terrainMaterials,
    { "player.1": "ice", "bumblebee.1": "lava" },
    { deltaSeconds: 0.5 }
  );

  assert.equal(result.valid, true);
  assert.equal(result.runtimeObjects.find((runtimeObject) => runtimeObject.instanceId === "player.1").velocity.x > 0, true);
  assert.equal(result.runtimeObjects.find((runtimeObject) => runtimeObject.instanceId === "bumblebee.1").health, 18);

  const invalidResult = applyRuntimeTerrainEffects(runtimeObjects, terrainMaterials, { "player.1": "missing" }, { deltaSeconds: 0.1 });
  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [RUNTIME_TERRAIN_EFFECT_ERRORS.MATERIAL_MISSING]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
