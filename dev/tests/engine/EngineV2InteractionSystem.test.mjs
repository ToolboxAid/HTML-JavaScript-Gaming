/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2InteractionSystem.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_INTERACTION_ERRORS,
  resolveEngineV2Interactions,
} from "../../../www/src/engine/runtime/engineV2InteractionSystem.js";
import { createEngineV2InteractionRuntimeFixture } from "./EngineV2InteractionRuntimeFixture.mjs";

export function run() {
  const fixture = createEngineV2InteractionRuntimeFixture();
  const result = resolveEngineV2Interactions({
    interactionDefinitions: fixture.interactionDefinitions,
    interactionRequests: fixture.interactionRequests,
    runtimeObjects: fixture.runtimeObjects,
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.interactionEvents.map((event) => event.interactionType), ["open", "use", "activate", "talk", "collect", "inspect"]);
  assert.equal(result.actionRequests.length, 6);

  const invalidResult = resolveEngineV2Interactions({
    interactionDefinitions: fixture.interactionDefinitions,
    interactionRequests: [{ requestId: "missing.actor", interactionId: "interact.open.chest", actorInstanceId: "missing.1" }],
    runtimeObjects: fixture.runtimeObjects,
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [ENGINE_V2_INTERACTION_ERRORS.ACTOR_MISSING]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
