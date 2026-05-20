import { PaletteEditorControl } from "../controls/PaletteEditorControl.js";
import { PaletteHarmonyControl } from "../controls/PaletteHarmonyControl.js";
import { PaletteImportExportControl } from "../controls/PaletteImportExportControl.js";
import { PaletteValidationErrorControl } from "../controls/PaletteValidationErrorControl.js";
import { SourcePaletteBrowserControl } from "../controls/SourcePaletteBrowserControl.js";
import { UserPaletteControl } from "../controls/UserPaletteControl.js";
import { PaletteHistoryStack } from "./PaletteHistoryStack.js";
import { PaletteValidationService } from "./PaletteValidationService.js";
import {
  HARMONY_MATCH_SOURCES,
  HARMONY_SCHEMES,
  calculateHarmonyColors,
  closestPaletteMatch,
  defaultHarmonyParameterValue,
  findHarmonyMatchSource,
  findHarmonyScheme,
  nextHarmonySymbol,
  normalizeHarmonyParameter
} from "./paletteHarmonyUtils.js";
import { USER_ADDED_SOURCE, cloneSwatch, normalizeHex, normalizeTags, sanitizeText } from "./paletteUtils.js";

const USER_HEX_COLOR_PATTERN = /^#[0-9A-F]{6}(?:[0-9A-F]{2})?$/;
const PALETTE_MANAGER_V2_TOOL_KEY = "palette-manager-v2";

const REQUIRED_REF_IDS = Object.freeze([
  "undoPaletteButton",
  "redoPaletteButton",
  "userPaletteCount",
  "userPaletteSelectedCount",
  "userPaletteSortControls",
  "userSwatchSizeControls",
  "userSwatchList",
  "sourcePaletteSelect",
  "sourceSearchInput",
  "pinAllSourceButton",
  "sourcePaletteSortControls",
  "sourceSwatchSizeControls",
  "sourceSwatchList",
  "selectedSwatchPreview",
  "selectedSwatchSymbolInput",
  "selectedSwatchHexInput",
  "selectedSwatchNameInput",
  "selectedSwatchSourceInput",
  "selectedSwatchTagList",
  "harmonyMatchSourceSelect",
  "harmonySchemeSelect",
  "harmonyParameterControls",
  "harmonyColorList",
  "addSelectedHarmonyButton",
  "addAllHarmonyButton",
  "userDefinedSwatchPreview",
  "swatchSymbolInput",
  "swatchHexInput",
  "swatchNameInput",
  "availableTagList",
  "tagEntryInput",
  "tagSuggestions",
  "addTagButton",
  "clearUserPaletteSelectionButton",
  "addSwatchButton",
  "updateSwatchButton",
  "clearFormButton",
  "importPaletteButton",
  "importPaletteInput",
  "copyPaletteButton",
  "exportPaletteButton",
  "paletteJsonPreview",
  "clearValidationViewerButton",
  "paletteStatus",
  "paletteErrorList"
]);

const SWATCH_SIZE_OPTIONS = Object.freeze([
  Object.freeze({ value: "small", label: "Small" }),
  Object.freeze({ value: "medium", label: "Medium" }),
  Object.freeze({ value: "large", label: "Large" })
]);

const PALETTE_SORT_OPTIONS = Object.freeze([
  Object.freeze({ value: "hue", label: "Hue" }),
  Object.freeze({ value: "saturation", label: "Saturation" }),
  Object.freeze({ value: "brightness", label: "Brightness" }),
  Object.freeze({ value: "name", label: "Name" }),
  Object.freeze({ value: "tag", label: "Tag" })
]);

const SOURCE_PALETTE_SORT_OPTIONS = Object.freeze(
  PALETTE_SORT_OPTIONS.filter((option) => option.value !== "tag")
);

function isValidSwatchSize(swatchSize) {
  return SWATCH_SIZE_OPTIONS.some((size) => size.value === swatchSize);
}

function isValidSortKey(sortKey) {
  return PALETTE_SORT_OPTIONS.some((option) => option.value === sortKey);
}

function isValidSourceSortKey(sortKey) {
  return SOURCE_PALETTE_SORT_OPTIONS.some((option) => option.value === sortKey);
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

function formatSourcePaletteName(value) {
  const cleanValue = sanitizeText(value);
  if (!cleanValue) {
    return "";
  }
  return cleanValue.replace(/^([a-z])/, (letter) => letter.toUpperCase());
}

function formatDuplicateUserSwatchMessage(duplicateFields) {
  const parts = [];
  if (duplicateFields.symbol) {
    parts.push(`symbol: ${duplicateFields.symbol}`);
  }
  if (duplicateFields.name) {
    parts.push(`name: ${duplicateFields.name}`);
  }
  if (duplicateFields.rgbHex) {
    parts.push(`RGB/hex: ${duplicateFields.rgbHex}`);
  }
  return parts.length > 0 ? `Duplicate user swatch ${parts.join(".")}.` : "";
}

function getTagSortKey(swatch) {
  return sortUniqueTags(swatch?.tags)[0] || "";
}

function applySortDirection(entries, sortDirection) {
  return sortDirection === "descending" ? entries.slice().reverse() : entries;
}

function sortRowsByTag(rows, sortDirection) {
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
  const tagDirection = sortDirection === "descending" ? -1 : 1;
  const sortedRows = (Array.isArray(rows) ? rows : [])
    .map((row, index) => ({ row, index, tagKey: getTagSortKey(row?.swatch) }))
    .sort((left, right) => {
      if (!left.tagKey && right.tagKey) {
        return 1;
      }
      if (left.tagKey && !right.tagKey) {
        return -1;
      }
      return (collator.compare(left.tagKey, right.tagKey) * tagDirection) || left.index - right.index;
    })
    .map((entry) => entry.row);
  return sortedRows;
}

function toggleSortDirection(sortDirection) {
  return sortDirection === "ascending" ? "descending" : "ascending";
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
  constructor({ documentRef, paletteSource, sortService, usageService, workspaceSessionPersistence = null }) {
    this.document = documentRef;
    this.paletteSource = paletteSource;
    this.sortService = sortService;
    this.usageService = usageService;
    this.workspaceSessionPersistence = workspaceSessionPersistence;
    this.globalPaletteToolKey = PALETTE_MANAGER_V2_TOOL_KEY;
    this.hexColorPattern = USER_HEX_COLOR_PATTERN;
    this.sourcePalettes = paletteSource.SOURCE_PALETTES;
    this.sourcePaletteLabels = paletteSource.SOURCE_PALETTE_LABELS || {};
    this.sourcePaletteIds = Object.keys(this.sourcePalettes);
    this.refs = collectRefs(documentRef);
    this.validationViewerRevision = 0;
    this.validator = new PaletteValidationService({
      hexColorPattern: this.hexColorPattern,
      globalPaletteToolKey: this.globalPaletteToolKey
    });
    this.state = {
      userSwatches: [],
      selectedUserIndex: -1,
      selectedSwatch: null,
      sourcePaletteId: this.sourcePaletteIds[0] || "",
      sourceSearch: "",
      harmonyMatchSource: "calculated",
      harmonyScheme: "achromatic",
      harmonyParameterValue: defaultHarmonyParameterValue("achromatic"),
      selectedHarmonyColorIndex: 0,
      userSortKey: "hue",
      userSortDirection: "ascending",
      userSortHasUserChoice: false,
      sourceSortKey: "hue",
      sourceSortDirection: "ascending",
      sourceSortHasUserChoice: false,
      userSwatchSize: "large",
      sourceSwatchSize: "large",
      availableTags: [],
      errors: [],
      status: "Ready."
    };
    this.checkedUserSwatchIndexes = new Set();
    this.historyStack = new PaletteHistoryStack(this.createHistorySnapshot());
  }

  init() {
    this.editorControl = new PaletteEditorControl({
      refs: this.refs,
      app: this,
      hexColorPattern: this.hexColorPattern
    });
    this.controls = [
      this.editorControl,
      new PaletteHarmonyControl({ documentRef: this.document, refs: this.refs, app: this }),
      new UserPaletteControl({ documentRef: this.document, refs: this.refs, app: this }),
      new SourcePaletteBrowserControl({ documentRef: this.document, refs: this.refs, app: this }),
      new PaletteImportExportControl({ refs: this.refs, app: this }),
      new PaletteValidationErrorControl({ documentRef: this.document, refs: this.refs, app: this })
    ];

    this.bindHistoryControls();
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
    this.renderHistoryButtons();
  }

  bindHistoryControls() {
    this.refs.undoPaletteButton.addEventListener("click", () => {
      this.undoPaletteChange();
    });
    this.refs.redoPaletteButton.addEventListener("click", () => {
      this.redoPaletteChange();
    });
  }

  renderHistoryButtons() {
    this.refs.undoPaletteButton.disabled = !this.historyStack.canUndo();
    this.refs.redoPaletteButton.disabled = !this.historyStack.canRedo();
  }

  createHistorySnapshot() {
    return {
      userSwatches: this.state.userSwatches.map(cloneSwatch),
      selectedUserIndex: this.state.selectedUserIndex,
      selectedSwatch: this.state.selectedSwatch ? cloneSwatch(this.state.selectedSwatch) : null,
      availableTags: this.state.availableTags.slice()
    };
  }

  recordHistorySnapshot() {
    this.historyStack.record(this.createHistorySnapshot());
  }

  resetHistorySnapshot() {
    this.historyStack.reset(this.createHistorySnapshot());
  }

  restoreHistorySnapshot(snapshot, status) {
    this.state.userSwatches = snapshot.userSwatches.map(cloneSwatch);
    this.state.selectedUserIndex = Number.isInteger(snapshot.selectedUserIndex)
      && snapshot.selectedUserIndex >= 0
      && snapshot.selectedUserIndex < this.state.userSwatches.length
      ? snapshot.selectedUserIndex
      : -1;
    this.state.selectedSwatch = this.state.selectedUserIndex >= 0
      ? cloneSwatch(this.state.userSwatches[this.state.selectedUserIndex])
      : (snapshot.selectedSwatch ? cloneSwatch(snapshot.selectedSwatch) : null);
    this.setAvailableTags(snapshot.availableTags);
    this.checkedUserSwatchIndexes.clear();
    this.renderSelectedSwatchState();
    this.setActionState([], status, false);
    this.render();
    this.persistWorkspacePalette(["data.swatches"]);
  }

  renderSelectedSwatchState() {
    const selectedSwatch = this.getSelectedSwatch();
    if (!selectedSwatch) {
      this.editorControl.clearForm();
      return;
    }
    this.state.selectedSwatch = cloneSwatch(selectedSwatch);
    this.editorControl.showSwatch(selectedSwatch);
    if (isUserDefinedSwatch(selectedSwatch)) {
      this.editorControl.showUserDefinedSwatch(selectedSwatch);
    } else {
      this.editorControl.clearUserDefinedSwatch();
    }
  }

  undoPaletteChange() {
    const snapshot = this.historyStack.undo();
    if (!snapshot) {
      this.setActionState([], "No palette changes to undo.");
      return;
    }
    this.restoreHistorySnapshot(snapshot, "Undid palette change.");
  }

  redoPaletteChange() {
    const snapshot = this.historyStack.redo();
    if (!snapshot) {
      this.setActionState([], "No palette changes to redo.");
      return;
    }
    this.restoreHistorySnapshot(snapshot, "Redid palette change.");
  }

  getUserSwatches() {
    return this.state.userSwatches.map(cloneSwatch);
  }

  getVisibleUserSwatchRows() {
    const rows = this.state.userSwatches.map((swatch, index) => ({
      index,
      swatch: cloneSwatch(swatch)
    }));
    if (this.state.userSortKey === "tag") {
      return sortRowsByTag(rows, this.state.userSortDirection);
    }
    return applySortDirection(this.sortService.sortRows(rows, this.state.userSortKey), this.state.userSortDirection);
  }

  getSelectedUserIndex() {
    return this.state.selectedUserIndex;
  }

  getCheckedUserSwatchCount() {
    return this.getCheckedUserSwatchIndexes().length;
  }

  getCheckedUserSwatchIndexes() {
    const checkedIndexes = Array.from(this.checkedUserSwatchIndexes)
      .filter((index) => Number.isInteger(index) && index >= 0 && index < this.state.userSwatches.length)
      .sort((left, right) => left - right);
    this.checkedUserSwatchIndexes = new Set(checkedIndexes);
    return checkedIndexes;
  }

  isUserSwatchChecked(index) {
    return this.getCheckedUserSwatchIndexes().includes(index);
  }

  setUserSwatchChecked(index, isChecked) {
    if (!this.state.userSwatches[index]) {
      return;
    }
    if (isChecked) {
      this.checkedUserSwatchIndexes.add(index);
    } else {
      this.checkedUserSwatchIndexes.delete(index);
    }
    this.render();
  }

  clearUserSwatchChecks() {
    if (this.checkedUserSwatchIndexes.size === 0) {
      this.setActionState([], "No user palette selections to clear.");
      return;
    }
    this.checkedUserSwatchIndexes.clear();
    this.setActionState([], "Cleared user palette selections.");
  }

  shiftCheckedUserSwatchIndexesAfterRemove(removedIndex) {
    const checkedIndexes = [];
    this.checkedUserSwatchIndexes.forEach((index) => {
      if (!Number.isInteger(index) || index === removedIndex) {
        return;
      }
      const nextIndex = index > removedIndex ? index - 1 : index;
      if (nextIndex >= 0 && nextIndex < this.state.userSwatches.length) {
        checkedIndexes.push(nextIndex);
      }
    });
    this.checkedUserSwatchIndexes = new Set(checkedIndexes);
  }

  getUserSortOptions() {
    return PALETTE_SORT_OPTIONS.map((option) => ({ ...option }));
  }

  getSourceSortOptions() {
    return SOURCE_PALETTE_SORT_OPTIONS.map((option) => ({ ...option }));
  }

  getSwatchSizeOptions() {
    return SWATCH_SIZE_OPTIONS.map((size) => ({ ...size }));
  }

  getUserSortKey() {
    return this.state.userSortKey;
  }

  getUserSortDirection() {
    return this.state.userSortDirection;
  }

  getSourceSortKey() {
    return this.state.sourceSortKey;
  }

  getSourceSortDirection() {
    return this.state.sourceSortDirection;
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

  getValidationViewerRevision() {
    return this.validationViewerRevision;
  }

  getTagSuggestions() {
    return this.state.availableTags.slice();
  }

  getSelectedSwatch() {
    if (this.state.selectedUserIndex >= 0 && this.state.selectedUserIndex < this.state.userSwatches.length) {
      return cloneSwatch(this.state.userSwatches[this.state.selectedUserIndex]);
    }
    return this.state.selectedSwatch ? cloneSwatch(this.state.selectedSwatch) : null;
  }

  getHarmonyMatchSourceOptions() {
    return HARMONY_MATCH_SOURCES.map((option) => ({ ...option }));
  }

  getHarmonySchemeOptions() {
    return HARMONY_SCHEMES.map((option) => ({ ...option }));
  }

  getHarmonyMatchSource() {
    return this.state.harmonyMatchSource;
  }

  getHarmonyScheme() {
    return this.state.harmonyScheme;
  }

  getHarmonySchemeParameter() {
    const parameter = findHarmonyScheme(this.state.harmonyScheme).parameter;
    return parameter ? { ...parameter } : null;
  }

  getHarmonyParameterValue() {
    return this.state.harmonyParameterValue;
  }

  getSelectedHarmonyColorIndex() {
    return this.state.selectedHarmonyColorIndex;
  }

  setHarmonyMatchSource(matchSource) {
    this.state.harmonyMatchSource = findHarmonyMatchSource(matchSource).value;
    this.state.selectedHarmonyColorIndex = 0;
    this.render();
  }

  setHarmonyScheme(scheme) {
    const cleanScheme = findHarmonyScheme(scheme);
    this.state.harmonyScheme = cleanScheme.value;
    this.state.harmonyParameterValue = defaultHarmonyParameterValue(cleanScheme.value);
    this.state.selectedHarmonyColorIndex = 0;
    this.render();
  }

  setHarmonyParameterValue(parameterValue) {
    this.state.harmonyParameterValue = normalizeHarmonyParameter(this.state.harmonyScheme, parameterValue);
    this.state.selectedHarmonyColorIndex = 0;
    this.render();
  }

  setSelectedHarmonyColorIndex(index) {
    const colors = this.getHarmonyColors();
    const nextIndex = Number(index);
    if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= colors.length) {
      return;
    }
    this.state.selectedHarmonyColorIndex = nextIndex;
    this.render();
  }

  getCurrentSourcePaletteSwatches() {
    const sourceId = this.state.sourcePaletteId;
    const paletteName = this.getHarmonySourcePaletteName(sourceId);
    return (this.sourcePalettes[sourceId] || [])
      .map((swatch) => cloneSwatch({
        ...swatch,
        source: swatch.source || sourceId
      }))
      .map((swatch) => ({
        ...swatch,
        paletteId: sourceId,
        paletteName
      }));
  }

  getAllSourcePaletteSwatches() {
    return Object.entries(this.sourcePalettes)
      .flatMap(([sourceId, swatches]) => (Array.isArray(swatches) ? swatches : [])
        .map((swatch) => ({
          ...cloneSwatch({
            ...swatch,
            source: swatch.source || sourceId
          }),
          paletteId: sourceId,
          paletteName: this.getHarmonySourcePaletteName(sourceId)
        })));
  }

  getHarmonySourcePaletteName(sourceId) {
    return formatSourcePaletteName(this.getSourcePaletteLabel(sourceId) || sourceId);
  }

  getHarmonyColors() {
    const selectedSwatch = this.getSelectedSwatch();
    if (!selectedSwatch || !this.hexColorPattern.test(normalizeHex(selectedSwatch.hex))) {
      return [];
    }
    const calculatedColors = calculateHarmonyColors(selectedSwatch.hex, this.state.harmonyScheme, this.state.harmonyParameterValue);
    const matchSource = findHarmonyMatchSource(this.state.harmonyMatchSource).value;
    const matchPalette = matchSource === "source-palette"
      ? this.getCurrentSourcePaletteSwatches()
      : (matchSource === "all-palettes" ? this.getAllSourcePaletteSwatches() : []);
    return calculatedColors.map((color) => {
      const matchedSwatch = matchPalette.length ? closestPaletteMatch(color.hex, matchPalette) : null;
      const cleanHex = normalizeHex(matchedSwatch?.hex || color.hex).slice(0, 7);
      const schemeLabel = findHarmonyScheme(this.state.harmonyScheme).label;
      const paletteName = matchedSwatch
        ? (sanitizeText(matchedSwatch.paletteName) || this.getHarmonySourcePaletteName(matchedSwatch.paletteId || matchedSwatch.source))
        : "";
      const swatchName = sanitizeText(matchedSwatch?.name);
      const calculationLabel = sanitizeText(color.label);
      const displayName = matchedSwatch
        ? `${paletteName} - ${swatchName}`
        : `${schemeLabel} - ${calculationLabel || cleanHex}`;
      return {
        baseHex: normalizeHex(color.hex).slice(0, 7),
        hex: cleanHex,
        name: displayName,
        displayName,
        paletteName,
        swatchName,
        source: matchedSwatch?.source || findHarmonyMatchSource(this.state.harmonyMatchSource).label,
        swatch: cloneSwatch({
          symbol: "",
          hex: cleanHex,
          name: displayName,
          source: paletteName || findHarmonyMatchSource(this.state.harmonyMatchSource).label,
          tags: ["harmony"]
        })
      };
    });
  }

  getVisibleSourceSwatches() {
    const swatches = this.sourcePalettes[this.state.sourcePaletteId] || [];
    const query = sanitizeText(this.state.sourceSearch).toLowerCase();
    const toSourceSwatch = (swatch) => cloneSwatch({
      symbol: swatch.symbol,
      hex: swatch.hex,
      name: swatch.name,
      source: swatch.source || this.state.sourcePaletteId
    });
    if (!query) {
      return this.sortVisibleSourceSwatches(swatches.map(toSourceSwatch));
    }
    const visibleSwatches = swatches
      .filter((swatch) => {
        return swatch.name.toLowerCase().includes(query)
          || swatch.hex.toLowerCase().includes(query)
          || swatch.symbol.toLowerCase().includes(query);
      })
      .map(toSourceSwatch);
    return this.sortVisibleSourceSwatches(visibleSwatches);
  }

  sortVisibleSourceSwatches(swatches) {
    return applySortDirection(this.sortService.sortSwatches(swatches, this.state.sourceSortKey), this.state.sourceSortDirection);
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

  setUserSortKey(sortKey) {
    if (!isValidSortKey(sortKey)) {
      return;
    }
    if (this.state.userSortKey === sortKey && this.state.userSortHasUserChoice) {
      this.state.userSortDirection = toggleSortDirection(this.state.userSortDirection);
    } else {
      this.state.userSortKey = sortKey;
      this.state.userSortDirection = "ascending";
      this.state.userSortHasUserChoice = true;
    }
    this.render();
  }

  setSourceSortKey(sortKey) {
    if (!isValidSourceSortKey(sortKey)) {
      return;
    }
    if (this.state.sourceSortKey === sortKey && this.state.sourceSortHasUserChoice) {
      this.state.sourceSortDirection = toggleSortDirection(this.state.sourceSortDirection);
    } else {
      this.state.sourceSortKey = sortKey;
      this.state.sourceSortDirection = "ascending";
      this.state.sourceSortHasUserChoice = true;
    }
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
    this.validationViewerRevision += 1;
    if (shouldRender) {
      this.render();
    }
  }

  persistWorkspacePalette(changedKeys) {
    if (!this.workspaceSessionPersistence || typeof this.workspaceSessionPersistence.save !== "function") {
      return true;
    }
    const result = this.workspaceSessionPersistence.save(this.getPaletteValue(), changedKeys);
    if (result?.ok) {
      return true;
    }
    this.setActionState([result?.message || "Unable to update workspace palette session."], "Workspace palette session update failed.");
    return false;
  }

  setAvailableTags(tags) {
    this.state.availableTags = sortUniqueTags(tags);
  }

  mergeAvailableTags(tags) {
    this.state.availableTags = sortUniqueTags([...this.state.availableTags, ...normalizeTags(tags)]);
  }

  validateUniqueUserSwatchFields(swatch, ignoredIndex) {
    const cleanSwatch = cloneSwatch(swatch);
    const duplicateFields = {
      symbol: "",
      name: "",
      rgbHex: ""
    };
    this.state.userSwatches.forEach((existingSwatch, index) => {
      if (index === ignoredIndex) {
        return;
      }
      if (isSameText(existingSwatch.name, cleanSwatch.name)) {
        duplicateFields.name = cleanSwatch.name;
      }
      if (getRgbHexKey(existingSwatch.hex) === getRgbHexKey(cleanSwatch.hex)) {
        duplicateFields.rgbHex = getRgbHexKey(cleanSwatch.hex);
      }
      if (isSameText(existingSwatch.symbol, cleanSwatch.symbol)) {
        duplicateFields.symbol = cleanSwatch.symbol;
      }
    });
    const message = formatDuplicateUserSwatchMessage(duplicateFields);
    return message ? [message] : [];
  }

  clearEditorForm(status) {
    this.state.selectedUserIndex = -1;
    this.state.selectedSwatch = null;
    this.state.selectedHarmonyColorIndex = 0;
    this.editorControl.clearForm();
    this.setActionState([], status || "Ready.");
  }

  selectUserSwatch(index) {
    const swatch = this.state.userSwatches[index];
    if (!swatch) {
      return;
    }
    this.state.selectedUserIndex = index;
    this.state.selectedSwatch = cloneSwatch(swatch);
    this.state.selectedHarmonyColorIndex = 0;
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
    this.state.selectedSwatch = cloneSwatch(swatch);
    this.state.selectedHarmonyColorIndex = 0;
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
    this.state.selectedSwatch = cloneSwatch(cleanSwatch);
    this.state.selectedHarmonyColorIndex = 0;
    this.mergeAvailableTags(cleanSwatch.tags);
    this.editorControl.showSwatch(cleanSwatch);
    this.editorControl.showUserDefinedSwatch(cleanSwatch);
    this.recordHistorySnapshot();
    this.setActionState([], `Added ${cleanSwatch.name}.`);
    this.persistWorkspacePalette([
      "data.swatches",
      `data.swatches[${this.state.selectedUserIndex}]`
    ]);
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
    this.state.selectedSwatch = cloneSwatch(cleanSwatch);
    this.state.selectedHarmonyColorIndex = 0;
    this.mergeAvailableTags(cleanSwatch.tags);
    this.editorControl.showSwatch(cleanSwatch);
    if (isUserDefinedSwatch(cleanSwatch)) {
      this.editorControl.showUserDefinedSwatch(cleanSwatch);
    } else {
      this.editorControl.clearUserDefinedSwatch();
    }
    this.recordHistorySnapshot();
    this.setActionState([], `Updated ${cleanSwatch.name}.`);
    this.persistWorkspacePalette([
      `data.swatches[${this.state.selectedUserIndex}]`,
      `data.swatches[${this.state.selectedUserIndex}].symbol`,
      `data.swatches[${this.state.selectedUserIndex}].hex`,
      `data.swatches[${this.state.selectedUserIndex}].name`
    ]);
  }

  addTagToSelectedSwatch(tag) {
    if (this.state.selectedUserIndex < 0 || this.state.selectedUserIndex >= this.state.userSwatches.length) {
      this.setActionState(["Select a user swatch before adding a tag."], "No user swatch selected.");
      return false;
    }

    const cleanTag = normalizeTags([tag])[0] || "";
    if (!cleanTag) {
      return false;
    }

    const existingTags = normalizeTags(this.state.userSwatches[this.state.selectedUserIndex].tags);
    if (existingTags.includes(cleanTag)) {
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
    this.state.selectedSwatch = cloneSwatch(cleanSwatch);
    this.state.selectedHarmonyColorIndex = 0;
    this.mergeAvailableTags([cleanTag]);
    this.editorControl.showSwatch(cleanSwatch);
    if (isUserDefinedSwatch(cleanSwatch)) {
      this.editorControl.showUserDefinedSwatch(cleanSwatch);
    } else {
      this.editorControl.clearUserDefinedSwatch();
    }
    this.recordHistorySnapshot();
    this.setActionState([], `Added ${cleanTag} to ${cleanSwatch.name}.`);
    this.persistWorkspacePalette([`data.swatches[${this.state.selectedUserIndex}].tags`]);
    return true;
  }

  removeTagFromSelectedSwatch(tag) {
    if (this.state.selectedUserIndex < 0 || this.state.selectedUserIndex >= this.state.userSwatches.length) {
      this.setActionState(["Select a user swatch before removing a tag."], "No user swatch selected.");
      return false;
    }

    const cleanTag = normalizeTags([tag])[0] || "";
    if (!cleanTag) {
      return false;
    }

    const existingTags = normalizeTags(this.state.userSwatches[this.state.selectedUserIndex].tags);
    const nextTags = existingTags.filter((existingTag) => existingTag !== cleanTag);
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
    this.state.selectedSwatch = cloneSwatch(cleanSwatch);
    this.state.selectedHarmonyColorIndex = 0;
    this.editorControl.showSwatch(cleanSwatch);
    if (isUserDefinedSwatch(cleanSwatch)) {
      this.editorControl.showUserDefinedSwatch(cleanSwatch);
    } else {
      this.editorControl.clearUserDefinedSwatch();
    }
    this.recordHistorySnapshot();
    this.setActionState([], `Removed ${cleanTag} from ${cleanSwatch.name}.`);
    this.persistWorkspacePalette([`data.swatches[${this.state.selectedUserIndex}].tags`]);
    return true;
  }

  toggleTagOnSelectedSwatch(tag) {
    const selectedSwatch = this.getSelectedSwatch();
    if (!selectedSwatch) {
      this.setActionState(["Select a user swatch before toggling a tag."], "No user swatch selected.");
      return false;
    }

    const cleanTag = normalizeTags([tag])[0] || "";
    if (normalizeTags(selectedSwatch.tags).includes(cleanTag)) {
      return this.removeTagFromSelectedSwatch(cleanTag);
    }
    return this.addTagToSelectedSwatch(cleanTag);
  }

  addTagFromTagControl(tag) {
    if (this.getCheckedUserSwatchCount() > 0) {
      return this.addTagToCheckedUserSwatches(tag);
    }
    return this.addTagToSelectedSwatch(tag);
  }

  toggleTagFromTagControl(tag) {
    if (this.getCheckedUserSwatchCount() > 0) {
      return this.toggleTagOnCheckedUserSwatches(tag);
    }
    return this.toggleTagOnSelectedSwatch(tag);
  }

  isTagActiveForTagControl(tag, selectedTags) {
    const cleanTag = normalizeTags([tag])[0] || "";
    if (!cleanTag) {
      return false;
    }
    const checkedIndexes = this.getCheckedUserSwatchIndexes();
    if (checkedIndexes.length === 0) {
      return normalizeTags(selectedTags).includes(cleanTag);
    }
    return checkedIndexes.every((index) => {
      return normalizeTags(this.state.userSwatches[index]?.tags).includes(cleanTag);
    });
  }

  addTagToCheckedUserSwatches(tag) {
    const cleanTag = normalizeTags([tag])[0] || "";
    if (!cleanTag) {
      return false;
    }
    return this.updateCheckedUserSwatchTags(cleanTag, true);
  }

  removeTagFromCheckedUserSwatches(tag) {
    const cleanTag = normalizeTags([tag])[0] || "";
    if (!cleanTag) {
      return false;
    }
    return this.updateCheckedUserSwatchTags(cleanTag, false);
  }

  toggleTagOnCheckedUserSwatches(tag) {
    const cleanTag = normalizeTags([tag])[0] || "";
    if (!cleanTag) {
      return false;
    }
    const checkedIndexes = this.getCheckedUserSwatchIndexes();
    if (checkedIndexes.length === 0) {
      return this.toggleTagOnSelectedSwatch(cleanTag);
    }
    const everyCheckedSwatchHasTag = checkedIndexes.every((index) => {
      return normalizeTags(this.state.userSwatches[index]?.tags).includes(cleanTag);
    });
    return everyCheckedSwatchHasTag
      ? this.removeTagFromCheckedUserSwatches(cleanTag)
      : this.addTagToCheckedUserSwatches(cleanTag);
  }

  updateCheckedUserSwatchTags(tag, shouldAddTag) {
    const checkedIndexes = this.getCheckedUserSwatchIndexes();
    if (checkedIndexes.length === 0) {
      return shouldAddTag ? this.addTagToSelectedSwatch(tag) : this.removeTagFromSelectedSwatch(tag);
    }

    const updates = [];
    const errors = [];
    checkedIndexes.forEach((index) => {
      const swatch = this.state.userSwatches[index];
      if (!swatch) {
        return;
      }
      const existingTags = normalizeTags(swatch.tags);
      const hasTag = existingTags.includes(tag);
      if ((shouldAddTag && hasTag) || (!shouldAddTag && !hasTag)) {
        return;
      }
      const nextTags = shouldAddTag ? [...existingTags, tag] : existingTags.filter((existingTag) => existingTag !== tag);
      const cleanSwatch = cloneSwatch({ ...swatch, tags: nextTags });
      const swatchErrors = this.validator.validateSwatch(cleanSwatch, `selected swatch ${index + 1}`);
      if (swatchErrors.length > 0) {
        errors.push(...swatchErrors);
        return;
      }
      updates.push({ index, swatch: cleanSwatch });
    });

    if (errors.length > 0) {
      this.setActionState(errors, shouldAddTag ? "Selected swatch tags were not added." : "Selected swatch tags were not removed.");
      return false;
    }
    if (updates.length === 0) {
      this.setActionState([], shouldAddTag
        ? `${tag} is already on selected swatches.`
        : `${tag} is not on selected swatches.`);
      return false;
    }

    updates.forEach((update) => {
      this.state.userSwatches[update.index] = update.swatch;
    });
    if (shouldAddTag) {
      this.mergeAvailableTags([tag]);
    }
    this.renderSelectedSwatchState();
    this.recordHistorySnapshot();
    this.setActionState([], shouldAddTag
      ? `Added ${tag} to ${updates.length} selected swatches.`
      : `Removed ${tag} from ${updates.length} selected swatches.`);
    this.persistWorkspacePalette(updates.map((update) => `data.swatches[${update.index}].tags`));
    return true;
  }

  isTagUsedByUserPalette(tag) {
    const cleanTag = normalizeTags([tag])[0] || "";
    if (!cleanTag) {
      return false;
    }
    return this.state.userSwatches.some((swatch) => {
      return normalizeTags(swatch.tags).some((existingTag) => existingTag === cleanTag);
    });
  }

  deleteAvailableTag(tag) {
    const cleanTag = normalizeTags([tag])[0] || "";
    if (!cleanTag) {
      return false;
    }

    if (this.isTagUsedByUserPalette(cleanTag)) {
      this.setActionState([`Tag "${cleanTag}" is used by a User Palette swatch and cannot be deleted.`], "Tag delete blocked.");
      return false;
    }

    if (!this.state.availableTags.includes(cleanTag)) {
      return false;
    }

    this.state.availableTags = this.state.availableTags.filter((availableTag) => availableTag !== cleanTag);
    this.recordHistorySnapshot();
    this.setActionState([], `Deleted tag ${cleanTag}.`);
    return true;
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
      this.state.selectedSwatch = null;
      this.state.selectedHarmonyColorIndex = 0;
      this.editorControl.clearForm();
    } else if (this.state.selectedUserIndex > index) {
      this.state.selectedUserIndex -= 1;
      this.state.selectedSwatch = cloneSwatch(this.state.userSwatches[this.state.selectedUserIndex]);
    }
    this.shiftCheckedUserSwatchIndexesAfterRemove(index);
    this.recordHistorySnapshot();
    this.setActionState([], `Removed ${swatch.name}.`);
    this.persistWorkspacePalette([
      "data.swatches",
      `data.swatches[${index}]`
    ]);
    return true;
  }

  pinSourceSwatch(swatch, sourcePaletteId) {
    const pinnedSwatch = cloneSwatch({
      symbol: swatch.symbol,
      hex: swatch.hex,
      name: swatch.name,
      source: sourcePaletteId
    });
    const errors = [
      ...this.validator.validateSwatch(pinnedSwatch, "source swatch"),
      ...this.validateUniqueUserSwatchFields(pinnedSwatch, -1)
    ];
    if (errors.length > 0) {
      this.setActionState(errors, "Source swatch was not pinned.");
      return;
    }

    this.state.userSwatches.push(pinnedSwatch);
    this.state.selectedUserIndex = this.state.userSwatches.length - 1;
    this.state.selectedSwatch = cloneSwatch(pinnedSwatch);
    this.state.selectedHarmonyColorIndex = 0;
    this.mergeAvailableTags(pinnedSwatch.tags);
    this.editorControl.showSwatch(pinnedSwatch);
    this.editorControl.clearUserDefinedSwatch();
    this.recordHistorySnapshot();
    this.setActionState([], `Pinned ${pinnedSwatch.name}.`);
    this.persistWorkspacePalette([
      "data.swatches",
      `data.swatches[${this.state.selectedUserIndex}]`
    ]);
  }

  pinVisibleSourceSwatches() {
    const visibleSwatches = this.getVisibleSourceSwatches();
    let pinnedCount = 0;
    let skippedCount = 0;
    let lastPinnedIndex = -1;
    const skipReasons = [];

    visibleSwatches.forEach((swatch) => {
      const pinnedSwatch = cloneSwatch({
        symbol: swatch.symbol,
        hex: swatch.hex,
        name: swatch.name,
        source: this.state.sourcePaletteId
      });
      const errors = [
        ...this.validator.validateSwatch(pinnedSwatch, "source swatch"),
        ...this.validateUniqueUserSwatchFields(pinnedSwatch, -1)
      ];
      if (errors.length > 0) {
        skippedCount += 1;
        skipReasons.push(...errors);
        return;
      }

      this.state.userSwatches.push(pinnedSwatch);
      pinnedCount += 1;
      lastPinnedIndex = this.state.userSwatches.length - 1;
    });

    if (lastPinnedIndex >= 0) {
      this.state.selectedUserIndex = lastPinnedIndex;
      this.state.selectedSwatch = cloneSwatch(this.state.userSwatches[lastPinnedIndex]);
      this.state.selectedHarmonyColorIndex = 0;
      this.editorControl.showSwatch(this.state.userSwatches[lastPinnedIndex]);
      this.editorControl.clearUserDefinedSwatch();
    }
    if (pinnedCount > 0) {
      this.recordHistorySnapshot();
    }

    const status = `Pinned ${pinnedCount} source swatches. Skipped ${skippedCount} duplicate or invalid swatches.`;
    this.setActionState(Array.from(new Set(skipReasons)), status);
    if (pinnedCount > 0) {
      this.persistWorkspacePalette(["data.swatches"]);
    }
  }

  getUniqueHarmonyName(baseName) {
    const cleanBaseName = sanitizeText(baseName) || "Harmony Color";
    const existingNames = new Set(this.state.userSwatches.map((swatch) => sanitizeText(swatch.name).toLowerCase()));
    if (!existingNames.has(cleanBaseName.toLowerCase())) {
      return cleanBaseName;
    }
    for (let index = 2; index < 1000; index += 1) {
      const nextName = `${cleanBaseName} ${index}`;
      if (!existingNames.has(nextName.toLowerCase())) {
        return nextName;
      }
    }
    return `${cleanBaseName} ${this.state.userSwatches.length + 1}`;
  }

  harmonyColorToSwatch(color) {
    return cloneSwatch({
      symbol: nextHarmonySymbol(this.state.userSwatches),
      hex: normalizeHex(color?.hex).slice(0, 7),
      name: this.getUniqueHarmonyName(color?.name),
      source: sanitizeText(color?.source) || "Harmony",
      tags: ["harmony"]
    });
  }

  addHarmonyColor(color, label) {
    const cleanSwatch = this.harmonyColorToSwatch(color);
    if (!cleanSwatch.hex || this.state.userSwatches.some((swatch) => getRgbHexKey(swatch.hex) === getRgbHexKey(cleanSwatch.hex))) {
      return { added: false, message: `${label} ${cleanSwatch.hex || "(empty hex)"} already exists in the active palette.` };
    }
    const errors = this.validator.validateSwatch(cleanSwatch, label);
    if (errors.length > 0) {
      return { added: false, errors };
    }
    this.state.userSwatches.push(cleanSwatch);
    this.state.selectedUserIndex = this.state.userSwatches.length - 1;
    this.state.selectedSwatch = cloneSwatch(cleanSwatch);
    this.state.selectedHarmonyColorIndex = 0;
    this.mergeAvailableTags(cleanSwatch.tags);
    return { added: true, swatch: cleanSwatch };
  }

  addSelectedHarmonyColor() {
    const colors = this.getHarmonyColors();
    if (colors.length === 0) {
      this.setActionState(["Select a swatch before adding a harmony color."], "FAIL Harmony color was not added.");
      return;
    }
    const color = colors[this.state.selectedHarmonyColorIndex] || colors[0];
    const result = this.addHarmonyColor(color, "selected harmony color");
    if (result.errors?.length) {
      this.setActionState(result.errors, "FAIL Harmony color was not added.");
      return;
    }
    if (!result.added) {
      this.setActionState([result.message], "WARN Harmony color already exists.");
      return;
    }
    this.editorControl.showSwatch(result.swatch);
    this.editorControl.showUserDefinedSwatch(result.swatch);
    this.recordHistorySnapshot();
    this.setActionState([], `OK Added selected harmony color ${result.swatch.name}.`);
    this.persistWorkspacePalette([
      "data.swatches",
      `data.swatches[${this.state.selectedUserIndex}]`
    ]);
  }

  addAllHarmonyColors() {
    const colors = this.getHarmonyColors();
    if (colors.length === 0) {
      this.setActionState(["Select a swatch before adding harmony colors."], "FAIL Harmony colors were not added.");
      return;
    }
    const errors = [];
    const skipped = [];
    let addedCount = 0;
    colors.forEach((color, index) => {
      const result = this.addHarmonyColor(color, `harmony color ${index + 1}`);
      if (result.errors?.length) {
        errors.push(...result.errors);
      } else if (!result.added) {
        skipped.push(result.message);
      } else {
        addedCount += 1;
      }
    });
    if (addedCount > 0) {
      const selectedSwatch = this.state.userSwatches[this.state.selectedUserIndex];
      this.editorControl.showSwatch(selectedSwatch);
      this.editorControl.showUserDefinedSwatch(selectedSwatch);
      this.recordHistorySnapshot();
      this.persistWorkspacePalette(["data.swatches"]);
    }
    const status = addedCount > 0
      ? `OK Added ${addedCount} harmony colors. Skipped ${skipped.length} duplicates.`
      : `WARN No harmony colors added. Skipped ${skipped.length} duplicates.`;
    this.setActionState(Array.from(new Set([...errors, ...skipped])), status);
  }

  findDuplicateUserSwatchIndex(swatch) {
    const cleanSwatch = cloneSwatch(swatch);
    return this.state.userSwatches.findIndex((existingSwatch) => {
      return isSameText(existingSwatch.name, cleanSwatch.name)
        || getRgbHexKey(existingSwatch.hex) === getRgbHexKey(cleanSwatch.hex)
        || isSameText(existingSwatch.symbol, cleanSwatch.symbol);
    });
  }

  rejectImport(errors, status = "Import rejected.") {
    this.setActionState(errors, status);
  }

  importPaletteDocument(documentValue, options = {}) {
    const importResult = this.validator.extractImportedPaletteDocument(documentValue);
    if (importResult.errors.length > 0) {
      this.setActionState(importResult.errors, sanitizeText(options.failureStatus) || "Import rejected.");
      return false;
    }

    this.state.userSwatches = importResult.swatches.map(cloneSwatch);
    this.setAvailableTags(this.state.userSwatches.flatMap((swatch) => normalizeTags(swatch.tags)));
    this.state.selectedUserIndex = -1;
    this.state.selectedSwatch = null;
    this.state.selectedHarmonyColorIndex = 0;
    this.checkedUserSwatchIndexes.clear();
    this.editorControl.clearForm();
    this.resetHistorySnapshot();
    this.setActionState([], sanitizeText(options.successStatus) || `Imported ${this.state.userSwatches.length} user swatches.`);
    if (options.persistWorkspaceSession !== false) {
      this.persistWorkspacePalette(["data.swatches"]);
    }
    return true;
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
