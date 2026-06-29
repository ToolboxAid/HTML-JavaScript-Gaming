/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2CheckpointSystem.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_CHECKPOINT_ERRORS,
  processEngineV2Checkpoints,
} from "../../../www/src/engine/runtime/engineV2CheckpointSystem.js";
import { createEngineV2PersistenceRuntimeFixture } from "./EngineV2PersistenceRuntimeFixture.mjs";

export function run() {
  const fixture = createEngineV2PersistenceRuntimeFixture();
  const result = processEngineV2Checkpoints({
    checkpointDefinitions: fixture.checkpointDefinitions,
    checkpointState: fixture.checkpointState,
    checkpointActions: fixture.checkpointActions,
  });

  assert.equal(result.valid, true);
  assert.equal(result.checkpointState.activeCheckpointId, "checkpoint.start");
  assert.equal(result.restoreRequests[0].sceneId, "scene.start");
  assert.deepEqual(result.checkpointEvents.map((event) => event.actionType), ["activate", "restore"]);

  const invalidResult = processEngineV2Checkpoints({
    checkpointDefinitions: fixture.checkpointDefinitions,
    checkpointState: fixture.checkpointState,
    checkpointActions: [{ actionId: "checkpoint.bad", actionType: "restore", checkpointId: "checkpoint.missing" }],
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [ENGINE_V2_CHECKPOINT_ERRORS.CHECKPOINT_MISSING]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
