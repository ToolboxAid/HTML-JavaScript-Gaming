/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2ModifierStack.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_MODIFIER_ERRORS,
  resolveEngineV2ModifierStack,
} from "../../../www/src/engine/runtime/engineV2ModifierStack.js";
import { createEngineV2FeatureCompleteFixture } from "./EngineV2FeatureCompleteFixture.mjs";

export function run() {
  const fixture = createEngineV2FeatureCompleteFixture().modifiers;
  const result = resolveEngineV2ModifierStack(fixture);

  assert.equal(result.valid, true);
  assert.deepEqual(result.appliedModifiers.map((modifier) => modifier.sourceType), ["terrain", "object", "environment", "statusEffect", "equipment", "ability", "rule"]);
  assert.equal(result.resolvedValues.find((entry) => entry.key === "hero.1.speed").value, 12);
  assert.deepEqual(result.appliedModifiers.map((modifier) => modifier.afterValue), [8, 10, 9, 4.5, 7.5, 15, 12]);

  const reorderedResult = resolveEngineV2ModifierStack({
    baseValues: fixture.baseValues,
    modifiers: [...fixture.modifiers].reverse(),
  });

  assert.equal(reorderedResult.valid, true);
  assert.deepEqual(reorderedResult.appliedModifiers.map((modifier) => modifier.modifierId), result.appliedModifiers.map((modifier) => modifier.modifierId));
  assert.equal(reorderedResult.resolvedValues.find((entry) => entry.key === "hero.1.speed").value, 12);

  const missingBaseResult = resolveEngineV2ModifierStack({
    baseValues: {},
    modifiers: fixture.modifiers,
  });

  assert.equal(missingBaseResult.valid, false);
  assert.deepEqual(missingBaseResult.errors.map((error) => error.code), Array(fixture.modifiers.length).fill(ENGINE_V2_MODIFIER_ERRORS.BASE_VALUE_MISSING));

  const invalidSourceResult = resolveEngineV2ModifierStack({
    baseValues: fixture.baseValues,
    modifiers: [{ ...fixture.modifiers[0], sourceType: "gameSpecificBuff" }],
  });

  assert.equal(invalidSourceResult.valid, false);
  assert.deepEqual(invalidSourceResult.errors.map((error) => error.code), [ENGINE_V2_MODIFIER_ERRORS.MODIFIER_INVALID]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
