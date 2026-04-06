/*
Toolbox Aid
David Quesenberry
04/06/2026
serverDashboardViewModel.js
*/

import { asArray, asBoolean, asObject, sanitizeText } from "../shared/networkDebugUtils.js";
import { createServerDashboardMetrics } from "./serverDashboardMetrics.js";
import { normalizeServerDashboardSnapshot } from "./serverDashboardProviders.js";
import { normalizeServerDashboardRefreshMode } from "./serverDashboardRefreshModes.js";

const DEFAULT_PLAYER_SORT_BY = "latencyMs";
const DEFAULT_PLAYER_SORT_DIRECTION = "desc";

function formatBytes(value) {
  const bytes = Math.max(0, Number(value) || 0);
  if (bytes < 1024) {
    return `${Math.round(bytes)} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function normalizePlayerSortBy(value) {
  const allowed = new Set(["playerId", "status", "latencyMs", "rxBytes", "txBytes", "connected"]);
  const normalized = sanitizeText(value);
  return allowed.has(normalized) ? normalized : DEFAULT_PLAYER_SORT_BY;
}

function normalizePlayerSortDirection(value) {
  const normalized = sanitizeText(value).toLowerCase();
  return normalized === "asc" ? "asc" : DEFAULT_PLAYER_SORT_DIRECTION;
}

function toComparableValue(player, sortBy) {
  const source = asObject(player);
  if (sortBy === "connected") {
    return source.connected === true ? 1 : 0;
  }
  if (sortBy === "latencyMs" || sortBy === "rxBytes" || sortBy === "txBytes") {
    return Number(source[sortBy]) || 0;
  }
  return sanitizeText(source[sortBy]).toLowerCase();
}

function sortPlayers(players, sortBy, sortDirection) {
  const direction = sortDirection === "asc" ? 1 : -1;
  return players
    .slice()
    .sort((left, right) => {
      const leftValue = toComparableValue(left, sortBy);
      const rightValue = toComparableValue(right, sortBy);
      if (leftValue < rightValue) {
        return -1 * direction;
      }
      if (leftValue > rightValue) {
        return 1 * direction;
      }
      return sanitizeText(asObject(left).playerId).localeCompare(sanitizeText(asObject(right).playerId));
    });
}

function toPlayerLines(players) {
  if (players.length === 0) {
    return ["No active players."];
  }
  return players.map((player) => {
    const row = asObject(player);
    return `${sanitizeText(row.playerId) || "player"} status=${sanitizeText(row.status) || "unknown"} connected=${Boolean(row.connected)} latencyMs=${Number(row.latencyMs || 0).toFixed(2)} rx=${formatBytes(row.rxBytes)} tx=${formatBytes(row.txBytes)}`;
  });
}

export function createServerDashboardViewModel(snapshot = {}, options = {}) {
  const source = asObject(options);
  const viewState = asObject(source.viewState);

  const normalizedSnapshot = normalizeServerDashboardSnapshot(snapshot);
  const metrics = createServerDashboardMetrics(normalizedSnapshot);

  const playerSortBy = normalizePlayerSortBy(viewState.sortPlayersBy);
  const playerSortDirection = normalizePlayerSortDirection(viewState.sortPlayersDirection);
  const activeOnly = asBoolean(viewState.activePlayersOnly, false);

  const basePlayers = asArray(normalizedSnapshot.players);
  const visiblePlayers = activeOnly
    ? basePlayers.filter((player) => asObject(player).connected === true)
    : basePlayers;
  const sortedPlayers = sortPlayers(visiblePlayers, playerSortBy, playerSortDirection);

  const mode = normalizeServerDashboardRefreshMode(source.mode);
  const lastRefreshTimestampMs = Math.max(0, Number(source.lastRefreshTimestampMs) || normalizedSnapshot.timestampMs);

  const sections = [
    {
      sectionId: "network.dashboard.summary",
      title: "Dashboard Summary",
      lines: [
        `mode=${mode}`,
        `lastRefreshMs=${lastRefreshTimestampMs}`,
        `players=${metrics.playerCount} activePlayers=${metrics.activePlayerCount}`,
        `connections=${metrics.connectionCount} sessions=${metrics.connectedSessionCount}`
      ]
    },
    {
      sectionId: "network.dashboard.connections",
      title: "Connection / Session Overview",
      lines: [
        `connections=${metrics.connectionCount}`,
        `sessions=${metrics.connectedSessionCount}`,
        `activePlayers=${metrics.activePlayerCount}`
      ]
    },
    {
      sectionId: "network.dashboard.players",
      title: "Per-Player Status",
      lines: toPlayerLines(sortedPlayers.slice(0, 32))
    },
    {
      sectionId: "network.dashboard.latency",
      title: "Latency View",
      lines: [
        `avgLatencyMs=${metrics.avgLatencyMs.toFixed(2)}`,
        `minLatencyMs=${metrics.minLatencyMs.toFixed(2)}`,
        `maxLatencyMs=${metrics.maxLatencyMs.toFixed(2)}`
      ]
    },
    {
      sectionId: "network.dashboard.throughput",
      title: "RX / TX Bytes View",
      lines: [
        `totalRxBytes=${metrics.totalRxBytes} (${formatBytes(metrics.totalRxBytes)})`,
        `totalTxBytes=${metrics.totalTxBytes} (${formatBytes(metrics.totalTxBytes)})`
      ]
    },
    {
      sectionId: "network.dashboard.refresh",
      title: "Refresh Strategy",
      lines: [
        `mode=${mode}`,
        `sortPlayersBy=${playerSortBy}`,
        `sortDirection=${playerSortDirection}`,
        `activePlayersOnly=${activeOnly}`
      ]
    }
  ];

  const sectionMap = {};
  sections.forEach((section) => {
    sectionMap[section.sectionId] = {
      ...section,
      lines: asArray(section.lines).slice()
    };
  });

  return {
    title: sanitizeText(source.title) || "Server Dashboard",
    timestampMs: normalizedSnapshot.timestampMs,
    lastRefreshTimestampMs,
    mode,
    metrics,
    playerSort: {
      sortBy: playerSortBy,
      sortDirection: playerSortDirection,
      activeOnly
    },
    snapshot: normalizedSnapshot,
    sections: sections.map((section) => ({
      ...section,
      lines: asArray(section.lines).slice()
    })),
    sectionMap
  };
}
