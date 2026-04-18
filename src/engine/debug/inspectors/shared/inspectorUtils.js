/*
Toolbox Aid
David Quesenberry
04/06/2026
inspectorUtils.js
*/

import { asArray as ensureArray } from "../../../../shared/utils/objectUtils.js";
export { asNonNegativeInteger, asPositiveInteger, toFiniteNumber } from "../../../../shared/math/numberNormalization.js";
export { sanitizeText } from "../../../../shared/utils/stringUtils.js";
export { asArray, asObject } from "../../../../shared/utils/objectUtils.js";

export function cloneJson(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

export function boundedPush(buffer, item, max) {
  const safeBuffer = ensureArray(buffer);
  safeBuffer.push(item);
  if (safeBuffer.length > max) {
    safeBuffer.splice(0, safeBuffer.length - max);
  }
}
