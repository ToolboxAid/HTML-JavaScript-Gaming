/*
Toolbox Aid
David Quesenberry
04/06/2026
networkDebugCommandPackBridge.js
*/

import { asArray, asObject, sanitizeText } from "../shared/networkDebugUtils.js";

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

  return {
    name: sanitizeText(source.name) || "network.help",
    summary: sanitizeText(source.summary) || "Show network command usage.",
    usage: sanitizeText(source.usage) || "network.help",
    handler() {
      return {
        status: "ready",
        title: sanitizeText(source.title) || "Network Help",
        lines,
        code: sanitizeText(source.code) || "NETWORK_HELP"
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
