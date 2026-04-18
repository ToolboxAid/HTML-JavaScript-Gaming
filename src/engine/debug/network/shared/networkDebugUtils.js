/*
Toolbox Aid
David Quesenberry
04/06/2026
networkDebugUtils.js
*/

import { asNumber as toNumber } from "../../../../shared/math/numberNormalization.js";
import { asArray as toArray } from "../../../../shared/utils/objectUtils.js";

export { asObject, asArray } from "../../../../shared/utils/objectUtils.js";
export { asNumber } from "../../../../shared/math/numberNormalization.js";
export { sanitizeText } from "../../../../shared/utils/stringUtils.js";

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
  const numeric = Math.floor(toNumber(value, fallback));
  if (!Number.isFinite(numeric) || numeric < 0) {
    return Math.max(0, Math.floor(toNumber(fallback, 0)));
  }
  return numeric;
}

export function shallowCloneArray(values) {
  return toArray(values).map((value) => {
    if (value !== null && typeof value === "object") {
      return { ...value };
    }
    return value;
  });
}
