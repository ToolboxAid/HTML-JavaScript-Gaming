import {
  createProjectWorkspaceMockRepository,
} from "../project-workspace/project-workspace-mock-repository.js";

export const PROJECT_JOURNEY_CURRENT_USER_ID = "user-designer";

export const PROJECT_JOURNEY_STATUSES = [
  {
    id: "not-started",
    marker: "[ ]",
    label: "Not Started",
    icon: "⬜",
    open: true,
  },
  {
    id: "in-progress",
    marker: "[.]",
    label: "In Progress",
    icon: "🟡",
    open: true,
  },
  {
    id: "complete",
    marker: "[x]",
    label: "Complete",
    icon: "✅",
    open: false,
  },
  {
    id: "blocker",
    marker: "[!]",
    label: "Blocker",
    icon: "⛔",
    open: true,
  },
  {
    id: "decide",
    marker: "[?]",
    label: "Decide",
    icon: "❓",
    open: true,
  },
];

export const PROJECT_JOURNEY_STATUS_BY_ID = Object.fromEntries(
  PROJECT_JOURNEY_STATUSES.map((status) => [status.id, status]),
);

const now = "2026-06-06T09:00:00.000Z";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function timestamp(minutes) {
  return new Date(new Date(now).getTime() + minutes * 60_000).toISOString();
}

function normalizeIndent(indent) {
  const parsed = Number(indent);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.max(0, Math.min(4, Math.trunc(parsed)));
}

function resequence(entries) {
  entries
    .sort((left, right) => left.order - right.order)
    .forEach((entry, index) => {
      entry.order = index + 1;
    });
}

function getSeedTables() {
  const project_journey_note_types = [
    { id: "design", name: "Design", seeded: true, userExtensible: true },
    { id: "story", name: "Story", seeded: true, userExtensible: true },
    { id: "release", name: "Release", seeded: true, userExtensible: true },
    { id: "research", name: "Research", seeded: true, userExtensible: true },
    { id: "idea", name: "Idea", seeded: true, userExtensible: true },
    { id: "question", name: "Question", seeded: true, userExtensible: true },
    { id: "task", name: "Task", seeded: true, userExtensible: true },
  ];

  const project_journey_notes = [
    {
      id: "note-design-pass",
      projectId: "demo-project",
      ownerId: PROJECT_JOURNEY_CURRENT_USER_ID,
      name: "Palette and Input Density",
      typeId: "design",
      freeformNotes:
        "Track the palette editing flow, checked-swatch batch tagging, and how dense controls feel while iterating.",
      updatedAt: timestamp(5),
    },
    {
      id: "note-release-readiness",
      projectId: "demo-project",
      ownerId: "user-producer",
      name: "Release Readiness",
      typeId: "release",
      freeformNotes:
        "Keep launch risks and validation notes visible before the next handoff.",
      updatedAt: timestamp(9),
    },
    {
      id: "note-story-map",
      projectId: "demo-project",
      ownerId: PROJECT_JOURNEY_CURRENT_USER_ID,
      name: "Story Beats",
      typeId: "story",
      freeformNotes:
        "Draft the player-facing arc and keep undecided questions close to implementation tasks.",
      updatedAt: timestamp(14),
    },
    {
      id: "note-research-ux",
      projectId: "demo-project",
      ownerId: "user-producer",
      name: "Research Questions",
      typeId: "research",
      freeformNotes:
        "Collect research threads that should become separate notes or tasks later.",
      updatedAt: timestamp(18),
    },
  ];

  const project_journey_entries = [
    {
      id: "entry-design-1",
      noteId: "note-design-pass",
      statusId: "in-progress",
      text: "Review palette swatch affordance in the active project palette.",
      indent: 0,
      order: 1,
    },
    {
      id: "entry-design-2",
      noteId: "note-design-pass",
      statusId: "not-started",
      text: "Confirm batch tag language after checked swatches are applied.",
      indent: 1,
      order: 2,
    },
    {
      id: "entry-design-3",
      noteId: "note-design-pass",
      statusId: "decide",
      text: "Decide whether tag chips need a compact state for small canvases.",
      indent: 1,
      order: 3,
    },
    {
      id: "entry-release-1",
      noteId: "note-release-readiness",
      statusId: "blocker",
      text: "Resolve final validation lane ownership before release.",
      indent: 0,
      order: 1,
    },
    {
      id: "entry-release-2",
      noteId: "note-release-readiness",
      statusId: "complete",
      text: "Confirm no archived Tool V1/V2 files were touched.",
      indent: 0,
      order: 2,
    },
    {
      id: "entry-story-1",
      noteId: "note-story-map",
      statusId: "not-started",
      text: "Outline the opening player goal.",
      indent: 0,
      order: 1,
    },
    {
      id: "entry-story-2",
      noteId: "note-story-map",
      statusId: "in-progress",
      text: "Connect tutorial beats to workspace milestones.",
      indent: 1,
      order: 2,
    },
    {
      id: "entry-research-1",
      noteId: "note-research-ux",
      statusId: "decide",
      text: "Decide which unanswered UX questions need their own notes.",
      indent: 0,
      order: 1,
    },
  ];

  const project_journey_activity = [
    {
      id: "activity-1",
      projectId: "demo-project",
      noteId: "note-design-pass",
      message: "Palette and Input Density updated by Designer",
      createdAt: timestamp(20),
    },
    {
      id: "activity-2",
      projectId: "demo-project",
      noteId: "note-release-readiness",
      message: "Release Readiness marked with a blocker",
      createdAt: timestamp(22),
    },
  ];

  return {
    project_journey_note_types,
    project_journey_notes,
    project_journey_entries,
    project_journey_activity,
  };
}

export function createProjectJourneyMockRepository(options = {}) {
  const workspaceRepository =
    options.workspaceRepository || createProjectWorkspaceMockRepository();
  const tables = getSeedTables();
  let selectedNoteId = "note-design-pass";
  let selectedEntryId = "entry-design-1";
  let nextEntryNumber = tables.project_journey_entries.length + 1;
  let nextActivityNumber = tables.project_journey_activity.length + 1;
  let nextTypeNumber = tables.project_journey_note_types.length + 1;

  function touchNote(noteId) {
    const note = tables.project_journey_notes.find((item) => item.id === noteId);
    if (note) {
      note.updatedAt = new Date().toISOString();
    }
  }

  function addActivity(projectId, noteId, message) {
    tables.project_journey_activity.unshift({
      id: `activity-${nextActivityNumber}`,
      projectId,
      noteId,
      message,
      createdAt: new Date().toISOString(),
    });
    nextActivityNumber += 1;
  }

  function getActiveProject() {
    return workspaceRepository.getActiveProject();
  }

  function requireActiveProject() {
    const project = getActiveProject();
    if (!project) {
      return null;
    }
    return project;
  }

  function getEntriesForNote(noteId) {
    return tables.project_journey_entries
      .filter((entry) => entry.noteId === noteId)
      .sort((left, right) => left.order - right.order);
  }

  function getNoteCounts(noteId) {
    const counts = {
      open: 0,
      "not-started": 0,
      "in-progress": 0,
      complete: 0,
      blocker: 0,
      decide: 0,
    };

    getEntriesForNote(noteId).forEach((entry) => {
      const status = PROJECT_JOURNEY_STATUS_BY_ID[entry.statusId];
      if (!status) {
        return;
      }
      counts[entry.statusId] += 1;
      if (status.open) {
        counts.open += 1;
      }
    });

    return counts;
  }

  function noteMatchesFilter(note, filterId) {
    if (filterId === "mine") {
      return note.ownerId === PROJECT_JOURNEY_CURRENT_USER_ID;
    }

    if (!filterId || filterId === "all") {
      return true;
    }

    return getEntriesForNote(note.id).some((entry) => entry.statusId === filterId);
  }

  function listNotes(filterId = "all") {
    const activeProject = requireActiveProject();
    if (!activeProject) {
      return [];
    }

    return tables.project_journey_notes
      .filter((note) => note.projectId === activeProject.id)
      .filter((note) => noteMatchesFilter(note, filterId))
      .map((note) => ({
        ...clone(note),
        type: clone(
          tables.project_journey_note_types.find((type) => type.id === note.typeId),
        ),
        counts: getNoteCounts(note.id),
      }))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  function getSelectedNote() {
    const activeProject = requireActiveProject();
    if (!activeProject) {
      return null;
    }

    const note =
      tables.project_journey_notes.find(
        (item) => item.id === selectedNoteId && item.projectId === activeProject.id,
      ) || tables.project_journey_notes.find((item) => item.projectId === activeProject.id);

    if (!note) {
      return null;
    }

    selectedNoteId = note.id;
    const selectedEntry = tables.project_journey_entries.find(
      (entry) => entry.id === selectedEntryId && entry.noteId === note.id,
    );
    if (!selectedEntry) {
      selectedEntryId = getEntriesForNote(note.id)[0]?.id || "";
    }

    return {
      ...clone(note),
      type: clone(
        tables.project_journey_note_types.find((type) => type.id === note.typeId),
      ),
      counts: getNoteCounts(note.id),
      entries: clone(getEntriesForNote(note.id)),
    };
  }

  function selectNote(noteId) {
    const note = tables.project_journey_notes.find((item) => item.id === noteId);
    if (!note) {
      return getSelectedNote();
    }

    selectedNoteId = note.id;
    selectedEntryId = getEntriesForNote(note.id)[0]?.id || "";
    return getSelectedNote();
  }

  function selectEntry(entryId) {
    const entry = tables.project_journey_entries.find((item) => item.id === entryId);
    if (entry) {
      selectedEntryId = entry.id;
      selectedNoteId = entry.noteId;
    }
    return clone(entry || null);
  }

  function getSelectedEntry() {
    return clone(
      tables.project_journey_entries.find((entry) => entry.id === selectedEntryId) || null,
    );
  }

  function addEntry({ text, statusId, indent = 0 }) {
    const activeProject = requireActiveProject();
    const note = tables.project_journey_notes.find((item) => item.id === selectedNoteId);
    if (!activeProject || !note) {
      return null;
    }

    const existingEntries = getEntriesForNote(note.id);
    const entry = {
      id: `entry-new-${nextEntryNumber}`,
      noteId: note.id,
      statusId: PROJECT_JOURNEY_STATUS_BY_ID[statusId] ? statusId : "not-started",
      text: text.trim() || "New journey entry",
      indent: normalizeIndent(indent),
      order: existingEntries.length + 1,
    };
    nextEntryNumber += 1;
    tables.project_journey_entries.push(entry);
    selectedEntryId = entry.id;
    touchNote(note.id);
    addActivity(activeProject.id, note.id, `Added row to ${note.name}`);
    return clone(entry);
  }

  function updateEntry(entryId, updates = {}) {
    const activeProject = requireActiveProject();
    const entry = tables.project_journey_entries.find((item) => item.id === entryId);
    if (!activeProject || !entry) {
      return null;
    }

    if (typeof updates.text === "string") {
      entry.text = updates.text.trim() || entry.text;
    }
    if (PROJECT_JOURNEY_STATUS_BY_ID[updates.statusId]) {
      entry.statusId = updates.statusId;
    }
    if (updates.indent !== undefined) {
      entry.indent = normalizeIndent(updates.indent);
    }

    selectedEntryId = entry.id;
    selectedNoteId = entry.noteId;
    touchNote(entry.noteId);
    addActivity(activeProject.id, entry.noteId, "Updated selected journey row");
    return clone(entry);
  }

  function moveSelectedEntry(direction) {
    const activeProject = requireActiveProject();
    const entry = tables.project_journey_entries.find((item) => item.id === selectedEntryId);
    if (!activeProject || !entry) {
      return null;
    }

    const entries = getEntriesForNote(entry.noteId);
    const currentIndex = entries.findIndex((item) => item.id === entry.id);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= entries.length) {
      return clone(entry);
    }

    const neighbor = entries[nextIndex];
    const currentOrder = entry.order;
    entry.order = neighbor.order;
    neighbor.order = currentOrder;
    resequence(entries);
    touchNote(entry.noteId);
    addActivity(activeProject.id, entry.noteId, "Reordered journey rows");
    return clone(entry);
  }

  function changeSelectedIndent(delta) {
    const entry = tables.project_journey_entries.find((item) => item.id === selectedEntryId);
    if (!entry) {
      return null;
    }

    return updateEntry(entry.id, { indent: entry.indent + delta });
  }

  function updateSelectedNoteFreeform(value) {
    const activeProject = requireActiveProject();
    const note = tables.project_journey_notes.find((item) => item.id === selectedNoteId);
    if (!activeProject || !note) {
      return null;
    }

    note.freeformNotes = value;
    touchNote(note.id);
    return clone(note);
  }

  function addNoteType(name) {
    const normalized = String(name || "").trim();
    if (!normalized) {
      return null;
    }

    const existing = tables.project_journey_note_types.find(
      (type) => type.name.toLowerCase() === normalized.toLowerCase(),
    );
    if (existing) {
      return clone(existing);
    }

    const type = {
      id: `custom-type-${nextTypeNumber}`,
      name: normalized,
      seeded: false,
      userExtensible: true,
    };
    nextTypeNumber += 1;
    tables.project_journey_note_types.push(type);
    return clone(type);
  }

  function listRecentActivity(limit = 5) {
    const activeProject = requireActiveProject();
    if (!activeProject) {
      return [];
    }

    return clone(
      tables.project_journey_activity
        .filter((activity) => activity.projectId === activeProject.id)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .slice(0, limit),
    );
  }

  return {
    getTables: () => clone(tables),
    getActiveProject,
    openProject: (projectId) => workspaceRepository.openProject(projectId),
    clearActiveProject: () => workspaceRepository.clearTestData(),
    listNoteTypes: () => clone(tables.project_journey_note_types),
    addNoteType,
    listNotes,
    getSelectedNote,
    selectNote,
    selectEntry,
    getSelectedEntry,
    addEntry,
    updateEntry,
    moveSelectedEntry,
    changeSelectedIndent,
    updateSelectedNoteFreeform,
    getNoteCounts,
    listRecentActivity,
  };
}
