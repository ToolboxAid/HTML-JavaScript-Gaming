/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimeEnvironmentForceInstantiation.js
*/

export const RUNTIME_ENVIRONMENT_FORCE_TYPES = Object.freeze({
  WIND: "wind",
  GRAVITY_FIELD: "gravityField",
  CURRENT: "current",
  WEATHER: "weather",
  GLOBAL_FORCE: "globalForce",
});

export const RUNTIME_ENVIRONMENT_FORCE_TYPE_LIST = Object.freeze([
  RUNTIME_ENVIRONMENT_FORCE_TYPES.WIND,
  RUNTIME_ENVIRONMENT_FORCE_TYPES.GRAVITY_FIELD,
  RUNTIME_ENVIRONMENT_FORCE_TYPES.CURRENT,
  RUNTIME_ENVIRONMENT_FORCE_TYPES.WEATHER,
  RUNTIME_ENVIRONMENT_FORCE_TYPES.GLOBAL_FORCE,
]);

export const RUNTIME_ENVIRONMENT_FORCE_ERRORS = Object.freeze({
  FORCES_INVALID: "RUNTIME_ENVIRONMENT_FORCES_INVALID",
  FORCE_ID_REQUIRED: "RUNTIME_ENVIRONMENT_FORCE_ID_REQUIRED",
  FORCE_TYPE_REQUIRED: "RUNTIME_ENVIRONMENT_FORCE_TYPE_REQUIRED",
  FORCE_TYPE_INVALID: "RUNTIME_ENVIRONMENT_FORCE_TYPE_INVALID",
  VECTOR_INVALID: "RUNTIME_ENVIRONMENT_FORCE_VECTOR_INVALID",
  STRENGTH_INVALID: "RUNTIME_ENVIRONMENT_FORCE_STRENGTH_INVALID",
  WEATHER_TYPE_REQUIRED: "RUNTIME_ENVIRONMENT_FORCE_WEATHER_TYPE_REQUIRED",
  STRING_ARRAY_INVALID: "RUNTIME_ENVIRONMENT_FORCE_STRING_ARRAY_INVALID",
});

export function instantiateEnvironmentForces(forceDefinitions) {
  const errors = [];

  if (!isRecord(forceDefinitions) && !Array.isArray(forceDefinitions)) {
    errors.push(createEnvironmentForceError(
      RUNTIME_ENVIRONMENT_FORCE_ERRORS.FORCES_INVALID,
      "Environment force instantiation requires an object map or array.",
      "forceDefinitions"
    ));
    return createEnvironmentForceResult({ environmentForces: [], errors });
  }

  const entries = Array.isArray(forceDefinitions)
    ? forceDefinitions.map((definition, index) => ({ key: "", definition, path: `forceDefinitions[${index}]` }))
    : Object.entries(forceDefinitions).map(([key, definition]) => ({ key, definition, path: `forceDefinitions.${key}` }));
  const environmentForces = [];

  entries.forEach(({ key, definition, path }) => {
    if (!isRecord(definition)) {
      errors.push(createEnvironmentForceError(
        RUNTIME_ENVIRONMENT_FORCE_ERRORS.FORCES_INVALID,
        "Environment force definition must be an object.",
        path
      ));
      return;
    }

    const forceId = hasNonEmptyString(definition.forceId) ? definition.forceId.trim() : key.trim();
    const forceType = hasNonEmptyString(definition.forceType) ? definition.forceType.trim() : "";

    if (!hasNonEmptyString(forceId)) {
      errors.push(createEnvironmentForceError(
        RUNTIME_ENVIRONMENT_FORCE_ERRORS.FORCE_ID_REQUIRED,
        "Environment force requires forceId.",
        `${path}.forceId`
      ));
    }

    if (!hasNonEmptyString(forceType)) {
      errors.push(createEnvironmentForceError(
        RUNTIME_ENVIRONMENT_FORCE_ERRORS.FORCE_TYPE_REQUIRED,
        "Environment force requires forceType.",
        `${path}.forceType`
      ));
    } else if (!RUNTIME_ENVIRONMENT_FORCE_TYPE_LIST.includes(forceType)) {
      errors.push(createEnvironmentForceError(
        RUNTIME_ENVIRONMENT_FORCE_ERRORS.FORCE_TYPE_INVALID,
        "Environment force uses an unsupported forceType.",
        `${path}.forceType`
      ));
    }

    if (requiresVector(forceType) && !isPoint(definition.vector)) {
      errors.push(createEnvironmentForceError(
        RUNTIME_ENVIRONMENT_FORCE_ERRORS.VECTOR_INVALID,
        "Environment force requires explicit vector.",
        `${path}.vector`
      ));
    }

    if (requiresVector(forceType) && !isNonNegativeNumber(definition.strength)) {
      errors.push(createEnvironmentForceError(
        RUNTIME_ENVIRONMENT_FORCE_ERRORS.STRENGTH_INVALID,
        "Environment force requires explicit non-negative strength.",
        `${path}.strength`
      ));
    }

    if (forceType === RUNTIME_ENVIRONMENT_FORCE_TYPES.WEATHER && !hasNonEmptyString(definition.weatherType)) {
      errors.push(createEnvironmentForceError(
        RUNTIME_ENVIRONMENT_FORCE_ERRORS.WEATHER_TYPE_REQUIRED,
        "Weather environment force requires weatherType.",
        `${path}.weatherType`
      ));
    }

    validateOptionalStringArray(definition.ambientHazards, `${path}.ambientHazards`, errors);
    validateOptionalStringArray(definition.globalModifiers, `${path}.globalModifiers`, errors);

    if (errors.some((error) => error.path.startsWith(path))) {
      return;
    }

    environmentForces.push(Object.freeze({
      forceId,
      forceType,
      vector: definition.vector === undefined ? null : freezePoint(definition.vector),
      strength: definition.strength,
      weatherType: hasNonEmptyString(definition.weatherType) ? definition.weatherType.trim() : "",
      ambientHazards: Object.freeze(Array.isArray(definition.ambientHazards) ? definition.ambientHazards.map((item) => item.trim()) : []),
      globalModifiers: Object.freeze(Array.isArray(definition.globalModifiers) ? definition.globalModifiers.map((item) => item.trim()) : []),
    }));
  });

  return createEnvironmentForceResult({
    environmentForces: errors.length === 0 ? environmentForces : [],
    errors,
  });
}

function createEnvironmentForceResult({ environmentForces, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    environmentForces: Object.freeze(environmentForces),
    errors: Object.freeze(errors),
  });
}

function createEnvironmentForceError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function requiresVector(forceType) {
  return forceType === RUNTIME_ENVIRONMENT_FORCE_TYPES.WIND
    || forceType === RUNTIME_ENVIRONMENT_FORCE_TYPES.GRAVITY_FIELD
    || forceType === RUNTIME_ENVIRONMENT_FORCE_TYPES.CURRENT
    || forceType === RUNTIME_ENVIRONMENT_FORCE_TYPES.GLOBAL_FORCE;
}

function validateOptionalStringArray(value, path, errors) {
  if (value === undefined || isStringArray(value)) {
    return;
  }

  errors.push(createEnvironmentForceError(
    RUNTIME_ENVIRONMENT_FORCE_ERRORS.STRING_ARRAY_INVALID,
    "Environment force string arrays must contain non-empty strings when provided.",
    path
  ));
}

function freezePoint(value) {
  return Object.freeze({ x: value.x, y: value.y });
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

function isNonNegativeNumber(value) {
  return Number.isFinite(value) && value >= 0;
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => hasNonEmptyString(item));
}
