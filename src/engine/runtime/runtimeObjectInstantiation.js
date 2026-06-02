/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimeObjectInstantiation.js
*/

export const RUNTIME_OBJECT_INSTANTIATION_ERRORS = Object.freeze({
  RECORDS_INVALID: "RUNTIME_OBJECT_RECORDS_INVALID",
  INSTANCES_INVALID: "RUNTIME_OBJECT_INSTANCES_INVALID",
  INSTANCE_ID_REQUIRED: "RUNTIME_OBJECT_INSTANCE_ID_REQUIRED",
  OBJECT_ID_REQUIRED: "RUNTIME_OBJECT_INSTANCE_OBJECT_ID_REQUIRED",
  OBJECT_RECORD_MISSING: "RUNTIME_OBJECT_RECORD_MISSING",
  POSITION_INVALID: "RUNTIME_OBJECT_INSTANCE_POSITION_INVALID",
  SIZE_INVALID: "RUNTIME_OBJECT_INSTANCE_SIZE_INVALID",
  VELOCITY_INVALID: "RUNTIME_OBJECT_INSTANCE_VELOCITY_INVALID",
  HEALTH_INVALID: "RUNTIME_OBJECT_INSTANCE_HEALTH_INVALID",
  CONTACT_DAMAGE_INVALID: "RUNTIME_OBJECT_INSTANCE_CONTACT_DAMAGE_INVALID",
});

export function instantiateRuntimeObjects(objectRecords, instanceDefinitions) {
  const errors = [];

  if (!Array.isArray(objectRecords)) {
    errors.push(createRuntimeObjectInstantiationError(
      RUNTIME_OBJECT_INSTANTIATION_ERRORS.RECORDS_INVALID,
      "Runtime object instantiation requires object records.",
      "objectRecords"
    ));
  }

  if (!Array.isArray(instanceDefinitions)) {
    errors.push(createRuntimeObjectInstantiationError(
      RUNTIME_OBJECT_INSTANTIATION_ERRORS.INSTANCES_INVALID,
      "Runtime object instantiation requires explicit object instance definitions.",
      "instanceDefinitions"
    ));
  }

  if (errors.length > 0) {
    return createRuntimeObjectInstantiationResult({ runtimeObjects: [], errors });
  }

  const recordsByObjectId = new Map(objectRecords.map((record) => [record.objectId, record]));
  const runtimeObjects = [];

  instanceDefinitions.forEach((definition, index) => {
    const path = `instanceDefinitions[${index}]`;

    if (!isRecord(definition)) {
      errors.push(createRuntimeObjectInstantiationError(
        RUNTIME_OBJECT_INSTANTIATION_ERRORS.INSTANCES_INVALID,
        "Runtime object instance definition must be an object.",
        path
      ));
      return;
    }

    if (!hasNonEmptyString(definition.instanceId)) {
      errors.push(createRuntimeObjectInstantiationError(
        RUNTIME_OBJECT_INSTANTIATION_ERRORS.INSTANCE_ID_REQUIRED,
        "Runtime object instance requires instanceId.",
        `${path}.instanceId`
      ));
    }

    if (!hasNonEmptyString(definition.objectId)) {
      errors.push(createRuntimeObjectInstantiationError(
        RUNTIME_OBJECT_INSTANTIATION_ERRORS.OBJECT_ID_REQUIRED,
        "Runtime object instance requires objectId.",
        `${path}.objectId`
      ));
    }

    const objectRecord = recordsByObjectId.get(definition.objectId);

    if (hasNonEmptyString(definition.objectId) && !objectRecord) {
      errors.push(createRuntimeObjectInstantiationError(
        RUNTIME_OBJECT_INSTANTIATION_ERRORS.OBJECT_RECORD_MISSING,
        "Runtime object instance references a missing object record.",
        `${path}.objectId`
      ));
    }

    if (!isPoint(definition.position)) {
      errors.push(createRuntimeObjectInstantiationError(
        RUNTIME_OBJECT_INSTANTIATION_ERRORS.POSITION_INVALID,
        "Runtime object instance requires explicit position.",
        `${path}.position`
      ));
    }

    if (!isSize(definition.size)) {
      errors.push(createRuntimeObjectInstantiationError(
        RUNTIME_OBJECT_INSTANTIATION_ERRORS.SIZE_INVALID,
        "Runtime object instance requires explicit size.",
        `${path}.size`
      ));
    }

    if (!isPoint(definition.velocity)) {
      errors.push(createRuntimeObjectInstantiationError(
        RUNTIME_OBJECT_INSTANTIATION_ERRORS.VELOCITY_INVALID,
        "Runtime object instance requires explicit velocity.",
        `${path}.velocity`
      ));
    }

    if (definition.health !== undefined && !isNonNegativeNumber(definition.health)) {
      errors.push(createRuntimeObjectInstantiationError(
        RUNTIME_OBJECT_INSTANTIATION_ERRORS.HEALTH_INVALID,
        "Runtime object health must be a non-negative number when provided.",
        `${path}.health`
      ));
    }

    if (definition.contactDamage !== undefined && !isNonNegativeNumber(definition.contactDamage)) {
      errors.push(createRuntimeObjectInstantiationError(
        RUNTIME_OBJECT_INSTANTIATION_ERRORS.CONTACT_DAMAGE_INVALID,
        "Runtime object contactDamage must be a non-negative number when provided.",
        `${path}.contactDamage`
      ));
    }

    if (!objectRecord || errors.some((error) => error.path.startsWith(path))) {
      return;
    }

    const capabilities = [objectRecord.objectType];

    if (definition.contactDamage !== undefined) {
      capabilities.push("contactDamage");
    }

    runtimeObjects.push(Object.freeze({
      instanceId: definition.instanceId.trim(),
      objectId: definition.objectId.trim(),
      objectType: objectRecord.objectType,
      capabilities: Object.freeze(capabilities),
      geometryRef: objectRecord.geometryRef,
      rules: Object.freeze([...objectRecord.rules]),
      position: freezePoint(definition.position),
      previousPosition: freezePoint(definition.position),
      size: freezeSize(definition.size),
      velocity: freezePoint(definition.velocity),
      health: definition.health,
      contactDamage: definition.contactDamage,
    }));
  });

  return createRuntimeObjectInstantiationResult({
    runtimeObjects: errors.length === 0 ? runtimeObjects : [],
    errors,
  });
}

function createRuntimeObjectInstantiationResult({ runtimeObjects, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    runtimeObjects: Object.freeze(runtimeObjects),
    errors: Object.freeze(errors),
  });
}

function createRuntimeObjectInstantiationError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function freezePoint(value) {
  return Object.freeze({ x: value.x, y: value.y });
}

function freezeSize(value) {
  return Object.freeze({ width: value.width, height: value.height });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPoint(value) {
  return isRecord(value) && Number.isFinite(value.x) && Number.isFinite(value.y);
}

function isSize(value) {
  return isRecord(value) && Number.isFinite(value.width) && value.width > 0 && Number.isFinite(value.height) && value.height > 0;
}

function isNonNegativeNumber(value) {
  return Number.isFinite(value) && value >= 0;
}
