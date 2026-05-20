import { cloneSwatch, normalizeHex, sanitizeText } from "./paletteUtils.js";

export const HARMONY_MATCH_SOURCES = Object.freeze([
  Object.freeze({ value: "calculated", label: "Calculated" }),
  Object.freeze({ value: "source-palette", label: "Source Palette Closest Match" }),
  Object.freeze({ value: "all-palettes", label: "All Palettes Closest Match" })
]);

export const HARMONY_SCHEMES = Object.freeze([
  Object.freeze({ value: "achromatic", label: "Achromatic" }),
  Object.freeze({ value: "accented-analogous", label: "Accented Analogous", parameter: { label: "Angle", min: 10, max: 60, step: 1, value: 30 } }),
  Object.freeze({ value: "analogous", label: "Analogous", parameter: { label: "Angle", min: 10, max: 60, step: 1, value: 30 } }),
  Object.freeze({ value: "complementary", label: "Complementary" }),
  Object.freeze({ value: "diadic", label: "Diadic" }),
  Object.freeze({ value: "double-complementary", label: "Double-Complementary", parameter: { label: "Pair angle", min: 30, max: 120, step: 1, value: 60 } }),
  Object.freeze({ value: "double-split-complementary", label: "Double-Split-Complementary", parameter: { label: "Split angle", min: 10, max: 60, step: 1, value: 30 } }),
  Object.freeze({ value: "hexadic", label: "Hexadic" }),
  Object.freeze({ value: "monochromatic", label: "Monochromatic", parameter: { label: "Lightness step", min: 8, max: 30, step: 1, value: 18 } }),
  Object.freeze({ value: "near-complementary", label: "Near-Complementary", parameter: { label: "Near offset", min: 10, max: 45, step: 1, value: 30 } }),
  Object.freeze({ value: "polychromatic", label: "Polychromatic" }),
  Object.freeze({ value: "side-complementary", label: "Side-Complementary", parameter: { label: "Side angle", min: 10, max: 60, step: 1, value: 30 } }),
  Object.freeze({ value: "split-complementary", label: "Split-Complementary", parameter: { label: "Split angle", min: 10, max: 60, step: 1, value: 30 } }),
  Object.freeze({ value: "square", label: "Square" }),
  Object.freeze({ value: "tetradic", label: "Tetradic", parameter: { label: "Pair angle", min: 30, max: 120, step: 1, value: 60 } }),
  Object.freeze({ value: "triadic", label: "Triadic" })
]);

const HARMONY_SYMBOLS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*+-=?";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function wrapHue(value) {
  return ((value % 360) + 360) % 360;
}

function hexToRgb(hex) {
  const cleanHex = normalizeHex(hex).slice(0, 7);
  if (!/^#[0-9A-F]{6}$/.test(cleanHex)) {
    return null;
  }
  return {
    r: parseInt(cleanHex.slice(1, 3), 16),
    g: parseInt(cleanHex.slice(3, 5), 16),
    b: parseInt(cleanHex.slice(5, 7), 16)
  };
}

function componentToHex(value) {
  return clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0").toUpperCase();
}

function rgbToHex({ r, g, b }) {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

function rgbToHsl({ r, g, b }) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;
  if (delta === 0) {
    return { h: 0, s: 0, l: lightness * 100 };
  }
  const saturation = delta / (1 - Math.abs((2 * lightness) - 1));
  let hue;
  if (max === red) {
    hue = 60 * (((green - blue) / delta) % 6);
  } else if (max === green) {
    hue = 60 * (((blue - red) / delta) + 2);
  } else {
    hue = 60 * (((red - green) / delta) + 4);
  }
  return { h: wrapHue(hue), s: saturation * 100, l: lightness * 100 };
}

function hueToRgb(p, q, t) {
  let nextT = t;
  if (nextT < 0) {
    nextT += 1;
  }
  if (nextT > 1) {
    nextT -= 1;
  }
  if (nextT < 1 / 6) {
    return p + ((q - p) * 6 * nextT);
  }
  if (nextT < 1 / 2) {
    return q;
  }
  if (nextT < 2 / 3) {
    return p + ((q - p) * ((2 / 3) - nextT) * 6);
  }
  return p;
}

function hslToRgb({ h, s, l }) {
  const hue = wrapHue(h) / 360;
  const saturation = clamp(s, 0, 100) / 100;
  const lightness = clamp(l, 0, 100) / 100;
  if (saturation === 0) {
    const gray = lightness * 255;
    return { r: gray, g: gray, b: gray };
  }
  const q = lightness < 0.5
    ? lightness * (1 + saturation)
    : lightness + saturation - (lightness * saturation);
  const p = (2 * lightness) - q;
  return {
    r: hueToRgb(p, q, hue + (1 / 3)) * 255,
    g: hueToRgb(p, q, hue) * 255,
    b: hueToRgb(p, q, hue - (1 / 3)) * 255
  };
}

function uniqueHarmonyColors(colors) {
  const seen = new Set();
  return colors.filter((color) => {
    const hex = normalizeHex(color.hex).slice(0, 7);
    if (!hex || seen.has(hex)) {
      return false;
    }
    seen.add(hex);
    color.hex = hex;
    return true;
  });
}

function colorFromOffset(baseHsl, offset, label) {
  return {
    hex: rgbToHex(hslToRgb({ ...baseHsl, h: baseHsl.h + offset })),
    label
  };
}

function monochromaticColors(baseHsl, step) {
  return [-step, step, step * 2]
    .map((offset) => ({
      hex: rgbToHex(hslToRgb({ ...baseHsl, l: clamp(baseHsl.l + offset, 8, 92) })),
      label: offset < 0 ? `${Math.abs(offset)}% darker` : `${offset}% lighter`
    }));
}

function achromaticColors(baseRgb) {
  const average = Math.round((baseRgb.r + baseRgb.g + baseRgb.b) / 3);
  return [
    { hex: rgbToHex({ r: average, g: average, b: average }), label: "Matching gray" },
    { hex: "#000000", label: "Black" },
    { hex: "#FFFFFF", label: "White" }
  ];
}

function offsetsForScheme(scheme, value) {
  switch (scheme) {
    case "accented-analogous":
      return [-value, value, 180];
    case "analogous":
      return [-value, value];
    case "complementary":
      return [180];
    case "diadic":
      return [90];
    case "double-complementary":
    case "tetradic":
      return [value, 180, 180 + value];
    case "double-split-complementary":
      return [180 - value, 180 + value, -value, value];
    case "hexadic":
      return [60, 120, 180, 240, 300];
    case "near-complementary":
      return [180 - value];
    case "polychromatic":
      return [72, 144, 216, 288];
    case "side-complementary":
      return [value, 180, 180 + value];
    case "split-complementary":
      return [180 - value, 180 + value];
    case "square":
      return [90, 180, 270];
    case "triadic":
      return [120, 240];
    default:
      return [];
  }
}

export function findHarmonyScheme(value) {
  const cleanValue = sanitizeText(value);
  return HARMONY_SCHEMES.find((scheme) => scheme.value === cleanValue) || HARMONY_SCHEMES[0];
}

export function findHarmonyMatchSource(value) {
  const cleanValue = sanitizeText(value);
  return HARMONY_MATCH_SOURCES.find((source) => source.value === cleanValue) || HARMONY_MATCH_SOURCES[0];
}

export function defaultHarmonyParameterValue(schemeValue) {
  return findHarmonyScheme(schemeValue).parameter?.value || 0;
}

export function normalizeHarmonyParameter(schemeValue, value) {
  const parameter = findHarmonyScheme(schemeValue).parameter;
  if (!parameter) {
    return 0;
  }
  const numberValue = Number(value);
  const finiteValue = Number.isFinite(numberValue) ? numberValue : parameter.value;
  return clamp(finiteValue, parameter.min, parameter.max);
}

export function calculateHarmonyColors(hex, schemeValue, parameterValue) {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return [];
  }
  const scheme = findHarmonyScheme(schemeValue);
  const parameter = normalizeHarmonyParameter(scheme.value, parameterValue || scheme.parameter?.value || 0);
  if (scheme.value === "achromatic") {
    return uniqueHarmonyColors(achromaticColors(rgb));
  }
  const hsl = rgbToHsl(rgb);
  if (scheme.value === "monochromatic") {
    return uniqueHarmonyColors(monochromaticColors(hsl, parameter));
  }
  return uniqueHarmonyColors(offsetsForScheme(scheme.value, parameter)
    .map((offset) => colorFromOffset(hsl, offset, `${offset > 0 ? "+" : ""}${offset} deg`)));
}

export function closestPaletteMatch(targetHex, swatches) {
  const target = hexToRgb(targetHex);
  if (!target) {
    return null;
  }
  return (Array.isArray(swatches) ? swatches : [])
    .map((swatch) => {
      const rgb = hexToRgb(swatch?.hex);
      if (!rgb) {
        return null;
      }
      const distance = Math.sqrt(
        ((target.r - rgb.r) ** 2)
        + ((target.g - rgb.g) ** 2)
        + ((target.b - rgb.b) ** 2)
      );
      return {
        distance,
        swatch: {
          ...cloneSwatch(swatch),
          paletteId: sanitizeText(swatch?.paletteId),
          paletteName: sanitizeText(swatch?.paletteName)
        }
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.distance - right.distance)[0]?.swatch || null;
}

export function nextHarmonySymbol(existingSwatches) {
  const used = new Set((Array.isArray(existingSwatches) ? existingSwatches : [])
    .map((swatch) => sanitizeText(swatch?.symbol))
    .filter(Boolean));
  return Array.from(HARMONY_SYMBOLS).find((symbol) => !used.has(symbol)) || "~";
}
