/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase17TabDebugOverlayCycle1707Plus.test.mjs
*/
import assert from 'node:assert/strict';
import ChunkStreamingVoxelScene from '../../samples/phase-17/1707/VoxelWorldDemoScene.js';
import RealGameplayMiniGameScene from '../../samples/phase-17/1708/RealGameplayMiniGameScene.js';
import MovementModelsLab1709Scene from '../../samples/phase-17/1709/MovementModelsLabScene.js';
import RealGameplayMiniGame1710Scene from '../../samples/phase-17/1710/RealGameplayMiniGameScene.js';
import MovementModelsLab1711Scene from '../../samples/phase-17/1711/MovementModelsLabScene.js';
import GameplayMetricsTelemetryScene from '../../samples/phase-17/1712/GameplayMetricsTelemetryScene.js';
import FinalReferenceGameScene from '../../samples/phase-17/1713/FinalReferenceGameScene.js';

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

function tapTab(scene, reverse = false) {
  const keys = reverse ? ['Tab', 'ShiftLeft'] : ['Tab'];
  scene.step3DPhysics(0.02, { input: makeInput(keys) });
  scene.step3DPhysics(0.02, { input: makeInput([]) });
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

function assertOverlayCycleBehavior(label, sceneFactory, { defaultToken, cycleToken = '' }) {
  const scene = sceneFactory();
  if (typeof scene.setCamera3D === 'function') {
    scene.setCamera3D(createCameraStub());
  }

  assert.equal(Array.isArray(scene.tabDebugOverlays?.overlays), true, `${label} should use tab debug overlay controller.`);
  assert.equal(scene.tabDebugOverlays.overlays.length >= 1, true, `${label} should register at least one debug overlay.`);

  const initialIndex = scene.tabDebugOverlays.activeIndex;
  const defaultRenderer = createRendererProbe();
  scene.render(defaultRenderer);
  assert.equal(defaultRenderer.texts.some((text) => text.includes(defaultToken)), true, `${label} should render its default debug overlay.`);

  if (scene.tabDebugOverlays.overlays.length > 1) {
    tapTab(scene, false);
    assert.equal(scene.tabDebugOverlays.activeIndex !== initialIndex, true, `${label} should advance overlay index on Tab.`);
    const cycledRenderer = createRendererProbe();
    scene.render(cycledRenderer);
    assert.equal(cycledRenderer.texts.some((text) => text.includes(cycleToken)), true, `${label} should render next debug overlay after Tab.`);
    assert.equal(cycledRenderer.texts.some((text) => text.includes(defaultToken)), false, `${label} should show only one debug overlay at a time.`);

    tapTab(scene, true);
    assert.equal(scene.tabDebugOverlays.activeIndex, initialIndex, `${label} should reverse cycle on Shift+Tab.`);
  }
}

export function run() {
  assertOverlayCycleBehavior('1707', () => new ChunkStreamingVoxelScene(), {
    defaultToken: 'Chunk Runtime',
  });
  assertOverlayCycleBehavior('1708', () => new RealGameplayMiniGameScene(), {
    defaultToken: 'Mini-Game Runtime',
    cycleToken: 'activeCameraId=',
  });
  assertOverlayCycleBehavior('1709', () => new MovementModelsLab1709Scene(), {
    defaultToken: 'Movement Runtime',
    cycleToken: 'Toggle camera: C | Toggle debug: V',
  });
  assertOverlayCycleBehavior('1710', () => new RealGameplayMiniGame1710Scene(), {
    defaultToken: 'Mini-Game Runtime',
    cycleToken: 'activeCameraId=',
  });
  assertOverlayCycleBehavior('1711', () => new MovementModelsLab1711Scene(), {
    defaultToken: 'Movement Runtime',
    cycleToken: 'Toggle camera: C | Toggle debug: V',
  });
  assertOverlayCycleBehavior('1712', () => new GameplayMetricsTelemetryScene(), {
    defaultToken: 'Telemetry Overlay',
    cycleToken: 'Mini-Game Runtime',
  });
  assertOverlayCycleBehavior('1713', () => new FinalReferenceGameScene(), {
    defaultToken: 'Final Reference Runtime',
    cycleToken: 'Mini-Game Runtime',
  });
}
