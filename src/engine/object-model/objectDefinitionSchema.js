/*
Toolbox Aid
David Quesenberry
06/10/2026
objectDefinitionSchema.js
*/

import { OBJECT_MODEL_TRAIT_LIST, OBJECT_MODEL_TYPE_LIST } from "./objectModelRegistry.js";

export const OBJECT_DEFINITION_SCHEMA_ID = "gamefoundrystudio.object-model.definition/1";
export const OBJECT_DEFINITION_SCHEMA_VERSION = 1;

const OBJECT_MODEL_TYPE_ENUM = Object.freeze(OBJECT_MODEL_TYPE_LIST.map((objectType) => objectType.id));
const OBJECT_MODEL_TRAIT_ENUM = Object.freeze(OBJECT_MODEL_TRAIT_LIST.map((trait) => trait.id));
const OBJECT_DEFINITION_RENDER_TYPE_ENUM = Object.freeze(["None", "Sprite"]);
const OBJECT_DEFINITION_STATE_ENUM = Object.freeze(["Active", "Idle", "Disabled"]);

export const OBJECT_DEFINITION_SCHEMA = Object.freeze({
  $id: OBJECT_DEFINITION_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  additionalProperties: false,
  properties: Object.freeze({
    behavior: Object.freeze({ type: "string" }),
    id: Object.freeze({ minLength: 1, type: "string" }),
    interaction: Object.freeze({ type: "string" }),
    name: Object.freeze({ minLength: 1, type: "string" }),
    render: Object.freeze({
      additionalProperties: false,
      properties: Object.freeze({
        assetKey: Object.freeze({ minLength: 1, type: "string" }),
        previewPath: Object.freeze({ minLength: 1, type: "string" }),
        type: Object.freeze({
          enum: OBJECT_DEFINITION_RENDER_TYPE_ENUM,
          type: "string",
        }),
      }),
      required: Object.freeze(["type"]),
      type: "object",
    }),
    role: Object.freeze({ type: "string" }),
    state: Object.freeze({ enum: OBJECT_DEFINITION_STATE_ENUM, type: "string" }),
    traits: Object.freeze({
      items: Object.freeze({
        enum: OBJECT_MODEL_TRAIT_ENUM,
        type: "string",
      }),
      type: "array",
      uniqueItems: true,
    }),
    type: Object.freeze({
      enum: OBJECT_MODEL_TYPE_ENUM,
      type: "string",
    }),
  }),
  required: Object.freeze(["name", "type", "traits"]),
  title: "GameFoundryStudio Object Definition",
  type: "object",
  version: OBJECT_DEFINITION_SCHEMA_VERSION,
});

export function getObjectDefinitionSchema() {
  return OBJECT_DEFINITION_SCHEMA;
}
