/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase17Sample1713FinalReferenceGame.test.mjs
*/
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import FinalReferenceGameScene from '../../samples/phase-17/1713/FinalReferenceGameScene.js';

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
  return {
    texts,
    getCanvasSize() {
      return { width, height };
    },
    clear() {},
    drawRect() {},
    strokeRect() {},
    drawText(text) {
      texts.push(String(text));
    },
    drawLine() {},
    drawPolygon() {},
    drawImageFrame() {},
  };
}

function assertIndexLinkPresent() {
  const indexPath = path.join(repoRoot, 'samples', 'index.html');
  const text = fs.readFileSync(indexPath, 'utf8');
  assert.equal(text.includes('./phase-17/1713/index.html'), true, 'Sample 1713 link should exist in samples/index.html.');
}

function assertFinalReferenceRuntimeFlow() {
  const scene = new FinalReferenceGameScene();
  scene.setCamera3D(createCameraStub());
  assert.equal(scene.tabDebugOverlays?.cycleKey, 'KeyG', 'Reference game should use G as debug cycle key.');
  assert.deepEqual(
    scene.tabDebugOverlays.overlays.map((entry) => entry.label),
    ['UI Layer', 'Mission Feed', 'MISSION READY', 'Final Reference Runtime'],
    'Reference game should keep the required cycle map ordering.'
  );

  assert.equal(scene.gameState, 'ready', 'Reference game should start in ready state.');
  const beforeX = scene.player.x;
  const beforeZ = scene.player.z;
  scene.step3DPhysics(0.05, { input: makeInput(['KeyW']) });
  assert.equal(scene.gameState, 'running', 'Movement input should start the reference game.');
  assert.equal(scene.player.x !== beforeX || scene.player.z !== beforeZ, true, 'Movement input should move the player.');
  assert.equal(scene.referenceRuntime.runCount, 1, 'Reference runtime should count mission runs.');

  scene.step3DPhysics(0.18, { input: makeInput(['KeyD']) });
  assert.equal(scene.telemetry.playerSpeed > 0, true, 'Telemetry should remain active in the reference game.');

  scene.score = scene.targetScore;
  scene.timeLeft = 16;
  scene.health = scene.maxHealth;
  scene.step3DPhysics(0.02, { input: makeInput([]) });

  assert.equal(scene.gameState, 'won', 'Score completion should transition the reference game to won state.');
  assert.equal(scene.referenceRuntime.missionRank !== 'N/A', true, 'Reference runtime should compute mission rank.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(renderer.texts.some((text) => text.includes('UI Layer')), true, 'UI Layer panel should render by default.');
  assert.equal(renderer.texts.some((text) => text.includes('Final Reference Runtime')), false, 'Final runtime panel should not render by default.');

  const indexBeforeTab = scene.tabDebugOverlays.activeIndex;
  scene.step3DPhysics(0.02, { input: makeInput(['Tab']) });
  scene.step3DPhysics(0.02, { input: makeInput([]) });
  assert.equal(scene.tabDebugOverlays.activeIndex, indexBeforeTab, 'Tab should not cycle reference overlays.');

  scene.step3DPhysics(0.02, { input: makeInput(['KeyG']) });
  scene.step3DPhysics(0.02, { input: makeInput([]) });
  const missionFeedRenderer = createRendererProbe();
  scene.render(missionFeedRenderer);
  assert.equal(missionFeedRenderer.texts.some((text) => text.includes('Mission Feed')), true, 'First G press should cycle to Mission Feed.');

  scene.step3DPhysics(0.02, { input: makeInput(['KeyG']) });
  scene.step3DPhysics(0.02, { input: makeInput([]) });
  const missionReadyRenderer = createRendererProbe();
  scene.render(missionReadyRenderer);
  assert.equal(missionReadyRenderer.texts.some((text) => text.includes('MISSION READY')), true, 'Second G press should cycle to MISSION READY.');

  scene.step3DPhysics(0.02, { input: makeInput(['KeyG']) });
  scene.step3DPhysics(0.02, { input: makeInput([]) });
  const runtimeRenderer = createRendererProbe();
  scene.render(runtimeRenderer);
  assert.equal(runtimeRenderer.texts.some((text) => text.includes('Final Reference Runtime')), true, 'Third G press should cycle to Final Reference Runtime.');
  assert.equal(runtimeRenderer.texts.some((text) => text.includes('profile=final-reference')), true, 'Reference runtime metrics should render.');
  assert.equal(runtimeRenderer.texts.some((text) => text.includes('UI Layer')), false, 'Only one debug overlay should be visible at a time.');
}

export function run() {
  assertIndexLinkPresent();
  assertFinalReferenceRuntimeFlow();
}
