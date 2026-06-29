/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeRenderingBootstrap.test.mjs
*/
import assert from "node:assert/strict";
import {
  RUNTIME_RENDERING_BOOTSTRAP_ERRORS,
  createRuntimeRenderingBootstrap,
} from "../../../www/src/engine/runtime/runtimeRenderingBootstrap.js";
import { createManifestDrivenRuntimeFixture } from "./RuntimeManifestDrivenFixture.mjs";

export function run() {
  const manifest = createManifestDrivenRuntimeFixture();
  const result = createRuntimeRenderingBootstrap(manifest.rendering);

  assert.equal(result.valid, true);
  assert.deepEqual(result.renderState, {
    targetId: "runtime-canvas",
    width: 320,
    height: 180,
    frame: 0,
    commands: [],
  });

  const invalidResult = createRuntimeRenderingBootstrap({ width: 320, height: 180 });
  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [RUNTIME_RENDERING_BOOTSTRAP_ERRORS.TARGET_ID_REQUIRED]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
