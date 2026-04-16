/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase17OverlayInputEdgeCases.test.mjs
*/
import assert from 'node:assert/strict';
import {
  getOverlayRuntimeCycleInputCodes,
  getOverlayRuntimeToggleInputCodes,
} from '../../samples/phase-17/shared/overlayCycleInput.js';
import {
  createOverlayGameplayRuntime,
  getOverlayGameplayRuntimeInteractionSnapshot,
  stepOverlayGameplayRuntimeControls,
} from '../../samples/phase-17/shared/overlayGameplayRuntime.js';

function makeInput(keys = []) {
  const down = new Set(keys);
  return {
    isDown(code) {
      return down.has(code);
    },
  };
}

function stepControls(runtime, keys = [], dtSeconds = 0.02) {
  return stepOverlayGameplayRuntimeControls(runtime, makeInput(keys), { dtSeconds });
}

function assertInputFloodAndStuckStateHandling() {
  const runtime = createOverlayGameplayRuntime({
    runtimeExtensions: [
      { onStep() {} },
      { onStep() {} },
      { onStep() {} },
    ],
  });

  const runtimeCycleKeys = getOverlayRuntimeCycleInputCodes();
  const runtimeToggleKeys = getOverlayRuntimeToggleInputCodes();

  const firstCycle = stepControls(runtime, runtimeCycleKeys, 0.02);
  assert.equal(firstCycle, true, 'First explicit runtime cycle action should trigger.');
  assert.equal(runtime.interactionIndex, 1, 'First runtime cycle action should advance index once.');

  stepControls(runtime, [], 0.005);
  const immediateCycleAfterAction = stepControls(runtime, runtimeCycleKeys, 0.005);
  assert.equal(immediateCycleAfterAction, false, 'Cooldown should prevent immediate re-trigger after action jitter.');

  for (let i = 0; i < 40; i += 1) {
    const cycled = stepControls(runtime, runtimeCycleKeys, 0.01);
    assert.equal(cycled, false, 'Held runtime cycle input should not flood repeated actions.');
  }
  assert.equal(runtime.interactionIndex, 1, 'Held runtime cycle input should keep index stable.');

  stepControls(runtime, [], 0.02);
  const cycleAfterRelease = stepControls(runtime, runtimeCycleKeys, 0.02);
  assert.equal(cycleAfterRelease, true, 'Cycle should resume after release once cooldown has elapsed.');
  assert.equal(runtime.interactionIndex, 2, 'Cycle after release should advance index once.');

  stepControls(runtime, [], 0.05);
  const firstToggle = stepControls(runtime, runtimeToggleKeys, 0.02);
  assert.equal(firstToggle, true, 'First explicit runtime toggle should trigger.');
  assert.equal(runtime.interactionVisible, false, 'First runtime toggle should hide overlay runtime.');

  let repeatedToggleCount = 0;
  for (let i = 0; i < 120; i += 1) {
    if (stepControls(runtime, runtimeToggleKeys, 0.02)) {
      repeatedToggleCount += 1;
    }
  }
  assert.equal(repeatedToggleCount, 0, 'Held toggle input should not repeatedly fire and flood actions.');
  assert.equal(runtime.interactionVisible, false, 'Held toggle input should keep visibility stable.');

  const snapshotBeforeRelease = getOverlayGameplayRuntimeInteractionSnapshot(runtime);
  assert.equal(snapshotBeforeRelease.suppressUntilRelease, true, 'Long held explicit input should enter suppress-until-release mode.');

  stepControls(runtime, [], 0.02);
  const toggleAfterRelease = stepControls(runtime, runtimeToggleKeys, 0.02);
  assert.equal(toggleAfterRelease, true, 'Released stuck input should recover and allow next explicit action.');
  assert.equal(runtime.interactionVisible, true, 'Recovered toggle action should restore visibility.');
}

export function run() {
  assertInputFloodAndStuckStateHandling();
}
