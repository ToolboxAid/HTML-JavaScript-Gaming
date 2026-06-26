import {
  chance as randomChance,
  nextFloat as randomNextFloat,
  nextInt as randomNextInt,
  pick as randomPick,
  shuffle as randomShuffle,
  weightedPick as randomWeightedPick,
} from "./randomHelpers.js";

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
    return randomNextInt(() => this.next(), min, max);
  }

  /**
   * Returns the next deterministic floating-point number in the range [min, max).
   *
   * @param {number} min Inclusive lower bound.
   * @param {number} max Exclusive upper bound.
   * @returns {number} A deterministic floating-point number inside the range.
   */
  nextFloat(min, max) {
    return randomNextFloat(() => this.next(), min, max);
  }

  /**
   * Selects one deterministic item from a non-empty array.
   *
   * @template T
   * @param {T[]} array Source array to select from.
   * @returns {T} The selected array item.
   */
  pick(array) {
    return randomPick(() => this.next(), array);
  }

  /**
   * Returns a deterministically shuffled copy of an array.
   *
   * @template T
   * @param {T[]} array Source array to shuffle.
   * @returns {T[]} Shuffled copy.
   */
  shuffle(array) {
    return randomShuffle(() => this.next(), array);
  }

  /**
   * Returns true when the deterministic roll falls within the percent chance.
   *
   * @param {number} percent Percent chance from 0 through 100.
   * @returns {boolean} Whether the chance roll succeeds.
   */
  chance(percent) {
    return randomChance(() => this.next(), percent);
  }

  /**
   * Selects one deterministic weighted item.
   *
   * @template T
   * @param {{item?: T, value?: T, weight: number}[]} weightedItems Weighted item entries.
   * @returns {T} Selected item.
   */
  weightedPick(weightedItems) {
    return randomWeightedPick(() => this.next(), weightedItems);
  }

  /**
   * Captures the current generator state for later restoration.
   *
   * @returns {{state: number}} Serializable generator state.
   */
  saveState() {
    return { state: this._state >>> 0 };
  }

  /**
   * Restores a generator state previously returned by `saveState()`.
   *
   * @param {{state: number}} state Saved generator state.
   * @returns {RandomSeed} This generator instance for chaining.
   */
  restoreState(state) {
    const stateValue = Number(state?.state);

    if (!Number.isInteger(stateValue) || stateValue < 0 || stateValue > 0xffffffff) {
      throw new RangeError("state.state must be an unsigned 32-bit integer.");
    }

    this._state = stateValue >>> 0;
    return this;
  }
}

export default RandomSeed;
