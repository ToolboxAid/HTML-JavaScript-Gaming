/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeMultiSceneLoading.test.mjs
*/
import assert from "node:assert/strict";
import {
  RUNTIME_MULTI_SCENE_LOADING_ERRORS,
  createRuntimeSceneRegistry,
  loadRuntimeScene,
  validateRuntimeSceneTransition,
} from "../../../www/src/engine/runtime/runtimeMultiSceneLoading.js";
import { createRuntimeGameplayLoopManifest } from "./RuntimeGameplayLoopFixture.mjs";

export function run() {
  const manifest = createRuntimeGameplayLoopManifest();
  const registryResult = createRuntimeSceneRegistry(manifest);

  assert.equal(registryResult.valid, true);
  assert.deepEqual(registryResult.sceneRegistry.sceneIds, ["scene.start", "scene.bonus"]);

  const loadResult = loadRuntimeScene(registryResult.sceneRegistry, "scene.start");
  assert.equal(loadResult.valid, true);
  assert.equal(loadResult.scene.sceneId, "scene.start");

  const transitionResult = validateRuntimeSceneTransition(registryResult.sceneRegistry, "scene.start", "scene.bonus");
  assert.equal(transitionResult.valid, true);
  assert.deepEqual(transitionResult.transition, { fromSceneId: "scene.start", toSceneId: "scene.bonus" });

  const invalidTransition = validateRuntimeSceneTransition(registryResult.sceneRegistry, "scene.bonus", "scene.start");
  assert.equal(invalidTransition.valid, false);
  assert.deepEqual(invalidTransition.errors.map((error) => error.code), [RUNTIME_MULTI_SCENE_LOADING_ERRORS.TRANSITION_NOT_DECLARED]);

  const implicitLoad = loadRuntimeScene(registryResult.sceneRegistry, "");
  assert.equal(implicitLoad.valid, false);
  assert.deepEqual(implicitLoad.errors.map((error) => error.code), [RUNTIME_MULTI_SCENE_LOADING_ERRORS.SCENE_ID_REQUIRED]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
