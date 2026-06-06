import {
  PALETTE_SOURCE_USER,
  PALETTE_TOOL_KEY,
  PALETTE_WORKSPACE_PATH,
  createProjectWorkspacePaletteRepository,
  validatePaletteSwatchInput
} from "./palette-workspace-repository.js";

const params = new URLSearchParams(window.location.search);

function sourceRepositoryOptions() {
  if (params.get("source") === "empty") {
    return { tables: { palette_source_swatches: [] } };
  }
  if (params.get("source") === "invalid") {
    return {
      tables: {
        palette_source_swatches: [
          { id: "invalid-source-row", source: "broken-source", symbol: "AB", hex: "not-a-hex", name: "", tags: ["diagnostic"] }
        ]
      }
    };
  }
  return {};
}

const repository = createProjectWorkspacePaletteRepository(sourceRepositoryOptions());

const SORT_OPTIONS = Object.freeze([
  { key: "hue", label: "Hue" },
  { key: "saturation", label: "Sat" },
  { key: "brightness", label: "Brit" },
  { key: "name", label: "Name" },
  { key: "tag", label: "Tag" }
]);

const SIZE_OPTIONS = Object.freeze([
  { key: "small", label: "Small" },
  { key: "medium", label: "Medium" },
  { key: "large", label: "Large" }
]);

let editorIssues = [];
let editorTags = [];
let harmonyRows = [];
let selectedSourceSwatch = null;
let sourceSwatchRows = [];
const sourceSortState = { direction: "asc", key: "name" };
let sourceSizeState = "medium";
const userSortState = { direction: "asc", key: "name" };
let userSizeState = "medium";

const elements = {
  activeProject: document.querySelector("[data-palette-active-project]"),
  add: document.querySelector("[data-palette-add]"),
  clear: document.querySelector("[data-palette-clear]"),
  count: document.querySelector("[data-palette-count]"),
  editorDiagnostic: document.querySelector("[data-palette-editor-diagnostic]"),
  form: document.querySelector("[data-palette-user-swatch-form]"),
  harmonyAddAll: document.querySelector("[data-palette-harmony-add-all]"),
  harmonyGuidance: document.querySelector("[data-palette-harmony-guidance]"),
  harmonyList: document.querySelector("[data-palette-harmony-list]"),
  harmonyMatch: document.querySelector("[data-palette-harmony-match]"),
  harmonyScheme: document.querySelector("[data-palette-harmony-scheme]"),
  hex: document.querySelector("[data-palette-hex]"),
  log: document.querySelector("[data-palette-log]"),
  name: document.querySelector("[data-palette-name]"),
  projectDiagnostic: document.querySelector("[data-palette-project-diagnostic]"),
  projectOverlay: document.querySelector("[data-palette-project-overlay]"),
  redo: document.querySelector("[data-palette-redo]"),
  selectedSummary: document.querySelector("[data-palette-selected-summary]"),
  selectedHex: document.querySelector("[data-palette-selected-hex]"),
  selectedName: document.querySelector("[data-palette-selected-name]"),
  selectedSymbol: document.querySelector("[data-palette-selected-symbol]"),
  sourceList: document.querySelector("[data-palette-source-list]"),
  sourcePinAll: document.querySelector("[data-palette-source-pin-all]"),
  sourceSearch: document.querySelector("[data-palette-source-search]"),
  sourceSelect: document.querySelector("[data-palette-source-select]"),
  sourceSize: document.querySelector("[data-palette-source-size]"),
  sourceSort: document.querySelector("[data-palette-source-sort]"),
  storagePath: document.querySelector("[data-palette-storage-path]"),
  symbol: document.querySelector("[data-palette-symbol]"),
  tableCounts: document.querySelector("[data-palette-table-counts]"),
  tags: document.querySelector("[data-palette-tags]"),
  tagSuggestions: document.querySelector("[data-palette-tag-suggestions]"),
  editorTagsList: document.querySelector("[data-palette-editor-tags-list]"),
  tagsList: document.querySelector("[data-palette-tags-list]"),
  undo: document.querySelector("[data-palette-undo]"),
  update: document.querySelector("[data-palette-update]"),
  userSwatchDiagnostic: document.querySelector("[data-palette-user-swatch-diagnostic]"),
  userList: document.querySelector("[data-palette-user-list]"),
  userSize: document.querySelector("[data-palette-user-size]"),
  userSort: document.querySelector("[data-palette-user-sort]"),
  validationList: document.querySelector("[data-palette-validation-list]"),
  validationOverlay: document.querySelector("[data-palette-validation-overlay]"),
  validationStatus: document.querySelector("[data-palette-validation-status]")
};

function setText(target, value) {
  if (target && typeof target.forEach === "function" && !target.nodeType) {
    target.forEach((item) => setText(item, value));
    return;
  }

  if (target) {
    target.textContent = value;
  }
}

function setHidden(target, hidden) {
  if (target) {
    target.hidden = hidden;
  }
}

function setDisabled(target, disabled) {
  if (target && typeof target.forEach === "function" && !target.nodeType) {
    target.forEach((item) => setDisabled(item, disabled));
    return;
  }

  if (target) {
    target.disabled = disabled;
  }
}

function createCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function createHeaderCell(text) {
  const cell = document.createElement("th");
  cell.scope = "row";
  cell.textContent = text;
  return cell;
}

function createListItem(text) {
  const item = document.createElement("li");
  item.textContent = text;
  return item;
}

function createStatusMessage(text) {
  const message = document.createElement("p");
  message.className = "status";
  message.textContent = text;
  return message;
}

function sortDirectionCaret(direction) {
  return direction === "desc" ? "v" : "^";
}

function renderSortButtons(container, state, label) {
  if (!container) {
    return;
  }
  container.replaceChildren();
  SORT_OPTIONS.forEach((option) => {
    const button = document.createElement("button");
    const active = state.key === option.key;
    button.className = active ? "btn btn--compact primary" : "btn btn--compact";
    button.type = "button";
    button.dataset.paletteSortKey = option.key;
    button.textContent = active ? `${option.label} ${sortDirectionCaret(state.direction)}` : option.label;
    button.setAttribute("aria-label", `${label} sort ${option.label}${active ? ` ${state.direction}` : ""}`);
    button.setAttribute("aria-pressed", String(active));
    container.append(button);
  });
}

function renderSizeButtons(container, activeSize, label) {
  if (!container) {
    return;
  }
  container.replaceChildren();
  SIZE_OPTIONS.forEach((option) => {
    const button = document.createElement("button");
    const active = activeSize === option.key;
    button.className = active ? "btn btn--compact primary" : "btn btn--compact";
    button.type = "button";
    button.dataset.paletteSizeKey = option.key;
    button.textContent = option.label;
    button.setAttribute("aria-label", `${label} size ${option.label}`);
    button.setAttribute("aria-pressed", String(active));
    container.append(button);
  });
}

function normalizeSwatchPreviewSize(size) {
  return ["small", "medium", "large"].includes(size) ? size : "medium";
}

function createColorPreview(hex, size = "medium") {
  const input = document.createElement("input");
  input.type = "color";
  input.disabled = true;
  input.value = hex.slice(0, 7);
  input.dataset.paletteSwatchPreview = "";
  input.dataset.paletteSwatchSize = normalizeSwatchPreviewSize(size);
  input.setAttribute("aria-label", `${hex} color preview`);
  return input;
}

function createPinIndicator(pinned) {
  const indicator = document.createElement("span");
  indicator.className = "palette-swatch-pin";
  indicator.dataset.palettePinIndicator = "";
  indicator.setAttribute("aria-hidden", "true");
  return indicator;
}

function swatchTileLabel(swatch, action) {
  return `${action} ${swatch.name}`;
}

function swatchTooltipText(swatch) {
  return [
    `Symbol: ${swatch.symbol}`,
    `Hex: ${swatch.hex}`,
    `Name: ${swatch.name}`,
    `Tags: ${swatch.tags.length ? swatch.tags.join(", ") : "None"}`
  ].join("\n");
}

function createSwatchTile(swatch, options = {}) {
  const tile = document.createElement("button");
  const pinned = Boolean(options.pinned);
  const selected = Boolean(options.selected);
  tile.className = "palette-swatch-tile";
  tile.type = "button";
  tile.dataset.palettePinned = String(pinned);
  tile.dataset.paletteSelected = String(selected);
  tile.dataset.paletteSwatchHex = swatch.hex;
  tile.dataset.paletteSwatchName = swatch.name;
  tile.dataset.paletteSwatchSource = repository.displaySource(swatch.source);
  tile.dataset.paletteSwatchTags = swatch.tags.join(", ");
  tile.setAttribute("aria-label", options.label || `${selected ? "Selected. " : ""}${swatchTileLabel(swatch, options.action || "Select palette color")}`);
  tile.setAttribute("aria-pressed", String(Boolean(options.pressed)));
  tile.title = options.tooltip || swatchTooltipText(swatch);
  if (selected) {
    tile.setAttribute("aria-current", "true");
  }

  if (options.swatchRow) {
    tile.dataset.paletteSwatchRow = swatch.symbol;
  }
  if (Number.isInteger(options.sourceIndex)) {
    tile.dataset.paletteSourceIndex = String(options.sourceIndex);
  }
  if (Number.isInteger(options.harmonyIndex)) {
    tile.dataset.paletteHarmonyChoice = String(options.harmonyIndex);
  }

  tile.append(createColorPreview(swatch.hex, options.size || "medium"));
  if (options.showPin !== false) {
    tile.append(createPinIndicator(pinned));
  }
  return tile;
}

function normalizeTag(value) {
  return String(value || "").trim().toLowerCase();
}

function readUserSwatchForm() {
  return {
    hex: elements.hex?.value,
    name: elements.name?.value,
    symbol: elements.symbol?.value
  };
}

function fillUserSwatchForm(swatch) {
  if (elements.symbol) elements.symbol.value = swatch?.symbol || "";
  if (elements.hex) elements.hex.value = swatch?.hex || "";
  if (elements.name) elements.name.value = swatch?.name || "";
}

function isUserDefinedSwatch(swatch) {
  return swatch?.source === PALETTE_SOURCE_USER;
}

function selectedUserDefinedSwatch(snapshot) {
  return isUserDefinedSwatch(snapshot?.selectedSwatch) ? snapshot.selectedSwatch : null;
}

function clearUserSwatchForm() {
  fillUserSwatchForm(null);
  editorIssues = [];
  setText(elements.userSwatchDiagnostic, "User defined swatch form cleared.");
  setText(elements.log, "User defined swatch form cleared.");
  render();
}

function userDefinedControls() {
  return [
    elements.add,
    elements.clear,
    elements.hex,
    elements.name,
    elements.symbol,
    elements.update
  ].filter(Boolean);
}

function selectedTagControls() {
  return [
    elements.tags
  ].filter(Boolean);
}

function activeTags() {
  try {
    return [...new Set(repository.getSnapshot().swatches.flatMap((swatch) => swatch.tags))].sort((left, right) => left.localeCompare(right));
  } catch {
    return [];
  }
}

function renderEditorTags() {
  if (!elements.editorTagsList) {
    return;
  }
  elements.editorTagsList.replaceChildren();
  if (!editorTags.length) {
    elements.editorTagsList.append(createStatusMessage("No tags added."));
    return;
  }
  editorTags.forEach((tag) => {
    const button = document.createElement("button");
    button.className = "btn btn--compact";
    button.type = "button";
    button.dataset.paletteTagValue = tag;
    button.textContent = tag;
    button.setAttribute("aria-label", `Remove tag ${tag}`);
    elements.editorTagsList.append(button);
  });
}

function renderTagSuggestions() {
  if (!elements.tagSuggestions) {
    return;
  }
  const query = normalizeTag(elements.tags?.value);
  elements.tagSuggestions.replaceChildren();
  activeTags()
    .filter((tag) => query && tag.includes(query) && !editorTags.includes(tag))
    .forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag;
      elements.tagSuggestions.append(option);
    });
}

function acceptTagFromInput() {
  const tag = normalizeTag(elements.tags?.value);
  if (!tag) {
    return;
  }
  const snapshot = repository.getSnapshot();
  if (!snapshot.selectedSwatch) {
    editorIssues = [{
      action: "Select a Palette Colors swatch before adding tags.",
      field: "tags",
      label: "Tags"
    }];
    render();
    return;
  }
  const result = repository.updateSelectedSwatchTags([...editorTags, tag]);
  if (elements.tags) {
    elements.tags.value = "";
  }
  applyResult(result);
}

function renderSourceOptions(snapshot) {
  if (!elements.sourceSelect) {
    return;
  }

  const currentSource = elements.sourceSelect.value;
  elements.sourceSelect.replaceChildren();
  if (!snapshot.sourcePaletteOptions.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = snapshot.sourcePaletteRecordCount ? "Source palettes unavailable" : "No source palette";
    elements.sourceSelect.append(option);
    elements.sourceSelect.value = "";
    elements.sourceSelect.disabled = true;
    return;
  }

  elements.sourceSelect.disabled = false;
  snapshot.sourcePaletteOptions.forEach((source) => {
    const option = document.createElement("option");
    option.value = source.id;
    option.textContent = `${source.label} (${source.swatchCount})`;
    elements.sourceSelect.append(option);
  });
  if (currentSource && snapshot.sourcePaletteOptions.some((source) => source.id === currentSource)) {
    elements.sourceSelect.value = currentSource;
  }
}

function renderPaletteControls() {
  renderSortButtons(elements.userSort, userSortState, "Active project palette");
  renderSizeButtons(elements.userSize, userSizeState, "Active project palette");
  renderSortButtons(elements.sourceSort, sourceSortState, "Source swatches");
  renderSizeButtons(elements.sourceSize, sourceSizeState, "Source swatches");
}

function renderProject(snapshot) {
  const activeProject = snapshot.activeProject;
  const selectedSwatch = snapshot.selectedSwatch;
  const userSwatch = selectedUserDefinedSwatch(snapshot);
  const userDefinedLocked = snapshot.projectRequired || snapshot.validation.status === "Reject";
  setText(
    elements.activeProject,
    activeProject ? `${activeProject.name} - ${activeProject.purpose}` : "No active project."
  );
  setText(
    elements.projectDiagnostic,
    activeProject ? `Palette edits save live to ${PALETTE_WORKSPACE_PATH}.` : "Active project required."
  );
  setHidden(elements.projectOverlay, !snapshot.projectRequired);
  if (selectedSwatch && !userSwatch) {
    fillUserSwatchForm(null);
  }
  setDisabled(userDefinedControls(), userDefinedLocked);
  setDisabled(elements.update, userDefinedLocked || !userSwatch);
  setText(
    elements.userSwatchDiagnostic,
    userSwatch ? `Editing base values for ${userSwatch.name}.` : selectedSwatch ? "Ready for a new user-defined swatch." : "Ready for a user-defined swatch."
  );
}

function renderSelectedSwatchEditor(snapshot) {
  const selectedSwatch = snapshot.selectedSwatch;
  if (elements.selectedSymbol) elements.selectedSymbol.value = selectedSwatch?.symbol || "";
  if (elements.selectedHex) elements.selectedHex.value = selectedSwatch?.hex || "";
  if (elements.selectedName) elements.selectedName.value = selectedSwatch?.name || "";
  if (elements.tags) elements.tags.value = "";
  editorTags = Array.isArray(selectedSwatch?.tags) ? [...selectedSwatch.tags] : [];
  setDisabled([elements.selectedSymbol, elements.selectedHex, elements.selectedName], true);
  setDisabled(selectedTagControls(), snapshot.projectRequired || snapshot.validation.status === "Reject" || !selectedSwatch);
  setText(
    elements.editorDiagnostic,
    selectedSwatch ? `Editing tags for ${selectedSwatch.name}.` : "Select a Palette Colors swatch to edit tags."
  );
}

function renderValidation(snapshot) {
  const findings = [...snapshot.validation.findings, ...editorIssues];
  if (elements.validationList) {
    elements.validationList.replaceChildren();
    findings.forEach((finding) => {
      elements.validationList.append(createListItem(`${finding.label}: ${finding.action}`));
    });
    if (!findings.length) {
      elements.validationList.append(createListItem("No validation errors."));
    }
  }
  setHidden(elements.validationOverlay, findings.length === 0);
  setText(elements.validationStatus, findings.length ? "Needs Input" : snapshot.validation.status);
  setText(elements.storagePath, snapshot.palettePath);
}

function renderUserPalette(snapshot) {
  if (!elements.userList) {
    return;
  }

  elements.userList.replaceChildren();
  const swatches = repository.listSwatches({
    sortDirection: userSortState.direction,
    sortKey: userSortState.key
  });
  if (swatches.length === 0) {
    const message = document.createElement("p");
    message.className = "status";
    message.textContent = snapshot.projectRequired
      ? "Open a project before editing palette colors."
      : "No project palette colors yet.";
    elements.userList.append(message);
    return;
  }

  swatches.forEach((swatch) => {
    elements.userList.append(createSwatchTile(swatch, {
      action: "Select palette color",
      pinned: true,
      pressed: snapshot.selectedSwatch?.symbol === swatch.symbol,
      selected: snapshot.selectedSwatch?.symbol === swatch.symbol,
      size: userSizeState,
      swatchRow: true
    }));
  });
}

function sourcePaletteDiagnostic(snapshot) {
  return snapshot.sourcePaletteRecordCount > 0 && snapshot.sourcePaletteOptions.length === 0
    ? "Source palette records exist, but the source dropdown is empty. Check palette_source_swatches mock-DB records for valid source, symbol, hex, and name fields."
    : "";
}

function renderSourceSwatches(snapshot = repository.getSnapshot()) {
  if (!elements.sourceList) {
    return;
  }

  const sourceId = elements.sourceSelect?.value;
  sourceSwatchRows = repository.listSourceSwatches({
    query: elements.sourceSearch?.value || "",
    sortDirection: sourceSortState.direction,
    sortKey: sourceSortState.key,
    sourceId
  });
  setDisabled(elements.sourcePinAll, sourceSwatchRows.length === 0 || !repository.getActiveProject());

  elements.sourceList.replaceChildren();
  if (sourceSwatchRows.length === 0) {
    const message = document.createElement("p");
    message.className = "status";
    message.textContent = sourcePaletteDiagnostic(snapshot) || (snapshot.sourcePaletteOptions.length
      ? "No source colors match the current filter."
      : "No source palette found. Add palette_source_swatches mock-DB records to browse source colors.");
    elements.sourceList.append(message);
    return;
  }

  sourceSwatchRows.forEach((swatch, index) => {
    const pinned = repository.isSourceSwatchPinned(swatch);
    elements.sourceList.append(createSwatchTile(swatch, {
      action: pinned ? "Unpin source palette color" : "Pin source palette color",
      pinned,
      pressed: pinned,
      size: sourceSizeState,
      sourceIndex: index
    }));
  });
}

function renderTags(snapshot) {
  if (!elements.tagsList) {
    return;
  }

  const tags = [...new Set(snapshot.swatches.flatMap((swatch) => swatch.tags))].sort((left, right) => left.localeCompare(right));
  elements.tagsList.replaceChildren();
  if (!tags.length) {
    elements.tagsList.append(createListItem("No tags in active palette."));
    return;
  }
  tags.forEach((tag) => elements.tagsList.append(createListItem(tag)));
}

function renderHarmony(snapshot) {
  if (!elements.harmonyList) {
    return;
  }

  elements.harmonyList.replaceChildren();
  const baseSwatch = snapshot.selectedSwatch || selectedSourceSwatch;
  const sourceId = elements.sourceSelect?.value || "";
  harmonyRows = baseSwatch
    ? repository.createHarmonySuggestions(baseSwatch, {
        matchSource: elements.harmonyMatch?.value || "calculated",
        schemeId: elements.harmonyScheme?.value || "complementary",
        sourceId
      })
    : [];

  if (!baseSwatch) {
    elements.harmonyList.append(createStatusMessage("Select a project or source palette color to view scheme suggestions."));
    setText(elements.harmonyGuidance, "Select a project or source palette color to view scheme suggestions.");
    setDisabled(elements.harmonyAddAll, true);
    return;
  }

  if (harmonyRows.length === 0) {
    elements.harmonyList.append(createStatusMessage("No harmony scheme colors available."));
    setText(elements.harmonyGuidance, "No harmony scheme colors are available for the selected palette color.");
    setDisabled(elements.harmonyAddAll, true);
    return;
  }

  setText(elements.harmonyGuidance, `Showing ${harmonyRows.length} ${elements.harmonyScheme?.selectedOptions?.[0]?.textContent || "scheme"} colors from ${elements.harmonyMatch?.selectedOptions?.[0]?.textContent || "Calculated"}.`);
  setDisabled(elements.harmonyAddAll, false);

  const schemeLabel = elements.harmonyScheme?.selectedOptions?.[0]?.textContent || "Harmony";
  harmonyRows.forEach((suggestion, index) => {
    const pinned = repository.isSourceSwatchPinned(suggestion);
    elements.harmonyList.append(createSwatchTile({
      hex: suggestion.hex,
      name: suggestion.name,
      source: suggestion.source,
      symbol: String(index + 1),
      tags: suggestion.tags
    }, {
      action: pinned ? "Remove harmony swatch" : "Add harmony swatch",
      harmonyIndex: index,
      label: `${pinned ? "Remove" : "Add"} harmony swatch ${suggestion.name} ${suggestion.hex} from ${schemeLabel}.`,
      pinned,
      pressed: pinned,
      size: "medium",
      tooltip: `Scheme: ${schemeLabel}\nLabel: ${suggestion.name}\nHex: ${suggestion.hex}`
    }));
  });
}

function renderTables(snapshot) {
  if (!elements.tableCounts) {
    return;
  }

  elements.tableCounts.replaceChildren();
  snapshot.tableCounts.forEach((count) => {
    const row = document.createElement("tr");
    row.append(createCell(count.table), createCell(String(count.rows)));
    elements.tableCounts.append(row);
  });
}

function renderSummary(snapshot) {
  setText(elements.count, String(snapshot.swatches.length));
  setText(
    elements.selectedSummary,
    snapshot.selectedSwatch ? snapshot.selectedSwatch.name : "None"
  );
  setDisabled(elements.undo, !snapshot.canUndo);
  setDisabled(elements.redo, !snapshot.canRedo);
}

function render() {
  let snapshot;
  try {
    snapshot = repository.getSnapshot({
      sortDirection: userSortState.direction,
      sortKey: userSortState.key
    });
  } catch (error) {
    editorIssues = [{
      action: error.message,
      field: "payload",
      label: "Invalid Palette Payload"
    }];
    setText(elements.log, "Invalid palette payload rejected before render.");
    return;
  }

  renderSourceOptions(snapshot);
  renderPaletteControls();
  renderProject(snapshot);
  renderSelectedSwatchEditor(snapshot);
  renderSummary(snapshot);
  renderValidation(snapshot);
  renderUserPalette(snapshot);
  renderSourceSwatches(snapshot);
  renderTags(snapshot);
  renderHarmony(snapshot);
  renderTables(snapshot);
  renderEditorTags();
  renderTagSuggestions();
}

function applyResult(result) {
  editorIssues = result.issues || [];
  if (result.snapshot) {
    fillUserSwatchForm(selectedUserDefinedSwatch(result.snapshot));
  }
  setText(elements.log, result.message);
  setText(elements.userSwatchDiagnostic, result.message);
  render();
}

function validateUserSwatch() {
  const snapshot = repository.getSnapshot();
  if (snapshot.projectRequired) {
    editorIssues = snapshot.validation.findings;
  } else {
    editorIssues = validatePaletteSwatchInput(
      readUserSwatchForm(),
      snapshot.swatches,
      { excludeSymbol: snapshot.selectedSwatch?.symbol || "" }
    ).issues;
  }
  renderValidation(snapshot);
}

function runInitialQueryState() {
  if (params.get("project") === "missing" || params.get("project") === "none") {
    repository.clearProjectData();
  }

  if (params.get("palette") === "seed") {
    applyResult(repository.seedActiveProjectPalette());
  }

  if (params.get("palette") === "invalid") {
    applyResult(repository.loadActiveProjectPalettePayload({
      tools: {
        [PALETTE_TOOL_KEY]: {
          swatches: [
            { symbol: "AB", hex: "#112233", name: "Invalid Symbol" }
          ]
        }
      }
    }));
  }
}

elements.form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = repository.addSwatch(readUserSwatchForm());
  if (result.ok) {
    fillUserSwatchForm(selectedUserDefinedSwatch(result.snapshot));
  }
  applyResult(result);
});

elements.form?.addEventListener("input", validateUserSwatch);

elements.tags?.addEventListener("input", renderTagSuggestions);

elements.tags?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") {
    return;
  }
  event.preventDefault();
  acceptTagFromInput();
});

elements.editorTagsList?.addEventListener("click", (event) => {
  const tagButton = event.target.closest("[data-palette-tag-value]");
  if (!tagButton) {
    return;
  }
  const result = repository.updateSelectedSwatchTags(
    editorTags.filter((tag) => tag !== tagButton.dataset.paletteTagValue)
  );
  applyResult(result);
});

elements.update?.addEventListener("click", () => {
  const result = repository.updateSelectedSwatch(readUserSwatchForm());
  if (result.ok) {
    fillUserSwatchForm(selectedUserDefinedSwatch(result.snapshot));
  }
  applyResult(result);
});

elements.clear?.addEventListener("click", clearUserSwatchForm);

elements.undo?.addEventListener("click", () => {
  applyResult(repository.undo());
});

elements.redo?.addEventListener("click", () => {
  applyResult(repository.redo());
});

elements.userSort?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-palette-sort-key]");
  if (!button) {
    return;
  }
  const key = button.dataset.paletteSortKey;
  userSortState.direction = userSortState.key === key && userSortState.direction === "asc" ? "desc" : "asc";
  userSortState.key = key;
  render();
});

elements.userSize?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-palette-size-key]");
  if (!button) {
    return;
  }
  userSizeState = button.dataset.paletteSizeKey;
  render();
});

elements.sourceSelect?.addEventListener("change", render);
elements.sourceSearch?.addEventListener("input", renderSourceSwatches);

elements.sourcePinAll?.addEventListener("click", () => {
  applyResult(repository.pinSourceSwatches(sourceSwatchRows));
});

elements.sourceSort?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-palette-sort-key]");
  if (!button) {
    return;
  }
  const key = button.dataset.paletteSortKey;
  sourceSortState.direction = sourceSortState.key === key && sourceSortState.direction === "asc" ? "desc" : "asc";
  sourceSortState.key = key;
  renderSourceSwatches();
  renderSortButtons(elements.sourceSort, sourceSortState, "Source swatches");
});

elements.sourceSize?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-palette-size-key]");
  if (!button) {
    return;
  }
  sourceSizeState = button.dataset.paletteSizeKey;
  renderSourceSwatches();
  renderSizeButtons(elements.sourceSize, sourceSizeState, "Source swatches");
});
elements.harmonyMatch?.addEventListener("change", render);
elements.harmonyScheme?.addEventListener("change", render);
elements.harmonyList?.addEventListener("click", (event) => {
  const tile = event.target.closest("[data-palette-harmony-choice]");
  if (!tile) {
    return;
  }
  const suggestion = harmonyRows[Number(tile.dataset.paletteHarmonyChoice)];
  if (!suggestion) {
    editorIssues = [{
      action: "Select a harmony scheme color before pinning.",
      field: "harmony",
      label: "Harmony"
    }];
    render();
    return;
  }
  applyResult(repository.toggleHarmonySuggestionPin(suggestion));
});

elements.harmonyAddAll?.addEventListener("click", () => {
  if (!harmonyRows.length) {
    editorIssues = [{
      action: "Select a project or source palette color before adding harmony colors.",
      field: "harmony",
      label: "Harmony"
    }];
    render();
    return;
  }
  applyResult(repository.addHarmonySuggestions(harmonyRows));
});

elements.userList?.addEventListener("click", (event) => {
  const tile = event.target.closest("[data-palette-swatch-row]");
  if (!tile) {
    return;
  }

  const pin = event.target.closest("[data-palette-pin-indicator]");
  if (pin) {
    const deletingSelected = tile.dataset.paletteSelected === "true";
    const result = repository.removeSwatch(tile.dataset.paletteSwatchRow);
    selectedSourceSwatch = null;
    if (deletingSelected || !result.snapshot.selectedSwatch) {
      fillUserSwatchForm(selectedUserDefinedSwatch(result.snapshot));
    }
    applyResult(result);
    return;
  }

  const snapshot = repository.selectSwatch(tile.dataset.paletteSwatchRow);
  fillUserSwatchForm(selectedUserDefinedSwatch(snapshot));
  selectedSourceSwatch = null;
  editorIssues = [];
  render();
});

elements.sourceList?.addEventListener("click", (event) => {
  const tile = event.target.closest("[data-palette-source-index]");
  if (!tile) {
    return;
  }

  const swatch = sourceSwatchRows[Number(tile.dataset.paletteSourceIndex)];
  if (swatch) {
    selectedSourceSwatch = swatch;
    applyResult(repository.toggleSourceSwatchPin(swatch));
  }
});

runInitialQueryState();
render();
