/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase17Sample1712GameplayMetricsTelemetry.test.mjs
*/
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import GameplayMetricsTelemetryScene from '../../samples/phase-17/1712/GameplayMetricsTelemetryScene.js';

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
  assert.equal(text.includes('./phase-17/1712/index.html'), true, 'Sample 1712 link should exist in samples/index.html.');
}

function positionPlayerOnCore(scene, core) {
  scene.player.x = core.x - scene.player.width * 0.5;
  scene.player.z = core.z - scene.player.depth * 0.5;
}

function assertTelemetryOverlayAndCounters() {
  const scene = new GameplayMetricsTelemetryScene();
  scene.setCamera3D(createCameraStub());

  assert.equal(scene.gameState, 'ready', 'Telemetry sample should begin in ready state.');
  scene.step3DPhysics(0.02, { input: makeInput(['Space']) });
  assert.equal(scene.gameState, 'running', 'Space should start gameplay run.');

  scene.step3DPhysics(0.2, { input: makeInput(['KeyD']) });
  assert.equal(scene.telemetry.playerSpeed > 0, true, 'Telemetry should report positive player speed after movement.');
  assert.equal(scene.telemetry.avgFps > 0, true, 'Telemetry should report FPS.');

  const firstCore = scene.cores.find((core) => core.collected === false);
  positionPlayerOnCore(scene, firstCore);
  scene.step3DPhysics(0.05, { input: makeInput([]) });

  scene.hitCooldown = 0;
  const firstEnemy = scene.enemies[0];
  firstEnemy.x = scene.player.x;
  firstEnemy.z = scene.player.z;
  scene.step3DPhysics(0.05, { input: makeInput([]) });

  assert.equal(scene.telemetry.actionEvents >= 1, true, 'Telemetry should count gameplay actions.');
  assert.equal(scene.telemetry.collisionsTotal >= 1, true, 'Telemetry should accumulate collision events.');
  assert.equal(scene.telemetry.speedHistory.length > 0, true, 'Telemetry should capture speed history.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(renderer.texts.some((text) => text.includes('Telemetry Overlay')), true, 'Telemetry overlay panel should render.');
  assert.equal(renderer.texts.some((text) => text.includes('playerSpeed=')), true, 'Telemetry overlay should render player-speed metrics.');
  assert.equal(renderer.texts.some((text) => text.includes('activeCameraId=')), true, 'Camera debug panel should remain visible.');
  assert.equal(renderer.texts.some((text) => text.includes('overlayCount=')), true, 'Collision debug panel should remain visible.');
}

export function run() {
  assertIndexLinkPresent();
  assertTelemetryOverlayAndCounters();
}
