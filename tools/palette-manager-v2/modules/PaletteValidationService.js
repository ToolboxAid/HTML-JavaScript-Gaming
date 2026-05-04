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

    if (!symbol) {
      issues.push(`${cleanLabel}.symbol is required.`);
    } else if (symbol.length !== 1) {
      issues.push(`${cleanLabel}.symbol must be exactly one character.`);
    }
    if (!hex) {
      issues.push(`${cleanLabel}.hex is required.`);
    } else if (!this.hexColorPattern.test(hex)) {
      issues.push(`${cleanLabel}.hex must be #RRGGBB.`);
    }
    if (!name) {
      issues.push(`${cleanLabel}.name is required.`);
    }
    if (!source) {
      issues.push(`${cleanLabel}.source is required.`);
    }
    return issues;
  }

  validateUserSwatches(swatches) {
    if (!Array.isArray(swatches)) {
      return [`tools.${this.globalPaletteToolKey}.swatches must be an array.`];
    }
    return swatches.flatMap((swatch, index) => this.validateSwatch(swatch, `swatches[${index}]`));
  }

  extractImportedPaletteDocument(documentValue) {
    if (!isObjectRecord(documentValue)) {
      return { swatches: null, errors: ["Imported JSON must be an object."] };
    }

    if (!isObjectRecord(documentValue.tools)) {
      return { swatches: null, errors: ["Imported JSON must contain a tools object."] };
    }

    const paletteValue = documentValue.tools[this.globalPaletteToolKey];
    if (!isObjectRecord(paletteValue)) {
      return { swatches: null, errors: [`Imported JSON must contain tools.${this.globalPaletteToolKey}.`] };
    }

    if (!Array.isArray(paletteValue.swatches)) {
      return { swatches: null, errors: [`tools.${this.globalPaletteToolKey}.swatches must be an array.`] };
    }

    const swatches = paletteValue.swatches.map(cloneSwatch);
    const errors = this.validateUserSwatches(swatches);
    return { swatches: errors.length > 0 ? null : swatches, errors };
  }
}
