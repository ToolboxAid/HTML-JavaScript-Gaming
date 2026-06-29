/*
Toolbox Aid
David Quesenberry
04/15/2026
ClientReconciliationStrategy.js
*/
export const REPLICATION_IGNORE_REASONS = Object.freeze({
  STALE_TICK: 'stale_tick',
  STALE_SEQUENCE: 'stale_sequence',
  INVALID_ENVELOPE: 'invalid_envelope',
});

export function compareReplicationEnvelopeOrder(left, right) {
  return (
    (left.authoritativeTick - right.authoritativeTick)
    || (left.replicationSequence - right.replicationSequence)
    || (left.receivedOrder - right.receivedOrder)
  );
}

export function isReplicationEnvelopeStale(
  envelope,
  { lastAppliedTick = -1, lastAppliedSequence = -1 } = {},
) {
  if (envelope.authoritativeTick < lastAppliedTick) {
    return {
      stale: true,
      reason: REPLICATION_IGNORE_REASONS.STALE_TICK,
    };
  }

  if (
    envelope.authoritativeTick === lastAppliedTick
    && envelope.replicationSequence <= lastAppliedSequence
  ) {
    return {
      stale: true,
      reason: REPLICATION_IGNORE_REASONS.STALE_SEQUENCE,
    };
  }

  return {
    stale: false,
    reason: null,
  };
}

export default class ClientReconciliationStrategy {
  shouldApply(envelope, status) {
    const staleCheck = isReplicationEnvelopeStale(envelope, status);
    return {
      apply: !staleCheck.stale,
      reason: staleCheck.reason,
    };
  }

  sort(envelopes) {
    return envelopes.slice().sort(compareReplicationEnvelopeOrder);
  }
}

