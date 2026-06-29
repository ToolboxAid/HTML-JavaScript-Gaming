/*
Toolbox Aid
David Quesenberry
04/08/2026
objects.js
*/
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function asObject(value) {
  return isObject(value) ? value : {};
}

function toObject(value) {
  return value !== null && typeof value === 'object' ? value : {};
}

function normalizeRecord(value, fallback = {}) {
  if (isRecord(value)) {
    return value;
  }
  if (isRecord(fallback)) {
    return { ...fallback };
  }
  return fallback;
}

export { isObject, isPlainObject, isRecord, asObject, toObject, normalizeRecord };
