/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2AbilitySystem.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_ABILITY_ERRORS,
  resolveEngineV2Abilities,
} from "../../../www/src/engine/runtime/engineV2AbilitySystem.js";
import { createEngineV2CombatRuntimeFixture } from "./EngineV2CombatRuntimeFixture.mjs";

export function run() {
  const fixture = createEngineV2CombatRuntimeFixture();
  const result = resolveEngineV2Abilities({
    abilityDefinitions: fixture.abilityDefinitions,
    abilityStates: fixture.abilityStates,
    conditionMatches: fixture.conditionMatches,
    runtimeEvents: fixture.runtimeEvents,
    actionOutcomes: fixture.actionOutcomes,
    cooldownResult: fixture.cooldownResult,
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.abilityEvents.map((event) => event.abilityId), ["ability.firebolt", "ability.thorns", "ability.poisonCloud"]);
  assert.deepEqual(result.abilityEvents.map((event) => event.sourceType), ["event", "action", "condition"]);
  assert.deepEqual(result.abilityActionRequests.map((request) => request.actionId), ["action.spawn.firebolt", "action.apply.burn", "action.apply.poison"]);

  const blockedResult = resolveEngineV2Abilities({
    abilityDefinitions: [fixture.abilityDefinitions[0]],
    abilityStates: fixture.abilityStates,
    conditionMatches: [],
    runtimeEvents: fixture.runtimeEvents,
    actionOutcomes: [],
    cooldownResult: {
      acceptedRequests: [],
      blockedRequests: [{ requestId: "request.firebolt.1", cooldownId: "cooldown.firebolt.mage" }],
    },
  });

  assert.equal(blockedResult.valid, true);
  assert.equal(blockedResult.abilityEvents.length, 0);
  assert.equal(blockedResult.blockedAbilityEvents[0].reason, "cooldownBlocked");

  const invalidResult = resolveEngineV2Abilities({
    abilityDefinitions: [
      {
        abilityId: "ability.invalid",
        abilityType: "active",
        ownerInstanceId: "mage.1",
        trigger: { triggerType: "event", eventType: "event.invalid" },
        actionIds: ["action.invalid"],
      },
    ],
    abilityStates: [{ abilityId: "ability.invalid", enabled: true }],
    conditionMatches: [],
    runtimeEvents: [],
    actionOutcomes: [],
    cooldownResult: { acceptedRequests: [], blockedRequests: [] },
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [ENGINE_V2_ABILITY_ERRORS.ACTIVE_COOLDOWN_REQUIRED]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
