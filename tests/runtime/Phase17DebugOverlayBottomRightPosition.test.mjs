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
import MovementModelsLab1709Scene from '../../samples/phase-17/1709/MovementModelsLabScene.js';
import RealGameplayMiniGame1710Scene from '../../samples/phase-17/1710/RealGameplayMiniGameScene.js';
import MovementModelsLab1711Scene from '../../samples/phase-17/1711/MovementModelsLabScene.js';
import GameplayMetricsTelemetryScene from '../../samples/phase-17/1712/GameplayMetricsTelemetryScene.js';
import FinalReferenceGameScene from '../../samples/phase-17/1713/FinalReferenceGameScene.js';
import { getOverlayCycleInputCodes } from '../../samples/phase-17/shared/overlayCycleInput.js';

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
  scene.step3DPhysics(0.02, { input: makeInput(getOverlayCycleInputCodes()) });
  scene.step3DPhysics(0.02, { input: makeInput([]) });
}

function createRendererProbe(width = 960, height = 540) {
  let canvasWidth = width;
  let canvasHeight = height;
  const texts = [];
  return {
    texts,
    getCanvasSize() {
      return { width: canvasWidth, height: canvasHeight };
    },
    setCanvasSize(nextWidth, nextHeight) {
      canvasWidth = Math.max(1, Number(nextWidth) || canvasWidth);
      canvasHeight = Math.max(1, Number(nextHeight) || canvasHeight);
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
  renderer.setCanvasSize(1280, 720);
  const resized = getNextBottomRightDebugPanelRect(stack, 300, 170);
  assert.deepEqual(first, { x: 650, y: 360, width: 300, height: 170 });
  assert.deepEqual(second, { x: 650, y: 230, width: 300, height: 120 });
  assert.deepEqual(resized, { x: 970, y: 230, width: 300, height: 170 });
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

  pressCycleKey(scene);
  pressCycleKey(scene);
  pressCycleKey(scene);
  const runtimeRenderer = createRendererProbe();
  scene.render(runtimeRenderer);
  const runtimeTitle = findExactText(runtimeRenderer, 'Mini-Game Runtime');
  assertBottomRightFromTitle(runtimeTitle, 300, 120, 650, 410, 'Sample 1708 runtime overlay');
}

function assertSample1710CyclePlacement() {
  const scene = new RealGameplayMiniGame1710Scene();
  scene.setCamera3D(createCameraStub());

  const renderer = createRendererProbe();
  scene.render(renderer);
  const uiLayerTitle = findExactText(renderer, 'UI Layer');
  assertBottomRightFromTitle(uiLayerTitle, 326, 174, 624, 356, 'Sample 1710 UI Layer overlay');

  pressCycleKey(scene);
  pressCycleKey(scene);
  pressCycleKey(scene);
  const runtimeRenderer = createRendererProbe();
  scene.render(runtimeRenderer);
  const runtimeTitle = findExactText(runtimeRenderer, 'Mini-Game Runtime');
  assertBottomRightFromTitle(runtimeTitle, 300, 120, 650, 410, 'Sample 1710 runtime overlay');
}

function assertSample1709MovementOverlayPlacement() {
  const scene = new MovementModelsLab1709Scene();
  scene.setCamera3D(createCameraStub());

  const runtimeRenderer = createRendererProbe();
  scene.render(runtimeRenderer);
  const runtimeTitle = findExactText(runtimeRenderer, 'Movement Runtime');
  assertBottomRightFromTitle(runtimeTitle, 360, 212, 590, 318, 'Sample 1709 movement runtime overlay');

  pressCycleKey(scene);
  const hudRenderer = createRendererProbe();
  scene.render(hudRenderer);
  const hudTitle = findExactText(hudRenderer, 'Movement Lab HUD');
  assertBottomRightFromTitle(hudTitle, 360, 138, 590, 392, 'Sample 1709 movement hud overlay');
}

function assertSample1711MovementOverlayPlacement() {
  const scene = new MovementModelsLab1711Scene();
  scene.setCamera3D(createCameraStub());

  const runtimeRenderer = createRendererProbe();
  scene.render(runtimeRenderer);
  const runtimeTitle = findExactText(runtimeRenderer, 'Movement Runtime');
  assertBottomRightFromTitle(runtimeTitle, 360, 212, 590, 318, 'Sample 1711 movement runtime overlay');

  pressCycleKey(scene);
  const hudRenderer = createRendererProbe();
  scene.render(hudRenderer);
  const hudTitle = findExactText(hudRenderer, 'Movement Lab HUD');
  assertBottomRightFromTitle(hudTitle, 360, 138, 590, 392, 'Sample 1711 movement hud overlay');
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

function assertSample1713FinalRuntimePlacement() {
  const scene = new FinalReferenceGameScene();
  scene.setCamera3D(createCameraStub());
  pressCycleKey(scene);
  pressCycleKey(scene);
  pressCycleKey(scene);
  const renderer = createRendererProbe();
  scene.render(renderer);
  const runtimeTitle = findExactText(renderer, 'Final Reference Runtime');
  assertBottomRightFromTitle(runtimeTitle, 228, 248, 722, 282, 'Sample 1713 final runtime overlay');
}

function assertNoFlickerDuringSampleSwitching() {
  const scenes = [
    [new RealGameplayMiniGameScene(), 'UI Layer'],
    [new MovementModelsLab1709Scene(), 'Movement Runtime'],
    [new RealGameplayMiniGame1710Scene(), 'UI Layer'],
    [new MovementModelsLab1711Scene(), 'Movement Runtime'],
    [new GameplayMetricsTelemetryScene(), 'UI Layer'],
    [new FinalReferenceGameScene(), 'UI Layer'],
  ];
  const overlayTitles = [
    'UI Layer',
    'Mission Feed',
    'MISSION READY',
    'Mini-Game Runtime',
    'Movement Runtime',
    'Movement Lab HUD',
    'Telemetry Overlay',
    'Final Reference Runtime',
  ];
  const sharedCamera = createCameraStub();
  for (let i = 0; i < scenes.length; i += 1) {
    const [scene, expectedTitle] = scenes[i];
    scene.setCamera3D?.(sharedCamera);
    for (let pass = 0; pass < 2; pass += 1) {
      const renderer = createRendererProbe();
      scene.render(renderer);
      const visibleOverlays = overlayTitles.filter((title) => Boolean(findExactText(renderer, title)));
      assert.equal(visibleOverlays.length, 1, `Sample switch pass ${i + 1}.${pass + 1} should render exactly one active overlay panel title.`);
      assert.equal(visibleOverlays[0], expectedTitle, `Sample switch pass ${i + 1}.${pass + 1} should render expected default overlay without flicker.`);
    }
  }
}

export function run() {
  assertSharedStackMath();
  assertSample1701RuntimePanelPlacement();
  assertSample1704StackedPanelPlacement();
  assertSample1708CyclePlacement();
  assertSample1709MovementOverlayPlacement();
  assertSample1710CyclePlacement();
  assertSample1711MovementOverlayPlacement();
  assertSample1712TelemetryPlacement();
  assertSample1713FinalRuntimePlacement();
  assertNoFlickerDuringSampleSwitching();
}
