import { makeSeedUlid, SEED_DB_KEYS } from "../seed/seed-db-keys.mjs";

export const TAGS_TOOL_TABLES = Object.freeze([
  "project_tags",
  "project_tag_assignments",
]);

export const GAME_DESIGN_TABLES = Object.freeze([
  "game_design_documents",
  "game_design_validation_items",
  "game_design_sections",
  "game_design_capability_demos",
]);

export const GAME_CONFIGURATION_TABLES = Object.freeze([
  "game_configuration_records",
  "game_configuration_validation_items",
]);

export const OBJECTS_TOOL_TABLES = Object.freeze([
  "object_definition_records",
]);

export const CAPABILITY_LABELS = Object.freeze({
  collectible: "Can Be Collected",
  collides: "Can Collide",
  damageable: "Takes Damage",
  goal: "Completes Goal",
  hazard: "Causes Damage",
  killable: "Can Be Removed",
  movable: "Can Move",
  playerControlled: "Player Controlled",
  scores: "Scores Points",
});

export const OBJECT_TYPE_TEMPLATES = Object.freeze([
  Object.freeze({
    capabilities: Object.freeze(["collectible", "scores"]),
    modelType: "Collectible",
    renderType: "Sprite",
    state: "Active",
    type: "Collectible",
  }),
  Object.freeze({
    capabilities: Object.freeze([]),
    modelType: "Static",
    renderType: "None",
    state: "Active",
    type: "Custom",
  }),
  Object.freeze({
    capabilities: Object.freeze([]),
    modelType: "Static",
    renderType: "Sprite",
    state: "Idle",
    type: "Decoration",
  }),
  Object.freeze({
    capabilities: Object.freeze(["movable", "collides", "hazard", "damageable"]),
    modelType: "Dynamic",
    renderType: "Sprite",
    state: "Active",
    type: "Enemy",
  }),
  Object.freeze({
    capabilities: Object.freeze(["goal", "scores"]),
    modelType: "Goal",
    renderType: "Sprite",
    state: "Active",
    type: "Goal",
  }),
  Object.freeze({
    capabilities: Object.freeze(["hazard", "damageable"]),
    modelType: "Hazard",
    renderType: "Sprite",
    state: "Active",
    type: "Hazard",
  }),
  Object.freeze({
    capabilities: Object.freeze(["playerControlled", "movable", "collides", "damageable"]),
    modelType: "Dynamic",
    renderType: "Sprite",
    state: "Active",
    type: "Hero",
  }),
  Object.freeze({
    capabilities: Object.freeze(["collides"]),
    modelType: "Static",
    renderType: "None",
    state: "Active",
    type: "Platform",
  }),
  Object.freeze({
    capabilities: Object.freeze(["movable", "collides", "hazard"]),
    modelType: "Dynamic",
    renderType: "Sprite",
    state: "Active",
    type: "Projectile",
  }),
  Object.freeze({
    capabilities: Object.freeze([]),
    modelType: "Static",
    renderType: "None",
    state: "Active",
    type: "Spawn Point",
  }),
  Object.freeze({
    capabilities: Object.freeze(["collides"]),
    modelType: "Static",
    renderType: "None",
    state: "Active",
    type: "Wall",
  }),
]);

export const GAME_DESIGN_GAME_TYPES = Object.freeze([
  "2D Platformer",
  "Arcade Action",
  "Capability Demo",
  "Narrative Adventure",
  "Puzzle",
  "RPG",
  "Sandbox",
  "Simulation",
  "Strategy",
]);

export const GAME_DESIGN_GENRES = Object.freeze([
  "Action",
  "Adventure",
  "Educational",
  "Fantasy",
  "Sci-Fi",
  "Sports",
  "Strategy",
  "Utility",
]);

export const GAME_DESIGN_PLAY_STYLES = Object.freeze([
  "Competitive",
  "Cooperative",
  "Guided Tutorial",
  "Sandbox",
  "Single Player",
  "Turn-Based",
]);

export const GAME_DESIGN_PLAYER_MODES = Object.freeze([
  Object.freeze({
    description: "One active player receives input.",
    label: "1 Player",
    value: "1 Player",
  }),
  Object.freeze({
    description: "Multiple players participate, one active player receives input at a time.",
    label: "2+ Turn Based",
    value: "2+ Turn Based",
  }),
  Object.freeze({
    description: "Multiple players can be active at the same time.",
    label: "2+ Concurrent",
    value: "2+ Concurrent",
  }),
]);

export const GAME_CONFIGURATION_SECTIONS = Object.freeze([
  "gameDetails",
  "platforms",
  "startupSettings",
  "gameBasics",
  "gameRules",
  "playerSetup",
  "worldSetup",
  "objectSetup",
  "audioSetup",
  "testReadiness",
]);

export const GAME_CONFIGURATION_PLAYER_MODES = Object.freeze([
  Object.freeze({
    description: "One active player.",
    label: "1 Player",
    value: "1 Player",
  }),
  Object.freeze({
    description: "Multiple players, one active player receives input at a time.",
    label: "2+ Turn Based",
    value: "2+ Turn Based",
  }),
  Object.freeze({
    description: "Multiple players active at the same time.",
    label: "2+ Concurrent",
    value: "2+ Concurrent",
  }),
]);

const DEFAULT_GAME = Object.freeze({
  id: "demo-game",
  name: "Demo Game",
  purpose: "Game",
  status: "Under Construction",
});

const STARTER_TAGS = Object.freeze([
  Object.freeze({ label: "platformer", description: "Platforming, jumping, and movement-focused projects." }),
  Object.freeze({ label: "fantasy", description: "Magic, legends, and fantasy world themes." }),
  Object.freeze({ label: "medium", description: "Medium-sized project scope." }),
  Object.freeze({ label: "pixel-art", description: "Pixel art visual direction." }),
  Object.freeze({ label: "kids", description: "Designed for younger players." }),
  Object.freeze({ label: "boss-fight", description: "Includes a climactic boss encounter." }),
]);

export const STARTER_OBJECTS = Object.freeze([
  Object.freeze({
    behavior: "Responds to player control mapping.",
    interaction: "Can interact with platforms, collectibles, hazards, and goals.",
    name: "Hero",
    render: Object.freeze({ type: "None" }),
    role: "Hero",
    state: "Active",
  }),
  Object.freeze({
    behavior: "Moves through the scene under authored behavior.",
    interaction: "Can collide with walls, platforms, or targets.",
    name: "Projectile",
    render: Object.freeze({ type: "None" }),
    role: "Projectile",
    state: "Active",
  }),
  Object.freeze({
    behavior: "Stays fixed in the scene.",
    interaction: "Provides a stable collision surface.",
    name: "Wall",
    render: Object.freeze({ type: "None" }),
    role: "Wall",
    state: "Active",
  }),
]);

const SECTION_LABELS = Object.freeze({
  gameDetails: "Game Details",
  platforms: "Platforms",
  startupSettings: "Startup Settings",
  gameBasics: "Game Basics",
  gameRules: "Game Rules",
  playerSetup: "Player Setup",
  worldSetup: "World Setup",
  objectSetup: "Object Setup",
  audioSetup: "Audio Setup",
  testReadiness: "Test Readiness",
});

const STARTER_CONFIGURATION_INPUT = Object.freeze({
  audioSetup: "Simple pickup, hazard, and completion sounds.",
  gameDetails: "A friendly puzzle game prepared for sharing and discovery.",
  gameBasics: "Seeded playable setup for the current Game Hub game.",
  gameRules: "Collect every key, avoid hazards, and reach the exit.",
  objectSetup: "Keys, doors, hazards, exit marker, and tutorial prompt.",
  platforms: "Web",
  playerSetup: "One player starts near the first key with keyboard controls.",
  resolution: "1280x720",
  startupSettings: "Open on the title screen and start in the first room.",
  testReadiness: "Confirm start, collect, fail, retry, and win paths before Build Game.",
  version: "0.1.0",
  visibility: "Private",
  worldSetup: "One compact room with a locked exit and visible goal path.",
});

function starterConfigurationInput(existing = null) {
  return Object.fromEntries(Object.entries(STARTER_CONFIGURATION_INPUT).map(([key, value]) => [
    key,
    normalizeText(existing?.[key]) || value,
  ]));
}

const DESIGN_REQUIRED_FIELDS = Object.freeze([
  { field: "gameType", label: "Game Type", action: "Select a game type before configuration handoff." },
  { field: "genre", label: "Genre", action: "Select a genre so game discovery and expectations are clear." },
  { field: "playStyle", label: "Play Style", action: "Select the play style that best describes the intended experience." },
  { field: "playerMode", label: "Player Mode", action: "Select how players participate and receive input." },
  { field: "summary", label: "Summary", action: "Write a short summary that explains the game promise." },
  { field: "story", label: "Story", action: "Write the story or premise players enter." },
  { field: "coreLoop", label: "Core Loop", action: "Describe what players repeatedly do." },
  { field: "winCondition", label: "Win Condition", action: "Describe how players win." },
  { field: "loseCondition", label: "Lose Condition", action: "Describe how players lose or fail." },
  { field: "targetAudience", label: "Target Audience", action: "Describe the intended players." },
]);

const DESIGN_SECTION_FIELDS = Object.freeze([
  Object.freeze({ field: "summary", heading: "Summary", sectionKey: "summary" }),
  Object.freeze({ field: "story", heading: "Story", sectionKey: "story" }),
  Object.freeze({ field: "coreLoop", heading: "Core Loop", sectionKey: "core-loop" }),
  Object.freeze({ field: "winCondition", heading: "Win Condition", sectionKey: "win-condition" }),
  Object.freeze({ field: "loseCondition", heading: "Lose Condition", sectionKey: "lose-condition" }),
  Object.freeze({ field: "targetAudience", heading: "Target Audience", sectionKey: "target-audience" }),
  Object.freeze({ field: "designNotes", heading: "Design Notes", sectionKey: "design-notes" }),
]);

const SYSTEM_USER_KEY = SEED_DB_KEYS.users.forgeBot;
const DEFAULT_USER_KEY = SEED_DB_KEYS.users.user1;
const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/;

function normalizeText(value) {
  return String(value || "").trim();
}

function slugify(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isUlidKey(value) {
  return ULID_PATTERN.test(normalizeText(value));
}

function sourceSequence(source, offset) {
  const text = normalizeText(source) || "default";
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) % 8000;
  }
  return offset + hash;
}

export function gameWorkspaceGameKeyForApi(gameId) {
  const normalized = normalizeText(gameId);
  if (!normalized) {
    return "";
  }
  if (isUlidKey(normalized)) {
    return normalized;
  }
  if (normalized === "demo-game") {
    return makeSeedUlid(5101);
  }
  if (normalized === "gravity-demo") {
    return makeSeedUlid(5102);
  }
  return makeSeedUlid(sourceSequence(`game-hub-game:${normalized}`, 5200));
}

function timestamp() {
  return new Date().toISOString();
}

function auditFields(userKey, createdAt = timestamp()) {
  return {
    createdAt,
    updatedAt: timestamp(),
    createdBy: userKey,
    updatedBy: userKey,
  };
}

function cloneRows(rows) {
  return (Array.isArray(rows) ? rows : []).map((row) => ({ ...row }));
}

function cloneTables(tableNames, tables) {
  return Object.fromEntries(tableNames.map((tableName) => [tableName, cloneRows(tables?.[tableName])]));
}

function normalizeChoice(value, choices) {
  const normalized = normalizeText(value);
  return choices.includes(normalized) ? normalized : "";
}

function normalizePlayerMode(value) {
  const normalized = normalizeText(value);
  return GAME_DESIGN_PLAYER_MODES.some((mode) => mode.value === normalized)
    ? normalized
    : "1 Player";
}

function activeUserKey(options) {
  const sessionUserKey = typeof options.sessionUserKey === "function"
    ? options.sessionUserKey()
    : options.sessionUserKey;
  return normalizeText(sessionUserKey) || DEFAULT_USER_KEY;
}

function databaseAdapter(options, action) {
  if (typeof options.databaseAdapter === "function") {
    return options.databaseAdapter(action);
  }
  throw new Error(`${action} requires the configured API database adapter.`);
}

function tagsApiSetupError(action, error) {
  if (error?.name === "TagsApiSetupError") {
    return error;
  }
  const message = `${action} failed because the Tags API database setup is unavailable. Verify the API database connection and apply the account, Game Hub, and Tags database setup before using Tags.`;
  const wrapped = new Error(message);
  wrapped.name = "TagsApiSetupError";
  wrapped.statusCode = typeof error?.statusCode === "number" ? error.statusCode : 503;
  wrapped.operatorDiagnostic = `${message} Cause: ${error instanceof Error ? error.message : String(error || "Unknown database error.")}`;
  wrapped.cause = error;
  return wrapped;
}

function activeGameFromWorkspace(repository, overrideId = "") {
  if (overrideId && typeof repository?.openGame === "function") {
    repository.openGame(overrideId);
  }
  const game = typeof repository?.getActiveGame === "function" ? repository.getActiveGame() : null;
  const source = game && typeof game === "object" ? game : DEFAULT_GAME;
  const id = normalizeText(source.id || source.key || DEFAULT_GAME.id);
  return {
    ...source,
    id,
    key: gameWorkspaceGameKeyForApi(source.key || id),
    name: normalizeText(source.name) || DEFAULT_GAME.name,
    purpose: normalizeText(source.purpose) || DEFAULT_GAME.purpose,
    status: normalizeText(source.status) || DEFAULT_GAME.status,
  };
}

async function ensureGameRecord(adapter, game, userKey = DEFAULT_USER_KEY) {
  await adapter.upsertProductTable("game_workspace_games", [{
    key: game.key,
    name: game.name,
    status: game.status,
    ownerKey: userKey,
    ...auditFields(userKey),
  }]);
  return game;
}

function starterTagRow(tag, index) {
  return {
    active: true,
    description: tag.description,
    key: makeSeedUlid(7200 + index + 1),
    label: tag.label,
    slug: slugify(tag.label),
    ...auditFields(SYSTEM_USER_KEY),
  };
}

function objectKeyFromText(value) {
  return slugify(value);
}

function parseObjectCapabilities(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeText).filter(Boolean);
  }
  const text = normalizeText(value);
  if (!text) {
    return [];
  }
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.map(normalizeText).filter(Boolean);
    }
  } catch {}
  return text.split(",").map(normalizeText).filter(Boolean);
}

function objectTemplateForRole(role) {
  return OBJECT_TYPE_TEMPLATES.find((template) => template.type === normalizeText(role)) || null;
}

function normalizeObjectRender(source = {}) {
  const render = source.render && typeof source.render === "object" ? source.render : {};
  const renderType = normalizeText(source.renderType || render.type) === "Sprite" ? "Sprite" : "None";
  if (renderType !== "Sprite") {
    return {
      assetKey: "",
      previewPath: "",
      type: "None",
    };
  }
  return {
    assetKey: normalizeText(source.renderAssetKey || render.assetKey),
    previewPath: normalizeText(source.renderPreviewPath || render.previewPath),
    type: "Sprite",
  };
}

function objectTextField(value) {
  if (typeof value === "string") {
    return normalizeText(value);
  }
  if (value && typeof value === "object") {
    return normalizeText(value.text || value.description || value.summary);
  }
  return "";
}

function parseObjectTags(value) {
  const values = Array.isArray(value)
    ? value
    : normalizeText(value).split(",");
  return [...new Set(values.map(normalizeText).filter(Boolean))];
}

function objectBooleanField(value, fallback) {
  if (value === true || value === "true" || value === "1") {
    return true;
  }
  if (value === false || value === "false" || value === "0") {
    return false;
  }
  return fallback;
}

function objectDetailsFromSource(source = {}, render = normalizeObjectRender(source)) {
  const details = source.details && typeof source.details === "object" ? source.details : {};
  return {
    active: objectBooleanField(details.active ?? source.active, true),
    audioReference: normalizeText(details.audioReference ?? source.audioReference),
    defaultValues: normalizeText(details.defaultValues ?? source.defaultValues),
    description: normalizeText(details.description ?? source.description),
    messageReference: normalizeText(details.messageReference ?? source.messageReference),
    spriteReference: normalizeText(details.spriteReference ?? source.spriteReference) || normalizeText(render.assetKey),
    tags: parseObjectTags(details.tags ?? source.tags),
    visible: objectBooleanField(details.visible ?? source.visible, true),
  };
}

function objectFromRecord(record = {}) {
  const render = normalizeObjectRender(record);
  const interaction = record.interaction && typeof record.interaction === "object" ? record.interaction : {};
  return {
    behavior: objectTextField(record.behavior),
    details: objectDetailsFromSource(interaction.details || interaction, render),
    id: objectKeyFromText(record.id || record.name),
    interaction: objectTextField(record.interaction),
    name: normalizeText(record.name),
    render: render.type === "Sprite"
      ? {
          assetKey: render.assetKey,
          previewPath: render.previewPath,
          type: "Sprite",
        }
      : { type: "None" },
    role: normalizeText(record.type),
    state: normalizeText(record.state) || "Active",
    traits: parseObjectCapabilities(record.capabilities),
    type: normalizeText(record.modelType),
  };
}

function sortedObjectRecords(rows = []) {
  return cloneRows(rows).sort((left, right) => (
    (Number(left.recordOrder) || 0) - (Number(right.recordOrder) || 0)
      || normalizeText(left.name).localeCompare(normalizeText(right.name))
  ));
}

function normalizeObjectInput(input = {}) {
  const role = normalizeText(input.role || input.type);
  const template = objectTemplateForRole(role);
  const id = objectKeyFromText(input.id || input.name);
  const render = normalizeObjectRender(input);
  const details = objectDetailsFromSource(input, render);
  return {
    behavior: normalizeText(input.behavior),
    capabilities: parseObjectCapabilities(input.traits || input.capabilities),
    details,
    id,
    interaction: normalizeText(input.interaction),
    modelType: normalizeText(input.type) || template?.modelType || "",
    name: normalizeText(input.name),
    render,
    role,
    state: normalizeText(input.state) || template?.state || "Active",
  };
}

function objectRecordFromInput(input, {
  adapter,
  existing = null,
  gameKey,
  index,
  userKey,
}) {
  const object = normalizeObjectInput(input);
  const now = timestamp();
  return {
    behavior: object.behavior ? { text: object.behavior } : {},
    capabilities: object.capabilities,
    createdAt: existing?.createdAt || now,
    createdBy: existing?.createdBy || userKey,
    gameId: gameKey,
    id: object.id,
    interaction: {
      ...(object.interaction ? { text: object.interaction } : {}),
      details: object.details,
    },
    key: existing?.key || adapter.createRecordKey(),
    modelType: object.modelType,
    name: object.name,
    recordOrder: index + 1,
    renderAssetKey: object.render.assetKey || null,
    renderPreviewPath: object.render.previewPath,
    renderType: object.render.type,
    state: object.state,
    type: object.role,
    updatedAt: now,
    updatedBy: userKey,
  };
}

function objectsApiSetupError(action, error) {
  if (error?.name === "ObjectsApiSetupError") {
    return error;
  }
  const message = `${action} failed because the Objects API database setup is unavailable. Verify the API database connection and apply the account, Game Hub, Assets, and Objects database setup before using Objects.`;
  const wrapped = new Error(message);
  wrapped.name = "ObjectsApiSetupError";
  wrapped.statusCode = typeof error?.statusCode === "number" ? error.statusCode : 503;
  wrapped.operatorDiagnostic = `${message} Cause: ${error instanceof Error ? error.message : String(error || "Unknown database error.")}`;
  wrapped.cause = error;
  return wrapped;
}

export function createObjectsApiService(options = {}) {
  let lastTables = { object_definition_records: [] };

  function activeGame() {
    return activeGameFromWorkspace(options.gameWorkspaceRepository);
  }

  function objectsFromTables(tables = lastTables, gameKey = activeGame().key) {
    return sortedObjectRecords(tables.object_definition_records)
      .filter((record) => normalizeText(record.gameId || record.gameKey || record.projectKey) === gameKey)
      .map(objectFromRecord);
  }

  async function readTables() {
    const action = "Reading Objects";
    try {
      const adapter = databaseAdapter(options, action);
      await ensureGameRecord(adapter, activeGame(), activeUserKey(options));
      lastTables = {
        object_definition_records: await adapter.requestTable("object_definition_records"),
      };
      return lastTables;
    } catch (error) {
      throw objectsApiSetupError(action, error);
    }
  }

  async function listObjects(gameId = "") {
    const game = activeGameFromWorkspace(options.gameWorkspaceRepository, gameId);
    const tables = await readTables();
    return objectsFromTables(tables, game.key);
  }

  function listCachedObjects(gameId = "") {
    const game = activeGameFromWorkspace(options.gameWorkspaceRepository, gameId);
    return objectsFromTables(lastTables, game.key);
  }

  async function replaceObjects(objects = [], gameId = "") {
    const action = "Saving Objects";
    try {
      const adapter = databaseAdapter(options, action);
      const game = activeGameFromWorkspace(options.gameWorkspaceRepository, gameId);
      const userKey = activeUserKey(options);
      await ensureGameRecord(adapter, game, userKey);
      const existingRows = await adapter.requestTable("object_definition_records", {
        query: `gameId=eq.${encodeURIComponent(game.key)}`,
      });
      const existingById = new Map(existingRows.map((record) => [objectKeyFromText(record.id || record.name), record]));
      for (const record of existingRows) {
        await adapter.requestTable("object_definition_records", {
          method: "DELETE",
          prefer: "return=representation",
          query: `key=eq.${encodeURIComponent(record.key)}`,
        });
      }
      const nextRows = (Array.isArray(objects) ? objects : [])
        .map((object, index) => objectRecordFromInput(object, {
          adapter,
          existing: existingById.get(objectKeyFromText(object.id || object.name)) || null,
          gameKey: game.key,
          index,
          userKey,
        }))
        .filter((row) => row.id && row.name);
      if (nextRows.length) {
        await adapter.upsertProductTable("object_definition_records", nextRows);
      }
      await readTables();
      return {
        objects: listCachedObjects(game.id),
        saved: true,
        snapshot: await getSnapshot(),
      };
    } catch (error) {
      throw objectsApiSetupError(action, error);
    }
  }

  async function resetObjects(gameId = "") {
    return replaceObjects([], gameId);
  }

  async function getSnapshot() {
    const tables = await readTables();
    const game = activeGame();
    const objects = objectsFromTables(tables, game.key);
    return {
      activeGame: game,
      activeProject: game,
      objects,
      tableCounts: OBJECTS_TOOL_TABLES.map((table) => ({ rows: tables[table].length, table })),
      tables: cloneTables(OBJECTS_TOOL_TABLES, tables),
    };
  }

  return {
    CAPABILITY_LABELS,
    OBJECTS_TOOL_TABLES,
    OBJECT_TYPE_TEMPLATES,
    STARTER_OBJECTS,
    authenticationRequiredMessage: "Sign in required to save Objects through the API.",
    getSnapshot,
    getTables: () => cloneTables(OBJECTS_TOOL_TABLES, lastTables),
    listCachedObjects,
    listObjects,
    replaceObjects,
    requiresAuthenticatedWrites: true,
    resetObjects,
    usesDatabasePersistence: true,
    writeMethods: new Set(["replaceObjects", "resetObjects"]),
  };
}

function tagLabel(tag) {
  return tag?.label || tag?.name || "";
}

function usageRowsForTag(tag, usageProvider) {
  const tagId = normalizeText(tag.id || tag.slug);
  if (!tagId || typeof usageProvider !== "function") {
    return [];
  }
  return usageProvider()
    .filter((asset) => Array.isArray(asset.tagKeys) && asset.tagKeys.includes(tagId))
    .map((asset) => ({
      itemName: normalizeText(asset.name) || normalizeText(asset.id) || "Unnamed asset",
      itemKey: normalizeText(asset.id),
      tool: "Assets",
    }))
    .sort((left, right) => left.tool.localeCompare(right.tool) || left.itemName.localeCompare(right.itemName));
}

export function createTagsApiService(options = {}) {
  let lastTables = { project_tag_assignments: [], project_tags: [] };
  const seededProjectKeys = new Set();

  async function readTables(seed = true) {
    const action = "Reading project tags";
    try {
      const adapter = databaseAdapter(options, action);
      const project = activeProject();
      await ensureGameRecord(adapter, project, activeUserKey(options));
      let tags = await adapter.requestTable("project_tags");
      if (seed) {
        const existingSlugs = new Set(tags.map((tag) => normalizeText(tag.slug)));
        const missingRows = STARTER_TAGS
          .map(starterTagRow)
          .filter((row) => !existingSlugs.has(row.slug));
        if (missingRows.length) {
          await adapter.upsertProductTable("project_tags", missingRows);
          tags = await adapter.requestTable("project_tags");
        }
      }
      let assignments = await adapter.requestTable("project_tag_assignments");
      if (seed && !seededProjectKeys.has(project.key)) {
        const projectAssignments = assignments.filter((assignment) => assignment.projectKey === project.key);
        if (!projectAssignments.length) {
          const starterTagKeys = tags
            .filter((tag) => ["fantasy", "platformer"].includes(normalizeText(tag.slug)))
            .map((tag) => tag.key);
          if (starterTagKeys.length) {
            await adapter.upsertProductTable("project_tag_assignments", starterTagKeys.map((tagKey) => ({
              key: adapter.createRecordKey(),
              projectKey: project.key,
              tagKey,
              ...auditFields(SYSTEM_USER_KEY),
            })));
            assignments = await adapter.requestTable("project_tag_assignments");
          }
        }
        seededProjectKeys.add(project.key);
      }
      lastTables = {
        project_tag_assignments: assignments,
        project_tags: tags,
      };
      return lastTables;
    } catch (error) {
      throw tagsApiSetupError(action, error);
    }
  }

  function activeProject() {
    const game = activeGameFromWorkspace(options.gameWorkspaceRepository);
    return {
      key: game.key,
      id: game.id,
      name: game.name,
    };
  }

  function decorateTag(row, tables = lastTables) {
    const project = activeProject();
    const assignments = tables.project_tag_assignments.filter((assignment) => assignment.tagKey === row.key);
    const assigned = assignments.some((assignment) => assignment.projectKey === project.key);
    const usage = usageRowsForTag(row, typeof options.usageProvider === "function" ? options.usageProvider : null);
    return {
      ...row,
      assignmentCount: assignments.length,
      assigned,
      assignedProjectKey: assigned ? project.key : "",
      id: row.slug,
      name: row.label,
      usage,
      usageCount: usage.length + assignments.length,
    };
  }

  function listTagsFromTables(tables) {
    return tables.project_tags
      .filter((row) => row.active !== false)
      .map((row) => decorateTag(row, tables))
      .sort((left, right) => tagLabel(left).localeCompare(tagLabel(right)));
  }

  function validateTagInputFromTables(tables, input = {}, existingKey = "") {
    const label = normalizeText(input.label || input.name || input.tagName).replace(/\s+/g, " ");
    const description = normalizeText(input.description);
    const slug = slugify(input.slug || label);
    const duplicate = tables.project_tags.some((row) => (
      row.key !== existingKey &&
      row.active !== false &&
      (normalizeText(row.label).toLowerCase() === label.toLowerCase() || normalizeText(row.slug) === slug)
    ));
    const findings = [];
    if (!label) {
      findings.push({ action: "Enter a tag label before saving.", label: "Tag Label", status: "Missing" });
    }
    if (duplicate) {
      findings.push({ action: "Choose a unique project tag label.", label: "Tag Label", status: "Duplicate" });
    }
    return {
      description,
      findings,
      label,
      name: label,
      slug,
      status: findings.length ? "Needs Input" : "Ready",
    };
  }

  async function getSnapshot() {
    const tables = await readTables();
    const tags = listTagsFromTables(tables);
    const project = activeProject();
    const assignedKeys = new Set(tables.project_tag_assignments
      .filter((assignment) => assignment.projectKey === project.key)
      .map((assignment) => assignment.tagKey));
    const assignedTags = tags.filter((tag) => assignedKeys.has(tag.key));
    return {
      activeProject: project,
      assignedTags,
      availableTags: tags.filter((tag) => !tag.assigned),
      status: tags.length ? "Ready" : "Needs Tags",
      tableCounts: TAGS_TOOL_TABLES.map((tableName) => ({ rows: tables[tableName].length, table: tableName })),
      tables: cloneTables(TAGS_TOOL_TABLES, tables),
      tags,
    };
  }

  async function findTag(tagId) {
    const tables = await readTables();
    const id = normalizeText(tagId);
    return listTagsFromTables(tables).find((tag) => tag.id === id || tag.slug === id || tag.key === id) || null;
  }

  async function addTag(input = {}) {
    const tables = await readTables();
    const validation = validateTagInputFromTables(tables, input);
    if (validation.findings.length) {
      return { added: false, message: validation.findings[0].action, snapshot: await getSnapshot(), validation };
    }
    const adapter = databaseAdapter(options, "Adding project tag");
    const row = {
      active: true,
      description: validation.description,
      key: adapter.createRecordKey(),
      label: validation.label,
      slug: validation.slug,
      ...auditFields(activeUserKey(options)),
    };
    await adapter.upsertProductTable("project_tags", [row]);
    const snapshot = await getSnapshot();
    return {
      added: true,
      message: `Added ${row.label}.`,
      snapshot,
      tag: snapshot.tags.find((tag) => tag.key === row.key) || decorateTag(row),
      validation,
    };
  }

  async function updateTag(tagId, input = {}) {
    const tables = await readTables();
    const tag = listTagsFromTables(tables).find((candidate) =>
      [candidate.id, candidate.slug, candidate.key].includes(normalizeText(tagId))
    );
    const row = tag ? tables.project_tags.find((candidate) => candidate.key === tag.key) : null;
    if (!row) {
      return { message: "Tag update blocked: choose a project tag.", snapshot: await getSnapshot(), updated: false };
    }
    const validation = validateTagInputFromTables(tables, input, row.key);
    if (validation.findings.length) {
      return { message: validation.findings[0].action, snapshot: await getSnapshot(), updated: false, validation };
    }
    const adapter = databaseAdapter(options, "Updating project tag");
    const nextRow = {
      ...row,
      description: validation.description,
      label: validation.label,
      slug: validation.slug,
      updatedAt: timestamp(),
      updatedBy: activeUserKey(options),
    };
    await adapter.upsertProductTable("project_tags", [nextRow]);
    const snapshot = await getSnapshot();
    return {
      message: `Updated ${nextRow.label}.`,
      snapshot,
      tag: snapshot.tags.find((candidate) => candidate.key === nextRow.key),
      updated: true,
      validation,
    };
  }

  async function deleteTag(tagId) {
    const tables = await readTables();
    const tag = listTagsFromTables(tables).find((candidate) =>
      [candidate.id, candidate.slug, candidate.key].includes(normalizeText(tagId))
    );
    if (!tag) {
      return { deleted: false, message: "Tag delete blocked: choose a project tag.", snapshot: await getSnapshot() };
    }
    if (tag.usageCount > 0) {
      return {
        deleted: false,
        message: `${tag.label} is used by ${tag.usageCount} item${tag.usageCount === 1 ? "" : "s"}. Remove usage before deleting.`,
        snapshot: await getSnapshot(),
      };
    }
    const adapter = databaseAdapter(options, "Deleting project tag");
    const row = tables.project_tags.find((candidate) => candidate.key === tag.key);
    await adapter.upsertProductTable("project_tags", [{
      ...row,
      active: false,
      slug: `${row.slug}-deleted-${row.key.slice(-6)}`,
      updatedAt: timestamp(),
      updatedBy: activeUserKey(options),
    }]);
    return { deleted: true, message: `Deleted ${tag.label}.`, snapshot: await getSnapshot(), tagId: tag.id };
  }

  async function assignTagToProject(tagId, projectKey = activeProject().key) {
    const tables = await readTables();
    const tag = listTagsFromTables(tables).find((candidate) =>
      [candidate.id, candidate.slug, candidate.key].includes(normalizeText(tagId))
    );
    const project = activeProject();
    const targetProjectKey = normalizeText(projectKey) || project.key;
    if (!tag) {
      return { assigned: false, message: "Tag assignment blocked: choose a project tag.", snapshot: await getSnapshot() };
    }
    const existing = tables.project_tag_assignments.find((assignment) =>
      assignment.projectKey === targetProjectKey && assignment.tagKey === tag.key
    );
    if (existing) {
      return { assigned: false, message: `${tag.label} is already assigned to ${project.name}.`, snapshot: await getSnapshot(), tag };
    }
    const adapter = databaseAdapter(options, "Assigning project tag");
    await ensureGameRecord(adapter, project, activeUserKey(options));
    await adapter.upsertProductTable("project_tag_assignments", [{
      key: adapter.createRecordKey(),
      projectKey: targetProjectKey,
      tagKey: tag.key,
      ...auditFields(activeUserKey(options)),
    }]);
    const snapshot = await getSnapshot();
    return { assigned: true, message: `Assigned ${tag.label} to ${project.name}.`, snapshot, tag: snapshot.tags.find((candidate) => candidate.key === tag.key) };
  }

  async function removeTagFromProject(tagId, projectKey = activeProject().key) {
    const tables = await readTables();
    const tag = listTagsFromTables(tables).find((candidate) =>
      [candidate.id, candidate.slug, candidate.key].includes(normalizeText(tagId))
    );
    const project = activeProject();
    const targetProjectKey = normalizeText(projectKey) || project.key;
    if (!tag) {
      return { message: "Tag removal blocked: choose a project tag.", removed: false, snapshot: await getSnapshot() };
    }
    const existing = tables.project_tag_assignments.find((assignment) =>
      assignment.projectKey === targetProjectKey && assignment.tagKey === tag.key
    );
    if (existing) {
      const adapter = databaseAdapter(options, "Removing project tag");
      await adapter.requestTable("project_tag_assignments", {
        method: "DELETE",
        prefer: "return=representation",
        query: `key=eq.${encodeURIComponent(existing.key)}`,
      });
    }
    const snapshot = await getSnapshot();
    return {
      message: existing ? `Removed ${tag.label} from ${project.name}.` : `${tag.label} was not assigned to ${project.name}.`,
      removed: Boolean(existing),
      snapshot,
      tag: snapshot.tags.find((candidate) => candidate.key === tag.key) || tag,
    };
  }

  async function clearTags() {
    const adapter = databaseAdapter(options, "Clearing project tags");
    const tables = await readTables(false);
    for (const row of tables.project_tag_assignments) {
      await adapter.requestTable("project_tag_assignments", {
        method: "DELETE",
        prefer: "return=representation",
        query: `key=eq.${encodeURIComponent(row.key)}`,
      });
    }
    for (const row of tables.project_tags) {
      await adapter.upsertProductTable("project_tags", [{
        ...row,
        active: false,
        slug: `${row.slug}-cleared-${row.key.slice(-6)}`,
        updatedAt: timestamp(),
        updatedBy: activeUserKey(options),
      }]);
    }
    lastTables = { project_tag_assignments: [], project_tags: [] };
    return getSnapshot();
  }

  async function resetTags() {
    seededProjectKeys.delete(activeProject().key);
    return getSnapshot();
  }

  async function validateTagInput(input = {}, existingKey = "") {
    const tables = await readTables();
    return validateTagInputFromTables(tables, input, existingKey);
  }

  return {
    TAGS_TOOL_TABLES,
    addTag,
    authenticationRequiredMessage: "Sign in required to save project tags through the API.",
    assignTagToProject,
    clearTags,
    deleteTag,
    findTag,
    getSnapshot,
    getTables: () => cloneTables(TAGS_TOOL_TABLES, lastTables),
    listTags: async () => listTagsFromTables(await readTables()),
    removeTagFromProject,
    requiresAuthenticatedWrites: true,
    resetTags,
    updateTag,
    usesDatabasePersistence: true,
    validateTagInput,
    writeMethods: new Set(["addTag", "assignTagToProject", "clearTags", "deleteTag", "removeTagFromProject", "resetTags", "updateTag"]),
  };
}

function createDesignRow(game, input = {}, userKey = DEFAULT_USER_KEY, existing = null) {
  const summary = normalizeText(input.summary || input.designSummary);
  const row = {
    key: existing?.key || makeSeedUlid(sourceSequence(`game-design:${game.key}`, 8800)),
    gameKey: game.key,
    title: `${game.name} Design`,
    gamePurpose: game.purpose,
    gameType: normalizeChoice(input.gameType, GAME_DESIGN_GAME_TYPES),
    genre: normalizeChoice(input.genre, GAME_DESIGN_GENRES),
    playStyle: normalizeChoice(input.playStyle, GAME_DESIGN_PLAY_STYLES),
    playerMode: normalizePlayerMode(input.playerMode),
    summary,
    designSummary: summary,
    story: normalizeText(input.story),
    coreLoop: normalizeText(input.coreLoop),
    winCondition: normalizeText(input.winCondition),
    loseCondition: normalizeText(input.loseCondition),
    targetAudience: normalizeText(input.targetAudience),
    designNotes: normalizeText(input.designNotes),
    capabilityDemoAuthoring: game.purpose === "Capability Demo" || input.capabilityDemoAuthoring === true,
    capabilityDemoNotes: normalizeText(input.capabilityDemoNotes),
    status: "Under Construction",
    ...auditFields(userKey, existing?.createdAt || timestamp()),
  };
  const findings = DESIGN_REQUIRED_FIELDS.filter((requirement) => !row[requirement.field]);
  row.status = findings.length ? "Under Construction" : "Ready";
  return { findings, row };
}

function createDesignValidationRows(gameKey, findings, adapter, userKey) {
  return findings.map((finding, index) => ({
    action: finding.action,
    field: finding.field,
    gameKey,
    key: adapter.createRecordKey(),
    label: finding.label,
    status: "Missing",
    ...auditFields(userKey),
  }));
}

export function createGameDesignApiService(options = {}) {
  let contextMode = "normal";
  let lastTables = {
    game_design_capability_demos: [],
    game_design_documents: [],
    game_design_sections: [],
    game_design_validation_items: [],
  };

  function activeGame() {
    if (contextMode === "missing") {
      return null;
    }
    return activeGameFromWorkspace(options.gameWorkspaceRepository);
  }

  async function readTables(seed = true) {
    const adapter = databaseAdapter(options, "Reading Game Design");
    const game = activeGame();
    if (game) {
      await ensureGameRecord(adapter, game, activeUserKey(options));
    }
    let documents = await adapter.requestTable("game_design_documents");
    let validationItems = await adapter.requestTable("game_design_validation_items");
    let sections = await adapter.requestTable("game_design_sections");
    let demos = [];
    try {
      demos = await adapter.requestTable("game_design_capability_demos");
    } catch {
      demos = [];
    }
    const existingDesign = game ? documents.find((row) => row.gameKey === game.key) : null;
    if (seed && game && !existingDesign) {
      const seedInput = game.purpose === "Capability Demo"
        ? {
            capabilityDemoAuthoring: true,
            capabilityDemoNotes: `${game.name} remains a Game Hub game.`,
            designSummary: `${game.name} demonstrates one planned capability as a game-owned demo.`,
            gameType: "Capability Demo",
            genre: "Utility",
            story: `${game.name} demonstrates a focused creator capability in a playable scene.`,
            coreLoop: "Start the demo, try the capability, and confirm the expected result.",
            winCondition: "Complete the capability check successfully.",
            loseCondition: "Restart the demo if the capability check fails.",
            targetAudience: "Creators validating a focused game feature.",
            designNotes: "Capability Demo authoring stays game-owned.",
            playStyle: "Guided Tutorial",
            playerMode: "1 Player",
          }
        : {
            designSummary: "A compact puzzle adventure with one clear game promise.",
            gameType: "Puzzle",
            genre: "Adventure",
            story: "A curious maker enters a clockwork library.",
            coreLoop: "Explore a compact room, solve a tile puzzle, and unlock the next shelf.",
            winCondition: "Restore the library clock before the final bell.",
            loseCondition: "The room resets after too many missed moves.",
            targetAudience: "Puzzle fans and first-time creators.",
            designNotes: "Seeded Game Design data stays scoped to the current Game Hub game.",
            playStyle: "Single Player",
            playerMode: "1 Player",
          };
      await saveDesign(seedInput);
      documents = await adapter.requestTable("game_design_documents");
      validationItems = await adapter.requestTable("game_design_validation_items");
      sections = await adapter.requestTable("game_design_sections");
      try {
        demos = await adapter.requestTable("game_design_capability_demos");
      } catch {
        demos = [];
      }
    }
    lastTables = {
      game_design_capability_demos: demos,
      game_design_documents: documents,
      game_design_sections: sections,
      game_design_validation_items: validationItems,
    };
    return lastTables;
  }

  function activeDesignFromTables(tables, game = activeGame()) {
    if (!game) {
      return null;
    }
    const row = tables.game_design_documents.find((document) => document.gameKey === game.key) || null;
    return row ? { ...row, designSummary: row.summary || row.designSummary || "", gameId: game.id, summary: row.summary || row.designSummary || "" } : null;
  }

  function validateDesignInput(input = {}) {
    const game = activeGame();
    if (!game) {
      return {
        findings: [{ action: "Open or seed a Game Hub game before saving Game Design.", field: "game", label: "Game Context", status: "Missing" }],
        status: "Blocked",
      };
    }
    const design = {
      summary: normalizeText(input.summary || input.designSummary),
      gameType: normalizeChoice(input.gameType, GAME_DESIGN_GAME_TYPES),
      genre: normalizeChoice(input.genre, GAME_DESIGN_GENRES),
      coreLoop: normalizeText(input.coreLoop),
      loseCondition: normalizeText(input.loseCondition),
      playerMode: normalizePlayerMode(input.playerMode),
      playStyle: normalizeChoice(input.playStyle, GAME_DESIGN_PLAY_STYLES),
      story: normalizeText(input.story),
      targetAudience: normalizeText(input.targetAudience),
      winCondition: normalizeText(input.winCondition),
    };
    const findings = DESIGN_REQUIRED_FIELDS.filter((requirement) => !design[requirement.field]);
    return { findings, status: findings.length ? "Needs Input" : "Ready" };
  }

  async function replaceDesignValidationRows(adapter, gameKey, findings) {
    const existingRows = await adapter.requestTable("game_design_validation_items", {
      query: `gameKey=eq.${encodeURIComponent(gameKey)}`,
    });
    for (const row of existingRows) {
      await adapter.requestTable("game_design_validation_items", {
        method: "DELETE",
        prefer: "return=representation",
        query: `key=eq.${encodeURIComponent(row.key)}`,
      });
    }
    if (findings.length) {
      await adapter.upsertProductTable("game_design_validation_items", createDesignValidationRows(gameKey, findings, adapter, activeUserKey(options)));
    }
  }

  async function replaceDesignSectionRows(adapter, game, document) {
    const existingRows = await adapter.requestTable("game_design_sections", {
      query: `gameKey=eq.${encodeURIComponent(game.key)}`,
    });
    for (const row of existingRows) {
      await adapter.requestTable("game_design_sections", {
        method: "DELETE",
        prefer: "return=representation",
        query: `key=eq.${encodeURIComponent(row.key)}`,
      });
    }
    const rows = DESIGN_SECTION_FIELDS
      .map((section, index) => ({
        body: normalizeText(document[section.field]),
        documentKey: document.key,
        gameKey: game.key,
        heading: section.heading,
        key: adapter.createRecordKey(),
        sectionKey: section.sectionKey,
        sortOrder: index + 1,
        ...auditFields(activeUserKey(options)),
      }))
      .filter((row) => row.body);
    if (rows.length) {
      await adapter.upsertProductTable("game_design_sections", rows);
    }
  }

  async function replaceCapabilityDemoRow(adapter, game, document) {
    let existingRows = [];
    try {
      existingRows = await adapter.requestTable("game_design_capability_demos", {
        query: `gameKey=eq.${encodeURIComponent(game.key)}`,
      });
    } catch {
      return;
    }
    for (const row of existingRows) {
      await adapter.requestTable("game_design_capability_demos", {
        method: "DELETE",
        prefer: "return=representation",
        query: `key=eq.${encodeURIComponent(row.key)}`,
      });
    }
    if (document.capabilityDemoAuthoring) {
      await adapter.upsertProductTable("game_design_capability_demos", [{
        gameKey: game.key,
        gameName: game.name,
        gamePurpose: game.purpose,
        authoringMode: "Game-owned capability demo",
        key: adapter.createRecordKey(),
        status: document.status,
        ...auditFields(activeUserKey(options)),
      }]);
    }
  }

  async function saveDesign(input = {}) {
    const game = activeGame();
    if (!game) {
      return { saved: false, message: "Open or seed a game before saving Game Design.", snapshot: await getSnapshot() };
    }
    const adapter = databaseAdapter(options, "Saving Game Design");
    await ensureGameRecord(adapter, game, activeUserKey(options));
    const existing = (await adapter.requestTable("game_design_documents", {
      query: `gameKey=eq.${encodeURIComponent(game.key)}`,
    }))[0] || null;
    const { findings, row } = createDesignRow(game, input, activeUserKey(options), existing);
    await adapter.upsertProductTable("game_design_documents", [row]);
    await replaceDesignValidationRows(adapter, game.key, findings);
    await replaceDesignSectionRows(adapter, game, row);
    await replaceCapabilityDemoRow(adapter, game, row);
    const snapshot = await getSnapshot(false);
    return {
      saved: true,
      message: findings.length === 0
        ? `Saved ${game.name} as ready for Game Design.`
        : `Saved ${game.name} with ${findings.length} missing Game Design requirement${findings.length === 1 ? "" : "s"}.`,
      snapshot,
    };
  }

  async function getGameProgressHandoff() {
    const tables = await readTables();
    const game = activeGame();
    const design = activeDesignFromTables(tables, game);
    if (!game) {
      return {
        currentFocus: "Open a Game Hub game",
        gameProgress: "No active game",
        progressChecklist: ["Game context: Missing", "Game Design document: Blocked", "Game Configuration handoff: Blocked"],
        publishingProgress: "Blocked until Game Hub has an active game",
        recommendedNextTool: "Game Hub",
      };
    }
    const validation = validateDesignInput(design || {});
    const ready = validation.findings.length === 0;
    return {
      currentFocus: ready ? "Review Game Configuration" : "Complete Game Design",
      gameProgress: ready
        ? `${game.name} Game Design ready`
        : `${game.name} Game Design needs ${validation.findings.length} requirement${validation.findings.length === 1 ? "" : "s"}`,
      progressChecklist: [
        `Game purpose: ${game.purpose}`,
        `Game type: ${design?.gameType || "Missing"}`,
        `Genre: ${design?.genre || "Missing"}`,
        `Play style: ${design?.playStyle || "Missing"}`,
        `Player mode: ${design?.playerMode || "Missing"}`,
        `Summary: ${design?.summary || design?.designSummary ? "Ready" : "Missing"}`,
        `Story: ${design?.story ? "Ready" : "Missing"}`,
        `Core loop: ${design?.coreLoop ? "Ready" : "Missing"}`,
        `Validation: ${validation.status}`,
      ],
      publishingProgress: ready
        ? "Publish remains blocked until Game Configuration and release gates are ready"
        : "Publish blocked until Game Design requirements are complete",
      recommendedNextTool: ready ? "Game Configuration" : "Game Design",
    };
  }

  async function getSnapshot(seed = true) {
    const tables = await readTables(seed);
    const game = activeGame();
    const activeDesign = activeDesignFromTables(tables, game);
    const capabilityDemoGames = listCapabilityDemoGames();
    return {
      activeDesign,
      activeGame: game,
      activeProject: game,
      capabilityDemoGames,
      capabilityDemoProjects: capabilityDemoGames,
      progressHandoff: await getGameProgressHandoff(),
      tables: cloneTables(GAME_DESIGN_TABLES, tables),
    };
  }

  function listGameContexts() {
    return (typeof options.gameWorkspaceRepository?.listGames === "function"
      ? options.gameWorkspaceRepository.listGames({ userKey: DEFAULT_USER_KEY })
      : [DEFAULT_GAME])
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  function listCapabilityDemoGames() {
    return listGameContexts()
      .filter((game) => game.purpose === "Capability Demo")
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  async function openGameContext(gameId) {
    contextMode = "normal";
    activeGameFromWorkspace(options.gameWorkspaceRepository, gameId);
    return { opened: Boolean(activeGame()), snapshot: await getSnapshot() };
  }

  async function clearGameContext() {
    contextMode = "missing";
    lastTables = {
      game_design_capability_demos: [],
      game_design_documents: [],
      game_design_sections: [],
      game_design_validation_items: [],
    };
    return getSnapshot(false);
  }

  async function resetDesignData() {
    contextMode = "normal";
    return getSnapshot();
  }

  return {
    authenticationRequiredMessage: "Sign in required to save Game Design through the API.",
    clearGameContext,
    clearProjectContext: clearGameContext,
    getActiveDesign: async () => activeDesignFromTables(await readTables(false)),
    getActiveGame: async () => activeGame(),
    getActiveProject: async () => activeGame(),
    getGameProgressHandoff,
    getSnapshot,
    getTables: () => cloneTables(GAME_DESIGN_TABLES, lastTables),
    listCapabilityDemoGames,
    listGameContexts,
    listProjectContexts: listGameContexts,
    openGameContext,
    requiresAuthenticatedWrites: true,
    resetDesignData,
    saveDesign,
    seedCapabilityDemoDesigns: async () => getSnapshot(),
    usesDatabasePersistence: true,
    validateDesign: async (input = {}) => validateDesignInput(input),
    writeMethods: new Set(["saveDesign"]),
  };
}

function requiredConfigurationSections(handoff) {
  const sections = ["gameDetails", "platforms", "startupSettings", "gameBasics", "gameRules", "playerSetup", "worldSetup", "objectSetup", "testReadiness"];
  if (handoff.activeProject?.purpose !== "Capability Demo" && handoff.activeDesign?.gameType !== "Capability Demo") {
    sections.splice(5, 0, "audioSetup");
  }
  return sections;
}

function validateConfigurationInput(input = {}, handoff) {
  if (!handoff.ready) {
    return {
      findings: [{ action: "Complete a valid Game Design before editing Game Configuration.", label: "Game Design", section: "gameDesign", status: "Missing" }],
      status: "Blocked",
    };
  }
  const findings = requiredConfigurationSections(handoff)
    .filter((section) => !normalizeText(input?.[section]))
    .map((section) => ({
      action: `Complete ${SECTION_LABELS[section]} before Build Game readiness.`,
      label: SECTION_LABELS[section],
      section,
      status: "Missing",
    }));
  return { findings, status: findings.length ? "Needs Input" : "Ready" };
}

function createConfigurationRow(project, handoff, input = {}, adapter, userKey, existing = null) {
  const validation = validateConfigurationInput(input, handoff);
  return {
    row: {
      key: existing?.key || makeSeedUlid(sourceSequence(`game-configuration:${project.key}`, 9300)),
      gameKey: project.key,
      gameName: project.name,
      gamePurpose: project.purpose,
      gameType: handoff.activeDesign?.gameType || "",
      genre: handoff.activeDesign?.genre || "",
      playStyle: handoff.activeDesign?.playStyle || "",
      playerMode: normalizePlayerMode(handoff.activeDesign?.playerMode),
      status: validation.findings.length ? "Under Construction" : "Ready",
      gameDetails: normalizeText(input.gameDetails),
      version: normalizeText(input.version) || "0.1.0",
      resolution: normalizeText(input.resolution) || "1280x720",
      platforms: normalizeText(input.platforms),
      visibility: normalizeText(input.visibility) || "Private",
      startupSettings: normalizeText(input.startupSettings),
      summary: normalizeText(input.gameBasics),
      gameBasics: normalizeText(input.gameBasics),
      gameRules: normalizeText(input.gameRules),
      playerSetup: normalizeText(input.playerSetup),
      worldSetup: normalizeText(input.worldSetup),
      objectSetup: normalizeText(input.objectSetup),
      audioSetup: normalizeText(input.audioSetup),
      testReadiness: normalizeText(input.testReadiness),
      ...auditFields(userKey, existing?.createdAt || timestamp()),
    },
    validation,
  };
}

export function createGameConfigurationApiService(options = {}) {
  const designService = options.gameDesignService;
  let lastTables = {
    game_configuration_records: [],
    game_configuration_validation_items: [],
  };

  async function getGameDesignHandoff() {
    const activeProject = await designService.getActiveGame();
    const activeDesign = await designService.getActiveDesign();
    const validation = await designService.validateDesign(activeDesign || {});
    const ready = Boolean(activeProject && activeDesign && validation.findings.length === 0);
    return {
      activeDesign,
      activeGame: activeProject,
      activeProject,
      ready,
      validation,
    };
  }

  async function readTables(seed = true) {
    const adapter = databaseAdapter(options, "Reading Game Configuration");
    const handoff = await getGameDesignHandoff();
    let records = await adapter.requestTable("game_configuration_records");
    let validationItems = await adapter.requestTable("game_configuration_validation_items");
    const existingConfiguration = handoff.activeProject
      ? records.find((row) => row.gameKey === handoff.activeProject.key)
      : null;
    if (seed && handoff.ready && handoff.activeProject && !existingConfiguration) {
      await updateConfiguration(handoff.activeProject.id, {
        ...STARTER_CONFIGURATION_INPUT,
      });
      records = await adapter.requestTable("game_configuration_records");
      validationItems = await adapter.requestTable("game_configuration_validation_items");
    }
    lastTables = {
      game_configuration_records: records,
      game_configuration_validation_items: validationItems,
    };
    return lastTables;
  }

  async function replaceConfigurationValidationRows(adapter, gameKey, findings) {
    const existingRows = await adapter.requestTable("game_configuration_validation_items", {
      query: `gameKey=eq.${encodeURIComponent(gameKey)}`,
    });
    for (const row of existingRows) {
      await adapter.requestTable("game_configuration_validation_items", {
        method: "DELETE",
        prefer: "return=representation",
        query: `key=eq.${encodeURIComponent(row.key)}`,
      });
    }
    if (findings.length) {
      await adapter.upsertProductTable("game_configuration_validation_items", findings.map((finding) => ({
        action: finding.action,
        gameKey,
        key: adapter.createRecordKey(),
        label: finding.label,
        section: finding.section,
        status: "Missing",
        ...auditFields(activeUserKey(options)),
      })));
    }
  }

  async function getConfiguration(projectId = "") {
    const tables = await readTables();
    const handoff = await getGameDesignHandoff();
    const projectKey = gameWorkspaceGameKeyForApi(projectId || handoff.activeProject?.id || handoff.activeProject?.key);
    return tables.game_configuration_records.find((row) => row.gameKey === projectKey) || null;
  }

  async function updateConfiguration(projectId = "", input = {}) {
    const handoff = await getGameDesignHandoff();
    if (!handoff.ready || !handoff.activeProject) {
      return null;
    }
    const adapter = databaseAdapter(options, "Saving Game Configuration");
    const project = handoff.activeProject;
    await ensureGameRecord(adapter, project, activeUserKey(options));
    const existing = (await adapter.requestTable("game_configuration_records", {
      query: `gameKey=eq.${encodeURIComponent(project.key)}`,
    }))[0] || null;
    const { row, validation } = createConfigurationRow(project, handoff, input, adapter, activeUserKey(options), existing);
    await adapter.upsertProductTable("game_configuration_records", [row]);
    await replaceConfigurationValidationRows(adapter, project.key, validation.findings);
    await readTables(false);
    return row;
  }

  async function validateConfiguration(projectId = "", input = null) {
    const handoff = await getGameDesignHandoff();
    const source = input || await getConfiguration(projectId);
    return validateConfigurationInput(source || {}, handoff);
  }

  async function getProjectProgressHandoff() {
    const handoff = await getGameDesignHandoff();
    const configuration = handoff.activeProject ? await getConfiguration(handoff.activeProject.id) : null;
    const validation = await validateConfiguration(handoff.activeProject?.id || "", configuration);
    if (!handoff.ready) {
      return {
        currentFocus: "Complete Game Design",
        gameProgress: "Game Configuration blocked until Game Design is ready",
        projectProgress: "Game Configuration blocked until Game Design is ready",
        publishingProgress: "Build Game blocked by missing Game Design handoff",
        readinessStatus: "Blocked",
        recommendedNextTool: "Game Design",
      };
    }
    if (!configuration || validation.findings.length > 0) {
      return {
        currentFocus: "Complete Game Configuration",
        gameProgress: `${handoff.activeProject.name} configuration needs ${validation.findings.length} item${validation.findings.length === 1 ? "" : "s"}`,
        projectProgress: `${handoff.activeProject.name} configuration needs ${validation.findings.length} item${validation.findings.length === 1 ? "" : "s"}`,
        publishingProgress: "Build Game blocked until configuration is ready",
        readinessStatus: validation.status,
        recommendedNextTool: "Game Configuration",
      };
    }
    return {
      currentFocus: "Prepare Assets",
      gameProgress: `${handoff.activeProject.name} Game Configuration ready`,
      projectProgress: `${handoff.activeProject.name} Game Configuration ready`,
      publishingProgress: "Build Game remains blocked until required assets are ready",
      readinessStatus: "Ready",
      recommendedNextTool: "Assets",
    };
  }

  async function getSnapshot(seed = true) {
    const tables = await readTables(seed);
    const handoff = await getGameDesignHandoff();
    const configuration = handoff.activeProject ? await getConfiguration(handoff.activeProject.id) : null;
    const validation = await validateConfiguration(handoff.activeProject?.id || "", configuration);
    return {
      configuration,
      handoff,
      progressHandoff: await getProjectProgressHandoff(),
      tables: cloneTables(GAME_CONFIGURATION_TABLES, tables),
      validation,
    };
  }

  async function makeMissingGameDesign() {
    await designService.clearGameContext();
    return getSnapshot(false);
  }

  async function makeInvalidGameDesign(projectId = "") {
    await designService.openGameContext(projectId || DEFAULT_GAME.id);
    await designService.saveDesign({ gameType: "Puzzle" });
    return getSnapshot(false);
  }

  async function makeValidGameDesign(projectId = "") {
    await designService.openGameContext(projectId || DEFAULT_GAME.id);
    await designService.saveDesign({
      designSummary: "A compact puzzle adventure with a clear rules handoff for configuration.",
      gameType: "Puzzle",
      genre: "Adventure",
      story: "A curious maker enters a clockwork library.",
      coreLoop: "Explore a compact room, solve a tile puzzle, and unlock the next shelf.",
      winCondition: "Restore the library clock before the final bell.",
      loseCondition: "The room resets after too many missed moves.",
      targetAudience: "Puzzle fans and first-time creators.",
      designNotes: "Valid Game Design data is ready for configuration.",
      playerMode: "1 Player",
      playStyle: "Single Player",
    });
    const snapshot = await getSnapshot();
    if (snapshot.handoff.ready && snapshot.handoff.activeProject && (!snapshot.configuration || snapshot.validation.findings.length > 0)) {
      await updateConfiguration(snapshot.handoff.activeProject.id, starterConfigurationInput(snapshot.configuration));
      return getSnapshot();
    }
    return snapshot;
  }

  async function resetConfiguration() {
    return getSnapshot();
  }

  async function resetAll() {
    return getSnapshot();
  }

  return {
    authenticationRequiredMessage: "Sign in required to save Game Configuration through the API.",
    createConfiguration: updateConfiguration,
    getConfiguration,
    getGameDesignHandoff,
    getProjectProgressHandoff,
    getSnapshot,
    getTables: () => cloneTables(GAME_CONFIGURATION_TABLES, lastTables),
    makeInvalidGameDesign,
    makeMissingGameDesign,
    makeValidGameDesign,
    requiresAuthenticatedWrites: true,
    resetAll,
    resetConfiguration,
    updateConfiguration,
    usesDatabasePersistence: true,
    validateConfiguration,
    writeMethods: new Set(["createConfiguration", "updateConfiguration"]),
  };
}
