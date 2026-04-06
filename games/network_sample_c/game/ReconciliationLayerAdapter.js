/*
Toolbox Aid
David Quesenberry
04/06/2026
ReconciliationLayerAdapter.js
*/
import StateTimelineBuffer from "./StateTimelineBuffer.js";

const APPROVED_PUBLIC_EVENT_TYPES = new Set([
  "worldState.transition.applied",
  "worldState.transition.rejected",
  "gameState.phase.changed",
  "gameState.mode.changed",
  "objective.snapshot.updated"
]);

function asPositiveInteger(value, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return fallback;
  }
  return Math.floor(numeric);
}

function asFiniteNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function sanitizeText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function cloneSnapshot(snapshot) {
  if (snapshot === null || typeof snapshot !== "object") {
    return {};
  }
  return {
    ...snapshot,
    entities: Array.isArray(snapshot.entities)
      ? snapshot.entities.map((entity) => ({
          ...entity,
          position: entity?.position ? { ...entity.position } : undefined,
          velocity: entity?.velocity ? { ...entity.velocity } : undefined,
          stateFlags: entity?.stateFlags ? { ...entity.stateFlags } : undefined
        }))
      : [],
    meta: snapshot.meta && typeof snapshot.meta === "object"
      ? { ...snapshot.meta }
      : undefined
  };
}

function computeVectorDelta(predictedVector, authoritativeVector) {
  const predictedX = asFiniteNumber(predictedVector?.x);
  const predictedY = asFiniteNumber(predictedVector?.y);
  const authoritativeX = asFiniteNumber(authoritativeVector?.x);
  const authoritativeY = asFiniteNumber(authoritativeVector?.y);
  const dx = authoritativeX - predictedX;
  const dy = authoritativeY - predictedY;
  return {
    x: Number(dx.toFixed(2)),
    y: Number(dy.toFixed(2)),
    magnitude: Number(Math.hypot(dx, dy).toFixed(2))
  };
}

function computeStateFlagsDelta(predictedFlags, authoritativeFlags) {
  const predicted = predictedFlags && typeof predictedFlags === "object" ? predictedFlags : {};
  const authoritative = authoritativeFlags && typeof authoritativeFlags === "object" ? authoritativeFlags : {};

  const allKeys = new Set([
    ...Object.keys(predicted),
    ...Object.keys(authoritative)
  ]);

  const deltas = [];
  allKeys.forEach((key) => {
    const predictedValue = predicted[key];
    const authoritativeValue = authoritative[key];
    if (predictedValue !== authoritativeValue) {
      deltas.push({
        key,
        predicted: predictedValue,
        authoritative: authoritativeValue
      });
    }
  });
  return deltas;
}

function severityFromDeltas({ frameGap, positionMagnitude, velocityMagnitude, flagsDeltaCount }) {
  if (frameGap >= 4 || positionMagnitude >= 12 || velocityMagnitude >= 8 || flagsDeltaCount >= 3) {
    return "high";
  }
  if (frameGap >= 1 || positionMagnitude >= 4 || velocityMagnitude >= 2 || flagsDeltaCount >= 1) {
    return "medium";
  }
  return "low";
}

function mergeHighestSeverity(current, candidate) {
  const rank = { low: 1, medium: 2, high: 3 };
  const currentRank = rank[current] || 0;
  const candidateRank = rank[candidate] || 0;
  return candidateRank > currentRank ? candidate : current;
}

function correctionModeFromSeverity(highestSeverity, alignment) {
  if (highestSeverity === "high") {
    return "snap";
  }
  if (highestSeverity === "medium") {
    return "smooth-settle";
  }
  return alignment === "approximate" ? "hold-annotate" : "hold-annotate";
}

export default class ReconciliationLayerAdapter {
  constructor(options = {}) {
    this.timelineId = sanitizeText(options.timelineId, "network-sample-timeline");
    this.timelineBuffer = new StateTimelineBuffer({
      maxFrames: asPositiveInteger(options.historyLimit, 180)
    });

    this.maxAuthoritativeHistory = asPositiveInteger(options.maxAuthoritativeHistory, 60);
    this.authoritativeHistory = [];
    this.latestAuthoritativeSnapshot = null;
    this.latestEventEnvelope = null;
    this.latestDivergenceReport = null;
    this.latestCorrectionPlan = null;
    this.latestRewindPreparation = null;
  }

  normalizeAuthoritativeEnvelope(envelope = {}) {
    const eventType = sanitizeText(envelope.eventType, "worldState.transition.applied");
    const approvedEventType = APPROVED_PUBLIC_EVENT_TYPES.has(eventType);
    return {
      eventType,
      approvedEventType,
      correlationId: sanitizeText(envelope.correlationId, `${this.timelineId}:authoritative`),
      producer: sanitizeText(envelope.producer, "networkSample"),
      timestampMs: asFiniteNumber(envelope.timestampMs, Date.now())
    };
  }

  recordPredictedSnapshot(snapshot = {}) {
    const source = cloneSnapshot(snapshot);
    const frameId = asFiniteNumber(source.frameId, NaN);
    if (!Number.isFinite(frameId)) {
      return false;
    }
    return this.timelineBuffer.pushSnapshot(frameId, source);
  }

  receiveAuthoritativeSnapshot(snapshot = {}, envelope = {}) {
    const normalizedSnapshot = cloneSnapshot(snapshot);
    const frameId = asFiniteNumber(normalizedSnapshot.frameId, NaN);
    if (!Number.isFinite(frameId)) {
      return false;
    }

    const normalizedEnvelope = this.normalizeAuthoritativeEnvelope(envelope);
    this.latestAuthoritativeSnapshot = normalizedSnapshot;
    this.latestEventEnvelope = normalizedEnvelope;
    this.authoritativeHistory.push({
      frameId: Math.floor(frameId),
      snapshot: normalizedSnapshot,
      envelope: normalizedEnvelope
    });

    if (this.authoritativeHistory.length > this.maxAuthoritativeHistory) {
      this.authoritativeHistory.splice(0, this.authoritativeHistory.length - this.maxAuthoritativeHistory);
    }
    return true;
  }

  reconcileLatest() {
    const authoritative = this.latestAuthoritativeSnapshot;
    if (!authoritative || !Number.isFinite(Number(authoritative.frameId))) {
      this.latestDivergenceReport = null;
      this.latestCorrectionPlan = null;
      this.latestRewindPreparation = this.buildRewindPreparation(null);
      return null;
    }

    const authoritativeFrameId = Math.floor(Number(authoritative.frameId));
    const predictedMatch = this.timelineBuffer.getNearestSnapshot(authoritativeFrameId);
    const timelineStatus = this.timelineBuffer.getStatus({
      referenceFrameId: authoritativeFrameId
    });

    if (!predictedMatch) {
      this.latestDivergenceReport = {
        timestampMs: asFiniteNumber(authoritative.timestampMs, Date.now()),
        alignment: "unavailable",
        summary: {
          predictedFrameId: null,
          authoritativeFrameId,
          frameGap: null,
          highestSeverity: "high",
          unresolvedCount: 0
        },
        entityReports: [],
        envelope: this.latestEventEnvelope
      };
      this.latestCorrectionPlan = {
        mode: "hold-annotate",
        severity: "high",
        reason: "No predicted timeline snapshot available for authoritative frame.",
        targetFrameId: authoritativeFrameId,
        applyAtFrameId: authoritativeFrameId
      };
      this.latestRewindPreparation = this.buildRewindPreparation({
        divergenceReport: this.latestDivergenceReport,
        timelineStatus
      });
      return this.latestDivergenceReport;
    }

    const predictedFrameId = predictedMatch.frameId;
    const alignment = predictedMatch.alignment || "approximate";
    const predictedSnapshot = predictedMatch.snapshot || {};
    const predictedEntities = new Map();
    const authoritativeEntities = new Map();

    (Array.isArray(predictedSnapshot.entities) ? predictedSnapshot.entities : []).forEach((entity) => {
      const entityId = sanitizeText(entity?.entityId);
      if (entityId) {
        predictedEntities.set(entityId, entity);
      }
    });

    (Array.isArray(authoritative.entities) ? authoritative.entities : []).forEach((entity) => {
      const entityId = sanitizeText(entity?.entityId);
      if (entityId) {
        authoritativeEntities.set(entityId, entity);
      }
    });

    const allEntityIds = new Set([
      ...predictedEntities.keys(),
      ...authoritativeEntities.keys()
    ]);

    let highestSeverity = "low";
    const entityReports = [];
    allEntityIds.forEach((entityId) => {
      const predictedEntity = predictedEntities.get(entityId) || {};
      const authoritativeEntity = authoritativeEntities.get(entityId) || {};
      const positionDelta = computeVectorDelta(predictedEntity.position, authoritativeEntity.position);
      const velocityDelta = computeVectorDelta(predictedEntity.velocity, authoritativeEntity.velocity);
      const stateFlagsDelta = computeStateFlagsDelta(predictedEntity.stateFlags, authoritativeEntity.stateFlags);
      const frameGap = Math.max(0, authoritativeFrameId - predictedFrameId);
      const severity = severityFromDeltas({
        frameGap,
        positionMagnitude: positionDelta.magnitude,
        velocityMagnitude: velocityDelta.magnitude,
        flagsDeltaCount: stateFlagsDelta.length
      });
      highestSeverity = mergeHighestSeverity(highestSeverity, severity);

      entityReports.push({
        entityId,
        predictedFrame: asFiniteNumber(predictedEntity.frameValue, predictedFrameId),
        authoritativeFrame: asFiniteNumber(authoritativeEntity.frameValue, authoritativeFrameId),
        positionDelta,
        velocityDelta,
        stateFlagsDelta,
        correctionMode: correctionModeFromSeverity(severity, alignment),
        severity
      });
    });

    const unresolvedCount = entityReports.filter((entity) => entity.severity !== "low").length;
    const frameGap = Math.max(0, authoritativeFrameId - predictedFrameId);
    const correctionMode = correctionModeFromSeverity(highestSeverity, alignment);

    this.latestDivergenceReport = {
      timestampMs: asFiniteNumber(authoritative.timestampMs, Date.now()),
      alignment,
      summary: {
        predictedFrameId,
        authoritativeFrameId,
        frameGap,
        highestSeverity,
        unresolvedCount
      },
      entityReports,
      envelope: this.latestEventEnvelope
    };

    this.latestCorrectionPlan = {
      mode: correctionMode,
      severity: highestSeverity,
      reason: this.toCorrectionReason(correctionMode, alignment),
      targetFrameId: authoritativeFrameId,
      applyAtFrameId: authoritativeFrameId + (correctionMode === "snap" ? 0 : 1)
    };

    this.latestRewindPreparation = this.buildRewindPreparation({
      divergenceReport: this.latestDivergenceReport,
      timelineStatus
    });

    return this.latestDivergenceReport;
  }

  toCorrectionReason(mode, alignment) {
    if (mode === "snap") {
      return "High-severity divergence detected; prefer immediate correction.";
    }
    if (mode === "smooth-settle") {
      return "Moderate divergence detected; settle correction over short window.";
    }
    if (alignment === "approximate") {
      return "Approximate timeline alignment; hold and annotate before correction.";
    }
    return "Low divergence; hold and annotate for observability.";
  }

  buildRewindPreparation({ divergenceReport, timelineStatus } = {}) {
    const report = divergenceReport || this.latestDivergenceReport;
    const status = timelineStatus || this.timelineBuffer.getStatus({
      referenceFrameId: report?.summary?.authoritativeFrameId ?? null
    });

    const historySize = asFiniteNumber(status.historySize, 0);
    const latestFrameId = status.latestFrameId;
    const oldestFrameId = status.oldestFrameId;
    const authoritativeFrameId = report?.summary?.authoritativeFrameId ?? null;
    const alignedFrameId = status.alignedFrameId;
    const highestSeverity = report?.summary?.highestSeverity || "low";

    if (historySize < 8 || latestFrameId === null || oldestFrameId === null || authoritativeFrameId === null) {
      return {
        status: "insufficient-history",
        canPrepare: false,
        rewindAnchorFrameId: null,
        resimulateFrameCount: 0,
        frameGap: status.frameGap,
        alignment: status.alignment,
        historySize,
        historyLimit: asFiniteNumber(status.historyLimit, 0),
        note: "Collect more timeline history before preparing rewind windows."
      };
    }

    if (highestSeverity === "low" && status.frameGap === 0) {
      return {
        status: "standby",
        canPrepare: false,
        rewindAnchorFrameId: alignedFrameId,
        resimulateFrameCount: 0,
        frameGap: status.frameGap,
        alignment: status.alignment,
        historySize,
        historyLimit: asFiniteNumber(status.historyLimit, 0),
        note: "Timeline aligned with low divergence; rewind preparation not required."
      };
    }

    const baselineAnchorFrameId = alignedFrameId ?? authoritativeFrameId;
    const rewindLeadFrames = highestSeverity === "high" ? 20 : 10;
    const rewindAnchorFrameId = Math.max(oldestFrameId, baselineAnchorFrameId - rewindLeadFrames);
    const resimulateFrameCount = Math.max(0, latestFrameId - rewindAnchorFrameId);
    const canPrepare = resimulateFrameCount > 0;

    return {
      status: canPrepare ? "ready" : "insufficient-history",
      canPrepare,
      rewindAnchorFrameId,
      rewindTargetFrameId: authoritativeFrameId,
      resimulateFrameCount,
      frameGap: status.frameGap,
      alignment: status.alignment,
      historySize,
      historyLimit: asFiniteNumber(status.historyLimit, 0),
      note: canPrepare
        ? "Rewind window prepared for future rollback/resimulation slice."
        : "Timeline cannot produce rewind window yet."
    };
  }

  getLatestDivergenceReport() {
    return this.latestDivergenceReport
      ? { ...this.latestDivergenceReport, entityReports: this.latestDivergenceReport.entityReports.slice() }
      : null;
  }

  getCorrectionPlan() {
    return this.latestCorrectionPlan ? { ...this.latestCorrectionPlan } : null;
  }

  getRewindPreparation() {
    return this.latestRewindPreparation ? { ...this.latestRewindPreparation } : null;
  }

  getTimelineStatus() {
    const referenceFrameId = this.latestDivergenceReport?.summary?.authoritativeFrameId ?? null;
    return this.timelineBuffer.getStatus({ referenceFrameId });
  }

  getTimelineSnapshot(frameId) {
    return this.timelineBuffer.getSnapshot(frameId);
  }

  truncatePredictedHistoryAfter(frameId) {
    return this.timelineBuffer.removeSnapshotsAfter(frameId);
  }

  getLatestTimelineFrameId() {
    return this.timelineBuffer.getStatus({}).latestFrameId;
  }
}
