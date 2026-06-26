const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;
const UINT32_RANGE = 0x100000000;

function stableObjectEntries(value) {
  return Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${toStableHashString(value[key])}`);
}

/**
 * Converts a value into a deterministic string suitable for non-cryptographic hashing.
 *
 * @param {*} value Value to serialize.
 * @returns {string} Stable deterministic string.
 */
export function toStableHashString(value) {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return `[${value.map(toStableHashString).join(",")}]`;
  }

  if (value instanceof Date) {
    return `date:${Number.isNaN(value.getTime()) ? "invalid" : value.toISOString()}`;
  }

  const valueType = typeof value;
  if (valueType === "object") {
    return `{${stableObjectEntries(value).join(",")}}`;
  }

  if (valueType === "number") {
    if (Number.isNaN(value)) {
      return "number:NaN";
    }
    return Object.is(value, -0) ? "number:-0" : `number:${value}`;
  }

  return `${valueType}:${String(value)}`;
}

/**
 * Computes a deterministic FNV-1a 32-bit hash for a string.
 *
 * This helper is non-cryptographic and is intended for stable bucketing,
 * procedural generation, and cache keys where security is not required.
 *
 * @param {*} value Value converted to string before hashing.
 * @param {number} seed Optional unsigned 32-bit hash seed.
 * @returns {number} Unsigned 32-bit hash.
 */
export function hashString32(value, seed = FNV_OFFSET_BASIS) {
  const text = String(value ?? "");
  let hash = seed >>> 0;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, FNV_PRIME);
  }

  return hash >>> 0;
}

/**
 * Computes a deterministic non-cryptographic 32-bit hash for any JSON-like value.
 *
 * @param {*} value Value to hash.
 * @param {number} seed Optional unsigned 32-bit hash seed.
 * @returns {number} Unsigned 32-bit hash.
 */
export function hashValue32(value, seed = FNV_OFFSET_BASIS) {
  return hashString32(toStableHashString(value), seed);
}

/**
 * Combines multiple values into one deterministic non-cryptographic 32-bit hash.
 *
 * @param {...*} values Values to combine.
 * @returns {number} Unsigned 32-bit hash.
 */
export function combineHash32(...values) {
  return values.reduce((hash, value) => hashValue32(value, hash), FNV_OFFSET_BASIS);
}

/**
 * Maps a deterministic value hash into the range [0, 1).
 *
 * @param {*} value Value to hash.
 * @param {number} seed Optional unsigned 32-bit hash seed.
 * @returns {number} Normalized hash value.
 */
export function hashToUnitInterval(value, seed = FNV_OFFSET_BASIS) {
  return hashValue32(value, seed) / UINT32_RANGE;
}

/**
 * Maps a deterministic value hash into the range [-1, 1).
 *
 * @param {*} value Value to hash.
 * @param {number} seed Optional unsigned 32-bit hash seed.
 * @returns {number} Signed normalized hash value.
 */
export function hashToSignedUnit(value, seed = FNV_OFFSET_BASIS) {
  return hashToUnitInterval(value, seed) * 2 - 1;
}
