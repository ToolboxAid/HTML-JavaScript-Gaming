/*
Toolbox Aid
David Quesenberry
04/15/2026
ReplicationMessageContract.js
*/
export const REPLICATION_SNAPSHOT_TYPES = Object.freeze({
  FULL: 'full',
  DELTA: 'delta',
});

export const REPLICATION_MESSAGE_REJECTION_CODES = Object.freeze({
  ENVELOPE_REQUIRED: 'ENVELOPE_REQUIRED',
  SESSION_ID_REQUIRED: 'SESSION_ID_REQUIRED',
  SESSION_MISMATCH: 'SESSION_MISMATCH',
  REPLICATION_SEQUENCE_INVALID: 'REPLICATION_SEQUENCE_INVALID',
  AUTHORITATIVE_TICK_INVALID: 'AUTHORITATIVE_TICK_INVALID',
  SNAPSHOT_TYPE_INVALID: 'SNAPSHOT_TYPE_INVALID',
  SNAPSHOT_REQUIRED: 'SNAPSHOT_REQUIRED',
  SNAPSHOT_ENTITIES_INVALID: 'SNAPSHOT_ENTITIES_INVALID',
  SNAPSHOT_DESPAWNED_INVALID: 'SNAPSHOT_DESPAWNED_INVALID',
  SENT_AT_INVALID: 'SENT_AT_INVALID',
  CLIENT_METADATA_COLLISION: 'CLIENT_METADATA_COLLISION',
});

const CLIENT_OWNED_METADATA_FIELDS = Object.freeze([
  'lastAppliedTick',
  'lastAppliedSequence',
  'pendingEnvelopes',
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return value !== null
    && typeof value === 'object'
    && Object.getPrototypeOf(value) === Object.prototype;
}

function createReject(code, message) {
  return {
    ok: false,
    code,
    message,
  };
}

function validateSnapshotShape(snapshot) {
  if (!isPlainObject(snapshot)) {
    return createReject(
      REPLICATION_MESSAGE_REJECTION_CODES.SNAPSHOT_REQUIRED,
      'snapshot must be a plain object.',
    );
  }

  if (!Array.isArray(snapshot.entities)) {
    return createReject(
      REPLICATION_MESSAGE_REJECTION_CODES.SNAPSHOT_ENTITIES_INVALID,
      'snapshot.entities must be an array.',
    );
  }

  if (snapshot.despawned !== undefined && !Array.isArray(snapshot.despawned)) {
    return createReject(
      REPLICATION_MESSAGE_REJECTION_CODES.SNAPSHOT_DESPAWNED_INVALID,
      'snapshot.despawned must be an array when provided.',
    );
  }

  const collisionField = CLIENT_OWNED_METADATA_FIELDS.find(
    (fieldName) => Object.prototype.hasOwnProperty.call(snapshot, fieldName),
  );
  if (collisionField) {
    return createReject(
      REPLICATION_MESSAGE_REJECTION_CODES.CLIENT_METADATA_COLLISION,
      `snapshot cannot include client-owned metadata field: ${collisionField}`,
    );
  }

  return { ok: true };
}

export function validateReplicationEnvelope(envelope, { sessionId = null } = {}) {
  if (!isPlainObject(envelope)) {
    return createReject(
      REPLICATION_MESSAGE_REJECTION_CODES.ENVELOPE_REQUIRED,
      'Replication envelope must be a plain object.',
    );
  }

  if (typeof envelope.sessionId !== 'string' || envelope.sessionId.length === 0) {
    return createReject(
      REPLICATION_MESSAGE_REJECTION_CODES.SESSION_ID_REQUIRED,
      'sessionId must be a non-empty string.',
    );
  }

  if (typeof sessionId === 'string' && sessionId.length > 0 && envelope.sessionId !== sessionId) {
    return createReject(
      REPLICATION_MESSAGE_REJECTION_CODES.SESSION_MISMATCH,
      'Replication envelope sessionId does not match client session.',
    );
  }

  if (!Number.isInteger(envelope.replicationSequence) || envelope.replicationSequence < 0) {
    return createReject(
      REPLICATION_MESSAGE_REJECTION_CODES.REPLICATION_SEQUENCE_INVALID,
      'replicationSequence must be a non-negative integer.',
    );
  }

  if (!Number.isInteger(envelope.authoritativeTick) || envelope.authoritativeTick < 0) {
    return createReject(
      REPLICATION_MESSAGE_REJECTION_CODES.AUTHORITATIVE_TICK_INVALID,
      'authoritativeTick must be a non-negative integer.',
    );
  }

  if (!Object.values(REPLICATION_SNAPSHOT_TYPES).includes(envelope.snapshotType)) {
    return createReject(
      REPLICATION_MESSAGE_REJECTION_CODES.SNAPSHOT_TYPE_INVALID,
      'snapshotType must be either full or delta.',
    );
  }

  const snapshotValidation = validateSnapshotShape(envelope.snapshot);
  if (!snapshotValidation.ok) {
    return snapshotValidation;
  }

  if (!Number.isFinite(envelope.sentAtMs)) {
    return createReject(
      REPLICATION_MESSAGE_REJECTION_CODES.SENT_AT_INVALID,
      'sentAtMs must be a finite number.',
    );
  }

  return { ok: true };
}

export function normalizeReplicationEnvelope(
  envelope,
  { receivedAtMs = 0, receivedOrder = 0 } = {},
) {
  return {
    sessionId: envelope.sessionId,
    replicationSequence: envelope.replicationSequence,
    authoritativeTick: envelope.authoritativeTick,
    snapshotType: envelope.snapshotType,
    snapshot: {
      tick: envelope.authoritativeTick,
      entities: clone(envelope.snapshot.entities || []),
      despawned: clone(envelope.snapshot.despawned || []),
    },
    sentAtMs: Number(envelope.sentAtMs),
    receivedAtMs,
    receivedOrder,
  };
}

export default class ReplicationMessageContract {
  constructor({ sessionId = 'session' } = {}) {
    this.sessionId = sessionId;
    this.stats = {
      accepted: 0,
      rejected: 0,
    };
  }

  validate(envelope, { sessionId = this.sessionId } = {}) {
    const result = validateReplicationEnvelope(envelope, { sessionId });
    if (result.ok) {
      this.stats.accepted += 1;
    } else {
      this.stats.rejected += 1;
    }
    return result;
  }

  normalize(envelope, metadata = {}) {
    return normalizeReplicationEnvelope(envelope, metadata);
  }

  getStats() {
    return {
      ...this.stats,
      sessionId: this.sessionId,
    };
  }
}

