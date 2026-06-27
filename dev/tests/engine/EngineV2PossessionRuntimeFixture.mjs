/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2PossessionRuntimeFixture.mjs
*/

export function createEngineV2PossessionRuntimeFixture() {
  return {
    itemDefinitions: [
      { itemId: "item.potion", itemType: "consumable", stackLimit: 5 },
      { itemId: "item.iron", itemType: "material", stackLimit: 10 },
      { itemId: "item.sword", itemType: "weapon", stackLimit: 1 },
      { itemId: "item.armor", itemType: "armor", stackLimit: 1 },
      { itemId: "item.ring", itemType: "accessory", stackLimit: 1 },
      { itemId: "item.pickaxe", itemType: "tool", stackLimit: 1 },
      { itemId: "item.gem", itemType: "currencyItem", stackLimit: 20 },
    ],
    inventoryDefinitions: [
      { inventoryId: "inventory.hero", ownerInstanceId: "hero.1", capacity: 4, slotIds: ["slot.1", "slot.2", "slot.3", "slot.4"] },
      { inventoryId: "inventory.chest", ownerInstanceId: "chest.1", capacity: 3, slotIds: ["slot.a", "slot.b", "slot.c"] },
    ],
    inventoryStates: [
      {
        inventoryId: "inventory.hero",
        ownerInstanceId: "hero.1",
        slots: [
          { slotId: "slot.1", itemId: "item.potion", quantity: 2 },
          { slotId: "slot.2", itemId: "item.iron", quantity: 3 },
        ],
      },
      {
        inventoryId: "inventory.chest",
        ownerInstanceId: "chest.1",
        slots: [{ slotId: "slot.a", itemId: "item.gem", quantity: 1 }],
      },
    ],
    inventoryActions: [
      { actionId: "inventory.add.potion", actionType: "add", inventoryId: "inventory.hero", itemId: "item.potion", quantity: 3 },
      { actionId: "inventory.remove.potion", actionType: "remove", inventoryId: "inventory.hero", itemId: "item.potion", quantity: 1 },
    ],
    equipmentDefinitions: [
      {
        equipmentId: "equipment.hero",
        ownerInstanceId: "hero.1",
        slots: [
          { slotId: "weapon", slotType: "weapon", allowedItemTypes: ["weapon"] },
          { slotId: "armor", slotType: "armor", allowedItemTypes: ["armor"] },
          { slotId: "accessory", slotType: "accessory", allowedItemTypes: ["accessory"] },
          { slotId: "tool", slotType: "tool", allowedItemTypes: ["tool"] },
        ],
      },
    ],
    equipmentStates: [{ equipmentId: "equipment.hero", ownerInstanceId: "hero.1", equipped: [] }],
    equipmentActions: [
      { actionId: "equip.sword", actionType: "equip", equipmentId: "equipment.hero", slotId: "weapon", itemId: "item.sword" },
      { actionId: "equip.ring", actionType: "equip", equipmentId: "equipment.hero", slotId: "accessory", itemId: "item.ring" },
    ],
    lootTables: [
      {
        lootTableId: "loot.basic",
        entries: [
          { itemId: "item.potion", quantity: 2 },
          { itemId: "item.gem", quantity: 1 },
        ],
      },
    ],
    itemActions: [
      { actionId: "pickup.loot", actionType: "pickup", inventoryId: "inventory.hero", lootTableId: "loot.basic", quantity: 1 },
      { actionId: "consume.potion", actionType: "consume", inventoryId: "inventory.hero", itemId: "item.potion", quantity: 1 },
      { actionId: "use.pickaxe", actionType: "use", inventoryId: "inventory.hero", itemId: "item.pickaxe", quantity: 1 },
      { actionId: "drop.iron", actionType: "drop", inventoryId: "inventory.hero", itemId: "item.iron", quantity: 1 },
    ],
    currencyDefinitions: [
      { currencyId: "gold", displayName: "Gold", precision: 0 },
      { currencyId: "gem", displayName: "Gem", precision: 0 },
    ],
    currencyBalances: [
      { ownerInstanceId: "hero.1", currencyId: "gold", amount: 100 },
      { ownerInstanceId: "hero.1", currencyId: "gem", amount: 2 },
    ],
    economyActions: [
      { actionId: "spend.gold", actionType: "spend", ownerInstanceId: "hero.1", currencyId: "gold", amount: 25 },
      { actionId: "add.gem", actionType: "add", ownerInstanceId: "hero.1", currencyId: "gem", amount: 1 },
      { actionId: "exchange.gold", actionType: "exchange", ownerInstanceId: "hero.1", currencyId: "gold", amount: 10, targetCurrencyId: "gem", targetAmount: 1 },
    ],
  };
}
