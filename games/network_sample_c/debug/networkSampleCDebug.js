/*
Toolbox Aid
David Quesenberry
04/06/2026
networkSampleCDebug.js
*/

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function asObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function toNetworkSnapshot(snapshot) {
  return asObject(snapshot?.assets?.networkSampleC);
}

function getCommandSnapshot(context) {
  return asObject(context?.assets?.networkSampleC);
}

function toDivergenceLines(snapshot) {
  const network = toNetworkSnapshot(snapshot);
  const scenario = asObject(network.scenario);
  const divergence = asObject(network.divergence);
  const transport = asObject(network.network);

  return [
    `status=${sanitizeText(divergence.status) || "unknown"}`,
    `severity=${sanitizeText(divergence.severity) || "low"} correction=${sanitizeText(divergence.correctionMode) || "hold-annotate"}`,
    `phase=${sanitizeText(scenario.phaseLabel) || "n/a"} (${sanitizeText(scenario.phaseId) || "n/a"})`,
    `frameDelta=${asNumber(divergence.frameDelta, 0)}`,
    `authoritativeFrame=${asNumber(divergence.authoritativeFrame, 0)}`,
    `predictedFrame=${asNumber(divergence.predictedFrame, 0)}`,
    `alignment=${sanitizeText(divergence.alignment) || "unavailable"}`,
    `targetOffsetFrames=${asNumber(divergence.targetOffsetFrames, 0).toFixed(2)}`,
    `rttMs=${asNumber(transport.rttMs, 0)} jitterMs=${asNumber(transport.jitterMs, 0)} lossPct=${asNumber(transport.packetLossPct, 0)}`,
    `hint=${sanitizeText(divergence.reconciliationHint) || "n/a"}`
  ];
}

function toTimelineLines(snapshot) {
  const network = toNetworkSnapshot(snapshot);
  const timeline = asObject(network.timeline);
  const history = asObject(timeline.history);
  const events = asArray(timeline.events);
  const lines = [
    `history=${asNumber(history.size, 0)}/${asNumber(history.limit, 0)}`,
    `oldestFrame=${history.oldestFrameId ?? "n/a"} latestFrame=${history.latestFrameId ?? "n/a"}`,
    `alignment=${sanitizeText(history.alignment) || "unavailable"} frameGap=${history.frameGap ?? "n/a"}`
  ];

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
  const network = toNetworkSnapshot(snapshot);
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
  const network = toNetworkSnapshot(snapshot);
  const rewind = asObject(network.rewindPreparation);
  const correction = asObject(network.correction);
  const replay = asObject(network.rewindReplay);

  return [
    `status=${sanitizeText(rewind.status) || "n/a"}`,
    `canPrepare=${Boolean(rewind.canPrepare)}`,
    `anchorFrame=${rewind.rewindAnchorFrameId ?? "n/a"} targetFrame=${rewind.rewindTargetFrameId ?? "n/a"}`,
    `resimulateFrameCount=${asNumber(rewind.resimulateFrameCount, 0)}`,
    `alignment=${sanitizeText(rewind.alignment) || "unavailable"} frameGap=${rewind.frameGap ?? "n/a"}`,
    `correctionMode=${sanitizeText(correction.mode) || "hold-annotate"} severity=${sanitizeText(correction.severity) || "low"}`,
    `lastReplayId=${replay.replayId ?? "none"} replayedFrames=${asNumber(replay.replayedFrameCount, 0)} postReplaySeverity=${sanitizeText(replay.postReplaySeverity) || "n/a"}`,
    sanitizeText(rewind.note) || "No rewind preparation note."
  ];
}

function toTraceLines(snapshot, maxLines = 10) {
  const network = toNetworkSnapshot(snapshot);
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
  const snapshot = getCommandSnapshot(context);
  const scenario = asObject(snapshot.scenario);
  const divergence = asObject(snapshot.divergence);
  const network = asObject(snapshot.network);

  return [
    `status=${sanitizeText(divergence.status) || "unknown"}`,
    `severity=${sanitizeText(divergence.severity) || "low"}`,
    `correctionMode=${sanitizeText(divergence.correctionMode) || "hold-annotate"}`,
    `alignment=${sanitizeText(divergence.alignment) || "unavailable"}`,
    `phase=${sanitizeText(scenario.phaseId) || "unknown"}`,
    `phaseElapsed=${asNumber(scenario.phaseElapsedSeconds, 0).toFixed(2)}s/${asNumber(scenario.phaseDurationSeconds, 0).toFixed(2)}s`,
    `cycleCount=${asNumber(scenario.cycleCount, 0)}`,
    `frameDelta=${asNumber(divergence.frameDelta, 0)}`,
    `authoritativeFrame=${asNumber(divergence.authoritativeFrame, 0)}`,
    `predictedFrame=${asNumber(divergence.predictedFrame, 0)}`,
    `rttMs=${asNumber(network.rttMs, 0)} jitterMs=${asNumber(network.jitterMs, 0)} lossPct=${asNumber(network.packetLossPct, 0)}`
  ];
}

function commandLinesForTrace(context, args = []) {
  const snapshot = getCommandSnapshot(context);
  const trace = asObject(snapshot.trace);
  const events = asArray(trace.events);

  const requestedCount = Number.parseInt(args[0], 10);
  const count = Number.isFinite(requestedCount)
    ? Math.min(20, Math.max(1, requestedCount))
    : 8;

  if (events.length === 0) {
    return ["No network trace events recorded."];
  }

  return events
    .slice(-count)
    .reverse()
    .map((event) => {
      const source = asObject(event);
      const details = asObject(source.details);
      const detailText = Object.keys(details)
        .slice(0, 2)
        .map((key) => `${key}=${String(details[key])}`)
        .join(" ");
      const base = `${asNumber(source.timestampMs, 0)}ms ${sanitizeText(source.type) || "EVENT"} phase=${sanitizeText(source.phaseId) || "unknown"}`;
      return detailText ? `${base} ${detailText}` : base;
    });
}

function commandLinesForValidation(context) {
  const snapshot = getCommandSnapshot(context);
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
  const snapshot = getCommandSnapshot(context);
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
  const snapshot = getCommandSnapshot(context);
  const rewind = asObject(snapshot.rewindPreparation);
  const timeline = asObject(snapshot.timeline);
  const history = asObject(timeline.history);
  const correction = asObject(snapshot.correction);
  const replay = asObject(snapshot.rewindReplay);

  return [
    `rewindStatus=${sanitizeText(rewind.status) || "n/a"}`,
    `canPrepare=${Boolean(rewind.canPrepare)}`,
    `rewindAnchorFrame=${rewind.rewindAnchorFrameId ?? "n/a"}`,
    `rewindTargetFrame=${rewind.rewindTargetFrameId ?? "n/a"}`,
    `resimulateFrameCount=${asNumber(rewind.resimulateFrameCount, 0)}`,
    `history=${asNumber(history.size, 0)}/${asNumber(history.limit, 0)} alignment=${sanitizeText(history.alignment) || "unavailable"} frameGap=${history.frameGap ?? "n/a"}`,
    `correctionMode=${sanitizeText(correction.mode) || "hold-annotate"} severity=${sanitizeText(correction.severity) || "low"}`,
    `lastReplayId=${replay.replayId ?? "none"} replayedFrames=${asNumber(replay.replayedFrameCount, 0)} postReplaySeverity=${sanitizeText(replay.postReplaySeverity) || "n/a"}`,
    sanitizeText(rewind.note) || "Rewind preparation status unavailable."
  ];
}

export function createNetworkSampleCDebugPlugin() {
  return {
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
                  lines: commandLinesForTrace(context, args),
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
  };
}
