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

function asObject(value) {
  return isObject(value) ? value : {};
}

function toObject(value) {
  return value !== null && typeof value === 'object' ? value : {};
}

export { isObject, isPlainObject, asObject, toObject };
