/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2StateMachineRuntime.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_STATE_MACHINE_ERRORS,
  processEngineV2StateMachineRuntime,
} from "../../../www/src/engine/runtime/engineV2StateMachineRuntime.js";
import { createEngineV2FeatureCompleteFixture } from "./EngineV2FeatureCompleteFixture.mjs";

export function run() {
  const fixture = createEngineV2FeatureCompleteFixture().stateMachine;
  const result = processEngineV2StateMachineRuntime(fixture);

  assert.equal(result.valid, true);
  assert.equal(result.stateRecords.length, 6);
  assert.deepEqual(result.stateRecords.map((state) => state.stateScope), ["object", "scene", "ui", "door", "interaction", "combat"]);
  assert.deepEqual(result.transitionEvents.map((event) => event.toState), ["moving", "active", "visible", "open", "completed", "engaged"]);

  const conditionBlockedResult = processEngineV2StateMachineRuntime({
    ...fixture,
    conditionMatches: [],
  });

  assert.equal(conditionBlockedResult.valid, false);
  assert.deepEqual(conditionBlockedResult.errors.map((error) => error.code), [
    ENGINE_V2_STATE_MACHINE_ERRORS.CONDITION_UNMET,
    ENGINE_V2_STATE_MACHINE_ERRORS.CONDITION_UNMET,
    ENGINE_V2_STATE_MACHINE_ERRORS.CONDITION_UNMET,
    ENGINE_V2_STATE_MACHINE_ERRORS.CONDITION_UNMET,
    ENGINE_V2_STATE_MACHINE_ERRORS.CONDITION_UNMET,
    ENGINE_V2_STATE_MACHINE_ERRORS.CONDITION_UNMET,
  ]);

  const invalidScopeResult = processEngineV2StateMachineRuntime({
    ...fixture,
    stateRecords: [{ stateScope: "gameSpecific", ownerId: "hero.1", currentState: "idle" }],
  });

  assert.equal(invalidScopeResult.valid, false);
  assert.deepEqual(invalidScopeResult.errors.map((error) => error.code), [ENGINE_V2_STATE_MACHINE_ERRORS.STATE_INVALID]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
