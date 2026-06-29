/*
Toolbox Aid
David Quesenberry
06/03/2026
RuntimeLivesAndRespawn.test.mjs
*/

import assert from "node:assert/strict";
import {
  RUNTIME_LIVES_RESPAWN_ERRORS,
  processRuntimeLivesAndRespawn,
} from "../../../www/src/engine/runtime/runtimeLivesAndRespawn.js";
import { createRuntimeHealthOutcomeFixture } from "./RuntimeHealthOutcomeFixture.mjs";

export function run() {
  const fixture = createRuntimeHealthOutcomeFixture();
  const result = processRuntimeLivesAndRespawn({
    lifeRecords: fixture.lifeRecords,
    respawnRules: fixture.respawnRules,
    lifeEvents: fixture.lifeEvents,
  });

  assert.equal(result.valid, true);
  assert.equal(result.lifeRecords.find((record) => record.instanceId === "player.1").lives, 2);
  assert.deepEqual(result.lifeRecords.find((record) => record.instanceId === "player.1").position, { x: 1, y: 1 });
  assert.equal(result.lifeRecords.find((record) => record.instanceId === "enemy.1").alive, false);
  assert.equal(result.respawnEvents[0].respawnRuleId, "respawn.player.start");
  assert.equal(result.terminalEvents[0].targetInstanceId, "enemy.1");

  const invalidLocationResult = processRuntimeLivesAndRespawn({
    lifeRecords: fixture.lifeRecords,
    respawnRules: [
      {
        respawnRuleId: "respawn.player.start",
        sceneId: "scene.start",
      },
    ],
    lifeEvents: [
      {
        eventType: "death",
        targetInstanceId: "player.1",
      },
    ],
  });

  assert.equal(invalidLocationResult.valid, false);
  assert.deepEqual(invalidLocationResult.errors.map((error) => error.code), [RUNTIME_LIVES_RESPAWN_ERRORS.RESPAWN_LOCATION_INVALID]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
