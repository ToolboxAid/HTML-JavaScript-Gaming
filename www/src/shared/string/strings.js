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

export function normalizeText(value) {
  return safeTrim(value);
}

export function normalizeToken(value) {
  return normalizeText(value).toLowerCase();
}

export function normalizeGameId(value) {
  return normalizeText(value);
}

export function normalizePathSeparators(value) {
  return normalizeText(value).replace(/\\/g, "/");
}

export function sanitizeText(value) {
  return safeTrim(value);
}

export function normalizeString(value) {
  return safeTrim(value);
}

export function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
