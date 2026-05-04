import { PaletteEditorControl } from "../controls/PaletteEditorControl.js";
import { PaletteImportExportControl } from "../controls/PaletteImportExportControl.js";
import { PaletteValidationErrorControl } from "../controls/PaletteValidationErrorControl.js";
import { SourcePaletteBrowserControl } from "../controls/SourcePaletteBrowserControl.js";
import { UserPaletteControl } from "../controls/UserPaletteControl.js";
import { PaletteValidationService } from "./PaletteValidationService.js";
import { cloneSwatch, normalizeHex, sanitizeText, swatchKey } from "./paletteUtils.js";

const REQUIRED_REF_IDS = Object.freeze([
  "userPaletteCount",
  "userPaletteSortSelect",
  "userSwatchList",
  "sourcePaletteSelect",
  "sourceSearchInput",
  "sourcePaletteSortControls",
  "sourceSwatchList",
  "editorTitle",
  "selectedSwatchPreview",
  "swatchSymbolInput",
  "swatchHexInput",
  "swatchNameInput",
  "swatchSourceInput",
  "addSwatchButton",
  "updateSwatchButton",
  "removeSwatchButton",
  "clearFormButton",
  "importPaletteButton",
  "importPaletteInput",
  "copyPaletteButton",
  "exportPaletteButton",
  "paletteJsonPreview",
  "paletteStatus",
  "paletteErrorList"
]);

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
    this.hexColorPattern = paletteSource.HEX_COLOR_PATTERN;
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
      userSortMode: "original",
      sourceSortMode: "original",
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

  getUserSortMode() {
    return this.state.userSortMode;
  }

  getSourceSortMode() {
    return this.state.sourceSortMode;
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

  getVisibleSourceSwatches() {
    const swatches = this.sourcePalettes[this.state.sourcePaletteId] || [];
    const query = sanitizeText(this.state.sourceSearch).toLowerCase();
    if (!query) {
      return this.sortService.sortSwatches(swatches.map(cloneSwatch), this.state.sourceSortMode);
    }
    const visibleSwatches = swatches
      .filter((swatch) => {
        return swatch.name.toLowerCase().includes(query)
          || swatch.hex.toLowerCase().includes(query)
          || swatch.symbol.toLowerCase().includes(query);
      })
      .map(cloneSwatch);
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

  setActionState(errors, status, shouldRender = true) {
    this.state.errors = Array.isArray(errors) ? errors : [];
    this.state.status = sanitizeText(status) || "Ready.";
    if (shouldRender) {
      this.render();
    }
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
    this.editorControl.showSwatch(swatch, `Editing ${swatch.name}`);
    this.render();
  }

  browseSourceSwatch(swatch) {
    this.state.selectedUserIndex = -1;
    this.editorControl.showSwatch(swatch, `Browsing ${swatch.name}`);
    this.render();
  }

  addUserSwatch(swatch) {
    const cleanSwatch = cloneSwatch(swatch);
    const errors = this.validator.validateSwatch(cleanSwatch, "new swatch");
    if (errors.length > 0) {
      this.setActionState(errors, "User swatch was not added.");
      return;
    }

    this.state.userSwatches.push(cleanSwatch);
    this.state.selectedUserIndex = this.state.userSwatches.length - 1;
    this.editorControl.showSwatch(cleanSwatch, `Editing ${cleanSwatch.name}`);
    this.setActionState([], `Added ${cleanSwatch.name}.`);
  }

  updateSelectedSwatch(swatch) {
    if (this.state.selectedUserIndex < 0 || this.state.selectedUserIndex >= this.state.userSwatches.length) {
      this.setActionState(["Select a user swatch before updating."], "No user swatch selected.");
      return;
    }

    const cleanSwatch = cloneSwatch(swatch);
    const errors = this.validator.validateSwatch(cleanSwatch, "selected swatch");
    if (errors.length > 0) {
      this.setActionState(errors, "Selected swatch was not updated.");
      return;
    }

    this.state.userSwatches[this.state.selectedUserIndex] = cleanSwatch;
    this.editorControl.showSwatch(cleanSwatch, `Editing ${cleanSwatch.name}`);
    this.setActionState([], `Updated ${cleanSwatch.name}.`);
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
    this.editorControl.showSwatch(pinnedSwatch, `Editing ${pinnedSwatch.name}`);
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
