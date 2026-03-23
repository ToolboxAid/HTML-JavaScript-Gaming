/*
Toolbox Aid
David Quesenberry
03/21/2026
math.js
*/
export function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

export function distance(a, b) {
  const dx = (a?.x ?? 0) - (b?.x ?? 0);
  const dy = (a?.y ?? 0) - (b?.y ?? 0);
  return Math.sqrt(dx * dx + dy * dy);
}

export function wrap(value, min, max) {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  const span = high - low;
  if (span === 0) {
    return low;
  }

  if (value < low) {
    return value + span;
  }
  if (value > high) {
    return value - span;
  }
  return value;
}

export function randomRange(min, max, rng = Math.random) {
  return min + rng() * (max - min);
}
