/*
Toolbox Aid
David Quesenberry
04/15/2026
AuthoritativeServerRuntime.js
*/
import AuthoritativeInputIngestionContract from './AuthoritativeInputIngestionContract.js';

export const SERVER_RUNTIME_PHASES = Object.freeze({
  IDLE: 'idle',
  RUNNING: 'running',
  STOPPED: 'stopped',
  FAILED: 'failed',
});

export const SERVER_RUNTIME_INGEST_REJECTION_CODES = Object.freeze({
  SERVER_RUNTIME_NOT_RUNNING: 'SERVER_RUNTIME_NOT_RUNNING',
  INPUT_QUEUE_FULL: 'INPUT_QUEUE_FULL',
  DUPLICATE_OR_OUT_OF_ORDER_SEQUENCE: 'DUPLICATE_OR_OUT_OF_ORDER_SEQUENCE',
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sanitizeTickRate(tickRateHz) {
  if (!Number.isFinite(tickRateHz) || tickRateHz <= 0) {
    throw new TypeError('tickRateHz must be a finite number greater than 0.');
  }
  return tickRateHz;
}

export default class AuthoritativeServerRuntime {
  constructor({
    sessionId = 'session',
    tickRateHz = 20,
    maxInputQueueSize = 512,
    ingestionContract = null,
  } = {}) {
    this.sessionId = sessionId;
    this.tickRateHz = sanitizeTickRate(tickRateHz);
    this.tickIntervalMs = 1000 / this.tickRateHz;
    this.maxInputQueueSize = maxInputQueueSize;
    this.ingestionContract = ingestionContract
      || new AuthoritativeInputIngestionContract({ sessionId: this.sessionId });

    this.runtimePhase = SERVER_RUNTIME_PHASES.IDLE;
    this.authoritativeTick = 0;
    this.runtimeTimeMs = 0;
    this.tickAccumulatorMs = 0;
    this.lastStopReason = 'not-started';

    this.acceptedInputQueue = [];
    this.rejectedInputLog = [];
    this.connectedClients = new Map();
    this.nextAcceptedOrdinal = 0;
  }

  start({ sessionId = this.sessionId, tickRateHz = this.tickRateHz } = {}) {
    this.sessionId = sessionId;
    this.tickRateHz = sanitizeTickRate(tickRateHz);
    this.tickIntervalMs = 1000 / this.tickRateHz;

    this.runtimePhase = SERVER_RUNTIME_PHASES.RUNNING;
    this.authoritativeTick = 0;
    this.runtimeTimeMs = 0;
    this.tickAccumulatorMs = 0;
    this.lastStopReason = null;
    this.acceptedInputQueue.length = 0;
    this.rejectedInputLog.length = 0;
    this.connectedClients.clear();
    this.nextAcceptedOrdinal = 0;

    return this.getSnapshot();
  }

  stop(reason = 'manual') {
    this.runtimePhase = SERVER_RUNTIME_PHASES.STOPPED;
    this.lastStopReason = reason;
    return this.getSnapshot();
  }

  step(dtSeconds) {
    if (this.runtimePhase !== SERVER_RUNTIME_PHASES.RUNNING) {
      return {
        ok: false,
        code: SERVER_RUNTIME_INGEST_REJECTION_CODES.SERVER_RUNTIME_NOT_RUNNING,
        ticksAdvanced: 0,
        snapshot: this.getSnapshot(),
      };
    }

    if (!Number.isFinite(dtSeconds) || dtSeconds < 0) {
      throw new TypeError('dtSeconds must be a finite number >= 0.');
    }

    const dtMs = dtSeconds * 1000;
    this.runtimeTimeMs += dtMs;
    this.tickAccumulatorMs += dtMs;

    let ticksAdvanced = 0;
    while (this.tickAccumulatorMs >= this.tickIntervalMs) {
      this.tickAccumulatorMs -= this.tickIntervalMs;
      this.authoritativeTick += 1;
      ticksAdvanced += 1;
    }

    return {
      ok: true,
      ticksAdvanced,
      snapshot: this.getSnapshot(),
    };
  }

  ingestClientInput(envelope) {
    if (this.runtimePhase !== SERVER_RUNTIME_PHASES.RUNNING) {
      return this.recordRejectedInput(
        envelope,
        SERVER_RUNTIME_INGEST_REJECTION_CODES.SERVER_RUNTIME_NOT_RUNNING,
        'Server runtime must be running before ingesting client input.',
      );
    }

    if (this.acceptedInputQueue.length >= this.maxInputQueueSize) {
      return this.recordRejectedInput(
        envelope,
        SERVER_RUNTIME_INGEST_REJECTION_CODES.INPUT_QUEUE_FULL,
        'Input queue is at capacity.',
      );
    }

    const validation = this.ingestionContract.validate(envelope, { sessionId: this.sessionId });
    if (!validation.ok) {
      return this.recordRejectedInput(envelope, validation.code, validation.message);
    }

    const clientState = this.connectedClients.get(envelope.clientId) || {
      lastSequence: -1,
      acceptedInputs: 0,
    };
    if (envelope.sequence <= clientState.lastSequence) {
      return this.recordRejectedInput(
        envelope,
        SERVER_RUNTIME_INGEST_REJECTION_CODES.DUPLICATE_OR_OUT_OF_ORDER_SEQUENCE,
        'Input sequence must increase for each client.',
      );
    }

    const accepted = this.ingestionContract.normalize(envelope, {
      acceptedAtTick: this.authoritativeTick,
      acceptedAtMs: this.runtimeTimeMs,
    });
    accepted.ordinal = this.nextAcceptedOrdinal;
    this.nextAcceptedOrdinal += 1;
    this.acceptedInputQueue.push(accepted);

    this.connectedClients.set(envelope.clientId, {
      lastSequence: envelope.sequence,
      acceptedInputs: clientState.acceptedInputs + 1,
    });

    return {
      ok: true,
      envelope: clone(accepted),
      queueDepth: this.acceptedInputQueue.length,
    };
  }

  recordRejectedInput(envelope, code, message) {
    const entry = {
      code,
      message,
      envelope: envelope ? clone(envelope) : null,
      atTick: this.authoritativeTick,
    };
    this.rejectedInputLog.push(entry);
    return {
      ok: false,
      code,
      message,
    };
  }

  drainAcceptedInputs() {
    const drained = this.acceptedInputQueue
      .slice()
      .sort((left, right) => (
        (left.acceptedAtTick - right.acceptedAtTick)
        || left.clientId.localeCompare(right.clientId)
        || (left.sequence - right.sequence)
        || (left.ordinal - right.ordinal)
      ))
      .map((entry) => clone(entry));

    this.acceptedInputQueue.length = 0;
    return drained;
  }

  getRejectedInputs() {
    return this.rejectedInputLog.map((entry) => clone(entry));
  }

  getSnapshot() {
    const connectedClients = [...this.connectedClients.entries()]
      .map(([clientId, state]) => ({
        clientId,
        lastSequence: state.lastSequence,
        acceptedInputs: state.acceptedInputs,
      }))
      .sort((left, right) => left.clientId.localeCompare(right.clientId));

    return {
      sessionId: this.sessionId,
      runtimePhase: this.runtimePhase,
      authoritativeTick: this.authoritativeTick,
      runtimeTimeMs: this.runtimeTimeMs,
      tickRateHz: this.tickRateHz,
      tickIntervalMs: this.tickIntervalMs,
      pendingAcceptedInputs: this.acceptedInputQueue.length,
      rejectedInputs: this.rejectedInputLog.length,
      connectedClients,
      lastStopReason: this.lastStopReason,
      ingestion: this.ingestionContract.getStats(),
    };
  }
}

