/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase18CoreServicesSkeleton.test.mjs
*/
import assert from 'node:assert/strict';
import createPhase18CoreServices from '../../samples/phase-18/shared/coreServices/createPhase18CoreServices.js';
import Phase18FoundationScene from '../../samples/phase-18/1801/Phase18FoundationScene.js';

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
  const services = createPhase18CoreServices();
  assert.deepEqual(
    services.listServiceIds(),
    ['phase18.channel', 'phase18.heartbeat'],
    'Phase 18 core services should register expected baseline service ids.'
  );

  const channel = services.get('phase18.channel');
  assert.notEqual(channel, null, 'Phase 18 channel service should be available.');

  const beats = [];
  const unsubscribe = channel.subscribe('phase18.heartbeat', (payload) => {
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

function assertPhase18SampleWiring() {
  const services = createPhase18CoreServices();
  const scene = new Phase18FoundationScene({ coreServices: services });

  scene.enter({});
  scene.update(0.55);
  scene.update(0.55);

  const renderer = createRendererProbe();
  scene.render(renderer);
  assert.equal(
    renderer.texts.some((text) => text.includes('Heartbeat tick:')),
    true,
    'Phase 18 foundation scene should surface heartbeat status from core services.'
  );

  scene.exit();
  assert.equal(services.getLifecycleState().running, false, 'Scene exit should stop core services.');
}

export function run() {
  assertCoreServiceLifecycleAndCommunication();
  assertPhase18SampleWiring();
}
