/*
Toolbox Aid
David Quesenberry
06/26/2026
Random.test.mjs
*/
import assert from "node:assert/strict";
import { Random } from "../../../www/src/shared/math/Random.js";

const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function sequence(values) {
  let index = 0;
  return () => values[index++ % values.length];
}

function setCrypto(value) {
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    enumerable: true,
    value,
  });
}

async function withRandomSources({ cryptoSource, mathValues }, callback) {
  const cryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  const originalMathRandom = Math.random;

  if (Object.hasOwn({ cryptoSource }, "cryptoSource")) {
    setCrypto(cryptoSource);
  }

  if (mathValues) {
    Math.random = sequence(mathValues);
  }

  try {
    await callback();
  } finally {
    if (cryptoDescriptor) {
      Object.defineProperty(globalThis, "crypto", cryptoDescriptor);
    } else {
      delete globalThis.crypto;
    }
    Math.random = originalMathRandom;
  }
}

export async function run() {
  let cryptoCalls = 0;
  await withRandomSources(
    {
      cryptoSource: {
        getRandomValues(values) {
          cryptoCalls += 1;
          if (values instanceof Uint32Array) {
            values[0] = 0x80000000;
            return values;
          }

          for (let index = 0; index < values.length; index += 1) {
            values[index] = index;
          }
          return values;
        },
      },
    },
    async () => {
      assert.equal(Random.next(), 0.5);
      assert.equal(Random.uuid(), "00010203-0405-4607-8809-0a0b0c0d0e0f");
      assert.equal(cryptoCalls >= 2, true);
    }
  );

  await withRandomSources({ cryptoSource: undefined, mathValues: [0.25] }, async () => {
    assert.equal(Random.next(), 0.25);
  });

  await withRandomSources(
    {
      cryptoSource: undefined,
      mathValues: [0.5, 0.25, 0.9, 0.1, 0.6, 0.2, 0.49, 0.5, 0.8],
    },
    async () => {
      assert.equal(Random.nextInt(0, 10), 5);
      assert.equal(Random.nextFloat(10, 20), 12.5);
      assert.equal(Random.pick(["a", "b", "c"]), "c");
      assert.deepEqual(Random.shuffle(["a", "b", "c", "d"]), ["c", "d", "b", "a"]);
      assert.equal(Random.chance(50), true);
      assert.equal(Random.chance(50), false);
      assert.equal(
        Random.weightedPick([
          { item: "common", weight: 7 },
          { item: "rare", weight: 3 },
        ]),
        "rare"
      );
    }
  );

  await withRandomSources({ cryptoSource: undefined, mathValues: Array(16).fill(0.5) }, async () => {
    assert.match(Random.uuid(), UUID_V4_PATTERN);
  });

  assert.equal(typeof Random.seed, "undefined");
  assert.throws(() => Random.pick([]), RangeError);
  assert.throws(() => Random.chance(-1), RangeError);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await run();
}
