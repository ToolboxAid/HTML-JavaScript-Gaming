/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase17RenderingTechniqueExpansionSanity.test.mjs
*/
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import RaycastDemoScene from '../../samples/phase-16/1622/RaycastDemoScene.js';
import DoomRaycastSpritesScene from '../../samples/phase-17/1623/RaycastDemoScene.js';
import WolfGridRaycastScene from '../../samples/phase-17/1624/RaycastDemoScene.js';
import WolfOptimizedRaycastScene from '../../samples/phase-17/1625/RaycastDemoScene.js';
import TextureMaterialDemoScene from '../../samples/phase-17/1626/TextureMaterialDemoScene.js';
import ImageSkinnedCharacterDemoScene from '../../samples/phase-17/1627/ImageSkinnedCharacterDemoScene.js';
import VoxelWorldDemoScene from '../../samples/phase-17/1628/VoxelWorldDemoScene.js';
import ChunkStreamingVoxelScene from '../../samples/phase-17/1629/VoxelWorldDemoScene.js';

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
  const rects = [];
  const lines = [];
  const polygons = [];
  const imageFrames = [];
  const texts = [];
  return {
    rects,
    lines,
    polygons,
    imageFrames,
    texts,
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
  assert.equal(indexText.includes('./phase-17/1623/index.html'), true, 'Sample 1623 link should exist in samples/index.html.');
  assert.equal(indexText.includes('./phase-17/1624/index.html'), true, 'Sample 1624 link should exist in samples/index.html.');
  assert.equal(indexText.includes('./phase-17/1625/index.html'), true, 'Sample 1625 link should exist in samples/index.html.');
  assert.equal(indexText.includes('./phase-17/1626/index.html'), true, 'Sample 1626 link should exist in samples/index.html.');
  assert.equal(indexText.includes('./phase-17/1627/index.html'), true, 'Sample 1627 link should exist in samples/index.html.');
  assert.equal(indexText.includes('./phase-17/1628/index.html'), true, 'Sample 1628 link should exist in samples/index.html.');
  assert.equal(indexText.includes('./phase-17/1629/index.html'), true, 'Sample 1629 link should exist in samples/index.html.');
}

function assertDoomBasicRaycast() {
  const scene = new RaycastDemoScene();
  const startX = scene.player.x;
  scene.step3DPhysics(0.25, { input: makeInput(['KeyW']) });
  assert.equal(scene.player.x > startX, true, 'Basic DOOM raycast should move player.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(scene.lastFilledColumns > 100, true, 'Basic DOOM raycast should render many filled wall columns.');
  assert.equal(renderer.rects.length > 120, true, 'Basic DOOM raycast should issue many filled rectangle draws.');
}

function assertDoomRaycastSprites() {
  const scene = new DoomRaycastSpritesScene();
  scene.step3DPhysics(0.1, { input: makeInput([]) });

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(scene.lastFilledColumns > 100, true, 'DOOM sprite raycast should render filled wall columns.');
  assert.equal(scene.lastSpriteDraws > 0, true, 'DOOM sprite raycast should render visible sprites.');
  assert.equal(renderer.imageFrames.length > 0, true, 'DOOM sprite raycast should issue image frame sprite draws.');
}

function assertWolfGridRaycast() {
  const scene = new WolfGridRaycastScene();
  scene.step3DPhysics(0.15, { input: makeInput(['KeyD']) });

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(scene.lastFilledColumns > 100, true, 'Wolf grid raycast should render filled columns.');
}

function assertWolfOptimizedRaycast() {
  const scene = new WolfOptimizedRaycastScene();
  scene.step3DPhysics(0.15, { input: makeInput(['KeyD']) });

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(scene.lastFilledColumns > 100, true, 'Wolf optimized raycast should render filled columns.');
  assert.equal(scene.lastDdaSteps > scene.lastFilledColumns, true, 'Wolf optimized raycast should report DDA traversal steps.');
}

function assertUnrealTextureLighting() {
  const scene = new TextureMaterialDemoScene();
  scene.setCamera3D(createCameraStub());
  const startYaw = scene.cameraYaw;
  scene.step3DPhysics(0.2, { input: makeInput(['KeyE']) });
  assert.equal(scene.cameraYaw > startYaw, true, 'Unreal texture+lighting demo should move camera yaw.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(scene.lastImageDraws > 0, true, 'Unreal texture+lighting demo should draw image-backed textures.');
  assert.equal(renderer.imageFrames.length > 0, true, 'Unreal texture+lighting demo should issue image frame draws.');
}

function assertUnrealSkinnedMesh() {
  const scene = new ImageSkinnedCharacterDemoScene();
  scene.setCamera3D(createCameraStub());
  const startFrame = scene.currentFrameIndex;
  scene.step3DPhysics(0.25, { input: makeInput([]) });

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(scene.currentFrameIndex !== startFrame, true, 'Unreal skinned mesh demo should animate frame changes.');
  assert.equal(scene.lastImageDraws > 0, true, 'Unreal skinned mesh demo should draw image-backed character frames.');
  assert.equal(renderer.imageFrames.length > 0, true, 'Unreal skinned mesh demo should issue image frame draws.');
}

function assertMinecraftVoxelTerrain() {
  const scene = new VoxelWorldDemoScene();
  scene.step3DPhysics(0.2, { input: makeInput(['KeyD']) });

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(scene.lastFilledFaces > 0, true, 'Minecraft voxel terrain demo should render filled voxel faces.');
  assert.equal(renderer.polygons.length > 0, true, 'Minecraft voxel terrain demo should issue polygon draws.');
}

function assertMinecraftChunkStreaming() {
  const scene = new ChunkStreamingVoxelScene();
  scene.step3DPhysics(0.2, { input: makeInput(['KeyD']) });

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(scene.lastActiveChunks > 0, true, 'Minecraft chunk streaming demo should activate chunks.');
  assert.equal(scene.lastFilledFaces > 0, true, 'Minecraft chunk streaming demo should render filled voxel faces.');
  assert.equal(renderer.polygons.length > 0, true, 'Minecraft chunk streaming demo should issue polygon draws.');
}

export function run() {
  assertIndexLinksPresent();
  assertDoomBasicRaycast();
  assertDoomRaycastSprites();
  assertWolfGridRaycast();
  assertWolfOptimizedRaycast();
  assertUnrealTextureLighting();
  assertUnrealSkinnedMesh();
  assertMinecraftVoxelTerrain();
  assertMinecraftChunkStreaming();
}
