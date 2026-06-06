import {
  PROJECT_JOURNEY_CURRENT_USER_ID,
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
const entryTree = document.querySelector("[data-journey-entry-tree]");
const selectedNoteMessage = document.querySelector("[data-journey-selected-note]");
const activeProjectMessage = document.querySelector("[data-journey-active-project]");
const editorForm = document.querySelector("[data-journey-editor-form]");
const statusInput = document.querySelector("[data-journey-status-input]");
const entryTextInput = document.querySelector("[data-journey-entry-text-input]");
const addRowButton = document.querySelector("[data-journey-add-row]");
const updateRowButton = document.querySelector("[data-journey-update-row]");
const moveUpButton = document.querySelector("[data-journey-move-up]");
const moveDownButton = document.querySelector("[data-journey-move-down]");
const indentButton = document.querySelector("[data-journey-indent]");
const outdentButton = document.querySelector("[data-journey-outdent]");
const freeformNotes = document.querySelector("[data-journey-freeform-notes]");
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
    entryTextInput,
    addRowButton,
    updateRowButton,
    moveUpButton,
    moveDownButton,
    indentButton,
    outdentButton,
    freeformNotes,
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

function createStatusText(statusId) {
  const status = PROJECT_JOURNEY_STATUS_BY_ID[statusId];
  return status ? `${status.icon} ${status.label}` : "Unknown";
}

function getSelectedEntry() {
  return repository.getSelectedEntry();
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

function makeEntryButton(entry) {
  const selectedEntry = getSelectedEntry();
  const selected = selectedEntry?.id === entry.id;
  const button = createElement("button", {
    className: selected ? "btn btn--compact primary" : "btn btn--compact",
    text: `${createStatusText(entry.statusId)} ${entry.text}`,
  });
  button.type = "button";
  button.dataset.journeyEntryButton = entry.id;
  button.setAttribute("aria-pressed", String(selected));
  return button;
}

function createSystemEntryIndicator() {
  const indicator = createElement("img");
  indicator.className = "brand-color-swatch";
  indicator.src = FORGE_BOT_INDICATOR_SRC;
  indicator.alt = "forge-bot created";
  indicator.title = "forge-bot created";
  indicator.dataset.journeySystemEntryIndicator = "";
  return indicator;
}

function createDeleteEntryButton(entry) {
  const button = createElement("button", {
    className: "btn btn--compact",
  });
  const icon = createElement("span", {
    className: "fa fa-trash",
  });
  button.type = "button";
  button.title = "Delete user-created row";
  button.setAttribute("aria-label", "Delete user-created row");
  icon.setAttribute("aria-hidden", "true");
  button.append(icon);
  button.dataset.journeyDeleteEntry = entry.id;
  return button;
}

function makeEntryRowContent(entry) {
  const row = createElement("span", {
    className: "action-group action-group--tight",
  });
  row.dataset.journeyEntryRow = entry.id;
  row.append(makeEntryButton(entry));
  if (entry.createdByType === "user") {
    row.append(createDeleteEntryButton(entry));
  } else {
    row.append(createSystemEntryIndicator());
  }
  return row;
}

function renderEntryTree(note) {
  entryTree.innerHTML = "";

  if (!note || !note.entries.length) {
    entryTree.append(createElement("p", { text: "No journey entries yet." }));
    return;
  }

  const root = createElement("ul");
  root.setAttribute("role", "tree");
  const lists = [root];
  const lastItems = [];

  note.entries.forEach((entry) => {
    let indent = Math.max(0, Math.min(Number(entry.indent) || 0, 4));
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

    const item = createElement("li");
    item.setAttribute("role", "treeitem");
    item.append(makeEntryRowContent(entry));
    lists[indent].append(item);
    lastItems[indent] = item;
  });

  entryTree.append(root);
}

function renderEditor(editingDisabled) {
  const selectedEntry = getSelectedEntry();
  if (!selectedEntry) {
    statusInput.value = "not-started";
    entryTextInput.value = "";
    if (editorStatus) {
      editorStatus.textContent = "Select a journey row to review ownership.";
    }
    return;
  }

  statusInput.value = selectedEntry.statusId;
  entryTextInput.value = selectedEntry.text;
  if (editorStatus) {
    editorStatus.textContent =
      selectedEntry.createdByType === "system"
        ? `System-created row. Original meaning: ${selectedEntry.originalSystemMeaning || selectedEntry.text}`
        : `User-created row by ${selectedEntry.createdBy || PROJECT_JOURNEY_CURRENT_USER_ID}.`;
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

  const suggestionsByType = {
    design: ["Game Design", "Colors", "Assets"],
    story: ["Game Design", "Project Workspace", "AI Assistant"],
    release: ["Publish", "Game Testing", "Project Workspace"],
    research: ["AI Assistant", "Game Design", "Project Workspace"],
    idea: ["AI Assistant", "Game Design", "Assets"],
    question: ["AI Assistant", "Project Workspace", "Game Design"],
    task: ["Project Workspace", "Game Testing", "Debug"],
  };
  const names = suggestionsByType[note.typeId] || ["Project Workspace", "Game Design"];

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
    messages.push(`Current mock user: ${PROJECT_JOURNEY_CURRENT_USER_ID}.`);
  }

  if (activeProject && !notes.length) {
    messages.push("The selected filter has no matching notes; switch filters or add rows to an existing note.");
  }

  if (note) {
    messages.push(`Selected note: ${note.name}.`);
    messages.push(`Total counts every row; Open counts ⬜, ⛔, ❓, and 🟡 rows.`);
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
  freeformNotes.value = note?.freeformNotes || "";

  setEditingDisabled(editingDisabled);
  updateFilterButtons();
  renderSummary(notes);
  renderEntryTree(note);
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

entryTree.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-journey-delete-entry]");
  if (deleteButton) {
    event.preventDefault();
    event.stopPropagation();
    if (!window.confirm(DELETE_CONFIRMATION_MESSAGE)) {
      return;
    }
    repository.deleteEntry(deleteButton.dataset.journeyDeleteEntry);
    render();
    return;
  }

  const button = event.target.closest("[data-journey-entry-button]");
  if (!button) {
    return;
  }
  repository.selectEntry(button.dataset.journeyEntryButton);
  render();
});

addRowButton.addEventListener("click", () => {
  const selectedEntry = getSelectedEntry();
  repository.addEntry({
    text: entryTextInput.value,
    statusId: statusInput.value,
    indent: selectedEntry?.indent || 0,
  });
  render();
});

editorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const selectedEntry = getSelectedEntry();
  if (!selectedEntry) {
    return;
  }

  repository.updateEntry(selectedEntry.id, {
    text: entryTextInput.value,
    statusId: statusInput.value,
  });
  render();
});

moveUpButton.addEventListener("click", () => {
  repository.moveSelectedEntry(-1);
  render();
});

moveDownButton.addEventListener("click", () => {
  repository.moveSelectedEntry(1);
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

freeformNotes.addEventListener("input", () => {
  repository.updateSelectedNoteFreeform(freeformNotes.value);
  const note = repository.getSelectedNote();
  const notes = repository.listNotes(activeFilter);
  const selectedStatsNote = selectedSummaryNoteId
    ? notes.find((item) => item.id === selectedSummaryNoteId) || null
    : null;
  renderStatScope(selectedStatsNote, notes);
  renderStats(selectedStatsNote ? selectedStatsNote.counts : aggregateCounts(notes));
  renderDiagnostics(repository.getActiveProject(), note, notes);
});

addTypeButton.addEventListener("click", () => {
  const type = repository.addNoteType(typeInput.value);
  typeStatus.textContent = type
    ? `${type.name} is available in the mock note type table.`
    : "Enter a type name to add it to the mock note type table.";
  if (type) {
    typeInput.value = "";
  }
});

renderStatusOptions();
renderStatusLegend();
applyInitialProjectRoute();
render();
