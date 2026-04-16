/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase19RuntimeLayerScaffold.test.mjs
*/
import assert from 'node:assert/strict';
import createPhase19CoreServices from '../../samples/phase-19/shared/coreServices/createPhase19CoreServices.js';
import createPhase19RuntimeLayer from '../../samples/phase-19/shared/runtimeLayer/createPhase19RuntimeLayer.js';
import createPhase19IntegrationFlow from '../../samples/phase-19/shared/integration/createPhase19IntegrationFlow.js';
import Phase19FoundationScene from '../../samples/phase-19/1901/Phase19FoundationScene.js';

function createRendererProbe(width = 960, height = 540) {
  const texts = [];
  return {
    texts,
    getCanvasSize() {
      return { width, height };
    },
    clear() {},
    drawRect() {},
    strokeRect() {},
    drawText(text) {
      texts.push(String(text));
    },
    drawLine() {},
    drawCircle() {},
    drawPolygon() {},
    drawImageFrame() {},
  };
}

function assertRuntimeTransitionsAndHooks() {
  const coreServices = createPhase19CoreServices();
  const runtimeLayer = createPhase19RuntimeLayer({ coreServices });

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
  const coreServices = createPhase19CoreServices();
  const runtimeLayer = createPhase19RuntimeLayer({ coreServices });
  const channel = runtimeLayer.getService('phase19.channel');
  assert.notEqual(channel, null, 'Runtime should expose registered channel service.');

  const stateEvents = [];
  const off = channel.subscribe('phase19.runtime.state', (payload) => {
    stateEvents.push(`${payload.previous}->${payload.next}`);
  });

  runtimeLayer.start({});
  runtimeLayer.update(0.5, {});
  runtimeLayer.stop({});

  assert.deepEqual(stateEvents, ['idle->running', 'running->stopped'], 'Runtime state events should publish through channel service.');
  assert.equal((channel.getSnapshot()?.publishedCount ?? 0) >= 3, true, 'Channel should publish runtime and heartbeat events while running.');
  off();
}

function assertSampleRuntimeWiring() {
  const phase19Flow = createPhase19IntegrationFlow();
  const scene = new Phase19FoundationScene({ phase19Flow });

  scene.enter({});
  scene.update(0.55);
  scene.update(0.55);

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(
    renderer.texts.some((text) => text.includes('Runtime:')),
    true,
    'Phase 19 foundation scene should surface runtime status from integration flow.'
  );

  scene.exit();
  assert.equal(phase19Flow.getCoreServices().getLifecycleState().running, false, 'Scene exit should stop runtime/core services.');
}

export function run() {
  assertRuntimeTransitionsAndHooks();
  assertRuntimeServiceIntegration();
  assertSampleRuntimeWiring();
}
