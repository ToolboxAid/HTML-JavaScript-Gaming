import {
  MOCK_DB_KEYS,
  normalizeMockDbTables,
  saveMockDbTables,
} from "../mock-db-store.js";

export const INPUT_MAPPING_TOOL_TABLES = Object.freeze([
  "game_input_mappings",
  "player_controller_profiles",
  "player_input_device_selections",
  "input_custom_action_records",
]);

export const CONTROL_EVENT_OPTIONS = Object.freeze([
  Object.freeze({ description: "Down", field: "eventD", label: "D" }),
  Object.freeze({ description: "Hold", field: "eventH", label: "H" }),
  Object.freeze({ description: "Up", field: "eventU", label: "U" }),
  Object.freeze({ description: "Double Click / Double Press", field: "eventDC", label: "DC" }),
]);

export const GAME_CONTROL_NORMALIZED_INPUTS = Object.freeze([
  "move.x-",
  "move.x+",
  "move.y-",
  "move.y+",
  "aim.x-",
  "aim.x+",
  "aim.y-",
  "aim.y+",
  "action.primary",
  "action.secondary",
  "action.tertiary",
  "action.quaternary",
  "action.confirm",
  "action.cancel",
  "action.pause",
  "action.start",
  "action.select",
]);

export const NORMALIZED_USAGE_LABELS = Object.freeze({
  "action.cancel": "Cancel",
  "action.confirm": "Confirm",
  "action.pause": "Pause",
  "action.primary": "Primary Action",
  "action.quaternary": "Fourth Action",
  "action.secondary": "Secondary Action",
  "action.select": "Select",
  "action.start": "Start",
  "action.tertiary": "Third Action",
  "aim.x-": "Aim Left",
  "aim.x+": "Aim Right",
  "aim.y-": "Aim Up",
  "aim.y+": "Aim Down",
  "move.x-": "Move Left",
  "move.x+": "Move Right",
  "move.y-": "Move Up",
  "move.y+": "Move Down",
});

export const COMMON_DEFAULT_GAME_CONTROLS = Object.freeze([
  "action.cancel",
  "action.confirm",
  "action.pause",
  "action.primary",
  "action.secondary",
  "action.start",
  "move.x-",
  "move.x+",
  "move.y-",
  "move.y+",
]);

export const ENGINE_OWNED_NORMALIZED_INPUTS = Object.freeze([
  "action.pause",
]);

const INPUT_MAPPING_DB_OWNER = "controls";
const DEFAULT_GAME_ID = "demo-game";
const DEFAULT_INPUT_MAPPING_AUDIT_USER_KEY = MOCK_DB_KEYS.users.forgeBot;

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
    player_input_device_selections: [],
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

function withGameIdCompatibility(rows = []) {
  return (Array.isArray(rows) ? rows : []).map((row) => ({
    ...row,
    gameId: normalizeText(row?.gameId || row?.projectId),
  }));
}

function initialTables(options = {}) {
  const explicitRows = options.memoryDbTables?.game_input_mappings;
  const explicitProfiles = options.memoryDbTables?.player_controller_profiles;
  const explicitSelections = options.memoryDbTables?.player_input_device_selections;
  const explicitCustomActions = options.memoryDbTables?.input_custom_action_records;
  if (Array.isArray(explicitRows) || Array.isArray(explicitProfiles) || Array.isArray(explicitSelections) || Array.isArray(explicitCustomActions)) {
    return normalizeMockDbTables(INPUT_MAPPING_DB_OWNER, {
      game_input_mappings: withGameIdCompatibility(explicitRows),
      input_custom_action_records: withGameIdCompatibility(explicitCustomActions),
      player_input_device_selections: Array.isArray(explicitSelections) ? explicitSelections : [],
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

function legacyEventFields(record = {}) {
  const phase = normalizeText(record.inputEventPhase);
  if (phase === "Release") {
    return {
      eventAxis: false,
      eventD: false,
      eventDC: false,
      eventDrag: false,
      eventH: false,
      eventU: true,
    };
  }
  if (phase === "Press" || phase === "Down") {
    return {
      eventAxis: false,
      eventD: true,
      eventDC: false,
      eventDrag: false,
      eventH: false,
      eventU: false,
    };
  }
  return {
    eventAxis: false,
    eventD: true,
    eventDC: false,
    eventDrag: false,
    eventH: false,
    eventU: false,
  };
}

function normalizedEventFields(source = {}) {
  const legacy = legacyEventFields(source);
  return {
    eventAxis: source.eventAxis === undefined ? legacy.eventAxis : Boolean(source.eventAxis),
    eventD: source.eventD === undefined ? legacy.eventD : Boolean(source.eventD),
    eventDC: source.eventDC === undefined ? legacy.eventDC : Boolean(source.eventDC),
    eventDrag: source.eventDrag === undefined ? legacy.eventDrag : Boolean(source.eventDrag),
    eventH: source.eventH === undefined ? legacy.eventH : Boolean(source.eventH),
    eventU: source.eventU === undefined ? legacy.eventU : Boolean(source.eventU),
  };
}

function normalizeProfileInputMappings(inputs = [], mappings = null) {
  const sourceMappings = Array.isArray(mappings) ? mappings : inputs;
  const normalizedMappings = (Array.isArray(sourceMappings) ? sourceMappings : []).map((mapping) => ({
    deadzone: Number.isFinite(Number(mapping?.deadzone)) ? Number(mapping.deadzone) : 0.2,
    invert: Boolean(mapping?.invert),
    negativeNormalizedInput: normalizeText(mapping?.negativeNormalizedInput),
    normalizedInput: normalizeText(mapping?.normalizedInput),
    physicalInput: typeof mapping === "string" ? normalizeText(mapping) : normalizeText(mapping?.physicalInput || mapping?.input),
    positiveNormalizedInput: normalizeText(mapping?.positiveNormalizedInput),
    sensitivity: Number.isFinite(Number(mapping?.sensitivity)) ? Number(mapping.sensitivity) : undefined,
  })).filter((mapping) => mapping.physicalInput);
  const mappingByInput = new Map(normalizedMappings.map((mapping) => [mapping.physicalInput, mapping]));
  const inputNames = normalizeList(inputs).filter((input) => input !== "[object Object]");
  const orderedInputNames = inputNames.length ? inputNames : normalizedMappings.map((mapping) => mapping.physicalInput);
  return orderedInputNames.map((physicalInput) => ({
    deadzone: 0.2,
    invert: false,
    negativeNormalizedInput: "",
    normalizedInput: "",
    physicalInput,
    positiveNormalizedInput: "",
    sensitivity: undefined,
    ...(mappingByInput.get(physicalInput) || {}),
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
    inputMappings: normalizeProfileInputMappings(record.inputs, record.inputMappings),
    inputs: normalizeList(record.inputs),
    mappingProfile: profileName,
    profileName,
  };
}

function selectedInputDeviceFromRecord(record = {}) {
  const selectionKey = normalizeText(record.selectionKey);
  const selectionType = normalizeText(record.selectionType);
  return {
    controllerId: normalizeText(record.controllerId),
    deviceType: normalizeText(record.deviceType),
    id: normalizeText(record.id) || selectionKey,
    label: normalizeText(record.label),
    profileId: normalizeText(record.profileId),
    selectionKey,
    selectionType,
    updatedAt: normalizeText(record.updatedAt),
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
  const usageLabel = normalizeText(record.usageLabel || record.gameActionLabel || record.actionLabel);
  const events = normalizedEventFields(record);
  return {
    action,
    actionLabel: usageLabel,
    enabled: record.enabled === undefined ? true : Boolean(record.enabled),
    ...events,
    id: normalizeText(record.id),
    inputFamily: normalizeText(record.inputFamily),
    normalizedInput: normalizeText(record.normalizedInput),
    objectKey: normalizeText(record.objectKey),
    objectName: normalizeText(record.objectName),
    state: normalizeText(record.state) || "Active",
    usageLabel,
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

  function activeGameId() {
    return normalizeText(options.gameWorkspaceRepository?.getActiveGame?.()?.id) || DEFAULT_GAME_ID;
  }

  function activeUserKey() {
    const sessionUserKey = typeof options.sessionUserKey === "function"
      ? options.sessionUserKey()
      : options.sessionUserKey;
    return normalizeText(sessionUserKey);
  }

  function auditUserKey() {
    return activeUserKey() || DEFAULT_INPUT_MAPPING_AUDIT_USER_KEY;
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

  function listMappings(gameId = "") {
    const targetGameId = normalizeText(gameId) || activeGameId();
    return sortedMappingRows(tables)
      .filter((record) => normalizeText(record.gameId || record.projectId) === targetGameId)
      .map(mappingFromRecord);
  }

  function listControllerProfiles() {
    const targetPlayerId = activeUserKey();
    return sortedControllerProfileRows(tables)
      .filter((record) => normalizeText(record.playerId) === targetPlayerId)
      .map(controllerProfileFromRecord);
  }

  function getSelectedInputDevice() {
    const targetPlayerId = activeUserKey();
    const record = listSelectedInputDevices()
      .sort((left, right) => normalizeText(right.updatedAt).localeCompare(normalizeText(left.updatedAt)))[0];
    return record || null;
  }

  function listSelectedInputDevices() {
    const targetPlayerId = activeUserKey();
    return [...(tables.player_input_device_selections || [])]
      .filter((candidate) => normalizeText(candidate.playerId) === targetPlayerId)
      .sort((left, right) => (
        normalizeText(left.deviceType).localeCompare(normalizeText(right.deviceType))
          || normalizeText(left.label).localeCompare(normalizeText(right.label))
      ))
      .map(selectedInputDeviceFromRecord);
  }

  function listCustomActions(gameId = "") {
    const targetGameId = normalizeText(gameId) || activeGameId();
    return [...(tables.input_custom_action_records || [])]
      .sort((left, right) => (
        (Number(left.recordOrder) || 0) - (Number(right.recordOrder) || 0)
          || normalizeText(left.label).localeCompare(normalizeText(right.label))
      ))
      .filter((record) => normalizeText(record.gameId || record.projectId) === targetGameId)
      .map(customActionFromRecord);
  }

  function replaceControllerProfiles(profiles = []) {
    const targetPlayerId = activeUserKey();
    if (!targetPlayerId) {
      return {
        error: true,
        message: "Sign in required to save User Controls profiles.",
        profiles: [],
        saved: false,
      };
    }
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
        inputMappings: normalizeProfileInputMappings(profile.inputs, profile.inputMappings),
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

  function saveSelectedInputDevice(selection = {}) {
    const targetPlayerId = activeUserKey();
    if (!targetPlayerId) {
      return {
        error: true,
        message: "Sign in required to save Selected Device.",
        saved: false,
        selectedInputDevice: null,
      };
    }
    const timestamp = new Date().toISOString();
    const userKey = activeUserKey();
    const selectionKey = normalizeText(selection.selectionKey || selection.id);
    const deviceType = normalizeText(selection.deviceType) || "Gamepad";
    const previous = (tables.player_input_device_selections || [])
      .find((record) =>
        normalizeText(record.playerId) === targetPlayerId
          && normalizeText(record.deviceType) === deviceType,
      );
    const id = normalizeText(previous?.id) || `selected-input-device-${mappingKeyFromText(deviceType)}`;
    const nextRow = {
      controllerId: normalizeText(selection.controllerId),
      createdAt: previous?.createdAt || timestamp,
      createdBy: previous?.createdBy || userKey,
      deviceType,
      id,
      key: previous?.key,
      label: normalizeText(selection.label),
      playerId: targetPlayerId,
      profileId: normalizeText(selection.profileId),
      selectionKey,
      selectionType: normalizeText(selection.selectionType),
      updatedAt: timestamp,
      updatedBy: userKey,
    };
    tables.player_input_device_selections = [
      ...(tables.player_input_device_selections || []).filter(
        (record) => !(
          normalizeText(record.playerId) === targetPlayerId
            && normalizeText(record.deviceType) === deviceType
        ),
      ),
      nextRow,
    ];
    persistTables();
    return {
      saved: true,
      selectedInputDevice: selectedInputDeviceFromRecord(nextRow),
      selectedInputDevices: listSelectedInputDevices(),
      snapshot: getSnapshot(),
    };
  }

  function replaceCustomActions(actions = [], gameId = "") {
    const targetGameId = normalizeText(gameId) || activeGameId();
    const existingRows = new Map(
      (tables.input_custom_action_records || [])
        .filter((record) => normalizeText(record.gameId || record.projectId) === targetGameId)
        .map((record) => [normalizeText(record.id), record]),
    );
    const timestamp = new Date().toISOString();
    const userKey = auditUserKey();
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
        gameId: targetGameId,
        recordOrder: index + 1,
        updatedAt: timestamp,
        updatedBy: userKey,
      };
    });

    tables.input_custom_action_records = [
      ...(tables.input_custom_action_records || []).filter(
        (record) => normalizeText(record.gameId || record.projectId) !== targetGameId,
      ),
      ...nextRows,
    ];
    persistTables();
    return {
      customActions: listCustomActions(targetGameId),
      saved: true,
      snapshot: getSnapshot(),
    };
  }

  function replaceMappings(mappings = [], gameId = "") {
    const targetGameId = normalizeText(gameId) || activeGameId();
    const existingRows = new Map(
      (tables.game_input_mappings || [])
        .filter((record) => normalizeText(record.gameId || record.projectId) === targetGameId)
        .map((record) => [normalizeText(record.id), record]),
    );
    const timestamp = new Date().toISOString();
    const userKey = auditUserKey();
    const nextRows = (Array.isArray(mappings) ? mappings : []).map((mapping, index) => {
      const action = normalizeText(mapping.action);
      const normalizedInput = normalizeText(mapping.normalizedInput);
      const usageLabel = normalizeText(mapping.usageLabel || mapping.actionLabel || mapping.gameActionLabel);
      const objectKey = normalizeText(mapping.objectKey) || "global";
      const events = normalizedEventFields(mapping);
      const id = normalizeText(mapping.id) || mappingKeyFromText(`${objectKey}-${normalizedInput}-${usageLabel}-${index + 1}`);
      const previous = existingRows.get(id);
      return {
        createdAt: previous?.createdAt || timestamp,
        createdBy: previous?.createdBy || userKey,
        enabled: mapping.enabled === undefined ? true : Boolean(mapping.enabled),
        eventAxis: events.eventAxis,
        eventD: events.eventD,
        eventDC: events.eventDC,
        eventDrag: events.eventDrag,
        eventH: events.eventH,
        eventU: events.eventU,
        gameId: targetGameId,
        gameAction: action || mappingKeyFromText(usageLabel),
        gameActionLabel: usageLabel,
        id,
        inputFamily: normalizeText(mapping.inputFamily),
        key: previous?.key,
        normalizedInput,
        objectKey,
        objectName: normalizeText(mapping.objectName) || "Global",
        recordOrder: index + 1,
        state: normalizeText(mapping.state) || "Active",
        updatedAt: timestamp,
        updatedBy: userKey,
        usageLabel,
      };
    });

    tables.game_input_mappings = [
      ...(tables.game_input_mappings || []).filter(
        (record) => normalizeText(record.gameId || record.projectId) !== targetGameId,
      ),
      ...nextRows,
    ];
    persistTables();
    return {
      mappings: listMappings(targetGameId),
      saved: true,
      snapshot: getSnapshot(),
    };
  }

  function resetMappings(gameId = "") {
    const targetGameId = normalizeText(gameId) || activeGameId();
    tables.game_input_mappings = (tables.game_input_mappings || []).filter(
      (record) => normalizeText(record.gameId || record.projectId) !== targetGameId,
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
      selectedInputDevice: getSelectedInputDevice(),
      selectedInputDevices: listSelectedInputDevices(),
      tableCounts: tableCounts(normalizedTables),
      tables: normalizedTables,
    };
  }

  return {
    COMMON_DEFAULT_GAME_CONTROLS,
    CONTROL_EVENT_OPTIONS,
    ENGINE_OWNED_NORMALIZED_INPUTS,
    GAME_CONTROL_NORMALIZED_INPUTS,
    INPUT_MAPPING_TOOL_TABLES,
    NORMALIZED_USAGE_LABELS,
    getSnapshot,
    getTables,
    getSelectedInputDevice,
    listSelectedInputDevices,
    listControllerProfiles,
    listCustomActions,
    listMappings,
    replaceControllerProfiles,
    replaceCustomActions,
    replaceMappings,
    resetMappings,
    saveSelectedInputDevice,
  };
}
