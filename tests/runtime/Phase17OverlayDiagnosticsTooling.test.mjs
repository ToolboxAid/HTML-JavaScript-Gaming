/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase17OverlayDiagnosticsTooling.test.mjs
*/
import assert from 'node:assert/strict';
import { LEVEL17_OVERLAY_CYCLE_KEY } from '../../samples/phase-17/shared/overlayCycleInput.js';
import {
  createTabDebugOverlayController,
  isTabDebugOverlayDiagnosticsEnabled,
  resetTabDebugOverlayPersistenceForTests,
  setTabDebugOverlayCycleKey,
  setTabDebugOverlayDiagnosticsEnabled,
  setTabDebugOverlayMap,
  stepTabDebugOverlayController,
} from '../../samples/phase-17/shared/tabDebugOverlayCycle.js';

function makeInput(keys = []) {
  const down = new Set(keys);
  return {
    isDown(code) {
      return down.has(code);
    },
  };
}

function assertDiagnosticsAreOptionalAndNonBlocking() {
  const controller = createTabDebugOverlayController({
    overlays: [
      { id: 'ui-layer', label: 'UI Layer' },
      { id: 'mission-feed', label: 'Mission Feed' },
    ],
    initialOverlayId: 'ui-layer',
  });
  setTabDebugOverlayCycleKey(controller, LEVEL17_OVERLAY_CYCLE_KEY);

  const calls = [];
  const originalConsoleDebug = console.debug;
  console.debug = (...args) => {
    calls.push(args);
  };

  try {
    setTabDebugOverlayDiagnosticsEnabled(false);
    assert.equal(isTabDebugOverlayDiagnosticsEnabled(), false, 'Diagnostics should default to disabled state.');

    stepTabDebugOverlayController(controller, makeInput([LEVEL17_OVERLAY_CYCLE_KEY]));
    stepTabDebugOverlayController(controller, makeInput([]));
    assert.equal(controller.activeIndex, 1, 'Overlay cycling behavior should work when diagnostics are disabled.');
    assert.equal(calls.length, 0, 'No diagnostics logs should emit when diagnostics are disabled.');

    setTabDebugOverlayDiagnosticsEnabled(true);
    assert.equal(isTabDebugOverlayDiagnosticsEnabled(), true, 'Diagnostics toggle should enable logging.');

    setTabDebugOverlayMap(controller, {
      overlays: [
        { id: 'ui-layer', label: 'UI Layer' },
        { id: 'mission-feed', label: 'Mission Feed' },
      ],
      initialOverlayId: 'ui-layer',
    });
    stepTabDebugOverlayController(controller, makeInput([LEVEL17_OVERLAY_CYCLE_KEY]));

    assert.equal(calls.length >= 2, true, 'Diagnostics should log stack state when enabled.');
    const [firstMessage, firstPayload] = calls[0];
    assert.equal(String(firstMessage).includes('[overlay-diagnostics]'), true, 'Diagnostics prefix should be emitted.');
    assert.equal(typeof firstPayload.activeIndex, 'number', 'Diagnostics payload should include activeIndex.');
    assert.equal(Array.isArray(firstPayload.stack), true, 'Diagnostics payload should include stack state.');
    assert.equal(firstPayload.stack.length, 2, 'Diagnostics payload should include all overlay entries.');
  } finally {
    console.debug = originalConsoleDebug;
    setTabDebugOverlayDiagnosticsEnabled(false);
  }
}

export function run() {
  resetTabDebugOverlayPersistenceForTests();
  setTabDebugOverlayDiagnosticsEnabled(false);
  assertDiagnosticsAreOptionalAndNonBlocking();
}
