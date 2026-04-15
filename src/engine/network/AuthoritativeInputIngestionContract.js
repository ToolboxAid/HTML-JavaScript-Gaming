/*
Toolbox Aid
David Quesenberry
04/15/2026
AuthoritativeInputIngestionContract.js
*/
export const INPUT_INGESTION_REJECTION_CODES = Object.freeze({
  ENVELOPE_REQUIRED: 'ENVELOPE_REQUIRED',
  SESSION_ID_REQUIRED: 'SESSION_ID_REQUIRED',
  SESSION_MISMATCH: 'SESSION_MISMATCH',
  CLIENT_ID_REQUIRED: 'CLIENT_ID_REQUIRED',
  SEQUENCE_INVALID: 'SEQUENCE_INVALID',
  INPUT_TYPE_REQUIRED: 'INPUT_TYPE_REQUIRED',
  PAYLOAD_OBJECT_REQUIRED: 'PAYLOAD_OBJECT_REQUIRED',
  SENT_AT_INVALID: 'SENT_AT_INVALID',
  SERVER_OWNERSHIP_VIOLATION: 'SERVER_OWNERSHIP_VIOLATION',
});

export const SERVER_OWNED_STATE_FIELDS = Object.freeze([
  'authoritativeTick',
  'runtimePhase',
  'connectedClients',
  'acceptedInputQueue',
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

export function validateClientInputEnvelope(envelope, { sessionId = null } = {}) {
  if (!isPlainObject(envelope)) {
    return createReject(
      INPUT_INGESTION_REJECTION_CODES.ENVELOPE_REQUIRED,
      'Input envelope must be a plain object.',
    );
  }

  if (typeof envelope.sessionId !== 'string' || envelope.sessionId.length === 0) {
    return createReject(
      INPUT_INGESTION_REJECTION_CODES.SESSION_ID_REQUIRED,
      'sessionId must be a non-empty string.',
    );
  }

  if (typeof sessionId === 'string' && sessionId.length > 0 && envelope.sessionId !== sessionId) {
    return createReject(
      INPUT_INGESTION_REJECTION_CODES.SESSION_MISMATCH,
      'Input envelope sessionId does not match runtime session.',
    );
  }

  if (typeof envelope.clientId !== 'string' || envelope.clientId.length === 0) {
    return createReject(
      INPUT_INGESTION_REJECTION_CODES.CLIENT_ID_REQUIRED,
      'clientId must be a non-empty string.',
    );
  }

  if (!Number.isInteger(envelope.sequence) || envelope.sequence < 0) {
    return createReject(
      INPUT_INGESTION_REJECTION_CODES.SEQUENCE_INVALID,
      'sequence must be a non-negative integer.',
    );
  }

  if (typeof envelope.inputType !== 'string' || envelope.inputType.length === 0) {
    return createReject(
      INPUT_INGESTION_REJECTION_CODES.INPUT_TYPE_REQUIRED,
      'inputType must be a non-empty string.',
    );
  }

  if (!isPlainObject(envelope.payload)) {
    return createReject(
      INPUT_INGESTION_REJECTION_CODES.PAYLOAD_OBJECT_REQUIRED,
      'payload must be a plain object.',
    );
  }

  if (!Number.isFinite(envelope.sentAtMs)) {
    return createReject(
      INPUT_INGESTION_REJECTION_CODES.SENT_AT_INVALID,
      'sentAtMs must be a finite number.',
    );
  }

  const violatingKey = SERVER_OWNED_STATE_FIELDS.find(
    (serverOwnedField) => Object.prototype.hasOwnProperty.call(envelope.payload, serverOwnedField),
  );
  if (violatingKey) {
    return createReject(
      INPUT_INGESTION_REJECTION_CODES.SERVER_OWNERSHIP_VIOLATION,
      `payload cannot include server-owned field: ${violatingKey}`,
    );
  }

  return { ok: true };
}

export function normalizeClientInputEnvelope(
  envelope,
  { acceptedAtTick = 0, acceptedAtMs = 0 } = {},
) {
  return {
    sessionId: envelope.sessionId,
    clientId: envelope.clientId,
    sequence: envelope.sequence,
    inputType: envelope.inputType,
    payload: clone(envelope.payload),
    sentAtMs: Number(envelope.sentAtMs),
    acceptedAtTick,
    acceptedAtMs,
  };
}

export default class AuthoritativeInputIngestionContract {
  constructor({ sessionId = 'session' } = {}) {
    this.sessionId = sessionId;
    this.stats = {
      accepted: 0,
      rejected: 0,
    };
  }

  validate(envelope, { sessionId = this.sessionId } = {}) {
    const result = validateClientInputEnvelope(envelope, { sessionId });
    if (result.ok) {
      this.stats.accepted += 1;
    } else {
      this.stats.rejected += 1;
    }
    return result;
  }

  normalize(envelope, metadata = {}) {
    return normalizeClientInputEnvelope(envelope, metadata);
  }

  getStats() {
    return {
      ...this.stats,
      sessionId: this.sessionId,
    };
  }
}

