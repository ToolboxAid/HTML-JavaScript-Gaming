/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2ItemAndLootSystem.js
*/

export const ENGINE_V2_ITEM_ACTIONS = Object.freeze({
  PICKUP: "pickup",
  DROP: "drop",
  CONSUME: "consume",
  USE: "use",
});

export const ENGINE_V2_ITEM_LOOT_ERRORS = Object.freeze({
  ITEMS_INVALID: "ENGINE_V2_ITEM_DEFINITIONS_INVALID",
  LOOT_TABLES_INVALID: "ENGINE_V2_LOOT_TABLES_INVALID",
  ACTIONS_INVALID: "ENGINE_V2_ITEM_ACTIONS_INVALID",
  ITEM_INVALID: "ENGINE_V2_ITEM_DEFINITION_INVALID",
  LOOT_TABLE_INVALID: "ENGINE_V2_LOOT_TABLE_INVALID",
  ACTION_INVALID: "ENGINE_V2_ITEM_ACTION_INVALID",
  ITEM_MISSING: "ENGINE_V2_ITEM_MISSING",
  LOOT_TABLE_MISSING: "ENGINE_V2_LOOT_TABLE_MISSING",
});

export function resolveEngineV2ItemAndLoot({ itemDefinitions, lootTables, itemActions }) {
  const errors = [];

  if (!Array.isArray(itemDefinitions)) {
    errors.push(createItemLootError(ENGINE_V2_ITEM_LOOT_ERRORS.ITEMS_INVALID, "Item/loot system requires itemDefinitions array.", "itemDefinitions"));
  }

  if (!Array.isArray(lootTables)) {
    errors.push(createItemLootError(ENGINE_V2_ITEM_LOOT_ERRORS.LOOT_TABLES_INVALID, "Item/loot system requires lootTables array.", "lootTables"));
  }

  if (!Array.isArray(itemActions)) {
    errors.push(createItemLootError(ENGINE_V2_ITEM_LOOT_ERRORS.ACTIONS_INVALID, "Item/loot system requires itemActions array.", "itemActions"));
  }

  if (errors.length > 0) {
    return createItemLootResult({ itemEvents: [], lootDrops: [], inventoryActions: [], errors });
  }

  itemDefinitions.forEach((item, index) => validateItem(item, `itemDefinitions[${index}]`).forEach((error) => errors.push(error)));
  lootTables.forEach((table, index) => validateLootTable(table, `lootTables[${index}]`).forEach((error) => errors.push(error)));
  itemActions.forEach((action, index) => validateItemAction(action, `itemActions[${index}]`).forEach((error) => errors.push(error)));

  if (errors.length > 0) {
    return createItemLootResult({ itemEvents: [], lootDrops: [], inventoryActions: [], errors });
  }

  const itemsById = new Map(itemDefinitions.map((item) => [item.itemId, item]));
  const lootTablesById = new Map(lootTables.map((table) => [table.lootTableId, table]));
  const itemEvents = [];
  const lootDrops = [];
  const inventoryActions = [];

  itemActions.forEach((action, index) => {
    const path = `itemActions[${index}]`;

    if (action.actionType === ENGINE_V2_ITEM_ACTIONS.PICKUP && action.lootTableId) {
      const table = lootTablesById.get(action.lootTableId);

      if (!table) {
        errors.push(createItemLootError(ENGINE_V2_ITEM_LOOT_ERRORS.LOOT_TABLE_MISSING, "Pickup action references missing loot table.", `${path}.lootTableId`));
        return;
      }

      table.entries.forEach((entry) => {
        lootDrops.push(Object.freeze({ actionId: action.actionId, lootTableId: table.lootTableId, itemId: entry.itemId, quantity: entry.quantity }));
        inventoryActions.push(Object.freeze({ actionId: `${action.actionId}.${entry.itemId}`, actionType: "add", inventoryId: action.inventoryId, itemId: entry.itemId, quantity: entry.quantity }));
      });
      itemEvents.push(Object.freeze({ actionId: action.actionId, actionType: action.actionType, sourceType: "lootTable" }));
      return;
    }

    const item = itemsById.get(action.itemId);

    if (!item) {
      errors.push(createItemLootError(ENGINE_V2_ITEM_LOOT_ERRORS.ITEM_MISSING, "Item action references missing item definition.", `${path}.itemId`));
      return;
    }

    itemEvents.push(Object.freeze({ actionId: action.actionId, actionType: action.actionType, itemId: action.itemId, itemType: item.itemType }));

    if (action.actionType === ENGINE_V2_ITEM_ACTIONS.PICKUP) {
      inventoryActions.push(Object.freeze({ actionId: action.actionId, actionType: "add", inventoryId: action.inventoryId, itemId: action.itemId, quantity: action.quantity }));
    } else if (action.actionType === ENGINE_V2_ITEM_ACTIONS.DROP || action.actionType === ENGINE_V2_ITEM_ACTIONS.CONSUME || action.actionType === ENGINE_V2_ITEM_ACTIONS.USE) {
      inventoryActions.push(Object.freeze({ actionId: action.actionId, actionType: "remove", inventoryId: action.inventoryId, itemId: action.itemId, quantity: action.quantity }));
    }
  });

  if (errors.length > 0) {
    return createItemLootResult({ itemEvents: [], lootDrops: [], inventoryActions: [], errors });
  }

  return createItemLootResult({ itemEvents, lootDrops, inventoryActions, errors });
}

function validateItem(item, path) {
  if (!isRecord(item) || !hasNonEmptyString(item.itemId) || !hasNonEmptyString(item.itemType) || !Number.isInteger(item.stackLimit) || item.stackLimit <= 0) {
    return [createItemLootError(ENGINE_V2_ITEM_LOOT_ERRORS.ITEM_INVALID, "Item definition requires itemId, itemType, and stackLimit.", path)];
  }

  return [];
}

function validateLootTable(table, path) {
  if (!isRecord(table) || !hasNonEmptyString(table.lootTableId) || !Array.isArray(table.entries)) {
    return [createItemLootError(ENGINE_V2_ITEM_LOOT_ERRORS.LOOT_TABLE_INVALID, "Loot table requires lootTableId and entries.", path)];
  }

  if (!table.entries.every((entry) => isRecord(entry) && hasNonEmptyString(entry.itemId) && Number.isInteger(entry.quantity) && entry.quantity > 0)) {
    return [createItemLootError(ENGINE_V2_ITEM_LOOT_ERRORS.LOOT_TABLE_INVALID, "Loot entries require itemId and positive quantity.", `${path}.entries`)];
  }

  return [];
}

function validateItemAction(action, path) {
  const actionTypes = Object.values(ENGINE_V2_ITEM_ACTIONS);

  if (!isRecord(action) || !hasNonEmptyString(action.actionId) || !actionTypes.includes(action.actionType) || !hasNonEmptyString(action.inventoryId) || !Number.isInteger(action.quantity) || action.quantity <= 0) {
    return [createItemLootError(ENGINE_V2_ITEM_LOOT_ERRORS.ACTION_INVALID, "Item action requires actionId, actionType, inventoryId, and positive quantity.", path)];
  }

  if (!hasNonEmptyString(action.itemId) && !hasNonEmptyString(action.lootTableId)) {
    return [createItemLootError(ENGINE_V2_ITEM_LOOT_ERRORS.ACTION_INVALID, "Item action requires itemId or lootTableId.", path)];
  }

  return [];
}

function createItemLootResult({ itemEvents, lootDrops, inventoryActions, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    itemEvents: Object.freeze(itemEvents),
    lootDrops: Object.freeze(lootDrops),
    inventoryActions: Object.freeze(inventoryActions),
    errors: Object.freeze(errors),
  });
}

function createItemLootError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
