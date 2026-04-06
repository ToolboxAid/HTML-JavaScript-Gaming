/*
Toolbox Aid
David Quesenberry
04/06/2026
NetworkSampleCScene.js
*/
import { Scene } from "../../../engine/scenes/index.js";
import FakeDivergenceTraceNetworkModel from "./FakeDivergenceTraceNetworkModel.js";

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

function asPositiveNumber(value, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return fallback;
  }
  return numeric;
}

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
        count: 4,
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
    if (getEdgePress(engineInput, "Space", this.edgeState) || getEdgePress(engineInput, "Enter", this.edgeState)) {
      this.networkModel.addManualTraceMarker("manual-key");
    }

    if (getEdgePress(engineInput, "KeyD", this.edgeState)) {
      this.networkModel.triggerManualMismatch("manual-key");
    }

    if (getEdgePress(engineInput, "KeyR", this.edgeState)) {
      this.networkModel.triggerManualReconcile("manual-key");
    }

    if (getEdgePress(engineInput, "KeyW", this.edgeState)) {
      this.networkModel.triggerRewindPreparation("manual-key");
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

    renderer.drawRect(24, 122, 442, 224, PANEL_COLOR);
    renderer.strokeRect(24, 122, 442, 224, PANEL_BORDER, 1);
    renderer.drawText("Divergence State", 42, 140, {
      color: TEXT_COLOR,
      font: "bold 18px monospace",
      textBaseline: "top"
    });

    const status = String(divergence.status || "unknown");
    renderer.drawText(`status=${status}`, 42, 170, {
      color: toStatusColor(status),
      font: "16px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`phase=${String(scenario.phaseLabel || "n/a")} (${String(scenario.phaseId || "n/a")})`, 42, 194, {
      color: TEXT_COLOR,
      font: "14px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`frameDelta=${Number(divergence.frameDelta || 0)} targetOffset=${Number(divergence.targetOffsetFrames || 0).toFixed(2)}`, 42, 218, {
      color: TEXT_COLOR,
      font: "14px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`severity=${String(divergence.severity || "low")} correction=${String(divergence.correctionMode || "hold-annotate")}`, 42, 242, {
      color: toStatusColor(String(divergence.status || "unknown")),
      font: "14px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`authFrame=${Number(divergence.authoritativeFrame || 0)} predictedFrame=${Number(divergence.predictedFrame || 0)}`, 42, 266, {
      color: MUTED_TEXT,
      font: "14px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`rtt=${Number(network.rttMs || 0)}ms jitter=${Number(network.jitterMs || 0)}ms loss=${Number(network.packetLossPct || 0)}%`, 42, 290, {
      color: MUTED_TEXT,
      font: "14px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`cycle=${Number(scenario.cycleCount || 0)} phaseTime=${Number(scenario.phaseElapsedSeconds || 0).toFixed(2)}s align=${String(divergence.alignment || "n/a")}`, 42, 314, {
      color: MUTED_TEXT,
      font: "14px monospace",
      textBaseline: "top"
    });
    renderer.drawText("D mismatch  R reconcile  W rewind prep  V validate", 42, 338, {
      color: MUTED_TEXT,
      font: "14px monospace",
      textBaseline: "top"
    });
  }

  renderTimelinePanel(renderer) {
    const timeline = this.lastSnapshot.timeline || {};
    const history = timeline.history || {};
    const events = Array.isArray(timeline.events) ? timeline.events.slice(-7).reverse() : [];

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

    if (events.length === 0) {
      renderer.drawText("No sequence events yet.", 512, 194, {
        color: MUTED_TEXT,
        font: "14px monospace",
        textBaseline: "top"
      });
      return;
    }

    events.forEach((event, index) => {
      const y = 194 + (index * 22);
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
    renderer.drawText(`anchor=${rewindPreparation.rewindAnchorFrameId ?? "n/a"} resim=${rewindPreparation.resimulateFrameCount ?? 0}`, 42, 474, {
      color: MUTED_TEXT,
      font: "13px monospace",
      textBaseline: "top"
    });

    steps.slice(0, 5).forEach((step, index) => {
      const y = 496 + (index * 18);
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
    renderer.drawText("Space/Enter: trace marker  D: mismatch  R: reconcile  W: rewind prep  V: validate", 24, 56, {
      color: MUTED_TEXT,
      font: "16px monospace",
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
