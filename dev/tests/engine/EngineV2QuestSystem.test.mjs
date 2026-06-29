/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2QuestSystem.test.mjs
*/

import assert from "node:assert/strict";
import { processEngineV2Objectives } from "../../../www/src/engine/runtime/engineV2ObjectiveSystem.js";
import {
  ENGINE_V2_QUEST_ERRORS,
  processEngineV2Quests,
} from "../../../www/src/engine/runtime/engineV2QuestSystem.js";
import { createEngineV2PlayerRuntimeFixture } from "./EngineV2PlayerRuntimeFixture.mjs";

export function run() {
  const fixture = createEngineV2PlayerRuntimeFixture();
  const objectiveResult = processEngineV2Objectives({
    objectiveDefinitions: fixture.objectiveDefinitions,
    objectiveStates: fixture.objectiveStates,
    objectiveEvents: fixture.objectiveEvents,
    runtimeState: fixture.runtimeState,
  });
  const result = processEngineV2Quests({
    questDefinitions: fixture.questDefinitions,
    questStates: fixture.questStates,
    objectiveStates: objectiveResult.objectiveStates,
    triggerEvents: fixture.triggerEvents,
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.questStates.map((state) => state.questId), ["quest.tutorial", "quest.followup"]);
  assert.deepEqual(result.questStates.map((state) => state.status), ["completed", "locked"]);
  assert.deepEqual(result.questEvents, [{ questId: "quest.tutorial", eventType: "completed" }]);
  assert.deepEqual(result.rewardRequests.map((request) => request.rewardType), ["inventory", "economy"]);
  assert.deepEqual(result.triggerRequests, [{ questId: "quest.tutorial", triggerId: "trigger.quest.completed" }]);

  const invalidResult = processEngineV2Quests({
    questDefinitions: [
      {
        questId: "quest.invalid",
        prerequisiteQuestIds: [],
        triggerIds: [],
        steps: [
          { stepId: "step.missing", objectiveId: "objective.missing" },
        ],
        rewards: {
          inventoryActions: [],
          economyActions: [],
          triggerIds: [],
        },
      },
    ],
    questStates: [
      { questId: "quest.invalid", status: "active" },
    ],
    objectiveStates: objectiveResult.objectiveStates,
    triggerEvents: [],
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [ENGINE_V2_QUEST_ERRORS.OBJECTIVE_MISSING]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
