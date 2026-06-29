/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeConditionSystem.test.mjs
*/

import assert from "node:assert/strict";
import {
  RUNTIME_CONDITION_ERRORS,
  evaluateRuntimeConditions,
  readManifestConditionDefinitions,
} from "../../../www/src/engine/runtime/runtimeConditionSystem.js";
import { createRuntimeGameRuleFixture } from "./RuntimeGameRuleFixture.mjs";

export function run() {
  const fixture = createRuntimeGameRuleFixture();
  const readResult = readManifestConditionDefinitions(fixture.conditionDefinitions);

  assert.equal(readResult.valid, true);
  assert.equal(readResult.conditionDefinitions.length, 6);

  const evaluationResult = evaluateRuntimeConditions(fixture.conditionDefinitions, fixture.runtimeFacts);

  assert.equal(evaluationResult.valid, true);
  assert.deepEqual(evaluationResult.conditionMatches.map((match) => match.conditionType), [
    "collision",
    "overlap",
    "timer",
    "scoreReached",
    "objectDestroyed",
    "objectSpawned",
  ]);
  assert.deepEqual(evaluationResult.conditionMatches.map((match) => match.eventType), [
    "event.coinCollision",
    "event.exitOverlap",
    "event.timerReady",
    "event.scoreReady",
    "event.enemyDestroyed",
    "event.coinSpawned",
  ]);

  const missingScoreKeyResult = readManifestConditionDefinitions([
    {
      conditionId: "condition.invalid.score",
      conditionType: "scoreReached",
      eventType: "event.invalid",
      minScore: 1,
    },
  ]);

  assert.equal(missingScoreKeyResult.valid, false);
  assert.deepEqual(missingScoreKeyResult.errors.map((error) => error.code), [RUNTIME_CONDITION_ERRORS.SCORE_KEY_REQUIRED]);

  const unsupportedConditionResult = readManifestConditionDefinitions([
    {
      conditionId: "condition.invalid.custom",
      conditionType: "customWinCondition",
      eventType: "event.invalid",
    },
  ]);

  assert.equal(unsupportedConditionResult.valid, false);
  assert.deepEqual(unsupportedConditionResult.errors.map((error) => error.code), [RUNTIME_CONDITION_ERRORS.CONDITION_TYPE_INVALID]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
