import { PaletteEditorControl } from "../controls/PaletteEditorControl.js";
import { PaletteImportExportControl } from "../controls/PaletteImportExportControl.js";
import { PaletteValidationErrorControl } from "../controls/PaletteValidationErrorControl.js";
import { SourcePaletteBrowserControl } from "../controls/SourcePaletteBrowserControl.js";
import { UserPaletteControl } from "../controls/UserPaletteControl.js";
import { PaletteValidationService } from "./PaletteValidationService.js";
import { USER_ADDED_SOURCE, cloneSwatch, normalizeHex, normalizeTags, sanitizeText, swatchKey } from "./paletteUtils.js";

const USER_HEX_COLOR_PATTERN = /^#[0-9A-F]{6}(?:[0-9A-F]{2})?$/;

const REQUIRED_REF_IDS = Object.freeze([
  "userPaletteCount",
  "userPaletteSortControls",
  "userSwatchSizeControls",
  "userSwatchList",
  "sourcePaletteSelect",
  "sourceSearchInput",
  "sourcePaletteSortControls",
  "sourceSwatchSizeControls",
  "sourceSwatchList",
  "selectedSwatchPreview",
  "selectedSwatchSymbolInput",
  "selectedSwatchHexInput",
  "selectedSwatchNameInput",
  "selectedSwatchSourceInput",
  "selectedSwatchTagList",
  "userDefinedSwatchPreview",
  "swatchSymbolInput",
  "swatchHexInput",
  "swatchNameInput",
  "availableTagList",
  "tagEntryInput",
  "tagSuggestions",
  "addTagButton",
  "addSwatchButton",
  "updateSwatchButton",
  "clearFormButton",
  "importPaletteButton",
  "importPaletteInput",
  "copyPaletteButton",
  "exportPaletteButton",
  "paletteJsonPreview",
  "paletteStatus",
  "paletteErrorList"
]);

const SWATCH_SIZE_OPTIONS = Object.freeze([
  Object.freeze({ value: "small", label: "Small" }),
  Object.freeze({ value: "medium", label: "Medium" }),
  Object.freeze({ value: "large", label: "Large" })
]);

function isValidSwatchSize(swatchSize) {
  return SWATCH_SIZE_OPTIONS.some((size) => size.value === swatchSize);
}

function isUserDefinedSwatch(swatch) {
  return sanitizeText(swatch?.source) === USER_ADDED_SOURCE;
}

function sortUniqueTags(tags) {
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
  return Array.from(new Set(normalizeTags(tags)))
    .sort((left, right) => collator.compare(left, right));
}

function isSameText(left, right) {
  return sanitizeText(left).toLowerCase() === sanitizeText(right).toLowerCase();
}

function getRgbHexKey(hex) {
  return normalizeHex(hex).slice(0, 7);
}

function collectRefs(documentRef) {
  return REQUIRED_REF_IDS.reduce((refs, id) => {
    const element = documentRef.getElementById(id);
    if (!element) {
      throw new Error(`Palette Manager V2 missing #${id}.`);
    }
    refs[id] = element;
    return refs;
  }, {});
}

export class PaletteManagerApp {
  constructor({ documentRef, paletteSource, sortService, usageService }) {
    this.document = documentRef;
    this.paletteSource = paletteSource;
    this.sortService = sortService;
    this.usageService = usageService;
    this.globalPaletteToolKey = paletteSource.GLOBAL_PALETTE_TOOL_KEY;
    this.hexColorPattern = USER_HEX_COLOR_PATTERN;
    this.sourcePalettes = paletteSource.SOURCE_PALETTES;
    this.sourcePaletteLabels = paletteSource.SOURCE_PALETTE_LABELS || {};
    this.sourcePaletteIds = Object.keys(this.sourcePalettes);
    this.refs = collectRefs(documentRef);
    this.validator = new PaletteValidationService({
      hexColorPattern: this.hexColorPattern,
      globalPaletteToolKey: this.globalPaletteToolKey
    });
    this.state = {
      userSwatches: [],
      selectedUserIndex: -1,
      sourcePaletteId: this.sourcePaletteIds[0] || "",
      sourceSearch: "",
      userSortMode: "hue",
      sourceSortMode: "hue",
      userSwatchSize: "large",
      sourceSwatchSize: "large",
      availableTags: [],
      errors: [],
      status: "Ready."
    };
  }

  init() {
    this.editorControl = new PaletteEditorControl({
      refs: this.refs,
      app: this,
      hexColorPattern: this.hexColorPattern
    });
    this.controls = [
      this.editorControl,
      new UserPaletteControl({ documentRef: this.document, refs: this.refs, app: this }),
      new SourcePaletteBrowserControl({ documentRef: this.document, refs: this.refs, app: this }),
      new PaletteImportExportControl({ refs: this.refs, app: this }),
      new PaletteValidationErrorControl({ documentRef: this.document, refs: this.refs, app: this })
    ];

    this.controls.forEach((control) => control.bind());
    this.editorControl.clearForm();

    if (this.sourcePaletteIds.length === 0) {
      this.setActionState(["src/engine/paletteList.js did not provide source palettes."], "Source palettes unavailable.", false);
    }
    this.render();
  }

  render() {
    this.controls.forEach((control) => {
      if (typeof control.render === "function") {
        control.render();
      }
    });
  }

  getUserSwatches() {
    return this.state.userSwatches.map(cloneSwatch);
  }

  getVisibleUserSwatchRows() {
    const rows = this.state.userSwatches.map((swatch, index) => ({
      index,
      swatch: cloneSwatch(swatch)
    }));
    return this.sortService.sortRows(rows, this.state.userSortMode);
  }

  getSelectedUserIndex() {
    return this.state.selectedUserIndex;
  }

  getSortModes() {
    return this.sortService.getSortModes();
  }

  getSwatchSizeOptions() {
    return SWATCH_SIZE_OPTIONS.map((size) => ({ ...size }));
  }

  getUserSortMode() {
    return this.state.userSortMode;
  }

  getSourceSortMode() {
    return this.state.sourceSortMode;
  }

  getUserSwatchSize() {
    return this.state.userSwatchSize;
  }

  getSourceSwatchSize() {
    return this.state.sourceSwatchSize;
  }

  getSourcePaletteIds() {
    return this.sourcePaletteIds.slice();
  }

  getSourcePaletteLabel(sourceId) {
    return sanitizeText(this.sourcePaletteLabels[sourceId]) || sanitizeText(sourceId);
  }

  getCurrentSourcePaletteId() {
    return this.state.sourcePaletteId;
  }

  getSourceSearch() {
    return this.state.sourceSearch;
  }

  getStatus() {
    return this.state.status;
  }

  getVisibleErrors() {
    return Array.from(new Set([...this.state.errors, ...this.validator.validateUserSwatches(this.state.userSwatches)]));
  }

  getTagSuggestions() {
    return this.state.availableTags.slice();
  }

  getSelectedSwatch() {
    if (this.state.selectedUserIndex < 0 || this.state.selectedUserIndex >= this.state.userSwatches.length) {
      return null;
    }
    return cloneSwatch(this.state.userSwatches[this.state.selectedUserIndex]);
  }

  getVisibleSourceSwatches() {
    const swatches = this.sourcePalettes[this.state.sourcePaletteId] || [];
    const query = sanitizeText(this.state.sourceSearch).toLowerCase();
    const toSourceSwatch = (swatch) => cloneSwatch({
      ...swatch,
      source: swatch.source || this.state.sourcePaletteId
    });
    if (!query) {
      return this.sortService.sortSwatches(swatches.map(toSourceSwatch), this.state.sourceSortMode);
    }
    const visibleSwatches = swatches
      .filter((swatch) => {
        return swatch.name.toLowerCase().includes(query)
          || swatch.hex.toLowerCase().includes(query)
          || swatch.symbol.toLowerCase().includes(query);
      })
      .map(toSourceSwatch);
    return this.sortService.sortSwatches(visibleSwatches, this.state.sourceSortMode);
  }

  setSourcePaletteId(sourcePaletteId) {
    if (!this.sourcePalettes[sourcePaletteId]) {
      return;
    }
    this.state.sourcePaletteId = sourcePaletteId;
    this.state.sourceSearch = "";
    this.setActionState([], `Browsing ${sourcePaletteId}.`, false);
    this.render();
  }

  setSourceSearch(sourceSearch) {
    this.state.sourceSearch = sanitizeText(sourceSearch);
    this.render();
  }

  setUserSortMode(sortMode) {
    if (!this.sortService.isValidSortMode(sortMode)) {
      return;
    }
    this.state.userSortMode = sortMode;
    this.render();
  }

  setSourceSortMode(sortMode) {
    if (!this.sortService.isValidSortMode(sortMode)) {
      return;
    }
    this.state.sourceSortMode = sortMode;
    this.render();
  }

  setUserSwatchSize(swatchSize) {
    if (!isValidSwatchSize(swatchSize)) {
      return;
    }
    this.state.userSwatchSize = swatchSize;
    this.render();
  }

  setSourceSwatchSize(swatchSize) {
    if (!isValidSwatchSize(swatchSize)) {
      return;
    }
    this.state.sourceSwatchSize = swatchSize;
    this.render();
  }

  setActionState(errors, status, shouldRender = true) {
    this.state.errors = Array.isArray(errors) ? errors : [];
    this.state.status = sanitizeText(status) || "Ready.";
    if (shouldRender) {
      this.render();
    }
  }

  setAvailableTags(tags) {
    this.state.availableTags = sortUniqueTags(tags);
  }

  mergeAvailableTags(tags) {
    this.state.availableTags = sortUniqueTags([...this.state.availableTags, ...normalizeTags(tags)]);
  }

  validateUniqueUserSwatchFields(swatch, ignoredIndex) {
    const cleanSwatch = cloneSwatch(swatch);
    const issues = [];
    this.state.userSwatches.forEach((existingSwatch, index) => {
      if (index === ignoredIndex) {
        return;
      }
      if (isSameText(existingSwatch.name, cleanSwatch.name)) {
        issues.push(`Duplicate user swatch name: ${cleanSwatch.name}.`);
      }
      if (getRgbHexKey(existingSwatch.hex) === getRgbHexKey(cleanSwatch.hex)) {
        issues.push(`Duplicate user swatch RGB/hex: ${getRgbHexKey(cleanSwatch.hex)}.`);
      }
      if (isSameText(existingSwatch.symbol, cleanSwatch.symbol)) {
        issues.push(`Duplicate user swatch symbol: ${cleanSwatch.symbol}.`);
      }
    });
    return Array.from(new Set(issues));
  }

  clearEditorForm(status) {
    this.state.selectedUserIndex = -1;
    this.editorControl.clearForm();
    this.setActionState([], status || "Ready.");
  }

  selectUserSwatch(index) {
    const swatch = this.state.userSwatches[index];
    if (!swatch) {
      return;
    }
    this.state.selectedUserIndex = index;
    this.editorControl.showSwatch(swatch);
    if (isUserDefinedSwatch(swatch)) {
      this.editorControl.showUserDefinedSwatch(swatch);
    } else {
      this.editorControl.clearUserDefinedSwatch();
    }
    this.render();
  }

  browseSourceSwatch(swatch) {
    this.state.selectedUserIndex = -1;
    this.editorControl.showSwatch(swatch);
    this.editorControl.clearUserDefinedSwatch();
    this.render();
  }

  addUserSwatch(swatch) {
    const cleanSwatch = cloneSwatch({ ...swatch, source: USER_ADDED_SOURCE });
    const errors = [
      ...this.validator.validateSwatch(cleanSwatch, "new swatch"),
      ...this.validateUniqueUserSwatchFields(cleanSwatch, -1)
    ];
    if (errors.length > 0) {
      this.setActionState(errors, "User swatch was not added.");
      return;
    }

    this.state.userSwatches.push(cleanSwatch);
    this.state.selectedUserIndex = this.state.userSwatches.length - 1;
    this.mergeAvailableTags(cleanSwatch.tags);
    this.editorControl.showSwatch(cleanSwatch);
    this.editorControl.showUserDefinedSwatch(cleanSwatch);
    this.setActionState([], `Added ${cleanSwatch.name}.`);
  }

  updateSelectedSwatch(swatch) {
    if (this.state.selectedUserIndex < 0 || this.state.selectedUserIndex >= this.state.userSwatches.length) {
      this.setActionState(["Select a user swatch before updating."], "No user swatch selected.");
      return;
    }

    const existingSwatch = this.state.userSwatches[this.state.selectedUserIndex];
    if (!isUserDefinedSwatch(existingSwatch)) {
      this.setActionState(["Only User Added swatches can be updated in Add."], "Selected swatch was not updated.");
      return;
    }

    const cleanSwatch = cloneSwatch({
      ...swatch,
      source: existingSwatch.source,
      tags: existingSwatch.tags
    });
    const errors = [
      ...this.validator.validateSwatch(cleanSwatch, "selected swatch"),
      ...this.validateUniqueUserSwatchFields(cleanSwatch, this.state.selectedUserIndex)
    ];
    if (errors.length > 0) {
      this.setActionState(errors, "Selected swatch was not updated.");
      return;
    }

    this.state.userSwatches[this.state.selectedUserIndex] = cleanSwatch;
    this.mergeAvailableTags(cleanSwatch.tags);
    this.editorControl.showSwatch(cleanSwatch);
    if (isUserDefinedSwatch(cleanSwatch)) {
      this.editorControl.showUserDefinedSwatch(cleanSwatch);
    } else {
      this.editorControl.clearUserDefinedSwatch();
    }
    this.setActionState([], `Updated ${cleanSwatch.name}.`);
  }

  addTagToSelectedSwatch(tag) {
    if (this.state.selectedUserIndex < 0 || this.state.selectedUserIndex >= this.state.userSwatches.length) {
      this.setActionState(["Select a user swatch before adding a tag."], "No user swatch selected.");
      return false;
    }

    const cleanTag = sanitizeText(tag);
    if (!cleanTag) {
      return false;
    }

    const existingTags = normalizeTags(this.state.userSwatches[this.state.selectedUserIndex].tags);
    if (existingTags.some((existingTag) => existingTag.toLowerCase() === cleanTag.toLowerCase())) {
      this.mergeAvailableTags([cleanTag]);
      this.setActionState([], `${cleanTag} is already on ${this.state.userSwatches[this.state.selectedUserIndex].name}.`);
      return false;
    }
    const cleanSwatch = cloneSwatch({
      ...this.state.userSwatches[this.state.selectedUserIndex],
      tags: [...existingTags, cleanTag]
    });
    const errors = this.validator.validateSwatch(cleanSwatch, "selected swatch");
    if (errors.length > 0) {
      this.setActionState(errors, "Selected swatch tag was not added.");
      return false;
    }

    this.state.userSwatches[this.state.selectedUserIndex] = cleanSwatch;
    this.mergeAvailableTags([cleanTag]);
    this.editorControl.showSwatch(cleanSwatch);
    if (isUserDefinedSwatch(cleanSwatch)) {
      this.editorControl.showUserDefinedSwatch(cleanSwatch);
    } else {
      this.editorControl.clearUserDefinedSwatch();
    }
    this.setActionState([], `Added ${cleanTag} to ${cleanSwatch.name}.`);
    return true;
  }

  removeTagFromSelectedSwatch(tag) {
    if (this.state.selectedUserIndex < 0 || this.state.selectedUserIndex >= this.state.userSwatches.length) {
      this.setActionState(["Select a user swatch before removing a tag."], "No user swatch selected.");
      return false;
    }

    const cleanTag = sanitizeText(tag);
    if (!cleanTag) {
      return false;
    }

    const existingTags = normalizeTags(this.state.userSwatches[this.state.selectedUserIndex].tags);
    const nextTags = existingTags.filter((existingTag) => existingTag.toLowerCase() !== cleanTag.toLowerCase());
    if (nextTags.length === existingTags.length) {
      this.setActionState([], `${cleanTag} is not on ${this.state.userSwatches[this.state.selectedUserIndex].name}.`);
      return false;
    }

    const cleanSwatch = cloneSwatch({
      ...this.state.userSwatches[this.state.selectedUserIndex],
      tags: nextTags
    });
    const errors = this.validator.validateSwatch(cleanSwatch, "selected swatch");
    if (errors.length > 0) {
      this.setActionState(errors, "Selected swatch tag was not removed.");
      return false;
    }

    this.state.userSwatches[this.state.selectedUserIndex] = cleanSwatch;
    this.editorControl.showSwatch(cleanSwatch);
    if (isUserDefinedSwatch(cleanSwatch)) {
      this.editorControl.showUserDefinedSwatch(cleanSwatch);
    } else {
      this.editorControl.clearUserDefinedSwatch();
    }
    this.setActionState([], `Removed ${cleanTag} from ${cleanSwatch.name}.`);
    return true;
  }

  toggleTagOnSelectedSwatch(tag) {
    const selectedSwatch = this.getSelectedSwatch();
    if (!selectedSwatch) {
      this.setActionState(["Select a user swatch before toggling a tag."], "No user swatch selected.");
      return false;
    }

    const cleanTag = sanitizeText(tag);
    if (normalizeTags(selectedSwatch.tags).some((existingTag) => existingTag.toLowerCase() === cleanTag.toLowerCase())) {
      return this.removeTagFromSelectedSwatch(cleanTag);
    }
    return this.addTagToSelectedSwatch(cleanTag);
  }

  removeSelectedSwatch() {
    if (this.state.selectedUserIndex < 0 || this.state.selectedUserIndex >= this.state.userSwatches.length) {
      this.setActionState(["Select a user swatch before removing."], "No user swatch selected.");
      return false;
    }
    return this.removeUserSwatch(this.state.selectedUserIndex);
  }

  removeUserSwatch(index) {
    const swatch = this.state.userSwatches[index];
    if (!swatch) {
      return false;
    }

    if (this.isSwatchUsedByTool(swatch)) {
      this.setActionState([`${swatch.name} is used by another tool and cannot be removed.`], "Pinned swatch removal blocked.");
      return false;
    }

    this.state.userSwatches.splice(index, 1);
    if (this.state.selectedUserIndex === index) {
      this.state.selectedUserIndex = -1;
      this.editorControl.clearForm();
    } else if (this.state.selectedUserIndex > index) {
      this.state.selectedUserIndex -= 1;
    }
    this.setActionState([], `Removed ${swatch.name}.`);
    return true;
  }

  pinSourceSwatch(swatch, sourcePaletteId) {
    const pinnedSwatch = cloneSwatch({ ...swatch, source: sourcePaletteId });
    const errors = this.validator.validateSwatch(pinnedSwatch, "source swatch");
    if (errors.length > 0) {
      this.setActionState(errors, "Source swatch was not pinned.");
      return;
    }

    this.state.userSwatches.push(pinnedSwatch);
    this.state.selectedUserIndex = this.state.userSwatches.length - 1;
    this.mergeAvailableTags(pinnedSwatch.tags);
    this.editorControl.showSwatch(pinnedSwatch);
    this.editorControl.clearUserDefinedSwatch();
    this.setActionState([], `Pinned ${pinnedSwatch.name}.`);
  }

  findUserSwatchIndex(swatch) {
    const targetKey = swatchKey(swatch);
    return this.state.userSwatches.findIndex((entry) => swatchKey(entry) === targetKey);
  }

  rejectImport(errors) {
    this.setActionState(errors, "Import rejected.");
  }

  importPaletteDocument(documentValue) {
    const importResult = this.validator.extractImportedPaletteDocument(documentValue);
    if (importResult.errors.length > 0) {
      this.setActionState(importResult.errors, "Import rejected.");
      return;
    }

    this.state.userSwatches = importResult.swatches.map(cloneSwatch);
    this.setAvailableTags(this.state.userSwatches.flatMap((swatch) => normalizeTags(swatch.tags)));
    this.state.selectedUserIndex = -1;
    this.editorControl.clearForm();
    this.setActionState([], `Imported ${this.state.userSwatches.length} user swatches.`);
  }

  preparePaletteDocument(blockedStatus) {
    const errors = this.validator.validateUserSwatches(this.state.userSwatches);
    if (errors.length > 0) {
      this.setActionState(errors, blockedStatus);
      return false;
    }
    return true;
  }

  getPaletteValue() {
    return {
      swatches: this.state.userSwatches.map(cloneSwatch)
    };
  }

  getExportDocument() {
    return {
      tools: {
        [this.globalPaletteToolKey]: this.getPaletteValue()
      }
    };
  }

  isSwatchUsedByTool(swatch) {
    return this.usageService.isSwatchUsedByTool({
      ...cloneSwatch(swatch),
      hex: normalizeHex(swatch?.hex)
    });
  }

  getPublicApi() {
    return {
      getPaletteValue: () => this.getPaletteValue(),
      getExportDocument: () => this.getExportDocument(),
      isSwatchUsedByTool: (swatch) => this.isSwatchUsedByTool(swatch)
    };
  }
}
