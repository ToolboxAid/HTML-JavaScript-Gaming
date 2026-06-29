/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeTerrainMaterialInstantiation.test.mjs
*/
import assert from "node:assert/strict";
import {
  RUNTIME_TERRAIN_MATERIAL_ERRORS,
  instantiateTerrainMaterials,
} from "../../../www/src/engine/runtime/runtimeTerrainMaterialInstantiation.js";
import { createManifestDrivenRuntimeFixture } from "./RuntimeManifestDrivenFixture.mjs";

export function run() {
  const manifest = createManifestDrivenRuntimeFixture();
  const result = instantiateTerrainMaterials(manifest.terrainMaterials);

  assert.equal(result.valid, true);
  assert.equal(result.terrainMaterials.length, 5);
  assert.deepEqual(result.terrainMaterials.find((material) => material.materialId === "ice").slide, { x: 2, y: 0 });
  assert.equal(result.terrainMaterials.find((material) => material.materialId === "mud").drag, 0.5);
  assert.equal(result.terrainMaterials.find((material) => material.materialId === "wall").blocked, true);
  assert.equal(Object.hasOwn(result.terrainMaterials[0], "killable"), false);

  const invalidResult = instantiateTerrainMaterials({
    bad: {
      passable: true,
      blocked: true,
    },
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(
    invalidResult.errors.map((error) => error.code),
    [RUNTIME_TERRAIN_MATERIAL_ERRORS.PASSABLE_BLOCKED_CONFLICT]
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
