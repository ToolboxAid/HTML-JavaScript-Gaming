const HEX_COLOR_PATTERN = /^#([0-9a-f]{6}|[0-9a-f]{8})$/i;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeHexColor(value) {
  const normalized = normalizeText(value);
  return HEX_COLOR_PATTERN.test(normalized) ? normalized.toUpperCase() : "";
}

function getExplicitColorValue(entry) {
  if (typeof entry === "string") {
    return normalizeHexColor(entry);
  }
  if (!isPlainObject(entry)) {
    return "";
  }
  return normalizeHexColor(entry.hex);
}

function normalizeColorEntry(entry, index) {
  const hex = getExplicitColorValue(entry);
  if (!hex) {
    return null;
  }
  const source = isPlainObject(entry) ? entry : {};
  return {
    hex,
    name: normalizeText(source.name) || `Color ${index + 1}`,
    symbol: normalizeText(source.symbol).slice(0, 2)
  };
}

export function validatePaletteContract(paletteJson) {
  const issues = [];
  if (!isPlainObject(paletteJson)) {
    return {
      valid: false,
      issues: ["paletteJson must be an object."],
      palette: null
    };
  }

  const name = normalizeText(paletteJson.name);
  if (!name) {
    issues.push("paletteJson.name is required.");
  }

  if (Array.isArray(paletteJson.swatches) && !Array.isArray(paletteJson.colors)) {
    issues.push("Legacy paletteJson.swatches[] is not accepted by this contract; provide paletteJson.colors[].");
  }

  if (!Array.isArray(paletteJson.colors)) {
    issues.push("paletteJson.colors[] is required.");
  }

  const rawColors = Array.isArray(paletteJson.colors) ? paletteJson.colors : [];
  const colors = rawColors.map((entry, index) => normalizeColorEntry(entry, index));
  colors.forEach((entry, index) => {
    if (!entry) {
      issues.push(`paletteJson.colors[${index}] must provide an explicit #RRGGBB or #RRGGBBAA hex value.`);
    }
  });

  const normalizedColors = colors.filter(Boolean);
  return {
    valid: issues.length === 0,
    issues,
    palette: issues.length === 0
      ? {
          name,
          colors: normalizedColors
        }
      : null
  };
}
