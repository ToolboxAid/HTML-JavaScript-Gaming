/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeObjectRecordFactory.test.mjs
*/
import assert from "node:assert/strict";
import { RUNTIME_OBJECT_TYPE_LIST, readManifestObjectDefinitions } from "../../../www/src/engine/runtime/objectDefinitionReader.js";
import {
  RUNTIME_OBJECT_RECORD_FORBIDDEN_DEFAULT_FIELDS,
  createRuntimeObjectRecord,
  createRuntimeObjectRecords,
  validateRuntimeObjectRecord,
} from "../../../www/src/engine/runtime/runtimeObjectRecordFactory.js";
import { createObjectDefinitionManifest } from "./ObjectDefinitionReader.test.mjs";

export function run() {
  const definitionValidation = readManifestObjectDefinitions(createObjectDefinitionManifest());
  assert.equal(definitionValidation.valid, true);

  const factoryResult = createRuntimeObjectRecords(definitionValidation.objectDefinitions);
  assert.equal(factoryResult.valid, true);
  assert.equal(factoryResult.errors.length, 0);
  assert.equal(factoryResult.records.length, 8);
  assert.deepEqual(
    factoryResult.records.map((record) => record.objectType),
    RUNTIME_OBJECT_TYPE_LIST
  );

  const playerRecord = factoryResult.records[1];
  assert.deepEqual(playerRecord, {
    objectId: "object.dynamic.player",
    objectType: "dynamic",
    geometryRef: "geometry.player",
    rules: ["movement.player"],
  });
  assert.equal(validateRuntimeObjectRecord(playerRecord).valid, true);
  RUNTIME_OBJECT_RECORD_FORBIDDEN_DEFAULT_FIELDS.forEach((fieldName) => {
    assert.equal(Object.hasOwn(playerRecord, fieldName), false, `${fieldName} was not added`);
  });

  const directResult = createRuntimeObjectRecord({
    objectId: " object.static.wall ",
    objectType: " static ",
    geometryRef: " geometry.wall ",
    rules: [" collision.wall "],
  });
  assert.equal(directResult.valid, true);
  assert.deepEqual(directResult.record, {
    objectId: "object.static.wall",
    objectType: "static",
    geometryRef: "geometry.wall",
    rules: ["collision.wall"],
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
