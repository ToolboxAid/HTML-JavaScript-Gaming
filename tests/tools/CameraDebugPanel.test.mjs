/*
Toolbox Aid
David Quesenberry
04/16/2026
CameraDebugPanel.test.mjs
*/
import assert from "node:assert/strict";
import { create3dCameraPanel } from "../../src/engine/debug/standard/threeD/panels/panel3dCamera.js";
import { createCameraSummaryProvider } from "../../src/engine/debug/standard/threeD/providers/cameraSummaryProvider.js";

export async function run() {
  const provider = createCameraSummaryProvider({
    cameraSummary: () => ({
      activeCameraId: "cam.main",
      mode: "follow",
      position: { x: 12.345, y: -4, z: 7.5 },
      rotation: { x: 0.125, y: -1.25, z: 0 },
      fov: 75,
      zoom: 1.25,
      near: 0.2,
      far: 900
    })
  });

  const snapshot = provider.getSnapshot({});
  assert.equal(snapshot.activeCameraId, "cam.main");
  assert.equal(snapshot.mode, "follow");
  assert.deepEqual(snapshot.position, { x: 12.345, y: -4, z: 7.5 });
  assert.deepEqual(snapshot.rotation, { x: 0.125, y: -1.25, z: 0 });
  assert.equal(snapshot.fov, 75);
  assert.equal(snapshot.zoom, 1.25);
  assert.equal(snapshot.near, 0.2);
  assert.equal(snapshot.far, 900);

  const panel = create3dCameraPanel(provider, { enabled: true });
  const render = panel.render({}, {});
  assert.equal(render.id, "3d.camera");
  assert.equal(render.title, "3D Camera");
  assert.deepEqual(render.lines, [
    "activeCameraId=cam.main",
    "mode=follow",
    "position=12.35,-4.00,7.50",
    "rotation=0.13,-1.25,0.00",
    "fov=75",
    "zoom=1.25",
    "clip=0.2..900"
  ]);
}
