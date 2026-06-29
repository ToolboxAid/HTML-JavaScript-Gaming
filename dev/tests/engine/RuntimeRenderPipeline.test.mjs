/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeRenderPipeline.test.mjs
*/
import assert from "node:assert/strict";
import {
  RUNTIME_RENDER_PIPELINE_ERRORS,
  renderRuntimeFrame,
} from "../../../www/src/engine/runtime/runtimeRenderPipeline.js";

export function run() {
  const renderState = Object.freeze({
    targetId: "runtime-canvas",
    width: 320,
    height: 180,
    frame: 0,
    commands: Object.freeze([]),
  });
  const runtimeObjects = [
    Object.freeze({
      instanceId: "player.1",
      geometryRef: "geometry.player",
      position: Object.freeze({ x: 1, y: 1 }),
      size: Object.freeze({ width: 1, height: 1 }),
    }),
  ];
  const result = renderRuntimeFrame(renderState, runtimeObjects);

  assert.equal(result.valid, true);
  assert.equal(result.renderState.frame, 1);
  assert.equal(result.renderState.commands.length, 1);
  assert.deepEqual(result.renderState.commands[0], {
    command: "drawRuntimeObject",
    instanceId: "player.1",
    geometryRef: "geometry.player",
    x: 1,
    y: 1,
    width: 1,
    height: 1,
  });

  const invalidResult = renderRuntimeFrame(null, runtimeObjects);
  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [RUNTIME_RENDER_PIPELINE_ERRORS.RENDER_STATE_INVALID]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
