/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase16AdvancedBatch5Sanity.test.mjs
*/
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import AINavigation3DScene from '../../samples/phase-16/1621/AINavigation3DScene.js';

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

function assertSampleIndexLinkPresent() {
  const indexPath = path.join(repoRoot, 'samples', 'index.html');
  const indexText = fs.readFileSync(indexPath, 'utf8');
  assert.equal(indexText.includes('./phase-16/1621/index.html'), true, 'Sample 1621 link should exist in samples/index.html.');
}

function assertAiNavigationDemo() {
  const scene = new AINavigation3DScene();
  scene.setCamera3D(createCameraStub());
  assert.equal(scene.pathWorld.length > 1, true, 'AI navigation demo should initialize a visible multi-node path.');

  const startX = scene.agent.x;
  const startZ = scene.agent.z;
  const startYaw = scene.cameraYaw;
  scene.step3DPhysics(0.25, { input: makeInput(['KeyE']) });
  assert.equal(scene.cameraYaw > startYaw, true, 'AI navigation demo should update camera yaw for visible movement.');
  const moved = scene.agent.x !== startX || scene.agent.z !== startZ;
  assert.equal(moved, true, 'AI navigation demo should move the agent along the path.');

  const initialDebug = scene.showPathDebug;
  scene.step3DPhysics(0.1, { input: makeInput(['KeyB']) });
  scene.step3DPhysics(0.1, { input: makeInput([]) });
  assert.equal(scene.showPathDebug !== initialDebug, true, 'AI navigation demo should toggle optional path debug visualization.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  const visibleLines = countVisibleLinesInViewport(renderer.lines, scene.viewport);
  assert.equal(visibleLines > 0, true, 'AI navigation demo should render visible 3D output.');
  assert.equal(renderer.texts.includes('3D World - AI Nav Grid'), true, 'AI navigation demo should render world clarity label.');
  assert.equal(renderer.texts.includes('UI Layer - Navigation HUD'), true, 'AI navigation demo should render UI clarity label.');
}

export function run() {
  assertSampleIndexLinkPresent();
  assertAiNavigationDemo();
}
