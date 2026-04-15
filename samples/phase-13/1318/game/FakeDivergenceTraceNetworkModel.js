/*
Toolbox Aid
David Quesenberry
04/06/2026
FakeDivergenceTraceNetworkModel.js
*/
import ReconciliationLayerAdapter from "./ReconciliationLayerAdapter.js";
import { clamp } from "/src/engine/utils/index.js";
import { asPositiveNumber, isFiniteNumber } from "../../../shared/numberUtils.js";

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

const ENTITY_DEFINITIONS = [
  { entityId: "ship-alpha", label: "Ship Alpha", laneY: -28, baselineLagFrames: 0.5, driftScale: 1.0 },
  { entityId: "ship-bravo", label: "Ship Bravo", laneY: 0, baselineLagFrames: 1.25, driftScale: 0.82 },
  { entityId: "drone-charlie", label: "Drone Charlie", laneY: 28, baselineLagFrames: 2.0, driftScale: 1.18 }
];
const PRIMARY_ENTITY_ID = ENTITY_DEFINITIONS[0].entityId;
const FIXED_REPLAY_DT_SECONDS = 1 / 60;

function createEmptyInputFrameRecord() {
  return {
    traceMarkers: 0,
    validationCount: 0,
    rewindPrepareCount: 0,
    entityMutations: {}
  };
}

function hasAnyInputRecordValue(record) {
  const source = record && typeof record === "object" ? record : {};
  const entityMutations = source.entityMutations && typeof source.entityMutations === "object"
    ? source.entityMutations
    : {};
  const hasEntityMutations = Object.values(entityMutations).some((entityMutation) => {
    const mutation = entityMutation && typeof entityMutation === "object" ? entityMutation : {};
    return Number(mutation.mismatchCount || 0) > 0 || Number(mutation.reconcileCount || 0) > 0;
  });

  return Number(source.traceMarkers || 0) > 0
    || Number(source.validationCount || 0) > 0
    || Number(source.rewindPrepareCount || 0) > 0
    || hasEntityMutations;
}

function cloneInputRecord(record) {
  const source = record && typeof record === "object" ? record : {};
  const entityMutations = source.entityMutations && typeof source.entityMutations === "object"
    ? source.entityMutations
    : {};
  const clonedEntityMutations = {};
  Object.keys(entityMutations).forEach((entityId) => {
    const mutation = entityMutations[entityId] && typeof entityMutations[entityId] === "object"
      ? entityMutations[entityId]
      : {};
    clonedEntityMutations[entityId] = {
      mismatchCount: Number(mutation.mismatchCount || 0),
      reconcileCount: Number(mutation.reconcileCount || 0)
    };
  });

  return {
    traceMarkers: Number(source.traceMarkers || 0),
    validationCount: Number(source.validationCount || 0),
    rewindPrepareCount: Number(source.rewindPrepareCount || 0),
    entityMutations: clonedEntityMutations
  };
}

function moveToward(currentValue, targetValue, maxDelta) {
  const current = Number(currentValue);
  const target = Number(targetValue);
  const delta = Number(maxDelta);
  if (!isFiniteNumber(current) || !isFiniteNumber(target) || !isFiniteNumber(delta) || delta <= 0) {
    return target;
  }

  const difference = target - current;
  if (Math.abs(difference) <= delta) {
    return target;
  }
  return current + (difference > 0 ? delta : -delta);
}

function normalizeEntityIdList(entityIds) {
  if (!Array.isArray(entityIds)) {
    return [];
  }

  const normalized = [];
  const seen = new Set();
  entityIds.forEach((entityId) => {
    const safeId = typeof entityId === "string" ? entityId.trim() : "";
    if (!safeId || seen.has(safeId)) {
      return;
    }
    seen.add(safeId);
    normalized.push(safeId);
  });

  return normalized;
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
  if (type === "ENTITY_SELECTION_CHANGED") {
    return `Active entity changed to ${String(source.entityId || "unknown")}.`;
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
    this.selectedEntityId = PRIMARY_ENTITY_ID;
    this.entityStates = ENTITY_DEFINITIONS.map((definition, index) => ({
      entityId: definition.entityId,
      label: definition.label,
      laneY: definition.laneY,
      baselineLagFrames: definition.baselineLagFrames,
      driftScale: definition.driftScale,
      predictedOffsetFrames: definition.baselineLagFrames,
      predictedFrame: 0,
      manualOffsetFrames: 0,
      manualReconcileSeconds: 0,
      lastStatus: "stable",
      channelIndex: index
    }));

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

  getEntityState(entityId = PRIMARY_ENTITY_ID) {
    return this.entityStates.find((entity) => entity.entityId === entityId) || null;
  }

  getSelectedEntityState() {
    return this.getEntityState(this.selectedEntityId) || this.entityStates[0] || null;
  }

  listEntityIds() {
    return this.entityStates.map((entityState) => entityState.entityId);
  }

  selectEntity(entityId, reason = "operator") {
    const normalizedEntityId = typeof entityId === "string" ? entityId.trim() : "";
    const entityState = this.getEntityState(normalizedEntityId);
    if (!entityState) {
      return this.selectedEntityId;
    }

    const previousEntityId = this.selectedEntityId;
    this.selectedEntityId = entityState.entityId;
    this.predictedOffsetFrames = entityState.predictedOffsetFrames;
    this.predictedFrame = entityState.predictedFrame;
    this.manualOffsetFrames = entityState.manualOffsetFrames;
    this.manualReconcileSeconds = entityState.manualReconcileSeconds;
    this.lastKnownStatus = entityState.lastStatus;

    if (previousEntityId !== this.selectedEntityId) {
      this.pushEvent("ENTITY_SELECTION_CHANGED", {
        reason,
        previousEntityId,
        entityId: this.selectedEntityId
      });
    }
    return this.selectedEntityId;
  }

  selectNextEntity(reason = "operator") {
    if (this.entityStates.length <= 1) {
      return this.selectedEntityId;
    }

    const currentIndex = this.entityStates.findIndex((entity) => entity.entityId === this.selectedEntityId);
    const nextIndex = currentIndex >= 0
      ? (currentIndex + 1) % this.entityStates.length
      : 0;
    return this.selectEntity(this.entityStates[nextIndex].entityId, reason);
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

    const status = this.getOverallDivergenceStatus();
    this.simulatedPacketLossPct = status === "critical" ? 4 : status === "warning" ? 2 : 0;
  }

  updateFrameState(dtSeconds, options = {}) {
    const emitEvents = options.emitEvents !== false;
    const frameAdvance = Math.max(1, Math.round(dtSeconds * 60));
    this.authoritativeFrame += frameAdvance;

    const step = this.getCurrentStep();
    this.entityStates.forEach((entityState) => {
      const baseTargetOffset = (step.targetOffsetFrames * entityState.driftScale) + entityState.baselineLagFrames;
      let targetOffset = baseTargetOffset + entityState.manualOffsetFrames;

      if (entityState.manualReconcileSeconds > 0) {
        entityState.manualReconcileSeconds = Math.max(0, entityState.manualReconcileSeconds - dtSeconds);
        targetOffset = entityState.baselineLagFrames;
      } else if (entityState.manualOffsetFrames > 0) {
        entityState.manualOffsetFrames = Math.max(0, entityState.manualOffsetFrames - (dtSeconds * 3));
      }

      const moveRateFramesPerSecond = step.id === "reconciled" || entityState.manualReconcileSeconds > 0
        ? 22
        : 10;
      entityState.predictedOffsetFrames = moveToward(
        entityState.predictedOffsetFrames,
        targetOffset,
        moveRateFramesPerSecond * dtSeconds
      );
      entityState.predictedFrame = this.authoritativeFrame + Math.round(entityState.predictedOffsetFrames);

      const currentStatus = toStatusFromDelta(entityState.predictedFrame - this.authoritativeFrame);
      if (currentStatus !== entityState.lastStatus && emitEvents) {
        this.pushEvent("DIVERGENCE_STATE_CHANGED", {
          entityId: entityState.entityId,
          previous: entityState.lastStatus,
          current: currentStatus,
          delta: entityState.predictedFrame - this.authoritativeFrame
        });
      }
      entityState.lastStatus = currentStatus;
    });

    const selectedEntity = this.getSelectedEntityState();
    if (selectedEntity) {
      this.predictedOffsetFrames = selectedEntity.predictedOffsetFrames;
      this.predictedFrame = selectedEntity.predictedFrame;
      this.manualOffsetFrames = selectedEntity.manualOffsetFrames;
      this.manualReconcileSeconds = selectedEntity.manualReconcileSeconds;
      this.lastKnownStatus = selectedEntity.lastStatus;
    }
  }

  getFrameDelta(entityId = this.selectedEntityId) {
    const entityState = this.getEntityState(entityId);
    if (!entityState) {
      return this.predictedFrame - this.authoritativeFrame;
    }
    return entityState.predictedFrame - this.authoritativeFrame;
  }

  getDivergenceStatus(entityId = this.selectedEntityId) {
    return toStatusFromDelta(this.getFrameDelta(entityId));
  }

  getMaxAbsoluteFrameDelta() {
    if (!Array.isArray(this.entityStates) || this.entityStates.length === 0) {
      return Math.abs(this.getFrameDelta());
    }

    return this.entityStates.reduce((maxValue, entityState) => {
      const absoluteDelta = Math.abs(this.getFrameDelta(entityState.entityId));
      return Math.max(maxValue, absoluteDelta);
    }, 0);
  }

  getOverallDivergenceStatus() {
    return toStatusFromDelta(this.getMaxAbsoluteFrameDelta());
  }

  markPendingInput(key, count = 1) {
    const normalizedCount = Math.max(0, Number(count) || 0);
    if (this.isReplayExecuting || normalizedCount <= 0) {
      return;
    }
    this.pendingInputRecord[key] = Number(this.pendingInputRecord[key] || 0) + normalizedCount;
  }

  markPendingEntityMutation(entityId, mutationKey, count = 1) {
    const normalizedEntityId = typeof entityId === "string" ? entityId.trim() : "";
    const normalizedCount = Math.max(0, Number(count) || 0);
    if (!normalizedEntityId || normalizedCount <= 0 || this.isReplayExecuting) {
      return;
    }

    if (!this.pendingInputRecord.entityMutations || typeof this.pendingInputRecord.entityMutations !== "object") {
      this.pendingInputRecord.entityMutations = {};
    }
    if (!this.pendingInputRecord.entityMutations[normalizedEntityId]) {
      this.pendingInputRecord.entityMutations[normalizedEntityId] = {
        mismatchCount: 0,
        reconcileCount: 0
      };
    }
    this.pendingInputRecord.entityMutations[normalizedEntityId][mutationKey] =
      Number(this.pendingInputRecord.entityMutations[normalizedEntityId][mutationKey] || 0) + normalizedCount;
  }

  flushPendingInputsForFrame(frameId) {
    const normalizedFrameId = Math.floor(Number(frameId));
    if (!isFiniteNumber(normalizedFrameId)) {
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
    if (!isFiniteNumber(normalizedFrameId) || !this.inputHistoryByFrame.has(normalizedFrameId)) {
      return createEmptyInputFrameRecord();
    }
    return cloneInputRecord(this.inputHistoryByFrame.get(normalizedFrameId));
  }

  applyMismatchImpulse(entityId = this.selectedEntityId, count = 1) {
    const normalizedCount = Math.max(1, Math.floor(Number(count) || 1));
    const entityState = this.getEntityState(entityId);
    if (!entityState) {
      return false;
    }
    entityState.manualOffsetFrames = clamp(entityState.manualOffsetFrames + (12 * normalizedCount), 0, 30);
    return true;
  }

  applyReconcileImpulse(entityId = this.selectedEntityId) {
    const entityState = this.getEntityState(entityId);
    if (!entityState) {
      return false;
    }
    entityState.manualOffsetFrames = 0;
    entityState.manualReconcileSeconds = 2.4;
    return true;
  }

  applyReplayInputFrame(inputRecord, selectedEntityIds = null) {
    const replayInput = cloneInputRecord(inputRecord);
    const entityFilter = Array.isArray(selectedEntityIds) && selectedEntityIds.length > 0
      ? new Set(selectedEntityIds)
      : null;

    const entityMutations = replayInput.entityMutations && typeof replayInput.entityMutations === "object"
      ? replayInput.entityMutations
      : {};
    Object.keys(entityMutations).forEach((entityId) => {
      if (entityFilter && !entityFilter.has(entityId)) {
        return;
      }
      const mutation = entityMutations[entityId] && typeof entityMutations[entityId] === "object"
        ? entityMutations[entityId]
        : {};
      const mismatchCount = Math.max(0, Number(mutation.mismatchCount || 0));
      const reconcileCount = Math.max(0, Number(mutation.reconcileCount || 0));
      if (mismatchCount > 0) {
        this.applyMismatchImpulse(entityId, mismatchCount);
      }
      if (reconcileCount > 0) {
        this.applyReconcileImpulse(entityId);
      }
    });
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
      entities: this.entityStates.map((entityState) => ({
        entityId: entityState.entityId,
        label: entityState.label,
        frameValue: entityState.predictedFrame,
        position: {
          x: entityState.predictedFrame,
          y: entityState.laneY
        },
        velocity: {
          x: Number(entityState.predictedOffsetFrames.toFixed(2)),
          y: 0
        },
        stateFlags: {
          phaseId: step.id,
          cycleCount: this.cycleCount,
          divergenceStatus: this.getDivergenceStatus(entityState.entityId),
          selected: entityState.entityId === this.selectedEntityId
        }
      })),
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
          simulatedPacketLossPct: this.simulatedPacketLossPct,
          selectedEntityId: this.selectedEntityId,
          entityStates: this.entityStates.map((entityState) => ({
            entityId: entityState.entityId,
            predictedOffsetFrames: Number(entityState.predictedOffsetFrames.toFixed(6)),
            predictedFrame: entityState.predictedFrame,
            manualOffsetFrames: Number(entityState.manualOffsetFrames.toFixed(6)),
            manualReconcileSeconds: Number(entityState.manualReconcileSeconds.toFixed(6)),
            lastStatus: entityState.lastStatus
          }))
        }
      }
    };
  }

  createAuthoritativeSnapshot() {
    const step = this.getCurrentStep();
    return {
      frameId: this.authoritativeFrame,
      timestampMs: Math.round(this.elapsedSeconds * 1000),
      entities: this.entityStates.map((entityState) => ({
        entityId: entityState.entityId,
        label: entityState.label,
        frameValue: this.authoritativeFrame,
        position: {
          x: this.authoritativeFrame,
          y: entityState.laneY
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
      })),
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

  triggerManualMismatch(reason = "operator", entityId = this.selectedEntityId) {
    this.markPendingEntityMutation(entityId, "mismatchCount", 1);
    this.applyMismatchImpulse(entityId, 1);
    const entityState = this.getEntityState(entityId);
    this.pushEvent("MANUAL_MISMATCH_INJECTED", {
      reason,
      entityId,
      manualOffsetFrames: Number((entityState?.manualOffsetFrames ?? 0).toFixed(2)),
      frameDelta: this.getFrameDelta(entityId)
    });
  }

  triggerManualReconcile(reason = "operator", entityId = this.selectedEntityId) {
    this.markPendingEntityMutation(entityId, "reconcileCount", 1);
    this.applyReconcileImpulse(entityId);
    this.pushEvent("MANUAL_RECONCILE_REQUESTED", {
      reason,
      entityId,
      frameDelta: this.getFrameDelta(entityId)
    });
  }

  triggerRewindPreparation(reason = "operator", options = {}) {
    const requestedEntityIds = normalizeEntityIdList(
      Array.isArray(options.entityIds) ? options.entityIds : options.selectedEntityIds
    );
    const availableEntityIds = new Set(this.listEntityIds());
    const selectedEntityIds = requestedEntityIds.filter((entityId) => availableEntityIds.has(entityId));

    this.markPendingInput("rewindPrepareCount", 1);
    this.updateReconciliationLayer();
    if (selectedEntityIds.length > 0) {
      this.latestRewindPreparation = this.reconciliationLayer.buildRewindPreparation({
        selectedEntityIds
      });
    }
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
      selectedEntityIds: Array.isArray(rewindPreparation.selectedEntityIds)
        ? rewindPreparation.selectedEntityIds.slice()
        : [],
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
    this.elapsedSeconds = isFiniteNumber(restoredElapsedSeconds)
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
    this.selectedEntityId = typeof modelState.selectedEntityId === "string" && modelState.selectedEntityId.trim()
      ? modelState.selectedEntityId.trim()
      : this.selectedEntityId;

    const serializedEntityStates = Array.isArray(modelState.entityStates)
      ? modelState.entityStates
      : [];
    serializedEntityStates.forEach((serializedState) => {
      const entityId = typeof serializedState?.entityId === "string" ? serializedState.entityId : "";
      const entityState = this.getEntityState(entityId);
      if (!entityState) {
        return;
      }
      entityState.predictedOffsetFrames = Number(serializedState.predictedOffsetFrames || entityState.predictedOffsetFrames);
      entityState.predictedFrame = Math.max(0, Math.floor(Number(serializedState.predictedFrame ?? entityState.predictedFrame)));
      entityState.manualOffsetFrames = Number(serializedState.manualOffsetFrames || entityState.manualOffsetFrames);
      entityState.manualReconcileSeconds = Math.max(0, Number(serializedState.manualReconcileSeconds || entityState.manualReconcileSeconds));
      entityState.lastStatus = String(serializedState.lastStatus || entityState.lastStatus);
    });

    const selectedState = this.getSelectedEntityState();
    if (selectedState) {
      this.predictedOffsetFrames = selectedState.predictedOffsetFrames;
      this.predictedFrame = selectedState.predictedFrame;
      this.manualOffsetFrames = selectedState.manualOffsetFrames;
      this.manualReconcileSeconds = selectedState.manualReconcileSeconds;
      this.lastKnownStatus = selectedState.lastStatus;
    }

    return true;
  }

  executeRewindReplay(reason = "operator", options = {}) {
    this.updateReconciliationLayer();
    const availableEntityIds = new Set(this.listEntityIds());
    const requestedEntityIds = normalizeEntityIdList(options.entityIds)
      .filter((entityId) => availableEntityIds.has(entityId));
    if (requestedEntityIds.length > 0) {
      this.latestRewindPreparation = this.reconciliationLayer.buildRewindPreparation({
        selectedEntityIds: requestedEntityIds
      });
    }

    const rewindPreparation = this.latestRewindPreparation || {};
    const preparedEntityRows = Array.isArray(rewindPreparation.entities)
      ? rewindPreparation.entities
      : [];
    const defaultEntityIds = normalizeEntityIdList(rewindPreparation.selectedEntityIds)
      .filter((entityId) => availableEntityIds.has(entityId));
    const selectedEntityIds = requestedEntityIds.length > 0
      ? requestedEntityIds
      : defaultEntityIds.length > 0
        ? defaultEntityIds
        : preparedEntityRows.filter((row) => row.canPrepare).map((row) => row.entityId).slice(0, 1);

    if (rewindPreparation.canPrepare !== true) {
      this.pushEvent("REWIND_REPLAY_SKIPPED", {
        reason,
        status: rewindPreparation.status || "not-ready",
        canPrepare: false,
        selectedEntityIds
      });
      return {
        executed: false,
        reason: "rewind-not-ready",
        rewindPreparation
      };
    }

    if (selectedEntityIds.length === 0) {
      this.pushEvent("REWIND_REPLAY_SKIPPED", {
        reason,
        status: "no-entities-selected",
        canPrepare: false
      });
      return {
        executed: false,
        reason: "no-entities-selected",
        rewindPreparation
      };
    }

    const entityPreparationMap = new Map(preparedEntityRows.map((row) => [row.entityId, row]));
    const selectedEntityPreps = selectedEntityIds
      .map((entityId) => entityPreparationMap.get(entityId))
      .filter((row) => row && row.canPrepare);
    if (selectedEntityPreps.length === 0) {
      this.pushEvent("REWIND_REPLAY_SKIPPED", {
        reason,
        status: "entities-not-ready",
        selectedEntityIds
      });
      return {
        executed: false,
        reason: "entities-not-ready",
        rewindPreparation
      };
    }

    const anchorFrameId = selectedEntityPreps.reduce((minValue, row) => {
      const anchor = Number(row.rewindAnchorFrameId);
      if (!isFiniteNumber(anchor)) {
        return minValue;
      }
      return Math.min(minValue, anchor);
    }, Number.POSITIVE_INFINITY);
    const latestFrameId = selectedEntityIds.reduce((maxValue, entityId) => {
      const latestForEntity = Number(this.reconciliationLayer.getLatestTimelineFrameId({ entityId }));
      if (!isFiniteNumber(latestForEntity)) {
        return maxValue;
      }
      return Math.max(maxValue, latestForEntity);
    }, Number(this.reconciliationLayer.getLatestTimelineFrameId()));

    if (!isFiniteNumber(anchorFrameId) || !isFiniteNumber(latestFrameId) || latestFrameId <= anchorFrameId) {
      this.pushEvent("REWIND_REPLAY_SKIPPED", {
        reason,
        status: "invalid-window",
        anchorFrameId: isFiniteNumber(anchorFrameId) ? anchorFrameId : rewindPreparation.rewindAnchorFrameId,
        latestFrameId: isFiniteNumber(latestFrameId) ? latestFrameId : this.reconciliationLayer.getLatestTimelineFrameId(),
        selectedEntityIds
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
        anchorFrameId,
        selectedEntityIds
      });
      return {
        executed: false,
        reason: "missing-anchor",
        rewindPreparation
      };
    }
    if (selectedEntityIds.length > 0) {
      this.selectEntity(selectedEntityIds[0], "rewind-replay");
    }

    const truncation = this.reconciliationLayer.truncatePredictedHistoryAfter(anchorFrameId, {
      includeGlobal: true,
      entityIds: selectedEntityIds
    });
    const replayStartFrameId = anchorFrameId + 1;
    let replayedFrameCount = 0;

    this.isReplayExecuting = true;
    try {
      for (let frameId = replayStartFrameId; frameId <= latestFrameId; frameId += 1) {
        const replayInput = this.getInputRecordForFrame(frameId);
        this.applyReplayInputFrame(replayInput, selectedEntityIds);
        this.advanceSimulation(FIXED_REPLAY_DT_SECONDS, { emitEvents: false });
        this.reconciliationLayer.recordPredictedSnapshot(this.createPredictedSnapshot());
        replayedFrameCount += 1;
      }
    } finally {
      this.isReplayExecuting = false;
    }

    this.updateReconciliationLayer();
    const postReplayRewind = this.latestRewindPreparation || null;
    const postReplayCorrection = this.latestCorrectionPlan || null;

    this.replayExecutionCount += 1;
    this.latestReplaySummary = {
      replayId: this.replayExecutionCount,
      reason,
      selectedEntityIds: selectedEntityIds.slice(),
      replayAnchorFrameId: anchorFrameId,
      replayLatestFrameId: latestFrameId,
      replayedFrameCount,
      truncatedCount: truncation.totalRemoved,
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
      truncatedCount: truncation.totalRemoved,
      selectedEntityIds: selectedEntityIds.slice(),
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
    const frameDelta = this.getMaxAbsoluteFrameDelta();
    const status = this.getOverallDivergenceStatus();
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
    const selectedEntity = this.getSelectedEntityState();
    const selectedEntityId = selectedEntity?.entityId || this.selectedEntityId;
    const frameDelta = this.getFrameDelta(selectedEntityId);
    const status = this.getDivergenceStatus(selectedEntityId);
    const overallFrameDelta = this.getMaxAbsoluteFrameDelta();
    const overallStatus = this.getOverallDivergenceStatus();
    const validation = this.buildValidationSnapshot();
    const divergenceReport = this.latestDivergenceReport || null;
    const correctionPlan = this.latestCorrectionPlan || null;
    const rewindPreparation = this.latestRewindPreparation || null;
    const timelineStatus = this.reconciliationLayer.getTimelineStatus();
    const entityReports = Array.isArray(divergenceReport?.entityReports)
      ? divergenceReport.entityReports
      : [];
    const selectedEntityReport = entityReports.find((entity) => entity.entityId === selectedEntityId) || null;
    const timelineEntityStatuses = Array.isArray(timelineStatus?.entityStatuses)
      ? timelineStatus.entityStatuses
      : [];
    const rewindPreparationEntities = Array.isArray(rewindPreparation?.entities)
      ? rewindPreparation.entities
      : [];
    const rewindSelectedEntityIds = normalizeEntityIdList(rewindPreparation?.selectedEntityIds);

    const entityReportById = new Map(entityReports.map((entityReport) => [entityReport.entityId, entityReport]));
    const timelineEntityStatusById = new Map(timelineEntityStatuses.map((entityStatus) => [entityStatus.entityId, entityStatus]));
    const rewindPreparationById = new Map(rewindPreparationEntities.map((entityPrep) => [entityPrep.entityId, entityPrep]));

    const divergenceEntities = this.entityStates.map((entityState) => {
      const entityReport = entityReportById.get(entityState.entityId) || {};
      const timelineEntityStatus = timelineEntityStatusById.get(entityState.entityId) || {};
      const rewindEntityStatus = rewindPreparationById.get(entityState.entityId) || {};
      return {
        entityId: entityState.entityId,
        label: entityState.label,
        selected: entityState.entityId === selectedEntityId,
        divergenceStatus: entityState.lastStatus,
        frameDelta: this.getFrameDelta(entityState.entityId),
        authoritativeFrame: this.authoritativeFrame,
        predictedFrame: entityState.predictedFrame,
        targetOffsetFrames: Number(entityState.predictedOffsetFrames.toFixed(2)),
        severity: entityReport.severity || "low",
        correctionMode: entityReport.correctionMode || "hold-annotate",
        alignment: entityReport.alignment || timelineEntityStatus.alignment || "unavailable",
        matchedPredictedFrameId: entityReport.matchedPredictedFrameId ?? timelineEntityStatus.alignedFrameId ?? null,
        timelineFrameGap: timelineEntityStatus.frameGap ?? entityReport.frameGap ?? null,
        rewindStatus: rewindEntityStatus.status || "n/a",
        rewindCanPrepare: Boolean(rewindEntityStatus.canPrepare),
        rewindAnchorFrameId: rewindEntityStatus.rewindAnchorFrameId ?? null,
        rewindResimulateFrameCount: rewindEntityStatus.resimulateFrameCount ?? 0
      };
    });

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
        selectedStatus: status,
        overallStatus,
        frameDelta,
        selectedFrameDelta: frameDelta,
        overallFrameDelta,
        authoritativeFrame: this.authoritativeFrame,
        predictedFrame: this.predictedFrame,
        targetOffsetFrames: Number(this.predictedOffsetFrames.toFixed(2)),
        selectedEntityId,
        selectedEntityLabel: selectedEntity?.label || selectedEntityId,
        selectedEntityIndex: selectedEntity?.channelIndex ?? 0,
        entityCount: divergenceEntities.length,
        entities: divergenceEntities,
        alignment: divergenceReport?.alignment || "unavailable",
        severity: selectedEntityReport?.severity || divergenceReport?.summary?.highestSeverity || "low",
        correctionMode: selectedEntityReport?.correctionMode || correctionPlan?.mode || "hold-annotate",
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
          frameGap: timelineStatus.frameGap,
          entityCount: timelineStatus.entityCount || 0,
          entities: timelineEntityStatuses.map((entityStatus) => ({
            entityId: entityStatus.entityId,
            selected: entityStatus.entityId === selectedEntityId,
            historySize: entityStatus.historySize,
            historyLimit: entityStatus.historyLimit,
            oldestFrameId: entityStatus.oldestFrameId,
            latestFrameId: entityStatus.latestFrameId,
            alignment: entityStatus.alignment,
            alignedFrameId: entityStatus.alignedFrameId,
            frameGap: entityStatus.frameGap
          }))
        }
      },
      correction: correctionPlan,
      rewindPreparation: rewindPreparation
        ? {
            ...rewindPreparation,
            selectedEntityIds: rewindSelectedEntityIds,
            entities: rewindPreparationEntities.slice()
          }
        : null,
      rewindReplay: this.latestReplaySummary ? { ...this.latestReplaySummary } : null,
      reproduction: {
        summary: "Reproduce divergence in a deterministic cycle and validate trace ordering before reconcile.",
        steps: [
          "Open Play first and observe baseline sync.",
          "Let mismatch-seeded and divergence-observed phases run.",
          "Press E to cycle active entity before injecting divergence controls.",
          "Optionally press D to inject an additional mismatch burst on selected entity.",
          "Open Debug Mode and compare divergence state + trace ordering.",
          "Inspect timeline history/alignment and rewind preparation status.",
          "Press W to refresh rewind preparation snapshot for selected entity.",
          "Press X to execute selective rewind + deterministic replay.",
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
