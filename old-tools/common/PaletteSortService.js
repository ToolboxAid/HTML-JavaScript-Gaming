import { normalizeText } from "../../src/shared/string/strings.js";

const PALETTE_SORT_MODES = Object.freeze([
  Object.freeze({ value: "hue", label: "Hue" }),
  Object.freeze({ value: "saturation", label: "Saturation" }),
  Object.freeze({ value: "brightness", label: "Brightness" }),
  Object.freeze({ value: "name", label: "Name" })
]);

function hexToRgb(hex) {
  const value = normalizeText(hex).replace(/^#/u, "");
  if (!/^[0-9A-Fa-f]{6}$/u.test(value)) {
    return null;
  }
  return {
    r: Number.parseInt(value.slice(0, 2), 16) / 255,
    g: Number.parseInt(value.slice(2, 4), 16) / 255,
    b: Number.parseInt(value.slice(4, 6), 16) / 255
  };
}

function rgbToHsl(rgb) {
  if (!rgb) {
    return { h: Number.POSITIVE_INFINITY, s: Number.POSITIVE_INFINITY, l: Number.POSITIVE_INFINITY };
  }

  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) {
    return { h: 0, s: 0, l: lightness };
  }

  const saturation = lightness > 0.5
    ? delta / (2 - max - min)
    : delta / (max + min);

  let hue = 0;
  if (max === rgb.r) {
    hue = (rgb.g - rgb.b) / delta + (rgb.g < rgb.b ? 6 : 0);
  } else if (max === rgb.g) {
    hue = (rgb.b - rgb.r) / delta + 2;
  } else {
    hue = (rgb.r - rgb.g) / delta + 4;
  }

  return { h: hue / 6, s: saturation, l: lightness };
}

function swatchMetrics(swatch) {
  return rgbToHsl(hexToRgb(swatch?.hex));
}

function compareNumbers(left, right) {
  return left === right ? 0 : left - right;
}

function compareByMode(left, right, mode, collator) {
  if (mode === "name") {
    return collator.compare(normalizeText(left.swatch?.name), normalizeText(right.swatch?.name));
  }
  if (mode === "hue") {
    return compareNumbers(left.metrics.h, right.metrics.h)
      || compareNumbers(left.metrics.s, right.metrics.s)
      || compareNumbers(left.metrics.l, right.metrics.l);
  }
  if (mode === "saturation") {
    return compareNumbers(left.metrics.s, right.metrics.s)
      || compareNumbers(left.metrics.h, right.metrics.h)
      || compareNumbers(left.metrics.l, right.metrics.l);
  }
  if (mode === "brightness") {
    return compareNumbers(left.metrics.l, right.metrics.l)
      || compareNumbers(left.metrics.h, right.metrics.h)
      || compareNumbers(left.metrics.s, right.metrics.s);
  }
  return 0;
}

export class PaletteSortService {
  getSortModes() {
    return PALETTE_SORT_MODES.map((mode) => ({ ...mode }));
  }

  isValidSortMode(mode) {
    return PALETTE_SORT_MODES.some((entry) => entry.value === mode);
  }

  sortSwatches(swatches, mode) {
    if (!this.isValidSortMode(mode)) {
      return Array.isArray(swatches) ? swatches.slice() : [];
    }

    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
    return (Array.isArray(swatches) ? swatches : [])
      .map((swatch, index) => ({ swatch, index, metrics: swatchMetrics(swatch) }))
      .sort((left, right) => {
        return compareByMode(left, right, mode, collator) || left.index - right.index;
      })
      .map((entry) => entry.swatch);
  }

  sortRows(rows, mode) {
    if (!this.isValidSortMode(mode)) {
      return Array.isArray(rows) ? rows.slice() : [];
    }

    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
    return (Array.isArray(rows) ? rows : [])
      .map((row, index) => ({ row, index, swatch: row?.swatch, metrics: swatchMetrics(row?.swatch) }))
      .sort((left, right) => {
        return compareByMode(left, right, mode, collator) || left.index - right.index;
      })
      .map((entry) => entry.row);
  }
}
