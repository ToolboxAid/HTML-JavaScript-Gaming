/*
Toolbox Aid
David Quesenberry
04/08/2026
getState.js
*/

import { createPromotionStateSnapshot } from './createPromotionStateSnapshot.js';
import { createNormalizedPromotionSnapshot } from './normalization.js';

function getState({
  promoted,
  stableFrames,
  stabilityWindowFrames,
  lastReason,
  lastEvaluation,
  cloneLastEvaluation
} = {}) {
  if (typeof cloneLastEvaluation === "function") {
    return createPromotionStateSnapshot({
      promoted,
      stableFrames,
      stabilityWindowFrames,
      lastReason,
      lastEvaluation,
      cloneLastEvaluation
    });
  }

  return createNormalizedPromotionSnapshot({
    promoted,
    stableFrames,
    stabilityWindowFrames,
    lastReason,
    lastEvaluation,
    handoff: lastEvaluation?.handoff
  });
}

export { getState };
