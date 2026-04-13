/*
Toolbox Aid
David Quesenberry
04/06/2026
networkSampleCDebug.js
*/

import { createNetworkDebugPluginDefinition } from "/src/engine/debug/network/index.js";
import { asArray, asObject } from "/src/engine/debug/inspectors/shared/inspectorUtils.js";
import { isFiniteNumber } from "../../../_shared/numberUtils.js";
import {
  asNumber,
  commandLinesForTrace,
  getCommandSnapshot,
  toNetworkSnapshot
} from "../../../_shared/networkDebugUtils.js";

const NETWORK_SAMPLE_KEY = "networkSampleC";

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function formatEntityLine(entity, options = {}) {
  const source = asObject(entity);
  const numericLabelLimit = Number(options.labelLimit);
  const limit = isFiniteNumber(numericLabelLimit)
    ? Math.max(6, Math.floor(numericLabelLimit))
    : 14;
  const label = sanitizeText(source.label) || sanitizeText(source.entityId) || "entity";
  const compactLabel = label.length > limit
    ? `${label.slice(0, limit - 1)}.`
    : label;
  const marker = source.selected === true ? "*" : "-";
  const frameDelta = asNumber(source.frameDelta, 0);
  const status = sanitizeText(source.divergenceStatus || source.status) || "unknown";
  const severity = sanitizeText(source.severity) || "low";
  const alignment = sanitizeText(source.alignment) || "unavailable";
  return `${marker}${compactLabel} delta=${frameDelta} status=${status} severity=${severity} align=${alignment}`;
}

function toDivergenceLines(snapshot) {
  const network = toNetworkSnapshot(snapshot, NETWORK_SAMPLE_KEY);
  const scenario = asObject(network.scenario);
  const divergence = asObject(network.divergence);
  const transport = asObject(network.network);
  const entities = asArray(divergence.entities);
  const selectedEntityId = sanitizeText(divergence.selectedEntityId);
  const selectedEntity = entities.find((entity) => sanitizeText(asObject(entity).entityId) === selectedEntityId);

  const lines = [
    `selectedStatus=${sanitizeText(divergence.status) || "unknown"} overallStatus=${sanitizeText(divergence.overallStatus) || sanitizeText(divergence.status) || "unknown"}`,
    `severity=${sanitizeText(divergence.severity) || "low"} correction=${sanitizeText(divergence.correctionMode) || "hold-annotate"}`,
    `phase=${sanitizeText(scenario.phaseLabel) || "n/a"} (${sanitizeText(scenario.phaseId) || "n/a"})`,
    `selectedEntity=${sanitizeText(divergence.selectedEntityLabel) || selectedEntityId || "n/a"} selectedFrameDelta=${asNumber(divergence.selectedFrameDelta ?? divergence.frameDelta, 0)}`,
    `overallFrameDelta=${asNumber(divergence.overallFrameDelta, asNumber(divergence.frameDelta, 0))}`,
    `authoritativeFrame=${asNumber(divergence.authoritativeFrame, 0)}`,
    `predictedFrame=${asNumber(divergence.predictedFrame, 0)}`,
    `alignment=${sanitizeText(divergence.alignment) || "unavailable"}`,
    `targetOffsetFrames=${asNumber(divergence.targetOffsetFrames, 0).toFixed(2)}`,
    `rttMs=${asNumber(transport.rttMs, 0)} jitterMs=${asNumber(transport.jitterMs, 0)} lossPct=${asNumber(transport.packetLossPct, 0)}`,
    `hint=${sanitizeText(divergence.reconciliationHint) || "n/a"}`
  ];

  if (selectedEntity) {
    lines.push(`selectedEntityDetail ${formatEntityLine(selectedEntity)}`);
  }
  if (entities.length > 0) {
    lines.push(`entityCount=${entities.length}`);
    entities.slice(0, 5).forEach((entity) => {
      lines.push(formatEntityLine(entity));
    });
  }
  return lines;
}

function toTimelineLines(snapshot) {
  const network = toNetworkSnapshot(snapshot, NETWORK_SAMPLE_KEY);
  const timeline = asObject(network.timeline);
  const history = asObject(timeline.history);
  const entityHistory = asArray(history.entities);
  const events = asArray(timeline.events);
  const lines = [
    `history=${asNumber(history.size, 0)}/${asNumber(history.limit, 0)}`,
    `oldestFrame=${history.oldestFrameId ?? "n/a"} latestFrame=${history.latestFrameId ?? "n/a"}`,
    `alignment=${sanitizeText(history.alignment) || "unavailable"} frameGap=${history.frameGap ?? "n/a"}`,
    `entityHistoryCount=${asNumber(history.entityCount, entityHistory.length)}`
  ];

  if (entityHistory.length > 0) {
    entityHistory.slice(0, 5).forEach((entityStatus) => {
      const source = asObject(entityStatus);
      const marker = source.selected === true ? "*" : "-";
      lines.push(
        `${marker}${sanitizeText(source.entityId) || "entity"} history=${asNumber(source.historySize, 0)}/${asNumber(source.historyLimit, 0)} `
        + `aligned=${source.alignedFrameId ?? "n/a"} gap=${source.frameGap ?? "n/a"} align=${sanitizeText(source.alignment) || "unavailable"}`
      );
    });
  }

  if (events.length === 0) {
    lines.push("No timeline events recorded yet.");
    return lines;
  }

  events
    .slice(-6)
    .reverse()
    .forEach((event) => {
      const source = asObject(event);
      lines.push(`${asNumber(source.timestampMs, 0)}ms ${sanitizeText(source.type) || "EVENT"} phase=${sanitizeText(source.phaseId) || "unknown"}`);
    });
  return lines;
}

function toValidationLines(snapshot) {
  const network = toNetworkSnapshot(snapshot, NETWORK_SAMPLE_KEY);
  const validation = asObject(network.validation);
  const items = asArray(validation.items);

  const lines = [
    `lastRunMs=${validation.lastRunMs === null ? "not-run" : asNumber(validation.lastRunMs, 0)}`,
    `lastRunPassed=${validation.lastRunPassed === null ? "pending" : Boolean(validation.lastRunPassed)}`
  ];

  items.slice(0, 8).forEach((item) => {
    const source = asObject(item);
    lines.push(`${sanitizeText(source.status) || "pending"} ${sanitizeText(source.label) || "check"} :: ${sanitizeText(source.detail) || "n/a"}`);
  });

  return lines;
}

function toRewindLines(snapshot) {
  const network = toNetworkSnapshot(snapshot, NETWORK_SAMPLE_KEY);
  const rewind = asObject(network.rewindPreparation);
  const rewindEntities = asArray(rewind.entities);
  const rewindSelected = asArray(rewind.selectedEntityIds);
  const correction = asObject(network.correction);
  const replay = asObject(network.rewindReplay);
  const replaySelected = asArray(replay.selectedEntityIds);

  const lines = [
    `status=${sanitizeText(rewind.status) || "n/a"}`,
    `canPrepare=${Boolean(rewind.canPrepare)}`,
    `anchorFrame=${rewind.rewindAnchorFrameId ?? "n/a"} targetFrame=${rewind.rewindTargetFrameId ?? "n/a"}`,
    `resimulateFrameCount=${asNumber(rewind.resimulateFrameCount, 0)}`,
    `alignment=${sanitizeText(rewind.alignment) || "unavailable"} frameGap=${rewind.frameGap ?? "n/a"}`,
    `selectedEntityIds=${rewindSelected.join(",") || "n/a"}`,
    `correctionMode=${sanitizeText(correction.mode) || "hold-annotate"} severity=${sanitizeText(correction.severity) || "low"}`,
    `lastReplayId=${replay.replayId ?? "none"} replayedFrames=${asNumber(replay.replayedFrameCount, 0)} replayEntityIds=${replaySelected.join(",") || "n/a"}`,
    `postReplaySeverity=${sanitizeText(replay.postReplaySeverity) || "n/a"}`,
    sanitizeText(rewind.note) || "No rewind preparation note."
  ];

  if (rewindEntities.length > 0) {
    lines.push(`rewindEntityCount=${rewindEntities.length}`);
    rewindEntities.slice(0, 6).forEach((entityPrep) => {
      const source = asObject(entityPrep);
      lines.push(
        `${sanitizeText(source.entityId) || "entity"} status=${sanitizeText(source.status) || "n/a"} `
        + `canPrepare=${Boolean(source.canPrepare)} anchor=${source.rewindAnchorFrameId ?? "n/a"} `
        + `resim=${asNumber(source.resimulateFrameCount, 0)} severity=${sanitizeText(source.severity) || "low"}`
      );
    });
  }
  return lines;
}

function toTraceLines(snapshot, maxLines = 10) {
  const network = toNetworkSnapshot(snapshot, NETWORK_SAMPLE_KEY);
  const trace = asObject(network.trace);
  const events = asArray(trace.events);

  if (events.length === 0) {
    return ["No trace events recorded."];
  }

  return events
    .slice(-maxLines)
    .reverse()
    .map((event) => {
      const source = asObject(event);
      const type = sanitizeText(source.type) || "EVENT";
      const phase = sanitizeText(source.phaseId) || "unknown";
      const message = sanitizeText(source.message);
      const prefix = `${asNumber(source.timestampMs, 0)}ms ${type} phase=${phase}`;
      return message ? `${prefix} ${message}` : prefix;
    });
}

function commandLinesForDivergence(context) {
  const snapshot = getCommandSnapshot(context, NETWORK_SAMPLE_KEY);
  const scenario = asObject(snapshot.scenario);
  const divergence = asObject(snapshot.divergence);
  const network = asObject(snapshot.network);
  const entities = asArray(divergence.entities);

  const lines = [
    `selectedStatus=${sanitizeText(divergence.status) || "unknown"}`,
    `overallStatus=${sanitizeText(divergence.overallStatus) || sanitizeText(divergence.status) || "unknown"}`,
    `severity=${sanitizeText(divergence.severity) || "low"}`,
    `correctionMode=${sanitizeText(divergence.correctionMode) || "hold-annotate"}`,
    `alignment=${sanitizeText(divergence.alignment) || "unavailable"}`,
    `selectedEntityId=${sanitizeText(divergence.selectedEntityId) || "n/a"}`,
    `phase=${sanitizeText(scenario.phaseId) || "unknown"}`,
    `phaseElapsed=${asNumber(scenario.phaseElapsedSeconds, 0).toFixed(2)}s/${asNumber(scenario.phaseDurationSeconds, 0).toFixed(2)}s`,
    `cycleCount=${asNumber(scenario.cycleCount, 0)}`,
    `selectedFrameDelta=${asNumber(divergence.selectedFrameDelta ?? divergence.frameDelta, 0)}`,
    `overallFrameDelta=${asNumber(divergence.overallFrameDelta, asNumber(divergence.frameDelta, 0))}`,
    `authoritativeFrame=${asNumber(divergence.authoritativeFrame, 0)}`,
    `predictedFrame=${asNumber(divergence.predictedFrame, 0)}`,
    `rttMs=${asNumber(network.rttMs, 0)} jitterMs=${asNumber(network.jitterMs, 0)} lossPct=${asNumber(network.packetLossPct, 0)}`
  ];

  if (entities.length > 0) {
    lines.push(`entityCount=${entities.length}`);
    entities.slice(0, 6).forEach((entity) => lines.push(formatEntityLine(entity)));
  }
  return lines;
}

function commandLinesForValidation(context) {
  const snapshot = getCommandSnapshot(context, NETWORK_SAMPLE_KEY);
  const validation = asObject(snapshot.validation);
  const items = asArray(validation.items);

  const lines = [
    `lastRunMs=${validation.lastRunMs === null ? "not-run" : asNumber(validation.lastRunMs, 0)}`,
    `lastRunPassed=${validation.lastRunPassed === null ? "pending" : Boolean(validation.lastRunPassed)}`
  ];

  items.slice(0, 10).forEach((item) => {
    const source = asObject(item);
    lines.push(`${sanitizeText(source.status) || "pending"} ${sanitizeText(source.label) || "check"}`);
  });
  return lines;
}

function commandLinesForReproduction(context) {
  const snapshot = getCommandSnapshot(context, NETWORK_SAMPLE_KEY);
  const reproduction = asObject(snapshot.reproduction);
  const steps = asArray(reproduction.steps);

  if (steps.length === 0) {
    return ["No reproduction steps provided."];
  }

  const lines = [
    sanitizeText(reproduction.summary) || "Deterministic divergence reproduction steps:"
  ];
  steps.slice(0, 8).forEach((step, index) => {
    lines.push(`${index + 1}. ${String(step)}`);
  });
  return lines;
}

function commandLinesForRewind(context) {
  const snapshot = getCommandSnapshot(context, NETWORK_SAMPLE_KEY);
  const rewind = asObject(snapshot.rewindPreparation);
  const rewindEntities = asArray(rewind.entities);
  const rewindSelected = asArray(rewind.selectedEntityIds);
  const timeline = asObject(snapshot.timeline);
  const history = asObject(timeline.history);
  const correction = asObject(snapshot.correction);
  const replay = asObject(snapshot.rewindReplay);
  const replaySelected = asArray(replay.selectedEntityIds);

  const lines = [
    `rewindStatus=${sanitizeText(rewind.status) || "n/a"}`,
    `canPrepare=${Boolean(rewind.canPrepare)}`,
    `rewindAnchorFrame=${rewind.rewindAnchorFrameId ?? "n/a"}`,
    `rewindTargetFrame=${rewind.rewindTargetFrameId ?? "n/a"}`,
    `resimulateFrameCount=${asNumber(rewind.resimulateFrameCount, 0)}`,
    `selectedEntityIds=${rewindSelected.join(",") || "n/a"}`,
    `history=${asNumber(history.size, 0)}/${asNumber(history.limit, 0)} alignment=${sanitizeText(history.alignment) || "unavailable"} frameGap=${history.frameGap ?? "n/a"}`,
    `correctionMode=${sanitizeText(correction.mode) || "hold-annotate"} severity=${sanitizeText(correction.severity) || "low"}`,
    `lastReplayId=${replay.replayId ?? "none"} replayedFrames=${asNumber(replay.replayedFrameCount, 0)} replayEntityIds=${replaySelected.join(",") || "n/a"}`,
    `postReplaySeverity=${sanitizeText(replay.postReplaySeverity) || "n/a"}`,
    sanitizeText(rewind.note) || "Rewind preparation status unavailable."
  ];

  if (rewindEntities.length > 0) {
    lines.push(`rewindEntityCount=${rewindEntities.length}`);
    rewindEntities.slice(0, 8).forEach((entityPrep) => {
      const source = asObject(entityPrep);
      lines.push(
        `${sanitizeText(source.entityId) || "entity"} status=${sanitizeText(source.status) || "n/a"} `
        + `canPrepare=${Boolean(source.canPrepare)} anchor=${source.rewindAnchorFrameId ?? "n/a"} resim=${asNumber(source.resimulateFrameCount, 0)}`
      );
    });
  }
  return lines;
}

export function createNetworkSampleCDebugPlugin() {
  return createNetworkDebugPluginDefinition({
    pluginId: "network.sampleC",
    title: "Network Sample C Debug",
    featureFlag: "networkSampleCDebug",
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
          providerId: "network.sampleC.divergence",
          title: "Sample C Divergence Provider",
          readOnly: true,
          sourcePath: "assets.networkSampleC.divergence"
        },
        {
          providerId: "network.sampleC.timeline",
          title: "Sample C Timeline Provider",
          readOnly: true,
          sourcePath: "assets.networkSampleC.timeline"
        },
        {
          providerId: "network.sampleC.validation",
          title: "Sample C Validation Provider",
          readOnly: true,
          sourcePath: "assets.networkSampleC.validation"
        },
        {
          providerId: "network.sampleC.trace",
          title: "Sample C Trace Provider",
          readOnly: true,
          sourcePath: "assets.networkSampleC.trace"
        },
        {
          providerId: "network.sampleC.rewind",
          title: "Sample C Rewind Preparation Provider",
          readOnly: true,
          sourcePath: "assets.networkSampleC.rewindPreparation"
        }
      ];
    },
    getPanels() {
      return [
        {
          id: "network-c-divergence",
          title: "Divergence Snapshot",
          enabled: true,
          priority: 1160,
          source: "assets",
          renderMode: "text-block",
          render(_panel, snapshot) {
            return {
              id: "network-c-divergence",
              title: "Divergence Snapshot",
              lines: toDivergenceLines(snapshot)
            };
          }
        },
        {
          id: "network-c-sequence",
          title: "Event Sequence",
          enabled: true,
          priority: 1161,
          source: "assets",
          renderMode: "text-block",
          render(_panel, snapshot) {
            return {
              id: "network-c-sequence",
              title: "Event Sequence",
              lines: toTimelineLines(snapshot)
            };
          }
        },
        {
          id: "network-c-validation",
          title: "Validation Checklist",
          enabled: true,
          priority: 1162,
          source: "assets",
          renderMode: "text-block",
          render(_panel, snapshot) {
            return {
              id: "network-c-validation",
              title: "Validation Checklist",
              lines: toValidationLines(snapshot)
            };
          }
        },
        {
          id: "network-c-trace",
          title: "Trace Tail",
          enabled: true,
          priority: 1163,
          source: "assets",
          renderMode: "text-block",
          render(_panel, snapshot) {
            return {
              id: "network-c-trace",
              title: "Trace Tail",
              lines: toTraceLines(snapshot, 10)
            };
          }
        },
        {
          id: "network-c-rewind-prep",
          title: "Rewind Preparation",
          enabled: true,
          priority: 1164,
          source: "assets",
          renderMode: "text-block",
          render(_panel, snapshot) {
            return {
              id: "network-c-rewind-prep",
              title: "Rewind Preparation",
              lines: toRewindLines(snapshot)
            };
          }
        }
      ];
    },
    getCommandPacks() {
      return [
        {
          packId: "network",
          label: "Network Sample C",
          description: "Divergence and trace validation commands for Sample C.",
          commands: [
            {
              name: "network.help",
              summary: "Show network command usage for Sample C.",
              usage: "network.help",
              handler() {
                return {
                  status: "ready",
                  title: "Network Help",
                  lines: [
                    "network.help",
                    "network.divergence",
                    "network.trace [count]",
                    "network.validate",
                    "network.sample.repro",
                    "network.rewind"
                  ],
                  code: "NETWORK_HELP"
                };
              }
            },
            {
              name: "network.divergence",
              summary: "Show divergence state, frame delta, and phase details.",
              usage: "network.divergence",
              handler(context) {
                return {
                  status: "ready",
                  title: "Network Divergence",
                  lines: commandLinesForDivergence(context),
                  code: "NETWORK_DIVERGENCE"
                };
              }
            },
            {
              name: "network.trace",
              summary: "Show recent trace events in deterministic order.",
              usage: "network.trace [count]",
              arguments: ["count"],
              handler(context, args) {
                return {
                  status: "ready",
                  title: "Network Trace",
                  lines: commandLinesForTrace(context, args, {
                    sampleKey: NETWORK_SAMPLE_KEY,
                    phaseField: "phaseId",
                    sanitizeText,
                    formatNumber: asNumber
                  }),
                  code: "NETWORK_TRACE"
                };
              }
            },
            {
              name: "network.validate",
              summary: "Show checklist status for trace validation flow.",
              usage: "network.validate",
              handler(context) {
                return {
                  status: "ready",
                  title: "Network Validation",
                  lines: commandLinesForValidation(context),
                  code: "NETWORK_VALIDATE"
                };
              }
            },
            {
              name: "network.sample.repro",
              summary: "Show deterministic mismatch reproduction steps.",
              usage: "network.sample.repro",
              handler(context) {
                return {
                  status: "ready",
                  title: "Network Reproduction",
                  lines: commandLinesForReproduction(context),
                  code: "NETWORK_SAMPLE_REPRO"
                };
              }
            },
            {
              name: "network.rewind",
              summary: "Show rewind preparation status and resimulation window details.",
              usage: "network.rewind",
              handler(context) {
                return {
                  status: "ready",
                  title: "Network Rewind Preparation",
                  lines: commandLinesForRewind(context),
                  code: "NETWORK_REWIND"
                };
              }
            }
          ]
        }
      ];
    }
  });
}
