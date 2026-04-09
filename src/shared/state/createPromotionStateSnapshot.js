function defaultCloneLastEvaluation(value) {
  return value ? { ...value } : null;
}

export function createPromotionStateSnapshot({
  promoted,
  stableFrames,
  stabilityWindowFrames,
  lastReason,
  lastEvaluation,
  cloneLastEvaluation
}) {
  return {
    promoted,
    stableFrames,
    stabilityWindowFrames,
    lastReason,
    lastEvaluation: (typeof cloneLastEvaluation === 'function'
      ? cloneLastEvaluation
      : defaultCloneLastEvaluation)(lastEvaluation)
  };
}
