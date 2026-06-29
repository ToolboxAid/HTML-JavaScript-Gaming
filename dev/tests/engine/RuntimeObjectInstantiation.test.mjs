/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeObjectInstantiation.test.mjs
*/
import assert from "node:assert/strict";
import {
  RUNTIME_OBJECT_INSTANTIATION_ERRORS,
  instantiateRuntimeObjects,
} from "../../../www/src/engine/runtime/runtimeObjectInstantiation.js";
import { readManifestObjectDefinitions } from "../../../www/src/engine/runtime/objectDefinitionReader.js";
import { createRuntimeObjectRecords } from "../../../www/src/engine/runtime/runtimeObjectRecordFactory.js";
import { createManifestDrivenRuntimeFixture } from "./RuntimeManifestDrivenFixture.mjs";

export function run() {
  const manifest = createManifestDrivenRuntimeFixture();
  const objectDefinitions = readManifestObjectDefinitions(manifest);
  const objectRecords = createRuntimeObjectRecords(objectDefinitions.objectDefinitions);
  const result = instantiateRuntimeObjects(objectRecords.records, manifest.objectInstances);

  assert.equal(result.valid, true);
  assert.equal(result.runtimeObjects.length, 3);
  assert.deepEqual(result.runtimeObjects[0], {
    instanceId: "player.1",
    objectId: "object.player",
    objectType: "dynamic",
    capabilities: ["dynamic"],
    geometryRef: "geometry.player",
    rules: ["movement.player"],
    position: { x: 1, y: 1 },
    previousPosition: { x: 1, y: 1 },
    size: { width: 1, height: 1 },
    velocity: { x: 0, y: 0 },
    health: 100,
    contactDamage: undefined,
  });
  assert.deepEqual(result.runtimeObjects[2].capabilities, ["killable", "contactDamage"]);
  assert.equal(Object.hasOwn(result.runtimeObjects[0], "rendered"), false);

  const invalidResult = instantiateRuntimeObjects(objectRecords.records, [
    { instanceId: "bad.1", objectId: "object.player", size: { width: 1, height: 1 }, velocity: { x: 0, y: 0 } },
  ]);

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(
    invalidResult.errors.map((error) => error.code),
    [RUNTIME_OBJECT_INSTANTIATION_ERRORS.POSITION_INVALID]
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
