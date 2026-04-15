/*
Toolbox Aid
David Quesenberry
04/06/2026
networkDebugCommandPackBridge.js
*/

import { asArray, asObject, sanitizeText } from "../shared/networkDebugUtils.js";
import { createReplicationDiagnosticsModel } from "../diagnostics/replicationDiagnosticsModel.js";

function normalizeCommandDescriptor(descriptor) {
  const source = asObject(descriptor);
  const name = sanitizeText(source.name);
  if (!name) {
    return null;
  }

  return {
    ...source,
    name,
    summary: sanitizeText(source.summary),
    usage: sanitizeText(source.usage),
    arguments: asArray(source.arguments),
    handler: typeof source.handler === "function" ? source.handler : (() => ({
      status: "error",
      title: "Network Command Error",
      lines: [`Missing handler for ${name}`],
      code: "NETWORK_COMMAND_MISSING_HANDLER"
    }))
  };
}

export function createNetworkHelpCommand(options = {}) {
  const source = asObject(options);
  const lines = asArray(source.lines).map((line) => String(line));
  const fallbackLines = [
    "network.help",
    "network.replication",
    "network.sample.status"
  ];

  return {
    name: sanitizeText(source.name) || "network.help",
    summary: sanitizeText(source.summary) || "Show network command usage.",
    usage: sanitizeText(source.usage) || "network.help",
    handler() {
      return {
        status: "ready",
        title: sanitizeText(source.title) || "Network Help",
        lines: lines.length > 0 ? lines : fallbackLines,
        code: sanitizeText(source.code) || "NETWORK_HELP"
      };
    }
  };
}

function readNetworkSnapshot(context = {}, sampleKey = "network") {
  const source = asObject(context);
  const assets = asObject(source.assets);
  return asObject(assets[sampleKey]);
}

function createReplicationLines(context = {}, sampleKey = "network") {
  const model = createReplicationDiagnosticsModel(readNetworkSnapshot(context, sampleKey));
  const lines = [
    `hostTick=${model.hostTick}`,
    `highestBacklog=${model.highestBacklog}`,
    `divergenceWarnings=${model.divergenceWarnings}`,
    `hasPressure=${model.hasPressure}`
  ];

  model.clients.slice(0, 8).forEach((client) => {
    const row = asObject(client);
    lines.push(
      `${String(row.peerId || "client")} tick=${Number(row.tick) || 0} pending=${Number(row.pendingPackets) || 0} backlog=${Number(row.backlog) || 0} delta=${Number(row.tickDeltaFromHost) || 0}`
    );
  });
  return lines;
}

export function createNetworkReplicationCommand(options = {}) {
  const source = asObject(options);
  const sampleKey = sanitizeText(source.sampleKey) || "network";
  const linesFactory = typeof source.createLines === "function"
    ? source.createLines
    : (context) => createReplicationLines(context, sampleKey);

  return {
    name: sanitizeText(source.name) || "network.replication",
    summary: sanitizeText(source.summary) || "Show replication state and backlog diagnostics.",
    usage: sanitizeText(source.usage) || "network.replication",
    handler(context = {}) {
      return {
        status: "ready",
        title: sanitizeText(source.title) || "Network Replication",
        lines: asArray(linesFactory(context)).map((line) => String(line)),
        code: sanitizeText(source.code) || "NETWORK_REPLICATION"
      };
    }
  };
}

export function createNetworkSampleCommand(options = {}) {
  const source = asObject(options);
  const sampleCommandId = sanitizeText(source.sampleCommandId) || "status";
  const commandName = sanitizeText(source.name) || `network.sample.${sampleCommandId}`;
  const sampleKey = sanitizeText(source.sampleKey) || "network";
  const linesFactory = typeof source.createLines === "function"
    ? source.createLines
    : (context = {}) => {
      const snapshot = readNetworkSnapshot(context, sampleKey);
      const keys = Object.keys(snapshot);
      return [
        `sampleKey=${sampleKey}`,
        `fields=${keys.length > 0 ? keys.join(",") : "none"}`
      ];
    };

  return {
    name: commandName,
    summary: sanitizeText(source.summary) || "Show sample-specific network diagnostics.",
    usage: sanitizeText(source.usage) || commandName,
    handler(context = {}, args = []) {
      return {
        status: "ready",
        title: sanitizeText(source.title) || "Network Sample Diagnostics",
        lines: asArray(linesFactory(context, asArray(args))).map((line) => String(line)),
        code: sanitizeText(source.code) || "NETWORK_SAMPLE"
      };
    }
  };
}

export function createNetworkCommandPack(options = {}) {
  const source = asObject(options);
  const commands = asArray(source.commands)
    .map((descriptor) => normalizeCommandDescriptor(descriptor))
    .filter(Boolean);

  return {
    packId: sanitizeText(source.packId) || "network",
    label: sanitizeText(source.label) || "Network",
    description: sanitizeText(source.description) || "Network diagnostics commands.",
    commands
  };
}
