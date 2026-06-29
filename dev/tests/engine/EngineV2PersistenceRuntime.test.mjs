/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2PersistenceRuntime.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_PERSISTENCE_ERRORS,
  processEngineV2Persistence,
} from "../../../www/src/engine/runtime/engineV2PersistenceRuntime.js";
import { createEngineV2SaveState } from "../../../www/src/engine/runtime/engineV2SaveStateModel.js";
import { createEngineV2PersistenceRuntimeFixture } from "./EngineV2PersistenceRuntimeFixture.mjs";

export function run() {
  const fixture = createEngineV2PersistenceRuntimeFixture();
  const existingSave = createEngineV2SaveState({
    saveDefinition: fixture.saveDefinition,
    runtimeState: fixture.runtimeState,
  }).saveState;
  const result = processEngineV2Persistence({
    persistenceDefinition: fixture.persistenceDefinition,
    persistenceActions: [
      { actionId: "persist.save", actionType: "save", saveStateId: "save.runtime.1", ownerInstanceId: "hero.1", version: "1.0.1", runtimeState: fixture.runtimeState },
      { actionId: "persist.load", actionType: "load", saveStateId: "save.hero.1" },
    ],
    saveStates: [existingSave],
  });

  assert.equal(result.valid, true);
  assert.equal(result.saveSnapshots.length, 1);
  assert.equal(result.loadResults[0].saveStateId, "save.hero.1");
  assert.deepEqual(result.persistenceEvents.map((event) => event.actionType), ["save", "load"]);

  const invalidResult = processEngineV2Persistence({
    persistenceDefinition: fixture.persistenceDefinition,
    persistenceActions: [{ actionId: "persist.load.bad", actionType: "load", saveStateId: "missing.save" }],
    saveStates: [],
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [ENGINE_V2_PERSISTENCE_ERRORS.SAVE_STATE_MISSING]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
