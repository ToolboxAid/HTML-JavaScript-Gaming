/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2InventorySystem.js
*/

export const ENGINE_V2_INVENTORY_ACTIONS = Object.freeze({
  ADD: "add",
  REMOVE: "remove",
});

export const ENGINE_V2_INVENTORY_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "ENGINE_V2_INVENTORY_DEFINITIONS_INVALID",
  STATES_INVALID: "ENGINE_V2_INVENTORY_STATES_INVALID",
  ITEMS_INVALID: "ENGINE_V2_INVENTORY_ITEMS_INVALID",
  ACTIONS_INVALID: "ENGINE_V2_INVENTORY_ACTIONS_INVALID",
  DEFINITION_INVALID: "ENGINE_V2_INVENTORY_DEFINITION_INVALID",
  STATE_INVALID: "ENGINE_V2_INVENTORY_STATE_INVALID",
  ITEM_INVALID: "ENGINE_V2_INVENTORY_ITEM_INVALID",
  ACTION_INVALID: "ENGINE_V2_INVENTORY_ACTION_INVALID",
  INVENTORY_MISSING: "ENGINE_V2_INVENTORY_MISSING",
  ITEM_MISSING: "ENGINE_V2_INVENTORY_ITEM_MISSING",
  CAPACITY_EXCEEDED: "ENGINE_V2_INVENTORY_CAPACITY_EXCEEDED",
  QUANTITY_UNAVAILABLE: "ENGINE_V2_INVENTORY_QUANTITY_UNAVAILABLE",
});

export function resolveEngineV2Inventory({ inventoryDefinitions, inventoryStates, itemDefinitions, inventoryActions }) {
  const errors = [];

  if (!Array.isArray(inventoryDefinitions)) {
    errors.push(createInventoryError(ENGINE_V2_INVENTORY_ERRORS.DEFINITIONS_INVALID, "Inventory system requires inventoryDefinitions array.", "inventoryDefinitions"));
  }

  if (!Array.isArray(inventoryStates)) {
    errors.push(createInventoryError(ENGINE_V2_INVENTORY_ERRORS.STATES_INVALID, "Inventory system requires inventoryStates array.", "inventoryStates"));
  }

  if (!Array.isArray(itemDefinitions)) {
    errors.push(createInventoryError(ENGINE_V2_INVENTORY_ERRORS.ITEMS_INVALID, "Inventory system requires itemDefinitions array.", "itemDefinitions"));
  }

  if (!Array.isArray(inventoryActions)) {
    errors.push(createInventoryError(ENGINE_V2_INVENTORY_ERRORS.ACTIONS_INVALID, "Inventory system requires inventoryActions array.", "inventoryActions"));
  }

  if (errors.length > 0) {
    return createInventoryResult({ inventoryStates: [], inventoryEvents: [], errors });
  }

  inventoryDefinitions.forEach((definition, index) => {
    validateInventoryDefinition(definition, `inventoryDefinitions[${index}]`).forEach((error) => errors.push(error));
  });
  inventoryStates.forEach((state, index) => {
    validateInventoryState(state, `inventoryStates[${index}]`).forEach((error) => errors.push(error));
  });
  itemDefinitions.forEach((item, index) => {
    validateItemDefinition(item, `itemDefinitions[${index}]`).forEach((error) => errors.push(error));
  });
  inventoryActions.forEach((action, index) => {
    validateInventoryAction(action, `inventoryActions[${index}]`).forEach((error) => errors.push(error));
  });

  if (errors.length > 0) {
    return createInventoryResult({ inventoryStates: [], inventoryEvents: [], errors });
  }

  const definitionsById = new Map(inventoryDefinitions.map((definition) => [definition.inventoryId, definition]));
  const itemsById = new Map(itemDefinitions.map((item) => [item.itemId, item]));
  const nextStates = inventoryStates.map((state) => cloneInventoryState(state));
  const inventoryEvents = [];

  inventoryActions.forEach((action, index) => {
    const definition = definitionsById.get(action.inventoryId);
    const state = nextStates.find((inventoryState) => inventoryState.inventoryId === action.inventoryId);
    const item = itemsById.get(action.itemId);
    const path = `inventoryActions[${index}]`;

    if (!definition || !state) {
      errors.push(createInventoryError(ENGINE_V2_INVENTORY_ERRORS.INVENTORY_MISSING, "Inventory action references missing inventory.", `${path}.inventoryId`));
      return;
    }

    if (!item) {
      errors.push(createInventoryError(ENGINE_V2_INVENTORY_ERRORS.ITEM_MISSING, "Inventory action references missing item definition.", `${path}.itemId`));
      return;
    }

    if (action.actionType === ENGINE_V2_INVENTORY_ACTIONS.ADD) {
      applyAddAction({ state, definition, item, action, path, errors, inventoryEvents });
      return;
    }

    applyRemoveAction({ state, action, path, errors, inventoryEvents });
  });

  if (errors.length > 0) {
    return createInventoryResult({ inventoryStates: [], inventoryEvents: [], errors });
  }

  return createInventoryResult({
    inventoryStates: nextStates.map((state) => Object.freeze({
      inventoryId: state.inventoryId,
      ownerInstanceId: state.ownerInstanceId,
      slots: Object.freeze(state.slots.map((slot) => Object.freeze(slot))),
    })),
    inventoryEvents,
    errors,
  });
}

function applyAddAction({ state, definition, item, action, path, errors, inventoryEvents }) {
  let remaining = action.quantity;

  state.slots.forEach((slot) => {
    if (remaining <= 0 || slot.itemId !== action.itemId || slot.quantity >= item.stackLimit) {
      return;
    }

    const room = item.stackLimit - slot.quantity;
    const moved = Math.min(room, remaining);
    slot.quantity += moved;
    remaining -= moved;
  });

  while (remaining > 0 && state.slots.length < definition.capacity) {
    const moved = Math.min(item.stackLimit, remaining);
    state.slots.push({ slotId: `${definition.inventoryId}.slot${state.slots.length + 1}`, itemId: action.itemId, quantity: moved });
    remaining -= moved;
  }

  if (remaining > 0) {
    errors.push(createInventoryError(ENGINE_V2_INVENTORY_ERRORS.CAPACITY_EXCEEDED, "Inventory add action exceeds manifest-defined capacity.", `${path}.quantity`));
    return;
  }

  inventoryEvents.push(Object.freeze({ actionId: action.actionId, actionType: action.actionType, inventoryId: action.inventoryId, itemId: action.itemId, quantity: action.quantity }));
}

function applyRemoveAction({ state, action, path, errors, inventoryEvents }) {
  const available = state.slots
    .filter((slot) => slot.itemId === action.itemId)
    .reduce((total, slot) => total + slot.quantity, 0);

  if (available < action.quantity) {
    errors.push(createInventoryError(ENGINE_V2_INVENTORY_ERRORS.QUANTITY_UNAVAILABLE, "Inventory remove action requires available quantity.", `${path}.quantity`));
    return;
  }

  let remaining = action.quantity;
  state.slots.forEach((slot) => {
    if (remaining <= 0 || slot.itemId !== action.itemId) {
      return;
    }

    const moved = Math.min(slot.quantity, remaining);
    slot.quantity -= moved;
    remaining -= moved;
  });
  state.slots = state.slots.filter((slot) => slot.quantity > 0);
  inventoryEvents.push(Object.freeze({ actionId: action.actionId, actionType: action.actionType, inventoryId: action.inventoryId, itemId: action.itemId, quantity: action.quantity }));
}

function validateInventoryDefinition(definition, path) {
  if (!isRecord(definition) || !hasNonEmptyString(definition.inventoryId) || !hasNonEmptyString(definition.ownerInstanceId) || !Number.isInteger(definition.capacity) || definition.capacity <= 0 || !Array.isArray(definition.slotIds)) {
    return [createInventoryError(ENGINE_V2_INVENTORY_ERRORS.DEFINITION_INVALID, "Inventory definition requires inventoryId, ownerInstanceId, capacity, and slotIds.", path)];
  }

  return [];
}

function validateInventoryState(state, path) {
  if (!isRecord(state) || !hasNonEmptyString(state.inventoryId) || !hasNonEmptyString(state.ownerInstanceId) || !Array.isArray(state.slots)) {
    return [createInventoryError(ENGINE_V2_INVENTORY_ERRORS.STATE_INVALID, "Inventory state requires inventoryId, ownerInstanceId, and slots.", path)];
  }

  if (!state.slots.every((slot) => isRecord(slot) && hasNonEmptyString(slot.slotId) && hasNonEmptyString(slot.itemId) && Number.isInteger(slot.quantity) && slot.quantity > 0)) {
    return [createInventoryError(ENGINE_V2_INVENTORY_ERRORS.STATE_INVALID, "Inventory slots require slotId, itemId, and positive quantity.", `${path}.slots`)];
  }

  return [];
}

function validateItemDefinition(item, path) {
  if (!isRecord(item) || !hasNonEmptyString(item.itemId) || !hasNonEmptyString(item.itemType) || !Number.isInteger(item.stackLimit) || item.stackLimit <= 0) {
    return [createInventoryError(ENGINE_V2_INVENTORY_ERRORS.ITEM_INVALID, "Item definition requires itemId, itemType, and positive stackLimit.", path)];
  }

  return [];
}

function validateInventoryAction(action, path) {
  if (!isRecord(action) || !hasNonEmptyString(action.actionId) || !hasNonEmptyString(action.inventoryId) || !hasNonEmptyString(action.itemId) || ![ENGINE_V2_INVENTORY_ACTIONS.ADD, ENGINE_V2_INVENTORY_ACTIONS.REMOVE].includes(action.actionType) || !Number.isInteger(action.quantity) || action.quantity <= 0) {
    return [createInventoryError(ENGINE_V2_INVENTORY_ERRORS.ACTION_INVALID, "Inventory action requires actionId, inventoryId, itemId, actionType, and positive quantity.", path)];
  }

  return [];
}

function cloneInventoryState(state) {
  return {
    inventoryId: state.inventoryId,
    ownerInstanceId: state.ownerInstanceId,
    slots: state.slots.map((slot) => ({ ...slot })),
  };
}

function createInventoryResult({ inventoryStates, inventoryEvents, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    inventoryStates: Object.freeze(inventoryStates),
    inventoryEvents: Object.freeze(inventoryEvents),
    errors: Object.freeze(errors),
  });
}

function createInventoryError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
