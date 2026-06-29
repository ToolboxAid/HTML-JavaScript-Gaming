/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2ObjectiveSystem.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_OBJECTIVE_ERRORS,
  processEngineV2Objectives,
} from "../../../www/src/engine/runtime/engineV2ObjectiveSystem.js";
import { createEngineV2PlayerRuntimeFixture } from "./EngineV2PlayerRuntimeFixture.mjs";

export function run() {
  const fixture = createEngineV2PlayerRuntimeFixture();
  const result = processEngineV2Objectives({
    objectiveDefinitions: fixture.objectiveDefinitions,
    objectiveStates: fixture.objectiveStates,
    objectiveEvents: fixture.objectiveEvents,
    runtimeState: fixture.runtimeState,
  });

  assert.equal(result.valid, true);
  assert.equal(result.objectiveStates.length, 7);
  assert.deepEqual(result.objectiveStates.map((state) => state.completed), [true, true, true, true, true, true, true]);
  assert.deepEqual(result.objectiveCompletions.map((completion) => completion.objectiveType), ["collect", "defeat", "reach", "survive", "timer", "score", "interact"]);

  const invalidTypeResult = processEngineV2Objectives({
    objectiveDefinitions: [
      { objectiveId: "objective.invalid", objectiveType: "hiddenDefault", criteria: {}, requiredValue: 1 },
    ],
    objectiveStates: [
      { objectiveId: "objective.invalid", progress: 0, completed: false },
    ],
    objectiveEvents: [],
    runtimeState: fixture.runtimeState,
  });

  assert.equal(invalidTypeResult.valid, false);
  assert.deepEqual(invalidTypeResult.errors.map((error) => error.code), [ENGINE_V2_OBJECTIVE_ERRORS.DEFINITION_INVALID]);

  const missingScoreResult = processEngineV2Objectives({
    objectiveDefinitions: [
      { objectiveId: "objective.score.missing", objectiveType: "score", criteria: { scoreKey: "missingScore" }, requiredValue: 1 },
    ],
    objectiveStates: [
      { objectiveId: "objective.score.missing", progress: 0, completed: false },
    ],
    objectiveEvents: [],
    runtimeState: fixture.runtimeState,
  });

  assert.equal(missingScoreResult.valid, false);
  assert.deepEqual(missingScoreResult.errors.map((error) => error.code), [ENGINE_V2_OBJECTIVE_ERRORS.SCORE_STATE_MISSING]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
