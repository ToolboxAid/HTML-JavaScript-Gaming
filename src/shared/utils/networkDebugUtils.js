import { asNumber as toNumber } from "../math/numberNormalization.js";
import { asObject, asArray } from "./objectUtils.js";
import { safeTrim } from "./stringUtils.js";

function toSafeKey(value) {
  return safeTrim(value);
}

export { asNumber } from "../math/numberNormalization.js";
export const sanitizeText = safeTrim;

export function toNetworkSnapshot(snapshot, sampleKey) {
  const key = toSafeKey(sampleKey);
  if (!key) {
    return {};
  }
  return asObject(snapshot?.assets?.[key]);
}

export function getCommandSnapshot(context, sampleKey) {
  const key = toSafeKey(sampleKey);
  if (!key) {
    return {};
  }
  return asObject(context?.assets?.[key]);
}

export function commandLinesForTrace(context, args = [], options = {}) {
  const normalizedOptions = asObject(options);
  const sanitize = typeof normalizedOptions?.sanitizeText === "function"
    ? normalizedOptions.sanitizeText
    : sanitizeText;
  const formatNumber = typeof normalizedOptions?.formatNumber === "function"
    ? normalizedOptions.formatNumber
    : toNumber;

  const snapshot = getCommandSnapshot(context, normalizedOptions?.sampleKey);
  const trace = asObject(snapshot.trace);
  const events = asArray(trace.events);

  const requestedCount = Number.parseInt(args?.[0], 10);
  const count = Number.isFinite(requestedCount)
    ? Math.min(20, Math.max(1, requestedCount))
    : 8;

  if (events.length === 0) {
    return ["No network trace events recorded."];
  }

  const phaseField = toSafeKey(normalizedOptions?.phaseField) || "phase";
  return events
    .slice(-count)
    .reverse()
    .map((event) => {
      const source = asObject(event);
      const details = asObject(source.details);
      const detailsText = Object.keys(details)
        .slice(0, 2)
        .map((key) => `${key}=${String(details[key])}`)
        .join(" ");
      const eventType = sanitize(source.type) || "EVENT";
      const phase = sanitize(source[phaseField]) || "unknown";
      const prefix = `${formatNumber(source.timestampMs, 0)}ms ${eventType} phase=${phase}`;
      return detailsText ? `${prefix} ${detailsText}` : prefix;
    });
}
