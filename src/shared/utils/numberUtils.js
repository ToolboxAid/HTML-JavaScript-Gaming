/*
Toolbox Aid
David Quesenberry
04/08/2026
numberUtils.js
*/

import {
  asFiniteNumber,
  asPositiveInteger,
  toFiniteNumber
} from '../math/numberNormalization.js';

function isFiniteNumber(value) {
  return Number.isFinite(value);
}

function asPositiveNumber(value, fallback) {
  const numeric = toFiniteNumber(value, fallback);
  if (!isFiniteNumber(numeric) || numeric <= 0) {
    return fallback;
  }
  return numeric;
}

export {
  isFiniteNumber,
  toFiniteNumber,
  asFiniteNumber,
  asPositiveInteger,
  asPositiveNumber
};
