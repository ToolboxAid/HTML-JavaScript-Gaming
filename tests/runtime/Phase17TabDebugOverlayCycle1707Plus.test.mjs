/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase17TabDebugOverlayCycle1707Plus.test.mjs
*/
import assert from 'node:assert/strict';
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

function pressCycleKey(scene, { reverse = false } = {}) {
  const keys = reverse ? ['KeyG', 'ShiftLeft'] : ['KeyG'];
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

function assertMapOrderAndKeyBehavior(label, sceneFactory, expectedLabels, expectedTokens) {
  const scene = sceneFactory();
  if (typeof scene.setCamera3D === 'function') {
    scene.setCamera3D(createCameraStub());
  }

  assert.equal(scene.tabDebugOverlays?.cycleKey, 'KeyG', `${label} should use G as overlay cycle key.`);
  const labels = scene.tabDebugOverlays.overlays.map((entry) => entry.label);
  assert.deepEqual(labels, expectedLabels, `${label} should use exact required overlay map ordering.`);

  for (let i = 0; i < expectedTokens.length; i += 1) {
    const renderer = createRendererProbe();
    scene.render(renderer);
    assert.equal(renderer.texts.some((text) => text.includes(expectedTokens[i])), true, `${label} should render expected panel token at cycle step ${i + 1}.`);
    if (i < expectedTokens.length - 1) {
      pressCycleKey(scene);
    }
  }

  const indexAfterForward = scene.tabDebugOverlays.activeIndex;
  pressCycleKey(scene, { reverse: true });
  assert.equal(scene.tabDebugOverlays.activeIndex, indexAfterForward - 1, `${label} should support reverse cycling with Shift+G.`);
}

export function run() {
  assertMapOrderAndKeyBehavior(
    '1708',
    () => new RealGameplayMiniGameScene(),
    ['UI Layer', 'Mission Feed', 'MISSION READY', 'Mini-Game Runtime'],
    ['UI Layer', 'Mission Feed', 'MISSION READY', 'Mini-Game Runtime']
  );
  assertMapOrderAndKeyBehavior(
    '1709',
    () => new MovementModelsLab1709Scene(),
    ['Movement Runtime', 'Movement Lab HUD'],
    ['Movement Runtime', 'Movement Lab HUD']
  );
  assertMapOrderAndKeyBehavior(
    '1710',
    () => new RealGameplayMiniGame1710Scene(),
    ['UI Layer', 'Mission Feed', 'MISSION READY', 'Mini-Game Runtime'],
    ['UI Layer', 'Mission Feed', 'MISSION READY', 'Mini-Game Runtime']
  );
  assertMapOrderAndKeyBehavior(
    '1711',
    () => new MovementModelsLab1711Scene(),
    ['Movement Runtime', 'Movement Lab HUD'],
    ['Movement Runtime', 'Movement Lab HUD']
  );
  assertMapOrderAndKeyBehavior(
    '1712',
    () => new GameplayMetricsTelemetryScene(),
    ['UI Layer', 'Mission Feed', 'MISSION READY', 'Telemetry Overlay'],
    ['UI Layer', 'Mission Feed', 'MISSION READY', 'Telemetry Overlay']
  );
  assertMapOrderAndKeyBehavior(
    '1713',
    () => new FinalReferenceGameScene(),
    ['UI Layer', 'Mission Feed', 'MISSION READY', 'Final Reference Runtime'],
    ['UI Layer', 'Mission Feed', 'MISSION READY', 'Final Reference Runtime']
  );
}
