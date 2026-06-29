/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeInputPipeline.test.mjs
*/
import assert from "node:assert/strict";
import {
  RUNTIME_INPUT_PIPELINE_ERRORS,
  createRuntimeInputPipeline,
  resolveRuntimeInputActions,
} from "../../../www/src/engine/runtime/runtimeInputPipeline.js";
import { createManifestDrivenRuntimeFixture } from "./RuntimeManifestDrivenFixture.mjs";

export function run() {
  const manifest = createManifestDrivenRuntimeFixture();
  const pipelineResult = createRuntimeInputPipeline(manifest.inputBindings);

  assert.equal(pipelineResult.valid, true);
  const actionResult = resolveRuntimeInputActions(pipelineResult.inputPipeline, [{ key: "ArrowRight", pressed: true }]);
  assert.equal(actionResult.valid, true);
  assert.deepEqual(actionResult.actions, [{
    actionId: "move.right",
    targetInstanceId: "player.1",
    velocity: { x: 10, y: 0 },
  }]);

  const invalidResult = createRuntimeInputPipeline([{ actionId: "bad" }]);
  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [RUNTIME_INPUT_PIPELINE_ERRORS.KEYS_INVALID]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
