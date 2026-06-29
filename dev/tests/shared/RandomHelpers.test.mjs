/*
Toolbox Aid
David Quesenberry
06/26/2026
RandomHelpers.test.mjs
*/
import assert from "node:assert/strict";
import {
  chance,
  nextFloat,
  nextInt,
  pick,
  shuffle,
  weightedPick,
} from "../../../www/src/shared/math/randomHelpers.js";

function sequence(values) {
  let index = 0;
  return () => values[index++ % values.length];
}

export function run() {
  assert.equal(nextInt(sequence([0]), 2, 5), 2);
  assert.equal(nextInt(sequence([0.999]), 2, 5), 5);
  assert.equal(nextFloat(sequence([0.25]), -2, 2), -1);
  assert.equal(pick(sequence([0.6]), ["a", "b", "c"]), "b");

  const source = ["a", "b", "c", "d"];
  const shuffled = shuffle(sequence([0.1, 0.6, 0.2]), source);
  assert.deepEqual(source, ["a", "b", "c", "d"]);
  assert.deepEqual(shuffled, ["c", "d", "b", "a"]);

  assert.equal(chance(sequence([0.49]), 50), true);
  assert.equal(chance(sequence([0.5]), 50), false);
  assert.equal(chance(sequence([0.99]), 0), false);
  assert.equal(chance(sequence([0.99]), 100), true);

  assert.equal(
    weightedPick(sequence([0.1]), [
      { item: "common", weight: 7 },
      { item: "rare", weight: 3 },
    ]),
    "common"
  );
  assert.equal(
    weightedPick(sequence([0.8]), [
      { value: "common", weight: 7 },
      { value: "rare", weight: 3 },
    ]),
    "rare"
  );

  assert.throws(() => nextInt(() => 1, 0, 10), RangeError);
  assert.throws(() => nextFloat(() => -0.1, 0, 10), RangeError);
  assert.throws(() => nextInt("not-a-function", 0, 10), TypeError);
  assert.throws(() => nextInt(sequence([0.5]), 10, 1), RangeError);
  assert.throws(() => nextInt(sequence([0.5]), 0.2, 0.8), RangeError);
  assert.throws(() => pick(sequence([0.5]), []), RangeError);
  assert.throws(() => shuffle(sequence([0.5]), "abc"), TypeError);
  assert.throws(() => chance(sequence([0.5]), 101), RangeError);
  assert.throws(() => weightedPick(sequence([0.5]), []), RangeError);
  assert.throws(() => weightedPick(sequence([0.5]), [{ item: "none", weight: 0 }]), RangeError);
  assert.throws(() => weightedPick(sequence([0.5]), [{ weight: 1 }]), TypeError);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
