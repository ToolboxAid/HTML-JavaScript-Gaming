/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2ProjectileSystem.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_PROJECTILE_ERRORS,
  resolveEngineV2Projectiles,
} from "../../../www/src/engine/runtime/engineV2ProjectileSystem.js";
import { createEngineV2CombatRuntimeFixture } from "./EngineV2CombatRuntimeFixture.mjs";

export function run() {
  const fixture = createEngineV2CombatRuntimeFixture();
  const result = resolveEngineV2Projectiles({
    projectileDefinitions: fixture.projectileDefinitions,
    projectileRequests: fixture.projectileRequests,
    projectileRecords: fixture.projectileRecords,
    collisionEvents: fixture.projectileCollisionEvents,
    deltaMs: 100,
  });

  assert.equal(result.valid, true);
  assert.equal(result.spawnedProjectiles[0].projectileInstanceId, "projectile.firebolt.projectile.request.1");
  assert.equal(result.spawnedProjectiles[0].velocity.x, 100);
  assert.deepEqual(result.despawnedProjectileIds, ["projectile.existing.1"]);
  assert.equal(result.collisionActions[0].targetInstanceId, "target.1");
  assert.equal(result.collisionActions[0].amount, 15);
  assert.equal(result.statusApplications[0].statusEffectId, "status.burn");

  const invalidResult = resolveEngineV2Projectiles({
    projectileDefinitions: fixture.projectileDefinitions,
    projectileRequests: [
      {
        requestId: "projectile.invalid",
        projectileDefinitionId: "projectile.missing",
        sourceInstanceId: "mage.1",
        position: { x: 0, y: 0 },
        direction: { x: 1, y: 0 },
      },
    ],
    projectileRecords: [],
    collisionEvents: [],
    deltaMs: 16,
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [ENGINE_V2_PROJECTILE_ERRORS.DEFINITION_MISSING]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
