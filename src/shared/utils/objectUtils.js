/*
Toolbox Aid
David Quesenberry
04/08/2026
objectUtils.js
*/

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export { isPlainObject };
