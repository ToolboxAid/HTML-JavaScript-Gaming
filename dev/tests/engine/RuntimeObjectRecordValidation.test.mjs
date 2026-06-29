/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeObjectRecordValidation.test.mjs
*/
import assert from "node:assert/strict";
import {
  RUNTIME_OBJECT_RECORD_FACTORY_ERRORS,
  createRuntimeObjectRecord,
  validateRuntimeObjectRecord,
} from "../../../www/src/engine/runtime/runtimeObjectRecordFactory.js";

export function run() {
  const manifestDefinition = Object.freeze({
    objectId: "object.dynamic.player",
    objectType: "dynamic",
    geometryRef: "geometry.player",
    rules: Object.freeze(["movement.player"]),
  });
  const beforeCreate = JSON.stringify(manifestDefinition);
  const createResult = createRuntimeObjectRecord(manifestDefinition);

  assert.equal(createResult.valid, true);
  assert.equal(JSON.stringify(manifestDefinition), beforeCreate);
  assert.notEqual(createResult.record, manifestDefinition);
  assert.deepEqual(createResult.record, manifestDefinition);
  assert.equal(validateRuntimeObjectRecord(createResult.record).valid, true);

  assertErrorCodes(
    validateRuntimeObjectRecord({ ...createResult.record, objectType: "boss" }),
    [RUNTIME_OBJECT_RECORD_FACTORY_ERRORS.OBJECT_TYPE_INVALID],
    "invalid runtime object record type fails visibly"
  );
  assertErrorCodes(
    validateRuntimeObjectRecord({ ...createResult.record, geometryRef: "" }),
    [RUNTIME_OBJECT_RECORD_FACTORY_ERRORS.GEOMETRY_REF_REQUIRED],
    "invalid runtime object record geometry fails visibly"
  );
  assertErrorCodes(
    validateRuntimeObjectRecord({ ...createResult.record, rules: [""] }),
    [RUNTIME_OBJECT_RECORD_FACTORY_ERRORS.RULES_INVALID],
    "invalid runtime object record rules fail visibly"
  );
  assertErrorCodes(
    validateRuntimeObjectRecord({ ...createResult.record, position: { x: 0, y: 0 } }),
    [RUNTIME_OBJECT_RECORD_FACTORY_ERRORS.FORBIDDEN_DEFAULT_FIELD],
    "runtime object record fallback fields fail visibly"
  );
}

function assertErrorCodes(validation, expectedCodes, name) {
  assert.equal(validation.valid, false, name);
  assert.deepEqual(validation.errors.map((error) => error.code), expectedCodes, name);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
