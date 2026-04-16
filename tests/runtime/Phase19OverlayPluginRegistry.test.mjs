/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase19OverlayPluginRegistry.test.mjs
*/
import assert from 'node:assert/strict';
import { LEVEL17_OVERLAY_CYCLE_KEY } from '../../samples/phase-17/shared/overlayCycleInput.js';
import {
  renderOverlayGameplayRuntime,
  stepOverlayGameplayRuntime,
} from '../../samples/phase-17/shared/overlayGameplayRuntime.js';
import { definePhase19OverlayExtension } from '../../samples/phase-19/shared/overlay/createPhase19OverlayExpansionFramework.js';
import createPhase19OverlayPluginRegistry from '../../samples/phase-19/shared/overlay/createPhase19OverlayPluginRegistry.js';

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

function assertPluginRegistrationAndRuntimeCompatibility() {
  const counters = { step: 0, render: 0 };
  const registry = createPhase19OverlayPluginRegistry();
  const result = registry.registerPlugin({
    id: 'phase19.runtime.plugin',
    version: '1.0.0',
    metadata: { owner: 'runtime-test' },
    createOverlayExtension() {
      return definePhase19OverlayExtension({
        id: 'phase19.runtime.plugin.overlay',
        overlays: [
          { id: 'ui-layer', label: 'UI Layer' },
          { id: 'plugin-runtime', label: 'Plugin Runtime' },
        ],
        initialOverlayId: 'ui-layer',
        persistenceKey: 'phase19:plugin:overlay-index',
        cycleKey: LEVEL17_OVERLAY_CYCLE_KEY,
        runtimeExtensions: [
          {
            overlayId: 'plugin-runtime',
            onStep() {
              counters.step += 1;
            },
            onRender() {
              counters.render += 1;
            },
          },
        ],
      });
    },
  });

  assert.deepEqual(
    result,
    { pluginId: 'phase19.runtime.plugin', extensionId: 'phase19.runtime.plugin.overlay' },
    'Plugin registry should return plugin id and resolved extension id.'
  );
  assert.equal(
    registry.getPluginState('phase19.runtime.plugin'),
    registry.states.ACTIVE,
    'Plugin registry should auto-activate plugin during registration by default.'
  );
  assert.equal(registry.listPlugins().length, 1, 'Plugin registry should track one registered plugin.');
  assert.equal(
    registry.getPluginExtensionId('phase19.runtime.plugin'),
    'phase19.runtime.plugin.overlay',
    'Plugin registry should expose extension id mapping.'
  );

  const framework = registry.getFramework();
  assert.deepEqual(
    framework.listExtensionIds(),
    ['phase19.runtime.plugin.overlay'],
    'Expansion framework should receive plugin overlay extension registration.'
  );

  const runtime = framework.createRuntimeForExtension('phase19.runtime.plugin.overlay');
  assert.notEqual(runtime, null, 'Registered plugin extension should create overlay runtime.');
  assert.equal(runtime.interactionCycleKey, LEVEL17_OVERLAY_CYCLE_KEY, 'Plugin runtime should preserve shared non-Tab cycle key.');
  assert.equal(
    stepOverlayGameplayRuntime(runtime, { activeOverlayId: 'plugin-runtime' }),
    1,
    'Plugin runtime extension should execute step hook through existing overlay runtime.'
  );
  assert.equal(
    renderOverlayGameplayRuntime(runtime, {
      activeOverlayId: 'plugin-runtime',
      renderer: createRendererProbe(),
    }),
    1,
    'Plugin runtime extension should execute render hook through existing overlay runtime.'
  );
  assert.equal(counters.step, 1, 'Plugin runtime step hook should run exactly once.');
  assert.equal(counters.render, 1, 'Plugin runtime render hook should run exactly once.');
}

function assertPluginUnregisterCleansFramework() {
  const registry = createPhase19OverlayPluginRegistry();
  registry.registerPlugin({
    id: 'phase19.cleanup.plugin',
    extension: definePhase19OverlayExtension({
      id: 'phase19.cleanup.overlay',
      overlays: [{ id: 'ui-layer', label: 'UI Layer' }],
    }),
  });

  assert.equal(registry.unregisterPlugin('phase19.cleanup.plugin'), true, 'Registered plugin should be removable.');
  assert.equal(registry.unregisterPlugin('phase19.cleanup.plugin'), false, 'Repeated unregister should return false.');
  assert.equal(registry.getFramework().getExtension('phase19.cleanup.overlay'), null, 'Plugin removal should remove extension from framework.');
}

function assertPluginLifecycleTransitionsAndSafety() {
  const calls = [];
  const registry = createPhase19OverlayPluginRegistry();
  const pluginId = 'phase19.lifecycle.plugin';
  registry.registerPlugin({
    id: pluginId,
    createOverlayExtension() {
      return definePhase19OverlayExtension({
        id: 'phase19.lifecycle.overlay',
        overlays: [{ id: 'runtime', label: 'Runtime' }],
        initialOverlayId: 'runtime',
      });
    },
    init() {
      calls.push('init');
    },
    activate() {
      calls.push('activate');
    },
    deactivate() {
      calls.push('deactivate');
    },
    destroy() {
      calls.push('destroy');
    },
  }, { autoActivate: false });

  assert.equal(registry.getPluginState(pluginId), registry.states.REGISTERED, 'Auto-activate disabled should keep plugin in registered state.');
  assert.equal(registry.deactivatePlugin(pluginId), false, 'Deactivate should reject invalid transition from registered state.');
  assert.equal(registry.activatePlugin(pluginId), true, 'Activate should run init+activate lifecycle transitions from registered state.');
  assert.equal(registry.getPluginState(pluginId), registry.states.ACTIVE, 'Plugin should transition to active state.');
  assert.equal(registry.activatePlugin(pluginId), false, 'Repeated activate should be a safe no-op.');
  assert.equal(registry.deactivatePlugin(pluginId), true, 'Active plugin should support deactivation.');
  assert.equal(registry.getPluginState(pluginId), registry.states.INACTIVE, 'Plugin should transition to inactive state after deactivation.');
  assert.equal(registry.deactivatePlugin(pluginId), false, 'Repeated deactivate should be a safe no-op.');
  assert.equal(registry.destroyPlugin(pluginId), true, 'Inactive plugin should support destruction transition.');
  assert.equal(registry.destroyPlugin(pluginId), false, 'Repeated destroy should be a safe no-op.');
  assert.equal(registry.getPlugin(pluginId), null, 'Destroyed plugin should be removed from registry.');
  assert.equal(
    registry.getFramework().getExtension('phase19.lifecycle.overlay'),
    null,
    'Destroy transition should remove plugin extension from expansion framework.'
  );
  assert.deepEqual(calls, ['init', 'activate', 'deactivate', 'destroy'], 'Lifecycle hooks should run in deterministic transition order.');
}

function assertPluginLifecycleFailureIsolation() {
  const registry = createPhase19OverlayPluginRegistry();
  const pluginId = 'phase19.failure.plugin';
  registry.registerPlugin({
    id: pluginId,
    createOverlayExtension() {
      return definePhase19OverlayExtension({
        id: 'phase19.failure.overlay',
        overlays: [{ id: 'runtime', label: 'Runtime' }],
      });
    },
    deactivate() {
      throw new Error('deactivate failure');
    },
  });

  assert.equal(registry.getPluginState(pluginId), registry.states.ACTIVE, 'Plugin should start in active state for failure isolation test.');
  assert.equal(registry.deactivatePlugin(pluginId), false, 'Failed deactivate hook should preserve active state safely.');
  assert.equal(registry.getPluginState(pluginId), registry.states.ACTIVE, 'Plugin state should remain active after failed deactivate.');
  assert.notEqual(
    registry.getFramework().getExtension('phase19.failure.overlay'),
    null,
    'Framework extension registration should remain intact after failed deactivate transition.'
  );
}

export function run() {
  assertPluginRegistrationAndRuntimeCompatibility();
  assertPluginUnregisterCleansFramework();
  assertPluginLifecycleTransitionsAndSafety();
  assertPluginLifecycleFailureIsolation();
}
