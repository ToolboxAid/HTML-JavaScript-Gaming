/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2InteractionSystem.js
*/

export const ENGINE_V2_INTERACTION_TYPES = Object.freeze({
  OPEN: "open",
  USE: "use",
  ACTIVATE: "activate",
  TALK: "talk",
  COLLECT: "collect",
  INSPECT: "inspect",
});

export const ENGINE_V2_INTERACTION_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "ENGINE_V2_INTERACTION_DEFINITIONS_INVALID",
  REQUESTS_INVALID: "ENGINE_V2_INTERACTION_REQUESTS_INVALID",
  OBJECTS_INVALID: "ENGINE_V2_INTERACTION_OBJECTS_INVALID",
  DEFINITION_INVALID: "ENGINE_V2_INTERACTION_DEFINITION_INVALID",
  REQUEST_INVALID: "ENGINE_V2_INTERACTION_REQUEST_INVALID",
  INTERACTION_MISSING: "ENGINE_V2_INTERACTION_MISSING",
  ACTOR_MISSING: "ENGINE_V2_INTERACTION_ACTOR_MISSING",
  TARGET_MISSING: "ENGINE_V2_INTERACTION_TARGET_MISSING",
});

const INTERACTION_TYPE_LIST = Object.freeze(Object.values(ENGINE_V2_INTERACTION_TYPES));

export function resolveEngineV2Interactions({ interactionDefinitions, interactionRequests, runtimeObjects }) {
  const errors = [];

  if (!Array.isArray(interactionDefinitions)) {
    errors.push(createInteractionError(ENGINE_V2_INTERACTION_ERRORS.DEFINITIONS_INVALID, "Interaction system requires interactionDefinitions array.", "interactionDefinitions"));
  }

  if (!Array.isArray(interactionRequests)) {
    errors.push(createInteractionError(ENGINE_V2_INTERACTION_ERRORS.REQUESTS_INVALID, "Interaction system requires interactionRequests array.", "interactionRequests"));
  }

  if (!Array.isArray(runtimeObjects)) {
    errors.push(createInteractionError(ENGINE_V2_INTERACTION_ERRORS.OBJECTS_INVALID, "Interaction system requires runtimeObjects array.", "runtimeObjects"));
  }

  if (errors.length > 0) {
    return createInteractionResult({ interactionEvents: [], actionRequests: [], errors });
  }

  interactionDefinitions.forEach((definition, index) => validateInteractionDefinition(definition, `interactionDefinitions[${index}]`).forEach((error) => errors.push(error)));
  interactionRequests.forEach((request, index) => validateInteractionRequest(request, `interactionRequests[${index}]`).forEach((error) => errors.push(error)));

  if (errors.length > 0) {
    return createInteractionResult({ interactionEvents: [], actionRequests: [], errors });
  }

  const definitionsById = new Map(interactionDefinitions.map((definition) => [definition.interactionId, definition]));
  const objectIds = new Set(runtimeObjects.map((runtimeObject) => runtimeObject.instanceId));
  const interactionEvents = [];
  const actionRequests = [];

  interactionRequests.forEach((request, index) => {
    const path = `interactionRequests[${index}]`;
    const definition = definitionsById.get(request.interactionId);

    if (!definition) {
      errors.push(createInteractionError(ENGINE_V2_INTERACTION_ERRORS.INTERACTION_MISSING, "Interaction request references missing definition.", `${path}.interactionId`));
      return;
    }

    if (!objectIds.has(request.actorInstanceId)) {
      errors.push(createInteractionError(ENGINE_V2_INTERACTION_ERRORS.ACTOR_MISSING, "Interaction request actor does not exist.", `${path}.actorInstanceId`));
      return;
    }

    if (!objectIds.has(definition.targetInstanceId)) {
      errors.push(createInteractionError(ENGINE_V2_INTERACTION_ERRORS.TARGET_MISSING, "Interaction definition target does not exist.", `interactionDefinitions.${definition.interactionId}.targetInstanceId`));
      return;
    }

    interactionEvents.push(Object.freeze({
      requestId: request.requestId,
      interactionId: definition.interactionId,
      interactionType: definition.interactionType,
      actorInstanceId: request.actorInstanceId,
      targetInstanceId: definition.targetInstanceId,
    }));
    definition.actionIds.forEach((actionId) => {
      actionRequests.push(Object.freeze({ requestId: request.requestId, interactionId: definition.interactionId, actionId, targetInstanceId: definition.targetInstanceId }));
    });
  });

  if (errors.length > 0) {
    return createInteractionResult({ interactionEvents: [], actionRequests: [], errors });
  }

  return createInteractionResult({ interactionEvents, actionRequests, errors });
}

function validateInteractionDefinition(definition, path) {
  if (!isRecord(definition) || !hasNonEmptyString(definition.interactionId) || !INTERACTION_TYPE_LIST.includes(definition.interactionType) || !hasNonEmptyString(definition.targetInstanceId) || !Array.isArray(definition.actionIds)) {
    return [createInteractionError(ENGINE_V2_INTERACTION_ERRORS.DEFINITION_INVALID, "Interaction definition requires interactionId, interactionType, targetInstanceId, and actionIds.", path)];
  }

  return [];
}

function validateInteractionRequest(request, path) {
  if (!isRecord(request) || !hasNonEmptyString(request.requestId) || !hasNonEmptyString(request.interactionId) || !hasNonEmptyString(request.actorInstanceId)) {
    return [createInteractionError(ENGINE_V2_INTERACTION_ERRORS.REQUEST_INVALID, "Interaction request requires requestId, interactionId, and actorInstanceId.", path)];
  }

  return [];
}

function createInteractionResult({ interactionEvents, actionRequests, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    interactionEvents: Object.freeze(interactionEvents),
    actionRequests: Object.freeze(actionRequests),
    errors: Object.freeze(errors),
  });
}

function createInteractionError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
