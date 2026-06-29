/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2CraftingFoundation.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_CRAFTING_ERRORS,
  resolveEngineV2Crafting,
} from "../../../www/src/engine/runtime/engineV2CraftingFoundation.js";
import { createEngineV2InteractionRuntimeFixture } from "./EngineV2InteractionRuntimeFixture.mjs";

export function run() {
  const fixture = createEngineV2InteractionRuntimeFixture();
  const result = resolveEngineV2Crafting({
    recipeDefinitions: fixture.recipeDefinitions,
    craftingRequests: fixture.craftingRequests,
    itemDefinitions: fixture.itemDefinitions,
  });

  assert.equal(result.valid, true);
  assert.equal(result.craftingEvents[0].recipeId, "recipe.sword");
  assert.deepEqual(result.inventoryActions.map((action) => action.actionType), ["remove", "add"]);

  const invalidResult = resolveEngineV2Crafting({
    recipeDefinitions: [{ recipeId: "recipe.bad", inputs: [{ itemId: "item.missing", quantity: 1 }], outputs: [{ itemId: "item.sword", quantity: 1 }] }],
    craftingRequests: [{ requestId: "craft.bad", recipeId: "recipe.bad", inventoryId: "inventory.hero" }],
    itemDefinitions: fixture.itemDefinitions,
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [ENGINE_V2_CRAFTING_ERRORS.ITEM_MISSING]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
