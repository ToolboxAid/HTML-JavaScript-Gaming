/*
Toolbox Aid
David Quesenberry
06/03/2026
RuntimeOutcomeProcessing.test.mjs
*/

import assert from "node:assert/strict";
import {
  RUNTIME_OUTCOME_ERRORS,
  evaluateRuntimeOutcomes,
} from "../../../www/src/engine/runtime/runtimeOutcomeProcessing.js";
import { createRuntimeHealthOutcomeFixture } from "./RuntimeHealthOutcomeFixture.mjs";

export function run() {
  const fixture = createRuntimeHealthOutcomeFixture();
  const result = evaluateRuntimeOutcomes({
    outcomeDefinitions: fixture.outcomeDefinitions,
    runtimeState: fixture.runtimeState,
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.matchedOutcomes.map((outcome) => outcome.outcomeId), [
    "outcome.score.win",
    "outcome.health.lose",
    "outcome.lives.lose",
    "outcome.timer.draw",
    "outcome.object.state",
    "outcome.scene.state",
  ]);
  assert.deepEqual(result.matchedOutcomes.map((outcome) => outcome.outcomeType), ["win", "lose", "lose", "draw", "state", "state"]);

  const invalidResult = evaluateRuntimeOutcomes({
    outcomeDefinitions: [
      {
        outcomeId: "outcome.invalid",
        outcomeType: "win",
        conditionType: "score",
        comparator: "gte",
        value: 10,
      },
    ],
    runtimeState: fixture.runtimeState,
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [RUNTIME_OUTCOME_ERRORS.SCORE_KEY_REQUIRED]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
