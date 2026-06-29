export function toFiniteNumber(value, fallback = NaN) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function asFiniteNumber(value, fallback = 0) {
  return toFiniteNumber(value, fallback);
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

export function asFinite(value, fallback = 0) {
  return Number.isFinite(value) ? Number(value) : fallback;
}

export function asNonNegativeInteger(value, fallback = 0) {
  const normalized = Math.floor(asFinite(value, fallback));
  return normalized >= 0 ? normalized : Math.max(0, Math.floor(asFinite(fallback, 0)));
}

export function asPositiveInteger(value, fallback = 1) {
  const normalized = Math.floor(asFiniteNumber(value, fallback));
  return normalized >= 1 ? normalized : fallback;
}

export function roundNumber(value) {
  if (!Number.isFinite(value)) {
    return value;
  }
  return Number(value.toFixed(6));
}
