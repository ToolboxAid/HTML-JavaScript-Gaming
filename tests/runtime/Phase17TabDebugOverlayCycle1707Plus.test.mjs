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
import {
  getOverlayCycleInputCodes,
  LEVEL17_OVERLAY_CYCLE_KEY,
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

function pressCycleKey(scene, { reverse = false } = {}) {
  const keys = getOverlayCycleInputCodes({ reverse });
  scene.step3DPhysics(0.02, { input: makeInput(keys) });
  scene.step3DPhysics(0.02, { input: makeInput([]) });
}

function holdCycleKey(scene, { reverse = false, frames = 4 } = {}) {
  const keys = getOverlayCycleInputCodes({ reverse });
  for (let i = 0; i < Math.max(1, frames); i += 1) {
    scene.step3DPhysics(0.01, { input: makeInput(keys) });
  }
  scene.step3DPhysics(0.01, { input: makeInput([]) });
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
  resetTabDebugOverlayPersistenceForTests();
  const scene = sceneFactory();
  if (typeof scene.setCamera3D === 'function') {
    scene.setCamera3D(createCameraStub());
  }

  assert.equal(scene.tabDebugOverlays?.cycleKey, LEVEL17_OVERLAY_CYCLE_KEY, `${label} should use shared overlay cycle key.`);
  const labels = scene.tabDebugOverlays.overlays.map((entry) => entry.label);
  assert.deepEqual(labels, expectedLabels, `${label} should use exact required overlay map ordering.`);

  if (scene.tabDebugOverlays.overlays.length > 1) {
    const count = scene.tabDebugOverlays.overlays.length;
    const beforeHoldForward = scene.tabDebugOverlays.activeIndex;
    holdCycleKey(scene);
    assert.equal(
      scene.tabDebugOverlays.activeIndex,
      (beforeHoldForward + 1) % count,
      `${label} should cycle exactly once while cycle key is held across rapid frames.`
    );

    const beforeHoldReverse = scene.tabDebugOverlays.activeIndex;
    holdCycleKey(scene, { reverse: true });
    assert.equal(
      scene.tabDebugOverlays.activeIndex,
      (beforeHoldReverse - 1 + count) % count,
      `${label} should cycle exactly once in reverse while reverse cycle key is held across rapid frames.`
    );
  }

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

  const persistedIndex = scene.tabDebugOverlays.activeIndex;
  const reloadedScene = sceneFactory();
  if (typeof reloadedScene.setCamera3D === 'function') {
    reloadedScene.setCamera3D(createCameraStub());
  }
  assert.equal(
    reloadedScene.tabDebugOverlays.activeIndex,
    persistedIndex,
    `${label} should restore persisted overlay index on sample load.`
  );
}

export function run() {
  resetTabDebugOverlayPersistenceForTests();
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
