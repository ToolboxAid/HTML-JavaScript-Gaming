/*
Toolbox Aid
David Quesenberry
04/06/2026
networkSampleADebug.js
*/

import { createNetworkDebugPluginDefinition } from "/src/engine/debug/network/index.js";
import { asArray, asObject } from "/src/engine/debug/inspectors/shared/inspectorUtils.js";
import {
  asNumber,
  commandLinesForTrace,
  getCommandSnapshot,
  toNetworkSnapshot
} from "../../../src/shared/utils/networkDebugUtils.js";

const NETWORK_SAMPLE_KEY = "networkSampleA";

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toConnectionLines(snapshot) {
  const network = toNetworkSnapshot(snapshot, NETWORK_SAMPLE_KEY);
  const connection = asObject(network.connection);
  return [
    `phase=${sanitizeText(connection.phase) || "unknown"}`,
    `connected=${Boolean(connection.connected)}`,
    `phaseDurationSeconds=${asNumber(connection.phaseDurationSeconds, 0).toFixed(2)}`,
    `sentPackets=${asNumber(connection.sentPackets, 0)}`,
    `receivedPackets=${asNumber(connection.receivedPackets, 0)}`,
    `droppedPackets=${asNumber(connection.droppedPackets, 0)}`
  ];
}

function toLatencyLines(snapshot) {
  const network = toNetworkSnapshot(snapshot, NETWORK_SAMPLE_KEY);
  const latency = asObject(network.latency);
  return [
    `status=${sanitizeText(latency.status) || "unknown"}`,
    `rttMs=${asNumber(latency.rttMs, 0)}`,
    `jitterMs=${asNumber(latency.jitterMs, 0)}`
  ];
}

function toTraceLines(snapshot, maxLines = 8) {
  const network = toNetworkSnapshot(snapshot, NETWORK_SAMPLE_KEY);
  const trace = asObject(network.trace);
  const events = asArray(trace.events);
  if (events.length === 0) {
    return ["No network trace events recorded."];
  }

  return events
    .slice(-maxLines)
    .reverse()
    .map((event) => {
      const source = asObject(event);
      const timestampMs = asNumber(source.timestampMs, 0);
      const eventType = sanitizeText(source.type) || "EVENT";
      const phase = sanitizeText(source.phase) || "unknown";
      return `${timestampMs}ms ${eventType} phase=${phase}`;
    });
}

function commandLinesForStatus(context) {
  const snapshot = getCommandSnapshot(context, NETWORK_SAMPLE_KEY);
  const connection = asObject(snapshot.connection);
  const replication = asObject(snapshot.replication);
  return [
    `phase=${sanitizeText(connection.phase) || "unknown"}`,
    `connected=${Boolean(connection.connected)}`,
    `sentPackets=${asNumber(connection.sentPackets, 0)}`,
    `receivedPackets=${asNumber(connection.receivedPackets, 0)}`,
    `pendingPackets=${asNumber(replication.pendingPackets, 0)}`,
    `backlog=${asNumber(replication.backlog, 0)}`
  ];
}

function commandLinesForLatency(context) {
  const snapshot = getCommandSnapshot(context, NETWORK_SAMPLE_KEY);
  const latency = asObject(snapshot.latency);
  return [
    `status=${sanitizeText(latency.status) || "unknown"}`,
    `rttMs=${asNumber(latency.rttMs, 0)}`,
    `jitterMs=${asNumber(latency.jitterMs, 0)}`
  ];
}

export function createNetworkSampleADebugPlugin() {
  return createNetworkDebugPluginDefinition({
    pluginId: "network.sampleA",
    title: "Network Sample A Debug",
    featureFlag: "networkSampleADebug",
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
          providerId: "network.sampleA.connection",
          title: "Sample A Connection Provider",
          readOnly: true,
          sourcePath: "assets.networkSampleA.connection"
        },
        {
          providerId: "network.sampleA.latency",
          title: "Sample A Latency Provider",
          readOnly: true,
          sourcePath: "assets.networkSampleA.latency"
        },
        {
          providerId: "network.sampleA.trace",
          title: "Sample A Trace Provider",
          readOnly: true,
          sourcePath: "assets.networkSampleA.trace"
        }
      ];
    },
    getPanels() {
      return [
        {
          id: "network-connection-status",
          title: "Network Connection",
          enabled: true,
          priority: 1140,
          source: "assets",
          renderMode: "text-block",
          render(_panel, snapshot) {
            return {
              id: "network-connection-status",
              title: "Network Connection",
              lines: toConnectionLines(snapshot)
            };
          }
        },
        {
          id: "network-latency-rtt",
          title: "Network Latency",
          enabled: true,
          priority: 1141,
          source: "assets",
          renderMode: "text-block",
          render(_panel, snapshot) {
            return {
              id: "network-latency-rtt",
              title: "Network Latency",
              lines: toLatencyLines(snapshot)
            };
          }
        },
        {
          id: "network-event-trace",
          title: "Network Trace",
          enabled: true,
          priority: 1142,
          source: "assets",
          renderMode: "text-block",
          render(_panel, snapshot) {
            return {
              id: "network-event-trace",
              title: "Network Trace",
              lines: toTraceLines(snapshot, 8)
            };
          }
        }
      ];
    },
    getCommandPacks() {
      return [
        {
          packId: "network",
          label: "Network Sample A",
          description: "Network diagnostics commands for Sample A loopback telemetry.",
          commands: [
            {
              name: "network.help",
              summary: "Show network command usage for Sample A.",
              usage: "network.help",
              handler() {
                return {
                  status: "ready",
                  title: "Network Help",
                  lines: [
                    "network.help",
                    "network.status",
                    "network.latency",
                    "network.trace [count]"
                  ],
                  code: "NETWORK_HELP"
                };
              }
            },
            {
              name: "network.status",
              summary: "Show synthetic connection and replication status.",
              usage: "network.status",
              handler(context) {
                return {
                  status: "ready",
                  title: "Network Status",
                  lines: commandLinesForStatus(context),
                  code: "NETWORK_STATUS"
                };
              }
            },
            {
              name: "network.latency",
              summary: "Show current synthetic RTT and jitter values.",
              usage: "network.latency",
              handler(context) {
                return {
                  status: "ready",
                  title: "Network Latency",
                  lines: commandLinesForLatency(context),
                  code: "NETWORK_LATENCY"
                };
              }
            },
            {
              name: "network.trace",
              summary: "Show recent synthetic network trace events.",
              usage: "network.trace [count]",
              arguments: ["count"],
              handler(context, args) {
                return {
                  status: "ready",
                  title: "Network Trace",
                  lines: commandLinesForTrace(context, args, {
                    sampleKey: NETWORK_SAMPLE_KEY,
                    sanitizeText,
                    formatNumber: asNumber
                  }),
                  code: "NETWORK_TRACE"
                };
              }
            }
          ]
        }
      ];
    }
  });
}
