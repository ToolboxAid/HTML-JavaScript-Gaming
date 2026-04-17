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
import DoomRaycastSpritesScene from '../../samples/phase-17/1701/RaycastDemoScene.js';
import WolfGridRaycastScene from '../../samples/phase-17/1702/RaycastDemoScene.js';
import WolfOptimizedRaycastScene from '../../samples/phase-17/1703/RaycastDemoScene.js';
import TextureMaterialDemoScene from '../../samples/phase-17/1704/TextureMaterialDemoScene.js';
import ImageSkinnedCharacterDemoScene from '../../samples/phase-17/1705/ImageSkinnedCharacterDemoScene.js';
import VoxelWorldDemoScene from '../../samples/phase-17/1706/VoxelWorldDemoScene.js';
import ChunkStreamingVoxelScene from '../../samples/phase-17/1707/VoxelWorldDemoScene.js';

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

function assertTextIncludes(renderer, needle, message) {
  assert.equal(renderer.texts.some((text) => text.includes(needle)), true, message);
}

function signedArea(points) {
  let area = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    area += (current.x * next.y) - (next.x * current.y);
  }
  return area * 0.5;
}

function countSharedProjectedPoints(a, b) {
  const keys = new Set(a.map((point) => `${point.x.toFixed(4)}:${point.y.toFixed(4)}`));
  let shared = 0;
  for (let index = 0; index < b.length; index += 1) {
    const key = `${b[index].x.toFixed(4)}:${b[index].y.toFixed(4)}`;
    if (keys.has(key)) {
      shared += 1;
    }
  }
  return shared;
}

function assertVoxelFaceWindingConsistency(renderer, sampleLabel) {
  const firstFaceTriplet = renderer.polygons.slice(0, 3);
  assert.equal(firstFaceTriplet.length, 3, `${sampleLabel} should draw top/left/right faces for the first voxel.`);
  const topFace = firstFaceTriplet[0];
  const leftFace = firstFaceTriplet[1];
  const rightFace = firstFaceTriplet[2];

  const signs = [topFace, leftFace, rightFace].map((entry) => Math.sign(signedArea(entry.points)));
  assert.equal(signs.every((sign) => sign !== 0), true, `${sampleLabel} should not draw degenerate voxel faces.`);
  assert.equal(signs.every((sign) => sign === signs[0]), true, `${sampleLabel} should keep top and side faces on the same winding orientation.`);

  assert.equal(
    countSharedProjectedPoints(leftFace.points, rightFace.points),
    2,
    `${sampleLabel} should render adjacent side faces that share one vertical edge.`
  );

  const frontFaceSign = signs[0];
  const survivingFaces = [topFace, leftFace, rightFace].filter((entry) => Math.sign(signedArea(entry.points)) === frontFaceSign);
  assert.equal(
    survivingFaces.length,
    3,
    `${sampleLabel} should keep top and side faces visible under normal backface-culling orientation.`
  );
}

function assertIndexLinksPresent() {
  const indexPath = path.join(repoRoot, 'samples', 'index.html');
  const indexText = fs.readFileSync(indexPath, 'utf8');
  assert.equal(indexText.includes('./phase-16/1622/index.html'), true, 'Sample 1622 link should exist in samples/index.html.');
  assert.equal(indexText.includes('./phase-17/1701/index.html'), true, 'Sample 1701 link should exist in samples/index.html.');
  assert.equal(indexText.includes('./phase-17/1702/index.html'), true, 'Sample 1702 link should exist in samples/index.html.');
  assert.equal(indexText.includes('./phase-17/1703/index.html'), true, 'Sample 1703 link should exist in samples/index.html.');
  assert.equal(indexText.includes('./phase-17/1704/index.html'), true, 'Sample 1704 link should exist in samples/index.html.');
  assert.equal(indexText.includes('./phase-17/1705/index.html'), true, 'Sample 1705 link should exist in samples/index.html.');
  assert.equal(indexText.includes('./phase-17/1706/index.html'), true, 'Sample 1706 link should exist in samples/index.html.');
  assert.equal(indexText.includes('./phase-17/1707/index.html'), true, 'Sample 1707 link should exist in samples/index.html.');
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
  assertTextIncludes(renderer, 'DOOM | Raycast + Sprites', 'DOOM sample should render a clear family label overlay.');
  assertTextIncludes(renderer, 'Controls:', 'DOOM sample should render a controls hint.');
}

function assertWolfGridRaycast() {
  const scene = new WolfGridRaycastScene();
  const startX = scene.player.x;
  scene.step3DPhysics(0.15, { input: makeInput(['KeyW']) });
  assert.equal(scene.player.x > startX, true, 'Wolf grid raycast should move player forward.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(scene.lastFilledColumns > 100, true, 'Wolf grid raycast should render filled columns.');
  const miniMapPanel = renderer.rects.find((rect) => rect.color === 'rgba(2, 6, 23, 0.74)');
  assert.notEqual(miniMapPanel, undefined, 'Wolf grid raycast should draw a mini map panel background.');
  assert.equal(miniMapPanel.x >= 700, true, 'Wolf grid raycast mini map should be anchored near the bottom-right (x).');
  assert.equal(miniMapPanel.y >= 400, true, 'Wolf grid raycast mini map should be anchored near the bottom-right (y).');
  assertTextIncludes(renderer, 'Wolf | Grid Raycast', 'Wolf grid sample should render a clear family label overlay.');
  assertTextIncludes(renderer, 'Controls:', 'Wolf grid sample should render a controls hint.');
}

function assertWolfOptimizedRaycast() {
  const scene = new WolfOptimizedRaycastScene();
  scene.step3DPhysics(0.15, { input: makeInput(['KeyD']) });

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(scene.lastFilledColumns > 100, true, 'Wolf optimized raycast should render filled columns.');
  assert.equal(scene.lastDdaSteps > scene.lastFilledColumns, true, 'Wolf optimized raycast should report DDA traversal steps.');
  assertTextIncludes(renderer, 'Wolf | DDA Raycast', 'Wolf optimized sample should render a clear family label overlay.');
  assertTextIncludes(renderer, 'Controls:', 'Wolf optimized sample should render a controls hint.');
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
  assertTextIncludes(renderer, 'Unreal | Texture + Material Lighting', 'Unreal texture sample should render a clear family label overlay.');
  assertTextIncludes(renderer, 'Controls:', 'Unreal texture sample should render a controls hint.');
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
  assertTextIncludes(renderer, 'Unreal | Image-Skinned Character', 'Unreal skinned sample should render a clear family label overlay.');
  assertTextIncludes(renderer, 'Controls:', 'Unreal skinned sample should render a controls hint.');
}

function assertMinecraftVoxelTerrain() {
  const scene = new VoxelWorldDemoScene();
  scene.step3DPhysics(0.2, { input: makeInput(['KeyD']) });

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(scene.lastFilledFaces > 0, true, 'Minecraft voxel terrain demo should render filled voxel faces.');
  assert.equal(renderer.polygons.length > 0, true, 'Minecraft voxel terrain demo should issue polygon draws.');
  assertVoxelFaceWindingConsistency(renderer, 'Minecraft voxel terrain demo');
  assertTextIncludes(renderer, 'Minecraft | Filled Voxel Terrain', 'Minecraft terrain sample should render a clear family label overlay.');
  assertTextIncludes(renderer, 'Controls:', 'Minecraft terrain sample should render a controls hint.');
}

function assertMinecraftChunkStreaming() {
  const scene = new ChunkStreamingVoxelScene();
  scene.step3DPhysics(0.2, { input: makeInput(['KeyD']) });

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(scene.lastActiveChunks > 0, true, 'Minecraft chunk streaming demo should activate chunks.');
  assert.equal(scene.lastFilledFaces > 0, true, 'Minecraft chunk streaming demo should render filled voxel faces.');
  assert.equal(renderer.polygons.length > 0, true, 'Minecraft chunk streaming demo should issue polygon draws.');
  assertVoxelFaceWindingConsistency(renderer, 'Minecraft chunk streaming demo');
  assertTextIncludes(renderer, 'Minecraft | Chunk Streaming Window', 'Minecraft chunk sample should render a clear family label overlay.');
  assertTextIncludes(renderer, 'Controls:', 'Minecraft chunk sample should render a controls hint.');
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
