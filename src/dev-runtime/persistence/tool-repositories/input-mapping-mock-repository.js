import {
  MOCK_DB_KEYS,
  normalizeMockDbTables,
  saveMockDbTables,
} from "../mock-db-store.js";

export const INPUT_MAPPING_TOOL_TABLES = Object.freeze([
  "game_input_mappings",
  "player_controller_profiles",
  "input_custom_action_records",
]);

const INPUT_MAPPING_DB_OWNER = "controls";
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
    game_input_mappings: [],
    input_custom_action_records: [],
    player_controller_profiles: [],
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
  const explicitRows = options.memoryDbTables?.game_input_mappings;
  const explicitProfiles = options.memoryDbTables?.player_controller_profiles;
  const explicitCustomActions = options.memoryDbTables?.input_custom_action_records;
  if (Array.isArray(explicitRows) || Array.isArray(explicitProfiles) || Array.isArray(explicitCustomActions)) {
    return normalizeMockDbTables(INPUT_MAPPING_DB_OWNER, {
      game_input_mappings: Array.isArray(explicitRows) ? explicitRows : [],
      input_custom_action_records: Array.isArray(explicitCustomActions) ? explicitCustomActions : [],
      player_controller_profiles: Array.isArray(explicitProfiles) ? explicitProfiles : [],
    }, options);
  }
  return normalizeMockDbTables(INPUT_MAPPING_DB_OWNER, createEmptyTables(), options);
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeText).filter(Boolean);
  }
  return normalizeText(value)
    .split(",")
    .map(normalizeText)
    .filter(Boolean);
}

function normalizeProfileInputMappings(value) {
  return (Array.isArray(value) ? value : []).map((mapping) => ({
    deadzone: Number.isFinite(Number(mapping?.deadzone)) ? Number(mapping.deadzone) : 0.2,
    invert: Boolean(mapping?.invert),
    normalizedInput: normalizeText(mapping?.normalizedInput),
    physicalInput: normalizeText(mapping?.physicalInput || mapping?.input),
  })).filter((mapping) => mapping.physicalInput);
}

function sortedMappingRows(tables) {
  return [...(tables.game_input_mappings || [])].sort((left, right) => (
    (Number(left.recordOrder) || 0) - (Number(right.recordOrder) || 0)
      || normalizeText(left.gameActionLabel).localeCompare(normalizeText(right.gameActionLabel))
      || normalizeText(left.normalizedInput).localeCompare(normalizeText(right.normalizedInput))
  ));
}

function sortedControllerProfileRows(tables) {
  return [...(tables.player_controller_profiles || [])].sort((left, right) => (
    (Number(left.recordOrder) || 0) - (Number(right.recordOrder) || 0)
      || normalizeText(left.profileName).localeCompare(normalizeText(right.profileName))
      || normalizeText(left.controllerName).localeCompare(normalizeText(right.controllerName))
  ));
}

function controllerProfileFromRecord(record = {}) {
  const profileName = normalizeText(record.profileName || record.mappingProfile);
  return {
    controllerId: normalizeText(record.controllerId),
    controllerName: normalizeText(record.controllerName),
    deviceType: normalizeText(record.deviceType),
    id: normalizeText(record.id),
    inputMappings: normalizeProfileInputMappings(record.inputMappings),
    inputs: normalizeList(record.inputs),
    mappingProfile: profileName,
    profileName,
  };
}

function customActionFromRecord(record = {}) {
  const label = normalizeText(record.label || record.actionLabel || record.action);
  const id = normalizeText(record.id) || mappingKeyFromText(label);
  return {
    id,
    label: label || id,
  };
}

function mappingFromRecord(record = {}) {
  const action = normalizeText(record.gameAction || record.action);
  const actionLabel = normalizeText(record.gameActionLabel || record.actionLabel);
  return {
    action,
    actionLabel,
    id: normalizeText(record.id),
    normalizedInput: normalizeText(record.normalizedInput),
    objectKey: normalizeText(record.objectKey),
    objectName: normalizeText(record.objectName),
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

  function listControllerProfiles(projectId = "") {
    const targetPlayerId = activeUserKey();
    return sortedControllerProfileRows(tables)
      .filter((record) => normalizeText(record.playerId) === targetPlayerId)
      .map(controllerProfileFromRecord);
  }

  function listCustomActions(projectId = "") {
    const targetProjectId = normalizeText(projectId) || activeProjectId();
    return [...(tables.input_custom_action_records || [])]
      .sort((left, right) => (
        (Number(left.recordOrder) || 0) - (Number(right.recordOrder) || 0)
          || normalizeText(left.label).localeCompare(normalizeText(right.label))
      ))
      .filter((record) => normalizeText(record.projectId) === targetProjectId)
      .map(customActionFromRecord);
  }

  function replaceControllerProfiles(profiles = [], projectId = "") {
    const targetPlayerId = activeUserKey();
    const existingRows = new Map(
      (tables.player_controller_profiles || [])
        .filter((record) => normalizeText(record.playerId) === targetPlayerId)
        .map((record) => [normalizeText(record.id), record]),
    );
    const timestamp = new Date().toISOString();
    const userKey = activeUserKey();
    const nextRows = (Array.isArray(profiles) ? profiles : []).map((profile, index) => {
      const profileName = normalizeText(profile.profileName || profile.mappingProfile);
      const controllerId = normalizeText(profile.controllerId);
      const id = normalizeText(profile.id) || mappingKeyFromText(`${controllerId}-${profileName}-${index + 1}`);
      const previous = existingRows.get(id);
      return {
        controllerId,
        controllerName: normalizeText(profile.controllerName),
        createdAt: previous?.createdAt || timestamp,
        createdBy: previous?.createdBy || userKey,
        deviceType: normalizeText(profile.deviceType) || "Gamepad",
        id,
        inputMappings: normalizeProfileInputMappings(profile.inputMappings),
        inputs: normalizeList(profile.inputs),
        key: previous?.key,
        playerId: targetPlayerId,
        profileName,
        recordOrder: index + 1,
        updatedAt: timestamp,
        updatedBy: userKey,
      };
    });

    tables.player_controller_profiles = [
      ...(tables.player_controller_profiles || []).filter(
        (record) => normalizeText(record.playerId) !== targetPlayerId,
      ),
      ...nextRows,
    ];
    persistTables();
    return {
      profiles: listControllerProfiles(),
      saved: true,
      snapshot: getSnapshot(),
    };
  }

  function replaceCustomActions(actions = [], projectId = "") {
    const targetProjectId = normalizeText(projectId) || activeProjectId();
    const existingRows = new Map(
      (tables.input_custom_action_records || [])
        .filter((record) => normalizeText(record.projectId) === targetProjectId)
        .map((record) => [normalizeText(record.id), record]),
    );
    const timestamp = new Date().toISOString();
    const userKey = activeUserKey();
    const nextRows = (Array.isArray(actions) ? actions : []).map((action, index) => {
      const label = normalizeText(action.label || action.actionLabel || action.action);
      const id = normalizeText(action.id) || mappingKeyFromText(label || `custom-action-${index + 1}`);
      const previous = existingRows.get(id);
      return {
        createdAt: previous?.createdAt || timestamp,
        createdBy: previous?.createdBy || userKey,
        id,
        key: previous?.key,
        label: label || id,
        projectId: targetProjectId,
        recordOrder: index + 1,
        updatedAt: timestamp,
        updatedBy: userKey,
      };
    });

    tables.input_custom_action_records = [
      ...(tables.input_custom_action_records || []).filter(
        (record) => normalizeText(record.projectId) !== targetProjectId,
      ),
      ...nextRows,
    ];
    persistTables();
    return {
      customActions: listCustomActions(targetProjectId),
      saved: true,
      snapshot: getSnapshot(),
    };
  }

  function replaceMappings(mappings = [], projectId = "") {
    const targetProjectId = normalizeText(projectId) || activeProjectId();
    const existingRows = new Map(
      (tables.game_input_mappings || [])
        .filter((record) => normalizeText(record.projectId) === targetProjectId)
        .map((record) => [normalizeText(record.id), record]),
    );
    const timestamp = new Date().toISOString();
    const userKey = activeUserKey();
    const nextRows = (Array.isArray(mappings) ? mappings : []).map((mapping, index) => {
      const action = normalizeText(mapping.action);
      const normalizedInput = normalizeText(mapping.normalizedInput);
      const objectKey = normalizeText(mapping.objectKey) || "global";
      const id = normalizeText(mapping.id) || mappingKeyFromText(`${objectKey}-${action}-${normalizedInput}-${index + 1}`);
      const previous = existingRows.get(id);
      return {
        createdAt: previous?.createdAt || timestamp,
        createdBy: previous?.createdBy || userKey,
        gameAction: action,
        gameActionLabel: normalizeText(mapping.actionLabel),
        id,
        key: previous?.key,
        normalizedInput,
        objectKey,
        objectName: normalizeText(mapping.objectName) || "Global",
        projectId: targetProjectId,
        recordOrder: index + 1,
        state: normalizeText(mapping.state) || "Active",
        updatedAt: timestamp,
        updatedBy: userKey,
      };
    });

    tables.game_input_mappings = [
      ...(tables.game_input_mappings || []).filter(
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
    tables.game_input_mappings = (tables.game_input_mappings || []).filter(
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
      controllerProfiles: listControllerProfiles(),
      customActions: listCustomActions(),
      mappings: listMappings(),
      tableCounts: tableCounts(normalizedTables),
      tables: normalizedTables,
    };
  }

  return {
    INPUT_MAPPING_TOOL_TABLES,
    getSnapshot,
    getTables,
    listControllerProfiles,
    listCustomActions,
    listMappings,
    replaceControllerProfiles,
    replaceCustomActions,
    replaceMappings,
    resetMappings,
  };
}
