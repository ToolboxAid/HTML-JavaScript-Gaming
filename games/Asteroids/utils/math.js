/*
Toolbox Aid
David Quesenberry
03/22/2026
math.js
*/
import { randomRange as sharedRandomRange, wrap as sharedWrap } from '../../../engine/utils/math.js';

export const TAU = Math.PI * 2;

export function wrap(value, max) {
  return sharedWrap(value, 0, max);
}

export function randomRange(min, max, rng = Math.random) {
  return sharedRandomRange(min, max, rng);
}
