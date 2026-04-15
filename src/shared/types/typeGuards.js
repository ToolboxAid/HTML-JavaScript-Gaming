/*
Toolbox Aid
David Quesenberry
04/14/2026
typeGuards.js
*/
export function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function isFunction(value) {
  return typeof value === "function";
}

export function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function isBoolean(value) {
  return typeof value === "boolean";
}
