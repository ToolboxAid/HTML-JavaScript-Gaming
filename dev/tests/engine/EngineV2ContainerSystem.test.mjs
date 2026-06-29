/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2ContainerSystem.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_CONTAINER_ERRORS,
  resolveEngineV2Containers,
} from "../../../www/src/engine/runtime/engineV2ContainerSystem.js";
import { createEngineV2InteractionRuntimeFixture } from "./EngineV2InteractionRuntimeFixture.mjs";

export function run() {
  const fixture = createEngineV2InteractionRuntimeFixture();
  const result = resolveEngineV2Containers({
    containerDefinitions: fixture.containerDefinitions,
    containerStates: fixture.containerStates,
    inventoryStates: fixture.inventoryStates,
    containerActions: fixture.containerActions,
  });

  assert.equal(result.valid, true);
  assert.equal(result.containerStates.find((state) => state.containerId === "container.chest").isOpen, true);
  assert.equal(result.inventoryTransferRequests.length, 2);
  assert.deepEqual(result.inventoryTransferRequests.map((request) => request.actionType), ["deposit", "withdraw"]);

  const invalidResult = resolveEngineV2Containers({
    containerDefinitions: fixture.containerDefinitions,
    containerStates: fixture.containerStates,
    inventoryStates: fixture.inventoryStates,
    containerActions: [{ actionId: "bad.transfer", actionType: "deposit", containerId: "container.chest", actorInventoryId: "missing.inventory", itemId: "item.potion", quantity: 1 }],
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [ENGINE_V2_CONTAINER_ERRORS.INVENTORY_MISSING]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
