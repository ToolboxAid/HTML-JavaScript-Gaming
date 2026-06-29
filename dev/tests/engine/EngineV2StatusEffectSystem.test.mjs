/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2StatusEffectSystem.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_STATUS_EFFECT_ERRORS,
  processEngineV2StatusEffects,
} from "../../../www/src/engine/runtime/engineV2StatusEffectSystem.js";
import { createEngineV2CombatRuntimeFixture } from "./EngineV2CombatRuntimeFixture.mjs";

export function run() {
  const fixture = createEngineV2CombatRuntimeFixture();
  const result = processEngineV2StatusEffects({
    statusEffectDefinitions: fixture.statusEffectDefinitions,
    statusApplications: fixture.statusApplications,
    activeStatusEffects: fixture.activeStatusEffects,
    healthRecords: fixture.healthRecords,
    deltaMs: 200,
    currentTimeMs: 1000,
  });

  assert.equal(result.valid, true);
  assert.equal(result.statusEffects.length, 2);
  assert.equal(result.damageSources[0].sourceId, "status.active.poison");
  assert.equal(result.damageEvents[0].amount, 5);
  assert.equal(result.healthRecords.find((record) => record.instanceId === "target.1").health, 35);
  assert.equal(result.movementModifiers[0].targetInstanceId, "target.1");
  assert.equal(result.movementModifiers[0].movementMultiplier, 0.5);

  const typeResult = processEngineV2StatusEffects({
    statusEffectDefinitions: fixture.statusEffectDefinitions,
    statusApplications: [],
    activeStatusEffects: [],
    healthRecords: fixture.healthRecords,
    deltaMs: 16,
    currentTimeMs: 1000,
  });

  assert.equal(typeResult.valid, true);

  const invalidResult = processEngineV2StatusEffects({
    statusEffectDefinitions: fixture.statusEffectDefinitions,
    statusApplications: [
      {
        applicationId: "status.invalid",
        statusEffectId: "status.poison",
        targetInstanceId: "missing.1",
        sourceId: "weapon.staff",
      },
    ],
    activeStatusEffects: [],
    healthRecords: fixture.healthRecords,
    deltaMs: 16,
    currentTimeMs: 1000,
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [ENGINE_V2_STATUS_EFFECT_ERRORS.TARGET_MISSING]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
