/*
Toolbox Aid
David Quesenberry
04/06/2026
NetworkSampleBScene.js
*/
import { Scene } from "../../../src/engine/scenes/index.js";
import FakeHostClientNetworkModel from "./FakeHostClientNetworkModel.js";
import { asPositiveNumber } from "../../../src/shared/utils/numberUtils.js";

const VIEW_WIDTH = 960;
const VIEW_HEIGHT = 720;
const BACKGROUND_COLOR = "#07101f";
const PANEL_COLOR = "#0e1d33";
const PANEL_BORDER = "#3f5f86";
const TEXT_COLOR = "#e2edf9";
const MUTED_TEXT = "#91a7c0";
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

function toStateColor(state) {
  if (state === "connected") {
    return GOOD_COLOR;
  }
  if (state === "disconnected") {
    return BAD_COLOR;
  }
  return WARN_COLOR;
}

function formatPeerLine(peer) {
  const source = peer || {};
  return `${source.label || source.peerId} phase=${source.connectionState} rtt=${source.latencyMs}ms pending=${source.pendingPackets}`;
}

export default class NetworkSampleBScene extends Scene {
  constructor(options = {}) {
    super();
    this.devConsoleIntegration = options.devConsoleIntegration || null;
    this.debugConfig = options.debugConfig || {
      debugMode: "dev",
      debugEnabled: Boolean(this.devConsoleIntegration)
    };

    this.networkModel = new FakeHostClientNetworkModel({
      sessionId: "network-sample-b-host-client"
    });
    this.edgeState = new Map();
    this.lastSnapshot = this.networkModel.getSnapshot();
  }

  exit() {
    this.devConsoleIntegration?.dispose?.();
  }

  buildDiagnosticsContext(dtSeconds) {
    const safeDt = asPositiveNumber(dtSeconds, 1 / 60);
    const summary = this.lastSnapshot.summary || {};

    return {
      runtime: {
        sceneId: "network-sample-b",
        status: summary.connectionState || "unknown",
        fps: Math.round(1 / safeDt),
        frameTimeMs: Math.round(safeDt * 1000 * 100) / 100,
        debugMode: this.debugConfig.debugMode,
        debugEnabled: this.debugConfig.debugEnabled === true
      },
      entities: {
        count: Number(summary.peerCount || 0),
        hostEntities: 3,
        clientEntities: 2
      },
      render: {
        stages: ["entities", "vector-overlay"],
        debugSurfaceTail: ["debug-overlay", "dev-console-surface"]
      },
      validation: {
        errorCount: 0,
        warningCount: Number(this.lastSnapshot.replication?.divergenceWarnings || 0),
        networkTraceCount: Number(this.lastSnapshot.trace?.totalEvents || 0)
      },
      assets: {
        networkSampleB: this.lastSnapshot
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

  handlePeerControls(engineInput) {
    if (getEdgePress(engineInput, "Space", this.edgeState) || getEdgePress(engineInput, "Enter", this.edgeState)) {
      this.networkModel.injectPeerPacket("host-1", "manual-host");
    }

    if (getEdgePress(engineInput, "Digit1", this.edgeState)) {
      this.networkModel.togglePeerConnection("client-a");
    }

    if (getEdgePress(engineInput, "Digit2", this.edgeState)) {
      this.networkModel.togglePeerConnection("client-b");
    }

    if (getEdgePress(engineInput, "KeyH", this.edgeState)) {
      this.networkModel.togglePeerConnection("host-1");
    }
  }

  update(dtSeconds, engine) {
    const safeDt = asPositiveNumber(dtSeconds, 1 / 60);
    const input = engine?.input || null;

    this.handlePeerControls(input);
    this.networkModel.update(safeDt);
    this.lastSnapshot = this.networkModel.getSnapshot();
    this.updateDebugIntegration(engine, safeDt);
  }

  renderHostPanel(renderer) {
    const host = this.lastSnapshot.host || {};
    const summary = this.lastSnapshot.summary || {};

    renderer.drawRect(24, 122, 442, 224, PANEL_COLOR);
    renderer.strokeRect(24, 122, 442, 224, PANEL_BORDER, 1);
    renderer.drawText("Host Status", 42, 140, {
      color: TEXT_COLOR,
      font: "bold 18px monospace",
      textBaseline: "top"
    });

    const hostState = String(host.connectionState || "unknown");
    renderer.drawText(`state=${hostState}`, 42, 170, {
      color: toStateColor(hostState),
      font: "16px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`session=${host.sessionId || "n/a"}`, 42, 194, {
      color: TEXT_COLOR,
      font: "15px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`replicationTick=${Number(host.replicationTick || 0)}`, 42, 218, {
      color: TEXT_COLOR,
      font: "15px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`latencyAvg=${Number(summary.latencyMs?.averageMs || 0).toFixed(2)}ms`, 42, 242, {
      color: TEXT_COLOR,
      font: "15px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`txTotal=${Number(summary.txBytesTotal || 0)} rxTotal=${Number(summary.rxBytesTotal || 0)}`, 42, 266, {
      color: TEXT_COLOR,
      font: "15px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`connectedClients=${Number(summary.connectedClients || 0)}`, 42, 290, {
      color: MUTED_TEXT,
      font: "15px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`overall=${summary.connectionState || "unknown"}`, 42, 314, {
      color: toStateColor(summary.connectionState),
      font: "15px monospace",
      textBaseline: "top"
    });
  }

  renderClientPanel(renderer) {
    const clients = Array.isArray(this.lastSnapshot.clients) ? this.lastSnapshot.clients : [];

    renderer.drawRect(494, 122, 442, 224, PANEL_COLOR);
    renderer.strokeRect(494, 122, 442, 224, PANEL_BORDER, 1);
    renderer.drawText("Client Status", 512, 140, {
      color: TEXT_COLOR,
      font: "bold 18px monospace",
      textBaseline: "top"
    });

    if (clients.length === 0) {
      renderer.drawText("No clients available", 512, 170, {
        color: MUTED_TEXT,
        font: "15px monospace",
        textBaseline: "top"
      });
      return;
    }

    clients.forEach((client, index) => {
      const y = 170 + (index * 50);
      renderer.drawText(formatPeerLine(client), 512, y, {
        color: toStateColor(client.connectionState),
        font: "15px monospace",
        textBaseline: "top"
      });
      renderer.drawText(`tick=${client.replicationTick} backlog=${client.backlog} jitter=${client.jitterMs}`, 512, y + 22, {
        color: MUTED_TEXT,
        font: "14px monospace",
        textBaseline: "top"
      });
    });
  }

  renderOwnershipPanel(renderer) {
    const rows = Array.isArray(this.lastSnapshot.ownership?.rows) ? this.lastSnapshot.ownership.rows : [];

    renderer.drawRect(24, 370, 442, 228, PANEL_COLOR);
    renderer.strokeRect(24, 370, 442, 228, PANEL_BORDER, 1);
    renderer.drawText("Ownership / Authority", 42, 388, {
      color: TEXT_COLOR,
      font: "bold 18px monospace",
      textBaseline: "top"
    });

    rows.slice(0, 7).forEach((row, index) => {
      const y = 418 + (index * 24);
      renderer.drawText(`${row.entityId} -> ${row.ownerPeerId} (${row.authority})`, 42, y, {
        color: MUTED_TEXT,
        font: "14px monospace",
        textBaseline: "top"
      });
    });
  }

  renderReplicationPanel(renderer) {
    const replication = this.lastSnapshot.replication || {};
    const clients = Array.isArray(replication.clientSnapshots) ? replication.clientSnapshots : [];

    renderer.drawRect(494, 370, 442, 228, PANEL_COLOR);
    renderer.strokeRect(494, 370, 442, 228, PANEL_BORDER, 1);
    renderer.drawText("Replication Snapshots", 512, 388, {
      color: TEXT_COLOR,
      font: "bold 18px monospace",
      textBaseline: "top"
    });

    renderer.drawText(`hostTick=${Number(replication.hostTick || 0)} highestBacklog=${Number(replication.highestBacklog || 0)}`, 512, 418, {
      color: TEXT_COLOR,
      font: "14px monospace",
      textBaseline: "top"
    });
    renderer.drawText(`divergenceWarnings=${Number(replication.divergenceWarnings || 0)}`, 512, 442, {
      color: Number(replication.divergenceWarnings || 0) > 0 ? WARN_COLOR : GOOD_COLOR,
      font: "14px monospace",
      textBaseline: "top"
    });

    clients.forEach((client, index) => {
      const y = 472 + (index * 24);
      const delta = Number(client.tickDeltaFromHost || 0);
      const deltaColor = delta > 4 ? WARN_COLOR : MUTED_TEXT;
      renderer.drawText(`${client.peerId} tick=${client.replicationTick} pending=${client.pendingPackets} delta=${delta}`, 512, y, {
        color: deltaColor,
        font: "14px monospace",
        textBaseline: "top"
      });
    });
  }

  render(renderer) {
    renderer.clear(BACKGROUND_COLOR);

    renderer.drawText("Network Sample B - Host / Client Diagnostics", 24, 24, {
      color: TEXT_COLOR,
      font: "bold 24px monospace",
      textBaseline: "top"
    });
    renderer.drawText("Space/Enter: host packet  1: toggle Client A  2: toggle Client B  H: toggle Host", 24, 56, {
      color: MUTED_TEXT,
      font: "16px monospace",
      textBaseline: "top"
    });
    renderer.drawText("Shift+` console  Ctrl+Shift+` overlay", 24, 80, {
      color: MUTED_TEXT,
      font: "16px monospace",
      textBaseline: "top"
    });

    this.renderHostPanel(renderer);
    this.renderClientPanel(renderer);
    this.renderOwnershipPanel(renderer);
    this.renderReplicationPanel(renderer);

    if (this.devConsoleIntegration) {
      this.devConsoleIntegration.render(renderer, {
        worldStages: ["entities", "vector-overlay"]
      });
    }

    renderer.strokeRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT, "rgba(110, 140, 170, 0.2)", 1);
  }
}
