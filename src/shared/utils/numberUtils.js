/*
Toolbox Aid
David Quesenberry
04/08/2026
numberUtils.js
*/

function asFiniteNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function asPositiveInteger(value, fallback = 1) {
  const numeric = Math.floor(asFiniteNumber(value, fallback));
  return numeric >= 1 ? numeric : fallback;
}

function asPositiveNumber(value, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return fallback;
  }
  return numeric;
}

export {
  asFiniteNumber,
  asPositiveInteger,
  asPositiveNumber
};
