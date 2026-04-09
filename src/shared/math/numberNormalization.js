export function toFiniteNumber(value, fallback = NaN) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function roundNumber(value) {
  if (!Number.isFinite(value)) {
    return value;
  }
  return Number(value.toFixed(6));
}
