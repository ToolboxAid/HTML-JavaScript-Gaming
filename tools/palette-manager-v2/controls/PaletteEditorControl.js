import { USER_ADDED_SOURCE, cloneSwatch, normalizeHex, sanitizeText } from "../modules/paletteUtils.js";

export class PaletteEditorControl {
  constructor({ refs, app, hexColorPattern }) {
    this.refs = refs;
    this.app = app;
    this.hexColorPattern = hexColorPattern;
  }

  bind() {
    this.refs.swatchHexInput.addEventListener("input", () => {
      this.renderSelectedSwatchPreview(this.readFormSwatch());
    });
    this.refs.addSwatchButton.addEventListener("click", () => {
      this.app.addUserSwatch(this.readFormSwatch());
    });
    this.refs.updateSwatchButton.addEventListener("click", () => {
      this.app.updateSelectedSwatch(this.readFormSwatch());
    });
    this.refs.removeSwatchButton.addEventListener("click", () => {
      this.app.removeSelectedSwatch();
    });
    this.refs.clearFormButton.addEventListener("click", () => {
      this.app.clearEditorForm("Form cleared.");
    });
  }

  clearForm() {
    this.showSwatch({ symbol: "", hex: "", name: "", source: USER_ADDED_SOURCE }, "Selected Swatch");
  }

  showSwatch(swatch, title) {
    const cleanSwatch = cloneSwatch(swatch);
    this.refs.editorTitle.textContent = sanitizeText(title) || "Selected Swatch";
    this.refs.swatchSymbolInput.value = cleanSwatch.symbol;
    this.refs.swatchHexInput.value = cleanSwatch.hex;
    this.refs.swatchNameInput.value = cleanSwatch.name;
    this.refs.swatchSourceInput.value = cleanSwatch.source;
    this.refs.swatchSourceInput.readOnly = true;
    this.renderSelectedSwatchPreview(cleanSwatch);
  }

  readFormSwatch() {
    return {
      symbol: sanitizeText(this.refs.swatchSymbolInput.value),
      hex: normalizeHex(this.refs.swatchHexInput.value),
      name: sanitizeText(this.refs.swatchNameInput.value),
      source: sanitizeText(this.refs.swatchSourceInput.value)
    };
  }

  renderSelectedSwatchPreview(swatch) {
    const hex = normalizeHex(swatch?.hex);
    this.refs.selectedSwatchPreview.style.background = this.hexColorPattern.test(hex) ? hex : "#000000";
  }
}
