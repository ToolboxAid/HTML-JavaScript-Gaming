/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2EffectRuntime.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_EFFECT_ERRORS,
  processEngineV2Effects,
} from "../../../www/src/engine/runtime/engineV2EffectRuntime.js";
import { createEngineV2FeatureCompleteFixture } from "./EngineV2FeatureCompleteFixture.mjs";

export function run() {
  const fixture = createEngineV2FeatureCompleteFixture().effects;
  const result = processEngineV2Effects(fixture);

  assert.equal(result.valid, true);
  assert.equal(result.effectEvents.length, 9);
  assert.deepEqual(result.effectEvents.map((event) => event.effectType), ["explosion", "dust", "snow", "rain", "fire", "smoke", "sparkles", "hit", "pickup"]);
  assert.equal(result.effectInstances.find((effect) => effect.effectInstanceId === "effect.active.smoke").remainingMs, 400);

  const missingDefinitionResult = processEngineV2Effects({
    ...fixture,
    effectRequests: [{ requestId: "effect.request.missing", effectId: "effect.missing", position: { x: 0, y: 0 } }],
  });

  assert.equal(missingDefinitionResult.valid, false);
  assert.deepEqual(missingDefinitionResult.errors.map((error) => error.code), [ENGINE_V2_EFFECT_ERRORS.DEFINITION_MISSING]);

  const invalidTypeResult = processEngineV2Effects({
    ...fixture,
    effectDefinitions: [{ effectId: "effect.bad", effectType: "gameSpecificSpark", durationMs: 1000, payload: {} }],
  });

  assert.equal(invalidTypeResult.valid, false);
  assert.deepEqual(invalidTypeResult.errors.map((error) => error.code), [ENGINE_V2_EFFECT_ERRORS.DEFINITION_INVALID]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
