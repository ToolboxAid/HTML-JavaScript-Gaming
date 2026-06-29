/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimeObjectRecordFactory.js
*/

import { isRuntimeObjectType } from "./objectDefinitionReader.js";

export const RUNTIME_OBJECT_RECORD_REQUIRED_FIELDS = Object.freeze([
  "objectId",
  "objectType",
  "geometryRef",
  "rules",
]);

export const RUNTIME_OBJECT_RECORD_FORBIDDEN_DEFAULT_FIELDS = Object.freeze([
  "position",
  "size",
  "velocity",
  "sprite",
  "behavior",
  "behaviors",
  "movement",
  "render",
  "physics",
  "collision",
  "defaultPosition",
  "defaultSize",
  "defaultVelocity",
  "defaultSprite",
  "defaultBehavior",
]);

export const RUNTIME_OBJECT_RECORD_FACTORY_ERRORS = Object.freeze({
  DEFINITION_INVALID: "RUNTIME_OBJECT_DEFINITION_INVALID",
  OBJECT_ID_REQUIRED: "RUNTIME_OBJECT_RECORD_ID_REQUIRED",
  OBJECT_TYPE_REQUIRED: "RUNTIME_OBJECT_RECORD_TYPE_REQUIRED",
  OBJECT_TYPE_INVALID: "RUNTIME_OBJECT_RECORD_TYPE_INVALID",
  GEOMETRY_REF_REQUIRED: "RUNTIME_OBJECT_RECORD_GEOMETRY_REF_REQUIRED",
  RULES_REQUIRED: "RUNTIME_OBJECT_RECORD_RULES_REQUIRED",
  RULES_INVALID: "RUNTIME_OBJECT_RECORD_RULES_INVALID",
  FORBIDDEN_DEFAULT_FIELD: "RUNTIME_OBJECT_RECORD_FORBIDDEN_DEFAULT_FIELD",
});

export function createRuntimeObjectRecord(definition) {
  const errors = validateRuntimeObjectDefinition(definition, "definition");

  if (errors.length > 0) {
    return createFactoryResult({ record: null, records: [], errors });
  }

  const record = Object.freeze({
    objectId: definition.objectId.trim(),
    objectType: definition.objectType.trim(),
    geometryRef: definition.geometryRef.trim(),
    rules: Object.freeze(definition.rules.map((ruleId) => ruleId.trim())),
  });

  return createFactoryResult({ record, records: [record], errors: [] });
}

export function createRuntimeObjectRecords(definitions) {
  if (!Array.isArray(definitions)) {
    return createFactoryResult({
      record: null,
      records: [],
      errors: [
        createRuntimeObjectRecordError(
          RUNTIME_OBJECT_RECORD_FACTORY_ERRORS.DEFINITION_INVALID,
          "Runtime object record factory requires an array of object definitions.",
          "definitions"
        ),
      ],
    });
  }

  const records = [];
  const errors = [];

  definitions.forEach((definition, index) => {
    const result = createRuntimeObjectRecord(definition);

    if (result.valid) {
      records.push(result.record);
      return;
    }

    result.errors.forEach((error) => {
      errors.push(createRuntimeObjectRecordError(
        error.code,
        error.message,
        `definitions[${index}].${error.path}`
      ));
    });
  });

  return createFactoryResult({
    record: records.length === 1 ? records[0] : null,
    records: errors.length === 0 ? records : [],
    errors,
  });
}

export function validateRuntimeObjectRecord(record) {
  const errors = validateRuntimeObjectDefinition(record, "record");

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function isRuntimeObjectRecordType(value) {
  return isRuntimeObjectType(value);
}

function validateRuntimeObjectDefinition(definition, path) {
  const errors = [];

  if (!isRecord(definition)) {
    errors.push(createRuntimeObjectRecordError(
      RUNTIME_OBJECT_RECORD_FACTORY_ERRORS.DEFINITION_INVALID,
      "Runtime object record definition must be an object.",
      path
    ));
    return errors;
  }

  validateRequiredStringField(
    definition.objectId,
    `${path}.objectId`,
    RUNTIME_OBJECT_RECORD_FACTORY_ERRORS.OBJECT_ID_REQUIRED,
    "Runtime object record requires objectId.",
    errors
  );

  if (!hasNonEmptyString(definition.objectType)) {
    errors.push(createRuntimeObjectRecordError(
      RUNTIME_OBJECT_RECORD_FACTORY_ERRORS.OBJECT_TYPE_REQUIRED,
      "Runtime object record requires objectType.",
      `${path}.objectType`
    ));
  } else if (!isRuntimeObjectType(definition.objectType.trim())) {
    errors.push(createRuntimeObjectRecordError(
      RUNTIME_OBJECT_RECORD_FACTORY_ERRORS.OBJECT_TYPE_INVALID,
      "Runtime object record uses an unsupported objectType.",
      `${path}.objectType`
    ));
  }

  validateRequiredStringField(
    definition.geometryRef,
    `${path}.geometryRef`,
    RUNTIME_OBJECT_RECORD_FACTORY_ERRORS.GEOMETRY_REF_REQUIRED,
    "Runtime object record requires geometryRef.",
    errors
  );

  if (!Object.hasOwn(definition, "rules")) {
    errors.push(createRuntimeObjectRecordError(
      RUNTIME_OBJECT_RECORD_FACTORY_ERRORS.RULES_REQUIRED,
      "Runtime object record requires an explicit rules array.",
      `${path}.rules`
    ));
  } else if (!isStringArray(definition.rules)) {
    errors.push(createRuntimeObjectRecordError(
      RUNTIME_OBJECT_RECORD_FACTORY_ERRORS.RULES_INVALID,
      "Runtime object record rules must be an array of non-empty rule ids.",
      `${path}.rules`
    ));
  }

  RUNTIME_OBJECT_RECORD_FORBIDDEN_DEFAULT_FIELDS.forEach((fieldName) => {
    if (!Object.hasOwn(definition, fieldName)) {
      return;
    }

    errors.push(createRuntimeObjectRecordError(
      RUNTIME_OBJECT_RECORD_FACTORY_ERRORS.FORBIDDEN_DEFAULT_FIELD,
      "Runtime object records cannot contain fallback runtime fields.",
      `${path}.${fieldName}`
    ));
  });

  return errors;
}

function validateRequiredStringField(value, path, code, message, errors) {
  if (hasNonEmptyString(value)) {
    return;
  }

  errors.push(createRuntimeObjectRecordError(code, message, path));
}

function createFactoryResult({ record, records, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    record,
    records: Object.freeze(records),
    errors: Object.freeze(errors),
  });
}

function createRuntimeObjectRecordError(code, message, path) {
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
