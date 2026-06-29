/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2InventorySystem.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_INVENTORY_ERRORS,
  resolveEngineV2Inventory,
} from "../../../www/src/engine/runtime/engineV2InventorySystem.js";
import { createEngineV2PossessionRuntimeFixture } from "./EngineV2PossessionRuntimeFixture.mjs";

export function run() {
  const fixture = createEngineV2PossessionRuntimeFixture();
  const result = resolveEngineV2Inventory({
    inventoryDefinitions: fixture.inventoryDefinitions,
    inventoryStates: fixture.inventoryStates,
    itemDefinitions: fixture.itemDefinitions,
    inventoryActions: fixture.inventoryActions,
  });

  assert.equal(result.valid, true);
  assert.equal(result.inventoryEvents.length, 2);
  assert.equal(result.inventoryStates.find((state) => state.inventoryId === "inventory.hero").slots[0].quantity, 4);

  const invalidResult = resolveEngineV2Inventory({
    inventoryDefinitions: [{ inventoryId: "inventory.tiny", ownerInstanceId: "hero.1", capacity: 1, slotIds: ["slot.1"] }],
    inventoryStates: [{ inventoryId: "inventory.tiny", ownerInstanceId: "hero.1", slots: [{ slotId: "slot.1", itemId: "item.sword", quantity: 1 }] }],
    itemDefinitions: fixture.itemDefinitions,
    inventoryActions: [{ actionId: "overflow", actionType: "add", inventoryId: "inventory.tiny", itemId: "item.armor", quantity: 1 }],
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [ENGINE_V2_INVENTORY_ERRORS.CAPACITY_EXCEEDED]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
