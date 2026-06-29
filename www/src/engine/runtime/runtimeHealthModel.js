/*
Toolbox Aid
David Quesenberry
06/03/2026
runtimeHealthModel.js
*/

export const RUNTIME_HEALTH_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "RUNTIME_HEALTH_DEFINITIONS_INVALID",
  DEFINITION_INVALID: "RUNTIME_HEALTH_DEFINITION_INVALID",
  CURRENT_TIME_INVALID: "RUNTIME_HEALTH_CURRENT_TIME_INVALID",
  INSTANCE_ID_REQUIRED: "RUNTIME_HEALTH_INSTANCE_ID_REQUIRED",
  HEALTH_INVALID: "RUNTIME_HEALTH_VALUE_INVALID",
  MAX_HEALTH_INVALID: "RUNTIME_MAX_HEALTH_INVALID",
  HEALTH_EXCEEDS_MAX: "RUNTIME_HEALTH_EXCEEDS_MAX",
  INVULNERABLE_UNTIL_INVALID: "RUNTIME_INVULNERABLE_UNTIL_INVALID",
  ALIVE_INVALID: "RUNTIME_HEALTH_ALIVE_INVALID",
  ALIVE_STATE_INCONSISTENT: "RUNTIME_HEALTH_ALIVE_STATE_INCONSISTENT",
});

export function createRuntimeHealthRecords(healthDefinitions, currentTimeMs) {
  const errors = [];

  if (!Array.isArray(healthDefinitions)) {
    errors.push(createHealthError(
      RUNTIME_HEALTH_ERRORS.DEFINITIONS_INVALID,
      "Runtime health model requires healthDefinitions array.",
      "healthDefinitions"
    ));
  }

  if (!Number.isFinite(currentTimeMs)) {
    errors.push(createHealthError(
      RUNTIME_HEALTH_ERRORS.CURRENT_TIME_INVALID,
      "Runtime health model requires numeric currentTimeMs.",
      "currentTimeMs"
    ));
  }

  if (errors.length > 0) {
    return createHealthResult({ healthRecords: [], errors });
  }

  const healthRecords = [];

  healthDefinitions.forEach((definition, index) => {
    const path = `healthDefinitions[${index}]`;
    const definitionErrors = validateHealthDefinition(definition, path);

    definitionErrors.forEach((error) => errors.push(error));

    if (definitionErrors.length > 0) {
      return;
    }

    healthRecords.push(Object.freeze({
      instanceId: definition.instanceId.trim(),
      health: definition.health,
      maxHealth: definition.maxHealth,
      invulnerableUntilMs: definition.invulnerableUntilMs,
      invulnerable: currentTimeMs < definition.invulnerableUntilMs,
      alive: definition.alive,
      state: definition.alive ? "alive" : "dead",
    }));
  });

  return createHealthResult({
    healthRecords: errors.length === 0 ? healthRecords : [],
    errors,
  });
}

function validateHealthDefinition(definition, path) {
  const errors = [];

  if (!isRecord(definition)) {
    errors.push(createHealthError(
      RUNTIME_HEALTH_ERRORS.DEFINITION_INVALID,
      "Health definition must be an object.",
      path
    ));
    return errors;
  }

  if (!hasNonEmptyString(definition.instanceId)) {
    errors.push(createHealthError(
      RUNTIME_HEALTH_ERRORS.INSTANCE_ID_REQUIRED,
      "Health definition requires instanceId.",
      `${path}.instanceId`
    ));
  }

  if (!Number.isFinite(definition.health) || definition.health < 0) {
    errors.push(createHealthError(
      RUNTIME_HEALTH_ERRORS.HEALTH_INVALID,
      "Health definition requires non-negative numeric health.",
      `${path}.health`
    ));
  }

  if (!Number.isFinite(definition.maxHealth) || definition.maxHealth <= 0) {
    errors.push(createHealthError(
      RUNTIME_HEALTH_ERRORS.MAX_HEALTH_INVALID,
      "Health definition requires positive numeric maxHealth.",
      `${path}.maxHealth`
    ));
  }

  if (Number.isFinite(definition.health) && Number.isFinite(definition.maxHealth) && definition.health > definition.maxHealth) {
    errors.push(createHealthError(
      RUNTIME_HEALTH_ERRORS.HEALTH_EXCEEDS_MAX,
      "Health cannot exceed maxHealth.",
      `${path}.health`
    ));
  }

  if (!Number.isFinite(definition.invulnerableUntilMs) || definition.invulnerableUntilMs < 0) {
    errors.push(createHealthError(
      RUNTIME_HEALTH_ERRORS.INVULNERABLE_UNTIL_INVALID,
      "Health definition requires non-negative numeric invulnerableUntilMs.",
      `${path}.invulnerableUntilMs`
    ));
  }

  if (typeof definition.alive !== "boolean") {
    errors.push(createHealthError(
      RUNTIME_HEALTH_ERRORS.ALIVE_INVALID,
      "Health definition requires boolean alive state.",
      `${path}.alive`
    ));
  }

  if (Number.isFinite(definition.health) && typeof definition.alive === "boolean") {
    if (definition.health === 0 && definition.alive) {
      errors.push(createHealthError(
        RUNTIME_HEALTH_ERRORS.ALIVE_STATE_INCONSISTENT,
        "Alive state cannot be true when health is zero.",
        `${path}.alive`
      ));
    }

    if (definition.health > 0 && !definition.alive) {
      errors.push(createHealthError(
        RUNTIME_HEALTH_ERRORS.ALIVE_STATE_INCONSISTENT,
        "Alive state cannot be false when health is above zero.",
        `${path}.alive`
      ));
    }
  }

  return errors;
}

function createHealthResult({ healthRecords, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    healthRecords: Object.freeze(healthRecords),
    errors: Object.freeze(errors),
  });
}

function createHealthError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
