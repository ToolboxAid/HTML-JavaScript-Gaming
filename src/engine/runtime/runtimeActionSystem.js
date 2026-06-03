/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimeActionSystem.js
*/

export const RUNTIME_ACTION_TYPES = Object.freeze({
  SPAWN: "spawn",
  DESPAWN: "despawn",
  DAMAGE: "damage",
  HEAL: "heal",
  SCORE: "score",
  SCENE_CHANGE: "sceneChange",
  STATE_CHANGE: "stateChange",
});

export const RUNTIME_ACTION_TYPE_LIST = Object.freeze(Object.values(RUNTIME_ACTION_TYPES));

export const RUNTIME_ACTION_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "RUNTIME_ACTION_DEFINITIONS_INVALID",
  DEFINITION_INVALID: "RUNTIME_ACTION_DEFINITION_INVALID",
  ACTION_ID_REQUIRED: "RUNTIME_ACTION_ID_REQUIRED",
  ACTION_TYPE_INVALID: "RUNTIME_ACTION_TYPE_INVALID",
  EVENT_TYPE_REQUIRED: "RUNTIME_ACTION_EVENT_TYPE_REQUIRED",
  RUNTIME_EVENTS_INVALID: "RUNTIME_ACTION_RUNTIME_EVENTS_INVALID",
  RUNTIME_EVENT_INVALID: "RUNTIME_ACTION_RUNTIME_EVENT_INVALID",
  EVENT_ID_REQUIRED: "RUNTIME_ACTION_EVENT_ID_REQUIRED",
  RULE_ID_REQUIRED: "RUNTIME_ACTION_RULE_ID_REQUIRED",
  TARGET_INSTANCE_REQUIRED: "RUNTIME_ACTION_TARGET_INSTANCE_REQUIRED",
  AMOUNT_REQUIRED: "RUNTIME_ACTION_AMOUNT_REQUIRED",
  SCORE_KEY_REQUIRED: "RUNTIME_ACTION_SCORE_KEY_REQUIRED",
  POINTS_REQUIRED: "RUNTIME_ACTION_POINTS_REQUIRED",
  TO_SCENE_ID_REQUIRED: "RUNTIME_ACTION_TO_SCENE_ID_REQUIRED",
  STATE_KEY_REQUIRED: "RUNTIME_ACTION_STATE_KEY_REQUIRED",
  OPERATION_INVALID: "RUNTIME_ACTION_OPERATION_INVALID",
  VALUE_REQUIRED: "RUNTIME_ACTION_VALUE_REQUIRED",
});

export function readManifestActionDefinitions(actionDefinitions) {
  const errors = [];

  if (!Array.isArray(actionDefinitions)) {
    errors.push(createActionError(
      RUNTIME_ACTION_ERRORS.DEFINITIONS_INVALID,
      "Action definitions must be an explicit array.",
      "actionDefinitions"
    ));
    return createActionDefinitionResult({ actionDefinitions: [], errors });
  }

  const definitions = [];

  actionDefinitions.forEach((definition, index) => {
    const path = `actionDefinitions[${index}]`;
    const definitionErrors = validateActionDefinition(definition, path);

    definitionErrors.forEach((error) => errors.push(error));

    if (definitionErrors.length > 0) {
      return;
    }

    definitions.push(Object.freeze(createActionDefinition(definition)));
  });

  return createActionDefinitionResult({
    actionDefinitions: errors.length === 0 ? definitions : [],
    errors,
  });
}

export function resolveRuntimeActions(actionDefinitions, runtimeEvents) {
  const errors = [];
  const definitionResult = readManifestActionDefinitions(actionDefinitions);

  definitionResult.errors.forEach((error) => errors.push(error));
  validateRuntimeEvents(runtimeEvents).forEach((error) => errors.push(error));

  if (errors.length > 0) {
    return createActionResolutionResult({ actionOutcomes: [], errors });
  }

  const actionOutcomes = [];

  runtimeEvents.forEach((runtimeEvent) => {
    definitionResult.actionDefinitions
      .filter((definition) => definition.eventType === runtimeEvent.eventType)
      .forEach((definition) => {
        actionOutcomes.push(Object.freeze(createActionOutcome(definition, runtimeEvent)));
      });
  });

  return createActionResolutionResult({ actionOutcomes, errors });
}

function validateActionDefinition(definition, path) {
  const errors = [];

  if (!isRecord(definition)) {
    errors.push(createActionError(
      RUNTIME_ACTION_ERRORS.DEFINITION_INVALID,
      "Action definition must be an object.",
      path
    ));
    return errors;
  }

  if (!hasNonEmptyString(definition.actionId)) {
    errors.push(createActionError(
      RUNTIME_ACTION_ERRORS.ACTION_ID_REQUIRED,
      "Action definition requires actionId.",
      `${path}.actionId`
    ));
  }

  if (!RUNTIME_ACTION_TYPE_LIST.includes(definition.actionType)) {
    errors.push(createActionError(
      RUNTIME_ACTION_ERRORS.ACTION_TYPE_INVALID,
      "Action definition uses an unsupported actionType.",
      `${path}.actionType`
    ));
  }

  if (!hasNonEmptyString(definition.eventType)) {
    errors.push(createActionError(
      RUNTIME_ACTION_ERRORS.EVENT_TYPE_REQUIRED,
      "Action definition requires eventType.",
      `${path}.eventType`
    ));
  }

  validateActionSpecificFields(definition, path).forEach((error) => errors.push(error));

  return errors;
}

function validateActionSpecificFields(definition, path) {
  if (definition.actionType === RUNTIME_ACTION_TYPES.SPAWN) {
    return hasNonEmptyString(definition.ruleId)
      ? []
      : [createActionError(RUNTIME_ACTION_ERRORS.RULE_ID_REQUIRED, "Spawn action requires ruleId.", `${path}.ruleId`)];
  }

  if (definition.actionType === RUNTIME_ACTION_TYPES.DESPAWN) {
    return hasNonEmptyString(definition.targetInstanceId)
      ? []
      : [createActionError(RUNTIME_ACTION_ERRORS.TARGET_INSTANCE_REQUIRED, "Despawn action requires targetInstanceId.", `${path}.targetInstanceId`)];
  }

  if (definition.actionType === RUNTIME_ACTION_TYPES.DAMAGE || definition.actionType === RUNTIME_ACTION_TYPES.HEAL) {
    const errors = [];

    if (!hasNonEmptyString(definition.targetInstanceId)) {
      errors.push(createActionError(RUNTIME_ACTION_ERRORS.TARGET_INSTANCE_REQUIRED, "Damage/heal action requires targetInstanceId.", `${path}.targetInstanceId`));
    }

    if (!Number.isFinite(definition.amount)) {
      errors.push(createActionError(RUNTIME_ACTION_ERRORS.AMOUNT_REQUIRED, "Damage/heal action requires numeric amount.", `${path}.amount`));
    }

    return errors;
  }

  if (definition.actionType === RUNTIME_ACTION_TYPES.SCORE) {
    const errors = [];

    if (!hasNonEmptyString(definition.scoreKey)) {
      errors.push(createActionError(RUNTIME_ACTION_ERRORS.SCORE_KEY_REQUIRED, "Score action requires scoreKey.", `${path}.scoreKey`));
    }

    if (!Number.isFinite(definition.points)) {
      errors.push(createActionError(RUNTIME_ACTION_ERRORS.POINTS_REQUIRED, "Score action requires numeric points.", `${path}.points`));
    }

    return errors;
  }

  if (definition.actionType === RUNTIME_ACTION_TYPES.SCENE_CHANGE) {
    return hasNonEmptyString(definition.toSceneId)
      ? []
      : [createActionError(RUNTIME_ACTION_ERRORS.TO_SCENE_ID_REQUIRED, "Scene change action requires toSceneId.", `${path}.toSceneId`)];
  }

  if (definition.actionType === RUNTIME_ACTION_TYPES.STATE_CHANGE) {
    return validateStateChangeAction(definition, path);
  }

  return [];
}

function validateStateChangeAction(definition, path) {
  const errors = [];

  if (!hasNonEmptyString(definition.stateKey)) {
    errors.push(createActionError(RUNTIME_ACTION_ERRORS.STATE_KEY_REQUIRED, "State change action requires stateKey.", `${path}.stateKey`));
  }

  if (!["set", "increment"].includes(definition.operation)) {
    errors.push(createActionError(RUNTIME_ACTION_ERRORS.OPERATION_INVALID, "State change operation must be set or increment.", `${path}.operation`));
  }

  if (!Object.prototype.hasOwnProperty.call(definition, "value")) {
    errors.push(createActionError(RUNTIME_ACTION_ERRORS.VALUE_REQUIRED, "State change action requires value.", `${path}.value`));
  } else if (definition.operation === "increment" && !Number.isFinite(definition.value)) {
    errors.push(createActionError(RUNTIME_ACTION_ERRORS.VALUE_REQUIRED, "Increment state change action requires numeric value.", `${path}.value`));
  }

  return errors;
}

function validateRuntimeEvents(runtimeEvents) {
  const errors = [];

  if (!Array.isArray(runtimeEvents)) {
    errors.push(createActionError(
      RUNTIME_ACTION_ERRORS.RUNTIME_EVENTS_INVALID,
      "Action resolution requires runtimeEvents array.",
      "runtimeEvents"
    ));
    return errors;
  }

  runtimeEvents.forEach((runtimeEvent, index) => {
    const path = `runtimeEvents[${index}]`;

    if (!isRecord(runtimeEvent)) {
      errors.push(createActionError(
        RUNTIME_ACTION_ERRORS.RUNTIME_EVENT_INVALID,
        "Runtime event must be an object.",
        path
      ));
      return;
    }

    if (!hasNonEmptyString(runtimeEvent.eventId)) {
      errors.push(createActionError(
        RUNTIME_ACTION_ERRORS.EVENT_ID_REQUIRED,
        "Runtime event requires eventId.",
        `${path}.eventId`
      ));
    }

    if (!hasNonEmptyString(runtimeEvent.eventType)) {
      errors.push(createActionError(
        RUNTIME_ACTION_ERRORS.EVENT_TYPE_REQUIRED,
        "Runtime event requires eventType.",
        `${path}.eventType`
      ));
    }
  });

  return errors;
}

function createActionDefinition(definition) {
  const actionDefinition = {
    actionId: definition.actionId.trim(),
    actionType: definition.actionType,
    eventType: definition.eventType.trim(),
  };

  if (definition.actionType === RUNTIME_ACTION_TYPES.SPAWN) {
    actionDefinition.ruleId = definition.ruleId.trim();
  }

  if (definition.actionType === RUNTIME_ACTION_TYPES.DESPAWN) {
    actionDefinition.targetInstanceId = definition.targetInstanceId.trim();
  }

  if (definition.actionType === RUNTIME_ACTION_TYPES.DAMAGE || definition.actionType === RUNTIME_ACTION_TYPES.HEAL) {
    actionDefinition.targetInstanceId = definition.targetInstanceId.trim();
    actionDefinition.amount = definition.amount;
  }

  if (definition.actionType === RUNTIME_ACTION_TYPES.SCORE) {
    actionDefinition.scoreKey = definition.scoreKey.trim();
    actionDefinition.points = definition.points;
  }

  if (definition.actionType === RUNTIME_ACTION_TYPES.SCENE_CHANGE) {
    actionDefinition.toSceneId = definition.toSceneId.trim();
  }

  if (definition.actionType === RUNTIME_ACTION_TYPES.STATE_CHANGE) {
    actionDefinition.stateKey = definition.stateKey.trim();
    actionDefinition.operation = definition.operation;
    actionDefinition.value = definition.value;
  }

  return actionDefinition;
}

function createActionOutcome(definition, runtimeEvent) {
  const actionOutcome = {
    actionId: definition.actionId,
    actionType: definition.actionType,
    outcomeType: definition.actionType,
    eventId: runtimeEvent.eventId,
  };

  if (definition.actionType === RUNTIME_ACTION_TYPES.SPAWN) {
    actionOutcome.ruleId = definition.ruleId;
  }

  if (definition.actionType === RUNTIME_ACTION_TYPES.DESPAWN) {
    actionOutcome.targetInstanceId = definition.targetInstanceId;
  }

  if (definition.actionType === RUNTIME_ACTION_TYPES.DAMAGE || definition.actionType === RUNTIME_ACTION_TYPES.HEAL) {
    actionOutcome.targetInstanceId = definition.targetInstanceId;
    actionOutcome.amount = definition.amount;
  }

  if (definition.actionType === RUNTIME_ACTION_TYPES.SCORE) {
    actionOutcome.scoreKey = definition.scoreKey;
    actionOutcome.points = definition.points;
  }

  if (definition.actionType === RUNTIME_ACTION_TYPES.SCENE_CHANGE) {
    actionOutcome.toSceneId = definition.toSceneId;
  }

  if (definition.actionType === RUNTIME_ACTION_TYPES.STATE_CHANGE) {
    actionOutcome.stateKey = definition.stateKey;
    actionOutcome.operation = definition.operation;
    actionOutcome.value = definition.value;
  }

  return actionOutcome;
}

function createActionDefinitionResult({ actionDefinitions, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    actionDefinitions: Object.freeze(actionDefinitions),
    errors: Object.freeze(errors),
  });
}

function createActionResolutionResult({ actionOutcomes, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    actionOutcomes: Object.freeze(actionOutcomes),
    errors: Object.freeze(errors),
  });
}

function createActionError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
