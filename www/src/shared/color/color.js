function finiteOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function clamp01(value) {
  return Math.max(0, Math.min(1, finiteOrZero(value)));
}

export function clampByte(value) {
  return Math.round(Math.max(0, Math.min(255, finiteOrZero(value))));
}

function normalizeRgb(color) {
  return {
    r: clampByte(color?.r),
    g: clampByte(color?.g),
    b: clampByte(color?.b),
  };
}

function normalizeHue(value) {
  return ((finiteOrZero(value) % 360) + 360) % 360;
}

function percentToUnit(value) {
  const number = finiteOrZero(value);
  return clamp01(number > 1 ? number / 100 : number);
}

function componentToHex(value) {
  return clampByte(value).toString(16).padStart(2, "0");
}

/**
 * Converts a hex color string to RGB components.
 *
 * @param {string} hex Hex color such as "#336699" or "#369".
 * @returns {{r: number, g: number, b: number}} RGB color.
 */
export function hexToRgb(hex) {
  const text = String(hex || "").trim().replace(/^#/, "");
  const expanded = text.length === 3
    ? text.split("").map((character) => `${character}${character}`).join("")
    : text;

  if (!/^[\da-f]{6}$/i.test(expanded)) {
    throw new TypeError("hex must be a 3 or 6 digit color string.");
  }

  return {
    r: Number.parseInt(expanded.slice(0, 2), 16),
    g: Number.parseInt(expanded.slice(2, 4), 16),
    b: Number.parseInt(expanded.slice(4, 6), 16),
  };
}

export function rgbToHex(color) {
  const rgb = normalizeRgb(color);
  return `#${componentToHex(rgb.r)}${componentToHex(rgb.g)}${componentToHex(rgb.b)}`;
}

export function rgbToHsl(color) {
  const rgb = normalizeRgb(color);
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) {
    return { h: 0, s: 0, l: Number((lightness * 100).toFixed(6)) };
  }

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue = 0;
  if (max === r) {
    hue = 60 * (((g - b) / delta) % 6);
  } else if (max === g) {
    hue = 60 * ((b - r) / delta + 2);
  } else {
    hue = 60 * ((r - g) / delta + 4);
  }

  return {
    h: Number(normalizeHue(hue).toFixed(6)),
    s: Number((saturation * 100).toFixed(6)),
    l: Number((lightness * 100).toFixed(6)),
  };
}

export function hslToRgb(color) {
  const h = normalizeHue(color?.h);
  const s = percentToUnit(color?.s);
  const l = percentToUnit(color?.l);
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - chroma / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    [r, g, b] = [chroma, x, 0];
  } else if (h < 120) {
    [r, g, b] = [x, chroma, 0];
  } else if (h < 180) {
    [r, g, b] = [0, chroma, x];
  } else if (h < 240) {
    [r, g, b] = [0, x, chroma];
  } else if (h < 300) {
    [r, g, b] = [x, 0, chroma];
  } else {
    [r, g, b] = [chroma, 0, x];
  }

  return normalizeRgb({
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255,
  });
}

export function lerp(start, end, amount) {
  return finiteOrZero(start) + (finiteOrZero(end) - finiteOrZero(start)) * clamp01(amount);
}

export function lerpColor(start, end, amount) {
  const a = normalizeRgb(start);
  const b = normalizeRgb(end);
  return normalizeRgb({
    r: lerp(a.r, b.r, amount),
    g: lerp(a.g, b.g, amount),
    b: lerp(a.b, b.b, amount),
  });
}

export function blendColors(start, end, amount = 0.5) {
  return rgbToHex(lerpColor(start, end, amount));
}

function linearizeChannel(value) {
  const channel = clampByte(value) / 255;
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(color) {
  const rgb = normalizeRgb(color);
  return 0.2126 * linearizeChannel(rgb.r) + 0.7152 * linearizeChannel(rgb.g) + 0.0722 * linearizeChannel(rgb.b);
}

export function contrastRatio(first, second) {
  const a = relativeLuminance(first);
  const b = relativeLuminance(second);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(6));
}
