import {
  MOCK_DB_KEYS,
  normalizeMockDbTables,
  saveMockDbTables,
} from "../mock-db-store.js";

export const OBJECTS_TOOL_TABLES = Object.freeze([
  "object_definition_records",
]);

const OBJECTS_DB_OWNER = "objects";
const DEFAULT_PROJECT_ID = "demo-project";
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

  function activeProjectId() {
    return normalizeText(options.projectWorkspaceRepository?.getActiveProject?.()?.id) || DEFAULT_PROJECT_ID;
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

  function listObjects(projectId = "") {
    const targetProjectId = normalizeText(projectId) || activeProjectId();
    return sortedObjectRows(tables)
      .filter((record) => normalizeText(record.projectId) === targetProjectId)
      .map(objectFromRecord);
  }

  function replaceObjects(objects = [], projectId = "") {
    const targetProjectId = normalizeText(projectId) || activeProjectId();
    const existingRows = new Map(
      (tables.object_definition_records || [])
        .filter((record) => normalizeText(record.projectId) === targetProjectId)
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
        id,
        interaction: normalizeText(object.interaction),
        key: previous?.key,
        modelType: normalizeText(object.type),
        name: normalizeText(object.name),
        projectId: targetProjectId,
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
        (record) => normalizeText(record.projectId) !== targetProjectId,
      ),
      ...nextRows,
    ];
    persistTables();
    return {
      objects: listObjects(targetProjectId),
      saved: true,
      snapshot: getSnapshot(),
    };
  }

  function resetObjects(projectId = "") {
    const targetProjectId = normalizeText(projectId) || activeProjectId();
    tables.object_definition_records = (tables.object_definition_records || []).filter(
      (record) => normalizeText(record.projectId) !== targetProjectId,
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
    OBJECTS_TOOL_TABLES,
    getSnapshot,
    getTables,
    listObjects,
    replaceObjects,
    resetObjects,
  };
}
