/*
Toolbox Aid
David Quesenberry
06/03/2026
RuntimeHealthModel.test.mjs
*/

import assert from "node:assert/strict";
import {
  RUNTIME_HEALTH_ERRORS,
  createRuntimeHealthRecords,
} from "../../../www/src/engine/runtime/runtimeHealthModel.js";
import { createRuntimeHealthOutcomeFixture } from "./RuntimeHealthOutcomeFixture.mjs";

export function run() {
  const fixture = createRuntimeHealthOutcomeFixture();
  const result = createRuntimeHealthRecords(fixture.healthDefinitions, fixture.currentTimeMs);

  assert.equal(result.valid, true);
  assert.equal(result.healthRecords.length, 3);
  assert.equal(result.healthRecords.find((record) => record.instanceId === "player.1").state, "alive");
  assert.equal(result.healthRecords.find((record) => record.instanceId === "enemy.1").invulnerable, true);
  assert.equal(result.healthRecords.find((record) => record.instanceId === "hazard.1").state, "dead");

  const inconsistentResult = createRuntimeHealthRecords([
    {
      instanceId: "player.1",
      health: 0,
      maxHealth: 100,
      invulnerableUntilMs: 0,
      alive: true,
    },
  ], fixture.currentTimeMs);

  assert.equal(inconsistentResult.valid, false);
  assert.deepEqual(inconsistentResult.errors.map((error) => error.code), [RUNTIME_HEALTH_ERRORS.ALIVE_STATE_INCONSISTENT]);

  const invalidResult = createRuntimeHealthRecords([
    {
      instanceId: "player.1",
      health: 120,
      maxHealth: 100,
      invulnerableUntilMs: 0,
      alive: true,
    },
  ], fixture.currentTimeMs);

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [RUNTIME_HEALTH_ERRORS.HEALTH_EXCEEDS_MAX]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
