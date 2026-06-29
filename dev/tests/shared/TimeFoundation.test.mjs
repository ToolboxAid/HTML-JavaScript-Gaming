/*
Toolbox Aid
David Quesenberry
06/26/2026
TimeFoundation.test.mjs
*/
import assert from "node:assert/strict";
import {
  debounce,
  formatDuration,
  sleep,
  throttle,
  toIsoTimestamp,
  toUnixMilliseconds,
} from "../../../www/src/shared/time/time.js";

export async function run() {
  assert.equal(formatDuration(500), "500ms");
  assert.equal(formatDuration(3_661_250), "1h 1m 1s 250ms");
  assert.equal(formatDuration(-61_000), "-1m 1s");

  const date = new Date("2026-06-26T12:34:56.789Z");
  assert.equal(toUnixMilliseconds(date), Date.UTC(2026, 5, 26, 12, 34, 56, 789));
  assert.equal(toIsoTimestamp(date), "2026-06-26T12:34:56.789Z");
  assert.throws(() => toIsoTimestamp("not a date"), TypeError);

  const start = Date.now();
  await sleep(5);
  assert.ok(Date.now() - start >= 0);

  const debounceCalls = [];
  const debounced = debounce((value) => debounceCalls.push(value), 5);
  debounced("first");
  debounced("second");
  assert.deepEqual(debounceCalls, []);
  await sleep(15);
  assert.deepEqual(debounceCalls, ["second"]);
  debounced("cancelled");
  debounced.cancel();
  await sleep(10);
  assert.deepEqual(debounceCalls, ["second"]);

  const throttleCalls = [];
  const throttled = throttle((value) => throttleCalls.push(value), 10);
  throttled("first");
  throttled("second");
  assert.deepEqual(throttleCalls, ["first"]);
  await sleep(20);
  assert.deepEqual(throttleCalls, ["first", "second"]);
  throttled.cancel();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await run();
}
