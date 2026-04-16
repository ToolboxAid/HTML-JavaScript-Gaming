/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase17OverlayGameplayRuntimeIntegration.test.mjs
*/
import assert from 'node:assert/strict';
import RealGameplayMiniGameScene from '../../samples/phase-17/1708/RealGameplayMiniGameScene.js';
import {
  getOverlayCycleInputCodes,
  getOverlayRuntimeToggleInputCodes,
} from '../../samples/phase-17/shared/overlayCycleInput.js';
import { resetTabDebugOverlayPersistenceForTests } from '../../samples/phase-17/shared/tabDebugOverlayCycle.js';

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

function pressOverlayCycle(scene) {
  scene.step3DPhysics(0.02, { input: makeInput(getOverlayCycleInputCodes()) });
  scene.step3DPhysics(0.02, { input: makeInput([]) });
}

function pressOverlayRuntimeToggle(scene) {
  scene.step3DPhysics(0.02, { input: makeInput(getOverlayRuntimeToggleInputCodes()) });
  scene.step3DPhysics(0.02, { input: makeInput([]) });
}

function assertGameplayOverlayRuntimeHooksAreNonBlocking() {
  const scene = new RealGameplayMiniGameScene();
  scene.setCamera3D(createCameraStub());

  scene.step3DPhysics(0.02, { input: makeInput(['Space']) });
  assert.equal(scene.gameState, 'running', 'Gameplay sample should be running before runtime integration checks.');

  const counters = {
    aStep: 0,
    aRender: 0,
    bStep: 0,
    bRender: 0,
  };
  scene.setOverlayGameplayRuntimeExtensions([
    {
      overlayId: '',
      onStep() {
        counters.aStep += 1;
      },
      onRender() {
        counters.aRender += 1;
      },
    },
    {
      overlayId: '',
      onStep() {
        counters.bStep += 1;
      },
      onRender() {
        counters.bRender += 1;
      },
    },
  ]);

  const startX = scene.player.x;
  scene.step3DPhysics(0.2, { input: makeInput(['KeyD']) });
  assert.equal(scene.player.x > startX, true, 'Overlay runtime hooks should not interfere with movement controls.');
  assert.equal(counters.aStep > 0, true, 'Primary runtime overlay hook should execute during gameplay.');
  assert.equal(counters.bStep, 0, 'Secondary runtime overlay hook should stay inactive before cycle interaction.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(counters.aRender > 0, true, 'Primary runtime overlay render hook should execute.');
  assert.equal(counters.bRender, 0, 'Secondary runtime overlay render hook should stay inactive before cycle interaction.');
  assert.equal(renderer.texts.some((text) => text.includes('UI Layer')), true, 'Debug overlay rendering should remain intact.');

  const beforeCycleBStep = counters.bStep;
  pressOverlayCycle(scene);
  const missionFeedRenderer = createRendererProbe();
  scene.render(missionFeedRenderer);
  assert.equal(missionFeedRenderer.texts.some((text) => text.includes('Mission Feed')), true, 'Debug overlay cycle behavior should remain unchanged.');
  scene.step3DPhysics(0.05, { input: makeInput([]) });
  assert.equal(counters.bStep > beforeCycleBStep, true, 'Gameplay overlay runtime cycle control should switch active runtime extension.');

  const beforeHideStep = counters.aStep + counters.bStep;
  pressOverlayRuntimeToggle(scene);
  scene.step3DPhysics(0.05, { input: makeInput([]) });
  assert.equal(counters.aStep + counters.bStep, beforeHideStep, 'Runtime overlay toggle should hide runtime overlays during gameplay.');

  pressOverlayRuntimeToggle(scene);
  scene.step3DPhysics(0.05, { input: makeInput([]) });
  assert.equal(counters.aStep + counters.bStep > beforeHideStep, true, 'Runtime overlay toggle should restore runtime overlay execution.');

  scene.setOverlayGameplayRuntimeExtensions([
    {
      overlayId: 'mission-feed',
      onStep() {
        throw new Error('step failure');
      },
      onRender() {
        throw new Error('render failure');
      },
    },
  ]);
  assert.doesNotThrow(() => scene.step3DPhysics(0.05, { input: makeInput([]) }), 'Overlay runtime step failures should not break gameplay.');
  assert.doesNotThrow(() => scene.render(createRendererProbe()), 'Overlay runtime render failures should not break scene rendering.');
}

export function run() {
  resetTabDebugOverlayPersistenceForTests();
  assertGameplayOverlayRuntimeHooksAreNonBlocking();
}
