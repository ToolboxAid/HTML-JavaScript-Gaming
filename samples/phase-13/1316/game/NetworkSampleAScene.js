/*
Toolbox Aid
David Quesenberry
04/06/2026
NetworkSampleAScene.js
*/
import { Scene } from "/src/engine/scenes/index.js";
import FakeLoopbackNetworkModel from "./FakeLoopbackNetworkModel.js";
import { clamp } from "/src/engine/utils/math.js";
import { asPositiveNumber } from "../../../_shared/numberUtils.js";

const VIEW_WIDTH = 960;
const VIEW_HEIGHT = 720;
const BACKGROUND_COLOR = "#070b16";
const PANEL_COLOR = "#0f172a";
const PANEL_STROKE = "#334155";
const TEXT_COLOR = "#e2e8f0";
const MUTED_TEXT_COLOR = "#94a3b8";
const GOOD_COLOR = "#22c55e";
const WARN_COLOR = "#f59e0b";
const BAD_COLOR = "#ef4444";

function getInputEdgePress(input, keyCode, edgeState) {
  if (!input || typeof input.isDown !== "function" || typeof keyCode !== "string") {
    return false;
  }

  const isDown = input.isDown(keyCode) === true;
  const wasDown = edgeState.get(keyCode) === true;
  edgeState.set(keyCode, isDown);
  return isDown && !wasDown;
}

function toSignalColor(phase) {
  if (phase === "connected") {
    return GOOD_COLOR;
  }
  if (phase === "disconnected") {
    return BAD_COLOR;
  }
  return WARN_COLOR;
}

export default class NetworkSampleAScene extends Scene {
  constructor(options = {}) {
    super();
    this.devConsoleIntegration = options.devConsoleIntegration || null;
    this.debugConfig = options.debugConfig || {
      debugMode: "dev",
      debugEnabled: Boolean(this.devConsoleIntegration)
    };

    this.networkModel = new FakeLoopbackNetworkModel({
      sessionId: "network-sample-a-loopback"
    });

    this.edgeState = new Map();
    this.lastSnapshot = this.networkModel.getSnapshot();
  }

  exit() {
    this.devConsoleIntegration?.dispose?.();
  }

  buildDiagnosticsContext(engine, dtSeconds) {
    const safeDt = asPositiveNumber(dtSeconds, 1 / 60);
    const fps = Math.round(1 / safeDt);
    const input = engine?.input || null;

    return {
      runtime: {
        sceneId: "network-sample-a",
        status: this.lastSnapshot?.connection?.phase || "unknown",
        fps,
        frameTimeMs: Math.round(safeDt * 1000 * 100) / 100,
        debugMode: this.debugConfig.debugMode,
        debugEnabled: this.debugConfig.debugEnabled === true
      },
      entities: {
        count: 3,
        fakeConnections: 1,
        pendingPackets: Number(this.lastSnapshot?.replication?.pendingPackets || 0)
      },
      input: {
        sendPacket: input?.isDown?.("Space") === true || input?.isDown?.("Enter") === true,
        disconnect: input?.isDown?.("KeyC") === true,
        reconnect: input?.isDown?.("KeyR") === true
      },
      render: {
        stages: ["entities", "vector-overlay"],
        debugSurfaceTail: ["debug-overlay", "dev-console-surface"]
      },
      validation: {
        errorCount: 0,
        warningCount: this.lastSnapshot?.replication?.backlog > 3 ? 1 : 0,
        networkTraceCount: Number(this.lastSnapshot?.trace?.totalEvents || 0)
      },
      assets: {
        networkSampleA: this.lastSnapshot
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
      diagnosticsContext: this.buildDiagnosticsContext(engine, dtSeconds)
    });
  }

  update(dtSeconds, engine) {
    const safeDt = asPositiveNumber(dtSeconds, 1 / 60);
    const input = engine?.input || null;

    const injectPacket = getInputEdgePress(input, "Space", this.edgeState)
      || getInputEdgePress(input, "Enter", this.edgeState);
    const forceDisconnect = getInputEdgePress(input, "KeyC", this.edgeState);
    const forceReconnect = getInputEdgePress(input, "KeyR", this.edgeState);

    if (forceDisconnect) {
      this.networkModel.forceDisconnect();
    }

    if (forceReconnect) {
      this.networkModel.forceReconnect();
    }

    this.networkModel.update(safeDt, { injectPacket });
    this.lastSnapshot = this.networkModel.getSnapshot();
    this.updateDebugIntegration(engine, safeDt);
  }

  render(renderer) {
    renderer.clear(BACKGROUND_COLOR);

    renderer.drawText("Network Sample A - Local Loopback / Fake Network", 24, 24, {
      color: TEXT_COLOR,
      font: "bold 24px monospace",
      textBaseline: "top"
    });
    renderer.drawText("Space/Enter: send packet  C: disconnect  R: reconnect", 24, 56, {
      color: MUTED_TEXT_COLOR,
      font: "16px monospace",
      textBaseline: "top"
    });
    renderer.drawText("Shift+` console  Ctrl+Shift+` overlay", 24, 80, {
      color: MUTED_TEXT_COLOR,
      font: "16px monospace",
      textBaseline: "top"
    });

    renderer.drawRect(24, 122, 438, 220, PANEL_COLOR);
    renderer.strokeRect(24, 122, 438, 220, PANEL_STROKE, 1);

    const connection = this.lastSnapshot?.connection || {};
    const latency = this.lastSnapshot?.latency || {};
    const replication = this.lastSnapshot?.replication || {};
    const divergence = this.lastSnapshot?.divergence || {};

    renderer.drawText("Connection", 42, 140, {
      color: TEXT_COLOR,
      font: "bold 18px monospace",
      textBaseline: "top"
    });

    const phase = String(connection.phase || "unknown");
    const statusColor = toSignalColor(phase);
    renderer.drawText(`phase=${phase}`, 42, 170, {
      color: statusColor,
      font: "16px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`connected=${Boolean(connection.connected)}`, 42, 194, {
      color: TEXT_COLOR,
      font: "16px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`rttMs=${Number(latency.rttMs || 0)}`, 42, 218, {
      color: TEXT_COLOR,
      font: "16px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`jitterMs=${Number(latency.jitterMs || 0)}`, 42, 242, {
      color: TEXT_COLOR,
      font: "16px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`pendingPackets=${Number(replication.pendingPackets || 0)}`, 42, 266, {
      color: TEXT_COLOR,
      font: "16px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`backlog=${Number(replication.backlog || 0)}`, 42, 290, {
      color: TEXT_COLOR,
      font: "16px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`divergence=${String(divergence.score || "ok")}`, 42, 314, {
      color: divergence.score === "warning" ? WARN_COLOR : GOOD_COLOR,
      font: "16px monospace",
      textBaseline: "top"
    });

    renderer.drawRect(486, 122, 450, 220, PANEL_COLOR);
    renderer.strokeRect(486, 122, 450, 220, PANEL_STROKE, 1);
    renderer.drawText("Recent Trace", 504, 140, {
      color: TEXT_COLOR,
      font: "bold 18px monospace",
      textBaseline: "top"
    });

    const events = Array.isArray(this.lastSnapshot?.trace?.events) ? this.lastSnapshot.trace.events.slice(-7).reverse() : [];
    if (events.length === 0) {
      renderer.drawText("No trace events", 504, 170, {
        color: MUTED_TEXT_COLOR,
        font: "15px monospace",
        textBaseline: "top"
      });
    } else {
      events.forEach((event, index) => {
        const y = 170 + (index * 24);
        const timestampMs = clamp(Number(event?.timestampMs || 0), 0, 999999);
        const type = String(event?.type || "EVENT");
        const phaseToken = String(event?.phase || "unknown");
        renderer.drawText(`${timestampMs}ms ${type} phase=${phaseToken}`, 504, y, {
          color: MUTED_TEXT_COLOR,
          font: "15px monospace",
          textBaseline: "top"
        });
      });
    }

    const rtt = clamp(Number(latency.rttMs || 0), 0, 120);
    const backlog = clamp(Number(replication.backlog || 0), 0, 12);
    renderer.drawRect(24, 370, 912, 220, PANEL_COLOR);
    renderer.strokeRect(24, 370, 912, 220, PANEL_STROKE, 1);
    renderer.drawText("Telemetry Bars", 42, 390, {
      color: TEXT_COLOR,
      font: "bold 18px monospace",
      textBaseline: "top"
    });

    renderer.drawText("RTT", 42, 430, { color: TEXT_COLOR, font: "16px monospace", textBaseline: "top" });
    renderer.drawRect(108, 434, 720, 18, "#111827");
    renderer.drawRect(108, 434, Math.round((rtt / 120) * 720), 18, rtt < 55 ? GOOD_COLOR : WARN_COLOR);

    renderer.drawText("Backlog", 42, 470, { color: TEXT_COLOR, font: "16px monospace", textBaseline: "top" });
    renderer.drawRect(108, 474, 720, 18, "#111827");
    renderer.drawRect(108, 474, Math.round((backlog / 12) * 720), 18, backlog <= 3 ? GOOD_COLOR : BAD_COLOR);

    renderer.drawText(`session=${String(this.lastSnapshot?.sessionId || "n/a")}`, 42, 520, {
      color: MUTED_TEXT_COLOR,
      font: "15px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`traceEvents=${Number(this.lastSnapshot?.trace?.totalEvents || 0)}`, 42, 544, {
      color: MUTED_TEXT_COLOR,
      font: "15px monospace",
      textBaseline: "top"
    });

    if (this.devConsoleIntegration) {
      this.devConsoleIntegration.render(renderer, {
        worldStages: ["entities", "vector-overlay"]
      });
    }
  }
}
