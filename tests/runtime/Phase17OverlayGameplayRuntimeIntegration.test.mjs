/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase17OverlayGameplayRuntimeIntegration.test.mjs
*/
import assert from 'node:assert/strict';
import RealGameplayMiniGameScene from '../../samples/phase-17/1708/RealGameplayMiniGameScene.js';
import { getOverlayCycleInputCodes } from '../../samples/phase-17/shared/overlayCycleInput.js';
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

function assertGameplayOverlayRuntimeHooksAreNonBlocking() {
  const scene = new RealGameplayMiniGameScene();
  scene.setCamera3D(createCameraStub());

  scene.step3DPhysics(0.02, { input: makeInput(['Space']) });
  assert.equal(scene.gameState, 'running', 'Gameplay sample should be running before runtime integration checks.');

  const counters = { step: 0, render: 0 };
  scene.setOverlayGameplayRuntimeExtensions([
    {
      overlayId: 'ui-layer',
      onStep() {
        counters.step += 1;
      },
      onRender() {
        counters.render += 1;
      },
    },
  ]);

  const startX = scene.player.x;
  scene.step3DPhysics(0.2, { input: makeInput(['KeyD']) });
  assert.equal(scene.player.x > startX, true, 'Overlay runtime hooks should not interfere with movement controls.');
  assert.equal(counters.step > 0, true, 'Active overlay runtime step hook should execute during gameplay.');

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(counters.render > 0, true, 'Active overlay runtime render hook should execute.');
  assert.equal(renderer.texts.some((text) => text.includes('UI Layer')), true, 'Debug overlay rendering should remain intact.');

  const previousStepCount = counters.step;
  pressOverlayCycle(scene);
  scene.step3DPhysics(0.05, { input: makeInput([]) });
  assert.equal(counters.step, previousStepCount, 'Overlay-specific runtime hooks should not run when a different overlay is active.');

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
