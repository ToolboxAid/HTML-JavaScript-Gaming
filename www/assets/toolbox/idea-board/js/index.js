import { createServerRepositoryClient } from "../../../../../src/api/server-api-client.js";
import { getSessionCurrent } from "../../../../../src/api/session-api-client.js";
import { createThemeIcon, themeIconFileName } from "../../../theme-v2/js/theme-icons.js";

const editableStatusOptions = Object.freeze(["New", "Exploring", "Refining", "Ready"]);
const filterStatusOptions = Object.freeze(["New", "Exploring", "Refining", "Ready", "Project", "Archived"]);
const defaultVisibleStatuses = Object.freeze(["New", "Exploring", "Refining", "Ready", "Project"]);
const userId = "user-1";
const gameHubRoute = "toolbox/game-hub/index.html";
const signInRoute = "account/sign-in.html";
let gameHubRepository = null;

const ideaTable = [
  {
    ideaId: "top-thoughts",
    userId,
    idea: "Top Thoughts",
    pitch: "Smartest person wins...",
    status: "Exploring",
    updated: "2026-06-20",
  },
  {
    ideaId: "sky-orchard",
    userId,
    idea: "Sky Orchard",
    pitch: "Grow floating islands...",
    status: "Exploring",
    updated: "2026-06-20",
  },
  {
    ideaId: "clockwork-courier",
    userId,
    idea: "Clockwork Courier",
    pitch: "Deliver messages through looping city...",
    status: "New",
    updated: "2026-06-20",
  },
];

const noteTable = [
  {
    noteId: "top-system-origin",
    ideaId: "top-thoughts",
    note: "Keep the sharpest premise at the top of the board.",
    system: true,
    updated: "2026-06-20",
  },
  {
    noteId: "top-creator-win-condition",
    ideaId: "top-thoughts",
    note: "Define how players prove they made the smartest move.",
    system: false,
    updated: "2026-06-20",
  },
  {
    noteId: "top-creator-opponent",
    ideaId: "top-thoughts",
    note: "List opponent behaviors that make clever play visible.",
    system: false,
    updated: "2026-06-20",
  },
  {
    noteId: "sky-system-origin",
    ideaId: "sky-orchard",
    note: "Compare early Sky Orchard ideas before creating a project.",
    system: true,
    updated: "2026-06-20",
  },
  {
    noteId: "sky-creator-loop",
    ideaId: "sky-orchard",
    note: "Ask whether the core loop is resource planning, action defense, or both.",
    system: false,
    updated: "2026-06-20",
  },
  {
    noteId: "sky-creator-storm",
    ideaId: "sky-orchard",
    note: "Prototype the storm creature escalation table.",
    system: false,
    updated: "2026-06-20",
  },
];

const state = {
  expandedIdeaId: null,
  editingIdeaId: null,
  editingNoteId: null,
  addingIdea: false,
  addingNoteIdeaId: null,
  visibleStatuses: new Set(defaultVisibleStatuses),
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function ideaRecord(ideaId) {
  return ideaTable.find((record) => record.ideaId === ideaId) || null;
}

function notesForIdea(ideaId) {
  return noteTable.filter((record) => record.ideaId === ideaId);
}

function noteCountLabel(ideaId) {
  const count = notesForIdea(ideaId).length;
  return `${count} ${count === 1 ? "Note" : "Notes"}`;
}

function isArchived(record) {
  return record.status === "Archived";
}

function isProject(record) {
  return record.status === "Project";
}

function isLockedIdea(record) {
  return Boolean(record && (isProject(record) || isArchived(record)));
}

function visibleIdeas() {
  return ideaTable.filter((record) => state.visibleStatuses.has(record.status));
}

function previousStatusForRestore(record) {
  return filterStatusOptions.includes(record.previousStatus) && record.previousStatus !== "Archived"
    ? record.previousStatus
    : "Refining";
}

function isEditableStatus(status) {
  return editableStatusOptions.includes(status);
}

function rememberPreviousStatus(record) {
  if (record.status !== "Archived") {
    record.previousStatus = record.status;
  }
}

function canDeleteIdea(record) {
  return !isProject(record) || isArchived(record);
}

function isRepositoryErrorResult(value) {
  return Boolean(value && typeof value === "object" && value.error === true);
}

function gameHubProjectRepository() {
  if (!gameHubRepository) {
    gameHubRepository = createServerRepositoryClient("game-hub");
  }
  return gameHubRepository;
}

function cell(text) {
  const td = document.createElement("td");
  td.textContent = text;
  return td;
}

function actionButton(label, action, datasetName, variant = "") {
  const control = document.createElement("button");
  control.className = variant ? `btn btn--compact ${variant}` : "btn btn--compact";
  control.type = "button";
  control.textContent = label;
  control.dataset[datasetName] = action;
  return control;
}

function renderStatusFilter(root) {
  const options = root.querySelector("[data-idea-board-status-options]");
  if (!options) return;
  options.replaceChildren();
  for (const status of filterStatusOptions) {
    const label = document.createElement("label");
    label.className = "idea-board-show-filter__option";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = status;
    input.checked = state.visibleStatuses.has(status);
    input.dataset.ideaBoardStatusFilterOption = status;
    const text = document.createElement("span");
    text.textContent = status;
    label.append(input, text);
    options.append(label);
  }
}

function textInput(label, value = "") {
  const input = document.createElement("input");
  input.type = "text";
  input.value = value;
  input.setAttribute("aria-label", label);
  return input;
}

function statusSelect(value) {
  const select = document.createElement("select");
  select.setAttribute("aria-label", "Idea status");
  select.dataset.ideaBoardIdeaStatusInput = "true";
  for (const optionValue of editableStatusOptions) {
    const option = document.createElement("option");
    option.value = optionValue;
    option.textContent = optionValue;
    option.selected = optionValue === value;
    select.append(option);
  }
  return select;
}

function updateStatus(root, message) {
  const status = root.querySelector("[data-idea-board-status]");
  if (status) status.textContent = message;
}

function renderIdeaInputRow(tbody, record = null) {
  const row = document.createElement("tr");
  row.dataset.ideaBoardIdeaInputRow = "true";
  if (record) row.dataset.ideaId = record.ideaId;

  const ideaCell = document.createElement("th");
  ideaCell.scope = "row";
  const ideaInput = textInput(record ? "Edit idea" : "New idea", record?.idea || "");
  ideaInput.dataset.ideaBoardIdeaInput = "true";
  ideaCell.append(ideaInput);
  row.append(ideaCell);

  const pitchCell = document.createElement("td");
  const pitchInput = textInput(record ? "Edit pitch" : "New pitch", record?.pitch || "");
  pitchInput.dataset.ideaBoardPitchInput = "true";
  pitchCell.append(pitchInput);
  row.append(pitchCell);

  const statusCell = document.createElement("td");
  statusCell.append(statusSelect(record?.status || "New"));
  row.append(statusCell);
  row.append(cell(record ? noteCountLabel(record.ideaId) : "0 Notes"));

  const actions = document.createElement("td");
  actions.append(
    actionButton("Save", "save", "ideaBoardIdeaAction", "primary"),
    " ",
    actionButton("Cancel", "cancel", "ideaBoardIdeaAction"),
  );
  row.append(actions);
  tbody.append(row);
  ideaInput.focus();
}

function renderIdeaRow(tbody, record) {
  const row = document.createElement("tr");
  const expanded = record.ideaId === state.expandedIdeaId;
  row.dataset.ideaBoardIdeaRow = record.ideaId;

  const idea = document.createElement("th");
  idea.scope = "row";
  idea.tabIndex = 0;
  idea.dataset.ideaBoardToggleNotes = record.ideaId;
  idea.dataset.ideaBoardIdeaCell = record.ideaId;
  idea.setAttribute("aria-expanded", String(expanded));
  idea.setAttribute("role", "button");
  idea.setAttribute("aria-label", `${expanded ? "Collapse" : "Expand"} notes for ${record.idea}`);
  const ideaLabel = document.createElement("span");
  ideaLabel.className = "idea-board-idea-label";
  const ideaText = document.createElement("span");
  ideaText.className = "idea-board-idea-label__text";
  ideaText.textContent = record.idea;
  const chevronName = expanded ? "chevron-up" : "chevron-down";
  const chevron = createThemeIcon(chevronName, { className: "idea-board-idea-chevron" });
  const chevronIcon = themeIconFileName(chevronName);
  chevron.dataset.ideaBoardChevron = record.ideaId;
  chevron.dataset.ideaBoardChevronIcon = chevronIcon;
  ideaLabel.append(chevron, ideaText);
  idea.append(ideaLabel);
  row.append(idea);
  row.append(cell(record.pitch));
  row.append(cell(record.status));

  const notes = document.createElement("td");
  const notesCount = document.createElement("span");
  notesCount.textContent = noteCountLabel(record.ideaId);
  notesCount.dataset.ideaBoardNotesCount = record.ideaId;
  notes.append(notesCount);
  row.append(notes);

  const actions = document.createElement("td");
  if (isArchived(record)) {
    actions.append(
      actionButton("Restore", "restore", "ideaBoardIdeaAction"),
      " ",
      actionButton("Delete", "delete", "ideaBoardIdeaAction"),
    );
  } else if (isProject(record)) {
    actions.append(
      actionButton("Open in Game Hub", "open-project", "ideaBoardIdeaAction", "primary"),
      " ",
      actionButton("Archive", "archive", "ideaBoardIdeaAction"),
    );
  } else {
    actions.append(actionButton("Edit", "edit", "ideaBoardIdeaAction"));
    if (record.status === "Ready") {
      actions.append(" ", actionButton("Create Project", "create-project", "ideaBoardIdeaAction", "primary"));
    }
    actions.append(" ", actionButton("Delete", "delete", "ideaBoardIdeaAction"));
  }
  row.append(actions);
  tbody.append(row);
}

function renderNoteInputRow(tbody, ideaId, record = null) {
  const row = document.createElement("tr");
  row.dataset.ideaBoardNoteInputRow = "true";
  row.dataset.ideaId = ideaId;
  if (record) row.dataset.noteId = record.noteId;

  const noteCell = document.createElement("td");
  const input = textInput(record ? "Edit note" : "New note", record?.note || "");
  input.dataset.ideaBoardNoteInput = "true";
  noteCell.append(input);
  row.append(noteCell);

  const actions = document.createElement("td");
  actions.append(
    actionButton("Save", "save", "ideaBoardNoteAction", "primary"),
    " ",
    actionButton("Cancel", "cancel", "ideaBoardNoteAction"),
  );
  row.append(actions);
  tbody.append(row);
  input.focus();
}

function renderNoteRow(tbody, record, locked = false) {
  const row = document.createElement("tr");
  row.dataset.noteId = record.noteId;
  row.dataset.ideaId = record.ideaId;
  if (record.system) row.dataset.ideaBoardSystemNote = "true";
  row.append(cell(record.note));

  const actions = document.createElement("td");
  if (!locked) {
    actions.append(actionButton("Edit", "edit", "ideaBoardNoteAction"));
    if (!record.system) {
      actions.append(" ", actionButton("Delete", "delete", "ideaBoardNoteAction"));
    }
  }
  row.append(actions);
  tbody.append(row);
}

function renderExpandedNotesRow(tbody, record) {
  const row = document.createElement("tr");
  row.dataset.ideaBoardExpandedRow = record.ideaId;

  const content = document.createElement("td");
  content.colSpan = 5;

  const childSurface = document.createElement("div");
  childSurface.className = "idea-board-notes-child-surface";
  const locked = isLockedIdea(record);

  const tableWrapper = document.createElement("div");
  tableWrapper.className = "table-wrapper";
  const notesTable = document.createElement("table");
  notesTable.className = "data-table data-table--fixed";
  notesTable.dataset.ideaBoardNotesTable = record.ideaId;
  notesTable.setAttribute("aria-label", `${record.idea} notes`);
  notesTable.innerHTML = "<thead><tr><th scope=\"col\">Note</th><th scope=\"col\">Actions</th></tr></thead>";

  const notesBody = document.createElement("tbody");
  notesBody.dataset.ideaBoardNotesBody = record.ideaId;
  notesTable.append(notesBody);
  tableWrapper.append(notesTable);
  childSurface.append(tableWrapper);

  for (const note of notesForIdea(record.ideaId)) {
    if (!locked && state.editingNoteId === note.noteId) {
      renderNoteInputRow(notesBody, record.ideaId, note);
    } else {
      renderNoteRow(notesBody, note, locked);
    }
  }
  if (!locked && state.addingNoteIdeaId === record.ideaId) renderNoteInputRow(notesBody, record.ideaId);

  if (!locked) {
    const controls = document.createElement("div");
    controls.className = "action-group idea-board-notes-child-actions";
    const addNote = actionButton("Add Note", "add", "ideaBoardNoteAction", "primary");
    addNote.dataset.ideaBoardAddNote = record.ideaId;
    controls.append(addNote);
    childSurface.append(controls);
  }
  content.append(childSurface);

  row.append(content);
  tbody.append(row);
}

function renderAddIdeaRow(tbody) {
  const row = document.createElement("tr");
  row.dataset.ideaBoardAddIdeaRow = "true";
  const actions = document.createElement("td");
  actions.colSpan = 5;
  const addIdea = actionButton("Add Idea", "add", "ideaBoardIdeaAction", "primary");
  addIdea.dataset.ideaBoardAddIdea = "true";
  actions.append(addIdea);
  row.append(actions);
  tbody.append(row);
}

function render(root) {
  const tbody = root.querySelector("[data-idea-board-ideas-body]");
  if (!tbody) return;
  renderStatusFilter(root);
  tbody.replaceChildren();
  for (const record of visibleIdeas()) {
    if (state.editingIdeaId === record.ideaId && !isLockedIdea(record)) {
      renderIdeaInputRow(tbody, record);
    } else {
      renderIdeaRow(tbody, record);
    }
    if (state.expandedIdeaId === record.ideaId) renderExpandedNotesRow(tbody, record);
  }
  if (state.addingIdea) {
    renderIdeaInputRow(tbody);
  } else {
    renderAddIdeaRow(tbody);
  }
}

function ideaIdFromText(text) {
  const base = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return base || `idea-${Date.now()}`;
}

function saveIdeaRow(root, row) {
  if (!requireAuthenticatedWrite(root)) return;
  const idea = row.querySelector("[data-idea-board-idea-input]")?.value.trim();
  const pitch = row.querySelector("[data-idea-board-pitch-input]")?.value.trim();
  const status = row.querySelector("[data-idea-board-idea-status-input]")?.value;
  if (!idea || !pitch || !isEditableStatus(status)) {
    updateStatus(root, "Enter an idea, pitch, and status before saving.");
    return;
  }

  const ideaId = row.dataset.ideaId;
  if (ideaId) {
    const record = ideaRecord(ideaId);
    if (!record) {
      updateStatus(root, "Idea Board could not find that idea.");
      return;
    }
    if (isLockedIdea(record)) {
      state.editingIdeaId = null;
      updateStatus(root, "This project is read-only.");
      render(root);
      return;
    }
    record.idea = idea;
    record.pitch = pitch;
    if (status === "Archived" && record.status !== "Archived") {
      record.previousStatus = record.status;
    }
    record.status = status;
    rememberPreviousStatus(record);
    record.updated = today();
    state.editingIdeaId = null;
    updateStatus(root, `Updated ${record.idea}.`);
  } else {
    const baseIdeaId = ideaIdFromText(idea);
    const newIdeaId = ideaTable.some((record) => record.ideaId === baseIdeaId) ? `${baseIdeaId}-${Date.now()}` : baseIdeaId;
    ideaTable.push({ ideaId: newIdeaId, userId, idea, pitch, status, updated: today() });
    state.addingIdea = false;
    updateStatus(root, `Added ${idea}.`);
  }
  render(root);
}

function saveNoteRow(root, row) {
  if (!requireAuthenticatedWrite(root)) return;
  const ideaId = row.dataset.ideaId;
  const idea = ideaRecord(ideaId);
  if (idea && isLockedIdea(idea)) {
    state.editingNoteId = null;
    state.addingNoteIdeaId = null;
    updateStatus(root, "Project notes are read-only.");
    render(root);
    return;
  }
  const value = row.querySelector("[data-idea-board-note-input]")?.value.trim();
  if (!value) {
    updateStatus(root, "Enter note text before saving.");
    return;
  }

  const noteId = row.dataset.noteId;
  if (noteId) {
    const record = noteTable.find((note) => note.noteId === noteId && note.ideaId === ideaId);
    if (!record) {
      updateStatus(root, "Idea Board could not find that note.");
      return;
    }
    record.note = value;
    record.updated = today();
    state.editingNoteId = null;
    updateStatus(root, "Updated note.");
  } else {
    noteTable.push({
      noteId: `note-${ideaId}-${Date.now()}`,
      ideaId,
      note: value,
      system: false,
      updated: today(),
    });
    state.addingNoteIdeaId = null;
    updateStatus(root, "Added note.");
  }
  render(root);
}

function toggleNotes(root, ideaId) {
  if (!ideaRecord(ideaId)) {
    updateStatus(root, "Idea Board could not expand that idea.");
    return;
  }
  const expanded = state.expandedIdeaId === ideaId;
  state.expandedIdeaId = expanded ? null : ideaId;
  state.editingNoteId = null;
  state.addingNoteIdeaId = null;
  updateStatus(root, expanded ? "Collapsed notes." : `Expanded notes for ${ideaRecord(ideaId).idea}.`);
  render(root);
}

function deleteIdea(root, ideaId) {
  if (!requireAuthenticatedWrite(root)) return;
  const index = ideaTable.findIndex((record) => record.ideaId === ideaId);
  if (index < 0) {
    updateStatus(root, "Idea Board could not delete that idea.");
    return;
  }
  if (!canDeleteIdea(ideaTable[index])) {
    updateStatus(root, "Archive this project before deleting it.");
    return;
  }
  const [removed] = ideaTable.splice(index, 1);
  for (let noteIndex = noteTable.length - 1; noteIndex >= 0; noteIndex -= 1) {
    if (noteTable[noteIndex].ideaId === ideaId) noteTable.splice(noteIndex, 1);
  }
  if (state.expandedIdeaId === ideaId) state.expandedIdeaId = null;
  if (state.editingIdeaId === ideaId) state.editingIdeaId = null;
  if (state.addingNoteIdeaId === ideaId) state.addingNoteIdeaId = null;
  updateStatus(root, `Deleted ${removed.idea}.`);
  render(root);
}

function projectSourceIdea(record) {
  return {
    idea: record.idea,
    pitch: record.pitch,
    notes: notesForIdea(record.ideaId).map((note) => note.note),
  };
}

function gameHubUrl(record) {
  const suffix = record.projectId ? `?game=${encodeURIComponent(record.projectId)}` : "";
  return `${gameHubRoute}${suffix}`;
}

function signInUrl() {
  return new URL(signInRoute, document.baseURI || window.location.href).href;
}

function currentSessionState() {
  try {
    const session = getSessionCurrent();
    return {
      apiAvailable: true,
      authenticated: Boolean(session?.authenticated && session.userKey),
      session,
    };
  } catch (error) {
    console.warn("Idea Board could not verify the current session.", error instanceof Error ? error.message : String(error || ""));
    return {
      apiAvailable: false,
      authenticated: false,
      session: null,
    };
  }
}

function requireAuthenticatedWrite(root) {
  const sessionState = currentSessionState();
  if (!sessionState.apiAvailable) {
    updateStatus(root, "API session status could not be verified. Try again shortly.");
    return false;
  }
  if (!sessionState.authenticated) {
    updateStatus(root, "Sign in before saving Idea Board changes.");
    window.location.href = signInUrl();
    return false;
  }
  return true;
}

function createProject(root, ideaId) {
  const record = ideaRecord(ideaId);
  if (!record) {
    updateStatus(root, "Idea Board could not update that idea.");
    return;
  }
  if (record.status !== "Ready") {
    updateStatus(root, "Set this idea to Ready before creating a project.");
    return;
  }
  if (!requireAuthenticatedWrite(root)) return;
  const repository = gameHubProjectRepository();
  const project = repository.createGame({
    name: record.idea,
    purpose: "Game",
    sourceIdea: projectSourceIdea(record),
    status: "Planning",
  });
  if (isRepositoryErrorResult(project) || !project || !project.id) {
    console.warn("Idea Board could not create a Game Hub project.", project?.message || repository.__apiDiagnostic?.() || "");
    updateStatus(root, "Game Hub project could not be created right now. Try again shortly.");
    return;
  }
  record.status = "Project";
  record.previousStatus = "Project";
  record.projectId = project.id;
  record.projectName = project.name || record.idea;
  record.updated = today();
  state.editingIdeaId = null;
  state.editingNoteId = null;
  state.addingNoteIdeaId = null;
  updateStatus(root, `${record.idea} is now a project.`);
  render(root);
}

function archiveIdea(root, ideaId) {
  const record = ideaRecord(ideaId);
  if (!record) {
    updateStatus(root, "Idea Board could not archive that idea.");
    return;
  }
  if (!requireAuthenticatedWrite(root)) return;
  if (record.status !== "Archived") record.previousStatus = record.status;
  record.status = "Archived";
  record.updated = today();
  state.editingIdeaId = null;
  state.editingNoteId = null;
  state.addingNoteIdeaId = null;
  if (!state.visibleStatuses.has("Archived") && state.expandedIdeaId === ideaId) {
    state.expandedIdeaId = null;
  }
  updateStatus(root, `Archived ${record.idea}.`);
  render(root);
}

function restoreIdea(root, ideaId) {
  const record = ideaRecord(ideaId);
  if (!record) {
    updateStatus(root, "Idea Board could not restore that idea.");
    return;
  }
  if (!requireAuthenticatedWrite(root)) return;
  record.status = previousStatusForRestore(record);
  record.previousStatus = record.status;
  record.updated = today();
  updateStatus(root, `Restored ${record.idea}.`);
  render(root);
}

function openProject(root, ideaId) {
  const record = ideaRecord(ideaId);
  if (!record) {
    updateStatus(root, "Idea Board could not open that project.");
    return;
  }
  if (!record.projectId) {
    updateStatus(root, "Create the Game Hub project before opening it.");
    return;
  }
  updateStatus(root, `Opening ${record.idea} in Game Hub.`);
  window.location.href = gameHubUrl(record);
}

function handleIdeaAction(root, actionControl) {
  const action = actionControl.dataset.ideaBoardIdeaAction;
  const row = actionControl.closest("tr");
  const ideaId = row?.dataset.ideaBoardIdeaRow || row?.dataset.ideaId;
  if (action === "add") {
    state.addingIdea = true;
    state.editingIdeaId = null;
    updateStatus(root, "Adding a new idea.");
    render(root);
  } else if (action === "edit") {
    if (isLockedIdea(ideaRecord(ideaId))) {
      updateStatus(root, "This project is read-only.");
      render(root);
      return;
    }
    state.editingIdeaId = ideaId;
    state.addingIdea = false;
    updateStatus(root, `Editing ${ideaRecord(ideaId)?.idea}.`);
    render(root);
  } else if (action === "delete") {
    deleteIdea(root, ideaId);
  } else if (action === "create-project") {
    createProject(root, ideaId);
  } else if (action === "open-project") {
    openProject(root, ideaId);
  } else if (action === "archive") {
    archiveIdea(root, ideaId);
  } else if (action === "restore") {
    restoreIdea(root, ideaId);
  } else if (action === "cancel") {
    state.editingIdeaId = null;
    state.addingIdea = false;
    updateStatus(root, "Cancelled idea edit.");
    render(root);
  } else if (action === "save") {
    saveIdeaRow(root, row);
  }
}

function handleNoteAction(root, actionControl) {
  const action = actionControl.dataset.ideaBoardNoteAction;
  const row = actionControl.closest("tr");
  const ideaId = actionControl.dataset.ideaBoardAddNote || row?.dataset.ideaId || state.expandedIdeaId;
  const idea = ideaRecord(ideaId);
  if (idea && isLockedIdea(idea)) {
    state.editingNoteId = null;
    state.addingNoteIdeaId = null;
    updateStatus(root, "Project notes are read-only.");
    render(root);
    return;
  }
  const noteId = row?.dataset.noteId;
  if (action === "add") {
    state.expandedIdeaId = ideaId;
    state.addingNoteIdeaId = ideaId;
    state.editingNoteId = null;
    updateStatus(root, "Adding a note.");
    render(root);
  } else if (action === "edit") {
    state.editingNoteId = noteId;
    state.addingNoteIdeaId = null;
    updateStatus(root, "Editing note.");
    render(root);
  } else if (action === "delete") {
    if (!requireAuthenticatedWrite(root)) return;
    const index = noteTable.findIndex((note) => note.noteId === noteId && note.ideaId === ideaId && !note.system);
    if (index >= 0) {
      noteTable.splice(index, 1);
      updateStatus(root, "Deleted note.");
      render(root);
    }
  } else if (action === "cancel") {
    state.editingNoteId = null;
    state.addingNoteIdeaId = null;
    updateStatus(root, "Cancelled note edit.");
    render(root);
  } else if (action === "save") {
    saveNoteRow(root, row);
  }
}

function handleFilterAction(root, actionControl) {
  if (actionControl.matches("[data-idea-board-filter-select-all]")) {
    state.visibleStatuses = new Set(filterStatusOptions);
    updateStatus(root, "Showing all statuses.");
  } else if (actionControl.matches("[data-idea-board-filter-clear-all]")) {
    state.visibleStatuses = new Set();
    state.expandedIdeaId = null;
    updateStatus(root, "Status filters cleared.");
  }
  render(root);
}

function handleFilterChange(root, input) {
  if (input.checked) {
    state.visibleStatuses.add(input.value);
  } else {
    state.visibleStatuses.delete(input.value);
    if (state.expandedIdeaId && ideaRecord(state.expandedIdeaId)?.status === input.value) {
      state.expandedIdeaId = null;
    }
  }
  updateStatus(root, "Updated visible statuses.");
  render(root);
}

function handleClick(root, event) {
  const filterAction = event.target.closest("[data-idea-board-filter-select-all], [data-idea-board-filter-clear-all]");
  if (filterAction) {
    handleFilterAction(root, filterAction);
    return;
  }

  const toggle = event.target.closest("[data-idea-board-toggle-notes]");
  if (toggle) {
    toggleNotes(root, toggle.dataset.ideaBoardToggleNotes);
    return;
  }

  const ideaAction = event.target.closest("[data-idea-board-idea-action]");
  if (ideaAction) {
    handleIdeaAction(root, ideaAction);
    return;
  }

  const noteAction = event.target.closest("[data-idea-board-note-action]");
  if (noteAction) handleNoteAction(root, noteAction);
}

function handleChange(root, event) {
  const statusFilter = event.target.closest("[data-idea-board-status-filter-option]");
  if (statusFilter) handleFilterChange(root, statusFilter);
}

function handleKeydown(root, event) {
  const toggle = event.target.closest("[data-idea-board-toggle-notes]");
  if (!toggle || (event.key !== "Enter" && event.key !== " ")) return;
  event.preventDefault();
  toggleNotes(root, toggle.dataset.ideaBoardToggleNotes);
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-idea-board]");
  if (!root) return;
  render(root);
  root.addEventListener("click", (event) => handleClick(root, event));
  root.addEventListener("change", (event) => handleChange(root, event));
  root.addEventListener("keydown", (event) => handleKeydown(root, event));
});
