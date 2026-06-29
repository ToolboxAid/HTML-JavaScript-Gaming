/*
Toolbox Aid
David Quesenberry
06/02/2026
ObjectDefinitionReader.test.mjs
*/
import assert from "node:assert/strict";
import {
  OBJECT_DEFINITION_READER_ERRORS,
  RUNTIME_OBJECT_TYPE_LIST,
  RUNTIME_OBJECT_TYPES,
  isRuntimeObjectType,
  readManifestObjectDefinitions,
} from "../../../www/src/engine/runtime/objectDefinitionReader.js";

export function createObjectDefinitionManifest() {
  return {
    objects: {
      "object.static.wall": { objectType: RUNTIME_OBJECT_TYPES.STATIC, geometryRef: "geometry.wall", rules: ["collision.wall"] },
      "object.dynamic.player": { objectType: RUNTIME_OBJECT_TYPES.DYNAMIC, geometryRef: "geometry.player", rules: ["movement.player"] },
      "object.killable.enemy": { objectType: RUNTIME_OBJECT_TYPES.KILLABLE, geometryRef: "geometry.enemy", rules: ["health.enemy"] },
      "object.collectible.coin": { objectType: RUNTIME_OBJECT_TYPES.COLLECTIBLE, geometryRef: "geometry.coin", rules: ["scoring.coin"] },
      "object.trigger.exit": { objectType: RUNTIME_OBJECT_TYPES.TRIGGER, geometryRef: "geometry.exit", rules: ["cooldown.exit"] },
      "object.projectile.bullet": { objectType: RUNTIME_OBJECT_TYPES.PROJECTILE, geometryRef: "geometry.bullet", rules: ["damage.bullet"] },
      "object.zone.safe": { objectType: RUNTIME_OBJECT_TYPES.ZONE, geometryRef: "geometry.safe-zone", rules: ["collision.safe-zone"] },
      "object.ui.score": { objectType: RUNTIME_OBJECT_TYPES.UI, geometryRef: "geometry.score", rules: ["scoring.hud"] },
    },
  };
}

export function run() {
  assert.deepEqual(RUNTIME_OBJECT_TYPE_LIST, [
    "static",
    "dynamic",
    "killable",
    "collectible",
    "trigger",
    "projectile",
    "zone",
    "ui",
  ]);
  assert.equal(isRuntimeObjectType("dynamic"), true);
  assert.equal(isRuntimeObjectType("boss"), false);

  const validation = readManifestObjectDefinitions(createObjectDefinitionManifest());
  assert.equal(validation.valid, true);
  assert.equal(validation.errors.length, 0);
  assert.equal(validation.objectDefinitions.length, 8);
  assert.deepEqual(
    validation.objectDefinitions.map((definition) => definition.objectType),
    RUNTIME_OBJECT_TYPE_LIST
  );
  assert.equal(validation.objectDefinitions[0].objectId, "object.static.wall");
  assert.deepEqual(validation.objectDefinitions[1].rules, ["movement.player"]);
  assert.equal(Object.hasOwn(validation.objectDefinitions[0], "entityId"), false);

  assert.equal(readManifestObjectDefinitions({}).valid, true);
  assert.deepEqual(readManifestObjectDefinitions({}).objectDefinitions, []);
  assertErrorCodes(
    readManifestObjectDefinitions({ objects: [] }),
    [],
    "empty object array is valid"
  );
  assertErrorCodes(
    readManifestObjectDefinitions({ objects: "bad" }),
    [OBJECT_DEFINITION_READER_ERRORS.OBJECTS_INVALID],
    "invalid objects root is rejected"
  );
  assertErrorCodes(
    readManifestObjectDefinitions({ objects: [{ objectType: "dynamic" }] }),
    [OBJECT_DEFINITION_READER_ERRORS.OBJECT_ID_REQUIRED],
    "missing objectId is rejected"
  );
  assertErrorCodes(
    readManifestObjectDefinitions({ objects: { "object.bad": { objectType: "boss" } } }),
    [OBJECT_DEFINITION_READER_ERRORS.OBJECT_TYPE_INVALID],
    "invalid objectType is rejected"
  );
  assertErrorCodes(
    readManifestObjectDefinitions({ objects: { "object.bad": { objectType: "dynamic", rules: [""] } } }),
    [OBJECT_DEFINITION_READER_ERRORS.RULES_INVALID],
    "invalid object rule references are rejected"
  );
}

function assertErrorCodes(validation, expectedCodes, name) {
  assert.equal(validation.valid, expectedCodes.length === 0, name);
  assert.deepEqual(validation.errors.map((error) => error.code), expectedCodes, name);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
