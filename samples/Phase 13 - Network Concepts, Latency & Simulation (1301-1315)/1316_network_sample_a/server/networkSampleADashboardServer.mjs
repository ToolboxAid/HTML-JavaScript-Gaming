/*
Toolbox Aid
David Quesenberry
04/06/2026
networkSampleADashboardServer.mjs
*/
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import FakeLoopbackNetworkModel from "../game/FakeLoopbackNetworkModel.js";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 4310;
const DEFAULT_REFRESH_MS = 1000;
const DEFAULT_ADMIN_KEY = "sample-a-admin";
const DASHBOARD_PATH = "/admin/network-sample-a/dashboard";
const METRICS_PATH = "/admin/network-sample-a/api/metrics";
const HEALTH_PATH = "/admin/network-sample-a/health";

function asPositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function isLoopbackAddress(address) {
  const value = typeof address === "string" ? address.trim() : "";
  if (!value) {
    return false;
  }
  return value === "127.0.0.1"
    || value === "::1"
    || value === "::ffff:127.0.0.1";
}

function toJsonResponse(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function toHtmlResponse(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(body);
}

class SampleAFakeNetworkTelemetrySource {
  constructor(options = {}) {
    this.tickMs = asPositiveInteger(options.tickMs, 250);
    this.players = this.createPlayerStates();
    this.elapsedSeconds = 0;
    this.timer = null;
  }

  createPlayerStates() {
    const descriptors = [
      { playerId: "player-1", sessionId: "session-a", baseTxPacketBytes: 96, baseRxPacketBytes: 88 },
      { playerId: "player-2", sessionId: "session-a", baseTxPacketBytes: 92, baseRxPacketBytes: 84 },
      { playerId: "player-3", sessionId: "session-b", baseTxPacketBytes: 104, baseRxPacketBytes: 90 }
    ];

    return descriptors.map((descriptor, index) => {
      const model = new FakeLoopbackNetworkModel({
        sessionId: `${descriptor.sessionId}-${descriptor.playerId}`
      });

      const initialSnapshot = model.getSnapshot();
      return {
        ...descriptor,
        model,
        index,
        snapshot: initialSnapshot,
        txBytes: 0,
        rxBytes: 0,
        lastSentPackets: initialSnapshot.connection.sentPackets,
        lastReceivedPackets: initialSnapshot.connection.receivedPackets
      };
    });
  }

  start() {
    if (this.timer !== null) {
      return;
    }
    this.timer = setInterval(() => {
      this.update(this.tickMs / 1000);
    }, this.tickMs);
  }

  stop() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  applyDeterministicConnectionTransitions(state) {
    const cycle = (Math.floor(this.elapsedSeconds * 2) + (state.index * 7)) % 28;

    if (cycle === 8 && state.snapshot.connection.phase === "connected") {
      state.model.forceDisconnect();
      return;
    }

    if ((cycle === 10 || cycle === 11) && state.snapshot.connection.phase === "disconnected") {
      state.model.forceReconnect();
    }
  }

  shouldInjectPacket(state) {
    const pulse = (Math.floor(this.elapsedSeconds * 5) + state.index) % 4;
    return pulse === 0 || pulse === 2;
  }

  updatePlayerBytes(state) {
    const sentPackets = Number(state.snapshot.connection.sentPackets || 0);
    const receivedPackets = Number(state.snapshot.connection.receivedPackets || 0);

    const deltaSent = Math.max(0, sentPackets - state.lastSentPackets);
    const deltaReceived = Math.max(0, receivedPackets - state.lastReceivedPackets);

    state.lastSentPackets = sentPackets;
    state.lastReceivedPackets = receivedPackets;

    state.txBytes += deltaSent * state.baseTxPacketBytes;
    state.rxBytes += deltaReceived * state.baseRxPacketBytes;
  }

  update(dtSeconds) {
    this.elapsedSeconds += dtSeconds;

    this.players.forEach((state) => {
      this.applyDeterministicConnectionTransitions(state);

      state.model.update(dtSeconds, {
        injectPacket: this.shouldInjectPacket(state)
      });

      state.snapshot = state.model.getSnapshot();
      this.updatePlayerBytes(state);
    });
  }

  getSnapshot() {
    const playerRows = this.players.map((state) => {
      const connection = state.snapshot.connection || {};
      const latency = state.snapshot.latency || {};
      const replication = state.snapshot.replication || {};
      const divergence = state.snapshot.divergence || {};

      return {
        playerId: state.playerId,
        sessionId: state.sessionId,
        connectionState: connection.phase || "unknown",
        latencyMs: Number(latency.rttMs || 0),
        jitterMs: Number(latency.jitterMs || 0),
        txBytes: state.txBytes,
        rxBytes: state.rxBytes,
        pendingPackets: Number(replication.pendingPackets || 0),
        divergenceScore: divergence.score || "ok"
      };
    });

    const sessionSet = new Set(playerRows.map((row) => row.sessionId));
    const connectedRows = playerRows.filter((row) => row.connectionState === "connected");

    const totalLatency = connectedRows.reduce((sum, row) => sum + row.latencyMs, 0);
    const averageLatencyMs = connectedRows.length > 0
      ? Number((totalLatency / connectedRows.length).toFixed(2))
      : 0;

    const latencySummary = {
      averageMs: averageLatencyMs,
      minMs: connectedRows.length > 0 ? Math.min(...connectedRows.map((row) => row.latencyMs)) : 0,
      maxMs: connectedRows.length > 0 ? Math.max(...connectedRows.map((row) => row.latencyMs)) : 0
    };

    const txBytesTotal = playerRows.reduce((sum, row) => sum + row.txBytes, 0);
    const rxBytesTotal = playerRows.reduce((sum, row) => sum + row.rxBytes, 0);

    const overallConnectionState = connectedRows.length === playerRows.length
      ? "healthy"
      : connectedRows.length === 0
        ? "offline"
        : "degraded";

    return {
      timestamp: new Date().toISOString(),
      source: "sample-a-fake-network-provider",
      summary: {
        playerCount: playerRows.length,
        sessionCount: sessionSet.size,
        connectedPlayers: connectedRows.length,
        connectionState: overallConnectionState,
        latencyMs: latencySummary,
        txBytesTotal,
        rxBytesTotal
      },
      players: playerRows
    };
  }
}

function createDashboardPage(config) {
  const escapedMetricsPath = config.metricsPath;
  const escapedRefreshMs = config.refreshMs;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Network Sample A - Server Dashboard</title>
  <style>
    body {
      margin: 0;
      font-family: "Consolas", "Courier New", monospace;
      background: #0a1220;
      color: #e2edf8;
    }
    main {
      max-width: 1100px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      margin: 0 0 8px;
      font-size: 28px;
    }
    .subtitle {
      margin: 0 0 18px;
      color: #9eb5cc;
      line-height: 1.35;
    }
    .meta {
      margin: 0 0 18px;
      color: #7f96b0;
      font-size: 13px;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
      margin-bottom: 18px;
    }
    .card {
      border: 1px solid #264465;
      background: #10223a;
      border-radius: 8px;
      padding: 12px;
    }
    .card h3 {
      margin: 0 0 6px;
      font-size: 14px;
      color: #8db7e3;
    }
    .value {
      font-size: 22px;
      font-weight: 700;
      color: #e8f5ff;
    }
    .value.small {
      font-size: 16px;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #284667;
      background: #0f1e33;
    }
    th, td {
      text-align: left;
      padding: 8px 10px;
      border-bottom: 1px solid #203752;
      font-size: 13px;
    }
    th {
      color: #9dc2e8;
      background: #132842;
    }
    .state-healthy { color: #34d399; }
    .state-degraded { color: #f59e0b; }
    .state-offline { color: #f87171; }
    .footer {
      margin-top: 14px;
      color: #7f96b0;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <main>
    <h1>Network Sample A Server Dashboard</h1>
    <p class="subtitle">Server-owned, read-only observability for Sample A fake network telemetry. Refresh is polling-based to keep the first implementation minimal and deterministic.</p>
    <p class="meta">Endpoint: ${escapedMetricsPath} | Poll: ${escapedRefreshMs}ms</p>

    <section class="cards">
      <div class="card"><h3>Players</h3><div id="players" class="value">-</div></div>
      <div class="card"><h3>Sessions</h3><div id="sessions" class="value">-</div></div>
      <div class="card"><h3>Connection</h3><div id="connection" class="value small">-</div></div>
      <div class="card"><h3>Latency (avg/min/max)</h3><div id="latency" class="value small">-</div></div>
      <div class="card"><h3>TX Bytes</h3><div id="txBytes" class="value">-</div></div>
      <div class="card"><h3>RX Bytes</h3><div id="rxBytes" class="value">-</div></div>
    </section>

    <section>
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Session</th>
            <th>Connection State</th>
            <th>Latency (ms)</th>
            <th>Jitter (ms)</th>
            <th>TX Bytes</th>
            <th>RX Bytes</th>
            <th>Pending Packets</th>
          </tr>
        </thead>
        <tbody id="playerRows"></tbody>
      </table>
    </section>

    <p class="footer" id="timestamp">Last update: -</p>
  </main>

  <script>
    const metricsPath = ${JSON.stringify(escapedMetricsPath)};
    const refreshMs = ${JSON.stringify(escapedRefreshMs)};

    function formatInt(value) {
      const numeric = Number.isFinite(Number(value)) ? Number(value) : 0;
      return numeric.toLocaleString();
    }

    function formatLatency(summary) {
      const source = summary || {};
      return [source.averageMs || 0, source.minMs || 0, source.maxMs || 0]
        .map((value) => Number(value).toFixed(2))
        .join(" / ");
    }

    function getKeyFromUrl() {
      const url = new URL(window.location.href);
      return url.searchParams.get("key") || "";
    }

    function buildMetricsUrl() {
      const key = getKeyFromUrl();
      const url = new URL(metricsPath, window.location.origin);
      if (key) {
        url.searchParams.set("key", key);
      }
      return url.toString();
    }

    function updateSummary(summary) {
      document.getElementById("players").textContent = formatInt(summary.playerCount);
      document.getElementById("sessions").textContent = formatInt(summary.sessionCount);
      const connectionEl = document.getElementById("connection");
      const connectionState = String(summary.connectionState || "unknown");
      connectionEl.textContent = connectionState + " (" + formatInt(summary.connectedPlayers) + " connected)";
      connectionEl.className = "value small state-" + connectionState;
      document.getElementById("latency").textContent = formatLatency(summary.latencyMs);
      document.getElementById("txBytes").textContent = formatInt(summary.txBytesTotal);
      document.getElementById("rxBytes").textContent = formatInt(summary.rxBytesTotal);
    }

    function updateRows(players) {
      const rowsEl = document.getElementById("playerRows");
      rowsEl.innerHTML = "";

      (Array.isArray(players) ? players : []).forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + row.playerId + "</td>"
          + "<td>" + row.sessionId + "</td>"
          + "<td class=\"state-" + row.connectionState + "\">" + row.connectionState + "</td>"
          + "<td>" + formatInt(row.latencyMs) + "</td>"
          + "<td>" + formatInt(row.jitterMs) + "</td>"
          + "<td>" + formatInt(row.txBytes) + "</td>"
          + "<td>" + formatInt(row.rxBytes) + "</td>"
          + "<td>" + formatInt(row.pendingPackets) + "</td>";
        rowsEl.appendChild(tr);
      });
    }

    async function refreshDashboard() {
      try {
        const response = await fetch(buildMetricsUrl(), { cache: "no-store" });
        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }

        const payload = await response.json();
        updateSummary(payload.summary || {});
        updateRows(payload.players || []);
        document.getElementById("timestamp").textContent = "Last update: " + (payload.timestamp || new Date().toISOString());
      } catch (error) {
        document.getElementById("timestamp").textContent = "Last update failed: " + error.message;
      }
    }

    refreshDashboard();
    setInterval(refreshDashboard, refreshMs);
  </script>
</body>
</html>`;
}

function checkAccess(requestUrl, request, config) {
  const headerKey = String(request.headers["x-debug-admin-key"] || "").trim();
  const queryKey = String(requestUrl.searchParams.get("key") || "").trim();
  const providedKey = headerKey || queryKey;
  const loopback = isLoopbackAddress(request.socket?.remoteAddress);
  const validAdminKey = providedKey && providedKey === config.adminKey;

  if (loopback && config.allowLoopbackWithoutKey === true) {
    return { ok: true };
  }

  if (validAdminKey) {
    if (loopback || config.allowRemoteWithKey === true) {
      return { ok: true };
    }
  }

  if (!loopback && config.allowRemoteWithKey !== true) {
    return {
      ok: false,
      code: "REMOTE_BLOCKED",
      message: "Dashboard access is restricted to loopback addresses."
    };
  }

  return {
    ok: false,
    code: "ADMIN_KEY_REQUIRED",
    message: "Provide a valid dashboard key via ?key=... or x-debug-admin-key."
  };
}

export function createNetworkSampleADashboardServer(options = {}) {
  const config = {
    host: String(options.host || process.env.NETWORK_SAMPLE_A_DASHBOARD_HOST || DEFAULT_HOST),
    port: asPositiveInteger(options.port || process.env.NETWORK_SAMPLE_A_DASHBOARD_PORT, DEFAULT_PORT),
    refreshMs: asPositiveInteger(options.refreshMs || process.env.NETWORK_SAMPLE_A_DASHBOARD_REFRESH_MS, DEFAULT_REFRESH_MS),
    adminKey: String(options.adminKey || process.env.NETWORK_SAMPLE_A_ADMIN_KEY || DEFAULT_ADMIN_KEY),
    allowLoopbackWithoutKey: (options.allowLoopbackWithoutKey === true)
      || String(process.env.NETWORK_SAMPLE_A_ALLOW_LOCALHOST_WITHOUT_KEY || "").trim() === "1",
    allowRemoteWithKey: (options.allowRemoteWithKey === true)
      || String(process.env.NETWORK_SAMPLE_A_ALLOW_REMOTE_WITH_KEY || "").trim() === "1",
    dashboardPath: DASHBOARD_PATH,
    metricsPath: METRICS_PATH,
    healthPath: HEALTH_PATH
  };

  const telemetry = options.telemetrySource || new SampleAFakeNetworkTelemetrySource();

  const server = http.createServer((request, response) => {
    const hostHeader = request.headers.host || `${config.host}:${config.port}`;
    const requestUrl = new URL(request.url || "/", `http://${hostHeader}`);

    if (request.method !== "GET") {
      toJsonResponse(response, 405, {
        status: "failed",
        code: "METHOD_NOT_ALLOWED",
        message: "Only GET is supported."
      });
      return;
    }

    if (requestUrl.pathname === config.healthPath) {
      toJsonResponse(response, 200, {
        status: "ready",
        code: "NETWORK_SAMPLE_A_DASHBOARD_HEALTHY"
      });
      return;
    }

    const access = checkAccess(requestUrl, request, config);
    if (!access.ok) {
      toJsonResponse(response, 403, {
        status: "failed",
        code: access.code,
        message: access.message
      });
      return;
    }

    if (requestUrl.pathname === config.metricsPath) {
      toJsonResponse(response, 200, telemetry.getSnapshot());
      return;
    }

    if (requestUrl.pathname === config.dashboardPath) {
      toHtmlResponse(response, 200, createDashboardPage(config));
      return;
    }

    toJsonResponse(response, 404, {
      status: "failed",
      code: "NOT_FOUND",
      message: "Route not found.",
      routes: [config.dashboardPath, config.metricsPath, config.healthPath]
    });
  });

  return {
    config,
    telemetry,
    start() {
      telemetry.start();
      return new Promise((resolve) => {
        server.listen(config.port, config.host, () => {
          resolve({
            status: "ready",
            host: config.host,
            port: config.port,
            dashboardUrl: `http://${config.host}:${config.port}${config.dashboardPath}`,
            metricsUrl: `http://${config.host}:${config.port}${config.metricsPath}`
          });
        });
      });
    },
    stop() {
      telemetry.stop();
      return new Promise((resolve) => {
        server.close(() => resolve({ status: "ready" }));
      });
    }
  };
}

const isDirectRun = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const dashboardServer = createNetworkSampleADashboardServer();
  dashboardServer.start().then((result) => {
    console.log("NETWORK_SAMPLE_A_SERVER_DASHBOARD_READY");
    console.log(`- Dashboard: ${result.dashboardUrl}?key=${encodeURIComponent(dashboardServer.config.adminKey)}`);
    console.log(`- Metrics: ${result.metricsUrl}?key=${encodeURIComponent(dashboardServer.config.adminKey)}`);
    console.log(`- Health: http://${result.host}:${result.port}${dashboardServer.config.healthPath}`);
    console.log("- Stop: Ctrl+C");
  });

  process.on("SIGINT", async () => {
    await dashboardServer.stop();
    process.exit(0);
  });
}
