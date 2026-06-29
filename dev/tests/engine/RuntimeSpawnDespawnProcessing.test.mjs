/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeSpawnDespawnProcessing.test.mjs
*/
import assert from "node:assert/strict";
import { readManifestObjectDefinitions } from "../../../www/src/engine/runtime/objectDefinitionReader.js";
import { createRuntimeObjectRecords } from "../../../www/src/engine/runtime/runtimeObjectRecordFactory.js";
import { instantiateRuntimeObjects } from "../../../www/src/engine/runtime/runtimeObjectInstantiation.js";
import {
  RUNTIME_SPAWN_DESPAWN_ERRORS,
  processRuntimeSpawnDespawn,
} from "../../../www/src/engine/runtime/runtimeSpawnDespawnProcessing.js";
import { readManifestSceneDefinitions } from "../../../www/src/engine/runtime/runtimeSceneDefinitionSupport.js";
import { createRuntimeGameplayLoopManifest } from "./RuntimeGameplayLoopFixture.mjs";

export function run() {
  const manifest = createRuntimeGameplayLoopManifest();
  const objectRecords = createRuntimeObjectRecords(readManifestObjectDefinitions(manifest).objectDefinitions);
  const scene = readManifestSceneDefinitions(manifest).sceneDefinitions[0];
  const runtimeObjects = instantiateRuntimeObjects(objectRecords.records, scene.objectInstances);
  const result = processRuntimeSpawnDespawn({
    runtimeObjects: runtimeObjects.runtimeObjects,
    objectRecords: objectRecords.records,
    spawnDefinitions: scene.spawnDefinitions,
    ruleOutcomes: [
      { ruleId: "spawn.coin", outcomeType: "spawn" },
      { ruleId: "despawn.player", outcomeType: "despawn", targetInstanceId: "player.1" },
    ],
  });

  assert.equal(result.valid, true);
  assert.equal(result.spawned[0].instanceId, "coin.1");
  assert.deepEqual(result.despawned, ["player.1"]);
  assert.deepEqual(result.runtimeObjects.map((runtimeObject) => runtimeObject.instanceId), ["coin.1"]);

  const invalidResult = processRuntimeSpawnDespawn({
    runtimeObjects: runtimeObjects.runtimeObjects,
    objectRecords: objectRecords.records,
    spawnDefinitions: [],
    ruleOutcomes: [{ ruleId: "spawn.coin", outcomeType: "spawn" }],
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [RUNTIME_SPAWN_DESPAWN_ERRORS.SPAWN_DEFINITION_MISSING]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
