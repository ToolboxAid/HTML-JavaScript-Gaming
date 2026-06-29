/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2PatrolBehavior.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_PATROL_ERRORS,
  updateEngineV2PatrolBehaviors,
} from "../../../www/src/engine/runtime/engineV2PatrolBehavior.js";
import { createEngineV2AiBehaviorFixture } from "./EngineV2AiBehaviorFixture.mjs";

export function run() {
  const fixture = createEngineV2AiBehaviorFixture();
  const result = updateEngineV2PatrolBehaviors({
    patrolDefinitions: fixture.patrolDefinitions,
    patrolStates: fixture.patrolStates,
    runtimeObjects: fixture.runtimeObjects,
    deltaMs: 500,
  });

  assert.equal(result.valid, true);
  assert.equal(result.patrolStates.find((state) => state.behaviorId === "patrol.loop").waypointIndex, 1);
  assert.equal(result.patrolStates.find((state) => state.behaviorId === "patrol.loop").pauseRemainingMs, 250);
  assert.equal(result.patrolStates.find((state) => state.behaviorId === "patrol.pingpong").waypointIndex, 1);
  assert.equal(result.patrolStates.find((state) => state.behaviorId === "patrol.pingpong").direction, -1);
  assert.equal(result.waypointEvents.length, 2);

  const movingResult = updateEngineV2PatrolBehaviors({
    patrolDefinitions: [fixture.patrolDefinitions[0]],
    patrolStates: [
      {
        behaviorId: "patrol.loop",
        waypointIndex: 1,
        direction: 1,
        pauseRemainingMs: 0,
      },
    ],
    runtimeObjects: fixture.runtimeObjects,
    deltaMs: 500,
  });

  assert.equal(movingResult.valid, true);
  assert.equal(movingResult.movementCommands[0].position.x, 10);
  assert.equal(movingResult.movementCommands[0].velocity.x, 20);

  const invalidResult = updateEngineV2PatrolBehaviors({
    patrolDefinitions: [
      {
        behaviorId: "patrol.invalid",
        instanceId: "patroller.1",
        mode: "loop",
        speed: 20,
        tolerance: 1,
        waypoints: [{ x: 0, y: 0 }],
      },
    ],
    patrolStates: fixture.patrolStates,
    runtimeObjects: fixture.runtimeObjects,
    deltaMs: 16,
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [ENGINE_V2_PATROL_ERRORS.DEFINITION_INVALID]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
