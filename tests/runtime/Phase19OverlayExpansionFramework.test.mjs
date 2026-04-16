/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase19OverlayExpansionFramework.test.mjs
*/
import assert from 'node:assert/strict';
import { LEVEL17_OVERLAY_CYCLE_KEY } from '../../samples/phase-17/shared/overlayCycleInput.js';
import {
  enqueueOverlayGameplayRuntimeSyncEvent,
  getOverlayGameplayRuntimeCompositionSnapshot,
  getOverlayGameplayRuntimeInteractionSnapshot,
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

function assertDynamicPanelSizingCapability() {
  const framework = createPhase19OverlayExpansionFramework();
  framework.registerExtension(definePhase19OverlayExtension({
    id: 'phase19-overlay-dynamic-size',
    overlays: [
      { id: 'ui', label: 'UI' },
      { id: 'runtime', label: 'Runtime' },
    ],
    initialOverlayId: 'ui',
    runtimeExtensions: [
      {
        overlayId: 'runtime',
        panelWidth: 220,
        panelHeight: 90,
        onRender() {},
        resolvePanelSize(layoutContext) {
          const canvasWidth = Number(layoutContext?.canvasSize?.width) || 0;
          const canvasHeight = Number(layoutContext?.canvasSize?.height) || 0;
          return {
            width: Math.round(canvasWidth * 0.5),
            height: Math.round(canvasHeight * 0.2),
          };
        },
      },
    ],
  }));

  const runtime = framework.createRuntimeForExtension('phase19-overlay-dynamic-size');
  const wideSnapshot = getOverlayGameplayRuntimeCompositionSnapshot(runtime, {
    activeOverlayId: 'runtime',
    renderer: createRendererProbe(1000, 600),
  });
  assert.equal(wideSnapshot.length, 1, 'Dynamic panel sizing runtime should emit a composed frame snapshot.');
  assert.equal(wideSnapshot[0].slot.width, 500, 'Dynamic sizing should scale panel width from canvas size.');
  assert.equal(wideSnapshot[0].slot.height, 120, 'Dynamic sizing should scale panel height from canvas size.');

  const compactSnapshot = getOverlayGameplayRuntimeCompositionSnapshot(runtime, {
    activeOverlayId: 'runtime',
    renderer: createRendererProbe(600, 400),
  });
  assert.equal(compactSnapshot[0].slot.width, 300, 'Dynamic sizing should recompute width for smaller canvases.');
  assert.equal(compactSnapshot[0].slot.height, 80, 'Dynamic sizing should recompute height for smaller canvases.');

  const fallbackFramework = createPhase19OverlayExpansionFramework();
  fallbackFramework.registerExtension(definePhase19OverlayExtension({
    id: 'phase19-overlay-dynamic-size-fallback',
    overlays: [{ id: 'runtime', label: 'Runtime' }],
    initialOverlayId: 'runtime',
    runtimeExtensions: [
      {
        overlayId: 'runtime',
        panelWidth: 234,
        panelHeight: 98,
        onRender() {},
        resolvePanelSize() {
          throw new Error('resolver failed');
        },
      },
    ],
  }));

  const fallbackRuntime = fallbackFramework.createRuntimeForExtension('phase19-overlay-dynamic-size-fallback');
  const fallbackSnapshot = getOverlayGameplayRuntimeCompositionSnapshot(fallbackRuntime, {
    activeOverlayId: 'runtime',
    renderer: createRendererProbe(960, 540),
  });
  assert.equal(fallbackSnapshot[0].slot.width, 234, 'Resolver failures should preserve compatibility via configured width fallback.');
  assert.equal(fallbackSnapshot[0].slot.height, 98, 'Resolver failures should preserve compatibility via configured height fallback.');
}

function assertContextAwareOverlayBehavior() {
  const framework = createPhase19OverlayExpansionFramework();
  framework.registerExtension(definePhase19OverlayExtension({
    id: 'phase19-overlay-context-aware',
    overlays: [
      { id: 'ui', label: 'UI' },
      { id: 'runtime', label: 'Runtime' },
    ],
    initialOverlayId: 'ui',
    runtimeExtensions: [
      {
        overlayId: 'runtime',
        compose: true,
        panelWidth: 220,
        panelHeight: 90,
        onRender() {},
        resolveContextBehavior(context) {
          const phase = String(context?.gameplayState?.phase || '').trim();
          if (phase !== 'combat') {
            return {
              visible: false,
            };
          }
          return {
            visible: true,
            compose: true,
            panelWidth: 312,
            panelHeight: 104,
          };
        },
      },
    ],
  }));

  const runtime = framework.createRuntimeForExtension('phase19-overlay-context-aware');
  const hiddenSnapshot = getOverlayGameplayRuntimeCompositionSnapshot(runtime, {
    activeOverlayId: 'runtime',
    renderer: createRendererProbe(960, 540),
    gameplayState: { phase: 'menu' },
  });
  assert.equal(hiddenSnapshot.length, 0, 'Context-aware runtime should hide overlay when gameplay phase is not combat.');

  const visibleSnapshot = getOverlayGameplayRuntimeCompositionSnapshot(runtime, {
    activeOverlayId: 'runtime',
    renderer: createRendererProbe(960, 540),
    scene: {
      getGameplayState() {
        return { phase: 'combat' };
      },
    },
  });
  assert.equal(visibleSnapshot.length, 1, 'Context-aware runtime should detect gameplay state from scene and show overlay.');
  assert.equal(visibleSnapshot[0].slot.width, 312, 'Context-aware runtime should adapt panel width from gameplay state behavior.');
  assert.equal(visibleSnapshot[0].slot.height, 104, 'Context-aware runtime should adapt panel height from gameplay state behavior.');
}

function assertOverlayStateSynchronizationAndDesyncRecovery() {
  const framework = createPhase19OverlayExpansionFramework();
  framework.registerExtension(definePhase19OverlayExtension({
    id: 'phase19-overlay-sync',
    overlays: [
      { id: 'ui', label: 'UI' },
      { id: 'runtime-a', label: 'Runtime A' },
      { id: 'runtime-b', label: 'Runtime B' },
    ],
    initialOverlayId: 'ui',
    runtimeExtensions: [
      { overlayId: 'runtime-a', onRender() {} },
      { overlayId: 'runtime-b', onRender() {} },
    ],
  }));

  const runtime = framework.createRuntimeForExtension('phase19-overlay-sync');
  const gameplayState = {
    overlayRuntimeState: {},
  };
  enqueueOverlayGameplayRuntimeSyncEvent(gameplayState, {
    visible: true,
    interactionIndex: 99,
    activeOverlayId: 'runtime-b',
  });

  const initialInteraction = getOverlayGameplayRuntimeInteractionSnapshot(runtime, { gameplayState });
  assert.equal(initialInteraction.index, 1, 'Sync should correct out-of-range index to the overlay requested by gameplay state.');
  assert.equal(initialInteraction.activeOverlayId, 'runtime-b', 'Sync should align active overlay id with gameplay state request.');
  assert.equal(gameplayState.overlayRuntimeState.desyncCorrected, true, 'Sync should flag corrected desync state.');
  assert.equal(gameplayState.overlayRuntimeState.count, 2, 'Sync snapshot should expose runtime extension count.');
  assert.equal(gameplayState.overlayRuntimeState.syncMode, 'events', 'Sync should process queued gameplay events in event-driven mode.');
  assert.equal(gameplayState.overlayRuntimeState.eventsProcessed, 1, 'Sync should process exactly one overlay event.');

  const idleInteraction = getOverlayGameplayRuntimeInteractionSnapshot(runtime, { gameplayState });
  assert.equal(idleInteraction.activeOverlayId, 'runtime-b', 'No-event sync should keep prior synchronized state stable.');
  assert.equal(gameplayState.overlayRuntimeState.eventsProcessed, 0, 'No queued events should avoid extra event processing.');

  const renderRuntimeB = renderOverlayGameplayRuntime(runtime, {
    activeOverlayId: 'runtime-b',
    renderer: createRendererProbe(),
    gameplayState,
  });
  assert.equal(renderRuntimeB, 1, 'Synced runtime should render requested gameplay overlay.');

  enqueueOverlayGameplayRuntimeSyncEvent(gameplayState, {
    visible: false,
    activeOverlayId: 'runtime-a',
  });
  const renderHidden = renderOverlayGameplayRuntime(runtime, {
    activeOverlayId: 'runtime-a',
    renderer: createRendererProbe(),
    gameplayState,
  });
  assert.equal(renderHidden, 0, 'Gameplay visibility sync should prevent overlay render while hidden.');
  assert.equal(gameplayState.overlayRuntimeState.syncMode, 'events', 'Render sync should remain event-driven after hide event.');

  enqueueOverlayGameplayRuntimeSyncEvent(gameplayState, {
    visible: true,
    activeOverlayId: 'runtime-a',
  });
  const renderRuntimeA = renderOverlayGameplayRuntime(runtime, {
    activeOverlayId: 'runtime-a',
    renderer: createRendererProbe(),
    gameplayState,
  });
  assert.equal(renderRuntimeA, 1, 'Gameplay sync should recover to visible overlay rendering without desync.');
}

export function run() {
  assertExpansionRegistrationAndCompatibility();
  assertExtensionLifecycleMutations();
  assertDynamicPanelSizingCapability();
  assertContextAwareOverlayBehavior();
  assertOverlayStateSynchronizationAndDesyncRecovery();
}
