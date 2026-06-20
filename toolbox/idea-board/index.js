const statusOptions = Object.freeze(["New", "Exploring", "Parked", "Ready to Shape"]);
const userId = "user-1";

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
    note: "System seed note: keep the sharpest premise at the top of the board.",
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
    note: "System seed note: compare early Sky Orchard ideas before creating a project.",
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
  for (const optionValue of statusOptions) {
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
  row.append(cell(record?.updated || today()));
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
  idea.textContent = record.idea;
  row.append(idea);
  row.append(cell(record.pitch));
  row.append(cell(record.status));
  row.append(cell(record.updated));

  const notes = document.createElement("td");
  const notesCount = document.createElement("button");
  notesCount.className = expanded ? "btn btn--compact primary" : "btn btn--compact";
  notesCount.type = "button";
  notesCount.textContent = noteCountLabel(record.ideaId);
  notesCount.dataset.ideaBoardToggleNotes = record.ideaId;
  notesCount.dataset.ideaBoardNotesCount = record.ideaId;
  notesCount.setAttribute("aria-expanded", String(expanded));

  const notesChevron = document.createElement("button");
  notesChevron.className = expanded ? "btn btn--compact primary" : "btn btn--compact";
  notesChevron.type = "button";
  notesChevron.textContent = expanded ? "v" : ">";
  notesChevron.dataset.ideaBoardToggleNotes = record.ideaId;
  notesChevron.dataset.ideaBoardNotesChevron = record.ideaId;
  notesChevron.setAttribute("aria-label", `${expanded ? "Collapse" : "Expand"} notes for ${record.idea}`);
  notesChevron.setAttribute("aria-expanded", String(expanded));
  notes.append(notesCount, " ", notesChevron);
  row.append(notes);

  const actions = document.createElement("td");
  actions.append(
    actionButton("Edit", "edit", "ideaBoardIdeaAction"),
    " ",
    actionButton("Delete", "delete", "ideaBoardIdeaAction"),
  );
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

function renderNoteRow(tbody, record) {
  const row = document.createElement("tr");
  row.dataset.noteId = record.noteId;
  row.dataset.ideaId = record.ideaId;
  if (record.system) row.dataset.ideaBoardSystemNote = "true";
  row.append(cell(record.note));

  const actions = document.createElement("td");
  actions.append(actionButton("Edit", "edit", "ideaBoardNoteAction"));
  if (!record.system) {
    actions.append(" ", actionButton("Delete", "delete", "ideaBoardNoteAction"));
  }
  row.append(actions);
  tbody.append(row);
}

function renderExpandedNotesRow(tbody, record) {
  const row = document.createElement("tr");
  row.dataset.ideaBoardExpandedRow = record.ideaId;

  const content = document.createElement("td");
  content.colSpan = 6;

  const wrapper = document.createElement("div");
  wrapper.className = "content-stack";
  const heading = document.createElement("h3");
  heading.textContent = "Notes";
  heading.dataset.ideaBoardNotesHeader = record.ideaId;
  wrapper.append(heading);

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
  wrapper.append(tableWrapper);

  for (const note of notesForIdea(record.ideaId)) {
    if (state.editingNoteId === note.noteId) {
      renderNoteInputRow(notesBody, record.ideaId, note);
    } else {
      renderNoteRow(notesBody, note);
    }
  }
  if (state.addingNoteIdeaId === record.ideaId) renderNoteInputRow(notesBody, record.ideaId);

  const controls = document.createElement("div");
  controls.className = "action-group";
  const addNote = actionButton("Add Note", "add", "ideaBoardNoteAction", "primary");
  addNote.dataset.ideaBoardAddNote = record.ideaId;
  controls.append(addNote);
  wrapper.append(controls);

  content.append(wrapper);
  row.append(content);
  tbody.append(row);
}

function renderAddIdeaRow(tbody) {
  const row = document.createElement("tr");
  row.dataset.ideaBoardAddIdeaRow = "true";
  const prompt = document.createElement("td");
  prompt.colSpan = 5;
  prompt.textContent = "Add another idea";
  row.append(prompt);
  const actions = document.createElement("td");
  const addIdea = actionButton("Add Idea", "add", "ideaBoardIdeaAction", "primary");
  addIdea.dataset.ideaBoardAddIdea = "true";
  actions.append(addIdea);
  row.append(actions);
  tbody.append(row);
}

function render(root) {
  const tbody = root.querySelector("[data-idea-board-ideas-body]");
  if (!tbody) return;
  tbody.replaceChildren();
  for (const record of ideaTable) {
    if (state.editingIdeaId === record.ideaId) {
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
  const idea = row.querySelector("[data-idea-board-idea-input]")?.value.trim();
  const pitch = row.querySelector("[data-idea-board-pitch-input]")?.value.trim();
  const status = row.querySelector("[data-idea-board-idea-status-input]")?.value;
  if (!idea || !pitch || !status) {
    updateStatus(root, "Enter an idea, pitch, and status before saving.");
    return;
  }

  const ideaId = row.dataset.ideaId;
  if (ideaId) {
    const record = ideaRecord(ideaId);
    if (!record) {
      updateStatus(root, `Idea Board cannot find idea: ${ideaId}.`);
      return;
    }
    record.idea = idea;
    record.pitch = pitch;
    record.status = status;
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
  const ideaId = row.dataset.ideaId;
  const value = row.querySelector("[data-idea-board-note-input]")?.value.trim();
  if (!value) {
    updateStatus(root, "Enter note text before saving.");
    return;
  }

  const noteId = row.dataset.noteId;
  if (noteId) {
    const record = noteTable.find((note) => note.noteId === noteId && note.ideaId === ideaId);
    if (!record) {
      updateStatus(root, `Idea Board cannot find note: ${noteId}.`);
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
    updateStatus(root, `Idea Board cannot expand missing idea: ${ideaId}.`);
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
  const index = ideaTable.findIndex((record) => record.ideaId === ideaId);
  if (index < 0) {
    updateStatus(root, `Idea Board cannot delete missing idea: ${ideaId}.`);
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
    state.editingIdeaId = ideaId;
    state.addingIdea = false;
    updateStatus(root, `Editing ${ideaRecord(ideaId)?.idea}.`);
    render(root);
  } else if (action === "delete") {
    deleteIdea(root, ideaId);
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

function handleClick(root, event) {
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

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-idea-board]");
  if (!root) return;
  render(root);
  root.addEventListener("click", (event) => handleClick(root, event));
});
