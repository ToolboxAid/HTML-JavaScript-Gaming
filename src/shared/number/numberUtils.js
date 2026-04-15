import {
  asFiniteNumber,
  asPositiveInteger,
  toFiniteNumber
} from "../math/numberNormalization.js";

export { toFiniteNumber, asFiniteNumber, asPositiveInteger };

export function isFiniteNumber(value) {
  return Number.isFinite(value);
}

export function asPositiveNumber(value, fallback) {
  const numeric = toFiniteNumber(value, fallback);
  if (!isFiniteNumber(numeric) || numeric <= 0) {
    return fallback;
  }
  return numeric;
}
