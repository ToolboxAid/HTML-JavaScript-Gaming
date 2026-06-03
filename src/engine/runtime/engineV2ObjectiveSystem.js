/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2ObjectiveSystem.js
*/

export const ENGINE_V2_OBJECTIVE_TYPES = Object.freeze({
  COLLECT: "collect",
  DEFEAT: "defeat",
  REACH: "reach",
  SURVIVE: "survive",
  TIMER: "timer",
  SCORE: "score",
  INTERACT: "interact",
});

export const ENGINE_V2_OBJECTIVE_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "ENGINE_V2_OBJECTIVE_DEFINITIONS_INVALID",
  STATES_INVALID: "ENGINE_V2_OBJECTIVE_STATES_INVALID",
  EVENTS_INVALID: "ENGINE_V2_OBJECTIVE_EVENTS_INVALID",
  RUNTIME_STATE_INVALID: "ENGINE_V2_OBJECTIVE_RUNTIME_STATE_INVALID",
  DEFINITION_INVALID: "ENGINE_V2_OBJECTIVE_DEFINITION_INVALID",
  STATE_INVALID: "ENGINE_V2_OBJECTIVE_STATE_INVALID",
  EVENT_INVALID: "ENGINE_V2_OBJECTIVE_EVENT_INVALID",
  STATE_MISSING: "ENGINE_V2_OBJECTIVE_STATE_MISSING",
  SCORE_STATE_MISSING: "ENGINE_V2_OBJECTIVE_SCORE_STATE_MISSING",
  TIMER_STATE_MISSING: "ENGINE_V2_OBJECTIVE_TIMER_STATE_MISSING",
});

const OBJECTIVE_TYPE_LIST = Object.freeze(Object.values(ENGINE_V2_OBJECTIVE_TYPES));

export function processEngineV2Objectives({ objectiveDefinitions, objectiveStates, objectiveEvents, runtimeState }) {
  const errors = [];

  if (!Array.isArray(objectiveDefinitions)) {
    errors.push(createObjectiveError(ENGINE_V2_OBJECTIVE_ERRORS.DEFINITIONS_INVALID, "Objective system requires objectiveDefinitions array.", "objectiveDefinitions"));
  }

  if (!Array.isArray(objectiveStates)) {
    errors.push(createObjectiveError(ENGINE_V2_OBJECTIVE_ERRORS.STATES_INVALID, "Objective system requires objectiveStates array.", "objectiveStates"));
  }

  if (!Array.isArray(objectiveEvents)) {
    errors.push(createObjectiveError(ENGINE_V2_OBJECTIVE_ERRORS.EVENTS_INVALID, "Objective system requires objectiveEvents array.", "objectiveEvents"));
  }

  if (!isRecord(runtimeState)) {
    errors.push(createObjectiveError(ENGINE_V2_OBJECTIVE_ERRORS.RUNTIME_STATE_INVALID, "Objective system requires runtimeState object.", "runtimeState"));
  }

  if (errors.length > 0) {
    return createObjectiveResult({ objectiveStates: [], objectiveCompletions: [], errors });
  }

  objectiveDefinitions.forEach((definition, index) => validateObjectiveDefinition(definition, `objectiveDefinitions[${index}]`).forEach((error) => errors.push(error)));
  objectiveStates.forEach((state, index) => validateObjectiveState(state, `objectiveStates[${index}]`).forEach((error) => errors.push(error)));
  objectiveEvents.forEach((event, index) => validateObjectiveEvent(event, `objectiveEvents[${index}]`).forEach((error) => errors.push(error)));

  objectiveDefinitions.forEach((definition, index) => {
    if (!objectiveStates.some((state) => state.objectiveId === definition.objectiveId)) {
      errors.push(createObjectiveError(ENGINE_V2_OBJECTIVE_ERRORS.STATE_MISSING, "Objective definition requires matching state.", `objectiveDefinitions[${index}].objectiveId`));
    }
    validateRuntimeStateForObjective(definition, runtimeState, `objectiveDefinitions[${index}]`).forEach((error) => errors.push(error));
  });

  if (errors.length > 0) {
    return createObjectiveResult({ objectiveStates: [], objectiveCompletions: [], errors });
  }

  const definitionsById = new Map(objectiveDefinitions.map((definition) => [definition.objectiveId, definition]));
  const objectiveCompletions = [];
  const nextStates = objectiveStates.map((state) => {
    const definition = definitionsById.get(state.objectiveId);
    const progress = resolveProgress({ definition, state, objectiveEvents, runtimeState });
    const completed = progress >= definition.requiredValue;

    if (completed && !state.completed) {
      objectiveCompletions.push(Object.freeze({ objectiveId: state.objectiveId, objectiveType: definition.objectiveType, progress }));
    }

    return Object.freeze({
      objectiveId: state.objectiveId,
      progress,
      completed,
    });
  });

  return createObjectiveResult({ objectiveStates: nextStates, objectiveCompletions, errors });
}

function resolveProgress({ definition, state, objectiveEvents, runtimeState }) {
  if (definition.objectiveType === ENGINE_V2_OBJECTIVE_TYPES.SCORE) {
    return runtimeState.scores[definition.criteria.scoreKey];
  }

  if (definition.objectiveType === ENGINE_V2_OBJECTIVE_TYPES.SURVIVE || definition.objectiveType === ENGINE_V2_OBJECTIVE_TYPES.TIMER) {
    return runtimeState.elapsedMs;
  }

  const matchingEvents = objectiveEvents.filter((event) => eventMatchesObjective(event, definition));
  const eventProgress = matchingEvents.reduce((total, event) => total + event.amount, 0);
  return state.progress + eventProgress;
}

function eventMatchesObjective(event, definition) {
  if (event.objectiveType !== definition.objectiveType) {
    return false;
  }

  if (definition.objectiveType === ENGINE_V2_OBJECTIVE_TYPES.COLLECT) {
    return event.itemId === definition.criteria.itemId;
  }

  if (definition.objectiveType === ENGINE_V2_OBJECTIVE_TYPES.DEFEAT) {
    return event.targetType === definition.criteria.targetType;
  }

  if (definition.objectiveType === ENGINE_V2_OBJECTIVE_TYPES.REACH) {
    return event.locationId === definition.criteria.locationId;
  }

  if (definition.objectiveType === ENGINE_V2_OBJECTIVE_TYPES.INTERACT) {
    return event.interactionId === definition.criteria.interactionId;
  }

  return true;
}

function validateObjectiveDefinition(definition, path) {
  if (!isRecord(definition) || !hasNonEmptyString(definition.objectiveId) || !OBJECTIVE_TYPE_LIST.includes(definition.objectiveType) || !isRecord(definition.criteria) || !Number.isFinite(definition.requiredValue) || definition.requiredValue <= 0) {
    return [createObjectiveError(ENGINE_V2_OBJECTIVE_ERRORS.DEFINITION_INVALID, "Objective definition requires objectiveId, objectiveType, criteria, and positive requiredValue.", path)];
  }

  if (!criteriaMatchesObjectiveType(definition)) {
    return [createObjectiveError(ENGINE_V2_OBJECTIVE_ERRORS.DEFINITION_INVALID, "Objective criteria must match the declared objective type.", `${path}.criteria`)];
  }

  return [];
}

function validateObjectiveState(state, path) {
  if (!isRecord(state) || !hasNonEmptyString(state.objectiveId) || !Number.isFinite(state.progress) || typeof state.completed !== "boolean") {
    return [createObjectiveError(ENGINE_V2_OBJECTIVE_ERRORS.STATE_INVALID, "Objective state requires objectiveId, progress, and completed.", path)];
  }

  return [];
}

function validateObjectiveEvent(event, path) {
  if (!isRecord(event) || !OBJECTIVE_TYPE_LIST.includes(event.objectiveType) || !Number.isFinite(event.amount) || event.amount <= 0) {
    return [createObjectiveError(ENGINE_V2_OBJECTIVE_ERRORS.EVENT_INVALID, "Objective event requires objectiveType and positive amount.", path)];
  }

  if (event.objectiveType === ENGINE_V2_OBJECTIVE_TYPES.COLLECT && !hasNonEmptyString(event.itemId)) {
    return [createObjectiveError(ENGINE_V2_OBJECTIVE_ERRORS.EVENT_INVALID, "Collect objective event requires itemId.", `${path}.itemId`)];
  }

  if (event.objectiveType === ENGINE_V2_OBJECTIVE_TYPES.DEFEAT && !hasNonEmptyString(event.targetType)) {
    return [createObjectiveError(ENGINE_V2_OBJECTIVE_ERRORS.EVENT_INVALID, "Defeat objective event requires targetType.", `${path}.targetType`)];
  }

  if (event.objectiveType === ENGINE_V2_OBJECTIVE_TYPES.REACH && !hasNonEmptyString(event.locationId)) {
    return [createObjectiveError(ENGINE_V2_OBJECTIVE_ERRORS.EVENT_INVALID, "Reach objective event requires locationId.", `${path}.locationId`)];
  }

  if (event.objectiveType === ENGINE_V2_OBJECTIVE_TYPES.INTERACT && !hasNonEmptyString(event.interactionId)) {
    return [createObjectiveError(ENGINE_V2_OBJECTIVE_ERRORS.EVENT_INVALID, "Interact objective event requires interactionId.", `${path}.interactionId`)];
  }

  return [];
}

function validateRuntimeStateForObjective(definition, runtimeState, path) {
  if (definition.objectiveType === ENGINE_V2_OBJECTIVE_TYPES.SCORE && (!isRecord(runtimeState.scores) || !Number.isFinite(runtimeState.scores[definition.criteria.scoreKey]))) {
    return [createObjectiveError(ENGINE_V2_OBJECTIVE_ERRORS.SCORE_STATE_MISSING, "Score objective requires runtimeState.scores value for criteria.scoreKey.", `${path}.criteria.scoreKey`)];
  }

  if ((definition.objectiveType === ENGINE_V2_OBJECTIVE_TYPES.SURVIVE || definition.objectiveType === ENGINE_V2_OBJECTIVE_TYPES.TIMER) && !Number.isFinite(runtimeState.elapsedMs)) {
    return [createObjectiveError(ENGINE_V2_OBJECTIVE_ERRORS.TIMER_STATE_MISSING, "Survive and timer objectives require runtimeState.elapsedMs.", "runtimeState.elapsedMs")];
  }

  return [];
}

function criteriaMatchesObjectiveType(definition) {
  if (definition.objectiveType === ENGINE_V2_OBJECTIVE_TYPES.COLLECT) {
    return hasNonEmptyString(definition.criteria.itemId);
  }

  if (definition.objectiveType === ENGINE_V2_OBJECTIVE_TYPES.DEFEAT) {
    return hasNonEmptyString(definition.criteria.targetType);
  }

  if (definition.objectiveType === ENGINE_V2_OBJECTIVE_TYPES.REACH) {
    return hasNonEmptyString(definition.criteria.locationId);
  }

  if (definition.objectiveType === ENGINE_V2_OBJECTIVE_TYPES.INTERACT) {
    return hasNonEmptyString(definition.criteria.interactionId);
  }

  if (definition.objectiveType === ENGINE_V2_OBJECTIVE_TYPES.SCORE) {
    return hasNonEmptyString(definition.criteria.scoreKey);
  }

  return definition.objectiveType === ENGINE_V2_OBJECTIVE_TYPES.SURVIVE || definition.objectiveType === ENGINE_V2_OBJECTIVE_TYPES.TIMER;
}

function createObjectiveResult({ objectiveStates, objectiveCompletions, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    objectiveStates: Object.freeze(objectiveStates),
    objectiveCompletions: Object.freeze(objectiveCompletions),
    errors: Object.freeze(errors),
  });
}

function createObjectiveError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
