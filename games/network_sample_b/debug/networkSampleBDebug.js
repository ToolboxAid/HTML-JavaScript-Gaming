/*
Toolbox Aid
David Quesenberry
04/06/2026
networkSampleBDebug.js
*/

import { createNetworkDebugPluginDefinition } from "../../../engine/debug/network/index.js";
import { asArray, asObject } from "../../../src/engine/debug/inspectors/shared/inspectorUtils.js";
import { toNetworkSnapshot } from "../../../src/shared/utils/networkDebugUtils.js";

const NETWORK_SAMPLE_KEY = "networkSampleB";

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function toHostStatusLines(snapshot) {
  const network = toNetworkSnapshot(snapshot, NETWORK_SAMPLE_KEY);
  const summary = asObject(network.summary);
  const host = asObject(network.host);
  return [
    `peerId=${sanitizeText(host.peerId) || "host-1"}`,
    `state=${sanitizeText(host.connectionState) || "unknown"}`,
    `replicationTick=${asNumber(host.replicationTick, 0)}`,
    `latencyMs=${asNumber(host.latencyMs, 0)}`,
    `txBytes=${asNumber(host.txBytes, 0)} rxBytes=${asNumber(host.rxBytes, 0)}`,
    `connectedClients=${asNumber(summary.connectedClients, 0)}`,
    `overall=${sanitizeText(summary.connectionState) || "unknown"}`
  ];
}

function toClientStatusLines(snapshot) {
  const network = toNetworkSnapshot(snapshot, NETWORK_SAMPLE_KEY);
  const clients = asArray(network.clients);
  if (clients.length === 0) {
    return ["No client peer snapshots available."];
  }

  return clients.slice(0, 8).map((client) => {
    const source = asObject(client);
    return `${sanitizeText(source.peerId) || "client"} state=${sanitizeText(source.connectionState) || "unknown"} rtt=${asNumber(source.latencyMs, 0)}ms backlog=${asNumber(source.backlog, 0)}`;
  });
}

function toOwnershipLines(snapshot) {
  const network = toNetworkSnapshot(snapshot, NETWORK_SAMPLE_KEY);
  const ownership = asObject(network.ownership);
  const rows = asArray(ownership.rows);

  if (rows.length === 0) {
    return ["No ownership rows available."];
  }

  const lines = [`mode=${sanitizeText(ownership.authorityMode) || "unknown"}`];
  rows.slice(0, 8).forEach((row) => {
    const source = asObject(row);
    lines.push(`${sanitizeText(source.entityId) || "entity"} -> ${sanitizeText(source.ownerPeerId) || "peer"} (${sanitizeText(source.authority) || "n/a"})`);
  });
  return lines;
}

function toReplicationLines(snapshot) {
  const network = toNetworkSnapshot(snapshot, NETWORK_SAMPLE_KEY);
  const replication = asObject(network.replication);
  const clients = asArray(replication.clientSnapshots);

  const lines = [
    `hostTick=${asNumber(replication.hostTick, 0)}`,
    `highestBacklog=${asNumber(replication.highestBacklog, 0)}`,
    `divergenceWarnings=${asNumber(replication.divergenceWarnings, 0)}`
  ];

  clients.slice(0, 8).forEach((client) => {
    const source = asObject(client);
    lines.push(`${sanitizeText(source.peerId) || "client"} tick=${asNumber(source.replicationTick, 0)} pending=${asNumber(source.pendingPackets, 0)} delta=${asNumber(source.tickDeltaFromHost, 0)}`);
  });

  return lines;
}

function commandLinesForConnections(context) {
  const snapshot = toNetworkSnapshot(context, NETWORK_SAMPLE_KEY);
  const summary = asObject(snapshot.summary);
  const peers = asArray(snapshot.peers);

  const lines = [
    `connectionState=${sanitizeText(summary.connectionState) || "unknown"}`,
    `peerCount=${asNumber(summary.peerCount, peers.length)}`,
    `connectedClients=${asNumber(summary.connectedClients, 0)}`,
    `latencyAvgMs=${asNumber(summary.latencyMs?.averageMs, 0).toFixed(2)}`,
    `latencyMaxMs=${asNumber(summary.latencyMs?.maxMs, 0).toFixed(2)}`
  ];

  peers.slice(0, 12).forEach((peer) => {
    const source = asObject(peer);
    lines.push(`${sanitizeText(source.peerId) || "peer"} role=${sanitizeText(source.role) || "unknown"} state=${sanitizeText(source.connectionState) || "unknown"} rtt=${asNumber(source.latencyMs, 0)}ms`);
  });

  return lines;
}

function commandLinesForReplication(context) {
  const snapshot = toNetworkSnapshot(context, NETWORK_SAMPLE_KEY);
  const replication = asObject(snapshot.replication);
  const clients = asArray(replication.clientSnapshots);

  const lines = [
    `hostTick=${asNumber(replication.hostTick, 0)}`,
    `highestBacklog=${asNumber(replication.highestBacklog, 0)}`,
    `divergenceWarnings=${asNumber(replication.divergenceWarnings, 0)}`
  ];

  clients.slice(0, 12).forEach((client) => {
    const source = asObject(client);
    lines.push(`${sanitizeText(source.peerId) || "client"} tick=${asNumber(source.replicationTick, 0)} pending=${asNumber(source.pendingPackets, 0)} backlog=${asNumber(source.backlog, 0)} delta=${asNumber(source.tickDeltaFromHost, 0)}`);
  });

  return lines;
}

export function createNetworkSampleBDebugPlugin() {
  return createNetworkDebugPluginDefinition({
    pluginId: "network.sampleB",
    title: "Network Sample B Debug",
    featureFlag: "networkSampleBDebug",
    autoActivate: true,
    capabilities: [
      { capabilityId: "debug.overlay.panel", version: "1.0.0", required: true },
      { capabilityId: "debug.command-pack", version: "1.0.0", required: true },
      { capabilityId: "debug.diagnostics.snapshot", version: "1.0.0", required: true },
      { capabilityId: "debug.overlay.provider", version: "1.0.0", required: true }
    ],
    getProviders() {
      return [
        {
          providerId: "network.sampleB.peers",
          title: "Sample B Peer Provider",
          readOnly: true,
          sourcePath: "assets.networkSampleB.peers"
        },
        {
          providerId: "network.sampleB.ownership",
          title: "Sample B Ownership Provider",
          readOnly: true,
          sourcePath: "assets.networkSampleB.ownership"
        },
        {
          providerId: "network.sampleB.replication",
          title: "Sample B Replication Provider",
          readOnly: true,
          sourcePath: "assets.networkSampleB.replication"
        }
      ];
    },
    getPanels() {
      return [
        {
          id: "network-b-host-status",
          title: "Host Status",
          enabled: true,
          priority: 1150,
          source: "assets",
          renderMode: "text-block",
          render(_panel, snapshot) {
            return {
              id: "network-b-host-status",
              title: "Host Status",
              lines: toHostStatusLines(snapshot)
            };
          }
        },
        {
          id: "network-b-client-status",
          title: "Client Status",
          enabled: true,
          priority: 1151,
          source: "assets",
          renderMode: "text-block",
          render(_panel, snapshot) {
            return {
              id: "network-b-client-status",
              title: "Client Status",
              lines: toClientStatusLines(snapshot)
            };
          }
        },
        {
          id: "network-b-ownership-authority",
          title: "Ownership / Authority",
          enabled: true,
          priority: 1152,
          source: "assets",
          renderMode: "text-block",
          render(_panel, snapshot) {
            return {
              id: "network-b-ownership-authority",
              title: "Ownership / Authority",
              lines: toOwnershipLines(snapshot)
            };
          }
        },
        {
          id: "network-b-replication-snapshots",
          title: "Replication Snapshots",
          enabled: true,
          priority: 1153,
          source: "assets",
          renderMode: "text-block",
          render(_panel, snapshot) {
            return {
              id: "network-b-replication-snapshots",
              title: "Replication Snapshots",
              lines: toReplicationLines(snapshot)
            };
          }
        }
      ];
    },
    getCommandPacks() {
      return [
        {
          packId: "network",
          label: "Network Sample B",
          description: "Host/client diagnostics commands for Sample B.",
          commands: [
            {
              name: "network.help",
              summary: "Show network command usage for Sample B.",
              usage: "network.help",
              handler() {
                return {
                  status: "ready",
                  title: "Network Help",
                  lines: [
                    "network.help",
                    "network.connections",
                    "network.replication"
                  ],
                  code: "NETWORK_HELP"
                };
              }
            },
            {
              name: "network.connections",
              summary: "Show host/client connection diagnostics.",
              usage: "network.connections",
              handler(context) {
                return {
                  status: "ready",
                  title: "Network Connections",
                  lines: commandLinesForConnections(context),
                  code: "NETWORK_CONNECTIONS"
                };
              }
            },
            {
              name: "network.replication",
              summary: "Show host/client replication snapshots and drift.",
              usage: "network.replication",
              handler(context) {
                return {
                  status: "ready",
                  title: "Network Replication",
                  lines: commandLinesForReplication(context),
                  code: "NETWORK_REPLICATION"
                };
              }
            }
          ]
        }
      ];
    }
  });
}
