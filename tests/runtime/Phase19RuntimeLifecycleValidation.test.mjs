/*
Toolbox Aid
David Quesenberry
04/17/2026
Phase19RuntimeLifecycleValidation.test.mjs
*/
import assert from 'node:assert/strict';
import Engine from '../../src/engine/core/Engine.js';
import { Logger } from '../../src/engine/logging/index.js';

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

function createHarness({
  fixedStepMs = 16,
  scene = null,
  logger = null,
  events = null,
  runtimeHooks = null,
} = {}) {
  const attachCounts = {
    input: 0,
    audio: 0,
    fullscreen: 0,
  };
  const detachCounts = {
    input: 0,
    audio: 0,
    fullscreen: 0,
  };
  const metrics = [];
  const frameClockState = {
    resetCount: 0,
    lastNow: 0,
  };
  const fixedTickerState = {
    resetCount: 0,
  };

  const frameClock = {
    reset(timeMs = 0) {
      frameClockState.resetCount += 1;
      frameClockState.lastNow = Number(timeMs) || 0;
    },
    tick(now) {
      const nextNow = Number(now) || 0;
      const deltaMs = Math.max(0, nextNow - frameClockState.lastNow);
      frameClockState.lastNow = nextNow;
      return {
        deltaMs,
        deltaSeconds: deltaMs / 1000,
      };
    },
  };

  const fixedTicker = {
    reset() {
      fixedTickerState.resetCount += 1;
    },
    advance(deltaMs, callback) {
      const dtSeconds = Math.max(0, Number(deltaMs) || 0) / 1000;
      if (dtSeconds > 0) {
        callback(dtSeconds);
        return { steps: 1 };
      }
      return { steps: 0 };
    },
  };

  const engine = new Engine({
    canvas: createCanvas(),
    fixedStepMs,
    frameClock,
    fixedTicker,
    metrics: {
      recordFrame(frame) {
        metrics.push(frame);
      },
      getSnapshot() {
        const latest = metrics.length > 0 ? metrics[metrics.length - 1] : null;
        return latest ? { ...latest } : { frameMs: 0, updateMs: 0, renderMs: 0, fixedUpdates: 0 };
      },
    },
    input: {
      attach() {
        attachCounts.input += 1;
      },
      detach() {
        detachCounts.input += 1;
      },
      update() {},
    },
    audio: {
      attach() {
        attachCounts.audio += 1;
      },
      detach() {
        detachCounts.audio += 1;
      },
      update() {},
    },
    fullscreen: {
      attach() {
        attachCounts.fullscreen += 1;
      },
      detach() {
        detachCounts.fullscreen += 1;
      },
      getState() {
        return { active: false };
      },
    },
    logger: logger || {
      debug() {},
      info() {},
      warn() {},
      error() {},
    },
    events,
    runtimeHooks,
  });

  if (scene) {
    engine.setScene(scene);
  }

  return {
    engine,
    metrics,
    attachCounts,
    detachCounts,
    frameClockState,
    fixedTickerState,
  };
}

function assertBootRunShutdownLifecycle() {
  const animationFrame = createAnimationFrameStub();
  try {
    let updateCount = 0;
    const harness = createHarness({
      scene: {
        update() {
          updateCount += 1;
        },
        render() {},
      },
    });

    harness.engine.start();
    harness.engine.tick(1016);
    harness.engine.tick(1032);
    harness.engine.stop();

    assert.equal(harness.attachCounts.input, 1, 'Input should attach exactly once on boot.');
    assert.equal(harness.detachCounts.input, 1, 'Input should detach exactly once on shutdown.');
    assert.equal(harness.attachCounts.audio, 1, 'Audio should attach exactly once on boot.');
    assert.equal(harness.detachCounts.audio, 1, 'Audio should detach exactly once on shutdown.');
    assert.equal(harness.attachCounts.fullscreen, 1, 'Fullscreen should attach exactly once on boot.');
    assert.equal(harness.detachCounts.fullscreen, 1, 'Fullscreen should detach exactly once on shutdown.');
    assert.equal(updateCount >= 2, true, 'Scene should run update loop during runtime phase.');
    assert.equal(harness.metrics.length >= 2, true, 'Runtime metrics should be produced while running.');
  } finally {
    animationFrame.restore();
  }
}

function assertHotReloadAndResetFlows() {
  const animationFrame = createAnimationFrameStub();
  try {
    const transitions = [];
    const sceneA = {
      enter() {
        transitions.push('sceneA:enter');
      },
      exit() {
        transitions.push('sceneA:exit');
      },
      update() {},
      render() {},
    };
    const sceneB = {
      enter() {
        transitions.push('sceneB:enter');
      },
      exit() {
        transitions.push('sceneB:exit');
      },
      update() {},
      render() {},
    };
    const harness = createHarness({ scene: sceneA });

    harness.engine.start();
    harness.engine.tick(1016);
    harness.engine.setScene(sceneB);
    harness.engine.tick(1032);
    harness.engine.stop();

    harness.engine.start();
    harness.engine.setScene(sceneA);
    harness.engine.tick(1048);
    harness.engine.stop();

    assert.equal(
      transitions.includes('sceneA:exit') && transitions.includes('sceneB:enter'),
      true,
      'Scene hot-swap should run exit/enter transitions.'
    );
    assert.equal(
      harness.frameClockState.resetCount,
      2,
      'Frame clock should reset on each runtime restart cycle.'
    );
    assert.equal(
      harness.fixedTickerState.resetCount,
      2,
      'Fixed ticker should reset on each runtime restart cycle.'
    );
  } finally {
    animationFrame.restore();
  }
}

function assertErrorHandlingPaths() {
  const animationFrame = createAnimationFrameStub();
  const warnings = [];
  try {
    let updateCount = 0;
    const harness = createHarness({
      logger: {
        debug() {},
        info() {},
        warn(message) {
          warnings.push(String(message));
        },
        error() {},
      },
      scene: {
        setCamera3D() {
          throw new Error('camera hook failure');
        },
        step3DPhysics() {
          throw new Error('physics hook failure');
        },
        update() {
          updateCount += 1;
        },
        render() {},
      },
    });

    harness.engine.start();
    harness.engine.tick(1016);
    harness.engine.stop();

    assert.equal(
      warnings.some((entry) => entry.includes('setCamera3D hook failed')),
      true,
      'Engine should report and isolate scene setCamera3D hook failures.'
    );
    assert.equal(
      warnings.some((entry) => entry.includes('step3DPhysics hook failed')),
      true,
      'Engine should report and isolate scene step3DPhysics hook failures.'
    );
    assert.equal(updateCount > 0, true, 'Scene update should still execute after isolated physics hook failure.');
  } finally {
    animationFrame.restore();
  }
}

function assertLongRunningStability() {
  const animationFrame = createAnimationFrameStub();
  try {
    let updateCount = 0;
    const harness = createHarness({
      scene: {
        update() {
          updateCount += 1;
        },
        render() {},
      },
    });

    const iterations = 5000;
    harness.engine.start();
    for (let i = 1; i <= iterations; i += 1) {
      harness.engine.tick(i * 16);
    }
    harness.engine.stop();

    assert.equal(updateCount, iterations, 'Long-running loop should process every lifecycle tick deterministically.');
    assert.equal(harness.metrics.length, iterations, 'Long-running loop should maintain metrics without drift.');
  } finally {
    animationFrame.restore();
  }
}

function assertRuntimeMonitoringHooksAndLoggingFormat() {
  const animationFrame = createAnimationFrameStub();
  try {
    const runtimeErrors = [];
    const performanceFrames = [];
    const emittedEvents = [];
    const logger = new Logger({ channel: 'runtime-test', level: 'debug' });

    const harness = createHarness({
      logger,
      runtimeHooks: {
        onError(payload) {
          runtimeErrors.push(payload);
        },
        onPerformance(payload) {
          performanceFrames.push(payload);
        },
      },
      events: {
        emit(name, payload) {
          emittedEvents.push({ name, payload });
          return 0;
        },
      },
      scene: {
        step3DPhysics() {
          throw new Error('monitoring-hook-physics-failure');
        },
        update() {},
        render() {},
      },
    });

    harness.engine.start();
    harness.engine.tick(1016);
    harness.engine.stop();

    assert.equal(runtimeErrors.length >= 1, true, 'Runtime error hook should receive isolated runtime error payloads.');
    assert.equal(
      runtimeErrors.some((entry) => entry.stage === 'scene.step3DPhysics' && entry.isolated === true),
      true,
      'Runtime error hook should include scene.step3DPhysics stage metadata.'
    );
    assert.equal(performanceFrames.length >= 1, true, 'Performance monitoring hook should receive frame payloads.');
    assert.equal(
      performanceFrames.some((entry) => typeof entry.snapshot === 'object' && entry.snapshot !== null),
      true,
      'Performance monitoring hook payload should include metrics snapshot.'
    );
    assert.equal(
      emittedEvents.some((entry) => entry.name === 'engine:runtime-error'),
      true,
      'Engine should emit engine:runtime-error event when runtime errors are tracked.'
    );
    assert.equal(
      emittedEvents.some((entry) => entry.name === 'engine:performance-frame'),
      true,
      'Engine should emit engine:performance-frame event for monitoring consumers.'
    );

    const entries = logger.getEntries();
    assert.equal(entries.length >= 1, true, 'Standardized logger should capture runtime monitoring logs.');
    assert.equal(
      entries.every((entry) => entry.format === 'engine.log.v1' && typeof entry.event === 'string' && entry.event.length > 0),
      true,
      'Logger entries should use the standardized log format and include event codes.'
    );
  } finally {
    animationFrame.restore();
  }
}

export function run() {
  assertBootRunShutdownLifecycle();
  assertHotReloadAndResetFlows();
  assertErrorHandlingPaths();
  assertLongRunningStability();
  assertRuntimeMonitoringHooksAndLoggingFormat();
}
