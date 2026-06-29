/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeObjectTypeValidation.test.mjs
*/
import assert from "node:assert/strict";
import { RUNTIME_OBJECT_TYPE_LIST } from "../../../www/src/engine/runtime/objectDefinitionReader.js";
import {
  RUNTIME_OBJECT_RECORD_FACTORY_ERRORS,
  createRuntimeObjectRecord,
  isRuntimeObjectRecordType,
} from "../../../www/src/engine/runtime/runtimeObjectRecordFactory.js";

export function run() {
  RUNTIME_OBJECT_TYPE_LIST.forEach((objectType) => {
    assert.equal(isRuntimeObjectRecordType(objectType), true);
    assert.equal(createRuntimeObjectRecord({
      objectId: `object.${objectType}.valid`,
      objectType,
      geometryRef: `geometry.${objectType}.valid`,
      rules: [],
    }).valid, true, `${objectType} should be accepted`);
  });

  const unknownTypeResult = createRuntimeObjectRecord({
    objectId: "object.unknown.boss",
    objectType: "boss",
    geometryRef: "geometry.boss",
    rules: [],
  });
  assert.equal(unknownTypeResult.valid, false);
  assert.deepEqual(
    unknownTypeResult.errors.map((error) => error.code),
    [RUNTIME_OBJECT_RECORD_FACTORY_ERRORS.OBJECT_TYPE_INVALID]
  );
  assert.equal(isRuntimeObjectRecordType("boss"), false);
  assert.equal(unknownTypeResult.record, null);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
