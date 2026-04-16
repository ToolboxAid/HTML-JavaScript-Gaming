/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase16AdvancedBatch4Sanity.test.mjs
*/
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import LightingMaterialsLab3DScene from '../../samples/phase-16/1618/LightingMaterialsLab3DScene.js';
import DebugHud3DScene from '../../samples/phase-16/1619/DebugHud3DScene.js';
import MiniGame3DReferenceScene from '../../samples/phase-16/1620/MiniGame3DReferenceScene.js';

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
  const texts = [];
  return {
    lines,
    texts,
    getCanvasSize() {
      return { width, height };
    },
    clear() {},
    strokeRect() {},
    drawText(text) {
      texts.push(String(text));
    },
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
  assert.equal(indexText.includes('./phase-16/1618/index.html'), true, 'Sample 1618 link should exist in samples/index.html.');
  assert.equal(indexText.includes('./phase-16/1619/index.html'), true, 'Sample 1619 link should exist in samples/index.html.');
  assert.equal(indexText.includes('./phase-16/1620/index.html'), true, 'Sample 1620 link should exist in samples/index.html.');
}

function assertLightingMaterialsLab() {
  const scene = new LightingMaterialsLab3DScene();
  scene.setCamera3D(createCameraStub());
  const startYaw = scene.cameraYaw;
  const startHeight = scene.lightHeight;
  scene.step3DPhysics(0.25, { input: makeInput(['KeyE', 'ArrowUp']) });
  assert.equal(scene.cameraYaw > startYaw, true, 'Lighting/materials lab should move camera yaw from input/auto orbit.');
  assert.equal(scene.lightHeight > startHeight, true, 'Lighting/materials lab should respond to light-height input.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  const visibleLines = countVisibleLinesInViewport(renderer.lines, scene.viewport);
  assert.equal(visibleLines > 0, true, 'Lighting/materials lab should render visible 3D output.');
  assert.equal(renderer.texts.includes('3D World - Lighting Stage'), true, 'Lighting/materials lab should show 3D world label.');
  assert.equal(renderer.texts.includes('UI Layer - Lighting HUD'), true, 'Lighting/materials lab should show UI layer label.');
}

function assertDebugHudSample() {
  const scene = new DebugHud3DScene();
  scene.setCamera3D(createCameraStub());
  const startYaw = scene.cameraYaw;
  scene.step3DPhysics(0.25, { input: makeInput(['KeyE', 'KeyD']) });
  assert.equal(scene.cameraYaw > startYaw, true, 'Debug HUD sample should move camera yaw for visible perspective change.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  const visibleLines = countVisibleLinesInViewport(renderer.lines, scene.viewport);
  assert.equal(visibleLines > 0, true, 'Debug HUD sample should render visible 3D output.');
  assert.equal(renderer.texts.includes('3D World Layer'), true, 'Debug HUD sample should show world-layer label.');
  assert.equal(renderer.texts.includes('HUD Layer - Debug Cards'), true, 'Debug HUD sample should show HUD-layer label.');
}

function assertMiniGameReference() {
  const scene = new MiniGame3DReferenceScene();
  scene.setCamera3D(createCameraStub());
  const startOffset = scene.cameraYawOffset;
  scene.step3DPhysics(0.25, { input: makeInput(['ArrowRight']) });
  assert.equal(scene.cameraYawOffset > startOffset, true, 'Mini game reference should move camera offset from input.');

  scene.player.x = scene.pickups[0].x - scene.player.width * 0.5;
  scene.player.z = scene.pickups[0].z - scene.player.depth * 0.5;
  const startScore = scene.score;
  scene.step3DPhysics(0.05, { input: makeInput([]) });
  assert.equal(scene.score > startScore, true, 'Mini game reference should collect pickup and increment score.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  const visibleLines = countVisibleLinesInViewport(renderer.lines, scene.viewport);
  assert.equal(visibleLines > 0, true, 'Mini game reference should render visible 3D output.');
  assert.equal(renderer.texts.includes('3D World - Mini Game Lane'), true, 'Mini game reference should show world-layer label.');
  assert.equal(renderer.texts.includes('UI Layer - Mini Game HUD'), true, 'Mini game reference should show HUD-layer label.');
}

export function run() {
  assertSampleIndexLinksPresent();
  assertLightingMaterialsLab();
  assertDebugHudSample();
  assertMiniGameReference();
}
