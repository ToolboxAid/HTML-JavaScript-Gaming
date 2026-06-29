/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2AnimationRuntime.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_ANIMATION_ERRORS,
  updateEngineV2Animations,
} from "../../../www/src/engine/runtime/engineV2AnimationRuntime.js";
import { createEngineV2MediaRuntimeFixture } from "./EngineV2MediaRuntimeFixture.mjs";

export function run() {
  const fixture = createEngineV2MediaRuntimeFixture();
  const result = updateEngineV2Animations({
    animationDefinitions: fixture.animationDefinitions,
    objectAnimationStates: fixture.objectAnimationStates,
    runtimeObjectStates: fixture.runtimeObjectStates,
    deltaMs: 160,
  });

  assert.equal(result.valid, true);
  assert.equal(result.animationStates[0].animationId, "animation.player.jump");
  assert.equal(result.animationStates[0].frameIndex, 2);
  assert.equal(result.animationStates[0].finished, false);
  assert.equal(result.frameCommands[0].frame, "player.jump.2");

  const finishedResult = updateEngineV2Animations({
    animationDefinitions: fixture.animationDefinitions,
    objectAnimationStates: result.animationStates,
    runtimeObjectStates: fixture.runtimeObjectStates,
    deltaMs: 80,
  });

  assert.equal(finishedResult.valid, true);
  assert.equal(finishedResult.animationStates[0].frameIndex, 2);
  assert.equal(finishedResult.animationStates[0].finished, true);

  const invalidResult = updateEngineV2Animations({
    animationDefinitions: fixture.animationDefinitions,
    objectAnimationStates: [
      {
        instanceId: "player.1",
        animationId: "animation.missing",
        frameIndex: 0,
        elapsedMs: 0,
        finished: false,
      },
    ],
    runtimeObjectStates: {},
    deltaMs: 16,
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [ENGINE_V2_ANIMATION_ERRORS.ANIMATION_MISSING]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
