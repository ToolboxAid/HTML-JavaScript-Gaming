import {
  chance as randomChance,
  nextFloat as randomNextFloat,
  nextInt as randomNextInt,
  pick as randomPick,
  shuffle as randomShuffle,
  weightedPick as randomWeightedPick,
} from "./randomHelpers.js";

const UINT32_RANGE = 0x100000000;
const UUID_BYTE_LENGTH = 16;

function getCryptoSource() {
  const cryptoSource = globalThis.crypto;
  return cryptoSource && typeof cryptoSource.getRandomValues === "function" ? cryptoSource : null;
}

function randomUint32() {
  const cryptoSource = getCryptoSource();
  if (cryptoSource) {
    const values = new Uint32Array(1);
    cryptoSource.getRandomValues(values);
    return values[0] >>> 0;
  }

  return Math.floor(Math.random() * UINT32_RANGE) >>> 0;
}

function fillRandomBytes(bytes) {
  const cryptoSource = getCryptoSource();
  if (cryptoSource) {
    cryptoSource.getRandomValues(bytes);
    return bytes;
  }

  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Math.floor(Math.random() * 256);
  }

  return bytes;
}

function byteToHex(byte) {
  return byte.toString(16).padStart(2, "0");
}

function formatUuid(bytes) {
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, byteToHex);
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

/**
 * Nondeterministic random utility for convenience operations that do not need
 * seeded repeatability. `Random` prefers `crypto.getRandomValues()` and uses
 * `Math.random()` only as a compatibility fallback.
 */
export class Random {
  /**
   * Returns a nondeterministic number in the range [0, 1).
   *
   * @returns {number} Nondeterministic random number.
   */
  static next() {
    return randomUint32() / UINT32_RANGE;
  }

  /**
   * Returns a nondeterministic integer between min and max, inclusive.
   *
   * @param {number} min Inclusive lower bound.
   * @param {number} max Inclusive upper bound.
   * @returns {number} Random integer in the requested range.
   */
  static nextInt(min, max) {
    return randomNextInt(() => Random.next(), min, max);
  }

  /**
   * Returns a nondeterministic floating-point number in the range [min, max).
   *
   * @param {number} min Inclusive lower bound.
   * @param {number} max Exclusive upper bound.
   * @returns {number} Random float in the requested range.
   */
  static nextFloat(min, max) {
    return randomNextFloat(() => Random.next(), min, max);
  }

  /**
   * Selects one nondeterministic item from a non-empty array.
   *
   * @template T
   * @param {T[]} array Source items.
   * @returns {T} Selected item.
   */
  static pick(array) {
    return randomPick(() => Random.next(), array);
  }

  /**
   * Returns a nondeterministically shuffled copy of an array.
   *
   * @template T
   * @param {T[]} array Source items.
   * @returns {T[]} Shuffled copy.
   */
  static shuffle(array) {
    return randomShuffle(() => Random.next(), array);
  }

  /**
   * Returns true when a nondeterministic roll falls within the percent chance.
   *
   * @param {number} percent Percent chance from 0 through 100.
   * @returns {boolean} Whether the chance roll succeeds.
   */
  static chance(percent) {
    return randomChance(() => Random.next(), percent);
  }

  /**
   * Picks one nondeterministic weighted item.
   *
   * @template T
   * @param {{item?: T, value?: T, weight: number}[]} weightedItems Weighted item entries.
   * @returns {T} Selected item.
   */
  static weightedPick(weightedItems) {
    return randomWeightedPick(() => Random.next(), weightedItems);
  }

  /**
   * Creates an RFC 4122 version 4 UUID using the same nondeterministic source.
   *
   * @returns {string} Random UUID string.
   */
  static uuid() {
    return formatUuid(fillRandomBytes(new Uint8Array(UUID_BYTE_LENGTH)));
  }
}

export default Random;
