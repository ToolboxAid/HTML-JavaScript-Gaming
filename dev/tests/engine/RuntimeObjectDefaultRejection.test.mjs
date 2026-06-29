/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeObjectDefaultRejection.test.mjs
*/
import assert from "node:assert/strict";
import {
  RUNTIME_OBJECT_RECORD_FACTORY_ERRORS,
  RUNTIME_OBJECT_RECORD_FORBIDDEN_DEFAULT_FIELDS,
  createRuntimeObjectRecord,
} from "../../../www/src/engine/runtime/runtimeObjectRecordFactory.js";

export function run() {
  assertErrorCodes(
    createRuntimeObjectRecord({ objectType: "static", geometryRef: "geometry.wall", rules: [] }),
    [RUNTIME_OBJECT_RECORD_FACTORY_ERRORS.OBJECT_ID_REQUIRED],
    "missing objectId is rejected"
  );
  assertErrorCodes(
    createRuntimeObjectRecord({ objectId: "object.static.wall", geometryRef: "geometry.wall", rules: [] }),
    [RUNTIME_OBJECT_RECORD_FACTORY_ERRORS.OBJECT_TYPE_REQUIRED],
    "missing objectType is rejected"
  );
  assertErrorCodes(
    createRuntimeObjectRecord({ objectId: "object.static.wall", objectType: "static", rules: [] }),
    [RUNTIME_OBJECT_RECORD_FACTORY_ERRORS.GEOMETRY_REF_REQUIRED],
    "missing geometryRef is rejected"
  );
  assertErrorCodes(
    createRuntimeObjectRecord({ objectId: "object.static.wall", objectType: "static", geometryRef: "geometry.wall" }),
    [RUNTIME_OBJECT_RECORD_FACTORY_ERRORS.RULES_REQUIRED],
    "missing rules array is rejected"
  );
  assertErrorCodes(
    createRuntimeObjectRecord({ objectId: "object.static.wall", objectType: "static", geometryRef: "geometry.wall", rules: [""] }),
    [RUNTIME_OBJECT_RECORD_FACTORY_ERRORS.RULES_INVALID],
    "empty rule id is rejected"
  );

  RUNTIME_OBJECT_RECORD_FORBIDDEN_DEFAULT_FIELDS.forEach((fieldName) => {
    assertErrorCodes(
      createRuntimeObjectRecord({
        objectId: "object.dynamic.player",
        objectType: "dynamic",
        geometryRef: "geometry.player",
        rules: [],
        [fieldName]: fieldName,
      }),
      [RUNTIME_OBJECT_RECORD_FACTORY_ERRORS.FORBIDDEN_DEFAULT_FIELD],
      `${fieldName} fallback field is rejected`
    );
  });
}

function assertErrorCodes(result, expectedCodes, name) {
  assert.equal(result.valid, false, name);
  assert.equal(result.record, null, name);
  assert.deepEqual(result.errors.map((error) => error.code), expectedCodes, name);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
