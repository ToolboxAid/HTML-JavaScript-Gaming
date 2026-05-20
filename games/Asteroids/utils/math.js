/*
Toolbox Aid
David Quesenberry
03/22/2026
math.js
*/
import { wrap as sharedWrap } from '../../../src/shared/utils/mathUtils.js';

export { randomRange } from '../../../src/shared/utils/mathUtils.js';

export const TAU = Math.PI * 2;

export function wrap(value, max) {
  return sharedWrap(value, 0, max);
}
