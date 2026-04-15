/*
Toolbox Aid
David Quesenberry
04/15/2026
ClientReplicationApplicationLayer.js
*/
import ClientReconciliationStrategy, {
  REPLICATION_IGNORE_REASONS,
} from './ClientReconciliationStrategy.js';
import ReplicationMessageContract from './ReplicationMessageContract.js';
import StateReplication from './StateReplication.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export default class ClientReplicationApplicationLayer {
  constructor({
    sessionId = 'session',
    contract = null,
    reconciliationStrategy = null,
    stateReplication = null,
  } = {}) {
    this.sessionId = sessionId;
    this.contract = contract || new ReplicationMessageContract({ sessionId });
    this.reconciliationStrategy = reconciliationStrategy || new ClientReconciliationStrategy();
    this.stateReplication = stateReplication || new StateReplication();

    this.pendingEnvelopes = [];
    this.ignoredEnvelopes = [];
    this.replicatedState = [];
    this.lastAppliedTick = -1;
    this.lastAppliedSequence = -1;
    this.appliedCount = 0;
    this.ignoredCount = 0;
    this.nextReceivedOrder = 0;
  }

  ingestReplicationEnvelope(envelope, { receivedAtMs = 0 } = {}) {
    const validation = this.contract.validate(envelope, { sessionId: this.sessionId });
    if (!validation.ok) {
      this.ignoredEnvelopes.push({
        reason: REPLICATION_IGNORE_REASONS.INVALID_ENVELOPE,
        code: validation.code,
        envelope: envelope ? clone(envelope) : null,
      });
      this.ignoredCount += 1;
      return {
        ok: false,
        code: validation.code,
        message: validation.message,
      };
    }

    const normalized = this.contract.normalize(envelope, {
      receivedAtMs,
      receivedOrder: this.nextReceivedOrder,
    });
    this.nextReceivedOrder += 1;
    this.pendingEnvelopes.push(normalized);
    return {
      ok: true,
      pending: this.pendingEnvelopes.length,
    };
  }

  applyPendingReplication() {
    const orderedEnvelopes = this.reconciliationStrategy.sort(this.pendingEnvelopes);
    this.pendingEnvelopes.length = 0;

    let applied = 0;
    let ignored = 0;
    orderedEnvelopes.forEach((envelope) => {
      const decision = this.reconciliationStrategy.shouldApply(envelope, {
        lastAppliedTick: this.lastAppliedTick,
        lastAppliedSequence: this.lastAppliedSequence,
      });

      if (!decision.apply) {
        this.ignoredEnvelopes.push({
          reason: decision.reason,
          envelope: clone(envelope),
        });
        this.ignoredCount += 1;
        ignored += 1;
        return;
      }

      const baseState = envelope.snapshotType === 'full' ? [] : this.replicatedState;
      this.replicatedState = this.stateReplication.applySnapshot(envelope.snapshot, baseState);
      this.lastAppliedTick = envelope.authoritativeTick;
      this.lastAppliedSequence = envelope.replicationSequence;
      this.appliedCount += 1;
      applied += 1;
    });

    return {
      applied,
      ignored,
      snapshot: this.getReplicationStatus(),
    };
  }

  getReplicatedStateSnapshot() {
    return clone(this.replicatedState);
  }

  getIgnoredEnvelopes() {
    return this.ignoredEnvelopes.map((entry) => clone(entry));
  }

  getReplicationStatus() {
    return {
      sessionId: this.sessionId,
      lastAppliedTick: this.lastAppliedTick,
      lastAppliedSequence: this.lastAppliedSequence,
      appliedCount: this.appliedCount,
      ignoredCount: this.ignoredCount,
      pendingEnvelopes: this.pendingEnvelopes.length,
      stateEntities: this.replicatedState.length,
      contract: this.contract.getStats(),
    };
  }
}

