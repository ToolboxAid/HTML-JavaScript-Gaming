/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase17RealGameplaySample.test.mjs
*/
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import RealGameplayMiniGameScene from '../../samples/phase-17/1708/RealGameplayMiniGameScene.js';

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
  const texts = [];
  const lines = [];
  return {
    texts,
    lines,
    getCanvasSize() {
      return { width, height };
    },
    clear() {},
    drawRect() {},
    strokeRect() {},
    drawText(text) {
      texts.push(String(text));
    },
    drawLine(x1, y1, x2, y2, color) {
      lines.push({ x1, y1, x2, y2, color });
    },
    drawPolygon() {},
    drawImageFrame() {},
  };
}

function assertIndexLinkPresent() {
  const indexPath = path.join(repoRoot, 'samples', 'index.html');
  const text = fs.readFileSync(indexPath, 'utf8');
  assert.equal(text.includes('./phase-17/1701/index.html'), true, 'Sample 1701 link should remain in samples/index.html.');
  assert.equal(text.includes('./phase-17/1702/index.html'), true, 'Sample 1702 link should remain in samples/index.html.');
  assert.equal(text.includes('./phase-17/1703/index.html'), true, 'Sample 1703 link should remain in samples/index.html.');
  assert.equal(text.includes('./phase-17/1704/index.html'), true, 'Sample 1704 link should remain in samples/index.html.');
  assert.equal(text.includes('./phase-17/1705/index.html'), true, 'Sample 1705 link should remain in samples/index.html.');
  assert.equal(text.includes('./phase-17/1706/index.html'), true, 'Sample 1706 link should remain in samples/index.html.');
  assert.equal(text.includes('./phase-17/1707/index.html'), true, 'Sample 1707 link should remain in samples/index.html.');
  assert.equal(text.includes('./phase-17/1708/index.html'), true, 'Sample 1708 link should exist in samples/index.html.');
}

function positionPlayerOnCore(scene, core) {
  scene.player.x = core.x - scene.player.width * 0.5;
  scene.player.z = core.z - scene.player.depth * 0.5;
}

function assertGameplayLoopAndDebugPanels() {
  const scene = new RealGameplayMiniGameScene();
  scene.setCamera3D(createCameraStub());

  assert.equal(scene.gameState, 'ready', 'Mini-game should begin in ready state before deployment.');
  const readyRenderer = createRendererProbe();
  scene.render(readyRenderer);
  assert.equal(
    readyRenderer.texts.some((text) => text.includes('MISSION READY')),
    true,
    'Ready state should render a clear mission-ready prompt.'
  );

  scene.step3DPhysics(0.02, { input: makeInput(['Space']) });
  assert.equal(scene.gameState, 'running', 'Space should transition mini-game from ready to running state.');

  const startX = scene.player.x;
  scene.step3DPhysics(0.25, { input: makeInput(['KeyD']) });
  assert.equal(scene.player.x > startX, true, 'Player should move with directional input.');

  const firstCore = scene.cores.find((core) => core.collected === false);
  positionPlayerOnCore(scene, firstCore);
  scene.step3DPhysics(0.05, { input: makeInput([]) });
  assert.equal(scene.score >= 1, true, 'Collecting a core should increase score.');

  scene.hitCooldown = 0;
  const firstEnemy = scene.enemies[0];
  firstEnemy.x = scene.player.x;
  firstEnemy.z = scene.player.z;
  const healthBeforeHit = scene.health;
  scene.step3DPhysics(0.05, { input: makeInput([]) });
  assert.equal(scene.health < healthBeforeHit, true, 'Enemy overlap should reduce player health.');

  scene.score = scene.targetScore - 1;
  scene.cores.forEach((core, index) => {
    core.collected = index !== 0;
  });
  positionPlayerOnCore(scene, scene.cores[0]);
  scene.step3DPhysics(0.05, { input: makeInput([]) });
  assert.equal(scene.gameState, 'won', 'Reaching the objective score should end the match in a win state.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(renderer.lines.length > 0, true, 'Mini-game scene should render visible wireframe lines.');
  assert.equal(renderer.texts.some((text) => text.includes('3D World - Outpost Arena')), true, 'Scene should render a clear world-layer label.');
  assert.equal(renderer.texts.some((text) => text.includes('Mini-Game Runtime')), true, 'Runtime debug overlay should render by default.');
  assert.equal(renderer.texts.some((text) => text.includes('activeCameraId=')), false, 'Only one debug overlay should be visible at a time.');
  assert.equal(renderer.texts.some((text) => text.includes('overlayCount=')), false, 'Collision debug overlay should be hidden when not active.');
  assert.equal(renderer.texts.some((text) => text.includes('UI Layer - Mission HUD')), true, 'Polished HUD header should render.');
  assert.equal(renderer.texts.some((text) => text.includes('Mission Feed')), true, 'Mission feed panel should render.');

  scene.step3DPhysics(0.02, { input: makeInput(['Tab']) });
  scene.step3DPhysics(0.02, { input: makeInput([]) });
  const cameraOverlayRenderer = createRendererProbe();
  scene.render(cameraOverlayRenderer);
  assert.equal(cameraOverlayRenderer.texts.some((text) => text.includes('activeCameraId=')), true, 'Tab should cycle to camera summary overlay.');
  assert.equal(cameraOverlayRenderer.texts.some((text) => text.includes('overlayCount=')), false, 'Camera overlay view should hide collision overlay.');

  scene.step3DPhysics(0.02, { input: makeInput(['Tab']) });
  scene.step3DPhysics(0.02, { input: makeInput([]) });
  const collisionOverlayRenderer = createRendererProbe();
  scene.render(collisionOverlayRenderer);
  assert.equal(collisionOverlayRenderer.texts.some((text) => text.includes('overlayCount=')), true, 'Second Tab press should cycle to collision overlay.');
  assert.equal(collisionOverlayRenderer.texts.some((text) => text.includes('activeCameraId=')), false, 'Collision overlay view should hide camera overlay.');
}

export function run() {
  assertIndexLinkPresent();
  assertGameplayLoopAndDebugPanels();
}
