const UINT32_RANGE = 0x100000000;
const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

function normalizeSeedValue(value) {
  const text = String(value ?? "0");
  let hash = FNV_OFFSET_BASIS;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, FNV_PRIME);
  }

  return hash >>> 0;
}

function assertFiniteNumber(value, name) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number.`);
  }
}

function assertOrderedRange(min, max) {
  assertFiniteNumber(min, "min");
  assertFiniteNumber(max, "max");

  if (max < min) {
    throw new RangeError("max must be greater than or equal to min.");
  }
}

/**
 * Deterministic seeded pseudo-random number generator for repeatable game and
 * tool workflows. `RandomSeed` is intentionally opt-in and does not replace
 * existing `Math.random()` usage.
 */
export class RandomSeed {
  /**
   * Creates a deterministic generator initialized with the provided seed.
   *
   * @param {*} initialSeed Value used to initialize the generator sequence.
   */
  constructor(initialSeed = 1) {
    this.seed(initialSeed);
  }

  /**
   * Reseeds the generator so future calls repeat the sequence for the same seed.
   *
   * @param {*} value Value used to initialize the generator sequence.
   * @returns {RandomSeed} This generator instance for chaining.
   */
  seed(value) {
    this._state = normalizeSeedValue(value);
    return this;
  }

  /**
   * Returns the next deterministic number in the range [0, 1).
   *
   * @returns {number} A deterministic pseudo-random number.
   */
  next() {
    this._state = (this._state + 0x6d2b79f5) >>> 0;
    let value = this._state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / UINT32_RANGE;
  }

  /**
   * Returns the next deterministic integer between min and max, inclusive.
   *
   * @param {number} min Inclusive lower bound.
   * @param {number} max Inclusive upper bound.
   * @returns {number} A deterministic integer inside the requested range.
   */
  nextInt(min, max) {
    assertOrderedRange(min, max);
    const lower = Math.ceil(min);
    const upper = Math.floor(max);

    if (upper < lower) {
      throw new RangeError("integer range must include at least one integer.");
    }

    return Math.floor(this.next() * (upper - lower + 1)) + lower;
  }

  /**
   * Returns the next deterministic floating-point number in the range [min, max).
   *
   * @param {number} min Inclusive lower bound.
   * @param {number} max Exclusive upper bound.
   * @returns {number} A deterministic floating-point number inside the range.
   */
  nextFloat(min, max) {
    assertOrderedRange(min, max);
    return min + this.next() * (max - min);
  }

  /**
   * Selects one deterministic item from a non-empty array.
   *
   * @template T
   * @param {T[]} array Source array to select from.
   * @returns {T} The selected array item.
   */
  pick(array) {
    if (!Array.isArray(array)) {
      throw new TypeError("array must be an array.");
    }

    if (array.length === 0) {
      throw new RangeError("array must contain at least one item.");
    }

    return array[this.nextInt(0, array.length - 1)];
  }
}

export default RandomSeed;
