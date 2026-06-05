import {
  ASSET_ROLE_DEFINITIONS,
  createAssetToolMockRepository,
  pickerDiagnosticForRole
} from "./assets-mock-repository.js";

const repository = createAssetToolMockRepository();
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
  paletteRow: document.querySelector("[data-asset-tool-palette-row]"),
  path: document.querySelector("[data-asset-tool-path]"),
  pickerMode: document.querySelector("[data-asset-tool-picker-mode]"),
  preview: document.querySelector("[data-asset-tool-preview]"),
  previewTitle: document.querySelector("[data-asset-tool-preview-title]"),
  reset: document.querySelector("[data-asset-tool-reset]"),
  roleDiagnostics: document.querySelector("[data-asset-tool-role-diagnostics]"),
  roleLibrary: document.querySelector("[data-asset-tool-role-library]"),
  seed: document.querySelector("[data-asset-tool-seed]"),
  tableCounts: document.querySelector("[data-asset-tool-table-counts]"),
  usage: document.querySelector("[data-asset-tool-usage]"),
  validationList: document.querySelector("[data-asset-tool-validation-list]"),
  validationOverlay: document.querySelector("[data-asset-tool-validation-overlay]")
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

function createListItem(text) {
  const item = document.createElement("li");
  item.textContent = text;
  return item;
}

function createMetadataCell(asset) {
  const cell = document.createElement("td");
  [
    `${asset.originalName} ${asset.mimeType}`,
    `${asset.size} bytes`,
    asset.checksum
  ].forEach((line) => {
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
  return {
    assetRole: elements.assetRole?.value,
    fileName: file?.name || "",
    mimeType: file?.type || "",
    name: elements.name?.value,
    paletteColor: elements.paletteColor?.value || "",
    path: elements.path?.value,
    pickerMode: selectedRoleDefinition().inputMode,
    size: file?.size || 0,
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

  elements.paletteColor.replaceChildren();
  const option = document.createElement("option");
  option.value = "";
  option.textContent = "Palette Tool required";
  elements.paletteColor.append(option);
  elements.paletteColor.disabled = true;
}

function updateFileAccept() {
  if (!elements.file) {
    return;
  }

  const role = selectedRoleDefinition();
  const fileMode = role.inputMode === "file";
  const paletteMode = role.inputMode === "palette";

  setText(elements.pickerMode, role.inputMode);
  setHidden(elements.fileRow, !fileMode);
  setHidden(elements.fileNameRow, !fileMode);
  setHidden(elements.paletteRow, !paletteMode);

  elements.file.accept = fileMode ? role.extensions.join(",") : "";
  elements.file.disabled = !fileMode;
  if (!fileMode) {
    elements.file.value = "";
  }
  if (paletteMode) {
    updatePalettePicker();
  }
}

function updateImportDiagnostic() {
  const role = selectedRoleDefinition();
  setText(elements.importDiagnostic, pickerDiagnosticForRole(role));
}

function updateStoragePathPreview() {
  if (!elements.path) {
    return;
  }

  const role = selectedRoleDefinition();
  const file = currentFile();
  elements.path.value = repository.previewStoragePath({
    assetRole: elements.assetRole?.value,
    fileName: role.inputMode === "file" ? file?.name || "" : "",
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
    cell.colSpan = 6;
    cell.textContent = "No project assets uploaded yet.";
    row.append(cell);
    elements.library.append(row);
    return;
  }

  snapshot.assets.forEach((asset) => {
    const row = document.createElement("tr");
    row.dataset.assetToolRow = asset.id;

    const nameCell = document.createElement("td");
    const select = document.createElement("button");
    select.className = snapshot.selectedAsset?.id === asset.id ? "btn primary" : "btn";
    select.type = "button";
    select.dataset.assetToolSelect = asset.id;
    select.setAttribute("aria-pressed", String(snapshot.selectedAsset?.id === asset.id));
    select.textContent = asset.name;
    nameCell.append(select);

    row.append(
      nameCell,
      createCell(asset.assetRoleLabel),
      createCell(asset.usage),
      createCell(asset.storedPath),
      createMetadataCell(asset),
      createCell(asset.status)
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
    `Owner project: ${asset.ownerProjectId}`
  ].forEach((item) => elements.metadata.append(createListItem(item)));
}

function renderOutput(snapshot) {
  const missing = snapshot.validation.findings.map((finding) => finding.label).join(", ");
  const assetCount = snapshot.assets.length;

  setText(elements.count, String(assetCount));
  setText(elements.libraryStatus, snapshot.progressHandoff.libraryStatus);
  setText(elements.nextStep, snapshot.progressHandoff.nextStep);
  setText(elements.outputValidation, snapshot.validation.status);
  setText(elements.outputMissing, missing || (assetCount > 0 ? "None" : "Upload at least one project asset."));
  setText(
    elements.outputSummary,
    assetCount === 1 ? "1 project asset ready." : `${assetCount} project assets ready.`
  );
}

function render() {
  const snapshot = repository.getSnapshot();
  renderHandoff(snapshot);
  renderValidation(snapshot);
  renderRoleLibrary(snapshot);
  renderRoleDiagnostics(snapshot);
  renderLibrary(snapshot);
  renderPreview(snapshot);
  renderTables(snapshot);
  renderMetadata(snapshot);
  renderOutput(snapshot);
  updateStoragePathPreview();
  updateSelectedFileName();
  updateImportDiagnostic();
}

function updateSelectedFileName() {
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

elements.form?.addEventListener("input", validateCurrentForm);

elements.form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = repository.importAsset(readAssetForm());
  setText(elements.log, result.message);
  render();
});

elements.library?.addEventListener("click", (event) => {
  const select = event.target.closest("[data-asset-tool-select]");
  if (!select) {
    return;
  }

  repository.selectAsset(select.dataset.assetToolSelect);
  render();
});

elements.seed?.addEventListener("click", () => {
  repository.seedDemoAssets();
  setText(elements.log, "Demo project assets seeded.");
  render();
});

elements.reset?.addEventListener("click", () => {
  const result = repository.resetAssetLibrary();
  setText(elements.log, result.message);
  render();
});

render();
