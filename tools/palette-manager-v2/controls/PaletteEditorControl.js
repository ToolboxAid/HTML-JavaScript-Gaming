import { USER_ADDED_SOURCE, cloneSwatch, normalizeHex, normalizeTags, sanitizeText } from "../modules/paletteUtils.js";

const MAX_TAG_SUGGESTIONS = 6;

function tagsContainTag(tags, tag) {
  const cleanTag = sanitizeText(tag).toLowerCase();
  return Boolean(cleanTag) && normalizeTags(tags).some((existingTag) => existingTag.toLowerCase() === cleanTag);
}

export class PaletteEditorControl {
  constructor({ refs, app, hexColorPattern }) {
    this.refs = refs;
    this.app = app;
    this.hexColorPattern = hexColorPattern;
    this.selectedTags = [];
    this.userDefinedTags = [];
    this.tagSuggestionIndex = -1;
  }

  bind() {
    this.refs.swatchHexInput.addEventListener("input", () => {
      this.renderUserDefinedSwatchPreview(this.readFormSwatch());
    });
    this.refs.tagEntryInput.addEventListener("input", () => {
      this.tagSuggestionIndex = 0;
      this.renderTagSuggestions();
    });
    this.refs.tagEntryInput.addEventListener("keydown", (event) => {
      this.handleTagKeydown(event);
    });
    this.refs.addTagButton.addEventListener("click", () => {
      this.addSelectedTag(sanitizeText(this.refs.tagEntryInput.value));
    });
    this.refs.addSwatchButton.addEventListener("click", () => {
      this.app.addUserSwatch(this.readFormSwatch());
    });
    this.refs.updateSwatchButton.addEventListener("click", () => {
      this.app.updateSelectedSwatch(this.readFormSwatch());
    });
    this.refs.clearFormButton.addEventListener("click", () => {
      this.app.clearEditorForm("Form cleared.");
    });
  }

  clearForm() {
    this.showSwatch({ symbol: "", hex: "", name: "", source: "", tags: [] }, "Selected Swatch");
    this.clearUserDefinedSwatch();
  }

  render() {
    this.renderAvailableTagList();
    this.renderTagSuggestions();
  }

  showSwatch(swatch) {
    const cleanSwatch = cloneSwatch(swatch);
    this.refs.selectedSwatchSymbolInput.value = cleanSwatch.symbol;
    this.refs.selectedSwatchHexInput.value = cleanSwatch.hex;
    this.refs.selectedSwatchNameInput.value = cleanSwatch.name;
    this.refs.selectedSwatchSourceInput.value = cleanSwatch.source;
    this.selectedTags = normalizeTags(cleanSwatch.tags);
    this.refs.tagEntryInput.value = "";
    this.tagSuggestionIndex = -1;
    this.renderSelectedTagList();
    this.renderAvailableTagList();
    this.renderTagSuggestions();
    this.renderSelectedSwatchPreview(cleanSwatch);
  }

  showUserDefinedSwatch(swatch) {
    const cleanSwatch = cloneSwatch(swatch);
    this.refs.swatchSymbolInput.value = cleanSwatch.symbol;
    this.refs.swatchHexInput.value = cleanSwatch.hex;
    this.refs.swatchNameInput.value = cleanSwatch.name;
    this.refs.swatchSourceInput.value = cleanSwatch.source || USER_ADDED_SOURCE;
    this.userDefinedTags = normalizeTags(cleanSwatch.tags);
    this.renderUserDefinedTagList();
    this.renderUserDefinedSwatchPreview(cleanSwatch);
  }

  clearUserDefinedSwatch() {
    this.refs.swatchSymbolInput.value = "";
    this.refs.swatchHexInput.value = "";
    this.refs.swatchNameInput.value = "";
    this.refs.swatchSourceInput.value = "";
    this.userDefinedTags = [];
    this.renderUserDefinedTagList();
    this.renderUserDefinedSwatchPreview({ hex: "" });
  }

  readFormSwatch() {
    return {
      symbol: sanitizeText(this.refs.swatchSymbolInput.value),
      hex: normalizeHex(this.refs.swatchHexInput.value),
      name: sanitizeText(this.refs.swatchNameInput.value),
      source: sanitizeText(this.refs.swatchSourceInput.value),
      tags: normalizeTags(this.userDefinedTags)
    };
  }

  handleTagKeydown(event) {
    if (event.key === "ArrowDown") {
      this.moveTagSuggestion(1);
      event.preventDefault();
      return;
    }
    if (event.key === "ArrowUp") {
      this.moveTagSuggestion(-1);
      event.preventDefault();
      return;
    }
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    this.addSelectedTag(this.getTagEntryValue(true));
  }

  getTagEntryValue(useSuggestion) {
    const suggestions = this.getFilteredTagSuggestions(this.refs.tagEntryInput.value);
    if (useSuggestion && suggestions.length > 0) {
      return suggestions[Math.max(0, this.tagSuggestionIndex)] || suggestions[0];
    }
    return sanitizeText(this.refs.tagEntryInput.value);
  }

  addSelectedTag(tag) {
    const cleanTag = sanitizeText(tag);
    if (!cleanTag) {
      return;
    }
    if (this.app.addTagToSelectedSwatch(cleanTag)) {
      this.refs.tagEntryInput.value = "";
      this.tagSuggestionIndex = -1;
    }
    this.renderTagSuggestions();
  }

  moveTagSuggestion(direction) {
    const suggestions = this.getFilteredTagSuggestions(this.refs.tagEntryInput.value);
    if (suggestions.length === 0) {
      return;
    }
    this.tagSuggestionIndex = (Math.max(0, this.tagSuggestionIndex) + direction + suggestions.length) % suggestions.length;
    this.renderTagSuggestions();
  }

  getFilteredTagSuggestions(query) {
    const cleanQuery = sanitizeText(query).toLowerCase();
    if (!cleanQuery) {
      return [];
    }
    return this.app.getTagSuggestions()
      .filter((tag) => tag.toLowerCase().startsWith(cleanQuery))
      .slice(0, MAX_TAG_SUGGESTIONS);
  }

  renderSelectedSwatchPreview(swatch) {
    const hex = normalizeHex(swatch?.hex);
    this.refs.selectedSwatchPreview.style.background = this.hexColorPattern.test(hex) ? hex : "#000000";
  }

  renderUserDefinedSwatchPreview(swatch) {
    const hex = normalizeHex(swatch?.hex);
    this.refs.userDefinedSwatchPreview.style.background = this.hexColorPattern.test(hex) ? hex : "#000000";
  }

  renderSelectedTagList() {
    this.renderTagList(this.refs.selectedSwatchTagList, this.selectedTags);
  }

  renderUserDefinedTagList() {
    this.renderTagList(this.refs.userDefinedSwatchTagList, this.userDefinedTags);
  }

  renderAvailableTagList() {
    const availableTags = this.app.getTagSuggestions();
    this.refs.availableTagList.replaceChildren();
    if (availableTags.length === 0) {
      const empty = this.refs.availableTagList.ownerDocument.createElement("p");
      empty.className = "palette-manager-v2__meta";
      empty.textContent = "No tags.";
      this.refs.availableTagList.appendChild(empty);
      return;
    }
    availableTags.forEach((tag) => {
      const button = this.refs.availableTagList.ownerDocument.createElement("button");
      button.type = "button";
      button.className = "palette-manager-v2__tag-pill palette-manager-v2__tag-toggle";
      const isActive = tagsContainTag(this.selectedTags, tag);
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
      button.textContent = tag;
      button.addEventListener("click", () => {
        this.app.toggleTagOnSelectedSwatch(tag);
      });
      this.refs.availableTagList.appendChild(button);
    });
  }

  renderTagList(container, tags) {
    container.replaceChildren();
    const cleanTags = normalizeTags(tags);
    if (cleanTags.length === 0) {
      const empty = container.ownerDocument.createElement("p");
      empty.className = "palette-manager-v2__meta";
      empty.textContent = "No tags.";
      container.appendChild(empty);
      return;
    }
    cleanTags.forEach((tag) => {
      const pill = container.ownerDocument.createElement("span");
      pill.className = "palette-manager-v2__tag-pill";
      pill.textContent = tag;
      container.appendChild(pill);
    });
  }

  renderTagSuggestions() {
    this.refs.tagSuggestions.replaceChildren();
    this.getFilteredTagSuggestions(this.refs.tagEntryInput.value).forEach((tag, index) => {
      const button = this.refs.tagSuggestions.ownerDocument.createElement("button");
      button.type = "button";
      button.className = "palette-manager-v2__tag-suggestion";
      button.classList.toggle("is-active", index === Math.max(0, this.tagSuggestionIndex));
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", String(index === Math.max(0, this.tagSuggestionIndex)));
      button.textContent = tag;
      button.addEventListener("click", () => {
        this.addSelectedTag(tag);
      });
      this.refs.tagSuggestions.appendChild(button);
    });
  }
}
