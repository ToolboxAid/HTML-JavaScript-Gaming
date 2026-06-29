function defaultCloneLastEvaluation(value) {
  return value ? { ...value } : null;
}

function cloneHandoff(value) {
  if (!value || typeof value !== 'object') return null;
  return { ...value };
}

function cloneAbort(value) {
  if (!value || typeof value !== 'object') return null;
  return { ...value };
}

function cloneValidation(value) {
  if (!value || typeof value !== 'object') return null;
  return { ...value };
}

function resolveStatusMode({ promoted, lastEvaluation }) {
  const fromEvaluation = lastEvaluation && typeof lastEvaluation.mode === 'string'
    ? lastEvaluation.mode
    : '';
  if (fromEvaluation) return fromEvaluation;
  return promoted ? 'authoritative' : 'passive';
}

function resolveStatusHandoff({ handoff, lastEvaluation }) {
  if (handoff && typeof handoff === 'object') return cloneHandoff(handoff);
  return cloneHandoff(lastEvaluation?.handoff);
}

function resolveStatusAbort({ lastEvaluation }) {
  return cloneAbort(lastEvaluation?.abort);
}

function resolveStatusValidation({ lastEvaluation }) {
  return cloneValidation(lastEvaluation?.validation);
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
  const resolvedHandoff = resolveStatusHandoff({ handoff, lastEvaluation: snapshot.lastEvaluation });
  if (resolvedHandoff !== null) snapshot.handoff = resolvedHandoff;
  snapshot.status = {
    mode: resolveStatusMode({ promoted, lastEvaluation: snapshot.lastEvaluation }),
    handoff: resolvedHandoff,
    abort: resolveStatusAbort({ lastEvaluation: snapshot.lastEvaluation }),
    validation: resolveStatusValidation({ lastEvaluation: snapshot.lastEvaluation })
  };
  return snapshot;
}
