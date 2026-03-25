/*
Toolbox Aid
David Quesenberry
03/25/2026
AttractModeController.test.mjs
*/
import assert from 'node:assert/strict';
import { AttractModeController } from '../../engine/scenes/index.js';

function testIdleEnterAndPhaseCycle() {
  const phases = [];
  const controller = new AttractModeController({
    idleTimeoutMs: 100,
    phaseDurationMs: 60,
    isInputActive: () => false,
    onPhaseChange: (phase) => phases.push(phase),
  });

  controller.update(0.05);
  assert.equal(controller.active, false);
  controller.update(0.05);
  assert.equal(controller.active, true);
  assert.equal(controller.phase, 'title');

  controller.update(0.06);
  assert.equal(controller.phase, 'highScores');
  controller.update(0.06);
  assert.equal(controller.phase, 'demo');
  controller.update(0.06);
  assert.equal(controller.phase, 'title');
  assert.deepEqual(phases, ['title', 'highScores', 'demo', 'title']);
}

function testDemoHooksAndInputExit() {
  let inputActive = false;
  const calls = [];
  const controller = new AttractModeController({
    idleTimeoutMs: 10,
    phaseDurationMs: 30,
    isInputActive: () => inputActive,
    onEnterAttract: () => calls.push('enterAttract'),
    onExitAttract: () => calls.push('exitAttract'),
    onEnterDemo: () => calls.push('enterDemo'),
    onExitDemo: () => calls.push('exitDemo'),
  });

  controller.update(0.02);
  controller.update(0.03);
  controller.update(0.03);
  assert.equal(controller.phase, 'demo');
  assert.equal(calls.includes('enterDemo'), true);

  inputActive = true;
  controller.update(0.016);
  assert.equal(controller.active, false);
  assert.equal(controller.phase, 'title');
  assert.equal(calls.slice(-2).join(','), 'exitDemo,exitAttract');
}

function testSnapshotContract() {
  const controller = new AttractModeController({
    idleTimeoutMs: 1,
    phaseDurationMs: 100,
    isInputActive: () => false,
  });

  const before = controller.getSnapshot();
  assert.equal(before.active, false);
  assert.equal(before.phase, 'title');
  assert.equal(typeof before.idleMs, 'number');

  controller.update(0.01);
  const after = controller.getSnapshot();
  assert.equal(after.active, true);
  assert.equal(after.phase, 'title');
}

export function run() {
  testIdleEnterAndPhaseCycle();
  testDemoHooksAndInputExit();
  testSnapshotContract();
}
