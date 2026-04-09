/*
Toolbox Aid
David Quesenberry
04/08/2026
getState.js
*/

import { createPromotionStateSnapshot } from './createPromotionStateSnapshot.js';

function getState({
  promoted,
  stableFrames,
  stabilityWindowFrames,
  lastReason,
  lastEvaluation,
  cloneLastEvaluation
} = {}) {
  return createPromotionStateSnapshot({
    promoted,
    stableFrames,
    stabilityWindowFrames,
    lastReason,
    lastEvaluation,
    cloneLastEvaluation
  });
}

export { getState };
