/*
Toolbox Aid
David Quesenberry
04/06/2026
registerInspectorCommands.js
*/

import {
  asArray,
  asObject,
  sanitizeText
} from "../shared/inspectorUtils.js";
import { toResult } from "../../shared/debugCommandResultUtils.js";
import {
  readHostSnapshot,
  readHostStatus
} from "../../network/shared/hostReadUtils.js";

export function createInspectorCommandPack(options = {}) {
  const source = asObject(options);
  const host = source.host;
  const packId = sanitizeText(source.packId) || "inspector";
  const namespace = sanitizeText(source.namespace) || packId;

  return {
    packId,
    label: sanitizeText(source.label) || "Advanced Inspector",
    description: sanitizeText(source.description) || "Advanced shared inspector host commands.",
    commands: [
      {
        name: `${namespace}.help`,
        summary: "Show inspector command usage.",
        usage: `${namespace}.help`,
        handler() {
          return toResult("ready", "Inspector Help", "INSPECTOR_HELP", [
            `${namespace}.help`,
            `${namespace}.status`,
            `${namespace}.open <inspectorId>`,
            `${namespace}.close [inspectorId]`,
            `${namespace}.focus <targetId>`,
            `${namespace}.snapshot`
          ]);
        }
      },
      {
        name: `${namespace}.status`,
        summary: "Show inspector host status.",
        usage: `${namespace}.status`,
        handler() {
          const status = readHostStatus(host);
          return toResult("ready", "Inspector Status", "INSPECTOR_STATUS", [
            `inspectorCount=${Number(status.inspectorCount) || 0}`,
            `enabledCount=${Number(status.enabledCount) || 0}`,
            `openInspectorId=${sanitizeText(status.openInspectorId) || "none"}`,
            `focusedTargetId=${sanitizeText(status.focusedTargetId) || "none"}`,
            `frameIndex=${Number(status.frameIndex) || 0}`,
            `timelineCount=${Number(status.timelineCount) || 0}`,
            `eventCount=${Number(status.eventCount) || 0}`
          ], { status });
        }
      },
      {
        name: `${namespace}.open`,
        summary: "Open an inspector surface.",
        usage: `${namespace}.open <inspectorId>`,
        arguments: ["inspectorId"],
        handler(_context, args = []) {
          const inspectorId = sanitizeText(asArray(args)[0]);
          if (!inspectorId) {
            return toResult("failed", "Inspector Open", "INSPECTOR_ID_REQUIRED", ["inspectorId is required."]);
          }
          if (!host || typeof host.openInspector !== "function") {
            return toResult("failed", "Inspector Open", "INSPECTOR_HOST_UNAVAILABLE", ["Inspector host is unavailable."]);
          }
          const result = asObject(host.openInspector(inspectorId));
          return toResult(
            result.status || "ready",
            "Inspector Open",
            sanitizeText(result.code) || "INSPECTOR_OPENED",
            [`inspectorId=${inspectorId}`],
            result.details
          );
        }
      },
      {
        name: `${namespace}.close`,
        summary: "Close an inspector surface.",
        usage: `${namespace}.close [inspectorId]`,
        arguments: ["inspectorId"],
        handler(_context, args = []) {
          const inspectorId = sanitizeText(asArray(args)[0]);
          if (!host || typeof host.closeInspector !== "function") {
            return toResult("failed", "Inspector Close", "INSPECTOR_HOST_UNAVAILABLE", ["Inspector host is unavailable."]);
          }
          const result = asObject(host.closeInspector(inspectorId));
          return toResult(
            result.status || "ready",
            "Inspector Close",
            sanitizeText(result.code) || "INSPECTOR_CLOSED",
            [`inspectorId=${inspectorId || "active"}`],
            result.details
          );
        }
      },
      {
        name: `${namespace}.focus`,
        summary: "Focus a target id for inspector views.",
        usage: `${namespace}.focus <targetId>`,
        arguments: ["targetId"],
        handler(_context, args = []) {
          const targetId = sanitizeText(asArray(args)[0]);
          if (!targetId) {
            return toResult("failed", "Inspector Focus", "INSPECTOR_TARGET_REQUIRED", ["targetId is required."]);
          }
          if (!host || typeof host.focusTarget !== "function") {
            return toResult("failed", "Inspector Focus", "INSPECTOR_HOST_UNAVAILABLE", ["Inspector host is unavailable."]);
          }
          const result = asObject(host.focusTarget(targetId));
          return toResult(
            result.status || "ready",
            "Inspector Focus",
            sanitizeText(result.code) || "INSPECTOR_TARGET_FOCUSED",
            [`targetId=${targetId}`],
            result.details
          );
        }
      },
      {
        name: `${namespace}.snapshot`,
        summary: "Show snapshot summary for active inspector models.",
        usage: `${namespace}.snapshot`,
        handler() {
          const snapshot = readHostSnapshot(host);
          const models = asObject(snapshot.models);
          const entityLines = asArray(asObject(models.entity).lines);
          const stateLines = asArray(asObject(models.stateDiff).lines);
          const eventLines = asArray(asObject(models.eventStream).lines);

          return toResult("ready", "Inspector Snapshot", "INSPECTOR_SNAPSHOT", [
            `selectedEntityId=${sanitizeText(snapshot.selectedEntityId) || "none"}`,
            `frameIndex=${Number(snapshot.frameIndex) || 0}`,
            `entityLines=${entityLines.length}`,
            `stateDiffLines=${stateLines.length}`,
            `eventLines=${eventLines.length}`,
            ...entityLines.slice(0, 2),
            ...stateLines.slice(0, 2),
            ...eventLines.slice(0, 2)
          ], { snapshot });
        }
      }
    ]
  };
}

export function registerInspectorCommands(options = {}) {
  const source = asObject(options);
  const commandRegistry = source.commandRegistry;
  const commandPack = createInspectorCommandPack(source);

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

