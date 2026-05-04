import { USER_ADDED_SOURCE, cloneSwatch, normalizeHex, normalizeTags, sanitizeText } from "../modules/paletteUtils.js";

function tagsToInputValue(tags) {
  return normalizeTags(tags).join(", ");
}

export class PaletteEditorControl {
  constructor({ refs, app, hexColorPattern }) {
    this.refs = refs;
    this.app = app;
    this.hexColorPattern = hexColorPattern;
  }

  bind() {
    this.refs.swatchHexInput.addEventListener("input", () => {
      this.renderUserDefinedSwatchPreview(this.readFormSwatch());
    });
    this.refs.selectedSwatchTagsInput.addEventListener("change", () => {
      this.app.updateSelectedSwatchTags(this.readSelectedTags());
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
    this.showSwatch({ symbol: "", hex: "", name: "", source: "", tags: [] }, "Selected Swatch");
    this.showUserDefinedSwatch({ symbol: "", hex: "", name: "", source: USER_ADDED_SOURCE, tags: [] });
  }

  render() {
    this.renderTagSuggestions();
  }

  showSwatch(swatch, title) {
    const cleanSwatch = cloneSwatch(swatch);
    this.refs.editorTitle.textContent = sanitizeText(cleanSwatch.name) || sanitizeText(title) || "Selected Swatch";
    this.refs.selectedSwatchSymbolInput.value = cleanSwatch.symbol;
    this.refs.selectedSwatchHexInput.value = cleanSwatch.hex;
    this.refs.selectedSwatchNameInput.value = cleanSwatch.name;
    this.refs.selectedSwatchSourceInput.value = cleanSwatch.source;
    this.refs.selectedSwatchTagsInput.value = tagsToInputValue(cleanSwatch.tags);
    this.renderSelectedSwatchPreview(cleanSwatch);
  }

  showUserDefinedSwatch(swatch) {
    const cleanSwatch = cloneSwatch(swatch);
    this.refs.swatchSymbolInput.value = cleanSwatch.symbol;
    this.refs.swatchHexInput.value = cleanSwatch.hex;
    this.refs.swatchNameInput.value = cleanSwatch.name;
    this.refs.swatchSourceInput.value = cleanSwatch.source || USER_ADDED_SOURCE;
    this.refs.swatchTagsInput.value = tagsToInputValue(cleanSwatch.tags);
    this.renderUserDefinedSwatchPreview(cleanSwatch);
  }

  readFormSwatch() {
    return {
      symbol: sanitizeText(this.refs.swatchSymbolInput.value),
      hex: normalizeHex(this.refs.swatchHexInput.value),
      name: sanitizeText(this.refs.swatchNameInput.value),
      source: sanitizeText(this.refs.swatchSourceInput.value),
      tags: normalizeTags(this.refs.swatchTagsInput.value)
    };
  }

  readSelectedTags() {
    return normalizeTags(this.refs.selectedSwatchTagsInput.value);
  }

  renderSelectedSwatchPreview(swatch) {
    const hex = normalizeHex(swatch?.hex);
    this.refs.selectedSwatchPreview.style.background = this.hexColorPattern.test(hex) ? hex : "#000000";
  }

  renderUserDefinedSwatchPreview(swatch) {
    const hex = normalizeHex(swatch?.hex);
    this.refs.userDefinedSwatchPreview.style.background = this.hexColorPattern.test(hex) ? hex : "#000000";
  }

  renderTagSuggestions() {
    this.refs.swatchTagSuggestions.replaceChildren();
    this.app.getTagSuggestions().forEach((tag) => {
      const option = this.refs.swatchTagSuggestions.ownerDocument.createElement("option");
      option.value = tag;
      this.refs.swatchTagSuggestions.appendChild(option);
    });
  }
}
