/*
Toolbox Aid
David Quesenberry
04/06/2026
serverDashboardRenderer.js
*/

import { asArray, asObject, sanitizeText } from "../shared/networkDebugUtils.js";
import { normalizeServerDashboardSnapshot } from "./serverDashboardProviders.js";

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

function renderSummarySection(snapshot) {
  return {
    sectionId: "network.dashboard.summary",
    title: "Connection / Session Summary",
    lines: [
      `connections=${snapshot.connectionSessionCounts.connections}`,
      `sessions=${snapshot.connectionSessionCounts.sessions}`,
      `lastRefreshMs=${snapshot.timestampMs}`
    ]
  };
}

function renderLatencySection(snapshot) {
  return {
    sectionId: "network.dashboard.latency",
    title: "Latency Summary",
    lines: [
      `averageMs=${snapshot.latency.averageMs.toFixed(2)}`,
      `p95Ms=${snapshot.latency.p95Ms.toFixed(2)}`,
      `maxMs=${snapshot.latency.maxMs.toFixed(2)}`
    ]
  };
}

function renderTrafficSection(snapshot) {
  return {
    sectionId: "network.dashboard.traffic",
    title: "Traffic Summary",
    lines: [
      `rxBytes=${snapshot.traffic.rxBytes} (${formatBytes(snapshot.traffic.rxBytes)})`,
      `txBytes=${snapshot.traffic.txBytes} (${formatBytes(snapshot.traffic.txBytes)})`
    ]
  };
}

function renderPlayersSection(snapshot) {
  const players = asArray(snapshot.players);
  if (players.length === 0) {
    return {
      sectionId: "network.dashboard.players",
      title: "Per-Player Status",
      lines: ["No active players."]
    };
  }

  return {
    sectionId: "network.dashboard.players",
    title: "Per-Player Status",
    lines: players.slice(0, 24).map((player) => {
      const row = asObject(player);
      return `${sanitizeText(row.playerId) || "player"} status=${sanitizeText(row.status) || "unknown"} connected=${Boolean(row.connected)} latencyMs=${Number(row.latencyMs || 0).toFixed(2)} rx=${formatBytes(row.rxBytes)} tx=${formatBytes(row.txBytes)}`;
    })
  };
}

const SECTION_RENDERERS = Object.freeze({
  "network.dashboard.summary": renderSummarySection,
  "network.dashboard.latency": renderLatencySection,
  "network.dashboard.traffic": renderTrafficSection,
  "network.dashboard.players": renderPlayersSection
});

const DEFAULT_SECTION_ORDER = Object.freeze([
  "network.dashboard.summary",
  "network.dashboard.latency",
  "network.dashboard.traffic",
  "network.dashboard.players"
]);

export function renderServerDashboardSections(snapshot, options = {}) {
  const normalizedSnapshot = normalizeServerDashboardSnapshot(snapshot);
  const source = asObject(options);
  const registry = asObject(source.registry);
  const listedSections = typeof registry.listSections === "function"
    ? asArray(registry.listSections())
    : [];

  const sectionIds = listedSections.length > 0
    ? listedSections
        .filter((section) => section && section.enabled !== false)
        .map((section) => sanitizeText(asObject(section).sectionId))
        .filter(Boolean)
    : DEFAULT_SECTION_ORDER.slice();

  const sections = sectionIds
    .map((sectionId) => {
      const renderSection = SECTION_RENDERERS[sectionId];
      if (typeof renderSection !== "function") {
        return null;
      }
      return renderSection(normalizedSnapshot);
    })
    .filter(Boolean);

  return {
    title: sanitizeText(source.title) || "Server Dashboard",
    timestampMs: normalizedSnapshot.timestampMs,
    sections
  };
}
