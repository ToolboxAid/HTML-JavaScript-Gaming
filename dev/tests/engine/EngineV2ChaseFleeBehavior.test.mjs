/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2ChaseFleeBehavior.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_CHASE_FLEE_ERRORS,
  resolveEngineV2ChaseFleeBehaviors,
} from "../../../www/src/engine/runtime/engineV2ChaseFleeBehavior.js";
import { createEngineV2AiBehaviorFixture } from "./EngineV2AiBehaviorFixture.mjs";

export function run() {
  const fixture = createEngineV2AiBehaviorFixture();
  const result = resolveEngineV2ChaseFleeBehaviors({
    behaviorDefinitions: fixture.chaseFleeDefinitions,
    runtimeObjects: fixture.runtimeObjects,
    deltaMs: 1000,
  });

  assert.equal(result.valid, true);
  assert.equal(result.movementCommands.find((command) => command.instanceId === "patroller.1").position.x, 30);
  assert.equal(result.movementCommands.find((command) => command.instanceId === "target.1").position.x, 100);
  assert.deepEqual(result.behaviorEvents.map((event) => event.behaviorType), ["chase", "flee"]);
  assert.deepEqual(result.behaviorEvents.map((event) => event.targetInstanceId), ["target.1", "patroller.1"]);

  const invalidResult = resolveEngineV2ChaseFleeBehaviors({
    behaviorDefinitions: [
      {
        behaviorId: "chase.missing",
        behaviorType: "chase",
        instanceId: "patroller.1",
        targetSelector: {
          selectorType: "instanceId",
          instanceId: "missing.1",
        },
        speed: 30,
        stopDistance: 5,
        desiredDistance: 30,
      },
    ],
    runtimeObjects: fixture.runtimeObjects,
    deltaMs: 16,
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [ENGINE_V2_CHASE_FLEE_ERRORS.TARGET_MISSING]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
