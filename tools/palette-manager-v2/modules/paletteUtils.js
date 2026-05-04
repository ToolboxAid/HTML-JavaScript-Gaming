export const USER_ADDED_SOURCE = "User Added";

export function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeHex(value) {
  return sanitizeText(value).toUpperCase();
}

export function cloneSwatch(swatch) {
  return {
    symbol: sanitizeText(swatch?.symbol),
    hex: normalizeHex(swatch?.hex),
    name: sanitizeText(swatch?.name),
    source: sanitizeText(swatch?.source)
  };
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
