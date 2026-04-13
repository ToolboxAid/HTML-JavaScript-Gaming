/*
Toolbox Aid
David Quesenberry
04/06/2026
FakeLoopbackNetworkModel.js
*/

import { clamp } from '/src/engine/utils/math.js';
import { asPositiveNumber } from '../../../_shared/numberUtils.js';

const MAX_TRACE_EVENTS = 80;

function normalizePhase(value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (normalized === "disconnected" || normalized === "connecting" || normalized === "synchronizing" || normalized === "connected") {
    return normalized;
  }
  return "connected";
}

export default class FakeLoopbackNetworkModel {
  constructor(options = {}) {
    this.sessionId = typeof options.sessionId === "string" && options.sessionId.trim()
      ? options.sessionId.trim()
      : "loopback-sample-a";

    this.elapsedSeconds = 0;
    this.phase = "connected";
    this.phaseDurationSeconds = 0;

    this.nextSequence = 1;
    this.ackedSequence = 0;
    this.pendingPackets = 0;

    this.sentPackets = 0;
    this.receivedPackets = 0;
    this.droppedPackets = 0;

    this.rttMs = 28;
    this.jitterMs = 3;
    this.replicationBacklog = 0;
    this.replicationTick = 0;

    this.autoPacketTimerSeconds = 0;
    this.autoPacketIntervalSeconds = 0.65;
    this.lastAckTimerSeconds = 0;

    this.traceEvents = [];

    this.pushTrace("SESSION_START", {
      sessionId: this.sessionId,
      phase: this.phase,
      reason: "boot"
    });
  }

  pushTrace(type, details = {}) {
    const eventType = typeof type === "string" ? type.trim() : "";
    if (!eventType) {
      return;
    }

    this.traceEvents.push({
      timestampMs: Math.round(this.elapsedSeconds * 1000),
      phase: this.phase,
      type: eventType,
      details: { ...details }
    });

    if (this.traceEvents.length > MAX_TRACE_EVENTS) {
      const trimCount = this.traceEvents.length - MAX_TRACE_EVENTS;
      this.traceEvents.splice(0, trimCount);
    }
  }

  setPhase(nextPhase, reason = "manual") {
    const normalizedNext = normalizePhase(nextPhase);
    if (normalizedNext === this.phase) {
      return;
    }

    const previousPhase = this.phase;
    this.phase = normalizedNext;
    this.phaseDurationSeconds = 0;

    this.pushTrace("CONNECTION_PHASE_CHANGED", {
      previous: previousPhase,
      current: normalizedNext,
      reason
    });

    if (normalizedNext === "disconnected") {
      this.pendingPackets = 0;
      this.replicationBacklog = 0;
      this.lastAckTimerSeconds = 0;
    }
  }

  forceDisconnect() {
    this.setPhase("disconnected", "operator-disconnect");
  }

  forceReconnect() {
    if (this.phase === "connected") {
      return;
    }
    this.setPhase("connecting", "operator-reconnect");
  }

  sendSyntheticPacket(label = "auto") {
    if (this.phase !== "connected") {
      this.droppedPackets += 1;
      this.pushTrace("PACKET_DROPPED", {
        label,
        reason: `phase=${this.phase}`
      });
      return false;
    }

    const sequence = this.nextSequence;
    this.nextSequence += 1;
    this.sentPackets += 1;
    this.pendingPackets += 1;
    this.replicationTick += 1;

    this.pushTrace("PACKET_SENT", {
      label,
      sequence,
      pendingPackets: this.pendingPackets
    });

    return true;
  }

  updatePhaseProgress(dtSeconds) {
    if (this.phase === "disconnected") {
      return;
    }

    if (this.phase === "connecting" && this.phaseDurationSeconds >= 1.2) {
      this.setPhase("synchronizing", "handshake-complete");
      return;
    }

    if (this.phase === "synchronizing" && this.phaseDurationSeconds >= 1.4) {
      this.setPhase("connected", "sync-complete");
      return;
    }

    if (this.phase === "connected") {
      this.autoPacketTimerSeconds += dtSeconds;
      if (this.autoPacketTimerSeconds >= this.autoPacketIntervalSeconds) {
        this.autoPacketTimerSeconds = 0;
        this.sendSyntheticPacket("heartbeat");
      }
    }
  }

  updateLatencySnapshot() {
    if (this.phase !== "connected") {
      this.rttMs = 0;
      this.jitterMs = 0;
      return;
    }

    const waveform = Math.sin(this.elapsedSeconds * 1.8);
    const harmonic = Math.sin(this.elapsedSeconds * 0.45);
    this.rttMs = Math.round(30 + (waveform * 7) + (harmonic * 3));
    this.rttMs = clamp(this.rttMs, 16, 70);

    this.jitterMs = Math.round(Math.abs(Math.cos(this.elapsedSeconds * 2.2)) * 4);
    this.jitterMs = clamp(this.jitterMs, 1, 8);
  }

  updateAcks(dtSeconds) {
    if (this.phase !== "connected") {
      return;
    }

    this.lastAckTimerSeconds += dtSeconds;
    const ackInterval = 0.22 + (this.jitterMs / 1000);

    if (this.pendingPackets > 0 && this.lastAckTimerSeconds >= ackInterval) {
      this.lastAckTimerSeconds = 0;
      this.pendingPackets -= 1;
      this.ackedSequence += 1;
      this.receivedPackets += 1;

      this.pushTrace("PACKET_ACKED", {
        sequence: this.ackedSequence,
        pendingPackets: this.pendingPackets
      });
    }

    this.replicationBacklog = Math.max(0, this.pendingPackets - 1);
  }

  update(dtSeconds, options = {}) {
    const safeDt = asPositiveNumber(dtSeconds, 1 / 60);
    this.elapsedSeconds += safeDt;
    this.phaseDurationSeconds += safeDt;

    if (options.injectPacket === true) {
      this.sendSyntheticPacket("manual");
    }

    this.updatePhaseProgress(safeDt);
    this.updateLatencySnapshot();
    this.updateAcks(safeDt);
  }

  getSnapshot() {
    const traceTail = this.traceEvents.slice(-18);

    return {
      sessionId: this.sessionId,
      connection: {
        phase: this.phase,
        phaseDurationSeconds: Number(this.phaseDurationSeconds.toFixed(2)),
        connected: this.phase === "connected",
        sentPackets: this.sentPackets,
        receivedPackets: this.receivedPackets,
        droppedPackets: this.droppedPackets
      },
      latency: {
        rttMs: this.rttMs,
        jitterMs: this.jitterMs,
        status: this.phase === "connected" ? "active" : "stalled"
      },
      replication: {
        tick: this.replicationTick,
        nextSequence: this.nextSequence,
        ackedSequence: this.ackedSequence,
        pendingPackets: this.pendingPackets,
        backlog: this.replicationBacklog
      },
      divergence: {
        status: "stable",
        score: this.replicationBacklog > 4 ? "warning" : "ok",
        serverFrame: this.replicationTick,
        clientFrame: Math.max(0, this.replicationTick - this.replicationBacklog)
      },
      trace: {
        totalEvents: this.traceEvents.length,
        events: traceTail
      }
    };
  }
}
