/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2SaveStateModel.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_SAVE_STATE_ERRORS,
  createEngineV2SaveState,
} from "../../../www/src/engine/runtime/engineV2SaveStateModel.js";
import { createEngineV2PersistenceRuntimeFixture } from "./EngineV2PersistenceRuntimeFixture.mjs";

export function run() {
  const fixture = createEngineV2PersistenceRuntimeFixture();
  const result = createEngineV2SaveState({
    saveDefinition: fixture.saveDefinition,
    runtimeState: fixture.runtimeState,
  });

  assert.equal(result.valid, true);
  assert.deepEqual(Object.keys(result.saveState.payload), ["inventory", "equipment", "currency", "state", "checkpoints", "profile"]);
  assert.equal(Object.hasOwn(result.saveState.payload, "runtimeOnly"), false);

  const invalidResult = createEngineV2SaveState({
    saveDefinition: { ...fixture.saveDefinition, persistedSurfaces: ["inventory", "missingSurface"] },
    runtimeState: fixture.runtimeState,
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [ENGINE_V2_SAVE_STATE_ERRORS.SURFACE_INVALID]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
