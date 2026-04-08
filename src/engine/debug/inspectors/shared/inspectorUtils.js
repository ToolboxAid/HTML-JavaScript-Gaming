/*
Toolbox Aid
David Quesenberry
04/06/2026
inspectorUtils.js
*/

import { asPositiveInteger } from "../../../../shared/utils/numberUtils.js";

export function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function asObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function asFinite(value, fallback = 0) {
  return Number.isFinite(value) ? Number(value) : fallback;
}

export function asNonNegativeInteger(value, fallback = 0) {
  const normalized = Math.floor(asFinite(value, fallback));
  return normalized >= 0 ? normalized : Math.max(0, Math.floor(asFinite(fallback, 0)));
}

export { asPositiveInteger };

export function cloneJson(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

export function boundedPush(buffer, item, max) {
  const safeBuffer = asArray(buffer);
  safeBuffer.push(item);
  if (safeBuffer.length > max) {
    safeBuffer.splice(0, safeBuffer.length - max);
  }
}
