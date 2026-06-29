/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2EconomyAndCurrency.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_ECONOMY_ERRORS,
  resolveEngineV2EconomyAndCurrency,
} from "../../../www/src/engine/runtime/engineV2EconomyAndCurrency.js";
import { createEngineV2PossessionRuntimeFixture } from "./EngineV2PossessionRuntimeFixture.mjs";

export function run() {
  const fixture = createEngineV2PossessionRuntimeFixture();
  const result = resolveEngineV2EconomyAndCurrency({
    currencyDefinitions: fixture.currencyDefinitions,
    currencyBalances: fixture.currencyBalances,
    economyActions: fixture.economyActions,
  });

  const gold = result.currencyBalances.find((balance) => balance.currencyId === "gold");
  const gem = result.currencyBalances.find((balance) => balance.currencyId === "gem");

  assert.equal(result.valid, true);
  assert.equal(gold.amount, 65);
  assert.equal(gem.amount, 4);
  assert.deepEqual(result.economyEvents.map((event) => event.actionType), ["spend", "add", "exchange"]);

  const invalidResult = resolveEngineV2EconomyAndCurrency({
    currencyDefinitions: fixture.currencyDefinitions,
    currencyBalances: [{ ownerInstanceId: "hero.1", currencyId: "gold", amount: 1 }],
    economyActions: [{ actionId: "overspend", actionType: "spend", ownerInstanceId: "hero.1", currencyId: "gold", amount: 10 }],
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [ENGINE_V2_ECONOMY_ERRORS.BALANCE_UNAVAILABLE]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
