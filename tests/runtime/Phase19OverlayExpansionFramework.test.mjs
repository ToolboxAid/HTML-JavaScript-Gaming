/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase19OverlayExpansionFramework.test.mjs
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVEL17_OVERLAY_CYCLE_KEY } from '../../samples/phase-17/shared/overlayCycleInput.js';
import {
  isOverlayRuntimeCycleModifierActive,
  isOverlayRuntimeToggleModifierActive,
  LEVEL19_OVERLAY_RUNTIME_CYCLE_MODIFIERS,
  LEVEL19_OVERLAY_RUNTIME_TOGGLE_MODIFIERS,
} from '../../samples/phase-17/shared/overlayCycleInput.js';
import {
  applyOverlayGameplayRuntimePreset,
  exportOverlayGameplayRuntimeProfile,
  exportOverlayGameplayRuntimeSharePackage,
  enqueueOverlayGameplayRuntimeSyncEvent,
  getOverlayGameplayRuntimeDefaultPresets,
  getOverlayGameplayRuntimePresetLibrary,
  getOverlayGameplayRuntimeCompositionSnapshot,
  getOverlayGameplayRuntimeInteractionSnapshot,
  importOverlayGameplayRuntimeProfile,
  importOverlayGameplayRuntimeSharePackage,
  saveOverlayGameplayRuntimePreferences,
  renderOverlayGameplayRuntime,
  resolveOverlayGameplayRuntimeInputAction,
  setOverlayGameplayRuntimeAdaptiveUiRules,
  setOverlayGameplayRuntimeContextInputMap,
  setOverlayGameplayRuntimeKeybindProfile,
  setOverlayGameplayRuntimePresetLibrary,
  setOverlayGameplayRuntimeVisible,
  stepOverlayGameplayRuntimeGestures,
  stepOverlayGameplayRuntimePointerInteractions,
  stepOverlayGameplayRuntimeControls,
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

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function makeInput(keys = []) {
  const down = new Set(keys);
  return {
    isDown(code) {
      return down.has(code);
    },
  };
}

function assertOverlayRuntimeSliceUsesSharedFiniteNumberHelper() {
  const runtimeSource = readFileSync(
    new URL('../../samples/phase-17/shared/overlayGameplayRuntime.js', import.meta.url),
    'utf8'
  );
  const importSpecifiers = Array.from(
    runtimeSource.matchAll(/^\s*import\s+[\s\S]*?\sfrom\s+['"]([^'"]+)['"]\s*;?\s*$/gm),
    (match) => String(match[1] || '').trim()
  );
  assert.equal(
    runtimeSource.includes("import { asFiniteNumber } from '/src/shared/number/index.js';"),
    true,
    'Overlay runtime slice should import finite-number normalization from shared number helpers.'
  );
  assert.equal(
    runtimeSource.includes("import { cloneJsonData, safeJsonParse, safeJsonStringify } from '/src/shared/io/index.js';"),
    true,
    'Overlay runtime slice should import shared JSON IO helpers instead of local JSON clone/parse/stringify logic.'
  );
  assert.equal(
    runtimeSource.includes('function normalizePointerNumber('),
    false,
    'Overlay runtime slice should not keep a local duplicate pointer-number normalization helper.'
  );
  assert.equal(
    runtimeSource.includes('function cloneJsonCompatibleValue('),
    false,
    'Overlay runtime slice should not keep a local duplicate JSON-clone helper.'
  );
  assert.equal(
    importSpecifiers.some((specifier) => specifier.startsWith('/src/engine/')),
    false,
    'Overlay runtime slice boundary hardening should avoid direct engine-layer imports.'
  );
  assert.equal(
    importSpecifiers.some((specifier) => specifier.startsWith('../') || specifier.startsWith('./')),
    false,
    'Overlay runtime slice boundary hardening should use root-layer imports and avoid relative cross-layer traversal.'
  );
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
  assert.equal(gameplayState.overlayRuntimeState.syncMode, 'cached', 'No-event sync should use cached state and avoid fallback re-apply.');

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

function assertOverlayEventCoalescingEfficiency() {
  const framework = createPhase19OverlayExpansionFramework();
  framework.registerExtension(definePhase19OverlayExtension({
    id: 'phase19-overlay-event-coalesce',
    overlays: [
      { id: 'runtime-a', label: 'Runtime A' },
      { id: 'runtime-b', label: 'Runtime B' },
    ],
    initialOverlayId: 'runtime-a',
    runtimeExtensions: [
      { overlayId: 'runtime-a', onRender() {} },
      { overlayId: 'runtime-b', onRender() {} },
    ],
  }));

  const runtime = framework.createRuntimeForExtension('phase19-overlay-event-coalesce');
  const gameplayState = { overlayRuntimeState: {} };
  enqueueOverlayGameplayRuntimeSyncEvent(gameplayState, { visible: true, interactionIndex: 0, activeOverlayId: 'runtime-a' });
  enqueueOverlayGameplayRuntimeSyncEvent(gameplayState, { visible: false });
  enqueueOverlayGameplayRuntimeSyncEvent(gameplayState, { visible: true, interactionIndex: 999, activeOverlayId: 'runtime-b' });

  const interaction = getOverlayGameplayRuntimeInteractionSnapshot(runtime, { gameplayState });
  assert.equal(interaction.activeOverlayId, 'runtime-b', 'Coalesced event processing should keep the final overlay selection.');
  assert.equal(interaction.visible, true, 'Coalesced event processing should keep the final visibility state.');
  assert.equal(gameplayState.overlayRuntimeState.eventsProcessed, 3, 'Event efficiency path should consume all queued events in one synchronization pass.');
  assert.equal(gameplayState.overlayRuntimeState.desyncCorrected, true, 'Event coalescing should preserve desync correction behavior.');
  assert.equal(gameplayState.overlayRuntimeEvents.length, 0, 'Event queue should be drained after synchronization.');
}

function assertAdvancedOverlayPointerInteractionsGameplaySafety() {
  const framework = createPhase19OverlayExpansionFramework();
  framework.registerExtension(definePhase19OverlayExtension({
    id: 'phase19-overlay-pointer-interactions',
    overlays: [
      { id: 'runtime', label: 'Runtime' },
    ],
    initialOverlayId: 'runtime',
    runtimeExtensions: [
      { overlayId: 'runtime', onRender() {} },
    ],
  }));

  const runtime = framework.createRuntimeForExtension('phase19-overlay-pointer-interactions');
  const renderer = createRendererProbe(960, 540);
  const context = {
    renderer,
    activeOverlayId: 'runtime',
  };

  const before = getOverlayGameplayRuntimeCompositionSnapshot(runtime, context);
  assert.equal(before.length, 1, 'Pointer interaction setup should produce a runtime panel snapshot.');
  const startSlot = before[0].slot;

  const unsafePress = stepOverlayGameplayRuntimePointerInteractions(runtime, {
    x: startSlot.x + 12,
    y: startSlot.y + 12,
    down: true,
    pressed: true,
    modifiers: { alt: false, shift: false },
  }, {
    enablePointerInteractions: true,
    renderer,
    activeOverlayId: 'runtime',
  });
  assert.equal(unsafePress.consumed, false, 'Pointer interactions should not consume gameplay input without explicit safety modifier.');

  stepOverlayGameplayRuntimePointerInteractions(runtime, {
    x: startSlot.x + 72,
    y: startSlot.y + 68,
    down: true,
    modifiers: { alt: false, shift: false },
  }, {
    enablePointerInteractions: true,
    renderer,
    activeOverlayId: 'runtime',
  });
  stepOverlayGameplayRuntimePointerInteractions(runtime, {
    x: startSlot.x + 72,
    y: startSlot.y + 68,
    down: false,
    released: true,
    modifiers: { alt: false, shift: false },
  }, {
    enablePointerInteractions: true,
    renderer,
    activeOverlayId: 'runtime',
  });

  const afterUnsafe = getOverlayGameplayRuntimeCompositionSnapshot(runtime, context);
  assert.equal(afterUnsafe[0].slot.x, startSlot.x, 'Unsafe pointer drag should not move panel and should preserve gameplay safety.');
  assert.equal(afterUnsafe[0].slot.y, startSlot.y, 'Unsafe pointer drag should not move panel and should preserve gameplay safety.');

  const safePress = stepOverlayGameplayRuntimePointerInteractions(runtime, {
    x: startSlot.x + 12,
    y: startSlot.y + 12,
    down: true,
    pressed: true,
    modifiers: { alt: true, shift: true },
  }, {
    enablePointerInteractions: true,
    renderer,
    activeOverlayId: 'runtime',
  });
  assert.equal(safePress.consumed, true, 'Explicit pointer interaction mode should consume drag input for overlay manipulation.');
  assert.equal(safePress.activeMode, 'drag', 'Pressing panel body should start drag mode.');

  const safeDrag = stepOverlayGameplayRuntimePointerInteractions(runtime, {
    x: startSlot.x + 72,
    y: startSlot.y + 68,
    down: true,
    modifiers: { alt: true, shift: true },
  }, {
    enablePointerInteractions: true,
    renderer,
    activeOverlayId: 'runtime',
  });
  assert.equal(safeDrag.changed, true, 'Safe drag should apply layout override changes.');
  stepOverlayGameplayRuntimePointerInteractions(runtime, {
    x: startSlot.x + 72,
    y: startSlot.y + 68,
    down: false,
    released: true,
    modifiers: { alt: true, shift: true },
  }, {
    enablePointerInteractions: true,
    renderer,
    activeOverlayId: 'runtime',
  });

  const afterDrag = getOverlayGameplayRuntimeCompositionSnapshot(runtime, context);
  assert.equal(afterDrag[0].slot.anchor, 'custom', 'Safe drag should persist custom overlay placement.');
  assert.equal(afterDrag[0].slot.x > startSlot.x, true, 'Safe drag should move panel horizontally.');
  assert.equal(afterDrag[0].slot.y > startSlot.y, true, 'Safe drag should move panel vertically.');

  const dragSlot = afterDrag[0].slot;
  const resizePress = stepOverlayGameplayRuntimePointerInteractions(runtime, {
    x: dragSlot.x + dragSlot.width - 4,
    y: dragSlot.y + dragSlot.height - 4,
    down: true,
    pressed: true,
    modifiers: { alt: true, shift: true },
  }, {
    enablePointerInteractions: true,
    renderer,
    activeOverlayId: 'runtime',
  });
  assert.equal(resizePress.activeMode, 'resize', 'Pressing resize handle should start resize mode.');

  const resizeDrag = stepOverlayGameplayRuntimePointerInteractions(runtime, {
    x: dragSlot.x + dragSlot.width + 40,
    y: dragSlot.y + dragSlot.height + 30,
    down: true,
    modifiers: { alt: true, shift: true },
  }, {
    enablePointerInteractions: true,
    renderer,
    activeOverlayId: 'runtime',
  });
  assert.equal(resizeDrag.changed, true, 'Resize drag should apply panel-size override changes.');
  stepOverlayGameplayRuntimePointerInteractions(runtime, {
    x: dragSlot.x + dragSlot.width + 40,
    y: dragSlot.y + dragSlot.height + 30,
    down: false,
    released: true,
    modifiers: { alt: true, shift: true },
  }, {
    enablePointerInteractions: true,
    renderer,
    activeOverlayId: 'runtime',
  });

  const afterResize = getOverlayGameplayRuntimeCompositionSnapshot(runtime, context);
  assert.equal(afterResize[0].slot.width > dragSlot.width, true, 'Resize mode should increase panel width with pointer drag.');
  assert.equal(afterResize[0].slot.height > dragSlot.height, true, 'Resize mode should increase panel height with pointer drag.');
}

function assertOverlayGestureAbstractionAndCompatibility() {
  const framework = createPhase19OverlayExpansionFramework();
  framework.registerExtension(definePhase19OverlayExtension({
    id: 'phase19-overlay-gestures',
    overlays: [
      { id: 'runtime-a', label: 'Runtime A' },
      { id: 'runtime-b', label: 'Runtime B' },
      { id: 'runtime-c', label: 'Runtime C' },
    ],
    initialOverlayId: 'runtime-a',
    runtimeExtensions: [
      { overlayId: 'runtime-a', onRender() {} },
      { overlayId: 'runtime-b', onRender() {} },
      { overlayId: 'runtime-c', onRender() {} },
    ],
  }));

  const runtime = framework.createRuntimeForExtension('phase19-overlay-gestures');
  const unsafeTap = stepOverlayGameplayRuntimeGestures(runtime, {
    x: 220,
    y: 180,
    down: true,
    pressed: true,
    modifiers: { alt: false, shift: false },
  }, {
    enableGestures: true,
  });
  assert.equal(unsafeTap.consumed, false, 'Gesture actions should require explicit modifier so gameplay remains primary.');
  stepOverlayGameplayRuntimeGestures(runtime, {
    x: 220,
    y: 180,
    down: false,
    released: true,
    modifiers: { alt: false, shift: false },
  }, {
    enableGestures: true,
  });
  assert.equal(runtime.interactionIndex, 0, 'Gesture interaction should not mutate runtime state without explicit safety modifier.');

  stepOverlayGameplayRuntimeGestures(runtime, {
    x: 240,
    y: 180,
    down: true,
    pressed: true,
    modifiers: { alt: true, shift: true },
  }, {
    enableGestures: true,
    dtSeconds: 0.02,
  });
  const tapRelease = stepOverlayGameplayRuntimeGestures(runtime, {
    x: 246,
    y: 182,
    down: false,
    released: true,
    modifiers: { alt: true, shift: true },
  }, {
    enableGestures: true,
    dtSeconds: 0.02,
  });
  assert.equal(tapRelease.gesture, 'tap', 'Tap gesture should be recognized in gesture abstraction.');
  assert.equal(tapRelease.action, 'cycle-next', 'Tap should map to overlay cycle-next action.');
  assert.equal(runtime.interactionIndex, 1, 'Tap gesture should cycle to the next overlay.');

  stepOverlayGameplayRuntimeGestures(runtime, {
    x: 260,
    y: 200,
    down: true,
    pressed: true,
    modifiers: { alt: true, shift: true },
  }, {
    enableGestures: true,
    dtSeconds: 0.02,
  });
  stepOverlayGameplayRuntimeGestures(runtime, {
    x: 340,
    y: 202,
    down: true,
    modifiers: { alt: true, shift: true },
  }, {
    enableGestures: true,
    dtSeconds: 0.02,
  });
  const swipeRelease = stepOverlayGameplayRuntimeGestures(runtime, {
    x: 340,
    y: 202,
    down: false,
    released: true,
    modifiers: { alt: true, shift: true },
  }, {
    enableGestures: true,
    dtSeconds: 0.02,
  });
  assert.equal(swipeRelease.gesture, 'swipe', 'Swipe gesture should be recognized in gesture abstraction.');
  assert.equal(swipeRelease.action, 'cycle-next', 'Rightward swipe should map to overlay cycle-next action.');
  assert.equal(swipeRelease.direction, 'right', 'Swipe direction should be reported for overlay action mapping.');
  assert.equal(runtime.interactionIndex, 2, 'Swipe gesture should cycle overlays using mapped action.');

  stepOverlayGameplayRuntimeGestures(runtime, {
    x: 300,
    y: 220,
    down: true,
    pressed: true,
    modifiers: { alt: true, shift: true },
  }, {
    enableGestures: true,
    dtSeconds: 0.02,
  });
  stepOverlayGameplayRuntimeGestures(runtime, {
    x: 302,
    y: 220,
    down: true,
    modifiers: { alt: true, shift: true },
  }, {
    enableGestures: true,
    dtSeconds: 0.2,
  });
  const holdTick = stepOverlayGameplayRuntimeGestures(runtime, {
    x: 302,
    y: 220,
    down: true,
    modifiers: { alt: true, shift: true },
  }, {
    enableGestures: true,
    dtSeconds: 0.2,
  });
  assert.equal(holdTick.gesture, 'hold', 'Hold gesture should be recognized in gesture abstraction.');
  assert.equal(holdTick.action, 'toggle-visibility', 'Hold should map to overlay visibility toggle action.');
  assert.equal(runtime.interactionVisible, false, 'Hold gesture should toggle overlay visibility without keyboard input changes.');
  stepOverlayGameplayRuntimeGestures(runtime, {
    x: 302,
    y: 220,
    down: false,
    released: true,
    modifiers: { alt: true, shift: true },
  }, {
    enableGestures: true,
    dtSeconds: 0.02,
  });

  assert.equal(isOverlayRuntimeToggleModifierActive(makeInput([LEVEL19_OVERLAY_RUNTIME_TOGGLE_MODIFIERS[0]])), true, 'Keyboard toggle modifier helper should remain compatible after gesture support.');
  assert.equal(isOverlayRuntimeCycleModifierActive(makeInput([LEVEL19_OVERLAY_RUNTIME_CYCLE_MODIFIERS[0]])), true, 'Keyboard cycle modifier helper should remain compatible after gesture support.');

  const toggledByKeyboard = stepOverlayGameplayRuntimeControls(runtime, makeInput([
    LEVEL17_OVERLAY_CYCLE_KEY,
    LEVEL19_OVERLAY_RUNTIME_TOGGLE_MODIFIERS[0],
  ]), { dtSeconds: 0.05 });
  assert.equal(toggledByKeyboard, true, 'Keyboard runtime toggle should remain functional after gesture abstraction changes.');
  assert.equal(runtime.interactionVisible, true, 'Keyboard toggle should restore overlay visibility after hold gesture.');
}

function assertContextualInputMappingUsesOverlayContextAndStack() {
  const framework = createPhase19OverlayExpansionFramework();
  framework.registerExtension(definePhase19OverlayExtension({
    id: 'phase19-overlay-contextual-input-mapping',
    overlays: [
      { id: 'runtime-a', label: 'Runtime A' },
      { id: 'runtime-b', label: 'Runtime B' },
      { id: 'runtime-c', label: 'Runtime C' },
    ],
    initialOverlayId: 'runtime-a',
    runtimeExtensions: [
      { overlayId: 'runtime-a', layerOrder: 10, visualPriority: 10, onRender() {} },
      { overlayId: 'runtime-b', layerOrder: 20, visualPriority: 20, onRender() {} },
      { overlayId: 'runtime-c', layerOrder: 30, visualPriority: 30, onRender() {} },
    ],
  }));

  const runtime = framework.createRuntimeForExtension('phase19-overlay-contextual-input-mapping');
  setOverlayGameplayRuntimeContextInputMap(runtime, {
    byOverlayId: {
      'runtime-b': {
        'cycle-next': 'toggle-visibility',
      },
    },
    byLayerOrder: {
      '30': {
        'toggle-visibility': 'cycle-prev',
      },
    },
    byStackPosition: {
      top: {
        'cycle-next': 'cycle-prev',
      },
    },
  });

  runtime.interactionIndex = 1;
  const overlayResolution = resolveOverlayGameplayRuntimeInputAction(runtime, 'cycle-next');
  assert.equal(overlayResolution.action, 'toggle-visibility', 'Overlay-id contextual map should remap cycle action for the active overlay.');
  assert.equal(overlayResolution.context.activeOverlayId, 'runtime-b', 'Context resolver should expose active overlay id.');
  assert.equal(overlayResolution.context.activeLayerOrder, 20, 'Context resolver should expose active overlay layer order.');
  assert.equal(overlayResolution.context.activeStackPosition, 'middle', 'Context resolver should derive stack position from active overlay layer.');
  assert.equal(overlayResolution.context.stack.length, 3, 'Context resolver should include the overlay stack for contextual mapping.');

  const cycleInput = makeInput([
    LEVEL17_OVERLAY_CYCLE_KEY,
    LEVEL19_OVERLAY_RUNTIME_TOGGLE_MODIFIERS[0],
    LEVEL19_OVERLAY_RUNTIME_CYCLE_MODIFIERS[0],
  ]);
  const remappedCycleChanged = stepOverlayGameplayRuntimeControls(runtime, cycleInput, { dtSeconds: 0.05 });
  assert.equal(remappedCycleChanged, true, 'Contextual keybind mapping should apply remapped actions.');
  assert.equal(runtime.interactionVisible, false, 'Overlay-id contextual map should remap cycle-next to visibility toggle.');
  assert.equal(runtime.interactionIndex, 1, 'Contextual toggle remap should preserve active index when action is visibility toggle.');
  stepOverlayGameplayRuntimeControls(runtime, makeInput([]), { dtSeconds: 0.05 });
  runtime.interactionVisible = true;

  runtime.interactionIndex = 2;
  const layerResolution = resolveOverlayGameplayRuntimeInputAction(runtime, 'toggle-visibility');
  assert.equal(layerResolution.action, 'cycle-prev', 'Active-layer contextual map should remap toggle action on top layer.');
  const toggleInput = makeInput([
    LEVEL17_OVERLAY_CYCLE_KEY,
    LEVEL19_OVERLAY_RUNTIME_TOGGLE_MODIFIERS[0],
  ]);
  const remappedToggleChanged = stepOverlayGameplayRuntimeControls(runtime, toggleInput, { dtSeconds: 0.05 });
  assert.equal(remappedToggleChanged, true, 'Layer contextual map should execute remapped toggle action.');
  assert.equal(runtime.interactionIndex, 1, 'Layer contextual map should execute cycle-prev from top active layer.');
  assert.equal(runtime.interactionVisible, true, 'Layer contextual cycle remap should not toggle visibility.');
  stepOverlayGameplayRuntimeControls(runtime, makeInput([]), { dtSeconds: 0.05 });

  runtime.interactionIndex = 2;
  stepOverlayGameplayRuntimeGestures(runtime, {
    x: 300,
    y: 220,
    down: true,
    pressed: true,
    modifiers: { alt: true, shift: true },
  }, {
    enableGestures: true,
    dtSeconds: 0.02,
  });
  const tapGestureResult = stepOverlayGameplayRuntimeGestures(runtime, {
    x: 305,
    y: 221,
    down: false,
    released: true,
    modifiers: { alt: true, shift: true },
  }, {
    enableGestures: true,
    dtSeconds: 0.02,
  });
  assert.equal(tapGestureResult.gesture, 'tap', 'Gesture abstraction should remain active with contextual input mapping.');
  assert.equal(tapGestureResult.action, 'cycle-prev', 'Gesture action should reuse contextual resolver instead of duplicating mapping logic.');
  assert.equal(runtime.interactionIndex, 1, 'Top-stack contextual mapping should apply to gesture-triggered cycle actions.');
}

function assertAdaptiveOverlayUiRulesReactToGameplayTelemetryAndContext() {
  const framework = createPhase19OverlayExpansionFramework();
  framework.registerExtension(definePhase19OverlayExtension({
    id: 'phase19-overlay-adaptive-ui',
    overlays: [
      { id: 'runtime', label: 'Runtime' },
    ],
    initialOverlayId: 'runtime',
    runtimeExtensions: [
      { overlayId: 'runtime', compose: true, layerOrder: 10, visualPriority: 10, panelWidth: 220, panelHeight: 96, onRender() {} },
      { overlayId: 'runtime', compose: true, layerOrder: 20, visualPriority: 20, panelWidth: 220, panelHeight: 96, onRender() {} },
      { overlayId: 'runtime', compose: true, layerOrder: 30, visualPriority: 30, panelWidth: 220, panelHeight: 96, onRender() {} },
    ],
  }));

  const runtime = framework.createRuntimeForExtension('phase19-overlay-adaptive-ui');
  runtime.interactionIndex = 2;
  setOverlayGameplayRuntimeAdaptiveUiRules(runtime, [
    {
      id: 'hide-base-when-top-active',
      priority: 10,
      when: {
        activeOverlayId: 'runtime',
        stackPosition: 'base',
      },
      apply: {
        visible: false,
      },
    },
    {
      id: 'degrade-size-emphasis-under-low-fps',
      priority: 20,
      when: {
        gameplayPhase: 'combat',
        layerOrder: 20,
        telemetry: {
          fps: { max: 45 },
        },
      },
      apply: {
        sizeScale: 1.5,
        emphasis: 1.4,
      },
    },
    {
      id: 'active-top-overlay-emphasis',
      priority: 30,
      when: {
        activeOverlayId: 'runtime',
        layerOrder: 30,
        activeStackPosition: 'top',
      },
      apply: {
        panelWidth: 340,
        panelHeight: 132,
        emphasis: 1.6,
      },
    },
  ]);

  const safeZone = {
    x: 620,
    y: 410,
    width: 340,
    height: 120,
  };
  const snapshot = getOverlayGameplayRuntimeCompositionSnapshot(runtime, {
    activeOverlayId: 'runtime',
    renderer: createRendererProbe(960, 540),
    gameplayState: { phase: 'combat' },
    telemetry: { fps: 40 },
    safeZones: [safeZone],
  });

  assert.equal(snapshot.length, 2, 'Adaptive visibility rules should hide base overlay while preserving remaining composed layers.');
  const layerOrders = snapshot.map((entry) => entry.layerOrder);
  assert.equal(layerOrders.includes(10), false, 'Adaptive visibility rules should hide the base layer when top overlay is active.');

  const runtimeB = snapshot.find((entry) => entry.layerOrder === 20);
  const runtimeC = snapshot.find((entry) => entry.layerOrder === 30);
  assert.notEqual(runtimeB, undefined, 'Adaptive snapshot should retain middle overlay layer frame.');
  assert.notEqual(runtimeC, undefined, 'Adaptive snapshot should retain active top overlay layer frame.');
  assert.equal(runtimeB.slot.width > 220, true, 'Telemetry-aware adaptive size rule should enlarge runtime-b panel width.');
  assert.equal(runtimeB.slot.height > 96, true, 'Telemetry-aware adaptive size rule should enlarge runtime-b panel height.');
  assert.equal(runtimeB.readabilityOpacity > 0.84, true, 'Adaptive emphasis should increase readability opacity for non-active overlay frame.');
  assert.equal(runtimeC.slot.width, 340, 'Active overlay contextual adaptive rule should set explicit width.');
  assert.equal(runtimeC.slot.height, 132, 'Active overlay contextual adaptive rule should set explicit height.');
  assert.equal(runtimeC.adaptiveEmphasis > 1, true, 'Adaptive snapshot should expose emphasis metadata for active overlay frame.');

  assert.equal(rectsOverlap(runtimeB.slot, safeZone), false, 'Adaptive layout should continue respecting safe zones for resized overlays.');
  assert.equal(rectsOverlap(runtimeC.slot, safeZone), false, 'Adaptive layout should keep active overlay clear of safe zones.');
}

function assertOverlayPreferencesPersistenceCompatibility() {
  const framework = createPhase19OverlayExpansionFramework();
  framework.registerExtension(definePhase19OverlayExtension({
    id: 'phase19-overlay-preferences',
    overlays: [
      { id: 'runtime-a', label: 'Runtime A' },
      { id: 'runtime-b', label: 'Runtime B' },
    ],
    initialOverlayId: 'runtime-a',
    persistenceKey: 'phase19:overlay-preferences',
    runtimeExtensions: [
      { overlayId: 'runtime-a', compose: true, layerOrder: 10, visualPriority: 10, panelWidth: 220, panelHeight: 96, onRender() {} },
      { overlayId: 'runtime-b', compose: true, layerOrder: 20, visualPriority: 20, panelWidth: 220, panelHeight: 96, onRender() {} },
    ],
  }));

  const runtime = framework.createRuntimeForExtension('phase19-overlay-preferences');
  setOverlayGameplayRuntimeKeybindProfile(runtime, {
    id: 'profile-alt',
    cycleKey: 'KeyH',
    contextInputMap: {
      byOverlayId: {
        'runtime-b': {
          'cycle-next': 'toggle-visibility',
        },
      },
    },
  });
  setOverlayGameplayRuntimeVisible(runtime, false);
  runtime.interactionLayoutOverrides['id:runtime-b'] = {
    x: 54,
    y: 88,
    width: 250,
    height: 112,
  };
  assert.equal(
    saveOverlayGameplayRuntimePreferences(runtime),
    true,
    'Overlay runtime preferences should be persisted when a storage key is configured.'
  );

  const reloadedRuntime = framework.createRuntimeForExtension('phase19-overlay-preferences');
  assert.equal(reloadedRuntime.interactionVisible, false, 'Reloaded runtime should restore persisted visibility preference.');
  assert.equal(reloadedRuntime.interactionCycleKey, 'KeyH', 'Reloaded runtime should restore persisted keybind cycle key.');
  assert.equal(reloadedRuntime.interactionKeybindProfileId, 'profile-alt', 'Reloaded runtime should restore keybind profile id.');

  reloadedRuntime.interactionIndex = 1;
  const reloadedResolution = resolveOverlayGameplayRuntimeInputAction(reloadedRuntime, 'cycle-next');
  assert.equal(reloadedResolution.action, 'toggle-visibility', 'Reloaded contextual mapping should remain compatible with persisted keybind profile.');

  setOverlayGameplayRuntimeVisible(reloadedRuntime, true);
  const remappedCycleChanged = stepOverlayGameplayRuntimeControls(reloadedRuntime, makeInput([
    'KeyH',
    LEVEL19_OVERLAY_RUNTIME_TOGGLE_MODIFIERS[0],
    LEVEL19_OVERLAY_RUNTIME_CYCLE_MODIFIERS[0],
  ]), { dtSeconds: 0.05 });
  assert.equal(remappedCycleChanged, true, 'Persisted keybind profile should drive runtime controls after reload.');
  assert.equal(reloadedRuntime.interactionVisible, false, 'Persisted contextual map should still remap cycle input to visibility toggle.');
  stepOverlayGameplayRuntimeControls(reloadedRuntime, makeInput([]), { dtSeconds: 0.05 });

  setOverlayGameplayRuntimeVisible(reloadedRuntime, true);
  reloadedRuntime.interactionIndex = 0;
  setOverlayGameplayRuntimeAdaptiveUiRules(reloadedRuntime, [
    {
      id: 'compat-adaptive-after-restore',
      priority: 10,
      when: {
        gameplayPhase: 'combat',
        layerOrder: 10,
      },
      apply: {
        sizeScale: 1.25,
        emphasis: 1.3,
      },
    },
  ]);
  const layoutSnapshot = getOverlayGameplayRuntimeCompositionSnapshot(reloadedRuntime, {
    activeOverlayId: 'runtime-b',
    renderer: createRendererProbe(960, 540),
    gameplayState: { phase: 'combat' },
  });
  const runtimeBFrame = layoutSnapshot.find((entry) => entry.overlayId === 'runtime-b');
  assert.notEqual(runtimeBFrame, undefined, 'Reloaded runtime should retain composed overlay frames after preference restore.');
  assert.equal(runtimeBFrame.slot.anchor, 'custom', 'Reloaded runtime should restore persisted layout override anchor.');
  assert.equal(runtimeBFrame.slot.x, 54, 'Reloaded runtime should restore persisted layout override X position.');
  assert.equal(runtimeBFrame.slot.y, 88, 'Reloaded runtime should restore persisted layout override Y position.');
  assert.equal(runtimeBFrame.slot.width, 250, 'Reloaded runtime should restore persisted layout override width.');
  assert.equal(runtimeBFrame.slot.height, 112, 'Reloaded runtime should restore persisted layout override height.');

  const adaptiveSnapshot = getOverlayGameplayRuntimeCompositionSnapshot(reloadedRuntime, {
    activeOverlayId: 'runtime-a',
    renderer: createRendererProbe(960, 540),
    gameplayState: { phase: 'combat' },
  });
  const runtimeAFrame = adaptiveSnapshot.find((entry) => entry.overlayId === 'runtime-a');
  assert.notEqual(runtimeAFrame, undefined, 'Reloaded runtime should preserve active overlay frame after preference restore.');
  assert.equal(runtimeAFrame.slot.width > 220, true, 'Adaptive UI rules should remain compatible and apply after preference restoration.');
  assert.equal(runtimeAFrame.adaptiveEmphasis > 1, true, 'Adaptive UI emphasis should remain active after preference restoration.');
}

function assertOverlayProfileExportImportValidation() {
  const framework = createPhase19OverlayExpansionFramework();
  framework.registerExtension(definePhase19OverlayExtension({
    id: 'phase19-overlay-profile-export-import',
    overlays: [
      { id: 'runtime-a', label: 'Runtime A' },
      { id: 'runtime-b', label: 'Runtime B' },
    ],
    initialOverlayId: 'runtime-a',
    persistenceKey: 'phase19:overlay-profile-export-import',
    runtimeExtensions: [
      { overlayId: 'runtime-a', compose: true, layerOrder: 10, visualPriority: 10, panelWidth: 220, panelHeight: 96, onRender() {} },
      { overlayId: 'runtime-b', compose: true, layerOrder: 20, visualPriority: 20, panelWidth: 220, panelHeight: 96, onRender() {} },
    ],
  }));

  const sourceRuntime = framework.createRuntimeForExtension('phase19-overlay-profile-export-import');
  setOverlayGameplayRuntimeVisible(sourceRuntime, false);
  setOverlayGameplayRuntimeKeybindProfile(sourceRuntime, {
    id: 'portable-profile',
    cycleKey: 'KeyJ',
    contextInputMap: {
      byOverlayId: {
        'runtime-b': {
          'cycle-next': 'toggle-visibility',
        },
      },
    },
  });
  sourceRuntime.interactionLayoutOverrides['id:runtime-b'] = {
    x: 70,
    y: 102,
    width: 260,
    height: 118,
  };

  const exportedJson = exportOverlayGameplayRuntimeProfile(sourceRuntime);
  const exportedPayload = JSON.parse(exportedJson);
  assert.equal(exportedPayload.version, 1, 'Exported overlay profile should include schema version.');
  assert.equal(exportedPayload.visibility, false, 'Exported overlay profile should include visibility preference.');
  assert.equal(exportedPayload.keybindProfile.cycleKey, 'KeyJ', 'Exported overlay profile should include keybind cycle key.');
  assert.equal(exportedPayload.layout['id:runtime-b'].width, 260, 'Exported overlay profile should include layout override width.');

  const importedRuntime = framework.createRuntimeForExtension('phase19-overlay-profile-export-import');
  const importResult = importOverlayGameplayRuntimeProfile(importedRuntime, exportedJson);
  assert.equal(importResult.success, true, 'Overlay profile import should succeed for valid exported JSON.');
  assert.equal(importResult.errors.length, 0, 'Overlay profile import should not report errors for valid exported JSON.');
  assert.equal(importedRuntime.interactionVisible, false, 'Imported overlay profile should restore visibility preference.');
  assert.equal(importedRuntime.interactionCycleKey, 'KeyJ', 'Imported overlay profile should restore cycle key preference.');
  assert.equal(importedRuntime.interactionKeybindProfileId, 'portable-profile', 'Imported overlay profile should restore keybind profile id.');
  assert.equal(importedRuntime.interactionLayoutOverrides['id:runtime-b'].x, 70, 'Imported overlay profile should restore layout override X position.');
  assert.equal(importedRuntime.interactionLayoutOverrides['id:runtime-b'].height, 118, 'Imported overlay profile should restore layout override height.');

  importedRuntime.interactionIndex = 1;
  const contextualAction = resolveOverlayGameplayRuntimeInputAction(importedRuntime, 'cycle-next');
  assert.equal(contextualAction.action, 'toggle-visibility', 'Imported profile context mapping should remain compatible with contextual input resolver.');

  const invalidImportResult = importOverlayGameplayRuntimeProfile(importedRuntime, '{"version":1,"visibility":"yes"}');
  assert.equal(invalidImportResult.success, false, 'Overlay profile import should fail validation for invalid payload types.');
  assert.equal(invalidImportResult.errors.length > 0, true, 'Overlay profile import should report validation errors for invalid payloads.');

  const reloadedRuntime = framework.createRuntimeForExtension('phase19-overlay-profile-export-import');
  assert.equal(reloadedRuntime.interactionVisible, false, 'Imported overlay profile should persist and restore visibility on runtime load.');
  assert.equal(reloadedRuntime.interactionCycleKey, 'KeyJ', 'Imported overlay profile should persist and restore cycle key on runtime load.');
  assert.equal(reloadedRuntime.interactionLayoutOverrides['id:runtime-b'].y, 102, 'Imported overlay profile should persist and restore layout override Y position.');
}

function assertOverlayPresetLibraryApplyAndCompatibility() {
  const framework = createPhase19OverlayExpansionFramework();
  framework.registerExtension(definePhase19OverlayExtension({
    id: 'phase19-overlay-preset-library',
    overlays: [
      { id: 'runtime-a', label: 'Runtime A' },
      { id: 'runtime-b', label: 'Runtime B' },
    ],
    initialOverlayId: 'runtime-a',
    persistenceKey: 'phase19:overlay-preset-library',
    runtimeExtensions: [
      { overlayId: 'runtime-a', compose: true, layerOrder: 10, visualPriority: 10, panelWidth: 220, panelHeight: 96, onRender() {} },
      { overlayId: 'runtime-b', compose: true, layerOrder: 20, visualPriority: 20, panelWidth: 220, panelHeight: 96, onRender() {} },
    ],
  }));

  const runtime = framework.createRuntimeForExtension('phase19-overlay-preset-library');
  const defaultPresets = getOverlayGameplayRuntimeDefaultPresets();
  const defaultPresetIds = defaultPresets.map((preset) => preset.id);
  assert.equal(defaultPresetIds.includes('minimal'), true, 'Default preset library should include minimal preset.');
  assert.equal(defaultPresetIds.includes('debug'), true, 'Default preset library should include debug preset.');
  assert.equal(defaultPresetIds.includes('full-telemetry'), true, 'Default preset library should include full-telemetry preset.');
  assert.equal(defaultPresets.every((preset) => preset.profile?.version === 1), true, 'Default preset schema should normalize profile payloads to version 1.');

  const minimalApplyResult = applyOverlayGameplayRuntimePreset(runtime, 'minimal');
  assert.equal(minimalApplyResult.success, true, 'Applying default minimal preset should succeed.');
  assert.equal(minimalApplyResult.presetId, 'minimal', 'Preset apply result should return the applied preset id.');
  assert.equal(runtime.interactionVisible, false, 'Minimal preset should apply visibility preference to runtime profile.');
  assert.equal(runtime.interactionKeybindProfileId, 'preset-minimal', 'Minimal preset should apply keybind profile id.');

  const telemetryApplyResult = applyOverlayGameplayRuntimePreset(runtime, 'full-telemetry');
  assert.equal(telemetryApplyResult.success, true, 'Applying default full-telemetry preset should succeed.');
  assert.equal(runtime.interactionVisible, true, 'Full-telemetry preset should re-enable visibility preference.');
  assert.equal(runtime.interactionKeybindProfileId, 'preset-full-telemetry', 'Full-telemetry preset should apply profile id.');
  assert.equal(
    runtime.interactionContextInputMap?.byStackPosition?.top?.['cycle-next'],
    'cycle-prev',
    'Full-telemetry preset should apply contextual input mapping profile data.'
  );

  setOverlayGameplayRuntimePresetLibrary(runtime, [
    {
      id: 'studio-profile',
      label: 'Studio Profile',
      description: 'Custom profile for focused debugging.',
      profile: {
        visibility: true,
        keybindProfile: {
          id: 'studio-profile',
          cycleKey: 'KeyY',
        },
      },
    },
  ]);
  const combinedPresetLibrary = getOverlayGameplayRuntimePresetLibrary(runtime);
  assert.equal(
    combinedPresetLibrary.some((preset) => preset.id === 'studio-profile'),
    true,
    'Preset library should merge custom presets with defaults.'
  );

  const customApplyResult = applyOverlayGameplayRuntimePreset(runtime, 'studio-profile');
  assert.equal(customApplyResult.success, true, 'Applying custom preset should succeed.');
  assert.equal(runtime.interactionCycleKey, 'KeyY', 'Custom preset should apply keybind cycle key to runtime profile.');
  assert.equal(runtime.interactionKeybindProfileId, 'studio-profile', 'Custom preset should apply keybind profile id.');

  const exportedJson = exportOverlayGameplayRuntimeProfile(runtime);
  const importedRuntime = framework.createRuntimeForExtension('phase19-overlay-preset-library');
  const importResult = importOverlayGameplayRuntimeProfile(importedRuntime, exportedJson);
  assert.equal(importResult.success, true, 'Preset-applied profiles should remain compatible with export/import JSON flow.');
  assert.equal(importedRuntime.interactionCycleKey, 'KeyY', 'Imported profile should preserve cycle key applied by preset.');

  const reloadedRuntime = framework.createRuntimeForExtension('phase19-overlay-preset-library');
  assert.equal(reloadedRuntime.interactionCycleKey, 'KeyY', 'Preset application should remain compatible with persistence restore.');
  assert.equal(reloadedRuntime.interactionKeybindProfileId, 'studio-profile', 'Persisted runtime should restore keybind profile applied via preset.');
}

function assertOverlaySharePackageExportImportCompatibility() {
  const framework = createPhase19OverlayExpansionFramework();
  framework.registerExtension(definePhase19OverlayExtension({
    id: 'phase19-overlay-share-package',
    overlays: [
      { id: 'runtime-a', label: 'Runtime A' },
      { id: 'runtime-b', label: 'Runtime B' },
    ],
    initialOverlayId: 'runtime-a',
    persistenceKey: 'phase19:overlay-share-package',
    runtimeExtensions: [
      { overlayId: 'runtime-a', compose: true, layerOrder: 10, visualPriority: 10, panelWidth: 220, panelHeight: 96, onRender() {} },
      { overlayId: 'runtime-b', compose: true, layerOrder: 20, visualPriority: 20, panelWidth: 220, panelHeight: 96, onRender() {} },
    ],
  }));

  const sourceRuntime = framework.createRuntimeForExtension('phase19-overlay-share-package');
  setOverlayGameplayRuntimePresetLibrary(sourceRuntime, [
    {
      id: 'team-share',
      label: 'Team Share',
      description: 'Shared profile package preset.',
      profile: {
        visibility: false,
        keybindProfile: {
          id: 'team-share',
          cycleKey: 'KeyV',
        },
      },
    },
  ]);
  setOverlayGameplayRuntimeVisible(sourceRuntime, false);
  setOverlayGameplayRuntimeKeybindProfile(sourceRuntime, {
    id: 'portable-share',
    cycleKey: 'KeyV',
  });
  sourceRuntime.interactionLayoutOverrides['id:runtime-b'] = {
    x: 44,
    y: 122,
    width: 244,
    height: 130,
  };

  const sharePackageJson = exportOverlayGameplayRuntimeSharePackage(sourceRuntime, {
    presetOrId: 'team-share',
  });
  const sharePackagePayload = JSON.parse(sharePackageJson);
  assert.equal(sharePackagePayload.format, 'overlay-runtime-share-package', 'Share package export should include expected package format.');
  assert.equal(sharePackagePayload.packageVersion, 1, 'Share package export should include current package version.');
  assert.equal(sharePackagePayload.compatibility.profileSchemaVersion, 1, 'Share package export should include profile schema compatibility marker.');
  assert.equal(sharePackagePayload.presetId, 'team-share', 'Share package export should include selected preset id.');
  assert.equal(sharePackagePayload.profile.layout['id:runtime-b'].height, 130, 'Share package export should include profile layout overrides.');
  assert.equal(sharePackagePayload.preset.profile.keybindProfile.cycleKey, 'KeyV', 'Share package export should include preset payload when selected.');

  const importedRuntime = framework.createRuntimeForExtension('phase19-overlay-share-package');
  const importResult = importOverlayGameplayRuntimeSharePackage(importedRuntime, sharePackageJson);
  assert.equal(importResult.success, true, 'Share package import should succeed for valid package payload.');
  assert.equal(importResult.presetId, 'team-share', 'Share package import should report resolved preset id.');
  assert.equal(importResult.presetRegistered, true, 'Share package import should register included preset into runtime preset library.');
  assert.equal(importedRuntime.interactionVisible, false, 'Share package import should apply visibility preference.');
  assert.equal(importedRuntime.interactionCycleKey, 'KeyV', 'Share package import should apply keybind cycle key.');
  assert.equal(importedRuntime.interactionLayoutOverrides['id:runtime-b'].x, 44, 'Share package import should apply layout override X position.');
  assert.equal(importedRuntime.interactionLayoutOverrides['id:runtime-b'].width, 244, 'Share package import should apply layout override width.');
  assert.equal(
    getOverlayGameplayRuntimePresetLibrary(importedRuntime).some((preset) => preset.id === 'team-share'),
    true,
    'Share package import should keep included preset compatible with preset library APIs.'
  );

  const unsupportedVersionPayload = {
    ...sharePackagePayload,
    packageVersion: 99,
  };
  const unsupportedVersionResult = importOverlayGameplayRuntimeSharePackage(importedRuntime, JSON.stringify(unsupportedVersionPayload));
  assert.equal(unsupportedVersionResult.success, false, 'Share package import should fail compatibility checks for unsupported package versions.');
  assert.equal(
    unsupportedVersionResult.errors.some((error) => error.includes('not supported')),
    true,
    'Share package import should report unsupported package version errors.'
  );

  const missingPresetPayload = {
    format: 'overlay-runtime-share-package',
    packageVersion: 1,
    profile: {
      visibility: true,
    },
    presetId: 'missing-shared-preset',
  };
  const missingPresetResult = importOverlayGameplayRuntimeSharePackage(importedRuntime, JSON.stringify(missingPresetPayload));
  assert.equal(missingPresetResult.success, false, 'Share package import should fail when required preset compatibility cannot be resolved.');
  assert.equal(
    missingPresetResult.errors.some((error) => error.includes('missing-shared-preset')),
    true,
    'Share package import should report missing required preset compatibility errors.'
  );

  const reloadedRuntime = framework.createRuntimeForExtension('phase19-overlay-share-package');
  assert.equal(reloadedRuntime.interactionCycleKey, 'KeyV', 'Share package import should remain compatible with persisted profile restoration.');
  assert.equal(reloadedRuntime.interactionLayoutOverrides['id:runtime-b'].y, 122, 'Persisted share-package profile should restore layout overrides on reload.');
}

export function run() {
  assertOverlayRuntimeSliceUsesSharedFiniteNumberHelper();
  assertExpansionRegistrationAndCompatibility();
  assertExtensionLifecycleMutations();
  assertDynamicPanelSizingCapability();
  assertContextAwareOverlayBehavior();
  assertOverlayStateSynchronizationAndDesyncRecovery();
  assertOverlayEventCoalescingEfficiency();
  assertAdvancedOverlayPointerInteractionsGameplaySafety();
  assertOverlayGestureAbstractionAndCompatibility();
  assertContextualInputMappingUsesOverlayContextAndStack();
  assertAdaptiveOverlayUiRulesReactToGameplayTelemetryAndContext();
  assertOverlayPreferencesPersistenceCompatibility();
  assertOverlayProfileExportImportValidation();
  assertOverlayPresetLibraryApplyAndCompatibility();
  assertOverlaySharePackageExportImportCompatibility();
}
