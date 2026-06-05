import {
  ASSET_ROLES,
  ASSET_TYPES,
  createAssetToolMockRepository
} from "./assets-mock-repository.js";

const repository = createAssetToolMockRepository();
const params = new URLSearchParams(window.location.search);
const handoffMode = params.get("handoff");

if (handoffMode === "missing") {
  repository.makeMissingGameConfiguration();
} else if (handoffMode === "invalid") {
  repository.makeInvalidGameConfiguration();
} else {
  repository.makeReadyGameConfiguration();
}

const elements = {
  count: document.querySelector("[data-asset-tool-count]"),
  file: document.querySelector("[data-asset-tool-file]"),
  form: document.querySelector("[data-asset-tool-form]"),
  handoffContext: document.querySelector("[data-asset-tool-handoff-context]"),
  handoffOverlay: document.querySelector("[data-asset-tool-handoff-overlay]"),
  library: document.querySelector("[data-asset-tool-library]"),
  libraryStatus: document.querySelector("[data-asset-tool-library-status]"),
  log: document.querySelector("[data-asset-tool-log]"),
  name: document.querySelector("[data-asset-tool-name]"),
  nextStep: document.querySelectorAll("[data-asset-tool-next-step], [data-asset-tool-output-next-step]"),
  outputMissing: document.querySelector("[data-asset-tool-output-missing]"),
  outputSummary: document.querySelector("[data-asset-tool-output-summary]"),
  outputValidation: document.querySelector("[data-asset-tool-output-validation]"),
  path: document.querySelector("[data-asset-tool-path]"),
  preview: document.querySelector("[data-asset-tool-preview]"),
  previewTitle: document.querySelector("[data-asset-tool-preview-title]"),
  reset: document.querySelector("[data-asset-tool-reset]"),
  role: document.querySelector("[data-asset-tool-role]"),
  seed: document.querySelector("[data-asset-tool-seed]"),
  tableCounts: document.querySelector("[data-asset-tool-table-counts]"),
  type: document.querySelector("[data-asset-tool-type]"),
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

function readAssetForm() {
  const file = elements.file?.files?.[0] || null;
  return {
    fileName: file?.name || "",
    mimeType: file?.type || "",
    name: elements.name?.value,
    path: elements.path?.value,
    role: elements.role?.value,
    size: file?.size || 0,
    type: elements.type?.value
  };
}

function fileStem(fileName) {
  return String(fileName || "").replace(/\.[^.]+$/, "");
}

function assetPathFromFile(type, fileName) {
  const folder = String(type || "data").toLowerCase();
  return `assets/${folder}/${fileName}`;
}

function renderHandoff(snapshot) {
  const project = snapshot.handoff.activeProject;
  const configuration = snapshot.handoff.configuration;
  const text = snapshot.handoff.ready && project && configuration
    ? `${project.name} - ${project.purpose} - Game Configuration ready`
    : "No ready Game Configuration handoff";

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

function renderLibrary(snapshot) {
  if (!elements.library) {
    return;
  }

  elements.library.replaceChildren();

  if (snapshot.assets.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "No assets imported yet.";
    row.append(cell);
    elements.library.append(row);
    return;
  }

  snapshot.assets.forEach((asset) => {
    const row = document.createElement("tr");
    row.dataset.assetToolRow = asset.id;

    const nameCell = document.createElement("td");
    const select = document.createElement("button");
    select.className = "btn";
    select.type = "button";
    select.dataset.assetToolSelect = asset.id;
    select.textContent = asset.name;
    nameCell.append(select);

    row.append(
      nameCell,
      createCell(asset.type),
      createCell(asset.role),
      createCell(asset.path),
      createCell(asset.status)
    );
    elements.library.append(row);
  });
}

function renderPreview(snapshot) {
  const asset = snapshot.selectedAsset;

  if (!asset) {
    setText(elements.previewTitle, "Selected Asset Preview");
    setText(elements.preview, "Choose or import an asset to preview its project record.");
    return;
  }

  setText(elements.previewTitle, `${asset.name} Preview`);
  setText(elements.preview, `${asset.previewKind}: ${asset.path}${asset.fileName ? ` from ${asset.fileName}` : ""}.`);
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

function renderOutput(snapshot) {
  const missing = snapshot.validation.findings.map((finding) => finding.label).join(", ");
  const assetCount = snapshot.assets.length;

  setText(elements.count, String(assetCount));
  setText(elements.libraryStatus, snapshot.progressHandoff.libraryStatus);
  setText(elements.nextStep, snapshot.progressHandoff.nextStep);
  setText(elements.outputValidation, snapshot.validation.status);
  setText(elements.outputMissing, missing || (assetCount > 0 ? "None" : "Import at least one asset."));
  setText(
    elements.outputSummary,
    assetCount === 1 ? "1 asset ready." : `${assetCount} assets ready.`
  );
}

function render() {
  const snapshot = repository.getSnapshot();
  renderHandoff(snapshot);
  renderValidation(snapshot);
  renderLibrary(snapshot);
  renderPreview(snapshot);
  renderTables(snapshot);
  renderOutput(snapshot);
}

function validateCurrentForm() {
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

appendOptions(elements.type, ASSET_TYPES);
appendOptions(elements.role, ASSET_ROLES);

elements.file?.addEventListener("change", () => {
  const file = elements.file?.files?.[0] || null;
  if (!file) {
    return;
  }

  if (elements.name && !elements.name.value.trim()) {
    elements.name.value = fileStem(file.name);
  }
  if (elements.path && !elements.path.value.trim()) {
    elements.path.value = assetPathFromFile(elements.type?.value, file.name);
  }
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
  setText(elements.log, "Demo assets seeded.");
  render();
});

elements.reset?.addEventListener("click", () => {
  repository.resetAssetLibrary();
  setText(elements.log, "Asset library reset.");
  render();
});

render();
