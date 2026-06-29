/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2EquipmentSystem.js
*/

export const ENGINE_V2_EQUIPMENT_SLOT_TYPES = Object.freeze({
  WEAPON: "weapon",
  ARMOR: "armor",
  ACCESSORY: "accessory",
  TOOL: "tool",
});

export const ENGINE_V2_EQUIPMENT_ACTIONS = Object.freeze({
  EQUIP: "equip",
  UNEQUIP: "unequip",
});

export const ENGINE_V2_EQUIPMENT_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "ENGINE_V2_EQUIPMENT_DEFINITIONS_INVALID",
  STATES_INVALID: "ENGINE_V2_EQUIPMENT_STATES_INVALID",
  ITEMS_INVALID: "ENGINE_V2_EQUIPMENT_ITEMS_INVALID",
  ACTIONS_INVALID: "ENGINE_V2_EQUIPMENT_ACTIONS_INVALID",
  DEFINITION_INVALID: "ENGINE_V2_EQUIPMENT_DEFINITION_INVALID",
  STATE_INVALID: "ENGINE_V2_EQUIPMENT_STATE_INVALID",
  ITEM_INVALID: "ENGINE_V2_EQUIPMENT_ITEM_INVALID",
  ACTION_INVALID: "ENGINE_V2_EQUIPMENT_ACTION_INVALID",
  EQUIPMENT_MISSING: "ENGINE_V2_EQUIPMENT_MISSING",
  SLOT_MISSING: "ENGINE_V2_EQUIPMENT_SLOT_MISSING",
  ITEM_MISSING: "ENGINE_V2_EQUIPMENT_ITEM_MISSING",
  ITEM_NOT_ALLOWED: "ENGINE_V2_EQUIPMENT_ITEM_NOT_ALLOWED",
});

const SLOT_TYPE_LIST = Object.freeze(Object.values(ENGINE_V2_EQUIPMENT_SLOT_TYPES));

export function resolveEngineV2Equipment({ equipmentDefinitions, equipmentStates, itemDefinitions, equipmentActions }) {
  const errors = [];

  if (!Array.isArray(equipmentDefinitions)) {
    errors.push(createEquipmentError(ENGINE_V2_EQUIPMENT_ERRORS.DEFINITIONS_INVALID, "Equipment system requires equipmentDefinitions array.", "equipmentDefinitions"));
  }

  if (!Array.isArray(equipmentStates)) {
    errors.push(createEquipmentError(ENGINE_V2_EQUIPMENT_ERRORS.STATES_INVALID, "Equipment system requires equipmentStates array.", "equipmentStates"));
  }

  if (!Array.isArray(itemDefinitions)) {
    errors.push(createEquipmentError(ENGINE_V2_EQUIPMENT_ERRORS.ITEMS_INVALID, "Equipment system requires itemDefinitions array.", "itemDefinitions"));
  }

  if (!Array.isArray(equipmentActions)) {
    errors.push(createEquipmentError(ENGINE_V2_EQUIPMENT_ERRORS.ACTIONS_INVALID, "Equipment system requires equipmentActions array.", "equipmentActions"));
  }

  if (errors.length > 0) {
    return createEquipmentResult({ equipmentStates: [], equipmentEvents: [], errors });
  }

  equipmentDefinitions.forEach((definition, index) => validateEquipmentDefinition(definition, `equipmentDefinitions[${index}]`).forEach((error) => errors.push(error)));
  equipmentStates.forEach((state, index) => validateEquipmentState(state, `equipmentStates[${index}]`).forEach((error) => errors.push(error)));
  itemDefinitions.forEach((item, index) => validateItemDefinition(item, `itemDefinitions[${index}]`).forEach((error) => errors.push(error)));
  equipmentActions.forEach((action, index) => validateEquipmentAction(action, `equipmentActions[${index}]`).forEach((error) => errors.push(error)));

  if (errors.length > 0) {
    return createEquipmentResult({ equipmentStates: [], equipmentEvents: [], errors });
  }

  const definitionsById = new Map(equipmentDefinitions.map((definition) => [definition.equipmentId, definition]));
  const itemsById = new Map(itemDefinitions.map((item) => [item.itemId, item]));
  const nextStates = equipmentStates.map((state) => ({
    equipmentId: state.equipmentId,
    ownerInstanceId: state.ownerInstanceId,
    equipped: state.equipped.map((entry) => ({ ...entry })),
  }));
  const equipmentEvents = [];

  equipmentActions.forEach((action, index) => {
    const definition = definitionsById.get(action.equipmentId);
    const state = nextStates.find((equipmentState) => equipmentState.equipmentId === action.equipmentId);
    const path = `equipmentActions[${index}]`;

    if (!definition || !state) {
      errors.push(createEquipmentError(ENGINE_V2_EQUIPMENT_ERRORS.EQUIPMENT_MISSING, "Equipment action references missing equipment.", `${path}.equipmentId`));
      return;
    }

    const slot = definition.slots.find((slotDefinition) => slotDefinition.slotId === action.slotId);

    if (!slot) {
      errors.push(createEquipmentError(ENGINE_V2_EQUIPMENT_ERRORS.SLOT_MISSING, "Equipment action references missing slot.", `${path}.slotId`));
      return;
    }

    if (action.actionType === ENGINE_V2_EQUIPMENT_ACTIONS.UNEQUIP) {
      state.equipped = state.equipped.filter((entry) => entry.slotId !== action.slotId);
      equipmentEvents.push(Object.freeze({ actionId: action.actionId, actionType: action.actionType, equipmentId: action.equipmentId, slotId: action.slotId }));
      return;
    }

    const item = itemsById.get(action.itemId);

    if (!item) {
      errors.push(createEquipmentError(ENGINE_V2_EQUIPMENT_ERRORS.ITEM_MISSING, "Equipment action references missing item definition.", `${path}.itemId`));
      return;
    }

    if (!slot.allowedItemTypes.includes(item.itemType)) {
      errors.push(createEquipmentError(ENGINE_V2_EQUIPMENT_ERRORS.ITEM_NOT_ALLOWED, "Equipment item type is not allowed by manifest slot definition.", `${path}.itemId`));
      return;
    }

    state.equipped = state.equipped.filter((entry) => entry.slotId !== action.slotId);
    state.equipped.push({ slotId: action.slotId, itemId: action.itemId });
    equipmentEvents.push(Object.freeze({ actionId: action.actionId, actionType: action.actionType, equipmentId: action.equipmentId, slotId: action.slotId, itemId: action.itemId }));
  });

  if (errors.length > 0) {
    return createEquipmentResult({ equipmentStates: [], equipmentEvents: [], errors });
  }

  return createEquipmentResult({
    equipmentStates: nextStates.map((state) => Object.freeze({
      equipmentId: state.equipmentId,
      ownerInstanceId: state.ownerInstanceId,
      equipped: Object.freeze(state.equipped.map((entry) => Object.freeze(entry))),
    })),
    equipmentEvents,
    errors,
  });
}

function validateEquipmentDefinition(definition, path) {
  if (!isRecord(definition) || !hasNonEmptyString(definition.equipmentId) || !hasNonEmptyString(definition.ownerInstanceId) || !Array.isArray(definition.slots)) {
    return [createEquipmentError(ENGINE_V2_EQUIPMENT_ERRORS.DEFINITION_INVALID, "Equipment definition requires equipmentId, ownerInstanceId, and slots.", path)];
  }

  if (!definition.slots.every((slot) => isRecord(slot) && hasNonEmptyString(slot.slotId) && SLOT_TYPE_LIST.includes(slot.slotType) && Array.isArray(slot.allowedItemTypes))) {
    return [createEquipmentError(ENGINE_V2_EQUIPMENT_ERRORS.DEFINITION_INVALID, "Equipment slots require slotId, slotType, and allowedItemTypes.", `${path}.slots`)];
  }

  return [];
}

function validateEquipmentState(state, path) {
  if (!isRecord(state) || !hasNonEmptyString(state.equipmentId) || !hasNonEmptyString(state.ownerInstanceId) || !Array.isArray(state.equipped)) {
    return [createEquipmentError(ENGINE_V2_EQUIPMENT_ERRORS.STATE_INVALID, "Equipment state requires equipmentId, ownerInstanceId, and equipped array.", path)];
  }

  return [];
}

function validateItemDefinition(item, path) {
  if (!isRecord(item) || !hasNonEmptyString(item.itemId) || !hasNonEmptyString(item.itemType)) {
    return [createEquipmentError(ENGINE_V2_EQUIPMENT_ERRORS.ITEM_INVALID, "Item definition requires itemId and itemType.", path)];
  }

  return [];
}

function validateEquipmentAction(action, path) {
  if (!isRecord(action) || !hasNonEmptyString(action.actionId) || !hasNonEmptyString(action.equipmentId) || !hasNonEmptyString(action.slotId) || ![ENGINE_V2_EQUIPMENT_ACTIONS.EQUIP, ENGINE_V2_EQUIPMENT_ACTIONS.UNEQUIP].includes(action.actionType)) {
    return [createEquipmentError(ENGINE_V2_EQUIPMENT_ERRORS.ACTION_INVALID, "Equipment action requires actionId, equipmentId, slotId, and actionType.", path)];
  }

  if (action.actionType === ENGINE_V2_EQUIPMENT_ACTIONS.EQUIP && !hasNonEmptyString(action.itemId)) {
    return [createEquipmentError(ENGINE_V2_EQUIPMENT_ERRORS.ACTION_INVALID, "Equip action requires itemId.", `${path}.itemId`)];
  }

  return [];
}

function createEquipmentResult({ equipmentStates, equipmentEvents, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    equipmentStates: Object.freeze(equipmentStates),
    equipmentEvents: Object.freeze(equipmentEvents),
    errors: Object.freeze(errors),
  });
}

function createEquipmentError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
