import { sanitizeText } from "./stringUtils.js";

export function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

export function asStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const unique = new Set();
  value.forEach((item) => {
    const token = sanitizeText(String(item));
    if (token) {
      unique.add(token);
    }
  });
  return Array.from(unique.values());
}

