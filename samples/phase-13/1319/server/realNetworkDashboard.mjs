import path from "node:path";
import { fileURLToPath } from "node:url";

/*
Toolbox Aid
David Quesenberry
04/15/2026
realNetworkDashboard.mjs
*/
export const DASHBOARD_PATH = "/admin/network-sample-1319/dashboard";
export const METRICS_PATH = "/admin/network-sample-1319/api/metrics";
export const HEALTH_PATH = "/admin/network-sample-1319/health";

export function createDashboardPage({
  metricsPath = METRICS_PATH,
  refreshMs = 1000,
  title = "Network Sample 1319 - Live Server Dashboard"
} = {}) {
  const safeRefresh = Number.isFinite(Number(refreshMs)) ? Math.max(250, Number(refreshMs)) : 1000;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      font-family: "Consolas", "Courier New", monospace;
      background: #081120;
      color: #e2edf8;
    }
    main {
      max-width: 1180px;
      margin: 0 auto;
      padding: 18px;
    }
    h1 {
      margin: 0 0 8px;
      font-size: 28px;
    }
    .subtitle {
      margin: 0 0 14px;
      color: #9eb5cc;
      line-height: 1.35;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-bottom: 14px;
    }
    .card {
      border: 1px solid #2d4868;
      background: #0d2139;
      border-radius: 8px;
      padding: 10px;
    }
    .card h3 {
      margin: 0 0 6px;
      font-size: 14px;
      color: #8db7e3;
    }
    .value {
      font-size: 22px;
      font-weight: 700;
      color: #f8fbff;
    }
    .value.small {
      font-size: 16px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #284667;
      background: #0f1e33;
    }
    th, td {
      text-align: left;
      padding: 8px 9px;
      border-bottom: 1px solid #203752;
      font-size: 13px;
      white-space: nowrap;
    }
    th {
      color: #9dc2e8;
      background: #132842;
      position: sticky;
      top: 0;
    }
    .state-connected { color: #22c55e; }
    .state-disconnected { color: #ef4444; }
    .state-connecting { color: #f59e0b; }
    .footer {
      margin-top: 10px;
      color: #89a4c7;
      font-size: 12px;
    }
    code {
      color: #dbeafe;
      background: #1a2a44;
      padding: 2px 4px;
      border-radius: 4px;
      border: 1px solid #2b4367;
    }
  </style>
</head>
<body>
  <main>
    <h1>Network Sample 1319 - Live Dashboard</h1>
    <p class="subtitle">Real session/runtime telemetry from the authoritative server endpoint. Refresh interval: ${safeRefresh}ms. Endpoint: <code>${metricsPath}</code></p>

    <section class="cards">
      <div class="card"><h3>Active Players</h3><div id="players" class="value">-</div></div>
      <div class="card"><h3>Sessions</h3><div id="sessions" class="value">-</div></div>
      <div class="card"><h3>Connection State</h3><div id="state" class="value small">-</div></div>
      <div class="card"><h3>RTT avg/min/max</h3><div id="latency" class="value small">-</div></div>
      <div class="card"><h3>RX Bytes</h3><div id="rx" class="value">-</div></div>
      <div class="card"><h3>TX Bytes</h3><div id="tx" class="value">-</div></div>
      <div class="card"><h3>Health</h3><div id="health" class="value small">-</div></div>
    </section>

    <section>
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Session</th>
            <th>Status</th>
            <th>RTT</th>
            <th>RX</th>
            <th>TX</th>
            <th>X</th>
            <th>Y</th>
            <th>Tick</th>
            <th>Last Seq</th>
          </tr>
        </thead>
        <tbody id="rows"></tbody>
      </table>
    </section>

    <p id="timestamp" class="footer">Last update: -</p>
  </main>

  <script>
    const metricsPath = ${JSON.stringify(metricsPath)};
    const refreshMs = ${safeRefresh};

    function asNumber(value, fallback = 0) {
      const number = Number(value);
      return Number.isFinite(number) ? number : fallback;
    }

    function formatInt(value) {
      return asNumber(value, 0).toLocaleString();
    }

    function formatLatency(value) {
      const source = value || {};
      const avg = asNumber(source.averageMs, 0).toFixed(2);
      const min = asNumber(source.minMs, 0).toFixed(2);
      const max = asNumber(source.maxMs, 0).toFixed(2);
      return avg + " / " + min + " / " + max;
    }

    function getMetricsUrl() {
      const pageUrl = new URL(window.location.href);
      const key = pageUrl.searchParams.get("key");
      const target = new URL(metricsPath, window.location.origin);
      if (key) {
        target.searchParams.set("key", key);
      }
      return target.toString();
    }

    function renderSummary(summary) {
      document.getElementById("players").textContent = formatInt(summary.activePlayers);
      document.getElementById("sessions").textContent = formatInt(summary.sessionCount);
      const state = String(summary.connectionState || "unknown");
      const stateNode = document.getElementById("state");
      stateNode.textContent = state;
      stateNode.className = "value small state-" + state;
      document.getElementById("latency").textContent = formatLatency(summary.latencyMs);
      document.getElementById("rx").textContent = formatInt(summary.rxBytesTotal);
      document.getElementById("tx").textContent = formatInt(summary.txBytesTotal);
      document.getElementById("health").textContent = String(summary.health || "unknown");
    }

    function renderRows(players) {
      const rows = document.getElementById("rows");
      rows.innerHTML = "";
      (Array.isArray(players) ? players : []).forEach((player) => {
        const tr = document.createElement("tr");
        const status = String(player.status || "unknown");
        tr.innerHTML =
          "<td>" + String(player.playerId || "n/a") + "</td>" +
          "<td>" + String(player.sessionId || "n/a") + "</td>" +
          "<td class='state-" + status + "'>" + status + "</td>" +
          "<td>" + formatInt(player.rttMs) + "</td>" +
          "<td>" + formatInt(player.rxBytes) + "</td>" +
          "<td>" + formatInt(player.txBytes) + "</td>" +
          "<td>" + formatInt(player.x) + "</td>" +
          "<td>" + formatInt(player.y) + "</td>" +
          "<td>" + formatInt(player.authoritativeTick) + "</td>" +
          "<td>" + formatInt(player.lastInputSequence) + "</td>";
        rows.appendChild(tr);
      });
    }

    async function refresh() {
      try {
        const response = await fetch(getMetricsUrl(), { cache: "no-store" });
        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }
        const payload = await response.json();
        renderSummary(payload.summary || {});
        renderRows(payload.players || []);
        document.getElementById("timestamp").textContent = "Last update: " + (payload.timestamp || new Date().toISOString());
      } catch (error) {
        document.getElementById("timestamp").textContent = "Last update failed: " + error.message;
      }
    }

    refresh();
    setInterval(refresh, refreshMs);
  </script>
</body>
</html>`;
}

const isDirectRun = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  console.log("NETWORK_SAMPLE_1319_DASHBOARD_MODULE_ONLY");
  console.log("Start the real runtime with:");
  console.log("node samples/phase-13/1319/server/realNetworkServer.mjs");
}
