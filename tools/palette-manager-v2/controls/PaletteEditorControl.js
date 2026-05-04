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
    this.selectedTagSuggestionIndex = -1;
    this.userDefinedTagSuggestionIndex = -1;
  }

  bind() {
    this.refs.swatchHexInput.addEventListener("input", () => {
      this.renderUserDefinedSwatchPreview(this.readFormSwatch());
    });
    this.refs.selectedTagEntryInput.addEventListener("input", () => {
      this.selectedTagSuggestionIndex = 0;
      this.renderSelectedTagSuggestions();
    });
    this.refs.selectedTagEntryInput.addEventListener("keydown", (event) => {
      this.handleSelectedTagKeydown(event);
    });
    this.refs.selectedAddTagButton.addEventListener("click", () => {
      this.addSelectedTag(sanitizeText(this.refs.selectedTagEntryInput.value));
    });
    this.refs.userDefinedTagEntryInput.addEventListener("input", () => {
      this.userDefinedTagSuggestionIndex = 0;
      this.renderUserDefinedTagSuggestions();
    });
    this.refs.userDefinedTagEntryInput.addEventListener("keydown", (event) => {
      this.handleUserDefinedTagKeydown(event);
    });
    this.refs.userDefinedAddTagButton.addEventListener("click", () => {
      this.addUserDefinedTag(sanitizeText(this.refs.userDefinedTagEntryInput.value));
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
    this.renderSelectedTagSuggestions();
    this.renderUserDefinedTagSuggestions();
  }

  showSwatch(swatch, title) {
    const cleanSwatch = cloneSwatch(swatch);
    this.refs.editorTitle.textContent = sanitizeText(cleanSwatch.name) || sanitizeText(title) || "Selected Swatch";
    this.refs.selectedSwatchSymbolInput.value = cleanSwatch.symbol;
    this.refs.selectedSwatchHexInput.value = cleanSwatch.hex;
    this.refs.selectedSwatchNameInput.value = cleanSwatch.name;
    this.refs.selectedSwatchSourceInput.value = cleanSwatch.source;
    this.selectedTags = normalizeTags(cleanSwatch.tags);
    this.refs.selectedTagEntryInput.value = "";
    this.selectedTagSuggestionIndex = -1;
    this.renderSelectedTagList();
    this.renderSelectedTagSuggestions();
    this.renderSelectedSwatchPreview(cleanSwatch);
  }

  showUserDefinedSwatch(swatch) {
    const cleanSwatch = cloneSwatch(swatch);
    this.refs.swatchSymbolInput.value = cleanSwatch.symbol;
    this.refs.swatchHexInput.value = cleanSwatch.hex;
    this.refs.swatchNameInput.value = cleanSwatch.name;
    this.refs.swatchSourceInput.value = cleanSwatch.source || USER_ADDED_SOURCE;
    this.userDefinedTags = normalizeTags(cleanSwatch.tags);
    this.refs.userDefinedTagEntryInput.value = "";
    this.userDefinedTagSuggestionIndex = -1;
    this.renderUserDefinedTagList();
    this.renderUserDefinedTagSuggestions();
    this.renderUserDefinedSwatchPreview(cleanSwatch);
  }

  clearUserDefinedSwatch() {
    this.refs.swatchSymbolInput.value = "";
    this.refs.swatchHexInput.value = "";
    this.refs.swatchNameInput.value = "";
    this.refs.swatchSourceInput.value = "";
    this.userDefinedTags = [];
    this.refs.userDefinedTagEntryInput.value = "";
    this.userDefinedTagSuggestionIndex = -1;
    this.renderUserDefinedTagList();
    this.renderUserDefinedTagSuggestions();
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

  handleSelectedTagKeydown(event) {
    if (event.key === "ArrowDown") {
      this.moveSelectedTagSuggestion(1);
      event.preventDefault();
      return;
    }
    if (event.key === "ArrowUp") {
      this.moveSelectedTagSuggestion(-1);
      event.preventDefault();
      return;
    }
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    this.addSelectedTag(this.getSelectedTagEntryValue(true));
  }

  handleUserDefinedTagKeydown(event) {
    if (event.key === "ArrowDown") {
      this.moveUserDefinedTagSuggestion(1);
      event.preventDefault();
      return;
    }
    if (event.key === "ArrowUp") {
      this.moveUserDefinedTagSuggestion(-1);
      event.preventDefault();
      return;
    }
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    this.addUserDefinedTag(this.getUserDefinedTagEntryValue(true));
  }

  getSelectedTagEntryValue(useSuggestion) {
    const suggestions = this.getFilteredTagSuggestions(this.refs.selectedTagEntryInput.value, this.selectedTags);
    if (useSuggestion && suggestions.length > 0) {
      return suggestions[Math.max(0, this.selectedTagSuggestionIndex)] || suggestions[0];
    }
    return sanitizeText(this.refs.selectedTagEntryInput.value);
  }

  getUserDefinedTagEntryValue(useSuggestion) {
    const suggestions = this.getFilteredTagSuggestions(this.refs.userDefinedTagEntryInput.value, this.userDefinedTags);
    if (useSuggestion && suggestions.length > 0) {
      return suggestions[Math.max(0, this.userDefinedTagSuggestionIndex)] || suggestions[0];
    }
    return sanitizeText(this.refs.userDefinedTagEntryInput.value);
  }

  addSelectedTag(tag) {
    const cleanTag = sanitizeText(tag);
    if (!cleanTag) {
      return;
    }
    this.app.addTagToSelectedSwatch(cleanTag);
    this.refs.selectedTagEntryInput.value = "";
    this.selectedTagSuggestionIndex = -1;
    this.renderSelectedTagSuggestions();
  }

  addUserDefinedTag(tag) {
    const cleanTag = sanitizeText(tag);
    if (!cleanTag) {
      return;
    }
    if (tagsContainTag(this.userDefinedTags, cleanTag)) {
      this.app.setActionState([], `${cleanTag} is already on the User Defined Swatch form.`);
      return;
    }
    this.userDefinedTags = [...this.userDefinedTags, cleanTag];
    this.refs.userDefinedTagEntryInput.value = "";
    this.userDefinedTagSuggestionIndex = -1;
    this.renderUserDefinedTagList();
    this.renderUserDefinedTagSuggestions();
    this.app.setActionState([], `Added ${cleanTag} to User Defined Swatch form.`);
  }

  moveSelectedTagSuggestion(direction) {
    const suggestions = this.getFilteredTagSuggestions(this.refs.selectedTagEntryInput.value, this.selectedTags);
    if (suggestions.length === 0) {
      return;
    }
    this.selectedTagSuggestionIndex = (Math.max(0, this.selectedTagSuggestionIndex) + direction + suggestions.length) % suggestions.length;
    this.renderSelectedTagSuggestions();
  }

  moveUserDefinedTagSuggestion(direction) {
    const suggestions = this.getFilteredTagSuggestions(this.refs.userDefinedTagEntryInput.value, this.userDefinedTags);
    if (suggestions.length === 0) {
      return;
    }
    this.userDefinedTagSuggestionIndex = (Math.max(0, this.userDefinedTagSuggestionIndex) + direction + suggestions.length) % suggestions.length;
    this.renderUserDefinedTagSuggestions();
  }

  getFilteredTagSuggestions(query, currentTags) {
    const cleanQuery = sanitizeText(query).toLowerCase();
    if (!cleanQuery) {
      return [];
    }
    return this.app.getTagSuggestions()
      .filter((tag) => !tagsContainTag(currentTags, tag))
      .filter((tag) => tag.toLowerCase().includes(cleanQuery))
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

  renderSelectedTagSuggestions() {
    this.renderTagSuggestions({
      container: this.refs.selectedTagSuggestions,
      suggestions: this.getFilteredTagSuggestions(this.refs.selectedTagEntryInput.value, this.selectedTags),
      activeIndex: this.selectedTagSuggestionIndex,
      onPick: (tag) => this.addSelectedTag(tag)
    });
  }

  renderUserDefinedTagSuggestions() {
    this.renderTagSuggestions({
      container: this.refs.userDefinedTagSuggestions,
      suggestions: this.getFilteredTagSuggestions(this.refs.userDefinedTagEntryInput.value, this.userDefinedTags),
      activeIndex: this.userDefinedTagSuggestionIndex,
      onPick: (tag) => this.addUserDefinedTag(tag)
    });
  }

  renderTagSuggestions({ container, suggestions, activeIndex, onPick }) {
    container.replaceChildren();
    suggestions.forEach((tag, index) => {
      const button = container.ownerDocument.createElement("button");
      button.type = "button";
      button.className = "palette-manager-v2__tag-suggestion";
      button.classList.toggle("is-active", index === Math.max(0, activeIndex));
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", String(index === Math.max(0, activeIndex)));
      button.textContent = tag;
      button.addEventListener("click", () => {
        onPick(tag);
      });
      container.appendChild(button);
    });
  }
}
