/*
Toolbox Aid
David Quesenberry
04/06/2026
FakeDivergenceTraceNetworkModel.js
*/

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

  transitionToNextStep(reason = "auto") {
    this.stepIndex += 1;
    if (this.stepIndex >= SCENARIO_STEPS.length) {
      this.stepIndex = 0;
      this.cycleCount += 1;
    }

    this.stepElapsedSeconds = 0;
    const step = this.getCurrentStep();
    this.pushEvent(step.transitionType, {
      reason,
      message: step.transitionMessage,
      phase: step.id
    });
  }

  updateScenarioStep(dtSeconds) {
    const step = this.getCurrentStep();
    this.stepElapsedSeconds += dtSeconds;

    if (step.id !== "reconciled") {
      this.autoValidationForCycle = -1;
    } else if (this.autoValidationForCycle !== this.cycleCount) {
      this.runValidation("auto-reconcile");
      this.autoValidationForCycle = this.cycleCount;
    }

    if (this.stepElapsedSeconds >= step.durationSeconds) {
      this.transitionToNextStep("timeline");
    }
  }

  updateNetworkMetrics() {
    const baseline = 34 + (Math.sin(this.elapsedSeconds * 1.4) * 8) + (Math.sin(this.elapsedSeconds * 0.45) * 4);
    this.rttMs = clamp(Math.round(baseline), 14, 90);
    this.jitterMs = clamp(Math.round(2 + Math.abs(Math.cos(this.elapsedSeconds * 2.3)) * 5), 1, 9);

    const status = this.getDivergenceStatus();
    this.simulatedPacketLossPct = status === "critical" ? 4 : status === "warning" ? 2 : 0;
  }

  updateFrameState(dtSeconds) {
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
    if (currentStatus !== this.lastKnownStatus) {
      this.pushEvent("DIVERGENCE_STATE_CHANGED", {
        previous: this.lastKnownStatus,
        current: currentStatus,
        delta: this.getFrameDelta()
      });
      this.lastKnownStatus = currentStatus;
    }
  }

  getFrameDelta() {
    return this.predictedFrame - this.authoritativeFrame;
  }

  getDivergenceStatus() {
    return toStatusFromDelta(this.getFrameDelta());
  }

  addManualTraceMarker(label = "operator") {
    this.pushEvent("MANUAL_TRACE_MARKER", {
      label,
      frameDelta: this.getFrameDelta()
    });
  }

  triggerManualMismatch(reason = "operator") {
    this.manualOffsetFrames = clamp(this.manualOffsetFrames + 12, 0, 30);
    this.pushEvent("MANUAL_MISMATCH_INJECTED", {
      reason,
      manualOffsetFrames: Number(this.manualOffsetFrames.toFixed(2)),
      frameDelta: this.getFrameDelta()
    });
  }

  triggerManualReconcile(reason = "operator") {
    this.manualOffsetFrames = 0;
    this.manualReconcileSeconds = 2.4;
    this.pushEvent("MANUAL_RECONCILE_REQUESTED", {
      reason,
      frameDelta: this.getFrameDelta()
    });
  }

  runValidation(reason = "operator") {
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
    this.elapsedSeconds += safeDt;

    if (options.injectTraceMarker === true) {
      this.addManualTraceMarker("input");
    }
    if (options.forceMismatch === true) {
      this.triggerManualMismatch("input");
    }
    if (options.forceReconcile === true) {
      this.triggerManualReconcile("input");
    }
    if (options.runValidation === true) {
      this.runValidation("input");
    }

    this.updateScenarioStep(safeDt);
    this.updateFrameState(safeDt);
    this.updateNetworkMetrics();
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
    const step = this.getCurrentStep();
    const frameDelta = this.getFrameDelta();
    const status = this.getDivergenceStatus();
    const validation = this.buildValidationSnapshot();

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
        explanation: "Client-predicted frame intentionally diverges from authoritative frame during seeded mismatch windows.",
        likelyCause: "Deterministic offset injection plus delayed reconcile window.",
        reconciliationHint: "Use R or wait for reconcile phase to collapse frame delta."
      },
      timeline: {
        totalEvents: this.timelineEvents.length,
        events: this.timelineEvents.slice(-20)
      },
      reproduction: {
        summary: "Reproduce divergence in a deterministic cycle and validate trace ordering before reconcile.",
        steps: [
          "Open Play first and observe baseline sync.",
          "Let mismatch-seeded and divergence-observed phases run.",
          "Optionally press D to inject an additional mismatch burst.",
          "Open Debug Mode and compare divergence state + trace ordering.",
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
