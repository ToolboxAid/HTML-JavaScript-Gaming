export function trimSafe(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeString(value) {
  return trimSafe(value);
}
