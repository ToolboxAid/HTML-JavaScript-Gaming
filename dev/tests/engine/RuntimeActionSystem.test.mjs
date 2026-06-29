/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeActionSystem.test.mjs
*/

import assert from "node:assert/strict";
import { evaluateRuntimeConditions } from "../../../www/src/engine/runtime/runtimeConditionSystem.js";
import { publishRuntimeEvents } from "../../../www/src/engine/runtime/runtimeEventSystem.js";
import {
  RUNTIME_ACTION_ERRORS,
  readManifestActionDefinitions,
  resolveRuntimeActions,
} from "../../../www/src/engine/runtime/runtimeActionSystem.js";
import { createRuntimeGameRuleFixture } from "./RuntimeGameRuleFixture.mjs";

export function run() {
  const fixture = createRuntimeGameRuleFixture();
  const readResult = readManifestActionDefinitions(fixture.actionDefinitions);

  assert.equal(readResult.valid, true);
  assert.equal(readResult.actionDefinitions.length, 7);

  const conditionResult = evaluateRuntimeConditions(fixture.conditionDefinitions, fixture.runtimeFacts);
  const eventResult = publishRuntimeEvents(conditionResult.conditionMatches, fixture.runtimeEvents);
  const actionResult = resolveRuntimeActions(fixture.actionDefinitions, eventResult.runtimeEvents);

  assert.equal(actionResult.valid, true);
  assert.deepEqual(actionResult.actionOutcomes.map((outcome) => outcome.actionType), [
    "despawn",
    "score",
    "damage",
    "spawn",
    "sceneChange",
    "stateChange",
    "heal",
  ]);
  assert.equal(actionResult.actionOutcomes.find((outcome) => outcome.actionType === "spawn").ruleId, "spawn.coin");
  assert.equal(actionResult.actionOutcomes.find((outcome) => outcome.actionType === "score").points, 10);
  assert.equal(actionResult.actionOutcomes.find((outcome) => outcome.actionType === "sceneChange").toSceneId, "scene.bonus");

  const invalidResult = readManifestActionDefinitions([
    {
      actionId: "action.invalid.damage",
      actionType: "damage",
      eventType: "event.invalid",
      targetInstanceId: "enemy.1",
    },
  ]);

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [RUNTIME_ACTION_ERRORS.AMOUNT_REQUIRED]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
