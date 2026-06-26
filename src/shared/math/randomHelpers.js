import { assertArray, assertFiniteNumber, assertOrderedRange } from "../validation/assert.js";

function assertRandomNext(randomNext) {
  if (typeof randomNext !== "function") {
    throw new TypeError("randomNext must be a function.");
  }
}

function readRandomValue(randomNext) {
  assertRandomNext(randomNext);
  const value = Number(randomNext());

  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError("randomNext must return a finite number >= 0 and < 1.");
  }

  return value;
}

function readWeightedItem(entry) {
  if (!entry || typeof entry !== "object") {
    throw new TypeError("weightedItems entries must be objects.");
  }

  if (!Object.hasOwn(entry, "item") && !Object.hasOwn(entry, "value")) {
    throw new TypeError("weightedItems entries must include item or value.");
  }

  const weight = Number(entry.weight);
  if (!Number.isFinite(weight) || weight <= 0) {
    throw new RangeError("weightedItems entries must include a positive finite weight.");
  }

  return {
    item: Object.hasOwn(entry, "item") ? entry.item : entry.value,
    weight,
  };
}

/**
 * Returns an integer between min and max, inclusive, using the supplied random source.
 *
 * @param {Function} randomNext Function returning a float >= 0 and < 1.
 * @param {number} min Inclusive lower bound.
 * @param {number} max Inclusive upper bound.
 * @returns {number} Random integer in the requested range.
 */
export function nextInt(randomNext, min, max) {
  assertOrderedRange(min, max);
  const lower = Math.ceil(min);
  const upper = Math.floor(max);

  if (upper < lower) {
    throw new RangeError("integer range must include at least one integer.");
  }

  return Math.floor(readRandomValue(randomNext) * (upper - lower + 1)) + lower;
}

/**
 * Returns a float in the range [min, max), using the supplied random source.
 *
 * @param {Function} randomNext Function returning a float >= 0 and < 1.
 * @param {number} min Inclusive lower bound.
 * @param {number} max Exclusive upper bound.
 * @returns {number} Random float in the requested range.
 */
export function nextFloat(randomNext, min, max) {
  assertOrderedRange(min, max);
  return min + readRandomValue(randomNext) * (max - min);
}

/**
 * Picks one item from a non-empty array using the supplied random source.
 *
 * @template T
 * @param {Function} randomNext Function returning a float >= 0 and < 1.
 * @param {T[]} array Source items.
 * @returns {T} Selected item.
 */
export function pick(randomNext, array) {
  assertArray(array, "array");

  if (array.length === 0) {
    throw new RangeError("array must contain at least one item.");
  }

  return array[nextInt(randomNext, 0, array.length - 1)];
}

/**
 * Returns a shuffled copy of an array using the supplied random source.
 *
 * @template T
 * @param {Function} randomNext Function returning a float >= 0 and < 1.
 * @param {T[]} array Source items.
 * @returns {T[]} Shuffled copy.
 */
export function shuffle(randomNext, array) {
  assertArray(array, "array");
  const shuffled = [...array];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = nextInt(randomNext, 0, index);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

/**
 * Returns true when the supplied random source falls within the percent chance.
 *
 * @param {Function} randomNext Function returning a float >= 0 and < 1.
 * @param {number} percent Percent chance from 0 through 100.
 * @returns {boolean} Whether the chance roll succeeds.
 */
export function chance(randomNext, percent) {
  assertFiniteNumber(percent, "percent");

  if (percent < 0 || percent > 100) {
    throw new RangeError("percent must be between 0 and 100.");
  }

  if (percent === 0) {
    return false;
  }

  if (percent === 100) {
    return true;
  }

  return readRandomValue(randomNext) < percent / 100;
}

/**
 * Picks one weighted item using positive finite item weights.
 *
 * @template T
 * @param {Function} randomNext Function returning a float >= 0 and < 1.
 * @param {{item?: T, value?: T, weight: number}[]} weightedItems Weighted item entries.
 * @returns {T} Selected item.
 */
export function weightedPick(randomNext, weightedItems) {
  assertArray(weightedItems, "weightedItems");

  if (weightedItems.length === 0) {
    throw new RangeError("weightedItems must contain at least one item.");
  }

  const entries = weightedItems.map(readWeightedItem);
  const totalWeight = entries.reduce((total, entry) => total + entry.weight, 0);
  const threshold = nextFloat(randomNext, 0, totalWeight);
  let cursor = 0;

  for (const entry of entries) {
    cursor += entry.weight;
    if (threshold < cursor) {
      return entry.item;
    }
  }

  return entries.at(-1).item;
}
