/*
Toolbox Aid
David Quesenberry
04/06/2026
serverDashboardMetrics.js
*/

import { asArray, asNumber, asObject } from "../shared/networkDebugUtils.js";
import { normalizeServerDashboardSnapshot } from "./serverDashboardProviders.js";

function toPlayerLatencyValues(players) {
  return players
    .map((player) => asNumber(asObject(player).latencyMs, 0))
    .filter((value) => Number.isFinite(value) && value >= 0);
}

function toConnectedPlayers(players) {
  return players.filter((player) => asObject(player).connected === true);
}

function sumPlayerBytes(players, key) {
  return players.reduce((total, player) => {
    const value = Math.max(0, asNumber(asObject(player)[key], 0));
    return total + value;
  }, 0);
}

export function createServerDashboardMetrics(snapshot = {}) {
  const normalized = normalizeServerDashboardSnapshot(snapshot);
  const players = asArray(normalized.players);
  const connectedPlayers = toConnectedPlayers(players);
  const latencyValues = toPlayerLatencyValues(connectedPlayers.length > 0 ? connectedPlayers : players);

  const fallbackAverage = Math.max(0, asNumber(normalized.latency.averageMs, 0));
  const fallbackMin = latencyValues.length > 0
    ? Math.min(...latencyValues)
    : fallbackAverage;
  const fallbackMax = latencyValues.length > 0
    ? Math.max(...latencyValues)
    : Math.max(fallbackAverage, asNumber(normalized.latency.maxMs, 0));

  const playerRxBytes = sumPlayerBytes(players, "rxBytes");
  const playerTxBytes = sumPlayerBytes(players, "txBytes");
  const totalRxBytes = Math.max(playerRxBytes, Math.max(0, asNumber(normalized.traffic.rxBytes, 0)));
  const totalTxBytes = Math.max(playerTxBytes, Math.max(0, asNumber(normalized.traffic.txBytes, 0)));

  return {
    avgLatencyMs: latencyValues.length > 0
      ? latencyValues.reduce((sum, value) => sum + value, 0) / latencyValues.length
      : fallbackAverage,
    minLatencyMs: fallbackMin,
    maxLatencyMs: fallbackMax,
    totalRxBytes,
    totalTxBytes,
    connectionCount: Math.max(0, Math.floor(asNumber(normalized.connectionSessionCounts.connections, 0))),
    connectedSessionCount: Math.max(0, Math.floor(asNumber(normalized.connectionSessionCounts.sessions, 0))),
    playerCount: players.length,
    activePlayerCount: connectedPlayers.length
  };
}
