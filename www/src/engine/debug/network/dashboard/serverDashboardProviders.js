/*
Toolbox Aid
David Quesenberry
04/06/2026
serverDashboardProviders.js
*/

import {
  asArray,
  asNumber,
  asObject,
  sanitizeText,
  toNonNegativeInteger
} from "../shared/networkDebugUtils.js";

function normalizeTrafficSummary(traffic) {
  const source = asObject(traffic);
  return {
    rxBytes: Math.max(0, asNumber(source.rxBytes, 0)),
    txBytes: Math.max(0, asNumber(source.txBytes, 0))
  };
}

function normalizeLatencySummary(latency) {
  const source = asObject(latency);
  return {
    averageMs: Math.max(0, asNumber(source.averageMs, 0)),
    maxMs: Math.max(0, asNumber(source.maxMs, 0)),
    p95Ms: Math.max(0, asNumber(source.p95Ms, source.maxMs))
  };
}

function normalizePlayerStatusRow(row, index) {
  const source = asObject(row);
  return {
    playerId: sanitizeText(source.playerId) || `player-${index + 1}`,
    status: sanitizeText(source.status) || "unknown",
    latencyMs: Math.max(0, asNumber(source.latencyMs, 0)),
    rxBytes: Math.max(0, asNumber(source.rxBytes, 0)),
    txBytes: Math.max(0, asNumber(source.txBytes, 0)),
    sessionId: sanitizeText(source.sessionId) || "",
    connected: source.connected !== false
  };
}

export function normalizeServerDashboardSnapshot(snapshot = {}) {
  const source = asObject(snapshot);
  const counts = asObject(source.connectionSessionCounts);

  return {
    timestampMs: Math.max(0, asNumber(source.timestampMs, Date.now())),
    connectionSessionCounts: {
      connections: toNonNegativeInteger(counts.connections, 0),
      sessions: toNonNegativeInteger(counts.sessions, 0)
    },
    latency: normalizeLatencySummary(source.latency),
    traffic: normalizeTrafficSummary(source.traffic),
    players: asArray(source.players).map((row, index) => normalizePlayerStatusRow(row, index))
  };
}

export function createServerDashboardSnapshotProvider(options = {}) {
  const source = asObject(options);
  return {
    providerId: sanitizeText(source.providerId) || "network.dashboard.snapshot",
    title: sanitizeText(source.title) || "Server Dashboard Snapshot",
    readOnly: true,
    sourcePath: sanitizeText(source.sourcePath) || "assets.networkServerDashboard.snapshot"
  };
}

export function createServerDashboardSnapshotCollector(options = {}) {
  const source = asObject(options);
  const getSnapshot = typeof source.getSnapshot === "function"
    ? source.getSnapshot
    : () => asObject(source.snapshot);

  return function collectServerDashboardSnapshot() {
    return normalizeServerDashboardSnapshot(getSnapshot());
  };
}
