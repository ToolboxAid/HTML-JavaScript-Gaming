/*
Toolbox Aid
David Quesenberry
06/26/2026
RandomSeed.test.mjs
*/
import assert from "node:assert/strict";
import { RandomSeed } from "../../src/shared/math/RandomSeed.js";

function takeSequence(generator, count) {
  return Array.from({ length: count }, () => generator.next());
}

export function run() {
  const first = new RandomSeed("level-1");
  const second = new RandomSeed("level-1");
  assert.deepEqual(takeSequence(first, 5), takeSequence(second, 5));

  first.seed("level-1");
  second.seed("different-level");
  assert.notDeepEqual(takeSequence(first, 5), takeSequence(second, 5));

  const reseeded = new RandomSeed(42);
  const originalSequence = takeSequence(reseeded, 6);
  reseeded.seed(42);
  assert.deepEqual(takeSequence(reseeded, 6), originalSequence);

  const integerSeed = new RandomSeed("integer-range");
  for (let index = 0; index < 100; index += 1) {
    const value = integerSeed.nextInt(2, 5);
    assert.equal(Number.isInteger(value), true);
    assert.equal(value >= 2 && value <= 5, true);
  }

  const floatSeed = new RandomSeed("float-range");
  for (let index = 0; index < 100; index += 1) {
    const value = floatSeed.nextFloat(-2, 3);
    assert.equal(value >= -2 && value < 3, true);
  }

  const pickSource = ["alpha", "bravo", "charlie", "delta"];
  const pickerA = new RandomSeed("pick-seed");
  const pickerB = new RandomSeed("pick-seed");
  assert.deepEqual(
    Array.from({ length: 8 }, () => pickerA.pick(pickSource)),
    Array.from({ length: 8 }, () => pickerB.pick(pickSource))
  );

  assert.throws(() => new RandomSeed("empty").pick([]), RangeError);
  assert.throws(() => new RandomSeed("bad-array").pick("not-array"), TypeError);
  assert.throws(() => new RandomSeed("bad-int").nextInt(5, 2), RangeError);
  assert.throws(() => new RandomSeed("bad-float").nextFloat(0, Number.POSITIVE_INFINITY), TypeError);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
