export function toFiniteNumber(value, fallback = NaN) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function asNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function sanitizeFiniteNumber(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

export function sanitizePositiveNumber(value, fallback) {
  const number = sanitizeFiniteNumber(value, fallback);
  return number > 0 ? number : fallback;
}

export function roundNumber(value) {
  if (!Number.isFinite(value)) {
    return value;
  }
  return Number(value.toFixed(6));
}
