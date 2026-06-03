/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2ContainerSystem.js
*/

export const ENGINE_V2_CONTAINER_TYPES = Object.freeze({
  CHEST: "chest",
  STORAGE: "storage",
  CRATE: "crate",
});

export const ENGINE_V2_CONTAINER_ACTIONS = Object.freeze({
  OPEN: "open",
  CLOSE: "close",
  DEPOSIT: "deposit",
  WITHDRAW: "withdraw",
});

export const ENGINE_V2_CONTAINER_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "ENGINE_V2_CONTAINER_DEFINITIONS_INVALID",
  STATES_INVALID: "ENGINE_V2_CONTAINER_STATES_INVALID",
  INVENTORIES_INVALID: "ENGINE_V2_CONTAINER_INVENTORIES_INVALID",
  ACTIONS_INVALID: "ENGINE_V2_CONTAINER_ACTIONS_INVALID",
  DEFINITION_INVALID: "ENGINE_V2_CONTAINER_DEFINITION_INVALID",
  STATE_INVALID: "ENGINE_V2_CONTAINER_STATE_INVALID",
  ACTION_INVALID: "ENGINE_V2_CONTAINER_ACTION_INVALID",
  CONTAINER_MISSING: "ENGINE_V2_CONTAINER_MISSING",
  INVENTORY_MISSING: "ENGINE_V2_CONTAINER_INVENTORY_MISSING",
});

const CONTAINER_TYPE_LIST = Object.freeze(Object.values(ENGINE_V2_CONTAINER_TYPES));

export function resolveEngineV2Containers({ containerDefinitions, containerStates, inventoryStates, containerActions }) {
  const errors = [];

  if (!Array.isArray(containerDefinitions)) {
    errors.push(createContainerError(ENGINE_V2_CONTAINER_ERRORS.DEFINITIONS_INVALID, "Container system requires containerDefinitions array.", "containerDefinitions"));
  }

  if (!Array.isArray(containerStates)) {
    errors.push(createContainerError(ENGINE_V2_CONTAINER_ERRORS.STATES_INVALID, "Container system requires containerStates array.", "containerStates"));
  }

  if (!Array.isArray(inventoryStates)) {
    errors.push(createContainerError(ENGINE_V2_CONTAINER_ERRORS.INVENTORIES_INVALID, "Container system requires inventoryStates array.", "inventoryStates"));
  }

  if (!Array.isArray(containerActions)) {
    errors.push(createContainerError(ENGINE_V2_CONTAINER_ERRORS.ACTIONS_INVALID, "Container system requires containerActions array.", "containerActions"));
  }

  if (errors.length > 0) {
    return createContainerResult({ containerStates: [], containerEvents: [], inventoryTransferRequests: [], errors });
  }

  containerDefinitions.forEach((definition, index) => validateContainerDefinition(definition, `containerDefinitions[${index}]`).forEach((error) => errors.push(error)));
  containerStates.forEach((state, index) => validateContainerState(state, `containerStates[${index}]`).forEach((error) => errors.push(error)));
  containerActions.forEach((action, index) => validateContainerAction(action, `containerActions[${index}]`).forEach((error) => errors.push(error)));

  if (errors.length > 0) {
    return createContainerResult({ containerStates: [], containerEvents: [], inventoryTransferRequests: [], errors });
  }

  const definitionsById = new Map(containerDefinitions.map((definition) => [definition.containerId, definition]));
  const inventoryIds = new Set(inventoryStates.map((state) => state.inventoryId));
  const nextStates = containerStates.map((state) => ({ ...state }));
  const containerEvents = [];
  const inventoryTransferRequests = [];

  containerActions.forEach((action, index) => {
    const path = `containerActions[${index}]`;
    const definition = definitionsById.get(action.containerId);
    const state = nextStates.find((containerState) => containerState.containerId === action.containerId);

    if (!definition || !state) {
      errors.push(createContainerError(ENGINE_V2_CONTAINER_ERRORS.CONTAINER_MISSING, "Container action references missing container.", `${path}.containerId`));
      return;
    }

    if (!inventoryIds.has(definition.inventoryId)) {
      errors.push(createContainerError(ENGINE_V2_CONTAINER_ERRORS.INVENTORY_MISSING, "Container definition references missing inventory state.", `containerDefinitions.${definition.containerId}.inventoryId`));
      return;
    }

    if (action.actionType === ENGINE_V2_CONTAINER_ACTIONS.OPEN || action.actionType === ENGINE_V2_CONTAINER_ACTIONS.CLOSE) {
      state.isOpen = action.actionType === ENGINE_V2_CONTAINER_ACTIONS.OPEN;
      containerEvents.push(Object.freeze({ actionId: action.actionId, actionType: action.actionType, containerId: action.containerId }));
      return;
    }

    if (!inventoryIds.has(action.actorInventoryId)) {
      errors.push(createContainerError(ENGINE_V2_CONTAINER_ERRORS.INVENTORY_MISSING, "Container transfer references missing actor inventory.", `${path}.actorInventoryId`));
      return;
    }

    inventoryTransferRequests.push(Object.freeze({
      actionId: action.actionId,
      actionType: action.actionType,
      fromInventoryId: action.actionType === ENGINE_V2_CONTAINER_ACTIONS.WITHDRAW ? definition.inventoryId : action.actorInventoryId,
      toInventoryId: action.actionType === ENGINE_V2_CONTAINER_ACTIONS.WITHDRAW ? action.actorInventoryId : definition.inventoryId,
      itemId: action.itemId,
      quantity: action.quantity,
    }));
    containerEvents.push(Object.freeze({ actionId: action.actionId, actionType: action.actionType, containerId: action.containerId }));
  });

  if (errors.length > 0) {
    return createContainerResult({ containerStates: [], containerEvents: [], inventoryTransferRequests: [], errors });
  }

  return createContainerResult({
    containerStates: nextStates.map((state) => Object.freeze(state)),
    containerEvents,
    inventoryTransferRequests,
    errors,
  });
}

function validateContainerDefinition(definition, path) {
  if (!isRecord(definition) || !hasNonEmptyString(definition.containerId) || !CONTAINER_TYPE_LIST.includes(definition.containerType) || !hasNonEmptyString(definition.inventoryId)) {
    return [createContainerError(ENGINE_V2_CONTAINER_ERRORS.DEFINITION_INVALID, "Container definition requires containerId, containerType, and inventoryId.", path)];
  }

  return [];
}

function validateContainerState(state, path) {
  if (!isRecord(state) || !hasNonEmptyString(state.containerId) || typeof state.isOpen !== "boolean") {
    return [createContainerError(ENGINE_V2_CONTAINER_ERRORS.STATE_INVALID, "Container state requires containerId and isOpen.", path)];
  }

  return [];
}

function validateContainerAction(action, path) {
  if (!isRecord(action) || !hasNonEmptyString(action.actionId) || !hasNonEmptyString(action.containerId) || !Object.values(ENGINE_V2_CONTAINER_ACTIONS).includes(action.actionType)) {
    return [createContainerError(ENGINE_V2_CONTAINER_ERRORS.ACTION_INVALID, "Container action requires actionId, containerId, and actionType.", path)];
  }

  if ((action.actionType === ENGINE_V2_CONTAINER_ACTIONS.DEPOSIT || action.actionType === ENGINE_V2_CONTAINER_ACTIONS.WITHDRAW) && (!hasNonEmptyString(action.actorInventoryId) || !hasNonEmptyString(action.itemId) || !Number.isInteger(action.quantity) || action.quantity <= 0)) {
    return [createContainerError(ENGINE_V2_CONTAINER_ERRORS.ACTION_INVALID, "Container transfer requires actorInventoryId, itemId, and positive quantity.", path)];
  }

  return [];
}

function createContainerResult({ containerStates, containerEvents, inventoryTransferRequests, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    containerStates: Object.freeze(containerStates),
    containerEvents: Object.freeze(containerEvents),
    inventoryTransferRequests: Object.freeze(inventoryTransferRequests),
    errors: Object.freeze(errors),
  });
}

function createContainerError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
