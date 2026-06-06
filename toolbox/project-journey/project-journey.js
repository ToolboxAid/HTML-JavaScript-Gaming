import {
  PROJECT_JOURNEY_STATUS_BY_ID,
  PROJECT_JOURNEY_STATUSES,
  createProjectJourneyMockRepository,
} from "./project-journey-mock-repository.js";
import { getActiveToolRegistry } from "../toolRegistry.js";

const repository = createProjectJourneyMockRepository();
const registryTools = getActiveToolRegistry();
const params = new URLSearchParams(window.location.search);
const DELETE_CONFIRMATION_MESSAGE = "It is best to keep the note unless it was created by mistake.";
const FORGE_BOT_INDICATOR_SRC = "assets/theme-v2/images/forge-bot.svg";

const filterButtons = Array.from(document.querySelectorAll("[data-journey-filter]"));
const summaryBody = document.querySelector("[data-journey-summary-body]");
const itemTree = document.querySelector("[data-journey-item-tree]");
const selectedNoteMessage = document.querySelector("[data-journey-selected-note]");
const activeProjectMessage = document.querySelector("[data-journey-active-project]");
const editorForm = document.querySelector("[data-journey-editor-form]");
const statusInput = document.querySelector("[data-journey-status-input]");
const titleInput = document.querySelector("[data-journey-title-input]");
const addItemButton = document.querySelector("[data-journey-add-item]");
const updateItemButton = document.querySelector("[data-journey-update-item]");
const moveUpButton = document.querySelector("[data-journey-move-up]");
const moveDownButton = document.querySelector("[data-journey-move-down]");
const indentButton = document.querySelector("[data-journey-indent]");
const outdentButton = document.querySelector("[data-journey-outdent]");
const noteTypeSelect = document.querySelector("[data-journey-note-type-select]");
const typeInput = document.querySelector("[data-journey-type-input]");
const addTypeButton = document.querySelector("[data-journey-add-type]");
const typeStatus = document.querySelector("[data-journey-type-status]");
const editorStatus = document.querySelector("[data-journey-editor-status]");
const statScope = document.querySelector("[data-journey-stat-scope]");
const statusLegend = document.querySelector("[data-journey-status-legend]");
const suggestedTools = document.querySelector("[data-journey-suggested-tools]");
const recentActivity = document.querySelector("[data-journey-recent-activity]");
const diagnostics = document.querySelector("[data-journey-diagnostics]");

const statTargets = {
  open: document.querySelector("[data-journey-stat-open]"),
  total: document.querySelector("[data-journey-stat-total]"),
  "not-started": document.querySelector("[data-journey-stat-not-started]"),
  "in-progress": document.querySelector("[data-journey-stat-in-progress]"),
  complete: document.querySelector("[data-journey-stat-complete]"),
  blocker: document.querySelector("[data-journey-stat-blocker]"),
  decide: document.querySelector("[data-journey-stat-decide]"),
};

let activeFilter = "all";
let selectedSummaryNoteId = "note-design-pass";

function applyInitialProjectRoute() {
  const projectId = params.get("project");
  if (projectId === "none") {
    repository.clearActiveProject();
    return;
  }

  if (projectId) {
    repository.openProject(projectId);
  }

  if (params.get("templateDiagnostic") === "all") {
    repository.injectTemplateDiagnostics();
  }
}

function createElement(tagName, options = {}) {
  const element = document.createElement(tagName);
  if (options.className) {
    element.className = options.className;
  }
  if (options.text !== undefined) {
    element.textContent = options.text;
  }
  return element;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function setEditingDisabled(disabled) {
  [
    statusInput,
    titleInput,
    addItemButton,
    updateItemButton,
    moveUpButton,
    moveDownButton,
    indentButton,
    outdentButton,
    noteTypeSelect,
    typeInput,
    addTypeButton,
  ].forEach((control) => {
    if (control) {
      control.disabled = disabled;
    }
  });
}

function updateFilterButtons() {
  filterButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.journeyFilter === activeFilter));
  });
}

function renderStatusOptions() {
  statusInput.innerHTML = "";
  PROJECT_JOURNEY_STATUSES.forEach((status) => {
    const option = createElement("option", {
      text: `${status.icon} ${status.label}`,
    });
    option.value = status.id;
    statusInput.append(option);
  });
}

function renderStatusLegend() {
  statusLegend?.replaceChildren();
  PROJECT_JOURNEY_STATUSES.forEach((status) => {
    statusLegend?.append(
      createElement("span", {
        text: `${status.icon} ${status.label}`,
      }),
    );
  });
}

function renderNoteTypeOptions(note) {
  if (!noteTypeSelect) {
    return;
  }
  noteTypeSelect.innerHTML = "";
  repository.listNoteTypes().forEach((type) => {
    const option = createElement("option", { text: type.name });
    option.value = type.id;
    noteTypeSelect.append(option);
  });
  noteTypeSelect.value = note?.typeId || "";
}

function createStatusText(statusId) {
  const status = PROJECT_JOURNEY_STATUS_BY_ID[statusId];
  return status ? `${status.icon} ${status.label}` : "Unknown";
}

function getSelectedItem() {
  return repository.getSelectedItem();
}

function renderSummary(notes) {
  summaryBody.innerHTML = "";

  if (!notes.length) {
    const row = createElement("tr");
    const cell = createElement("td", {
      text: "No notes match the current Project Journey filter.",
    });
    cell.colSpan = 10;
    row.append(cell);
    summaryBody.append(row);
    return;
  }

  notes.forEach((note) => {
    const row = createElement("tr");
    const nameCell = createElement("td");
    const selected = selectedSummaryNoteId === note.id;
    const noteButton = createElement("button", {
      className: selected ? "btn btn--compact primary" : "btn btn--compact",
      text: note.name,
    });
    noteButton.type = "button";
    noteButton.dataset.journeyNoteButton = note.id;
    noteButton.setAttribute("aria-pressed", String(selected));
    if (selected) {
      noteButton.setAttribute("aria-current", "true");
    }
    nameCell.append(noteButton);
    row.append(
      nameCell,
      createElement("td", { text: note.type?.name || "Unknown" }),
      createElement("td", { text: String(note.counts["not-started"]) }),
      createElement("td", { text: String(note.counts.blocker) }),
      createElement("td", { text: String(note.counts.decide) }),
      createElement("td", { text: String(note.counts["in-progress"]) }),
      createElement("td", { text: String(note.counts.complete) }),
      createElement("td", { text: String(note.counts.open) }),
      createElement("td", { text: String(note.counts.total) }),
      createElement("td", { text: formatDate(note.updatedAt) }),
    );
    summaryBody.append(row);
  });
}

function makeItemButton(item) {
  const selectedItem = getSelectedItem();
  const selected = selectedItem?.itemId === item.itemId;
  const button = createElement("button", {
    className: selected ? "btn btn--compact primary tool-tree-row__content" : "btn btn--compact tool-tree-row__content",
    text: `${createStatusText(item.status)} ${item.title}`,
  });
  button.type = "button";
  button.dataset.journeyItemButton = item.itemId;
  button.setAttribute("aria-pressed", String(selected));
  return button;
}

function createSystemItemIndicator() {
  const indicator = createElement("img", {
    className: "tool-icon-32 tool-tree-row__action",
  });
  indicator.src = FORGE_BOT_INDICATOR_SRC;
  indicator.alt = "forge-bot created";
  indicator.title = "forge-bot created";
  indicator.width = 32;
  indicator.height = 32;
  indicator.dataset.journeySystemItemIndicator = "";
  return indicator;
}

function createDeleteItemButton(item) {
  const button = createElement("button", {
    className: "btn btn--compact tool-icon-button tool-tree-row__action",
  });
  const icon = createElement("span", {
    className: "fa fa-trash",
  });
  button.type = "button";
  button.title = "Delete user-created item";
  button.setAttribute("aria-label", "Delete user-created item");
  icon.setAttribute("aria-hidden", "true");
  button.append(icon);
  button.dataset.journeyDeleteItem = item.itemId;
  return button;
}

function makeItemRowContent(item) {
  const row = createElement("span", {
    className: "tool-tree-row",
  });
  row.dataset.journeyItemRow = item.itemId;
  row.append(makeItemButton(item));
  if (item.createdByType === "user") {
    row.append(createDeleteItemButton(item));
  } else {
    row.append(createSystemItemIndicator());
  }
  return row;
}

function makeSelectedItemDetails(item, editingDisabled) {
  const details = createElement("div", {
    className: "content-stack content-stack--compact",
  });
  details.dataset.journeySelectedItemDetails = item.itemId;

  if (item.createdByType === "system") {
    const guidance = createElement("div", {
      className: "status",
    });
    guidance.dataset.journeySystemGuidance = "";
    const heading = createElement("strong", { text: "System Guidance" });
    const body = createElement("p", {
      text: item.systemGuidance || "System guidance is unavailable until the linked template is repaired.",
    });
    guidance.append(heading, body);
    details.append(guidance);
  }

  const label = createElement("label");
  label.setAttribute("for", "journeyItemDetailsInput");
  label.textContent = "Item Details";
  const textarea = createElement("textarea");
  textarea.id = "journeyItemDetailsInput";
  textarea.rows = 4;
  textarea.value = item.userDetails || "";
  textarea.disabled = editingDisabled;
  textarea.dataset.journeyItemDetailsInput = "";
  details.append(label, textarea);
  return details;
}

function renderItemTree(note, editingDisabled) {
  itemTree.innerHTML = "";

  if (!note || !note.items.length) {
    itemTree.append(createElement("p", { text: "No journey items yet." }));
    return;
  }

  const selectedItem = getSelectedItem();
  const root = createElement("ul", {
    className: "tool-tree--compact",
  });
  root.setAttribute("role", "tree");
  const lists = [root];
  const lastItems = [];

  note.items.forEach((item) => {
    let indent = Math.max(0, Math.min(Number(item.indent) || 0, 4));
    if (indent > lastItems.length) {
      indent = lastItems.length;
    }

    while (lists.length > indent + 1) {
      lists.pop();
      lastItems.pop();
    }

    if (indent > 0 && !lists[indent]) {
      const parent = lastItems[indent - 1];
      if (parent) {
        const childList = createElement("ul");
        parent.append(childList);
        lists[indent] = childList;
      }
    }

    const itemElement = createElement("li");
    itemElement.setAttribute("role", "treeitem");
    itemElement.append(makeItemRowContent(item));
    if (selectedItem?.itemId === item.itemId) {
      itemElement.append(makeSelectedItemDetails(item, editingDisabled));
    }
    lists[indent].append(itemElement);
    lastItems[indent] = itemElement;
  });

  itemTree.append(root);
}

function renderEditor(editingDisabled) {
  const selectedItem = getSelectedItem();
  if (!selectedItem) {
    statusInput.value = "not-started";
    titleInput.value = "";
    titleInput.disabled = true;
    if (editorStatus) {
      editorStatus.textContent = "Select a journey item to review ownership.";
    }
    return;
  }

  statusInput.value = selectedItem.status;
  titleInput.value = selectedItem.title;
  titleInput.disabled = Boolean(editingDisabled || selectedItem.createdByType === "system");
  if (editorStatus) {
    editorStatus.textContent =
      selectedItem.createdByType === "system"
        ? `System-created item. Title and guidance are template-owned by ${selectedItem.template?.templateKey || selectedItem.templateId || "missing template"}; status and Item Details are editable. Original meaning: ${selectedItem.originalMeaning || "Unavailable"}`
        : "User-created item. Title, status, and Item Details are editable.";
  }
}

function emptyCounts() {
  return {
    total: 0,
    open: 0,
    "not-started": 0,
    "in-progress": 0,
    complete: 0,
    blocker: 0,
    decide: 0,
  };
}

function aggregateCounts(notes) {
  return notes.reduce((counts, note) => {
    Object.keys(counts).forEach((key) => {
      counts[key] += note.counts?.[key] || 0;
    });
    return counts;
  }, emptyCounts());
}

function activeFilterLabel() {
  return (
    filterButtons.find((button) => button.dataset.journeyFilter === activeFilter)?.textContent?.trim() ||
    "All Notes"
  );
}

function renderStatScope(selectedStatsNote, notes) {
  if (!statScope) {
    return;
  }
  if (selectedStatsNote) {
    statScope.textContent = `Statistics for selected note: ${selectedStatsNote.name}.`;
    return;
  }
  statScope.textContent = `Statistics for filtered result set: ${activeFilterLabel()} (${notes.length} notes).`;
}

function renderStats(counts) {
  Object.entries(statTargets).forEach(([key, target]) => {
    if (target) {
      target.textContent = String(counts[key] || 0);
    }
  });
}

function findToolByName(name) {
  return registryTools.find((tool) => tool.displayName === name || tool.name === name);
}

function getSuggestedToolNames(note) {
  if (!note) {
    return ["Project Workspace"];
  }

  const selectedItem = getSelectedItem();
  const templateToolNames = selectedItem?.linkedToolContexts?.filter((context) =>
    registryTools.some((tool) => tool.displayName === context || tool.name === context),
  ) || [];
  const suggestionsByType = {
    design: ["Game Design", "Colors", "Assets"],
    story: ["Game Design", "Project Workspace", "AI Assistant"],
    release: ["Publish", "Game Testing", "Project Workspace"],
    research: ["AI Assistant", "Game Design", "Project Workspace"],
    idea: ["AI Assistant", "Game Design", "Assets"],
    question: ["AI Assistant", "Project Workspace", "Game Design"],
    task: ["Project Workspace", "Game Testing", "Debug"],
  };
  const names = [...templateToolNames, ...(suggestionsByType[note.typeId] || ["Project Workspace", "Game Design"])];

  if (note.counts?.blocker > 0) {
    return ["Project Workspace", "Debug", ...names];
  }

  return names;
}

function groupSlug(groupName) {
  return String(groupName || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function renderSuggestedTools(note) {
  suggestedTools.innerHTML = "";
  const seen = new Set();
  const toolNames = getSuggestedToolNames(note);
  const matchedTools = toolNames
    .map(findToolByName)
    .filter(Boolean)
    .filter((tool) => {
      if (seen.has(tool.id)) {
        return false;
      }
      seen.add(tool.id);
      return true;
    });

  if (!matchedTools.length) {
    suggestedTools.append(
      createElement("p", {
        text: "No suggested tools are available for the selected note yet.",
      }),
    );
    return;
  }

  matchedTools.forEach((tool) => {
    const link = createElement("a", {
      className: "btn btn--compact",
      text: tool.displayName || tool.name,
    });
    const group = groupSlug(tool.toolboxGroup || tool.category);
    link.href = `toolbox/index.html?view=group&group=${encodeURIComponent(group)}&context=project-journey&tool=${encodeURIComponent(tool.id)}`;
    suggestedTools.append(link);
  });
}

function renderRecentActivity() {
  recentActivity.innerHTML = "";
  const activity = repository.listRecentActivity();
  if (!activity.length) {
    recentActivity.append(
      createElement("p", {
        text: "No Project Journey activity is available for the active project yet.",
      }),
    );
    return;
  }

  const list = createElement("ul");
  activity.forEach((item) => {
    list.append(
      createElement("li", {
        text: `${item.message} (${formatDate(item.createdAt)})`,
      }),
    );
  });
  recentActivity.append(list);
}

function renderDiagnostics(activeProject, note, notes) {
  diagnostics.innerHTML = "";
  const messages = [];

  if (!activeProject) {
    messages.push("No active project is open. Open a project in Project Workspace to enable editing.");
  } else {
    messages.push(`Active project: ${activeProject.name}.`);
  }

  if (activeProject && !notes.length) {
    messages.push("The selected filter has no matching notes; switch filters or add items to an existing note.");
  }

  if (note) {
    const selectedItem = getSelectedItem();
    messages.push(`Selected note: ${note.name}.`);
    messages.push(`Total counts every item; Open counts ${PROJECT_JOURNEY_STATUS_BY_ID["not-started"].icon}, ${PROJECT_JOURNEY_STATUS_BY_ID.blocker.icon}, ${PROJECT_JOURNEY_STATUS_BY_ID.decide.icon}, and ${PROJECT_JOURNEY_STATUS_BY_ID["in-progress"].icon} items.`);
    if (selectedItem) {
      messages.push(`Selected item updatedByType: ${selectedItem.updatedByType}.`);
      messages.push(`Selected item createdByType: ${selectedItem.createdByType}.`);
    }
  }

  const templateDiagnostics = activeProject ? repository.getTemplateDiagnostics() : [];
  if (templateDiagnostics.length) {
    templateDiagnostics.forEach((diagnostic) => messages.push(diagnostic.message));
  } else if (activeProject) {
    messages.push("All system-created Project Journey items resolve active templates.");
  }

  const list = createElement("ul");
  messages.forEach((message) => {
    list.append(createElement("li", { text: message }));
  });
  diagnostics.append(list);
}

function selectFirstVisibleNote(notes) {
  const current = repository.getSelectedNote();
  if (current && notes.some((note) => note.id === current.id)) {
    return current;
  }

  if (notes[0]) {
    return repository.selectNote(notes[0].id);
  }

  return current;
}

function render() {
  const activeProject = repository.getActiveProject();
  const notes = repository.listNotes(activeFilter);
  const note = selectFirstVisibleNote(notes);
  const selectedStatsNote = selectedSummaryNoteId
    ? notes.find((item) => item.id === selectedSummaryNoteId) || null
    : null;
  const statCounts = selectedStatsNote ? selectedStatsNote.counts : aggregateCounts(notes);
  const editingDisabled = !activeProject || !note;

  activeProjectMessage.textContent = activeProject
    ? `Active project: ${activeProject.name}.`
    : "No active project is open. Editing actions are disabled.";
  selectedNoteMessage.textContent = note
    ? `${note.name} (${note.type?.name || "Unknown"})`
    : "Choose a note from the summary table.";

  setEditingDisabled(editingDisabled);
  updateFilterButtons();
  renderNoteTypeOptions(note);
  renderSummary(notes);
  renderItemTree(note, editingDisabled);
  renderEditor(editingDisabled);
  renderStatScope(selectedStatsNote, notes);
  renderStats(statCounts);
  renderSuggestedTools(note);
  renderRecentActivity();
  renderDiagnostics(activeProject, note, notes);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.journeyFilter || "all";
    selectedSummaryNoteId = "";
    render();
  });
});

summaryBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-journey-note-button]");
  if (!button) {
    return;
  }
  selectedSummaryNoteId = button.dataset.journeyNoteButton;
  repository.selectNote(selectedSummaryNoteId);
  render();
});

itemTree.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-journey-delete-item]");
  if (deleteButton) {
    event.preventDefault();
    event.stopPropagation();
    if (!window.confirm(DELETE_CONFIRMATION_MESSAGE)) {
      return;
    }
    repository.deleteItem(deleteButton.dataset.journeyDeleteItem);
    render();
    return;
  }

  const button = event.target.closest("[data-journey-item-button]");
  if (!button) {
    return;
  }
  repository.selectItem(button.dataset.journeyItemButton);
  render();
});

itemTree.addEventListener("input", (event) => {
  const detailsInput = event.target.closest("[data-journey-item-details-input]");
  if (!detailsInput) {
    return;
  }
  const selectedItem = getSelectedItem();
  if (!selectedItem) {
    return;
  }
  repository.updateItem(selectedItem.itemId, {
    userDetails: detailsInput.value,
  });
  renderDiagnostics(repository.getActiveProject(), repository.getSelectedNote(), repository.listNotes(activeFilter));
});

addItemButton.addEventListener("click", () => {
  const selectedItem = getSelectedItem();
  repository.addItem({
    title: selectedItem?.createdByType === "system" ? "" : titleInput.value,
    status: statusInput.value,
    userDetails: "",
    indent: selectedItem?.indent || 0,
  });
  render();
});

editorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const selectedItem = getSelectedItem();
  if (!selectedItem) {
    return;
  }

  const detailsInput = itemTree.querySelector("[data-journey-item-details-input]");
  repository.updateItem(selectedItem.itemId, {
    title: titleInput.value,
    status: statusInput.value,
    userDetails: detailsInput?.value || selectedItem.userDetails || "",
  });
  render();
});

moveUpButton.addEventListener("click", () => {
  repository.moveSelectedItem(-1);
  render();
});

moveDownButton.addEventListener("click", () => {
  repository.moveSelectedItem(1);
  render();
});

indentButton.addEventListener("click", () => {
  repository.changeSelectedIndent(1);
  render();
});

outdentButton.addEventListener("click", () => {
  repository.changeSelectedIndent(-1);
  render();
});

noteTypeSelect.addEventListener("change", () => {
  repository.updateSelectedNoteType(noteTypeSelect.value);
  render();
});

addTypeButton.addEventListener("click", () => {
  const result = repository.addNoteType(typeInput.value);
  typeStatus.textContent = result.message;
  if (result.created) {
    typeInput.value = "";
  }
  render();
});

renderStatusOptions();
renderStatusLegend();
applyInitialProjectRoute();
render();
