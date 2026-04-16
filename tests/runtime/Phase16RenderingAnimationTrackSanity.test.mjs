/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase16RenderingAnimationTrackSanity.test.mjs
*/
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import RaycastDemoScene from '../../samples/phase-16/1622/RaycastDemoScene.js';
import VoxelWorldDemoScene from '../../samples/phase-16/1623/VoxelWorldDemoScene.js';
import TextureMaterialDemoScene from '../../samples/phase-16/1624/TextureMaterialDemoScene.js';
import ImageSkinnedCharacterDemoScene from '../../samples/phase-16/1625/ImageSkinnedCharacterDemoScene.js';

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
  const polygons = [];
  const imageFrames = [];
  const texts = [];
  const rects = [];
  return {
    lines,
    polygons,
    imageFrames,
    texts,
    rects,
    getCanvasSize() {
      return { width, height };
    },
    clear() {},
    drawRect(x, y, w, h, color) {
      rects.push({ x, y, w, h, color });
    },
    strokeRect() {},
    drawText(text) {
      texts.push(String(text));
    },
    drawLine(x1, y1, x2, y2, color) {
      lines.push({ x1, y1, x2, y2, color });
    },
    drawPolygon(points, options = {}) {
      polygons.push({ points, options });
    },
    drawImageFrame(image, sx, sy, sw, sh, dx, dy, dw, dh) {
      imageFrames.push({ image, sx, sy, sw, sh, dx, dy, dw, dh });
    },
  };
}

function assertIndexLinksPresent() {
  const indexPath = path.join(repoRoot, 'samples', 'index.html');
  const indexText = fs.readFileSync(indexPath, 'utf8');
  assert.equal(indexText.includes('./phase-16/1622/index.html'), true, 'Sample 1622 link should exist in samples/index.html.');
  assert.equal(indexText.includes('./phase-16/1623/index.html'), true, 'Sample 1623 link should exist in samples/index.html.');
  assert.equal(indexText.includes('./phase-16/1624/index.html'), true, 'Sample 1624 link should exist in samples/index.html.');
  assert.equal(indexText.includes('./phase-16/1625/index.html'), true, 'Sample 1625 link should exist in samples/index.html.');
}

function assertRaycastDemo() {
  const scene = new RaycastDemoScene();
  const startAngle = scene.player.angle;
  const startX = scene.player.x;
  scene.step3DPhysics(0.25, { input: makeInput(['KeyD', 'KeyW']) });
  assert.equal(scene.player.angle > startAngle, true, 'Raycast demo should rotate with input.');
  assert.equal(scene.player.x > startX, true, 'Raycast demo should move with input.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(scene.lastFilledColumns > 100, true, 'Raycast demo should fill many wall columns.');
  assert.equal(renderer.rects.length > 120, true, 'Raycast demo should render filled strips/regions.');
}

function assertVoxelDemo() {
  const scene = new VoxelWorldDemoScene();
  const startCamX = scene.camera.x;
  scene.step3DPhysics(0.25, { input: makeInput(['KeyD']) });
  assert.equal(scene.camera.x > startCamX, true, 'Voxel demo should pan camera with input.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(scene.lastFilledFaces > 0, true, 'Voxel demo should render filled voxel faces.');
  assert.equal(renderer.polygons.length > 0, true, 'Voxel demo should issue polygon draws.');
}

function assertTextureMaterialDemo() {
  const scene = new TextureMaterialDemoScene();
  scene.setCamera3D(createCameraStub());
  const startYaw = scene.cameraYaw;
  scene.step3DPhysics(0.25, { input: makeInput(['KeyE']) });
  assert.equal(scene.cameraYaw > startYaw, true, 'Texture/material demo should move camera.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(scene.lastImageDraws > 0, true, 'Texture/material demo should render image-backed surfaces.');
  assert.equal(renderer.imageFrames.length > 0, true, 'Texture/material demo should issue image frame draws.');
}

function assertSkinnedCharacterDemo() {
  const scene = new ImageSkinnedCharacterDemoScene();
  scene.setCamera3D(createCameraStub());
  const startFrame = scene.currentFrameIndex;
  const startX = scene.character.x;
  scene.step3DPhysics(0.2, { input: makeInput([]) });
  assert.equal(scene.character.x !== startX, true, 'Skinned character demo should animate character path movement.');
  assert.equal(scene.currentFrameIndex !== startFrame, true, 'Skinned character demo should advance animation frame.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(scene.lastImageDraws > 0, true, 'Skinned character demo should render image-backed character frame.');
  assert.equal(renderer.imageFrames.length > 0, true, 'Skinned character demo should issue image frame draw calls.');
}

export function run() {
  assertIndexLinksPresent();
  assertRaycastDemo();
  assertVoxelDemo();
  assertTextureMaterialDemo();
  assertSkinnedCharacterDemo();
}
