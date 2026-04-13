export function safeTrim(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function toLowerSafe(value) {
  return safeTrim(value).toLowerCase();
}

export function stringCompare(left, right) {
  return safeTrim(left).localeCompare(safeTrim(right));
}

export function trimSafe(value) {
  return safeTrim(value);
}

export function sanitizeText(value) {
  return safeTrim(value);
}

export function normalizeString(value) {
  return safeTrim(value);
}
