/*
Toolbox Aid
David Quesenberry
04/06/2026
FakeLoopbackNetworkModel.js
*/

import { clamp } from "/src/engine/utils/index.js";
import { asPositiveNumber } from '../../../_shared/numberUtils.js';
import { createLatencyModel } from "/samples/phase-13/_shared/latencyModel.js";

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
    this.authoritativeFrame = 0;
    this.localFrame = 0;
    this.lastReconcileAtMs = null;
    this.reconciliationCount = 0;

    this.autoPacketTimerSeconds = 0;
    this.autoPacketIntervalSeconds = 0.65;
    this.inFlightPackets = [];
    this.latencyModel = createLatencyModel({
      baseRttMs: 30,
      jitterMs: 4,
      minOneWayMs: 8
    });

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
      this.inFlightPackets = [];
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
    const oneWayDelayMs = this.latencyModel.sampleOneWayDelayMs(this.elapsedSeconds, sequence);
    this.inFlightPackets.push({
      sequence,
      label,
      deliverAtSeconds: this.elapsedSeconds + (oneWayDelayMs / 1000),
      oneWayDelayMs
    });
    this.inFlightPackets.sort((left, right) => left.deliverAtSeconds - right.deliverAtSeconds);

    this.pushTrace("PACKET_SENT", {
      label,
      sequence,
      pendingPackets: this.pendingPackets,
      oneWayDelayMs
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
    const snapshot = this.latencyModel.sampleSnapshot(this.elapsedSeconds, this.nextSequence);
    this.rttMs = snapshot.rttMs;
    this.jitterMs = snapshot.jitterMs;
  }

  updateAcks() {
    if (this.phase !== "connected") {
      return;
    }
    while (this.inFlightPackets.length > 0 && this.inFlightPackets[0].deliverAtSeconds <= this.elapsedSeconds) {
      const delivered = this.inFlightPackets.shift();
      if (!delivered) break;
      if (this.pendingPackets > 0) {
        this.pendingPackets -= 1;
      }
      this.ackedSequence = Math.max(this.ackedSequence, Number(delivered.sequence) || 0);
      this.receivedPackets += 1;

      this.pushTrace("PACKET_ACKED", {
        sequence: this.ackedSequence,
        pendingPackets: this.pendingPackets,
        oneWayDelayMs: Number(delivered.oneWayDelayMs || 0)
      });
    }

    this.replicationBacklog = Math.max(0, this.inFlightPackets.length);
  }

  updateDivergenceState() {
    this.authoritativeFrame = Math.max(0, Number(this.replicationTick) || 0);
    const ackedFloor = Math.max(0, Number(this.ackedSequence) || 0);
    if (this.localFrame < ackedFloor) {
      this.localFrame = ackedFloor;
    }
    this.localFrame = clamp(this.localFrame, 0, this.authoritativeFrame);
  }

  applyReconciliation() {
    if (this.phase !== "connected") {
      return;
    }

    const divergence = Math.max(0, this.authoritativeFrame - this.localFrame);
    const stableWindow = 2;
    if (divergence <= stableWindow) {
      return;
    }

    const correction = Math.min(2, divergence - stableWindow);
    this.localFrame = clamp(this.localFrame + correction, 0, this.authoritativeFrame);
    this.reconciliationCount += 1;
    this.lastReconcileAtMs = Math.round(this.elapsedSeconds * 1000);

    this.pushTrace("RECONCILE_APPLIED", {
      correctionFrames: correction,
      authoritativeFrame: this.authoritativeFrame,
      localFrame: this.localFrame,
      divergenceAfter: Math.max(0, this.authoritativeFrame - this.localFrame)
    });
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
    this.updateAcks();
    this.updateDivergenceState();
    this.applyReconciliation();
  }

  getSnapshot() {
    const traceTail = this.traceEvents.slice(-18);

    const frameDelta = Math.max(0, this.authoritativeFrame - this.localFrame);
    const divergenceStatus = frameDelta > 8 ? "diverged" : (frameDelta > 2 ? "drifting" : "stable");
    const divergenceScore = frameDelta > 4 ? "warning" : "ok";

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
        backlog: this.replicationBacklog,
        authoritativeFrame: this.authoritativeFrame,
        localFrame: this.localFrame,
        reconciliationCount: this.reconciliationCount,
        lastReconcileAtMs: this.lastReconcileAtMs
      },
      divergence: {
        status: divergenceStatus,
        score: divergenceScore,
        frameDelta,
        serverFrame: this.authoritativeFrame,
        clientFrame: this.localFrame
      },
      trace: {
        totalEvents: this.traceEvents.length,
        events: traceTail
      }
    };
  }
}
