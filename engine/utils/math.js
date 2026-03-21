/*
Toolbox Aid
David Quesenberry
03/21/2026
math.js
*/
export function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}
