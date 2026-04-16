/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase16AdvancedBatch2Sanity.test.mjs
*/
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import StressTest3DScene from '../../samples/phase-16/1612/StressTest3DScene.js';
import InputLab3DScene from '../../samples/phase-16/1613/InputLab3DScene.js';
import CameraModesLab3DScene from '../../samples/phase-16/1614/CameraModesLab3DScene.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

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

function assertSampleIndexLinksPresent() {
  const indexPath = path.join(repoRoot, 'samples', 'index.html');
  const indexText = fs.readFileSync(indexPath, 'utf8');
  assert.equal(indexText.includes('./phase-16/1612/index.html'), true, 'Sample 1612 link should exist in samples/index.html.');
  assert.equal(indexText.includes('./phase-16/1613/index.html'), true, 'Sample 1613 link should exist in samples/index.html.');
  assert.equal(indexText.includes('./phase-16/1614/index.html'), true, 'Sample 1614 link should exist in samples/index.html.');
}

function assertStressTest() {
  const scene = new StressTest3DScene();
  scene.setCamera3D(createCameraStub());
  assert.equal(scene.boxes.length, 1000, 'Stress test should configure exactly 1,000 objects.');

  const startAmplitude = scene.waveAmplitude;
  scene.step3DPhysics(1 / 60, { input: makeInput(['ArrowUp']) });
  assert.equal(scene.waveAmplitude > startAmplitude, true, 'Stress test should respond to amplitude input.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  const visibleLines = countVisibleLinesInViewport(renderer.lines, scene.viewport);
  assert.equal(visibleLines > 0, true, 'Stress test should render visible 3D output.');
}

function assertInputLab() {
  const scene = new InputLab3DScene();
  scene.setCamera3D(createCameraStub());
  const startX = scene.player.x;
  scene.step3DPhysics(1 / 60, { input: makeInput(['KeyD', 'ShiftLeft']) });
  assert.equal(scene.player.x > startX, true, 'Input lab should move player from keyboard vector input.');

  scene.step3DPhysics(1 / 60, { input: makeInput(['Space']) });
  assert.equal(scene.player.y > 0, true, 'Input lab should apply jump impulse.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  const visibleLines = countVisibleLinesInViewport(renderer.lines, scene.viewport);
  assert.equal(visibleLines > 0, true, 'Input lab should render visible 3D output.');
}

function assertCameraModesLab() {
  const scene = new CameraModesLab3DScene();
  scene.setCamera3D(createCameraStub());
  const startMode = scene.viewState.cameraMode;
  scene.step3DPhysics(1 / 60, { input: makeInput(['KeyC']) });
  scene.step3DPhysics(1 / 60, { input: makeInput([]) });
  assert.equal(scene.viewState.cameraMode !== startMode, true, 'Camera modes lab should cycle camera mode with C.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  const visibleLines = countVisibleLinesInViewport(renderer.lines, scene.viewport);
  assert.equal(visibleLines > 0, true, 'Camera modes lab should render visible 3D output.');
}

export function run() {
  assertSampleIndexLinksPresent();
  assertStressTest();
  assertInputLab();
  assertCameraModesLab();
}
