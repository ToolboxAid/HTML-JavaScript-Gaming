/*
Toolbox Aid
David Quesenberry
04/06/2026
FakeDivergenceTraceNetworkModel.js
*/
import ReconciliationLayerAdapter from "./ReconciliationLayerAdapter.js";

const MAX_TRACE_EVENTS = 160;
const MAX_TIMELINE_EVENTS = 80;

const SCENARIO_STEPS = [
  {
    id: "baseline",
    label: "Baseline Sync",
    durationSeconds: 2.4,
    targetOffsetFrames: 0,
    transitionType: "SCENARIO_BASELINE",
    transitionMessage: "Baseline synchronized frame flow."
  },
  {
    id: "mismatch-seeded",
    label: "Mismatch Seeded",
    durationSeconds: 2.1,
    targetOffsetFrames: 8,
    transitionType: "MISMATCH_SEEDED",
    transitionMessage: "Deterministic offset injection started."
  },
  {
    id: "divergence-observed",
    label: "Divergence Observed",
    durationSeconds: 3.0,
    targetOffsetFrames: 18,
    transitionType: "DIVERGENCE_DETECTED",
    transitionMessage: "Divergence warning window active."
  },
  {
    id: "trace-validated",
    label: "Trace Validation",
    durationSeconds: 2.3,
    targetOffsetFrames: 12,
    transitionType: "TRACE_VALIDATION_WINDOW",
    transitionMessage: "Trace sequence should match deterministic expectations."
  },
  {
    id: "reconciled",
    label: "Reconciled",
    durationSeconds: 2.4,
    targetOffsetFrames: 0,
    transitionType: "RECONCILE_APPLIED",
    transitionMessage: "Authoritative reconcile reducing delta to stable range."
  }
];

const REQUIRED_SEQUENCE_TYPES = [
  "SCENARIO_BASELINE",
  "MISMATCH_SEEDED",
  "DIVERGENCE_DETECTED",
  "TRACE_VALIDATION_WINDOW",
  "RECONCILE_APPLIED"
];

const PRIMARY_ENTITY_ID = "network-sample-c-entity";
const FIXED_REPLAY_DT_SECONDS = 1 / 60;

function createEmptyInputFrameRecord() {
  return {
    traceMarkers: 0,
    mismatchCount: 0,
    reconcileCount: 0,
    validationCount: 0,
    rewindPrepareCount: 0
  };
}

function hasAnyInputRecordValue(record) {
  const source = record && typeof record === "object" ? record : {};
  return Number(source.traceMarkers || 0) > 0
    || Number(source.mismatchCount || 0) > 0
    || Number(source.reconcileCount || 0) > 0
    || Number(source.validationCount || 0) > 0
    || Number(source.rewindPrepareCount || 0) > 0;
}

function cloneInputRecord(record) {
  const source = record && typeof record === "object" ? record : {};
  return {
    traceMarkers: Number(source.traceMarkers || 0),
    mismatchCount: Number(source.mismatchCount || 0),
    reconcileCount: Number(source.reconcileCount || 0),
    validationCount: Number(source.validationCount || 0),
    rewindPrepareCount: Number(source.rewindPrepareCount || 0)
  };
}

function asPositiveNumber(value, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return fallback;
  }
  return numeric;
}

function clamp(value, min, max) {
  const numeric = Number.isFinite(value) ? Number(value) : min;
  return Math.min(max, Math.max(min, numeric));
}

function moveToward(currentValue, targetValue, maxDelta) {
  const current = Number(currentValue);
  const target = Number(targetValue);
  const delta = Number(maxDelta);
  if (!Number.isFinite(current) || !Number.isFinite(target) || !Number.isFinite(delta) || delta <= 0) {
    return target;
  }

  const difference = target - current;
  if (Math.abs(difference) <= delta) {
    return target;
  }
  return current + (difference > 0 ? delta : -delta);
}

function toStatusFromDelta(frameDelta) {
  const absoluteDelta = Math.abs(Number(frameDelta) || 0);
  if (absoluteDelta <= 3) {
    return "stable";
  }
  if (absoluteDelta <= 10) {
    return "warning";
  }
  return "critical";
}

function toEventMessage(type, details) {
  const source = details && typeof details === "object" ? details : {};
  if (typeof source.message === "string" && source.message.trim()) {
    return source.message.trim();
  }

  if (type === "MANUAL_TRACE_MARKER") {
    return "Operator trace marker added.";
  }
  if (type === "MANUAL_MISMATCH_INJECTED") {
    return "Operator forced deterministic mismatch.";
  }
  if (type === "MANUAL_RECONCILE_REQUESTED") {
    return "Operator requested immediate reconcile.";
  }
  if (type === "REWIND_PREP_REQUESTED") {
    return source.canPrepare === true
      ? "Rewind preparation window is ready for resimulation."
      : "Rewind preparation requested; waiting on sufficient history.";
  }
  if (type === "REWIND_REPLAY_EXECUTED") {
    return "Rewind execution restored anchor frame and replayed deterministic inputs.";
  }
  if (type === "REWIND_REPLAY_SKIPPED") {
    return "Rewind execution skipped due to unavailable replay window.";
  }
  if (type === "VALIDATION_RUN") {
    return source.passed === true
      ? "Validation pass recorded."
      : "Validation run reported unresolved items.";
  }
  if (type === "DIVERGENCE_STATE_CHANGED") {
    const previous = String(source.previous || "unknown");
    const current = String(source.current || "unknown");
    return `Divergence state moved from ${previous} to ${current}.`;
  }

  return `${type} event recorded`;
}

export default class FakeDivergenceTraceNetworkModel {
  constructor(options = {}) {
    this.sessionId = typeof options.sessionId === "string" && options.sessionId.trim()
      ? options.sessionId.trim()
      : "network-sample-c-divergence";

    this.elapsedSeconds = 0;
    this.stepIndex = 0;
    this.stepElapsedSeconds = 0;
    this.cycleCount = 0;

    this.authoritativeFrame = 0;
    this.predictedOffsetFrames = 0;
    this.predictedFrame = 0;
    this.manualOffsetFrames = 0;
    this.manualReconcileSeconds = 0;

    this.lastKnownStatus = "stable";

    this.rttMs = 28;
    this.jitterMs = 2;
    this.simulatedPacketLossPct = 0;

    this.eventId = 1;
    this.traceEvents = [];
    this.timelineEvents = [];
    this.seenEventTypes = new Set();
    this.lastValidation = null;
    this.autoValidationForCycle = -1;
    this.latestDivergenceReport = null;
    this.latestCorrectionPlan = null;
    this.latestRewindPreparation = null;
    this.latestReplaySummary = null;
    this.pendingInputRecord = createEmptyInputFrameRecord();
    this.inputHistoryByFrame = new Map();
    this.replayExecutionCount = 0;
    this.isReplayExecuting = false;

    this.reconciliationLayer = new ReconciliationLayerAdapter({
      timelineId: "network-sample-c-reconciliation",
      historyLimit: 180,
      maxAuthoritativeHistory: 60
    });

    const step = this.getCurrentStep();
    this.pushEvent(step.transitionType, {
      message: step.transitionMessage,
      phase: step.id
    });
  }

  getCurrentStep() {
    return SCENARIO_STEPS[this.stepIndex] || SCENARIO_STEPS[0];
  }

  pushEvent(type, details = {}) {
    const safeType = typeof type === "string" && type.trim() ? type.trim() : "EVENT";
    const step = this.getCurrentStep();
    const timestampMs = Math.round(this.elapsedSeconds * 1000);
    const sourceDetails = details && typeof details === "object" ? { ...details } : {};
    const event = {
      id: this.eventId,
      timestampMs,
      cycle: this.cycleCount,
      phaseId: step.id,
      phaseLabel: step.label,
      type: safeType,
      message: toEventMessage(safeType, sourceDetails),
      details: sourceDetails
    };

    this.eventId += 1;
    this.traceEvents.push(event);
    this.timelineEvents.push(event);
    this.seenEventTypes.add(safeType);

    if (this.traceEvents.length > MAX_TRACE_EVENTS) {
      this.traceEvents.splice(0, this.traceEvents.length - MAX_TRACE_EVENTS);
    }
    if (this.timelineEvents.length > MAX_TIMELINE_EVENTS) {
      this.timelineEvents.splice(0, this.timelineEvents.length - MAX_TIMELINE_EVENTS);
    }
  }

  transitionToNextStep(reason = "auto", options = {}) {
    const emitEvents = options.emitEvents !== false;
    this.stepIndex += 1;
    if (this.stepIndex >= SCENARIO_STEPS.length) {
      this.stepIndex = 0;
      this.cycleCount += 1;
    }

    this.stepElapsedSeconds = 0;
    const step = this.getCurrentStep();
    if (emitEvents) {
      this.pushEvent(step.transitionType, {
        reason,
        message: step.transitionMessage,
        phase: step.id
      });
    }
  }

  updateScenarioStep(dtSeconds, options = {}) {
    const emitEvents = options.emitEvents !== false;
    const step = this.getCurrentStep();
    this.stepElapsedSeconds += dtSeconds;

    if (step.id !== "reconciled") {
      this.autoValidationForCycle = -1;
    } else if (emitEvents && this.autoValidationForCycle !== this.cycleCount) {
      this.runValidation("auto-reconcile");
      this.autoValidationForCycle = this.cycleCount;
    }

    if (this.stepElapsedSeconds >= step.durationSeconds) {
      this.transitionToNextStep("timeline", { emitEvents });
    }
  }

  updateNetworkMetrics() {
    const baseline = 34 + (Math.sin(this.elapsedSeconds * 1.4) * 8) + (Math.sin(this.elapsedSeconds * 0.45) * 4);
    this.rttMs = clamp(Math.round(baseline), 14, 90);
    this.jitterMs = clamp(Math.round(2 + Math.abs(Math.cos(this.elapsedSeconds * 2.3)) * 5), 1, 9);

    const status = this.getDivergenceStatus();
    this.simulatedPacketLossPct = status === "critical" ? 4 : status === "warning" ? 2 : 0;
  }

  updateFrameState(dtSeconds, options = {}) {
    const emitEvents = options.emitEvents !== false;
    const frameAdvance = Math.max(1, Math.round(dtSeconds * 60));
    this.authoritativeFrame += frameAdvance;

    const step = this.getCurrentStep();
    const baseTargetOffset = step.targetOffsetFrames;
    let targetOffset = baseTargetOffset + this.manualOffsetFrames;

    if (this.manualReconcileSeconds > 0) {
      this.manualReconcileSeconds = Math.max(0, this.manualReconcileSeconds - dtSeconds);
      targetOffset = 0;
    } else if (this.manualOffsetFrames > 0) {
      this.manualOffsetFrames = Math.max(0, this.manualOffsetFrames - (dtSeconds * 3));
    }

    const moveRateFramesPerSecond = step.id === "reconciled" || this.manualReconcileSeconds > 0
      ? 22
      : 10;
    this.predictedOffsetFrames = moveToward(
      this.predictedOffsetFrames,
      targetOffset,
      moveRateFramesPerSecond * dtSeconds
    );
    this.predictedFrame = this.authoritativeFrame + Math.round(this.predictedOffsetFrames);

    const currentStatus = this.getDivergenceStatus();
    if (currentStatus !== this.lastKnownStatus && emitEvents) {
      this.pushEvent("DIVERGENCE_STATE_CHANGED", {
        previous: this.lastKnownStatus,
        current: currentStatus,
        delta: this.getFrameDelta()
      });
    }
    this.lastKnownStatus = currentStatus;
  }

  getFrameDelta() {
    return this.predictedFrame - this.authoritativeFrame;
  }

  getDivergenceStatus() {
    return toStatusFromDelta(this.getFrameDelta());
  }

  markPendingInput(key, count = 1) {
    const normalizedCount = Math.max(0, Number(count) || 0);
    if (this.isReplayExecuting || normalizedCount <= 0) {
      return;
    }
    this.pendingInputRecord[key] = Number(this.pendingInputRecord[key] || 0) + normalizedCount;
  }

  flushPendingInputsForFrame(frameId) {
    const normalizedFrameId = Math.floor(Number(frameId));
    if (!Number.isFinite(normalizedFrameId)) {
      this.pendingInputRecord = createEmptyInputFrameRecord();
      return;
    }

    if (hasAnyInputRecordValue(this.pendingInputRecord)) {
      this.inputHistoryByFrame.set(normalizedFrameId, cloneInputRecord(this.pendingInputRecord));
    }
    this.pendingInputRecord = createEmptyInputFrameRecord();
  }

  getInputRecordForFrame(frameId) {
    const normalizedFrameId = Math.floor(Number(frameId));
    if (!Number.isFinite(normalizedFrameId) || !this.inputHistoryByFrame.has(normalizedFrameId)) {
      return createEmptyInputFrameRecord();
    }
    return cloneInputRecord(this.inputHistoryByFrame.get(normalizedFrameId));
  }

  applyMismatchImpulse(count = 1) {
    const normalizedCount = Math.max(1, Math.floor(Number(count) || 1));
    this.manualOffsetFrames = clamp(this.manualOffsetFrames + (12 * normalizedCount), 0, 30);
  }

  applyReconcileImpulse() {
    this.manualOffsetFrames = 0;
    this.manualReconcileSeconds = 2.4;
  }

  applyReplayInputFrame(inputRecord) {
    const replayInput = cloneInputRecord(inputRecord);

    if (replayInput.mismatchCount > 0) {
      this.applyMismatchImpulse(replayInput.mismatchCount);
    }
    if (replayInput.reconcileCount > 0) {
      this.applyReconcileImpulse();
    }
  }

  advanceSimulation(dtSeconds, options = {}) {
    const safeDt = asPositiveNumber(dtSeconds, FIXED_REPLAY_DT_SECONDS);
    const emitEvents = options.emitEvents !== false;

    this.elapsedSeconds += safeDt;
    this.updateScenarioStep(safeDt, { emitEvents });
    this.updateFrameState(safeDt, { emitEvents });
    this.updateNetworkMetrics();
  }

  createPredictedSnapshot() {
    const step = this.getCurrentStep();
    return {
      frameId: this.authoritativeFrame,
      timestampMs: Math.round(this.elapsedSeconds * 1000),
      entities: [
        {
          entityId: PRIMARY_ENTITY_ID,
          frameValue: this.predictedFrame,
          position: {
            x: this.predictedFrame,
            y: 0
          },
          velocity: {
            x: Number(this.predictedOffsetFrames.toFixed(2)),
            y: 0
          },
          stateFlags: {
            phaseId: step.id,
            cycleCount: this.cycleCount,
            divergenceStatus: this.getDivergenceStatus()
          }
        }
      ],
      meta: {
        source: "predicted",
        sampleId: "network-sample-c",
        modelState: {
          elapsedSeconds: Number(this.elapsedSeconds.toFixed(6)),
          stepIndex: this.stepIndex,
          stepElapsedSeconds: Number(this.stepElapsedSeconds.toFixed(6)),
          cycleCount: this.cycleCount,
          authoritativeFrame: this.authoritativeFrame,
          predictedFrame: this.predictedFrame,
          predictedOffsetFrames: Number(this.predictedOffsetFrames.toFixed(6)),
          manualOffsetFrames: Number(this.manualOffsetFrames.toFixed(6)),
          manualReconcileSeconds: Number(this.manualReconcileSeconds.toFixed(6)),
          lastKnownStatus: this.lastKnownStatus,
          rttMs: this.rttMs,
          jitterMs: this.jitterMs,
          simulatedPacketLossPct: this.simulatedPacketLossPct
        }
      }
    };
  }

  createAuthoritativeSnapshot() {
    const step = this.getCurrentStep();
    return {
      frameId: this.authoritativeFrame,
      timestampMs: Math.round(this.elapsedSeconds * 1000),
      entities: [
        {
          entityId: PRIMARY_ENTITY_ID,
          frameValue: this.authoritativeFrame,
          position: {
            x: this.authoritativeFrame,
            y: 0
          },
          velocity: {
            x: 0,
            y: 0
          },
          stateFlags: {
            phaseId: step.id,
            cycleCount: this.cycleCount,
            authoritative: true
          }
        }
      ],
      meta: {
        source: "authoritative",
        sampleId: "network-sample-c"
      }
    };
  }

  updateReconciliationLayer() {
    const predictedSnapshot = this.createPredictedSnapshot();
    const authoritativeSnapshot = this.createAuthoritativeSnapshot();

    this.reconciliationLayer.recordPredictedSnapshot(predictedSnapshot);
    this.reconciliationLayer.receiveAuthoritativeSnapshot(authoritativeSnapshot, {
      eventType: "worldState.transition.applied",
      producer: "networkSampleC",
      correlationId: `network-sample-c:${this.authoritativeFrame}`,
      timestampMs: authoritativeSnapshot.timestampMs
    });
    this.reconciliationLayer.reconcileLatest();

    this.latestDivergenceReport = this.reconciliationLayer.getLatestDivergenceReport();
    this.latestCorrectionPlan = this.reconciliationLayer.getCorrectionPlan();
    this.latestRewindPreparation = this.reconciliationLayer.getRewindPreparation();
  }

  addManualTraceMarker(label = "operator") {
    this.markPendingInput("traceMarkers", 1);
    this.pushEvent("MANUAL_TRACE_MARKER", {
      label,
      frameDelta: this.getFrameDelta()
    });
  }

  triggerManualMismatch(reason = "operator") {
    this.markPendingInput("mismatchCount", 1);
    this.applyMismatchImpulse(1);
    this.pushEvent("MANUAL_MISMATCH_INJECTED", {
      reason,
      manualOffsetFrames: Number(this.manualOffsetFrames.toFixed(2)),
      frameDelta: this.getFrameDelta()
    });
  }

  triggerManualReconcile(reason = "operator") {
    this.markPendingInput("reconcileCount", 1);
    this.applyReconcileImpulse();
    this.pushEvent("MANUAL_RECONCILE_REQUESTED", {
      reason,
      frameDelta: this.getFrameDelta()
    });
  }

  triggerRewindPreparation(reason = "operator") {
    this.markPendingInput("rewindPrepareCount", 1);
    this.updateReconciliationLayer();
    const rewindPreparation = this.latestRewindPreparation || {
      status: "insufficient-history",
      canPrepare: false,
      rewindAnchorFrameId: null,
      resimulateFrameCount: 0
    };

    this.pushEvent("REWIND_PREP_REQUESTED", {
      reason,
      status: rewindPreparation.status,
      canPrepare: rewindPreparation.canPrepare,
      rewindAnchorFrameId: rewindPreparation.rewindAnchorFrameId,
      resimulateFrameCount: rewindPreparation.resimulateFrameCount
    });
  }

  restoreFromPredictedTimelineSnapshot(snapshotRecord) {
    const source = snapshotRecord && typeof snapshotRecord === "object"
      ? snapshotRecord
      : {};
    const snapshot = source.snapshot && typeof source.snapshot === "object"
      ? source.snapshot
      : {};
    const modelState = snapshot.meta?.modelState && typeof snapshot.meta.modelState === "object"
      ? snapshot.meta.modelState
      : null;

    if (!modelState) {
      return false;
    }

    const restoredElapsedSeconds = Number(modelState.elapsedSeconds);
    this.elapsedSeconds = Number.isFinite(restoredElapsedSeconds)
      ? Math.max(0, restoredElapsedSeconds)
      : this.elapsedSeconds;
    const restoredStepIndex = Math.max(0, Math.floor(Number(modelState.stepIndex) || 0));
    this.stepIndex = SCENARIO_STEPS.length > 0
      ? restoredStepIndex % SCENARIO_STEPS.length
      : 0;
    this.stepElapsedSeconds = Math.max(0, Number(modelState.stepElapsedSeconds || 0));
    this.cycleCount = Math.max(0, Math.floor(Number(modelState.cycleCount) || 0));
    this.authoritativeFrame = Math.max(0, Math.floor(Number(modelState.authoritativeFrame) || 0));
    this.predictedFrame = Math.max(0, Math.floor(Number(modelState.predictedFrame) || 0));
    this.predictedOffsetFrames = Number(modelState.predictedOffsetFrames || 0);
    this.manualOffsetFrames = Number(modelState.manualOffsetFrames || 0);
    this.manualReconcileSeconds = Math.max(0, Number(modelState.manualReconcileSeconds || 0));
    this.rttMs = Number(modelState.rttMs || this.rttMs);
    this.jitterMs = Number(modelState.jitterMs || this.jitterMs);
    this.simulatedPacketLossPct = Number(modelState.simulatedPacketLossPct || this.simulatedPacketLossPct);
    this.lastKnownStatus = String(modelState.lastKnownStatus || this.lastKnownStatus);

    return true;
  }

  executeRewindReplay(reason = "operator") {
    this.updateReconciliationLayer();
    const rewindPreparation = this.latestRewindPreparation || {};

    if (rewindPreparation.canPrepare !== true) {
      this.pushEvent("REWIND_REPLAY_SKIPPED", {
        reason,
        status: rewindPreparation.status || "not-ready",
        canPrepare: false
      });
      return {
        executed: false,
        reason: "rewind-not-ready",
        rewindPreparation
      };
    }

    const anchorFrameId = Number(rewindPreparation.rewindAnchorFrameId);
    const latestFrameId = Number(this.reconciliationLayer.getLatestTimelineFrameId());
    if (!Number.isFinite(anchorFrameId) || !Number.isFinite(latestFrameId) || latestFrameId <= anchorFrameId) {
      this.pushEvent("REWIND_REPLAY_SKIPPED", {
        reason,
        status: "invalid-window",
        anchorFrameId: rewindPreparation.rewindAnchorFrameId,
        latestFrameId: this.reconciliationLayer.getLatestTimelineFrameId()
      });
      return {
        executed: false,
        reason: "invalid-window",
        rewindPreparation
      };
    }

    const anchorSnapshot = this.reconciliationLayer.getTimelineSnapshot(anchorFrameId);
    if (!anchorSnapshot || this.restoreFromPredictedTimelineSnapshot(anchorSnapshot) !== true) {
      this.pushEvent("REWIND_REPLAY_SKIPPED", {
        reason,
        status: "missing-anchor",
        anchorFrameId
      });
      return {
        executed: false,
        reason: "missing-anchor",
        rewindPreparation
      };
    }

    const truncatedCount = this.reconciliationLayer.truncatePredictedHistoryAfter(anchorFrameId);
    const replayStartFrameId = anchorFrameId + 1;
    let replayedFrameCount = 0;

    this.isReplayExecuting = true;
    for (let frameId = replayStartFrameId; frameId <= latestFrameId; frameId += 1) {
      const replayInput = this.getInputRecordForFrame(frameId);
      this.applyReplayInputFrame(replayInput);
      this.advanceSimulation(FIXED_REPLAY_DT_SECONDS, { emitEvents: false });
      this.reconciliationLayer.recordPredictedSnapshot(this.createPredictedSnapshot());
      replayedFrameCount += 1;
    }
    this.isReplayExecuting = false;

    this.updateReconciliationLayer();
    const postReplayRewind = this.latestRewindPreparation || null;
    const postReplayCorrection = this.latestCorrectionPlan || null;

    this.replayExecutionCount += 1;
    this.latestReplaySummary = {
      replayId: this.replayExecutionCount,
      reason,
      replayAnchorFrameId: anchorFrameId,
      replayLatestFrameId: latestFrameId,
      replayedFrameCount,
      truncatedCount,
      postReplayCorrectionMode: postReplayCorrection?.mode || "hold-annotate",
      postReplaySeverity: postReplayCorrection?.severity || "low",
      postReplayRewindStatus: postReplayRewind?.status || "unknown"
    };

    this.pushEvent("REWIND_REPLAY_EXECUTED", {
      reason,
      replayId: this.latestReplaySummary.replayId,
      replayAnchorFrameId: anchorFrameId,
      replayLatestFrameId: latestFrameId,
      replayedFrameCount,
      truncatedCount,
      postReplayCorrectionMode: this.latestReplaySummary.postReplayCorrectionMode,
      postReplaySeverity: this.latestReplaySummary.postReplaySeverity,
      postReplayRewindStatus: this.latestReplaySummary.postReplayRewindStatus
    });

    return {
      executed: true,
      replaySummary: { ...this.latestReplaySummary }
    };
  }

  runValidation(reason = "operator") {
    if (reason !== "auto-reconcile") {
      this.markPendingInput("validationCount", 1);
    }
    const checks = this.computeValidationChecks();
    const passed = checks.every((item) => item.passed === true);

    this.lastValidation = {
      timestampMs: Math.round(this.elapsedSeconds * 1000),
      passed,
      reason,
      checks: checks.map((item) => ({
        id: item.id,
        label: item.label,
        passed: item.passed,
        detail: item.detail
      }))
    };

    this.pushEvent("VALIDATION_RUN", {
      reason,
      passed,
      checkCount: checks.length
    });

    return this.lastValidation;
  }

  computeValidationChecks() {
    const frameDelta = Math.abs(this.getFrameDelta());
    const status = this.getDivergenceStatus();
    const hasCoreSequence = REQUIRED_SEQUENCE_TYPES.every((type) => this.seenEventTypes.has(type));
    const hasDivergenceObserved = this.seenEventTypes.has("DIVERGENCE_DETECTED") || frameDelta >= 8;
    const hasTraceValidationWindow = this.seenEventTypes.has("TRACE_VALIDATION_WINDOW");
    const hasEnoughTrace = this.traceEvents.length >= 8;
    const canExplain = true;
    const hasReproSteps = true;

    return [
      {
        id: "deterministic_mismatch",
        label: "Deterministic mismatch scenario",
        passed: hasDivergenceObserved,
        detail: hasDivergenceObserved
          ? "Mismatch window observed in deterministic cycle."
          : "Await mismatch-seeded/divergence-observed window."
      },
      {
        id: "event_sequence_timeline",
        label: "Event sequencing timeline",
        passed: hasCoreSequence,
        detail: hasCoreSequence
          ? "Core sequence events recorded in trace timeline."
          : "Capture baseline -> mismatch -> divergence -> trace -> reconcile sequence."
      },
      {
        id: "divergence_explanation_notes",
        label: "Divergence explanation notes",
        passed: canExplain,
        detail: "Predictive frame offset and reconcile logic are documented."
      },
      {
        id: "reproduction_guide",
        label: "Reproduction guide",
        passed: hasReproSteps,
        detail: "Play-first, debug-second workflow and operator controls are available."
      },
      {
        id: "validation_flow",
        label: "Validation checklist flow",
        passed: hasTraceValidationWindow && hasEnoughTrace && status !== "critical",
        detail: status === "critical"
          ? "Resolve critical divergence before final validation pass."
          : "Trace window and checklist telemetry are available."
      }
    ];
  }

  update(dtSeconds, options = {}) {
    const safeDt = asPositiveNumber(dtSeconds, 1 / 60);

    if (options.injectTraceMarker === true) {
      this.addManualTraceMarker("input");
    }
    if (options.forceMismatch === true) {
      this.triggerManualMismatch("input");
    }
    if (options.forceReconcile === true) {
      this.triggerManualReconcile("input");
    }
    if (options.prepareRewind === true) {
      this.triggerRewindPreparation("input");
    }
    if (options.runValidation === true) {
      this.runValidation("input");
    }

    this.advanceSimulation(safeDt, { emitEvents: true });
    this.flushPendingInputsForFrame(this.authoritativeFrame);
    this.updateReconciliationLayer();
  }

  buildValidationSnapshot() {
    const checks = this.computeValidationChecks();
    const hasLastRun = this.lastValidation !== null;

    const items = checks.map((check) => {
      let status = "pending";
      if (check.passed) {
        status = "pass";
      } else if (hasLastRun) {
        status = "fail";
      }

      return {
        id: check.id,
        label: check.label,
        status,
        detail: check.detail
      };
    });

    return {
      lastRunMs: this.lastValidation?.timestampMs ?? null,
      lastRunPassed: this.lastValidation?.passed ?? null,
      items
    };
  }

  getSnapshot() {
    if (!this.latestDivergenceReport) {
      this.updateReconciliationLayer();
    }

    const step = this.getCurrentStep();
    const frameDelta = this.getFrameDelta();
    const status = this.getDivergenceStatus();
    const validation = this.buildValidationSnapshot();
    const divergenceReport = this.latestDivergenceReport || null;
    const correctionPlan = this.latestCorrectionPlan || null;
    const rewindPreparation = this.latestRewindPreparation || null;
    const timelineStatus = this.reconciliationLayer.getTimelineStatus();
    const primaryEntity = Array.isArray(divergenceReport?.entityReports) && divergenceReport.entityReports.length > 0
      ? divergenceReport.entityReports[0]
      : null;

    return {
      sessionId: this.sessionId,
      scenario: {
        phaseId: step.id,
        phaseLabel: step.label,
        phaseElapsedSeconds: Number(this.stepElapsedSeconds.toFixed(2)),
        phaseDurationSeconds: step.durationSeconds,
        cycleCount: this.cycleCount
      },
      network: {
        connectionState: "simulated",
        rttMs: this.rttMs,
        jitterMs: this.jitterMs,
        packetLossPct: this.simulatedPacketLossPct
      },
      divergence: {
        status,
        frameDelta,
        authoritativeFrame: this.authoritativeFrame,
        predictedFrame: this.predictedFrame,
        targetOffsetFrames: Number(this.predictedOffsetFrames.toFixed(2)),
        alignment: divergenceReport?.alignment || "unavailable",
        severity: primaryEntity?.severity || divergenceReport?.summary?.highestSeverity || "low",
        correctionMode: primaryEntity?.correctionMode || correctionPlan?.mode || "hold-annotate",
        explanation: "Client-predicted frame intentionally diverges from authoritative frame during seeded mismatch windows.",
        likelyCause: "Deterministic offset injection plus delayed reconcile window.",
        reconciliationHint: "Use R or wait for reconcile phase to collapse frame delta."
      },
      timeline: {
        totalEvents: this.timelineEvents.length,
        events: this.timelineEvents.slice(-20),
        history: {
          size: timelineStatus.historySize,
          limit: timelineStatus.historyLimit,
          oldestFrameId: timelineStatus.oldestFrameId,
          latestFrameId: timelineStatus.latestFrameId,
          alignment: timelineStatus.alignment,
          frameGap: timelineStatus.frameGap
        }
      },
      correction: correctionPlan,
      rewindPreparation,
      rewindReplay: this.latestReplaySummary ? { ...this.latestReplaySummary } : null,
      reproduction: {
        summary: "Reproduce divergence in a deterministic cycle and validate trace ordering before reconcile.",
        steps: [
          "Open Play first and observe baseline sync.",
          "Let mismatch-seeded and divergence-observed phases run.",
          "Optionally press D to inject an additional mismatch burst.",
          "Open Debug Mode and compare divergence state + trace ordering.",
          "Inspect timeline history/alignment and rewind preparation status.",
          "Press W to refresh rewind preparation snapshot when needed.",
          "Press X to execute rewind + deterministic replay.",
          "Press V to run validation and verify checklist status.",
          "Press R or wait for reconcile phase, then validate again."
        ]
      },
      validation,
      trace: {
        totalEvents: this.traceEvents.length,
        events: this.traceEvents.slice(-30)
      }
    };
  }
}
