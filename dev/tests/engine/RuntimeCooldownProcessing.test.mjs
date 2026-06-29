/*
Toolbox Aid
David Quesenberry
06/03/2026
RuntimeCooldownProcessing.test.mjs
*/

import assert from "node:assert/strict";
import {
  RUNTIME_COOLDOWN_ERRORS,
  processRuntimeCooldowns,
} from "../../../www/src/engine/runtime/runtimeCooldownProcessing.js";
import { createRuntimeHealthOutcomeFixture } from "./RuntimeHealthOutcomeFixture.mjs";

export function run() {
  const fixture = createRuntimeHealthOutcomeFixture();
  const result = processRuntimeCooldowns({
    cooldownDefinitions: fixture.cooldownDefinitions,
    cooldownStates: fixture.cooldownStates,
    actionRequests: fixture.actionRequests,
    currentTimeMs: fixture.currentTimeMs,
  });

  assert.equal(result.valid, true);
  assert.equal(result.acceptedRequests[0].requestId, "request.dash.1");
  assert.equal(result.acceptedRequests[0].nextAvailableAtMs, 1500);
  assert.equal(result.blockedRequests[0].requestId, "request.blast.1");
  assert.equal(result.cooldownStates.find((state) => state.cooldownId === "cooldown.dash.player").availableAtMs, 1500);

  const invalidReferenceResult = processRuntimeCooldowns({
    cooldownDefinitions: fixture.cooldownDefinitions,
    cooldownStates: fixture.cooldownStates,
    actionRequests: [
      {
        requestId: "request.missing.1",
        cooldownId: "cooldown.missing",
        ownerInstanceId: "player.1",
        actionId: "action.missing",
      },
    ],
    currentTimeMs: fixture.currentTimeMs,
  });

  assert.equal(invalidReferenceResult.valid, false);
  assert.deepEqual(invalidReferenceResult.errors.map((error) => error.code), [RUNTIME_COOLDOWN_ERRORS.COOLDOWN_REFERENCE_MISSING]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
