/*
Toolbox Aid
David Quesenberry
04/14/2026
EngineCoreBoundaryBaseline.test.mjs
*/
import assert from 'node:assert/strict';
import * as core from '../../src/engine/core/index.js';
import * as scene from '../../src/engine/scene/index.js';
import * as rendering from '../../src/engine/rendering/index.js';
import * as input from '../../src/engine/input/index.js';
import * as physics from '../../src/engine/physics/index.js';
import * as audio from '../../src/engine/audio/index.js';
import * as systems from '../../src/engine/systems/index.js';

export function run() {
  // Core boot/timing boundaries.
  assert.equal(typeof core.Engine, 'function');
  assert.equal(typeof core.FrameClock, 'function');
  assert.equal(typeof core.FixedTicker, 'function');
  assert.equal(typeof core.RuntimeMetrics, 'function');

  // Scene/render/input/physics/audio/systems public homes.
  assert.equal(typeof scene.Scene, 'function');
  assert.equal(typeof scene.SceneManager, 'function');
  assert.equal(typeof rendering.CanvasRenderer, 'function');
  assert.equal(typeof rendering.renderByLayers, 'function');
  assert.equal(typeof input.InputService, 'function');
  assert.equal(typeof input.ActionInputService, 'function');
  assert.equal(typeof physics.stepArcadeBody, 'function');
  assert.equal(typeof physics.applyDrag, 'function');
  assert.equal(typeof audio.AudioService, 'function');
  assert.equal(typeof systems.moveEntities, 'function');
  assert.equal(typeof systems.stepArcadeBody, 'function');

  // Combined service cluster contracts: timing/frame, event routing, camera.
  const frameClock = new core.FrameClock({ now: () => 100, maxDeltaMs: 100 });
  frameClock.reset(100);
  const tick = frameClock.tick(116);
  assert.equal(tick.deltaMs, 16);

  const ticker = new core.FixedTicker({ stepMs: 10, maxCatchUpSteps: 5 });
  const steps = [];
  const tickerResult = ticker.advance(25, (stepSeconds) => steps.push(stepSeconds));
  assert.equal(tickerResult.steps, 2);
  assert.deepEqual(steps, [0.01, 0.01]);

  const bus = new core.EventBus();
  let eventSeen = 0;
  bus.on('engine.core.boundary', () => {
    eventSeen += 1;
  });
  assert.equal(bus.emit('engine.core.boundary', { ok: true }), 1);
  assert.equal(eventSeen, 1);

  const camera = new core.Camera2D({
    x: 0,
    y: 0,
    viewportWidth: 100,
    viewportHeight: 100,
    worldWidth: 300,
    worldHeight: 300,
  });
  const target = { x: 80, y: 50, width: 20, height: 20 };
  core.followCameraTarget(camera, target, true);
  const rect = core.worldRectToScreen(camera, { x: 100, y: 100, width: 10, height: 10 });
  assert.equal(typeof rect.x, 'number');
  assert.equal(typeof rect.y, 'number');
  assert.equal(rect.width, 10);
  assert.equal(rect.height, 10);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
