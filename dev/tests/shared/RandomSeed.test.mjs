/*
Toolbox Aid
David Quesenberry
06/26/2026
RandomSeed.test.mjs
*/
import assert from "node:assert/strict";
import { RandomSeed } from "../../../www/src/shared/math/RandomSeed.js";

function takeSequence(generator, count) {
  return Array.from({ length: count }, () => generator.next());
}

export function run() {
  const first = new RandomSeed("level-1");
  const second = new RandomSeed("level-1");
  assert.deepEqual(takeSequence(first, 5), takeSequence(second, 5));

  assert.deepEqual(takeSequence(new RandomSeed(42), 6), [
    0.3077305785845965,
    0.3676118436269462,
    0.23133554426021874,
    0.01758907549083233,
    0.009130497695878148,
    0.2082449474837631,
  ]);

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

  const shuffleSource = ["a", "b", "c", "d"];
  const shuffleA = new RandomSeed("shuffle-seed");
  const shuffleB = new RandomSeed("shuffle-seed");
  assert.deepEqual(shuffleA.shuffle(shuffleSource), shuffleB.shuffle(shuffleSource));
  assert.deepEqual(shuffleSource, ["a", "b", "c", "d"]);

  const chanceA = new RandomSeed("chance-seed");
  const chanceB = new RandomSeed("chance-seed");
  assert.deepEqual(
    Array.from({ length: 8 }, () => chanceA.chance(35)),
    Array.from({ length: 8 }, () => chanceB.chance(35))
  );

  const weightedItems = [
    { item: "common", weight: 7 },
    { item: "rare", weight: 3 },
  ];
  const weightedA = new RandomSeed("weighted-seed");
  const weightedB = new RandomSeed("weighted-seed");
  assert.deepEqual(
    Array.from({ length: 8 }, () => weightedA.weightedPick(weightedItems)),
    Array.from({ length: 8 }, () => weightedB.weightedPick(weightedItems))
  );

  const stateSeed = new RandomSeed("state-seed");
  stateSeed.next();
  const savedState = stateSeed.saveState();
  const expectedAfterState = takeSequence(stateSeed, 4);
  assert.equal(stateSeed.restoreState(savedState), stateSeed);
  assert.deepEqual(takeSequence(stateSeed, 4), expectedAfterState);

  assert.throws(() => new RandomSeed("empty").pick([]), RangeError);
  assert.throws(() => new RandomSeed("bad-array").pick("not-array"), TypeError);
  assert.throws(() => new RandomSeed("bad-int").nextInt(5, 2), RangeError);
  assert.throws(() => new RandomSeed("bad-float").nextFloat(0, Number.POSITIVE_INFINITY), TypeError);
  assert.throws(() => new RandomSeed("bad-chance").chance(101), RangeError);
  assert.throws(() => new RandomSeed("bad-weight").weightedPick([{ item: "none", weight: 0 }]), RangeError);
  assert.throws(() => new RandomSeed("bad-state").restoreState({ state: -1 }), RangeError);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
