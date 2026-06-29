/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimeConditionSystem.js
*/

export const RUNTIME_CONDITION_TYPES = Object.freeze({
  COLLISION: "collision",
  OVERLAP: "overlap",
  TIMER: "timer",
  SCORE_REACHED: "scoreReached",
  OBJECT_DESTROYED: "objectDestroyed",
  OBJECT_SPAWNED: "objectSpawned",
});

export const RUNTIME_CONDITION_TYPE_LIST = Object.freeze(Object.values(RUNTIME_CONDITION_TYPES));

export const RUNTIME_CONDITION_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "RUNTIME_CONDITION_DEFINITIONS_INVALID",
  DEFINITION_INVALID: "RUNTIME_CONDITION_DEFINITION_INVALID",
  CONDITION_ID_REQUIRED: "RUNTIME_CONDITION_ID_REQUIRED",
  CONDITION_TYPE_INVALID: "RUNTIME_CONDITION_TYPE_INVALID",
  EVENT_TYPE_REQUIRED: "RUNTIME_CONDITION_EVENT_TYPE_REQUIRED",
  FACTS_INVALID: "RUNTIME_CONDITION_FACTS_INVALID",
  COLLISIONS_INVALID: "RUNTIME_CONDITION_COLLISIONS_INVALID",
  OVERLAPS_INVALID: "RUNTIME_CONDITION_OVERLAPS_INVALID",
  ELAPSED_MS_INVALID: "RUNTIME_CONDITION_ELAPSED_MS_INVALID",
  SCORES_INVALID: "RUNTIME_CONDITION_SCORES_INVALID",
  DESTROYED_OBJECT_IDS_INVALID: "RUNTIME_CONDITION_DESTROYED_OBJECT_IDS_INVALID",
  SPAWNED_OBJECT_IDS_INVALID: "RUNTIME_CONDITION_SPAWNED_OBJECT_IDS_INVALID",
  SOURCE_INSTANCE_REQUIRED: "RUNTIME_CONDITION_SOURCE_INSTANCE_REQUIRED",
  TARGET_INSTANCE_REQUIRED: "RUNTIME_CONDITION_TARGET_INSTANCE_REQUIRED",
  THRESHOLD_MS_REQUIRED: "RUNTIME_CONDITION_THRESHOLD_MS_REQUIRED",
  SCORE_KEY_REQUIRED: "RUNTIME_CONDITION_SCORE_KEY_REQUIRED",
  MIN_SCORE_REQUIRED: "RUNTIME_CONDITION_MIN_SCORE_REQUIRED",
  INSTANCE_ID_REQUIRED: "RUNTIME_CONDITION_INSTANCE_ID_REQUIRED",
});

export function readManifestConditionDefinitions(conditionDefinitions) {
  const errors = [];

  if (!Array.isArray(conditionDefinitions)) {
    errors.push(createConditionError(
      RUNTIME_CONDITION_ERRORS.DEFINITIONS_INVALID,
      "Condition definitions must be an explicit array.",
      "conditionDefinitions"
    ));
    return createConditionDefinitionResult({ conditionDefinitions: [], errors });
  }

  const definitions = [];

  conditionDefinitions.forEach((definition, index) => {
    const path = `conditionDefinitions[${index}]`;
    const definitionErrors = validateConditionDefinition(definition, path);

    definitionErrors.forEach((error) => errors.push(error));

    if (definitionErrors.length > 0) {
      return;
    }

    definitions.push(Object.freeze(createConditionDefinition(definition)));
  });

  return createConditionDefinitionResult({
    conditionDefinitions: errors.length === 0 ? definitions : [],
    errors,
  });
}

export function evaluateRuntimeConditions(conditionDefinitions, runtimeFacts) {
  const errors = [];
  const definitionResult = readManifestConditionDefinitions(conditionDefinitions);

  definitionResult.errors.forEach((error) => errors.push(error));
  validateRuntimeFacts(runtimeFacts).forEach((error) => errors.push(error));

  if (errors.length > 0) {
    return createConditionEvaluationResult({ conditionMatches: [], errors });
  }

  const conditionMatches = [];

  definitionResult.conditionDefinitions.forEach((definition) => {
    if (conditionMatchesRuntimeFacts(definition, runtimeFacts)) {
      conditionMatches.push(Object.freeze({
        conditionId: definition.conditionId,
        conditionType: definition.conditionType,
        eventType: definition.eventType,
        payload: Object.freeze(createConditionPayload(definition)),
      }));
    }
  });

  return createConditionEvaluationResult({ conditionMatches, errors });
}

function validateConditionDefinition(definition, path) {
  const errors = [];

  if (!isRecord(definition)) {
    errors.push(createConditionError(
      RUNTIME_CONDITION_ERRORS.DEFINITION_INVALID,
      "Condition definition must be an object.",
      path
    ));
    return errors;
  }

  if (!hasNonEmptyString(definition.conditionId)) {
    errors.push(createConditionError(
      RUNTIME_CONDITION_ERRORS.CONDITION_ID_REQUIRED,
      "Condition definition requires conditionId.",
      `${path}.conditionId`
    ));
  }

  if (!RUNTIME_CONDITION_TYPE_LIST.includes(definition.conditionType)) {
    errors.push(createConditionError(
      RUNTIME_CONDITION_ERRORS.CONDITION_TYPE_INVALID,
      "Condition definition uses an unsupported conditionType.",
      `${path}.conditionType`
    ));
  }

  if (!hasNonEmptyString(definition.eventType)) {
    errors.push(createConditionError(
      RUNTIME_CONDITION_ERRORS.EVENT_TYPE_REQUIRED,
      "Condition definition requires eventType.",
      `${path}.eventType`
    ));
  }

  validateConditionSpecificFields(definition, path).forEach((error) => errors.push(error));

  return errors;
}

function validateConditionSpecificFields(definition, path) {
  if (definition.conditionType === RUNTIME_CONDITION_TYPES.COLLISION || definition.conditionType === RUNTIME_CONDITION_TYPES.OVERLAP) {
    return validateSourceTargetFields(definition, path);
  }

  if (definition.conditionType === RUNTIME_CONDITION_TYPES.TIMER) {
    return Number.isFinite(definition.thresholdMs)
      ? []
      : [createConditionError(
        RUNTIME_CONDITION_ERRORS.THRESHOLD_MS_REQUIRED,
        "Timer condition requires numeric thresholdMs.",
        `${path}.thresholdMs`
      )];
  }

  if (definition.conditionType === RUNTIME_CONDITION_TYPES.SCORE_REACHED) {
    const errors = [];

    if (!hasNonEmptyString(definition.scoreKey)) {
      errors.push(createConditionError(
        RUNTIME_CONDITION_ERRORS.SCORE_KEY_REQUIRED,
        "Score reached condition requires scoreKey.",
        `${path}.scoreKey`
      ));
    }

    if (!Number.isFinite(definition.minScore)) {
      errors.push(createConditionError(
        RUNTIME_CONDITION_ERRORS.MIN_SCORE_REQUIRED,
        "Score reached condition requires numeric minScore.",
        `${path}.minScore`
      ));
    }

    return errors;
  }

  if (definition.conditionType === RUNTIME_CONDITION_TYPES.OBJECT_DESTROYED || definition.conditionType === RUNTIME_CONDITION_TYPES.OBJECT_SPAWNED) {
    return hasNonEmptyString(definition.instanceId)
      ? []
      : [createConditionError(
        RUNTIME_CONDITION_ERRORS.INSTANCE_ID_REQUIRED,
        "Object lifecycle condition requires instanceId.",
        `${path}.instanceId`
      )];
  }

  return [];
}

function validateSourceTargetFields(definition, path) {
  const errors = [];

  if (!hasNonEmptyString(definition.sourceInstanceId)) {
    errors.push(createConditionError(
      RUNTIME_CONDITION_ERRORS.SOURCE_INSTANCE_REQUIRED,
      "Condition requires sourceInstanceId.",
      `${path}.sourceInstanceId`
    ));
  }

  if (!hasNonEmptyString(definition.targetInstanceId)) {
    errors.push(createConditionError(
      RUNTIME_CONDITION_ERRORS.TARGET_INSTANCE_REQUIRED,
      "Condition requires targetInstanceId.",
      `${path}.targetInstanceId`
    ));
  }

  return errors;
}

function validateRuntimeFacts(runtimeFacts) {
  const errors = [];

  if (!isRecord(runtimeFacts)) {
    errors.push(createConditionError(
      RUNTIME_CONDITION_ERRORS.FACTS_INVALID,
      "Runtime condition evaluation requires runtimeFacts object.",
      "runtimeFacts"
    ));
    return errors;
  }

  if (!Array.isArray(runtimeFacts.collisions)) {
    errors.push(createConditionError(
      RUNTIME_CONDITION_ERRORS.COLLISIONS_INVALID,
      "Runtime facts require collisions array.",
      "runtimeFacts.collisions"
    ));
  }

  if (!Array.isArray(runtimeFacts.overlaps)) {
    errors.push(createConditionError(
      RUNTIME_CONDITION_ERRORS.OVERLAPS_INVALID,
      "Runtime facts require overlaps array.",
      "runtimeFacts.overlaps"
    ));
  }

  if (!Number.isFinite(runtimeFacts.elapsedMs)) {
    errors.push(createConditionError(
      RUNTIME_CONDITION_ERRORS.ELAPSED_MS_INVALID,
      "Runtime facts require numeric elapsedMs.",
      "runtimeFacts.elapsedMs"
    ));
  }

  if (!isRecord(runtimeFacts.scores)) {
    errors.push(createConditionError(
      RUNTIME_CONDITION_ERRORS.SCORES_INVALID,
      "Runtime facts require scores object.",
      "runtimeFacts.scores"
    ));
  }

  if (!isStringArray(runtimeFacts.destroyedObjectIds)) {
    errors.push(createConditionError(
      RUNTIME_CONDITION_ERRORS.DESTROYED_OBJECT_IDS_INVALID,
      "Runtime facts require destroyedObjectIds string array.",
      "runtimeFacts.destroyedObjectIds"
    ));
  }

  if (!isStringArray(runtimeFacts.spawnedObjectIds)) {
    errors.push(createConditionError(
      RUNTIME_CONDITION_ERRORS.SPAWNED_OBJECT_IDS_INVALID,
      "Runtime facts require spawnedObjectIds string array.",
      "runtimeFacts.spawnedObjectIds"
    ));
  }

  return errors;
}

function createConditionDefinition(definition) {
  const conditionDefinition = {
    conditionId: definition.conditionId.trim(),
    conditionType: definition.conditionType,
    eventType: definition.eventType.trim(),
  };

  if (definition.conditionType === RUNTIME_CONDITION_TYPES.COLLISION || definition.conditionType === RUNTIME_CONDITION_TYPES.OVERLAP) {
    conditionDefinition.sourceInstanceId = definition.sourceInstanceId.trim();
    conditionDefinition.targetInstanceId = definition.targetInstanceId.trim();
  }

  if (definition.conditionType === RUNTIME_CONDITION_TYPES.TIMER) {
    conditionDefinition.thresholdMs = definition.thresholdMs;
  }

  if (definition.conditionType === RUNTIME_CONDITION_TYPES.SCORE_REACHED) {
    conditionDefinition.scoreKey = definition.scoreKey.trim();
    conditionDefinition.minScore = definition.minScore;
  }

  if (definition.conditionType === RUNTIME_CONDITION_TYPES.OBJECT_DESTROYED || definition.conditionType === RUNTIME_CONDITION_TYPES.OBJECT_SPAWNED) {
    conditionDefinition.instanceId = definition.instanceId.trim();
  }

  return conditionDefinition;
}

function conditionMatchesRuntimeFacts(definition, runtimeFacts) {
  if (definition.conditionType === RUNTIME_CONDITION_TYPES.COLLISION) {
    return hasMatchingPair(runtimeFacts.collisions, definition.sourceInstanceId, definition.targetInstanceId);
  }

  if (definition.conditionType === RUNTIME_CONDITION_TYPES.OVERLAP) {
    return hasMatchingPair(runtimeFacts.overlaps, definition.sourceInstanceId, definition.targetInstanceId);
  }

  if (definition.conditionType === RUNTIME_CONDITION_TYPES.TIMER) {
    return runtimeFacts.elapsedMs >= definition.thresholdMs;
  }

  if (definition.conditionType === RUNTIME_CONDITION_TYPES.SCORE_REACHED) {
    return Number.isFinite(runtimeFacts.scores[definition.scoreKey]) && runtimeFacts.scores[definition.scoreKey] >= definition.minScore;
  }

  if (definition.conditionType === RUNTIME_CONDITION_TYPES.OBJECT_DESTROYED) {
    return runtimeFacts.destroyedObjectIds.includes(definition.instanceId);
  }

  if (definition.conditionType === RUNTIME_CONDITION_TYPES.OBJECT_SPAWNED) {
    return runtimeFacts.spawnedObjectIds.includes(definition.instanceId);
  }

  return false;
}

function hasMatchingPair(pairs, sourceInstanceId, targetInstanceId) {
  return pairs.some((pair) => (
    isRecord(pair)
    && pair.sourceInstanceId === sourceInstanceId
    && pair.targetInstanceId === targetInstanceId
  ));
}

function createConditionPayload(definition) {
  if (definition.conditionType === RUNTIME_CONDITION_TYPES.COLLISION || definition.conditionType === RUNTIME_CONDITION_TYPES.OVERLAP) {
    return {
      sourceInstanceId: definition.sourceInstanceId,
      targetInstanceId: definition.targetInstanceId,
    };
  }

  if (definition.conditionType === RUNTIME_CONDITION_TYPES.TIMER) {
    return { thresholdMs: definition.thresholdMs };
  }

  if (definition.conditionType === RUNTIME_CONDITION_TYPES.SCORE_REACHED) {
    return {
      scoreKey: definition.scoreKey,
      minScore: definition.minScore,
    };
  }

  return { instanceId: definition.instanceId };
}

function createConditionDefinitionResult({ conditionDefinitions, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    conditionDefinitions: Object.freeze(conditionDefinitions),
    errors: Object.freeze(errors),
  });
}

function createConditionEvaluationResult({ conditionMatches, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    conditionMatches: Object.freeze(conditionMatches),
    errors: Object.freeze(errors),
  });
}

function createConditionError(code, message, path) {
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
