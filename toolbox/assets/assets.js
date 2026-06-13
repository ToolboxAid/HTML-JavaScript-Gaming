import {
  ASSET_CATALOG_TYPES,
  ASSET_USAGE_OPTIONS,
  createAssetToolApiRepository
} from "./assets-api-client.js";

const repository = createAssetToolApiRepository();
const params = new URLSearchParams(window.location.search);

if (params.get("handoff") === "missing") {
  repository.makeMissingGameConfiguration();
} else if (params.get("handoff") === "invalid") {
  repository.makeInvalidGameConfiguration();
} else {
  repository.makeReadyGameConfiguration();
}

const elements = {
  accordions: document.querySelector("[data-asset-type-accordions]"),
  count: document.querySelector("[data-asset-tool-count]"),
  libraryStatus: document.querySelector("[data-asset-tool-library-status]"),
  log: document.querySelector("[data-asset-tool-log]"),
  metadata: document.querySelector("[data-asset-tool-metadata]"),
  outputMissing: document.querySelector("[data-asset-tool-output-missing]"),
  outputSummary: document.querySelector("[data-asset-tool-output-summary]"),
  outputValidation: document.querySelector("[data-asset-tool-output-validation]"),
  reset: document.querySelector("[data-asset-tool-reset]"),
  selected: document.querySelector("[data-asset-tool-selected]"),
  sharedTags: document.querySelector("[data-asset-tool-shared-tags]"),
  tableCounts: document.querySelector("[data-asset-tool-table-counts]"),
  tagCount: document.querySelector("[data-asset-tool-tag-count]"),
  tagOptions: document.querySelector("[data-asset-tool-tag-options]"),
  validationList: document.querySelector("[data-asset-tool-validation-list]"),
  validationOverlay: document.querySelector("[data-asset-tool-validation-overlay]"),
};

let editingAssetId = "";
let editingAssetType = "";
let selectedAssetId = "";
const draftAssetValues = new Map();
const draftTagKeys = new Map();
const REFERENCE_ONLY_ASSET_TYPES = new Set(["Palette References", "Data"]);
const UPLOAD_COLUMNS = Object.freeze(["Source", "File", "Usage", "Tags", "Preview", "Actions"]);
const REFERENCE_COLUMNS = Object.freeze(["Source", "Reference", "Usage", "Tags", "Preview", "Actions"]);
const UPLOAD_SOURCE = "Upload";
const REFERENCE_SOURCE = "Reference";
const UPLOAD_ACCEPT_BY_ASSET_TYPE = Object.freeze({
  Audio: "audio/*,.mp3,.wav,.ogg,.m4a",
  Fonts: ".ttf,.otf,.woff,.woff2",
  Images: "image/*,.png,.jpg,.jpeg,.webp,.gif,.svg",
  Sprites: "image/*,.png,.jpg,.jpeg,.webp,.gif",
  Vectors: ".svg,image/svg+xml"
});

function normalizeText(value) {
  return String(value || "").trim();
}

function setText(target, value) {
  if (target) {
    target.textContent = value;
  }
}

function createCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function createButton(label, datasetName, value) {
  const button = document.createElement("button");
  button.className = "btn btn--compact";
  button.type = "button";
  button.dataset[datasetName] = value;
  button.textContent = label;
  return button;
}

function createInput(value, label, datasetName) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = value || "";
  input.setAttribute("aria-label", label);
  input.dataset[datasetName] = "true";
  return input;
}

function createSelect(label, datasetName, options, selectedValue) {
  const select = document.createElement("select");
  select.setAttribute("aria-label", label);
  select.dataset[datasetName] = "true";
  appendOptions(select, options, selectedValue || options[0]);
  return select;
}

function appendOptions(select, values, selectedValue) {
  select.replaceChildren();
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
  if (selectedValue && values.includes(selectedValue)) {
    select.value = selectedValue;
  }
}

function tagNameForKey(tags, tagKey) {
  return tags.find((tag) => tag.id === tagKey)?.name || tagKey;
}

function assetTags(asset) {
  return Array.isArray(asset?.tagKeys) ? asset.tagKeys : [];
}

function isReferenceAssetType(assetType) {
  return REFERENCE_ONLY_ASSET_TYPES.has(assetType);
}

function tableColumnsForType(assetType) {
  return isReferenceAssetType(assetType) ? REFERENCE_COLUMNS : UPLOAD_COLUMNS;
}

function isSourceMode(value) {
  return value === UPLOAD_SOURCE || value === REFERENCE_SOURCE;
}

function assetSource(asset) {
  const source = normalizeText(asset?.source);
  if (isSourceMode(source)) {
    return source;
  }
  return isReferenceAssetType(asset?.assetType || asset?.type) ? REFERENCE_SOURCE : UPLOAD_SOURCE;
}

function assetReference(asset) {
  return normalizeText(asset?.reference || asset?.name) || "Unnamed reference";
}

function assetFile(asset) {
  return normalizeText(asset?.fileName || asset?.originalName) || "No file";
}

function assetPreview(asset) {
  return normalizeText(asset?.storedPath || asset?.path || asset?.previewKind) || "Preview ready";
}

function tagKeysForEditRow(row) {
  const key = row?.dataset.assetToolEditingRow || "";
  return draftTagKeys.get(key) || [];
}

function setTagKeysForEditRow(row, tagKeys) {
  const key = row?.dataset.assetToolEditingRow || "";
  if (key) {
    draftTagKeys.set(key, tagKeys);
  }
}

function createTagTokens(tagKeys, tags, editable = false) {
  const wrapper = document.createElement("div");
  wrapper.className = "content-cluster";
  if (!tagKeys.length) {
    const empty = document.createElement("span");
    empty.textContent = "No tags";
    wrapper.append(empty);
    return wrapper;
  }

  tagKeys.forEach((tagKey) => {
    if (editable) {
      const token = createButton(tagNameForKey(tags, tagKey), "assetToolRemoveTag", tagKey);
      wrapper.append(token);
      return;
    }
    const token = document.createElement("span");
    token.className = "pill";
    token.textContent = tagNameForKey(tags, tagKey);
    wrapper.append(token);
  });

  return wrapper;
}

function createUsageSelect(value) {
  const select = document.createElement("select");
  select.dataset.assetToolUsageInput = "true";
  select.setAttribute("aria-label", "Usage");
  appendOptions(select, ASSET_USAGE_OPTIONS, value || ASSET_USAGE_OPTIONS[0]);
  return select;
}

function sourceModeForEdit(assetType, values = {}) {
  const existingSource = normalizeText(values.source);
  if (isSourceMode(existingSource)) {
    return existingSource;
  }
  return isReferenceAssetType(assetType) ? REFERENCE_SOURCE : UPLOAD_SOURCE;
}

function referenceOptionsForAssetType(assetType, snapshot = {}, currentAssetId = "") {
  if (assetType === "Palette References") {
    return (snapshot.palette?.swatches || []).map((swatch) => ({
      label: `${swatch.name || swatch.key} (${swatch.hex || "palette"})`,
      value: swatch.key
    }));
  }

  return (snapshot.assets || [])
    .filter((asset) => asset.id !== currentAssetId && (asset.assetType || asset.type) === assetType)
    .map((asset) => ({
      label: asset.name || asset.fileName || asset.id,
      value: asset.id
    }));
}

function sourceOptionsForAssetType(assetType, referenceOptions, selectedSource) {
  if (isReferenceAssetType(assetType)) {
    return [REFERENCE_SOURCE];
  }
  if (referenceOptions.length > 0 || selectedSource === REFERENCE_SOURCE) {
    return [UPLOAD_SOURCE, REFERENCE_SOURCE];
  }
  return [UPLOAD_SOURCE];
}

function createSourceSelect(assetType, selectedSource, referenceOptions) {
  const options = sourceOptionsForAssetType(assetType, referenceOptions, selectedSource);
  return createSelect("Source", "assetToolSourceInput", options, selectedSource);
}

function createFileUploadControl(assetType, selectedFileName) {
  const wrapper = document.createElement("div");
  wrapper.className = "content-stack content-stack--compact";

  const input = document.createElement("input");
  input.type = "file";
  input.setAttribute("aria-label", "Upload File");
  input.dataset.assetToolFileInput = "true";
  const accept = UPLOAD_ACCEPT_BY_ASSET_TYPE[assetType] || "";
  if (accept) {
    input.accept = accept;
  }

  const filename = document.createElement("span");
  filename.dataset.assetToolSelectedFile = "true";
  filename.textContent = normalizeText(selectedFileName) || "No file selected";
  wrapper.append(input, filename);
  return wrapper;
}

function createReferenceSelect(referenceOptions, selectedReference) {
  const wrapper = document.createElement("div");
  wrapper.className = "content-stack content-stack--compact";
  const select = document.createElement("select");
  select.setAttribute("aria-label", "Reference");
  select.dataset.assetToolReferenceInput = "true";

  if (referenceOptions.length) {
    appendOptions(select, referenceOptions.map((option) => option.value), selectedReference);
    Array.from(select.options).forEach((option) => {
      const referenceOption = referenceOptions.find((candidate) => candidate.value === option.value);
      if (referenceOption) {
        option.textContent = referenceOption.label;
      }
    });
  } else {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No reference sources available";
    select.append(option);
    select.value = "";
  }

  wrapper.append(select);
  if (!referenceOptions.length) {
    const message = document.createElement("span");
    message.textContent = "No valid reference source exists.";
    wrapper.append(message);
  }
  return wrapper;
}

function editedRowForControl(control) {
  return control?.closest("[data-asset-tool-editing-row]");
}

function updateDraftValues(row, values) {
  const rowId = row?.dataset.assetToolEditingRow || "";
  if (!rowId) {
    return;
  }
  const currentValues = draftAssetValues.get(rowId) || {};
  draftAssetValues.set(rowId, {
    ...currentValues,
    ...values
  });
}

function createTagEditor(tagKeys, tags) {
  const wrapper = document.createElement("div");
  wrapper.className = "content-stack content-stack--compact";

  const tokens = createTagTokens(tagKeys, tags, true);

  const controls = document.createElement("div");
  controls.className = "action-group action-group--tight";
  const input = document.createElement("input");
  input.type = "text";
  input.setAttribute("aria-label", "Asset Tags");
  input.setAttribute("list", "assetToolTagOptions");
  input.dataset.assetToolTagInput = "true";
  const add = createButton("Add Tag", "assetToolAddTagToken", "true");
  controls.append(input, add);

  wrapper.append(tokens, controls);
  return wrapper;
}

function assetRowValues(row, assetType) {
  const rowId = row?.dataset.assetToolEditingRow || "";
  const draftValues = draftAssetValues.get(rowId) || {};
  const source = row.querySelector("[data-asset-tool-source-input]")?.value || sourceModeForEdit(assetType, draftValues);
  const reference = source === REFERENCE_SOURCE
    ? row.querySelector("[data-asset-tool-reference-input]")?.value
      || draftValues.reference
      || row.dataset.assetToolExistingReference
      || ""
    : "";
  const fileInput = row.querySelector("[data-asset-tool-file-input]");
  const fileName = source === UPLOAD_SOURCE
    ? fileInput?.files?.[0]?.name || draftValues.fileName || row.dataset.assetToolExistingFileName || ""
    : "";
  const name = source === REFERENCE_SOURCE ? reference : fileName;
  return {
    assetType,
    fileName,
    name,
    reference,
    source,
    tagKeys: tagKeysForEditRow(row),
    usage: row.querySelector("[data-asset-tool-usage-input]")?.value || "",
  };
}

function captureDraftAssetValues(row) {
  const rowId = row?.dataset.assetToolEditingRow || "";
  const assetType = row?.dataset.assetToolAssetType || editingAssetType;
  if (!rowId) {
    return;
  }
  draftAssetValues.set(rowId, assetRowValues(row, assetType));
}

function createEditRow(assetType, asset = null, snapshot = {}) {
  const row = document.createElement("tr");
  const rowId = asset?.id || `__new__:${assetType}`;
  const draftValues = draftAssetValues.get(rowId) || {};
  const referenceOptions = referenceOptionsForAssetType(assetType, snapshot, asset?.id || "");
  const selectedSource = sourceModeForEdit(assetType, {
    source: draftValues.source ?? asset?.source
  });
  const selectedReference = draftValues.reference ?? asset?.reference ?? "";
  const selectedFileName = draftValues.fileName ?? asset?.fileName ?? "";
  row.dataset.assetToolEditingRow = rowId;
  row.dataset.assetToolAssetType = assetType;
  row.dataset.assetToolExistingFileName = selectedFileName;
  row.dataset.assetToolExistingReference = selectedReference;
  if (!draftTagKeys.has(rowId)) {
    draftTagKeys.set(rowId, assetTags(asset));
  }

  const sourceCell = document.createElement("td");
  sourceCell.append(createSourceSelect(assetType, selectedSource, referenceOptions));

  const detailCell = document.createElement("td");
  if (selectedSource === REFERENCE_SOURCE) {
    detailCell.append(createReferenceSelect(referenceOptions, selectedReference));
  } else {
    detailCell.append(createFileUploadControl(assetType, selectedFileName));
  }

  const usageCell = document.createElement("td");
  usageCell.append(createUsageSelect(draftValues.usage ?? asset?.usage));

  const tagsCell = document.createElement("td");
  tagsCell.append(createTagEditor(tagKeysForEditRow(row), snapshot.tags || []));

  const previewCell = createCell(asset ? assetPreview(asset) : "Preview after save");

  const actionsCell = document.createElement("td");
  const actions = document.createElement("div");
  actions.className = "action-group action-group--tight";
  actions.append(
    createButton("Save", "assetToolSave", asset?.id || "__new__"),
    createButton("Cancel", "assetToolCancel", asset?.id || "__new__")
  );
  actionsCell.append(actions);

  row.append(sourceCell, detailCell, usageCell, tagsCell, previewCell, actionsCell);
  return row;
}

function createAssetRow(asset, snapshot) {
  if (editingAssetId === asset.id) {
    return createEditRow(asset.assetType || asset.type || "Images", asset, snapshot);
  }

  const row = document.createElement("tr");
  row.dataset.assetToolRow = asset.id;
  row.dataset.assetToolAssetType = asset.assetType || asset.type || "Images";

  if (selectedAssetId === asset.id) {
    row.dataset.assetToolSelectedRow = "true";
  }

  const tagsCell = document.createElement("td");
  tagsCell.append(createTagTokens(assetTags(asset), snapshot.tags || []));

  const actionsCell = document.createElement("td");
  const actions = document.createElement("div");
  actions.className = "action-group action-group--tight";
  actions.append(
    createButton("View", "assetToolView", asset.id),
    createButton("Edit", "assetToolEdit", asset.id),
    createButton("Trash", "assetToolDelete", asset.id)
  );
  actionsCell.append(actions);

  if (isReferenceAssetType(row.dataset.assetToolAssetType)) {
    row.append(
      createCell(assetSource(asset)),
      createCell(assetReference(asset)),
      createCell(asset.usage),
      tagsCell,
      createCell(assetPreview(asset)),
      actionsCell
    );
    return row;
  }

  row.append(
    createCell(assetSource(asset)),
    createCell(assetFile(asset)),
    createCell(asset.usage),
    tagsCell,
    createCell(assetPreview(asset)),
    actionsCell
  );
  return row;
}

function createAssetTypeTable(assetType, assets, snapshot) {
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrapper";

  const table = document.createElement("table");
  table.className = "data-table";
  table.setAttribute("aria-label", `${assetType} assets`);
  table.dataset.assetTypeTable = assetType;

  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  tableColumnsForType(assetType).forEach((label) => {
    const heading = document.createElement("th");
    heading.scope = "col";
    heading.textContent = label;
    headRow.append(heading);
  });
  head.append(headRow);

  const body = document.createElement("tbody");
  body.dataset.assetTypeBody = assetType;

  if (editingAssetId === `__new__:${assetType}`) {
    body.append(createEditRow(assetType, null, snapshot));
  }

  if (!assets.length && editingAssetId !== `__new__:${assetType}`) {
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = tableColumnsForType(assetType).length;
    emptyCell.textContent = `No ${assetType} assets added yet.`;
    emptyRow.append(emptyCell);
    body.append(emptyRow);
  }

  assets.forEach((asset) => body.append(createAssetRow(asset, snapshot)));

  table.append(head, body);
  wrapper.append(table);
  return wrapper;
}

function createAssetTypeAccordion(assetType, assets, snapshot) {
  const details = document.createElement("details");
  details.className = "vertical-accordion";
  details.dataset.assetTypeAccordion = assetType;
  details.open = true;

  const summary = document.createElement("summary");
  summary.textContent = assetType;

  const body = document.createElement("div");
  body.className = "accordion-body content-stack";

  const actions = document.createElement("div");
  actions.className = "action-group";
  const addButton = createButton(`Add ${assetType}`, "assetToolAddType", assetType);
  addButton.disabled = editingAssetId === `__new__:${assetType}`;
  actions.append(addButton);

  body.append(actions, createAssetTypeTable(assetType, assets, snapshot));
  details.append(summary, body);
  return details;
}

function renderTagOptions(tags) {
  elements.tagOptions?.replaceChildren(...tags.map((tag) => {
    const option = document.createElement("option");
    option.value = tag.name;
    option.dataset.tagKey = tag.id;
    return option;
  }));

  if (!elements.sharedTags) {
    return;
  }
  elements.sharedTags.replaceChildren();
  if (!tags.length) {
    const item = document.createElement("li");
    item.textContent = "No workspace tags added yet.";
    elements.sharedTags.append(item);
    return;
  }
  tags.forEach((tag) => {
    const item = document.createElement("li");
    item.textContent = `${tag.name}: ${tag.description || "No description"}`;
    elements.sharedTags.append(item);
  });
}

function renderValidation(snapshot) {
  if (!elements.validationList || !elements.validationOverlay) {
    return;
  }

  elements.validationList.replaceChildren();
  snapshot.validation.findings.forEach((finding) => {
    const item = document.createElement("li");
    item.textContent = `${finding.label}: ${finding.action}`;
    elements.validationList.append(item);
  });
  elements.validationOverlay.hidden = snapshot.validation.findings.length === 0;
}

function renderAccordions(snapshot) {
  if (!elements.accordions) {
    return;
  }

  elements.accordions.replaceChildren(...ASSET_CATALOG_TYPES.map((assetType) =>
    createAssetTypeAccordion(assetType, snapshot.assetsByType?.[assetType] || [], snapshot)
  ));
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
  const asset = snapshot.assets.find((candidate) => candidate.id === selectedAssetId)
    || snapshot.selectedAsset
    || null;
  if (!asset) {
    const item = document.createElement("li");
    item.textContent = "No selected asset metadata.";
    elements.metadata.append(item);
    setText(elements.selected, "None");
    return;
  }

  setText(elements.selected, asset.name);
  const metadataLines = [
    `Type: ${asset.assetType || asset.type}`,
    `Usage: ${asset.usage}`,
    `Tags: ${assetTags(asset).map((tagKey) => tagNameForKey(snapshot.tags || [], tagKey)).join(", ") || "No tags"}`,
    `Stored path: ${asset.storedPath || asset.path}`,
  ];
  if (isReferenceAssetType(asset.assetType || asset.type)) {
    metadataLines.splice(1, 0, `Reference: ${assetReference(asset)}`);
  } else {
    metadataLines.splice(1, 0, `Source: ${assetSource(asset)}`, `File: ${assetFile(asset)}`);
  }
  metadataLines.forEach((line) => {
    const item = document.createElement("li");
    item.textContent = line;
    elements.metadata.append(item);
  });
}

function renderOutput(snapshot) {
  const assetCount = snapshot.assets.length;
  const missing = snapshot.validation.findings.map((finding) => finding.label).join(", ");
  setText(elements.count, String(assetCount));
  setText(elements.tagCount, String(snapshot.tags.length));
  setText(elements.libraryStatus, assetCount > 0 ? "Ready" : "Needs Input");
  setText(
    elements.outputSummary,
    assetCount === 1 ? "1 user asset catalog record ready." : `${assetCount} user asset catalog records ready.`
  );
  setText(elements.outputValidation, snapshot.validation.status);
  setText(elements.outputMissing, missing || (assetCount > 0 ? "None" : "Add at least one user asset."));
}

function render() {
  const snapshot = repository.getSnapshot();
  if (selectedAssetId && !snapshot.assets.some((asset) => asset.id === selectedAssetId)) {
    selectedAssetId = "";
  }
  renderTagOptions(snapshot.tags || []);
  renderValidation(snapshot);
  renderAccordions(snapshot);
  renderTables(snapshot);
  renderMetadata(snapshot);
  renderOutput(snapshot);
}

function tagKeyFromInputValue(value, tags) {
  const normalized = normalizeText(value).toLowerCase();
  return tags.find((tag) => tag.name.toLowerCase() === normalized || tag.id.toLowerCase() === normalized)?.id || "";
}

function clearEditState() {
  editingAssetId = "";
  editingAssetType = "";
  draftAssetValues.clear();
  draftTagKeys.clear();
}

elements.accordions?.addEventListener("click", (event) => {
  const addType = event.target.closest("[data-asset-tool-add-type]");
  const view = event.target.closest("[data-asset-tool-view]");
  const edit = event.target.closest("[data-asset-tool-edit]");
  const deleteButton = event.target.closest("[data-asset-tool-delete]");
  const save = event.target.closest("[data-asset-tool-save]");
  const cancel = event.target.closest("[data-asset-tool-cancel]");
  const addTagToken = event.target.closest("[data-asset-tool-add-tag-token]");
  const removeTag = event.target.closest("[data-asset-tool-remove-tag]");

  if (addType) {
    editingAssetId = `__new__:${addType.dataset.assetToolAddType}`;
    editingAssetType = addType.dataset.assetToolAddType;
    selectedAssetId = "";
    setText(elements.log, `Adding ${editingAssetType} asset.`);
    render();
    return;
  }

  if (view) {
    selectedAssetId = view.dataset.assetToolView;
    repository.selectAsset(selectedAssetId);
    setText(elements.log, "Viewing asset catalog record.");
    render();
    return;
  }

  if (edit) {
    editingAssetId = edit.dataset.assetToolEdit;
    const row = edit.closest("[data-asset-tool-row]");
    editingAssetType = row?.dataset.assetToolAssetType || "";
    selectedAssetId = editingAssetId;
    repository.selectAsset(editingAssetId);
    setText(elements.log, "Editing asset catalog record.");
    render();
    return;
  }

  if (cancel) {
    clearEditState();
    setText(elements.log, "Asset edit canceled.");
    render();
    return;
  }

  if (addTagToken || removeTag) {
    const row = event.target.closest("[data-asset-tool-editing-row]");
    captureDraftAssetValues(row);
    const snapshot = repository.getSnapshot();
    const tagKeys = tagKeysForEditRow(row);
    if (addTagToken) {
      const input = row.querySelector("[data-asset-tool-tag-input]");
      const tagKey = tagKeyFromInputValue(input?.value, snapshot.tags || []);
      if (tagKey && !tagKeys.includes(tagKey)) {
        setTagKeysForEditRow(row, [...tagKeys, tagKey]);
        if (input) {
          input.value = "";
        }
        setText(elements.log, "Added shared tag reference.");
      } else {
        setText(elements.log, "Choose an existing tag from the shared Tags tool list.");
      }
    } else {
      setTagKeysForEditRow(row, tagKeys.filter((tagKey) => tagKey !== removeTag.dataset.assetToolRemoveTag));
      setText(elements.log, "Removed shared tag reference.");
    }
    render();
    return;
  }

  if (save) {
    const row = save.closest("[data-asset-tool-editing-row]");
    const assetType = row?.dataset.assetToolAssetType || editingAssetType;
    const result = save.dataset.assetToolSave === "__new__"
      ? repository.addAssetRecord(assetRowValues(row, assetType))
      : repository.updateAssetRecord(save.dataset.assetToolSave, assetRowValues(row, assetType));
    if (result.added || result.updated) {
      selectedAssetId = result.asset.id;
      clearEditState();
    }
    setText(elements.log, result.message);
    render();
    return;
  }

  if (deleteButton) {
    const result = repository.deleteAssetRecord(deleteButton.dataset.assetToolDelete);
    if (result.deleted) {
      clearEditState();
      selectedAssetId = "";
    }
    setText(elements.log, result.message);
    render();
  }
});

elements.accordions?.addEventListener("change", (event) => {
  const sourceInput = event.target.closest("[data-asset-tool-source-input]");
  const fileInput = event.target.closest("[data-asset-tool-file-input]");
  const referenceInput = event.target.closest("[data-asset-tool-reference-input]");

  if (sourceInput) {
    const row = editedRowForControl(sourceInput);
    captureDraftAssetValues(row);
    updateDraftValues(row, {
      fileName: "",
      reference: "",
      source: sourceInput.value
    });
    setText(elements.log, `Source set to ${sourceInput.value}.`);
    render();
    return;
  }

  if (fileInput) {
    const row = editedRowForControl(fileInput);
    const fileName = fileInput.files?.[0]?.name || "";
    updateDraftValues(row, {
      fileName,
      reference: "",
      source: UPLOAD_SOURCE
    });
    const display = row?.querySelector("[data-asset-tool-selected-file]");
    if (display) {
      display.textContent = fileName || "No file selected";
    }
    setText(elements.log, fileName ? `Selected upload file ${fileName}.` : "No upload file selected.");
    return;
  }

  if (referenceInput) {
    const row = editedRowForControl(referenceInput);
    updateDraftValues(row, {
      fileName: "",
      reference: referenceInput.value,
      source: REFERENCE_SOURCE
    });
    setText(elements.log, referenceInput.value ? "Reference source selected." : "Choose a valid reference source.");
  }
});

elements.reset?.addEventListener("click", () => {
  const result = repository.resetAssetLibrary();
  clearEditState();
  selectedAssetId = "";
  setText(elements.log, result.message);
  render();
});

render();
