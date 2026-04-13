/*
Toolbox Aid
David Quesenberry
04/08/2026
numberUtils.js
*/

function asFiniteNumber(value, fallback = 0) {
  return toFiniteNumber(value, fallback);
}

function isFiniteNumber(value) {
  return Number.isFinite(value);
}

function toFiniteNumber(value, fallback = 0) {
  const numeric = Number(value);
  return isFiniteNumber(numeric) ? numeric : fallback;
}

function asPositiveInteger(value, fallback = 1) {
  const numeric = Math.floor(asFiniteNumber(value, fallback));
  return numeric >= 1 ? numeric : fallback;
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
