import { clamp } from "/src/engine/utils/index.js";

export function createLatencyModel(options = {}) {
  const baseRttMs = clamp(Number(options.baseRttMs) || 30, 16, 250);
  const jitterMs = clamp(Number(options.jitterMs) || 4, 0, 40);
  const minOneWayMs = clamp(Number(options.minOneWayMs) || 8, 1, 200);

  function sampleOneWayDelayMs(elapsedSeconds, sequence = 0) {
    const t = Math.max(0, Number(elapsedSeconds) || 0);
    const seq = Math.max(0, Number(sequence) || 0);
    const phase = t * 1.9 + (seq * 0.17);
    const harmonic = Math.sin(phase) * jitterMs;
    const microJitter = Math.sin((t * 0.53) + (seq * 0.11)) * (jitterMs * 0.5);
    const oneWayMs = (baseRttMs * 0.5) + harmonic + microJitter;
    return clamp(Math.round(oneWayMs), minOneWayMs, 200);
  }

  function sampleSnapshot(elapsedSeconds, sequence = 0) {
    const oneWayMs = sampleOneWayDelayMs(elapsedSeconds, sequence);
    const estimatedRttMs = clamp(Math.round(oneWayMs * 2), 0, 400);
    const estimatedJitterMs = clamp(Math.round(Math.abs(oneWayMs - (baseRttMs * 0.5))), 0, 120);
    return {
      oneWayMs,
      rttMs: estimatedRttMs,
      jitterMs: estimatedJitterMs
    };
  }

  return {
    sampleOneWayDelayMs,
    sampleSnapshot
  };
}
