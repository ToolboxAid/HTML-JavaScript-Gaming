/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2CameraRuntime.test.mjs
*/

import assert from "node:assert/strict";
import {
  ENGINE_V2_CAMERA_ERRORS,
  resolveEngineV2Camera,
} from "../../../www/src/engine/runtime/engineV2CameraRuntime.js";
import { createEngineV2MediaRuntimeFixture } from "./EngineV2MediaRuntimeFixture.mjs";

export function run() {
  const fixture = createEngineV2MediaRuntimeFixture();
  const followResult = resolveEngineV2Camera({
    cameraConfig: fixture.cameraConfig,
    cameraState: fixture.cameraState,
    runtimeObjects: fixture.runtimeObjects,
    viewport: fixture.viewport,
  });

  assert.equal(followResult.valid, true);
  assert.equal(followResult.camera.cameraType, "follow");
  assert.equal(followResult.camera.x, 55);
  assert.equal(followResult.camera.y, 15);
  assert.equal(followResult.camera.zoom, 2);

  const fixedResult = resolveEngineV2Camera({
    cameraConfig: fixture.fixedCameraConfig,
    cameraState: fixture.cameraState,
    runtimeObjects: fixture.runtimeObjects,
    viewport: fixture.viewport,
  });

  assert.equal(fixedResult.valid, true);
  assert.equal(fixedResult.camera.cameraType, "fixed");
  assert.equal(fixedResult.camera.x, 140);
  assert.equal(fixedResult.camera.y, 60);

  const invalidResult = resolveEngineV2Camera({
    cameraConfig: fixture.cameraConfig,
    cameraState: fixture.cameraState,
    runtimeObjects: [],
    viewport: fixture.viewport,
  });

  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [ENGINE_V2_CAMERA_ERRORS.TARGET_MISSING]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
