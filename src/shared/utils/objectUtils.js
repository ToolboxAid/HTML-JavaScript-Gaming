/*
Toolbox Aid
David Quesenberry
04/08/2026
objectUtils.js
*/
import { asArray as normalizeArray } from "./arrayUtils.js";

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function asObject(value) {
  return isObject(value) ? value : {};
}

function asArray(value) {
  return normalizeArray(value);
}

export { isObject, isPlainObject, asObject, asArray };
