/*
 Toolbox Aid
 David Quesenberry
 03/23/2026
 EngineTiming.test.mjs
*/
import assert from 'node:assert/strict';
import Engine from '/src/engine/core/Engine.js';
import FrameClock from '/src/engine/core/FrameClock.js';
import FixedTicker from '/src/engine/core/FixedTicker.js';

function createCanvas() {
  const canvas = {
    width: 0,
    height: 0,
    getContext() {
      return context;
    },
  };

  const context = {
    canvas,
    clearRect() {},
    fillRect() {},
    strokeRect() {},
    beginPath() {},
    arc() {},
    fill() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    closePath() {},
    fillText() {},
    drawImage() {},
  };

  return canvas;
}

function createAnimationFrameStub() {
  const requested = [];
  const cancelled = [];
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;
  let nextId = 1;

  globalThis.requestAnimationFrame = (callback) => {
    const id = nextId;
    nextId += 1;
    requested.push({ id, callback });
    return id;
  };

  globalThis.cancelAnimationFrame = (id) => {
    cancelled.push(id);
  };

  return {
    requested,
    cancelled,
    restore() {
      if (originalRequestAnimationFrame === undefined) {
        delete globalThis.requestAnimationFrame;
      } else {
        globalThis.requestAnimationFrame = originalRequestAnimationFrame;
      }

      if (originalCancelAnimationFrame === undefined) {
        delete globalThis.cancelAnimationFrame;
      } else {
        globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
      }
    },
  };
}

function createHarness({ frameClock, fixedTicker, fixedStepMs = 10 } = {}) {
  const metricsRecords = [];
  const inputUpdates = [];
  const audioUpdates = [];
  const sceneUpdates = [];
  let renderCount = 0;
  let fullscreenAttachCount = 0;
  let fullscreenDetachCount = 0;

  const engine = new Engine({
    canvas: createCanvas(),
    fixedStepMs,
    frameClock,
    fixedTicker,
    metrics: {
      recordFrame(frame) {
        metricsRecords.push(frame);
      },
    },
    input: {
      attach() {},
      detach() {},
      update(dtSeconds) {
        inputUpdates.push(dtSeconds);
      },
    },
    audio: {
      update(dtSeconds) {
        audioUpdates.push(dtSeconds);
      },
    },
    fullscreen: {
      attach() {
        fullscreenAttachCount += 1;
      },
      detach() {
        fullscreenDetachCount += 1;
      },
    },
    logger: {
      debug() {},
      info() {},
      warn() {},
      error() {},
    },
  });

  engine.setScene({
    update(dtSeconds, currentEngine) {
      sceneUpdates.push({ dtSeconds, currentEngine });
    },
    render() {
      renderCount += 1;
    },
  });

  return {
    engine,
    metricsRecords,
    inputUpdates,
    audioUpdates,
    sceneUpdates,
    get renderCount() {
      return renderCount;
    },
    get fullscreenAttachCount() {
      return fullscreenAttachCount;
    },
    get fullscreenDetachCount() {
      return fullscreenDetachCount;
    },
  };
}

export function run() {
  const animationFrame = createAnimationFrameStub();

  try {
    const clampedHarness = createHarness({
      frameClock: new FrameClock({ now: () => 1000, maxDeltaMs: 50 }),
      fixedTicker: new FixedTicker({ stepMs: 10, maxCatchUpSteps: Number.POSITIVE_INFINITY }),
    });

    clampedHarness.engine.start();
    clampedHarness.engine.tick(1200);
    clampedHarness.engine.stop();

    assert.equal(clampedHarness.fullscreenAttachCount, 1);
    assert.equal(clampedHarness.fullscreenDetachCount, 1);
    assert.deepEqual(clampedHarness.inputUpdates, [0.05]);
    assert.deepEqual(clampedHarness.audioUpdates, [0.05]);
    assert.equal(clampedHarness.sceneUpdates.length, 5);
    assert.deepEqual(
      clampedHarness.sceneUpdates.map(({ dtSeconds, currentEngine }) => ({
        dtSeconds,
        sameEngine: currentEngine === clampedHarness.engine,
      })),
      [
        { dtSeconds: 0.01, sameEngine: true },
        { dtSeconds: 0.01, sameEngine: true },
        { dtSeconds: 0.01, sameEngine: true },
        { dtSeconds: 0.01, sameEngine: true },
        { dtSeconds: 0.01, sameEngine: true },
      ],
    );
    assert.equal(clampedHarness.renderCount, 1);
    assert.equal(clampedHarness.metricsRecords.length, 1);
    assert.equal(clampedHarness.metricsRecords[0].dtSeconds, 0.05);
    assert.equal(clampedHarness.metricsRecords[0].fixedUpdates, 5);

    const catchUpHarness = createHarness({
      frameClock: new FrameClock({ now: () => 1000, maxDeltaMs: Number.POSITIVE_INFINITY }),
      fixedTicker: new FixedTicker({ stepMs: 10, maxCatchUpSteps: 3 }),
    });

    catchUpHarness.engine.start();
    catchUpHarness.engine.tick(1100);
    catchUpHarness.engine.tick(1110);
    catchUpHarness.engine.stop();

    assert.deepEqual(catchUpHarness.inputUpdates, [0.1, 0.01]);
    assert.deepEqual(catchUpHarness.audioUpdates, [0.1, 0.01]);
    assert.deepEqual(
      catchUpHarness.sceneUpdates.map(({ dtSeconds }) => dtSeconds),
      [0.01, 0.01, 0.01, 0.01],
    );
    assert.equal(catchUpHarness.renderCount, 2);
    assert.equal(catchUpHarness.metricsRecords.length, 2);
    assert.deepEqual(
      catchUpHarness.metricsRecords.map(({ dtSeconds, fixedUpdates }) => ({ dtSeconds, fixedUpdates })),
      [
        { dtSeconds: 0.1, fixedUpdates: 3 },
        { dtSeconds: 0.01, fixedUpdates: 1 },
      ],
    );

    assert.equal(animationFrame.requested.length, 5);
    assert.deepEqual(animationFrame.cancelled, [2, 5]);
  } finally {
    animationFrame.restore();
  }
}
