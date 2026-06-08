import {
  createProjectWorkspaceMockRepository,
} from "../project-workspace/project-workspace-mock-repository.js";
import {
  loadMockDbTables,
  MOCK_DB_KEYS,
  saveMockDbTables,
  getMockDbSessionUser,
  getMockDbSystemUser,
} from "../../src/dev-runtime/persistence/mock-db-store.js";

function makeUlid(sequence) {
  return `01K2GFSJ0Y${String(sequence).padStart(16, "0")}`;
}

function sequenceFromUlid(value) {
  const match = /^01K2GFSJ0Y(\d{16})$/.exec(String(value || ""));
  return match ? Number.parseInt(match[1], 10) : Number.NaN;
}

function nextUlidSequence(records, startAt, endBefore) {
  const maxSequence = records.reduce((max, record) => {
    const sequence = sequenceFromUlid(record.key);
    if (!Number.isFinite(sequence) || sequence < startAt || sequence >= endBefore) {
      return max;
    }
    return Math.max(max, sequence);
  }, startAt - 1);
  return maxSequence + 1;
}

export const PROJECT_JOURNEY_KEYS = Object.freeze({
  project: makeUlid(1),
  users: Object.freeze({
    user1: MOCK_DB_KEYS.users.user1,
    user2: MOCK_DB_KEYS.users.user2,
    user3: MOCK_DB_KEYS.users.user3,
    admin: MOCK_DB_KEYS.users.admin,
    forgeBot: MOCK_DB_KEYS.users.forgeBot,
    designer: MOCK_DB_KEYS.users.user1,
    producer: MOCK_DB_KEYS.users.user2,
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

export const PROJECT_JOURNEY_CURRENT_USER_KEY = PROJECT_JOURNEY_KEYS.users.user1;

const PROJECT_JOURNEY_ROUTE_PROJECT_ALIAS = "demo-project";
const PROJECT_JOURNEY_DB_OWNER = "project-journey";
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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function timestamp(minutes) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function makeAuditFields(minutes, userKey = MOCK_DB_KEYS.users.forgeBot) {
  const value = timestamp(minutes);
  return {
    createdAt: value,
    updatedAt: value,
    createdBy: userKey,
    updatedBy: userKey,
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

function makeTemplate(key, templateSlug, originalMeaning, systemGuidance, linkedToolContexts, minutes) {
  return {
    key,
    templateSlug,
    originalMeaning,
    systemGuidance,
    linkedToolContexts,
    version: 1,
    isActive: true,
    ...makeAuditFields(minutes),
  };
}

function makeSystemItem({
  key,
  noteKey,
  status,
  title,
  userDetails = "",
  templateKey,
  linkedRecordType = "tool",
  linkedRecordId = "project-journey",
  indent = 0,
  order,
  minutes,
}) {
  return {
    key,
    projectKey: PROJECT_JOURNEY_KEYS.project,
    noteKey,
    status,
    title,
    userDetails,
    templateKey,
    linkedRecordType,
    linkedRecordId,
    indent,
    order,
    ...makeAuditFields(minutes, MOCK_DB_KEYS.users.forgeBot),
  };
}

function getSeedTables() {
  const project_journey_note_types = [
    { key: PROJECT_JOURNEY_KEYS.noteTypes.design, typeSlug: "design", name: "Design", seeded: true, userExtensible: true, ...makeAuditFields(0) },
    { key: PROJECT_JOURNEY_KEYS.noteTypes.story, typeSlug: "story", name: "Story", seeded: true, userExtensible: true, ...makeAuditFields(0) },
    { key: PROJECT_JOURNEY_KEYS.noteTypes.release, typeSlug: "release", name: "Release", seeded: true, userExtensible: true, ...makeAuditFields(0) },
    { key: PROJECT_JOURNEY_KEYS.noteTypes.research, typeSlug: "research", name: "Research", seeded: true, userExtensible: true, ...makeAuditFields(0) },
    { key: PROJECT_JOURNEY_KEYS.noteTypes.idea, typeSlug: "idea", name: "Idea", seeded: true, userExtensible: true, ...makeAuditFields(0) },
    { key: PROJECT_JOURNEY_KEYS.noteTypes.question, typeSlug: "question", name: "Question", seeded: true, userExtensible: true, ...makeAuditFields(0) },
    { key: PROJECT_JOURNEY_KEYS.noteTypes.task, typeSlug: "task", name: "Task", seeded: true, userExtensible: true, ...makeAuditFields(0) },
  ];

  const project_journey_notes = [
    {
      key: PROJECT_JOURNEY_KEYS.notes.designPass,
      slug: "design-pass",
      projectKey: PROJECT_JOURNEY_KEYS.project,
      ownerKey: PROJECT_JOURNEY_KEYS.users.user1,
      name: "Palette and Input Density",
      typeKey: PROJECT_JOURNEY_KEYS.noteTypes.design,
      ...makeAuditFields(5, MOCK_DB_KEYS.users.user1),
    },
    {
      key: PROJECT_JOURNEY_KEYS.notes.releaseReadiness,
      slug: "release-readiness",
      projectKey: PROJECT_JOURNEY_KEYS.project,
      ownerKey: PROJECT_JOURNEY_KEYS.users.user2,
      name: "Release Readiness",
      typeKey: PROJECT_JOURNEY_KEYS.noteTypes.release,
      ...makeAuditFields(9, MOCK_DB_KEYS.users.user2),
    },
    {
      key: PROJECT_JOURNEY_KEYS.notes.storyMap,
      slug: "story-map",
      projectKey: PROJECT_JOURNEY_KEYS.project,
      ownerKey: PROJECT_JOURNEY_KEYS.users.user1,
      name: "Story Beats",
      typeKey: PROJECT_JOURNEY_KEYS.noteTypes.story,
      ...makeAuditFields(14, MOCK_DB_KEYS.users.user1),
    },
    {
      key: PROJECT_JOURNEY_KEYS.notes.researchUx,
      slug: "research-ux",
      projectKey: PROJECT_JOURNEY_KEYS.project,
      ownerKey: PROJECT_JOURNEY_KEYS.users.user2,
      name: "Research Questions",
      typeKey: PROJECT_JOURNEY_KEYS.noteTypes.research,
      ...makeAuditFields(18, MOCK_DB_KEYS.users.user2),
    },
  ];

  const project_journey_templates = [
    makeTemplate(
      PROJECT_JOURNEY_KEYS.templates.paletteAffordance,
      "palette.swatch-affordance",
      "Review palette swatch affordance in the active project palette.",
      "Check whether selected swatches clearly expose batch tagging, checked state, and keyboard-friendly scanning.",
      ["Colors", "Project Workspace"],
      1,
    ),
    makeTemplate(
      PROJECT_JOURNEY_KEYS.templates.batchTagLanguage,
      "palette.batch-tag-language",
      "Confirm batch tag language after checked swatches are applied.",
      "Keep the copy focused on what happens to checked swatches and avoid implying tags are auto-added.",
      ["Colors", "Project Workspace"],
      2,
    ),
    makeTemplate(
      PROJECT_JOURNEY_KEYS.templates.compactTagState,
      "palette.compact-tag-state",
      "Decide whether tag chips need a compact state for small canvases.",
      "Compare dense palette screens against the normal Project Palette Tags view before creating another display mode.",
      ["Colors", "Game Design"],
      3,
    ),
    makeTemplate(
      PROJECT_JOURNEY_KEYS.templates.releaseLaneOwnership,
      "release.validation-lane-ownership",
      "Resolve final validation lane ownership before release.",
      "Confirm the targeted lane owner is named before publish readiness moves forward.",
      ["Publish", "Game Testing"],
      4,
    ),
    makeTemplate(
      PROJECT_JOURNEY_KEYS.templates.archiveBoundary,
      "release.archive-boundary",
      "Confirm no archived Tool V1/V2 files were touched.",
      "Use the active Toolbox paths for implementation and keep archived V1/V2 material read-only.",
      ["Publish", "Project Workspace"],
      5,
    ),
    makeTemplate(
      PROJECT_JOURNEY_KEYS.templates.openingGoal,
      "story.opening-player-goal",
      "Outline the opening player goal.",
      "Describe the first player-readable goal in one sentence before expanding beats.",
      ["Game Design", "Project Workspace"],
      6,
    ),
    makeTemplate(
      PROJECT_JOURNEY_KEYS.templates.tutorialMilestones,
      "story.tutorial-workspace-milestones",
      "Connect tutorial beats to workspace milestones.",
      "Attach tutorial beats to concrete build path milestones so story work stays testable.",
      ["Game Design", "Project Workspace"],
      7,
    ),
    makeTemplate(
      PROJECT_JOURNEY_KEYS.templates.uxSubnotes,
      "research.ux-subnote-decision",
      "Decide which unanswered UX questions need their own notes.",
      "Promote only durable UX questions into separate notes; keep short follow-ups inline as item details.",
      ["AI Assistant", "Project Workspace"],
      8,
    ),
    {
      ...makeTemplate(
        PROJECT_JOURNEY_KEYS.templates.inactiveGuidance,
        "diagnostic.inactive-guidance",
        "Inactive template diagnostic.",
        "This inactive template exists only for Project Journey diagnostics validation.",
        ["Project Workspace"],
        9,
      ),
      isActive: false,
      updatedAt: timestamp(19),
    },
  ];

  const project_journey_items = [
    makeSystemItem({
      key: PROJECT_JOURNEY_KEYS.items.designAffordance,
      noteKey: PROJECT_JOURNEY_KEYS.notes.designPass,
      status: "in-progress",
      title: "Review palette swatch affordance in the active project palette.",
      userDetails: "Designer review should focus on checkbox visibility and selected-row contrast.",
      templateKey: PROJECT_JOURNEY_KEYS.templates.paletteAffordance,
      indent: 0,
      order: 1,
      minutes: 10,
    }),
    makeSystemItem({
      key: PROJECT_JOURNEY_KEYS.items.designBatchTag,
      noteKey: PROJECT_JOURNEY_KEYS.notes.designPass,
      status: "not-started",
      title: "Confirm batch tag language after checked swatches are applied.",
      templateKey: PROJECT_JOURNEY_KEYS.templates.batchTagLanguage,
      indent: 1,
      order: 2,
      minutes: 11,
    }),
    makeSystemItem({
      key: PROJECT_JOURNEY_KEYS.items.designCompactTag,
      noteKey: PROJECT_JOURNEY_KEYS.notes.designPass,
      status: "decide",
      title: "Decide whether tag chips need a compact state for small canvases.",
      templateKey: PROJECT_JOURNEY_KEYS.templates.compactTagState,
      indent: 1,
      order: 3,
      minutes: 12,
    }),
    makeSystemItem({
      key: PROJECT_JOURNEY_KEYS.items.releaseLaneOwnership,
      noteKey: PROJECT_JOURNEY_KEYS.notes.releaseReadiness,
      status: "blocker",
      title: "Resolve final validation lane ownership before release.",
      templateKey: PROJECT_JOURNEY_KEYS.templates.releaseLaneOwnership,
      indent: 0,
      order: 1,
      minutes: 13,
    }),
    makeSystemItem({
      key: PROJECT_JOURNEY_KEYS.items.releaseArchiveBoundary,
      noteKey: PROJECT_JOURNEY_KEYS.notes.releaseReadiness,
      status: "complete",
      title: "Confirm no archived Tool V1/V2 files were touched.",
      templateKey: PROJECT_JOURNEY_KEYS.templates.archiveBoundary,
      indent: 0,
      order: 2,
      minutes: 14,
    }),
    makeSystemItem({
      key: PROJECT_JOURNEY_KEYS.items.releaseSkippedChecklist,
      noteKey: PROJECT_JOURNEY_KEYS.notes.releaseReadiness,
      status: "skipped",
      title: "Skip launch-day checklist items that no longer apply.",
      templateKey: PROJECT_JOURNEY_KEYS.templates.archiveBoundary,
      indent: 0,
      order: 3,
      minutes: 15,
    }),
    makeSystemItem({
      key: PROJECT_JOURNEY_KEYS.items.storyOpeningGoal,
      noteKey: PROJECT_JOURNEY_KEYS.notes.storyMap,
      status: "not-started",
      title: "Outline the opening player goal.",
      templateKey: PROJECT_JOURNEY_KEYS.templates.openingGoal,
      indent: 0,
      order: 1,
      minutes: 16,
    }),
    makeSystemItem({
      key: PROJECT_JOURNEY_KEYS.items.storyTutorialMilestones,
      noteKey: PROJECT_JOURNEY_KEYS.notes.storyMap,
      status: "in-progress",
      title: "Connect tutorial beats to workspace milestones.",
      templateKey: PROJECT_JOURNEY_KEYS.templates.tutorialMilestones,
      indent: 1,
      order: 2,
      minutes: 17,
    }),
    makeSystemItem({
      key: PROJECT_JOURNEY_KEYS.items.researchUxSubnotes,
      noteKey: PROJECT_JOURNEY_KEYS.notes.researchUx,
      status: "decide",
      title: "Decide which unanswered UX questions need their own notes.",
      templateKey: PROJECT_JOURNEY_KEYS.templates.uxSubnotes,
      indent: 0,
      order: 1,
      minutes: 18,
    }),
  ];

  const project_journey_activity = [
    {
      key: PROJECT_JOURNEY_KEYS.activity.paletteDensityUpdated,
      projectKey: PROJECT_JOURNEY_KEYS.project,
      noteKey: PROJECT_JOURNEY_KEYS.notes.designPass,
      message: "Palette and Input Density updated by User 1",
      ...makeAuditFields(20, MOCK_DB_KEYS.users.user1),
    },
    {
      key: PROJECT_JOURNEY_KEYS.activity.releaseBlocked,
      projectKey: PROJECT_JOURNEY_KEYS.project,
      noteKey: PROJECT_JOURNEY_KEYS.notes.releaseReadiness,
      message: "Release Readiness marked with a blocker",
      ...makeAuditFields(22, MOCK_DB_KEYS.users.user2),
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
  const tables = loadMockDbTables(PROJECT_JOURNEY_DB_OWNER, getSeedTables(), options).tables;
  let selectedNoteKey = PROJECT_JOURNEY_KEYS.notes.designPass;
  let selectedItemKey = PROJECT_JOURNEY_KEYS.items.designAffordance;
  let nextItemNumber = nextUlidSequence(tables.project_journey_items, GENERATED_ULID_SEQUENCE.item, GENERATED_ULID_SEQUENCE.activity);
  let nextActivityNumber = nextUlidSequence(tables.project_journey_activity, GENERATED_ULID_SEQUENCE.activity, GENERATED_ULID_SEQUENCE.type);
  let nextTypeNumber = nextUlidSequence(tables.project_journey_note_types, GENERATED_ULID_SEQUENCE.type, GENERATED_ULID_SEQUENCE.note);
  let nextNoteNumber = nextUlidSequence(tables.project_journey_notes, GENERATED_ULID_SEQUENCE.note, GENERATED_ULID_SEQUENCE.diagnostic);
  let nextDiagnosticNumber = nextUlidSequence(tables.project_journey_items, GENERATED_ULID_SEQUENCE.diagnostic, Number.POSITIVE_INFINITY);

  function currentSessionUser() {
    return getMockDbSessionUser(options);
  }

  function currentUserKey() {
    return currentSessionUser().userKey;
  }

  function currentUserCanWrite() {
    return Boolean(currentUserKey());
  }

  function systemUserKey() {
    return getMockDbSystemUser().userKey;
  }

  function isSystemItem(item) {
    return Boolean(item && item.createdBy === systemUserKey());
  }

  function currentUserCanSeeNote(note) {
    const sessionUser = currentSessionUser();
    return Boolean(sessionUser.userKey && (sessionUser.isAdmin || note.ownerKey === sessionUser.userKey));
  }

  function persistTables() {
    saveMockDbTables(PROJECT_JOURNEY_DB_OWNER, tables, options);
  }

  function touchNote(noteKey, updatedBy = currentUserKey()) {
    const note = tables.project_journey_notes.find((item) => item.key === noteKey);
    if (note) {
      note.updatedAt = new Date().toISOString();
      note.updatedBy = updatedBy;
      persistTables();
    }
  }

  function addActivity(projectKey, noteKey, message, userKey = currentUserKey()) {
    const timestampValue = new Date().toISOString();
    tables.project_journey_activity.unshift({
      key: makeUlid(nextActivityNumber),
      projectKey,
      noteKey,
      message,
      createdAt: timestampValue,
      updatedAt: timestampValue,
      createdBy: userKey,
      updatedBy: userKey,
    });
    nextActivityNumber += 1;
    persistTables();
  }

  function getActiveProject() {
    const project = workspaceRepository.getActiveProject();
    if (!project) {
      return null;
    }
    return {
      ...project,
      key: PROJECT_JOURNEY_KEYS.project,
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
    if (!isSystemItem(item)) {
      return {
        template: null,
        templateDiagnostic: null,
      };
    }

    if (!item.templateKey) {
      return {
        template: null,
        templateDiagnostic: {
          type: "missing",
          message: `System-created item "${item.title}" is missing templateKey.`,
        },
      };
    }

    const template = tables.project_journey_templates.find(
      (candidate) => candidate.key === item.templateKey,
    );
    if (!template) {
      return {
        template: null,
        templateDiagnostic: {
          type: "invalid",
          message: `System-created item "${item.title}" references missing templateKey ${item.templateKey}.`,
        },
      };
    }

    if (!template.isActive) {
      return {
        template: clone(template),
        templateDiagnostic: {
          type: "inactive",
          message: `System-created item "${item.title}" references inactive templateKey ${item.templateKey}.`,
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

  function getItemsForNote(noteKey) {
    return tables.project_journey_items
      .filter((item) => item.noteKey === noteKey)
      .sort((left, right) => left.order - right.order);
  }

  function itemMatchesFilter(item, filterId) {
    if (filterId === "system") {
      return isSystemItem(item);
    }
    if (PROJECT_JOURNEY_STATUS_BY_ID[filterId]) {
      return item.status === filterId;
    }
    return true;
  }

  function getItemsForNoteFilter(noteKey, filterId = "all") {
    return getItemsForNote(noteKey).filter((item) => itemMatchesFilter(item, filterId));
  }

  function getNoteCounts(noteKey, filterId = "all") {
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

    getItemsForNoteFilter(noteKey, filterId).forEach((item) => {
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
      return note.ownerKey === currentUserKey();
    }

    if (!filterId || filterId === "all") {
      return true;
    }

    if (filterId === "system") {
      return getItemsForNote(note.key).some(isSystemItem);
    }

    return getItemsForNoteFilter(note.key, filterId).length > 0;
  }

  function listNotes(filterId = "all") {
    const activeProject = requireActiveProject();
    if (!activeProject) {
      return [];
    }

    return tables.project_journey_notes
      .filter((note) => note.projectKey === activeProject.key)
      .filter(currentUserCanSeeNote)
      .filter((note) => noteMatchesFilter(note, filterId))
      .map((note) => {
        const items = getItemsForNoteFilter(note.key, filterId);
        return {
          ...clone(note),
          type: clone(
            tables.project_journey_note_types.find((type) => type.key === note.typeKey),
          ),
          counts: getNoteCounts(note.key, filterId),
          items: items.map(hydrateItem),
        };
      })
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  function addNote({ name, typeKey } = {}) {
    const activeProject = requireActiveProject();
    if (!activeProject || !currentUserCanWrite()) {
      return null;
    }

    const normalizedName = String(name || "").trim() || "New Project Journey Note";
    const selectedType =
      tables.project_journey_note_types.find((type) => type.key === typeKey) ||
      tables.project_journey_note_types[0];
    const timestampValue = new Date().toISOString();
    const note = {
      key: makeUlid(nextNoteNumber),
      slug: `user-note-${nextNoteNumber}`,
      projectKey: activeProject.key,
      ownerKey: currentUserKey(),
      name: normalizedName,
      typeKey: selectedType?.key || "",
      createdAt: timestampValue,
      updatedAt: timestampValue,
      createdBy: currentUserKey(),
      updatedBy: currentUserKey(),
    };
    nextNoteNumber += 1;
    tables.project_journey_notes.push(note);
    selectedNoteKey = note.key;
    selectedItemKey = "";
    addActivity(activeProject.key, note.key, `Added note ${note.name}`);
    return getSelectedNote();
  }

  function getSelectedNote() {
    const activeProject = requireActiveProject();
    if (!activeProject) {
      return null;
    }

    const note =
      tables.project_journey_notes.find(
        (item) => item.key === selectedNoteKey && item.projectKey === activeProject.key && currentUserCanSeeNote(item),
      ) || tables.project_journey_notes.find((item) => item.projectKey === activeProject.key && currentUserCanSeeNote(item));

    if (!note) {
      return null;
    }

    selectedNoteKey = note.key;
    const selectedItem = tables.project_journey_items.find(
      (item) => item.key === selectedItemKey && item.noteKey === note.key,
    );
    if (!selectedItem) {
      selectedItemKey = getItemsForNote(note.key)[0]?.key || "";
    }

    return {
      ...clone(note),
      type: clone(
        tables.project_journey_note_types.find((type) => type.key === note.typeKey),
      ),
      counts: getNoteCounts(note.key),
      items: getItemsForNote(note.key).map(hydrateItem),
    };
  }

  function selectNote(noteKey) {
    const note = tables.project_journey_notes.find((item) => item.key === noteKey && currentUserCanSeeNote(item));
    if (!note) {
      return getSelectedNote();
    }

    selectedNoteKey = note.key;
    selectedItemKey = getItemsForNote(note.key)[0]?.key || "";
    return getSelectedNote();
  }

  function selectItem(itemKey) {
    const item = tables.project_journey_items.find((candidate) => candidate.key === itemKey);
    const note = item ? tables.project_journey_notes.find((candidate) => candidate.key === item.noteKey) : null;
    if (item && note && currentUserCanSeeNote(note)) {
      selectedItemKey = item.key;
      selectedNoteKey = item.noteKey;
    }
    return item && note && currentUserCanSeeNote(note) ? hydrateItem(item) : null;
  }

  function getSelectedItem() {
    const item = tables.project_journey_items.find((candidate) => candidate.key === selectedItemKey);
    const note = item ? tables.project_journey_notes.find((candidate) => candidate.key === item.noteKey) : null;
    return item && note && currentUserCanSeeNote(note) ? hydrateItem(item) : null;
  }

  function addItem({ title, status, userDetails = "", indent = 0 }) {
    const activeProject = requireActiveProject();
    const note = tables.project_journey_notes.find((item) => item.key === selectedNoteKey && currentUserCanSeeNote(item));
    if (!activeProject || !note || !currentUserCanWrite()) {
      return null;
    }

    const existingItems = getItemsForNote(note.key);
    const timestampValue = new Date().toISOString();
    const item = {
      key: makeUlid(nextItemNumber),
      projectKey: activeProject.key,
      noteKey: note.key,
      status: PROJECT_JOURNEY_STATUS_BY_ID[status] ? status : "not-started",
      title: String(title || "").trim() || "New journey item",
      userDetails: String(userDetails || "").trim(),
      createdBy: currentUserKey(),
      updatedBy: currentUserKey(),
      templateKey: "",
      linkedRecordType: "",
      linkedRecordId: "",
      indent: normalizeIndent(indent),
      order: existingItems.length + 1,
      createdAt: timestampValue,
      updatedAt: timestampValue,
    };
    nextItemNumber += 1;
    tables.project_journey_items.push(item);
    selectedItemKey = item.key;
    touchNote(note.key);
    addActivity(activeProject.key, note.key, `Added item to ${note.name}`);
    persistTables();
    return hydrateItem(item);
  }

  function deleteItem(itemKey) {
    const activeProject = requireActiveProject();
    const item = tables.project_journey_items.find((candidate) => candidate.key === itemKey);
    const noteForItem = item ? tables.project_journey_notes.find((candidate) => candidate.key === item.noteKey) : null;
    if (!activeProject || !item || !noteForItem || !currentUserCanSeeNote(noteForItem) || !currentUserCanWrite()) {
      return {
        deleted: false,
        reason: "No journey item is selected for deletion.",
      };
    }

    if (isSystemItem(item)) {
      return {
        deleted: false,
        reason: "System-created items can be edited but not deleted.",
        item: hydrateItem(item),
      };
    }

    const note = tables.project_journey_notes.find((candidate) => candidate.key === item.noteKey);
    const deletedOrder = item.order;
    tables.project_journey_items = tables.project_journey_items.filter(
      (candidate) => candidate.key !== item.key,
    );
    const remainingItems = getItemsForNote(item.noteKey);
    resequence(remainingItems);
    selectedItemKey =
      remainingItems.find((candidate) => candidate.order >= deletedOrder)?.key ||
      remainingItems.at(-1)?.key ||
      "";
    touchNote(item.noteKey);
    addActivity(activeProject.key, item.noteKey, `Deleted user item from ${note?.name || "Project Journey"}`);
    persistTables();
    return {
      deleted: true,
      reason: "Deleted user-created item.",
      selectedItemKey,
    };
  }

  function updateItem(itemKey, updates = {}, updatedBy = currentUserKey()) {
    const activeProject = requireActiveProject();
    const item = tables.project_journey_items.find((candidate) => candidate.key === itemKey);
    const note = item ? tables.project_journey_notes.find((candidate) => candidate.key === item.noteKey) : null;
    const systemUpdate = updatedBy === systemUserKey();
    const canReachNote = systemUpdate || currentUserCanSeeNote(note);
    if (!activeProject || !item || !note || !canReachNote || (!systemUpdate && !currentUserCanWrite())) {
      return null;
    }

    const systemOwned = isSystemItem(item);
    if (!systemOwned && typeof updates.title === "string") {
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
    if (systemUpdate && typeof updates.title === "string") {
      item.title = updates.title.trim() || item.title;
    }

    item.updatedBy = updatedBy;
    item.updatedAt = new Date().toISOString();
    selectedItemKey = item.key;
    selectedNoteKey = item.noteKey;
    touchNote(item.noteKey, updatedBy);
    addActivity(activeProject.key, item.noteKey, `${systemUpdate ? "System" : "User"} updated selected journey item`, updatedBy);
    persistTables();
    return hydrateItem(item);
  }

  function applySystemItemUpdate(itemKey, updates = {}) {
    return updateItem(itemKey, updates, systemUserKey());
  }

  function moveSelectedItem(direction) {
    const activeProject = requireActiveProject();
    const item = tables.project_journey_items.find((candidate) => candidate.key === selectedItemKey);
    const note = item ? tables.project_journey_notes.find((candidate) => candidate.key === item.noteKey) : null;
    if (!activeProject || !item || !note || !currentUserCanSeeNote(note) || !currentUserCanWrite()) {
      return null;
    }

    const items = getItemsForNote(item.noteKey);
    const currentIndex = items.findIndex((candidate) => candidate.key === item.key);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= items.length) {
      return hydrateItem(item);
    }

    const neighbor = items[nextIndex];
    const currentOrder = item.order;
    const timestampValue = new Date().toISOString();
    const userKey = currentUserKey();
    item.order = neighbor.order;
    neighbor.order = currentOrder;
    item.updatedBy = userKey;
    neighbor.updatedBy = userKey;
    item.updatedAt = timestampValue;
    neighbor.updatedAt = timestampValue;
    resequence(items);
    touchNote(item.noteKey, userKey);
    addActivity(activeProject.key, item.noteKey, "Reordered journey items", userKey);
    persistTables();
    return hydrateItem(item);
  }

  function changeSelectedIndent(delta) {
    const item = tables.project_journey_items.find((candidate) => candidate.key === selectedItemKey);
    if (!item) {
      return null;
    }

    return updateItem(item.key, { indent: item.indent + delta });
  }

  function updateSelectedNoteType(typeKey) {
    const activeProject = requireActiveProject();
    const note = tables.project_journey_notes.find((item) => item.key === selectedNoteKey && currentUserCanSeeNote(item));
    const type = tables.project_journey_note_types.find((item) => item.key === typeKey);
    if (!activeProject || !note || !type || !currentUserCanWrite()) {
      return null;
    }

    note.typeKey = type.key;
    touchNote(note.key);
    addActivity(activeProject.key, note.key, `Changed ${note.name} type to ${type.name}`);
    persistTables();
    return getSelectedNote();
  }

  function addNoteType(name) {
    const normalized = String(name || "").trim();
    if (!currentUserCanWrite()) {
      return {
        type: null,
        created: false,
        duplicate: false,
        message: "Log in as a user before adding a Project Journey note type.",
      };
    }

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
      key: makeUlid(nextTypeNumber),
      typeSlug: `custom-${nextTypeNumber}`,
      name: normalized,
      seeded: false,
      userExtensible: true,
      createdAt: timestampValue,
      updatedAt: timestampValue,
      createdBy: currentUserKey(),
      updatedBy: currentUserKey(),
    };
    nextTypeNumber += 1;
    tables.project_journey_note_types.push(type);
    persistTables();
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
        .filter((activity) => activity.projectKey === activeProject.key)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .slice(0, limit),
    );
  }

  function getTemplateDiagnostics() {
    return tables.project_journey_items
      .filter((item) => item.projectKey === getActiveProject()?.key)
      .map(resolveTemplate)
      .map((result) => result.templateDiagnostic)
      .filter(Boolean);
  }

  function injectTemplateDiagnostics() {
    const activeProject = requireActiveProject();
    if (!activeProject) {
      return [];
    }

    const noteKey = PROJECT_JOURNEY_KEYS.notes.designPass;
    const existingItems = getItemsForNote(noteKey);
    const fixtures = [
      {
        title: "Missing template diagnostic item",
        templateKey: "",
        status: "not-started",
      },
      {
        title: "Inactive template diagnostic item",
        templateKey: PROJECT_JOURNEY_KEYS.templates.inactiveGuidance,
        status: "blocker",
      },
      {
        title: "Invalid template diagnostic item",
        templateKey: PROJECT_JOURNEY_KEYS.templates.invalidMissing,
        status: "decide",
      },
    ];
    const created = fixtures.map((fixture, index) => {
      const timestampValue = new Date().toISOString();
      const userKey = systemUserKey();
      const item = {
        key: makeUlid(nextDiagnosticNumber),
        projectKey: activeProject.key,
        noteKey,
        status: fixture.status,
        title: fixture.title,
        userDetails: "",
        createdBy: userKey,
        updatedBy: userKey,
        templateKey: fixture.templateKey,
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
    touchNote(noteKey, systemUserKey());
    persistTables();
    return created;
  }

  function openProject(projectId) {
    const workspaceProjectId =
      projectId === PROJECT_JOURNEY_KEYS.project ? PROJECT_JOURNEY_ROUTE_PROJECT_ALIAS : projectId;
    return workspaceRepository.openProject(workspaceProjectId);
  }

  return {
    getTables: () => clone(tables),
    getSessionUser: () => currentSessionUser(),
    getSystemUser: () => getMockDbSystemUser(),
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
