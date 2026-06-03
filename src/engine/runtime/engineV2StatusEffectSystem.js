/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2StatusEffectSystem.js
*/

import { processRuntimeDamage } from "./runtimeDamageProcessing.js";

export const ENGINE_V2_STATUS_EFFECT_TYPES = Object.freeze({
  POISON: "poison",
  STUN: "stun",
  FREEZE: "freeze",
  BURN: "burn",
  SLOW: "slow",
  HASTE: "haste",
  CUSTOM: "custom",
});

export const ENGINE_V2_STATUS_EFFECT_TYPE_LIST = Object.freeze(Object.values(ENGINE_V2_STATUS_EFFECT_TYPES));

export const ENGINE_V2_STATUS_EFFECT_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "ENGINE_V2_STATUS_EFFECT_DEFINITIONS_INVALID",
  APPLICATIONS_INVALID: "ENGINE_V2_STATUS_EFFECT_APPLICATIONS_INVALID",
  ACTIVE_EFFECTS_INVALID: "ENGINE_V2_ACTIVE_STATUS_EFFECTS_INVALID",
  HEALTH_RECORDS_INVALID: "ENGINE_V2_STATUS_EFFECT_HEALTH_RECORDS_INVALID",
  DELTA_INVALID: "ENGINE_V2_STATUS_EFFECT_DELTA_INVALID",
  CURRENT_TIME_INVALID: "ENGINE_V2_STATUS_EFFECT_CURRENT_TIME_INVALID",
  DEFINITION_INVALID: "ENGINE_V2_STATUS_EFFECT_DEFINITION_INVALID",
  APPLICATION_INVALID: "ENGINE_V2_STATUS_EFFECT_APPLICATION_INVALID",
  ACTIVE_EFFECT_INVALID: "ENGINE_V2_ACTIVE_STATUS_EFFECT_INVALID",
  DEFINITION_MISSING: "ENGINE_V2_STATUS_EFFECT_DEFINITION_MISSING",
  TARGET_MISSING: "ENGINE_V2_STATUS_EFFECT_TARGET_MISSING",
  DAMAGE_FAILED: "ENGINE_V2_STATUS_EFFECT_DAMAGE_FAILED",
});

export function processEngineV2StatusEffects({ statusEffectDefinitions, statusApplications, activeStatusEffects, healthRecords, deltaMs, currentTimeMs }) {
  const errors = [];

  if (!Array.isArray(statusEffectDefinitions)) {
    errors.push(createStatusEffectError(ENGINE_V2_STATUS_EFFECT_ERRORS.DEFINITIONS_INVALID, "Status effect runtime requires statusEffectDefinitions array.", "statusEffectDefinitions"));
  }

  if (!Array.isArray(statusApplications)) {
    errors.push(createStatusEffectError(ENGINE_V2_STATUS_EFFECT_ERRORS.APPLICATIONS_INVALID, "Status effect runtime requires statusApplications array.", "statusApplications"));
  }

  if (!Array.isArray(activeStatusEffects)) {
    errors.push(createStatusEffectError(ENGINE_V2_STATUS_EFFECT_ERRORS.ACTIVE_EFFECTS_INVALID, "Status effect runtime requires activeStatusEffects array.", "activeStatusEffects"));
  }

  if (!Array.isArray(healthRecords)) {
    errors.push(createStatusEffectError(ENGINE_V2_STATUS_EFFECT_ERRORS.HEALTH_RECORDS_INVALID, "Status effect runtime requires healthRecords array.", "healthRecords"));
  }

  if (!Number.isFinite(deltaMs) || deltaMs < 0) {
    errors.push(createStatusEffectError(ENGINE_V2_STATUS_EFFECT_ERRORS.DELTA_INVALID, "Status effect runtime requires non-negative numeric deltaMs.", "deltaMs"));
  }

  if (!Number.isFinite(currentTimeMs)) {
    errors.push(createStatusEffectError(ENGINE_V2_STATUS_EFFECT_ERRORS.CURRENT_TIME_INVALID, "Status effect runtime requires numeric currentTimeMs.", "currentTimeMs"));
  }

  if (errors.length > 0) {
    return createStatusEffectResult({ statusEffects: [], healthRecords: [], damageSources: [], damageEvents: [], movementModifiers: [], statusEvents: [], errors });
  }

  statusEffectDefinitions.forEach((definition, index) => {
    validateStatusEffectDefinition(definition, `statusEffectDefinitions[${index}]`).forEach((error) => errors.push(error));
  });
  statusApplications.forEach((application, index) => {
    validateStatusApplication(application, `statusApplications[${index}]`).forEach((error) => errors.push(error));
  });
  activeStatusEffects.forEach((effect, index) => {
    validateActiveStatusEffect(effect, `activeStatusEffects[${index}]`).forEach((error) => errors.push(error));
  });

  const definitionsById = new Map(statusEffectDefinitions.map((definition) => [definition.statusEffectId, definition]));

  statusApplications.forEach((application, index) => {
    if (!definitionsById.has(application.statusEffectId)) {
      errors.push(createStatusEffectError(ENGINE_V2_STATUS_EFFECT_ERRORS.DEFINITION_MISSING, "Status application references missing definition.", `statusApplications[${index}].statusEffectId`));
    }

    if (!healthRecords.some((healthRecord) => healthRecord.instanceId === application.targetInstanceId)) {
      errors.push(createStatusEffectError(ENGINE_V2_STATUS_EFFECT_ERRORS.TARGET_MISSING, "Status application target does not exist.", `statusApplications[${index}].targetInstanceId`));
    }
  });

  activeStatusEffects.forEach((effect, index) => {
    if (!definitionsById.has(effect.statusEffectId)) {
      errors.push(createStatusEffectError(ENGINE_V2_STATUS_EFFECT_ERRORS.DEFINITION_MISSING, "Active status effect references missing definition.", `activeStatusEffects[${index}].statusEffectId`));
    }

    if (!healthRecords.some((healthRecord) => healthRecord.instanceId === effect.targetInstanceId)) {
      errors.push(createStatusEffectError(ENGINE_V2_STATUS_EFFECT_ERRORS.TARGET_MISSING, "Active status effect target does not exist.", `activeStatusEffects[${index}].targetInstanceId`));
    }
  });

  if (errors.length > 0) {
    return createStatusEffectResult({ statusEffects: [], healthRecords: [], damageSources: [], damageEvents: [], movementModifiers: [], statusEvents: [], errors });
  }

  const appliedEffects = statusApplications.map((application) => {
    const definition = definitionsById.get(application.statusEffectId);

    return Object.freeze({
      effectInstanceId: application.applicationId,
      statusEffectId: application.statusEffectId,
      targetInstanceId: application.targetInstanceId,
      sourceId: application.sourceId,
      remainingMs: definition.durationMs,
      elapsedSinceTickMs: 0,
    });
  });
  const statusEffects = [...activeStatusEffects, ...appliedEffects]
    .map((effect) => advanceStatusEffect(effect, definitionsById.get(effect.statusEffectId), deltaMs))
    .filter((effect) => effect.remainingMs > 0)
    .map((effect) => Object.freeze(effect));
  const damageSources = createStatusDamageSources(statusEffects, definitionsById);
  const damageResult = processRuntimeDamage({ healthRecords, damageSources, currentTimeMs });

  if (!damageResult.valid) {
    return createStatusEffectResult({
      statusEffects: [],
      healthRecords: [],
      damageSources: [],
      damageEvents: [],
      movementModifiers: [],
      statusEvents: [],
      errors: [
        createStatusEffectError(ENGINE_V2_STATUS_EFFECT_ERRORS.DAMAGE_FAILED, "Status effect damage integration failed.", "damageSources"),
        ...damageResult.errors,
      ],
    });
  }

  return createStatusEffectResult({
    statusEffects,
    healthRecords: damageResult.healthRecords,
    damageSources,
    damageEvents: damageResult.damageEvents,
    movementModifiers: createMovementModifiers(statusEffects, definitionsById),
    statusEvents: statusEffects.map((effect) => Object.freeze({
      effectInstanceId: effect.effectInstanceId,
      statusEffectId: effect.statusEffectId,
      targetInstanceId: effect.targetInstanceId,
    })),
    errors,
  });
}

function advanceStatusEffect(effect, definition, deltaMs) {
  return {
    ...effect,
    remainingMs: Math.max(0, effect.remainingMs - deltaMs),
    elapsedSinceTickMs: effect.elapsedSinceTickMs + deltaMs,
    tickReady: Number.isFinite(definition.tickIntervalMs) && definition.tickIntervalMs > 0 && effect.elapsedSinceTickMs + deltaMs >= definition.tickIntervalMs,
  };
}

function createStatusDamageSources(statusEffects, definitionsById) {
  return statusEffects
    .filter((effect) => effect.tickReady)
    .map((effect) => {
      const definition = definitionsById.get(effect.statusEffectId);

      if (!Number.isFinite(definition.damagePerTick) || definition.damagePerTick <= 0) {
        return null;
      }

      return Object.freeze({
        sourceId: effect.effectInstanceId,
        sourceType: "trigger",
        targetInstanceId: effect.targetInstanceId,
        amount: definition.damagePerTick,
      });
    })
    .filter((damageSource) => damageSource !== null);
}

function createMovementModifiers(statusEffects, definitionsById) {
  return statusEffects
    .map((effect) => {
      const definition = definitionsById.get(effect.statusEffectId);

      if (!Number.isFinite(definition.movementMultiplier)) {
        return null;
      }

      return Object.freeze({
        effectInstanceId: effect.effectInstanceId,
        targetInstanceId: effect.targetInstanceId,
        movementMultiplier: definition.movementMultiplier,
      });
    })
    .filter((modifier) => modifier !== null);
}

function validateStatusEffectDefinition(definition, path) {
  if (!isRecord(definition) || !hasNonEmptyString(definition.statusEffectId) || !ENGINE_V2_STATUS_EFFECT_TYPE_LIST.includes(definition.effectType) || !Number.isFinite(definition.durationMs) || definition.durationMs <= 0 || !hasNonEmptyString(definition.displayName)) {
    return [createStatusEffectError(ENGINE_V2_STATUS_EFFECT_ERRORS.DEFINITION_INVALID, "Status effect definition requires statusEffectId, effectType, displayName, and durationMs.", path)];
  }

  return [];
}

function validateStatusApplication(application, path) {
  if (!isRecord(application) || !hasNonEmptyString(application.applicationId) || !hasNonEmptyString(application.statusEffectId) || !hasNonEmptyString(application.targetInstanceId) || !hasNonEmptyString(application.sourceId)) {
    return [createStatusEffectError(ENGINE_V2_STATUS_EFFECT_ERRORS.APPLICATION_INVALID, "Status application requires applicationId, statusEffectId, targetInstanceId, and sourceId.", path)];
  }

  return [];
}

function validateActiveStatusEffect(effect, path) {
  if (!isRecord(effect) || !hasNonEmptyString(effect.effectInstanceId) || !hasNonEmptyString(effect.statusEffectId) || !hasNonEmptyString(effect.targetInstanceId) || !Number.isFinite(effect.remainingMs) || !Number.isFinite(effect.elapsedSinceTickMs)) {
    return [createStatusEffectError(ENGINE_V2_STATUS_EFFECT_ERRORS.ACTIVE_EFFECT_INVALID, "Active status effect requires effectInstanceId, statusEffectId, targetInstanceId, remainingMs, and elapsedSinceTickMs.", path)];
  }

  return [];
}

function createStatusEffectResult({ statusEffects, healthRecords, damageSources, damageEvents, movementModifiers, statusEvents, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    statusEffects: Object.freeze(statusEffects),
    healthRecords: Object.freeze(healthRecords),
    damageSources: Object.freeze(damageSources),
    damageEvents: Object.freeze(damageEvents),
    movementModifiers: Object.freeze(movementModifiers),
    statusEvents: Object.freeze(statusEvents),
    errors: Object.freeze(errors),
  });
}

function createStatusEffectError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
