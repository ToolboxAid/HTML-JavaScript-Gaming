/*
Toolbox Aid
David Quesenberry
04/06/2026
inspectorUtils.js
*/

import { sanitizeText } from "/src/shared/utils/stringUtils.js";
import {
  asNonNegativeInteger,
  asPositiveInteger,
  toFiniteNumber
} from "/src/shared/math/numberNormalization.js";

export { asNonNegativeInteger, asPositiveInteger, sanitizeText, toFiniteNumber };

export function asObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

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
