/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase16AdvancedBatch1Sanity.test.mjs
*/
import assert from 'node:assert/strict';
import LightingDemo3DScene from '../../samples/phase-16/1609/LightingDemo3DScene.js';
import Hybrid2D3DWorldScene from '../../samples/phase-16/1610/Hybrid2D3DWorldScene.js';
import MultiplayerSyncDemo3DScene from '../../samples/phase-16/1611/MultiplayerSyncDemo3DScene.js';

function createCameraStub() {
  const state = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  };

  return {
    setPosition(position) {
      state.position = { ...position };
    },
    setRotation(rotation) {
      state.rotation = { ...rotation };
    },
    getState() {
      return {
        position: { ...state.position },
        rotation: { ...state.rotation },
      };
    },
  };
}

function makeInput(keys = []) {
  const down = new Set(keys);
  return {
    isDown(code) {
      return down.has(code);
    },
  };
}

function createRendererProbe(width = 960, height = 540) {
  const lines = [];
  return {
    lines,
    getCanvasSize() {
      return { width, height };
    },
    clear() {},
    strokeRect() {},
    drawText() {},
    drawRect() {},
    drawLine(x1, y1, x2, y2, color) {
      lines.push({ x1, y1, x2, y2, color });
    },
  };
}

function countVisibleLinesInViewport(lines, viewport) {
  let visibleCount = 0;
  const xMin = viewport.x;
  const xMax = viewport.x + viewport.width;
  const yMin = viewport.y;
  const yMax = viewport.y + viewport.height;

  for (const line of lines) {
    const startVisible = line.x1 >= xMin && line.x1 <= xMax && line.y1 >= yMin && line.y1 <= yMax;
    const endVisible = line.x2 >= xMin && line.x2 <= xMax && line.y2 >= yMin && line.y2 <= yMax;
    const lineBoundsOverlapViewport =
      Math.max(line.x1, line.x2) >= xMin &&
      Math.min(line.x1, line.x2) <= xMax &&
      Math.max(line.y1, line.y2) >= yMin &&
      Math.min(line.y1, line.y2) <= yMax;

    if (startVisible || endVisible || lineBoundsOverlapViewport) {
      visibleCount += 1;
    }
  }

  return visibleCount;
}

function assertLightingDemo() {
  const scene = new LightingDemo3DScene();
  scene.setCamera3D(createCameraStub());
  const startAngle = scene.lightAngle;
  const startHeight = scene.lightHeight;
  scene.step3DPhysics(1 / 60, { input: makeInput(['ArrowRight']) });
  assert.equal(scene.lightAngle > startAngle, true, 'Lighting demo should respond to light-angle input.');
  scene.step3DPhysics(1 / 60, { input: makeInput(['ArrowUp']) });
  assert.equal(scene.lightHeight > startHeight, true, 'Lighting demo should respond to light-height input.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  const visibleLines = countVisibleLinesInViewport(renderer.lines, scene.viewport);
  assert.equal(visibleLines > 0, true, 'Lighting demo should render visible 3D wireframe output.');
}

function assertHybridDemo() {
  const scene = new Hybrid2D3DWorldScene();
  scene.setCamera3D(createCameraStub());
  const startX = scene.player.x;
  scene.step3DPhysics(1 / 60, { input: makeInput(['KeyD']) });
  assert.equal(scene.player.x > startX, true, 'Hybrid demo should move player in shared world state.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  const visibleLines = countVisibleLinesInViewport(renderer.lines, scene.viewport3d);
  assert.equal(visibleLines > 0, true, 'Hybrid demo should render visible 3D wireframe output.');
}

function assertMultiplayerDemo() {
  const scene = new MultiplayerSyncDemo3DScene();
  scene.setCamera3D(createCameraStub());
  const startPredictedX = scene.predictedState.x;
  scene.step3DPhysics(1 / 60, { input: makeInput(['KeyD']) });
  assert.equal(scene.predictedState.x > startPredictedX, true, 'Multiplayer demo should apply immediate client prediction.');

  for (let i = 0; i < 45; i += 1) {
    scene.step3DPhysics(1 / 60, { input: makeInput(['KeyD']) });
  }
  assert.equal(scene.receivedSnapshotCount > 0, true, 'Multiplayer demo should apply delayed authoritative snapshots.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  const visibleLines = countVisibleLinesInViewport(renderer.lines, scene.viewport);
  assert.equal(visibleLines > 0, true, 'Multiplayer demo should render visible 3D wireframe output.');
}

export function run() {
  assertLightingDemo();
  assertHybridDemo();
  assertMultiplayerDemo();
}
