/*
Toolbox Aid
David Quesenberry
06/10/2026
index.js
*/

export {
  OBJECT_MODEL_TRAIT_IDS,
  OBJECT_MODEL_TRAIT_LIST,
  OBJECT_MODEL_TRAIT_REGISTRY,
  OBJECT_MODEL_TYPE_IDS,
  OBJECT_MODEL_TYPE_LIST,
  OBJECT_MODEL_TYPE_REGISTRY,
  getObjectModelTrait,
  getObjectModelType,
  isObjectModelTrait,
  isObjectModelType,
} from "./objectModelRegistry.js";

export {
  OBJECT_DEFINITION_SCHEMA,
  OBJECT_DEFINITION_SCHEMA_ID,
  OBJECT_DEFINITION_SCHEMA_VERSION,
  getObjectDefinitionSchema,
} from "./objectDefinitionSchema.js";

export {
  OBJECT_DEFINITION_VALIDATION_CODES,
  validateObjectDefinition,
  validateObjectDefinitionList,
} from "./objectDefinitionValidator.js";
