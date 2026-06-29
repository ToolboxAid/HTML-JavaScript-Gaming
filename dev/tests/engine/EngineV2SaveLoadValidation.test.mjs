/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2SaveLoadValidation.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_SAVE_LOAD_ERRORS,
  validateEngineV2SaveLoadFlow,
} from "../../../www/src/engine/runtime/engineV2SaveLoadValidation.js";
import { createEngineV2FeatureCompleteFixture } from "./EngineV2FeatureCompleteFixture.mjs";

export function run() {
  const fixture = createEngineV2FeatureCompleteFixture().saveLoad;
  const result = validateEngineV2SaveLoadFlow(fixture);

  assert.equal(result.valid, true);
  assert.deepEqual(result.flowEvents.map((event) => event.flowStep), ["save", "shutdown", "load", "continue"]);
  assert.deepEqual(result.restoredRuntimeState.inventory, fixture.runtimeState.inventory);
  assert.deepEqual(result.restoredRuntimeState.equipment, fixture.runtimeState.equipment);
  assert.deepEqual(result.restoredRuntimeState.state.sceneState, fixture.runtimeState.state.sceneState);
  assert.deepEqual(result.restoredRuntimeState.state.objectives, fixture.runtimeState.state.objectives);
  assert.deepEqual(result.restoredRuntimeState.state.health, fixture.runtimeState.state.health);
  assert.deepEqual(result.restoredRuntimeState.state.position, fixture.runtimeState.state.position);
  assert.deepEqual(result.restoredRuntimeState.state.runtime, fixture.runtimeState.state.runtime);

  const dirtyShutdownResult = validateEngineV2SaveLoadFlow({
    ...fixture,
    shutdownState: { inventory: fixture.runtimeState.inventory },
  });

  assert.equal(dirtyShutdownResult.valid, false);
  assert.deepEqual(dirtyShutdownResult.errors.map((error) => error.code), [ENGINE_V2_SAVE_LOAD_ERRORS.RUNTIME_STATE_NOT_CLEARED]);

  const missingRuntimeStateResult = validateEngineV2SaveLoadFlow({
    ...fixture,
    runtimeState: {
      ...fixture.runtimeState,
      state: Object.fromEntries(Object.entries(fixture.runtimeState.state).filter(([key]) => key !== "runtime")),
    },
  });

  assert.equal(missingRuntimeStateResult.valid, false);
  assert.deepEqual(missingRuntimeStateResult.errors.map((error) => error.code), [ENGINE_V2_SAVE_LOAD_ERRORS.RESTORE_SURFACE_MISSING]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
