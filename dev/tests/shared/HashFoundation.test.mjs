/*
Toolbox Aid
David Quesenberry
06/26/2026
HashFoundation.test.mjs
*/
import assert from "node:assert/strict";
import {
  combineHash32,
  hashString32,
  hashToSignedUnit,
  hashToUnitInterval,
  hashValue32,
  toStableHashString,
} from "../../../www/src/shared/hash/hash.js";

export function run() {
  assert.equal(hashString32("Game Foundry"), hashString32("Game Foundry"));
  assert.notEqual(hashString32("Game Foundry"), hashString32("Game Foundry!"));

  assert.equal(
    toStableHashString({ b: 2, a: 1 }),
    toStableHashString({ a: 1, b: 2 })
  );
  assert.equal(hashValue32({ b: 2, a: [1, 2, 3] }), hashValue32({ a: [1, 2, 3], b: 2 }));
  assert.notEqual(hashValue32({ a: [1, 2, 3] }), hashValue32({ a: [1, 2, 4] }));

  assert.equal(combineHash32("a", "b", "c"), combineHash32("a", "b", "c"));
  assert.notEqual(combineHash32("a", "b", "c"), combineHash32("a", "c", "b"));
  assert.notEqual(hashValue32("seeded", 1), hashValue32("seeded", 2));

  const unitValue = hashToUnitInterval("unit");
  assert.equal(unitValue >= 0 && unitValue < 1, true);

  const signedValue = hashToSignedUnit("signed");
  assert.equal(signedValue >= -1 && signedValue < 1, true);

  assert.match(toStableHashString(new Date("2026-06-26T00:00:00.000Z")), /^date:/);
  assert.equal(toStableHashString(Number.NaN), "number:NaN");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
