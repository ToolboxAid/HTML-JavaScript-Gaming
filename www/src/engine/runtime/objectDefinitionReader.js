/*
Toolbox Aid
David Quesenberry
06/02/2026
objectDefinitionReader.js
*/

export const RUNTIME_OBJECT_TYPES = Object.freeze({
  STATIC: "static",
  DYNAMIC: "dynamic",
  KILLABLE: "killable",
  COLLECTIBLE: "collectible",
  TRIGGER: "trigger",
  PROJECTILE: "projectile",
  ZONE: "zone",
  UI: "ui",
});

export const RUNTIME_OBJECT_TYPE_LIST = Object.freeze([
  RUNTIME_OBJECT_TYPES.STATIC,
  RUNTIME_OBJECT_TYPES.DYNAMIC,
  RUNTIME_OBJECT_TYPES.KILLABLE,
  RUNTIME_OBJECT_TYPES.COLLECTIBLE,
  RUNTIME_OBJECT_TYPES.TRIGGER,
  RUNTIME_OBJECT_TYPES.PROJECTILE,
  RUNTIME_OBJECT_TYPES.ZONE,
  RUNTIME_OBJECT_TYPES.UI,
]);

export const OBJECT_DEFINITION_READER_ERRORS = Object.freeze({
  OBJECTS_INVALID: "OBJECT_DEFINITIONS_INVALID",
  OBJECT_ID_REQUIRED: "OBJECT_DEFINITION_ID_REQUIRED",
  OBJECT_TYPE_REQUIRED: "OBJECT_DEFINITION_TYPE_REQUIRED",
  OBJECT_TYPE_INVALID: "OBJECT_DEFINITION_TYPE_INVALID",
  RULES_INVALID: "OBJECT_DEFINITION_RULES_INVALID",
});

export function readManifestObjectDefinitions(manifest = {}) {
  const errors = [];
  const objects = manifest?.objects;

  if (objects === undefined || objects === null) {
    return createObjectReaderResult({ objectDefinitions: [], errors });
  }

  if (!isRecord(objects) && !Array.isArray(objects)) {
    errors.push(createObjectDefinitionError(
      OBJECT_DEFINITION_READER_ERRORS.OBJECTS_INVALID,
      "Manifest object definitions must be an object map or array.",
      "objects"
    ));
    return createObjectReaderResult({ objectDefinitions: [], errors });
  }

  const entries = Array.isArray(objects)
    ? objects.map((definition, index) => ({ key: "", definition, path: `objects[${index}]` }))
    : Object.entries(objects).map(([key, definition]) => ({ key, definition, path: `objects.${key}` }));

  const objectDefinitions = [];

  entries.forEach(({ key, definition, path }) => {
    if (!isRecord(definition)) {
      errors.push(createObjectDefinitionError(
        OBJECT_DEFINITION_READER_ERRORS.OBJECTS_INVALID,
        "Manifest object definition must be an object.",
        path
      ));
      return;
    }

    const objectId = hasNonEmptyString(definition.objectId) ? definition.objectId.trim() : key.trim();
    const objectType = hasNonEmptyString(definition.objectType) ? definition.objectType.trim() : "";

    if (!hasNonEmptyString(objectId)) {
      errors.push(createObjectDefinitionError(
        OBJECT_DEFINITION_READER_ERRORS.OBJECT_ID_REQUIRED,
        "Manifest object definition requires objectId.",
        `${path}.objectId`
      ));
    }

    if (!hasNonEmptyString(objectType)) {
      errors.push(createObjectDefinitionError(
        OBJECT_DEFINITION_READER_ERRORS.OBJECT_TYPE_REQUIRED,
        "Manifest object definition requires objectType.",
        `${path}.objectType`
      ));
    } else if (!isRuntimeObjectType(objectType)) {
      errors.push(createObjectDefinitionError(
        OBJECT_DEFINITION_READER_ERRORS.OBJECT_TYPE_INVALID,
        "Manifest object definition uses an unsupported objectType.",
        `${path}.objectType`
      ));
    }

    if (definition.rules !== undefined && !isStringArray(definition.rules)) {
      errors.push(createObjectDefinitionError(
        OBJECT_DEFINITION_READER_ERRORS.RULES_INVALID,
        "Manifest object definition rules must be an array of non-empty rule ids when provided.",
        `${path}.rules`
      ));
    }

    objectDefinitions.push(Object.freeze({
      objectId,
      objectType,
      geometryRef: hasNonEmptyString(definition.geometryRef) ? definition.geometryRef.trim() : "",
      rules: Object.freeze(isStringArray(definition.rules) ? definition.rules.map((ruleId) => ruleId.trim()) : []),
    }));
  });

  return createObjectReaderResult({ objectDefinitions, errors });
}

export function isRuntimeObjectType(value) {
  return RUNTIME_OBJECT_TYPE_LIST.includes(value);
}

function createObjectReaderResult({ objectDefinitions, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    objectDefinitions: Object.freeze(objectDefinitions),
    errors: Object.freeze(errors),
  });
}

function createObjectDefinitionError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => hasNonEmptyString(item));
}
