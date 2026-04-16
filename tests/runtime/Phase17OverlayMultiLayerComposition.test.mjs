/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase17OverlayMultiLayerComposition.test.mjs
*/
import assert from 'node:assert/strict';
import RealGameplayMiniGameScene from '../../samples/phase-17/1708/RealGameplayMiniGameScene.js';
import {
  createOverlayGameplayRuntime,
  getOverlayGameplayRuntimeCompositionSnapshot,
  renderOverlayGameplayRuntime,
  stepOverlayGameplayRuntime,
} from '../../samples/phase-17/shared/overlayGameplayRuntime.js';

function createRendererProbe(width = 960, height = 540) {
  return {
    getCanvasSize() {
      return { width, height };
    },
    clear() {},
    drawRect() {},
    strokeRect() {},
    drawText() {},
    drawLine() {},
    drawPolygon() {},
    drawImageFrame() {},
  };
}

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

function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function assertDeterministicCompositionOrderingAndSlots() {
  const renderOrder = [];
  const stepOrder = [];
  const runtime = createOverlayGameplayRuntime({
    runtimeExtensions: [
      {
        overlayId: '',
        layerOrder: 20,
        panelWidth: 220,
        panelHeight: 86,
        onStep(context) {
          stepOrder.push(`base:${context.overlayComposition.index}`);
        },
        onRender(context) {
          renderOrder.push(`base:${context.overlayComposition.index}`);
        },
      },
      {
        overlayId: '',
        compose: true,
        layerOrder: 5,
        panelWidth: 220,
        panelHeight: 86,
        onStep(context) {
          stepOrder.push(`mission:${context.overlayComposition.index}`);
        },
        onRender(context) {
          renderOrder.push(`mission:${context.overlayComposition.index}`);
        },
      },
      {
        overlayId: '',
        compose: true,
        layerOrder: 30,
        panelWidth: 220,
        panelHeight: 86,
        onStep(context) {
          stepOrder.push(`telemetry:${context.overlayComposition.index}`);
        },
        onRender(context) {
          renderOrder.push(`telemetry:${context.overlayComposition.index}`);
        },
      },
    ],
  });

  const renderer = createRendererProbe();
  const stepInvoked = stepOverlayGameplayRuntime(runtime, { activeOverlayId: 'ui-layer' });
  const renderInvoked = renderOverlayGameplayRuntime(runtime, { activeOverlayId: 'ui-layer', renderer });
  assert.equal(stepInvoked, 3, 'Composed runtime step should invoke all active/composed layers.');
  assert.equal(renderInvoked, 3, 'Composed runtime render should invoke all active/composed layers.');
  assert.deepEqual(
    stepOrder.map((token) => token.split(':')[0]),
    ['mission', 'base', 'telemetry'],
    'Composed runtime step ordering should be deterministic by layer order.'
  );
  assert.deepEqual(
    renderOrder.map((token) => token.split(':')[0]),
    ['mission', 'base', 'telemetry'],
    'Composed runtime render ordering should be deterministic by layer order.'
  );

  const snapshot = getOverlayGameplayRuntimeCompositionSnapshot(runtime, {
    activeOverlayId: 'ui-layer',
    renderer,
  });
  assert.equal(snapshot.length, 3, 'Composition snapshot should include all composed layers.');
  for (let i = 1; i < snapshot.length; i += 1) {
    const prev = snapshot[i - 1].slot;
    const curr = snapshot[i].slot;
    assert.equal(overlaps(prev, curr), false, 'Composed slot layout should prevent overlap/occlusion regression.');
  }
}

function assertComposedRuntimeDoesNotInterfereWithGameplayInput() {
  const scene = new RealGameplayMiniGameScene();
  scene.setCamera3D(createCameraStub());
  scene.step3DPhysics(0.02, { input: makeInput(['Space']) });
  assert.equal(scene.gameState, 'running', 'Gameplay sample should be running before composition non-interference validation.');

  const counters = { active: 0, composed: 0 };
  scene.setOverlayGameplayRuntimeExtensions([
    {
      overlayId: '',
      onStep() {
        counters.active += 1;
      },
    },
    {
      overlayId: '',
      compose: true,
      layerOrder: 40,
      onStep() {
        counters.composed += 1;
      },
    },
  ]);

  const startX = scene.player.x;
  scene.step3DPhysics(0.2, { input: makeInput(['KeyD']) });
  assert.equal(scene.player.x > startX, true, 'Composed overlay runtime should not interfere with gameplay movement priority.');
  assert.equal(counters.active > 0, true, 'Active overlay runtime step should continue executing.');
  assert.equal(counters.composed > 0, true, 'Composed overlay runtime step should execute alongside active layer.');
}

export function run() {
  assertDeterministicCompositionOrderingAndSlots();
  assertComposedRuntimeDoesNotInterfereWithGameplayInput();
}
