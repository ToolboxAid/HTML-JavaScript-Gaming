/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2ProfileStateSystem.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_PROFILE_ERRORS,
  processEngineV2ProfileState,
} from "../../../www/src/engine/runtime/engineV2ProfileStateSystem.js";
import { createEngineV2PersistenceRuntimeFixture } from "./EngineV2PersistenceRuntimeFixture.mjs";

export function run() {
  const fixture = createEngineV2PersistenceRuntimeFixture();
  const result = processEngineV2ProfileState({
    profileDefinitions: fixture.profileDefinitions,
    profileState: fixture.profileState,
    profileActions: fixture.profileActions,
  });

  assert.equal(result.valid, true);
  assert.equal(result.profileState.values.discoveries, 3);
  assert.equal(result.profileState.values.tutorialComplete, true);
  assert.equal(result.profileState.values.title, "Pathfinder");

  const invalidResult = processEngineV2ProfileState({
    profileDefinitions: fixture.profileDefinitions,
    profileState: fixture.profileState,
    profileActions: [{ actionId: "profile.bad", actionType: "unlock", profileKey: "missing.key" }],
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [ENGINE_V2_PROFILE_ERRORS.KEY_MISSING]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
