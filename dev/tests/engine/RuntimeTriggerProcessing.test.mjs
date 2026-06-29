/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeTriggerProcessing.test.mjs
*/

import assert from "node:assert/strict";
import { RUNTIME_CONDITION_ERRORS } from "../../../www/src/engine/runtime/runtimeConditionSystem.js";
import {
  RUNTIME_TRIGGER_PROCESSING_ERRORS,
  processRuntimeTriggers,
} from "../../../www/src/engine/runtime/runtimeTriggerProcessing.js";
import { createRuntimeGameRuleFixture } from "./RuntimeGameRuleFixture.mjs";

export function run() {
  const fixture = createRuntimeGameRuleFixture();
  const result = processRuntimeTriggers({
    conditionDefinitions: fixture.conditionDefinitions,
    runtimeFacts: fixture.runtimeFacts,
    runtimeEvents: fixture.runtimeEvents,
    actionDefinitions: fixture.actionDefinitions,
  });

  assert.equal(result.valid, true);
  assert.equal(result.conditionMatches.length, 6);
  assert.equal(result.publishedEvents.length, 6);
  assert.equal(result.runtimeEvents.length, 7);
  assert.deepEqual(result.actionOutcomes.map((outcome) => outcome.actionType), [
    "despawn",
    "score",
    "damage",
    "spawn",
    "sceneChange",
    "stateChange",
    "heal",
  ]);

  const invalidResult = processRuntimeTriggers({
    conditionDefinitions: [
      {
        conditionId: "condition.invalid",
        conditionType: "scoreReached",
        eventType: "event.invalid",
        minScore: 1,
      },
    ],
    runtimeFacts: fixture.runtimeFacts,
    runtimeEvents: fixture.runtimeEvents,
    actionDefinitions: fixture.actionDefinitions,
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [
    RUNTIME_TRIGGER_PROCESSING_ERRORS.CONDITIONS_FAILED,
    RUNTIME_CONDITION_ERRORS.SCORE_KEY_REQUIRED,
  ]);

  const inputResult = processRuntimeTriggers(null);

  assert.equal(inputResult.valid, false);
  assert.deepEqual(inputResult.errors.map((error) => error.code), [RUNTIME_TRIGGER_PROCESSING_ERRORS.INPUT_INVALID]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
