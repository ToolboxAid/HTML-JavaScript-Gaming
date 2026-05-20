/*
Toolbox Aid
David Quesenberry
04/14/2026
index.js
*/
export { ensureArray, asArray, asStringArray } from "./arrayUtils.js";
export {
  safeTrim,
  toLowerSafe,
  stringCompare,
  trimSafe,
  normalizeText,
  normalizeToken,
  normalizeGameId,
  normalizePathSeparators,
  sanitizeText,
  normalizeString,
  escapeHtml,
} from "../string/index.js";
export {
  createId,
  generateId,
  normalizeId,
  createStableId,
  isValidId,
} from "../id/index.js";
export { isFiniteNumber, toFiniteNumber, asFiniteNumber, asPositiveInteger, asPositiveNumber } from "../number/index.js";
export { isObject, isPlainObject, asObject, toObject, asArray as asObjectArray } from "./objectUtils.js";
export { cloneJson, deepClone } from "./jsonUtils.js";
export { stringifyValue } from "./stringifyValueUtils.js";
export { oppositeCardinalDirection } from "./directionUtils.js";
export { wrapTextByCharacterCount } from "./textWrapUtils.js";
export { clamp, distance, near, wrap, randomRange } from "./mathUtils.js";
export { pointInRect, xyInRect, getCenteredRect, normalizePoints, centerPoints, maxRadius } from "./geometryUtils.js";
export { invariant } from "./invariantUtils.js";
export { normalizeCommandText } from "./normalizeCommandTextUtils.js";
export { fuzzyMatchScore } from "./fuzzyMatchScore.js";
