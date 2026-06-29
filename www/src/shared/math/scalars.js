/*
Toolbox Aid
David Quesenberry
04/29/2026
scalars.js
*/
export const TAU = Math.PI * 2;

export function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

export function distance(a, b) {
  const dx = (a?.x ?? 0) - (b?.x ?? 0);
  const dy = (a?.y ?? 0) - (b?.y ?? 0);
  return Math.sqrt(dx * dx + dy * dy);
}

export function near(a, b, epsilon = 0.5) {
  return Math.abs(a - b) <= epsilon;
}

export function wrap(value, min = 0, max) {
  const rangeMin = max === undefined ? 0 : min;
  const rangeMax = max === undefined ? min : max;
  const low = Math.min(rangeMin, rangeMax);
  const high = Math.max(rangeMin, rangeMax);
  const span = high - low;
  if (span === 0) {
    return low;
  }

  if (value >= low && value <= high) {
    return value;
  }

  return ((((value - low) % span) + span) % span) + low;
}

export function randomRange(min, max, rng = Math.random) {
  return min + rng() * (max - min);
}
