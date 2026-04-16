/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase19OverlayExpansionFramework.test.mjs
*/
import assert from 'node:assert/strict';
import { LEVEL17_OVERLAY_CYCLE_KEY } from '../../samples/phase-17/shared/overlayCycleInput.js';
import {
  renderOverlayGameplayRuntime,
  stepOverlayGameplayRuntime,
} from '../../samples/phase-17/shared/overlayGameplayRuntime.js';
import createPhase19OverlayExpansionFramework, {
  definePhase19OverlayExtension,
} from '../../samples/phase-19/shared/overlay/createPhase19OverlayExpansionFramework.js';

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

function assertExpansionRegistrationAndCompatibility() {
  const counters = { step: 0, render: 0 };
  const framework = createPhase19OverlayExpansionFramework();
  const extension = framework.registerExtension(definePhase19OverlayExtension({
    id: 'phase19-overlay-example',
    overlays: [
      { id: 'hud', label: 'HUD' },
      { id: 'runtime', label: 'Runtime Diagnostics' },
    ],
    initialOverlayId: 'hud',
    persistenceKey: 'phase19:example:overlay-index',
    runtimeExtensions: [
      {
        overlayId: 'runtime',
        compose: true,
        layerOrder: 10,
        panelWidth: 220,
        panelHeight: 88,
        onStep() {
          counters.step += 1;
        },
        onRender() {
          counters.render += 1;
        },
      },
    ],
    metadata: {
      source: 'runtime-test',
    },
  }));

  assert.equal(extension.channel, 'gameplay', 'Phase 19 overlay extension should default to gameplay channel.');
  assert.equal(extension.cycleKey, LEVEL17_OVERLAY_CYCLE_KEY, 'Phase 19 extension should stay compatible with shared cycle key.');
  assert.equal(extension.metadata.phase, '19', 'Phase 19 extension metadata should include phase identifier.');
  assert.deepEqual(framework.listExtensionIds(), ['phase19-overlay-example'], 'Extension registration should expose exact extension id.');

  const controllerConfig = framework.getControllerConfig('phase19-overlay-example');
  assert.notEqual(controllerConfig, null, 'Controller config should resolve for registered extension.');
  assert.equal(controllerConfig.initialOverlayId, 'hud', 'Controller config should preserve initial overlay id.');
  assert.deepEqual(
    controllerConfig.overlays.map((entry) => entry.id),
    ['hud', 'runtime'],
    'Controller config should expose expected overlay map.'
  );

  const runtime = framework.createRuntimeForExtension('phase19-overlay-example');
  assert.notEqual(runtime, null, 'Runtime should be creatable from registered overlay extension.');
  assert.equal(runtime.interactionCycleKey, LEVEL17_OVERLAY_CYCLE_KEY, 'Runtime cycle key should remain shared-key compatible.');
  assert.equal(
    stepOverlayGameplayRuntime(runtime, { activeOverlayId: 'runtime' }),
    1,
    'Runtime should execute registered step extension hook.'
  );
  assert.equal(
    renderOverlayGameplayRuntime(runtime, {
      activeOverlayId: 'runtime',
      renderer: createRendererProbe(),
    }),
    1,
    'Runtime should execute registered render extension hook.'
  );
  assert.equal(counters.step, 1, 'Runtime step hook should update test counter.');
  assert.equal(counters.render, 1, 'Runtime render hook should update test counter.');
}

function assertExtensionLifecycleMutations() {
  const framework = createPhase19OverlayExpansionFramework({
    extensions: [
      definePhase19OverlayExtension({
        id: 'phase19-overlay-seed',
        overlays: [{ id: 'seed', label: 'Seed' }],
      }),
    ],
  });

  assert.equal(framework.listExtensions().length, 1, 'Seed extension should be registered from constructor input.');
  assert.equal(framework.unregisterExtension('phase19-overlay-seed'), true, 'Registered extension should be removable.');
  assert.equal(framework.unregisterExtension('phase19-overlay-seed'), false, 'Removing missing extension should return false.');
  assert.equal(framework.getControllerConfig('phase19-overlay-seed'), null, 'Removed extension should no longer resolve controller config.');
  assert.equal(framework.createRuntimeForExtension('phase19-overlay-seed'), null, 'Removed extension should no longer create runtime.');
}

export function run() {
  assertExpansionRegistrationAndCompatibility();
  assertExtensionLifecycleMutations();
}
