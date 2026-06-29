/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2VendorSystem.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_VENDOR_ERRORS,
  resolveEngineV2Vendor,
} from "../../../www/src/engine/runtime/engineV2VendorSystem.js";
import { createEngineV2InteractionRuntimeFixture } from "./EngineV2InteractionRuntimeFixture.mjs";

export function run() {
  const fixture = createEngineV2InteractionRuntimeFixture();
  const result = resolveEngineV2Vendor({
    vendorDefinitions: fixture.vendorDefinitions,
    vendorRequests: fixture.vendorRequests,
    currencyDefinitions: fixture.currencyDefinitions,
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.vendorEvents.map((event) => event.actionType), ["buy", "sell", "exchange"]);
  assert.deepEqual(result.economyActions.map((action) => action.actionType), ["spend", "add", "exchange"]);
  assert.deepEqual(result.inventoryActions.map((action) => action.actionType), ["add", "remove"]);

  const invalidResult = resolveEngineV2Vendor({
    vendorDefinitions: fixture.vendorDefinitions,
    vendorRequests: [{ requestId: "bad.offer", actionType: "buy", vendorId: "vendor.market", offerId: "missing.offer", actorInstanceId: "hero.1", actorInventoryId: "inventory.hero" }],
    currencyDefinitions: fixture.currencyDefinitions,
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [ENGINE_V2_VENDOR_ERRORS.OFFER_MISSING]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
