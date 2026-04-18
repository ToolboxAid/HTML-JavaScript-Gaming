/*
Toolbox Aid
David Quesenberry
04/18/2026
RuntimeMonitoringHooks.test.mjs
*/
import assert from 'node:assert/strict';
import { createRuntimeMonitoringHooks } from '../../src/engine/runtime/index.js';
import { Logger } from '../../src/engine/logging/index.js';

function createWindowStub() {
  const listeners = new Map();
  const removed = [];
  return {
    listeners,
    removed,
    addEventListener(name, callback) {
      listeners.set(name, callback);
    },
    removeEventListener(name, callback) {
      removed.push({ name, callback });
      if (listeners.get(name) === callback) {
        listeners.delete(name);
      }
    },
  };
}

export function run() {
  const capturedErrors = [];
  const capturedPerformance = [];
  const clearedTimers = [];
  const scheduledTimers = [];
  const windowStub = createWindowStub();
  const logger = new Logger({ channel: 'runtime-monitoring-test', level: 'debug' });

  const hooks = createRuntimeMonitoringHooks({
    logger,
    source: 'runtime-test',
    sampleIntervalMs: 2500,
    windowRef: windowStub,
    performanceRef: {
      now() {
        return 123.5;
      },
      memory: {
        usedJSHeapSize: 10,
        totalJSHeapSize: 20,
        jsHeapSizeLimit: 30,
      },
    },
    now: () => 1000,
    setIntervalRef(callback, intervalMs) {
      scheduledTimers.push({ callback, intervalMs });
      return 41;
    },
    clearIntervalRef(timerId) {
      clearedTimers.push(timerId);
    },
    onError(payload) {
      capturedErrors.push(payload);
    },
    onPerformance(payload) {
      capturedPerformance.push(payload);
    },
    contextProvider: () => ({
      runtimeLabel: 'hooks-suite',
    }),
  });

  hooks.start();

  assert.equal(hooks.getState().running, true, 'Monitoring hooks should report running state after start.');
  assert.equal(windowStub.listeners.has('error'), true, 'Monitoring hooks should register window error listener.');
  assert.equal(
    windowStub.listeners.has('unhandledrejection'),
    true,
    'Monitoring hooks should register unhandledrejection listener.'
  );
  assert.equal(
    capturedPerformance.some((entry) => entry.kind === 'performance' && entry.reason === 'start'),
    true,
    'Monitoring hooks should emit a start performance sample immediately.'
  );

  windowStub.listeners.get('error')({
    message: 'window failure',
    filename: 'runtime-test.js',
    lineno: 9,
    colno: 3,
  });
  windowStub.listeners.get('unhandledrejection')({
    reason: new Error('unhandled rejection'),
  });
  scheduledTimers[0].callback();

  const manualError = hooks.emitRuntimeError('manual.error', new Error('manual failure'), { from: 'manual' });
  const manualPerf = hooks.emitPerformanceSample('manual');

  assert.equal(manualError.kind, 'error', 'Manual runtime error emission should produce error payload.');
  assert.equal(manualError.source, 'runtime-test', 'Manual runtime error payload should preserve source.');
  assert.equal(manualPerf.kind, 'performance', 'Manual performance emission should produce performance payload.');
  assert.equal(
    capturedErrors.some((entry) => entry.hook === 'window.error' && entry.context.filename === 'runtime-test.js'),
    true,
    'Window error listener should emit normalized error payload with filename context.'
  );
  assert.equal(
    capturedErrors.some((entry) => entry.hook === 'window.unhandledrejection' && entry.message === 'unhandled rejection'),
    true,
    'Unhandled rejection listener should emit normalized error payload.'
  );
  assert.equal(
    capturedPerformance.some((entry) => entry.reason === 'interval'),
    true,
    'Scheduled interval should emit interval performance sample.'
  );
  assert.equal(
    capturedPerformance.every((entry) => entry.format === 'runtime.monitoring.v1'),
    true,
    'Performance payloads should use runtime.monitoring.v1 format.'
  );
  assert.equal(
    capturedErrors.every((entry) => entry.format === 'runtime.monitoring.v1'),
    true,
    'Error payloads should use runtime.monitoring.v1 format.'
  );

  hooks.stop();

  assert.equal(hooks.getState().running, false, 'Monitoring hooks should stop cleanly.');
  assert.deepEqual(clearedTimers, [41], 'Monitoring hooks should clear active interval timer on stop.');
  assert.equal(windowStub.removed.length, 2, 'Monitoring hooks should remove window listeners on stop.');

  const entries = logger.getEntries();
  assert.equal(entries.length >= 4, true, 'Logger should capture runtime monitoring activity.');
  assert.equal(
    entries.every((entry) => entry.format === 'engine.log.v1'),
    true,
    'Logger entries should preserve standardized engine.log.v1 format.'
  );
  assert.equal(
    entries.some((entry) => entry.event === 'runtime.monitoring.error'),
    true,
    'Logger should capture runtime.monitoring.error events.'
  );
  assert.equal(
    entries.some((entry) => entry.event === 'runtime.monitoring.performance'),
    true,
    'Logger should capture runtime.monitoring.performance events.'
  );
}
