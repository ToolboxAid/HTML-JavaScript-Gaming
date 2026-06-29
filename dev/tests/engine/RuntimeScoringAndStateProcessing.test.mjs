/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeScoringAndStateProcessing.test.mjs
*/
import assert from "node:assert/strict";
import {
  RUNTIME_SCORING_STATE_ERRORS,
  processRuntimeScoringAndState,
} from "../../../www/src/engine/runtime/runtimeScoringAndStateProcessing.js";
import { readManifestSceneDefinitions } from "../../../www/src/engine/runtime/runtimeSceneDefinitionSupport.js";
import { createRuntimeGameplayLoopManifest } from "./RuntimeGameplayLoopFixture.mjs";

export function run() {
  const manifest = createRuntimeGameplayLoopManifest();
  const scene = readManifestSceneDefinitions(manifest).sceneDefinitions[0];
  const result = processRuntimeScoringAndState({
    runtimeState: {
      scores: { coins: 0 },
      flags: { exitOpen: false },
    },
    scoringDefinitions: scene.scoringDefinitions,
    stateDefinitions: scene.stateDefinitions,
    ruleOutcomes: [
      { ruleId: "collect.coin", outcomeType: "score" },
      { ruleId: "transition.exit", outcomeType: "state" },
    ],
  });

  assert.equal(result.valid, true);
  assert.equal(result.runtimeState.scores.coins, 10);
  assert.equal(result.runtimeState.flags.exitOpen, true);
  assert.equal(result.scoreEvents[0].scoreKey, "coins");
  assert.equal(result.stateEvents[0].stateKey, "exitOpen");

  const invalidResult = processRuntimeScoringAndState({
    runtimeState: { scores: {}, flags: {} },
    scoringDefinitions: [{ ruleId: "collect.coin", points: 10 }],
    stateDefinitions: [],
    ruleOutcomes: [{ ruleId: "collect.coin", outcomeType: "score" }],
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [RUNTIME_SCORING_STATE_ERRORS.SCORE_DEFINITION_INVALID]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
