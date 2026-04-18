/*
Toolbox Aid
David Quesenberry
04/18/2026
RuntimeMonitoringHooks.js
*/
function toSafeErrorMessage(errorLike) {
  if (errorLike instanceof Error && typeof errorLike.message === 'string' && errorLike.message.length > 0) {
    return errorLike.message;
  }
  if (typeof errorLike === 'string' && errorLike.length > 0) {
    return errorLike;
  }
  return 'Unknown runtime error';
}

function toSafeErrorStack(errorLike) {
  if (errorLike instanceof Error && typeof errorLike.stack === 'string') {
    return errorLike.stack;
  }
  return null;
}

function toSafeContext(contextProvider) {
  if (typeof contextProvider !== 'function') {
    return {};
  }
  try {
    const value = contextProvider();
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }
    return { ...value };
  } catch {
    return {};
  }
}

function resolvePerformanceLogLevel(reason) {
  if (reason === 'load' || reason === 'start') {
    return 'info';
  }
  return 'debug';
}

export function createRuntimeMonitoringHooks({
  logger = null,
  onError = null,
  onPerformance = null,
  source = 'runtime',
  sampleIntervalMs = 5000,
  contextProvider = null,
  windowRef = globalThis.window ?? null,
  performanceRef = globalThis.performance ?? null,
  now = () => Date.now(),
  setIntervalRef = globalThis.setInterval?.bind(globalThis),
  clearIntervalRef = globalThis.clearInterval?.bind(globalThis),
} = {}) {
  const errorHandler = typeof onError === 'function' ? onError : null;
  const performanceHandler = typeof onPerformance === 'function' ? onPerformance : null;
  const normalizedSource = typeof source === 'string' && source.length > 0 ? source : 'runtime';
  const intervalMs = Number.isFinite(sampleIntervalMs) && sampleIntervalMs > 0 ? Number(sampleIntervalMs) : 0;
  const basePerformance = performanceRef && typeof performanceRef.now === 'function' ? performanceRef : null;

  let globalErrorListener = null;
  let unhandledRejectionListener = null;
  let sampleTimerId = null;
  let running = false;

  function emitRuntimeError(hook, errorLike, context = {}) {
    const payload = {
      format: 'runtime.monitoring.v1',
      kind: 'error',
      source: normalizedSource,
      hook,
      message: toSafeErrorMessage(errorLike),
      stack: toSafeErrorStack(errorLike),
      timestamp: new Date(now()).toISOString(),
      context: {
        ...toSafeContext(contextProvider),
        ...context,
      },
    };

    logger?.error?.('Runtime monitoring captured an error.', {
      event: 'runtime.monitoring.error',
      source: payload.source,
      hook: payload.hook,
      error: payload.message,
      ...payload.context,
    });
    errorHandler?.(payload);
    return payload;
  }

  function emitPerformanceSample(reason = 'interval', context = {}) {
    const memory = basePerformance?.memory
      ? {
        usedJSHeapSize: Number(basePerformance.memory.usedJSHeapSize || 0),
        totalJSHeapSize: Number(basePerformance.memory.totalJSHeapSize || 0),
        jsHeapSizeLimit: Number(basePerformance.memory.jsHeapSizeLimit || 0),
      }
      : null;

    const payload = {
      format: 'runtime.monitoring.v1',
      kind: 'performance',
      source: normalizedSource,
      reason,
      timestamp: new Date(now()).toISOString(),
      sample: {
        nowMs: basePerformance ? Number(basePerformance.now()) : Number(now()),
        memory,
      },
      context: {
        ...toSafeContext(contextProvider),
        ...context,
      },
    };

    const logLevel = resolvePerformanceLogLevel(reason);
    logger?.[logLevel]?.('Runtime monitoring captured a performance sample.', {
      event: 'runtime.monitoring.performance',
      source: payload.source,
      reason: payload.reason,
      nowMs: payload.sample.nowMs,
      ...payload.context,
    });
    performanceHandler?.(payload);
    return payload;
  }

  function start() {
    if (running) {
      return;
    }
    running = true;

    if (windowRef && typeof windowRef.addEventListener === 'function') {
      globalErrorListener = (event) => {
        emitRuntimeError('window.error', event?.error || event?.message || 'Unknown window error', {
          filename: event?.filename || '',
          lineno: Number(event?.lineno || 0),
          colno: Number(event?.colno || 0),
        });
      };
      unhandledRejectionListener = (event) => {
        emitRuntimeError('window.unhandledrejection', event?.reason || 'Unhandled promise rejection');
      };
      windowRef.addEventListener('error', globalErrorListener);
      windowRef.addEventListener('unhandledrejection', unhandledRejectionListener);
    }

    emitPerformanceSample('start');

    if (intervalMs > 0 && typeof setIntervalRef === 'function') {
      sampleTimerId = setIntervalRef(() => {
        emitPerformanceSample('interval');
      }, intervalMs);
    }
  }

  function stop() {
    if (!running) {
      return;
    }
    running = false;

    if (windowRef && typeof windowRef.removeEventListener === 'function') {
      if (globalErrorListener) {
        windowRef.removeEventListener('error', globalErrorListener);
      }
      if (unhandledRejectionListener) {
        windowRef.removeEventListener('unhandledrejection', unhandledRejectionListener);
      }
    }

    if (sampleTimerId !== null && typeof clearIntervalRef === 'function') {
      clearIntervalRef(sampleTimerId);
      sampleTimerId = null;
    }
  }

  return {
    start,
    stop,
    emitRuntimeError(hook, errorLike, context = {}) {
      return emitRuntimeError(hook, errorLike, context);
    },
    emitPerformanceSample(reason = 'manual', context = {}) {
      return emitPerformanceSample(reason, context);
    },
    getState() {
      return {
        running,
        intervalMs,
        source: normalizedSource,
      };
    },
  };
}
