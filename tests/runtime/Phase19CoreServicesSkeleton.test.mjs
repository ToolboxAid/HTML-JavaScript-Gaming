/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase19CoreServicesSkeleton.test.mjs
*/
import assert from 'node:assert/strict';
import createPhase19CoreServices from '../../samples/phase-19/shared/coreServices/createPhase19CoreServices.js';
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

function assertCoreServiceLifecycleAndCommunication() {
  const services = createPhase19CoreServices();
  assert.deepEqual(
    services.listServiceIds(),
    ['phase19.channel', 'phase19.heartbeat'],
    'Phase 19 core services should register expected baseline service ids.'
  );

  const channel = services.get('phase19.channel');
  assert.notEqual(channel, null, 'Phase 19 channel service should be available.');

  const beats = [];
  const unsubscribe = channel.subscribe('phase19.heartbeat', (payload) => {
    beats.push(Number(payload?.tick) || 0);
  });

  assert.equal(services.start({}), true, 'Core services should start once.');
  services.update(0.5, {});
  services.update(0.5, {});
  assert.equal(beats.length >= 2, true, 'Heartbeat service should publish periodic beats.');
  assert.equal((channel.getSnapshot()?.publishedCount ?? 0) >= 2, true, 'Channel service should report published heartbeat messages.');

  unsubscribe();
  assert.equal(services.stop({}), true, 'Core services should stop cleanly.');
  assert.equal(services.getLifecycleState().running, false, 'Core services should not remain running after stop.');
}

function assertPhase19SampleWiring() {
  const phase19Flow = createPhase19IntegrationFlow();
  const scene = new Phase19FoundationScene({ phase19Flow });

  scene.enter({});
  scene.update(0.55);
  scene.update(0.55);

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(
    renderer.texts.some((text) => text.includes('Heartbeat tick:')),
    true,
    'Phase 19 foundation scene should surface heartbeat status from core services.'
  );

  scene.exit();
  assert.equal(
    phase19Flow.getCoreServices().getLifecycleState().running,
    false,
    'Scene exit should stop core services through integration flow.'
  );
}

export function run() {
  assertCoreServiceLifecycleAndCommunication();
  assertPhase19SampleWiring();
}
