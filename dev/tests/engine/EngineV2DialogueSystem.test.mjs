/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2DialogueSystem.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_DIALOGUE_ERRORS,
  processEngineV2Dialogue,
} from "../../../www/src/engine/runtime/engineV2DialogueSystem.js";
import { createEngineV2PlayerRuntimeFixture } from "./EngineV2PlayerRuntimeFixture.mjs";

export function run() {
  const fixture = createEngineV2PlayerRuntimeFixture();
  const result = processEngineV2Dialogue({
    dialogueDefinitions: fixture.dialogueDefinitions,
    dialogueStates: fixture.dialogueStates,
    dialogueRequests: fixture.dialogueRequests,
    conditionMatches: fixture.conditionMatches,
  });

  assert.equal(result.valid, true);
  assert.equal(result.dialogueEvents.length, 2);
  assert.deepEqual(result.dialogueEvents.map((event) => event.requestId), ["dialogue.show", "dialogue.choice"]);
  assert.deepEqual(result.actionRequests, [
    { requestId: "dialogue.choice", dialogueId: "dialogue.elder", choiceId: "accept", actionId: "quest.tutorial.advance" },
  ]);
  assert.deepEqual(result.dialogueStates, [{ dialogueId: "dialogue.elder", currentNodeId: "reward" }]);

  const invalidResult = processEngineV2Dialogue({
    dialogueDefinitions: fixture.dialogueDefinitions,
    dialogueStates: fixture.dialogueStates,
    dialogueRequests: [
      { requestId: "dialogue.choice", dialogueId: "dialogue.elder", actorInstanceId: "hero.1", nodeId: "start", choiceId: "accept" },
    ],
    conditionMatches: [],
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [ENGINE_V2_DIALOGUE_ERRORS.CONDITION_UNMET]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
