/*
Toolbox Aid
David Quesenberry
06/26/2026
NoiseFoundation.test.mjs
*/
import assert from "node:assert/strict";
import {
  createNoisePermutation,
  fractalNoise2D,
  perlinNoise2D,
  simplexNoise2D,
  valueNoise2D,
} from "../../../www/src/shared/noise/noise.js";

function assertInRange(value, min, max) {
  assert.equal(Number.isFinite(value), true);
  assert.equal(value >= min && value <= max, true, `${value} was outside ${min}..${max}`);
}

export function run() {
  assert.equal(valueNoise2D(1.25, 2.5, { seed: "a" }), valueNoise2D(1.25, 2.5, { seed: "a" }));
  assert.notEqual(valueNoise2D(1.25, 2.5, { seed: "a" }), valueNoise2D(1.25, 2.5, { seed: "b" }));
  assertInRange(valueNoise2D(3.5, -2, { seed: "range" }), 0, 1);

  const perlinValue = perlinNoise2D(0.25, 0.75, { seed: "perlin", frequency: 2 });
  const simplexValue = simplexNoise2D(0.25, 0.75, { seed: "simplex", frequency: 2 });
  assert.equal(perlinValue, perlinNoise2D(0.25, 0.75, { seed: "perlin", frequency: 2 }));
  assert.equal(simplexValue, simplexNoise2D(0.25, 0.75, { seed: "simplex", frequency: 2 }));
  assertInRange(perlinValue, -1, 1);
  assertInRange(simplexValue, -1, 1);

  const fractalValue = fractalNoise2D(0.5, 0.75, { seed: "fractal", octaves: 3 });
  assert.equal(fractalValue, fractalNoise2D(0.5, 0.75, { seed: "fractal", octaves: 3 }));
  assertInRange(fractalValue, 0, 1);

  assert.deepEqual(createNoisePermutation("perm", 8), createNoisePermutation("perm", 8));
  assert.notDeepEqual(createNoisePermutation("perm", 8), createNoisePermutation("other", 8));
  assert.deepEqual(createNoisePermutation("size", 4).sort((a, b) => a - b), [0, 1, 2, 3]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
