/*
Toolbox Aid
David Quesenberry
04/06/2026
inspectorUtils.js
*/

import { asArray } from "../../../../shared/array/arrays.js";
import { asObject } from "../../../../shared/object/objects.js";
export { asNonNegativeInteger, asPositiveInteger, toFiniteNumber } from "../../../../shared/math/numberNormalization.js";
export { sanitizeText } from "../../../../shared/string/strings.js";
export { asArray, asObject };

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
