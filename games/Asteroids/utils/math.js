/*
Toolbox Aid
David Quesenberry
03/22/2026
math.js
*/
export { randomRange } from '../../../src/shared/utils/mathUtils.js';

export const TAU = Math.PI * 2;

export function wrap(value, max) {
  const low = Math.min(0, max);
  const high = Math.max(0, max);
  const span = high - low;
  if (span === 0) {
    return low;
  }

  if (value >= low && value <= high) {
    return value;
  }

  return ((((value - low) % span) + span) % span) + low;
}
