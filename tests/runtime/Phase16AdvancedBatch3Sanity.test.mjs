/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase16AdvancedBatch3Sanity.test.mjs
*/
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import EntityComposition3DScene from '../../samples/phase-16/1615/EntityComposition3DScene.js';
import WorldStreaming3DScene from '../../samples/phase-16/1616/WorldStreaming3DScene.js';
import LargeWorldStreaming3DScene from '../../samples/phase-16/1617/LargeWorldStreaming3DScene.js';

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
  assert.equal(indexText.includes('./phase-16/1615/index.html'), true, 'Sample 1615 link should exist in samples/index.html.');
  assert.equal(indexText.includes('./phase-16/1616/index.html'), true, 'Sample 1616 link should exist in samples/index.html.');
  assert.equal(indexText.includes('./phase-16/1617/index.html'), true, 'Sample 1617 link should exist in samples/index.html.');
}

function assertEntityComposition() {
  const scene = new EntityComposition3DScene();
  scene.setCamera3D(createCameraStub());
  assert.equal(scene.parts.length >= 6, true, 'Entity composition should expose a composed multi-part entity.');

  const startSpacing = scene.partSpacing;
  scene.step3DPhysics(0.25, { input: makeInput(['ArrowUp']) });
  assert.equal(scene.partSpacing > startSpacing, true, 'Entity composition should respond to part spacing input.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  const visibleLines = countVisibleLinesInViewport(renderer.lines, scene.viewport);
  assert.equal(visibleLines > 0, true, 'Entity composition should render visible 3D output.');
}

function assertWorldStreaming() {
  const scene = new WorldStreaming3DScene();
  scene.setCamera3D(createCameraStub());
  assert.equal(scene.activeChunks.length > 0, true, 'World streaming should initialize active chunks.');

  const startRadius = scene.streamRadius;
  const startX = scene.player.x;
  scene.step3DPhysics(0.25, { input: makeInput(['ArrowUp', 'KeyD']) });
  assert.equal(scene.streamRadius > startRadius, true, 'World streaming should increase stream radius from input.');
  assert.equal(scene.player.x > startX, true, 'World streaming should move player with input.');
  assert.equal(scene.activeChunks.length === scene.chunkKeySet.size, true, 'World streaming keys should match active chunks.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  const visibleLines = countVisibleLinesInViewport(renderer.lines, scene.viewport);
  assert.equal(visibleLines > 0, true, 'World streaming should render visible 3D output.');
}

function assertLargeWorldStreaming() {
  const scene = new LargeWorldStreaming3DScene();
  scene.setCamera3D(createCameraStub());
  assert.equal(scene.visibleCells.length > 0, true, 'Large world streaming should initialize visible cells.');
  assert.equal(scene.visibleCells.length <= scene.maxVisibleCells, true, 'Large world streaming should respect visibility budget.');

  const startDistance = scene.streamDistance;
  scene.step3DPhysics(0.25, { input: makeInput(['ArrowUp']) });
  assert.equal(scene.streamDistance > startDistance, true, 'Large world streaming should increase stream distance from input.');
  assert.equal(scene.visibleCells.length <= scene.maxVisibleCells, true, 'Large world streaming should keep visible cells under budget.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  const visibleLines = countVisibleLinesInViewport(renderer.lines, scene.viewport);
  assert.equal(visibleLines > 0, true, 'Large world streaming should render visible 3D output.');
}

export function run() {
  assertSampleIndexLinksPresent();
  assertEntityComposition();
  assertWorldStreaming();
  assertLargeWorldStreaming();
}
