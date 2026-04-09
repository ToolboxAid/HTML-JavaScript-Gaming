function defaultCloneLastEvaluation(value) {
  return value ? { ...value } : null;
}

function cloneHandoff(value) {
  if (!value || typeof value !== 'object') return null;
  return { ...value };
}

export function createPromotionStateSnapshot({
  promoted,
  stableFrames,
  stabilityWindowFrames,
  lastReason,
  lastEvaluation,
  handoff,
  cloneLastEvaluation
}) {
  const snapshot = {
    promoted,
    stableFrames,
    stabilityWindowFrames,
    lastReason,
    lastEvaluation: (typeof cloneLastEvaluation === 'function'
      ? cloneLastEvaluation
      : defaultCloneLastEvaluation)(lastEvaluation)
  };
  if (handoff !== undefined) {
    snapshot.handoff = cloneHandoff(handoff);
  }
  return snapshot;
}
