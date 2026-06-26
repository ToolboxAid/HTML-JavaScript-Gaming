/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimeTickLoop.js
*/

export const RUNTIME_TICK_LOOP_ERRORS = Object.freeze({
  FIXED_DELTA_INVALID: "RUNTIME_TICK_FIXED_DELTA_INVALID",
});

export function createRuntimeTickLoop({ fixedDeltaMs }) {
  if (!Number.isFinite(fixedDeltaMs) || fixedDeltaMs <= 0) {
    return createTickResult({
      tick: null,
      errors: [
        createTickError(
          RUNTIME_TICK_LOOP_ERRORS.FIXED_DELTA_INVALID,
          "Runtime tick loop requires explicit positive fixedDeltaMs.",
          "fixedDeltaMs"
        ),
      ],
    });
  }

  return createTickResult({
    tick: Object.freeze({
      frame: 0,
      elapsedMs: 0,
      fixedDeltaMs,
      deltaSeconds: fixedDeltaMs / 1000,
    }),
    errors: [],
  });
}

export function advanceRuntimeTick(tick) {
  if (!tick || !Number.isFinite(tick.fixedDeltaMs) || tick.fixedDeltaMs <= 0) {
    return createTickResult({
      tick: null,
      errors: [
        createTickError(
          RUNTIME_TICK_LOOP_ERRORS.FIXED_DELTA_INVALID,
          "Runtime tick advance requires a valid fixedDeltaMs.",
          "tick.fixedDeltaMs"
        ),
      ],
    });
  }

  const deltaSeconds = Number.isFinite(tick.deltaSeconds) && tick.deltaSeconds > 0
    ? tick.deltaSeconds
    : tick.fixedDeltaMs / 1000;

  return createTickResult({
    tick: Object.freeze({
      frame: tick.frame + 1,
      elapsedMs: tick.elapsedMs + tick.fixedDeltaMs,
      fixedDeltaMs: tick.fixedDeltaMs,
      deltaSeconds,
    }),
    errors: [],
  });
}

function createTickResult({ tick, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    tick,
    errors: Object.freeze(errors),
  });
}

function createTickError(code, message, path) {
  return Object.freeze({ code, message, path });
}
