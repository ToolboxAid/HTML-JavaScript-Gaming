/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2ItemAndLootSystem.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_ITEM_LOOT_ERRORS,
  resolveEngineV2ItemAndLoot,
} from "../../../www/src/engine/runtime/engineV2ItemAndLootSystem.js";
import { createEngineV2PossessionRuntimeFixture } from "./EngineV2PossessionRuntimeFixture.mjs";

export function run() {
  const fixture = createEngineV2PossessionRuntimeFixture();
  const result = resolveEngineV2ItemAndLoot({
    itemDefinitions: fixture.itemDefinitions,
    lootTables: fixture.lootTables,
    itemActions: fixture.itemActions,
  });

  assert.equal(result.valid, true);
  assert.equal(result.lootDrops.length, 2);
  assert.deepEqual(result.itemEvents.map((event) => event.actionType), ["pickup", "consume", "use", "drop"]);
  assert.deepEqual(result.inventoryActions.map((action) => action.actionType), ["add", "add", "remove", "remove", "remove"]);

  const invalidResult = resolveEngineV2ItemAndLoot({
    itemDefinitions: fixture.itemDefinitions,
    lootTables: fixture.lootTables,
    itemActions: [{ actionId: "missing.item", actionType: "use", inventoryId: "inventory.hero", itemId: "item.missing", quantity: 1 }],
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [ENGINE_V2_ITEM_LOOT_ERRORS.ITEM_MISSING]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
