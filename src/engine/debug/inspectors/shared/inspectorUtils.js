/*
Toolbox Aid
David Quesenberry
04/06/2026
inspectorUtils.js
*/

import { asPositiveInteger } from "../../../../shared/utils/numberUtils.js";
import { sanitizeText } from "../../../../shared/utils/stringUtils.js";
import { createId, isValidId } from "../../../../shared/utils/idUtils.js";
import { asFinite, asNonNegativeInteger } from "../../../../shared/math/numberNormalization.js";

export { sanitizeText };
export { createId, isValidId };
export { asFinite, asNonNegativeInteger };

export function asObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

export function asArray(value) {
  return Array.isArray(value) ? value : [];
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
