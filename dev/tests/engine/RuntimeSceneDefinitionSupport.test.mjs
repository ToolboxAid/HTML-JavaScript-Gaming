/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeSceneDefinitionSupport.test.mjs
*/
import assert from "node:assert/strict";
import {
  RUNTIME_SCENE_DEFINITION_ERRORS,
  readManifestSceneDefinitions,
} from "../../../www/src/engine/runtime/runtimeSceneDefinitionSupport.js";
import { createRuntimeGameplayLoopManifest } from "./RuntimeGameplayLoopFixture.mjs";

export function run() {
  const manifest = createRuntimeGameplayLoopManifest();
  const result = readManifestSceneDefinitions(manifest);

  assert.equal(result.valid, true);
  assert.equal(result.sceneDefinitions.length, 2);
  assert.equal(result.sceneDefinitions[0].sceneId, "scene.start");
  assert.deepEqual(result.sceneDefinitions[0].environmentForceIds, ["breeze"]);
  assert.deepEqual(result.sceneDefinitions[0].transitionIds, ["scene.bonus"]);
  assert.equal(result.sceneDefinitions[0].spawnDefinitions.length, 1);
  assert.equal(Object.hasOwn(result.sceneDefinitions[0], "toolId"), false);

  const invalidResult = readManifestSceneDefinitions({
    ...manifest,
    scenes: [{ ...manifest.scenes[0], sceneId: "" }],
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [RUNTIME_SCENE_DEFINITION_ERRORS.SCENE_ID_REQUIRED]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
