import {
  createServerRepositoryClient,
  readServerToolConstants,
  requireServerConstant,
} from "../../../../src/api/server-api-client.js";

const constants = readServerToolConstants("tags");

export const TAGS_TOOL_TABLES = Object.freeze(requireServerConstant(constants, "TAGS_TOOL_TABLES", "tags"));

export function createTagsToolApiRepository(options = {}) {
  return createServerRepositoryClient("tags", options);
}

const repository = createTagsToolApiRepository();

const elements = {
  add: document.querySelector("[data-tags-add]"),
  count: document.querySelector("[data-tags-count]"),
  log: document.querySelector("[data-tags-log]"),
  outputStatus: document.querySelector("[data-tags-output-status]"),
  selected: document.querySelector("[data-tags-selected]"),
  status: document.querySelector("[data-tags-status]"),
  table: document.querySelector("[data-tags-table]"),
  tableCounts: document.querySelector("[data-tags-table-counts]"),
  usageCount: document.querySelector("[data-tags-usage-count]"),
};

let editingTagId = "";
let expandedTagId = "";
let selectedTagName = "None";

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

function editingValues(row) {
  return {
    description: row.querySelector("[data-tags-description-input]")?.value || "",
    name: row.querySelector("[data-tags-name-input]")?.value || "",
  };
}

function createEditRow(tag = null) {
  const row = document.createElement("tr");
  row.dataset.tagsEditingRow = tag?.id || "__new__";

  const nameCell = document.createElement("td");
  nameCell.append(createInput(tag?.name || "", "Tag Name", "tagsNameInput"));

  const descriptionCell = document.createElement("td");
  descriptionCell.append(createInput(tag?.description || "", "Description", "tagsDescriptionInput"));

  const usageCell = createCell(tag ? String(tag.usageCount || 0) : "0");

  const actionsCell = document.createElement("td");
  const actions = document.createElement("div");
  actions.className = "action-group action-group--tight";
  actions.append(
    createButton("Save", "tagsSave", tag?.id || "__new__"),
    createButton("Cancel", "tagsCancel", tag?.id || "__new__")
  );
  actionsCell.append(actions);

  row.append(nameCell, descriptionCell, usageCell, actionsCell);
  return row;
}

function createUsageCountButton(tag) {
  const cell = document.createElement("td");
  const button = createButton(String(tag.usageCount || 0), "tagsToggleUsage", tag.id);
  button.setAttribute("aria-expanded", String(expandedTagId === tag.id));
  button.setAttribute("aria-label", `Show usage for ${tag.name}`);
  cell.append(button);
  return cell;
}

function createTagRow(tag) {
  if (editingTagId === tag.id) {
    return createEditRow(tag);
  }

  const row = document.createElement("tr");
  row.dataset.tagsRow = tag.id;

  const actionsCell = document.createElement("td");
  const actions = document.createElement("div");
  actions.className = "action-group action-group--tight";
  actions.append(
    createButton("Edit", "tagsEdit", tag.id),
    createButton("Trash", "tagsDelete", tag.id)
  );
  actionsCell.append(actions);

  row.append(
    createCell(tag.name),
    createCell(tag.description || "No description"),
    createUsageCountButton(tag),
    actionsCell
  );
  return row;
}

function createUsageRow(tag) {
  const row = document.createElement("tr");
  row.dataset.tagsUsageRow = tag.id;

  const cell = document.createElement("td");
  cell.colSpan = 4;

  const wrapper = document.createElement("div");
  wrapper.className = "table-wrapper";

  const table = document.createElement("table");
  table.className = "data-table";
  table.setAttribute("aria-label", `${tag.name} usage`);

  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  headRow.append(createCell("Tool"), createCell("Item Name"));
  head.append(headRow);

  const body = document.createElement("tbody");
  if (!tag.usage.length) {
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = 2;
    emptyCell.textContent = "No usage yet.";
    emptyRow.append(emptyCell);
    body.append(emptyRow);
  } else {
    tag.usage.forEach((usage) => {
      const usageRow = document.createElement("tr");
      usageRow.append(createCell(usage.tool), createCell(usage.itemName));
      body.append(usageRow);
    });
  }

  table.append(head, body);
  wrapper.append(table);
  cell.append(wrapper);
  row.append(cell);
  return row;
}

function renderTable(snapshot) {
  if (!elements.table) {
    return;
  }

  elements.table.replaceChildren();
  if (editingTagId === "__new__") {
    elements.table.append(createEditRow());
  }

  if (!snapshot.tags.length && editingTagId !== "__new__") {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.textContent = "No tags added yet.";
    row.append(cell);
    elements.table.append(row);
    return;
  }

  snapshot.tags.forEach((tag) => {
    elements.table.append(createTagRow(tag));
    if (expandedTagId === tag.id) {
      elements.table.append(createUsageRow(tag));
    }
  });
}

function renderTableCounts(snapshot) {
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

function render() {
  const snapshot = repository.getSnapshot();
  const usageCount = snapshot.tags.reduce((total, tag) => total + tag.usageCount, 0);
  setText(elements.status, snapshot.status);
  setText(elements.outputStatus, snapshot.status);
  setText(elements.count, String(snapshot.tags.length));
  setText(elements.usageCount, String(usageCount));
  setText(elements.selected, selectedTagName);
  if (elements.add) {
    elements.add.disabled = editingTagId === "__new__";
  }
  renderTable(snapshot);
  renderTableCounts(snapshot);
}

elements.add?.addEventListener("click", () => {
  editingTagId = "__new__";
  expandedTagId = "";
  selectedTagName = "New tag";
  setText(elements.log, "Adding a workspace tag.");
  render();
});

elements.table?.addEventListener("click", (event) => {
  const edit = event.target.closest("[data-tags-edit]");
  const save = event.target.closest("[data-tags-save]");
  const cancel = event.target.closest("[data-tags-cancel]");
  const deleteButton = event.target.closest("[data-tags-delete]");
  const toggleUsage = event.target.closest("[data-tags-toggle-usage]");

  if (toggleUsage) {
    const tagId = toggleUsage.dataset.tagsToggleUsage;
    expandedTagId = expandedTagId === tagId ? "" : tagId;
    selectedTagName = toggleUsage.closest("[data-tags-row]")?.firstElementChild?.textContent || selectedTagName;
    render();
    return;
  }

  if (edit) {
    editingTagId = edit.dataset.tagsEdit;
    expandedTagId = "";
    selectedTagName = edit.closest("[data-tags-row]")?.firstElementChild?.textContent || "Selected tag";
    setText(elements.log, `Editing ${selectedTagName}.`);
    render();
    return;
  }

  if (cancel) {
    editingTagId = "";
    selectedTagName = "None";
    setText(elements.log, "Tag edit canceled.");
    render();
    return;
  }

  if (save) {
    const row = save.closest("[data-tags-editing-row]");
    const values = editingValues(row);
    const result = save.dataset.tagsSave === "__new__"
      ? repository.addTag(values)
      : repository.updateTag(save.dataset.tagsSave, values);
    if (result.added || result.updated) {
      editingTagId = "";
      selectedTagName = result.tag?.name || "None";
    }
    setText(elements.log, result.message);
    render();
    return;
  }

  if (deleteButton) {
    const result = repository.deleteTag(deleteButton.dataset.tagsDelete);
    if (result.deleted) {
      editingTagId = "";
      expandedTagId = "";
      selectedTagName = "None";
    }
    setText(elements.log, result.message);
    render();
  }
});

render();
