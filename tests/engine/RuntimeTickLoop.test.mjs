/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeTickLoop.test.mjs
*/
import assert from "node:assert/strict";
import {
  RUNTIME_TICK_LOOP_ERRORS,
  advanceRuntimeTick,
  createRuntimeTickLoop,
} from "../../src/engine/runtime/runtimeTickLoop.js";

export function run() {
  const startResult = createRuntimeTickLoop({ fixedDeltaMs: 100 });
  assert.equal(startResult.valid, true);
  assert.deepEqual(startResult.tick, { frame: 0, elapsedMs: 0, fixedDeltaMs: 100, deltaSeconds: 0.1 });

  const nextResult = advanceRuntimeTick(startResult.tick);
  assert.equal(nextResult.valid, true);
  assert.deepEqual(nextResult.tick, { frame: 1, elapsedMs: 100, fixedDeltaMs: 100, deltaSeconds: 0.1 });

  const invalidResult = createRuntimeTickLoop({ fixedDeltaMs: 0 });
  assert.equal(invalidResult.valid, false);
  assert.deepEqual(invalidResult.errors.map((error) => error.code), [RUNTIME_TICK_LOOP_ERRORS.FIXED_DELTA_INVALID]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
