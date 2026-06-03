/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2CheckpointSystem.js
*/

export const ENGINE_V2_CHECKPOINT_ACTIONS = Object.freeze({
  ACTIVATE: "activate",
  RESTORE: "restore",
});

export const ENGINE_V2_CHECKPOINT_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "ENGINE_V2_CHECKPOINT_DEFINITIONS_INVALID",
  STATE_INVALID: "ENGINE_V2_CHECKPOINT_STATE_INVALID",
  ACTIONS_INVALID: "ENGINE_V2_CHECKPOINT_ACTIONS_INVALID",
  DEFINITION_INVALID: "ENGINE_V2_CHECKPOINT_DEFINITION_INVALID",
  ACTION_INVALID: "ENGINE_V2_CHECKPOINT_ACTION_INVALID",
  CHECKPOINT_MISSING: "ENGINE_V2_CHECKPOINT_MISSING",
});

export function processEngineV2Checkpoints({ checkpointDefinitions, checkpointState, checkpointActions }) {
  const errors = [];

  if (!Array.isArray(checkpointDefinitions)) {
    errors.push(createCheckpointError(ENGINE_V2_CHECKPOINT_ERRORS.DEFINITIONS_INVALID, "Checkpoint system requires checkpointDefinitions array.", "checkpointDefinitions"));
  }

  if (!isRecord(checkpointState) || !hasNonEmptyString(checkpointState.ownerInstanceId)) {
    errors.push(createCheckpointError(ENGINE_V2_CHECKPOINT_ERRORS.STATE_INVALID, "Checkpoint state requires ownerInstanceId.", "checkpointState"));
  }

  if (!Array.isArray(checkpointActions)) {
    errors.push(createCheckpointError(ENGINE_V2_CHECKPOINT_ERRORS.ACTIONS_INVALID, "Checkpoint system requires checkpointActions array.", "checkpointActions"));
  }

  if (errors.length > 0) {
    return createCheckpointResult({ checkpointState: null, checkpointEvents: [], restoreRequests: [], errors });
  }

  checkpointDefinitions.forEach((definition, index) => validateCheckpointDefinition(definition, `checkpointDefinitions[${index}]`).forEach((error) => errors.push(error)));
  checkpointActions.forEach((action, index) => validateCheckpointAction(action, `checkpointActions[${index}]`).forEach((error) => errors.push(error)));

  if (errors.length > 0) {
    return createCheckpointResult({ checkpointState: null, checkpointEvents: [], restoreRequests: [], errors });
  }

  const definitionsById = new Map(checkpointDefinitions.map((definition) => [definition.checkpointId, definition]));
  const nextState = { ownerInstanceId: checkpointState.ownerInstanceId, activeCheckpointId: checkpointState.activeCheckpointId ?? null };
  const checkpointEvents = [];
  const restoreRequests = [];

  checkpointActions.forEach((action, index) => {
    const path = `checkpointActions[${index}]`;
    const definition = definitionsById.get(action.checkpointId);

    if (!definition) {
      errors.push(createCheckpointError(ENGINE_V2_CHECKPOINT_ERRORS.CHECKPOINT_MISSING, "Checkpoint action references missing checkpoint definition.", `${path}.checkpointId`));
      return;
    }

    if (action.actionType === ENGINE_V2_CHECKPOINT_ACTIONS.ACTIVATE) {
      nextState.activeCheckpointId = action.checkpointId;
      checkpointEvents.push(Object.freeze({ actionId: action.actionId, actionType: action.actionType, checkpointId: action.checkpointId }));
      return;
    }

    restoreRequests.push(Object.freeze({ actionId: action.actionId, checkpointId: action.checkpointId, sceneId: definition.sceneId, position: Object.freeze({ ...definition.position }), stateKeys: Object.freeze([...definition.stateKeys]) }));
    checkpointEvents.push(Object.freeze({ actionId: action.actionId, actionType: action.actionType, checkpointId: action.checkpointId }));
  });

  if (errors.length > 0) {
    return createCheckpointResult({ checkpointState: null, checkpointEvents: [], restoreRequests: [], errors });
  }

  return createCheckpointResult({
    checkpointState: Object.freeze(nextState),
    checkpointEvents,
    restoreRequests,
    errors,
  });
}

function validateCheckpointDefinition(definition, path) {
  if (!isRecord(definition) || !hasNonEmptyString(definition.checkpointId) || !hasNonEmptyString(definition.sceneId) || !isPosition(definition.position) || !Array.isArray(definition.stateKeys)) {
    return [createCheckpointError(ENGINE_V2_CHECKPOINT_ERRORS.DEFINITION_INVALID, "Checkpoint definition requires checkpointId, sceneId, position, and stateKeys.", path)];
  }

  return [];
}

function validateCheckpointAction(action, path) {
  if (!isRecord(action) || !hasNonEmptyString(action.actionId) || !hasNonEmptyString(action.checkpointId) || !Object.values(ENGINE_V2_CHECKPOINT_ACTIONS).includes(action.actionType)) {
    return [createCheckpointError(ENGINE_V2_CHECKPOINT_ERRORS.ACTION_INVALID, "Checkpoint action requires actionId, checkpointId, and actionType.", path)];
  }

  return [];
}

function createCheckpointResult({ checkpointState, checkpointEvents, restoreRequests, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    checkpointState,
    checkpointEvents: Object.freeze(checkpointEvents),
    restoreRequests: Object.freeze(restoreRequests),
    errors: Object.freeze(errors),
  });
}

function createCheckpointError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isPosition(value) {
  return isRecord(value) && Number.isFinite(value.x) && Number.isFinite(value.y);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
