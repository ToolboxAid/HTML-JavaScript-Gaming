/*
Toolbox Aid
David Quesenberry
04/14/2026
networkObservabilityPanels.js
*/

import { asArray, asObject, sanitizeText } from "../shared/networkDebugUtils.js";
import { createLatencyDiagnosticsModel } from "../diagnostics/latencyDiagnosticsModel.js";
import { createReplicationDiagnosticsModel } from "../diagnostics/replicationDiagnosticsModel.js";

function readNetworkSnapshot(snapshot = {}, snapshotKey = "network") {
  const source = asObject(snapshot);
  return asObject(asObject(source.assets)[snapshotKey]);
}

export function createLatencyRttPanel(options = {}) {
  const source = asObject(options);
  const snapshotKey = sanitizeText(source.snapshotKey) || "network";

  return {
    id: sanitizeText(source.id) || "network-latency-rtt",
    title: sanitizeText(source.title) || "Latency / RTT",
    enabled: source.enabled !== false,
    priority: Number(source.priority) || 1141,
    source: sanitizeText(source.source) || "assets",
    renderMode: "text-block",
    render(panel, snapshot) {
      const model = createLatencyDiagnosticsModel(readNetworkSnapshot(snapshot, snapshotKey));
      return {
        id: sanitizeText(panel?.id) || "network-latency-rtt",
        title: sanitizeText(panel?.title) || "Latency / RTT",
        lines: [
          `status=${model.status}`,
          `rttMs=${model.rttMs}`,
          `jitterMs=${model.jitterMs}`,
          `healthy=${model.healthy}`
        ]
      };
    }
  };
}

export function createReplicationStatePanel(options = {}) {
  const source = asObject(options);
  const snapshotKey = sanitizeText(source.snapshotKey) || "network";

  return {
    id: sanitizeText(source.id) || "network-replication-state",
    title: sanitizeText(source.title) || "Replication State",
    enabled: source.enabled !== false,
    priority: Number(source.priority) || 1142,
    source: sanitizeText(source.source) || "assets",
    renderMode: "text-block",
    render(panel, snapshot) {
      const model = createReplicationDiagnosticsModel(readNetworkSnapshot(snapshot, snapshotKey));
      const lines = [
        `hostTick=${model.hostTick}`,
        `highestBacklog=${model.highestBacklog}`,
        `divergenceWarnings=${model.divergenceWarnings}`,
        `hasPressure=${model.hasPressure}`
      ];

      asArray(model.clients).slice(0, 8).forEach((client) => {
        const row = asObject(client);
        lines.push(
          `${String(row.peerId || "client")} tick=${Number(row.tick) || 0} pending=${Number(row.pendingPackets) || 0} backlog=${Number(row.backlog) || 0} delta=${Number(row.tickDeltaFromHost) || 0}`
        );
      });

      return {
        id: sanitizeText(panel?.id) || "network-replication-state",
        title: sanitizeText(panel?.title) || "Replication State",
        lines
      };
    }
  };
}

export function createNetworkObservabilityPanels(options = {}) {
  const source = asObject(options);
  return [
    createLatencyRttPanel(source.latencyPanel),
    createReplicationStatePanel(source.replicationPanel)
  ];
}
