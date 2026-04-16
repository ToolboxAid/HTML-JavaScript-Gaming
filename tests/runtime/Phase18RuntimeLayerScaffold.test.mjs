/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase18RuntimeLayerScaffold.test.mjs
*/
import assert from 'node:assert/strict';
import createPhase18CoreServices from '../../samples/phase-18/shared/coreServices/createPhase18CoreServices.js';
import createPhase18RuntimeLayer from '../../samples/phase-18/shared/runtimeLayer/createPhase18RuntimeLayer.js';

function assertRuntimeTransitionsAndHooks() {
  const coreServices = createPhase18CoreServices();
  const runtimeLayer = createPhase18RuntimeLayer({ coreServices });

  const beforeTicks = [];
  const afterTicks = [];
  const transitions = [];

  const offBefore = runtimeLayer.onBeforeUpdate((payload) => beforeTicks.push(payload.tick));
  const offAfter = runtimeLayer.onAfterUpdate((payload) => afterTicks.push(payload.tick));
  const offState = runtimeLayer.onStateChange(({ previous, next }) => transitions.push(`${previous}->${next}`));

  assert.equal(runtimeLayer.getState(), runtimeLayer.states.IDLE);
  assert.equal(runtimeLayer.start({ source: 'test' }), true);
  runtimeLayer.update(0.25, { source: 'test' });
  runtimeLayer.update(0.25, { source: 'test' });
  assert.equal(runtimeLayer.stop({ source: 'test' }), true);

  assert.deepEqual(beforeTicks, [1, 2], 'Before-update hooks should run once per runtime tick.');
  assert.deepEqual(afterTicks, [1, 2], 'After-update hooks should run once per runtime tick.');
  assert.deepEqual(transitions, ['idle->running', 'running->stopped'], 'Runtime should emit expected state transitions.');
  assert.equal(coreServices.getLifecycleState().running, false, 'Stopping runtime should stop core services.');

  offBefore();
  offAfter();
  offState();
}

function assertRuntimeServiceIntegration() {
  const coreServices = createPhase18CoreServices();
  const runtimeLayer = createPhase18RuntimeLayer({ coreServices });
  const channel = runtimeLayer.getService('phase18.channel');
  assert.notEqual(channel, null, 'Runtime should expose registered channel service.');

  const stateEvents = [];
  const off = channel.subscribe('phase18.runtime.state', (payload) => {
    stateEvents.push(`${payload.previous}->${payload.next}`);
  });

  runtimeLayer.start({});
  runtimeLayer.update(0.5, {});
  runtimeLayer.stop({});

  assert.deepEqual(stateEvents, ['idle->running', 'running->stopped'], 'Runtime state events should publish through channel service.');
  assert.equal((channel.getSnapshot()?.publishedCount ?? 0) >= 3, true, 'Channel should publish runtime and heartbeat events while running.');
  off();
}

export function run() {
  assertRuntimeTransitionsAndHooks();
  assertRuntimeServiceIntegration();
}
