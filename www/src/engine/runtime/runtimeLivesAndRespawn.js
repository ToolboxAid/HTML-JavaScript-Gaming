/*
Toolbox Aid
David Quesenberry
06/03/2026
runtimeLivesAndRespawn.js
*/

export const RUNTIME_LIFE_EVENT_TYPES = Object.freeze({
  DEATH: "death",
});

export const RUNTIME_LIVES_RESPAWN_ERRORS = Object.freeze({
  LIFE_RECORDS_INVALID: "RUNTIME_LIFE_RECORDS_INVALID",
  RESPAWN_RULES_INVALID: "RUNTIME_RESPAWN_RULES_INVALID",
  LIFE_EVENTS_INVALID: "RUNTIME_LIFE_EVENTS_INVALID",
  LIFE_RECORD_INVALID: "RUNTIME_LIFE_RECORD_INVALID",
  RESPAWN_RULE_INVALID: "RUNTIME_RESPAWN_RULE_INVALID",
  LIFE_EVENT_INVALID: "RUNTIME_LIFE_EVENT_INVALID",
  TARGET_MISSING: "RUNTIME_LIFE_TARGET_MISSING",
  RESPAWN_RULE_MISSING: "RUNTIME_RESPAWN_RULE_MISSING",
  RESPAWN_LOCATION_INVALID: "RUNTIME_RESPAWN_LOCATION_INVALID",
});

export function processRuntimeLivesAndRespawn({ lifeRecords, respawnRules, lifeEvents }) {
  const errors = [];

  if (!Array.isArray(lifeRecords)) {
    errors.push(createLivesRespawnError(
      RUNTIME_LIVES_RESPAWN_ERRORS.LIFE_RECORDS_INVALID,
      "Lives/respawn processing requires lifeRecords array.",
      "lifeRecords"
    ));
  }

  if (!Array.isArray(respawnRules)) {
    errors.push(createLivesRespawnError(
      RUNTIME_LIVES_RESPAWN_ERRORS.RESPAWN_RULES_INVALID,
      "Lives/respawn processing requires respawnRules array.",
      "respawnRules"
    ));
  }

  if (!Array.isArray(lifeEvents)) {
    errors.push(createLivesRespawnError(
      RUNTIME_LIVES_RESPAWN_ERRORS.LIFE_EVENTS_INVALID,
      "Lives/respawn processing requires lifeEvents array.",
      "lifeEvents"
    ));
  }

  if (errors.length > 0) {
    return createLivesRespawnResult({ lifeRecords: [], respawnEvents: [], terminalEvents: [], errors });
  }

  lifeRecords.forEach((lifeRecord, index) => {
    validateLifeRecord(lifeRecord, `lifeRecords[${index}]`).forEach((error) => errors.push(error));
  });

  respawnRules.forEach((respawnRule, index) => {
    validateRespawnRule(respawnRule, `respawnRules[${index}]`).forEach((error) => errors.push(error));
  });

  lifeEvents.forEach((lifeEvent, index) => {
    validateLifeEvent(lifeEvent, `lifeEvents[${index}]`).forEach((error) => errors.push(error));
  });

  lifeEvents.forEach((lifeEvent, index) => {
    const target = lifeRecords.find((lifeRecord) => lifeRecord.instanceId === lifeEvent.targetInstanceId);

    if (!target) {
      errors.push(createLivesRespawnError(
        RUNTIME_LIVES_RESPAWN_ERRORS.TARGET_MISSING,
        "Life event target does not exist.",
        `lifeEvents[${index}].targetInstanceId`
      ));
      return;
    }

    const rule = respawnRules.find((respawnRule) => respawnRule.respawnRuleId === target.respawnRuleId);

    if (target.lives > 1 && !rule) {
      errors.push(createLivesRespawnError(
        RUNTIME_LIVES_RESPAWN_ERRORS.RESPAWN_RULE_MISSING,
        "Respawn requires a manifest-defined respawn rule.",
        `lifeRecords.${target.instanceId}.respawnRuleId`
      ));
    }
  });

  if (errors.length > 0) {
    return createLivesRespawnResult({ lifeRecords: [], respawnEvents: [], terminalEvents: [], errors });
  }

  const recordsByInstance = new Map(lifeRecords.map((lifeRecord) => [lifeRecord.instanceId, { ...lifeRecord }]));
  const rulesById = new Map(respawnRules.map((respawnRule) => [respawnRule.respawnRuleId, respawnRule]));
  const respawnEvents = [];
  const terminalEvents = [];

  lifeEvents.forEach((lifeEvent) => {
    if (lifeEvent.eventType !== RUNTIME_LIFE_EVENT_TYPES.DEATH) {
      return;
    }

    const lifeRecord = recordsByInstance.get(lifeEvent.targetInstanceId);

    if (lifeRecord.lives > 1) {
      const rule = rulesById.get(lifeRecord.respawnRuleId);

      lifeRecord.lives -= 1;
      lifeRecord.alive = true;
      lifeRecord.sceneId = rule.sceneId;
      lifeRecord.position = { ...rule.position };

      respawnEvents.push(Object.freeze({
        targetInstanceId: lifeRecord.instanceId,
        respawnRuleId: rule.respawnRuleId,
        sceneId: rule.sceneId,
        position: Object.freeze({ ...rule.position }),
        livesRemaining: lifeRecord.lives,
      }));
      return;
    }

    lifeRecord.lives = 0;
    lifeRecord.alive = false;

    terminalEvents.push(Object.freeze({
      targetInstanceId: lifeRecord.instanceId,
      reason: "noLivesRemaining",
    }));
  });

  const updatedLifeRecords = [...recordsByInstance.values()].map((lifeRecord) => Object.freeze({
    ...lifeRecord,
    position: Object.freeze({ ...lifeRecord.position }),
  }));

  return createLivesRespawnResult({
    lifeRecords: updatedLifeRecords,
    respawnEvents,
    terminalEvents,
    errors,
  });
}

function validateLifeRecord(lifeRecord, path) {
  const errors = [];

  if (!isRecord(lifeRecord)) {
    errors.push(createLivesRespawnError(RUNTIME_LIVES_RESPAWN_ERRORS.LIFE_RECORD_INVALID, "Life record must be an object.", path));
    return errors;
  }

  if (!hasNonEmptyString(lifeRecord.instanceId) || !Number.isInteger(lifeRecord.lives) || lifeRecord.lives < 0 || !hasNonEmptyString(lifeRecord.respawnRuleId) || typeof lifeRecord.alive !== "boolean" || !hasNonEmptyString(lifeRecord.sceneId) || !isPosition(lifeRecord.position)) {
    errors.push(createLivesRespawnError(
      RUNTIME_LIVES_RESPAWN_ERRORS.LIFE_RECORD_INVALID,
      "Life record requires instanceId, lives, respawnRuleId, alive, sceneId, and position.",
      path
    ));
  }

  return errors;
}

function validateRespawnRule(respawnRule, path) {
  const errors = [];

  if (!isRecord(respawnRule)) {
    errors.push(createLivesRespawnError(RUNTIME_LIVES_RESPAWN_ERRORS.RESPAWN_RULE_INVALID, "Respawn rule must be an object.", path));
    return errors;
  }

  if (!hasNonEmptyString(respawnRule.respawnRuleId) || !hasNonEmptyString(respawnRule.sceneId)) {
    errors.push(createLivesRespawnError(
      RUNTIME_LIVES_RESPAWN_ERRORS.RESPAWN_RULE_INVALID,
      "Respawn rule requires respawnRuleId and sceneId.",
      path
    ));
  }

  if (!isPosition(respawnRule.position)) {
    errors.push(createLivesRespawnError(
      RUNTIME_LIVES_RESPAWN_ERRORS.RESPAWN_LOCATION_INVALID,
      "Respawn rule requires explicit numeric position.",
      `${path}.position`
    ));
  }

  return errors;
}

function validateLifeEvent(lifeEvent, path) {
  const errors = [];

  if (!isRecord(lifeEvent)) {
    errors.push(createLivesRespawnError(RUNTIME_LIVES_RESPAWN_ERRORS.LIFE_EVENT_INVALID, "Life event must be an object.", path));
    return errors;
  }

  if (lifeEvent.eventType !== RUNTIME_LIFE_EVENT_TYPES.DEATH || !hasNonEmptyString(lifeEvent.targetInstanceId)) {
    errors.push(createLivesRespawnError(
      RUNTIME_LIVES_RESPAWN_ERRORS.LIFE_EVENT_INVALID,
      "Life event requires death eventType and targetInstanceId.",
      path
    ));
  }

  return errors;
}

function createLivesRespawnResult({ lifeRecords, respawnEvents, terminalEvents, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    lifeRecords: Object.freeze(lifeRecords),
    respawnEvents: Object.freeze(respawnEvents),
    terminalEvents: Object.freeze(terminalEvents),
    errors: Object.freeze(errors),
  });
}

function createLivesRespawnError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isPosition(value) {
  return isRecord(value) && Number.isFinite(value.x) && Number.isFinite(value.y);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
