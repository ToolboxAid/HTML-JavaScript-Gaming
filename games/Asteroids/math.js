/*
Toolbox Aid
David Quesenberry
03/22/2026
math.js
*/
export const TAU = Math.PI * 2;

export function wrap(value, max) {
  if (value < 0) {
    return value + max;
  }
  if (value > max) {
    return value - max;
  }
  return value;
}

export function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function randomRange(min, max) {
  return min + Math.random() * (max - min);
}
