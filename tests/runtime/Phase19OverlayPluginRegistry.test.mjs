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
  const accessSurface = {};
  const registry = createPhase19OverlayPluginRegistry();
  const result = registry.registerPlugin({
    id: 'phase19.runtime.plugin',
    version: '1.0.0',
    metadata: { owner: 'runtime-test' },
    createOverlayExtension(context) {
      accessSurface.registryRegisterPluginType = typeof context?.registry?.registerPlugin;
      accessSurface.registryGetPluginStateType = typeof context?.registry?.getPluginState;
      accessSurface.frameworkRegisterExtensionType = typeof context?.expansionFramework?.registerExtension;
      accessSurface.frameworkListExtensionIdsType = typeof context?.expansionFramework?.listExtensionIds;
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

  assert.equal(accessSurface.registryRegisterPluginType, 'undefined', 'Plugin creation context must not expose mutating registry methods.');
  assert.equal(accessSurface.registryGetPluginStateType, 'function', 'Plugin creation context should expose read-only registry introspection.');
  assert.equal(accessSurface.frameworkRegisterExtensionType, 'undefined', 'Plugin creation context must not expose mutating framework methods.');
  assert.equal(accessSurface.frameworkListExtensionIdsType, 'function', 'Plugin creation context should expose read-only framework introspection.');

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

  const metrics = registry.getPluginMetrics('phase19.runtime.plugin');
  assert.notEqual(metrics, null, 'Plugin metrics should be available after registration and runtime execution.');
  assert.equal(metrics.transitions.attempted >= 1, true, 'Plugin metrics should record transition attempts.');
  assert.equal(metrics.transitions.succeeded >= 1, true, 'Plugin metrics should record transition successes.');
  assert.equal(metrics.hooks.init.calls >= 1, true, 'Plugin metrics should track init hook calls even when hook is absent.');
  assert.equal(metrics.hooks.activate.calls >= 1, true, 'Plugin metrics should track activate hook calls.');
  assert.equal(metrics.hooks.activate.totalDurationMs >= 0, true, 'Plugin metrics should track hook duration data.');

  const diagnostics = registry.getPluginDiagnostics('phase19.runtime.plugin');
  assert.notEqual(diagnostics, null, 'Plugin diagnostics snapshot should be available.');
  assert.equal(diagnostics.state, registry.states.ACTIVE, 'Plugin diagnostics should expose current state.');
  assert.equal(Boolean(diagnostics.metrics), true, 'Plugin diagnostics should include metrics payload.');
  assert.equal(
    registry.listPluginDiagnostics().some((entry) => entry.pluginId === 'phase19.runtime.plugin'),
    true,
    'Plugin diagnostics listing should include registered plugin.'
  );
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
  assert.equal(registry.deactivatePlugin(pluginId), false, 'Failed deactivate hook should report transition failure.');
  assert.equal(registry.getPluginState(pluginId), registry.states.FAILED, 'Failed lifecycle transition should quarantine plugin in failed state.');
  assert.equal(
    registry.getFramework().getExtension('phase19.failure.overlay'),
    null,
    'Failed lifecycle transition should isolate plugin by removing framework extension registration.'
  );
  const failureSnapshot = registry.getPluginFailure(pluginId);
  assert.equal(Boolean(failureSnapshot), true, 'Registry should provide failure snapshot for quarantined plugin.');
  assert.equal(failureSnapshot.phase, 'deactivate', 'Failure snapshot should capture failing lifecycle phase.');
  assert.equal(
    registry.listPluginFailures().some((entry) => entry.pluginId === pluginId),
    true,
    'Failure listing should include quarantined plugin.'
  );

  assert.throws(
    () => {
      registry.registerPlugin({
        id: 'phase19.failure.activate',
        createOverlayExtension() {
          return definePhase19OverlayExtension({
            id: 'phase19.failure.activate.overlay',
            overlays: [{ id: 'runtime', label: 'Runtime' }],
          });
        },
        activate() {
          throw new Error('activation failure');
        },
      });
    },
    /failed lifecycle activation/,
    'Activation failure should throw and prevent partial plugin registration.'
  );
  assert.equal(
    registry.getPluginState('phase19.failure.activate'),
    registry.states.FAILED,
    'Activation failure should keep plugin isolated in failed state for explicit recovery.'
  );
  assert.equal(Boolean(registry.getPluginFailure('phase19.failure.activate')), true, 'Activation failure should be detectable through plugin failure snapshot.');
  assert.equal(
    registry.getFramework().getExtension('phase19.failure.activate.overlay'),
    null,
    'Failed activation should not leave extension registered in framework.'
  );
}

function assertPluginFailureRecoveryFlow() {
  const registry = createPhase19OverlayPluginRegistry();
  const pluginId = 'phase19.failure.recover';
  let firstActivate = true;
  registry.registerPlugin({
    id: pluginId,
    createOverlayExtension() {
      return definePhase19OverlayExtension({
        id: 'phase19.failure.recover.overlay',
        overlays: [{ id: 'runtime', label: 'Runtime' }],
      });
    },
    activate() {
      if (!firstActivate) {
        return;
      }
      firstActivate = false;
      throw new Error('activate once failure');
    },
  }, { autoActivate: false });

  assert.equal(registry.activatePlugin(pluginId), false, 'Initial activation should fail for recovery test.');
  assert.equal(registry.getPluginState(pluginId), registry.states.FAILED, 'Failed activation should move plugin into failed state.');
  assert.equal(Boolean(registry.getPluginFailure(pluginId)), true, 'Failed activation should capture failure snapshot.');
  assert.equal(
    registry.getPluginMetrics(pluginId).isolation.count >= 1,
    true,
    'Plugin metrics should record isolation events for failed activation.'
  );
  assert.equal(registry.recoverPlugin(pluginId), true, 'Recover should restore plugin from failed state.');
  assert.equal(registry.getPluginState(pluginId), registry.states.INITIALIZED, 'Recover should restore safe pre-failure state.');
  assert.equal(registry.getPluginFailure(pluginId), null, 'Recover should clear last failure snapshot.');
  assert.equal(registry.activatePlugin(pluginId), true, 'Recovered plugin should activate successfully after failure condition clears.');
  assert.equal(registry.getPluginState(pluginId), registry.states.ACTIVE, 'Recovered plugin should re-enter active state.');
  assert.equal(
    registry.getFramework().getExtension('phase19.failure.recover.overlay') !== null,
    true,
    'Recovered and activated plugin should re-register extension cleanly.'
  );
  assert.equal(
    registry.getPluginMetrics(pluginId).recoveries.count >= 1,
    true,
    'Plugin metrics should record successful recoveries.'
  );
  assert.equal(registry.resetPluginMetrics(pluginId), true, 'Plugin metrics reset should succeed for existing plugin.');
  assert.equal(
    registry.getPluginMetrics(pluginId).hooks.activate.calls,
    0,
    'Plugin metrics reset should clear hook counters while keeping plugin active.'
  );
}

function assertPluginBoundaryIsolationAndInterferenceProtection() {
  const registry = createPhase19OverlayPluginRegistry();
  const blockedMutations = [];
  registry.registerPlugin({
    id: 'phase19.isolation.pluginA',
    createOverlayExtension() {
      return definePhase19OverlayExtension({
        id: 'phase19.isolation.overlayA',
        overlays: [{ id: 'runtime', label: 'Runtime A' }],
      });
    },
    activate() {
      try {
        registry.registerPlugin({
          id: 'phase19.isolation.pluginB',
          extension: definePhase19OverlayExtension({
            id: 'phase19.isolation.overlayB',
            overlays: [{ id: 'runtime', label: 'Runtime B' }],
          }),
        });
      } catch (error) {
        blockedMutations.push(String(error?.message || ''));
      }
    },
  }, { autoActivate: false });

  assert.equal(registry.activatePlugin('phase19.isolation.pluginA'), true, 'Plugin activation should succeed even if hook attempts blocked mutation.');
  assert.equal(registry.getPlugin('phase19.isolation.pluginB'), null, 'Blocked mutation must prevent plugin cross-registration interference.');
  assert.equal(blockedMutations.length, 1, 'Blocked mutation attempt should be captured once.');
  assert.equal(
    blockedMutations[0].includes('mutation is not allowed'),
    true,
    'Blocked mutation should report lifecycle isolation boundary.'
  );

  registry.registerPlugin({
    id: 'phase19.isolation.owner1',
    extension: definePhase19OverlayExtension({
      id: 'phase19.shared.overlay',
      overlays: [{ id: 'runtime', label: 'Shared Runtime' }],
    }),
  });

  assert.throws(
    () => {
      registry.registerPlugin({
        id: 'phase19.isolation.owner2',
        extension: definePhase19OverlayExtension({
          id: 'phase19.shared.overlay',
          overlays: [{ id: 'runtime', label: 'Shared Runtime Duplicate' }],
        }),
      });
    },
    /already owned by another plugin/,
    'Registry should prevent extension ownership collisions between plugins.'
  );
  assert.notEqual(
    registry.getFramework().getExtension('phase19.shared.overlay'),
    null,
    'Collision rejection must keep original owner extension intact.'
  );
}

export function run() {
  assertPluginRegistrationAndRuntimeCompatibility();
  assertPluginUnregisterCleansFramework();
  assertPluginLifecycleTransitionsAndSafety();
  assertPluginLifecycleFailureIsolation();
  assertPluginFailureRecoveryFlow();
  assertPluginBoundaryIsolationAndInterferenceProtection();
}
