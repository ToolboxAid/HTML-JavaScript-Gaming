import { cloneValue, safeString } from "./projectSystemValueUtils.js";
import { isFiniteNumber } from "../../src/shared/number/index.js";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asNumber(value, fallback = 0) {
  const numeric = Number(value);
  return isFiniteNumber(numeric) ? numeric : fallback;
}

function toPositiveInt(value, fallback, min = 1, max = Number.MAX_SAFE_INTEGER) {
  const numeric = Math.trunc(asNumber(value, fallback));
  if (!isFiniteNumber(numeric)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, numeric));
}

function percentile(sorted, ratio) {
  if (!sorted.length) {
    return 0;
  }
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((sorted.length * ratio) - 1)));
  return sorted[index];
}

export function safeParseJson(rawText) {
  if (typeof rawText !== "string" || !rawText.trim()) {
    return null;
  }
  try {
    return JSON.parse(rawText);
  } catch {
    return null;
  }
}

export function toPrettyJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function normalizeReplayEvents(input) {
  const source = input && typeof input === "object" ? input : {};
  const rawEvents = Array.isArray(source) ? source : asArray(source.events);
  const normalized = rawEvents.map((entry, index) => {
    const event = entry && typeof entry === "object" ? entry : {};
    const timeMs = asNumber(event.timeMs, index * 100);
    const type = safeString(event.type, "event");
    const payload = event.payload && typeof event.payload === "object" ? cloneValue(event.payload) : {};
    const label = safeString(event.label, `${type} @ ${timeMs.toFixed(0)}ms`);
    return {
      id: safeString(event.id, `event-${index + 1}`),
      index,
      timeMs: Math.max(0, timeMs),
      type,
      label,
      payload
    };
  });

  normalized.sort((left, right) => {
    const byTime = left.timeMs - right.timeMs;
    if (byTime !== 0) {
      return byTime;
    }
    return left.index - right.index;
  });

  return normalized.map((entry, index) => ({
    ...entry,
    index
  }));
}

export function createDefaultReplayEvents() {
  return normalizeReplayEvents([
    { timeMs: 0, type: "boot", label: "Boot Runtime", payload: { scene: "intro" } },
    { timeMs: 120, type: "input", label: "Press Start", payload: { key: "Enter", down: true } },
    { timeMs: 260, type: "state", label: "Enter Gameplay", payload: { gameState: "playing", wave: 1 } },
    { timeMs: 560, type: "spawn", label: "Spawn Enemy Group", payload: { kind: "asteroid", count: 3 } },
    { timeMs: 900, type: "score", label: "Score +100", payload: { delta: 100, total: 100 } }
  ]);
}

export function getReplayEventAtTime(events, timeMs = 0) {
  const normalized = asArray(events);
  const safeTimeMs = Math.max(0, asNumber(timeMs, 0));
  if (!normalized.length) {
    return {
      index: -1,
      event: null
    };
  }
  let activeIndex = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    if (asNumber(normalized[index]?.timeMs, 0) <= safeTimeMs) {
      activeIndex = index;
      continue;
    }
    break;
  }
  return {
    index: activeIndex,
    event: normalized[activeIndex]
  };
}

export function summarizeDurationSamples(samples) {
  const normalized = asArray(samples)
    .map((value) => asNumber(value, 0))
    .filter((value) => isFiniteNumber(value) && value >= 0);

  if (!normalized.length) {
    return {
      count: 0,
      minMs: 0,
      maxMs: 0,
      avgMs: 0,
      p95Ms: 0,
      totalMs: 0
    };
  }

  const sorted = normalized.slice().sort((left, right) => left - right);
  const total = sorted.reduce((sum, value) => sum + value, 0);
  return {
    count: sorted.length,
    minMs: sorted[0],
    maxMs: sorted[sorted.length - 1],
    avgMs: total / sorted.length,
    p95Ms: percentile(sorted, 0.95),
    totalMs: total
  };
}

export function createStateInspectorSnapshot(input = {}) {
  const localStorageEntries = asArray(input.localStorageEntries)
    .map((entry) => ({
      key: safeString(entry?.key, ""),
      value: safeString(entry?.value, "")
    }))
    .filter((entry) => entry.key);
  const sessionStorageEntries = asArray(input.sessionStorageEntries)
    .map((entry) => ({
      key: safeString(entry?.key, ""),
      value: safeString(entry?.value, "")
    }))
    .filter((entry) => entry.key);
  const bootRegistryKeys = asArray(input.bootRegistryKeys).map((key) => safeString(key, "")).filter(Boolean);

  return {
    schema: "tools.debug-state-inspector.snapshot/1",
    capturedAt: new Date().toISOString(),
    hosted: input.hosted === true,
    toolId: safeString(input.toolId, ""),
    hostContext: input.hostContext && typeof input.hostContext === "object" ? cloneValue(input.hostContext) : null,
    projectManifest: input.projectManifest && typeof input.projectManifest === "object"
      ? cloneValue(input.projectManifest)
      : null,
    storage: {
      localCount: localStorageEntries.length,
      sessionCount: sessionStorageEntries.length,
      local: localStorageEntries,
      session: sessionStorageEntries
    },
    bootContracts: {
      count: bootRegistryKeys.length,
      keys: bootRegistryKeys
    },
    notes: safeString(input.notes, "")
  };
}

export function runDeterministicWorkloadIteration(workSize = 3000) {
  const size = toPositiveInt(workSize, 3000, 100, 100000);
  let accumulator = 0;
  for (let index = 0; index < size; index += 1) {
    const signal = Math.sin((index + 1) * 0.013) * Math.cos((index + 3) * 0.007);
    accumulator += signal * (index % 7);
  }
  return accumulator;
}
