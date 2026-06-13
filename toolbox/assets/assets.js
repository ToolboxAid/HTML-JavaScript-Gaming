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
  return {
    assetType,
    description: row.querySelector("[data-asset-tool-description-input]")?.value || "",
    name: row.querySelector("[data-asset-tool-name-input]")?.value || "",
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

function createEditRow(assetType, asset = null, tags = []) {
  const row = document.createElement("tr");
  const rowId = asset?.id || `__new__:${assetType}`;
  const draftValues = draftAssetValues.get(rowId) || {};
  row.dataset.assetToolEditingRow = rowId;
  row.dataset.assetToolAssetType = assetType;
  if (!draftTagKeys.has(rowId)) {
    draftTagKeys.set(rowId, assetTags(asset));
  }

  const nameCell = document.createElement("td");
  nameCell.append(createInput(draftValues.name ?? asset?.name ?? "", "Asset Name", "assetToolNameInput"));

  const usageCell = document.createElement("td");
  usageCell.append(createUsageSelect(draftValues.usage ?? asset?.usage));

  const descriptionCell = document.createElement("td");
  descriptionCell.append(createInput(draftValues.description ?? asset?.description ?? "", "Description", "assetToolDescriptionInput"));

  const tagsCell = document.createElement("td");
  tagsCell.append(createTagEditor(tagKeysForEditRow(row), tags));

  const actionsCell = document.createElement("td");
  const actions = document.createElement("div");
  actions.className = "action-group action-group--tight";
  actions.append(
    createButton("Save", "assetToolSave", asset?.id || "__new__"),
    createButton("Cancel", "assetToolCancel", asset?.id || "__new__")
  );
  actionsCell.append(actions);

  row.append(nameCell, usageCell, descriptionCell, tagsCell, actionsCell);
  return row;
}

function createAssetRow(asset, tags) {
  if (editingAssetId === asset.id) {
    return createEditRow(asset.assetType || asset.type || "Images", asset, tags);
  }

  const row = document.createElement("tr");
  row.dataset.assetToolRow = asset.id;
  row.dataset.assetToolAssetType = asset.assetType || asset.type || "Images";

  if (selectedAssetId === asset.id) {
    row.dataset.assetToolSelectedRow = "true";
  }

  const tagsCell = document.createElement("td");
  tagsCell.append(createTagTokens(assetTags(asset), tags));

  const actionsCell = document.createElement("td");
  const actions = document.createElement("div");
  actions.className = "action-group action-group--tight";
  actions.append(
    createButton("View", "assetToolView", asset.id),
    createButton("Edit", "assetToolEdit", asset.id),
    createButton("Trash", "assetToolDelete", asset.id)
  );
  actionsCell.append(actions);

  row.append(
    createCell(asset.name),
    createCell(asset.usage),
    createCell(asset.description || "No description"),
    tagsCell,
    actionsCell
  );
  return row;
}

function createAssetTypeTable(assetType, assets, tags) {
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrapper";

  const table = document.createElement("table");
  table.className = "data-table";
  table.setAttribute("aria-label", `${assetType} assets`);
  table.dataset.assetTypeTable = assetType;

  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  ["Asset Name", "Usage", "Description", "Asset Tags", "Actions"].forEach((label) => {
    const heading = document.createElement("th");
    heading.scope = "col";
    heading.textContent = label;
    headRow.append(heading);
  });
  head.append(headRow);

  const body = document.createElement("tbody");
  body.dataset.assetTypeBody = assetType;

  if (editingAssetId === `__new__:${assetType}`) {
    body.append(createEditRow(assetType, null, tags));
  }

  if (!assets.length && editingAssetId !== `__new__:${assetType}`) {
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = 5;
    emptyCell.textContent = `No ${assetType} assets added yet.`;
    emptyRow.append(emptyCell);
    body.append(emptyRow);
  }

  assets.forEach((asset) => body.append(createAssetRow(asset, tags)));

  table.append(head, body);
  wrapper.append(table);
  return wrapper;
}

function createAssetTypeAccordion(assetType, assets, tags) {
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

  body.append(actions, createAssetTypeTable(assetType, assets, tags));
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
    createAssetTypeAccordion(assetType, snapshot.assetsByType?.[assetType] || [], snapshot.tags || [])
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
  [
    `Type: ${asset.assetType || asset.type}`,
    `Usage: ${asset.usage}`,
    `Description: ${asset.description || "No description"}`,
    `Tags: ${assetTags(asset).map((tagKey) => tagNameForKey(snapshot.tags || [], tagKey)).join(", ") || "No tags"}`,
    `Stored path: ${asset.storedPath || asset.path}`,
  ].forEach((line) => {
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

elements.reset?.addEventListener("click", () => {
  const result = repository.resetAssetLibrary();
  clearEditState();
  selectedAssetId = "";
  setText(elements.log, result.message);
  render();
});

render();
