/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2DialogueSystem.js
*/

export const ENGINE_V2_DIALOGUE_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "ENGINE_V2_DIALOGUE_DEFINITIONS_INVALID",
  STATES_INVALID: "ENGINE_V2_DIALOGUE_STATES_INVALID",
  REQUESTS_INVALID: "ENGINE_V2_DIALOGUE_REQUESTS_INVALID",
  CONDITIONS_INVALID: "ENGINE_V2_DIALOGUE_CONDITIONS_INVALID",
  DEFINITION_INVALID: "ENGINE_V2_DIALOGUE_DEFINITION_INVALID",
  STATE_INVALID: "ENGINE_V2_DIALOGUE_STATE_INVALID",
  REQUEST_INVALID: "ENGINE_V2_DIALOGUE_REQUEST_INVALID",
  DIALOGUE_MISSING: "ENGINE_V2_DIALOGUE_MISSING",
  NODE_MISSING: "ENGINE_V2_DIALOGUE_NODE_MISSING",
  CHOICE_MISSING: "ENGINE_V2_DIALOGUE_CHOICE_MISSING",
  CONDITION_UNMET: "ENGINE_V2_DIALOGUE_CONDITION_UNMET",
});

export function processEngineV2Dialogue({ dialogueDefinitions, dialogueStates, dialogueRequests, conditionMatches }) {
  const errors = [];

  if (!Array.isArray(dialogueDefinitions)) {
    errors.push(createDialogueError(ENGINE_V2_DIALOGUE_ERRORS.DEFINITIONS_INVALID, "Dialogue system requires dialogueDefinitions array.", "dialogueDefinitions"));
  }

  if (!Array.isArray(dialogueStates)) {
    errors.push(createDialogueError(ENGINE_V2_DIALOGUE_ERRORS.STATES_INVALID, "Dialogue system requires dialogueStates array.", "dialogueStates"));
  }

  if (!Array.isArray(dialogueRequests)) {
    errors.push(createDialogueError(ENGINE_V2_DIALOGUE_ERRORS.REQUESTS_INVALID, "Dialogue system requires dialogueRequests array.", "dialogueRequests"));
  }

  if (!Array.isArray(conditionMatches)) {
    errors.push(createDialogueError(ENGINE_V2_DIALOGUE_ERRORS.CONDITIONS_INVALID, "Dialogue system requires conditionMatches array.", "conditionMatches"));
  }

  if (errors.length > 0) {
    return createDialogueResult({ dialogueStates: [], dialogueEvents: [], actionRequests: [], errors });
  }

  dialogueDefinitions.forEach((definition, index) => validateDialogueDefinition(definition, `dialogueDefinitions[${index}]`).forEach((error) => errors.push(error)));
  dialogueStates.forEach((state, index) => validateDialogueState(state, `dialogueStates[${index}]`).forEach((error) => errors.push(error)));
  dialogueRequests.forEach((request, index) => validateDialogueRequest(request, `dialogueRequests[${index}]`).forEach((error) => errors.push(error)));

  if (errors.length > 0) {
    return createDialogueResult({ dialogueStates: [], dialogueEvents: [], actionRequests: [], errors });
  }

  const definitionsById = new Map(dialogueDefinitions.map((definition) => [definition.dialogueId, definition]));
  const statesById = new Map(dialogueStates.map((state) => [state.dialogueId, { ...state }]));
  const matchedConditionIds = new Set(conditionMatches.map((condition) => condition.conditionId));
  const dialogueEvents = [];
  const actionRequests = [];

  dialogueRequests.forEach((request, index) => {
    const path = `dialogueRequests[${index}]`;
    const definition = definitionsById.get(request.dialogueId);
    const state = statesById.get(request.dialogueId);

    if (!definition || !state) {
      errors.push(createDialogueError(ENGINE_V2_DIALOGUE_ERRORS.DIALOGUE_MISSING, "Dialogue request references missing dialogue definition or state.", `${path}.dialogueId`));
      return;
    }

    const currentNodeId = request.nodeId || state.currentNodeId;
    const currentNode = definition.nodes.find((node) => node.nodeId === currentNodeId);

    if (!currentNode) {
      errors.push(createDialogueError(ENGINE_V2_DIALOGUE_ERRORS.NODE_MISSING, "Dialogue request references missing node.", `${path}.nodeId`));
      return;
    }

    if (!request.choiceId) {
      dialogueEvents.push(Object.freeze({ requestId: request.requestId, dialogueId: request.dialogueId, nodeId: currentNode.nodeId, npcId: definition.npcId, text: currentNode.text }));
      return;
    }

    const choice = currentNode.choices.find((entry) => entry.choiceId === request.choiceId);

    if (!choice) {
      errors.push(createDialogueError(ENGINE_V2_DIALOGUE_ERRORS.CHOICE_MISSING, "Dialogue request references missing choice.", `${path}.choiceId`));
      return;
    }

    const unmetConditionId = choice.conditionIds.find((conditionId) => !matchedConditionIds.has(conditionId));

    if (unmetConditionId) {
      errors.push(createDialogueError(ENGINE_V2_DIALOGUE_ERRORS.CONDITION_UNMET, "Dialogue choice condition is not met.", `${path}.choiceId`));
      return;
    }

    state.currentNodeId = choice.nextNodeId;
    choice.actionIds.forEach((actionId) => {
      actionRequests.push(Object.freeze({ requestId: request.requestId, dialogueId: request.dialogueId, choiceId: choice.choiceId, actionId }));
    });
    dialogueEvents.push(Object.freeze({ requestId: request.requestId, dialogueId: request.dialogueId, nodeId: currentNode.nodeId, choiceId: choice.choiceId, nextNodeId: choice.nextNodeId }));
  });

  if (errors.length > 0) {
    return createDialogueResult({ dialogueStates: [], dialogueEvents: [], actionRequests: [], errors });
  }

  return createDialogueResult({
    dialogueStates: Array.from(statesById.values()).map((state) => Object.freeze(state)),
    dialogueEvents,
    actionRequests,
    errors,
  });
}

function validateDialogueDefinition(definition, path) {
  if (!isRecord(definition) || !hasNonEmptyString(definition.dialogueId) || !hasNonEmptyString(definition.npcId) || !Array.isArray(definition.nodes)) {
    return [createDialogueError(ENGINE_V2_DIALOGUE_ERRORS.DEFINITION_INVALID, "Dialogue definition requires dialogueId, npcId, and nodes.", path)];
  }

  if (!definition.nodes.every((node) => isRecord(node) && hasNonEmptyString(node.nodeId) && hasNonEmptyString(node.text) && Array.isArray(node.choices))) {
    return [createDialogueError(ENGINE_V2_DIALOGUE_ERRORS.DEFINITION_INVALID, "Dialogue nodes require nodeId, text, and choices.", `${path}.nodes`)];
  }

  if (!definition.nodes.every((node) => node.choices.every((choice) => isValidChoice(choice)))) {
    return [createDialogueError(ENGINE_V2_DIALOGUE_ERRORS.DEFINITION_INVALID, "Dialogue choices require choiceId, label, conditionIds, actionIds, and nextNodeId.", `${path}.nodes.choices`)];
  }

  return [];
}

function validateDialogueState(state, path) {
  if (!isRecord(state) || !hasNonEmptyString(state.dialogueId) || !hasNonEmptyString(state.currentNodeId)) {
    return [createDialogueError(ENGINE_V2_DIALOGUE_ERRORS.STATE_INVALID, "Dialogue state requires dialogueId and currentNodeId.", path)];
  }

  return [];
}

function validateDialogueRequest(request, path) {
  if (!isRecord(request) || !hasNonEmptyString(request.requestId) || !hasNonEmptyString(request.dialogueId) || !hasNonEmptyString(request.actorInstanceId)) {
    return [createDialogueError(ENGINE_V2_DIALOGUE_ERRORS.REQUEST_INVALID, "Dialogue request requires requestId, dialogueId, and actorInstanceId.", path)];
  }

  return [];
}

function createDialogueResult({ dialogueStates, dialogueEvents, actionRequests, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    dialogueStates: Object.freeze(dialogueStates),
    dialogueEvents: Object.freeze(dialogueEvents),
    actionRequests: Object.freeze(actionRequests),
    errors: Object.freeze(errors),
  });
}

function createDialogueError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidChoice(choice) {
  return isRecord(choice)
    && hasNonEmptyString(choice.choiceId)
    && hasNonEmptyString(choice.label)
    && Array.isArray(choice.conditionIds)
    && Array.isArray(choice.actionIds)
    && hasNonEmptyString(choice.nextNodeId);
}
