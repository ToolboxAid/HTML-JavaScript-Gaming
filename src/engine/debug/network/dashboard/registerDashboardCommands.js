/*
Toolbox Aid
David Quesenberry
04/06/2026
registerDashboardCommands.js
*/

import { asArray, asObject, sanitizeText } from "../shared/networkDebugUtils.js";
import { normalizeServerDashboardSnapshot } from "./serverDashboardProviders.js";
import { listServerDashboardRefreshModes } from "./serverDashboardRefreshModes.js";
import {
  readHostSnapshot,
  readHostStatus
} from "../shared/hostReadUtils.js";

function toCommandResult(title, lines, code = "DASHBOARD_OK", status = "ready") {
  return {
    status,
    title,
    lines: asArray(lines).map((line) => String(line)),
    code
  };
}

function formatStatusLines(status) {
  return [
    `running=${Boolean(status.running)}`,
    `mode=${sanitizeText(status.mode) || "normal"}`,
    `refreshIntervalMs=${Number(status.refreshIntervalMs) || 0}`,
    `refreshCount=${Number(status.refreshCount) || 0}`,
    `lastRefreshTimestampMs=${Number(status.lastRefreshTimestampMs) || 0}`,
    `sectionCount=${Number(status.sectionCount) || 0}`,
    `playerCount=${Number(status.playerCount) || 0}`,
    `connections=${Number(status.connectionCount) || 0}`,
    `sessions=${Number(status.sessionCount) || 0}`
  ];
}

function createHelpLines() {
  return [
    "dashboard.help",
    "dashboard.status",
    "dashboard.refresh",
    "dashboard.mode <manual|normal|fast>",
    "dashboard.snapshot"
  ];
}

export function createServerDashboardCommandPack(options = {}) {
  const source = asObject(options);
  const host = asObject(source.host);

  return {
    packId: sanitizeText(source.packId) || "dashboard",
    label: sanitizeText(source.label) || "Server Dashboard",
    description: sanitizeText(source.description) || "Read-only shared server dashboard commands.",
    commands: [
      {
        name: "dashboard.help",
        summary: "Show dashboard command usage.",
        usage: "dashboard.help",
        handler() {
          return toCommandResult("Dashboard Help", [
            ...createHelpLines(),
            `modes=${listServerDashboardRefreshModes().join(",")}`
          ], "DASHBOARD_HELP");
        }
      },
      {
        name: "dashboard.status",
        summary: "Show dashboard host status.",
        usage: "dashboard.status",
        handler() {
          const status = readHostStatus(host);
          return toCommandResult("Dashboard Status", formatStatusLines(status), "DASHBOARD_STATUS");
        }
      },
      {
        name: "dashboard.refresh",
        summary: "Trigger an immediate read-only refresh.",
        usage: "dashboard.refresh",
        handler() {
          if (typeof host.refreshNow !== "function") {
            return toCommandResult("Dashboard Refresh", ["Host refresh API unavailable."], "DASHBOARD_REFRESH_UNAVAILABLE", "failed");
          }
          const result = asObject(host.refreshNow());
          const status = asObject(result.status);
          return toCommandResult("Dashboard Refresh", [
            `ok=${result.ok === true}`,
            ...formatStatusLines(status)
          ], "DASHBOARD_REFRESH");
        }
      },
      {
        name: "dashboard.mode",
        summary: "Get or set dashboard refresh mode.",
        usage: "dashboard.mode <manual|normal|fast>",
        arguments: ["mode"],
        handler(_context, args = []) {
          const requestedMode = sanitizeText(asArray(args)[0]).toLowerCase();
          if (!requestedMode) {
            const status = readHostStatus(host);
            return toCommandResult("Dashboard Mode", [
              `mode=${sanitizeText(status.mode) || "normal"}`,
              `modes=${listServerDashboardRefreshModes().join(",")}`
            ], "DASHBOARD_MODE_STATUS");
          }

          if (typeof host.setRefreshMode !== "function") {
            return toCommandResult("Dashboard Mode", ["Host mode API unavailable."], "DASHBOARD_MODE_UNAVAILABLE", "failed");
          }
          const status = asObject(host.setRefreshMode(requestedMode));
          return toCommandResult("Dashboard Mode", [
            `mode=${sanitizeText(status.mode) || requestedMode}`,
            `refreshIntervalMs=${Number(status.refreshIntervalMs) || 0}`,
            `modes=${listServerDashboardRefreshModes().join(",")}`
          ], "DASHBOARD_MODE_SET");
        }
      },
      {
        name: "dashboard.snapshot",
        summary: "Show normalized dashboard snapshot summary.",
        usage: "dashboard.snapshot",
        handler() {
          const snapshot = normalizeServerDashboardSnapshot(readHostSnapshot(host));
          const players = asArray(snapshot.players);
          const selectedRows = players.slice(0, 5).map((player) => {
            const row = asObject(player);
            return `${sanitizeText(row.playerId) || "player"} status=${sanitizeText(row.status) || "unknown"} connected=${Boolean(row.connected)} latencyMs=${Number(row.latencyMs) || 0}`;
          });
          return toCommandResult("Dashboard Snapshot", [
            `timestampMs=${Number(snapshot.timestampMs) || 0}`,
            `connections=${Number(snapshot.connectionSessionCounts.connections) || 0}`,
            `sessions=${Number(snapshot.connectionSessionCounts.sessions) || 0}`,
            `latencyAvgMs=${Number(snapshot.latency.averageMs) || 0}`,
            `rxBytes=${Number(snapshot.traffic.rxBytes) || 0}`,
            `txBytes=${Number(snapshot.traffic.txBytes) || 0}`,
            `playerCount=${players.length}`,
            ...selectedRows
          ], "DASHBOARD_SNAPSHOT");
        }
      }
    ]
  };
}

export function registerDashboardCommands(options = {}) {
  const source = asObject(options);
  const commandRegistry = source.commandRegistry;
  const commandPack = createServerDashboardCommandPack(source);

  if (commandRegistry && typeof commandRegistry.registerPack === "function") {
    return {
      commandPack,
      registration: commandRegistry.registerPack(commandPack)
    };
  }

  if (commandRegistry && typeof commandRegistry.registerCommandPack === "function") {
    return {
      commandPack,
      registration: commandRegistry.registerCommandPack(commandPack)
    };
  }

  return {
    commandPack,
    registration: null
  };
}
