/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2PathfindingBaseline.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_PATHFINDING_ERRORS,
  resolveEngineV2PathRequests,
} from "../../../www/src/engine/runtime/engineV2PathfindingBaseline.js";
import { createEngineV2AiBehaviorFixture } from "./EngineV2AiBehaviorFixture.mjs";

export function run() {
  const fixture = createEngineV2AiBehaviorFixture();
  const result = resolveEngineV2PathRequests({
    grid: fixture.grid,
    pathRequests: fixture.pathRequests,
    runtimeObjects: fixture.runtimeObjects,
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.pathResults[0].path[0], { x: 0, y: 0 });
  assert.deepEqual(result.pathResults[0].path[result.pathResults[0].path.length - 1], { x: 4, y: 4 });
  assert.equal(result.pathResults[0].instanceId, "patroller.1");

  const invalidObjectResult = resolveEngineV2PathRequests({
    grid: fixture.grid,
    pathRequests: [
      {
        requestId: "path.observer.invalid",
        instanceId: "observer.1",
        start: { x: 0, y: 0 },
        goal: { x: 4, y: 4 },
      },
    ],
    runtimeObjects: fixture.runtimeObjects,
  });

  assert.equal(invalidObjectResult.valid, false);
  assert.deepEqual(invalidObjectResult.errors.map((error) => error.code), [ENGINE_V2_PATHFINDING_ERRORS.OBJECT_NOT_DYNAMIC]);

  const blockedResult = resolveEngineV2PathRequests({
    grid: fixture.grid,
    pathRequests: [
      {
        requestId: "path.blocked",
        instanceId: "patroller.1",
        start: { x: 0, y: 1 },
        goal: { x: 4, y: 4 },
      },
    ],
    runtimeObjects: fixture.runtimeObjects,
  });

  assert.equal(blockedResult.valid, false);
  assert.deepEqual(blockedResult.errors.map((error) => error.code), [ENGINE_V2_PATHFINDING_ERRORS.START_BLOCKED]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
