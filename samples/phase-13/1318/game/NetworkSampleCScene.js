/*
Toolbox Aid
David Quesenberry
04/06/2026
NetworkSampleCScene.js
*/
import { Scene } from "/src/engine/scene/index.js";
import FakeDivergenceTraceNetworkModel from "./FakeDivergenceTraceNetworkModel.js";
import { asPositiveNumber, isFiniteNumber } from "../../../shared/numberUtils.js";

const VIEW_WIDTH = 960;
const VIEW_HEIGHT = 720;
const BACKGROUND_COLOR = "#08111f";
const PANEL_COLOR = "#0e1d33";
const PANEL_BORDER = "#3f5f86";
const TEXT_COLOR = "#e2edf9";
const MUTED_TEXT = "#92a8c0";
const GOOD_COLOR = "#34d399";
const WARN_COLOR = "#fbbf24";
const BAD_COLOR = "#f87171";

function getEdgePress(input, code, edgeState) {
  if (!input || typeof input.isDown !== "function") {
    return false;
  }

  const isDown = input.isDown(code) === true;
  const wasDown = edgeState.get(code) === true;
  edgeState.set(code, isDown);
  return isDown && !wasDown;
}

function toStatusColor(status) {
  if (status === "stable" || status === "pass") {
    return GOOD_COLOR;
  }
  if (status === "warning" || status === "pending") {
    return WARN_COLOR;
  }
  return BAD_COLOR;
}

function toChecklistPrefix(status) {
  if (status === "pass") {
    return "[x]";
  }
  if (status === "fail") {
    return "[!]";
  }
  return "[.]";
}

function toEntityToken(entity, options = {}) {
  const source = entity && typeof entity === "object" ? entity : {};
  const numericLabelLimit = Number(options.labelLimit);
  const limit = isFiniteNumber(numericLabelLimit)
    ? Math.max(6, Math.floor(numericLabelLimit))
    : 12;
  const label = String(source.label || source.entityId || "entity");
  const compactLabel = label.length > limit
    ? `${label.slice(0, limit - 1)}.`
    : label;
  const delta = Number(source.frameDelta || 0);
  const status = String(source.divergenceStatus || source.status || "unknown");
  const marker = source.selected === true ? "*" : "-";
  return `${marker}${compactLabel}:${delta}/${status}`;
}

export default class NetworkSampleCScene extends Scene {
  constructor(options = {}) {
    super();
    this.devConsoleIntegration = options.devConsoleIntegration || null;
    this.debugConfig = options.debugConfig || {
      debugMode: "dev",
      debugEnabled: Boolean(this.devConsoleIntegration)
    };

    this.networkModel = new FakeDivergenceTraceNetworkModel({
      sessionId: "network-sample-c-divergence"
    });
    this.edgeState = new Map();
    this.lastSnapshot = this.networkModel.getSnapshot();
  }

  exit() {
    this.devConsoleIntegration?.dispose?.();
  }

  buildDiagnosticsContext(dtSeconds) {
    const safeDt = asPositiveNumber(dtSeconds, 1 / 60);
    const divergence = this.lastSnapshot.divergence || {};
    const validation = this.lastSnapshot.validation || {};
    const validationItems = Array.isArray(validation.items) ? validation.items : [];

    const warningCount = divergence.status === "warning" ? 1 : 0;
    const errorCount = divergence.status === "critical" ? 1 : 0;

    return {
      runtime: {
        sceneId: "network-sample-c",
        status: divergence.status || "unknown",
        fps: Math.round(1 / safeDt),
        frameTimeMs: Math.round(safeDt * 1000 * 100) / 100,
        debugMode: this.debugConfig.debugMode,
        debugEnabled: this.debugConfig.debugEnabled === true
      },
      entities: {
        count: Array.isArray(this.lastSnapshot?.divergence?.entities)
          ? this.lastSnapshot.divergence.entities.length
          : 0,
        timelineEvents: Number(this.lastSnapshot.timeline?.totalEvents || 0),
        traceEvents: Number(this.lastSnapshot.trace?.totalEvents || 0)
      },
      render: {
        stages: ["entities", "vector-overlay"],
        debugSurfaceTail: ["debug-overlay", "dev-console-surface"]
      },
      validation: {
        errorCount,
        warningCount,
        pendingChecks: validationItems.filter((item) => item.status === "pending").length
      },
      assets: {
        networkSampleC: this.lastSnapshot
      }
    };
  }

  updateDebugIntegration(engine, dtSeconds) {
    if (!this.devConsoleIntegration) {
      return;
    }

    this.devConsoleIntegration.update({
      engine,
      scene: this,
      diagnosticsContext: this.buildDiagnosticsContext(dtSeconds)
    });
  }

  handleControls(engineInput) {
    const getSelectedEntityId = () => String(this.networkModel.selectedEntityId || this.lastSnapshot?.divergence?.selectedEntityId || "");

    if (getEdgePress(engineInput, "KeyE", this.edgeState)) {
      this.networkModel.selectNextEntity("manual-key");
    }

    if (getEdgePress(engineInput, "Space", this.edgeState) || getEdgePress(engineInput, "Enter", this.edgeState)) {
      this.networkModel.addManualTraceMarker("manual-key");
    }

    if (getEdgePress(engineInput, "KeyD", this.edgeState)) {
      this.networkModel.triggerManualMismatch("manual-key", getSelectedEntityId());
    }

    if (getEdgePress(engineInput, "KeyR", this.edgeState)) {
      this.networkModel.triggerManualReconcile("manual-key", getSelectedEntityId());
    }

    if (getEdgePress(engineInput, "KeyW", this.edgeState)) {
      const selectedEntityId = getSelectedEntityId();
      this.networkModel.triggerRewindPreparation("manual-key", {
        selectedEntityIds: selectedEntityId ? [selectedEntityId] : []
      });
    }

    if (getEdgePress(engineInput, "KeyX", this.edgeState)) {
      const selectedEntityId = getSelectedEntityId();
      this.networkModel.executeRewindReplay("manual-key", {
        entityIds: selectedEntityId ? [selectedEntityId] : []
      });
    }

    if (getEdgePress(engineInput, "KeyV", this.edgeState)) {
      this.networkModel.runValidation("manual-key");
    }
  }

  update(dtSeconds, engine) {
    const safeDt = asPositiveNumber(dtSeconds, 1 / 60);
    const input = engine?.input || null;

    this.handleControls(input);
    this.networkModel.update(safeDt);
    this.lastSnapshot = this.networkModel.getSnapshot();
    this.updateDebugIntegration(engine, safeDt);
  }

  renderDivergencePanel(renderer) {
    const divergence = this.lastSnapshot.divergence || {};
    const scenario = this.lastSnapshot.scenario || {};
    const network = this.lastSnapshot.network || {};
    const entities = Array.isArray(divergence.entities) ? divergence.entities : [];
    const selectedEntityLabel = String(divergence.selectedEntityLabel || divergence.selectedEntityId || "n/a");
    const entitySummary = entities.slice(0, 3).map((entity) => toEntityToken(entity, { labelLimit: 11 })).join("  ");

    renderer.drawRect(24, 122, 442, 224, PANEL_COLOR);
    renderer.strokeRect(24, 122, 442, 224, PANEL_BORDER, 1);
    renderer.drawText("Divergence State", 42, 140, {
      color: TEXT_COLOR,
      font: "bold 18px monospace",
      textBaseline: "top"
    });

    const status = String(divergence.status || "unknown");
    renderer.drawText(`selected=${status} overall=${String(divergence.overallStatus || status)}`, 42, 170, {
      color: toStatusColor(status),
      font: "15px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`phase=${String(scenario.phaseLabel || "n/a")} (${String(scenario.phaseId || "n/a")})`, 42, 192, {
      color: TEXT_COLOR,
      font: "13px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`entity=${selectedEntityLabel} delta=${Number((divergence.selectedFrameDelta ?? divergence.frameDelta) || 0)} target=${Number(divergence.targetOffsetFrames || 0).toFixed(2)}`, 42, 214, {
      color: TEXT_COLOR,
      font: "13px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`severity=${String(divergence.severity || "low")} correction=${String(divergence.correctionMode || "hold-annotate")}`, 42, 236, {
      color: toStatusColor(String(divergence.status || "unknown")),
      font: "13px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`authFrame=${Number(divergence.authoritativeFrame || 0)} predictedFrame=${Number(divergence.predictedFrame || 0)}`, 42, 258, {
      color: MUTED_TEXT,
      font: "13px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`rtt=${Number(network.rttMs || 0)}ms jitter=${Number(network.jitterMs || 0)}ms loss=${Number(network.packetLossPct || 0)}%`, 42, 280, {
      color: MUTED_TEXT,
      font: "13px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`cycle=${Number(scenario.cycleCount || 0)} phaseTime=${Number(scenario.phaseElapsedSeconds || 0).toFixed(2)}s align=${String(divergence.alignment || "n/a")}`, 42, 302, {
      color: MUTED_TEXT,
      font: "12px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`entities ${entitySummary || "n/a"}`, 42, 322, {
      color: MUTED_TEXT,
      font: "12px monospace",
      textBaseline: "top"
    });
    renderer.drawText("E next entity  D mismatch  R reconcile  W prep  X execute  V validate", 42, 338, {
      color: MUTED_TEXT,
      font: "12px monospace",
      textBaseline: "top"
    });
  }

  renderTimelinePanel(renderer) {
    const timeline = this.lastSnapshot.timeline || {};
    const history = timeline.history || {};
    const events = Array.isArray(timeline.events) ? timeline.events.slice(-5).reverse() : [];
    const entityHistory = Array.isArray(history.entities) ? history.entities : [];
    const entityHistorySummary = entityHistory
      .slice(0, 3)
      .map((entity) => {
        const marker = entity.selected === true ? "*" : "-";
        return `${marker}${String(entity.entityId || "entity")}:${entity.frameGap ?? "n/a"}/${String(entity.alignment || "n/a")}`;
      })
      .join("  ");

    renderer.drawRect(494, 122, 442, 224, PANEL_COLOR);
    renderer.strokeRect(494, 122, 442, 224, PANEL_BORDER, 1);
    renderer.drawText("Event Sequence Timeline", 512, 140, {
      color: TEXT_COLOR,
      font: "bold 18px monospace",
      textBaseline: "top"
    });

    renderer.drawText(`history=${Number(history.size || 0)}/${Number(history.limit || 0)} align=${String(history.alignment || "n/a")} gap=${history.frameGap ?? "n/a"}`, 512, 170, {
      color: MUTED_TEXT,
      font: "13px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`entityHistory=${entityHistorySummary || "n/a"}`, 512, 188, {
      color: MUTED_TEXT,
      font: "11px monospace",
      textBaseline: "top"
    });

    if (events.length === 0) {
      renderer.drawText("No sequence events yet.", 512, 210, {
        color: MUTED_TEXT,
        font: "14px monospace",
        textBaseline: "top"
      });
      return;
    }

    events.forEach((event, index) => {
      const y = 210 + (index * 22);
      const timestampMs = Number(event.timestampMs || 0);
      const type = String(event.type || "EVENT");
      const phaseId = String(event.phaseId || "phase");
      renderer.drawText(`${timestampMs}ms ${type} (${phaseId})`, 512, y, {
        color: MUTED_TEXT,
        font: "13px monospace",
        textBaseline: "top"
      });
    });
  }

  renderReproductionPanel(renderer) {
    const divergence = this.lastSnapshot.divergence || {};
    const reproduction = this.lastSnapshot.reproduction || {};
    const rewindPreparation = this.lastSnapshot.rewindPreparation || {};
    const rewindReplay = this.lastSnapshot.rewindReplay || {};
    const rewindEntities = Array.isArray(rewindPreparation.entities) ? rewindPreparation.entities : [];
    const rewindSelectedEntityIds = Array.isArray(rewindPreparation.selectedEntityIds)
      ? rewindPreparation.selectedEntityIds
      : [];
    const replayEntityIds = Array.isArray(rewindReplay.selectedEntityIds)
      ? rewindReplay.selectedEntityIds
      : [];
    const steps = Array.isArray(reproduction.steps) ? reproduction.steps : [];

    renderer.drawRect(24, 370, 442, 228, PANEL_COLOR);
    renderer.strokeRect(24, 370, 442, 228, PANEL_BORDER, 1);
    renderer.drawText("Divergence Notes + Reproduction", 42, 388, {
      color: TEXT_COLOR,
      font: "bold 18px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`cause: ${String(divergence.likelyCause || "n/a")}`, 42, 414, {
      color: MUTED_TEXT,
      font: "13px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`hint: ${String(divergence.reconciliationHint || "n/a")}`, 42, 434, {
      color: MUTED_TEXT,
      font: "13px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`rewind=${String(rewindPreparation.status || "n/a")} canPrepare=${Boolean(rewindPreparation.canPrepare)}`, 42, 454, {
      color: toStatusColor(rewindPreparation.canPrepare ? "pass" : "pending"),
      font: "13px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`selected=${rewindSelectedEntityIds.join(",") || "n/a"} anchor=${rewindPreparation.rewindAnchorFrameId ?? "n/a"} resim=${rewindPreparation.resimulateFrameCount ?? 0}`, 42, 474, {
      color: MUTED_TEXT,
      font: "11px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`replay=${rewindReplay.replayId ?? "none"} entities=${replayEntityIds.join(",") || "n/a"} frames=${rewindReplay.replayedFrameCount ?? 0}`, 42, 494, {
      color: MUTED_TEXT,
      font: "11px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`replaySeverity=${rewindReplay.postReplaySeverity ?? "n/a"} prepEntities=${rewindEntities.length}`, 42, 510, {
      color: MUTED_TEXT,
      font: "12px monospace",
      textBaseline: "top"
    });

    steps.slice(0, 3).forEach((step, index) => {
      const y = 530 + (index * 17);
      renderer.drawText(`${index + 1}. ${String(step)}`, 42, y, {
        color: MUTED_TEXT,
        font: "12px monospace",
        textBaseline: "top"
      });
    });
  }

  renderValidationPanel(renderer) {
    const validation = this.lastSnapshot.validation || {};
    const items = Array.isArray(validation.items) ? validation.items : [];
    const runState = validation.lastRunPassed === null
      ? "pending"
      : validation.lastRunPassed === true
        ? "pass"
        : "fail";

    renderer.drawRect(494, 370, 442, 228, PANEL_COLOR);
    renderer.strokeRect(494, 370, 442, 228, PANEL_BORDER, 1);
    renderer.drawText("Validation Checklist", 512, 388, {
      color: TEXT_COLOR,
      font: "bold 18px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`lastRun=${validation.lastRunMs === null ? "not-run" : `${validation.lastRunMs}ms`} status=${runState}`, 512, 418, {
      color: toStatusColor(runState),
      font: "14px monospace",
      textBaseline: "top"
    });

    items.slice(0, 7).forEach((item, index) => {
      const y = 446 + (index * 22);
      const status = String(item.status || "pending");
      renderer.drawText(`${toChecklistPrefix(status)} ${String(item.label || "check")}`, 512, y, {
        color: toStatusColor(status),
        font: "13px monospace",
        textBaseline: "top"
      });
    });
  }

  render(renderer) {
    renderer.clear(BACKGROUND_COLOR);

    renderer.drawText("Network Sample C - Divergence / Trace Validation", 24, 24, {
      color: TEXT_COLOR,
      font: "bold 24px monospace",
      textBaseline: "top"
    });
    renderer.drawText("E: next entity  Space/Enter: trace marker  D: mismatch  R: reconcile  W: prep  X: execute  V: validate", 24, 56, {
      color: MUTED_TEXT,
      font: "14px monospace",
      textBaseline: "top"
    });
    renderer.drawText("Open Play first, then Debug Mode for trace and checklist inspection.", 24, 80, {
      color: MUTED_TEXT,
      font: "16px monospace",
      textBaseline: "top"
    });

    this.renderDivergencePanel(renderer);
    this.renderTimelinePanel(renderer);
    this.renderReproductionPanel(renderer);
    this.renderValidationPanel(renderer);

    if (this.devConsoleIntegration) {
      this.devConsoleIntegration.render(renderer, {
        worldStages: ["entities", "vector-overlay"]
      });
    }

    renderer.strokeRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT, "rgba(110, 140, 170, 0.2)", 1);
  }
}
