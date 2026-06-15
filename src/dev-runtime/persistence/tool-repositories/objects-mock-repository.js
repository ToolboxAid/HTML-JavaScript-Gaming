import {
  MOCK_DB_KEYS,
  normalizeMockDbTables,
  saveMockDbTables,
} from "../mock-db-store.js";

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

const OBJECTS_DB_OWNER = "objects";
const DEFAULT_GAME_ID = "demo-project";
const DEFAULT_OBJECTS_USER_KEY = MOCK_DB_KEYS.users.user1;

function cloneRows(rows = []) {
  return rows.map((row) => ({ ...row }));
}

function cloneTables(tables) {
  return Object.fromEntries(
    OBJECTS_TOOL_TABLES.map((table) => [table, cloneRows(tables[table] || [])]),
  );
}

function createEmptyTables() {
  return {
    object_definition_records: [],
  };
}

function normalizeText(value) {
  return String(value || "").trim();
}

function objectKeyFromText(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseCapabilityIds(value) {
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

function normalizeRender(source = {}) {
  const render = source.render && typeof source.render === "object" ? source.render : {};
  const renderType = normalizeText(render.type) === "Sprite" ? "Sprite" : "None";
  if (renderType !== "Sprite") {
    return {
      assetKey: "",
      previewPath: "",
      type: "None",
    };
  }
  return {
    assetKey: normalizeText(render.assetKey),
    previewPath: normalizeText(render.previewPath),
    type: "Sprite",
  };
}

function sortedObjectRows(tables) {
  return [...(tables.object_definition_records || [])].sort((left, right) => (
    (Number(left.recordOrder) || 0) - (Number(right.recordOrder) || 0)
      || normalizeText(left.name).localeCompare(normalizeText(right.name))
  ));
}

function objectFromRecord(record = {}) {
  const render = normalizeText(record.renderType) === "Sprite"
    ? {
        assetKey: normalizeText(record.renderAssetKey),
        previewPath: normalizeText(record.renderPreviewPath),
        type: "Sprite",
      }
    : { type: "None" };

  return {
    behavior: normalizeText(record.behavior),
    id: objectKeyFromText(record.id || record.name),
    interaction: normalizeText(record.interaction),
    name: normalizeText(record.name),
    render,
    role: normalizeText(record.type),
    state: normalizeText(record.state) || "Active",
    traits: parseCapabilityIds(record.capabilities),
    type: normalizeText(record.modelType),
  };
}

function tableCounts(tables) {
  return OBJECTS_TOOL_TABLES.map((table) => ({
    rows: tables[table].length,
    table,
  }));
}

function initialTables(options = {}) {
  const explicitRows = options.memoryDbTables?.object_definition_records;
  if (Array.isArray(explicitRows)) {
    return normalizeMockDbTables(OBJECTS_DB_OWNER, {
      object_definition_records: explicitRows,
    }, options);
  }
  return normalizeMockDbTables(OBJECTS_DB_OWNER, createEmptyTables(), options);
}

export function createObjectsToolMockRepository(options = {}) {
  let tables = initialTables(options);

  function activeGameId() {
    return normalizeText(options.gameWorkspaceRepository?.getActiveGame?.()?.id) || DEFAULT_GAME_ID;
  }

  function recordGameId(record = {}) {
    return normalizeText(record.gameId || record.projectId);
  }

  function activeUserKey() {
    return normalizeText(options.sessionUserKey) || DEFAULT_OBJECTS_USER_KEY;
  }

  function persistTables() {
    tables = normalizeMockDbTables(OBJECTS_DB_OWNER, cloneTables(tables), options);
    if (options.memoryDbTables && typeof options.memoryDbTables === "object") {
      OBJECTS_TOOL_TABLES.forEach((tableName) => {
        options.memoryDbTables[tableName] = cloneRows(tables[tableName]);
      });
    }
    saveMockDbTables(OBJECTS_DB_OWNER, tables, options);
  }

  function listObjects(gameId = "") {
    const targetGameId = normalizeText(gameId) || activeGameId();
    return sortedObjectRows(tables)
      .filter((record) => recordGameId(record) === targetGameId)
      .map(objectFromRecord);
  }

  function replaceObjects(objects = [], gameId = "") {
    const targetGameId = normalizeText(gameId) || activeGameId();
    const existingRows = new Map(
      (tables.object_definition_records || [])
        .filter((record) => recordGameId(record) === targetGameId)
        .map((record) => [objectKeyFromText(record.id || record.name), record]),
    );
    const timestamp = new Date().toISOString();
    const userKey = activeUserKey();
    const nextRows = (Array.isArray(objects) ? objects : []).map((object, index) => {
      const id = objectKeyFromText(object.id || object.name);
      const previous = existingRows.get(id);
      const render = normalizeRender(object);
      return {
        behavior: normalizeText(object.behavior),
        capabilities: parseCapabilityIds(object.traits || object.capabilities),
        createdAt: previous?.createdAt || timestamp,
        createdBy: previous?.createdBy || userKey,
        gameId: targetGameId,
        id,
        interaction: normalizeText(object.interaction),
        key: previous?.key,
        modelType: normalizeText(object.type),
        name: normalizeText(object.name),
        recordOrder: index + 1,
        renderAssetKey: render.assetKey,
        renderPreviewPath: render.previewPath,
        renderType: render.type,
        state: normalizeText(object.state) || "Active",
        type: normalizeText(object.role || object.type),
        updatedAt: timestamp,
        updatedBy: userKey,
      };
    });

    tables.object_definition_records = [
      ...(tables.object_definition_records || []).filter(
        (record) => recordGameId(record) !== targetGameId,
      ),
      ...nextRows,
    ];
    persistTables();
    return {
      objects: listObjects(targetGameId),
      saved: true,
      snapshot: getSnapshot(),
    };
  }

  function resetObjects(gameId = "") {
    const targetGameId = normalizeText(gameId) || activeGameId();
    tables.object_definition_records = (tables.object_definition_records || []).filter(
      (record) => recordGameId(record) !== targetGameId,
    );
    persistTables();
    return {
      objects: [],
      reset: true,
      snapshot: getSnapshot(),
    };
  }

  function getTables() {
    return normalizeMockDbTables(OBJECTS_DB_OWNER, cloneTables(tables), options);
  }

  function getSnapshot() {
    const normalizedTables = getTables();
    return {
      objects: listObjects(),
      tableCounts: tableCounts(normalizedTables),
      tables: normalizedTables,
    };
  }

  return {
    CAPABILITY_LABELS,
    OBJECT_TYPE_TEMPLATES,
    OBJECTS_TOOL_TABLES,
    STARTER_OBJECTS,
    getSnapshot,
    getTables,
    listObjects,
    replaceObjects,
    resetObjects,
  };
}
