/*
Toolbox Aid
David Quesenberry
04/06/2026
networkDebugUtils.js
*/

import { asNumber } from "../../../../shared/math/numberNormalization.js";

export function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function asObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export { asNumber };

export function asBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
      return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
      return false;
    }
  }
  return fallback;
}

export function toNonNegativeInteger(value, fallback = 0) {
  const numeric = Math.floor(asNumber(value, fallback));
  if (!Number.isFinite(numeric) || numeric < 0) {
    return Math.max(0, Math.floor(asNumber(fallback, 0)));
  }
  return numeric;
}

export function shallowCloneArray(values) {
  return asArray(values).map((value) => {
    if (value !== null && typeof value === "object") {
      return { ...value };
    }
    return value;
  });
}
