import {
  createGameWorkspaceMockRepository,
} from "./game-workspace-mock-repository.js";
import {
  loadMockDbTables,
  MOCK_DB_KEYS,
  saveMockDbTables,
  getMockDbSessionUser,
  getMockDbSystemUser,
} from "../mock-db-store.js";
import {
  createGameJourneyCompletionMetricsStore,
} from "../game-journey-completion-metrics-store.mjs";

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

export const GAME_JOURNEY_KEYS = Object.freeze({
  game: makeUlid(1),
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

export const GAME_JOURNEY_CURRENT_USER_KEY = GAME_JOURNEY_KEYS.users.user1;

const GAME_JOURNEY_ROUTE_GAME_ALIAS = "demo-game";
const GAME_JOURNEY_DB_OWNER = "game-journey";
const GENERATED_ULID_SEQUENCE = Object.freeze({
  item: 1001,
  activity: 2001,
  type: 3001,
  note: 4001,
  diagnostic: 5001,
});
const RECOMMENDED_TARGET_LINKED_RECORD_TYPE = "recommended-target";
const RECOMMENDED_TARGET_NOTE_KEY = GAME_JOURNEY_KEYS.notes.designPass;
const SOURCE_IDEA_LINKED_RECORD_TYPE = "source-idea-note";
const JOURNEY_BOOTSTRAP_LINKED_RECORD_TYPE = "journey-bootstrap-bucket";

export const GAME_JOURNEY_BOOTSTRAP_BUCKETS = Object.freeze([
  "Idea",
  "Design",
  "Graphics",
  "Audio",
  "Objects",
  "Worlds",
  "Interface",
  "Controls",
  "Rules",
  "Progression",
  "Play Test",
  "Publish",
  "Share",
]);

export const GAME_JOURNEY_STATUSES = [
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

export const GAME_JOURNEY_STATUS_BY_ID = Object.fromEntries(
  GAME_JOURNEY_STATUSES.map((status) => [status.id, status]),
);

export const GAME_JOURNEY_SUGGESTED_TOOLS = Object.freeze({
  blocker: Object.freeze(["Game Hub", "Debug"]),
  default: Object.freeze(["Game Hub", "Game Design"]),
  byNoteType: Object.freeze({
    design: Object.freeze(["Game Design", "Colors", "Assets"]),
    story: Object.freeze(["Game Design", "Game Hub", "AI Command Center"]),
    release: Object.freeze(["Publish", "Game Testing", "Game Hub"]),
    research: Object.freeze(["AI Command Center", "Game Design", "Game Hub"]),
    idea: Object.freeze(["AI Command Center", "Game Design", "Assets"]),
    question: Object.freeze(["AI Command Center", "Game Hub", "Game Design"]),
    task: Object.freeze(["Game Hub", "Game Testing", "Debug"]),
  }),
});

export const GAME_JOURNEY_TOOL_OWNERSHIP_AREAS = Object.freeze([
  Object.freeze({
    sectionKey: "idea",
    sectionName: "Idea",
    ownershipArea: "Concept planning",
    toolNames: Object.freeze(["Idea Board", "Creator Learning", "AI Command Center"]),
  }),
  Object.freeze({
    sectionKey: "design",
    sectionName: "Design",
    ownershipArea: "Game structure",
    toolNames: Object.freeze(["Game Design", "Game Configuration", "Game Hub", "Game Crew", "Tags"]),
  }),
  Object.freeze({
    sectionKey: "graphics",
    sectionName: "Graphics",
    ownershipArea: "Visual asset planning",
    toolNames: Object.freeze(["Assets", "Colors", "Sprites", "Animations", "Particles", "Videos"]),
  }),
  Object.freeze({
    sectionKey: "audio",
    sectionName: "Audio",
    ownershipArea: "Sound and voice planning",
    toolNames: Object.freeze(["Audio", "Music", "Audio Effects", "MIDI", "Voice Capture", "Text To Speech"]),
  }),
  Object.freeze({
    sectionKey: "objects",
    sectionName: "Objects",
    ownershipArea: "Interactive things",
    toolNames: Object.freeze(["Objects", "Characters"]),
  }),
  Object.freeze({
    sectionKey: "worlds",
    sectionName: "Worlds",
    ownershipArea: "Places and levels",
    toolNames: Object.freeze(["Worlds", "Environments"]),
  }),
  Object.freeze({
    sectionKey: "interface",
    sectionName: "Interface",
    ownershipArea: "Player screens",
    toolNames: Object.freeze(["Fonts", "Languages", "Messages"]),
  }),
  Object.freeze({
    sectionKey: "controls",
    sectionName: "Controls",
    ownershipArea: "Player input",
    toolNames: Object.freeze(["Controls", "Input Mapping V2", "Hitboxes"]),
  }),
  Object.freeze({
    sectionKey: "rules",
    sectionName: "Rules",
    ownershipArea: "Gameplay behavior",
    toolNames: Object.freeze(["Events", "Custom Extensions"]),
  }),
  Object.freeze({
    sectionKey: "progression",
    sectionName: "Progression",
    ownershipArea: "Rewards and advancement",
    toolNames: Object.freeze(["Achievements", "Saved Data", "Game Journey"]),
  }),
  Object.freeze({
    sectionKey: "play-test",
    sectionName: "Play Test",
    ownershipArea: "Testing and tuning",
    toolNames: Object.freeze(["Game Testing", "Debug", "Performance"]),
  }),
  Object.freeze({
    sectionKey: "publish",
    sectionName: "Publish",
    ownershipArea: "Release readiness",
    toolNames: Object.freeze(["Publish", "Build Game", "Platform Settings", "Game Migration"]),
  }),
  Object.freeze({
    sectionKey: "share",
    sectionName: "Share",
    ownershipArea: "Audience and community",
    toolNames: Object.freeze(["Marketplace", "Community", "Ratings", "Cloud"]),
  }),
]);

export const GAME_JOURNEY_RECOMMENDED_TARGETS = Object.freeze([
  Object.freeze({
    key: "hero",
    label: "Hero",
    sectionName: "Objects",
    suggestedCount: 1,
  }),
  Object.freeze({
    key: "enemy",
    label: "Enemy",
    sectionName: "Objects",
    suggestedCount: 4,
  }),
  Object.freeze({
    key: "boss",
    label: "Boss",
    sectionName: "Objects",
    suggestedCount: 1,
  }),
  Object.freeze({
    key: "background",
    label: "Background",
    sectionName: "Graphics",
    suggestedCount: 3,
  }),
  Object.freeze({
    key: "music",
    label: "Music",
    sectionName: "Audio",
    suggestedCount: 5,
  }),
]);

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
  linkedRecordId = "game-journey",
  indent = 0,
  order,
  minutes,
}) {
  return {
    key,
    gameKey: GAME_JOURNEY_KEYS.game,
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
  const game_journey_note_types = [
    { key: GAME_JOURNEY_KEYS.noteTypes.design, typeSlug: "design", name: "Design", seeded: true, userExtensible: true, ...makeAuditFields(0) },
    { key: GAME_JOURNEY_KEYS.noteTypes.story, typeSlug: "story", name: "Story", seeded: true, userExtensible: true, ...makeAuditFields(0) },
    { key: GAME_JOURNEY_KEYS.noteTypes.release, typeSlug: "release", name: "Release", seeded: true, userExtensible: true, ...makeAuditFields(0) },
    { key: GAME_JOURNEY_KEYS.noteTypes.research, typeSlug: "research", name: "Research", seeded: true, userExtensible: true, ...makeAuditFields(0) },
    { key: GAME_JOURNEY_KEYS.noteTypes.idea, typeSlug: "idea", name: "Idea", seeded: true, userExtensible: true, ...makeAuditFields(0) },
    { key: GAME_JOURNEY_KEYS.noteTypes.question, typeSlug: "question", name: "Question", seeded: true, userExtensible: true, ...makeAuditFields(0) },
    { key: GAME_JOURNEY_KEYS.noteTypes.task, typeSlug: "task", name: "Task", seeded: true, userExtensible: true, ...makeAuditFields(0) },
  ];

  const game_journey_notes = [
    {
      key: GAME_JOURNEY_KEYS.notes.designPass,
      slug: "design-pass",
      gameKey: GAME_JOURNEY_KEYS.game,
      ownerKey: GAME_JOURNEY_KEYS.users.user1,
      name: "Palette and Input Density",
      typeKey: GAME_JOURNEY_KEYS.noteTypes.design,
      ...makeAuditFields(5, MOCK_DB_KEYS.users.user1),
    },
    {
      key: GAME_JOURNEY_KEYS.notes.releaseReadiness,
      slug: "release-readiness",
      gameKey: GAME_JOURNEY_KEYS.game,
      ownerKey: GAME_JOURNEY_KEYS.users.user2,
      name: "Release Readiness",
      typeKey: GAME_JOURNEY_KEYS.noteTypes.release,
      ...makeAuditFields(9, MOCK_DB_KEYS.users.user2),
    },
    {
      key: GAME_JOURNEY_KEYS.notes.storyMap,
      slug: "story-map",
      gameKey: GAME_JOURNEY_KEYS.game,
      ownerKey: GAME_JOURNEY_KEYS.users.user1,
      name: "Story Beats",
      typeKey: GAME_JOURNEY_KEYS.noteTypes.story,
      ...makeAuditFields(14, MOCK_DB_KEYS.users.user1),
    },
    {
      key: GAME_JOURNEY_KEYS.notes.researchUx,
      slug: "research-ux",
      gameKey: GAME_JOURNEY_KEYS.game,
      ownerKey: GAME_JOURNEY_KEYS.users.user2,
      name: "Research Questions",
      typeKey: GAME_JOURNEY_KEYS.noteTypes.research,
      ...makeAuditFields(18, MOCK_DB_KEYS.users.user2),
    },
  ];

  const game_journey_templates = [
    makeTemplate(
      GAME_JOURNEY_KEYS.templates.paletteAffordance,
      "palette.swatch-affordance",
      "Review palette swatch affordance in the active game palette.",
      "Check whether selected swatches clearly expose batch tagging, checked state, and keyboard-friendly scanning.",
      ["Colors", "Game Hub"],
      1,
    ),
    makeTemplate(
      GAME_JOURNEY_KEYS.templates.batchTagLanguage,
      "palette.batch-tag-language",
      "Confirm batch tag language after checked swatches are applied.",
      "Keep the copy focused on what happens to checked swatches and avoid implying tags are auto-added.",
      ["Colors", "Game Hub"],
      2,
    ),
    makeTemplate(
      GAME_JOURNEY_KEYS.templates.compactTagState,
      "palette.compact-tag-state",
      "Decide whether tag chips need a compact state for small canvases.",
      "Compare dense palette screens against the normal Game Palette Tags view before creating another display mode.",
      ["Colors", "Game Design"],
      3,
    ),
    makeTemplate(
      GAME_JOURNEY_KEYS.templates.releaseLaneOwnership,
      "release.validation-lane-ownership",
      "Resolve final validation lane ownership before release.",
      "Confirm the targeted lane owner is named before publish readiness moves forward.",
      ["Publish", "Game Testing"],
      4,
    ),
    makeTemplate(
      GAME_JOURNEY_KEYS.templates.archiveBoundary,
      "release.archive-boundary",
      "Confirm no archived Tool V1/V2 files were touched.",
      "Use the active Toolbox paths for implementation and keep archived V1/V2 material read-only.",
      ["Publish", "Game Hub"],
      5,
    ),
    makeTemplate(
      GAME_JOURNEY_KEYS.templates.openingGoal,
      "story.opening-player-goal",
      "Outline the opening player goal.",
      "Describe the first player-readable goal in one sentence before expanding beats.",
      ["Game Design", "Game Hub"],
      6,
    ),
    makeTemplate(
      GAME_JOURNEY_KEYS.templates.tutorialMilestones,
      "story.tutorial-workspace-milestones",
      "Connect tutorial beats to workspace milestones.",
      "Attach tutorial beats to concrete build path milestones so story work stays testable.",
      ["Game Design", "Game Hub"],
      7,
    ),
    makeTemplate(
      GAME_JOURNEY_KEYS.templates.uxSubnotes,
      "research.ux-subnote-decision",
      "Decide which unanswered UX questions need their own notes.",
      "Promote only durable UX questions into separate notes; keep short follow-ups inline as item details.",
      ["AI Command Center", "Game Hub"],
      8,
    ),
    {
      ...makeTemplate(
        GAME_JOURNEY_KEYS.templates.inactiveGuidance,
        "diagnostic.inactive-guidance",
        "Inactive template diagnostic.",
        "This inactive template exists only for Game Journey diagnostics validation.",
        ["Game Hub"],
        9,
      ),
      isActive: false,
      updatedAt: timestamp(19),
    },
  ];

  const game_journey_items = [
    makeSystemItem({
      key: GAME_JOURNEY_KEYS.items.designAffordance,
      noteKey: GAME_JOURNEY_KEYS.notes.designPass,
      status: "in-progress",
      title: "Review palette swatch affordance in the active game palette.",
      userDetails: "Designer review should focus on checkbox visibility and selected-row contrast.",
      templateKey: GAME_JOURNEY_KEYS.templates.paletteAffordance,
      indent: 0,
      order: 1,
      minutes: 10,
    }),
    makeSystemItem({
      key: GAME_JOURNEY_KEYS.items.designBatchTag,
      noteKey: GAME_JOURNEY_KEYS.notes.designPass,
      status: "not-started",
      title: "Confirm batch tag language after checked swatches are applied.",
      templateKey: GAME_JOURNEY_KEYS.templates.batchTagLanguage,
      indent: 1,
      order: 2,
      minutes: 11,
    }),
    makeSystemItem({
      key: GAME_JOURNEY_KEYS.items.designCompactTag,
      noteKey: GAME_JOURNEY_KEYS.notes.designPass,
      status: "decide",
      title: "Decide whether tag chips need a compact state for small canvases.",
      templateKey: GAME_JOURNEY_KEYS.templates.compactTagState,
      indent: 1,
      order: 3,
      minutes: 12,
    }),
    makeSystemItem({
      key: GAME_JOURNEY_KEYS.items.releaseLaneOwnership,
      noteKey: GAME_JOURNEY_KEYS.notes.releaseReadiness,
      status: "blocker",
      title: "Resolve final validation lane ownership before release.",
      templateKey: GAME_JOURNEY_KEYS.templates.releaseLaneOwnership,
      indent: 0,
      order: 1,
      minutes: 13,
    }),
    makeSystemItem({
      key: GAME_JOURNEY_KEYS.items.releaseArchiveBoundary,
      noteKey: GAME_JOURNEY_KEYS.notes.releaseReadiness,
      status: "complete",
      title: "Confirm no archived Tool V1/V2 files were touched.",
      templateKey: GAME_JOURNEY_KEYS.templates.archiveBoundary,
      indent: 0,
      order: 2,
      minutes: 14,
    }),
    makeSystemItem({
      key: GAME_JOURNEY_KEYS.items.releaseSkippedChecklist,
      noteKey: GAME_JOURNEY_KEYS.notes.releaseReadiness,
      status: "skipped",
      title: "Skip launch-day checklist items that no longer apply.",
      templateKey: GAME_JOURNEY_KEYS.templates.archiveBoundary,
      indent: 0,
      order: 3,
      minutes: 15,
    }),
    makeSystemItem({
      key: GAME_JOURNEY_KEYS.items.storyOpeningGoal,
      noteKey: GAME_JOURNEY_KEYS.notes.storyMap,
      status: "not-started",
      title: "Outline the opening player goal.",
      templateKey: GAME_JOURNEY_KEYS.templates.openingGoal,
      indent: 0,
      order: 1,
      minutes: 16,
    }),
    makeSystemItem({
      key: GAME_JOURNEY_KEYS.items.storyTutorialMilestones,
      noteKey: GAME_JOURNEY_KEYS.notes.storyMap,
      status: "in-progress",
      title: "Connect tutorial beats to workspace milestones.",
      templateKey: GAME_JOURNEY_KEYS.templates.tutorialMilestones,
      indent: 1,
      order: 2,
      minutes: 17,
    }),
    makeSystemItem({
      key: GAME_JOURNEY_KEYS.items.researchUxSubnotes,
      noteKey: GAME_JOURNEY_KEYS.notes.researchUx,
      status: "decide",
      title: "Decide which unanswered UX questions need their own notes.",
      templateKey: GAME_JOURNEY_KEYS.templates.uxSubnotes,
      indent: 0,
      order: 1,
      minutes: 18,
    }),
  ];

  const game_journey_activity = [
    {
      key: GAME_JOURNEY_KEYS.activity.paletteDensityUpdated,
      gameKey: GAME_JOURNEY_KEYS.game,
      noteKey: GAME_JOURNEY_KEYS.notes.designPass,
      message: "Palette and Input Density updated by User 1",
      ...makeAuditFields(20, MOCK_DB_KEYS.users.user1),
    },
    {
      key: GAME_JOURNEY_KEYS.activity.releaseBlocked,
      gameKey: GAME_JOURNEY_KEYS.game,
      noteKey: GAME_JOURNEY_KEYS.notes.releaseReadiness,
      message: "Release Readiness marked with a blocker",
      ...makeAuditFields(22, MOCK_DB_KEYS.users.user2),
    },
  ];

  return {
    game_journey_note_types,
    game_journey_notes,
    game_journey_templates,
    game_journey_items,
    game_journey_activity,
  };
}

export function createGameJourneyMockRepository(options = {}) {
  const gameWorkspaceRepository =
    options.gameWorkspaceRepository || options.workspaceRepository || createGameWorkspaceMockRepository();
  const completionMetricsStore =
    options.completionMetricsStore || createGameJourneyCompletionMetricsStore({
      dbPath: options.completionMetricsDbPath,
      postgresClient: options.completionMetricsPostgresClient,
    });
  const tables = loadMockDbTables(GAME_JOURNEY_DB_OWNER, getSeedTables(), options).tables;
  let selectedNoteKey = GAME_JOURNEY_KEYS.notes.designPass;
  let selectedItemKey = GAME_JOURNEY_KEYS.items.designAffordance;
  let nextItemNumber = nextUlidSequence(tables.game_journey_items, GENERATED_ULID_SEQUENCE.item, GENERATED_ULID_SEQUENCE.activity);
  let nextActivityNumber = nextUlidSequence(tables.game_journey_activity, GENERATED_ULID_SEQUENCE.activity, GENERATED_ULID_SEQUENCE.type);
  let nextTypeNumber = nextUlidSequence(tables.game_journey_note_types, GENERATED_ULID_SEQUENCE.type, GENERATED_ULID_SEQUENCE.note);
  let nextNoteNumber = nextUlidSequence(tables.game_journey_notes, GENERATED_ULID_SEQUENCE.note, GENERATED_ULID_SEQUENCE.diagnostic);
  let nextDiagnosticNumber = nextUlidSequence(tables.game_journey_items, GENERATED_ULID_SEQUENCE.diagnostic, Number.POSITIVE_INFINITY);

  function currentSessionUser() {
    return getMockDbSessionUser(options);
  }

  function currentUserKey() {
    return currentSessionUser().userKey;
  }

  function safeCurrentUserKey() {
    try {
      return currentUserKey() || systemUserKey();
    } catch {
      return systemUserKey();
    }
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

  function isRecommendedTargetItem(item) {
    return item?.linkedRecordType === RECOMMENDED_TARGET_LINKED_RECORD_TYPE;
  }

  function journeyGameKey(game) {
    const gameId = String(game?.id || "").trim();
    return !gameId || gameId === GAME_JOURNEY_ROUTE_GAME_ALIAS
      ? GAME_JOURNEY_KEYS.game
      : `game-hub:${gameId}`;
  }

  function currentUserCanSeeNote(note) {
    const sessionUser = currentSessionUser();
    return Boolean(sessionUser.userKey && (sessionUser.isAdmin || note.ownerKey === sessionUser.userKey));
  }

  function persistTables() {
    saveMockDbTables(GAME_JOURNEY_DB_OWNER, tables, options);
  }

  function touchNote(noteKey, updatedBy = currentUserKey()) {
    const note = tables.game_journey_notes.find((item) => item.key === noteKey);
    if (note) {
      note.updatedAt = new Date().toISOString();
      note.updatedBy = updatedBy;
      persistTables();
    }
  }

  function addActivity(gameKey, noteKey, message, userKey = currentUserKey()) {
    const timestampValue = new Date().toISOString();
    tables.game_journey_activity.unshift({
      key: makeUlid(nextActivityNumber),
      gameKey,
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

  function slugSegment(value, fallback = "source-idea") {
    const slug = String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug || fallback;
  }

  function normalizeSourceIdeaNotes(sourceIdea) {
    return Array.isArray(sourceIdea?.notes)
      ? sourceIdea.notes.map((note) => String(note || "").trim()).filter(Boolean)
      : [];
  }

  function sourceIdeaJourneyNoteName(sourceIdea) {
    const idea = String(sourceIdea?.idea || "").trim();
    return idea ? `Source Idea: ${idea}` : "Source Idea";
  }

  function noteTypeKeyForBootstrapBucket(bucketName) {
    const slug = slugSegment(bucketName, "task");
    const matchingType = tables.game_journey_note_types.find((type) => type.typeSlug === slug);
    return matchingType?.key || GAME_JOURNEY_KEYS.noteTypes.task;
  }

  function ensureJourneyBootstrapBuckets(activeGame) {
    if (!activeGame) {
      return {
        buckets: [],
        createdItems: 0,
        createdNotes: 0,
      };
    }

    const ownerKey = safeCurrentUserKey();
    const timestampValue = new Date().toISOString();
    let createdNotes = 0;
    let createdItems = 0;
    const bucketSummaries = [];
    GAME_JOURNEY_BOOTSTRAP_BUCKETS.forEach((bucketName, index) => {
      const bucketOrder = index + 1;
      const bucketSlug = slugSegment(bucketName, "bucket");
      const noteSlug = `journey-bucket-${slugSegment(activeGame.id || activeGame.key)}-${String(bucketOrder).padStart(2, "0")}-${bucketSlug}`;
      let note = tables.game_journey_notes.find(
        (candidate) => candidate.gameKey === activeGame.key && candidate.slug === noteSlug,
      );

      if (!note) {
        note = {
          key: makeUlid(nextNoteNumber),
          slug: noteSlug,
          gameKey: activeGame.key,
          ownerKey,
          name: bucketName,
          typeKey: noteTypeKeyForBootstrapBucket(bucketName),
          bucketOrder,
          createdAt: timestampValue,
          updatedAt: timestampValue,
          createdBy: ownerKey,
          updatedBy: ownerKey,
        };
        nextNoteNumber += 1;
        tables.game_journey_notes.push(note);
        createdNotes += 1;
      }

      const linkedRecordId = `${slugSegment(activeGame.id || activeGame.key)}:${String(bucketOrder).padStart(2, "0")}:${bucketSlug}`;
      let item = getItemsForNote(note.key).find(
        (candidate) =>
          candidate.linkedRecordType === JOURNEY_BOOTSTRAP_LINKED_RECORD_TYPE &&
          candidate.linkedRecordId === linkedRecordId,
      );

      if (!item) {
        item = {
          key: makeUlid(nextItemNumber),
          gameKey: activeGame.key,
          noteKey: note.key,
          status: "not-started",
          title: `${bucketName} progress placeholder`,
          userDetails: "",
          createdBy: ownerKey,
          updatedBy: ownerKey,
          templateKey: "",
          linkedRecordType: JOURNEY_BOOTSTRAP_LINKED_RECORD_TYPE,
          linkedRecordId,
          indent: 0,
          order: 1,
          createdAt: timestampValue,
          updatedAt: timestampValue,
        };
        nextItemNumber += 1;
        tables.game_journey_items.push(item);
        createdItems += 1;
      }

      bucketSummaries.push({
        bucketName,
        itemKey: item.key,
        noteKey: note.key,
        order: bucketOrder,
      });
    });

    if (createdNotes || createdItems) {
      const firstBucket = bucketSummaries[0];
      selectedNoteKey = firstBucket?.noteKey || selectedNoteKey;
      selectedItemKey = firstBucket?.itemKey || selectedItemKey;
      addActivity(activeGame.key, firstBucket?.noteKey || "", `Created ${GAME_JOURNEY_BOOTSTRAP_BUCKETS.length} Game Journey starter buckets.`, ownerKey);
      persistTables();
    }

    return {
      buckets: bucketSummaries,
      createdItems,
      createdNotes,
    };
  }

  function ensureSourceIdeaJourneyItems(activeGame) {
    const sourceIdea = activeGame?.sourceIdea && typeof activeGame.sourceIdea === "object"
      ? activeGame.sourceIdea
      : null;
    const sourceNotes = normalizeSourceIdeaNotes(sourceIdea);
    if (!activeGame || !sourceNotes.length) {
      return [];
    }

    const ownerKey = safeCurrentUserKey();
    const timestampValue = new Date().toISOString();
    const noteSlug = `source-idea-${slugSegment(activeGame.id || sourceIdea?.idea)}`;
    let note = tables.game_journey_notes.find(
      (candidate) => candidate.gameKey === activeGame.key && candidate.slug === noteSlug,
    );

    if (!note) {
      note = {
        key: makeUlid(nextNoteNumber),
        slug: noteSlug,
        gameKey: activeGame.key,
        ownerKey,
        name: sourceIdeaJourneyNoteName(sourceIdea),
        typeKey: GAME_JOURNEY_KEYS.noteTypes.idea,
        createdAt: timestampValue,
        updatedAt: timestampValue,
        createdBy: ownerKey,
        updatedBy: ownerKey,
      };
      nextNoteNumber += 1;
      tables.game_journey_notes.push(note);
    }

    const existingLinkedIds = new Set(
      getItemsForNote(note.key)
        .filter((item) => item.linkedRecordType === SOURCE_IDEA_LINKED_RECORD_TYPE)
        .map((item) => item.linkedRecordId),
    );
    const created = [];
    sourceNotes.forEach((sourceNote, index) => {
      const linkedRecordId = `${slugSegment(activeGame.id || activeGame.key)}:${index + 1}:${slugSegment(sourceNote).slice(0, 48)}`;
      if (existingLinkedIds.has(linkedRecordId)) {
        return;
      }
      const existingItems = getItemsForNote(note.key);
      const item = {
        key: makeUlid(nextItemNumber),
        gameKey: activeGame.key,
        noteKey: note.key,
        status: "not-started",
        title: sourceNote,
        userDetails: "",
        createdBy: ownerKey,
        updatedBy: ownerKey,
        templateKey: "",
        linkedRecordType: SOURCE_IDEA_LINKED_RECORD_TYPE,
        linkedRecordId,
        indent: 0,
        order: existingItems.length + 1,
        createdAt: timestampValue,
        updatedAt: timestampValue,
      };
      nextItemNumber += 1;
      tables.game_journey_items.push(item);
      created.push(hydrateItem(item));
    });

    if (created.length) {
      selectedNoteKey = note.key;
      selectedItemKey = created[0]?.key || selectedItemKey;
      touchNote(note.key, ownerKey);
      addActivity(activeGame.key, note.key, `Created ${created.length} Game Journey item${created.length === 1 ? "" : "s"} from Source Idea.`, ownerKey);
    }

    return created;
  }

  function getActiveGame() {
    const game = gameWorkspaceRepository.getActiveGame();
    if (!game) {
      return null;
    }
    return {
      ...game,
      key: journeyGameKey(game),
    };
  }

  function requireActiveGame() {
    const game = getActiveGame();
    if (!game) {
      return null;
    }
    return game;
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

    const template = tables.game_journey_templates.find(
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
    return tables.game_journey_items
      .filter((item) => item.noteKey === noteKey && !isRecommendedTargetItem(item))
      .sort((left, right) => left.order - right.order);
  }

  function normalizeTargetCount(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return 0;
    }
    return Math.max(0, Math.trunc(parsed));
  }

  function readTargetCount(item, fallbackCount) {
    if (!item?.userDetails) {
      return fallbackCount;
    }
    try {
      const payload = JSON.parse(item.userDetails);
      return normalizeTargetCount(payload.suggestedCount ?? fallbackCount);
    } catch {
      return fallbackCount;
    }
  }

  function findRecommendedTargetItem(targetKey, gameKey = requireActiveGame()?.key) {
    return tables.game_journey_items.find((item) =>
      item.gameKey === gameKey &&
      item.linkedRecordType === RECOMMENDED_TARGET_LINKED_RECORD_TYPE &&
      item.linkedRecordId === targetKey,
    );
  }

  function hydrateRecommendedTarget(target) {
    const activeGame = requireActiveGame();
    const item = activeGame ? findRecommendedTargetItem(target.key, activeGame.key) : null;
    return {
      ...clone(target),
      suggestedCount: readTargetCount(item, target.suggestedCount),
      persisted: Boolean(item),
      recordKey: item?.key || "",
      updatedAt: item?.updatedAt || "",
      updatedBy: item?.updatedBy || "",
    };
  }

  function listRecommendedTargets() {
    return GAME_JOURNEY_RECOMMENDED_TARGETS.map(hydrateRecommendedTarget);
  }

  function findRecommendedTargetNoteKey(target, activeGame) {
    const sectionNote = tables.game_journey_notes.find(
      (note) => note.gameKey === activeGame.key && note.name === target.sectionName,
    );
    if (sectionNote) {
      return sectionNote.key;
    }
    return activeGame.key === GAME_JOURNEY_KEYS.game ? RECOMMENDED_TARGET_NOTE_KEY : "";
  }

  function updateRecommendedTarget(targetKey, suggestedCount) {
    const activeGame = requireActiveGame();
    const target = GAME_JOURNEY_RECOMMENDED_TARGETS.find((item) => item.key === targetKey);
    if (!activeGame || !target) {
      return null;
    }

    const noteKey = findRecommendedTargetNoteKey(target, activeGame);
    if (!noteKey) {
      return {
        error: true,
        message: `Game Journey ${target.sectionName} bucket is not available for ${activeGame.name}.`,
      };
    }

    const normalizedCount = normalizeTargetCount(suggestedCount);
    const timestampValue = new Date().toISOString();
    const userKey = safeCurrentUserKey();
    let item = findRecommendedTargetItem(target.key, activeGame.key);
    if (!item) {
      item = {
        key: makeUlid(nextItemNumber),
        gameKey: activeGame.key,
        noteKey,
        status: "not-started",
        title: `Recommended target: ${target.label}`,
        userDetails: "",
        createdBy: userKey,
        updatedBy: userKey,
        templateKey: "",
        linkedRecordType: RECOMMENDED_TARGET_LINKED_RECORD_TYPE,
        linkedRecordId: target.key,
        indent: 0,
        order: getItemsForNote(noteKey).length + 1,
        createdAt: timestampValue,
        updatedAt: timestampValue,
      };
      nextItemNumber += 1;
      tables.game_journey_items.push(item);
    }

    item.userDetails = JSON.stringify({ suggestedCount: normalizedCount });
    item.noteKey = noteKey;
    item.updatedAt = timestampValue;
    item.updatedBy = userKey;
    addActivity(activeGame.key, noteKey, `Updated ${target.label} recommended target to ${normalizedCount}`, userKey);
    persistTables();
    return hydrateRecommendedTarget(target);
  }

  function itemMatchesFilter(item, filterId) {
    if (filterId === "system") {
      return isSystemItem(item);
    }
    if (GAME_JOURNEY_STATUS_BY_ID[filterId]) {
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
      const status = GAME_JOURNEY_STATUS_BY_ID[item.status];
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

  function isSystemNote(note) {
    return Boolean(note && getItemsForNote(note.key).some(isSystemItem));
  }

  function hydrateNote(note, filterId = "all") {
    const items = getItemsForNoteFilter(note.key, filterId);
    return {
      ...clone(note),
      systemCreated: isSystemNote(note),
      type: clone(
        tables.game_journey_note_types.find((type) => type.key === note.typeKey),
      ),
      counts: getNoteCounts(note.key, filterId),
      items: items.map(hydrateItem),
    };
  }

  function listNotes(filterId = "all") {
    const activeGame = requireActiveGame();
    if (!activeGame) {
      return [];
    }

    return tables.game_journey_notes
      .filter((note) => note.gameKey === activeGame.key)
      .filter(currentUserCanSeeNote)
      .filter((note) => noteMatchesFilter(note, filterId))
      .map((note) => hydrateNote(note, filterId))
      .sort((left, right) => {
        const leftOrder = Number.isFinite(Number(left.bucketOrder)) ? Number(left.bucketOrder) : Number.POSITIVE_INFINITY;
        const rightOrder = Number.isFinite(Number(right.bucketOrder)) ? Number(right.bucketOrder) : Number.POSITIVE_INFINITY;
        return leftOrder - rightOrder || right.updatedAt.localeCompare(left.updatedAt);
      });
  }

  function addNote({ name, typeKey } = {}) {
    const activeGame = requireActiveGame();
    if (!activeGame || !currentUserCanWrite()) {
      return null;
    }

    const normalizedName = String(name || "").trim() || "New Game Journey Note";
    const selectedType =
      tables.game_journey_note_types.find((type) => type.key === typeKey) ||
      tables.game_journey_note_types[0];
    const timestampValue = new Date().toISOString();
    const note = {
      key: makeUlid(nextNoteNumber),
      slug: `user-note-${nextNoteNumber}`,
      gameKey: activeGame.key,
      ownerKey: currentUserKey(),
      name: normalizedName,
      typeKey: selectedType?.key || "",
      createdAt: timestampValue,
      updatedAt: timestampValue,
      createdBy: currentUserKey(),
      updatedBy: currentUserKey(),
    };
    nextNoteNumber += 1;
    tables.game_journey_notes.push(note);
    selectedNoteKey = note.key;
    selectedItemKey = "";
    addActivity(activeGame.key, note.key, `Added note ${note.name}`);
    return getSelectedNote();
  }

  function getSelectedNote() {
    const activeGame = requireActiveGame();
    if (!activeGame) {
      return null;
    }

    const note =
      tables.game_journey_notes.find(
        (item) => item.key === selectedNoteKey && item.gameKey === activeGame.key && currentUserCanSeeNote(item),
      ) || tables.game_journey_notes.find((item) => item.gameKey === activeGame.key && currentUserCanSeeNote(item));

    if (!note) {
      return null;
    }

    selectedNoteKey = note.key;
    const selectedItem = tables.game_journey_items.find(
      (item) => item.key === selectedItemKey && item.noteKey === note.key,
    );
    if (!selectedItem) {
      selectedItemKey = getItemsForNote(note.key)[0]?.key || "";
    }

    return hydrateNote(note);
  }

  function selectNote(noteKey) {
    const note = tables.game_journey_notes.find((item) => item.key === noteKey && currentUserCanSeeNote(item));
    if (!note) {
      return getSelectedNote();
    }

    selectedNoteKey = note.key;
    selectedItemKey = getItemsForNote(note.key)[0]?.key || "";
    return getSelectedNote();
  }

  function selectItem(itemKey) {
    const item = tables.game_journey_items.find((candidate) => candidate.key === itemKey);
    const note = item ? tables.game_journey_notes.find((candidate) => candidate.key === item.noteKey) : null;
    if (item && note && currentUserCanSeeNote(note)) {
      selectedItemKey = item.key;
      selectedNoteKey = item.noteKey;
    }
    return item && note && currentUserCanSeeNote(note) ? hydrateItem(item) : null;
  }

  function getSelectedItem() {
    const item = tables.game_journey_items.find((candidate) => candidate.key === selectedItemKey);
    const note = item ? tables.game_journey_notes.find((candidate) => candidate.key === item.noteKey) : null;
    return item && note && currentUserCanSeeNote(note) ? hydrateItem(item) : null;
  }

  function addItem({ title, status, userDetails = "", indent = 0 }) {
    const activeGame = requireActiveGame();
    const note = tables.game_journey_notes.find((item) => item.key === selectedNoteKey && currentUserCanSeeNote(item));
    if (!activeGame || !note || !currentUserCanWrite()) {
      return null;
    }

    const existingItems = getItemsForNote(note.key);
    const timestampValue = new Date().toISOString();
    const item = {
      key: makeUlid(nextItemNumber),
      gameKey: activeGame.key,
      noteKey: note.key,
      status: GAME_JOURNEY_STATUS_BY_ID[status] ? status : "not-started",
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
    tables.game_journey_items.push(item);
    selectedItemKey = item.key;
    touchNote(note.key);
    addActivity(activeGame.key, note.key, `Added item to ${note.name}`);
    persistTables();
    return hydrateItem(item);
  }

  function deleteItem(itemKey) {
    const activeGame = requireActiveGame();
    const item = tables.game_journey_items.find((candidate) => candidate.key === itemKey);
    const noteForItem = item ? tables.game_journey_notes.find((candidate) => candidate.key === item.noteKey) : null;
    if (!activeGame || !item || !noteForItem || !currentUserCanSeeNote(noteForItem) || !currentUserCanWrite()) {
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

    const note = tables.game_journey_notes.find((candidate) => candidate.key === item.noteKey);
    const deletedOrder = item.order;
    tables.game_journey_items = tables.game_journey_items.filter(
      (candidate) => candidate.key !== item.key,
    );
    const remainingItems = getItemsForNote(item.noteKey);
    resequence(remainingItems);
    selectedItemKey =
      remainingItems.find((candidate) => candidate.order >= deletedOrder)?.key ||
      remainingItems.at(-1)?.key ||
      "";
    touchNote(item.noteKey);
    addActivity(activeGame.key, item.noteKey, `Deleted user item from ${note?.name || "Game Journey"}`);
    persistTables();
    return {
      deleted: true,
      reason: "Deleted user-created item.",
      selectedItemKey,
    };
  }

  function updateItem(itemKey, updates = {}, updatedBy = currentUserKey()) {
    const activeGame = requireActiveGame();
    const item = tables.game_journey_items.find((candidate) => candidate.key === itemKey);
    const note = item ? tables.game_journey_notes.find((candidate) => candidate.key === item.noteKey) : null;
    const systemUpdate = updatedBy === systemUserKey();
    const canReachNote = systemUpdate || currentUserCanSeeNote(note);
    if (!activeGame || !item || !note || !canReachNote || (!systemUpdate && !currentUserCanWrite())) {
      return null;
    }

    const systemOwned = isSystemItem(item);
    if (!systemOwned && typeof updates.title === "string") {
      item.title = updates.title.trim() || item.title;
    }
    if (GAME_JOURNEY_STATUS_BY_ID[updates.status]) {
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
    addActivity(activeGame.key, item.noteKey, `${systemUpdate ? "System" : "User"} updated selected journey item`, updatedBy);
    persistTables();
    return hydrateItem(item);
  }

  function applySystemItemUpdate(itemKey, updates = {}) {
    return updateItem(itemKey, updates, systemUserKey());
  }

  function moveSelectedItem(direction) {
    const activeGame = requireActiveGame();
    const item = tables.game_journey_items.find((candidate) => candidate.key === selectedItemKey);
    const note = item ? tables.game_journey_notes.find((candidate) => candidate.key === item.noteKey) : null;
    if (!activeGame || !item || !note || !currentUserCanSeeNote(note) || !currentUserCanWrite()) {
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
    addActivity(activeGame.key, item.noteKey, "Reordered journey items", userKey);
    persistTables();
    return hydrateItem(item);
  }

  function changeSelectedIndent(delta) {
    const item = tables.game_journey_items.find((candidate) => candidate.key === selectedItemKey);
    if (!item) {
      return null;
    }

    return updateItem(item.key, { indent: item.indent + delta });
  }

  function updateNote(noteKey, updates = {}) {
    const activeGame = requireActiveGame();
    const note = tables.game_journey_notes.find(
      (candidate) => candidate.key === noteKey && candidate.gameKey === activeGame?.key && currentUserCanSeeNote(candidate),
    );
    const selectedType = tables.game_journey_note_types.find((type) => type.key === updates.typeKey);
    if (!activeGame || !note || !currentUserCanWrite()) {
      return null;
    }

    selectedNoteKey = note.key;
    if (isSystemNote(note)) {
      return getSelectedNote();
    }

    if (typeof updates.name === "string") {
      note.name = updates.name.trim() || note.name;
    }
    if (selectedType) {
      note.typeKey = selectedType.key;
    }

    touchNote(note.key);
    addActivity(activeGame.key, note.key, `Updated note ${note.name}`);
    persistTables();
    return getSelectedNote();
  }

  function deleteNote(noteKey) {
    const activeGame = requireActiveGame();
    const note = tables.game_journey_notes.find(
      (candidate) => candidate.key === noteKey && candidate.gameKey === activeGame?.key && currentUserCanSeeNote(candidate),
    );
    if (!activeGame || !note || !currentUserCanWrite()) {
      return {
        deleted: false,
        reason: "No journey note is selected for deletion.",
        selectedNoteKey,
      };
    }

    if (isSystemNote(note)) {
      selectedNoteKey = note.key;
      return {
        deleted: false,
        reason: "System-created notes cannot be deleted.",
        note: getSelectedNote(),
        selectedNoteKey,
      };
    }

    tables.game_journey_items = tables.game_journey_items.filter((item) => item.noteKey !== note.key);
    tables.game_journey_notes = tables.game_journey_notes.filter((candidate) => candidate.key !== note.key);
    const nextNote = tables.game_journey_notes.find(
      (candidate) => candidate.gameKey === activeGame.key && currentUserCanSeeNote(candidate),
    );
    selectedNoteKey = nextNote?.key || "";
    selectedItemKey = selectedNoteKey ? getItemsForNote(selectedNoteKey)[0]?.key || "" : "";
    persistTables();
    return {
      deleted: true,
      reason: "Deleted user-created note.",
      selectedNoteKey,
    };
  }

  function updateSelectedNoteType(typeKey) {
    const activeGame = requireActiveGame();
    const note = tables.game_journey_notes.find((item) => item.key === selectedNoteKey && currentUserCanSeeNote(item));
    const type = tables.game_journey_note_types.find((item) => item.key === typeKey);
    if (!activeGame || !note || !type || !currentUserCanWrite()) {
      return null;
    }

    note.typeKey = type.key;
    touchNote(note.key);
    addActivity(activeGame.key, note.key, `Changed ${note.name} type to ${type.name}`);
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
        message: "Log in as a user before adding a Game Journey note type.",
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

    const existing = tables.game_journey_note_types.find(
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
    tables.game_journey_note_types.push(type);
    persistTables();
    return {
      type: clone(type),
      created: true,
      duplicate: false,
      message: `${type.name} is available in the mock note type table.`,
    };
  }

  function listRecentActivity(limit = 5) {
    const activeGame = requireActiveGame();
    if (!activeGame) {
      return [];
    }

    return clone(
      tables.game_journey_activity
        .filter((activity) => activity.gameKey === activeGame.key)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .slice(0, limit),
    );
  }

  function getTemplateDiagnostics() {
    return tables.game_journey_items
      .filter((item) => item.gameKey === getActiveGame()?.key)
      .map(resolveTemplate)
      .map((result) => result.templateDiagnostic)
      .filter(Boolean);
  }

  function injectTemplateDiagnostics() {
    const activeGame = requireActiveGame();
    if (!activeGame) {
      return [];
    }

    const noteKey = GAME_JOURNEY_KEYS.notes.designPass;
    const existingItems = getItemsForNote(noteKey);
    const fixtures = [
      {
        title: "Missing template diagnostic item",
        templateKey: "",
        status: "not-started",
      },
      {
        title: "Inactive template diagnostic item",
        templateKey: GAME_JOURNEY_KEYS.templates.inactiveGuidance,
        status: "blocker",
      },
      {
        title: "Invalid template diagnostic item",
        templateKey: GAME_JOURNEY_KEYS.templates.invalidMissing,
        status: "decide",
      },
    ];
    const created = fixtures.map((fixture, index) => {
      const timestampValue = new Date().toISOString();
      const userKey = systemUserKey();
      const item = {
        key: makeUlid(nextDiagnosticNumber),
        gameKey: activeGame.key,
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
      tables.game_journey_items.push(item);
      return hydrateItem(item);
    });
    touchNote(noteKey, systemUserKey());
    persistTables();
    return created;
  }

  function openGame(gameId) {
    const workspaceGameId =
      gameId === GAME_JOURNEY_KEYS.game ? GAME_JOURNEY_ROUTE_GAME_ALIAS : gameId;
    const openedGame = gameWorkspaceRepository.openGame(workspaceGameId);
    if (openedGame) {
      bootstrapGameJourneyForGame(getActiveGame());
    }
    return openedGame;
  }

  function bootstrapGameJourneyForGame(game = getActiveGame()) {
    const activeGame = game?.key ? game : game ? { ...game, key: journeyGameKey(game) } : getActiveGame();
    if (!activeGame) {
      return {
        buckets: [],
        createdItems: 0,
        createdNotes: 0,
        sourceIdeaItems: [],
      };
    }
    const bucketResult = ensureJourneyBootstrapBuckets(activeGame);
    const sourceIdeaItems = ensureSourceIdeaJourneyItems(activeGame);
    return {
      ...bucketResult,
      sourceIdeaItems,
    };
  }

  return {
    getTables: async () => clone({
      game_journey_completion_metrics: await completionMetricsStore.listMetrics(),
      ...tables,
    }),
    getCompletionMetricsSnapshot: () => completionMetricsStore.snapshot(),
    listCompletionMetrics: () => completionMetricsStore.listMetrics(),
    updateCompletionMetric: (bucketKey, updates) => completionMetricsStore.updateMetric(bucketKey, updates),
    listRecommendedTargets,
    updateRecommendedTarget,
    getSessionUser: () => currentSessionUser(),
    getSystemUser: () => getMockDbSystemUser(),
    getActiveGame,
    openGame,
    bootstrapGameJourneyForGame,
    clearActiveGame: () => gameWorkspaceRepository.clearTestData(),
    listNoteTypes: () => clone(tables.game_journey_note_types),
    addNoteType,
    addNote,
    updateNote,
    deleteNote,
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
