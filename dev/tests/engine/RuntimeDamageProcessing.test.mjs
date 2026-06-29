/*
Toolbox Aid
David Quesenberry
06/03/2026
RuntimeDamageProcessing.test.mjs
*/

import assert from "node:assert/strict";
import { createRuntimeHealthRecords } from "../../../www/src/engine/runtime/runtimeHealthModel.js";
import {
  RUNTIME_DAMAGE_ERRORS,
  processRuntimeDamage,
} from "../../../www/src/engine/runtime/runtimeDamageProcessing.js";
import { createRuntimeHealthOutcomeFixture } from "./RuntimeHealthOutcomeFixture.mjs";

export function run() {
  const fixture = createRuntimeHealthOutcomeFixture();
  const healthResult = createRuntimeHealthRecords(fixture.healthDefinitions, fixture.currentTimeMs);
  const result = processRuntimeDamage({
    healthRecords: healthResult.healthRecords,
    damageSources: fixture.damageSources,
    currentTimeMs: fixture.currentTimeMs,
  });

  assert.equal(result.valid, true);
  assert.equal(result.healthRecords.find((record) => record.instanceId === "player.1").health, 40);
  assert.equal(result.healthRecords.find((record) => record.instanceId === "enemy.1").health, 20);
  assert.equal(result.damageEvents.length, 3);
  assert.deepEqual(result.damageEvents.map((event) => event.sourceType), ["action", "collision", "trigger"]);
  assert.deepEqual(result.preventedEvents.map((event) => event.reason), ["invulnerable"]);

  const invalidTargetResult = processRuntimeDamage({
    healthRecords: healthResult.healthRecords,
    damageSources: [
      {
        sourceId: "action.damage.missing",
        sourceType: "action",
        targetInstanceId: "missing.1",
        amount: 5,
      },
    ],
    currentTimeMs: fixture.currentTimeMs,
  });

  assert.equal(invalidTargetResult.valid, false);
  assert.deepEqual(invalidTargetResult.errors.map((error) => error.code), [RUNTIME_DAMAGE_ERRORS.TARGET_MISSING]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
