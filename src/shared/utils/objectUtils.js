/*
Toolbox Aid
David Quesenberry
04/08/2026
objectUtils.js
*/

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export { isObject, isPlainObject };
