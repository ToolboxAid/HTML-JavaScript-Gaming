import "../../src/engine/paletteList.js";
import {
  PALETTE_TOOL_KEY,
  PALETTE_WORKSPACE_PATH,
  createProjectWorkspacePaletteRepository,
  validatePaletteSwatchInput
} from "./palette-workspace-repository.js";

const sourcePalettes = globalThis.paletteList?.SOURCE_PALETTES || undefined;
const sourcePaletteLabels = globalThis.paletteList?.SOURCE_PALETTE_LABELS || undefined;
const repository = createProjectWorkspacePaletteRepository({
  sourcePaletteLabels,
  sourcePalettes
});

const params = new URLSearchParams(window.location.search);
let editorIssues = [];
let sourceSwatchRows = [];

const elements = {
  activeProject: document.querySelector("[data-palette-active-project]"),
  add: document.querySelector("[data-palette-add]"),
  clear: document.querySelector("[data-palette-clear]"),
  count: document.querySelector("[data-palette-count]"),
  editorDiagnostic: document.querySelector("[data-palette-editor-diagnostic]"),
  form: document.querySelector("[data-palette-editor-form]"),
  harmonyList: document.querySelector("[data-palette-harmony-list]"),
  hex: document.querySelector("[data-palette-hex]"),
  log: document.querySelector("[data-palette-log]"),
  name: document.querySelector("[data-palette-name]"),
  projectDiagnostic: document.querySelector("[data-palette-project-diagnostic]"),
  projectOverlay: document.querySelector("[data-palette-project-overlay]"),
  redo: document.querySelector("[data-palette-redo]"),
  remove: document.querySelector("[data-palette-remove]"),
  selectedDetails: document.querySelector("[data-palette-selected-details]"),
  selectedSummary: document.querySelector("[data-palette-selected-summary]"),
  sourceList: document.querySelector("[data-palette-source-list]"),
  sourceSearch: document.querySelector("[data-palette-source-search]"),
  sourceSelect: document.querySelector("[data-palette-source-select]"),
  sourceSort: document.querySelector("[data-palette-source-sort]"),
  storagePath: document.querySelector("[data-palette-storage-path]"),
  symbol: document.querySelector("[data-palette-symbol]"),
  tableCounts: document.querySelector("[data-palette-table-counts]"),
  tags: document.querySelector("[data-palette-tags]"),
  tagsList: document.querySelector("[data-palette-tags-list]"),
  undo: document.querySelector("[data-palette-undo]"),
  update: document.querySelector("[data-palette-update]"),
  userList: document.querySelector("[data-palette-user-list]"),
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

function createColorCell(hex) {
  const cell = document.createElement("td");
  const input = document.createElement("input");
  input.type = "color";
  input.disabled = true;
  input.value = hex.slice(0, 7);
  input.setAttribute("aria-label", `${hex} color preview`);
  cell.append(input);
  return cell;
}

function createButton(label, datasetName, datasetValue) {
  const button = document.createElement("button");
  button.className = "btn";
  button.type = "button";
  button.textContent = label;
  button.dataset[datasetName] = datasetValue;
  return button;
}

function readEditorForm() {
  return {
    hex: elements.hex?.value,
    name: elements.name?.value,
    symbol: elements.symbol?.value,
    tags: elements.tags?.value
  };
}

function fillEditorForm(swatch) {
  if (elements.symbol) elements.symbol.value = swatch?.symbol || "";
  if (elements.hex) elements.hex.value = swatch?.hex || "";
  if (elements.name) elements.name.value = swatch?.name || "";
  if (elements.tags) elements.tags.value = Array.isArray(swatch?.tags) ? swatch.tags.join(", ") : "";
}

function clearEditorForm() {
  fillEditorForm(null);
  editorIssues = [];
  setText(elements.editorDiagnostic, "Editor form cleared.");
  setText(elements.log, "Editor form cleared.");
  render();
}

function allEditorControls() {
  return [
    elements.add,
    elements.clear,
    elements.hex,
    elements.name,
    elements.remove,
    elements.symbol,
    elements.tags,
    elements.update
  ].filter(Boolean);
}

function renderSourceOptions(snapshot) {
  if (!elements.sourceSelect) {
    return;
  }

  const currentSource = elements.sourceSelect.value;
  elements.sourceSelect.replaceChildren();
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

function renderProject(snapshot) {
  const activeProject = snapshot.activeProject;
  setText(
    elements.activeProject,
    activeProject ? `${activeProject.name} - ${activeProject.purpose}` : "No active project."
  );
  setText(
    elements.projectDiagnostic,
    activeProject ? `Palette edits save live to ${PALETTE_WORKSPACE_PATH}.` : "Active project required."
  );
  setHidden(elements.projectOverlay, !snapshot.projectRequired);
  setDisabled(allEditorControls(), snapshot.projectRequired || snapshot.validation.status === "Reject");
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
  const swatches = repository.listSwatches({ sortKey: elements.userSort?.value || "name" });
  if (swatches.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 7;
    cell.textContent = snapshot.projectRequired
      ? "Open a project before editing palette swatches."
      : "No project palette swatches yet.";
    row.append(cell);
    elements.userList.append(row);
    return;
  }

  swatches.forEach((swatch) => {
    const row = document.createElement("tr");
    row.dataset.paletteSwatchRow = swatch.symbol;
    const actionCell = document.createElement("td");
    const select = createButton(
      snapshot.selectedSwatch?.symbol === swatch.symbol ? `Selected ${swatch.symbol}` : `Select ${swatch.symbol}`,
      "paletteSelectSwatch",
      swatch.symbol
    );
    if (snapshot.selectedSwatch?.symbol === swatch.symbol) {
      select.classList.add("primary");
      select.setAttribute("aria-pressed", "true");
    }
    actionCell.append(select);
    row.append(
      createColorCell(swatch.hex),
      createCell(swatch.symbol),
      createCell(swatch.name),
      createCell(swatch.hex),
      createCell(repository.displaySource(swatch.source)),
      createCell(swatch.tags.length ? swatch.tags.join(", ") : "None"),
      actionCell
    );
    elements.userList.append(row);
  });
}

function renderSourceSwatches() {
  if (!elements.sourceList) {
    return;
  }

  const sourceId = elements.sourceSelect?.value;
  sourceSwatchRows = repository.listSourceSwatches({
    query: elements.sourceSearch?.value || "",
    sortKey: elements.sourceSort?.value || "name",
    sourceId
  });

  elements.sourceList.replaceChildren();
  if (sourceSwatchRows.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.textContent = "No source swatches match the current filter.";
    row.append(cell);
    elements.sourceList.append(row);
    return;
  }

  sourceSwatchRows.forEach((swatch, index) => {
    const row = document.createElement("tr");
    const actionCell = document.createElement("td");
    actionCell.append(createButton(`Pin ${swatch.symbol}`, "palettePinSource", String(index)));
    row.append(
      createColorCell(swatch.hex),
      createCell(swatch.symbol),
      createCell(swatch.name),
      createCell(swatch.hex),
      createCell(swatch.source),
      actionCell
    );
    elements.sourceList.append(row);
  });
}

function renderSelectedDetails(snapshot) {
  if (!elements.selectedDetails) {
    return;
  }

  elements.selectedDetails.replaceChildren();
  const swatch = snapshot.selectedSwatch;
  if (!swatch) {
    elements.selectedDetails.append(createListItem("No selected swatch."));
    return;
  }

  [
    `Symbol: ${swatch.symbol}`,
    `Hex: ${swatch.hex}`,
    `Name: ${swatch.name}`,
    `Source: ${repository.displaySource(swatch.source)}`,
    `Tags: ${swatch.tags.length ? swatch.tags.join(", ") : "None"}`
  ].forEach((line) => elements.selectedDetails.append(createListItem(line)));
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
  if (!snapshot.selectedSwatch) {
    elements.harmonyList.append(createListItem("Select a swatch to view harmony suggestions."));
    return;
  }
  snapshot.harmony.forEach((suggestion) => {
    elements.harmonyList.append(createListItem(`${suggestion.name}: ${suggestion.hex}`));
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
    snapshot.selectedSwatch ? `${snapshot.selectedSwatch.symbol} ${snapshot.selectedSwatch.name}` : "None"
  );
  setDisabled(elements.undo, !snapshot.canUndo);
  setDisabled(elements.redo, !snapshot.canRedo);
}

function render() {
  let snapshot;
  try {
    snapshot = repository.getSnapshot({ sortKey: elements.userSort?.value || "name" });
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
  renderProject(snapshot);
  renderSummary(snapshot);
  renderValidation(snapshot);
  renderUserPalette(snapshot);
  renderSourceSwatches();
  renderSelectedDetails(snapshot);
  renderTags(snapshot);
  renderHarmony(snapshot);
  renderTables(snapshot);
}

function applyResult(result) {
  editorIssues = result.issues || [];
  setText(elements.log, result.message);
  setText(elements.editorDiagnostic, result.message);
  render();
}

function validateEditor() {
  const snapshot = repository.getSnapshot();
  if (snapshot.projectRequired) {
    editorIssues = snapshot.validation.findings;
  } else {
    editorIssues = validatePaletteSwatchInput(
      readEditorForm(),
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
  applyResult(repository.addSwatch(readEditorForm()));
});

elements.form?.addEventListener("input", validateEditor);

elements.update?.addEventListener("click", () => {
  applyResult(repository.updateSelectedSwatch(readEditorForm()));
});

elements.remove?.addEventListener("click", () => {
  applyResult(repository.removeSelectedSwatch());
});

elements.clear?.addEventListener("click", clearEditorForm);

elements.undo?.addEventListener("click", () => {
  applyResult(repository.undo());
});

elements.redo?.addEventListener("click", () => {
  applyResult(repository.redo());
});

elements.userSort?.addEventListener("change", render);
elements.sourceSelect?.addEventListener("change", renderSourceSwatches);
elements.sourceSearch?.addEventListener("input", renderSourceSwatches);
elements.sourceSort?.addEventListener("change", renderSourceSwatches);

elements.userList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-palette-select-swatch]");
  if (!button) {
    return;
  }

  const snapshot = repository.selectSwatch(button.dataset.paletteSelectSwatch);
  fillEditorForm(snapshot.selectedSwatch);
  editorIssues = [];
  render();
});

elements.sourceList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-palette-pin-source]");
  if (!button) {
    return;
  }

  const swatch = sourceSwatchRows[Number(button.dataset.palettePinSource)];
  if (swatch) {
    applyResult(repository.pinSourceSwatch(swatch));
  }
});

runInitialQueryState();
render();
