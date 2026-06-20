const statusOptions = Object.freeze(["New", "Exploring", "Parked", "Ready to Shape"]);

const ideas = [
  {
    id: "sky-orchard",
    title: "Sky Orchard",
    pitch: "Grow floating islands while defending them from storm creatures.",
    status: "Exploring",
    updated: "2026-06-20",
  },
  {
    id: "clockwork-courier",
    title: "Clockwork Courier",
    pitch: "Deliver messages through looping city districts before time resets.",
    status: "New",
    updated: "2026-06-20",
  },
];

const notesByIdea = new Map([
  [
    "sky-orchard",
    [
      {
        id: "sky-system-origin",
        note: "System seed note: compare early Sky Orchard ideas before creating a project.",
        updated: "2026-06-20",
        system: true,
      },
      {
        id: "sky-creator-next-question",
        note: "Ask whether the core loop is resource planning, action defense, or both.",
        updated: "2026-06-20",
        system: false,
      },
    ],
  ],
  [
    "clockwork-courier",
    [
      {
        id: "clock-system-origin",
        note: "System seed note: keep Clockwork Courier scoped until the time-loop hook is clear.",
        updated: "2026-06-20",
        system: true,
      },
      {
        id: "clock-creator-route-risk",
        note: "Check whether district routing stays readable after the first reset.",
        updated: "2026-06-20",
        system: false,
      },
    ],
  ],
]);

const state = {
  selectedIdeaId: "sky-orchard",
  editingIdeaId: null,
  editingNoteId: null,
  addingIdea: false,
  addingNote: false,
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function selectedIdea() {
  return ideas.find((idea) => idea.id === state.selectedIdeaId) || null;
}

function notesForIdea(ideaId) {
  if (!notesByIdea.has(ideaId)) notesByIdea.set(ideaId, []);
  return notesByIdea.get(ideaId);
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

function renderIdeaInputRow(tbody, idea = null) {
  const row = document.createElement("tr");
  row.dataset.ideaBoardIdeaInputRow = "true";
  if (idea) row.dataset.ideaId = idea.id;

  const titleCell = document.createElement("th");
  titleCell.scope = "row";
  const titleInput = textInput(idea ? "Edit idea title" : "New idea title", idea?.title || "");
  titleInput.dataset.ideaBoardIdeaTitleInput = "true";
  titleCell.append(titleInput);
  row.append(titleCell);

  const pitchCell = document.createElement("td");
  const pitchInput = textInput(idea ? "Edit idea pitch" : "New idea pitch", idea?.pitch || "");
  pitchInput.dataset.ideaBoardIdeaPitchInput = "true";
  pitchCell.append(pitchInput);
  row.append(pitchCell);

  const statusCell = document.createElement("td");
  statusCell.append(statusSelect(idea?.status || "New"));
  row.append(statusCell);
  row.append(cell(idea?.updated || today()));
  row.append(cell(idea ? noteCountLabel(idea.id) : "0 Notes"));

  const actions = document.createElement("td");
  actions.append(
    actionButton("Save", "save", "ideaBoardIdeaAction", "primary"),
    " ",
    actionButton("Cancel", "cancel", "ideaBoardIdeaAction"),
  );
  row.append(actions);
  tbody.append(row);
  titleInput.focus();
}

function renderIdeaRow(tbody, idea) {
  const row = document.createElement("tr");
  const selected = idea.id === state.selectedIdeaId;
  row.dataset.ideaBoardIdeaRow = idea.id;
  row.setAttribute("aria-selected", String(selected));

  const title = document.createElement("th");
  title.scope = "row";
  title.textContent = idea.title;
  row.append(title);
  row.append(cell(idea.pitch));
  row.append(cell(idea.status));
  row.append(cell(idea.updated));

  const notes = document.createElement("td");
  const notesButton = document.createElement("button");
  notesButton.className = selected ? "btn btn--compact primary" : "btn btn--compact";
  notesButton.type = "button";
  notesButton.textContent = noteCountLabel(idea.id);
  notesButton.dataset.ideaBoardSelectIdea = idea.id;
  notesButton.setAttribute("aria-expanded", String(selected));
  notes.append(notesButton);
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

function renderNoteInputRow(tbody, note = null) {
  const row = document.createElement("tr");
  row.dataset.ideaBoardNoteInputRow = "true";
  if (note) row.dataset.noteId = note.id;

  const noteCell = document.createElement("td");
  const input = textInput(note ? "Edit note text" : "New note text", note?.note || "");
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

function renderNoteRow(tbody, note) {
  const row = document.createElement("tr");
  row.dataset.noteId = note.id;
  if (note.system) row.dataset.ideaBoardSystemNote = "true";
  row.append(cell(note.note));

  const actions = document.createElement("td");
  actions.append(actionButton("Edit", "edit", "ideaBoardNoteAction"));
  if (!note.system) {
    actions.append(" ", actionButton("Delete", "delete", "ideaBoardNoteAction"));
  }
  row.append(actions);
  tbody.append(row);
}

function renderExpandedNotesRow(tbody, idea) {
  const row = document.createElement("tr");
  row.dataset.ideaBoardExpandedRow = idea.id;

  const content = document.createElement("td");
  content.colSpan = 6;

  const wrapper = document.createElement("div");
  wrapper.className = "content-stack";

  const tableWrapper = document.createElement("div");
  tableWrapper.className = "table-wrapper";
  const notesTable = document.createElement("table");
  notesTable.className = "data-table data-table--fixed";
  notesTable.dataset.ideaBoardNotesTable = idea.id;
  notesTable.setAttribute("aria-label", `${idea.title} notes`);
  notesTable.innerHTML = "<thead><tr><th scope=\"col\">Note</th><th scope=\"col\">Actions</th></tr></thead>";

  const notesBody = document.createElement("tbody");
  notesBody.dataset.ideaBoardNotesBody = idea.id;
  notesTable.append(notesBody);
  tableWrapper.append(notesTable);
  wrapper.append(tableWrapper);

  const controls = document.createElement("div");
  controls.className = "action-group";
  const addNote = actionButton("Add Note", "add", "ideaBoardNoteAction", "primary");
  addNote.dataset.ideaBoardAddNote = idea.id;
  controls.append(addNote);
  wrapper.append(controls);

  content.append(wrapper);
  row.append(content);
  tbody.append(row);

  if (state.addingNote) renderNoteInputRow(notesBody);
  for (const note of notesForIdea(idea.id)) {
    if (state.editingNoteId === note.id) {
      renderNoteInputRow(notesBody, note);
    } else {
      renderNoteRow(notesBody, note);
    }
  }
}

function render(root) {
  const tbody = root.querySelector("[data-idea-board-ideas-body]");
  if (!tbody) return;
  tbody.replaceChildren();
  for (const idea of ideas) {
    if (state.editingIdeaId === idea.id) {
      renderIdeaInputRow(tbody, idea);
    } else {
      renderIdeaRow(tbody, idea);
    }
    if (state.selectedIdeaId === idea.id) renderExpandedNotesRow(tbody, idea);
  }
  if (state.addingIdea) renderIdeaInputRow(tbody);
}

function slugifyTitle(title) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || `idea-${Date.now()}`;
}

function saveIdeaRow(root, row) {
  const title = row.querySelector("[data-idea-board-idea-title-input]")?.value.trim();
  const pitch = row.querySelector("[data-idea-board-idea-pitch-input]")?.value.trim();
  const status = row.querySelector("[data-idea-board-idea-status-input]")?.value;
  if (!title || !pitch || !status) {
    updateStatus(root, "Enter an idea, pitch, and status before saving.");
    return;
  }

  const ideaId = row.dataset.ideaId;
  if (ideaId) {
    const idea = ideas.find((item) => item.id === ideaId);
    if (!idea) {
      updateStatus(root, `Idea Board cannot find idea: ${ideaId}.`);
      return;
    }
    idea.title = title;
    idea.pitch = pitch;
    idea.status = status;
    idea.updated = today();
    state.editingIdeaId = null;
    updateStatus(root, `Updated ${idea.title}.`);
  } else {
    const baseId = slugifyTitle(title);
    const id = ideas.some((idea) => idea.id === baseId) ? `${baseId}-${Date.now()}` : baseId;
    ideas.push({ id, title, pitch, status, updated: today() });
    notesByIdea.set(id, []);
    state.selectedIdeaId = id;
    state.addingIdea = false;
    updateStatus(root, `Added ${title}.`);
  }
  render(root);
}

function saveNoteRow(root, row) {
  const input = row.querySelector("[data-idea-board-note-input]");
  const value = input?.value.trim();
  if (!value) {
    updateStatus(root, "Enter note text before saving.");
    return;
  }

  const notes = notesForIdea(state.selectedIdeaId);
  const noteId = row.dataset.noteId;
  if (noteId) {
    const note = notes.find((item) => item.id === noteId);
    if (!note) {
      updateStatus(root, `Idea Board cannot find note: ${noteId}.`);
      return;
    }
    note.note = value;
    note.updated = today();
    state.editingNoteId = null;
    updateStatus(root, `Updated note for ${selectedIdea().title}.`);
  } else {
    notes.unshift({
      id: `note-${state.selectedIdeaId}-${Date.now()}`,
      note: value,
      updated: today(),
      system: false,
    });
    state.addingNote = false;
    updateStatus(root, `Added note for ${selectedIdea().title}.`);
  }
  render(root);
}

function selectIdea(root, ideaId) {
  if (!ideas.some((idea) => idea.id === ideaId)) {
    updateStatus(root, `Idea Board cannot select missing idea: ${ideaId}.`);
    return;
  }
  state.selectedIdeaId = ideaId;
  state.editingIdeaId = null;
  state.editingNoteId = null;
  state.addingNote = false;
  updateStatus(root, `Expanded notes for ${selectedIdea().title}.`);
  render(root);
}

function deleteIdea(root, ideaId) {
  const index = ideas.findIndex((idea) => idea.id === ideaId);
  if (index < 0) {
    updateStatus(root, `Idea Board cannot delete missing idea: ${ideaId}.`);
    return;
  }
  const [removed] = ideas.splice(index, 1);
  notesByIdea.delete(ideaId);
  if (state.selectedIdeaId === ideaId) {
    state.selectedIdeaId = ideas[Math.min(index, ideas.length - 1)]?.id || "";
    state.editingNoteId = null;
    state.addingNote = false;
  }
  updateStatus(root, `Deleted ${removed.title}.`);
  render(root);
}

function handleIdeaAction(root, actionControl) {
  const action = actionControl.dataset.ideaBoardIdeaAction;
  const row = actionControl.closest("tr");
  const ideaId = actionControl.dataset.ideaBoardSelectIdea || row?.dataset.ideaBoardIdeaRow || row?.dataset.ideaId;
  if (action === "select") {
    selectIdea(root, ideaId);
  } else if (action === "edit") {
    state.editingIdeaId = ideaId;
    state.addingIdea = false;
    state.editingNoteId = null;
    state.addingNote = false;
    updateStatus(root, `Editing ${ideas.find((idea) => idea.id === ideaId)?.title}.`);
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
  const noteId = row?.dataset.noteId;
  if (action === "add") {
    state.addingNote = true;
    state.editingNoteId = null;
    updateStatus(root, `Adding a note for ${selectedIdea().title}.`);
    render(root);
  } else if (action === "edit") {
    state.editingNoteId = noteId;
    state.addingNote = false;
    updateStatus(root, `Editing note for ${selectedIdea().title}.`);
    render(root);
  } else if (action === "delete") {
    const notes = notesForIdea(state.selectedIdeaId);
    const index = notes.findIndex((note) => note.id === noteId && !note.system);
    if (index >= 0) {
      notes.splice(index, 1);
      updateStatus(root, `Deleted note for ${selectedIdea().title}.`);
      render(root);
    }
  } else if (action === "cancel") {
    state.editingNoteId = null;
    state.addingNote = false;
    updateStatus(root, `Cancelled note edit for ${selectedIdea().title}.`);
    render(root);
  } else if (action === "save") {
    saveNoteRow(root, row);
  }
}

function handleClick(root, event) {
  const addIdea = event.target.closest("[data-idea-board-add-idea]");
  if (addIdea) {
    state.addingIdea = true;
    state.editingIdeaId = null;
    updateStatus(root, "Adding a new idea.");
    render(root);
    return;
  }

  const selectIdeaButton = event.target.closest("[data-idea-board-select-idea]");
  if (selectIdeaButton) {
    selectIdea(root, selectIdeaButton.dataset.ideaBoardSelectIdea);
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
