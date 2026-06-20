const ideas = Object.freeze([
  {
    id: "sky-orchard",
    title: "Sky Orchard",
    pitch: "Grow floating islands while defending them from storm creatures.",
    status: "Exploring",
    owner: "Creator",
    updated: "2026-06-20",
  },
  {
    id: "clockwork-courier",
    title: "Clockwork Courier",
    pitch: "Deliver messages through looping city districts before time resets.",
    status: "New",
    owner: "Creator",
    updated: "2026-06-20",
  },
]);

const notesByIdea = new Map([
  [
    "sky-orchard",
    [
      {
        id: "sky-system-origin",
        note: "System seed note: compare early Sky Orchard ideas before creating a project.",
        type: "System",
        createdBy: "System",
        created: "2026-06-20",
        updated: "2026-06-20",
        system: true,
      },
      {
        id: "sky-creator-next-question",
        note: "Ask whether the core loop is resource planning, action defense, or both.",
        type: "Creator",
        createdBy: "Creator",
        created: "2026-06-20",
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
        type: "System",
        createdBy: "System",
        created: "2026-06-20",
        updated: "2026-06-20",
        system: true,
      },
      {
        id: "clock-creator-route-risk",
        note: "Check whether district routing stays readable after the first reset.",
        type: "Creator",
        createdBy: "Creator",
        created: "2026-06-20",
        updated: "2026-06-20",
        system: false,
      },
    ],
  ],
]);

const state = {
  selectedIdeaId: "sky-orchard",
  editingNoteId: null,
  addingNote: false,
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function selectedIdea() {
  return ideas.find((idea) => idea.id === state.selectedIdeaId);
}

function selectedNotes() {
  return notesByIdea.get(state.selectedIdeaId);
}

function cell(text) {
  const td = document.createElement("td");
  td.textContent = text;
  return td;
}

function actionButton(label, action, variant = "") {
  const control = document.createElement("button");
  control.className = variant ? `btn btn--compact ${variant}` : "btn btn--compact";
  control.type = "button";
  control.textContent = label;
  control.dataset.ideaBoardAction = action;
  return control;
}

function updateStatus(root, message) {
  const status = root.querySelector("[data-idea-board-status]");
  if (status) status.textContent = message;
}

function renderIdeaSelection(root) {
  for (const row of root.querySelectorAll("[data-idea-board-idea-row]")) {
    const rowSelected = row.dataset.ideaBoardIdeaRow === state.selectedIdeaId;
    row.setAttribute("aria-selected", String(rowSelected));
    const selectButton = row.querySelector("[data-idea-board-select-idea]");
    if (selectButton) {
      selectButton.disabled = rowSelected;
      selectButton.classList.toggle("primary", rowSelected);
      selectButton.textContent = rowSelected ? "Selected" : "Select";
    }
  }
}

function renderSelectedIdeaContext(root) {
  const idea = selectedIdea();
  if (!idea) {
    updateStatus(root, `Idea Board cannot find selected idea: ${state.selectedIdeaId}.`);
    return;
  }
  const title = root.querySelector("[data-idea-board-selected-title]");
  const summary = root.querySelector("[data-idea-board-selected-summary]");
  const caption = root.querySelector("[data-idea-board-notes-caption]");
  if (title) title.textContent = `Notes for ${idea.title}`;
  if (summary) {
    summary.textContent = `Selected idea context: ${idea.status}, owned by ${idea.owner}, updated ${idea.updated}.`;
  }
  if (caption) caption.textContent = `Selected idea notes for ${idea.title}`;
}

function renderInputRow(tbody, note = null) {
  const row = document.createElement("tr");
  row.dataset.ideaBoardInlineInputRow = "true";
  if (note) row.dataset.noteId = note.id;

  const noteCell = document.createElement("td");
  const input = document.createElement("input");
  input.type = "text";
  input.value = note?.note || "";
  input.setAttribute("aria-label", note ? "Edit selected idea note text" : "New selected idea note text");
  input.dataset.ideaBoardNoteInput = "true";
  noteCell.append(input);
  row.append(noteCell);

  row.append(cell(note?.type || "Creator"));
  row.append(cell(note?.createdBy || "Creator"));
  row.append(cell(note?.created || today()));
  row.append(cell(today()));

  const actions = document.createElement("td");
  actions.append(actionButton("Save", "save", "primary"), " ", actionButton("Cancel", "cancel"));
  row.append(actions);
  tbody.append(row);
  input.focus();
}

function renderNoteRow(tbody, note) {
  const row = document.createElement("tr");
  row.dataset.noteId = note.id;
  if (note.system) row.dataset.ideaBoardSystemNote = "true";
  row.append(cell(note.note));
  row.append(cell(note.type));
  row.append(cell(note.createdBy));
  row.append(cell(note.created));
  row.append(cell(note.updated));

  const actions = document.createElement("td");
  if (note.system) {
    actions.textContent = "System locked";
  } else {
    actions.append(actionButton("Edit", "edit"), " ", actionButton("Delete", "delete"));
  }
  row.append(actions);
  tbody.append(row);
}

function renderNotes(root) {
  const tbody = root.querySelector("[data-idea-board-notes-body]");
  const notes = selectedNotes();
  if (!tbody || !notes) {
    updateStatus(root, `Idea Board cannot load notes for selected idea: ${state.selectedIdeaId}.`);
    return;
  }
  tbody.replaceChildren();
  if (state.addingNote) renderInputRow(tbody);
  for (const note of notes) {
    if (state.editingNoteId === note.id) {
      renderInputRow(tbody, note);
    } else {
      renderNoteRow(tbody, note);
    }
  }
}

function render(root) {
  renderIdeaSelection(root);
  renderSelectedIdeaContext(root);
  renderNotes(root);
}

function saveRow(root, row) {
  const input = row.querySelector("[data-idea-board-note-input]");
  const value = input?.value.trim();
  if (!value) {
    updateStatus(root, "Enter note text before saving.");
    return;
  }

  const notes = selectedNotes();
  if (!notes) {
    updateStatus(root, `Idea Board cannot save notes for selected idea: ${state.selectedIdeaId}.`);
    return;
  }

  const noteId = row.dataset.noteId;
  if (noteId) {
    const note = notes.find((item) => item.id === noteId && !item.system);
    if (!note) {
      updateStatus(root, "Only creator notes can be edited.");
      return;
    }
    note.note = value;
    note.updated = today();
    state.editingNoteId = null;
    updateStatus(root, `Updated note for ${selectedIdea().title}.`);
  } else {
    notes.unshift({
      id: `creator-${state.selectedIdeaId}-${Date.now()}`,
      note: value,
      type: "Creator",
      createdBy: "Creator",
      created: today(),
      updated: today(),
      system: false,
    });
    state.addingNote = false;
    updateStatus(root, `Added note for ${selectedIdea().title}.`);
  }
  render(root);
}

function handleClick(root, event) {
  const ideaButton = event.target.closest("[data-idea-board-select-idea]");
  if (ideaButton) {
    state.selectedIdeaId = ideaButton.dataset.ideaBoardSelectIdea;
    state.addingNote = false;
    state.editingNoteId = null;
    updateStatus(root, `Selected ${selectedIdea().title}. Notes now show that idea's context.`);
    render(root);
    return;
  }

  const addButton = event.target.closest("[data-idea-board-add-note]");
  if (addButton) {
    state.addingNote = true;
    state.editingNoteId = null;
    updateStatus(root, `Adding a note for ${selectedIdea().title}.`);
    render(root);
    return;
  }

  const actionControl = event.target.closest("[data-idea-board-action]");
  if (!actionControl) return;
  const row = actionControl.closest("tr");
  const noteId = row?.dataset.noteId;
  const action = actionControl.dataset.ideaBoardAction;
  if (action === "edit") {
    state.editingNoteId = noteId;
    state.addingNote = false;
    updateStatus(root, `Editing note for ${selectedIdea().title}.`);
  } else if (action === "delete") {
    const notes = selectedNotes();
    const index = notes?.findIndex((note) => note.id === noteId && !note.system) ?? -1;
    if (index >= 0) {
      notes.splice(index, 1);
      updateStatus(root, `Deleted note for ${selectedIdea().title}.`);
    }
  } else if (action === "cancel") {
    state.editingNoteId = null;
    state.addingNote = false;
    updateStatus(root, `Cancelled note edit for ${selectedIdea().title}.`);
  } else if (action === "save") {
    saveRow(root, row);
    return;
  }
  render(root);
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-idea-board]");
  if (!root) return;
  render(root);
  root.addEventListener("click", (event) => handleClick(root, event));
});
