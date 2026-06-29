import { sanitizeText } from "../string/strings.js";
import { asObject } from "../object/objects.js";

/*
Toolbox Aid
David Quesenberry
04/25/2026
paletteDocumentContract.js
*/

export const PALETTE_DOCUMENT_SCHEMA = "html-js-gaming.palette";
export const PALETTE_DOCUMENT_VERSION = 1;

function toHexColor(value) {
  const safeValue = sanitizeText(value);
  if (!safeValue) {
    return "";
  }
  const match = safeValue.match(/^#([0-9a-f]{6}|[0-9a-f]{8})$/i);
  return match ? `#${match[1].toUpperCase()}` : "";
}

function getFallbackSwatchKey(index) {
  if (!Number.isInteger(index) || index < 0) {
    return "swatch-1";
  }
  return `swatch-${index + 1}`;
}

function normalizeEntry(rawEntry, index) {
  const source = asObject(rawEntry);
  const hex = toHexColor(source.hex);
  const key = sanitizeText(source.key || source.swatchKey) || getFallbackSwatchKey(index);
  return {
    key,
    hex,
    name: sanitizeText(source.name) || `Swatch ${index + 1}`
  };
}

function normalizeLegacyColorEntries(colors) {
  if (!Array.isArray(colors)) {
    return [];
  }
  return colors
    .map((entry) => toHexColor(entry))
    .filter((entry) => Boolean(entry))
    .map((hex, index) => ({
      key: getFallbackSwatchKey(index),
      hex: hex.slice(0, 7),
      name: `Swatch ${index + 1}`
    }));
}

export function normalizePaletteDocument(rawDocument) {
  const source = asObject(rawDocument);
  const swatches = Array.isArray(source.swatches)
    ? source.swatches.map((entry, index) => normalizeEntry(entry, index)).filter((entry) => Boolean(entry.hex))
    : Array.isArray(source.entries)
      ? source.entries.map((entry, index) => normalizeEntry(entry, index)).filter((entry) => Boolean(entry.hex))
    : normalizeLegacyColorEntries(source.colors);

  const schema = sanitizeText(source.schema);
  const normalizedVersion = Number(source.version);
  return {
    schema: schema || PALETTE_DOCUMENT_SCHEMA,
    version: Number.isFinite(normalizedVersion) ? normalizedVersion : PALETTE_DOCUMENT_VERSION,
    name: sanitizeText(source.name) || "Unnamed Palette",
    source: sanitizeText(source.source) || "custom",
    swatches
  };
}

export function validatePaletteDocument(rawDocument, options = {}) {
  const source = asObject(rawDocument);
  const normalized = normalizePaletteDocument(source);
  const issues = [];
  const warnings = [];
  const requireSchema = options.requireSchema !== false;

  const sourceSchema = sanitizeText(source.schema);
  const sourceVersion = Number(source.version);

  if (requireSchema && !sourceSchema) {
    issues.push(`Palette schema is required (${PALETTE_DOCUMENT_SCHEMA}).`);
  } else if (sourceSchema && sourceSchema !== PALETTE_DOCUMENT_SCHEMA) {
    issues.push(`Palette schema must be ${PALETTE_DOCUMENT_SCHEMA}.`);
  }

  if (requireSchema && !Number.isFinite(sourceVersion)) {
    issues.push(`Palette version is required (${PALETTE_DOCUMENT_VERSION}).`);
  } else if (Number.isFinite(sourceVersion) && sourceVersion !== PALETTE_DOCUMENT_VERSION) {
    issues.push(`Palette version must be ${PALETTE_DOCUMENT_VERSION}.`);
  }

  if (!sanitizeText(normalized.name)) {
    issues.push("Palette name is required.");
  }

  if (!Array.isArray(normalized.swatches) || normalized.swatches.length === 0) {
    issues.push("Palette swatches must include at least one swatch.");
  }

  normalized.swatches.forEach((entry, index) => {
    if (!sanitizeText(entry.key)) {
      issues.push(`swatches[${index}].key is required.`);
    }
    if (!toHexColor(entry.hex)) {
      issues.push(`swatches[${index}].hex must be #RRGGBB or #RRGGBBAA.`);
    }
    if (!sanitizeText(entry.name)) {
      issues.push(`swatches[${index}].name is required.`);
    }
  });

  if (!Array.isArray(source.swatches) && Array.isArray(source.entries)) {
    warnings.push("Legacy palette entries[] input detected; converted to swatches[] for compatibility.");
  }
  if (!Array.isArray(source.swatches) && !Array.isArray(source.entries) && Array.isArray(source.colors)) {
    warnings.push("Legacy palette colors[] input detected; converted to swatches[] for compatibility.");
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    palette: normalized
  };
}
