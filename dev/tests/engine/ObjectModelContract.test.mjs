/*
Toolbox Aid
David Quesenberry
06/10/2026
ObjectModelContract.test.mjs
*/
import assert from "node:assert/strict";
import {
  OBJECT_DEFINITION_VALIDATION_CODES,
  OBJECT_MODEL_TRAIT_LIST,
  OBJECT_MODEL_TYPE_LIST,
  getObjectDefinitionSchema,
  getObjectModelTrait,
  getObjectModelType,
  validateObjectDefinition,
  validateObjectDefinitionList,
} from "../../../www/src/engine/object-model/index.js";

export function run() {
  assert.deepEqual(OBJECT_MODEL_TYPE_LIST.map((objectType) => objectType.id), [
    "Static",
    "Dynamic",
    "Collectible",
    "Hazard",
    "Goal",
  ]);
  assert.deepEqual(OBJECT_MODEL_TRAIT_LIST.map((trait) => trait.id), [
    "movable",
    "damageable",
    "killable",
    "playerControlled",
    "collides",
    "scores",
    "collectible",
    "hazard",
    "goal",
  ]);
  assert.equal(getObjectModelType("objectStatic"), null);
  assert.equal(getObjectModelType("objectDynamic"), null);
  assert.equal(getObjectModelTrait("bounces"), null);
  assert.equal(getObjectModelTrait("objectKillable"), null);

  const schema = getObjectDefinitionSchema();
  assert.equal(schema.$id, "gamefoundrystudio.object-model.definition/1");
  assert.deepEqual(schema.required, ["name", "type", "traits"]);
  assert.deepEqual(schema.properties.type.enum, OBJECT_MODEL_TYPE_LIST.map((objectType) => objectType.id));
  assert.deepEqual(schema.properties.traits.items.enum, OBJECT_MODEL_TRAIT_LIST.map((trait) => trait.id));
  assert.deepEqual(schema.properties.render.properties.type.enum, ["None", "Sprite"]);

  const heroDefinition = Object.freeze({
    behavior: "Moves from player input.",
    interaction: "Uses player input mapping.",
    name: "Hero",
    role: "Hero",
    state: "Active",
    traits: Object.freeze(["movable", "collides", "playerControlled"]),
    type: "Dynamic",
  });
  const beforeValidation = JSON.stringify(heroDefinition);
  const heroValidation = validateObjectDefinition(heroDefinition);

  assert.equal(heroValidation.valid, true);
  assert.equal(JSON.stringify(heroDefinition), beforeValidation);
  assert.notEqual(heroValidation.definition, heroDefinition);
  assert.notEqual(heroValidation.definition.traits, heroDefinition.traits);
  assert.deepEqual(heroValidation.definition, heroDefinition);

  const spriteProjectileDefinition = Object.freeze({
    name: "Bolt",
    render: Object.freeze({
      assetKey: "sprite_bolt",
      previewPath: "projects/demo/image/sprite/sprite_bolt.png",
      type: "Sprite",
    }),
    traits: Object.freeze(["movable", "collides"]),
    type: "Dynamic",
  });
  const spriteProjectileValidation = validateObjectDefinition(spriteProjectileDefinition);
  assert.equal(spriteProjectileValidation.valid, true);
  assert.deepEqual(spriteProjectileValidation.definition, spriteProjectileDefinition);

  assertErrorCodes(
    validateObjectDefinition("bad"),
    [OBJECT_DEFINITION_VALIDATION_CODES.DEFINITION_INVALID],
    "non-object definitions are rejected"
  );
  assertErrorCodes(
    validateObjectDefinition({ name: "", type: "", traits: [] }),
    [
      OBJECT_DEFINITION_VALIDATION_CODES.NAME_REQUIRED,
      OBJECT_DEFINITION_VALIDATION_CODES.TYPE_REQUIRED,
    ],
    "missing required definition fields are rejected"
  );
  assertErrorCodes(
    validateObjectDefinition({
      name: "Legacy Static",
      type: "objectStatic",
      traits: ["collides"],
    }),
    [OBJECT_DEFINITION_VALIDATION_CODES.TYPE_INVALID],
    "legacy object class names are not restored as types"
  );
  assertErrorCodes(
    validateObjectDefinition({
      name: "Bad Traits",
      type: "Dynamic",
      traits: ["movable", "movable", "objectKillable"],
    }),
    [
      OBJECT_DEFINITION_VALIDATION_CODES.TRAIT_DUPLICATE,
      OBJECT_DEFINITION_VALIDATION_CODES.TRAIT_INVALID,
    ],
    "duplicate and unknown traits fail visibly"
  );
  assertErrorCodes(
    validateObjectDefinition({
      name: "Bad Bounce Trait",
      type: "Dynamic",
      traits: ["bounces"],
    }),
    [OBJECT_DEFINITION_VALIDATION_CODES.TRAIT_INVALID],
    "bounce behavior is not an object identity trait"
  );
  assertErrorCodes(
    validateObjectDefinition({
      name: "Sprite Without Asset",
      render: { type: "Sprite" },
      traits: ["collides"],
      type: "Dynamic",
    }),
    [OBJECT_DEFINITION_VALIDATION_CODES.RENDER_ASSET_KEY_REQUIRED],
    "sprite render config requires a real linked sprite asset"
  );
  assertErrorCodes(
    validateObjectDefinition({
      name: "Unknown Field",
      style: "legacy",
      traits: ["collides"],
      type: "Static",
    }),
    [OBJECT_DEFINITION_VALIDATION_CODES.FIELD_UNKNOWN],
    "unknown schema fields are rejected"
  );
  assertErrorCodes(
    validateObjectDefinition({
      name: "Bad State",
      state: "Spawned",
      traits: ["goal"],
      type: "Goal",
    }),
    [OBJECT_DEFINITION_VALIDATION_CODES.STATE_INVALID],
    "unsupported authoring states are rejected"
  );

  const listValidation = validateObjectDefinitionList([
    heroDefinition,
    { name: "Broken", type: "objectDynamic", traits: ["movable"] },
  ]);
  assert.equal(listValidation.valid, false);
  assert.deepEqual(listValidation.definitions, []);
  assert.deepEqual(
    listValidation.issues.map((issue) => issue.code),
    [OBJECT_DEFINITION_VALIDATION_CODES.TYPE_INVALID]
  );
  assert.equal(listValidation.issues.every((issue) => issue.action && issue.path), true);
}

function assertErrorCodes(validation, expectedCodes, name) {
  assert.equal(validation.valid, false, name);
  assert.deepEqual(validation.issues.map((issue) => issue.code), expectedCodes, name);
  assert.equal(validation.issues.every((issue) => issue.action && issue.path), true, `${name} issues are actionable`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
