import {
  createProjectWorkspaceMockRepository,
} from "../project-workspace/project-workspace-mock-repository.js";

function makeUlid(sequence) {
  return `01K2GFSJ0Y${String(sequence).padStart(16, "0")}`;
}

export const PROJECT_JOURNEY_IDS = Object.freeze({
  project: makeUlid(1),
  users: Object.freeze({
    designer: makeUlid(51),
    producer: makeUlid(52),
  }),
  noteTypes: Object.freeze({
    design: makeUlid(101),
    story: makeUlid(102),
    release: makeUlid(103),
    research: makeUlid(104),
    idea: makeUlid(105),
    question: makeUlid(106),
    task: makeUlid(107),
  }),
  notes: Object.freeze({
    designPass: makeUlid(201),
    releaseReadiness: makeUlid(202),
    storyMap: makeUlid(203),
    researchUx: makeUlid(204),
  }),
  templates: Object.freeze({
    paletteAffordance: makeUlid(301),
    batchTagLanguage: makeUlid(302),
    compactTagState: makeUlid(303),
    releaseLaneOwnership: makeUlid(304),
    archiveBoundary: makeUlid(305),
    openingGoal: makeUlid(306),
    tutorialMilestones: makeUlid(307),
    uxSubnotes: makeUlid(308),
    inactiveGuidance: makeUlid(309),
    invalidMissing: makeUlid(399),
  }),
  items: Object.freeze({
    designAffordance: makeUlid(401),
    designBatchTag: makeUlid(402),
    designCompactTag: makeUlid(403),
    releaseLaneOwnership: makeUlid(404),
    releaseArchiveBoundary: makeUlid(405),
    releaseSkippedChecklist: makeUlid(406),
    storyOpeningGoal: makeUlid(407),
    storyTutorialMilestones: makeUlid(408),
    researchUxSubnotes: makeUlid(409),
  }),
  activity: Object.freeze({
    paletteDensityUpdated: makeUlid(501),
    releaseBlocked: makeUlid(502),
  }),
});

export const PROJECT_JOURNEY_CURRENT_USER_ID = PROJECT_JOURNEY_IDS.users.designer;

const PROJECT_JOURNEY_ROUTE_PROJECT_ALIAS = "demo-project";
const GENERATED_ULID_SEQUENCE = Object.freeze({
  item: 1001,
  activity: 2001,
  type: 3001,
  note: 4001,
  diagnostic: 5001,
});

export const PROJECT_JOURNEY_STATUSES = [
  {
    id: "not-started",
    marker: "[ ]",
    label: "Not Started",
    icon: "⬜",
    open: true,
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
    id: "skipped",
    marker: "[-]",
    label: "Skipped",
    icon: "⏭️",
    open: false,
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

function makeAuditFields(minutes, byType = "system") {
  const value = timestamp(minutes);
  return {
    createdAt: value,
    updatedAt: value,
    createdByType: byType,
    updatedByType: byType,
  };
}

function normalizeIndent(indent) {
  const parsed = Number(indent);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.max(0, Math.min(4, Math.trunc(parsed)));
}

function resequence(items) {
  items
    .sort((left, right) => left.order - right.order)
    .forEach((item, index) => {
      item.order = index + 1;
    });
}

function makeTemplate(templateId, templateKey, originalMeaning, systemGuidance, linkedToolContexts, minutes) {
  return {
    templateId,
    templateKey,
    originalMeaning,
    systemGuidance,
    linkedToolContexts,
    version: 1,
    isActive: true,
    ...makeAuditFields(minutes),
  };
}

function makeSystemItem({
  itemId,
  noteId,
  status,
  title,
  userDetails = "",
  templateId,
  linkedRecordType = "tool",
  linkedRecordId = "project-journey",
  indent = 0,
  order,
  minutes,
}) {
  const timestampValue = timestamp(minutes);
  return {
    itemId,
    projectId: PROJECT_JOURNEY_IDS.project,
    noteId,
    status,
    title,
    userDetails,
    createdByType: "system",
    updatedByType: "system",
    templateId,
    linkedRecordType,
    linkedRecordId,
    indent,
    order,
    createdAt: timestampValue,
    updatedAt: timestampValue,
  };
}

function getSeedTables() {
  const project_journey_note_types = [
    { id: PROJECT_JOURNEY_IDS.noteTypes.design, typeKey: "design", name: "Design", seeded: true, userExtensible: true, ...makeAuditFields(0) },
    { id: PROJECT_JOURNEY_IDS.noteTypes.story, typeKey: "story", name: "Story", seeded: true, userExtensible: true, ...makeAuditFields(0) },
    { id: PROJECT_JOURNEY_IDS.noteTypes.release, typeKey: "release", name: "Release", seeded: true, userExtensible: true, ...makeAuditFields(0) },
    { id: PROJECT_JOURNEY_IDS.noteTypes.research, typeKey: "research", name: "Research", seeded: true, userExtensible: true, ...makeAuditFields(0) },
    { id: PROJECT_JOURNEY_IDS.noteTypes.idea, typeKey: "idea", name: "Idea", seeded: true, userExtensible: true, ...makeAuditFields(0) },
    { id: PROJECT_JOURNEY_IDS.noteTypes.question, typeKey: "question", name: "Question", seeded: true, userExtensible: true, ...makeAuditFields(0) },
    { id: PROJECT_JOURNEY_IDS.noteTypes.task, typeKey: "task", name: "Task", seeded: true, userExtensible: true, ...makeAuditFields(0) },
  ];

  const project_journey_notes = [
    {
      id: PROJECT_JOURNEY_IDS.notes.designPass,
      noteKey: "design-pass",
      projectId: PROJECT_JOURNEY_IDS.project,
      ownerId: PROJECT_JOURNEY_CURRENT_USER_ID,
      name: "Palette and Input Density",
      typeId: PROJECT_JOURNEY_IDS.noteTypes.design,
      ...makeAuditFields(5),
    },
    {
      id: PROJECT_JOURNEY_IDS.notes.releaseReadiness,
      noteKey: "release-readiness",
      projectId: PROJECT_JOURNEY_IDS.project,
      ownerId: PROJECT_JOURNEY_IDS.users.producer,
      name: "Release Readiness",
      typeId: PROJECT_JOURNEY_IDS.noteTypes.release,
      ...makeAuditFields(9),
    },
    {
      id: PROJECT_JOURNEY_IDS.notes.storyMap,
      noteKey: "story-map",
      projectId: PROJECT_JOURNEY_IDS.project,
      ownerId: PROJECT_JOURNEY_CURRENT_USER_ID,
      name: "Story Beats",
      typeId: PROJECT_JOURNEY_IDS.noteTypes.story,
      ...makeAuditFields(14),
    },
    {
      id: PROJECT_JOURNEY_IDS.notes.researchUx,
      noteKey: "research-ux",
      projectId: PROJECT_JOURNEY_IDS.project,
      ownerId: PROJECT_JOURNEY_IDS.users.producer,
      name: "Research Questions",
      typeId: PROJECT_JOURNEY_IDS.noteTypes.research,
      ...makeAuditFields(18),
    },
  ];

  const project_journey_templates = [
    makeTemplate(
      PROJECT_JOURNEY_IDS.templates.paletteAffordance,
      "palette.swatch-affordance",
      "Review palette swatch affordance in the active project palette.",
      "Check whether selected swatches clearly expose batch tagging, checked state, and keyboard-friendly scanning.",
      ["Colors", "Project Workspace"],
      1,
    ),
    makeTemplate(
      PROJECT_JOURNEY_IDS.templates.batchTagLanguage,
      "palette.batch-tag-language",
      "Confirm batch tag language after checked swatches are applied.",
      "Keep the copy focused on what happens to checked swatches and avoid implying tags are auto-added.",
      ["Colors", "Project Workspace"],
      2,
    ),
    makeTemplate(
      PROJECT_JOURNEY_IDS.templates.compactTagState,
      "palette.compact-tag-state",
      "Decide whether tag chips need a compact state for small canvases.",
      "Compare dense palette screens against the normal Project Palette Tags view before creating another display mode.",
      ["Colors", "Game Design"],
      3,
    ),
    makeTemplate(
      PROJECT_JOURNEY_IDS.templates.releaseLaneOwnership,
      "release.validation-lane-ownership",
      "Resolve final validation lane ownership before release.",
      "Confirm the targeted lane owner is named before publish readiness moves forward.",
      ["Publish", "Game Testing"],
      4,
    ),
    makeTemplate(
      PROJECT_JOURNEY_IDS.templates.archiveBoundary,
      "release.archive-boundary",
      "Confirm no archived Tool V1/V2 files were touched.",
      "Use the active Toolbox paths for implementation and keep archived V1/V2 material read-only.",
      ["Publish", "Project Workspace"],
      5,
    ),
    makeTemplate(
      PROJECT_JOURNEY_IDS.templates.openingGoal,
      "story.opening-player-goal",
      "Outline the opening player goal.",
      "Describe the first player-readable goal in one sentence before expanding beats.",
      ["Game Design", "Project Workspace"],
      6,
    ),
    makeTemplate(
      PROJECT_JOURNEY_IDS.templates.tutorialMilestones,
      "story.tutorial-workspace-milestones",
      "Connect tutorial beats to workspace milestones.",
      "Attach tutorial beats to concrete build path milestones so story work stays testable.",
      ["Game Design", "Project Workspace"],
      7,
    ),
    makeTemplate(
      PROJECT_JOURNEY_IDS.templates.uxSubnotes,
      "research.ux-subnote-decision",
      "Decide which unanswered UX questions need their own notes.",
      "Promote only durable UX questions into separate notes; keep short follow-ups inline as item details.",
      ["AI Assistant", "Project Workspace"],
      8,
    ),
    {
      ...makeTemplate(
        PROJECT_JOURNEY_IDS.templates.inactiveGuidance,
        "diagnostic.inactive-guidance",
        "Inactive template diagnostic.",
        "This inactive template exists only for Project Journey diagnostics validation.",
        ["Project Workspace"],
        9,
      ),
      isActive: false,
      updatedByType: "system",
      updatedAt: timestamp(19),
    },
  ];

  const project_journey_items = [
    makeSystemItem({
      itemId: PROJECT_JOURNEY_IDS.items.designAffordance,
      noteId: PROJECT_JOURNEY_IDS.notes.designPass,
      status: "in-progress",
      title: "Review palette swatch affordance in the active project palette.",
      userDetails: "Designer review should focus on checkbox visibility and selected-row contrast.",
      templateId: PROJECT_JOURNEY_IDS.templates.paletteAffordance,
      indent: 0,
      order: 1,
      minutes: 10,
    }),
    makeSystemItem({
      itemId: PROJECT_JOURNEY_IDS.items.designBatchTag,
      noteId: PROJECT_JOURNEY_IDS.notes.designPass,
      status: "not-started",
      title: "Confirm batch tag language after checked swatches are applied.",
      templateId: PROJECT_JOURNEY_IDS.templates.batchTagLanguage,
      indent: 1,
      order: 2,
      minutes: 11,
    }),
    makeSystemItem({
      itemId: PROJECT_JOURNEY_IDS.items.designCompactTag,
      noteId: PROJECT_JOURNEY_IDS.notes.designPass,
      status: "decide",
      title: "Decide whether tag chips need a compact state for small canvases.",
      templateId: PROJECT_JOURNEY_IDS.templates.compactTagState,
      indent: 1,
      order: 3,
      minutes: 12,
    }),
    makeSystemItem({
      itemId: PROJECT_JOURNEY_IDS.items.releaseLaneOwnership,
      noteId: PROJECT_JOURNEY_IDS.notes.releaseReadiness,
      status: "blocker",
      title: "Resolve final validation lane ownership before release.",
      templateId: PROJECT_JOURNEY_IDS.templates.releaseLaneOwnership,
      indent: 0,
      order: 1,
      minutes: 13,
    }),
    makeSystemItem({
      itemId: PROJECT_JOURNEY_IDS.items.releaseArchiveBoundary,
      noteId: PROJECT_JOURNEY_IDS.notes.releaseReadiness,
      status: "complete",
      title: "Confirm no archived Tool V1/V2 files were touched.",
      templateId: PROJECT_JOURNEY_IDS.templates.archiveBoundary,
      indent: 0,
      order: 2,
      minutes: 14,
    }),
    makeSystemItem({
      itemId: PROJECT_JOURNEY_IDS.items.releaseSkippedChecklist,
      noteId: PROJECT_JOURNEY_IDS.notes.releaseReadiness,
      status: "skipped",
      title: "Skip launch-day checklist items that no longer apply.",
      templateId: PROJECT_JOURNEY_IDS.templates.archiveBoundary,
      indent: 0,
      order: 3,
      minutes: 15,
    }),
    makeSystemItem({
      itemId: PROJECT_JOURNEY_IDS.items.storyOpeningGoal,
      noteId: PROJECT_JOURNEY_IDS.notes.storyMap,
      status: "not-started",
      title: "Outline the opening player goal.",
      templateId: PROJECT_JOURNEY_IDS.templates.openingGoal,
      indent: 0,
      order: 1,
      minutes: 16,
    }),
    makeSystemItem({
      itemId: PROJECT_JOURNEY_IDS.items.storyTutorialMilestones,
      noteId: PROJECT_JOURNEY_IDS.notes.storyMap,
      status: "in-progress",
      title: "Connect tutorial beats to workspace milestones.",
      templateId: PROJECT_JOURNEY_IDS.templates.tutorialMilestones,
      indent: 1,
      order: 2,
      minutes: 17,
    }),
    makeSystemItem({
      itemId: PROJECT_JOURNEY_IDS.items.researchUxSubnotes,
      noteId: PROJECT_JOURNEY_IDS.notes.researchUx,
      status: "decide",
      title: "Decide which unanswered UX questions need their own notes.",
      templateId: PROJECT_JOURNEY_IDS.templates.uxSubnotes,
      indent: 0,
      order: 1,
      minutes: 18,
    }),
  ];

  const project_journey_activity = [
    {
      id: PROJECT_JOURNEY_IDS.activity.paletteDensityUpdated,
      projectId: PROJECT_JOURNEY_IDS.project,
      noteId: PROJECT_JOURNEY_IDS.notes.designPass,
      message: "Palette and Input Density updated by Designer",
      ...makeAuditFields(20),
    },
    {
      id: PROJECT_JOURNEY_IDS.activity.releaseBlocked,
      projectId: PROJECT_JOURNEY_IDS.project,
      noteId: PROJECT_JOURNEY_IDS.notes.releaseReadiness,
      message: "Release Readiness marked with a blocker",
      ...makeAuditFields(22),
    },
  ];

  return {
    project_journey_note_types,
    project_journey_notes,
    project_journey_templates,
    project_journey_items,
    project_journey_activity,
  };
}

export function createProjectJourneyMockRepository(options = {}) {
  const workspaceRepository =
    options.workspaceRepository || createProjectWorkspaceMockRepository();
  const tables = getSeedTables();
  let selectedNoteId = PROJECT_JOURNEY_IDS.notes.designPass;
  let selectedItemId = PROJECT_JOURNEY_IDS.items.designAffordance;
  let nextItemNumber = GENERATED_ULID_SEQUENCE.item;
  let nextActivityNumber = GENERATED_ULID_SEQUENCE.activity;
  let nextTypeNumber = GENERATED_ULID_SEQUENCE.type;
  let nextNoteNumber = GENERATED_ULID_SEQUENCE.note;
  let nextDiagnosticNumber = GENERATED_ULID_SEQUENCE.diagnostic;

  function touchNote(noteId, updatedByType = "user") {
    const note = tables.project_journey_notes.find((item) => item.id === noteId);
    if (note) {
      note.updatedAt = new Date().toISOString();
      note.updatedByType = updatedByType === "system" ? "system" : "user";
    }
  }

  function addActivity(projectId, noteId, message, byType = "user") {
    const timestampValue = new Date().toISOString();
    tables.project_journey_activity.unshift({
      id: makeUlid(nextActivityNumber),
      projectId,
      noteId,
      message,
      createdAt: timestampValue,
      updatedAt: timestampValue,
      createdByType: byType === "system" ? "system" : "user",
      updatedByType: byType === "system" ? "system" : "user",
    });
    nextActivityNumber += 1;
  }

  function getActiveProject() {
    const project = workspaceRepository.getActiveProject();
    if (!project) {
      return null;
    }
    return {
      ...project,
      id: PROJECT_JOURNEY_IDS.project,
    };
  }

  function requireActiveProject() {
    const project = getActiveProject();
    if (!project) {
      return null;
    }
    return project;
  }

  function resolveTemplate(item) {
    if (item.createdByType !== "system") {
      return {
        template: null,
        templateDiagnostic: null,
      };
    }

    if (!item.templateId) {
      return {
        template: null,
        templateDiagnostic: {
          type: "missing",
          message: `System-created item "${item.title}" is missing templateId.`,
        },
      };
    }

    const template = tables.project_journey_templates.find(
      (candidate) => candidate.templateId === item.templateId,
    );
    if (!template) {
      return {
        template: null,
        templateDiagnostic: {
          type: "invalid",
          message: `System-created item "${item.title}" references missing templateId ${item.templateId}.`,
        },
      };
    }

    if (!template.isActive) {
      return {
        template: clone(template),
        templateDiagnostic: {
          type: "inactive",
          message: `System-created item "${item.title}" references inactive templateId ${item.templateId}.`,
        },
      };
    }

    return {
      template: clone(template),
      templateDiagnostic: null,
    };
  }

  function hydrateItem(item) {
    const { template, templateDiagnostic } = resolveTemplate(item);
    return {
      ...clone(item),
      template,
      templateDiagnostic,
      originalMeaning: template?.originalMeaning || "",
      systemGuidance: template?.systemGuidance || "",
      linkedToolContexts: template?.linkedToolContexts || [],
    };
  }

  function getItemsForNote(noteId) {
    return tables.project_journey_items
      .filter((item) => item.noteId === noteId)
      .sort((left, right) => left.order - right.order);
  }

  function itemMatchesCountFilter(item, filterId) {
    if (filterId === "system") {
      return item.createdByType === "system";
    }
    return true;
  }

  function getNoteCounts(noteId, filterId = "all") {
    const counts = {
      total: 0,
      open: 0,
      "not-started": 0,
      "in-progress": 0,
      complete: 0,
      skipped: 0,
      blocker: 0,
      decide: 0,
    };

    getItemsForNote(noteId).filter((item) => itemMatchesCountFilter(item, filterId)).forEach((item) => {
      const status = PROJECT_JOURNEY_STATUS_BY_ID[item.status];
      if (!status) {
        return;
      }
      counts.total += 1;
      counts[item.status] += 1;
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

    if (filterId === "system") {
      return getItemsForNote(note.id).some((item) => item.createdByType === "system");
    }

    return getItemsForNote(note.id).some((item) => item.status === filterId);
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
        counts: getNoteCounts(note.id, filterId === "system" ? "system" : "all"),
      }))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  function addNote({ name, typeId } = {}) {
    const activeProject = requireActiveProject();
    if (!activeProject) {
      return null;
    }

    const normalizedName = String(name || "").trim() || "New Project Journey Note";
    const selectedType =
      tables.project_journey_note_types.find((type) => type.id === typeId) ||
      tables.project_journey_note_types[0];
    const timestampValue = new Date().toISOString();
    const note = {
      id: makeUlid(nextNoteNumber),
      noteKey: `user-note-${nextNoteNumber}`,
      projectId: activeProject.id,
      ownerId: PROJECT_JOURNEY_CURRENT_USER_ID,
      name: normalizedName,
      typeId: selectedType?.id || "",
      createdAt: timestampValue,
      updatedAt: timestampValue,
      createdByType: "user",
      updatedByType: "user",
    };
    nextNoteNumber += 1;
    tables.project_journey_notes.push(note);
    selectedNoteId = note.id;
    selectedItemId = "";
    addActivity(activeProject.id, note.id, `Added note ${note.name}`, "user");
    return getSelectedNote();
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
    const selectedItem = tables.project_journey_items.find(
      (item) => item.itemId === selectedItemId && item.noteId === note.id,
    );
    if (!selectedItem) {
      selectedItemId = getItemsForNote(note.id)[0]?.itemId || "";
    }

    return {
      ...clone(note),
      type: clone(
        tables.project_journey_note_types.find((type) => type.id === note.typeId),
      ),
      counts: getNoteCounts(note.id),
      items: getItemsForNote(note.id).map(hydrateItem),
    };
  }

  function selectNote(noteId) {
    const note = tables.project_journey_notes.find((item) => item.id === noteId);
    if (!note) {
      return getSelectedNote();
    }

    selectedNoteId = note.id;
    selectedItemId = getItemsForNote(note.id)[0]?.itemId || "";
    return getSelectedNote();
  }

  function selectItem(itemId) {
    const item = tables.project_journey_items.find((candidate) => candidate.itemId === itemId);
    if (item) {
      selectedItemId = item.itemId;
      selectedNoteId = item.noteId;
    }
    return item ? hydrateItem(item) : null;
  }

  function getSelectedItem() {
    const item = tables.project_journey_items.find((candidate) => candidate.itemId === selectedItemId);
    return item ? hydrateItem(item) : null;
  }

  function addItem({ title, status, userDetails = "", indent = 0 }) {
    const activeProject = requireActiveProject();
    const note = tables.project_journey_notes.find((item) => item.id === selectedNoteId);
    if (!activeProject || !note) {
      return null;
    }

    const existingItems = getItemsForNote(note.id);
    const timestampValue = new Date().toISOString();
    const item = {
      itemId: makeUlid(nextItemNumber),
      projectId: activeProject.id,
      noteId: note.id,
      status: PROJECT_JOURNEY_STATUS_BY_ID[status] ? status : "not-started",
      title: String(title || "").trim() || "New journey item",
      userDetails: String(userDetails || "").trim(),
      createdByType: "user",
      updatedByType: "user",
      templateId: "",
      linkedRecordType: "",
      linkedRecordId: "",
      indent: normalizeIndent(indent),
      order: existingItems.length + 1,
      createdAt: timestampValue,
      updatedAt: timestampValue,
    };
    nextItemNumber += 1;
    tables.project_journey_items.push(item);
    selectedItemId = item.itemId;
    touchNote(note.id, "user");
    addActivity(activeProject.id, note.id, `Added item to ${note.name}`, "user");
    return hydrateItem(item);
  }

  function deleteItem(itemId) {
    const activeProject = requireActiveProject();
    const item = tables.project_journey_items.find((candidate) => candidate.itemId === itemId);
    if (!activeProject || !item) {
      return {
        deleted: false,
        reason: "No journey item is selected for deletion.",
      };
    }

    if (item.createdByType === "system") {
      return {
        deleted: false,
        reason: "System-created items can be edited but not deleted.",
        item: hydrateItem(item),
      };
    }

    const note = tables.project_journey_notes.find((candidate) => candidate.id === item.noteId);
    const deletedOrder = item.order;
    tables.project_journey_items = tables.project_journey_items.filter(
      (candidate) => candidate.itemId !== item.itemId,
    );
    const remainingItems = getItemsForNote(item.noteId);
    resequence(remainingItems);
    selectedItemId =
      remainingItems.find((candidate) => candidate.order >= deletedOrder)?.itemId ||
      remainingItems.at(-1)?.itemId ||
      "";
    touchNote(item.noteId, "user");
    addActivity(activeProject.id, item.noteId, `Deleted user item from ${note?.name || "Project Journey"}`, "user");
    return {
      deleted: true,
      reason: "Deleted user-created item.",
      selectedItemId,
    };
  }

  function updateItem(itemId, updates = {}, updatedByType = "user") {
    const activeProject = requireActiveProject();
    const item = tables.project_journey_items.find((candidate) => candidate.itemId === itemId);
    if (!activeProject || !item) {
      return null;
    }

    const isSystemItem = item.createdByType === "system";
    if (!isSystemItem && typeof updates.title === "string") {
      item.title = updates.title.trim() || item.title;
    }
    if (PROJECT_JOURNEY_STATUS_BY_ID[updates.status]) {
      item.status = updates.status;
    }
    if (typeof updates.userDetails === "string") {
      item.userDetails = updates.userDetails.trim();
    }
    if (updates.indent !== undefined) {
      item.indent = normalizeIndent(updates.indent);
    }
    if (updatedByType === "system" && typeof updates.title === "string") {
      item.title = updates.title.trim() || item.title;
    }

    item.updatedByType = updatedByType === "system" ? "system" : "user";
    item.updatedAt = new Date().toISOString();
    selectedItemId = item.itemId;
    selectedNoteId = item.noteId;
    touchNote(item.noteId, item.updatedByType);
    addActivity(activeProject.id, item.noteId, `${item.updatedByType === "system" ? "System" : "User"} updated selected journey item`, item.updatedByType);
    return hydrateItem(item);
  }

  function applySystemItemUpdate(itemId, updates = {}) {
    return updateItem(itemId, updates, "system");
  }

  function moveSelectedItem(direction) {
    const activeProject = requireActiveProject();
    const item = tables.project_journey_items.find((candidate) => candidate.itemId === selectedItemId);
    if (!activeProject || !item) {
      return null;
    }

    const items = getItemsForNote(item.noteId);
    const currentIndex = items.findIndex((candidate) => candidate.itemId === item.itemId);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= items.length) {
      return hydrateItem(item);
    }

    const neighbor = items[nextIndex];
    const currentOrder = item.order;
    const timestampValue = new Date().toISOString();
    item.order = neighbor.order;
    neighbor.order = currentOrder;
    item.updatedByType = "user";
    neighbor.updatedByType = "user";
    item.updatedAt = timestampValue;
    neighbor.updatedAt = timestampValue;
    resequence(items);
    touchNote(item.noteId, "user");
    addActivity(activeProject.id, item.noteId, "Reordered journey items", "user");
    return hydrateItem(item);
  }

  function changeSelectedIndent(delta) {
    const item = tables.project_journey_items.find((candidate) => candidate.itemId === selectedItemId);
    if (!item) {
      return null;
    }

    return updateItem(item.itemId, { indent: item.indent + delta }, "user");
  }

  function updateSelectedNoteType(typeId) {
    const activeProject = requireActiveProject();
    const note = tables.project_journey_notes.find((item) => item.id === selectedNoteId);
    const type = tables.project_journey_note_types.find((item) => item.id === typeId);
    if (!activeProject || !note || !type) {
      return null;
    }

    note.typeId = type.id;
    touchNote(note.id, "user");
    addActivity(activeProject.id, note.id, `Changed ${note.name} type to ${type.name}`, "user");
    return getSelectedNote();
  }

  function addNoteType(name) {
    const normalized = String(name || "").trim();
    if (!normalized) {
      return {
        type: null,
        created: false,
        duplicate: false,
        message: "Enter a type name to add it to the mock note type table.",
      };
    }

    const existing = tables.project_journey_note_types.find(
      (type) => type.name.toLowerCase() === normalized.toLowerCase(),
    );
    if (existing) {
      return {
        type: clone(existing),
        created: false,
        duplicate: true,
        message: `${existing.name} already exists in the mock note type table.`,
      };
    }

    const timestampValue = new Date().toISOString();
    const type = {
      id: makeUlid(nextTypeNumber),
      typeKey: `custom-${nextTypeNumber}`,
      name: normalized,
      seeded: false,
      userExtensible: true,
      createdAt: timestampValue,
      updatedAt: timestampValue,
      createdByType: "user",
      updatedByType: "user",
    };
    nextTypeNumber += 1;
    tables.project_journey_note_types.push(type);
    return {
      type: clone(type),
      created: true,
      duplicate: false,
      message: `${type.name} is available in the mock note type table.`,
    };
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

  function getTemplateDiagnostics() {
    return tables.project_journey_items
      .filter((item) => item.projectId === getActiveProject()?.id)
      .map(resolveTemplate)
      .map((result) => result.templateDiagnostic)
      .filter(Boolean);
  }

  function injectTemplateDiagnostics() {
    const activeProject = requireActiveProject();
    if (!activeProject) {
      return [];
    }

    const noteId = PROJECT_JOURNEY_IDS.notes.designPass;
    const existingItems = getItemsForNote(noteId);
    const fixtures = [
      {
        title: "Missing template diagnostic item",
        templateId: "",
        status: "not-started",
      },
      {
        title: "Inactive template diagnostic item",
        templateId: PROJECT_JOURNEY_IDS.templates.inactiveGuidance,
        status: "blocker",
      },
      {
        title: "Invalid template diagnostic item",
        templateId: PROJECT_JOURNEY_IDS.templates.invalidMissing,
        status: "decide",
      },
    ];
    const created = fixtures.map((fixture, index) => {
      const timestampValue = new Date().toISOString();
      const item = {
        itemId: makeUlid(nextDiagnosticNumber),
        projectId: activeProject.id,
        noteId,
        status: fixture.status,
        title: fixture.title,
        userDetails: "",
        createdByType: "system",
        updatedByType: "system",
        templateId: fixture.templateId,
        linkedRecordType: "diagnostic",
        linkedRecordId: fixture.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        indent: 0,
        order: existingItems.length + index + 1,
        createdAt: timestampValue,
        updatedAt: timestampValue,
      };
      nextDiagnosticNumber += 1;
      tables.project_journey_items.push(item);
      return hydrateItem(item);
    });
    touchNote(noteId, "system");
    return created;
  }

  function openProject(projectId) {
    const workspaceProjectId =
      projectId === PROJECT_JOURNEY_IDS.project ? PROJECT_JOURNEY_ROUTE_PROJECT_ALIAS : projectId;
    return workspaceRepository.openProject(workspaceProjectId);
  }

  return {
    getTables: () => clone(tables),
    getActiveProject,
    openProject,
    clearActiveProject: () => workspaceRepository.clearTestData(),
    listNoteTypes: () => clone(tables.project_journey_note_types),
    addNoteType,
    addNote,
    updateSelectedNoteType,
    listNotes,
    getSelectedNote,
    selectNote,
    selectItem,
    getSelectedItem,
    addItem,
    deleteItem,
    updateItem,
    applySystemItemUpdate,
    moveSelectedItem,
    changeSelectedIndent,
    getNoteCounts,
    getTemplateDiagnostics,
    injectTemplateDiagnostics,
    listRecentActivity,
  };
}
