import { hashToUnitInterval, hashValue32 } from "../hash/hash.js";
import { RandomSeed } from "../math/RandomSeed.js";

const SQRT3 = Math.sqrt(3);
const SIMPLEX_F2 = 0.5 * (SQRT3 - 1);
const SIMPLEX_G2 = (3 - SQRT3) / 6;

function fade(value) {
  return value * value * value * (value * (value * 6 - 15) + 10);
}

function lerp(a, b, amount) {
  return a + (b - a) * amount;
}

function gradientDot(seed, ix, iy, x, y) {
  const angle = hashToUnitInterval([seed, ix, iy, "gradient"]) * Math.PI * 2;
  return Math.cos(angle) * x + Math.sin(angle) * y;
}

function simplexCorner(seed, i, j, x, y) {
  const t = 0.5 - x * x - y * y;
  if (t < 0) {
    return 0;
  }

  const influence = t * t;
  return influence * influence * gradientDot(seed, i, j, x, y);
}

function normalizeFrequency(frequency) {
  const normalized = Number(frequency);
  return Number.isFinite(normalized) && normalized > 0 ? normalized : 1;
}

/**
 * Creates a deterministic shuffled permutation from a seed.
 *
 * @param {*} seed Seed value.
 * @param {number} size Permutation size.
 * @returns {number[]} Deterministic permutation.
 */
export function createNoisePermutation(seed = "noise", size = 256) {
  const normalizedSize = Math.max(1, Math.floor(Number(size) || 256));
  return new RandomSeed(seed).shuffle(Array.from({ length: normalizedSize }, (_, index) => index));
}

/**
 * Returns deterministic value noise in the range [0, 1].
 *
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 * @param {{seed?: *, frequency?: number}} options Noise options.
 * @returns {number} Value noise.
 */
export function valueNoise2D(x, y, options = {}) {
  const frequency = normalizeFrequency(options.frequency);
  const nx = Number(x) * frequency;
  const ny = Number(y) * frequency;
  const x0 = Math.floor(nx);
  const y0 = Math.floor(ny);
  const tx = fade(nx - x0);
  const ty = fade(ny - y0);
  const seed = options.seed ?? "value";

  const v00 = hashToUnitInterval([seed, x0, y0]);
  const v10 = hashToUnitInterval([seed, x0 + 1, y0]);
  const v01 = hashToUnitInterval([seed, x0, y0 + 1]);
  const v11 = hashToUnitInterval([seed, x0 + 1, y0 + 1]);

  return lerp(lerp(v00, v10, tx), lerp(v01, v11, tx), ty);
}

/**
 * Returns deterministic Perlin-style gradient noise, approximately in [-1, 1].
 *
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 * @param {{seed?: *, frequency?: number}} options Noise options.
 * @returns {number} Perlin-style noise.
 */
export function perlinNoise2D(x, y, options = {}) {
  const frequency = normalizeFrequency(options.frequency);
  const nx = Number(x) * frequency;
  const ny = Number(y) * frequency;
  const x0 = Math.floor(nx);
  const y0 = Math.floor(ny);
  const dx = nx - x0;
  const dy = ny - y0;
  const tx = fade(dx);
  const ty = fade(dy);
  const seed = options.seed ?? "perlin";

  const n00 = gradientDot(seed, x0, y0, dx, dy);
  const n10 = gradientDot(seed, x0 + 1, y0, dx - 1, dy);
  const n01 = gradientDot(seed, x0, y0 + 1, dx, dy - 1);
  const n11 = gradientDot(seed, x0 + 1, y0 + 1, dx - 1, dy - 1);

  return Math.max(-1, Math.min(1, lerp(lerp(n00, n10, tx), lerp(n01, n11, tx), ty)));
}

/**
 * Returns deterministic Simplex-style 2D noise, approximately in [-1, 1].
 *
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 * @param {{seed?: *, frequency?: number}} options Noise options.
 * @returns {number} Simplex-style noise.
 */
export function simplexNoise2D(x, y, options = {}) {
  const frequency = normalizeFrequency(options.frequency);
  const nx = Number(x) * frequency;
  const ny = Number(y) * frequency;
  const seed = options.seed ?? "simplex";
  const skew = (nx + ny) * SIMPLEX_F2;
  const i = Math.floor(nx + skew);
  const j = Math.floor(ny + skew);
  const unskew = (i + j) * SIMPLEX_G2;
  const x0 = nx - (i - unskew);
  const y0 = ny - (j - unskew);
  const i1 = x0 > y0 ? 1 : 0;
  const j1 = x0 > y0 ? 0 : 1;
  const x1 = x0 - i1 + SIMPLEX_G2;
  const y1 = y0 - j1 + SIMPLEX_G2;
  const x2 = x0 - 1 + 2 * SIMPLEX_G2;
  const y2 = y0 - 1 + 2 * SIMPLEX_G2;

  const value = 70 * (
    simplexCorner(seed, i, j, x0, y0) +
    simplexCorner(seed, i + i1, j + j1, x1, y1) +
    simplexCorner(seed, i + 1, j + 1, x2, y2)
  );
  return Math.max(-1, Math.min(1, value));
}

/**
 * Combines octaves of a deterministic noise function.
 *
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 * @param {{seed?: *, octaves?: number, frequency?: number, lacunarity?: number, persistence?: number, noise?: Function}} options Fractal options.
 * @returns {number} Weighted fractal noise.
 */
export function fractalNoise2D(x, y, options = {}) {
  const octaves = Math.max(1, Math.floor(Number(options.octaves) || 4));
  const lacunarity = Number.isFinite(options.lacunarity) ? options.lacunarity : 2;
  const persistence = Number.isFinite(options.persistence) ? options.persistence : 0.5;
  const noise = typeof options.noise === "function" ? options.noise : valueNoise2D;
  let frequency = normalizeFrequency(options.frequency);
  let amplitude = 1;
  let total = 0;
  let amplitudeTotal = 0;

  for (let octave = 0; octave < octaves; octave += 1) {
    const seed = hashValue32([options.seed ?? "fractal", octave]);
    total += noise(x, y, { ...options, seed, frequency }) * amplitude;
    amplitudeTotal += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return amplitudeTotal === 0 ? 0 : total / amplitudeTotal;
}
