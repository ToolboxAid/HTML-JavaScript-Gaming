/*
Toolbox Aid
David Quesenberry
04/06/2026
latencyDiagnosticsModel.js
*/

import { asNumber, asObject, sanitizeText } from "../shared/networkDebugUtils.js";

export function createLatencyDiagnosticsModel(snapshot = {}) {
  const source = asObject(snapshot);
  const latency = asObject(source.latency);
  const network = asObject(source.network);
  const fallbackLatency = asObject(network.latency);

  const rttMs = asNumber(
    latency.rttMs,
    asNumber(fallbackLatency.rttMs, asNumber(network.rttMs, 0))
  );
  const jitterMs = asNumber(
    latency.jitterMs,
    asNumber(fallbackLatency.jitterMs, asNumber(network.jitterMs, 0))
  );

  return {
    status: sanitizeText(latency.status) || sanitizeText(fallbackLatency.status) || "unknown",
    rttMs,
    jitterMs,
    healthy: rttMs < 80 && jitterMs < 12
  };
}
