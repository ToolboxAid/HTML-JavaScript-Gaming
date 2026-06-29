/*
Toolbox Aid
David Quesenberry
06/03/2026
runtimeOutcomeProcessing.js
*/

export const RUNTIME_OUTCOME_TYPES = Object.freeze({
  WIN: "win",
  LOSE: "lose",
  DRAW: "draw",
  STATE: "state",
});

export const RUNTIME_OUTCOME_TYPE_LIST = Object.freeze(Object.values(RUNTIME_OUTCOME_TYPES));

export const RUNTIME_OUTCOME_CONDITION_TYPES = Object.freeze({
  SCORE: "score",
  HEALTH: "health",
  LIVES: "lives",
  TIMER: "timer",
  OBJECT_STATE: "objectState",
  SCENE_STATE: "sceneState",
});

export const RUNTIME_OUTCOME_CONDITION_TYPE_LIST = Object.freeze(Object.values(RUNTIME_OUTCOME_CONDITION_TYPES));

export const RUNTIME_OUTCOME_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "RUNTIME_OUTCOME_DEFINITIONS_INVALID",
  RUNTIME_STATE_INVALID: "RUNTIME_OUTCOME_RUNTIME_STATE_INVALID",
  DEFINITION_INVALID: "RUNTIME_OUTCOME_DEFINITION_INVALID",
  OUTCOME_ID_REQUIRED: "RUNTIME_OUTCOME_ID_REQUIRED",
  OUTCOME_TYPE_INVALID: "RUNTIME_OUTCOME_TYPE_INVALID",
  CONDITION_TYPE_INVALID: "RUNTIME_OUTCOME_CONDITION_TYPE_INVALID",
  COMPARATOR_INVALID: "RUNTIME_OUTCOME_COMPARATOR_INVALID",
  VALUE_REQUIRED: "RUNTIME_OUTCOME_VALUE_REQUIRED",
  SCORE_KEY_REQUIRED: "RUNTIME_OUTCOME_SCORE_KEY_REQUIRED",
  INSTANCE_ID_REQUIRED: "RUNTIME_OUTCOME_INSTANCE_ID_REQUIRED",
  STATE_KEY_REQUIRED: "RUNTIME_OUTCOME_STATE_KEY_REQUIRED",
  SCENE_ID_REQUIRED: "RUNTIME_OUTCOME_SCENE_ID_REQUIRED",
});

export function evaluateRuntimeOutcomes({ outcomeDefinitions, runtimeState }) {
  const errors = [];

  if (!Array.isArray(outcomeDefinitions)) {
    errors.push(createOutcomeError(
      RUNTIME_OUTCOME_ERRORS.DEFINITIONS_INVALID,
      "Outcome processing requires outcomeDefinitions array.",
      "outcomeDefinitions"
    ));
  }

  if (!isRuntimeState(runtimeState)) {
    errors.push(createOutcomeError(
      RUNTIME_OUTCOME_ERRORS.RUNTIME_STATE_INVALID,
      "Outcome processing requires runtimeState with scores, healthRecords, lifeRecords, elapsedMs, objectStates, and sceneStates.",
      "runtimeState"
    ));
  }

  if (errors.length > 0) {
    return createOutcomeResult({ matchedOutcomes: [], errors });
  }

  outcomeDefinitions.forEach((definition, index) => {
    validateOutcomeDefinition(definition, `outcomeDefinitions[${index}]`).forEach((error) => errors.push(error));
  });

  if (errors.length > 0) {
    return createOutcomeResult({ matchedOutcomes: [], errors });
  }

  const matchedOutcomes = outcomeDefinitions
    .filter((definition) => outcomeMatchesRuntimeState(definition, runtimeState))
    .map((definition) => Object.freeze({
      outcomeId: definition.outcomeId,
      outcomeType: definition.outcomeType,
      conditionType: definition.conditionType,
    }));

  return createOutcomeResult({ matchedOutcomes, errors });
}

function validateOutcomeDefinition(definition, path) {
  const errors = [];

  if (!isRecord(definition)) {
    errors.push(createOutcomeError(RUNTIME_OUTCOME_ERRORS.DEFINITION_INVALID, "Outcome definition must be an object.", path));
    return errors;
  }

  if (!hasNonEmptyString(definition.outcomeId)) {
    errors.push(createOutcomeError(RUNTIME_OUTCOME_ERRORS.OUTCOME_ID_REQUIRED, "Outcome definition requires outcomeId.", `${path}.outcomeId`));
  }

  if (!RUNTIME_OUTCOME_TYPE_LIST.includes(definition.outcomeType)) {
    errors.push(createOutcomeError(RUNTIME_OUTCOME_ERRORS.OUTCOME_TYPE_INVALID, "Outcome definition uses unsupported outcomeType.", `${path}.outcomeType`));
  }

  if (!RUNTIME_OUTCOME_CONDITION_TYPE_LIST.includes(definition.conditionType)) {
    errors.push(createOutcomeError(RUNTIME_OUTCOME_ERRORS.CONDITION_TYPE_INVALID, "Outcome definition uses unsupported conditionType.", `${path}.conditionType`));
  }

  if (!["eq", "gte", "lte"].includes(definition.comparator)) {
    errors.push(createOutcomeError(RUNTIME_OUTCOME_ERRORS.COMPARATOR_INVALID, "Outcome definition comparator must be eq, gte, or lte.", `${path}.comparator`));
  }

  if (!Object.prototype.hasOwnProperty.call(definition, "value")) {
    errors.push(createOutcomeError(RUNTIME_OUTCOME_ERRORS.VALUE_REQUIRED, "Outcome definition requires value.", `${path}.value`));
  }

  validateOutcomeConditionFields(definition, path).forEach((error) => errors.push(error));

  return errors;
}

function validateOutcomeConditionFields(definition, path) {
  if (definition.conditionType === RUNTIME_OUTCOME_CONDITION_TYPES.SCORE) {
    return hasNonEmptyString(definition.scoreKey)
      ? []
      : [createOutcomeError(RUNTIME_OUTCOME_ERRORS.SCORE_KEY_REQUIRED, "Score outcome requires scoreKey.", `${path}.scoreKey`)];
  }

  if (definition.conditionType === RUNTIME_OUTCOME_CONDITION_TYPES.HEALTH || definition.conditionType === RUNTIME_OUTCOME_CONDITION_TYPES.LIVES || definition.conditionType === RUNTIME_OUTCOME_CONDITION_TYPES.OBJECT_STATE) {
    const errors = [];

    if (!hasNonEmptyString(definition.instanceId)) {
      errors.push(createOutcomeError(RUNTIME_OUTCOME_ERRORS.INSTANCE_ID_REQUIRED, "Outcome condition requires instanceId.", `${path}.instanceId`));
    }

    if (definition.conditionType === RUNTIME_OUTCOME_CONDITION_TYPES.OBJECT_STATE && !hasNonEmptyString(definition.stateKey)) {
      errors.push(createOutcomeError(RUNTIME_OUTCOME_ERRORS.STATE_KEY_REQUIRED, "Object state outcome requires stateKey.", `${path}.stateKey`));
    }

    return errors;
  }

  if (definition.conditionType === RUNTIME_OUTCOME_CONDITION_TYPES.SCENE_STATE) {
    const errors = [];

    if (!hasNonEmptyString(definition.sceneId)) {
      errors.push(createOutcomeError(RUNTIME_OUTCOME_ERRORS.SCENE_ID_REQUIRED, "Scene state outcome requires sceneId.", `${path}.sceneId`));
    }

    if (!hasNonEmptyString(definition.stateKey)) {
      errors.push(createOutcomeError(RUNTIME_OUTCOME_ERRORS.STATE_KEY_REQUIRED, "Scene state outcome requires stateKey.", `${path}.stateKey`));
    }

    return errors;
  }

  return [];
}

function outcomeMatchesRuntimeState(definition, runtimeState) {
  if (definition.conditionType === RUNTIME_OUTCOME_CONDITION_TYPES.SCORE) {
    return compareValue(runtimeState.scores[definition.scoreKey], definition.comparator, definition.value);
  }

  if (definition.conditionType === RUNTIME_OUTCOME_CONDITION_TYPES.HEALTH) {
    const healthRecord = runtimeState.healthRecords.find((record) => record.instanceId === definition.instanceId);
    return Boolean(healthRecord) && compareValue(healthRecord.health, definition.comparator, definition.value);
  }

  if (definition.conditionType === RUNTIME_OUTCOME_CONDITION_TYPES.LIVES) {
    const lifeRecord = runtimeState.lifeRecords.find((record) => record.instanceId === definition.instanceId);
    return Boolean(lifeRecord) && compareValue(lifeRecord.lives, definition.comparator, definition.value);
  }

  if (definition.conditionType === RUNTIME_OUTCOME_CONDITION_TYPES.TIMER) {
    return compareValue(runtimeState.elapsedMs, definition.comparator, definition.value);
  }

  if (definition.conditionType === RUNTIME_OUTCOME_CONDITION_TYPES.OBJECT_STATE) {
    const objectState = runtimeState.objectStates[definition.instanceId];
    return isRecord(objectState) && compareValue(objectState[definition.stateKey], definition.comparator, definition.value);
  }

  if (definition.conditionType === RUNTIME_OUTCOME_CONDITION_TYPES.SCENE_STATE) {
    const sceneState = runtimeState.sceneStates[definition.sceneId];
    return isRecord(sceneState) && compareValue(sceneState[definition.stateKey], definition.comparator, definition.value);
  }

  return false;
}

function compareValue(actualValue, comparator, expectedValue) {
  if (comparator === "eq") {
    return actualValue === expectedValue;
  }

  if (comparator === "gte") {
    return Number.isFinite(actualValue) && Number.isFinite(expectedValue) && actualValue >= expectedValue;
  }

  if (comparator === "lte") {
    return Number.isFinite(actualValue) && Number.isFinite(expectedValue) && actualValue <= expectedValue;
  }

  return false;
}

function createOutcomeResult({ matchedOutcomes, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    matchedOutcomes: Object.freeze(matchedOutcomes),
    errors: Object.freeze(errors),
  });
}

function createOutcomeError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRuntimeState(value) {
  return isRecord(value)
    && isRecord(value.scores)
    && Array.isArray(value.healthRecords)
    && Array.isArray(value.lifeRecords)
    && Number.isFinite(value.elapsedMs)
    && isRecord(value.objectStates)
    && isRecord(value.sceneStates);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
