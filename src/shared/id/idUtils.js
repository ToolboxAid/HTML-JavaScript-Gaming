import { sanitizeText } from "../string/index.js";

export function isValidId(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function normalizeId(value, fallback = "") {
  const normalized = sanitizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized || sanitizeText(fallback);
}

export function createId(prefix = "id", randomSource = Math.random) {
  const safePrefix = normalizeId(prefix, "id");
  const raw = typeof randomSource === "function" ? randomSource() : Math.random();
  const token = Number(raw).toString(36).slice(2, 10);
  return `${safePrefix}-${token || "00000000"}`;
}

export function createStableId(parts = [], fallback = "id") {
  const normalized = (Array.isArray(parts) ? parts : [parts])
    .map((part) => normalizeId(part))
    .filter(Boolean);
  const safeFallback = normalizeId(fallback, "id");
  return normalized.length > 0 ? normalized.join(".") : safeFallback;
}

export function generateId(prefix = "id", randomSource = Math.random) {
  return createId(prefix, randomSource);
}
