import {
  ASSET_ROLE_DEFINITIONS,
  createAssetToolApiRepository,
  pickerDiagnosticForRole
} from "./assets-api-client.js";

const repository = createAssetToolApiRepository();
const params = new URLSearchParams(window.location.search);
const handoffMode = params.get("handoff");
const advancedPickerAllowed = params.get("role")?.toLowerCase() === "admin"
  || params.get("advanced")?.toLowerCase() === "true";

if (handoffMode === "missing") {
  repository.makeMissingGameConfiguration();
} else if (handoffMode === "invalid") {
  repository.makeInvalidGameConfiguration();
} else {
  repository.makeReadyGameConfiguration();
}

if (params.get("palette") === "seed") {
  repository.seedActiveProjectPalette();
}

const elements = {
  assetRole: document.querySelector("[data-asset-tool-asset-role]"),
  count: document.querySelector("[data-asset-tool-count]"),
  file: document.querySelector("[data-asset-tool-file]"),
  fileName: document.querySelector("[data-asset-tool-file-name]"),
  fileNameRow: document.querySelector("[data-asset-tool-file-name-row]"),
  fileRow: document.querySelector("[data-asset-tool-file-row]"),
  form: document.querySelector("[data-asset-tool-form]"),
  handoffContext: document.querySelector("[data-asset-tool-handoff-context]"),
  handoffOverlay: document.querySelector("[data-asset-tool-handoff-overlay]"),
  importDiagnostic: document.querySelector("[data-asset-tool-import-diagnostic]"),
  library: document.querySelector("[data-asset-tool-library]"),
  libraryStatus: document.querySelector("[data-asset-tool-library-status]"),
  log: document.querySelector("[data-asset-tool-log]"),
  metadata: document.querySelector("[data-asset-tool-metadata]"),
  name: document.querySelector("[data-asset-tool-name]"),
  nextStep: document.querySelectorAll("[data-asset-tool-next-step], [data-asset-tool-output-next-step]"),
  outputMissing: document.querySelector("[data-asset-tool-output-missing]"),
  outputSummary: document.querySelector("[data-asset-tool-output-summary]"),
  outputValidation: document.querySelector("[data-asset-tool-output-validation]"),
  paletteColor: document.querySelector("[data-asset-tool-palette-color]"),
  paletteDetailRow: document.querySelector("[data-asset-tool-palette-detail-row]"),
  paletteRow: document.querySelector("[data-asset-tool-palette-row]"),
  paletteSelection: document.querySelector("[data-asset-tool-palette-selection]"),
  path: document.querySelector("[data-asset-tool-path]"),
  pickerMode: document.querySelector("[data-asset-tool-picker-mode]"),
  preview: document.querySelector("[data-asset-tool-preview]"),
  previewTitle: document.querySelector("[data-asset-tool-preview-title]"),
  cancelEdit: document.querySelector("[data-asset-tool-cancel-edit]"),
  reset: document.querySelector("[data-asset-tool-reset]"),
  roleDiagnostics: document.querySelector("[data-asset-tool-role-diagnostics]"),
  roleLibrary: document.querySelector("[data-asset-tool-role-library]"),
  seed: document.querySelector("[data-asset-tool-seed]"),
  submit: document.querySelector("[data-asset-tool-submit]"),
  tableCounts: document.querySelector("[data-asset-tool-table-counts]"),
  usage: document.querySelector("[data-asset-tool-usage]"),
  validationList: document.querySelector("[data-asset-tool-validation-list]"),
  validationOverlay: document.querySelector("[data-asset-tool-validation-overlay]")
};

let editingAsset = null;

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

function visibleRoleDefinitions() {
  return ASSET_ROLE_DEFINITIONS.filter((role) => (
    role.inputMode !== "advanced" || advancedPickerAllowed
  ));
}

function visibleRoleDefinitionForId(roleId) {
  return visibleRoleDefinitions().find((role) => role.id === roleId) || visibleRoleDefinitions()[0];
}

function appendRoleOptions(select, definitions) {
  if (!select) {
    return;
  }

  select.replaceChildren();
  definitions.forEach((role) => {
    const option = document.createElement("option");
    option.value = role.id;
    option.textContent = role.label;
    select.append(option);
  });
}

function appendOptions(select, values) {
  if (!select) {
    return;
  }

  select.replaceChildren();
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function createCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function createActionButton(label, datasetName, assetId) {
  const button = document.createElement("button");
  button.className = "btn";
  button.type = "button";
  button.dataset[datasetName] = assetId;
  button.textContent = label;
  return button;
}

function createListItem(text) {
  const item = document.createElement("li");
  item.textContent = text;
  return item;
}

function createMetadataCell(asset) {
  const cell = document.createElement("td");
  const lines = asset.paletteSwatch
    ? [
        `${asset.paletteSwatch.key} ${asset.paletteSwatch.hex}`,
        asset.paletteSwatch.name,
        asset.paletteSwatch.tags.length ? `Tags: ${asset.paletteSwatch.tags.join(", ")}` : "Tags: None",
        asset.checksum
      ]
    : [
        `${asset.originalName} ${asset.mimeType}`,
        `${asset.size} bytes`,
        asset.checksum
      ];

  lines.forEach((line) => {
    const item = document.createElement("div");
    item.textContent = line;
    cell.append(item);
  });
  return cell;
}

function currentFile() {
  return elements.file?.files?.[0] || null;
}

function readAssetForm() {
  const file = currentFile();
  const role = selectedRoleDefinition();
  return {
    assetRole: elements.assetRole?.value,
    fileName: role.inputMode === "file" ? editingAsset?.originalName || file?.name || "" : "",
    mimeType: role.inputMode === "file" ? editingAsset?.mimeType || file?.type || "" : "",
    name: elements.name?.value,
    paletteColor: elements.paletteColor?.value || editingAsset?.paletteSwatch?.key || "",
    path: elements.path?.value,
    pickerMode: role.inputMode,
    size: role.inputMode === "file" ? editingAsset?.size || file?.size || 0 : 0,
    usage: elements.usage?.value
  };
}

function fileStem(fileName) {
  return String(fileName || "").replace(/\.[^.]+$/, "");
}

function selectedRoleDefinition() {
  const roleId = elements.assetRole?.value || "image";
  return visibleRoleDefinitionForId(roleId);
}

function updateUsageOptions() {
  const role = selectedRoleDefinition();
  const currentUsage = elements.usage?.value || "";
  appendOptions(elements.usage, role.usageRoles);
  if (elements.usage && role.usageRoles.includes(currentUsage)) {
    elements.usage.value = currentUsage;
  }
}

function updatePalettePicker() {
  if (!elements.paletteColor) {
    return;
  }

  const currentValue = elements.paletteColor.value;
  const palette = repository.getPaletteSnapshot();
  elements.paletteColor.replaceChildren();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = palette.activeProject
    ? "Choose palette swatch"
    : "Palette Tool required";
  elements.paletteColor.append(placeholder);

  palette.swatches.forEach((swatch) => {
    const option = document.createElement("option");
    option.value = swatch.key;
    option.textContent = `${swatch.key} ${swatch.hex} ${swatch.name}`;
    elements.paletteColor.append(option);
  });

  if (currentValue && palette.swatches.some((swatch) => swatch.key === currentValue)) {
    elements.paletteColor.value = currentValue;
  }
  elements.paletteColor.disabled = palette.swatches.length === 0;
  updatePaletteSelectionDetails();
}

function selectedPaletteSwatch() {
  const key = elements.paletteColor?.value || "";
  return key ? repository.getPaletteSnapshot().swatches.find((swatch) => swatch.key === key) || null : null;
}

function setPaletteSelectionContent(message, includeLink = true) {
  if (!elements.paletteSelection) {
    return;
  }

  elements.paletteSelection.replaceChildren(document.createTextNode(message));
  if (includeLink) {
    elements.paletteSelection.append(document.createTextNode(" "));
    const link = document.createElement("a");
    link.href = "toolbox/colors/index.html";
    link.textContent = "Open Palette Tool";
    link.dataset.assetToolPaletteLink = "true";
    elements.paletteSelection.append(link);
  }
}

function updatePaletteSelectionDetails() {
  const role = selectedRoleDefinition();
  if (role.inputMode !== "palette") {
    return;
  }

  const palette = repository.getPaletteSnapshot();
  const swatch = selectedPaletteSwatch();
  if (!palette.activeProject) {
    setPaletteSelectionContent("Palette Tool required / active project required.");
    return;
  }
  if (palette.swatches.length === 0) {
    setPaletteSelectionContent("Palette Tool required / no swatches available.");
    return;
  }
  if (!swatch) {
    setPaletteSelectionContent("Choose a palette swatch for this Color asset.", false);
    return;
  }

  const tags = swatch.tags.length ? ` Tags: ${swatch.tags.join(", ")}` : "";
  if (elements.name && !elements.name.value.trim()) {
    elements.name.value = swatch.name;
  }
  setPaletteSelectionContent(`Key: ${swatch.key} Hex: ${swatch.hex} Name: ${swatch.name}${tags}`, false);
}

function updateFileAccept() {
  if (!elements.file) {
    return;
  }

  const role = selectedRoleDefinition();
  const fileMode = role.inputMode === "file";
  const paletteMode = role.inputMode === "palette";
  const editing = Boolean(editingAsset);

  setText(elements.pickerMode, editing ? "edit" : role.inputMode);
  setHidden(elements.fileRow, !fileMode || editing);
  setHidden(elements.fileNameRow, !fileMode);
  setHidden(elements.paletteRow, !paletteMode || editing);
  setHidden(elements.paletteDetailRow, !paletteMode || editing);

  elements.file.accept = fileMode ? role.extensions.join(",") : "";
  elements.file.disabled = !fileMode || editing;
  if (!fileMode || editing) {
    elements.file.value = "";
  }
  if (paletteMode && !editing) {
    updatePalettePicker();
    updatePaletteSelectionDetails();
  }
}

function updateImportDiagnostic() {
  if (editingAsset) {
    setText(elements.importDiagnostic, "Editing asset metadata. Save to update your asset library.");
    return;
  }
  const role = selectedRoleDefinition();
  setText(elements.importDiagnostic, pickerDiagnosticForRole(role, repository.getPaletteSnapshot()));
}

function updateStoragePathPreview() {
  if (!elements.path) {
    return;
  }

  const role = selectedRoleDefinition();
  const file = currentFile();
  elements.path.value = repository.previewStoragePath({
    assetRole: elements.assetRole?.value,
    fileName: role.inputMode === "file" ? editingAsset?.originalName || file?.name || "" : "",
    paletteColor: role.inputMode === "palette" ? editingAsset?.paletteSwatch?.key || elements.paletteColor?.value || "" : "",
    usage: elements.usage?.value
  });
}

function renderHandoff(snapshot) {
  const project = snapshot.handoff.activeProject;
  const configuration = snapshot.handoff.configuration;
  const text = snapshot.handoff.ready && project && configuration
    ? `${project.name} - ${project.purpose} - Game Configuration ready`
    : "No active project with ready Game Configuration handoff";

  setText(elements.handoffContext, text);
  if (elements.handoffOverlay) {
    elements.handoffOverlay.hidden = snapshot.handoff.ready;
  }
  if (elements.form) {
    elements.form.hidden = !snapshot.handoff.ready;
    elements.form.setAttribute("aria-hidden", String(!snapshot.handoff.ready));
  }
}

function renderValidation(snapshot) {
  if (!elements.validationList || !elements.validationOverlay) {
    return;
  }

  elements.validationList.replaceChildren();
  snapshot.validation.findings.forEach((finding) => {
    elements.validationList.append(createListItem(`${finding.label}: ${finding.action}`));
  });
  elements.validationOverlay.hidden = snapshot.validation.findings.length === 0;
}

function renderRoleLibrary(snapshot) {
  if (!elements.roleLibrary) {
    return;
  }

  elements.roleLibrary.replaceChildren();
  visibleRoleDefinitions().forEach((role) => {
    const row = document.createElement("tr");
    row.dataset.assetToolRoleRow = role.id;
    row.append(
      createCell(role.label),
      createCell(role.extensions.join(", ")),
      createCell(role.previewBehavior),
      createCell(role.uploadEnabled ? "Upload ready" : "Planned"),
      createCell(role.validationNeeds.join("; "))
    );
    elements.roleLibrary.append(row);
  });
}

function renderRoleDiagnostics(snapshot) {
  if (!elements.roleDiagnostics) {
    return;
  }

  elements.roleDiagnostics.replaceChildren();
  const visibleRoleIds = new Set(visibleRoleDefinitions().map((role) => role.id));
  snapshot.roleDiagnostics
    .filter((diagnostic) => visibleRoleIds.has(diagnostic.id.replace(/-role-diagnostic$/, "")))
    .forEach((diagnostic) => {
      elements.roleDiagnostics.append(createListItem(`${diagnostic.label}: ${diagnostic.action}`));
    });
}

function renderLibrary(snapshot) {
  if (!elements.library) {
    return;
  }

  elements.library.replaceChildren();

  if (snapshot.assets.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 7;
    cell.textContent = "No user assets added yet.";
    row.append(cell);
    elements.library.append(row);
    return;
  }

  snapshot.assets.forEach((asset) => {
    const row = document.createElement("tr");
    row.dataset.assetToolRow = asset.id;

    const nameCell = document.createElement("td");
    nameCell.textContent = asset.name;
    if (snapshot.selectedAsset?.id === asset.id) {
      row.dataset.assetToolSelectedRow = "true";
    }

    const actionsCell = document.createElement("td");
    const actions = document.createElement("div");
    actions.className = "action-group action-group--tight";
    actions.append(
      createActionButton("View", "assetToolView", asset.id),
      createActionButton("Edit", "assetToolEdit", asset.id),
      createActionButton("Delete", "assetToolDelete", asset.id)
    );
    actionsCell.append(actions);

    row.append(
      nameCell,
      createCell(asset.assetRoleLabel),
      createCell(asset.usage),
      createCell(asset.storedPath),
      createMetadataCell(asset),
      createCell(asset.status),
      actionsCell
    );
    elements.library.append(row);
  });
}

function renderPreview(snapshot) {
  const asset = snapshot.selectedAsset;

  if (!asset) {
    setText(elements.previewTitle, "Selected Asset Preview");
    setText(elements.preview, "Choose or upload an asset to preview its project storage metadata.");
    return;
  }

  setText(elements.previewTitle, `${asset.name} Preview`);
  if (asset.paletteSwatch) {
    const tags = asset.paletteSwatch.tags.length ? ` Tags: ${asset.paletteSwatch.tags.join(", ")}` : "";
    setText(elements.preview, `${asset.previewKind}: ${asset.paletteSwatch.key} ${asset.paletteSwatch.hex} ${asset.paletteSwatch.name}.${tags}`);
    return;
  }
  setText(elements.preview, `${asset.previewKind}: ${asset.storedPath} from ${asset.originalName}.`);
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

function renderMetadata(snapshot) {
  if (!elements.metadata) {
    return;
  }

  elements.metadata.replaceChildren();
  const asset = snapshot.selectedAsset;
  if (!asset) {
    elements.metadata.append(createListItem("No selected asset metadata."));
    return;
  }

  [
    `${asset.originalName} ${asset.mimeType}`,
    `${asset.size} bytes`,
    asset.checksum,
    `Stored path: ${asset.storedPath}`,
    `Role: ${asset.assetRoleLabel}`,
    `Owner project: ${asset.ownerProjectId}`,
    asset.paletteSwatch ? `Swatch key: ${asset.paletteSwatch.key}` : "",
    asset.paletteSwatch ? `Swatch hex: ${asset.paletteSwatch.hex}` : "",
    asset.paletteSwatch ? `Swatch name: ${asset.paletteSwatch.name}` : "",
    asset.paletteSwatch && asset.paletteSwatch.tags.length ? `Swatch tags: ${asset.paletteSwatch.tags.join(", ")}` : ""
  ].filter(Boolean).forEach((item) => elements.metadata.append(createListItem(item)));
}

function renderOutput(snapshot) {
  const missing = snapshot.validation.findings.map((finding) => finding.label).join(", ");
  const assetCount = snapshot.assets.length;

  setText(elements.count, String(assetCount));
  setText(elements.libraryStatus, snapshot.progressHandoff.libraryStatus);
  setText(elements.nextStep, snapshot.progressHandoff.nextStep);
  setText(elements.outputValidation, snapshot.validation.status);
  setText(elements.outputMissing, missing || (assetCount > 0 ? "None" : "Add at least one user asset."));
  setText(
    elements.outputSummary,
    assetCount === 1 ? "1 user asset ready." : `${assetCount} user assets ready.`
  );
}

function render() {
  const snapshot = repository.getSnapshot();
  if (editingAsset && !snapshot.assets.some((asset) => asset.id === editingAsset.id)) {
    editingAsset = null;
  }
  renderHandoff(snapshot);
  renderValidation(snapshot);
  renderRoleLibrary(snapshot);
  renderRoleDiagnostics(snapshot);
  renderLibrary(snapshot);
  renderPreview(snapshot);
  renderTables(snapshot);
  renderMetadata(snapshot);
  updatePalettePicker();
  renderOutput(snapshot);
  updateStoragePathPreview();
  updateSelectedFileName();
  updateImportDiagnostic();
  setFormMode();
}

function updateSelectedFileName() {
  if (editingAsset) {
    setText(elements.fileName, editingAsset.originalName ? `Existing file: ${editingAsset.originalName}` : "Existing asset source.");
    return;
  }
  setText(elements.fileName, currentFile()?.name || "No file selected.");
}

function validateCurrentForm() {
  updateStoragePathPreview();
  const validation = repository.validateAssetInput(readAssetForm());
  const findings = validation.findings.map((finding) => ({
    action: finding.action,
    label: finding.label
  }));
  renderValidation({
    validation: {
      findings
    }
  });
  setText(elements.outputValidation, validation.status);
}

function populateFormFromAsset(asset) {
  if (!asset) {
    return;
  }
  if (elements.assetRole) {
    elements.assetRole.value = asset.assetRole;
  }
  updateUsageOptions();
  if (elements.usage) {
    elements.usage.value = asset.usage;
  }
  if (elements.name) {
    elements.name.value = asset.name;
  }
  if (elements.paletteColor && asset.paletteSwatch?.key) {
    elements.paletteColor.value = asset.paletteSwatch.key;
  }
  updateFileAccept();
  updateSelectedFileName();
  updateStoragePathPreview();
  updateImportDiagnostic();
}

function setFormMode() {
  const editing = Boolean(editingAsset);
  if (elements.submit) {
    elements.submit.textContent = editing ? "Save Asset" : "Add Asset";
  }
  if (elements.cancelEdit) {
    elements.cancelEdit.hidden = !editing;
  }
  if (elements.assetRole) {
    elements.assetRole.disabled = editing;
  }
}

function clearEditMode() {
  editingAsset = null;
  setFormMode();
  updateFileAccept();
  updateSelectedFileName();
  updateStoragePathPreview();
  updateImportDiagnostic();
}

function enterEditMode(assetId) {
  const snapshot = repository.selectAsset(assetId);
  const asset = snapshot.assets.find((candidate) => candidate.id === assetId);
  if (!asset) {
    setText(elements.log, "Asset edit blocked: choose an asset owned by the current user.");
    render();
    return;
  }
  editingAsset = asset;
  populateFormFromAsset(asset);
  setFormMode();
  setText(elements.log, `Editing ${asset.name}.`);
  render();
  populateFormFromAsset(asset);
  setFormMode();
}

appendRoleOptions(elements.assetRole, visibleRoleDefinitions());
updateUsageOptions();
updateFileAccept();
updateImportDiagnostic();

elements.assetRole?.addEventListener("change", () => {
  updateUsageOptions();
  updateFileAccept();
  updateImportDiagnostic();
  updateSelectedFileName();
  updateStoragePathPreview();
  validateCurrentForm();
});

elements.usage?.addEventListener("change", () => {
  updateStoragePathPreview();
  validateCurrentForm();
});

elements.file?.addEventListener("change", () => {
  const file = currentFile();
  if (!file) {
    return;
  }

  if (elements.name && !elements.name.value.trim()) {
    elements.name.value = fileStem(file.name);
  }
  updateSelectedFileName();
  updateStoragePathPreview();
  validateCurrentForm();
});

elements.paletteColor?.addEventListener("change", () => {
  updatePaletteSelectionDetails();
  updateStoragePathPreview();
  validateCurrentForm();
});

elements.form?.addEventListener("input", validateCurrentForm);

elements.form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = editingAsset
    ? repository.updateAsset(editingAsset.id, readAssetForm())
    : repository.importAsset(readAssetForm());
  setText(elements.log, result.message);
  if (result.updated || result.imported) {
    editingAsset = null;
  }
  render();
});

elements.library?.addEventListener("click", (event) => {
  const view = event.target.closest("[data-asset-tool-view]");
  const edit = event.target.closest("[data-asset-tool-edit]");
  const deleteButton = event.target.closest("[data-asset-tool-delete]");
  if (!view && !edit && !deleteButton) {
    return;
  }

  if (view) {
    const snapshot = repository.selectAsset(view.dataset.assetToolView);
    setText(elements.log, snapshot.selectedAsset ? `Viewing ${snapshot.selectedAsset.name}.` : "Asset view blocked: choose an asset owned by the current user.");
    editingAsset = null;
    render();
    return;
  }

  if (edit) {
    enterEditMode(edit.dataset.assetToolEdit);
    return;
  }

  const result = repository.deleteAsset(deleteButton.dataset.assetToolDelete);
  if (editingAsset?.id === deleteButton.dataset.assetToolDelete) {
    editingAsset = null;
  }
  setText(elements.log, result.message);
  render();
});

elements.cancelEdit?.addEventListener("click", () => {
  clearEditMode();
  setText(elements.log, "Asset edit canceled.");
});

elements.seed?.addEventListener("click", () => {
  repository.seedDemoAssets();
  editingAsset = null;
  setText(elements.log, "Demo user assets seeded.");
  render();
});

elements.reset?.addEventListener("click", () => {
  const result = repository.resetAssetLibrary();
  editingAsset = null;
  setText(elements.log, result.message);
  render();
});

render();
