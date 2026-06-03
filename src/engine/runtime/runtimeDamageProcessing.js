/*
Toolbox Aid
David Quesenberry
06/03/2026
runtimeDamageProcessing.js
*/

export const RUNTIME_DAMAGE_SOURCE_TYPES = Object.freeze({
  ACTION: "action",
  TERRAIN: "terrain",
  COLLISION: "collision",
  TRIGGER: "trigger",
});

export const RUNTIME_DAMAGE_SOURCE_TYPE_LIST = Object.freeze(Object.values(RUNTIME_DAMAGE_SOURCE_TYPES));

export const RUNTIME_DAMAGE_ERRORS = Object.freeze({
  HEALTH_RECORDS_INVALID: "RUNTIME_DAMAGE_HEALTH_RECORDS_INVALID",
  DAMAGE_SOURCES_INVALID: "RUNTIME_DAMAGE_SOURCES_INVALID",
  CURRENT_TIME_INVALID: "RUNTIME_DAMAGE_CURRENT_TIME_INVALID",
  HEALTH_RECORD_INVALID: "RUNTIME_DAMAGE_HEALTH_RECORD_INVALID",
  DAMAGE_SOURCE_INVALID: "RUNTIME_DAMAGE_SOURCE_INVALID",
  SOURCE_TYPE_INVALID: "RUNTIME_DAMAGE_SOURCE_TYPE_INVALID",
  SOURCE_ID_REQUIRED: "RUNTIME_DAMAGE_SOURCE_ID_REQUIRED",
  TARGET_INSTANCE_REQUIRED: "RUNTIME_DAMAGE_TARGET_INSTANCE_REQUIRED",
  AMOUNT_INVALID: "RUNTIME_DAMAGE_AMOUNT_INVALID",
  TARGET_MISSING: "RUNTIME_DAMAGE_TARGET_MISSING",
});

export function processRuntimeDamage({ healthRecords, damageSources, currentTimeMs }) {
  const errors = [];

  if (!Array.isArray(healthRecords)) {
    errors.push(createDamageError(
      RUNTIME_DAMAGE_ERRORS.HEALTH_RECORDS_INVALID,
      "Damage processing requires healthRecords array.",
      "healthRecords"
    ));
  }

  if (!Array.isArray(damageSources)) {
    errors.push(createDamageError(
      RUNTIME_DAMAGE_ERRORS.DAMAGE_SOURCES_INVALID,
      "Damage processing requires damageSources array.",
      "damageSources"
    ));
  }

  if (!Number.isFinite(currentTimeMs)) {
    errors.push(createDamageError(
      RUNTIME_DAMAGE_ERRORS.CURRENT_TIME_INVALID,
      "Damage processing requires numeric currentTimeMs.",
      "currentTimeMs"
    ));
  }

  if (errors.length > 0) {
    return createDamageResult({ healthRecords: [], damageEvents: [], preventedEvents: [], errors });
  }

  healthRecords.forEach((healthRecord, index) => {
    validateHealthRecord(healthRecord, `healthRecords[${index}]`).forEach((error) => errors.push(error));
  });

  damageSources.forEach((damageSource, index) => {
    validateDamageSource(damageSource, `damageSources[${index}]`).forEach((error) => errors.push(error));
  });

  damageSources.forEach((damageSource, index) => {
    if (!healthRecords.some((healthRecord) => healthRecord.instanceId === damageSource.targetInstanceId)) {
      errors.push(createDamageError(
        RUNTIME_DAMAGE_ERRORS.TARGET_MISSING,
        "Damage source target does not exist.",
        `damageSources[${index}].targetInstanceId`
      ));
    }
  });

  if (errors.length > 0) {
    return createDamageResult({ healthRecords: [], damageEvents: [], preventedEvents: [], errors });
  }

  const recordsByInstance = new Map(healthRecords.map((healthRecord) => [healthRecord.instanceId, { ...healthRecord }]));
  const damageEvents = [];
  const preventedEvents = [];

  damageSources.forEach((damageSource) => {
    const healthRecord = recordsByInstance.get(damageSource.targetInstanceId);

    if (!healthRecord.alive) {
      preventedEvents.push(Object.freeze({
        sourceId: damageSource.sourceId,
        sourceType: damageSource.sourceType,
        targetInstanceId: damageSource.targetInstanceId,
        reason: "dead",
      }));
      return;
    }

    if (currentTimeMs < healthRecord.invulnerableUntilMs) {
      preventedEvents.push(Object.freeze({
        sourceId: damageSource.sourceId,
        sourceType: damageSource.sourceType,
        targetInstanceId: damageSource.targetInstanceId,
        reason: "invulnerable",
      }));
      return;
    }

    const nextHealth = Math.max(0, healthRecord.health - damageSource.amount);

    healthRecord.health = nextHealth;
    healthRecord.alive = nextHealth > 0;
    healthRecord.state = healthRecord.alive ? "alive" : "dead";

    damageEvents.push(Object.freeze({
      sourceId: damageSource.sourceId,
      sourceType: damageSource.sourceType,
      targetInstanceId: damageSource.targetInstanceId,
      amount: damageSource.amount,
      health: nextHealth,
      alive: healthRecord.alive,
    }));
  });

  const updatedHealthRecords = [...recordsByInstance.values()].map((healthRecord) => Object.freeze({
    ...healthRecord,
    invulnerable: currentTimeMs < healthRecord.invulnerableUntilMs,
  }));

  return createDamageResult({
    healthRecords: updatedHealthRecords,
    damageEvents,
    preventedEvents,
    errors,
  });
}

function validateHealthRecord(healthRecord, path) {
  const errors = [];

  if (!isRecord(healthRecord)) {
    errors.push(createDamageError(
      RUNTIME_DAMAGE_ERRORS.HEALTH_RECORD_INVALID,
      "Health record must be an object.",
      path
    ));
    return errors;
  }

  if (!hasNonEmptyString(healthRecord.instanceId) || !Number.isFinite(healthRecord.health) || !Number.isFinite(healthRecord.maxHealth) || !Number.isFinite(healthRecord.invulnerableUntilMs) || typeof healthRecord.alive !== "boolean") {
    errors.push(createDamageError(
      RUNTIME_DAMAGE_ERRORS.HEALTH_RECORD_INVALID,
      "Health record requires instanceId, health, maxHealth, invulnerableUntilMs, and alive.",
      path
    ));
  }

  return errors;
}

function validateDamageSource(damageSource, path) {
  const errors = [];

  if (!isRecord(damageSource)) {
    errors.push(createDamageError(
      RUNTIME_DAMAGE_ERRORS.DAMAGE_SOURCE_INVALID,
      "Damage source must be an object.",
      path
    ));
    return errors;
  }

  if (!RUNTIME_DAMAGE_SOURCE_TYPE_LIST.includes(damageSource.sourceType)) {
    errors.push(createDamageError(
      RUNTIME_DAMAGE_ERRORS.SOURCE_TYPE_INVALID,
      "Damage source uses an unsupported sourceType.",
      `${path}.sourceType`
    ));
  }

  if (!hasNonEmptyString(damageSource.sourceId)) {
    errors.push(createDamageError(
      RUNTIME_DAMAGE_ERRORS.SOURCE_ID_REQUIRED,
      "Damage source requires sourceId.",
      `${path}.sourceId`
    ));
  }

  if (!hasNonEmptyString(damageSource.targetInstanceId)) {
    errors.push(createDamageError(
      RUNTIME_DAMAGE_ERRORS.TARGET_INSTANCE_REQUIRED,
      "Damage source requires targetInstanceId.",
      `${path}.targetInstanceId`
    ));
  }

  if (!Number.isFinite(damageSource.amount) || damageSource.amount <= 0) {
    errors.push(createDamageError(
      RUNTIME_DAMAGE_ERRORS.AMOUNT_INVALID,
      "Damage source requires positive numeric amount.",
      `${path}.amount`
    ));
  }

  return errors;
}

function createDamageResult({ healthRecords, damageEvents, preventedEvents, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    healthRecords: Object.freeze(healthRecords),
    damageEvents: Object.freeze(damageEvents),
    preventedEvents: Object.freeze(preventedEvents),
    errors: Object.freeze(errors),
  });
}

function createDamageError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
