/*
Toolbox Aid
David Quesenberry
04/03/2026
colorUtils.js
*/
function clampChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function expandShortHex(hex) {
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}ff`;
  }
  if (hex.length === 5) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}${hex[4]}${hex[4]}`;
  }
  return null;
}

export function normalizeColor(input, fallback = "#ffffffff") {
  if (typeof input !== "string") {
    return fallback;
  }

  const value = input.trim().toLowerCase();
  if (!value.startsWith("#")) {
    return fallback;
  }

  if (value.length === 4 || value.length === 5) {
    return expandShortHex(value) ?? fallback;
  }

  if (value.length === 7) {
    return `${value}ff`;
  }

  if (value.length === 9) {
    return value;
  }

  return fallback;
}

export function withOpaqueAlpha(color) {
  const normalized = normalizeColor(color);
  return `${normalized.slice(0, 7)}ff`;
}

export function rgbaToHex(r, g, b, a) {
  const rr = clampChannel(r).toString(16).padStart(2, "0");
  const gg = clampChannel(g).toString(16).padStart(2, "0");
  const bb = clampChannel(b).toString(16).padStart(2, "0");
  const aa = clampChannel(a).toString(16).padStart(2, "0");
  return `#${rr}${gg}${bb}${aa}`;
}

export function colorToPickerValue(color) {
  const normalized = normalizeColor(color);
  return normalized.slice(0, 7);
}

export function isTransparent(color) {
  if (!color) {
    return true;
  }
  return normalizeColor(color).slice(7, 9) === "00";
}

export function dedupeColors(colors) {
  const seen = new Set();
  const output = [];

  for (const color of colors) {
    const normalized = normalizeColor(color);
    if (seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    output.push(normalized);
  }

  return output;
}
