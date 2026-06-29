/*
Toolbox Aid
David Quesenberry
06/03/2026
runtimeCooldownProcessing.js
*/

export const RUNTIME_COOLDOWN_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "RUNTIME_COOLDOWN_DEFINITIONS_INVALID",
  STATES_INVALID: "RUNTIME_COOLDOWN_STATES_INVALID",
  REQUESTS_INVALID: "RUNTIME_COOLDOWN_REQUESTS_INVALID",
  CURRENT_TIME_INVALID: "RUNTIME_COOLDOWN_CURRENT_TIME_INVALID",
  DEFINITION_INVALID: "RUNTIME_COOLDOWN_DEFINITION_INVALID",
  STATE_INVALID: "RUNTIME_COOLDOWN_STATE_INVALID",
  REQUEST_INVALID: "RUNTIME_COOLDOWN_REQUEST_INVALID",
  COOLDOWN_REFERENCE_MISSING: "RUNTIME_COOLDOWN_REFERENCE_MISSING",
  COOLDOWN_STATE_MISSING: "RUNTIME_COOLDOWN_STATE_MISSING",
});

export function processRuntimeCooldowns({ cooldownDefinitions, cooldownStates, actionRequests, currentTimeMs }) {
  const errors = [];

  if (!Array.isArray(cooldownDefinitions)) {
    errors.push(createCooldownError(RUNTIME_COOLDOWN_ERRORS.DEFINITIONS_INVALID, "Cooldown processing requires cooldownDefinitions array.", "cooldownDefinitions"));
  }

  if (!Array.isArray(cooldownStates)) {
    errors.push(createCooldownError(RUNTIME_COOLDOWN_ERRORS.STATES_INVALID, "Cooldown processing requires cooldownStates array.", "cooldownStates"));
  }

  if (!Array.isArray(actionRequests)) {
    errors.push(createCooldownError(RUNTIME_COOLDOWN_ERRORS.REQUESTS_INVALID, "Cooldown processing requires actionRequests array.", "actionRequests"));
  }

  if (!Number.isFinite(currentTimeMs)) {
    errors.push(createCooldownError(RUNTIME_COOLDOWN_ERRORS.CURRENT_TIME_INVALID, "Cooldown processing requires numeric currentTimeMs.", "currentTimeMs"));
  }

  if (errors.length > 0) {
    return createCooldownResult({ cooldownStates: [], acceptedRequests: [], blockedRequests: [], errors });
  }

  cooldownDefinitions.forEach((definition, index) => {
    validateCooldownDefinition(definition, `cooldownDefinitions[${index}]`).forEach((error) => errors.push(error));
  });

  cooldownStates.forEach((cooldownState, index) => {
    validateCooldownState(cooldownState, `cooldownStates[${index}]`).forEach((error) => errors.push(error));
  });

  actionRequests.forEach((actionRequest, index) => {
    validateActionRequest(actionRequest, `actionRequests[${index}]`).forEach((error) => errors.push(error));
  });

  actionRequests.forEach((actionRequest, index) => {
    const definition = cooldownDefinitions.find((cooldownDefinition) => cooldownDefinition.cooldownId === actionRequest.cooldownId);
    const state = cooldownStates.find((cooldownState) => cooldownState.cooldownId === actionRequest.cooldownId);

    if (!definition) {
      errors.push(createCooldownError(
        RUNTIME_COOLDOWN_ERRORS.COOLDOWN_REFERENCE_MISSING,
        "Action request references missing cooldown definition.",
        `actionRequests[${index}].cooldownId`
      ));
      return;
    }

    if (definition.actionId !== actionRequest.actionId || definition.ownerInstanceId !== actionRequest.ownerInstanceId) {
      errors.push(createCooldownError(
        RUNTIME_COOLDOWN_ERRORS.COOLDOWN_REFERENCE_MISSING,
        "Action request does not match cooldown definition actionId and ownerInstanceId.",
        `actionRequests[${index}]`
      ));
    }

    if (!state) {
      errors.push(createCooldownError(
        RUNTIME_COOLDOWN_ERRORS.COOLDOWN_STATE_MISSING,
        "Action request references missing cooldown state.",
        `actionRequests[${index}].cooldownId`
      ));
    }
  });

  if (errors.length > 0) {
    return createCooldownResult({ cooldownStates: [], acceptedRequests: [], blockedRequests: [], errors });
  }

  const statesById = new Map(cooldownStates.map((cooldownState) => [cooldownState.cooldownId, { ...cooldownState }]));
  const definitionsById = new Map(cooldownDefinitions.map((definition) => [definition.cooldownId, definition]));
  const acceptedRequests = [];
  const blockedRequests = [];

  actionRequests.forEach((actionRequest) => {
    const state = statesById.get(actionRequest.cooldownId);
    const definition = definitionsById.get(actionRequest.cooldownId);

    if (currentTimeMs < state.availableAtMs) {
      blockedRequests.push(Object.freeze({
        requestId: actionRequest.requestId,
        cooldownId: actionRequest.cooldownId,
        availableAtMs: state.availableAtMs,
      }));
      return;
    }

    state.availableAtMs = currentTimeMs + definition.durationMs;
    acceptedRequests.push(Object.freeze({
      requestId: actionRequest.requestId,
      cooldownId: actionRequest.cooldownId,
      nextAvailableAtMs: state.availableAtMs,
    }));
  });

  const updatedCooldownStates = [...statesById.values()].map((cooldownState) => Object.freeze(cooldownState));

  return createCooldownResult({
    cooldownStates: updatedCooldownStates,
    acceptedRequests,
    blockedRequests,
    errors,
  });
}

function validateCooldownDefinition(definition, path) {
  if (!isRecord(definition) || !hasNonEmptyString(definition.cooldownId) || !hasNonEmptyString(definition.ownerInstanceId) || !hasNonEmptyString(definition.actionId) || !Number.isFinite(definition.durationMs) || definition.durationMs <= 0) {
    return [createCooldownError(
      RUNTIME_COOLDOWN_ERRORS.DEFINITION_INVALID,
      "Cooldown definition requires cooldownId, ownerInstanceId, actionId, and positive durationMs.",
      path
    )];
  }

  return [];
}

function validateCooldownState(cooldownState, path) {
  if (!isRecord(cooldownState) || !hasNonEmptyString(cooldownState.cooldownId) || !Number.isFinite(cooldownState.availableAtMs)) {
    return [createCooldownError(
      RUNTIME_COOLDOWN_ERRORS.STATE_INVALID,
      "Cooldown state requires cooldownId and numeric availableAtMs.",
      path
    )];
  }

  return [];
}

function validateActionRequest(actionRequest, path) {
  if (!isRecord(actionRequest) || !hasNonEmptyString(actionRequest.requestId) || !hasNonEmptyString(actionRequest.cooldownId) || !hasNonEmptyString(actionRequest.ownerInstanceId) || !hasNonEmptyString(actionRequest.actionId)) {
    return [createCooldownError(
      RUNTIME_COOLDOWN_ERRORS.REQUEST_INVALID,
      "Action request requires requestId, cooldownId, ownerInstanceId, and actionId.",
      path
    )];
  }

  return [];
}

function createCooldownResult({ cooldownStates, acceptedRequests, blockedRequests, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    cooldownStates: Object.freeze(cooldownStates),
    acceptedRequests: Object.freeze(acceptedRequests),
    blockedRequests: Object.freeze(blockedRequests),
    errors: Object.freeze(errors),
  });
}

function createCooldownError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
