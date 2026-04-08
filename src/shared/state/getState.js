/*
Toolbox Aid
David Quesenberry
04/08/2026
getState.js
*/

function getState({
  promoted,
  stableFrames,
  stabilityWindowFrames,
  lastReason,
  lastEvaluation
}) {
  return {
    promoted,
    stableFrames,
    stabilityWindowFrames,
    lastReason,
    lastEvaluation: lastEvaluation || null
  };
}

export { getState };
