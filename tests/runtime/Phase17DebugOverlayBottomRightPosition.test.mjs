/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase17DebugOverlayBottomRightPosition.test.mjs
*/
import assert from 'node:assert/strict';
import {
  createBottomRightDebugPanelStack,
  getNextBottomRightDebugPanelRect,
} from '../../src/engine/debug/index.js';
import DoomRaycastSpritesScene from '../../samples/phase-17/1701/RaycastDemoScene.js';
import TextureMaterialDemoScene from '../../samples/phase-17/1704/TextureMaterialDemoScene.js';
import RealGameplayMiniGameScene from '../../samples/phase-17/1708/RealGameplayMiniGameScene.js';
import GameplayMetricsTelemetryScene from '../../samples/phase-17/1712/GameplayMetricsTelemetryScene.js';

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

function pressCycleKey(scene) {
  scene.step3DPhysics(0.02, { input: makeInput(['KeyG']) });
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
    drawText(text, x, y) {
      texts.push({ text: String(text), x: Number(x) || 0, y: Number(y) || 0 });
    },
    drawLine() {},
    drawPolygon() {},
    drawImageFrame() {},
  };
}

function findText(renderer, token) {
  return renderer.texts.find((entry) => entry.text.includes(token));
}

function findExactText(renderer, token) {
  return renderer.texts.find((entry) => entry.text === token);
}

function assertBottomRightFromTitle(entry, width, height, expectedX, expectedY, messagePrefix) {
  assert.equal(Boolean(entry), true, `${messagePrefix} should render title text.`);
  const panelX = entry.x - 12;
  const panelY = entry.y - 24;
  assert.equal(panelX, expectedX, `${messagePrefix} should be anchored to expected right edge.`);
  assert.equal(panelY, expectedY, `${messagePrefix} should be anchored to expected bottom stack position.`);
  assert.equal(width > 0 && height > 0, true);
}

function assertSharedStackMath() {
  const renderer = createRendererProbe();
  const stack = createBottomRightDebugPanelStack(renderer, { right: 10, bottom: 10, spacing: 10 });
  const first = getNextBottomRightDebugPanelRect(stack, 300, 170);
  const second = getNextBottomRightDebugPanelRect(stack, 300, 120);
  assert.deepEqual(first, { x: 650, y: 360, width: 300, height: 170 });
  assert.deepEqual(second, { x: 650, y: 230, width: 300, height: 120 });
}

function assertSample1701RuntimePanelPlacement() {
  const scene = new DoomRaycastSpritesScene();
  const renderer = createRendererProbe();
  scene.render(renderer);
  const title = findExactText(renderer, 'DOOM Runtime');
  assertBottomRightFromTitle(title, 300, 170, 650, 360, 'Sample 1701 runtime panel');
}

function assertSample1704StackedPanelPlacement() {
  const scene = new TextureMaterialDemoScene();
  scene.setCamera3D(createCameraStub());
  const renderer = createRendererProbe();
  scene.render(renderer);

  const runtimeTitle = findExactText(renderer, 'Material Runtime');
  assertBottomRightFromTitle(runtimeTitle, 300, 188, 650, 342, 'Sample 1704 runtime panel');

  const phase16Line = findText(renderer, 'View mode:');
  assert.equal(Boolean(phase16Line), true, 'Sample 1704 phase16 overlay should render.');
  const phase16PanelX = phase16Line.x - 10;
  const phase16PanelY = phase16Line.y - 22;
  assert.equal(phase16PanelX, 530, 'Sample 1704 phase16 overlay should be stacked above runtime panel.');
  assert.equal(phase16PanelY, 212, 'Sample 1704 phase16 overlay should be stacked above runtime panel.');
}

function assertSample1708CyclePlacement() {
  const scene = new RealGameplayMiniGameScene();
  scene.setCamera3D(createCameraStub());

  const renderer = createRendererProbe();
  scene.render(renderer);
  const uiLayerTitle = findExactText(renderer, 'UI Layer');
  assertBottomRightFromTitle(uiLayerTitle, 326, 174, 624, 356, 'Sample 1708 UI Layer overlay');

  scene.step3DPhysics(0.02, { input: makeInput(['Tab']) });
  scene.step3DPhysics(0.02, { input: makeInput([]) });
  const tabRenderer = createRendererProbe();
  scene.render(tabRenderer);
  const tabUiLayerTitle = findExactText(tabRenderer, 'UI Layer');
  assertBottomRightFromTitle(tabUiLayerTitle, 326, 174, 624, 356, 'Sample 1708 should ignore Tab and keep UI Layer overlay');

  pressCycleKey(scene);
  pressCycleKey(scene);
  pressCycleKey(scene);
  const runtimeRenderer = createRendererProbe();
  scene.render(runtimeRenderer);
  const runtimeTitle = findExactText(runtimeRenderer, 'Mini-Game Runtime');
  assertBottomRightFromTitle(runtimeTitle, 300, 120, 650, 410, 'Sample 1708 runtime overlay');
}

function assertSample1712TelemetryPlacement() {
  const scene = new GameplayMetricsTelemetryScene();
  scene.setCamera3D(createCameraStub());
  pressCycleKey(scene);
  pressCycleKey(scene);
  pressCycleKey(scene);
  const renderer = createRendererProbe();
  scene.render(renderer);
  const telemetryTitle = findExactText(renderer, 'Telemetry Overlay');
  assertBottomRightFromTitle(telemetryTitle, 228, 244, 722, 286, 'Sample 1712 telemetry overlay');
}

export function run() {
  assertSharedStackMath();
  assertSample1701RuntimePanelPlacement();
  assertSample1704StackedPanelPlacement();
  assertSample1708CyclePlacement();
  assertSample1712TelemetryPlacement();
}
