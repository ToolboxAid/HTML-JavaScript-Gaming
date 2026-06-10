import {
  MOCK_DB_KEYS,
  normalizeMockDbTables,
  saveMockDbTables,
} from "../mock-db-store.js";

export const INPUT_MAPPING_TOOL_TABLES = Object.freeze([
  "input_mapping_records",
]);

const INPUT_MAPPING_DB_OWNER = "input-mapping-v2";
const DEFAULT_PROJECT_ID = "demo-project";
const DEFAULT_INPUT_MAPPING_USER_KEY = MOCK_DB_KEYS.users.user1;

function cloneRows(rows = []) {
  return rows.map((row) => ({ ...row }));
}

function cloneTables(tables) {
  return Object.fromEntries(
    INPUT_MAPPING_TOOL_TABLES.map((table) => [table, cloneRows(tables[table] || [])]),
  );
}

function createEmptyTables() {
  return {
    input_mapping_records: [],
  };
}

function normalizeText(value) {
  return String(value || "").trim();
}

function mappingKeyFromText(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function initialTables(options = {}) {
  const explicitRows = options.memoryDbTables?.input_mapping_records;
  if (Array.isArray(explicitRows)) {
    return normalizeMockDbTables(INPUT_MAPPING_DB_OWNER, {
      input_mapping_records: explicitRows,
    }, options);
  }
  return normalizeMockDbTables(INPUT_MAPPING_DB_OWNER, createEmptyTables(), options);
}

function sortedMappingRows(tables) {
  return [...(tables.input_mapping_records || [])].sort((left, right) => (
    (Number(left.recordOrder) || 0) - (Number(right.recordOrder) || 0)
      || normalizeText(left.actionLabel).localeCompare(normalizeText(right.actionLabel))
      || normalizeText(left.label).localeCompare(normalizeText(right.label))
  ));
}

function mappingFromRecord(record = {}) {
  return {
    action: normalizeText(record.action),
    actionLabel: normalizeText(record.actionLabel),
    binding: normalizeText(record.binding),
    engine: normalizeText(record.engine),
    id: normalizeText(record.id),
    inputDevice: normalizeText(record.inputDevice),
    label: normalizeText(record.label),
    objectKey: normalizeText(record.objectKey),
    objectName: normalizeText(record.objectName),
    source: normalizeText(record.source),
    state: normalizeText(record.state) || "Active",
  };
}

function tableCounts(tables) {
  return INPUT_MAPPING_TOOL_TABLES.map((table) => ({
    rows: tables[table].length,
    table,
  }));
}

export function createInputMappingToolMockRepository(options = {}) {
  let tables = initialTables(options);

  function activeProjectId() {
    return normalizeText(options.projectWorkspaceRepository?.getActiveProject?.()?.id) || DEFAULT_PROJECT_ID;
  }

  function activeUserKey() {
    return normalizeText(options.sessionUserKey) || DEFAULT_INPUT_MAPPING_USER_KEY;
  }

  function persistTables() {
    tables = normalizeMockDbTables(INPUT_MAPPING_DB_OWNER, cloneTables(tables), options);
    if (options.memoryDbTables && typeof options.memoryDbTables === "object") {
      INPUT_MAPPING_TOOL_TABLES.forEach((tableName) => {
        options.memoryDbTables[tableName] = cloneRows(tables[tableName]);
      });
    }
    saveMockDbTables(INPUT_MAPPING_DB_OWNER, tables, options);
  }

  function listMappings(projectId = "") {
    const targetProjectId = normalizeText(projectId) || activeProjectId();
    return sortedMappingRows(tables)
      .filter((record) => normalizeText(record.projectId) === targetProjectId)
      .map(mappingFromRecord);
  }

  function replaceMappings(mappings = [], projectId = "") {
    const targetProjectId = normalizeText(projectId) || activeProjectId();
    const existingRows = new Map(
      (tables.input_mapping_records || [])
        .filter((record) => normalizeText(record.projectId) === targetProjectId)
        .map((record) => [normalizeText(record.id), record]),
    );
    const timestamp = new Date().toISOString();
    const userKey = activeUserKey();
    const nextRows = (Array.isArray(mappings) ? mappings : []).map((mapping, index) => {
      const action = normalizeText(mapping.action);
      const binding = normalizeText(mapping.binding);
      const objectKey = normalizeText(mapping.objectKey) || "global";
      const id = normalizeText(mapping.id) || mappingKeyFromText(`${objectKey}-${action}-${binding}-${index + 1}`);
      const previous = existingRows.get(id);
      return {
        action,
        actionLabel: normalizeText(mapping.actionLabel),
        binding,
        createdAt: previous?.createdAt || timestamp,
        createdBy: previous?.createdBy || userKey,
        engine: normalizeText(mapping.engine),
        id,
        inputDevice: normalizeText(mapping.inputDevice),
        key: previous?.key,
        label: normalizeText(mapping.label),
        objectKey,
        objectName: normalizeText(mapping.objectName) || "Global",
        projectId: targetProjectId,
        recordOrder: index + 1,
        source: normalizeText(mapping.source),
        state: normalizeText(mapping.state) || "Active",
        updatedAt: timestamp,
        updatedBy: userKey,
      };
    });

    tables.input_mapping_records = [
      ...(tables.input_mapping_records || []).filter(
        (record) => normalizeText(record.projectId) !== targetProjectId,
      ),
      ...nextRows,
    ];
    persistTables();
    return {
      mappings: listMappings(targetProjectId),
      saved: true,
      snapshot: getSnapshot(),
    };
  }

  function resetMappings(projectId = "") {
    const targetProjectId = normalizeText(projectId) || activeProjectId();
    tables.input_mapping_records = (tables.input_mapping_records || []).filter(
      (record) => normalizeText(record.projectId) !== targetProjectId,
    );
    persistTables();
    return {
      mappings: [],
      reset: true,
      snapshot: getSnapshot(),
    };
  }

  function getTables() {
    return normalizeMockDbTables(INPUT_MAPPING_DB_OWNER, cloneTables(tables), options);
  }

  function getSnapshot() {
    const normalizedTables = getTables();
    return {
      mappings: listMappings(),
      tableCounts: tableCounts(normalizedTables),
      tables: normalizedTables,
    };
  }

  return {
    INPUT_MAPPING_TOOL_TABLES,
    getSnapshot,
    getTables,
    listMappings,
    replaceMappings,
    resetMappings,
  };
}
