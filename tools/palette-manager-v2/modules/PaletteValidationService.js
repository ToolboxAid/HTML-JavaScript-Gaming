import { cloneSwatch, isObjectRecord, normalizeHex, sanitizeText } from "./paletteUtils.js";

export class PaletteValidationService {
  constructor({ hexColorPattern, globalPaletteToolKey }) {
    this.hexColorPattern = hexColorPattern;
    this.globalPaletteToolKey = globalPaletteToolKey;
  }

  validateSwatch(swatch, label) {
    const issues = [];
    const cleanLabel = sanitizeText(label) || "swatch";
    const symbol = sanitizeText(swatch?.symbol);
    const hex = normalizeHex(swatch?.hex);
    const name = sanitizeText(swatch?.name);
    const source = sanitizeText(swatch?.source);
    const tags = swatch?.tags;

    if (!symbol) {
      issues.push(`${cleanLabel}.symbol is required.`);
    } else if (symbol.length !== 1) {
      issues.push(`${cleanLabel}.symbol must be exactly one character.`);
    }
    if (!hex) {
      issues.push(`${cleanLabel}.hex is required.`);
    } else if (!this.hexColorPattern.test(hex)) {
      issues.push(`${cleanLabel}.hex must be #RRGGBB or #RRGGBBAA.`);
    }
    if (!name) {
      issues.push(`${cleanLabel}.name is required.`);
    }
    if (!source) {
      issues.push(`${cleanLabel}.source is required.`);
    }
    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        issues.push(`${cleanLabel}.tags must be an array of strings.`);
      } else {
        tags.forEach((tag, index) => {
          if (typeof tag !== "string" || !sanitizeText(tag)) {
            issues.push(`${cleanLabel}.tags[${index}] must be a non-empty string.`);
          }
        });
      }
    }
    return issues;
  }

  validateUserSwatches(swatches) {
    if (!Array.isArray(swatches)) {
      return [`tools.${this.globalPaletteToolKey}.swatches must be an array.`];
    }
    return swatches.flatMap((swatch, index) => this.validateSwatch(swatch, `swatches[${index}]`));
  }

  getDirectPaletteSource(documentValue) {
    return sanitizeText(documentValue?.sourceId)
      || sanitizeText(documentValue?.source)
      || sanitizeText(documentValue?.name);
  }

  cloneImportedSwatches(swatches, source) {
    const cleanSource = sanitizeText(source);
    return swatches.map((swatch) => cloneSwatch({
      ...swatch,
      source: sanitizeText(swatch?.source) || cleanSource
    }));
  }

  extractImportedPaletteDocument(documentValue) {
    if (!isObjectRecord(documentValue)) {
      return { swatches: null, errors: ["Imported JSON must be an object."] };
    }

    if (Array.isArray(documentValue.swatches)) {
      const swatches = this.cloneImportedSwatches(
        documentValue.swatches,
        this.getDirectPaletteSource(documentValue)
      );
      const errors = this.validateUserSwatches(swatches);
      return { swatches: errors.length > 0 ? null : swatches, errors };
    }

    if (!isObjectRecord(documentValue.tools)) {
      return { swatches: null, errors: ["Imported JSON must contain a tools object or a direct swatches array."] };
    }

    const paletteValue = documentValue.tools[this.globalPaletteToolKey];
    if (!isObjectRecord(paletteValue)) {
      return { swatches: null, errors: [`Imported JSON must contain tools.${this.globalPaletteToolKey}.`] };
    }

    if (!Array.isArray(paletteValue.swatches)) {
      return { swatches: null, errors: [`tools.${this.globalPaletteToolKey}.swatches must be an array.`] };
    }

    const swatches = this.cloneImportedSwatches(paletteValue.swatches, "");
    const errors = this.validateUserSwatches(swatches);
    return { swatches: errors.length > 0 ? null : swatches, errors };
  }
}
