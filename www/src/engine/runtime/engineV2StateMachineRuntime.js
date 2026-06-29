/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2StateMachineRuntime.js
*/

export const ENGINE_V2_STATE_SCOPES = Object.freeze({
  OBJECT: "object",
  SCENE: "scene",
  UI: "ui",
  DOOR: "door",
  INTERACTION: "interaction",
  COMBAT: "combat",
});

export const ENGINE_V2_STATE_SCOPE_LIST = Object.freeze(Object.values(ENGINE_V2_STATE_SCOPES));

export const ENGINE_V2_STATE_MACHINE_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "ENGINE_V2_STATE_MACHINE_DEFINITIONS_INVALID",
  STATES_INVALID: "ENGINE_V2_STATE_MACHINE_STATES_INVALID",
  REQUESTS_INVALID: "ENGINE_V2_STATE_MACHINE_REQUESTS_INVALID",
  CONDITIONS_INVALID: "ENGINE_V2_STATE_MACHINE_CONDITIONS_INVALID",
  DEFINITION_INVALID: "ENGINE_V2_STATE_MACHINE_DEFINITION_INVALID",
  STATE_INVALID: "ENGINE_V2_STATE_MACHINE_STATE_INVALID",
  REQUEST_INVALID: "ENGINE_V2_STATE_MACHINE_REQUEST_INVALID",
  CONDITION_INVALID: "ENGINE_V2_STATE_MACHINE_CONDITION_INVALID",
  TRANSITION_MISSING: "ENGINE_V2_STATE_MACHINE_TRANSITION_MISSING",
  STATE_MISSING: "ENGINE_V2_STATE_MACHINE_STATE_MISSING",
  FROM_STATE_MISMATCH: "ENGINE_V2_STATE_MACHINE_FROM_STATE_MISMATCH",
  CONDITION_UNMET: "ENGINE_V2_STATE_MACHINE_CONDITION_UNMET",
});

export function processEngineV2StateMachineRuntime({ transitionDefinitions, stateRecords, transitionRequests, conditionMatches }) {
  const errors = [];

  if (!Array.isArray(transitionDefinitions)) {
    errors.push(createStateMachineError(ENGINE_V2_STATE_MACHINE_ERRORS.DEFINITIONS_INVALID, "State machine runtime requires transitionDefinitions array.", "transitionDefinitions"));
  }

  if (!Array.isArray(stateRecords)) {
    errors.push(createStateMachineError(ENGINE_V2_STATE_MACHINE_ERRORS.STATES_INVALID, "State machine runtime requires stateRecords array.", "stateRecords"));
  }

  if (!Array.isArray(transitionRequests)) {
    errors.push(createStateMachineError(ENGINE_V2_STATE_MACHINE_ERRORS.REQUESTS_INVALID, "State machine runtime requires transitionRequests array.", "transitionRequests"));
  }

  if (!Array.isArray(conditionMatches)) {
    errors.push(createStateMachineError(ENGINE_V2_STATE_MACHINE_ERRORS.CONDITIONS_INVALID, "State machine runtime requires conditionMatches array.", "conditionMatches"));
  }

  if (errors.length > 0) {
    return createStateMachineResult({ stateRecords: [], transitionEvents: [], errors });
  }

  transitionDefinitions.forEach((definition, index) => validateTransitionDefinition(definition, `transitionDefinitions[${index}]`).forEach((error) => errors.push(error)));
  stateRecords.forEach((state, index) => validateStateRecord(state, `stateRecords[${index}]`).forEach((error) => errors.push(error)));
  transitionRequests.forEach((request, index) => validateTransitionRequest(request, `transitionRequests[${index}]`).forEach((error) => errors.push(error)));
  conditionMatches.forEach((condition, index) => validateConditionMatch(condition, `conditionMatches[${index}]`).forEach((error) => errors.push(error)));

  if (errors.length > 0) {
    return createStateMachineResult({ stateRecords: [], transitionEvents: [], errors });
  }

  const statesByKey = new Map(stateRecords.map((state) => [stateKey(state.stateScope, state.ownerId), { ...state }]));
  const definitionsById = new Map(transitionDefinitions.map((definition) => [definition.transitionId, definition]));
  const matchedConditionIds = new Set(conditionMatches.map((condition) => condition.conditionId));
  const transitionEvents = [];

  transitionRequests.forEach((request, index) => {
    const path = `transitionRequests[${index}]`;
    const definition = definitionsById.get(request.transitionId);

    if (!definition || definition.stateScope !== request.stateScope || definition.ownerId !== request.ownerId) {
      errors.push(createStateMachineError(ENGINE_V2_STATE_MACHINE_ERRORS.TRANSITION_MISSING, "Transition request references missing scoped transition definition.", `${path}.transitionId`));
      return;
    }

    const state = statesByKey.get(stateKey(request.stateScope, request.ownerId));

    if (!state) {
      errors.push(createStateMachineError(ENGINE_V2_STATE_MACHINE_ERRORS.STATE_MISSING, "Transition request references missing scoped state record.", `${path}.ownerId`));
      return;
    }

    if (state.currentState !== definition.fromState) {
      errors.push(createStateMachineError(ENGINE_V2_STATE_MACHINE_ERRORS.FROM_STATE_MISMATCH, "Transition definition fromState must match current runtime state.", `${path}.transitionId`));
      return;
    }

    const unmetConditionId = definition.requiredConditionIds.find((conditionId) => !matchedConditionIds.has(conditionId));

    if (unmetConditionId) {
      errors.push(createStateMachineError(ENGINE_V2_STATE_MACHINE_ERRORS.CONDITION_UNMET, "Transition required condition is not matched.", `${path}.transitionId`));
      return;
    }

    state.currentState = definition.toState;
    transitionEvents.push(Object.freeze({
      requestId: request.requestId,
      transitionId: request.transitionId,
      stateScope: request.stateScope,
      ownerId: request.ownerId,
      fromState: definition.fromState,
      toState: definition.toState,
    }));
  });

  if (errors.length > 0) {
    return createStateMachineResult({ stateRecords: [], transitionEvents: [], errors });
  }

  return createStateMachineResult({
    stateRecords: Array.from(statesByKey.values()).map((state) => Object.freeze(state)),
    transitionEvents,
    errors,
  });
}

function validateTransitionDefinition(definition, path) {
  if (!isRecord(definition)
    || !hasNonEmptyString(definition.transitionId)
    || !ENGINE_V2_STATE_SCOPE_LIST.includes(definition.stateScope)
    || !hasNonEmptyString(definition.ownerId)
    || !hasNonEmptyString(definition.fromState)
    || !hasNonEmptyString(definition.toState)
    || !Array.isArray(definition.requiredConditionIds)) {
    return [createStateMachineError(ENGINE_V2_STATE_MACHINE_ERRORS.DEFINITION_INVALID, "Transition definition requires transitionId, approved stateScope, ownerId, fromState, toState, and requiredConditionIds.", path)];
  }

  if (!definition.requiredConditionIds.every(hasNonEmptyString)) {
    return [createStateMachineError(ENGINE_V2_STATE_MACHINE_ERRORS.DEFINITION_INVALID, "Transition requiredConditionIds must be non-empty strings.", `${path}.requiredConditionIds`)];
  }

  return [];
}

function validateStateRecord(state, path) {
  if (!isRecord(state) || !ENGINE_V2_STATE_SCOPE_LIST.includes(state.stateScope) || !hasNonEmptyString(state.ownerId) || !hasNonEmptyString(state.currentState)) {
    return [createStateMachineError(ENGINE_V2_STATE_MACHINE_ERRORS.STATE_INVALID, "State record requires approved stateScope, ownerId, and currentState.", path)];
  }

  return [];
}

function validateTransitionRequest(request, path) {
  if (!isRecord(request) || !hasNonEmptyString(request.requestId) || !hasNonEmptyString(request.transitionId) || !ENGINE_V2_STATE_SCOPE_LIST.includes(request.stateScope) || !hasNonEmptyString(request.ownerId)) {
    return [createStateMachineError(ENGINE_V2_STATE_MACHINE_ERRORS.REQUEST_INVALID, "Transition request requires requestId, transitionId, approved stateScope, and ownerId.", path)];
  }

  return [];
}

function validateConditionMatch(condition, path) {
  if (!isRecord(condition) || !hasNonEmptyString(condition.conditionId)) {
    return [createStateMachineError(ENGINE_V2_STATE_MACHINE_ERRORS.CONDITION_INVALID, "Condition match requires conditionId.", path)];
  }

  return [];
}

function createStateMachineResult({ stateRecords, transitionEvents, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    stateRecords: Object.freeze(stateRecords),
    transitionEvents: Object.freeze(transitionEvents),
    errors: Object.freeze(errors),
  });
}

function createStateMachineError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function stateKey(stateScope, ownerId) {
  return `${stateScope}:${ownerId}`;
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
