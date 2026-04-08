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
    lastEvaluation: typeof cloneLastEvaluation === 'function'
      ? cloneLastEvaluation(lastEvaluation)
      : lastEvaluation ?? null
  };
}
