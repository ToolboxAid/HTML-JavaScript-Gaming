import { asNumber } from "../math/numberNormalization.js";
import { asObject, asArray } from "./objectUtils.js";

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toSafeKey(value) {
  return sanitizeText(value);
}

export { asNumber };

export function toNetworkSnapshot(snapshot) {
  const sampleKey = arguments[1];
  const key = toSafeKey(sampleKey);
  if (!key) {
    return {};
  }
  return asObject(snapshot?.assets?.[key]);
}

export function getCommandSnapshot(context) {
  const sampleKey = arguments[1];
  const key = toSafeKey(sampleKey);
  if (!key) {
    return {};
  }
  return asObject(context?.assets?.[key]);
}

export function commandLinesForTrace(context, args = []) {
  const options = asObject(arguments[2]);
  const sanitize = typeof options?.sanitizeText === "function" ? options.sanitizeText : sanitizeText;
  const formatNumber = typeof options?.formatNumber === "function"
    ? options.formatNumber
    : asNumber;

  const snapshot = getCommandSnapshot(context, options?.sampleKey);
  const trace = asObject(snapshot.trace);
  const events = asArray(trace.events);

  const requestedCount = Number.parseInt(args?.[0], 10);
  const count = Number.isFinite(requestedCount)
    ? Math.min(20, Math.max(1, requestedCount))
    : 8;

  if (events.length === 0) {
    return ["No network trace events recorded."];
  }

  const phaseField = toSafeKey(options?.phaseField) || "phase";
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
