/*
Toolbox Aid
David Quesenberry
04/14/2026
jsonIO.js
*/
export function safeJsonParse(rawValue, fallback = null) {
  if (typeof rawValue !== "string") {
    return fallback;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return fallback;
  }
}

export function safeJsonStringify(value, fallback = "") {
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

export function cloneJsonData(value) {
  if (value == null) {
    return value;
  }
  return safeJsonParse(safeJsonStringify(value), null);
}
