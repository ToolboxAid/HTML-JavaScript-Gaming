/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase17Sample1709MovementModelsLab.test.mjs
*/
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MovementModelsLabScene from '../../samples/phase-17/1709/MovementModelsLabScene.js';
import { getOverlayCycleInputCodes } from '../../samples/phase-17/shared/overlayCycleInput.js';
import { resetTabDebugOverlayPersistenceForTests } from '../../samples/phase-17/shared/tabDebugOverlayCycle.js';

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

function pressOverlayCycle(scene, { reverse = false } = {}) {
  scene.step3DPhysics(0.02, { input: makeInput(getOverlayCycleInputCodes({ reverse })) });
  scene.step3DPhysics(0.02, { input: makeInput([]) });
}

function assertIndexLinkPresent() {
  const indexPath = path.join(repoRoot, 'samples', 'index.html');
  const indexText = fs.readFileSync(indexPath, 'utf8');
  assert.equal(indexText.includes('./phase-17/1708/index.html'), true, 'Sample 1708 link should remain in samples/index.html.');
  assert.equal(indexText.includes('./phase-17/1709/index.html'), true, 'Sample 1709 link should exist in samples/index.html.');
}

function assertMovementModesAndCameraFollow() {
  const scene = new MovementModelsLabScene();
  const camera = createCameraStub();
  scene.setCamera3D(camera);

  const directStartX = scene.actor.x;
  scene.step3DPhysics(0.2, { input: makeInput(['KeyD']) });
  assert.equal(scene.actor.x > directStartX, true, 'Direct mode should apply immediate axis movement.');

  scene.step3DPhysics(0.02, { input: makeInput(['Digit2']) });
  const tankStartHeading = scene.actor.heading;
  scene.step3DPhysics(0.2, { input: makeInput(['KeyD']) });
  assert.equal(scene.actor.heading > tankStartHeading, true, 'Tank mode should rotate heading with turn input.');
  const tankStartZ = scene.actor.z;
  scene.step3DPhysics(0.2, { input: makeInput(['KeyW']) });
  assert.equal(scene.actor.z !== tankStartZ, true, 'Tank mode should move along heading when throttled.');

  scene.step3DPhysics(0.02, { input: makeInput(['Digit3']) });
  const weightedStartZ = scene.actor.z;
  scene.step3DPhysics(0.2, { input: makeInput(['KeyW']) });
  assert.equal(scene.weightedVelocity.z > 0, true, 'Weighted mode should build forward velocity from acceleration.');
  scene.step3DPhysics(0.2, { input: makeInput([]) });
  assert.equal(scene.actor.z > weightedStartZ, true, 'Weighted mode should keep moving briefly from inertia after release.');

  const cameraState = camera.getState();
  assert.equal(Number.isFinite(cameraState.position.x), true, 'Camera follow should set finite camera position values.');
  assert.equal(Number.isFinite(cameraState.rotation.y), true, 'Camera follow should set finite camera rotation values.');
}

function assertVisibleModeLabels() {
  const scene = new MovementModelsLabScene();
  scene.setCamera3D(createCameraStub());

  scene.step3DPhysics(0.01, { input: makeInput(['Digit1']) });
  const directRenderer = createRendererProbe();
  scene.render(directRenderer);
  assert.equal(directRenderer.texts.some((text) => text.includes('Mode: Direct XY')), true, 'Direct mode label should be visible.');
  assert.equal(directRenderer.texts.some((text) => text.includes('Movement Runtime')), true, 'Movement runtime debug overlay should be visible by default.');

  scene.step3DPhysics(0.01, { input: makeInput(['Digit2']) });
  const tankRenderer = createRendererProbe();
  scene.render(tankRenderer);
  assert.equal(tankRenderer.texts.some((text) => text.includes('Mode: Tank Rotation')), true, 'Tank mode label should be visible.');

  scene.step3DPhysics(0.01, { input: makeInput(['Digit3']) });
  const weightedRenderer = createRendererProbe();
  scene.render(weightedRenderer);
  assert.equal(weightedRenderer.texts.some((text) => text.includes('Mode: Weighted')), true, 'Weighted mode label should be visible.');
  assert.equal(weightedRenderer.lines.length > 0, true, 'Scene should render visible 3D line output.');
  assert.equal(weightedRenderer.texts.some((text) => text.includes('Debug: G/Shift+G')), true, 'HUD instructions should advertise G debug cycling.');

  pressOverlayCycle(scene);
  const hudRenderer = createRendererProbe();
  scene.render(hudRenderer);
  assert.equal(hudRenderer.texts.some((text) => text.includes('Movement Lab HUD')), true, 'G should cycle to Movement Lab HUD.');
  assert.equal(hudRenderer.texts.some((text) => text.includes('Movement Runtime')), false, 'Only one movement debug overlay should be visible at a time.');
}

export function run() {
  resetTabDebugOverlayPersistenceForTests();
  assertIndexLinkPresent();
  assertMovementModesAndCameraFollow();
  assertVisibleModeLabels();
}
