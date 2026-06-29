/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2WeaponSystem.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_WEAPON_ERRORS,
  resolveEngineV2Weapons,
} from "../../../www/src/engine/runtime/engineV2WeaponSystem.js";
import { createEngineV2CombatRuntimeFixture } from "./EngineV2CombatRuntimeFixture.mjs";

export function run() {
  const fixture = createEngineV2CombatRuntimeFixture();
  const abilityEvents = fixture.abilityDefinitions.map((definition) => ({
    abilityId: definition.abilityId,
    abilityType: definition.abilityType,
    ownerInstanceId: definition.ownerInstanceId,
    sourceType: "test",
    sourceId: "test.source",
  }));
  const result = resolveEngineV2Weapons({
    weaponDefinitions: fixture.weaponDefinitions,
    weaponRequests: fixture.weaponRequests,
    abilityEvents,
    projectileDefinitions: fixture.projectileDefinitions,
    statusEffectDefinitions: fixture.statusEffectDefinitions,
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.weaponEvents.map((event) => event.weaponType), ["ranged", "melee", "area", "custom"]);
  assert.equal(result.projectileRequests[0].projectileDefinitionId, "projectile.firebolt");
  assert.equal(result.damageSources.length, 3);
  assert.equal(result.statusApplications.length, 4);
  assert.deepEqual(result.abilityRefs.map((ref) => ref.abilityId), ["ability.firebolt", "ability.thorns", "ability.poisonCloud", "ability.thorns"]);

  const invalidResult = resolveEngineV2Weapons({
    weaponDefinitions: [
      {
        weaponId: "weapon.invalid",
        weaponType: "ranged",
        ownerInstanceId: "mage.1",
        abilityIds: ["ability.firebolt"],
        projectileDefinitionIds: ["projectile.missing"],
        statusEffectIds: [],
        damageAmount: 0,
      },
    ],
    weaponRequests: [
      {
        requestId: "weapon.request.invalid",
        weaponId: "weapon.invalid",
        ownerInstanceId: "mage.1",
      },
    ],
    abilityEvents,
    projectileDefinitions: fixture.projectileDefinitions,
    statusEffectDefinitions: fixture.statusEffectDefinitions,
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [ENGINE_V2_WEAPON_ERRORS.PROJECTILE_MISSING]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
