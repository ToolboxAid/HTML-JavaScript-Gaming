import { sanitizeText } from "../../../src/shared/string/strings.js";

export const USER_ADDED_SOURCE = "User Added";
export { sanitizeText };

export function normalizeHex(value) {
  return sanitizeText(value).toUpperCase();
}

export function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => sanitizeText(tag).toLowerCase()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value.split(",").map((tag) => sanitizeText(tag).toLowerCase()).filter(Boolean);
  }
  return [];
}

export function cloneSwatch(swatch) {
  const cleanSwatch = {
    symbol: sanitizeText(swatch?.symbol),
    hex: normalizeHex(swatch?.hex),
    name: sanitizeText(swatch?.name),
    source: sanitizeText(swatch?.source)
  };
  const tags = normalizeTags(swatch?.tags);
  if (tags.length > 0) {
    cleanSwatch.tags = tags;
  }
  return cleanSwatch;
}

export function swatchKey(swatch) {
  const cleanSwatch = cloneSwatch(swatch);
  return [
    cleanSwatch.symbol,
    cleanSwatch.hex,
    cleanSwatch.name.toLowerCase(),
    cleanSwatch.source.toLowerCase()
  ].join("|");
}

export function isObjectRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
