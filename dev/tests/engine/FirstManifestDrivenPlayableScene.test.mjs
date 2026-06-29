/*
Toolbox Aid
David Quesenberry
06/02/2026
FirstManifestDrivenPlayableScene.test.mjs
*/
import assert from "node:assert/strict";
import {
  FIRST_MANIFEST_DRIVEN_SCENE_ERRORS,
  createFirstManifestDrivenPlayableScene,
} from "../../../www/src/engine/runtime/firstManifestDrivenPlayableScene.js";
import { createManifestDrivenRuntimeFixture } from "./RuntimeManifestDrivenFixture.mjs";

export function run() {
  const manifest = createManifestDrivenRuntimeFixture();
  const result = createFirstManifestDrivenPlayableScene(manifest, [{ key: "ArrowRight", pressed: true }]);

  assert.equal(result.valid, true);
  assert.equal(result.scene.runtimeObjects.length, 3);
  assert.equal(result.scene.terrainMaterials.length, 5);
  assert.equal(result.scene.environmentForces.length, 3);
  assert.equal(result.frame.renderCommands.length, 3);
  assert.equal(result.frame.actions[0].actionId, "move.right");

  const invalidResult = createFirstManifestDrivenPlayableScene({ ...manifest, objectInstances: undefined });
  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [FIRST_MANIFEST_DRIVEN_SCENE_ERRORS.OBJECTS_INVALID]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
